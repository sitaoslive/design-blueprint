-- ==============================================================================
-- Migration: 009_finances_and_charges.sql
-- Description: Domiciliary visit charge lines, payment collections, financial
--              verifications (Bre-B, Nequi, Wompi, Cash), and customer value metrics (COP).
-- Module: Module K (Finanzas)
-- Requirements: WF-069..WF-080, AT-051..AT-060
-- ==============================================================================

-- 1. VISIT CHARGE LINES (Desglose de cobro por visita)
CREATE TABLE IF NOT EXISTS public.visit_charge_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE RESTRICT,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    supply_id UUID REFERENCES public.supplies(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(6,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    total_line_amount NUMERIC(14,2) NOT NULL CHECK (total_line_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'COP' CHECK (currency = 'COP'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PAYMENT COLLECTIONS (Recaudos y pagos domiciliarios)
CREATE TABLE IF NOT EXISTS public.payment_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'COP' CHECK (currency = 'COP'),
    payment_method TEXT NOT NULL CHECK (payment_method IN (
        'BRE_B', 'NEQUI', 'DAVIPLATA', 'CREDIT_CARD', 
        'DEBIT_CARD', 'CASH', 'BANK_TRANSFER', 'PAYMENT_LINK'
    )),
    payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN (
        'PENDING', 'PROOFS_UPLOADED', 'VERIFIED_FINANCE', 'REJECTED', 'REFUNDED'
    )),
    external_transaction_id TEXT, -- Referencia Wompi / PSE / Nequi
    voucher_file_url TEXT,
    collected_by_staff_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON public.payment_collections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. PAYMENT VERIFICATIONS (Auditoría humana por rol Finanzas)
CREATE TABLE IF NOT EXISTS public.payment_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_collection_id UUID NOT NULL REFERENCES public.payment_collections(id) ON DELETE CASCADE,
    verified_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    verification_status TEXT NOT NULL CHECK (verification_status IN (
        'CONFIRMED', 'DISCREPANCY_FOUND', 'FRAUDULENT_RECEIPT', 'EXPIRED'
    )),
    bank_account_credited TEXT,
    reconciliation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    discrepancy_amount NUMERIC(14,2) DEFAULT 0,
    verification_notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CUSTOMER VALUE METRICS (LTV y estado de cartera)
CREATE TABLE IF NOT EXISTS public.customer_value_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    total_visits_count INTEGER NOT NULL DEFAULT 0 CHECK (total_visits_count >= 0),
    total_spent_cop NUMERIC(16,2) NOT NULL DEFAULT 0 CHECK (total_spent_cop >= 0),
    average_ticket_cop NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (average_ticket_cop >= 0),
    last_visit_date DATE,
    outstanding_balance_cop NUMERIC(14,2) NOT NULL DEFAULT 0,
    loyalty_tier TEXT NOT NULL DEFAULT 'BRONZE' CHECK (loyalty_tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM_VIP')),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_owner_value_metrics UNIQUE (owner_id)
);

CREATE TRIGGER trg_customer_metrics_updated_at
BEFORE UPDATE ON public.customer_value_metrics
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
