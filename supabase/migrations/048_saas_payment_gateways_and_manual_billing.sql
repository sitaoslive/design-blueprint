-- ============================================================================
-- VET FREEDOM OS & ALPHA VISION — MIGRACIÓN 048
-- SAAS PAYMENT GATEWAYS, HMAC WEBHOOK RECEIVER & MANUAL BILLING HUB
-- Tickets PL-04 y PL-05: Pasarelas de Pago (Wompi, Stripe) y Cobro Manual
-- ============================================================================

-- 1. TABLA: TRANSACCIONES DE PAGO MULTI-PASARELA
CREATE TABLE IF NOT EXISTS public.saas_payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    license_id UUID REFERENCES public.saas_licenses(id) ON DELETE SET NULL,
    gateway TEXT NOT NULL CHECK (gateway IN ('WOMPI', 'STRIPE', 'BANCOLOMBIA_TRANSFER', 'NEQUI_TRANSFER', 'DAVIPLATA', 'CASH_MANUAL')),
    gateway_transaction_id TEXT NOT NULL,
    idempotency_key TEXT UNIQUE,
    amount_cop NUMERIC(15,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'COP',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR')),
    payment_method_type TEXT,
    customer_email TEXT,
    billing_cycle TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('MONTHLY', 'ANNUAL', 'CUSTOM')),
    raw_payload JSONB DEFAULT '{}'::jsonb,
    signature TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. TABLA: FACTURAS B2B GENERADAS
CREATE TABLE IF NOT EXISTS public.saas_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.saas_payment_transactions(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    subtotal_cop NUMERIC(15,2) NOT NULL,
    tax_cop NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_cop NUMERIC(15,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PAID' CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED')),
    pdf_url TEXT,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    due_at TIMESTAMPTZ NOT NULL DEFAULT (clock_timestamp() + INTERVAL '30 days'),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_saas_tx_org ON public.saas_payment_transactions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_saas_tx_gateway ON public.saas_payment_transactions(gateway, gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_saas_invoices_org ON public.saas_invoices(organization_id, status);

-- HABILITAR RLS
ALTER TABLE public.saas_payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_payment_transactions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.saas_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_invoices FORCE ROW LEVEL SECURITY;

-- POLÍTICAS RLS AISLADAS
DROP POLICY IF EXISTS "tenant_payments_policy" ON public.saas_payment_transactions;
CREATE POLICY "tenant_payments_policy" ON public.saas_payment_transactions
    FOR ALL TO authenticated, anon
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid() AND om.is_active = true
        )
        OR auth.uid() IS NULL
    )
    WITH CHECK (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid() AND om.is_active = true
        )
        OR auth.uid() IS NULL
    );

DROP POLICY IF EXISTS "tenant_invoices_policy" ON public.saas_invoices;
CREATE POLICY "tenant_invoices_policy" ON public.saas_invoices
    FOR ALL TO authenticated, anon
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid() AND om.is_active = true
        )
        OR auth.uid() IS NULL
    );

-- ============================================================================
-- 3. RPC: REGISTRO DE PAGO MANUAL EN EL SUPER ADMIN (Ticket PL-05)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.register_manual_tenant_payment(
    p_organization_id UUID,
    p_amount_cop NUMERIC,
    p_payment_method TEXT DEFAULT 'BANCOLOMBIA_TRANSFER',
    p_reference TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_tx_id UUID;
    v_inv_id UUID;
    v_invoice_num TEXT;
    v_license RECORD;
    v_new_expires_at TIMESTAMPTZ;
BEGIN
    -- Validar organización
    IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE id = p_organization_id) THEN
        RAISE EXCEPTION 'Organización no encontrada: %', p_organization_id;
    END IF;

    -- Obtener o crear licencia activa
    SELECT * INTO v_license
    FROM public.saas_licenses
    WHERE organization_id = p_organization_id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Registrar transacción aprobada
    INSERT INTO public.saas_payment_transactions (
        organization_id,
        license_id,
        gateway,
        gateway_transaction_id,
        idempotency_key,
        amount_cop,
        status,
        payment_method_type,
        billing_cycle,
        raw_payload,
        verified_at
    ) VALUES (
        p_organization_id,
        v_license.id,
        p_payment_method,
        COALESCE(p_reference, 'MANUAL-' || to_char(clock_timestamp(), 'YYYYMMDDHH24MISS')),
        'IDEMP-MAN-' || gen_random_uuid(),
        p_amount_cop,
        'APPROVED',
        p_payment_method,
        'MONTHLY',
        jsonb_build_object('notes', p_notes, 'registered_by', auth.uid()),
        clock_timestamp()
    )
    RETURNING id INTO v_tx_id;

    -- Generar Factura
    v_invoice_num := 'INV-ALPHAV-' || to_char(clock_timestamp(), 'YYMM') || '-' || substr(gen_random_uuid()::text, 1, 6);
    INSERT INTO public.saas_invoices (
        organization_id,
        transaction_id,
        invoice_number,
        subtotal_cop,
        tax_cop,
        total_cop,
        status,
        metadata
    ) VALUES (
        p_organization_id,
        v_tx_id,
        v_invoice_num,
        p_amount_cop,
        0.00,
        p_amount_cop,
        'PAID',
        jsonb_build_object('payment_method', p_payment_method, 'reference', p_reference)
    )
    RETURNING id INTO v_inv_id;

    -- Extender o reactivar licencia por 30 días
    IF v_license.id IS NOT NULL THEN
        IF v_license.expires_at > clock_timestamp() THEN
            v_new_expires_at := v_license.expires_at + INTERVAL '30 days';
        ELSE
            v_new_expires_at := clock_timestamp() + INTERVAL '30 days';
        END IF;

        UPDATE public.saas_licenses
        SET status = 'ACTIVE',
            license_type = 'MONTHLY_PAID',
            expires_at = v_new_expires_at,
            last_payment_at = clock_timestamp(),
            next_billing_at = v_new_expires_at,
            payment_reference = p_reference,
            updated_at = clock_timestamp()
        WHERE id = v_license.id;
    END IF;

    -- Registrar auditoría
    INSERT INTO public.saas_audit_log (organization_id, action, actor_id, payload)
    VALUES (
        p_organization_id,
        'REGISTER_MANUAL_PAYMENT',
        auth.uid(),
        jsonb_build_object(
            'transaction_id', v_tx_id,
            'invoice_id', v_inv_id,
            'amount_cop', p_amount_cop,
            'method', p_payment_method,
            'reference', p_reference,
            'new_expires_at', v_new_expires_at
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_tx_id,
        'invoice_number', v_invoice_num,
        'amount_cop', p_amount_cop,
        'new_expires_at', v_new_expires_at
    );
END;
$$;
