-- ==============================================================================
-- VET FREEDOM OS — MIGRACIÓN 034
-- VET-CORE-12 | POST-VISIT COMMITMENTS & CARE CONTINUITY HUB
-- Dirección Médica: Dr. Luis Eduardo Ríos
-- Dirección Estratégica: Alpha Vision Method
-- Plataforma: PostgreSQL 17 (Supabase Managed)
-- ==============================================================================

-- 1. CASOS DE CONTINUIDAD POST-VISITA
CREATE TABLE IF NOT EXISTS public.post_visit_cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    visit_id uuid NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    appointment_id uuid NOT NULL REFERENCES public.appointments(id),
    owner_id uuid NOT NULL REFERENCES public.owners(id),
    pet_id uuid NOT NULL REFERENCES public.pets(id),
    veterinarian_id uuid NOT NULL REFERENCES public.staff_profiles(id),
    case_status text NOT NULL DEFAULT 'ACTIVE_CONTINUITY' CHECK (
        case_status IN (
            'ACTIVE_CONTINUITY',
            'WAITING_EXTERNALS',
            'BLOCKED_REQUIRES_ATTENTION',
            'READY_FOR_CLOSURE',
            'CLOSED_VERIFIED',
            'CLOSED_WITH_EXCEPTION'
        )
    ),
    operational_closed_at timestamptz,
    operational_closed_by uuid REFERENCES public.staff_profiles(id),
    administrative_closed_at timestamptz,
    administrative_closed_by uuid REFERENCES public.staff_profiles(id),
    clinical_closed_at timestamptz,
    clinical_closed_by uuid REFERENCES public.staff_profiles(id),
    continuity_closed_at timestamptz,
    continuity_closed_by uuid REFERENCES public.staff_profiles(id),
    has_pending_referrals boolean NOT NULL DEFAULT false,
    has_pending_documents boolean NOT NULL DEFAULT false,
    has_pending_reports boolean NOT NULL DEFAULT false,
    has_customer_promises boolean NOT NULL DEFAULT false,
    open_commitments_count integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_post_visit_cases_visit UNIQUE (visit_id)
);

-- 2. CHECKLIST DE CIERRE DE VISITA
CREATE TABLE IF NOT EXISTS public.post_visit_checklists (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES public.post_visit_cases(id) ON DELETE CASCADE,
    visit_id uuid NOT NULL REFERENCES public.visits(id),
    service_type text NOT NULL DEFAULT 'CONSULTA_DOMICILIARIA',
    patient_confirmed boolean NOT NULL DEFAULT false,
    professional_confirmed boolean NOT NULL DEFAULT false,
    operational_finish_confirmed boolean NOT NULL DEFAULT false,
    incidents_recorded boolean NOT NULL DEFAULT false,
    okvet_record_confirmed boolean NOT NULL DEFAULT false,
    pending_documents_flag boolean NOT NULL DEFAULT false,
    pending_results_flag boolean NOT NULL DEFAULT false,
    pending_referrals_flag boolean NOT NULL DEFAULT false,
    future_appointments_indicated boolean NOT NULL DEFAULT false,
    client_promises_recorded boolean NOT NULL DEFAULT false,
    responsible_assigned boolean NOT NULL DEFAULT false,
    review_needed_flag boolean NOT NULL DEFAULT false,
    checklist_completed boolean NOT NULL DEFAULT false,
    completed_by uuid REFERENCES public.staff_profiles(id),
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_post_visit_checklists_case UNIQUE (case_id)
);

CREATE TABLE IF NOT EXISTS public.post_visit_checklist_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    checklist_id uuid NOT NULL REFERENCES public.post_visit_checklists(id) ON DELETE CASCADE,
    item_key text NOT NULL,
    item_label text NOT NULL,
    is_mandatory boolean NOT NULL DEFAULT true,
    status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'WAIVED', 'NOT_APPLICABLE')),
    value jsonb,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. AJUSTE Y ENRIQUECIMIENTO DE COMPROMISOS POST-VISITA
