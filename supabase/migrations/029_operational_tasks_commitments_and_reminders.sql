-- ==============================================================================
-- VET FREEDOM OS — MIGRACIÓN 029: OPERATIONAL TASKS, COMMITMENTS & REMINDERS
-- Módulo: VET-CORE-07 | Operational Reminders Service & Internal Accountability
-- Dirección Médica: Dr. Luis Eduardo Ríos
-- Dirección Estratégica: Alpha Vision Method
-- Base de Datos: Supabase PostgreSQL 17
-- ==============================================================================

-- 1. Tabla Principal de Tareas Operativas
CREATE TABLE IF NOT EXISTS public.operational_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  task_code text NOT NULL,
  title text NOT NULL,
  description text,
  task_type text NOT NULL CHECK (task_type IN (
    'ADMINISTRATIVE',
    'CUSTOMER_REQUEST',
    'APPOINTMENT_COORDINATION',
    'OKVET_CONFIRMATION',
    'SPECIALIST_REFERRAL',
    'DOCUMENT_PENDING',
    'PAYMENT_RECONCILIATION',
    'STAFFING_COVERAGE',
    'INVENTORY_PREPARATION',
    'POST_VISIT_COMMITMENT',
    'CLINICAL_REVIEW_REQUIRED',
    'SYSTEM_INCIDENT',
    'COMPLAINT',
    'MANAGEMENT_APPROVAL'
  )),
  source_system text NOT NULL DEFAULT 'INTERNAL',
  source_entity_type text,
  source_entity_id uuid,
  source_event_id text,
  owner_client_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL,
  owner_team text NOT NULL DEFAULT 'COORDINATION' CHECK (owner_team IN (
    'RECEPTION',
    'COORDINATION',
    'VETERINARIANS',
    'ASSISTANTS',
    'FINANCE',
    'MANAGEMENT',
    'TECH_SUPPORT'
  )),
  assigned_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_role text,
  assignment_status text NOT NULL DEFAULT 'PENDING_ASSIGNMENT' CHECK (assignment_status IN (
    'PENDING_ASSIGNMENT',
    'ASSIGNED',
    'WAITING_ACCEPTANCE',
    'ACCEPTED',
    'DECLINED',
    'REASSIGNED'
  )),
  work_status text NOT NULL DEFAULT 'CREATED' CHECK (work_status IN (
    'CREATED',
    'PENDING_ASSIGNMENT',
    'ASSIGNED',
    'WAITING_ACCEPTANCE',
    'ACCEPTED',
    'IN_PROGRESS',
    'WAITING_EXTERNAL',
    'WAITING_CUSTOMER',
    'BLOCKED',
    'SNOOZED',
    'OVERDUE',
    'ESCALATED',
    'COMPLETION_REPORTED',
    'PENDING_VERIFICATION',
    'COMPLETED',
    'VERIFIED',
    'CANCELLED',
    'EXPIRED'
  )),
  priority text NOT NULL DEFAULT 'STANDARD' CHECK (priority IN ('LOW', 'STANDARD', 'HIGH', 'URGENT_P0')),
  severity text DEFAULT 'NORMAL',
  due_at timestamptz NOT NULL,
  eligible_after timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  accepted_at timestamptz,
  completed_at timestamptz,
  verified_at timestamptz,
  completed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  requires_evidence boolean NOT NULL DEFAULT false,
  requires_human_review boolean NOT NULL DEFAULT false,
  is_clinically_sensitive boolean NOT NULL DEFAULT false,
  blocked_reason text CHECK (blocked_reason IS NULL OR blocked_reason IN (
    'WAITING_CUSTOMER',
    'WAITING_OKVET',
    'WAITING_SPECIALIST',
    'WAITING_DOCUMENT',
    'WAITING_APPROVAL',
    'WAITING_STAFF',
    'WAITING_PAYMENT_VERIFICATION',
    'WAITING_EXTERNAL_PROVIDER',
    'WAITING_TECHNICAL_RECOVERY',
    'WAITING_CLINICAL_REVIEW'
  )),
  snooze_until timestamptz,
  snooze_reason text,
  snooze_count integer NOT NULL DEFAULT 0,
  reminder_count integer NOT NULL DEFAULT 0,
  next_reminder_at timestamptz,
  last_reminder_at timestamptz,
  escalation_level integer NOT NULL DEFAULT 0,
  backup_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  task_version integer NOT NULL DEFAULT 1,
  idempotency_key text NOT NULL UNIQUE,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_org_task_code UNIQUE (organization_id, task_code)
);

