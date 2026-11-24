-- ==============================================================================
-- Migration: 022_integration_incidents_and_recovery.sql
-- Description: Universal Incident Contract, Retry Attempts, Reconciliation Tasks,
--              and atomic functions for VET-CORE-19 Error & Retry Handler.
-- Module: Module T & VET-CORE-19
-- ==============================================================================

-- 1. UNIVERSAL INTEGRATION INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.integration_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    environment TEXT NOT NULL DEFAULT 'DEVELOPMENT' CHECK (environment IN ('DEVELOPMENT', 'STAGING', 'PRODUCTION')),
    source_system TEXT NOT NULL DEFAULT 'N8N',
    source_workflow_id TEXT,
    source_workflow_name TEXT,
    source_execution_id TEXT,
    source_node TEXT,
    event_id TEXT,
    correlation_id UUID,
    causation_id UUID,
    idempotency_key TEXT,
    entity_type TEXT,
    entity_id TEXT,
    error_category TEXT NOT NULL CHECK (error_category IN (
        'TRANSIENT_NETWORK',
        'RATE_LIMIT',
        'SERVICE_UNAVAILABLE',
        'AUTHENTICATION_FAILURE',
        'AUTHORIZATION_FAILURE',
        'INVALID_PAYLOAD',
        'BUSINESS_CONFLICT',
        'DUPLICATE_EVENT',
        'UNKNOWN_EXTERNAL_RESULT',
        'SECURITY_INCIDENT',
        'CLINICAL_OR_OPERATIONAL_SAFETY',
        'INTERNAL_SYSTEM_ERROR'
    )),
    error_code TEXT,
    error_message TEXT NOT NULL,
    http_status INTEGER,
    severity TEXT NOT NULL DEFAULT 'P3' CHECK (severity IN ('P0', 'P1', 'P2', 'P3')),
    retry_eligibility BOOLEAN NOT NULL DEFAULT false,
    external_effect_status TEXT NOT NULL DEFAULT 'NOT_APPLIED' CHECK (external_effect_status IN (
        'NOT_APPLIED', 'CONFIRMED_FAILED', 'UNCERTAIN', 'PARTIALLY_APPLIED', 'APPLIED'
    )),
    attempt_number INTEGER NOT NULL DEFAULT 1 CHECK (attempt_number >= 1),
    max_attempts INTEGER NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_retry_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'DETECTED' CHECK (status IN (
        'DETECTED', 'CLASSIFIED', 'WAITING_RETRY', 'RETRYING', 'WAITING_RECONCILIATION', 
        'REQUIRES_HUMAN', 'RESOLVED', 'PERMANENT_FAILURE', 'DEAD_LETTER', 'CANCELLED'
    )),
    resolution_type TEXT CHECK (resolution_type IS NULL OR resolution_type IN (
        'AUTO_RETRY_SUCCESS', 'MANUAL_OVERRIDE', 'RECONCILED', 'DISCARDED_AS_DUPLICATE', 
        'CANCELLED_PRE_DISPATCH', 'PERMANENT_REJECT'
    )),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    resolution_evidence JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for deduplication on same logical failure
CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_org_idemp 
ON public.integration_incidents(organization_id, idempotency_key) 
WHERE idempotency_key IS NOT NULL AND status NOT IN ('RESOLVED', 'CANCELLED');

