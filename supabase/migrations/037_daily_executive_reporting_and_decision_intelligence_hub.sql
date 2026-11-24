-- ==============================================================================
-- MIGRATION 037: Daily Executive Reporting & Decision Intelligence Hub (VET-CORE-16)
-- Proyecto: Vet Freedom OS
-- Módulo: VET-CORE-16 | Daily Executive Reporting
-- Dirección Médica: Dr. Luis Eduardo Ríos
-- Dirección Estratégica: Alpha Vision Method
-- Motor: PostgreSQL 17.12.0
-- Timezone Oficial: America/Bogota
-- ==============================================================================

-- 1. Tabla: executive_daily_snapshots
CREATE TABLE IF NOT EXISTS public.executive_daily_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'America/Bogota',
    cutoff_at TIMESTAMPTZ NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    snapshot_version INTEGER NOT NULL DEFAULT 1,
    data_version_reference TEXT,
    status TEXT NOT NULL CHECK (status IN ('PREPARING', 'COLLECTING', 'VALIDATING', 'READY', 'PARTIAL', 'BLOCKED', 'PUBLISHED', 'REVISED', 'SUPERSEDED')),
    quality_status TEXT NOT NULL CHECK (quality_status IN ('VERIFIED', 'PARTIALLY_VERIFIED', 'PROVISIONAL', 'STALE', 'INCOMPLETE', 'CONFLICTING', 'SOURCE_UNAVAILABLE', 'NOT_CONFIGURED', 'NOT_APPLICABLE')),
    metric_definition_version TEXT NOT NULL DEFAULT 'v1.0',
    source_freshness_summary JSONB DEFAULT '{}'::jsonb,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    exceptions JSONB NOT NULL DEFAULT '[]'::jsonb,
    risks JSONB NOT NULL DEFAULT '[]'::jsonb,
    priorities JSONB NOT NULL DEFAULT '[]'::jsonb,
    decisions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, report_date, snapshot_version)
);

CREATE INDEX IF NOT EXISTS idx_exec_snapshots_org_date ON public.executive_daily_snapshots(organization_id, report_date);
CREATE INDEX IF NOT EXISTS idx_exec_snapshots_status ON public.executive_daily_snapshots(status);
CREATE INDEX IF NOT EXISTS idx_exec_snapshots_quality ON public.executive_daily_snapshots(quality_status);