-- 2. Evidencias de Cumplimiento de Tarea
CREATE TABLE IF NOT EXISTS public.operational_task_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.operational_tasks(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  evidence_type text NOT NULL CHECK (evidence_type IN (
    'OKVET_REFERENCE',
    'DOCUMENT_UPLOAD',
    'CALL_LOG',
    'PAYMENT_RECEIPT',
    'CLINICAL_REPORT',
    'CUSTOMER_CONFIRMATION',
    'ADMINISTRATIVE_NOTE'
  )),
  evidence_reference text NOT NULL,
  evidence_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  verified_by uuid REFERENCES auth.users(id),
  verified_at timestamptz,
  status text NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Historial de Asignaciones y Reasignaciones
CREATE TABLE IF NOT EXISTS public.operational_task_assignment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.operational_tasks(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  from_user_id uuid REFERENCES auth.users(id),
  to_user_id uuid REFERENCES auth.users(id),
  assignment_type text NOT NULL DEFAULT 'DIRECT' CHECK (assignment_type IN (
    'DIRECT',
    'AUTO_ROTATION',
    'DELEGATION',
    'ESCALATION',
    'SHIFT_HANDOFF',
    'BACKUP_ACTIVATION'
  )),
  reason text NOT NULL,
  assigned_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Trabajos de Recordatorio Programado (Reminder Jobs)
CREATE TABLE IF NOT EXISTS public.operational_task_reminder_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.operational_tasks(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  task_version integer NOT NULL DEFAULT 1,
  reminder_type text NOT NULL CHECK (reminder_type IN (
    'UPCOMING_DUE',
    'DUE_NOW',
    'OVERDUE_WARNING',
    'ESCALATION_NOTICE',
    'ACCEPTANCE_PENDING',
    'SHIFT_DIGEST'
  )),
  channel text NOT NULL DEFAULT 'SYSTEM_IN_APP' CHECK (channel IN (
    'SYSTEM_IN_APP',
    'WHATSAPP_INTERNAL',
    'EMAIL',
    'DASHBOARD_ALERT'
  )),
  target_user_id uuid NOT NULL REFERENCES auth.users(id),
  planned_for timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',
    'QUEUED',
    'DISPATCHED',
    'SUPPRESSED',
    'CANCELLED',
    'SUPERSEDED',
    'EXPIRED',
    'FAILED'
  )),
  suppression_reason text,
  idempotency_key text NOT NULL UNIQUE,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Compromisos Operativos y Promesas Extraídas (WFX-009)
CREATE TABLE IF NOT EXISTS public.operational_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.operational_tasks(id) ON DELETE SET NULL,
  commitment_text text NOT NULL,
  made_by_actor_type text NOT NULL CHECK (made_by_actor_type IN ('STAFF', 'AI_EXTRACTED', 'CUSTOMER', 'SYSTEM')),
  made_by_user_id uuid REFERENCES auth.users(id),
  source_conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  source_message_id uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  promised_due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FULFILLED', 'BREACHED', 'CANCELLED', 'SUPERSEDED')),
  extraction_confidence numeric(3,2) DEFAULT 1.00,
  is_verified_promise boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Modo Ausencia y Reglas de Delegación del Fundador (Dr. Luis Ríos)
CREATE TABLE IF NOT EXISTS public.founder_absence_delegations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  delegator_user_id uuid NOT NULL REFERENCES auth.users(id),
  delegate_user_id uuid NOT NULL REFERENCES auth.users(id),
  scope_type text NOT NULL CHECK (scope_type IN (
    'ALL_EXCEPT_CLINICAL_AND_FINANCIAL',
    'APPOINTMENTS_AND_COORDINATION',
    'COMMUNICATIONS_ONLY',
    'EMERGENCY_FULL'
  )),
  max_approval_amount_cop numeric(12,2) DEFAULT 0.00,
  allows_clinical_actions boolean NOT NULL DEFAULT false,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Transferencias Operativas entre Turnos (Shift Handoffs)
CREATE TABLE IF NOT EXISTS public.operational_shift_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  outgoing_user_id uuid NOT NULL REFERENCES auth.users(id),
  incoming_user_id uuid REFERENCES auth.users(id),
  team text NOT NULL CHECK (team IN (
    'RECEPTION',
    'COORDINATION',
    'VETERINARIANS',
    'ASSISTANTS',
    'FINANCE',
    'MANAGEMENT'
  )),
  open_tasks_count integer NOT NULL DEFAULT 0,
  overdue_tasks_count integer NOT NULL DEFAULT 0,
  urgent_cases_count integer NOT NULL DEFAULT 0,
  summary_notes text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING_ACCEPTANCE' CHECK (status IN (
    'PENDING_ACCEPTANCE',
    'ACCEPTED',
    'EXPIRED',
    'REJECTED'
  )),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices de Cobertura para Consultas Rápidas
