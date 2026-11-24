-- ==============================================================================
-- Migration: 023_integration_health_monitoring.sql
-- Description: Core 20 Integration Health Monitoring & Telemetry Foundation.
--              Persistence for monitoring cycles, probe results, system health
--              snapshots, service heartbeats, credential metadata, cost tracking,
--              and independent watchdog checks.
-- Module: Module T / VET-CORE-20
-- Environment: DEVELOPMENT
-- Target Engine: PostgreSQL 17 (Supabase)
-- Timezone: America/Bogota (UTC-5)
-- ==============================================================================

-- 1. INTEGRATION MONITORING CYCLES
CREATE TABLE IF NOT EXISTS public.integration_monitoring_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    environment TEXT NOT NULL DEFAULT 'DEVELOPMENT' CHECK (environment IN ('DEVELOPMENT', 'STAGING', 'PRODUCTION')),
    cycle_type TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (cycle_type IN ('SCHEDULED', 'WEBHOOK', 'MANUAL', 'WATCHDOG', 'ON_DEMAND')),
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL')),
    overall_health TEXT NOT NULL CHECK (overall_health IN ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN', 'NOT_CONFIGURED', 'PAUSED', 'MAINTENANCE', 'CRITICAL')),
    issues_count INTEGER NOT NULL DEFAULT 0 CHECK (issues_count >= 0),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    duration_ms INTEGER NOT NULL DEFAULT 0 CHECK (duration_ms >= 0),
    raw_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INTEGRATION PROBE RESULTS
CREATE TABLE IF NOT EXISTS public.integration_probe_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID REFERENCES public.integration_monitoring_cycles(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    service_name TEXT NOT NULL,
    probe_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN', 'NOT_CONFIGURED', 'PAUSED', 'MAINTENANCE', 'CRITICAL')),
    severity TEXT NOT NULL DEFAULT 'P3' CHECK (severity IN ('P0', 'P1', 'P2', 'P3')),
    latency_ms INTEGER DEFAULT 0 CHECK (latency_ms >= 0),
    http_status INTEGER,
    error_code TEXT,
    error_message TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INTEGRATION HEALTH SNAPSHOTS (Single state row per organization)
CREATE TABLE IF NOT EXISTS public.integration_health_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT UNIQUE,
    environment TEXT NOT NULL DEFAULT 'DEVELOPMENT',
    overall_status TEXT NOT NULL CHECK (overall_status IN ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN', 'NOT_CONFIGURED', 'PAUSED', 'MAINTENANCE', 'CRITICAL')),
    services_status JSONB NOT NULL DEFAULT '{}'::jsonb,
    open_incidents_count INTEGER NOT NULL DEFAULT 0 CHECK (open_incidents_count >= 0),
    dead_letters_count INTEGER NOT NULL DEFAULT 0 CHECK (dead_letters_count >= 0),
    pending_outbox_count INTEGER NOT NULL DEFAULT 0 CHECK (pending_outbox_count >= 0),
    stale_events_count INTEGER NOT NULL DEFAULT 0 CHECK (stale_events_count >= 0),
    unresolved_reconciliations_count INTEGER NOT NULL DEFAULT 0 CHECK (unresolved_reconciliations_count >= 0),
    last_monitored_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_healthy_at TIMESTAMPTZ,
    executive_summary_es TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. INTEGRATION HEARTBEATS (Liveness pings from n8n & distributed workers)
CREATE TABLE IF NOT EXISTS public.integration_heartbeats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    service_name TEXT NOT NULL, -- e.g. 'N8N_CLOUD', 'SUPABASE_EDGE', 'EXTERNAL_WATCHDOG'
    instance_id TEXT NOT NULL,
    environment TEXT NOT NULL DEFAULT 'DEVELOPMENT',
    heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'HEALTHY' CHECK (status IN ('HEALTHY', 'DEGRADED', 'UNHEALTHY')),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. INTEGRATION CREDENTIALS METADATA (No secrets stored)
CREATE TABLE IF NOT EXISTS public.integration_credentials_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    provider TEXT NOT NULL, -- 'META_WHATSAPP', 'GOOGLE_CALENDAR', 'OPENAI', 'ANTHROPIC', 'MAPS_PROVIDER'
    service_name TEXT NOT NULL,
    credential_alias TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'REVOKED', 'UNKNOWN')),
    last_refreshed_at TIMESTAMPTZ,
    responsible_role TEXT NOT NULL DEFAULT 'TECH_SUPPORT',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cred_metadata UNIQUE (organization_id, provider, credential_alias)
);

