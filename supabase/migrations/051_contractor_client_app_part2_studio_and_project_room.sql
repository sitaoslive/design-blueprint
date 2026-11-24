-- ============================================================================
-- MIGRATION 051: ALPHA SERVICE OS — CLIENT APP PART 2
-- THE ULTIMATE CONTRACTOR CUSTOMER EXPERIENCE, SALES CONVERSION & WHITE-LABEL ENGINE
-- ============================================================================

-- 1. CONFIGURACIÓN DEL APP STUDIO (Customer Experience -> App Studio)
CREATE TABLE IF NOT EXISTS public.contractor_app_studio_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    design_collection VARCHAR(50) NOT NULL DEFAULT 'COPPER_CRAFTED',
    brand_logo_url TEXT,
    company_display_name VARCHAR(150),
    primary_color VARCHAR(20) DEFAULT '#f59e0b',
    secondary_color VARCHAR(20) DEFAULT '#0f172a',
    accent_color VARCHAR(20) DEFAULT '#10b981',
    welcome_headline TEXT DEFAULT 'Everything about your property services, beautifully organized in one place.',
    enabled_widgets JSONB NOT NULL DEFAULT '{
        "booking": true,
        "estimates": true,
        "invoices": true,
        "project_room": true,
        "property_passport": true,
        "care_calendar": true,
        "referrals": true,
        "ai_concierge": true,
        "commercial_mode": true
    }'::jsonb,
    ai_concierge_tone VARCHAR(30) NOT NULL DEFAULT 'PROFESSIONAL_HELPFUL',
    referral_reward_type VARCHAR(30) NOT NULL DEFAULT 'SERVICE_CREDIT',
    referral_reward_value NUMERIC(10,2) NOT NULL DEFAULT 50.00,
    published_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contractor_app_studio_org UNIQUE (organization_id)
);

-- 2. MY PROJECT ROOM (Salas de Proyecto Dedicadas para Obras Mayores)
CREATE TABLE IF NOT EXISTS public.contractor_project_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.contractor_jobs(id) ON DELETE SET NULL,
    property_id UUID REFERENCES public.contractor_client_properties(id) ON DELETE SET NULL,
    customer_id VARCHAR(100) NOT NULL,
    project_title TEXT NOT NULL,
    project_type VARCHAR(50) NOT NULL DEFAULT 'COMMERCIAL_HVAC',
    current_stage VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    contractor_lead_name VARCHAR(150) DEFAULT 'Carlos Mario Henao',
    contractor_lead_phone VARCHAR(50) DEFAULT '+1 (305) 555-8877',
    target_completion_date DATE,
    total_budget_usd NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    approved_scope_summary TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. HITOS DE PROYECTO (12 Hitos Secuenciales de la Línea de Tiempo de Obra)
CREATE TABLE IF NOT EXISTS public.contractor_project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_room_id UUID NOT NULL REFERENCES public.contractor_project_rooms(id) ON DELETE CASCADE,
    milestone_index INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED')),
    target_date DATE,
    completed_at TIMESTAMPTZ,
    client_notes TEXT,
    photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. MY PROPERTY CARE CALENDAR (Calendario Anual Visual de Cuidado del Hogar y Predios)
CREATE TABLE IF NOT EXISTS public.contractor_property_care_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES public.contractor_client_properties(id) ON DELETE CASCADE,
    trade_category VARCHAR(50) NOT NULL DEFAULT 'HVAC',
    title VARCHAR(150) NOT NULL,
    frequency VARCHAR(30) NOT NULL DEFAULT 'SEASONAL_SPRING',
    due_month VARCHAR(20) NOT NULL,
    is_covered_by_plan BOOLEAN NOT NULL DEFAULT FALSE,
    last_performed_at DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED', 'OVERDUE', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PROGRAMA DE REFERIDOS Y RECOMENDACIÓN (Referral & Recommendation Engine)
CREATE TABLE IF NOT EXISTS public.contractor_referral_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    program_name VARCHAR(150) NOT NULL DEFAULT 'Client VIP Referral Network',
    referrer_reward_usd NUMERIC(10,2) NOT NULL DEFAULT 50.00,
    referee_discount_usd NUMERIC(10,2) NOT NULL DEFAULT 25.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contractor_referral_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    referrer_customer_id VARCHAR(100) NOT NULL,
    referral_code VARCHAR(50) NOT NULL,
    referred_contact_name VARCHAR(150),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'QUALIFIED_INQUIRY', 'BOOKED_JOB', 'COMPLETED_PAID', 'REWARD_ISSUED')),
    reward_amount_usd NUMERIC(10,2) NOT NULL DEFAULT 50.00,
    reward_issued_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CUENTAS COMERCIALES Y GESTORES DE PROPIEDADES (Commercial Mode)