CREATE INDEX IF NOT EXISTS idx_ops_tasks_org_status ON public.operational_tasks(organization_id, work_status);
CREATE INDEX IF NOT EXISTS idx_ops_tasks_assigned_due ON public.operational_tasks(assigned_user_id, due_at) WHERE work_status NOT IN ('COMPLETED', 'VERIFIED', 'CANCELLED');
CREATE INDEX IF NOT EXISTS idx_ops_reminder_jobs_pending ON public.operational_task_reminder_jobs(status, planned_for) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_ops_commitments_due ON public.operational_commitments(organization_id, promised_due_at) WHERE status = 'OPEN';
CREATE INDEX IF NOT EXISTS idx_founder_delegations_active ON public.founder_absence_delegations(delegator_user_id, is_active, starts_at, ends_at);

-- Habilitar RLS al 100%
ALTER TABLE public.operational_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_task_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_task_assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_task_reminder_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_absence_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_shift_handoffs ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad Multi-Tenant
DO $$
BEGIN
  -- Tasks
  DROP POLICY IF EXISTS p_ops_tasks_member ON public.operational_tasks;
  CREATE POLICY p_ops_tasks_member ON public.operational_tasks
    FOR ALL TO authenticated USING (public.is_org_member(organization_id));

  -- Evidence
  DROP POLICY IF EXISTS p_ops_evidence_member ON public.operational_task_evidence;
  CREATE POLICY p_ops_evidence_member ON public.operational_task_evidence
    FOR ALL TO authenticated USING (public.is_org_member(organization_id));

  -- Assignment History
  DROP POLICY IF EXISTS p_ops_assign_hist_member ON public.operational_task_assignment_history;
  CREATE POLICY p_ops_assign_hist_member ON public.operational_task_assignment_history
    FOR ALL TO authenticated USING (public.is_org_member(organization_id));

  -- Reminder Jobs
  DROP POLICY IF EXISTS p_ops_reminders_member ON public.operational_task_reminder_jobs;
  CREATE POLICY p_ops_reminders_member ON public.operational_task_reminder_jobs
    FOR ALL TO authenticated USING (public.is_org_member(organization_id));

  -- Commitments
  DROP POLICY IF EXISTS p_ops_commitments_member ON public.operational_commitments;
  CREATE POLICY p_ops_commitments_member ON public.operational_commitments
    FOR ALL TO authenticated USING (public.is_org_member(organization_id));

  -- Delegations
  DROP POLICY IF EXISTS p_founder_delegations_member ON public.founder_absence_delegations;
  CREATE POLICY p_founder_delegations_member ON public.founder_absence_delegations
    FOR ALL TO authenticated USING (public.is_org_member(organization_id));

  -- Shift Handoffs
  DROP POLICY IF EXISTS p_ops_handoffs_member ON public.operational_shift_handoffs;
  CREATE POLICY p_ops_handoffs_member ON public.operational_shift_handoffs
    FOR ALL TO authenticated USING (public.is_org_member(organization_id));
