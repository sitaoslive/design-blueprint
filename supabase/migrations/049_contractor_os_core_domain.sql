-- ============================================================================
-- MIGRATION 049: CONTRACTOR OS — CORE FIELD-SERVICE DOMAIN & RLS POLICIES
-- Multi-Tenant Schema for Trade & Field Services (HVAC, Plumbing, Electrical,
-- Roofing, Painting, Landscaping, Remodeling)
--
-- Features Covered:
--   FEAT-CONT-CRM-001   (Leads & Qualification Engine)
--   FEAT-CONT-EST-001   (Estimates & Digital Quotations)
--   FEAT-CONT-DISP-001  (Crews & Dispatch Scheduling)
--   FEAT-CONT-JOB-001   (Work Orders & Before/After Photo Vault)
--   FEAT-CONT-INVC-001  (Progressive Invoicing & Job Collections)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLA: contractor_leads (Prospectos y Calificación de Obras)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_number TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    service_type TEXT NOT NULL, -- HVAC, PLUMBING, ELECTRICAL, ROOFING, PAINTING, LANDSCAPING, GENERAL_REMODEL
    urgency_level TEXT NOT NULL DEFAULT 'STANDARD', -- EMERGENCY, URGENT, STANDARD, FLEXIBLE
    project_address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Medellín',
    postal_code TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    estimated_budget_cop NUMERIC(14, 2),
    pipeline_stage TEXT NOT NULL DEFAULT 'NEW', -- NEW, CONTACTED, ESTIMATE_SCHEDULED, PROPOSAL_SENT, WON, LOST, ARCHIVED
    lead_score INTEGER NOT NULL DEFAULT 50 CHECK (lead_score >= 0 AND lead_score <= 100),
    lead_source TEXT NOT NULL DEFAULT 'WEBSITE', -- WEBSITE, WHATSAPP, GOOGLE_LSA, REFERRAL, PHONE
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_leads_org_stage ON public.contractor_leads (organization_id, pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_contractor_leads_phone ON public.contractor_leads (phone);

-- ----------------------------------------------------------------------------
-- 2. TABLA: contractor_lead_interactions (Historial de Contacto e IA)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_lead_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES public.contractor_leads(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- WHATSAPP, SMS, PHONE_CALL, EMAIL, IN_PERSON
    direction TEXT NOT NULL, -- INBOUND, OUTBOUND
    summary TEXT NOT NULL,
    raw_message TEXT,
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_lead_interact_lead ON public.contractor_lead_interactions (lead_id);

-- ----------------------------------------------------------------------------
-- 3. TABLA: contractor_estimates (Presupuestos y Cotizaciones Digitales)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES public.contractor_leads(id) ON DELETE SET NULL,
    estimate_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    job_site_address TEXT NOT NULL,
    project_title TEXT NOT NULL,
    scope_of_work TEXT NOT NULL,
    subtotal_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    materials_cost_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    labor_cost_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    markup_percent NUMERIC(5, 2) NOT NULL DEFAULT 20.00,
    tax_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'DRAFT', -- DRAFT, SENT, VIEWED, ACCEPTED, REJECTED, EXPIRED
    sent_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    customer_signature_url TEXT,
    valid_until TIMESTAMPTZ NOT NULL DEFAULT (clock_timestamp() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_estimates_org_status ON public.contractor_estimates (organization_id, status);

-- ----------------------------------------------------------------------------
-- 4. TABLA: contractor_estimate_items (Partidas de Materiales y Mano de Obra)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_estimate_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estimate_id UUID NOT NULL REFERENCES public.contractor_estimates(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL DEFAULT 'MATERIAL', -- MATERIAL, LABOR, EQUIPMENT, PERMIT, SUBCONTRACT
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    unit_of_measure TEXT NOT NULL DEFAULT 'UNIT', -- UNIT, HOUR, SQ_METER, LINEAR_METER, LOT
    unit_cost_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_est_items_est ON public.contractor_estimate_items (estimate_id);

-- ----------------------------------------------------------------------------
-- 5. TABLA: contractor_crews (Cuadrillas y Técnicos de Campo)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    crew_name TEXT NOT NULL,
    trade_specialty TEXT NOT NULL, -- HVAC, PLUMBING, ELECTRICAL, ROOFING, GENERAL
    lead_technician_name TEXT NOT NULL,
    lead_technician_phone TEXT NOT NULL,
    vehicle_plate TEXT,
    color_code TEXT NOT NULL DEFAULT '#3B82F6',
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_crews_org ON public.contractor_crews (organization_id, is_active);

-- ----------------------------------------------------------------------------
-- 6. TABLA: contractor_jobs (Órdenes de Trabajo y Proyectos en Curso)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    estimate_id UUID REFERENCES public.contractor_estimates(id) ON DELETE SET NULL,
    lead_id REFERENCES public.contractor_leads(id) ON DELETE SET NULL,
    crew_id UUID REFERENCES public.contractor_crews(id) ON DELETE SET NULL,
    job_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    job_site_address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, DISPATCHED, EN_ROUTE, ON_SITE, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED
    total_price_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    deposit_paid_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    balance_due_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    safety_checklist_completed BOOLEAN NOT NULL DEFAULT false,
    completion_signature_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_jobs_org_status ON public.contractor_jobs (organization_id, status);
CREATE INDEX IF NOT EXISTS idx_contractor_jobs_crew_schedule ON public.contractor_jobs (crew_id, scheduled_start);

-- ----------------------------------------------------------------------------
-- 7. TABLA: contractor_job_photos (Bóveda de Evidencia Fotográfica Antes/Después)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_job_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.contractor_jobs(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    photo_type TEXT NOT NULL, -- BEFORE, DURING, AFTER, ISSUE_FOUND, CHANGE_ORDER_EVIDENCE
    storage_path TEXT NOT NULL,
    caption TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    taken_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_job_photos_job ON public.contractor_job_photos (job_id, photo_type);

-- ----------------------------------------------------------------------------
-- 8. TABLA: contractor_invoices (Facturación Progresiva de Obras)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contractor_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.contractor_jobs(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    milestone_label TEXT NOT NULL DEFAULT 'FINAL', -- INITIAL_DEPOSIT_50, PROGRESS_25, FINAL_BALANCE_25, FULL_LUMP_SUM
    amount_cop NUMERIC(14, 2) NOT NULL,
    tax_cop NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_cop NUMERIC(14, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'ISSUED', -- ISSUED, PAID, OVERDUE, VOID
    due_date TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    payment_method TEXT, -- WOMPI, STRIPE, NEQUI, BANCOLOMBIA, CASH, CARD_TERMINAL
    payment_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_contractor_invoices_org_status ON public.contractor_invoices (organization_id, status);

-- ----------------------------------------------------------------------------
-- 9. RPCs SEGURAS DE DOMINIO PARA CONTRACTOR OS
-- ----------------------------------------------------------------------------

-- Ingesta de Lead
CREATE OR REPLACE FUNCTION public.create_contractor_lead(
    p_organization_id UUID,
    p_contact_name TEXT,
    p_phone TEXT,
    p_service_type TEXT,
    p_project_address TEXT,
    p_email TEXT DEFAULT NULL,
    p_urgency_level TEXT DEFAULT 'STANDARD',
    p_estimated_budget_cop NUMERIC DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_lead_id UUID;
    v_lead_number TEXT;
    v_result JSONB;
BEGIN
    -- Validar que la organización tenga suscripción a contractor-os
    IF NOT EXISTS (
        SELECT 1 FROM public.saas_licenses
        WHERE organization_id = p_organization_id
          AND product_id = 'contractor-os'
          AND status IN ('ACTIVE', 'TRIAL')
    ) THEN
        -- Si no existe licencia explícita, verificar pertenencia a organización
        IF NOT EXISTS (
            SELECT 1 FROM public.organizations WHERE id = p_organization_id
        ) THEN
            RAISE EXCEPTION 'Organización % no válida para Contractor OS', p_organization_id;
        END IF;
    END IF;

    -- Generar consecutivo amigable
    v_lead_number := 'LEAD-' || to_char(clock_timestamp(), 'YYMM') || '-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0');

    INSERT INTO public.contractor_leads (
        organization_id,
        lead_number,
        contact_name,
        phone,
        email,
        service_type,
        urgency_level,
        project_address,
        estimated_budget_cop,
        notes
    ) VALUES (
        p_organization_id,
        v_lead_number,
        p_contact_name,
        p_phone,
        p_email,
        p_service_type,
        p_urgency_level,
        p_project_address,
        p_estimated_budget_cop,
        p_notes
    )
    RETURNING id INTO v_lead_id;

    -- Registrar interacción inicial
    INSERT INTO public.contractor_lead_interactions (
        lead_id,
        organization_id,
        channel,
        direction,
        summary
    ) VALUES (
        v_lead_id,
        p_organization_id,
        'WEBSITE',
        'INBOUND',
        'Prospecto registrado vía formulario web / portal de contratistas'
    );

    SELECT jsonb_build_object(
        'success', true,
        'lead_id', v_lead_id,
        'lead_number', v_lead_number,
        'contact_name', p_contact_name,
        'service_type', p_service_type
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Conversión de Presupuesto Aceptado a Orden de Trabajo (Job)
CREATE OR REPLACE FUNCTION public.convert_estimate_to_job(
    p_estimate_id UUID,
    p_scheduled_start TIMESTAMPTZ,
    p_scheduled_end TIMESTAMPTZ,
    p_crew_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_est RECORD;
    v_job_id UUID;
    v_job_number TEXT;
    v_deposit NUMERIC(14, 2);
    v_balance NUMERIC(14, 2);
    v_result JSONB;
BEGIN
    SELECT * INTO v_est
    FROM public.contractor_estimates
    WHERE id = p_estimate_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Presupuesto % no encontrado', p_estimate_id;
    END IF;

    -- Marcar estimado como aceptado
    UPDATE public.contractor_estimates
    SET status = 'ACCEPTED',
        accepted_at = clock_timestamp(),
        updated_at = clock_timestamp()
    WHERE id = p_estimate_id;

    -- Generar consecutivo de trabajo
    v_job_number := 'JOB-' || to_char(clock_timestamp(), 'YYMM') || '-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0');
    v_deposit := round(v_est.total_cop * 0.50, 2); -- 50% anticipo nominal
    v_balance := v_est.total_cop - v_deposit;

    INSERT INTO public.contractor_jobs (
        organization_id,
        estimate_id,
        lead_id,
        crew_id,
        job_number,
        customer_name,
        customer_phone,
        customer_email,
        job_site_address,
        title,
        description,
        scheduled_start,
        scheduled_end,
        total_price_cop,
        deposit_paid_cop,
        balance_due_cop,
        status
    ) VALUES (
        v_est.organization_id,
        v_est.id,
        v_est.lead_id,
        p_crew_id,
        v_job_number,
        v_est.customer_name,
        v_est.customer_phone,
        v_est.customer_email,
        v_est.job_site_address,
        v_est.project_title,
        v_est.scope_of_work,
        p_scheduled_start,
        p_scheduled_end,
        v_est.total_cop,
        0.00,
        v_est.total_cop,
        'SCHEDULED'
    )
    RETURNING id INTO v_job_id;

    -- Emitir factura de anticipo del 50%
    INSERT INTO public.contractor_invoices (
        organization_id,
        job_id,
        invoice_number,
        customer_name,
        customer_email,
        customer_phone,
        milestone_label,
        amount_cop,
        tax_cop,
        total_cop,
        status,
        due_date
    ) VALUES (
        v_est.organization_id,
        v_job_id,
        'INV-' || to_char(clock_timestamp(), 'YYMM') || '-DEP-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0'),
        v_est.customer_name,
        v_est.customer_email,
        v_est.customer_phone,
        'INITIAL_DEPOSIT_50',
        v_deposit,
        0.00,
        v_deposit,
        'ISSUED',
        clock_timestamp() + INTERVAL '3 days'
    );

    SELECT jsonb_build_object(
        'success', true,
        'job_id', v_job_id,
        'job_number', v_job_number,
        'total_price_cop', v_est.total_cop,
        'initial_deposit_cop', v_deposit
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- Consulta de Métricas de Contractor OS
CREATE OR REPLACE FUNCTION public.get_contractor_dashboard_kpis(
    p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_new_leads BIGINT;
    v_active_jobs BIGINT;
    v_pending_invoices_cop NUMERIC(14, 2);
    v_collected_month_cop NUMERIC(14, 2);
    v_result JSONB;
BEGIN
    SELECT count(*) INTO v_new_leads
    FROM public.contractor_leads
    WHERE organization_id = p_organization_id
      AND pipeline_stage IN ('NEW', 'CONTACTED', 'ESTIMATE_SCHEDULED');

    SELECT count(*) INTO v_active_jobs
    FROM public.contractor_jobs
    WHERE organization_id = p_organization_id
      AND status IN ('SCHEDULED', 'DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS');

    SELECT coalesce(sum(total_cop), 0.00) INTO v_pending_invoices_cop
    FROM public.contractor_invoices
    WHERE organization_id = p_organization_id
      AND status = 'ISSUED';

    SELECT coalesce(sum(total_cop), 0.00) INTO v_collected_month_cop
    FROM public.contractor_invoices
    WHERE organization_id = p_organization_id
      AND status = 'PAID'
      AND paid_at >= date_trunc('month', clock_timestamp());

    SELECT jsonb_build_object(
        'new_leads_count', v_new_leads,
        'active_jobs_count', v_active_jobs,
        'pending_receivables_cop', v_pending_invoices_cop,
        'collected_month_cop', v_collected_month_cop
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- ----------------------------------------------------------------------------
-- 10. HABILITACIÓN DE ROW LEVEL SECURITY (100% RLS OBLIGATORIO)
-- ----------------------------------------------------------------------------

ALTER TABLE public.contractor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_crews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_invoices ENABLE ROW LEVEL SECURITY;

-- Políticas de Aislamiento Multi-Tenant para cada tabla
CREATE POLICY p_contractor_leads_tenant_isolation ON public.contractor_leads
    FOR ALL
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY p_contractor_lead_interactions_tenant_isolation ON public.contractor_lead_interactions
    FOR ALL
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY p_contractor_estimates_tenant_isolation ON public.contractor_estimates
    FOR ALL
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY p_contractor_estimate_items_tenant_isolation ON public.contractor_estimate_items
    FOR ALL
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY p_contractor_crews_tenant_isolation ON public.contractor_crews
    FOR ALL
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY p_contractor_jobs_tenant_isolation ON public.contractor_jobs
    FOR ALL
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY p_contractor_job_photos_tenant_isolation ON public.contractor_job_photos
    FOR ALL
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY p_contractor_invoices_tenant_isolation ON public.contractor_invoices
    FOR ALL
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid()
        )
    );

-- Acceso total e irrestricto para Service Role (Workers n8n, Background Dispatchers)
CREATE POLICY p_contractor_leads_service_role ON public.contractor_leads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY p_contractor_lead_interactions_service_role ON public.contractor_lead_interactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY p_contractor_estimates_service_role ON public.contractor_estimates FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY p_contractor_estimate_items_service_role ON public.contractor_estimate_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY p_contractor_crews_service_role ON public.contractor_crews FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY p_contractor_jobs_service_role ON public.contractor_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY p_contractor_job_photos_service_role ON public.contractor_job_photos FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY p_contractor_invoices_service_role ON public.contractor_invoices FOR ALL TO service_role USING (true) WITH CHECK (true);
