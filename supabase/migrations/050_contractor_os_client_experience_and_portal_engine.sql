-- ============================================================================
-- MIGRATION 050: CONTRACTOR OS — CLIENT APPLICATION & LIFETIME SERVICE ENGINE
-- Part 7: The Ultimate Customer Mobile Application, Premium Client Portal &
-- Lifetime Service Experience Engine (Alpha Service OS / Alpha Vision Method)
--
-- Features Covered:
--   FEAT-CLIENT-AUTH-001  (Client Tokenized & Multi-Property Identity)
--   FEAT-CLIENT-BOOK-001  (8-Step Intelligent Booking, Rebooking & Reschedule)
--   FEAT-CLIENT-PROP-001  (Multi-Property & Equipment Asset Management)
--   FEAT-CLIENT-EST-001   (Good/Better/Best Proposals & Digital Signatures)
--   FEAT-CLIENT-CHG-001   (Change Orders & Additional Work Approvals)
--   FEAT-CLIENT-MAINT-001 (Maintenance Memberships & Seasonal Reminders)
--   FEAT-CLIENT-WARR-001  (Warranties & Warranty Claim Center)
--   FEAT-CLIENT-AI-001    (AI Customer Concierge with Role-Scoped Tools)
--   FEAT-CLIENT-CASE-001  (Customer Satisfaction, 5-Star Reviews & Support Cases)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLA: contractor_client_properties (Propiedades del Cliente / Inmuebles)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_client_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_phone TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    property_name TEXT NOT NULL, -- e.g. "Primary Residence", "Downtown Medical Tower", "Rental Unit 4B"
    property_type TEXT NOT NULL DEFAULT 'RESIDENTIAL', -- RESIDENTIAL, COMMERCIAL, RENTAL, INDUSTRIAL
    street_address TEXT NOT NULL,
    unit_suite TEXT,
    city TEXT NOT NULL,
    state_province TEXT NOT NULL,
    postal_code TEXT,
    country TEXT NOT NULL DEFAULT 'USA', -- USA, CAN, COL
    access_instructions TEXT, -- Gate code, keybox location, parking instructions
    is_primary BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_properties_org_phone ON public.contractor_client_properties (organization_id, client_phone);

-- ----------------------------------------------------------------------------
-- 2. TABLA: contractor_client_equipment (Activos y Equipos de la Propiedad)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_client_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.contractor_client_properties(id) ON DELETE CASCADE,
    equipment_type TEXT NOT NULL, -- HVAC_CONDENSER, HVAC_AIR_HANDLER, WATER_HEATER, ELECTRICAL_PANEL, ROOF_MEMBRANE, PLUMBING_INTERCEPTOR
    equipment_name TEXT NOT NULL, -- e.g. "Carrier Infinity 19VS Heat Pump"
    manufacturer TEXT,
    model_number TEXT,
    serial_number TEXT,
    installation_date DATE,
    filter_size TEXT,
    warranty_expiration DATE,
    last_service_date DATE,
    next_maintenance_due DATE,
    status TEXT NOT NULL DEFAULT 'OPERATIONAL', -- OPERATIONAL, NEEDS_ATTENTION, REPLACEMENT_RECOMMENDED, CRITICAL
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_equipment_property ON public.contractor_client_equipment (property_id);

