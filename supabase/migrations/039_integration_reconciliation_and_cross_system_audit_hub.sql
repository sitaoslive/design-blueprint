-- ==============================================================================
-- MIGRACIÓN 039: INTEGRATION RECONCILIATION & CROSS-SYSTEM AUDIT HUB
-- Módulo: VET-CORE-18 | Integration Reconciliation
-- Proyecto: VET FREEDOM OS — Vet Life: Veterinaria a Domicilio
-- Dirección Médica: Dr. Luis Eduardo Ríos | Alpha Vision Method
-- Fecha: 2026-11-21
-- ==============================================================================

-- 1. Catálogo de Conectores del Ecosistema
CREATE TABLE IF NOT EXISTS public.integration_connectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    connector_key TEXT NOT NULL,
    display_name TEXT NOT NULL,
    provider TEXT NOT NULL,
    environment TEXT NOT NULL DEFAULT 'SANDBOX' CHECK (environment IN ('PRODUCTION', 'SANDBOX', 'QA', 'MOCK')),
    account_reference TEXT,
    authentication_type TEXT NOT NULL DEFAULT 'OAUTH2' CHECK (authentication_type IN ('OAUTH2', 'API_KEY', 'WEBHOOK_HMAC', 'MANUAL_IMPORT', 'SERVICE_ROLE', 'NONE')),
    verification_level TEXT NOT NULL DEFAULT 'CONFIGURATION_FOUND' CHECK (verification_level IN ('CONFIGURATION_FOUND', 'AUTHENTICATION_VERIFIED', 'READ_VERIFIED', 'WRITE_SANDBOX_VERIFIED', 'WEBHOOK_VERIFIED', 'RECONCILIATION_VERIFIED', 'END_TO_END_VERIFIED', 'PRODUCTION_VERIFIED')),
    health_status TEXT NOT NULL DEFAULT 'HEALTHY' CHECK (health_status IN ('HEALTHY', 'DEGRADED', 'UNAVAILABLE', 'EXPIRED_CREDENTIALS', 'DISCONNECTED', 'NOT_CONFIGURED')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_successful_connection_at TIMESTAMPTZ,
    last_successful_sync_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    last_error_message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_integration_connector UNIQUE (organization_id, connector_key)
);

-- 2. Capacidades Verificadas por Conector
CREATE TABLE IF NOT EXISTS public.integration_connector_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id UUID NOT NULL REFERENCES public.integration_connectors(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    capability_name TEXT NOT NULL,
    sync_direction TEXT NOT NULL DEFAULT 'READ_ONLY' CHECK (sync_direction IN ('READ_ONLY', 'WRITE_ONLY', 'BIDIRECTIONAL_AUTHORIZED', 'MANUAL_IMPORT_ONLY', 'MANUAL_CONFIRMATION', 'EVENT_DRIVEN', 'PERIODIC_RECONCILIATION', 'NOT_CONNECTED')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    restrictions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_connector_capability UNIQUE (connector_id, capability_name)
);

-- 3. Políticas de Sincronización y Matriz de Autoridad
CREATE TABLE IF NOT EXISTS public.integration_sync_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    authoritative_system TEXT NOT NULL,
    secondary_systems TEXT[] NOT NULL DEFAULT '{}',
    freshness_max_seconds INTEGER NOT NULL DEFAULT 86400,
    conflict_policy TEXT NOT NULL DEFAULT 'AUTHORITY_FIRST' CHECK (conflict_policy IN ('AUTHORITY_FIRST', 'MANUAL_REVIEW_REQUIRED', 'LATEST_SOURCE_TIMESTAMP_IF_SAME_AUTHORITY', 'SAFE_FALLBACK')),
    human_approval_required BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_sync_policy UNIQUE (organization_id, entity_type)
);

-- 4. Cursores de Sincronización Incremental
CREATE TABLE IF NOT EXISTS public.integration_sync_cursors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connector_id UUID NOT NULL REFERENCES public.integration_connectors(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sync_scope TEXT NOT NULL,
    cursor_value TEXT NOT NULL,
    cursor_type TEXT NOT NULL DEFAULT 'TIMESTAMP' CHECK (cursor_type IN ('TIMESTAMP', 'VERSION_TOKEN', 'PAGINATION_PAGE', 'EVENT_ID', 'SYNC_TOKEN')),
    last_successful_sync_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_sync_cursor UNIQUE (connector_id, sync_scope)
);