END $$;

-- ==============================================================================
-- PROCEDIMIENTOS ALMACENADOS (RPCs) - ATÓMICOS Y SEGUROS
-- ==============================================================================

-- A. Creación Idempotente de Tarea Operativa
CREATE OR REPLACE FUNCTION public.create_operational_task(
  p_org_id uuid,
  p_title text,
  p_task_type text,
  p_due_at timestamptz,
  p_priority text DEFAULT 'STANDARD',
  p_owner_team text DEFAULT 'COORDINATION',
  p_assigned_user_id uuid DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_source_system text DEFAULT 'INTERNAL',
  p_source_entity_type text DEFAULT NULL,
  p_source_entity_id uuid DEFAULT NULL,
  p_owner_client_id uuid DEFAULT NULL,
  p_pet_id uuid DEFAULT NULL,
  p_requires_evidence boolean DEFAULT false,
  p_is_clinically_sensitive boolean DEFAULT false,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task_id uuid;
  v_task_code text;
  v_idem_key text;
  v_assign_status text;
  v_work_status text;
  v_outbox_id uuid;
BEGIN
  v_idem_key := COALESCE(p_idempotency_key, 'tsk-' || p_org_id || '-' || gen_random_uuid());

  -- Idempotencia: Verificar si ya existe con la misma clave
  SELECT id INTO v_task_id FROM public.operational_tasks WHERE idempotency_key = v_idem_key;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'ALREADY_EXISTS',
      'task_id', v_task_id
    );
  END IF;

  v_task_code := 'TSK-' || to_char(now(), 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text, 1, 6);

  IF p_assigned_user_id IS NOT NULL THEN
    v_assign_status := 'WAITING_ACCEPTANCE';
    v_work_status := 'ASSIGNED';
  ELSE
    v_assign_status := 'PENDING_ASSIGNMENT';
    v_work_status := 'CREATED';
  END IF;

  INSERT INTO public.operational_tasks (
    organization_id,
    task_code,
    title,
    description,
    task_type,
    source_system,
    source_entity_type,
    source_entity_id,
    owner_client_id,
    pet_id,
    owner_team,
    assigned_user_id,
    assignment_status,
    work_status,
    priority,
    due_at,
    requires_evidence,
    is_clinically_sensitive,
    idempotency_key,
    next_reminder_at
  ) VALUES (
    p_org_id,
    v_task_code,
    p_title,
    p_description,
    p_task_type,
    p_source_system,
    p_source_entity_type,
    p_source_entity_id,
    p_owner_client_id,
    p_pet_id,
    p_owner_team,
    p_assigned_user_id,
    v_assign_status,
    v_work_status,
    p_priority,
    p_due_at,
    p_requires_evidence,
    p_is_clinically_sensitive,
    v_idem_key,
    p_due_at - interval '2 hours'
  ) RETURNING id INTO v_task_id;

  -- Crear trabajo de recordatorio previo (T-2h antes de vencimiento si aplica)
  IF p_assigned_user_id IS NOT NULL AND (p_due_at - interval '2 hours') > now() THEN
    INSERT INTO public.operational_task_reminder_jobs (
      task_id,
      organization_id,
      task_version,
      reminder_type,
      channel,
      target_user_id,
      planned_for,
      expires_at,
      status,
      idempotency_key
    ) VALUES (
      v_task_id,
      p_org_id,
      1,
      'UPCOMING_DUE',
      'SYSTEM_IN_APP',
      p_assigned_user_id,
      p_due_at - interval '2 hours',
      p_due_at,
      'PENDING',
      'rem-job-' || v_task_id || '-v1-UPCOMING'
    ) ON CONFLICT (idempotency_key) DO NOTHING;
  END IF;

  -- Emisión a outbox transaccional
  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    source_system
  ) VALUES (
    p_org_id,
    'OPERATIONAL_TASK',
    v_task_id,
    'task.created',
    jsonb_build_object(
      'task_id', v_task_id,
      'task_code', v_task_code,
      'title', p_title,
      'task_type', p_task_type,
      'assigned_user_id', p_assigned_user_id,
      'due_at', p_due_at,
      'priority', p_priority
    ),
    'evt-task-' || v_task_id || '-created',
    'OPS_ENGINE'
  ) RETURNING id INTO v_outbox_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'CREATED',
    'task_id', v_task_id,
    'task_code', v_task_code,
    'outbox_event_id', v_outbox_id
  );