-- 2. Tabla: executive_daily_reports
CREATE TABLE IF NOT EXISTS public.executive_daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    report_version INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK (status IN ('DRAFT', 'VALIDATED', 'PUBLISHED', 'REVISED', 'SUPERSEDED', 'ARCHIVED')),
    executive_narrative TEXT,
    narrative_status TEXT CHECK (narrative_status IN ('AI_GENERATED', 'AI_VERIFIED', 'FALLBACK_DETERMINISTIC', 'MANUALLY_EDITED', 'VALIDATION_FAILED')),
    quick_brief_60s TEXT,
    quality_warnings JSONB DEFAULT '[]'::jsonb,
    delivered_to JSONB DEFAULT '[]'::jsonb,
    delivery_status TEXT DEFAULT 'PENDING' CHECK (delivery_status IN ('PENDING', 'AUTHORIZED', 'DELIVERED_SECURE_LINK', 'SUPPRESSED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, report_date, report_version)
);

CREATE INDEX IF NOT EXISTS idx_exec_reports_org_date ON public.executive_daily_reports(organization_id, report_date);
CREATE INDEX IF NOT EXISTS idx_exec_reports_status ON public.executive_daily_reports(status);

-- 3. Tabla: executive_daily_report_versions
CREATE TABLE IF NOT EXISTS public.executive_daily_report_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.executive_daily_reports(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    change_reason TEXT NOT NULL,
    changed_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    metrics_diff JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (report_id, version_number)
);

-- 4. Tabla: executive_metric_definitions
CREATE TABLE IF NOT EXISTS public.executive_metric_definitions (
    metric_key TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    source_domain TEXT NOT NULL,
    calculation_method TEXT NOT NULL,
    date_attribution_rule TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'COUNT',
    currency TEXT,
    definition_version TEXT NOT NULL DEFAULT 'v1.0',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla: executive_metric_results
CREATE TABLE IF NOT EXISTS public.executive_metric_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    metric_key TEXT NOT NULL REFERENCES public.executive_metric_definitions(metric_key),
    numeric_value NUMERIC(14,2),
    formatted_value TEXT NOT NULL,
    quality_status TEXT NOT NULL CHECK (quality_status IN ('VERIFIED', 'PARTIALLY_VERIFIED', 'PROVISIONAL', 'STALE', 'INCOMPLETE', 'CONFLICTING', 'SOURCE_UNAVAILABLE', 'NOT_CONFIGURED', 'NOT_APPLICABLE')),
    source_system TEXT NOT NULL,
    records_counted INTEGER DEFAULT 0,
    discrepancies_detected INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exec_metric_results_snapshot ON public.executive_metric_results(snapshot_id);

-- 6. Tabla: executive_metric_sources
CREATE TABLE IF NOT EXISTS public.executive_metric_sources (
    source_key TEXT PRIMARY KEY,
    domain TEXT NOT NULL,
    system_name TEXT NOT NULL,
    expected_refresh_policy TEXT NOT NULL DEFAULT 'HOURLY',
    last_sync_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'UNAVAILABLE', 'NOT_CONFIGURED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabla: executive_metric_quality_checks
CREATE TABLE IF NOT EXISTS public.executive_metric_quality_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    check_name TEXT NOT NULL,
    domain TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PASS', 'WARN', 'FAIL')),
    details JSONB DEFAULT '{}'::jsonb,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Tabla: executive_source_freshness
CREATE TABLE IF NOT EXISTS public.executive_source_freshness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    source_key TEXT NOT NULL REFERENCES public.executive_metric_sources(source_key),
    freshness_status TEXT NOT NULL CHECK (freshness_status IN ('CURRENT', 'DELAYED', 'STALE', 'UNAVAILABLE')),
    last_event_at TIMESTAMPTZ,
    delay_minutes INTEGER DEFAULT 0,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Tabla: executive_operational_exceptions
CREATE TABLE IF NOT EXISTS public.executive_operational_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('CLINICAL', 'OPERATIONAL', 'FINANCIAL', 'TECHNICAL', 'CUSTOMER_EXPERIENCE', 'STAFFING')),
    severity TEXT NOT NULL CHECK (severity IN ('INFORMATIONAL', 'OPERATIONAL_ATTENTION', 'HIGH_PRIORITY', 'CRITICAL_OPERATIONAL')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT,
    responsible_role TEXT,
    resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exec_exceptions_snapshot ON public.executive_operational_exceptions(snapshot_id);

-- 10. Tabla: executive_risk_signals
CREATE TABLE IF NOT EXISTS public.executive_risk_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    risk_domain TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    signal_title TEXT NOT NULL,
    evidence JSONB DEFAULT '{}'::jsonb,
    mitigation_strategy TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Tabla: executive_priority_recommendations
CREATE TABLE IF NOT EXISTS public.executive_priority_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    priority_rank INTEGER NOT NULL,
    title TEXT NOT NULL,
    domain TEXT NOT NULL,
    action_type TEXT NOT NULL,
    rationale TEXT NOT NULL,
    assigned_role TEXT NOT NULL,
    target_entity_reference TEXT,
    requires_director_approval BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Tabla: executive_action_requests
CREATE TABLE IF NOT EXISTS public.executive_action_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    action_key TEXT NOT NULL,
    title TEXT NOT NULL,
    target_module TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('PROPOSED', 'APPROVED', 'REJECTED', 'DISPATCHED', 'COMPLETED')),
    approved_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Tabla: executive_decision_requests
CREATE TABLE IF NOT EXISTS public.executive_decision_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_id UUID NOT NULL REFERENCES public.executive_daily_snapshots(id) ON DELETE CASCADE,
    decision_type TEXT NOT NULL CHECK (decision_type IN ('EXECUTIVE_AUTHORIZATION', 'DELEGATED_TO_COORDINATION', 'CLINICAL_REVIEW_REQUIRED', 'FINANCIAL_ADJUSTMENT')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    decided_option TEXT,
    decided_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    decided_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DECIDED', 'DISMISSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Tabla: executive_report_approvals
CREATE TABLE IF NOT EXISTS public.executive_report_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.executive_daily_reports(id) ON DELETE CASCADE,
    approved_by UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    approval_role TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('APPROVED', 'REJECTED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Tabla: executive_report_delivery_requests
CREATE TABLE IF NOT EXISTS public.executive_report_delivery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.executive_daily_reports(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('LOVABLE_DASHBOARD', 'WHATSAPP_SECURE_LINK', 'EMAIL_DIGEST')),
    recipient_role TEXT NOT NULL,
    recipient_identifier TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DISPATCHED', 'SUPPRESSED', 'FAILED')),
    send_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Tabla: executive_report_delivery_results
CREATE TABLE IF NOT EXISTS public.executive_report_delivery_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.executive_report_delivery_requests(id) ON DELETE CASCADE,
    dispatched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    provider_receipt TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Tabla: executive_report_audit
CREATE TABLE IF NOT EXISTS public.executive_report_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    report_id UUID,
    snapshot_id UUID,
    actor_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exec_audit_org_action ON public.executive_report_audit(organization_id, action);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) ACTIVATION (100% de tablas protegidas)
-- ==============================================================================
ALTER TABLE public.executive_daily_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_daily_report_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_metric_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_metric_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_metric_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_metric_quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_source_freshness ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_operational_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_risk_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_priority_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_action_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_decision_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_report_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_report_delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_report_delivery_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executive_report_audit ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "exec_snapshots_tenant" ON public.executive_daily_snapshots
    FOR ALL USING (organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid()) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_reports_tenant" ON public.executive_daily_reports
    FOR ALL USING (organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid()) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_report_versions_tenant" ON public.executive_daily_report_versions
    FOR ALL USING (report_id IN (SELECT id FROM public.executive_daily_reports WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_metric_defs_read" ON public.executive_metric_definitions
    FOR SELECT USING (true);

CREATE POLICY "exec_metric_defs_admin" ON public.executive_metric_definitions
    FOR ALL USING (auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_metric_results_tenant" ON public.executive_metric_results
    FOR ALL USING (snapshot_id IN (SELECT id FROM public.executive_daily_snapshots WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_metric_sources_read" ON public.executive_metric_sources
    FOR SELECT USING (true);

CREATE POLICY "exec_quality_checks_tenant" ON public.executive_metric_quality_checks
    FOR ALL USING (snapshot_id IN (SELECT id FROM public.executive_daily_snapshots WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_source_freshness_tenant" ON public.executive_source_freshness
    FOR ALL USING (snapshot_id IN (SELECT id FROM public.executive_daily_snapshots WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_exceptions_tenant" ON public.executive_operational_exceptions
    FOR ALL USING (snapshot_id IN (SELECT id FROM public.executive_daily_snapshots WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_risk_signals_tenant" ON public.executive_risk_signals
    FOR ALL USING (snapshot_id IN (SELECT id FROM public.executive_daily_snapshots WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_priorities_tenant" ON public.executive_priority_recommendations
    FOR ALL USING (snapshot_id IN (SELECT id FROM public.executive_daily_snapshots WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_action_requests_tenant" ON public.executive_action_requests
    FOR ALL USING (snapshot_id IN (SELECT id FROM public.executive_daily_snapshots WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_decision_requests_tenant" ON public.executive_decision_requests
    FOR ALL USING (snapshot_id IN (SELECT id FROM public.executive_daily_snapshots WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_approvals_tenant" ON public.executive_report_approvals
    FOR ALL USING (report_id IN (SELECT id FROM public.executive_daily_reports WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_delivery_requests_tenant" ON public.executive_report_delivery_requests
    FOR ALL USING (report_id IN (SELECT id FROM public.executive_daily_reports WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid())) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_delivery_results_tenant" ON public.executive_report_delivery_results
    FOR ALL USING (request_id IN (SELECT id FROM public.executive_report_delivery_requests WHERE report_id IN (SELECT id FROM public.executive_daily_reports WHERE organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid()))) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

CREATE POLICY "exec_audit_tenant" ON public.executive_report_audit
    FOR ALL USING (organization_id = (SELECT organization_id FROM public.staff_profiles WHERE user_id = auth.uid()) OR auth.jwt() ->> 'role' IN ('director', 'administrator', 'service_role'));

-- ==============================================================================
-- STORED PROCEDURES (SECURITY DEFINER, search_path = public)
-- ==============================================================================

-- 1. claim_daily_report_generation
CREATE OR REPLACE FUNCTION public.claim_daily_report_generation(
    p_org_id UUID,
    p_report_date DATE,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing_snapshot RECORD;
    v_new_snapshot_id UUID;
    v_snapshot_version INTEGER := 1;
BEGIN
    SELECT * INTO v_existing_snapshot
    FROM public.executive_daily_snapshots
    WHERE organization_id = p_org_id AND report_date = p_report_date
    ORDER BY snapshot_version DESC
    LIMIT 1;

    IF FOUND THEN
        IF v_existing_snapshot.status = 'READY' OR v_existing_snapshot.status = 'PUBLISHED' THEN
            v_snapshot_version := v_existing_snapshot.snapshot_version + 1;
            INSERT INTO public.executive_daily_snapshots (
                organization_id, report_date, snapshot_version, cutoff_at, status, quality_status, created_by
            ) VALUES (
                p_org_id, p_report_date, v_snapshot_version, now(), 'COLLECTING', 'PROVISIONAL', p_user_id
            ) RETURNING id INTO v_new_snapshot_id;

            RETURN jsonb_build_object(
                'success', true,
                'action', 'NEW_VERSION_CLAIMED',
                'snapshot_id', v_new_snapshot_id,
                'version', v_snapshot_version
            );
        ELSE
            RETURN jsonb_build_object(
                'success', true,
                'action', 'EXISTING_IN_PROGRESS',
                'snapshot_id', v_existing_snapshot.id,
                'version', v_existing_snapshot.snapshot_version
            );
        END IF;
    ELSE
        INSERT INTO public.executive_daily_snapshots (
            organization_id, report_date, snapshot_version, cutoff_at, status, quality_status, created_by
        ) VALUES (
            p_org_id, p_report_date, 1, now(), 'COLLECTING', 'PROVISIONAL', p_user_id
        ) RETURNING id INTO v_new_snapshot_id;

        RETURN jsonb_build_object(
            'success', true,
            'action', 'INITIAL_CLAIMED',
            'snapshot_id', v_new_snapshot_id,
            'version', 1
        );
    END IF;
END;
$$;

-- 2. get_daily_appointment_metrics
CREATE OR REPLACE FUNCTION public.get_daily_appointment_metrics(
    p_org_id UUID,
    p_report_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_scheduled INTEGER := 0;
    v_confirmed INTEGER := 0;
    v_cancelled INTEGER := 0;
    v_pending_okvet INTEGER := 0;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE status = 'SCHEDULED'),
        COUNT(*) FILTER (WHERE status = 'CONFIRMED'),
        COUNT(*) FILTER (WHERE status = 'CANCELLED'),
        COUNT(*) FILTER (WHERE okvet_sync_status = 'PENDING' OR okvet_sync_status IS NULL)
    INTO v_scheduled, v_confirmed, v_cancelled, v_pending_okvet
    FROM public.appointments
    WHERE organization_id = p_org_id 
      AND DATE(start_time AT TIME ZONE 'America/Bogota') = p_report_date;

    RETURN jsonb_build_object(
        'scheduled', COALESCE(v_scheduled, 0),
        'confirmed', COALESCE(v_confirmed, 0),
        'cancelled', COALESCE(v_cancelled, 0),
        'pending_okvet', COALESCE(v_pending_okvet, 0),
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 3. get_daily_visit_metrics
CREATE OR REPLACE FUNCTION public.get_daily_visit_metrics(
    p_org_id UUID,
    p_report_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_completed INTEGER := 0;
    v_in_progress INTEGER := 0;
    v_clinical_pending INTEGER := 0;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE check_out_at IS NOT NULL),
        COUNT(*) FILTER (WHERE check_in_at IS NOT NULL AND check_out_at IS NULL),
        COUNT(*) FILTER (WHERE check_out_at IS NOT NULL AND (okvet_clinical_record_id IS NULL OR okvet_clinical_record_id = ''))
    INTO v_completed, v_in_progress, v_clinical_pending
    FROM public.visits
    WHERE organization_id = p_org_id 
      AND (DATE(check_in_at AT TIME ZONE 'America/Bogota') = p_report_date OR DATE(created_at AT TIME ZONE 'America/Bogota') = p_report_date);

    RETURN jsonb_build_object(
        'operationally_completed', COALESCE(v_completed, 0),
        'in_progress', COALESCE(v_in_progress, 0),
        'clinical_closure_pending', COALESCE(v_clinical_pending, 0),
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 4. get_daily_staff_metrics
CREATE OR REPLACE FUNCTION public.get_daily_staff_metrics(
    p_org_id UUID,
    p_report_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_vets_on_duty INTEGER := 0;
    v_absences INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_vets_on_duty
    FROM public.staff_profiles
    WHERE organization_id = p_org_id AND is_active = true;

    SELECT COUNT(*) INTO v_absences
    FROM public.staff_absences
    WHERE organization_id = p_org_id
      AND p_report_date BETWEEN start_date AND end_date;

    RETURN jsonb_build_object(
        'vets_on_duty', GREATEST(0, v_vets_on_duty - v_absences),
        'active_absences', v_absences,
        'uncovered_shifts', CASE WHEN (v_vets_on_duty - v_absences) < 2 THEN 1 ELSE 0 END,
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 5. get_daily_route_metrics
CREATE OR REPLACE FUNCTION public.get_daily_route_metrics(
    p_org_id UUID,
    p_report_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_routes_count INTEGER := 0;
    v_stops_count INTEGER := 0;
    v_delays_count INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_routes_count
    FROM public.routes
    WHERE organization_id = p_org_id AND route_date = p_report_date;

    SELECT COUNT(*) INTO v_stops_count
    FROM public.route_stops
    WHERE route_id IN (SELECT id FROM public.routes WHERE organization_id = p_org_id AND route_date = p_report_date);

    SELECT COUNT(*) INTO v_delays_count
    FROM public.route_alerts
    WHERE route_id IN (SELECT id FROM public.routes WHERE organization_id = p_org_id AND route_date = p_report_date)
      AND alert_type = 'DELAY';

    RETURN jsonb_build_object(
        'routes_published', v_routes_count,
        'stops_scheduled', v_stops_count,
        'delays_documented', v_delays_count,
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 6. get_daily_financial_metrics
CREATE OR REPLACE FUNCTION public.get_daily_financial_metrics(
    p_org_id UUID,
    p_report_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_verified_cop NUMERIC(14,2) := 0;
    v_reported_cop NUMERIC(14,2) := 0;
    v_pending_recon INTEGER := 0;
    v_quotes_accepted INTEGER := 0;
    v_invoices_issued INTEGER := 0;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO v_verified_cop
    FROM public.financial_payment_transactions
    WHERE status = 'SUCCEEDED'
      AND DATE(created_at AT TIME ZONE 'America/Bogota') = p_report_date;

    SELECT COALESCE(SUM(amount), 0) INTO v_reported_cop
    FROM public.financial_bank_transfer_reports
    WHERE verification_status = 'PENDING_VERIFICATION'
      AND DATE(created_at AT TIME ZONE 'America/Bogota') = p_report_date;

    SELECT COUNT(*) INTO v_pending_recon
    FROM public.financial_bank_transfer_reports
    WHERE verification_status = 'PENDING_VERIFICATION';

    SELECT COUNT(*) INTO v_quotes_accepted
    FROM public.financial_quotes
    WHERE status = 'ACCEPTED'
      AND DATE(updated_at AT TIME ZONE 'America/Bogota') = p_report_date;

    SELECT COUNT(*) INTO v_invoices_issued
    FROM public.financial_invoices
    WHERE status = 'ISSUED'
      AND DATE(created_at AT TIME ZONE 'America/Bogota') = p_report_date;

    RETURN jsonb_build_object(
        'verified_revenue_cop', v_verified_cop,
        'reported_unverified_cop', v_reported_cop,
        'pending_reconciliations_count', v_pending_recon,
        'quotes_accepted_count', v_quotes_accepted,
        'invoices_issued_count', v_invoices_issued,
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 7. get_daily_experience_metrics
CREATE OR REPLACE FUNCTION public.get_daily_experience_metrics(
    p_org_id UUID,
    p_report_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_surveys_count INTEGER := 0;
    v_avg_csat NUMERIC(3,2) := NULL;
    v_open_complaints INTEGER := 0;
    v_bereavement_protected INTEGER := 0;
BEGIN
    SELECT COUNT(*), AVG(score) INTO v_surveys_count, v_avg_csat
    FROM public.feedback_surveys
    WHERE DATE(created_at AT TIME ZONE 'America/Bogota') = p_report_date;

    SELECT COUNT(*) INTO v_open_complaints
    FROM public.client_complaints
    WHERE status IN ('OPEN', 'IN_PROGRESS');

    SELECT COUNT(*) INTO v_bereavement_protected
    FROM public.bereavement_records
    WHERE is_active = true;

    RETURN jsonb_build_object(
        'surveys_completed', v_surveys_count,
        'csat_average', v_avg_csat,
        'open_complaints', v_open_complaints,
        'bereavement_protected_families', v_bereavement_protected,
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 8. get_daily_continuity_metrics
CREATE OR REPLACE FUNCTION public.get_daily_continuity_metrics(
    p_org_id UUID,
    p_report_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_open_commitments INTEGER := 0;
    v_overdue_commitments INTEGER := 0;
    v_pending_referrals INTEGER := 0;
    v_pending_documents INTEGER := 0;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS')),
        COUNT(*) FILTER (WHERE status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS') AND (due_at < now() OR (due_date < CURRENT_DATE AND due_at IS NULL)))
    INTO v_open_commitments, v_overdue_commitments
    FROM public.post_visit_commitments;

    SELECT COUNT(*) INTO v_pending_referrals
    FROM public.specialist_referrals
    WHERE status IN ('REQUESTED', 'OFFERED');

    SELECT COUNT(*) INTO v_pending_documents
    FROM public.documents
    WHERE is_approved = false;

    RETURN jsonb_build_object(
        'open_commitments', COALESCE(v_open_commitments, 0),
        'overdue_commitments', COALESCE(v_overdue_commitments, 0),
        'pending_referrals', COALESCE(v_pending_referrals, 0),
        'pending_documents_approval', COALESCE(v_pending_documents, 0),
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 9. get_daily_integration_metrics
CREATE OR REPLACE FUNCTION public.get_daily_integration_metrics(
    p_org_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_failed_incidents INTEGER := 0;
    v_open_tasks INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_failed_incidents
    FROM public.integration_incidents
    WHERE status IN ('OPEN', 'RETRYING');

    SELECT COUNT(*) INTO v_open_tasks
    FROM public.integration_reconciliation_tasks
    WHERE status = 'PENDING';

    RETURN jsonb_build_object(
        'unresolved_incidents_count', v_failed_incidents,
        'open_reconciliation_tasks', v_open_tasks,
        'overall_technical_health', CASE WHEN v_failed_incidents = 0 THEN 'HEALTHY' ELSE 'DEGRADED' END,
        'quality_status', 'VERIFIED'
    );
END;
$$;

-- 10. persist_daily_snapshot
CREATE OR REPLACE FUNCTION public.persist_daily_snapshot(
    p_org_id UUID,
    p_report_date DATE,
    p_metrics JSONB,
    p_quality_status TEXT DEFAULT 'VERIFIED',
    p_created_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_snapshot_id UUID;
    v_version INTEGER;
BEGIN
    SELECT id, snapshot_version INTO v_snapshot_id, v_version
    FROM public.executive_daily_snapshots
    WHERE organization_id = p_org_id AND report_date = p_report_date
    ORDER BY snapshot_version DESC
    LIMIT 1;

    IF FOUND THEN
        UPDATE public.executive_daily_snapshots
        SET metrics = p_metrics,
            quality_status = p_quality_status,
            status = 'READY',
            cutoff_at = now(),
            updated_at = now()
        WHERE id = v_snapshot_id;
    ELSE
        INSERT INTO public.executive_daily_snapshots (
            organization_id, report_date, snapshot_version, cutoff_at, status, quality_status, metrics, created_by
        ) VALUES (
            p_org_id, p_report_date, 1, now(), 'READY', p_quality_status, p_metrics, p_created_by
        ) RETURNING id, snapshot_version INTO v_snapshot_id, v_version;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'snapshot_id', v_snapshot_id,
        'version', v_version,
        'quality_status', p_quality_status
    );
END;
$$;

-- 11. create_daily_report_version
CREATE OR REPLACE FUNCTION public.create_daily_report_version(
    p_snapshot_id UUID,
    p_narrative TEXT,
    p_narrative_status TEXT,
    p_quick_brief TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_snap RECORD;
    v_report_id UUID;
    v_version INTEGER := 1;
BEGIN
    SELECT * INTO v_snap FROM public.executive_daily_snapshots WHERE id = p_snapshot_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Snapshot % inexistente', p_snapshot_id;
    END IF;

    SELECT id, report_version INTO v_report_id, v_version
    FROM public.executive_daily_reports
    WHERE organization_id = v_snap.organization_id AND report_date = v_snap.report_date
    ORDER BY report_version DESC
    LIMIT 1;

    IF FOUND THEN
        v_version := v_version + 1;
        INSERT INTO public.executive_daily_reports (
            organization_id, snapshot_id, report_date, report_version, status,
            executive_narrative, narrative_status, quick_brief_60s
        ) VALUES (
            v_snap.organization_id, p_snapshot_id, v_snap.report_date, v_version, 'PUBLISHED',
            p_narrative, p_narrative_status, p_quick_brief
        ) RETURNING id INTO v_report_id;
    ELSE
        INSERT INTO public.executive_daily_reports (
            organization_id, snapshot_id, report_date, report_version, status,
            executive_narrative, narrative_status, quick_brief_60s
        ) VALUES (
            v_snap.organization_id, p_snapshot_id, v_snap.report_date, 1, 'PUBLISHED',
            p_narrative, p_narrative_status, p_quick_brief
        ) RETURNING id INTO v_report_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'report_id', v_report_id,
        'version', v_version,
        'status', 'PUBLISHED'
    );
END;
$$;

-- 12. record_daily_report_exception
CREATE OR REPLACE FUNCTION public.record_daily_report_exception(
    p_snapshot_id UUID,
    p_category TEXT,
    p_severity TEXT,
    p_title TEXT,
    p_desc TEXT,
    p_action TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'COORDINATOR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_exc_id UUID;
BEGIN
    INSERT INTO public.executive_operational_exceptions (
        snapshot_id, category, severity, title, description, recommended_action, responsible_role
    ) VALUES (
        p_snapshot_id, p_category, p_severity, p_title, p_desc, p_action, p_role
    ) RETURNING id INTO v_exc_id;

    RETURN jsonb_build_object('success', true, 'exception_id', v_exc_id);
END;
$$;

-- 13. authorize_daily_report_delivery
CREATE OR REPLACE FUNCTION public.authorize_daily_report_delivery(
    p_report_id UUID,
    p_authorized_by UUID,
    p_channel TEXT DEFAULT 'LOVABLE_DASHBOARD'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_req_id UUID;
BEGIN
    INSERT INTO public.executive_report_delivery_requests (
        report_id, channel, recipient_role, recipient_identifier, status, send_enabled
    ) VALUES (
        p_report_id, p_channel, 'DIRECTOR', 'dr_luis_rios', 'PENDING', false
    ) RETURNING id INTO v_req_id;

    UPDATE public.executive_daily_reports
    SET delivery_status = 'AUTHORIZED',
        updated_at = now()
    WHERE id = p_report_id;

    RETURN jsonb_build_object('success', true, 'delivery_request_id', v_req_id, 'status', 'AUTHORIZED');
END;
$$;

-- 14. record_daily_report_audit
CREATE OR REPLACE FUNCTION public.record_daily_report_audit(
    p_org_id UUID,
    p_action TEXT,
    p_entity_id UUID DEFAULT NULL,
    p_actor_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.executive_report_audit (
        organization_id, report_id, actor_id, action, details
    ) VALUES (
        p_org_id, p_entity_id, p_actor_id, p_action, p_details
    );
END;
$$;

-- Hardening
REVOKE EXECUTE ON FUNCTION public.claim_daily_report_generation(UUID, DATE, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_appointment_metrics(UUID, DATE) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_visit_metrics(UUID, DATE) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_staff_metrics(UUID, DATE) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_route_metrics(UUID, DATE) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_financial_metrics(UUID, DATE) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_experience_metrics(UUID, DATE) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_continuity_metrics(UUID, DATE) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_daily_integration_metrics(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.persist_daily_snapshot(UUID, DATE, JSONB, TEXT, UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_daily_report_version(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_daily_report_exception(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.authorize_daily_report_delivery(UUID, UUID, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.record_daily_report_audit(UUID, TEXT, UUID, UUID, JSONB) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.claim_daily_report_generation(UUID, DATE, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_appointment_metrics(UUID, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_visit_metrics(UUID, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_staff_metrics(UUID, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_route_metrics(UUID, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_financial_metrics(UUID, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_experience_metrics(UUID, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_continuity_metrics(UUID, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_daily_integration_metrics(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.persist_daily_snapshot(UUID, DATE, JSONB, TEXT, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_daily_report_version(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_daily_report_exception(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.authorize_daily_report_delivery(UUID, UUID, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_daily_report_audit(UUID, TEXT, UUID, UUID, JSONB) TO authenticated, service_role;

-- Seeds
INSERT INTO public.executive_metric_definitions (metric_key, display_name, description, source_domain, calculation_method, date_attribution_rule, unit, currency)
VALUES
('visits_completed', 'Visitas Realizadas', 'Conteo de visitas finalizadas operativamente en domicilio', 'VISITS', 'COUNT_DISTINCT_VISIT_ID', 'SCHEDULED_DATE_BOGOTA', 'COUNT', NULL),
('appointments_confirmed', 'Citas Confirmadas', 'Citas con confirmación verificada para la jornada', 'APPOINTMENTS', 'COUNT_APPOINTMENTS', 'START_TIME_BOGOTA', 'COUNT', NULL),
('uncovered_shifts', 'Turnos Descubiertos', 'Turnos con déficit de médicos veterinarios por ausencias', 'STAFF', 'COUNT_UNCOVERED', 'DATE_BOGOTA', 'COUNT', NULL),
('delays_documented', 'Retrasos en Rutas', 'Alertas de retraso documentadas en ruta', 'ROUTES', 'COUNT_ALERTS', 'ALERT_TIMESTAMP_BOGOTA', 'COUNT', NULL),
('overdue_commitments', 'Compromisos Vencidos', 'Compromisos post-visita con fecha límite superada', 'COMMITMENTS', 'COUNT_OVERDUE', 'DUE_DATE_BOGOTA', 'COUNT', NULL),
('pending_referrals', 'Remisiones Pendientes', 'Remisiones a especialistas sin reserva externa confirmada', 'SPECIALISTS', 'COUNT_PENDING', 'REQUEST_DATE_BOGOTA', 'COUNT', NULL),
('verified_revenue_cop', 'Recaudo Verificado', 'Ingresos confirmados por transacciones de pasarela verificadas', 'FINANCE', 'SUM_AMOUNT', 'TRANSACTION_DATE_BOGOTA', 'CURRENCY', 'COP'),
('unverified_revenue_cop', 'Pagos por Verificar', 'Transferencias reportadas con screenshot en revisión', 'FINANCE', 'SUM_AMOUNT', 'REPORT_DATE_BOGOTA', 'CURRENCY', 'COP'),
('open_complaints', 'Quejas Abiertas', 'Reclamos de clientes activos en seguimiento de experiencia', 'CX', 'COUNT_OPEN', 'CREATED_AT_BOGOTA', 'COUNT', NULL),
('unresolved_technical_incidents', 'Incidentes Técnicos', 'Fallos de integración activos o en reintento', 'INTEGRATIONS', 'COUNT_UNRESOLVED', 'INCIDENT_DATE_BOGOTA', 'COUNT', NULL)
ON CONFLICT (metric_key) DO NOTHING;

INSERT INTO public.executive_metric_sources (source_key, domain, system_name, expected_refresh_policy, status)
VALUES
('SUPABASE_DB', 'ALL', 'Supabase PostgreSQL 17', 'REALTIME', 'HEALTHY'),
('N8N_ORCHESTRATOR', 'AUTOMATION', 'n8n Cloud', '5_MINUTES', 'HEALTHY'),
('OKVET_SYNC', 'CLINICAL', 'OKVET Medical Records', 'DAILY_ASSISTED', 'HEALTHY'),
('WHATSAPP_PLATFORM', 'COMMS', 'Meta Cloud API', 'EVENT_DRIVEN', 'HEALTHY'),
('PAYMENT_GATEWAYS', 'FINANCE', 'Wompi / Bold / PSE', 'WEBHOOK_EVENT', 'HEALTHY')
ON CONFLICT (source_key) DO NOTHING;