-- 5. Checkpoints de Reconciliación
CREATE TABLE IF NOT EXISTS public.integration_sync_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    connector_id UUID NOT NULL REFERENCES public.integration_connectors(id) ON DELETE CASCADE,
    sync_scope TEXT NOT NULL,
    checkpoint_version BIGINT NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL')),
    records_scanned INTEGER NOT NULL DEFAULT 0,
    discrepancies_detected INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Mapeo de Identidades Externas
CREATE TABLE IF NOT EXISTS public.integration_external_identity_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'pet', 'caregiver', 'staff_user', 'specialist')),
    internal_entity_id UUID NOT NULL,
    external_system TEXT NOT NULL,
    external_identifier TEXT NOT NULL,
    match_confidence TEXT NOT NULL DEFAULT 'EXACT_VERIFIED_MATCH' CHECK (match_confidence IN ('EXACT_VERIFIED_MATCH', 'STRONG_CANDIDATE_REQUIRES_REVIEW', 'AMBIGUOUS', 'UNMATCHED', 'CONFLICTING')),
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_external_identity UNIQUE (organization_id, entity_type, external_system, external_identifier)
);

-- 7. Mapeo de Referencias Externas
CREATE TABLE IF NOT EXISTS public.integration_external_reference_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('appointment', 'visit', 'route', 'payment', 'invoice', 'referral', 'commitment', 'document', 'message')),
    internal_entity_id UUID NOT NULL,
    external_system TEXT NOT NULL,
    external_reference TEXT NOT NULL,
    external_status TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_external_reference UNIQUE (organization_id, entity_type, external_system, external_reference)
);

-- 8. Inbox de Recibos de Eventos Externos
CREATE TABLE IF NOT EXISTS public.integration_event_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT false,
    processing_status TEXT NOT NULL DEFAULT 'RECEIVED' CHECK (processing_status IN ('RECEIVED', 'PROCESSING', 'PROCESSED', 'DUPLICATE_IGNORED', 'FAILED', 'DEAD_LETTER')),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    payload_preview TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_event_receipt UNIQUE (organization_id, provider, event_id)
);

-- 9. Ejecuciones de Reconciliación
CREATE TABLE IF NOT EXISTS public.integration_reconciliation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    run_number BIGINT GENERATED ALWAYS AS IDENTITY,
    reconciliation_scope TEXT NOT NULL DEFAULT 'ALL_DOMAINS',
    execution_mode TEXT NOT NULL DEFAULT 'DRY_RUN' CHECK (execution_mode IN ('DRY_RUN', 'DETECT_ONLY', 'PROPOSE_REPAIR', 'AUTO_REPAIR_APPROVED_SAFE_ACTIONS', 'MANUAL_REPAIR', 'REVERIFY')),
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'PARTIALLY_COMPLETED', 'FAILED', 'BLOCKED')),
    connectors_checked TEXT[] NOT NULL DEFAULT '{}',
    records_evaluated INTEGER NOT NULL DEFAULT 0,
    discrepancies_detected INTEGER NOT NULL DEFAULT 0,
    expected_differences_count INTEGER NOT NULL DEFAULT 0,
    true_conflicts_count INTEGER NOT NULL DEFAULT 0,
    repairs_proposed_count INTEGER NOT NULL DEFAULT 0,
    repairs_applied_count INTEGER NOT NULL DEFAULT 0,
    repairs_verified_count INTEGER NOT NULL DEFAULT 0,
    human_tasks_created_count INTEGER NOT NULL DEFAULT 0,
    summary_notes TEXT,
    worker_id TEXT NOT NULL DEFAULT 'system',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Discrepancias Detectadas