ALTER TABLE public.post_visit_commitments
    ADD COLUMN IF NOT EXISTS case_id uuid REFERENCES public.post_visit_cases(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'VISIT_CHECKLIST',
    ADD COLUMN IF NOT EXISTS source_reference text,
    ADD COLUMN IF NOT EXISTS source_version integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS source_provenance text NOT NULL DEFAULT 'VERIFIED' CHECK (
        source_provenance IN ('VERIFIED', 'REPORTED', 'INFERRED', 'PENDING_CONFIRMATION', 'STALE', 'CONFLICTING')
    ),
    ADD COLUMN IF NOT EXISTS responsible_team_id text DEFAULT 'COORDINATION',
    ADD COLUMN IF NOT EXISTS assigned_staff_id uuid REFERENCES public.staff_profiles(id),
    ADD COLUMN IF NOT EXISTS assignment_status text NOT NULL DEFAULT 'ASSIGNMENT_PROPOSED' CHECK (
        assignment_status IN (
            'ASSIGNMENT_PROPOSED',
            'ASSIGNMENT_NOTIFIED',
            'ASSIGNMENT_ACCEPTED',
            'ASSIGNMENT_DECLINED',
            'ASSIGNMENT_EXPIRED',
            'ASSIGNMENT_REASSIGNED'
        )
    ),
    ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'NORMAL' CHECK (
        priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT_CLINICAL', 'CRITICAL_P0')
    ),
    ADD COLUMN IF NOT EXISTS due_at timestamptz,
    ADD COLUMN IF NOT EXISTS review_at timestamptz,
    ADD COLUMN IF NOT EXISTS blocking_reason text,
    ADD COLUMN IF NOT EXISTS requires_professional_review boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS requires_evidence boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS completion_reference text,
    ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES public.staff_profiles(id),
    ADD COLUMN IF NOT EXISTS verified_at timestamptz,
    ADD COLUMN IF NOT EXISTS state_version integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS correlation_id text,
    ADD COLUMN IF NOT EXISTS idempotency_key text,
    ADD COLUMN IF NOT EXISTS snooze_count integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_snooze_allowed integer NOT NULL DEFAULT 3;

-- 4. VERSIONES INMUTABLES DE COMPROMISOS (v1..vn)
CREATE TABLE IF NOT EXISTS public.post_visit_commitment_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id uuid NOT NULL REFERENCES public.post_visit_commitments(id) ON DELETE CASCADE,
    version_number integer NOT NULL,
    status text NOT NULL,
    assigned_staff_id uuid REFERENCES public.staff_profiles(id),
    due_at timestamptz,
    snapshot jsonb NOT NULL,
    changed_by uuid REFERENCES public.staff_profiles(id),
    change_reason text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_post_visit_commitment_versions UNIQUE (commitment_id, version_number)
);

-- 5. ASIGNACIONES Y DELEGACIONES (WF3-043)
CREATE TABLE IF NOT EXISTS public.post_visit_commitment_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id uuid NOT NULL REFERENCES public.post_visit_commitments(id) ON DELETE CASCADE,
    previous_staff_id uuid REFERENCES public.staff_profiles(id),
    assigned_staff_id uuid NOT NULL REFERENCES public.staff_profiles(id),
    assigned_by uuid REFERENCES public.staff_profiles(id),
    assignment_role text NOT NULL,
    delegation_reason text,
    is_founder_absence boolean NOT NULL DEFAULT false,
    acceptance_status text NOT NULL DEFAULT 'PENDING_ACCEPTANCE' CHECK (
        acceptance_status IN ('PENDING_ACCEPTANCE', 'ACCEPTED', 'DECLINED', 'EXPIRED')
    ),
    accepted_at timestamptz,
    declined_reason text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. POSPOSICIONES DE COMPROMISOS (WF3-042 - SNOOZE)
CREATE TABLE IF NOT EXISTS public.post_visit_commitment_snooze_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id uuid NOT NULL REFERENCES public.post_visit_commitments(id) ON DELETE CASCADE,
    previous_due_at timestamptz NOT NULL,
    new_due_at timestamptz NOT NULL,
    snooze_reason text NOT NULL,
    snooze_number integer NOT NULL,
    requested_by uuid NOT NULL REFERENCES public.staff_profiles(id),
    approved_by uuid REFERENCES public.staff_profiles(id),
    requires_approval boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. ESCALAMIENTO DE COMPROMISOS VENCIDOS O BLOQUEADOS (WFX-010)
CREATE TABLE IF NOT EXISTS public.post_visit_commitment_escalations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id uuid NOT NULL REFERENCES public.post_visit_commitments(id) ON DELETE CASCADE,
    escalation_level text NOT NULL CHECK (
        escalation_level IN ('LEVEL_1_STAFF_REMINDER', 'LEVEL_2_SENIOR_COORDINATOR', 'LEVEL_3_MEDICAL_DIRECTOR')
    ),
    reason text NOT NULL,
    escalated_by text NOT NULL DEFAULT 'SYSTEM_WATCHDOG',
    escalated_to_staff_id uuid REFERENCES public.staff_profiles(id),
    status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED')),
    resolved_at timestamptz,
    resolution_notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. DOCUMENTOS PENDIENTES DE ENTREGA / APROBACIÓN (WF3-045 a WF3-047)
CREATE TABLE IF NOT EXISTS public.post_visit_pending_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES public.post_visit_cases(id) ON DELETE CASCADE,
    commitment_id uuid REFERENCES public.post_visit_commitments(id) ON DELETE SET NULL,
    document_type text NOT NULL,
    title text NOT NULL,
    status text NOT NULL DEFAULT 'REQUESTED' CHECK (
        status IN ('REQUESTED', 'PREPARED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SHARED_SECURELY')
    ),
    responsible_staff_id uuid REFERENCES public.staff_profiles(id),
    approved_by uuid REFERENCES public.staff_profiles(id),
    approved_at timestamptz,
    storage_path text,
    core13_delivery_reference text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. INFORMES PENDIENTES DE RECEPCIÓN / REVISIÓN (WF3-048 a WF3-050)
