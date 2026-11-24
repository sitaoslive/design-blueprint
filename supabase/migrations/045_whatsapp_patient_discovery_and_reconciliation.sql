-- supabase/migrations/045_whatsapp_patient_discovery_and_reconciliation.sql
-- ==============================================================================
-- VET FREEDOM OS — MIGRACIÓN 045
-- VET WHATSAPP PATIENT DISCOVERY & OKVET RECONCILIATION ENGINE
-- Dirección Médica: Dr. Luis Eduardo Ríos
-- Dirección Estratégica: Alpha Vision Method
-- Fecha: 22 de Noviembre de 2026
-- ==============================================================================

-- 1. TABLA: okvet_snapshot_metadata
-- Registra metadatos de los conjuntos de datos exportados de OKVET para conciliación
CREATE TABLE IF NOT EXISTS public.okvet_snapshot_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    source_file_name TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    total_patients INTEGER NOT NULL DEFAULT 0,
    is_stale BOOLEAN NOT NULL DEFAULT FALSE,
    snapshot_payload JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE' | 'SUPERSEDED' | 'STALE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.okvet_snapshot_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_snapshot_metadata FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okvet_snapshot_metadata_org_policy" ON public.okvet_snapshot_metadata;
CREATE POLICY "okvet_snapshot_metadata_org_policy" ON public.okvet_snapshot_metadata
    FOR ALL TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

-- 2. TABLA: whatsapp_authorized_messages
-- Ingesta de mensajes comerciales autorizados recibidos por webhook oficial o exportación autorizada
CREATE TABLE IF NOT EXISTS public.whatsapp_authorized_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider_message_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    business_number_id TEXT NOT NULL,
    contact_reference TEXT NOT NULL,
    contact_name TEXT,
    direction TEXT NOT NULL DEFAULT 'INBOUND', -- 'INBOUND' | 'OUTBOUND'
    message_type TEXT NOT NULL DEFAULT 'TEXT',  -- 'TEXT' | 'AUDIO_TRANSCRIPTION' | 'DOCUMENT'
    message_text TEXT NOT NULL,
    media_url TEXT,
    message_timestamp TIMESTAMPTZ NOT NULL,
    source TEXT NOT NULL DEFAULT 'CLOUD_API', -- 'CLOUD_API' | 'CHAT_EXPORT' | 'BUSINESS_APP'
    processing_status TEXT NOT NULL DEFAULT 'PENDING_SCAN', -- 'PENDING_SCAN' | 'EVALUATED' | 'IGNORED_UNRELATED'
    is_business_scoped BOOLEAN NOT NULL DEFAULT TRUE,
    is_dog_related BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_whatsapp_authorized_msg_provider UNIQUE (organization_id, provider_message_id)
);

ALTER TABLE public.whatsapp_authorized_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_authorized_messages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_authorized_messages_org_policy" ON public.whatsapp_authorized_messages;
CREATE POLICY "whatsapp_authorized_messages_org_policy" ON public.whatsapp_authorized_messages
    FOR ALL TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_msgs_scan_status 
ON public.whatsapp_authorized_messages (organization_id, processing_status, message_timestamp);

-- 3. TABLA: whatsapp_scan_runs
-- Registra cada ejecución de auditoría programada de 5 días o manual
CREATE TABLE IF NOT EXISTS public.whatsapp_scan_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    finished_at TIMESTAMPTZ,
    scan_mode TEXT NOT NULL DEFAULT 'SCHEDULED_5D', -- 'SCHEDULED_5D' | 'MANUAL_TRIGGER' | 'CHAT_EXPORT'
    messages_evaluated_count INTEGER NOT NULL DEFAULT 0,
    conversations_evaluated_count INTEGER NOT NULL DEFAULT 0,
    candidates_identified_count INTEGER NOT NULL DEFAULT 0,
    potential_missing_count INTEGER NOT NULL DEFAULT 0,
    ambiguous_count INTEGER NOT NULL DEFAULT 0,
    already_matched_count INTEGER NOT NULL DEFAULT 0,
    okvet_snapshot_id UUID REFERENCES public.okvet_snapshot_metadata(id),
    okvet_snapshot_fresh BOOLEAN NOT NULL DEFAULT TRUE,
    checkpoint_before TIMESTAMPTZ,
    checkpoint_after TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'RUNNING', -- 'RUNNING' | 'COMPLETED' | 'BLOCKED' | 'FAILED'
    block_reason TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.whatsapp_scan_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_scan_runs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_scan_runs_org_policy" ON public.whatsapp_scan_runs;