-- 6. INTEGRATION COST USAGE (Cost & Quota tracking in COP)
CREATE TABLE IF NOT EXISTS public.integration_cost_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    provider TEXT NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    metric_type TEXT NOT NULL, -- 'TOKENS', 'MESSAGES', 'GEOCODING_REQUESTS', 'WORKFLOW_EXECUTIONS'
    units_consumed NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (units_consumed >= 0),
    estimated_cost_cop NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (estimated_cost_cop >= 0),
    budget_limit_cop NUMERIC(14,2) NOT NULL DEFAULT 500000.00 CHECK (budget_limit_cop >= 0),
    status TEXT NOT NULL DEFAULT 'WITHIN_BUDGET' CHECK (status IN ('WITHIN_BUDGET', 'APPROACHING_LIMIT', 'LIMIT_EXCEEDED')),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_monitoring_cycles_org_time ON public.integration_monitoring_cycles (organization_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_probe_results_service ON public.integration_probe_results (organization_id, service_name, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_probe_results_status ON public.integration_probe_results (status, severity);
CREATE INDEX IF NOT EXISTS idx_heartbeats_service ON public.integration_heartbeats (service_name, heartbeat_at DESC);
CREATE INDEX IF NOT EXISTS idx_cred_metadata_expiry ON public.integration_credentials_metadata (status, expires_at);
CREATE INDEX IF NOT EXISTS idx_cost_usage_provider ON public.integration_cost_usage (organization_id, provider, recorded_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.integration_monitoring_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_probe_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_heartbeats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_credentials_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_cost_usage ENABLE ROW LEVEL SECURITY;

-- Staff Read Policy for Telemetry Tables
DROP POLICY IF EXISTS p_read_monitoring_cycles ON public.integration_monitoring_cycles;
CREATE POLICY p_read_monitoring_cycles ON public.integration_monitoring_cycles
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.organization_memberships m
        WHERE m.organization_id = integration_monitoring_cycles.organization_id
          AND m.user_id = auth.uid()
          AND m.role IN ('ADMINISTRATOR', 'DIRECTOR', 'TECH_SUPPORT', 'COORDINATOR')
    )
);

DROP POLICY IF EXISTS p_read_probe_results ON public.integration_probe_results;
CREATE POLICY p_read_probe_results ON public.integration_probe_results
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.organization_memberships m
        WHERE m.organization_id = integration_probe_results.organization_id
          AND m.user_id = auth.uid()
          AND m.role IN ('ADMINISTRATOR', 'DIRECTOR', 'TECH_SUPPORT', 'COORDINATOR')
    )
);

DROP POLICY IF EXISTS p_read_health_snapshots ON public.integration_health_snapshots;
CREATE POLICY p_read_health_snapshots ON public.integration_health_snapshots
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.organization_memberships m
        WHERE m.organization_id = integration_health_snapshots.organization_id
          AND m.user_id = auth.uid()
          AND m.role IN ('ADMINISTRATOR', 'DIRECTOR', 'TECH_SUPPORT', 'COORDINATOR', 'VETERINARIAN')
    )
);

DROP POLICY IF EXISTS p_read_heartbeats ON public.integration_heartbeats;
CREATE POLICY p_read_heartbeats ON public.integration_heartbeats
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.organization_memberships m
        WHERE m.organization_id = integration_heartbeats.organization_id
          AND m.user_id = auth.uid()
          AND m.role IN ('ADMINISTRATOR', 'DIRECTOR', 'TECH_SUPPORT')
    )
);