END;
$$;

-- B. Aceptación Formal de Responsabilidad de Tarea
CREATE OR REPLACE FUNCTION public.accept_operational_task(
  p_task_id uuid,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task record;
  v_new_version integer;
BEGIN
  SELECT * INTO v_task
  FROM public.operational_tasks
  WHERE id = p_task_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'TASK_NOT_FOUND');
  END IF;

  IF v_task.work_status IN ('COMPLETED', 'VERIFIED', 'CANCELLED') THEN
    RETURN jsonb_build_object('success', false, 'error', 'TASK_ALREADY_CLOSED');
  END IF;

  -- Si la tarea estaba asignada a otro usuario, verificar que coincida o que reclame si estaba libre
  IF v_task.assigned_user_id IS NOT NULL AND v_task.assigned_user_id != p_user_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'TASK_ASSIGNED_TO_ANOTHER_USER',
      'assigned_user_id', v_task.assigned_user_id
    );
  END IF;

  v_new_version := v_task.task_version + 1;

  UPDATE public.operational_tasks
  SET assigned_user_id = p_user_id,
      assignment_status = 'ACCEPTED',
      work_status = 'ACCEPTED',
      accepted_at = now(),
      task_version = v_new_version,
      updated_at = now()
  WHERE id = p_task_id;

  INSERT INTO public.operational_task_assignment_history (
    task_id,
    organization_id,
    from_user_id,
    to_user_id,
    assignment_type,
    reason,
    assigned_by
  ) VALUES (
    v_task.id,
    v_task.organization_id,
    v_task.assigned_user_id,
    p_user_id,
    'DIRECT',
    'Aceptación voluntaria de responsabilidad de tarea',
    p_user_id
  );

  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    source_system
  ) VALUES (
    v_task.organization_id,
    'OPERATIONAL_TASK',
    v_task.id,
    'task.accepted',
    jsonb_build_object('task_id', v_task.id, 'accepted_by', p_user_id, 'version', v_new_version),
    'evt-task-' || v_task.id || '-v' || v_new_version || '-accepted',
    'OPS_ENGINE'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'ACCEPTED',
    'task_id', v_task.id,
    'version', v_new_version,
    'accepted_at', now()
  );
END;
$$;