CREATE POLICY "whatsapp_scan_runs_org_policy" ON public.whatsapp_scan_runs
    FOR ALL TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

-- 4. TABLA: whatsapp_message_checkpoints
-- Mantiene el cursor temporal del último mensaje procesado durablemente
CREATE TABLE IF NOT EXISTS public.whatsapp_message_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'WHATSAPP_BUSINESS',
    last_processed_timestamp TIMESTAMPTZ NOT NULL,
    last_message_id TEXT,
    last_scan_run_id UUID REFERENCES public.whatsapp_scan_runs(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_whatsapp_checkpoint_channel UNIQUE (organization_id, channel)
);

ALTER TABLE public.whatsapp_message_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_checkpoints FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_checkpoints_org_policy" ON public.whatsapp_message_checkpoints;
CREATE POLICY "whatsapp_checkpoints_org_policy" ON public.whatsapp_message_checkpoints
    FOR ALL TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

-- 5. TABLA: whatsapp_patient_candidates
-- Almacena los pacientes caninos candidatos identificados en las conversaciones
CREATE TABLE IF NOT EXISTS public.whatsapp_patient_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    scan_run_id UUID NOT NULL REFERENCES public.whatsapp_scan_runs(id) ON DELETE CASCADE,
    conversation_reference TEXT NOT NULL,
    contact_reference TEXT NOT NULL,
    contact_name TEXT,
    candidate_pet_name TEXT, -- Puede ser null si es recuento sin nombre ("tengo 2 perros")
    candidate_species TEXT NOT NULL DEFAULT 'CANINE',
    service_intent TEXT NOT NULL, -- 'VACCINATION', 'CONSULTATION', 'CONTROL', 'MEDICATION', 'EMERGENCY', 'SPECIALIST', 'NEW_PATIENT', 'OTHER'
    mentioned_date TIMESTAMPTZ,
    mentioned_veterinarian TEXT,
    unresolved_pet_count INTEGER DEFAULT 1,
    confidence_score NUMERIC(4,3) NOT NULL DEFAULT 0.850,
    match_status TEXT NOT NULL DEFAULT 'POTENTIAL_MISSING_PATIENT', 
    -- 'MATCHED_EXISTING', 'POTENTIAL_MISSING_PATIENT', 'AMBIGUOUS_MATCH', 'INSUFFICIENT_EVIDENCE', 'NOT_A_PATIENT_INQUIRY', 'OKVET_SNAPSHOT_STALE'
    matched_pet_id UUID REFERENCES public.pets(id),
    matched_okvet_patient_id TEXT,
    match_reason TEXT,
    review_status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    -- 'PENDING_REVIEW', 'CONFIRMED_ALREADY_EXISTS', 'CONFIRMED_MISSING_REGISTERED', 'DISMISSED_NOT_A_PATIENT', 'POSTPONED_REVIEW_LATER', 'MORE_INFO_REQUESTED'
    reviewed_by UUID REFERENCES public.user_profiles(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    registration_task_id UUID REFERENCES public.operational_tasks(id),
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.whatsapp_patient_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_patient_candidates FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_patient_candidates_org_policy" ON public.whatsapp_patient_candidates;
CREATE POLICY "whatsapp_patient_candidates_org_policy" ON public.whatsapp_patient_candidates
    FOR ALL TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

CREATE INDEX IF NOT EXISTS idx_whatsapp_candidates_review 
ON public.whatsapp_patient_candidates (organization_id, review_status, match_status);

-- 6. TABLA: whatsapp_candidate_evidence
-- Almacena fragmentos mínimos de texto y mensaje fuente sanitizados
CREATE TABLE IF NOT EXISTS public.whatsapp_candidate_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.whatsapp_patient_candidates(id) ON DELETE CASCADE,
    source_message_id TEXT NOT NULL,
    message_timestamp TIMESTAMPTZ NOT NULL,
    redacted_excerpt TEXT NOT NULL,
    redaction_applied BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.whatsapp_candidate_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_candidate_evidence FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_candidate_evidence_policy" ON public.whatsapp_candidate_evidence;
CREATE POLICY "whatsapp_candidate_evidence_policy" ON public.whatsapp_candidate_evidence
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.whatsapp_patient_candidates c
        WHERE c.id = public.whatsapp_candidate_evidence.candidate_id
        AND c.organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    ));