DROP POLICY IF EXISTS p_read_credentials_meta ON public.integration_credentials_metadata;
CREATE POLICY p_read_credentials_meta ON public.integration_credentials_metadata
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.organization_memberships m
        WHERE m.organization_id = integration_credentials_metadata.organization_id
          AND m.user_id = auth.uid()
          AND m.role IN ('ADMINISTRATOR', 'DIRECTOR', 'TECH_SUPPORT')
    )
);

DROP POLICY IF EXISTS p_read_cost_usage ON public.integration_cost_usage;
CREATE POLICY p_read_cost_usage ON public.integration_cost_usage
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.organization_memberships m
        WHERE m.organization_id = integration_cost_usage.organization_id
          AND m.user_id = auth.uid()
          AND m.role IN ('ADMINISTRATOR', 'DIRECTOR', 'FINANCE')
    )
);

-- ==============================================================================
-- STORED PROCEDURES & RPC FUNCTIONS (PostgreSQL 17)
-- ==============================================================================

-- 1. RECORD SERVICE HEARTBEAT
CREATE OR REPLACE FUNCTION public.record_service_heartbeat(
    p_heartbeat JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
    v_org_id UUID;
    v_service TEXT;
    v_instance TEXT;
    v_env TEXT;
    v_status TEXT;
    v_details JSONB;
BEGIN
    v_org_id := (p_heartbeat->>'organization_id')::UUID;
    v_service := COALESCE(p_heartbeat->>'service_name', 'UNKNOWN_SERVICE');
    v_instance := COALESCE(p_heartbeat->>'instance_id', 'DEFAULT_INSTANCE');
    v_env := COALESCE(p_heartbeat->>'environment', 'DEVELOPMENT');
    v_status := COALESCE(p_heartbeat->>'status', 'HEALTHY');
    v_details := COALESCE(p_heartbeat->'details', '{}'::JSONB);

    INSERT INTO public.integration_heartbeats (
        organization_id, service_name, instance_id, environment, heartbeat_at, status, details
    ) VALUES (
        v_org_id, v_service, v_instance, v_env, now(), v_status, v_details
    ) RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- 2. RECORD MONITORING CYCLE
CREATE OR REPLACE FUNCTION public.record_monitoring_cycle(
    p_cycle JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cycle_id UUID;
    v_org_id UUID;
    v_env TEXT;
    v_cycle_type TEXT;
    v_overall_health TEXT;
    v_issues_count INT;
    v_duration_ms INT;
    v_summary JSONB;
BEGIN
    v_org_id := (p_cycle->>'organization_id')::UUID;
    v_env := COALESCE(p_cycle->>'environment', 'DEVELOPMENT');
    v_cycle_type := COALESCE(p_cycle->>'cycle_type', 'SCHEDULED');
    v_overall_health := COALESCE(p_cycle->>'overall_health', 'HEALTHY');
    v_issues_count := COALESCE((p_cycle->>'issues_count')::INT, 0);
    v_duration_ms := COALESCE((p_cycle->>'duration_ms')::INT, 0);
    v_summary := COALESCE(p_cycle->'raw_summary', '{}'::JSONB);

    INSERT INTO public.integration_monitoring_cycles (
        organization_id, environment, cycle_type, status, overall_health,
        issues_count, started_at, completed_at, duration_ms, raw_summary
    ) VALUES (
        v_org_id, v_env, v_cycle_type, 'COMPLETED', v_overall_health,
        v_issues_count, now() - (v_duration_ms || ' milliseconds')::INTERVAL, now(),
        v_duration_ms, v_summary
    ) RETURNING id INTO v_cycle_id;

    RETURN v_cycle_id;
END;
$$;

-- 3. RECORD PROBE RESULT
CREATE OR REPLACE FUNCTION public.record_probe_result(
    p_probe JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_probe_id UUID;
    v_cycle_id UUID;
    v_org_id UUID;
    v_service TEXT;
    v_probe_name TEXT;
    v_status TEXT;
    v_severity TEXT;
    v_latency INT;
    v_http_status INT;
    v_err_code TEXT;
    v_err_msg TEXT;
    v_details JSONB;
BEGIN
    v_cycle_id := (p_probe->>'cycle_id')::UUID;
    v_org_id := (p_probe->>'organization_id')::UUID;
    v_service := COALESCE(p_probe->>'service_name', 'UNKNOWN_SERVICE');
    v_probe_name := COALESCE(p_probe->>'probe_name', 'generic_probe');
    v_status := COALESCE(p_probe->>'status', 'HEALTHY');
    v_severity := COALESCE(p_probe->>'severity', 'P3');
    v_latency := COALESCE((p_probe->>'latency_ms')::INT, 0);
    v_http_status := (p_probe->>'http_status')::INT;
    v_err_code := p_probe->>'error_code';
    v_err_msg := p_probe->>'error_message';
    v_details := COALESCE(p_probe->'details', '{}'::JSONB);

    INSERT INTO public.integration_probe_results (
        cycle_id, organization_id, service_name, probe_name, status,
        severity, latency_ms, http_status, error_code, error_message, details, checked_at
    ) VALUES (
        v_cycle_id, v_org_id, v_service, v_probe_name, v_status,
        v_severity, v_latency, v_http_status, v_err_code, v_err_msg, v_details, now()
    ) RETURNING id INTO v_probe_id;

    RETURN v_probe_id;
END;
$$;

-- 4. UPDATE SYSTEM HEALTH SNAPSHOT
CREATE OR REPLACE FUNCTION public.update_system_health_snapshot(
    p_snapshot JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
    v_env TEXT;
    v_overall TEXT;
    v_services JSONB;
    v_incidents_count INT;
    v_dlq_count INT;
    v_outbox_count INT;
    v_stale_count INT;
    v_reconcil_count INT;
    v_summary TEXT;
    v_result JSONB;
BEGIN
    v_org_id := (p_snapshot->>'organization_id')::UUID;
    v_env := COALESCE(p_snapshot->>'environment', 'DEVELOPMENT');
    v_overall := COALESCE(p_snapshot->>'overall_status', 'HEALTHY');
    v_services := COALESCE(p_snapshot->'services_status', '{}'::JSONB);
    v_incidents_count := COALESCE((p_snapshot->>'open_incidents_count')::INT, 0);
    v_dlq_count := COALESCE((p_snapshot->>'dead_letters_count')::INT, 0);
    v_outbox_count := COALESCE((p_snapshot->>'pending_outbox_count')::INT, 0);
    v_stale_count := COALESCE((p_snapshot->>'stale_events_count')::INT, 0);
    v_reconcil_count := COALESCE((p_snapshot->>'unresolved_reconciliations_count')::INT, 0);
    v_summary := p_snapshot->>'executive_summary_es';

    INSERT INTO public.integration_health_snapshots (
        organization_id, environment, overall_status, services_status,
        open_incidents_count, dead_letters_count, pending_outbox_count,
        stale_events_count, unresolved_reconciliations_count,
        last_monitored_at, last_healthy_at, executive_summary_es, updated_at
    ) VALUES (
        v_org_id, v_env, v_overall, v_services,
        v_incidents_count, v_dlq_count, v_outbox_count,
        v_stale_count, v_reconcil_count,
        now(), CASE WHEN v_overall = 'HEALTHY' THEN now() ELSE NULL END, v_summary, now()
    )
    ON CONFLICT (organization_id) DO UPDATE SET
        environment = EXCLUDED.environment,
        overall_status = EXCLUDED.overall_status,
        services_status = EXCLUDED.services_status,
        open_incidents_count = EXCLUDED.open_incidents_count,
        dead_letters_count = EXCLUDED.dead_letters_count,
        pending_outbox_count = EXCLUDED.pending_outbox_count,
        stale_events_count = EXCLUDED.stale_events_count,
        unresolved_reconciliations_count = EXCLUDED.unresolved_reconciliations_count,
        last_monitored_at = now(),
        last_healthy_at = CASE WHEN EXCLUDED.overall_status = 'HEALTHY' THEN now() ELSE public.integration_health_snapshots.last_healthy_at END,
        executive_summary_es = EXCLUDED.executive_summary_es,
        updated_at = now()
    RETURNING to_jsonb(public.integration_health_snapshots.*) INTO v_result;

    RETURN v_result;
END;
$$;

-- 5. CHECK EXTERNAL HEARTBEATS (Independent Watchdog inside PostgreSQL)
CREATE OR REPLACE FUNCTION public.check_external_heartbeats(
    p_organization_id UUID,
    p_max_staleness_seconds INT DEFAULT 300
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_n8n_last_hb TIMESTAMPTZ;
    v_n8n_status TEXT;
    v_is_stale BOOLEAN := false;
    v_staleness_sec INT := 0;
    v_incident_id UUID;
    v_result JSONB;
BEGIN
    SELECT heartbeat_at, status INTO v_n8n_last_hb, v_n8n_status
    FROM public.integration_heartbeats
    WHERE organization_id = p_organization_id AND service_name = 'N8N_CLOUD'
    ORDER BY heartbeat_at DESC LIMIT 1;

    IF v_n8n_last_hb IS NULL THEN
        v_is_stale := true;
        v_staleness_sec := 999999;
    ELSE
        v_staleness_sec := EXTRACT(EPOCH FROM (now() - v_n8n_last_hb))::INT;
        IF v_staleness_sec > p_max_staleness_seconds THEN
            v_is_stale := true;
        END IF;
    END IF;

    -- If n8n heartbeat is dead/stale, trigger watchdog alert directly in integration_incidents
    IF v_is_stale THEN
        INSERT INTO public.integration_incidents (
            organization_id, idempotency_key, incident_code, error_category,
            severity, title, description, responsible_role, status, recovery_strategy
        ) VALUES (
            p_organization_id,
            'WATCHDOG-N8N-DOWN-' || to_char(now(), 'YYYYMMDD-HH24'),
            'N8N_HEARTBEAT_EXPIRED',
            'SERVICE_UNAVAILABLE',
            'P0',
            'n8n Cloud no responde (Heartbeat vencido)',
            'El supervisor independiente detectó que el motor de automatizaciones n8n no ha emitido señales de vida en ' || v_staleness_sec || ' segundos (umbral: ' || p_max_staleness_seconds || 's).',
            'DIRECTOR',
            'OPEN',
            'MANUAL_INTERVENTION'
        )
        ON CONFLICT (organization_id, idempotency_key) DO UPDATE SET
            last_occurrence_at = now(),
            occurrence_count = public.integration_incidents.occurrence_count + 1
        RETURNING id INTO v_incident_id;
    END IF;

    v_result := jsonb_build_object(
        'organization_id', p_organization_id,
        'checked_at', now(),
        'service_name', 'N8N_CLOUD',
        'is_stale', v_is_stale,
        'staleness_seconds', v_staleness_sec,
        'last_heartbeat_at', v_n8n_last_hb,
        'incident_triggered', v_is_stale,
        'incident_id', v_incident_id
    );

    RETURN v_result;
END;
$$;

-- 6. GET SYSTEM HEALTH SUMMARY (Mobile Contract for Lovable & Dr. Luis Eduardo Ríos)
CREATE OR REPLACE FUNCTION public.get_system_health_summary(
    p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_snapshot RECORD;
    v_open_p0_count INT := 0;
    v_open_p1_count INT := 0;
    v_open_incidents INT := 0;
    v_dead_letters INT := 0;
    v_pending_outbox INT := 0;
    v_stale_events INT := 0;
    v_unresolved_tasks INT := 0;
    v_executive_message TEXT;
    v_result JSONB;
BEGIN
    SELECT * INTO v_snapshot
    FROM public.integration_health_snapshots
    WHERE organization_id = p_organization_id;

    SELECT COUNT(*) INTO v_open_p0_count
    FROM public.integration_incidents
    WHERE organization_id = p_organization_id AND severity = 'P0' AND status IN ('OPEN', 'INVESTIGATING', 'WAITING_RETRY');

    SELECT COUNT(*) INTO v_open_p1_count
    FROM public.integration_incidents
    WHERE organization_id = p_organization_id AND severity = 'P1' AND status IN ('OPEN', 'INVESTIGATING', 'WAITING_RETRY');

    SELECT COUNT(*) INTO v_open_incidents
    FROM public.integration_incidents
    WHERE organization_id = p_organization_id AND status IN ('OPEN', 'INVESTIGATING', 'WAITING_RETRY', 'WAITING_RECONCILIATION');

    SELECT COUNT(*) INTO v_dead_letters
    FROM public.dead_letter_queue
    WHERE status = 'UNRESOLVED';

    SELECT COUNT(*) INTO v_pending_outbox
    FROM public.transactional_outbox
    WHERE organization_id = p_organization_id AND status = 'PENDING';

    SELECT COUNT(*) INTO v_stale_events
    FROM public.transactional_outbox
    WHERE organization_id = p_organization_id AND status = 'CLAIMED' AND claimed_at < (now() - INTERVAL '5 minutes');

    SELECT COUNT(*) INTO v_unresolved_tasks
    FROM public.integration_reconciliation_tasks
    WHERE organization_id = p_organization_id AND status IN ('PENDING', 'IN_PROGRESS');

    IF v_open_p0_count > 0 THEN
        v_executive_message := 'Atención requerida: Existen ' || v_open_p0_count || ' anomalía(s) crítica(s) de seguridad o disponibilidad técnica en curso.';
    ELSIF v_open_p1_count > 0 OR v_dead_letters > 0 THEN
        v_executive_message := 'Operación con degradación controlada: Los servicios veterinarios continúan activos mientras se procesan tareas de recuperación.';
    ELSE
        v_executive_message := 'Todos los sistemas de Vet Life — Veterinaria a Domicilio operan con normalidad y estabilidad.';
    END IF;

    v_result := jsonb_build_object(
        'organization_id', p_organization_id,
        'query_timestamp', now(),
        'overall_status', COALESCE(v_snapshot.overall_status, CASE WHEN v_open_p0_count > 0 THEN 'CRITICAL' WHEN v_open_p1_count > 0 THEN 'DEGRADED' ELSE 'HEALTHY' END),
        'executive_headline_es', v_executive_message,
        'operational_metrics', jsonb_build_object(
            'open_critical_p0', v_open_p0_count,
            'open_major_p1', v_open_p1_count,
            'total_open_incidents', v_open_incidents,
            'dead_letter_events', v_dead_letters,
            'pending_outbox_queue', v_pending_outbox,
            'stale_in_flight_events', v_stale_events,
            'reconciliation_backlog', v_unresolved_tasks
        ),
        'services_status', COALESCE(v_snapshot.services_status, jsonb_build_object(
            'n8n_engine', 'HEALTHY',
            'supabase_db', 'HEALTHY',
            'whatsapp_gateway', 'HEALTHY',
            'google_calendar', 'HEALTHY',
            'ai_assistant', 'HEALTHY',
            'event_broker', 'HEALTHY',
            'okvet_bridge', 'HEALTHY'
        )),
        'last_monitored_at', COALESCE(v_snapshot.last_monitored_at, now()),
        'last_healthy_at', v_snapshot.last_healthy_at
    );

    RETURN v_result;
END;
$$;

-- REVOKE ANON PRIVILEGES (Security Hardening)
REVOKE EXECUTE ON FUNCTION public.record_service_heartbeat FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_monitoring_cycle FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_probe_result FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_system_health_snapshot FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_external_heartbeats FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_system_health_summary FROM anon;