-- C. Reasignación o Delegación de Tarea con Auditoría
CREATE OR REPLACE FUNCTION public.reassign_or_delegate_task(
  p_task_id uuid,
  p_new_user_id uuid,
  p_reason text,
  p_reassigned_by uuid,
  p_assignment_type text DEFAULT 'DIRECT'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task record;
  v_new_version integer;
BEGIN
  SELECT * INTO v_task FROM public.operational_tasks WHERE id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'TASK_NOT_FOUND');
  END IF;

  IF v_task.work_status IN ('COMPLETED', 'VERIFIED', 'CANCELLED') THEN
    RETURN jsonb_build_object('success', false, 'error', 'CANNOT_REASSIGN_CLOSED_TASK');
  END IF;

  v_new_version := v_task.task_version + 1;

  UPDATE public.operational_tasks
  SET assigned_user_id = p_new_user_id,
      assignment_status = 'WAITING_ACCEPTANCE',
      work_status = 'ASSIGNED',
      accepted_at = NULL,
      task_version = v_new_version,
      updated_at = now()
  WHERE id = p_task_id;

  -- Invalida jobs de recordatorio pendientes del usuario anterior
  UPDATE public.operational_task_reminder_jobs
  SET status = 'SUPERSEDED', suppression_reason = 'TASK_REASSIGNED', updated_at = now()
  WHERE task_id = p_task_id AND status = 'PENDING';

  -- Registra historial
  INSERT INTO public.operational_task_assignment_history (
    task_id,
    organization_id,
    from_user_id,
    to_user_id,
    assignment_type,
    reason,
    assigned_by
  ) VALUES (
    v_task.id,
    v_task.organization_id,
    v_task.assigned_user_id,
    p_new_user_id,
    p_assignment_type,
    p_reason,
    p_reassigned_by
  );

  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    source_system
  ) VALUES (
    v_task.organization_id,
    'OPERATIONAL_TASK',
    v_task.id,
    'task.assigned',
    jsonb_build_object(
      'task_id', v_task.id,
      'from_user', v_task.assigned_user_id,
      'to_user', p_new_user_id,
      'reason', p_reason,
      'version', v_new_version
    ),
    'evt-task-' || v_task.id || '-v' || v_new_version || '-reassign',
    'OPS_ENGINE'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'REASSIGNED',
    'task_id', v_task.id,
    'new_assigned_user_id', p_new_user_id,
    'version', v_new_version
  );
END;
$$;

-- D. Posponer Tarea (Snooze Controlado)
CREATE OR REPLACE FUNCTION public.snooze_operational_task(
  p_task_id uuid,
  p_snooze_until timestamptz,
  p_reason text,
  p_snoozed_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task record;
BEGIN
  SELECT * INTO v_task FROM public.operational_tasks WHERE id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'TASK_NOT_FOUND');
  END IF;

  IF v_task.work_status IN ('COMPLETED', 'VERIFIED', 'CANCELLED') THEN
    RETURN jsonb_build_object('success', false, 'error', 'CANNOT_SNOOZE_CLOSED_TASK');
  END IF;

  IF v_task.snooze_count >= 3 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'MAX_SNOOZE_LIMIT_EXCEEDED',
      'message', 'Esta tarea ya ha sido pospuesta 3 veces. Requiere escalamiento o resolución.'
    );
  END IF;

  IF p_snooze_until <= now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_SNOOZE_TIME');
  END IF;

  UPDATE public.operational_tasks
  SET work_status = 'SNOOZED',
      snooze_until = p_snooze_until,
      snooze_reason = p_reason,
      snooze_count = v_task.snooze_count + 1,
      next_reminder_at = p_snooze_until,
      updated_at = now()
  WHERE id = p_task_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'SNOOZED',
    'task_id', v_task.id,
    'snooze_until', p_snooze_until,
    'snooze_count', v_task.snooze_count + 1
  );
END;
$$;