-- Operational indexes for query efficiency
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.integration_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.integration_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_next_retry ON public.integration_incidents(next_retry_at) WHERE status = 'WAITING_RETRY';
CREATE INDEX IF NOT EXISTS idx_incidents_org_created ON public.integration_incidents(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_correlation ON public.integration_incidents(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_incidents_source_wf ON public.integration_incidents(source_workflow_id);

CREATE TRIGGER trg_integration_incidents_updated_at
BEFORE UPDATE ON public.integration_incidents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. INTEGRATION RETRY ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.integration_retry_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.integration_incidents(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1),
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILED', 'TIMED_OUT', 'RECONCILIATION_REQUIRED')),
    error_details TEXT,
    response_payload JSONB,
    duration_ms INTEGER CHECK (duration_ms >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_retry_attempts_incident ON public.integration_retry_attempts(incident_id, attempt_number DESC);

-- 3. INTEGRATION RECONCILIATION TASKS TABLE
CREATE TABLE IF NOT EXISTS public.integration_reconciliation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES public.integration_incidents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    task_type TEXT NOT NULL, -- e.g. WHATSAPP_STATUS_QUERY, CALENDAR_SLOT_CHECK, PAYMENT_GATEWAY_LOOKUP, OKVET_RECORD_CHECK
    target_external_id TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'UNRESOLVABLE')),
    due_at TIMESTAMPTZ NOT NULL,
    result_details JSONB,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_tasks_status ON public.integration_reconciliation_tasks(status, due_at);
CREATE INDEX IF NOT EXISTS idx_reconciliation_tasks_org ON public.integration_reconciliation_tasks(organization_id);

CREATE TRIGGER trg_reconciliation_tasks_updated_at
BEFORE UPDATE ON public.integration_reconciliation_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. ATOMIC STORED PROCEDURES (SECURITY DEFINER + search_path = public)

-- Function 4.1: Register or Update an Incident
CREATE OR REPLACE FUNCTION public.register_or_update_incident(
    p_incident JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_incident_id UUID;
    v_org_id UUID;
    v_idemp_key TEXT;
    v_error_category TEXT;
    v_severity TEXT;
    v_retry_eligibility BOOLEAN;
    v_max_attempts INTEGER;
    v_error_msg TEXT;
BEGIN
    v_org_id := (p_incident->>'organization_id')::UUID;
    v_idemp_key := p_incident->>'idempotency_key';
    v_error_category := COALESCE(p_incident->>'error_category', 'INTERNAL_SYSTEM_ERROR');
    v_error_msg := COALESCE(p_incident->>'error_message', 'Error no especificado');
    v_severity := COALESCE(p_incident->>'severity', 'P3');
    v_retry_eligibility := COALESCE((p_incident->>'retry_eligibility')::BOOLEAN, false);
    v_max_attempts := COALESCE((p_incident->>'max_attempts')::INTEGER, 5);

    -- Check if active incident already exists for same idempotency key in this org
    IF v_idemp_key IS NOT NULL THEN
        SELECT id INTO v_incident_id
        FROM public.integration_incidents
        WHERE organization_id = v_org_id
          AND idempotency_key = v_idemp_key
          AND status NOT IN ('RESOLVED', 'CANCELLED')
        LIMIT 1;
    END IF;

    IF v_incident_id IS NOT NULL THEN
        -- Update existing incident (increment seen count, update last_seen_at)
        UPDATE public.integration_incidents
        SET last_seen_at = now(),
            error_message = v_error_msg,
            http_status = COALESCE((p_incident->>'http_status')::INTEGER, http_status),
            error_code = COALESCE(p_incident->>'error_code', error_code),
            updated_at = now()
        WHERE id = v_incident_id;
    ELSE
        -- Insert new incident
        INSERT INTO public.integration_incidents (
            organization_id,
            environment,
            source_system,
            source_workflow_id,
            source_workflow_name,
            source_execution_id,
            source_node,
            event_id,
            correlation_id,
            causation_id,
            idempotency_key,
            entity_type,
            entity_id,
            error_category,
            error_code,
            error_message,
            http_status,
            severity,
            retry_eligibility,
            external_effect_status,
            attempt_number,
            max_attempts,
            status,
            created_at,
            updated_at
        ) VALUES (
            v_org_id,
            COALESCE(p_incident->>'environment', 'DEVELOPMENT'),
            COALESCE(p_incident->>'source_system', 'N8N'),
            p_incident->>'source_workflow_id',
            p_incident->>'source_workflow_name',
            p_incident->>'source_execution_id',
            p_incident->>'source_node',
            p_incident->>'event_id',
            (p_incident->>'correlation_id')::UUID,
            (p_incident->>'causation_id')::UUID,
            v_idemp_key,
            p_incident->>'entity_type',
            p_incident->>'entity_id',
            v_error_category,
            p_incident->>'error_code',
            v_error_msg,
            (p_incident->>'http_status')::INTEGER,
            v_severity,
            v_retry_eligibility,
            COALESCE(p_incident->>'external_effect_status', 'NOT_APPLIED'),
            COALESCE((p_incident->>'attempt_number')::INTEGER, 1),
            v_max_attempts,
            COALESCE(p_incident->>'status', 'DETECTED'),
            now(),
            now()
        )
        RETURNING id INTO v_incident_id;
    END IF;

    RETURN v_incident_id;
END;
$$;

-- Function 4.2: Schedule Incident Retry with Backoff
CREATE OR REPLACE FUNCTION public.schedule_incident_retry(
    p_incident_id UUID,
    p_delay_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attempt INTEGER;
    v_max INTEGER;
BEGIN
    SELECT attempt_number, max_attempts INTO v_attempt, v_max
    FROM public.integration_incidents
    WHERE id = p_incident_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    IF v_attempt >= v_max THEN
        -- Max retries exceeded: escalate to DEAD_LETTER
        UPDATE public.integration_incidents
        SET status = 'DEAD_LETTER',
            next_retry_at = NULL,
            updated_at = now()
        WHERE id = p_incident_id;
        RETURN false;
    END IF;

    UPDATE public.integration_incidents
    SET status = 'WAITING_RETRY',
        attempt_number = attempt_number + 1,
        next_retry_at = now() + (p_delay_seconds || ' seconds')::INTERVAL,
        updated_at = now()
    WHERE id = p_incident_id;

    RETURN true;
END;
$$;

-- Function 4.3: Resolve Incident
CREATE OR REPLACE FUNCTION public.resolve_incident(
    p_incident_id UUID,
    p_resolution_type TEXT,
    p_evidence JSONB DEFAULT '{}'::jsonb,
    p_resolver_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.integration_incidents
    SET status = 'RESOLVED',
        resolution_type = p_resolution_type,
        resolution_evidence = p_evidence,
        resolved_at = now(),
        resolved_by = p_resolver_user_id,
        next_retry_at = NULL,
        updated_at = now()
    WHERE id = p_incident_id;

    RETURN FOUND;
END;
$$;

-- Function 4.4: Escalate Incident to Dead Letter Queue
CREATE OR REPLACE FUNCTION public.escalate_incident_to_dead_letter(
    p_incident_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_inc RECORD;
BEGIN
    SELECT * INTO v_inc
    FROM public.integration_incidents
    WHERE id = p_incident_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Update incident state
    UPDATE public.integration_incidents
    SET status = 'DEAD_LETTER',
        next_retry_at = NULL,
        error_message = COALESCE(p_reason, error_message),
        updated_at = now()
    WHERE id = p_incident_id;

    -- Mirror to dead_letter_queue table if event_id can be converted or payload stored
    INSERT INTO public.dead_letter_queue (
        outbox_id,
        event_type,
        payload,
        failure_reason,
        status,
        created_at
    ) VALUES (
        CASE WHEN v_inc.event_id ~ '^[0-9a-fA-F-]{36}$' THEN v_inc.event_id::UUID ELSE NULL END,
        COALESCE(v_inc.error_category, 'UNKNOWN_ERROR'),
        jsonb_build_object(
            'incident_id', v_inc.id,
            'source_workflow_id', v_inc.source_workflow_id,
            'source_workflow_name', v_inc.source_workflow_name,
            'source_execution_id', v_inc.source_execution_id,
            'idempotency_key', v_inc.idempotency_key,
            'severity', v_inc.severity,
            'attempts', v_inc.attempt_number
        ),
        COALESCE(p_reason, v_inc.error_message),
        'UNRESOLVED',
        now()
    );

    RETURN true;
END;
$$;

-- Function 4.5: Claim Retryable Incidents (Atomic Worker Polling with SKIP LOCKED)
CREATE OR REPLACE FUNCTION public.claim_retryable_incidents(
    p_worker_id TEXT,
    p_batch_size INTEGER DEFAULT 10
)
RETURNS TABLE (
    incident_id UUID,
    organization_id UUID,
    source_workflow_id TEXT,
    source_workflow_name TEXT,
    idempotency_key TEXT,
    error_category TEXT,
    attempt_number INTEGER,
    max_attempts INTEGER,
    correlation_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH eligible AS (
        SELECT id
        FROM public.integration_incidents
        WHERE status = 'WAITING_RETRY'
          AND next_retry_at <= now()
        ORDER BY next_retry_at ASC
        FOR UPDATE SKIP LOCKED
        LIMIT p_batch_size
    )
    UPDATE public.integration_incidents i
    SET status = 'RETRYING',
        updated_at = now()
    FROM eligible e
    WHERE i.id = e.id
    RETURNING 
        i.id AS incident_id,
        i.organization_id,
        i.source_workflow_id,
        i.source_workflow_name,
        i.idempotency_key,
        i.error_category,
        i.attempt_number,
        i.max_attempts,
        i.correlation_id;
END;
$$;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.integration_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_retry_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_reconciliation_tasks ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY service_role_all_incidents ON public.integration_incidents
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_retry_attempts ON public.integration_retry_attempts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY service_role_all_reconciliation_tasks ON public.integration_reconciliation_tasks
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated organization isolation policy
CREATE POLICY org_members_read_incidents ON public.integration_incidents
    FOR SELECT TO authenticated
    USING (organization_id IN (
        SELECT om.organization_id FROM public.organization_memberships om WHERE om.user_id = auth.uid()
    ));

CREATE POLICY org_members_read_retry_attempts ON public.integration_retry_attempts
    FOR SELECT TO authenticated
    USING (incident_id IN (
        SELECT inc.id FROM public.integration_incidents inc
        WHERE inc.organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om WHERE om.user_id = auth.uid()
        )
    ));

CREATE POLICY org_members_read_reconciliation_tasks ON public.integration_reconciliation_tasks
    FOR SELECT TO authenticated
    USING (organization_id IN (
        SELECT om.organization_id FROM public.organization_memberships om WHERE om.user_id = auth.uid()
    ));

-- 6. REVOKE ANON PRIVILEGES
REVOKE EXECUTE ON FUNCTION public.register_or_update_incident(JSONB) FROM anon;
REVOKE EXECUTE ON FUNCTION public.schedule_incident_retry(UUID, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.resolve_incident(UUID, TEXT, JSONB, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.escalate_incident_to_dead_letter(UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.claim_retryable_incidents(TEXT, INTEGER) FROM anon;
