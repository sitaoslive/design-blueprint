-- ====================================================================
-- VET FREEDOM OS — MIGRATION 036
-- FINANCIAL OPERATIONS, QUOTES, PAYMENTS, RECONCILIATION & INVOICING HUB
-- Arquitectura: Google Antigravity + Supabase (PostgreSQL 17) + n8n + Lovable
-- Responsable Médico: Dr. Luis Eduardo Ríos
-- Cumplimiento: Ley 576/00, Estatuto Tributario / DIAN, Ley 1581/12 Habeas Data
-- ====================================================================

-- 1. Tarifas Oficiales Autorizadas (Rates)
CREATE TABLE IF NOT EXISTS public.financial_service_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    service_id UUID REFERENCES public.services(id),
    service_code VARCHAR(64) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL DEFAULT 'CONSULTATION',
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    base_price NUMERIC(14,2) NOT NULL CHECK (base_price >= 0),
    tax_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0000, -- e.g. 0.0000 o 0.1900
    rate_version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_service_rate_code_version UNIQUE (service_code, rate_version)
);

-- 2. Presupuestos y Cotizaciones (Quotes)
CREATE TABLE IF NOT EXISTS public.financial_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    quote_number VARCHAR(64) NOT NULL UNIQUE,
    owner_id UUID REFERENCES public.owners(id),
    pet_id UUID REFERENCES public.pets(id),
    appointment_id UUID REFERENCES public.appointments(id),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_INTERNAL_APPROVAL', 'APPROVED', 'SENT', 
        'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'SUPERSEDED', 'CANCELLED'
    )),
    current_version_number INTEGER NOT NULL DEFAULT 1,
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    subtotal_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0),
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    valid_until TIMESTAMPTZ NOT NULL,
    approved_by UUID REFERENCES public.staff_profiles(id),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Versiones Inmutables de Presupuesto (Quote Versions)
CREATE TABLE IF NOT EXISTS public.financial_quote_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.financial_quotes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    subtotal_amount NUMERIC(14,2) NOT NULL CHECK (subtotal_amount >= 0),
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount NUMERIC(14,2) NOT NULL CHECK (total_amount >= 0),
    items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    change_reason TEXT,
    created_by UUID REFERENCES public.staff_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_financial_quote_version UNIQUE (quote_id, version_number)
);