-- E. Reportar Tarea Completada con Evidencia
CREATE OR REPLACE FUNCTION public.report_task_completion(
  p_task_id uuid,
  p_completed_by uuid,
  p_evidence_type text DEFAULT NULL,
  p_evidence_ref text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task record;
  v_new_status text;
  v_evidence_id uuid;
  v_new_version integer;
BEGIN
  SELECT * INTO v_task FROM public.operational_tasks WHERE id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'TASK_NOT_FOUND');
  END IF;

  IF v_task.work_status IN ('COMPLETED', 'VERIFIED', 'CANCELLED') THEN
    RETURN jsonb_build_object('success', false, 'error', 'TASK_ALREADY_CLOSED');
  END IF;

  -- Si requiere evidencia obligatoria
  IF v_task.requires_evidence AND (p_evidence_ref IS NULL OR trim(p_evidence_ref) = '') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'EVIDENCE_REQUIRED',
      'message', 'Esta tarea exige evidencia verificable (ej. radicado OKVET, documento o recibo) para poder completarse.'
    );
  END IF;

  v_new_version := v_task.task_version + 1;

  -- Si requiere revisión humana o es clínicamente sensible, pasa a PENDING_VERIFICATION
  IF v_task.requires_human_review OR v_task.is_clinically_sensitive THEN
    v_new_status := 'PENDING_VERIFICATION';
  ELSE
    v_new_status := 'COMPLETED';
  END IF;

  UPDATE public.operational_tasks
  SET work_status = v_new_status,
      completed_at = now(),
      completed_by = p_completed_by,
      task_version = v_new_version,
      updated_at = now()
  WHERE id = p_task_id;

  -- Registrar evidencia si fue suministrada
  IF p_evidence_ref IS NOT NULL AND trim(p_evidence_ref) != '' THEN
    INSERT INTO public.operational_task_evidence (
      task_id,
      organization_id,
      evidence_type,
      evidence_reference,
      evidence_payload,
      submitted_by,
      status
    ) VALUES (
      v_task.id,
      v_task.organization_id,
      COALESCE(p_evidence_type, 'ADMINISTRATIVE_NOTE'),
      p_evidence_ref,
      jsonb_build_object('notes', p_notes),
      p_completed_by,
      CASE WHEN v_new_status = 'COMPLETED' THEN 'VERIFIED' ELSE 'PENDING_VERIFICATION' END
    ) RETURNING id INTO v_evidence_id;
  END IF;

  -- Cancelar recordatorios futuros
  UPDATE public.operational_task_reminder_jobs
  SET status = 'CANCELLED', suppression_reason = 'TASK_COMPLETED', updated_at = now()
  WHERE task_id = p_task_id AND status = 'PENDING';

  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    source_system
  ) VALUES (
    v_task.organization_id,
    'OPERATIONAL_TASK',
    v_task.id,
    CASE WHEN v_new_status = 'COMPLETED' THEN 'task.completed' ELSE 'task.completion_reported' END,
    jsonb_build_object(
      'task_id', v_task.id,
      'completed_by', p_completed_by,
      'status', v_new_status,
      'evidence_id', v_evidence_id,
      'version', v_new_version
    ),
    'evt-task-' || v_task.id || '-v' || v_new_version || '-done',
    'OPS_ENGINE'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', v_new_status,
    'task_id', v_task.id,
    'version', v_new_version,
    'evidence_id', v_evidence_id
  );
END;
$$;

-- F. Verificación y Cierre Oficial de Tarea (Gate de Auditoría)
CREATE OR REPLACE FUNCTION public.verify_and_close_task(
  p_task_id uuid,
  p_verified_by uuid,
  p_is_approved boolean DEFAULT true,
  p_rejection_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task record;
  v_new_version integer;
  v_new_status text;
BEGIN
  SELECT * INTO v_task FROM public.operational_tasks WHERE id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'TASK_NOT_FOUND');
  END IF;

  IF v_task.work_status != 'PENDING_VERIFICATION' AND v_task.work_status != 'COMPLETED' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'TASK_NOT_READY_FOR_VERIFICATION',
      'current_status', v_task.work_status
    );
  END IF;

  v_new_version := v_task.task_version + 1;

  IF p_is_approved THEN
    v_new_status := 'VERIFIED';
    UPDATE public.operational_tasks
    SET work_status = 'VERIFIED',
        verified_at = now(),
        verified_by = p_verified_by,
        task_version = v_new_version,
        updated_at = now()
    WHERE id = p_task_id;

    UPDATE public.operational_task_evidence
    SET status = 'VERIFIED', verified_by = p_verified_by, verified_at = now()
    WHERE task_id = p_task_id AND status = 'PENDING_VERIFICATION';
  ELSE
    v_new_status := 'IN_PROGRESS';
    UPDATE public.operational_tasks
    SET work_status = 'IN_PROGRESS',
        completed_at = NULL,
        completed_by = NULL,
        task_version = v_new_version,
        updated_at = now()
    WHERE id = p_task_id;

    UPDATE public.operational_task_evidence
    SET status = 'REJECTED', verified_by = p_verified_by, verified_at = now()
    WHERE task_id = p_task_id AND status = 'PENDING_VERIFICATION';
  END IF;

  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    source_system
  ) VALUES (
    v_task.organization_id,
    'OPERATIONAL_TASK',
    v_task.id,
    CASE WHEN p_is_approved THEN 'task.verified' ELSE 'task.reopened' END,
    jsonb_build_object(
      'task_id', v_task.id,
      'verified_by', p_verified_by,
      'is_approved', p_is_approved,
      'rejection_reason', p_rejection_reason,
      'version', v_new_version
    ),
    'evt-task-' || v_task.id || '-v' || v_new_version || '-verify',
    'OPS_ENGINE'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', v_new_status,
    'task_id', v_task.id,
    'verified_by', p_verified_by,
    'version', v_new_version
  );