CREATE TABLE IF NOT EXISTS public.contractor_commercial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    spending_limit_usd NUMERIC(12,2) NOT NULL DEFAULT 10000.00,
    primary_contact_name VARCHAR(150),
    primary_contact_email VARCHAR(150),
    payment_terms_days INTEGER NOT NULL DEFAULT 30,
    requires_po_number BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TABLERO DE IMPACTO EN EL NEGOCIO (Contractor Value Dashboard / ROI)
CREATE TABLE IF NOT EXISTS public.contractor_business_impact_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    inquiries_captured INTEGER NOT NULL DEFAULT 0,
    bookings_completed INTEGER NOT NULL DEFAULT 0,
    estimates_approved INTEGER NOT NULL DEFAULT 0,
    online_payments_collected_usd NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    repeat_bookings_retained INTEGER NOT NULL DEFAULT 0,
    self_service_actions_completed INTEGER NOT NULL DEFAULT 0,
    estimated_admin_hours_saved NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_contractor_impact_org_date UNIQUE (organization_id, snapshot_date)
);

-- 8. TAREAS DE CONVERSACIÓN A ACCIÓN (Conversation-to-Action Intelligence)
CREATE TABLE IF NOT EXISTS public.contractor_conversation_action_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    customer_id VARCHAR(100) NOT NULL,
    intent_detected VARCHAR(50) NOT NULL,
    action_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'CONFIRMED', 'EXECUTED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. HABILITACIÓN DE RLS Y POLÍTICAS DE AISLAMIENTO MULTI-TENANT
-- ============================================================================

ALTER TABLE public.contractor_app_studio_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_project_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_property_care_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_referral_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_referral_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_commercial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_business_impact_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_conversation_action_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_contractor_studio_tenant ON public.contractor_app_studio_configs;
CREATE POLICY p_contractor_studio_tenant ON public.contractor_app_studio_configs
    FOR ALL USING (organization_id = (SELECT public.current_user_org_id()));

DROP POLICY IF EXISTS p_contractor_proj_rooms_tenant ON public.contractor_project_rooms;
CREATE POLICY p_contractor_proj_rooms_tenant ON public.contractor_project_rooms
    FOR ALL USING (organization_id = (SELECT public.current_user_org_id()));

DROP POLICY IF EXISTS p_contractor_proj_milestones_tenant ON public.contractor_project_milestones;
CREATE POLICY p_contractor_proj_milestones_tenant ON public.contractor_project_milestones
    FOR ALL USING (organization_id = (SELECT public.current_user_org_id()));

DROP POLICY IF EXISTS p_contractor_care_entries_tenant ON public.contractor_property_care_entries;
CREATE POLICY p_contractor_care_entries_tenant ON public.contractor_property_care_entries
    FOR ALL USING (organization_id = (SELECT public.current_user_org_id()));

DROP POLICY IF EXISTS p_contractor_referral_prog_tenant ON public.contractor_referral_programs;
CREATE POLICY p_contractor_referral_prog_tenant ON public.contractor_referral_programs
    FOR ALL USING (organization_id = (SELECT public.current_user_org_id()));

DROP POLICY IF EXISTS p_contractor_referral_rec_tenant ON public.contractor_referral_records;
CREATE POLICY p_contractor_referral_rec_tenant ON public.contractor_referral_records
    FOR ALL USING (organization_id = (SELECT public.current_user_org_id()));

DROP POLICY IF EXISTS p_contractor_comm_acc_tenant ON public.contractor_commercial_accounts;
CREATE POLICY p_contractor_comm_acc_tenant ON public.contractor_commercial_accounts
    FOR ALL USING (organization_id = (SELECT public.current_user_org_id()));

DROP POLICY IF EXISTS p_contractor_impact_tenant ON public.contractor_business_impact_snapshots;
CREATE POLICY p_contractor_impact_tenant ON public.contractor_business_impact_snapshots
    FOR ALL USING (organization_id = (SELECT public.current_user_org_id()));

DROP POLICY IF EXISTS p_contractor_conv_actions_tenant ON public.contractor_conversation_action_tasks;
CREATE POLICY p_contractor_conv_actions_tenant ON public.contractor_conversation_action_tasks
    FOR ALL USING (organization_id = (SELECT public.current_user_org_id()));

-- ============================================================================
-- 10. RPCs DE DOMINIO Y GESTIÓN
-- ============================================================================