-- ----------------------------------------------------------------------------
-- 3. TABLA: contractor_booking_requests (Ingesta y Agendamiento Inteligente)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.contractor_client_properties(id) ON DELETE SET NULL,
    equipment_id UUID REFERENCES public.contractor_client_equipment(id) ON DELETE SET NULL,
    booking_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    service_type TEXT NOT NULL, -- HVAC, PLUMBING, ELECTRICAL, ROOFING, PAINTING, LANDSCAPING, GENERAL_REMODEL
    service_name TEXT NOT NULL, -- Specific service requested e.g. "Seasonal AC Tune-up & Inspection"
    urgency_level TEXT NOT NULL DEFAULT 'STANDARD', -- EMERGENCY, URGENT, STANDARD, FLEXIBLE
    description TEXT NOT NULL,
    job_site_address TEXT NOT NULL,
    preferred_slot_start TIMESTAMPTZ NOT NULL,
    preferred_slot_end TIMESTAMPTZ NOT NULL,
    diagnostic_fee_usd NUMERIC(10, 2) NOT NULL DEFAULT 99.00,
    deposit_required_usd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deposit_paid BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, RESCHEDULED, CONVERTED_TO_JOB, CANCELLED
    rescheduled_from_id UUID,
    cancellation_reason TEXT,
    intake_channel TEXT NOT NULL DEFAULT 'CLIENT_PWA', -- CLIENT_PWA, AI_CONCIERGE, WHATSAPP, WEBSITE_GUEST
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_booking_org_status ON public.contractor_booking_requests (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_contractor_booking_phone ON public.contractor_booking_requests (customer_phone);

-- ----------------------------------------------------------------------------
-- 4. TABLA: contractor_proposals (Propuestas Escalonadas Good / Better / Best)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    estimate_id UUID NOT NULL REFERENCES public.contractor_estimates(id) ON DELETE CASCADE,
    proposal_title TEXT NOT NULL,
    tier TEXT NOT NULL, -- GOOD, BETTER, BEST
    tier_name TEXT NOT NULL, -- e.g. "Essential Repair", "Comprehensive Restoration", "Premium High-Efficiency Replacement"
    description TEXT NOT NULL,
    scope_bullets JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["Replace contactor", "1-yr parts warranty", "Tune-up included"]
    warranty_months INTEGER NOT NULL DEFAULT 12,
    subtotal_usd NUMERIC(12, 2) NOT NULL,
    tax_usd NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_usd NUMERIC(12, 2) NOT NULL,
    deposit_required_usd NUMERIC(12, 2) NOT NULL,
    is_recommended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_proposals_estimate ON public.contractor_proposals (estimate_id);

-- ----------------------------------------------------------------------------
-- 5. TABLA: contractor_estimate_questions (Preguntas y Negociación en Portal)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_estimate_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    estimate_id UUID NOT NULL REFERENCES public.contractor_estimates(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL, -- CLIENT, CONTRACTOR_STAFF, AI_CONCIERGE
    sender_name TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_est_questions ON public.contractor_estimate_questions (estimate_id);

-- ----------------------------------------------------------------------------
-- 6. TABLA: contractor_estimate_acceptances (Aceptaciones y Firmas Digitales)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_estimate_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    estimate_id UUID NOT NULL REFERENCES public.contractor_estimates(id) ON DELETE CASCADE,
    proposal_tier TEXT NOT NULL, -- GOOD, BETTER, BEST
    accepted_total_usd NUMERIC(12, 2) NOT NULL,
    accepted_deposit_usd NUMERIC(12, 2) NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_signature_data TEXT NOT NULL, -- Base64 vector or signature string
    ip_address TEXT,
    user_agent TEXT,
    accepted_terms_version TEXT NOT NULL DEFAULT 'v2026.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_acceptances_est ON public.contractor_estimate_acceptances (estimate_id);

-- ----------------------------------------------------------------------------
-- 7. TABLA: contractor_change_orders (Órdenes de Cambio y Trabajos Extra)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_change_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.contractor_jobs(id) ON DELETE CASCADE,
    change_order_number TEXT NOT NULL,
    title TEXT NOT NULL,
    reason_description TEXT NOT NULL,
    items_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
    additional_cost_usd NUMERIC(12, 2) NOT NULL,
    additional_days INTEGER NOT NULL DEFAULT 0,
    evidence_photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, APPROVED, DECLINED
    client_decision_notes TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_change_orders_job ON public.contractor_change_orders (job_id);

-- ----------------------------------------------------------------------------
-- 8. TABLA: contractor_maintenance_plans (Planes de Mantenimiento y Membresías)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_maintenance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.contractor_client_properties(id) ON DELETE SET NULL,
    client_phone TEXT NOT NULL,
    client_name TEXT NOT NULL,
    plan_name TEXT NOT NULL, -- e.g. "Club Comfort Care HVAC Annual", "Commercial Plumbing Shield"
    billing_interval TEXT NOT NULL DEFAULT 'MONTHLY', -- MONTHLY, QUARTERLY, ANNUAL
    price_per_interval_usd NUMERIC(10, 2) NOT NULL,
    visits_per_year INTEGER NOT NULL DEFAULT 2,
    visits_used INTEGER NOT NULL DEFAULT 0,
    discount_on_repairs_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    priority_dispatch BOOLEAN NOT NULL DEFAULT true,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    renewal_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, CANCELLED
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_maint_plans_org_phone ON public.contractor_maintenance_plans (organization_id, client_phone);

-- ----------------------------------------------------------------------------
-- 9. TABLA: contractor_warranties (Certificados de Garantía de Obra y Equipos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_warranties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.contractor_jobs(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.contractor_client_properties(id) ON DELETE SET NULL,
    equipment_id UUID REFERENCES public.contractor_client_equipment(id) ON DELETE SET NULL,
    client_phone TEXT NOT NULL,
    warranty_code TEXT NOT NULL,
    coverage_title TEXT NOT NULL, -- e.g. "10-Year Compressor & 2-Year Workmanship Warranty"
    warranty_type TEXT NOT NULL DEFAULT 'LABOR_AND_PARTS', -- LABOR_ONLY, PARTS_ONLY, LABOR_AND_PARTS, MANUFACTURER
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    terms_summary TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CLAIM_IN_PROGRESS, EXPIRED, VOID
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_warranties_phone ON public.contractor_warranties (client_phone);

-- ----------------------------------------------------------------------------
-- 10. TABLA: contractor_warranty_claims (Solicitudes de Reclamo de Garantía)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_warranty_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    warranty_id UUID NOT NULL REFERENCES public.contractor_warranties(id) ON DELETE CASCADE,
    claim_number TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    evidence_photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    urgency_level TEXT NOT NULL DEFAULT 'URGENT',
    status TEXT NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, INSPECTION_SCHEDULED, RESOLVED_NO_CHARGE, OUT_OF_SCOPE
    resolution_notes TEXT,
    followup_job_id UUID REFERENCES public.contractor_jobs(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_warranty_claims ON public.contractor_warranty_claims (warranty_id);

-- ----------------------------------------------------------------------------
-- 11. TABLA: contractor_support_cases (Casos de Soporte y Reclamaciones de Cliente)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_support_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.contractor_jobs(id) ON DELETE SET NULL,
    client_phone TEXT NOT NULL,
    client_name TEXT NOT NULL,
    case_number TEXT NOT NULL,
    category TEXT NOT NULL, -- ISSUE_RETURNED, TECHNICIAN_NO_SHOW, BILLING_DISPUTE, QUALITY_CONCERN, DAMAGE_REPORT, GENERAL
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'STANDARD', -- HIGH, STANDARD, LOW
    status TEXT NOT NULL DEFAULT 'RECEIVED', -- RECEIVED, ASSIGNED, UNDER_REVIEW, ACTION_REQUIRED, RESOLVED, CLOSED
    assigned_staff_name TEXT,
    internal_notes TEXT,
    client_visible_update TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_support_cases_org ON public.contractor_support_cases (organization_id, status);

-- ----------------------------------------------------------------------------
-- 12. TABLA: contractor_customer_feedback (Calificaciones 5 Estrellas y Reseñas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_customer_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.contractor_jobs(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    is_public_review_permitted BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_feedback_job ON public.contractor_customer_feedback (job_id);

-- ----------------------------------------------------------------------------
-- 13. TABLA: contractor_client_notifications (Centro de Notificaciones Event-Driven)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_client_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    client_phone TEXT NOT NULL,
    notification_type TEXT NOT NULL, -- BOOKING_CONFIRMED, TECH_EN_ROUTE, APPROVAL_REQUIRED, ESTIMATE_READY, INVOICE_READY, PAYMENT_CONFIRMED, MAINTENANCE_DUE
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    deep_link_url TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_client_notifs ON public.contractor_client_notifications (organization_id, client_phone, is_read);

-- ----------------------------------------------------------------------------
-- POLÍTICAS RLS (ROW-LEVEL SECURITY) EN LAS 13 TABLAS
-- ----------------------------------------------------------------------------
ALTER TABLE public.contractor_client_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_client_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_estimate_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_estimate_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_change_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_maintenance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_support_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_customer_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_client_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento por organization_id (Multi-Tenant Estricto)
DROP POLICY IF EXISTS p_contractor_properties_tenant_iso ON public.contractor_client_properties;
CREATE POLICY p_contractor_properties_tenant_iso ON public.contractor_client_properties
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_equipment_tenant_iso ON public.contractor_client_equipment;
CREATE POLICY p_contractor_equipment_tenant_iso ON public.contractor_client_equipment
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_booking_tenant_iso ON public.contractor_booking_requests;
CREATE POLICY p_contractor_booking_tenant_iso ON public.contractor_booking_requests
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_proposals_tenant_iso ON public.contractor_proposals;
CREATE POLICY p_contractor_proposals_tenant_iso ON public.contractor_proposals
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_questions_tenant_iso ON public.contractor_estimate_questions;
CREATE POLICY p_contractor_questions_tenant_iso ON public.contractor_estimate_questions
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_acceptances_tenant_iso ON public.contractor_estimate_acceptances;
CREATE POLICY p_contractor_acceptances_tenant_iso ON public.contractor_estimate_acceptances
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_change_orders_tenant_iso ON public.contractor_change_orders;
CREATE POLICY p_contractor_change_orders_tenant_iso ON public.contractor_change_orders
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_maint_plans_tenant_iso ON public.contractor_maintenance_plans;
CREATE POLICY p_contractor_maint_plans_tenant_iso ON public.contractor_maintenance_plans
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_warranties_tenant_iso ON public.contractor_warranties;
CREATE POLICY p_contractor_warranties_tenant_iso ON public.contractor_warranties
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_claims_tenant_iso ON public.contractor_warranty_claims;
CREATE POLICY p_contractor_claims_tenant_iso ON public.contractor_warranty_claims
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_support_tenant_iso ON public.contractor_support_cases;
CREATE POLICY p_contractor_support_tenant_iso ON public.contractor_support_cases
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_feedback_tenant_iso ON public.contractor_customer_feedback;
CREATE POLICY p_contractor_feedback_tenant_iso ON public.contractor_customer_feedback
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

DROP POLICY IF EXISTS p_contractor_notifs_tenant_iso ON public.contractor_client_notifications;
CREATE POLICY p_contractor_notifs_tenant_iso ON public.contractor_client_notifications
    FOR ALL USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid OR auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- RPC PROCEDURES DE DOMINIO DEL CLIENTE
-- ----------------------------------------------------------------------------

-- RPC 1: submit_client_booking_request
CREATE OR REPLACE FUNCTION public.submit_client_booking_request(
    p_organization_id UUID,
    p_customer_name TEXT,
    p_customer_phone TEXT,
    p_customer_email TEXT,
    p_service_type TEXT,
    p_service_name TEXT,
    p_urgency_level TEXT,
    p_description TEXT,
    p_job_site_address TEXT,
    p_preferred_slot_start TIMESTAMPTZ,
    p_preferred_slot_end TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking_id UUID;
    v_booking_number TEXT;
    v_diag_fee NUMERIC(10, 2) := 99.00;
BEGIN
    v_booking_number := 'BKG-' || to_char(clock_timestamp(), 'YYMM') || '-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0');

    IF p_urgency_level = 'EMERGENCY' THEN
        v_diag_fee := 149.00;
    END IF;

    INSERT INTO public.contractor_booking_requests (
        organization_id,
        booking_number,
        customer_name,
        customer_phone,
        customer_email,
        service_type,
        service_name,
        urgency_level,
        description,
        job_site_address,
        preferred_slot_start,
        preferred_slot_end,
        diagnostic_fee_usd,
        status
    ) VALUES (
        p_organization_id,
        v_booking_number,
        p_customer_name,
        p_customer_phone,
        p_customer_email,
        p_service_type,
        p_service_name,
        p_urgency_level,
        p_description,
        p_job_site_address,
        p_preferred_slot_start,
        p_preferred_slot_end,
        v_diag_fee,
        'CONFIRMED'
    ) RETURNING id INTO v_booking_id;

    -- Notificación al cliente
    INSERT INTO public.contractor_client_notifications (
        organization_id,
        client_phone,
        notification_type,
        title,
        body,
        deep_link_url
    ) VALUES (
        p_organization_id,
        p_customer_phone,
        'BOOKING_CONFIRMED',
        'Booking Confirmed: ' || p_service_name,
        'Your appointment is confirmed for ' || to_char(p_preferred_slot_start, 'Mon DD, YYYY at HH24:MI') || '. Reference: ' || v_booking_number,
        '/contractors/portal/' || v_booking_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_number', v_booking_number,
        'diagnostic_fee_usd', v_diag_fee,
        'status', 'CONFIRMED'
    );
END;
$$;

-- RPC 2: submit_proposal_acceptance
CREATE OR REPLACE FUNCTION public.submit_proposal_acceptance(
    p_organization_id UUID,
    p_estimate_id UUID,
    p_proposal_tier TEXT,
    p_accepted_total_usd NUMERIC,
    p_accepted_deposit_usd NUMERIC,
    p_client_name TEXT,
    p_client_phone TEXT,
    p_client_signature_data TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_acceptance_id UUID;
    v_job_id UUID;
    v_job_number TEXT;
    v_est RECORD;
BEGIN
    SELECT * INTO v_est FROM public.contractor_estimates WHERE id = p_estimate_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Estimate % not found', p_estimate_id;
    END IF;

    -- Registrar aceptación digital
    INSERT INTO public.contractor_estimate_acceptances (
        organization_id,
        estimate_id,
        proposal_tier,
        accepted_total_usd,
        accepted_deposit_usd,
        client_name,
        client_phone,
        client_signature_data
    ) VALUES (
        p_organization_id,
        p_estimate_id,
        p_proposal_tier,
        p_accepted_total_usd,
        p_accepted_deposit_usd,
        p_client_name,
        p_client_phone,
        p_client_signature_data
    ) RETURNING id INTO v_acceptance_id;

    -- Actualizar estado de la cotización
    UPDATE public.contractor_estimates
    SET status = 'ACCEPTED',
        accepted_at = clock_timestamp(),
        customer_signature_url = 'signed_in_portal',
        updated_at = clock_timestamp()
    WHERE id = p_estimate_id;

    -- Crear orden de trabajo si no existe
    v_job_number := 'JOB-' || to_char(clock_timestamp(), 'YYMM') || '-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0');

    INSERT INTO public.contractor_jobs (
        organization_id,
        estimate_id,
        job_number,
        customer_name,
        customer_phone,
        customer_email,
        job_site_address,
        title,
        description,
        scheduled_start,
        scheduled_end,
        status,
        total_price_cop,
        deposit_paid_cop,
        balance_due_cop
    ) VALUES (
        p_organization_id,
        p_estimate_id,
        v_job_number,
        p_client_name,
        p_client_phone,
        v_est.customer_email,
        v_est.job_site_address,
        v_est.project_title,
        'Approved proposal option: ' || p_proposal_tier,
        clock_timestamp() + INTERVAL '1 day',
        clock_timestamp() + INTERVAL '1 day 8 hours',
        'SCHEDULED',
        p_accepted_total_usd * 4000,
        p_accepted_deposit_usd * 4000,
        (p_accepted_total_usd - p_accepted_deposit_usd) * 4000
    ) RETURNING id INTO v_job_id;

    RETURN jsonb_build_object(
        'success', true,
        'acceptance_id', v_acceptance_id,
        'job_id', v_job_id,
        'job_number', v_job_number,
        'proposal_tier', p_proposal_tier,
        'balance_due_usd', (p_accepted_total_usd - p_accepted_deposit_usd)
    );
END;
$$;

-- RPC 3: submit_change_order_decision
CREATE OR REPLACE FUNCTION public.submit_change_order_decision(
    p_change_order_id UUID,
    p_decision TEXT, -- APPROVED, DECLINED
    p_client_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_co RECORD;
BEGIN
    SELECT * INTO v_co FROM public.contractor_change_orders WHERE id = p_change_order_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Change order % not found', p_change_order_id;
    END IF;

    UPDATE public.contractor_change_orders
    SET status = p_decision,
        client_decision_notes = p_client_notes,
        decided_at = clock_timestamp()
    WHERE id = p_change_order_id;

    -- Si fue aprobada, sumar el valor adicional al saldo de la orden de trabajo
    IF p_decision = 'APPROVED' THEN
        UPDATE public.contractor_jobs
        SET total_price_cop = total_price_cop + (v_co.additional_cost_usd * 4000),
            balance_due_cop = balance_due_cop + (v_co.additional_cost_usd * 4000),
            updated_at = clock_timestamp()
        WHERE id = v_co.job_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'change_order_id', p_change_order_id,
        'status', p_decision,
        'additional_cost_usd', v_co.additional_cost_usd
    );
END;
$$;

-- RPC 4: submit_client_warranty_claim
CREATE OR REPLACE FUNCTION public.submit_client_warranty_claim(
    p_organization_id UUID,
    p_warranty_id UUID,
    p_issue_description TEXT,
    p_urgency_level TEXT DEFAULT 'URGENT'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_claim_id UUID;
    v_claim_number TEXT;
    v_warr RECORD;
BEGIN
    SELECT * INTO v_warr FROM public.contractor_warranties WHERE id = p_warranty_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Warranty % not found', p_warranty_id;
    END IF;

    v_claim_number := 'CLM-' || to_char(clock_timestamp(), 'YYMM') || '-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0');

    INSERT INTO public.contractor_warranty_claims (
        organization_id,
        warranty_id,
        claim_number,
        issue_description,
        urgency_level,
        status
    ) VALUES (
        p_organization_id,
        p_warranty_id,
        v_claim_number,
        p_issue_description,
        p_urgency_level,
        'SUBMITTED'
    ) RETURNING id INTO v_claim_id;

    UPDATE public.contractor_warranties
    SET status = 'CLAIM_IN_PROGRESS'
    WHERE id = p_warranty_id;

    RETURN jsonb_build_object(
        'success', true,
        'claim_id', v_claim_id,
        'claim_number', v_claim_number,
        'status', 'SUBMITTED'
    );
END;
$$;
