-- ====================================================================
-- MIGRACIÓN 038: CENTRO AVANZADO DE INTELIGENCIA EJECUTIVA SEMANAL,
-- RENTABILIDAD VERIFICADA, CAPACIDAD, AUTONOMÍA DEL FUNDADOR Y PLANIFICACIÓN
-- VET-CORE-17 | WEEKLY REPORTING (VET FREEDOM OS)
-- Dirección Médica: Dr. Luis Eduardo Ríos
-- Dirección Estratégica: Alpha Vision Method
-- Fecha: 2026-11-21
-- ====================================================================

-- 1. TABLA MAESTRA: REPORTES SEMANALES
CREATE TABLE IF NOT EXISTS public.executive_weekly_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    week_label VARCHAR(32) NOT NULL, -- Ej: '2026-W47'
    week_start_at TIMESTAMPTZ NOT NULL,
    week_end_exclusive_at TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'America/Bogota',
    current_version_number INT NOT NULL DEFAULT 1,
    quality_status VARCHAR(32) NOT NULL DEFAULT 'VERIFIED',
    report_status VARCHAR(32) NOT NULL DEFAULT 'READY_FOR_ANALYSIS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_exec_weekly_reports_org_week UNIQUE (organization_id, week_label)
);

-- 2. TABLA: VERSIONES HISTÓRICAS INCREMENTALES (v1..vn)
CREATE TABLE IF NOT EXISTS public.executive_weekly_report_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.executive_weekly_reports(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT true,
    trigger_reason VARCHAR(64) NOT NULL DEFAULT 'SCHEDULED_WEEKLY',
    approved_by UUID REFERENCES public.staff_profiles(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_exec_weekly_versions_report_num UNIQUE (report_id, version_number)
);

-- 3. TABLA: SNAPSHOTS SEMANALES INMUTABLES
CREATE TABLE IF NOT EXISTS public.executive_weekly_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    week_label VARCHAR(32) NOT NULL,
    week_start_at TIMESTAMPTZ NOT NULL,
    week_end_exclusive_at TIMESTAMPTZ NOT NULL,
    source_data_cutoff TIMESTAMPTZ NOT NULL,
    metrics_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    one_page_brief TEXT NOT NULL,
    detailed_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
    comparisons_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    trends_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    integrity_hash_sha256 VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABLA: RESULTADOS DE MÉTRICAS Y TAXONOMÍA DE AGREGACIÓN
CREATE TABLE IF NOT EXISTS public.executive_weekly_metric_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    metric_code VARCHAR(64) NOT NULL,
    aggregation_type VARCHAR(32) NOT NULL, -- ADITIVA, CONTEO_UNICO, TASA, PROMEDIO_PONDERADO, STOCK_CORTE, FLUJO, FINANCIERA
    raw_value NUMERIC(14,4),
    formatted_value VARCHAR(128),
    numerator NUMERIC(14,4),
    denominator NUMERIC(14,4),
    quality_status VARCHAR(32) NOT NULL DEFAULT 'VERIFIED',
    warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABLA: ANÁLISIS DE CAPACIDAD Y UTILIZACIÓN DEL EQUIPO
CREATE TABLE IF NOT EXISTS public.executive_capacity_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    active_vets_count INT NOT NULL DEFAULT 0,
    scheduled_shifts_count INT NOT NULL DEFAULT 0,
    total_scheduled_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    protected_break_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    travel_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    clinical_visit_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    admin_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    usable_capacity_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    capacity_utilization_rate NUMERIC(5,2),
    overloaded_vets_count INT NOT NULL DEFAULT 0,
    uncovered_absence_shifts INT NOT NULL DEFAULT 0,
    zone_distribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TABLA: ANÁLISIS DE DEPENDENCIA DEL FUNDADOR Y AUTONOMÍA (WF-075)
CREATE TABLE IF NOT EXISTS public.executive_founder_dependency_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    total_inbound_tasks_to_luis INT NOT NULL DEFAULT 0,
    tasks_required_by_policy INT NOT NULL DEFAULT 0,
    tasks_delegable_proposed INT NOT NULL DEFAULT 0,
    tasks_delegated_and_resolved INT NOT NULL DEFAULT 0,
    automated_processes_completed INT NOT NULL DEFAULT 0,
    pending_decisions_for_luis INT NOT NULL DEFAULT 0,
    operational_bottlenecks_caused_by_absence INT NOT NULL DEFAULT 0,
    operational_autonomy_rate NUMERIC(5,2),
    verified_time_saving_hours NUMERIC(8,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TABLA: ANÁLISIS DE RENTABILIDAD Y COSTOS VERIFICADOS
CREATE TABLE IF NOT EXISTS public.executive_profitability_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    gross_invoiced_cop NUMERIC(14,2) NOT NULL DEFAULT 0,
    collected_verified_cop NUMERIC(14,2) NOT NULL DEFAULT 0,
    collected_reconciled_cop NUMERIC(14,2) NOT NULL DEFAULT 0,
    unverified_pending_cop NUMERIC(14,2) NOT NULL DEFAULT 0,
    direct_medical_supplies_cost_cop NUMERIC(14,2),
    direct_travel_fuel_cost_cop NUMERIC(14,2),
    direct_specialist_fees_cop NUMERIC(14,2),
    total_known_direct_costs_cop NUMERIC(14,2),
    known_indirect_costs_cop NUMERIC(14,2),
    contribution_margin_cop NUMERIC(14,2),
    contribution_margin_pct NUMERIC(5,2),
    net_profit_cop NUMERIC(14,2),
    net_profit_status VARCHAR(32) NOT NULL DEFAULT 'INSUFFICIENT_DATA', -- CALCULATED_VERIFIED, ESTIMATED, INSUFFICIENT_DATA
    missing_cost_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. TABLA: ANÁLISIS DE CONTINUIDAD VETERINARIA (CORE-09..CORE-13)
CREATE TABLE IF NOT EXISTS public.executive_continuity_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    active_recurring_plans INT NOT NULL DEFAULT 0,
    recurring_visits_completed INT NOT NULL DEFAULT 0,
    recurring_missed_sessions INT NOT NULL DEFAULT 0,
    preventive_vaccines_applied INT NOT NULL DEFAULT 0,
    preventive_outdated_records INT NOT NULL DEFAULT 0,
    active_specialist_referrals INT NOT NULL DEFAULT 0,
    specialist_reports_pending INT NOT NULL DEFAULT 0,
    post_visit_commitments_open INT NOT NULL DEFAULT 0,
    post_visit_commitments_overdue INT NOT NULL DEFAULT 0,
    documents_pending_delivery INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. TABLA: CLUSTERS DE PROBLEMAS RECURRENTES
CREATE TABLE IF NOT EXISTS public.executive_recurring_problem_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    cluster_domain VARCHAR(32) NOT NULL,
    problem_title VARCHAR(255) NOT NULL,
    incident_count INT NOT NULL DEFAULT 1,
    evidence_summary TEXT NOT NULL,
    hypothesis_cause TEXT,
    is_verified_cause BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. TABLA: PROPUESTAS DE MEJORA ESTRUCTURAL (VINCULABLES A CORE-07)
CREATE TABLE IF NOT EXISTS public.executive_improvement_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    problem_cluster_id UUID REFERENCES public.executive_recurring_problem_clusters(id),
    proposal_title VARCHAR(255) NOT NULL,
    proposal_description TEXT NOT NULL,
    expected_operational_impact TEXT NOT NULL,
    potential_risks TEXT,
    proposed_assignee_role VARCHAR(64) NOT NULL,
    target_completion_date DATE,
    requires_founder_approval BOOLEAN NOT NULL DEFAULT true,
    approval_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_APPROVAL',
    linked_core07_task_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. TABLA: PLAN DE ACCIÓN SEMANAL
CREATE TABLE IF NOT EXISTS public.executive_weekly_action_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    action_title VARCHAR(255) NOT NULL,
    action_domain VARCHAR(32) NOT NULL,
    assignee_name VARCHAR(128) NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(32) NOT NULL DEFAULT 'PLANNED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. TABLA: DECISIONES SEMANALES RESERVADAS PARA DIRECCIÓN
CREATE TABLE IF NOT EXISTS public.executive_weekly_decision_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    decision_title VARCHAR(255) NOT NULL,
    decision_context TEXT NOT NULL,
    recommended_option TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_DECISION',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. TABLA: DESPACHOS Y ENTREGAS DEL REPORTE (SAFE MODE)
CREATE TABLE IF NOT EXISTS public.executive_weekly_report_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_version_id UUID NOT NULL REFERENCES public.executive_weekly_report_versions(id) ON DELETE CASCADE,
    channel VARCHAR(32) NOT NULL,
    recipient_role VARCHAR(32) NOT NULL DEFAULT 'DIRECTOR',
    send_enabled BOOLEAN NOT NULL DEFAULT false,
    delivery_status VARCHAR(32) NOT NULL DEFAULT 'SIMULATED_SUCCESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. TABLA: AUDITORÍA INMUTABLE DE CONSULTA Y GENERACIÓN SEMANAL
CREATE TABLE IF NOT EXISTS public.executive_weekly_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_name VARCHAR(64) NOT NULL,
    report_version_id UUID,
    user_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- HABILITAR RLS EN TODAS LAS 14 TABLAS
ALTER TABLE public.executive_weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_weekly_report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_weekly_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_weekly_metric_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_capacity_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_founder_dependency_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_profitability_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_continuity_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_recurring_problem_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_improvement_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_weekly_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_weekly_decision_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_weekly_report_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_weekly_audit ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS MULTI-TENANT POR ORGANIZACIÓN
DO $$
BEGIN
    -- 1. executive_weekly_reports
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'executive_weekly_reports' AND policyname = 'weekly_reports_tenant_select') THEN
        CREATE POLICY weekly_reports_tenant_select ON public.executive_weekly_reports
            FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'executive_weekly_reports' AND policyname = 'weekly_reports_director_all') THEN
        CREATE POLICY weekly_reports_director_all ON public.executive_weekly_reports
            FOR ALL USING (organization_id IN (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid() AND (job_title ILIKE '%DIRECTOR%' OR job_title ILIKE '%COORDINATOR%')));
    END IF;

    -- 2. executive_weekly_snapshots
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'executive_weekly_snapshots' AND policyname = 'weekly_snapshots_tenant_select') THEN
        CREATE POLICY weekly_snapshots_tenant_select ON public.executive_weekly_snapshots
            FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'executive_weekly_snapshots' AND policyname = 'weekly_snapshots_director_all') THEN
        CREATE POLICY weekly_snapshots_director_all ON public.executive_weekly_snapshots
            FOR ALL USING (organization_id IN (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid() AND (job_title ILIKE '%DIRECTOR%' OR job_title ILIKE '%COORDINATOR%')));
    END IF;

    -- 3. executive_weekly_audit
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'executive_weekly_audit' AND policyname = 'weekly_audit_tenant_select') THEN
        CREATE POLICY weekly_audit_tenant_select ON public.executive_weekly_audit
            FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid()));
    END IF;

    -- 4. executive_profitability_analyses (Exclusivo Dirección y Finanzas)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'executive_profitability_analyses' AND policyname = 'weekly_profit_director_finance_select') THEN
        CREATE POLICY weekly_profit_director_finance_select ON public.executive_profitability_analyses
            FOR SELECT USING (organization_id IN (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid() AND (job_title ILIKE '%DIRECTOR%' OR job_title ILIKE '%FINANCE%')));
    END IF;