-- RPC 1: Actualizar o Publicar Configuración del App Studio
CREATE OR REPLACE FUNCTION public.save_contractor_app_studio_config(
    p_organization_id UUID,
    p_design_collection VARCHAR(50),
    p_company_display_name VARCHAR(150),
    p_primary_color VARCHAR(20),
    p_welcome_headline TEXT,
    p_enabled_widgets JSONB,
    p_ai_tone VARCHAR(30)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rec RECORD;
BEGIN
    INSERT INTO public.contractor_app_studio_configs (
        organization_id,
        design_collection,
        company_display_name,
        primary_color,
        welcome_headline,
        enabled_widgets,
        ai_concierge_tone,
        published_version,
        updated_at
    )
    VALUES (
        p_organization_id,
        p_design_collection,
        p_company_display_name,
        p_primary_color,
        p_welcome_headline,
        p_enabled_widgets,
        p_ai_tone,
        1,
        NOW()
    )
    ON CONFLICT (organization_id) DO UPDATE SET
        design_collection = EXCLUDED.design_collection,
        company_display_name = EXCLUDED.company_display_name,
        primary_color = EXCLUDED.primary_color,
        welcome_headline = EXCLUDED.welcome_headline,
        enabled_widgets = EXCLUDED.enabled_widgets,
        ai_concierge_tone = EXCLUDED.ai_concierge_tone,
        published_version = contractor_app_studio_configs.published_version + 1,
        updated_at = NOW()
    RETURNING * INTO v_rec;

    RETURN jsonb_build_object(
        'success', true,
        'organization_id', v_rec.organization_id,
        'published_version', v_rec.published_version,
        'design_collection', v_rec.design_collection
    );
END;
$$;

-- RPC 2: Generar Código de Referidos Único y Seguro
CREATE OR REPLACE FUNCTION public.create_client_referral_link(
    p_organization_id UUID,
    p_referrer_customer_id VARCHAR(100),
    p_contact_name VARCHAR(150)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code VARCHAR(50);
    v_id UUID;
BEGIN
    v_code := 'REF-' || UPPER(SUBSTRING(MD5(p_referrer_customer_id || NOW()::TEXT) FROM 1 FOR 6));
    
    INSERT INTO public.contractor_referral_records (
        organization_id,
        referrer_customer_id,
        referral_code,
        referred_contact_name,
        status,
        reward_amount_usd
    )
    VALUES (
        p_organization_id,
        p_referrer_customer_id,
        v_code,
        p_contact_name,
        'PENDING',
        50.00
    )
    RETURNING id INTO v_id;

    RETURN jsonb_build_object(
        'success', true,
        'referral_id', v_id,
        'referral_code', v_code,
        'share_url', 'https://alphavisionm.com/book?ref=' || v_code
    );
END;
$$;

-- RPC 3: Obtener Métricas de Impacto Comercial (ROI Dashboard)
CREATE OR REPLACE FUNCTION public.get_contractor_business_impact(
    p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_inquiries INTEGER;
    v_bookings INTEGER;
    v_estimates_approved INTEGER;
    v_payments NUMERIC(12,2);
    v_self_service INTEGER;
    v_admin_hours NUMERIC(6,2);
BEGIN
    -- Métrica de prospectos capturados
    SELECT COUNT(*) INTO v_inquiries
    FROM public.contractor_leads
    WHERE organization_id = p_organization_id;

    -- Obras activas o completadas
    SELECT COUNT(*) INTO v_bookings
    FROM public.contractor_jobs
    WHERE organization_id = p_organization_id;

    -- Propuestas aceptadas
    SELECT COUNT(*) INTO v_estimates_approved
    FROM public.contractor_proposals
    WHERE organization_id = p_organization_id AND status = 'ACCEPTED';

    -- Pagos en línea verificados
    SELECT COALESCE(SUM(total_amount_usd), 0) INTO v_payments
    FROM public.contractor_invoices
    WHERE organization_id = p_organization_id AND payment_status = 'PAID';

    -- Acciones de autoservicio
    v_self_service := (v_inquiries * 2) + v_estimates_approved + v_bookings;
    v_admin_hours := ROUND(v_self_service * 0.35, 1); -- ~21 mins de tiempo administrativo ahorrado por trámite

    RETURN jsonb_build_object(
        'organization_id', p_organization_id,
        'inquiries_captured', v_inquiries,
        'bookings_completed', v_bookings,
        'estimates_approved', v_estimates_approved,
        'online_payments_collected_usd', v_payments,
        'self_service_actions_completed', v_self_service,
        'estimated_admin_hours_saved', v_admin_hours
    );
END;
$$;