-- 7. TABLA: whatsapp_patient_match_decisions
-- Registro inmutable de cada decisión tomada por Luis o el equipo
CREATE TABLE IF NOT EXISTS public.whatsapp_patient_match_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.whatsapp_patient_candidates(id) ON DELETE CASCADE,
    decision TEXT NOT NULL, 
    -- 'YA_EXISTE_OKVET', 'NO_ESTA_REGISTRADO', 'NO_ES_PACIENTE', 'REVISAR_DESPUES', 'PEDIR_MAS_INFO'
    linked_pet_id UUID REFERENCES public.pets(id),
    linked_okvet_patient_id TEXT,
    decided_by UUID NOT NULL REFERENCES public.user_profiles(id),
    decided_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    decision_notes TEXT,
    action_taken TEXT, -- 'CREATED_REGISTRATION_TASK', 'LINKED_OKVET', 'CLOSED_CASE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.whatsapp_patient_match_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_patient_match_decisions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_decisions_policy" ON public.whatsapp_patient_match_decisions;
CREATE POLICY "whatsapp_decisions_policy" ON public.whatsapp_patient_match_decisions
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.whatsapp_patient_candidates c
        WHERE c.id = public.whatsapp_patient_match_decisions.candidate_id
        AND c.organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    ));

-- 8. TABLA: whatsapp_discovery_alerts
-- Alerta ejecutiva para Luis tras cada escaneo
CREATE TABLE IF NOT EXISTS public.whatsapp_discovery_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    scan_run_id UUID NOT NULL REFERENCES public.whatsapp_scan_runs(id) ON DELETE CASCADE,
    recipient_user_id UUID NOT NULL REFERENCES public.user_profiles(id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    potential_missing_count INTEGER NOT NULL DEFAULT 0,
    ambiguous_count INTEGER NOT NULL DEFAULT 0,
    already_matched_count INTEGER NOT NULL DEFAULT 0,
    action_link TEXT NOT NULL DEFAULT '/admin/pacientes/descubrimiento',
    delivery_channel TEXT NOT NULL DEFAULT 'INTERNAL_DASHBOARD',
    delivery_status TEXT NOT NULL DEFAULT 'DELIVERED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.whatsapp_discovery_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_discovery_alerts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_discovery_alerts_org_policy" ON public.whatsapp_discovery_alerts;
CREATE POLICY "whatsapp_discovery_alerts_org_policy" ON public.whatsapp_discovery_alerts
    FOR ALL TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

-- 9. TABLA DE BLOQUEO DISTRIBUIDO (LOCK): whatsapp_discovery_execution_locks
CREATE TABLE IF NOT EXISTS public.whatsapp_discovery_execution_locks (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    locked_by TEXT NOT NULL,
    locked_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.whatsapp_discovery_execution_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_discovery_execution_locks FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "whatsapp_discovery_locks_org_policy" ON public.whatsapp_discovery_execution_locks;
CREATE POLICY "whatsapp_discovery_locks_org_policy" ON public.whatsapp_discovery_execution_locks
    FOR ALL TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

-- 10. FUNCIONES RPC ATÓMICAS PROTEGIDAS

-- A) Bloqueo distribuido
CREATE OR REPLACE FUNCTION public.acquire_patient_discovery_lock(
    p_org_id UUID,
    p_duration_seconds INTEGER DEFAULT 600,
    p_locked_by TEXT DEFAULT 'n8n-wa-patient-05d'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_now TIMESTAMPTZ := clock_timestamp();
    v_expires_at TIMESTAMPTZ := v_now + (p_duration_seconds || ' seconds')::interval;
    v_existing_lock RECORD;
BEGIN
    SELECT * INTO v_existing_lock
    FROM public.whatsapp_discovery_execution_locks
    WHERE organization_id = p_org_id
    FOR UPDATE;

    IF FOUND THEN
        IF v_existing_lock.expires_at > v_now THEN
            RETURN jsonb_build_object(
                'acquired', false,
                'reason', 'LOCK_HELD',
                'locked_by', v_existing_lock.locked_by,
                'expires_at', v_existing_lock.expires_at
            );
        ELSE
            UPDATE public.whatsapp_discovery_execution_locks
            SET locked_by = p_locked_by,
                locked_at = v_now,
                expires_at = v_expires_at
            WHERE organization_id = p_org_id;

            RETURN jsonb_build_object('acquired', true, 'expires_at', v_expires_at);
        END IF;
    ELSE
        INSERT INTO public.whatsapp_discovery_execution_locks (organization_id, locked_by, locked_at, expires_at)
        VALUES (p_org_id, p_locked_by, v_now, v_expires_at);

        RETURN jsonb_build_object('acquired', true, 'expires_at', v_expires_at);
    END IF;
END;
$$;

-- B) Liberación del bloqueo
CREATE OR REPLACE FUNCTION public.release_patient_discovery_lock(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.whatsapp_discovery_execution_locks WHERE organization_id = p_org_id;
    RETURN true;
END;
$$;

-- C) Registro de Decisión de Luis
CREATE OR REPLACE FUNCTION public.record_patient_discovery_decision(
    p_candidate_id UUID,
    p_decision TEXT,
    p_decided_by UUID,
    p_linked_pet_id UUID DEFAULT NULL,
    p_linked_okvet_id TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cand RECORD;
    v_new_review_status TEXT;
    v_action_taken TEXT;
    v_task_id UUID := NULL;
    v_now TIMESTAMPTZ := clock_timestamp();
BEGIN
    SELECT * INTO v_cand
    FROM public.whatsapp_patient_candidates
    WHERE id = p_candidate_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'CANDIDATE_NOT_FOUND');
    END IF;

    CASE p_decision
        WHEN 'YA_EXISTE_OKVET' THEN
            v_new_review_status := 'CONFIRMED_ALREADY_EXISTS';
            v_action_taken := 'LINKED_EXISTING_OKVET';
        WHEN 'NO_ESTA_REGISTRADO' THEN
            v_new_review_status := 'CONFIRMED_MISSING_REGISTERED';
            v_action_taken := 'CREATED_REGISTRATION_TASK';

            -- Crear tarea operativa para registro humano asistido
            INSERT INTO public.operational_tasks (
                organization_id,
                title,
                task_type,
                due_at,
                priority,
                owner_team,
                assigned_user_id,
                description,
                source_system,
                source_entity_type,
                source_entity_id,
                is_clinically_sensitive
            ) VALUES (
                v_cand.organization_id,
                'Registrar paciente detectado en WhatsApp: ' || COALESCE(v_cand.candidate_pet_name, 'Sin nombre'),
                'PATIENT_REGISTRATION',
                v_now + interval '24 hours',
                'HIGH',
                'RECEPTION',
                p_decided_by,
                'Paciente canino detectado en conversación comercial WhatsApp (' || v_cand.contact_reference || '). Confirmado por el Dr. Luis Eduardo Ríos para registro asistido en OKVET Cloud.',
                'WHATSAPP_DISCOVERY',
                'whatsapp_patient_candidates',
                v_cand.id,
                true
            ) RETURNING id INTO v_task_id;

        WHEN 'NO_ES_PACIENTE' THEN
            v_new_review_status := 'DISMISSED_NOT_A_PATIENT';
            v_action_taken := 'DISMISSED';
        WHEN 'REVISAR_DESPUES' THEN
            v_new_review_status := 'POSTPONED_REVIEW_LATER';
            v_action_taken := 'POSTPONED';
        WHEN 'PEDIR_MAS_INFO' THEN
            v_new_review_status := 'MORE_INFO_REQUESTED';
            v_action_taken := 'MORE_INFO_PREPARED';
        ELSE
            RETURN jsonb_build_object('success', false, 'error', 'INVALID_DECISION');
    END CASE;

    -- Actualizar candidato
    UPDATE public.whatsapp_patient_candidates
    SET review_status = v_new_review_status,
        reviewed_by = p_decided_by,
        reviewed_at = v_now,
        review_notes = p_notes,
        matched_pet_id = COALESCE(p_linked_pet_id, matched_pet_id),
        matched_okvet_patient_id = COALESCE(p_linked_okvet_id, matched_okvet_patient_id),
        registration_task_id = COALESCE(v_task_id, registration_task_id),
        updated_at = v_now
    WHERE id = p_candidate_id;

    -- Insertar decisión en bitácora inmutable
    INSERT INTO public.whatsapp_patient_match_decisions (
        candidate_id,
        decision,
        linked_pet_id,
        linked_okvet_patient_id,
        decided_by,
        decided_at,
        decision_notes,
        action_taken
    ) VALUES (
        p_candidate_id,
        p_decision,
        p_linked_pet_id,
        p_linked_okvet_id,
        p_decided_by,
        v_now,
        p_notes,
        v_action_taken
    );

    RETURN jsonb_build_object(
        'success', true,
        'candidate_id', p_candidate_id,
        'review_status', v_new_review_status,
        'action_taken', v_action_taken,
        'task_id', v_task_id
    );
END;
$$;

-- D) Métricas para el Panel de Control de Luis
CREATE OR REPLACE FUNCTION public.get_patient_discovery_dashboard_metrics(p_org_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_last_scan RECORD;
    v_last_msg RECORD;
    v_last_snapshot RECORD;
    v_counts RECORD;
BEGIN
    SELECT * INTO v_last_scan
    FROM public.whatsapp_scan_runs
    WHERE organization_id = p_org_id AND status = 'COMPLETED'
    ORDER BY finished_at DESC
    LIMIT 1;

    SELECT message_timestamp INTO v_last_msg
    FROM public.whatsapp_authorized_messages
    WHERE organization_id = p_org_id
    ORDER BY message_timestamp DESC
    LIMIT 1;

    SELECT snapshot_date, is_stale, total_patients INTO v_last_snapshot
    FROM public.okvet_snapshot_metadata
    WHERE organization_id = p_org_id AND status = 'ACTIVE'
    ORDER BY snapshot_date DESC
    LIMIT 1;

    SELECT 
        COUNT(*) FILTER (WHERE match_status = 'POTENTIAL_MISSING_PATIENT' AND review_status = 'PENDING_REVIEW') as potential_missing,
        COUNT(*) FILTER (WHERE match_status = 'AMBIGUOUS_MATCH' AND review_status = 'PENDING_REVIEW') as ambiguous_matches,
        COUNT(*) FILTER (WHERE match_status = 'MATCHED_EXISTING') as already_matched,
        COUNT(*) FILTER (WHERE review_status = 'PENDING_REVIEW') as awaiting_review,
        COUNT(*) FILTER (WHERE review_status != 'PENDING_REVIEW') as resolved_cases
    INTO v_counts
    FROM public.whatsapp_patient_candidates
    WHERE organization_id = p_org_id;

    RETURN jsonb_build_object(
        'last_successful_scan_at', v_last_scan.finished_at,
        'last_whatsapp_message_at', v_last_msg.message_timestamp,
        'last_okvet_snapshot_date', v_last_snapshot.snapshot_date,
        'okvet_snapshot_is_stale', COALESCE(v_last_snapshot.is_stale, true),
        'total_okvet_patients_indexed', COALESCE(v_last_snapshot.total_patients, 0),
        'total_conversations_evaluated', COALESCE(v_last_scan.conversations_evaluated_count, 0),
        'potential_missing_patients', v_counts.potential_missing,
        'ambiguous_matches', v_counts.ambiguous_matches,
        'already_matched_patients', v_counts.already_matched,
        'cases_awaiting_review', v_counts.awaiting_review,
        'cases_resolved', v_counts.resolved_cases
    );
END;
$$;

-- 11. HABILITACIÓN DE REALTIME PARA ALERTAS Y CANDIDATOS
ALTER TABLE public.whatsapp_patient_candidates REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_discovery_alerts REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'whatsapp_patient_candidates'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE 
            public.whatsapp_patient_candidates,
            public.whatsapp_discovery_alerts;
    END IF;
END $$;

-- 12. ENDURECIMIENTO DE SEGURIDAD (Revocar a anon)
REVOKE EXECUTE ON FUNCTION public.acquire_patient_discovery_lock(UUID, INTEGER, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.release_patient_discovery_lock(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_patient_discovery_decision(UUID, TEXT, UUID, UUID, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_patient_discovery_dashboard_metrics(UUID) FROM anon;