-- 4. Ítems de Presupuesto (Quote Items)
CREATE TABLE IF NOT EXISTS public.financial_quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.financial_quotes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    service_rate_id UUID REFERENCES public.financial_service_rates(id),
    description TEXT NOT NULL,
    quantity NUMERIC(8,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_line_amount NUMERIC(14,2) NOT NULL CHECK (total_line_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Aprobación de Descuentos (Quote Approvals)
CREATE TABLE IF NOT EXISTS public.financial_quote_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.financial_quotes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    requested_by UUID NOT NULL REFERENCES public.staff_profiles(id),
    discount_percentage NUMERIC(5,2) NOT NULL,
    discount_amount NUMERIC(14,2) NOT NULL,
    reason TEXT NOT NULL,
    approval_status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by UUID REFERENCES public.staff_profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Solicitudes de Pago (Payment Requests)
CREATE TABLE IF NOT EXISTS public.financial_payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    payment_request_code VARCHAR(64) NOT NULL UNIQUE,
    quote_id UUID REFERENCES public.financial_quotes(id),
    appointment_id UUID REFERENCES public.appointments(id),
    owner_id UUID NOT NULL REFERENCES public.owners(id),
    pet_id UUID REFERENCES public.pets(id),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
    outstanding_amount NUMERIC(14,2) NOT NULL CHECK (outstanding_amount >= 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    status VARCHAR(32) NOT NULL DEFAULT 'ISSUED' CHECK (status IN (
        'DRAFT', 'PENDING_APPROVAL', 'AUTHORIZED', 'ISSUED', 'PENDING_PAYMENT', 
        'PARTIALLY_PAID', 'PAID_VERIFIED', 'EXPIRED', 'CANCELLED', 'DISPUTED', 'RECONCILIATION_REQUIRED'
    )),
    due_date TIMESTAMPTZ NOT NULL,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Enlaces de Pago (Payment Links)
CREATE TABLE IF NOT EXISTS public.financial_payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_request_id UUID NOT NULL REFERENCES public.financial_payment_requests(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL, -- 'WOMPI', 'BOLD', 'MERCADO_PAGO', 'PSE'
    provider_link_id VARCHAR(128),
    payment_url TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CONSUMED', 'REVOKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Transacciones Financieras (Payment Transactions)
CREATE TABLE IF NOT EXISTS public.financial_payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    payment_request_id UUID REFERENCES public.financial_payment_requests(id),
    owner_id UUID REFERENCES public.owners(id),
    provider VARCHAR(32) NOT NULL, -- 'WOMPI', 'BOLD', 'NEQUI', 'BANCOLOMBIA', 'CASH', 'PSE'
    external_transaction_id VARCHAR(128) NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    fee_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (fee_amount >= 0),
    net_amount NUMERIC(14,2) NOT NULL CHECK (net_amount >= 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    transaction_status VARCHAR(32) NOT NULL CHECK (transaction_status IN (
        'INITIATED', 'PENDING', 'PROCESSING', 'AUTHORIZED', 'SUCCEEDED', 
        'FAILED', 'CANCELLED', 'EXPIRED', 'PARTIALLY_REFUNDED', 'REFUNDED', 
        'CHARGEBACK', 'REVERSED', 'UNKNOWN_RESULT', 'RECONCILIATION_REQUIRED'
    )),
    raw_event_payload JSONB,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_financial_provider_transaction UNIQUE (provider, external_transaction_id)
);

-- 9. Asignaciones de Pago Granulares (Payment Allocations)
CREATE TABLE IF NOT EXISTS public.financial_payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.financial_payment_transactions(id) ON DELETE CASCADE,
    payment_request_id UUID NOT NULL REFERENCES public.financial_payment_requests(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(14,2) NOT NULL CHECK (allocated_amount > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    allocated_by UUID REFERENCES public.staff_profiles(id),
    CONSTRAINT uq_transaction_request_alloc UNIQUE (transaction_id, payment_request_id)
);

-- 10. Conciliaciones de Pago (Payment Reconciliations)
CREATE TABLE IF NOT EXISTS public.financial_payment_reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.financial_payment_transactions(id),
    payment_request_id UUID REFERENCES public.financial_payment_requests(id),
    reconciliation_status VARCHAR(32) NOT NULL DEFAULT 'UNMATCHED' CHECK (reconciliation_status IN (
        'UNMATCHED', 'MATCH_PENDING', 'MATCHED', 'PARTIALLY_MATCHED', 'AMOUNT_MISMATCH', 
        'CURRENCY_MISMATCH', 'DUPLICATE_SUSPECTED', 'REFUND_PENDING', 'CHARGEBACK_PENDING', 
        'EXTERNAL_RESULT_UNKNOWN', 'MANUAL_REVIEW_REQUIRED'
    )),
    matched_amount NUMERIC(14,2),
    bank_statement_reference VARCHAR(128),
    reconciled_by UUID REFERENCES public.staff_profiles(id),
    reconciled_at TIMESTAMPTZ,
    discrepancy_reason TEXT,
    evidence_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Reportes de Transferencias Bancarias (Bank Transfer Reports)
CREATE TABLE IF NOT EXISTS public.financial_bank_transfer_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    owner_id UUID NOT NULL REFERENCES public.owners(id),
    payment_request_id UUID REFERENCES public.financial_payment_requests(id),
    bank_name VARCHAR(64) NOT NULL, -- 'NEQUI', 'BANCOLOMBIA', 'DAVIPLATA', 'BRE_B'
    declared_reference VARCHAR(128) NOT NULL,
    declared_amount NUMERIC(14,2) NOT NULL CHECK (declared_amount > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    screenshot_storage_path TEXT,
    verification_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (verification_status IN (
        'PENDING_VERIFICATION', 'VERIFIED_MATCHED', 'REJECTED_FAKE_OR_NOT_FOUND', 'DISPUTED'
    )),
    verified_by UUID REFERENCES public.staff_profiles(id),
    verified_at TIMESTAMPTZ,
    reconciliation_id UUID REFERENCES public.financial_payment_reconciliations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Recibos de Caja en Efectivo (Cash Receipts)
CREATE TABLE IF NOT EXISTS public.financial_cash_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cash_receipt_code VARCHAR(64) NOT NULL UNIQUE,
    payment_request_id UUID REFERENCES public.financial_payment_requests(id),
    collector_staff_id UUID NOT NULL REFERENCES public.staff_profiles(id),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deposited_to_cashier BOOLEAN NOT NULL DEFAULT false,
    deposited_at TIMESTAMPTZ,
    cashier_staff_id UUID REFERENCES public.staff_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Facturas Comerciales y Electrónicas (Invoices)
CREATE TABLE IF NOT EXISTS public.financial_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id),
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    payment_request_id UUID REFERENCES public.financial_payment_requests(id),
    owner_id UUID NOT NULL REFERENCES public.owners(id),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING_ISSUANCE', 'ISSUED', 'ISSUANCE_FAILED', 
        'VALIDATION_PENDING', 'VALIDATED_BY_AUTHORIZED_SYSTEM', 'DELIVERY_PENDING', 
        'DELIVERED_WHEN_VERIFIABLE', 'CREDIT_NOTE_PENDING', 'CREDIT_NOTE_ISSUED', 'VOIDED_OR_ADJUSTED_AS_AUTHORIZED'
    )),
    fiscal_provider VARCHAR(64),
    fiscal_cufe VARCHAR(255),
    fiscal_qr_url TEXT,
    subtotal_amount NUMERIC(14,2) NOT NULL CHECK (subtotal_amount >= 0),
    tax_amount NUMERIC(14,2) NOT NULL CHECK (tax_amount >= 0),
    total_amount NUMERIC(14,2) NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Notas Crédito (Credit Notes)
CREATE TABLE IF NOT EXISTS public.financial_credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.financial_invoices(id),
    credit_note_number VARCHAR(64) NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    authorized_by UUID NOT NULL REFERENCES public.staff_profiles(id),
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED', 'VALIDATED_FISCAL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Solicitudes de Reembolso (Refund Requests)
CREATE TABLE IF NOT EXISTS public.financial_refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.financial_payment_transactions(id),
    payment_request_id UUID REFERENCES public.financial_payment_requests(id),
    owner_id UUID NOT NULL REFERENCES public.owners(id),
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 
        'PROVIDER_REQUESTED', 'PROCESSING', 'REFUNDED_VERIFIED', 
        'FAILED', 'UNKNOWN_RESULT', 'RECONCILIATION_REQUIRED'
    )),
    requested_by UUID REFERENCES public.staff_profiles(id),
    approved_by UUID REFERENCES public.staff_profiles(id),
    approved_at TIMESTAMPTZ,
    external_refund_reference VARCHAR(128),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Disputas Financieras y Contracargos (Disputes)
CREATE TABLE IF NOT EXISTS public.financial_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES public.financial_payment_transactions(id),
    payment_request_id UUID REFERENCES public.financial_payment_requests(id),
    owner_id UUID NOT NULL REFERENCES public.owners(id),
    dispute_type VARCHAR(32) NOT NULL CHECK (dispute_type IN (
        'UNKNOWN_CHARGE', 'DUPLICATE_CHARGE', 'AMOUNT_DISPUTE', 
        'SERVICE_DISSATISFACTION', 'CHARGEBACK_REPORTED'
    )),
    disputed_amount NUMERIC(14,2) NOT NULL CHECK (disputed_amount > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    status VARCHAR(32) NOT NULL DEFAULT 'OPENED' CHECK (status IN (
        'OPENED', 'UNDER_REVIEW', 'EVIDENCE_SUBMITTED', 
        'RESOLVED_IN_FAVOR_CLIENT', 'RESOLVED_IN_FAVOR_CLINIC', 'CLOSED'
    )),
    assigned_staff_id UUID REFERENCES public.staff_profiles(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Saldos Operativos de Clientes (Customer Balances)
CREATE TABLE IF NOT EXISTS public.financial_customer_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL UNIQUE REFERENCES public.owners(id),
    total_receivable NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_receivable >= 0),
    total_credit_balance NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (total_credit_balance >= 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'COP',
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Cola de Notificaciones y Recordatorios Financieros (Notification Jobs)
CREATE TABLE IF NOT EXISTS public.financial_notification_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_request_id UUID REFERENCES public.financial_payment_requests(id),
    quote_id UUID REFERENCES public.financial_quotes(id),
    owner_id UUID NOT NULL REFERENCES public.owners(id),
    notification_type VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'DISPATCHED_TO_CORE03', 'SUPPRESSED_BEREAVEMENT', 
        'SUPPRESSED_DISPUTE', 'SUPPRESSED_CAREGIVER_REVOKED', 'SUPPRESSED_FREQUENCY_LIMIT', 'CANCELLED'
    )),
    suppression_reason TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Auditoría Financiera Inmutable (Audit Events)
CREATE TABLE IF NOT EXISTS public.financial_audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(64) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    actor_id UUID,
    actor_role VARCHAR(32),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- RLS POLICIES (100% DE TABLAS PROTEGIDAS)
-- ====================================================================
ALTER TABLE public.financial_service_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_quote_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_payment_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_bank_transfer_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_cash_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_customer_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_audit_events ENABLE ROW LEVEL SECURITY;

-- Políticas para service_role (automatizaciones n8n y RPCs)
CREATE POLICY "p_fin_rates_service_role" ON public.financial_service_rates FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_quotes_service_role" ON public.financial_quotes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_quote_versions_service_role" ON public.financial_quote_versions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_quote_items_service_role" ON public.financial_quote_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_quote_approvals_service_role" ON public.financial_quote_approvals FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_payment_requests_service_role" ON public.financial_payment_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_payment_links_service_role" ON public.financial_payment_links FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_payment_transactions_service_role" ON public.financial_payment_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_payment_allocations_service_role" ON public.financial_payment_allocations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_payment_reconciliations_service_role" ON public.financial_payment_reconciliations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_bank_reports_service_role" ON public.financial_bank_transfer_reports FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_cash_receipts_service_role" ON public.financial_cash_receipts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_invoices_service_role" ON public.financial_invoices FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_credit_notes_service_role" ON public.financial_credit_notes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_refund_requests_service_role" ON public.financial_refund_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_disputes_service_role" ON public.financial_disputes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_customer_balances_service_role" ON public.financial_customer_balances FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_notification_jobs_service_role" ON public.financial_notification_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "p_fin_audit_events_service_role" ON public.financial_audit_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Políticas para staff autenticado (Finance, Admin, Vet)
CREATE POLICY "p_fin_rates_staff" ON public.financial_service_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "p_fin_quotes_staff" ON public.financial_quotes FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') IN ('staff', 'admin', 'vet', 'finance'));
CREATE POLICY "p_fin_payment_requests_staff" ON public.financial_payment_requests FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') IN ('staff', 'admin', 'vet', 'finance'));
CREATE POLICY "p_fin_invoices_staff" ON public.financial_invoices FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') IN ('staff', 'admin', 'finance'));
CREATE POLICY "p_fin_reconciliations_staff" ON public.financial_payment_reconciliations FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') IN ('staff', 'admin', 'finance'));
CREATE POLICY "p_fin_disputes_staff" ON public.financial_disputes FOR ALL TO authenticated USING ((auth.jwt() ->> 'role') IN ('staff', 'admin', 'finance'));

-- Políticas para Tutores / Owners (Solo lectura de lo propio)
CREATE POLICY "p_fin_quotes_client_select" ON public.financial_quotes FOR SELECT TO authenticated USING (owner_id = auth.uid() AND status IN ('APPROVED', 'SENT', 'VIEWED', 'ACCEPTED'));
CREATE POLICY "p_fin_payment_requests_client_select" ON public.financial_payment_requests FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "p_fin_invoices_client_select" ON public.financial_invoices FOR SELECT TO authenticated USING (owner_id = auth.uid() AND status IN ('ISSUED', 'VALIDATED_BY_AUTHORIZED_SYSTEM'));
CREATE POLICY "p_fin_disputes_client" ON public.financial_disputes FOR ALL TO authenticated USING (owner_id = auth.uid());

-- ====================================================================
-- PROCEDIMIENTOS ALMACENADOS (RPCS ATÓMICAS BLINDADAS)
-- ====================================================================

-- 1. Crear o Versionar Cotización
CREATE OR REPLACE FUNCTION public.create_or_version_quote(
    p_quote_id UUID,
    p_owner_id UUID,
    p_pet_id UUID,
    p_appointment_id UUID,
    p_items JSONB,
    p_valid_days INTEGER DEFAULT 15,
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_quote_id UUID;
    v_quote_number TEXT;
    v_version INTEGER;
    v_subtotal NUMERIC(14,2) := 0;
    v_discount NUMERIC(14,2) := 0;
    v_tax NUMERIC(14,2) := 0;
    v_total NUMERIC(14,2) := 0;
    v_item RECORD;
    v_line_total NUMERIC(14,2);
BEGIN
    IF p_owner_id IS NULL THEN
        RAISE EXCEPTION 'owner_id es obligatorio';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        service_rate_id UUID,
        description TEXT,
        quantity NUMERIC,
        unit_price NUMERIC,
        discount_amount NUMERIC,
        tax_amount NUMERIC
    )
    LOOP
        v_line_total := (COALESCE(v_item.quantity, 1) * COALESCE(v_item.unit_price, 0)) - COALESCE(v_item.discount_amount, 0) + COALESCE(v_item.tax_amount, 0);
        v_subtotal := v_subtotal + (COALESCE(v_item.quantity, 1) * COALESCE(v_item.unit_price, 0));
        v_discount := v_discount + COALESCE(v_item.discount_amount, 0);
        v_tax := v_tax + COALESCE(v_item.tax_amount, 0);
        v_total := v_total + v_line_total;
    END LOOP;

    IF p_quote_id IS NULL THEN
        v_quote_number := 'COT-' || to_char(now(), 'YYYY') || '-' || lpad(floor(random() * 100000)::text, 5, '0');
        v_version := 1;

        INSERT INTO financial_quotes (
            quote_number, owner_id, pet_id, appointment_id,
            status, current_version_number, subtotal_amount, discount_amount,
            tax_amount, total_amount, valid_until, created_at, updated_at
        ) VALUES (
            v_quote_number, p_owner_id, p_pet_id, p_appointment_id,
            'DRAFT', 1, v_subtotal, v_discount, v_tax, v_total,
            now() + (p_valid_days || ' days')::interval, now(), now()
        ) RETURNING id INTO v_quote_id;
    ELSE
        SELECT id, current_version_number + 1 INTO v_quote_id, v_version
        FROM financial_quotes WHERE id = p_quote_id FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Cotización no encontrada';
        END IF;

        UPDATE financial_quotes SET
            current_version_number = v_version,
            subtotal_amount = v_subtotal,
            discount_amount = v_discount,
            tax_amount = v_tax,
            total_amount = v_total,
            status = 'DRAFT',
            updated_at = now()
        WHERE id = v_quote_id;
    END IF;

    INSERT INTO financial_quote_versions (
        quote_id, version_number, subtotal_amount, discount_amount,
        tax_amount, total_amount, items_json, created_by, created_at
    ) VALUES (
        v_quote_id, v_version, v_subtotal, v_discount,
        v_tax, v_total, p_items, p_created_by, now()
    );

    INSERT INTO financial_audit_events (
        entity_type, entity_id, action, new_state, actor_id, occurred_at
    ) VALUES (
        'financial_quotes', v_quote_id, 'QUOTE_VERSIONED',
        jsonb_build_object('version', v_version, 'total', v_total),
        p_created_by, now()
    );

    RETURN jsonb_build_object(
        'success', true,
        'quote_id', v_quote_id,
        'version_number', v_version,
        'total_amount', v_total
    );
END;
$$;

-- 2. Aprobar Descuento en Cotización (Gate de Dirección)
CREATE OR REPLACE FUNCTION public.approve_quote_discount(
    p_quote_id UUID,
    p_version INTEGER,
    p_approver_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE financial_quotes
    SET status = 'APPROVED',
        approved_by = p_approver_id,
        updated_at = now()
    WHERE id = p_quote_id AND current_version_number = p_version;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'QUOTE_NOT_FOUND_OR_STALE');
    END IF;

    UPDATE financial_quote_approvals
    SET approval_status = 'APPROVED',
        reviewed_by = p_approver_id,
        reviewed_at = now(),
        review_notes = p_notes
    WHERE quote_id = p_quote_id AND version_number = p_version;

    INSERT INTO financial_audit_events (
        entity_type, entity_id, action, new_state, actor_id, occurred_at
    ) VALUES (
        'financial_quotes', p_quote_id, 'DISCOUNT_APPROVED',
        jsonb_build_object('approved_by', p_approver_id, 'notes', p_notes),
        p_approver_id, now()
    );

    RETURN jsonb_build_object('success', true, 'quote_id', p_quote_id, 'status', 'APPROVED');
END;
$$;

-- 3. Aceptar Cotización (Cliente)
CREATE OR REPLACE FUNCTION public.accept_quote(
    p_quote_id UUID,
    p_version INTEGER,
    p_owner_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_quote RECORD;
BEGIN
    SELECT * INTO v_quote FROM financial_quotes WHERE id = p_quote_id FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'QUOTE_NOT_FOUND');
    END IF;

    IF v_quote.owner_id <> p_owner_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED_CLIENT');
    END IF;

    IF v_quote.current_version_number <> p_version THEN
        RETURN jsonb_build_object('success', false, 'error', 'SUPERSEDED_VERSION_CANNOT_BE_ACCEPTED');
    END IF;

    IF v_quote.valid_until < now() THEN
        UPDATE financial_quotes SET status = 'EXPIRED' WHERE id = p_quote_id;
        RETURN jsonb_build_object('success', false, 'error', 'QUOTE_EXPIRED');
    END IF;

    UPDATE financial_quotes
    SET status = 'ACCEPTED',
        accepted_at = now(),
        updated_at = now()
    WHERE id = p_quote_id;

    INSERT INTO financial_audit_events (
        entity_type, entity_id, action, new_state, actor_id, occurred_at
    ) VALUES (
        'financial_quotes', p_quote_id, 'QUOTE_ACCEPTED',
        jsonb_build_object('accepted_at', now(), 'version', p_version),
        p_owner_id, now()
    );

    RETURN jsonb_build_object('success', true, 'quote_id', p_quote_id, 'status', 'ACCEPTED');
END;
$$;

-- 4. Crear Solicitud de Pago
CREATE OR REPLACE FUNCTION public.create_payment_request(
    p_quote_id UUID,
    p_appointment_id UUID,
    p_owner_id UUID,
    p_pet_id UUID,
    p_amount NUMERIC(14,2),
    p_due_hours INTEGER DEFAULT 48,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_req_id UUID;
    v_code TEXT;
BEGIN
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id INTO v_req_id FROM financial_payment_requests WHERE idempotency_key = p_idempotency_key;
        IF FOUND THEN
            RETURN jsonb_build_object('success', true, 'payment_request_id', v_req_id, 'idempotent', true);
        END IF;
    END IF;

    v_code := 'PR-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 100000)::text, 5, '0');

    INSERT INTO financial_payment_requests (
        payment_request_code, quote_id, appointment_id, owner_id, pet_id,
        amount, paid_amount, outstanding_amount, currency, status,
        due_date, idempotency_key, created_at, updated_at
    ) VALUES (
        v_code, p_quote_id, p_appointment_id, p_owner_id, p_pet_id,
        p_amount, 0, p_amount, 'COP', 'ISSUED',
        now() + (p_due_hours || ' hours')::interval, p_idempotency_key, now(), now()
    ) RETURNING id INTO v_req_id;

    INSERT INTO financial_notification_jobs (
        payment_request_id, quote_id, owner_id, notification_type, status, scheduled_for
    ) VALUES (
        v_req_id, p_quote_id, p_owner_id, 'PAYMENT_REQUEST_ISSUED', 'PENDING', now()
    );

    RETURN jsonb_build_object('success', true, 'payment_request_id', v_req_id, 'code', v_code);
END;
$$;

-- 5. Registrar Evento de Pago de Proveedor (Webhook / Transacción)
CREATE OR REPLACE FUNCTION public.register_provider_payment_event(
    p_payment_request_id UUID,
    p_provider TEXT,
    p_external_tx_id TEXT,
    p_amount NUMERIC(14,2),
    p_fee NUMERIC(14,2),
    p_currency TEXT,
    p_status TEXT,
    p_payload JSONB,
    p_signature_ok BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tx_id UUID;
    v_req RECORD;
    v_net NUMERIC(14,2);
BEGIN
    IF NOT p_signature_ok THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_SIGNATURE_REJECTED');
    END IF;

    SELECT id INTO v_tx_id
    FROM financial_payment_transactions
    WHERE provider = p_provider AND external_transaction_id = p_external_tx_id;

    IF FOUND THEN
        RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'idempotent', true);
    END IF;

    v_net := p_amount - COALESCE(p_fee, 0);

    INSERT INTO financial_payment_transactions (
        payment_request_id, provider, external_transaction_id,
        amount, fee_amount, net_amount, currency, transaction_status,
        raw_event_payload, signature_verified, occurred_at, created_at
    ) VALUES (
        p_payment_request_id, p_provider, p_external_tx_id,
        p_amount, COALESCE(p_fee, 0), v_net, p_currency, p_status,
        p_payload, p_signature_ok, now(), now()
    ) RETURNING id INTO v_tx_id;

    IF p_status = 'SUCCEEDED' AND p_payment_request_id IS NOT NULL THEN
        SELECT * INTO v_req FROM financial_payment_requests WHERE id = p_payment_request_id FOR UPDATE;

        IF FOUND THEN
            INSERT INTO financial_payment_allocations (
                transaction_id, payment_request_id, allocated_amount, currency, allocated_at
            ) VALUES (
                v_tx_id, p_payment_request_id, p_amount, p_currency, now()
            ) ON CONFLICT DO NOTHING;

            UPDATE financial_payment_requests SET
                paid_amount = paid_amount + p_amount,
                outstanding_amount = GREATEST(0, outstanding_amount - p_amount),
                status = CASE 
                    WHEN (outstanding_amount - p_amount) <= 0 THEN 'PAID_VERIFIED'
                    ELSE 'PARTIALLY_PAID'
                END,
                updated_at = now()
            WHERE id = p_payment_request_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'status', p_status);
END;
$$;

-- 6. Reportar Transferencia Bancaria (Tutor envía comprobante)
CREATE OR REPLACE FUNCTION public.report_bank_transfer(
    p_payment_request_id UUID,
    p_owner_id UUID,
    p_bank_name TEXT,
    p_reference TEXT,
    p_amount NUMERIC(14,2),
    p_screenshot_path TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_report_id UUID;
BEGIN
    INSERT INTO financial_bank_transfer_reports (
        payment_request_id, owner_id, bank_name, declared_reference,
        declared_amount, currency, screenshot_storage_path, verification_status,
        created_at
    ) VALUES (
        p_payment_request_id, p_owner_id, p_bank_name, p_reference,
        p_amount, 'COP', p_screenshot_path, 'PENDING_VERIFICATION',
        now()
    ) RETURNING id INTO v_report_id;

    IF p_payment_request_id IS NOT NULL THEN
        UPDATE financial_payment_requests
        SET status = 'RECONCILIATION_REQUIRED', updated_at = now()
        WHERE id = p_payment_request_id;
    END IF;

    INSERT INTO financial_audit_events (
        entity_type, entity_id, action, new_state, actor_id, occurred_at
    ) VALUES (
        'financial_bank_transfer_reports', v_report_id, 'TRANSFER_REPORTED_PENDING_REVIEW',
        jsonb_build_object('bank', p_bank_name, 'reference', p_reference, 'amount', p_amount),
        p_owner_id, now()
    );

    RETURN jsonb_build_object('success', true, 'report_id', v_report_id, 'status', 'PENDING_VERIFICATION');
END;
$$;

-- 7. Conciliar y Asignar Pago (Humano / Finanzas con Extracto)
CREATE OR REPLACE FUNCTION public.reconcile_and_allocate_payment(
    p_transaction_id UUID,
    p_payment_request_id UUID,
    p_staff_id UUID,
    p_bank_ref TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tx RECORD;
    v_req RECORD;
    v_rec_id UUID;
BEGIN
    SELECT * INTO v_tx FROM financial_payment_transactions WHERE id = p_transaction_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'TRANSACTION_NOT_FOUND');
    END IF;

    SELECT * INTO v_req FROM financial_payment_requests WHERE id = p_payment_request_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'PAYMENT_REQUEST_NOT_FOUND');
    END IF;

    INSERT INTO financial_payment_reconciliations (
        transaction_id, payment_request_id, reconciliation_status,
        matched_amount, bank_statement_reference, reconciled_by,
        reconciled_at, evidence_notes, created_at
    ) VALUES (
        p_transaction_id, p_payment_request_id, 'MATCHED',
        v_tx.amount, p_bank_ref, p_staff_id,
        now(), p_notes, now()
    ) RETURNING id INTO v_rec_id;

    INSERT INTO financial_payment_allocations (
        transaction_id, payment_request_id, allocated_amount, currency, allocated_at, allocated_by
    ) VALUES (
        p_transaction_id, p_payment_request_id, v_tx.amount, v_tx.currency, now(), p_staff_id
    ) ON CONFLICT (transaction_id, payment_request_id) DO UPDATE SET
        allocated_amount = v_tx.amount,
        allocated_at = now();

    UPDATE financial_payment_requests SET
        paid_amount = paid_amount + v_tx.amount,
        outstanding_amount = GREATEST(0, outstanding_amount - v_tx.amount),
        status = CASE 
            WHEN (outstanding_amount - v_tx.amount) <= 0 THEN 'PAID_VERIFIED'
            ELSE 'PARTIALLY_PAID'
        END,
        updated_at = now()
    WHERE id = p_payment_request_id;

    UPDATE financial_bank_transfer_reports SET
        verification_status = 'VERIFIED_MATCHED',
        verified_by = p_staff_id,
        verified_at = now(),
        reconciliation_id = v_rec_id
    WHERE payment_request_id = p_payment_request_id AND declared_reference = p_bank_ref;

    RETURN jsonb_build_object('success', true, 'reconciliation_id', v_rec_id, 'status', 'MATCHED');
END;
$$;

-- 8. Solicitar y Aprobar Reembolso
CREATE OR REPLACE FUNCTION public.request_and_approve_refund(
    p_transaction_id UUID,
    p_payment_request_id UUID,
    p_owner_id UUID,
    p_amount NUMERIC(14,2),
    p_reason TEXT,
    p_requested_by UUID,
    p_approved_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ref_id UUID;
BEGIN
    INSERT INTO financial_refund_requests (
        transaction_id, payment_request_id, owner_id, amount,
        currency, reason, status, requested_by, approved_by,
        approved_at, created_at
    ) VALUES (
        p_transaction_id, p_payment_request_id, p_owner_id, p_amount,
        'COP', p_reason, CASE WHEN p_approved_by IS NOT NULL THEN 'APPROVED' ELSE 'REQUESTED' END,
        p_requested_by, p_approved_by,
        CASE WHEN p_approved_by IS NOT NULL THEN now() ELSE NULL END,
        now()
    ) RETURNING id INTO v_ref_id;

    RETURN jsonb_build_object(
        'success', true,
        'refund_id', v_ref_id,
        'status', CASE WHEN p_approved_by IS NOT NULL THEN 'APPROVED' ELSE 'REQUESTED' END
    );
END;
$$;

-- 9. Evaluar Elegibilidad de Notificación Financiera
CREATE OR REPLACE FUNCTION public.evaluate_financial_reminder_eligibility(
    p_payment_request_id UUID,
    p_owner_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_req RECORD;
    v_is_bereaved BOOLEAN := false;
    v_has_open_dispute BOOLEAN := false;
BEGIN
    SELECT * INTO v_req FROM financial_payment_requests WHERE id = p_payment_request_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('eligible', false, 'reason', 'REQUEST_NOT_FOUND');
    END IF;

    IF v_req.status = 'PAID_VERIFIED' THEN
        RETURN jsonb_build_object('eligible', false, 'reason', 'ALREADY_PAID');
    END IF;

    IF v_req.status = 'CANCELLED' THEN
        RETURN jsonb_build_object('eligible', false, 'reason', 'REQUEST_CANCELLED');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM bereavement_records WHERE owner_id = p_owner_id AND is_active = true
    ) INTO v_is_bereaved;

    IF v_is_bereaved THEN
        RETURN jsonb_build_object('eligible', false, 'reason', 'SUPPRESSED_BEREAVEMENT');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM financial_disputes 
        WHERE (payment_request_id = p_payment_request_id OR owner_id = p_owner_id) 
          AND status IN ('OPENED', 'UNDER_REVIEW')
    ) INTO v_has_open_dispute;

    IF v_has_open_dispute THEN
        RETURN jsonb_build_object('eligible', false, 'reason', 'SUPPRESSED_DISPUTE');
    END IF;

    RETURN jsonb_build_object(
        'eligible', true,
        'amount', v_req.outstanding_amount,
        'currency', v_req.currency,
        'due_date', v_req.due_date
    );
END;
$$;

-- Revocación de permisos para anon y PUBLIC en RPCs
REVOKE EXECUTE ON FUNCTION public.create_or_version_quote FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.approve_quote_discount FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.accept_quote FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_payment_request FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.register_provider_payment_event FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.report_bank_transfer FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reconcile_and_allocate_payment FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.request_and_approve_refund FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.evaluate_financial_reminder_eligibility FROM anon, PUBLIC;