END;
$$;

-- G. Escalamiento Automático de Tareas Vencidas
CREATE OR REPLACE FUNCTION public.escalate_overdue_tasks(
  p_org_id uuid DEFAULT NULL,
  p_limit integer DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_task record;
  v_escalated_count integer := 0;
  v_delegation record;
  v_target_backup uuid;
BEGIN
  FOR v_task IN
    SELECT t.*
    FROM public.operational_tasks t
    WHERE t.due_at <= now()
      AND t.work_status IN ('CREATED', 'ASSIGNED', 'WAITING_ACCEPTANCE', 'ACCEPTED', 'IN_PROGRESS')
      AND (p_org_id IS NULL OR t.organization_id = p_org_id)
    ORDER BY t.priority DESC, t.due_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  LOOP
    -- 1. Determinar si el responsable o Dr. Luis tienen delegación de ausencia activa
    SELECT * INTO v_delegation
    FROM public.founder_absence_delegations
    WHERE is_active = true
      AND starts_at <= now()
      AND ends_at >= now()
      AND delegator_user_id = v_task.assigned_user_id
    LIMIT 1;

    IF FOUND THEN
      v_target_backup := v_delegation.delegate_user_id;
    ELSE
      v_target_backup := COALESCE(v_task.backup_user_id, v_task.assigned_user_id);
    END IF;

    UPDATE public.operational_tasks
    SET work_status = 'ESCALATED',
        escalation_level = v_task.escalation_level + 1,
        backup_user_id = v_target_backup,
        task_version = v_task.task_version + 1,
        updated_at = now()
    WHERE id = v_task.id;

    INSERT INTO public.transactional_outbox (
      organization_id,
      aggregate_type,
      aggregate_id,
      event_type,
      payload,
      idempotency_key,
      source_system
    ) VALUES (
      v_task.organization_id,
      'OPERATIONAL_TASK',
      v_task.id,
      'task.escalated',
      jsonb_build_object(
        'task_id', v_task.id,
        'title', v_task.title,
        'priority', v_task.priority,
        'previous_assigned_user', v_task.assigned_user_id,
        'escalated_to_user', v_target_backup,
        'due_at', v_task.due_at
      ),
      'evt-task-' || v_task.id || '-escalated-' || to_char(now(), 'YYYYMMDDHH24MI'),
      'OPS_ESCALATION'
    );

    v_escalated_count := v_escalated_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'escalated_count', v_escalated_count,
    'executed_at', now()
  );
END;
$$;

-- 8. Endurecimiento de permisos de ejecución (0 anon warnings en Supabase Linter)
REVOKE EXECUTE ON FUNCTION public.create_operational_task FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_operational_task TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.accept_operational_task FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_operational_task TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.reassign_or_delegate_task FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reassign_or_delegate_task TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.snooze_operational_task FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.snooze_operational_task TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.report_task_completion FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.report_task_completion TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.verify_and_close_task FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_and_close_task TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.escalate_overdue_tasks FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.escalate_overdue_tasks TO authenticated, service_role;