CREATE TABLE IF NOT EXISTS public.post_visit_pending_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES public.post_visit_cases(id) ON DELETE CASCADE,
    commitment_id uuid REFERENCES public.post_visit_commitments(id) ON DELETE SET NULL,
    referral_id uuid REFERENCES public.specialist_referrals(id) ON DELETE SET NULL,
    report_type text NOT NULL,
    external_entity_name text NOT NULL,
    status text NOT NULL DEFAULT 'EXPECTED' CHECK (
        status IN (
            'EXPECTED',
            'WAITING_EXTERNAL',
            'REPORT_RECEIVED',
            'PENDING_CLINICAL_REVIEW',
            'REVIEWED_COMPLIANT',
            'CLARIFICATION_REQUIRED'
        )
    ),
    received_at timestamptz,
    reviewed_by uuid REFERENCES public.staff_profiles(id),
    reviewed_at timestamptz,
    review_decision text,
    review_notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. PROMESAS AL TUTOR EXTRAÍDAS Y GESTIONADAS (WFX-009)
CREATE TABLE IF NOT EXISTS public.post_visit_customer_promises (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES public.post_visit_cases(id) ON DELETE CASCADE,
    commitment_id uuid REFERENCES public.post_visit_commitments(id) ON DELETE SET NULL,
    promise_text text NOT NULL,
    promised_by text NOT NULL,
    extracted_by_ai boolean NOT NULL DEFAULT false,
    confidence_score numeric(4,3) DEFAULT 1.000,
    verification_status text NOT NULL DEFAULT 'PENDING_HUMAN_VALIDATION' CHECK (
        verification_status IN (
            'PENDING_HUMAN_VALIDATION',
            'VALIDATED_PROMISE',
            'REJECTED_HALLUCINATION',
            'RESOLVED_FULFILLED'
        )
    ),
    validated_by uuid REFERENCES public.staff_profiles(id),
    due_at timestamptz,
    fulfilled_at timestamptz,
    fulfillment_evidence text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. RELEVO Y CONTINUIDAD ENTRE PROFESIONALES (WFX-008)
CREATE TABLE IF NOT EXISTS public.post_visit_continuity_handoffs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES public.post_visit_cases(id) ON DELETE CASCADE,
    outgoing_veterinarian_id uuid NOT NULL REFERENCES public.staff_profiles(id),
    incoming_veterinarian_id uuid NOT NULL REFERENCES public.staff_profiles(id),
    clinical_summary_brief text NOT NULL,
    open_commitments_snapshot jsonb NOT NULL,
    accepted_by_incoming boolean NOT NULL DEFAULT false,
    accepted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. COMPROBACIONES PRE-CIERRE (CLOSURE GATE)
CREATE TABLE IF NOT EXISTS public.post_visit_closure_checks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES public.post_visit_cases(id) ON DELETE CASCADE,
    checked_by uuid NOT NULL REFERENCES public.staff_profiles(id),
    open_commitments_found integer NOT NULL DEFAULT 0,
    unreviewed_reports_found integer NOT NULL DEFAULT 0,
    undelivered_documents_found integer NOT NULL DEFAULT 0,
    gate_passed boolean NOT NULL DEFAULT false,
    blocking_reasons jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. AUDITORÍA INMUTABLE DE CONTINUIDAD
CREATE TABLE IF NOT EXISTS public.post_visit_audit (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid REFERENCES public.post_visit_cases(id) ON DELETE CASCADE,
    commitment_id uuid REFERENCES public.post_visit_commitments(id) ON DELETE SET NULL,
    action text NOT NULL,
    actor_id uuid REFERENCES public.staff_profiles(id),
    payload jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ÍNDICES DE RENDIMIENTO E IDEMPOTENCIA
CREATE INDEX IF NOT EXISTS idx_post_visit_cases_org ON public.post_visit_cases(organization_id);
CREATE INDEX IF NOT EXISTS idx_post_visit_cases_visit ON public.post_visit_cases(visit_id);
CREATE INDEX IF NOT EXISTS idx_post_visit_cases_status ON public.post_visit_cases(case_status);

CREATE INDEX IF NOT EXISTS idx_post_visit_commitments_case ON public.post_visit_commitments(case_id);
CREATE INDEX IF NOT EXISTS idx_post_visit_commitments_status ON public.post_visit_commitments(status);
CREATE INDEX IF NOT EXISTS idx_post_visit_commitments_assigned ON public.post_visit_commitments(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_post_visit_commitments_due ON public.post_visit_commitments(due_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_post_visit_commitments_idempotency 
    ON public.post_visit_commitments(organization_id, idempotency_key) 
    WHERE idempotency_key IS NOT NULL;

-- ==============================================================================
-- STORED PROCEDURES (RPCS)
-- ==============================================================================

-- RPC 1: Inicializar o recuperar Caso Post-Visita
CREATE OR REPLACE FUNCTION public.create_or_init_post_visit_case(
    p_visit_id uuid,
    p_organization_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_visit record;
    v_case record;
BEGIN
    SELECT * INTO v_visit FROM public.visits WHERE id = p_visit_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Visita % no encontrada.', p_visit_id;
    END IF;

    SELECT * INTO v_case FROM public.post_visit_cases WHERE visit_id = p_visit_id;
    IF FOUND THEN
        RETURN jsonb_build_object('success', true, 'case_id', v_case.id, 'status', v_case.case_status, 'is_new', false);
    END IF;

    INSERT INTO public.post_visit_cases (
        organization_id,
        visit_id,
        appointment_id,
        owner_id,
        pet_id,
        veterinarian_id,
        case_status
    )
    SELECT
        p_organization_id,
        v_visit.id,
        a.id,
        a.owner_id,
        a.pet_id,
        v_visit.veterinarian_id,
        'ACTIVE_CONTINUITY'
    FROM public.appointments a
    WHERE a.id = v_visit.appointment_id
    RETURNING * INTO v_case;

    INSERT INTO public.post_visit_checklists (
        case_id,
        visit_id,
        service_type
    ) VALUES (
        v_case.id,
        v_visit.id,
        'CONSULTA_DOMICILIARIA'
    );

    INSERT INTO public.post_visit_audit (case_id, action, payload)
    VALUES (v_case.id, 'CASE_INITIALIZED', jsonb_build_object('visit_id', p_visit_id));

    RETURN jsonb_build_object('success', true, 'case_id', v_case.id, 'status', v_case.case_status, 'is_new', true);
END;
$$;

-- RPC 2: Registrar checklist de cierre de visita
CREATE OR REPLACE FUNCTION public.record_post_visit_checklist(
    p_case_id uuid,
    p_service_type text,
    p_checklist_payload jsonb,
    p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_case record;
    v_chk_id uuid;
BEGIN
    SELECT * INTO v_case FROM public.post_visit_cases WHERE id = p_case_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caso de post-visita % no encontrado.', p_case_id;
    END IF;

    UPDATE public.post_visit_checklists
    SET
        service_type = COALESCE(p_service_type, service_type),
        patient_confirmed = COALESCE((p_checklist_payload->>'patient_confirmed')::boolean, patient_confirmed),
        professional_confirmed = COALESCE((p_checklist_payload->>'professional_confirmed')::boolean, professional_confirmed),
        operational_finish_confirmed = COALESCE((p_checklist_payload->>'operational_finish_confirmed')::boolean, operational_finish_confirmed),
        incidents_recorded = COALESCE((p_checklist_payload->>'incidents_recorded')::boolean, incidents_recorded),
        okvet_record_confirmed = COALESCE((p_checklist_payload->>'okvet_record_confirmed')::boolean, okvet_record_confirmed),
        pending_documents_flag = COALESCE((p_checklist_payload->>'pending_documents_flag')::boolean, pending_documents_flag),
        pending_results_flag = COALESCE((p_checklist_payload->>'pending_results_flag')::boolean, pending_results_flag),
        pending_referrals_flag = COALESCE((p_checklist_payload->>'pending_referrals_flag')::boolean, pending_referrals_flag),
        future_appointments_indicated = COALESCE((p_checklist_payload->>'future_appointments_indicated')::boolean, future_appointments_indicated),
        client_promises_recorded = COALESCE((p_checklist_payload->>'client_promises_recorded')::boolean, client_promises_recorded),
        responsible_assigned = COALESCE((p_checklist_payload->>'responsible_assigned')::boolean, responsible_assigned),
        review_needed_flag = COALESCE((p_checklist_payload->>'review_needed_flag')::boolean, review_needed_flag),
        checklist_completed = true,
        completed_by = p_actor_id,
        completed_at = now()
    WHERE case_id = p_case_id
    RETURNING id INTO v_chk_id;

    UPDATE public.post_visit_cases
    SET
        has_pending_referrals = COALESCE((p_checklist_payload->>'pending_referrals_flag')::boolean, has_pending_referrals),
        has_pending_documents = COALESCE((p_checklist_payload->>'pending_documents_flag')::boolean, has_pending_documents),
        has_pending_reports = COALESCE((p_checklist_payload->>'pending_results_flag')::boolean, has_pending_reports),
        has_customer_promises = COALESCE((p_checklist_payload->>'client_promises_recorded')::boolean, has_customer_promises),
        updated_at = now()
    WHERE id = p_case_id;

    INSERT INTO public.post_visit_audit (case_id, action, actor_id, payload)
    VALUES (p_case_id, 'CHECKLIST_RECORDED', p_actor_id, p_checklist_payload);

    RETURN jsonb_build_object('success', true, 'checklist_id', v_chk_id, 'case_id', p_case_id);
END;
$$;

-- RPC 3: Registrar Cierre Operativo de Visita
CREATE OR REPLACE FUNCTION public.record_post_visit_operational_close(
    p_case_id uuid,
    p_actor_id uuid,
    p_notes text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_case record;
BEGIN
    SELECT * INTO v_case FROM public.post_visit_cases WHERE id = p_case_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caso post-visita % no encontrado.', p_case_id;
    END IF;

    UPDATE public.post_visit_cases
    SET
        operational_closed_at = COALESCE(operational_closed_at, now()),
        operational_closed_by = COALESCE(operational_closed_by, p_actor_id),
        updated_at = now()
    WHERE id = p_case_id;

    UPDATE public.visits
    SET check_out_at = COALESCE(check_out_at, now())
    WHERE id = v_case.visit_id;

    INSERT INTO public.post_visit_audit (case_id, action, actor_id, payload)
    VALUES (p_case_id, 'OPERATIONAL_CLOSED', p_actor_id, jsonb_build_object('notes', p_notes));

    RETURN jsonb_build_object('success', true, 'case_id', p_case_id, 'operational_closed_at', now());
END;
$$;

-- RPC 4: Crear Compromiso Post-Visita
CREATE OR REPLACE FUNCTION public.create_post_visit_commitment(
    p_commitment_payload jsonb,
    p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_case record;
    v_comm record;
    v_idemp text;
    v_due timestamptz;
    v_staff_id uuid;
BEGIN
    v_idemp := p_commitment_payload->>'idempotency_key';

    IF v_idemp IS NOT NULL THEN
        SELECT * INTO v_comm FROM public.post_visit_commitments
        WHERE organization_id = (p_commitment_payload->>'organization_id')::uuid
          AND idempotency_key = v_idemp;
        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'commitment_id', v_comm.id,
                'status', v_comm.status,
                'is_duplicate', true
            );
        END IF;
    END IF;

    SELECT * INTO v_case FROM public.post_visit_cases WHERE id = (p_commitment_payload->>'case_id')::uuid;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caso post-visita no válido.';
    END IF;

    v_due := COALESCE(
        (p_commitment_payload->>'due_at')::timestamptz,
        now() + interval '24 hours'
    );

    v_staff_id := COALESCE(
        (p_commitment_payload->>'assigned_staff_id')::uuid,
        v_case.veterinarian_id
    );

    INSERT INTO public.post_visit_commitments (
        organization_id,
        case_id,
        visit_id,
        appointment_id,
        owner_id,
        pet_id,
        commitment_type,
        description,
        due_date,
        due_at,
        responsible_staff_id,
        assigned_staff_id,
        responsible_team_id,
        source_type,
        source_reference,
        source_version,
        source_provenance,
        priority,
        status,
        assignment_status,
        requires_professional_review,
        requires_approval,
        requires_evidence,
        idempotency_key,
        state_version
    ) VALUES (
        v_case.organization_id,
        v_case.id,
        v_case.visit_id,
        v_case.appointment_id,
        v_case.owner_id,
        v_case.pet_id,
        p_commitment_payload->>'commitment_type',
        p_commitment_payload->>'description',
        v_due::date,
        v_due,
        v_staff_id,
        v_staff_id,
        COALESCE(p_commitment_payload->>'responsible_team_id', 'COORDINATION'),
        COALESCE(p_commitment_payload->>'source_type', 'VISIT_CHECKLIST'),
        p_commitment_payload->>'source_reference',
        COALESCE((p_commitment_payload->>'source_version')::integer, 1),
        COALESCE(p_commitment_payload->>'source_provenance', 'VERIFIED'),
        COALESCE(p_commitment_payload->>'priority', 'NORMAL'),
        'OPEN',
        CASE WHEN (p_commitment_payload->>'assigned_staff_id') IS NOT NULL 
             THEN 'ASSIGNMENT_NOTIFIED' ELSE 'ASSIGNMENT_PROPOSED' END,
        COALESCE((p_commitment_payload->>'requires_professional_review')::boolean, false),
        COALESCE((p_commitment_payload->>'requires_approval')::boolean, false),
        COALESCE((p_commitment_payload->>'requires_evidence')::boolean, true),
        v_idemp,
        1
    ) RETURNING * INTO v_comm;

    INSERT INTO public.post_visit_commitment_versions (
        commitment_id,
        version_number,
        status,
        assigned_staff_id,
        due_at,
        snapshot,
        changed_by,
        change_reason
    ) VALUES (
        v_comm.id,
        1,
        'OPEN',
        v_comm.assigned_staff_id,
        v_comm.due_at,
        to_jsonb(v_comm),
        p_actor_id,
        'CREATION_INITIAL'
    );

    UPDATE public.post_visit_cases
    SET open_commitments_count = open_commitments_count + 1,
        updated_at = now()
    WHERE id = v_case.id;

    INSERT INTO public.post_visit_audit (case_id, commitment_id, action, actor_id, payload)
    VALUES (v_case.id, v_comm.id, 'COMMITMENT_CREATED', p_actor_id, p_commitment_payload);

    RETURN jsonb_build_object(
        'success', true,
        'commitment_id', v_comm.id,
        'status', v_comm.status,
        'is_duplicate', false
    );
END;
$$;

-- RPC 5: Asignar o Delegar Compromiso
CREATE OR REPLACE FUNCTION public.assign_or_delegate_commitment(
    p_commitment_id uuid,
    p_new_staff_id uuid,
    p_role text,
    p_reason text,
    p_is_founder_absence boolean,
    p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_comm record;
    v_prev_staff uuid;
    v_new_version integer;
    v_is_vet boolean;
BEGIN
    SELECT * INTO v_comm FROM public.post_visit_commitments WHERE id = p_commitment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Compromiso % no encontrado.', p_commitment_id;
    END IF;

    -- Validar que si requiere revisión profesional, el usuario destino sea veterinario habilitado
    IF v_comm.requires_professional_review THEN
        SELECT (professional_card_number IS NOT NULL AND is_active = true)
        INTO v_is_vet
        FROM public.staff_profiles
        WHERE id = p_new_staff_id;

        IF NOT COALESCE(v_is_vet, false) THEN
            RAISE EXCEPTION 'Este compromiso requiere criterio médico y solo puede asignarse a un Médico Veterinario colegiado.';
        END IF;
    END IF;

    v_prev_staff := v_comm.assigned_staff_id;
    v_new_version := v_comm.state_version + 1;

    UPDATE public.post_visit_commitments
    SET
        assigned_staff_id = p_new_staff_id,
        responsible_staff_id = p_new_staff_id,
        assignment_status = 'ASSIGNMENT_NOTIFIED',
        state_version = v_new_version,
        updated_at = now()
    WHERE id = p_commitment_id;

    INSERT INTO public.post_visit_commitment_assignments (
        commitment_id,
        previous_staff_id,
        assigned_staff_id,
        assigned_by,
        assignment_role,
        delegation_reason,
        is_founder_absence,
        acceptance_status
    ) VALUES (
        p_commitment_id,
        v_prev_staff,
        p_new_staff_id,
        p_actor_id,
        COALESCE(p_role, 'ASSIGNEE'),
        p_reason,
        COALESCE(p_is_founder_absence, false),
        'PENDING_ACCEPTANCE'
    );

    INSERT INTO public.post_visit_commitment_versions (
        commitment_id,
        version_number,
        status,
        assigned_staff_id,
        due_at,
        snapshot,
        changed_by,
        change_reason
    ) VALUES (
        p_commitment_id,
        v_new_version,
        v_comm.status,
        p_new_staff_id,
        v_comm.due_at,
        to_jsonb(v_comm),
        p_actor_id,
        COALESCE(p_reason, 'REASSIGNED_DELEGATED')
    );

    INSERT INTO public.post_visit_audit (case_id, commitment_id, action, actor_id, payload)
    VALUES (
        v_comm.case_id,
        p_commitment_id,
        'COMMITMENT_DELEGATED',
        p_actor_id,
        jsonb_build_object('previous_staff', v_prev_staff, 'new_staff', p_new_staff_id, 'reason', p_reason)
    );

    RETURN jsonb_build_object('success', true, 'commitment_id', p_commitment_id, 'version', v_new_version);
END;
$$;

-- RPC 6: Aceptar Asignación de Compromiso
CREATE OR REPLACE FUNCTION public.accept_commitment_assignment(
    p_commitment_id uuid,
    p_staff_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_comm record;
BEGIN
    SELECT * INTO v_comm FROM public.post_visit_commitments WHERE id = p_commitment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Compromiso % no encontrado.', p_commitment_id;
    END IF;

    IF v_comm.assigned_staff_id <> p_staff_id THEN
        RAISE EXCEPTION 'El miembro de equipo % no es el responsable asignado para este compromiso.', p_staff_id;
    END IF;

    UPDATE public.post_visit_commitments
    SET
        assignment_status = 'ASSIGNMENT_ACCEPTED',
        status = CASE WHEN status = 'OPEN' THEN 'IN_PROGRESS' ELSE status END,
        updated_at = now()
    WHERE id = p_commitment_id;

    UPDATE public.post_visit_commitment_assignments
    SET
        acceptance_status = 'ACCEPTED',
        accepted_at = now()
    WHERE commitment_id = p_commitment_id
      AND assigned_staff_id = p_staff_id
      AND acceptance_status = 'PENDING_ACCEPTANCE';

    INSERT INTO public.post_visit_audit (case_id, commitment_id, action, actor_id)
    VALUES (v_comm.case_id, p_commitment_id, 'ASSIGNMENT_ACCEPTED', p_staff_id);

    RETURN jsonb_build_object('success', true, 'commitment_id', p_commitment_id, 'assignment_status', 'ASSIGNMENT_ACCEPTED');
END;
$$;

-- RPC 7: Posponer Compromiso con Control Anti-Snooze
CREATE OR REPLACE FUNCTION public.snooze_post_visit_commitment(
    p_commitment_id uuid,
    p_new_due_at timestamptz,
    p_reason text,
    p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_comm record;
    v_new_snooze integer;
BEGIN
    SELECT * INTO v_comm FROM public.post_visit_commitments WHERE id = p_commitment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Compromiso % no encontrado.', p_commitment_id;
    END IF;

    IF p_new_due_at <= now() THEN
        RAISE EXCEPTION 'La nueva fecha de vencimiento debe ser futura.';
    END IF;

    IF v_comm.snooze_count >= v_comm.max_snooze_allowed THEN
        RAISE EXCEPTION 'Límite de posposiciones alcanzado (% de %). Se requiere resolver o escalar.',
            v_comm.snooze_count, v_comm.max_snooze_allowed;
    END IF;

    v_new_snooze := v_comm.snooze_count + 1;

    UPDATE public.post_visit_commitments
    SET
        due_at = p_new_due_at,
        due_date = p_new_due_at::date,
        status = 'SNOOZED',
        snooze_count = v_new_snooze,
        state_version = state_version + 1,
        updated_at = now()
    WHERE id = p_commitment_id;

    INSERT INTO public.post_visit_commitment_snooze_records (
        commitment_id,
        previous_due_at,
        new_due_at,
        snooze_reason,
        snooze_number,
        requested_by
    ) VALUES (
        p_commitment_id,
        v_comm.due_at,
        p_new_due_at,
        p_reason,
        v_new_snooze,
        p_actor_id
    );

    INSERT INTO public.post_visit_audit (case_id, commitment_id, action, actor_id, payload)
    VALUES (
        v_comm.case_id,
        p_commitment_id,
        'COMMITMENT_SNOOZED',
        p_actor_id,
        jsonb_build_object('new_due_at', p_new_due_at, 'snooze_number', v_new_snooze, 'reason', p_reason)
    );

    RETURN jsonb_build_object('success', true, 'commitment_id', p_commitment_id, 'snooze_count', v_new_snooze);
END;
$$;

-- RPC 8: Reportar y Verificar Cumplimiento de Compromiso
CREATE OR REPLACE FUNCTION public.report_and_verify_commitment(
    p_commitment_id uuid,
    p_evidence text,
    p_actor_id uuid,
    p_is_verified boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_comm record;
    v_is_vet boolean;
    v_status text;
BEGIN
    SELECT * INTO v_comm FROM public.post_visit_commitments WHERE id = p_commitment_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Compromiso % no encontrado.', p_commitment_id;
    END IF;

    IF p_evidence IS NULL OR length(trim(p_evidence)) < 5 THEN
        RAISE EXCEPTION 'Se requiere evidencia comprobable para reportar el cumplimiento.';
    END IF;

    -- Si requiere revisión profesional, solo un veterinario puede certificar VERIFIED_COMPLETE
    IF v_comm.requires_professional_review AND p_is_verified THEN
        SELECT (professional_card_number IS NOT NULL AND is_active = true)
        INTO v_is_vet
        FROM public.staff_profiles
        WHERE id = p_actor_id;

        IF NOT COALESCE(v_is_vet, false) THEN
            RAISE EXCEPTION 'Este compromiso contiene criterio clínico y solo puede ser verificado por un Médico Veterinario colegiado.';
        END IF;
    END IF;

    v_status := CASE WHEN p_is_verified THEN 'VERIFIED_COMPLETE' ELSE 'COMPLETION_REPORTED' END;

    UPDATE public.post_visit_commitments
    SET
        status = v_status,
        fulfillment_evidence = p_evidence,
        completion_reference = 'REF-' || to_char(now(), 'YYYYMMDD-HH24MISS'),
        verified_by = CASE WHEN p_is_verified THEN p_actor_id ELSE verified_by END,
        verified_at = CASE WHEN p_is_verified THEN now() ELSE verified_at END,
        state_version = state_version + 1,
        updated_at = now()
    WHERE id = p_commitment_id;

    IF p_is_verified THEN
        UPDATE public.post_visit_cases
        SET open_commitments_count = GREATEST(0, open_commitments_count - 1),
            updated_at = now()
        WHERE id = v_comm.case_id;
    END IF;

    INSERT INTO public.post_visit_audit (case_id, commitment_id, action, actor_id, payload)
    VALUES (
        v_comm.case_id,
        p_commitment_id,
        'COMMITMENT_COMPLETED',
        p_actor_id,
        jsonb_build_object('status', v_status, 'evidence', p_evidence, 'verified', p_is_verified)
    );

    RETURN jsonb_build_object('success', true, 'commitment_id', p_commitment_id, 'status', v_status);
END;
$$;

-- RPC 9: Gate Estricto de Cierre Verificado de Continuidad
CREATE OR REPLACE FUNCTION public.close_post_visit_continuity_verified(
    p_case_id uuid,
    p_actor_id uuid,
    p_is_exceptional boolean DEFAULT false,
    p_exception_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_case record;
    v_pending_count integer;
    v_unreviewed_reports integer;
    v_undelivered_docs integer;
    v_gate_passed boolean := false;
    v_final_status text;
BEGIN
    SELECT * INTO v_case FROM public.post_visit_cases WHERE id = p_case_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Caso de post-visita % no encontrado.', p_case_id;
    END IF;

    SELECT count(*) INTO v_pending_count
    FROM public.post_visit_commitments
    WHERE case_id = p_case_id
      AND status NOT IN ('VERIFIED_COMPLETE', 'CLOSED_WITH_DOCUMENTED_OUTCOME', 'CANCELLED_WITH_AUTHORIZATION');

    SELECT count(*) INTO v_unreviewed_reports
    FROM public.post_visit_pending_reports
    WHERE case_id = p_case_id
      AND status IN ('EXPECTED', 'WAITING_EXTERNAL', 'REPORT_RECEIVED', 'PENDING_CLINICAL_REVIEW');

    SELECT count(*) INTO v_undelivered_docs
    FROM public.post_visit_pending_documents
    WHERE case_id = p_case_id
      AND status NOT IN ('SHARED_SECURELY', 'APPROVED');

    IF NOT p_is_exceptional THEN
        IF v_pending_count > 0 THEN
            RAISE EXCEPTION 'Gate de Cierre Bloqueado: Existen % compromiso(s) obligatorio(s) pendiente(s).', v_pending_count;
        END IF;

        IF v_unreviewed_reports > 0 THEN
            RAISE EXCEPTION 'Gate de Cierre Bloqueado: Existen % informe(s) médico(s) externo(s) sin dictamen veterinario.', v_unreviewed_reports;
        END IF;

        v_gate_passed := true;
        v_final_status := 'CLOSED_VERIFIED';
    ELSE
        IF p_exception_reason IS NULL OR length(trim(p_exception_reason)) < 15 THEN
            RAISE EXCEPTION 'El cierre excepcional exige una justificación documentada de al menos 15 caracteres.';
        END IF;
        v_gate_passed := true;
        v_final_status := 'CLOSED_WITH_EXCEPTION';
    END IF;

    INSERT INTO public.post_visit_closure_checks (
        case_id,
        checked_by,
        open_commitments_found,
        unreviewed_reports_found,
        undelivered_documents_found,
        gate_passed,
        blocking_reasons
    ) VALUES (
        p_case_id,
        p_actor_id,
        v_pending_count,
        v_unreviewed_reports,
        v_undelivered_docs,
        v_gate_passed,
        jsonb_build_object('exceptional', p_is_exceptional, 'reason', p_exception_reason)
    );

    UPDATE public.post_visit_cases
    SET
        case_status = v_final_status,
        continuity_closed_at = now(),
        continuity_closed_by = p_actor_id,
        clinical_closed_at = COALESCE(clinical_closed_at, now()),
        clinical_closed_by = COALESCE(clinical_closed_by, p_actor_id),
        administrative_closed_at = COALESCE(administrative_closed_at, now()),
        administrative_closed_by = COALESCE(administrative_closed_by, p_actor_id),
        open_commitments_count = 0,
        updated_at = now()
    WHERE id = p_case_id;

    INSERT INTO public.post_visit_audit (case_id, action, actor_id, payload)
    VALUES (
        p_case_id,
        'CONTINUITY_CLOSED',
        p_actor_id,
        jsonb_build_object('status', v_final_status, 'exceptional', p_is_exceptional, 'reason', p_exception_reason)
    );

    RETURN jsonb_build_object(
        'success', true,
        'case_id', p_case_id,
        'status', v_final_status,
        'closed_at', now()
    );
END;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) Y REVOCACIÓN DE PERMISOS ANÓNIMOS
-- ==============================================================================
ALTER TABLE public.post_visit_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitment_snooze_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitment_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_pending_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_pending_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_customer_promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_continuity_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_closure_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_post_visit_cases" ON public.post_visit_cases FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_cases" ON public.post_visit_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_update_post_visit_cases" ON public.post_visit_cases FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_post_visit_checklists" ON public.post_visit_checklists FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_checklists" ON public.post_visit_checklists FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_checklist_items" ON public.post_visit_checklist_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_checklist_items" ON public.post_visit_checklist_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_commitments" ON public.post_visit_commitments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_commitments" ON public.post_visit_commitments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_update_post_visit_commitments" ON public.post_visit_commitments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_post_visit_commitment_versions" ON public.post_visit_commitment_versions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_commitment_versions" ON public.post_visit_commitment_versions FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_commitment_assignments" ON public.post_visit_commitment_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_commitment_assignments" ON public.post_visit_commitment_assignments FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_commitment_snooze_records" ON public.post_visit_commitment_snooze_records FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_commitment_snooze_records" ON public.post_visit_commitment_snooze_records FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_commitment_escalations" ON public.post_visit_commitment_escalations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_commitment_escalations" ON public.post_visit_commitment_escalations FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_pending_documents" ON public.post_visit_pending_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_pending_documents" ON public.post_visit_pending_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_pending_reports" ON public.post_visit_pending_reports FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_pending_reports" ON public.post_visit_pending_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_customer_promises" ON public.post_visit_customer_promises FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_customer_promises" ON public.post_visit_customer_promises FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_continuity_handoffs" ON public.post_visit_continuity_handoffs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_continuity_handoffs" ON public.post_visit_continuity_handoffs FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_closure_checks" ON public.post_visit_closure_checks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_closure_checks" ON public.post_visit_closure_checks FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all_post_visit_audit" ON public.post_visit_audit FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_select_post_visit_audit" ON public.post_visit_audit FOR SELECT TO authenticated USING (true);

REVOKE EXECUTE ON FUNCTION public.create_or_init_post_visit_case FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_post_visit_checklist FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_post_visit_operational_close FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_post_visit_commitment FROM anon;
REVOKE EXECUTE ON FUNCTION public.assign_or_delegate_commitment FROM anon;
REVOKE EXECUTE ON FUNCTION public.accept_commitment_assignment FROM anon;
REVOKE EXECUTE ON FUNCTION public.snooze_post_visit_commitment FROM anon;
REVOKE EXECUTE ON FUNCTION public.report_and_verify_commitment FROM anon;
REVOKE EXECUTE ON FUNCTION public.close_post_visit_continuity_verified FROM anon;