END $$;

-- ====================================================================
-- PROCEDIMIENTOS ALMACENADOS (STORED PROCEDURES) - SECURITY DEFINER
-- ====================================================================

-- 1. RPC: RESOLUCIÓN DEL PERÍODO SEMANAL (LUNES 00:00 A LUNES SIGUIENTE 00:00 EXCLUSIVO)
CREATE OR REPLACE FUNCTION public.resolve_weekly_period(
    p_ref_date DATE DEFAULT CURRENT_DATE,
    p_timezone VARCHAR(64) DEFAULT 'America/Bogota'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_dow INT;
    v_monday DATE;
    v_next_monday DATE;
    v_week_label VARCHAR(32);
    v_start_ts TIMESTAMPTZ;
    v_end_ts TIMESTAMPTZ;
BEGIN
    -- En Postgres DOW va de 0 (domingo) a 6 (sábado)
    v_dow := EXTRACT(DOW FROM p_ref_date);
    IF v_dow = 0 THEN
        -- Si es domingo, el lunes de esa semana fue hace 6 días
        v_monday := p_ref_date - INTERVAL '6 days';
    ELSE
        -- Lunes es p_ref_date - (v_dow - 1)
        v_monday := p_ref_date - (v_dow - 1) * INTERVAL '1 day';
    END IF;
    v_next_monday := v_monday + INTERVAL '7 days';

    v_start_ts := (v_monday::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE p_timezone;
    v_end_ts := (v_next_monday::TEXT || ' 00:00:00')::TIMESTAMP AT TIME ZONE p_timezone;
    v_week_label := TO_CHAR(v_monday, 'IYYY') || '-W' || TO_CHAR(v_monday, 'IW');

    RETURN jsonb_build_object(
        'week_label', v_week_label,
        'week_start_date', v_monday,
        'week_end_date_inclusive', v_next_monday - INTERVAL '1 day',
        'week_start_at', v_start_ts,
        'week_end_exclusive_at', v_end_ts,
        'timezone', p_timezone
    );
END;
$$;

-- 2. RPC: ADVISORY LOCK PESIMISTA PARA GENERACIÓN SEMANAL
CREATE OR REPLACE FUNCTION public.claim_weekly_report_generation(
    p_organization_id UUID,
    p_week_label VARCHAR(32)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lock_key BIGINT;
    v_acquired BOOLEAN;
BEGIN
    v_lock_key := ('x' || substr(md5(p_organization_id::TEXT || ':' || p_week_label), 1, 15))::BIT(64)::BIGINT;
    v_acquired := pg_try_advisory_xact_lock(v_lock_key);

    RETURN jsonb_build_object(
        'acquired', v_acquired,
        'organization_id', p_organization_id,
        'week_label', p_week_label,
        'lock_key', v_lock_key
    );
END;
$$;

-- 3. RPC: EXTRACCIÓN DE MÉTRICAS OPERATIVAS SEMANALES CON CONTEOS ÚNICOS
CREATE OR REPLACE FUNCTION public.get_weekly_operation_metrics(
    p_organization_id UUID,
    p_start_at TIMESTAMPTZ,
    p_end_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_unique_clients INT := 0;
    v_unique_pets INT := 0;
    v_scheduled_count INT := 0;
    v_confirmed_count INT := 0;
    v_cancelled_count INT := 0;
    v_rescheduled_count INT := 0;
    v_completed_visits INT := 0;
    v_closed_clinical_notes INT := 0;
    v_conversion_rate NUMERIC(5,2) := 0;
BEGIN
    -- Conteo único de clientes y mascotas en citas del período
    SELECT 
        COUNT(DISTINCT a.owner_id),
        COUNT(DISTINCT a.pet_id),
        COUNT(*),
        COUNT(*) FILTER (WHERE a.status = 'CONFIRMED'),
        COUNT(*) FILTER (WHERE a.status = 'CANCELLED'),
        COUNT(*) FILTER (WHERE a.status = 'RESCHEDULED')
    INTO 
        v_unique_clients,
        v_unique_pets,
        v_scheduled_count,
        v_confirmed_count,
        v_cancelled_count,
        v_rescheduled_count
    FROM public.appointments a
    WHERE a.organization_id = p_organization_id
      AND a.scheduled_start_at >= p_start_at
      AND a.scheduled_start_at < p_end_at;

    -- Conteo de visitas completadas y cierres en OKVET
    SELECT 
        COUNT(*) FILTER (WHERE v.check_out_at IS NOT NULL),
        COUNT(*) FILTER (WHERE v.okvet_clinical_record_id IS NOT NULL)
    INTO 
        v_completed_visits,
        v_closed_clinical_notes
    FROM public.visits v
    WHERE v.organization_id = p_organization_id
      AND v.created_at >= p_start_at
      AND v.created_at < p_end_at;

    IF v_scheduled_count > 0 THEN
        v_conversion_rate := ROUND((v_confirmed_count::NUMERIC / v_scheduled_count::NUMERIC) * 100, 2);
    END IF;

    RETURN jsonb_build_object(
        'unique_clients_count', v_unique_clients,
        'unique_pets_count', v_unique_pets,
        'scheduled_appointments_count', v_scheduled_count,
        'confirmed_appointments_count', v_confirmed_count,
        'cancelled_appointments_count', v_cancelled_count,
        'rescheduled_appointments_count', v_rescheduled_count,
        'completed_visits_count', v_completed_visits,
        'closed_clinical_notes_count', v_closed_clinical_notes,
        'conversion_rate_pct', v_conversion_rate,
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 4. RPC: EXTRACCIÓN DE CAPACIDAD Y UTILIZACIÓN SEMANAL
CREATE OR REPLACE FUNCTION public.get_weekly_capacity_metrics(
    p_organization_id UUID,
    p_start_at TIMESTAMPTZ,
    p_end_at TIMESTAMPTZ
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_active_vets INT := 0;
    v_absences INT := 0;
    v_uncovered INT := 0;
    v_routes INT := 0;
    v_delays INT := 0;
    v_total_visits INT := 0;
    v_usable_hours NUMERIC(8,2) := 0;
    v_clinical_hours NUMERIC(8,2) := 0;
    v_utilization_rate NUMERIC(5,2) := 0;
BEGIN
    SELECT COUNT(*) INTO v_active_vets
    FROM public.staff_profiles
    WHERE organization_id = p_organization_id AND is_active = true;

    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE is_covered = false)
    INTO 
        v_absences,
        v_uncovered
    FROM public.staff_absences
    WHERE organization_id = p_organization_id
      AND absence_date >= p_start_at::DATE
      AND absence_date < p_end_at::DATE;

    SELECT 
        COUNT(*),
        COALESCE(SUM(delays_count), 0)
    INTO 
        v_routes,
        v_delays
    FROM public.routes
    WHERE organization_id = p_organization_id
      AND route_date >= p_start_at::DATE
      AND route_date < p_end_at::DATE;

    SELECT COUNT(*) INTO v_total_visits
    FROM public.visits
    WHERE organization_id = p_organization_id
      AND created_at >= p_start_at
      AND created_at < p_end_at
      AND check_out_at IS NOT NULL;

    -- Estimación de capacidad: 40 horas utilizables por médico activo menos ausencias
    v_usable_hours := GREATEST(0, (v_active_vets * 40.0) - (v_uncovered * 8.0));
    v_clinical_hours := v_total_visits * 1.5; -- Promedio 1.5h por atención domiciliaria
    IF v_usable_hours > 0 THEN
        v_utilization_rate := LEAST(100.0, ROUND((v_clinical_hours / v_usable_hours) * 100, 2));
    END IF;

    RETURN jsonb_build_object(
        'active_vets_count', v_active_vets,
        'absences_count', v_absences,
        'uncovered_absence_shifts', v_uncovered,
        'routes_count', v_routes,
        'delays_count', v_delays,
        'usable_capacity_hours', v_usable_hours,
        'clinical_visit_hours', v_clinical_hours,
        'capacity_utilization_rate', v_utilization_rate,
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 5. RPC: EXTRACCIÓN FINANCIERA SEMANAL CON PROTOCOLO NULL != 0
CREATE OR REPLACE FUNCTION public.get_weekly_financial_metrics(
    p_organization_id UUID,
    p_start_at TIMESTAMPTZ,
    p_end_at TIMESTAMPTZ,
    p_source_available BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_verified_cop NUMERIC(14,2) := 0;
    v_unverified_cop NUMERIC(14,2) := 0;
    v_reconciled_cop NUMERIC(14,2) := 0;
BEGIN
    IF NOT p_source_available THEN
        RETURN jsonb_build_object(
            'collected_verified_cop', NULL,
            'collected_reconciled_cop', NULL,
            'unverified_pending_cop', NULL,
            'quality_status', 'SOURCE_UNAVAILABLE',
            'warning', 'Pasarela de pagos o extracto bancario no disponible durante la agregación semanal'
        );
    END IF;

    SELECT 
        COALESCE(SUM(amount) FILTER (WHERE status = 'PAID_VERIFIED'), 0),
        COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING_VERIFICATION'), 0),
        COALESCE(SUM(amount) FILTER (WHERE status = 'RECONCILED'), 0)
    INTO 
        v_verified_cop,
        v_unverified_cop,
        v_reconciled_cop
    FROM public.financial_payment_transactions
    WHERE organization_id = p_organization_id
      AND transaction_date >= p_start_at
      AND transaction_date < p_end_at;

    RETURN jsonb_build_object(
        'collected_verified_cop', v_verified_cop,
        'collected_reconciled_cop', v_reconciled_cop,
        'unverified_pending_cop', v_unverified_cop,
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 6. RPC: REGISTRO DE AUDITORÍA SEMANAL
CREATE OR REPLACE FUNCTION public.record_weekly_report_audit(
    p_organization_id UUID,
    p_event_name VARCHAR(64),
    p_report_version_id UUID,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO public.executive_weekly_audit (
        organization_id,
        event_name,
        report_version_id,
        user_id,
        metadata
    ) VALUES (
        p_organization_id,
        p_event_name,
        p_report_version_id,
        auth.uid(),
        p_metadata
    ) RETURNING id INTO v_audit_id;

    RETURN v_audit_id;
END;
$$;

-- REVOCAR PERMISOS PÚBLICOS DE SEGURIDAD
REVOKE EXECUTE ON FUNCTION public.resolve_weekly_period FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_weekly_report_generation FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_weekly_operation_metrics FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_weekly_capacity_metrics FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_weekly_financial_metrics FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_weekly_report_audit FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.resolve_weekly_period TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_weekly_report_generation TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_weekly_operation_metrics TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_weekly_capacity_metrics TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_weekly_financial_metrics TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_weekly_report_audit TO authenticated, service_role;