CREATE TABLE IF NOT EXISTS public.integration_reconciliation_discrepancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.integration_reconciliation_runs(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    internal_entity_id UUID,
    external_reference TEXT,
    source_system TEXT NOT NULL,
    target_system TEXT NOT NULL,
    discrepancy_type TEXT NOT NULL CHECK (discrepancy_type IN (
        'MISSING_LOCAL_RECORD', 'MISSING_EXTERNAL_RECORD', 'STALE_LOCAL_DATA', 'STALE_EXTERNAL_DATA',
        'STATUS_MISMATCH', 'VERSION_MISMATCH', 'ENTITY_MAPPING_MISMATCH', 'DUPLICATE_INTERNAL_RECORD',
        'DUPLICATE_EXTERNAL_REFERENCE', 'PERMISSION_MISMATCH', 'AUTHORIZATION_REVOKED',
        'EVENT_NOT_PROCESSED', 'WEBHOOK_NOT_RECEIVED', 'WEBHOOK_DUPLICATED', 'OUT_OF_ORDER_EVENT',
        'UNCONFIRMED_EXTERNAL_ACTION', 'PROVIDER_RESULT_UNKNOWN', 'FINANCIAL_DISCREPANCY',
        'DOCUMENT_ACCESS_DISCREPANCY', 'OKVET_CONFLICT', 'EXPECTED_ASYNCHRONOUS_DELAY', 'UNSUPPORTED_INTEGRATION'
    )),
    severity TEXT NOT NULL DEFAULT 'MEDIUM_OPERATIONAL' CHECK (severity IN (
        'INFORMATIONAL', 'LOW_OPERATIONAL', 'MEDIUM_OPERATIONAL', 'HIGH_OPERATIONAL',
        'CRITICAL_INTEGRITY', 'SECURITY_RISK', 'FINANCIAL_RISK', 'CLINICAL_REVIEW_REQUIRED'
    )),
    status TEXT NOT NULL DEFAULT 'DETECTED' CHECK (status IN (
        'DETECTED', 'NEEDS_CLASSIFICATION', 'EXPECTED_DIFFERENCE', 'SYNC_PENDING',
        'WAITING_SOURCE', 'STALE_DATA', 'CONFLICT_CONFIRMED', 'INVESTIGATION_REQUIRED',
        'REPAIR_PROPOSED', 'APPROVAL_PENDING', 'APPROVED_FOR_SAFE_REPAIR', 'REPAIR_RUNNING',
        'REPAIR_APPLIED', 'REVERIFY_PENDING', 'RECONCILED_VERIFIED', 'MANUAL_ACTION_REQUIRED',
        'BLOCKED', 'CLOSED_WITH_DOCUMENTED_EXCEPTION', 'REOPENED'
    )),
    authoritative_system TEXT NOT NULL,
    observed_local_value JSONB,
    observed_external_value JSONB,
    explanation TEXT NOT NULL,
    assigned_role TEXT DEFAULT 'OPERATIONS_COORDINATOR',
    assigned_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Evidencias de Discrepancia
CREATE TABLE IF NOT EXISTS public.integration_discrepancy_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discrepancy_id UUID NOT NULL REFERENCES public.integration_reconciliation_discrepancies(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('RAW_WEBHOOK_PAYLOAD', 'API_RESPONSE_LOG', 'OKVET_EXPORT_ROW', 'CALENDAR_EVENT_SNAPSHOT', 'DATABASE_STATE_DUMP', 'MANUAL_VET_STATEMENT')),
    evidence_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Propuestas de Reparación
CREATE TABLE IF NOT EXISTS public.integration_repair_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discrepancy_id UUID NOT NULL REFERENCES public.integration_reconciliation_discrepancies(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    repair_type TEXT NOT NULL CHECK (repair_type IN ('SAFE_AUTO_REPAIR', 'APPROVAL_REQUIRED_REPAIR', 'MANUAL_REPAIR_ONLY', 'NO_ACTION_EXPECTED_DIFFERENCE')),
    proposed_action TEXT NOT NULL,
    action_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    requires_human_approval BOOLEAN NOT NULL DEFAULT true,
    approver_role TEXT DEFAULT 'DIRECTOR',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Aprobaciones de Reparación
CREATE TABLE IF NOT EXISTS public.integration_repair_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.integration_repair_proposals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL,
    decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
    decision_reason TEXT NOT NULL,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Ejecuciones de Reparación
CREATE TABLE IF NOT EXISTS public.integration_repair_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.integration_repair_proposals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    execution_status TEXT NOT NULL DEFAULT 'STARTED' CHECK (execution_status IN ('STARTED', 'APPLIED', 'FAILED', 'ROLLED_BACK')),
    applied_changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_details TEXT,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Verificaciones Post-Reparación
CREATE TABLE IF NOT EXISTS public.integration_repair_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repair_execution_id UUID NOT NULL REFERENCES public.integration_repair_executions(id) ON DELETE CASCADE,
    discrepancy_id UUID NOT NULL REFERENCES public.integration_reconciliation_discrepancies(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    is_verified_clean BOOLEAN NOT NULL DEFAULT false,
    verification_notes TEXT NOT NULL,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Tareas de Confirmación y Revisión Humana
CREATE TABLE IF NOT EXISTS public.integration_manual_confirmation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    discrepancy_id UUID REFERENCES public.integration_reconciliation_discrepancies(id) ON DELETE SET NULL,
    task_title TEXT NOT NULL,
    task_description TEXT NOT NULL,
    assigned_role TEXT NOT NULL DEFAULT 'COORDINATOR',
    assigned_to UUID,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_REVIEW', 'CONFIRMED', 'REJECTED', 'EXPIRED')),
    due_at TIMESTAMPTZ NOT NULL,
    resolution_notes TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Bitácora Forense de Auditoría de Reconciliación
CREATE TABLE IF NOT EXISTS public.integration_reconciliation_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    actor TEXT NOT NULL DEFAULT 'system',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (100% de tablas protegidas)
-- ==============================================================================

ALTER TABLE public.integration_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connectors FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_connector_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_connector_capabilities FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_sync_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_policies FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_sync_cursors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_cursors FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_sync_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_checkpoints FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_external_identity_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_external_identity_map FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_external_reference_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_external_reference_map FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_event_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_event_receipts FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_reconciliation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_reconciliation_runs FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_reconciliation_discrepancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_reconciliation_discrepancies FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_discrepancy_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_discrepancy_evidence FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_repair_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_repair_proposals FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_repair_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_repair_approvals FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_repair_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_repair_executions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_repair_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_repair_verifications FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_manual_confirmation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_manual_confirmation_tasks FORCE ROW LEVEL SECURITY;

ALTER TABLE public.integration_reconciliation_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_reconciliation_audit FORCE ROW LEVEL SECURITY;

-- Políticas de aislamiento multi-tenant
CREATE POLICY "tenant_isolation_connectors" ON public.integration_connectors
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_capabilities" ON public.integration_connector_capabilities
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_sync_policies" ON public.integration_sync_policies
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_sync_cursors" ON public.integration_sync_cursors
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_sync_checkpoints" ON public.integration_sync_checkpoints
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_identity_map" ON public.integration_external_identity_map
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_reference_map" ON public.integration_external_reference_map
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_event_receipts" ON public.integration_event_receipts
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_reconciliation_runs" ON public.integration_reconciliation_runs
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_discrepancies" ON public.integration_reconciliation_discrepancies
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_evidence" ON public.integration_discrepancy_evidence
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_repair_proposals" ON public.integration_repair_proposals
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_repair_approvals" ON public.integration_repair_approvals
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_repair_executions" ON public.integration_repair_executions
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_repair_verifications" ON public.integration_repair_verifications
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_manual_tasks" ON public.integration_manual_confirmation_tasks
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

CREATE POLICY "tenant_isolation_reconciliation_audit" ON public.integration_reconciliation_audit
FOR ALL TO authenticated
USING (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid)
WITH CHECK (organization_id = (auth.jwt() -> 'app_metadata' ->> 'organization_id')::uuid);

-- ==============================================================================
-- STORED PROCEDURES (SECURITY DEFINER, search_path = public)
-- ==============================================================================

-- 1. Reclamar Ejecución de Reconciliación con Advisory Lock
CREATE OR REPLACE FUNCTION public.claim_reconciliation_run(
    p_org_id UUID,
    p_scope TEXT,
    p_mode TEXT,
    p_worker_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_lock_id BIGINT;
    v_acquired BOOLEAN;
    v_run_id UUID;
    v_active_runs INTEGER;
BEGIN
    v_lock_id := ('x' || substr(md5(p_org_id::text || '_' || p_scope), 1, 15))::bit(64)::bigint;
    v_acquired := pg_try_advisory_xact_lock(v_lock_id);

    IF NOT v_acquired THEN
        RETURN jsonb_build_object(
            'claimed', false,
            'reason', 'CONCURRENT_RECONCILIATION_RUN_IN_PROGRESS',
            'scope', p_scope
        );
    END IF;

    -- Verificar ejecuciones activas recientes (< 15 minutos)
    SELECT COUNT(*) INTO v_active_runs
    FROM public.integration_reconciliation_runs
    WHERE organization_id = p_org_id
      AND reconciliation_scope = p_scope
      AND status = 'IN_PROGRESS'
      AND started_at > now() - INTERVAL '15 minutes';

    IF v_active_runs > 0 THEN
        RETURN jsonb_build_object(
            'claimed', false,
            'reason', 'ACTIVE_RUN_ALREADY_EXISTS',
            'scope', p_scope
        );
    END IF;

    INSERT INTO public.integration_reconciliation_runs (
        organization_id,
        reconciliation_scope,
        execution_mode,
        status,
        worker_id,
        started_at
    ) VALUES (
        p_org_id,
        p_scope,
        p_mode,
        'IN_PROGRESS',
        p_worker_id,
        now()
    ) RETURNING id INTO v_run_id;

    RETURN jsonb_build_object(
        'claimed', true,
        'run_id', v_run_id,
        'scope', p_scope,
        'mode', p_mode
    );
END;
$$;

-- 2. Emparejamiento de Identidad Externa
CREATE OR REPLACE FUNCTION public.match_external_identity(
    p_org_id UUID,
    p_entity_type TEXT,
    p_internal_id UUID,
    p_ext_system TEXT,
    p_ext_id TEXT,
    p_confidence TEXT DEFAULT 'EXACT_VERIFIED_MATCH'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.integration_external_identity_map (
        organization_id,
        entity_type,
        internal_entity_id,
        external_system,
        external_identifier,
        match_confidence,
        verified_by,
        verified_at,
        is_active
    ) VALUES (
        p_org_id,
        p_entity_type,
        p_internal_id,
        p_ext_system,
        p_ext_id,
        p_confidence,
        'SYSTEM_RECONCILIATION',
        now(),
        true
    )
    ON CONFLICT (organization_id, entity_type, external_system, external_identifier)
    DO UPDATE SET
        internal_entity_id = EXCLUDED.internal_entity_id,
        match_confidence = EXCLUDED.match_confidence,
        verified_at = now(),
        updated_at = now()
    RETURNING id INTO v_id;

    RETURN jsonb_build_object(
        'success', true,
        'mapping_id', v_id,
        'confidence', p_confidence
    );
END;
$$;

-- 3. Clasificar y Registrar Discrepancia
CREATE OR REPLACE FUNCTION public.classify_reconciliation_discrepancy(
    p_run_id UUID,
    p_org_id UUID,
    p_entity_type TEXT,
    p_internal_id UUID,
    p_ext_ref TEXT,
    p_src_sys TEXT,
    p_tgt_sys TEXT,
    p_disc_type TEXT,
    p_severity TEXT,
    p_auth_sys TEXT,
    p_expl TEXT,
    p_local_val JSONB DEFAULT '{}'::jsonb,
    p_ext_val JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_disc_id UUID;
    v_status TEXT;
    v_assigned_role TEXT;
BEGIN
    -- Clasificación inicial de estado
    IF p_disc_type = 'EXPECTED_ASYNCHRONOUS_DELAY' THEN
        v_status := 'EXPECTED_DIFFERENCE';
    ELSE
        v_status := 'CONFLICT_CONFIRMED';
    END IF;

    -- Asignación de rol según severidad y tipo
    IF p_severity IN ('SECURITY_RISK', 'FINANCIAL_RISK') OR p_disc_type = 'OKVET_CONFLICT' THEN
        v_assigned_role := 'DIRECTOR';
    ELSIF p_severity = 'CLINICAL_REVIEW_REQUIRED' THEN
        v_assigned_role := 'VETERINARIAN';
    ELSE
        v_assigned_role := 'OPERATIONS_COORDINATOR';
    END IF;

    INSERT INTO public.integration_reconciliation_discrepancies (
        run_id,
        organization_id,
        entity_type,
        internal_entity_id,
        external_reference,
        source_system,
        target_system,
        discrepancy_type,
        severity,
        status,
        authoritative_system,
        observed_local_value,
        observed_external_value,
        explanation,
        assigned_role
    ) VALUES (
        p_run_id,
        p_org_id,
        p_entity_type,
        p_internal_id,
        p_ext_ref,
        p_src_sys,
        p_tgt_sys,
        p_disc_type,
        p_severity,
        v_status,
        p_auth_sys,
        p_local_val,
        p_ext_val,
        p_expl,
        v_assigned_role
    ) RETURNING id INTO v_disc_id;

    -- Actualizar conteos en el run
    UPDATE public.integration_reconciliation_runs
    SET discrepancies_detected = discrepancies_detected + 1,
        expected_differences_count = expected_differences_count + (CASE WHEN v_status = 'EXPECTED_DIFFERENCE' THEN 1 ELSE 0 END),
        true_conflicts_count = true_conflicts_count + (CASE WHEN v_status = 'CONFLICT_CONFIRMED' THEN 1 ELSE 0 END)
    WHERE id = p_run_id;

    RETURN jsonb_build_object(
        'success', true,
        'discrepancy_id', v_disc_id,
        'status', v_status,
        'assigned_role', v_assigned_role
    );
END;
$$;

-- 4. Proponer Reparación Segura
CREATE OR REPLACE FUNCTION public.propose_safe_repair(
    p_discrepancy_id UUID,
    p_org_id UUID,
    p_repair_type TEXT,
    p_action TEXT,
    p_payload JSONB DEFAULT '{}'::jsonb,
    p_requires_approval BOOLEAN DEFAULT true,
    p_approver_role TEXT DEFAULT 'DIRECTOR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_proposal_id UUID;
    v_run_id UUID;
BEGIN
    SELECT run_id INTO v_run_id
    FROM public.integration_reconciliation_discrepancies
    WHERE id = p_discrepancy_id;

    INSERT INTO public.integration_repair_proposals (
        discrepancy_id,
        organization_id,
        repair_type,
        proposed_action,
        action_payload,
        requires_human_approval,
        approver_role,
        status
    ) VALUES (
        p_discrepancy_id,
        p_org_id,
        p_repair_type,
        p_action,
        p_payload,
        p_requires_approval,
        p_approver_role,
        'PENDING'
    ) RETURNING id INTO v_proposal_id;

    -- Actualizar discrepancia a REPAIR_PROPOSED o APPROVAL_PENDING
    UPDATE public.integration_reconciliation_discrepancies
    SET status = CASE WHEN p_requires_approval THEN 'APPROVAL_PENDING' ELSE 'APPROVED_FOR_SAFE_REPAIR' END,
        updated_at = now()
    WHERE id = p_discrepancy_id;

    IF v_run_id IS NOT NULL THEN
        UPDATE public.integration_reconciliation_runs
        SET repairs_proposed_count = repairs_proposed_count + 1
        WHERE id = v_run_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'proposal_id', v_proposal_id,
        'requires_approval', p_requires_approval
    );
END;
$$;

-- 5. Aprobar o Rechazar Reparación
CREATE OR REPLACE FUNCTION public.approve_reconciliation_repair(
    p_proposal_id UUID,
    p_org_id UUID,
    p_approver_id UUID,
    p_decision TEXT,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_disc_id UUID;
BEGIN
    IF p_decision NOT IN ('APPROVED', 'REJECTED') THEN
        RAISE EXCEPTION 'Decisión inválida: %', p_decision;
    END IF;

    SELECT discrepancy_id INTO v_disc_id
    FROM public.integration_repair_proposals
    WHERE id = p_proposal_id;

    INSERT INTO public.integration_repair_approvals (
        proposal_id,
        organization_id,
        approver_id,
        decision,
        decision_reason,
        decided_at
    ) VALUES (
        p_proposal_id,
        p_org_id,
        p_approver_id,
        p_decision,
        p_reason,
        now()
    );

    UPDATE public.integration_repair_proposals
    SET status = p_decision
    WHERE id = p_proposal_id;

    IF v_disc_id IS NOT NULL THEN
        UPDATE public.integration_reconciliation_discrepancies
        SET status = CASE WHEN p_decision = 'APPROVED' THEN 'APPROVED_FOR_SAFE_REPAIR' ELSE 'MANUAL_ACTION_REQUIRED' END,
            updated_at = now()
        WHERE id = v_disc_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'decision', p_decision,
        'proposal_id', p_proposal_id
    );
END;
$$;

-- 6. Ejecutar Reparación Autorizada y Segura
CREATE OR REPLACE FUNCTION public.execute_authorized_safe_repair(
    p_proposal_id UUID,
    p_org_id UUID,
    p_executor TEXT DEFAULT 'system'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_proposal RECORD;
    v_exec_id UUID;
    v_disc_id UUID;
    v_run_id UUID;
BEGIN
    SELECT * INTO v_proposal
    FROM public.integration_repair_proposals
    WHERE id = p_proposal_id AND organization_id = p_org_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Propuesta no encontrada: %', p_proposal_id;
    END IF;

    IF v_proposal.requires_human_approval AND v_proposal.status != 'APPROVED' THEN
        RAISE EXCEPTION 'La propuesta requiere aprobación formal previa (Estado actual: %)', v_proposal.status;
    END IF;

    v_disc_id := v_proposal.discrepancy_id;

    SELECT run_id INTO v_run_id
    FROM public.integration_reconciliation_discrepancies
    WHERE id = v_disc_id;

    INSERT INTO public.integration_repair_executions (
        proposal_id,
        organization_id,
        execution_status,
        applied_changes,
        executed_at
    ) VALUES (
        p_proposal_id,
        p_org_id,
        'APPLIED',
        jsonb_build_object('action', v_proposal.proposed_action, 'payload', v_proposal.action_payload, 'executor', p_executor),
        now()
    ) RETURNING id INTO v_exec_id;

    UPDATE public.integration_reconciliation_discrepancies
    SET status = 'REPAIR_APPLIED',
        updated_at = now()
    WHERE id = v_disc_id;

    IF v_run_id IS NOT NULL THEN
        UPDATE public.integration_reconciliation_runs
        SET repairs_applied_count = repairs_applied_count + 1
        WHERE id = v_run_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'execution_id', v_exec_id,
        'discrepancy_id', v_disc_id
    );
END;
$$;

-- 7. Verificar Resultado de Reparación (Re-check)
CREATE OR REPLACE FUNCTION public.verify_reconciliation_result(
    p_execution_id UUID,
    p_discrepancy_id UUID,
    p_org_id UUID,
    p_is_clean BOOLEAN,
    p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_run_id UUID;
BEGIN
    SELECT run_id INTO v_run_id
    FROM public.integration_reconciliation_discrepancies
    WHERE id = p_discrepancy_id;

    INSERT INTO public.integration_repair_verifications (
        repair_execution_id,
        discrepancy_id,
        organization_id,
        is_verified_clean,
        verification_notes,
        verified_at
    ) VALUES (
        p_execution_id,
        p_discrepancy_id,
        p_org_id,
        p_is_clean,
        p_notes,
        now()
    );

    UPDATE public.integration_reconciliation_discrepancies
    SET status = CASE WHEN p_is_clean THEN 'RECONCILED_VERIFIED' ELSE 'INVESTIGATION_REQUIRED' END,
        updated_at = now()
    WHERE id = p_discrepancy_id;

    IF v_run_id IS NOT NULL AND p_is_clean THEN
        UPDATE public.integration_reconciliation_runs
        SET repairs_verified_count = repairs_verified_count + 1
        WHERE id = v_run_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'is_clean', p_is_clean,
        'discrepancy_status', CASE WHEN p_is_clean THEN 'RECONCILED_VERIFIED' ELSE 'INVESTIGATION_REQUIRED' END
    );
END;
$$;

-- 8. Registro de Auditoría de Reconciliación
CREATE OR REPLACE FUNCTION public.record_reconciliation_audit(
    p_org_id UUID,
    p_event TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_actor TEXT DEFAULT 'system',
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.integration_reconciliation_audit (
        organization_id,
        event_name,
        entity_type,
        entity_id,
        actor,
        details,
        created_at
    ) VALUES (
        p_org_id,
        p_event,
        p_entity_type,
        p_entity_id,
        p_actor,
        p_details,
        now()
    ) RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- Revocación de permisos anon/PUBLIC en todas las 8 funciones RPC
REVOKE EXECUTE ON FUNCTION public.claim_reconciliation_run(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_reconciliation_run(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.match_external_identity(UUID, TEXT, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_external_identity(UUID, TEXT, UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.classify_reconciliation_discrepancy(UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.classify_reconciliation_discrepancy(UUID, UUID, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.propose_safe_repair(UUID, UUID, TEXT, TEXT, JSONB, BOOLEAN, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.propose_safe_repair(UUID, UUID, TEXT, TEXT, JSONB, BOOLEAN, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.approve_reconciliation_repair(UUID, UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_reconciliation_repair(UUID, UUID, UUID, TEXT, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.execute_authorized_safe_repair(UUID, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.execute_authorized_safe_repair(UUID, UUID, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.verify_reconciliation_result(UUID, UUID, UUID, BOOLEAN, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_reconciliation_result(UUID, UUID, UUID, BOOLEAN, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.record_reconciliation_audit(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_reconciliation_audit(UUID, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated, service_role;

-- ==============================================================================
-- SEMILLAS INICIALES DE CONECTORES Y POLÍTICAS (Para Organización Vet Life)
-- ==============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_conn_gcal UUID;
    v_conn_waba UUID;
    v_conn_okvet UUID;
    v_conn_outbox UUID;
    v_conn_wompi UUID;
    v_conn_dian UUID;
    v_conn_spec UUID;
BEGIN
    SELECT id INTO v_org_id FROM public.organizations WHERE slug = 'vet-life' LIMIT 1;
    IF v_org_id IS NULL THEN
        SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
    END IF;

    IF v_org_id IS NOT NULL THEN
        -- Conector Google Calendar
        INSERT INTO public.integration_connectors (
            organization_id, connector_key, display_name, provider, environment,
            authentication_type, verification_level, health_status
        ) VALUES (
            v_org_id, 'google_calendar', 'Google Calendar Operativo', 'google', 'SANDBOX',
            'OAUTH2', 'READ_VERIFIED', 'HEALTHY'
        ) ON CONFLICT (organization_id, connector_key) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_conn_gcal;

        -- Conector WhatsApp Business
        INSERT INTO public.integration_connectors (
            organization_id, connector_key, display_name, provider, environment,
            authentication_type, verification_level, health_status
        ) VALUES (
            v_org_id, 'whatsapp_business', 'WhatsApp Cloud API Meta', 'meta', 'SANDBOX',
            'WEBHOOK_HMAC', 'WEBHOOK_VERIFIED', 'HEALTHY'
        ) ON CONFLICT (organization_id, connector_key) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_conn_waba;

        -- Conector OKVET Asistido
        INSERT INTO public.integration_connectors (
            organization_id, connector_key, display_name, provider, environment,
            authentication_type, verification_level, health_status
        ) VALUES (
            v_org_id, 'okvet_assisted', 'OKVET Procedimiento Oficial Asistido', 'okvet', 'SANDBOX',
            'MANUAL_IMPORT', 'RECONCILIATION_VERIFIED', 'HEALTHY'
        ) ON CONFLICT (organization_id, connector_key) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_conn_okvet;

        -- Conector Supabase Outbox
        INSERT INTO public.integration_connectors (
            organization_id, connector_key, display_name, provider, environment,
            authentication_type, verification_level, health_status
        ) VALUES (
            v_org_id, 'supabase_outbox', 'Transactional Outbox Bus', 'supabase', 'SANDBOX',
            'SERVICE_ROLE', 'END_TO_END_VERIFIED', 'HEALTHY'
        ) ON CONFLICT (organization_id, connector_key) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_conn_outbox;

        -- Conector Pasarela de Pagos
        INSERT INTO public.integration_connectors (
            organization_id, connector_key, display_name, provider, environment,
            authentication_type, verification_level, health_status
        ) VALUES (
            v_org_id, 'wompi_payments', 'Wompi Pasarela Bancaria', 'wompi', 'SANDBOX',
            'API_KEY', 'READ_VERIFIED', 'HEALTHY'
        ) ON CONFLICT (organization_id, connector_key) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_conn_wompi;

        -- Conector Facturación DIAN
        INSERT INTO public.integration_connectors (
            organization_id, connector_key, display_name, provider, environment,
            authentication_type, verification_level, health_status
        ) VALUES (
            v_org_id, 'dian_invoicing', 'Sistema de Facturación DIAN', 'dian', 'SANDBOX',
            'API_KEY', 'CONFIGURATION_FOUND', 'HEALTHY'
        ) ON CONFLICT (organization_id, connector_key) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_conn_dian;

        -- Conector Especialistas Externos
        INSERT INTO public.integration_connectors (
            organization_id, connector_key, display_name, provider, environment,
            authentication_type, verification_level, health_status
        ) VALUES (
            v_org_id, 'specialist_portal', 'Red de Especialistas Externos', 'external_specialist', 'SANDBOX',
            'WEBHOOK_HMAC', 'RECONCILIATION_VERIFIED', 'HEALTHY'
        ) ON CONFLICT (organization_id, connector_key) DO UPDATE SET updated_at = now()
        RETURNING id INTO v_conn_spec;

        -- Políticas de Sincronización y Autoridad
        INSERT INTO public.integration_sync_policies (
            organization_id, entity_type, authoritative_system, secondary_systems,
            freshness_max_seconds, conflict_policy, human_approval_required
        ) VALUES
            (v_org_id, 'appointment', 'SUPABASE', ARRAY['GOOGLE_CALENDAR', 'OKVET'], 3600, 'AUTHORITY_FIRST', true),
            (v_org_id, 'visit', 'SUPABASE', ARRAY['OKVET'], 3600, 'AUTHORITY_FIRST', false),
            (v_org_id, 'clinical_record', 'OKVET', ARRAY['SUPABASE'], 86400, 'AUTHORITY_FIRST', true),
            (v_org_id, 'whatsapp_message', 'WHATSAPP_META', ARRAY['SUPABASE'], 1800, 'AUTHORITY_FIRST', false),
            (v_org_id, 'payment', 'PAYMENT_PROVIDER', ARRAY['SUPABASE'], 1800, 'AUTHORITY_FIRST', true),
            (v_org_id, 'invoice', 'DIAN', ARRAY['SUPABASE'], 86400, 'AUTHORITY_FIRST', true),
            (v_org_id, 'specialist_referral', 'SUPABASE', ARRAY['EXTERNAL_SPECIALIST', 'OKVET'], 7200, 'AUTHORITY_FIRST', true),
            (v_org_id, 'caregiver_authorization', 'SUPABASE', ARRAY[]::text[], 3600, 'AUTHORITY_FIRST', true),
            (v_org_id, 'post_visit_commitment', 'SUPABASE', ARRAY[]::text[], 3600, 'AUTHORITY_FIRST', false)
        ON CONFLICT (organization_id, entity_type) DO UPDATE SET authoritative_system = EXCLUDED.authoritative_system;

    END IF;
END $$;
