-- ==============================================================================
-- VET FREEDOM OS — MIGRATION 031: RECURRING CARE PLANS & OCCURRENCES ENGINE
-- Módulo: VET-CORE-09 | Recurring Care Communications & Clinical Plan Continuity
-- Dirección Médica: Dr. Luis Eduardo Ríos | Alpha Vision Method
-- Fecha: 2026-11-21
-- Motor: PostgreSQL 17.12.0 (Supabase)
-- ==============================================================================

-- 1. Ampliación y Endurecimiento de la Tabla: public.recurring_treatment_plans
ALTER TABLE public.recurring_treatment_plans
  ADD COLUMN IF NOT EXISTS plan_code text,
  ADD COLUMN IF NOT EXISTS plan_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS clinical_authorization_status text NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN IF NOT EXISTS approved_by_vet_id uuid REFERENCES public.staff_profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS clinical_objective text,
  ADD COLUMN IF NOT EXISTS cadence_type text NOT NULL DEFAULT 'WEEKLY',
  ADD COLUMN IF NOT EXISTS cadence_interval_days integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS window_tolerance_days_before integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS window_tolerance_days_after integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_window_strict boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS continuity_vet_id uuid REFERENCES public.staff_profiles(id),
  ADD COLUMN IF NOT EXISTS backup_vet_id uuid REFERENCES public.staff_profiles(id),
  ADD COLUMN IF NOT EXISTS specialty_required text,
  ADD COLUMN IF NOT EXISTS estimated_session_duration_minutes integer NOT NULL DEFAULT 45,
  ADD COLUMN IF NOT EXISTS required_supplies_summary text,
  ADD COLUMN IF NOT EXISTS client_acceptance_status text NOT NULL DEFAULT 'ACCEPTED',
  ADD COLUMN IF NOT EXISTS client_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS abandonment_risk_status text NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN IF NOT EXISTS idempotency_key text UNIQUE;

-- Actualización de constraint para clinical_authorization_status
ALTER TABLE public.recurring_treatment_plans DROP CONSTRAINT IF EXISTS chk_plan_clinical_auth_status;
ALTER TABLE public.recurring_treatment_plans ADD CONSTRAINT chk_plan_clinical_auth_status
  CHECK (clinical_authorization_status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'REVISED', 'TERMINATED', 'COMPLETED'));

-- Actualización de constraint para cadence_type
ALTER TABLE public.recurring_treatment_plans DROP CONSTRAINT IF EXISTS chk_plan_cadence_type;
ALTER TABLE public.recurring_treatment_plans ADD CONSTRAINT chk_plan_cadence_type
  CHECK (cadence_type IN ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'));

-- Actualización de constraint para client_acceptance_status
ALTER TABLE public.recurring_treatment_plans DROP CONSTRAINT IF EXISTS chk_plan_client_acceptance;
ALTER TABLE public.recurring_treatment_plans ADD CONSTRAINT chk_plan_client_acceptance
  CHECK (client_acceptance_status IN ('PENDING', 'ACCEPTED', 'REJECTED'));

-- Actualización de constraint para abandonment_risk_status
ALTER TABLE public.recurring_treatment_plans DROP CONSTRAINT IF EXISTS chk_plan_abandonment_risk;
ALTER TABLE public.recurring_treatment_plans ADD CONSTRAINT chk_plan_abandonment_risk
  CHECK (abandonment_risk_status IN ('NORMAL', 'WATCH', 'HIGH_RISK_MISSED', 'ABANDONED'));


-- 2. Ampliación y Endurecimiento de la Tabla: public.recurring_visit_occurrences
ALTER TABLE public.recurring_visit_occurrences
  ADD COLUMN IF NOT EXISTS plan_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS occurrence_sequence integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS occurrence_code text,
  ADD COLUMN IF NOT EXISTS is_window_strict boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS assigned_veterinarian_id uuid REFERENCES public.staff_profiles(id),
  ADD COLUMN IF NOT EXISTS backup_veterinarian_id uuid REFERENCES public.staff_profiles(id),
  ADD COLUMN IF NOT EXISTS route_stop_id uuid,
  ADD COLUMN IF NOT EXISTS okvet_synced boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS okvet_reference text,
  ADD COLUMN IF NOT EXISTS missed_reason text,
  ADD COLUMN IF NOT EXISTS missed_at timestamptz,
  ADD COLUMN IF NOT EXISTS clinical_review_id uuid;

-- Ajuste de la restricción de estados para recurring_visit_occurrences
ALTER TABLE public.recurring_visit_occurrences DROP CONSTRAINT IF EXISTS recurring_visit_occurrences_status_check;
ALTER TABLE public.recurring_visit_occurrences ADD CONSTRAINT recurring_visit_occurrences_status_check
  CHECK (status = ANY (ARRAY[
    'PLANNED'::text, 'PENDING_SCHEDULING'::text, 'APPOINTMENT_REQUESTED'::text,
    'SCHEDULED'::text, 'CONFIRMED'::text, 'EN_ROUTE'::text, 'IN_SERVICE'::text,
    'COMPLETED'::text, 'MISSED_REQUIRES_REVIEW'::text, 'SKIPPED_CLINICAL'::text,
    'RESCHEDULED'::text, 'CANCELLED_CLINICAL'::text
  ]));

-- Clave única para evitar duplicados de secuencia por versión de plan
ALTER TABLE public.recurring_visit_occurrences DROP CONSTRAINT IF EXISTS uq_plan_version_sequence;
ALTER TABLE public.recurring_visit_occurrences ADD CONSTRAINT uq_plan_version_sequence
  UNIQUE (plan_id, plan_version, occurrence_sequence);


-- 3. Nueva Tabla: public.recurring_care_plan_versions (Historial inmutable de versiones de plan)
CREATE TABLE IF NOT EXISTS public.recurring_care_plan_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.recurring_treatment_plans(id) ON DELETE CASCADE,
  plan_version integer NOT NULL,
  status text NOT NULL,
  diagnosis_title text NOT NULL,
  clinical_objective text,
  total_prescribed_sessions integer NOT NULL,
  cadence_type text NOT NULL,
  cadence_interval_days integer NOT NULL,
  prescribed_veterinarian_id uuid NOT NULL REFERENCES public.staff_profiles(id),
  justification_notes text,
  occurrences_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES public.staff_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_recurring_plan_version UNIQUE (plan_id, plan_version)
);


-- 4. Nueva Tabla: public.recurring_care_supply_checklists (Insumos y Medicamentos por Sesión)
CREATE TABLE IF NOT EXISTS public.recurring_care_supply_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.recurring_visit_occurrences(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.recurring_treatment_plans(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  item_category text NOT NULL CHECK (item_category IN ('MEDICATION', 'CONSUMABLE', 'EQUIPMENT', 'DIAGNOSTIC')),
  prescribed_quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'UNIDAD',
  requires_cold_chain boolean NOT NULL DEFAULT false,
  lot_verification_required boolean NOT NULL DEFAULT false,
  lot_number text,
  is_prepared boolean NOT NULL DEFAULT false,
  prepared_by_staff_id uuid REFERENCES public.staff_profiles(id),
  prepared_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 5. Nueva Tabla: public.recurring_care_missed_incidents (Registro de Visitas Perdidas y Abandono)
CREATE TABLE IF NOT EXISTS public.recurring_care_missed_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.recurring_visit_occurrences(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.recurring_treatment_plans(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  detected_at timestamptz NOT NULL DEFAULT now(),
  missed_type text NOT NULL CHECK (missed_type IN (
    'CLIENT_NO_SHOW', 'CLIENT_CANCELLATION_LATE', 'VET_EMERGENCY_OVERRUN',
    'LOGISTIC_UNREACHABLE', 'PATIENT_UNSTABLE', 'OTHER'
  )),
  clinical_severity text NOT NULL CHECK (clinical_severity IN (
    'CRITICAL_THERAPY_INTERRUPTION', 'MODERATE_DELAY', 'LOW_IMPACT'
  )),
  attending_vet_notified_at timestamptz,
  coordinator_notified_at timestamptz,
  clinical_decision text NOT NULL DEFAULT 'PENDING_VET_REVIEW' CHECK (clinical_decision IN (
    'PENDING_VET_REVIEW', 'RESCHEDULE_APPROVED', 'TREATMENT_ADJUSTED_BY_VET', 'PLAN_TERMINATED'
  )),
  decision_by_vet_id uuid REFERENCES public.staff_profiles(id),
  decision_at timestamptz,
  decision_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 6. Nueva Tabla: public.recurring_care_clinical_reviews (Evaluaciones Clínicas Periódicas)
CREATE TABLE IF NOT EXISTS public.recurring_care_clinical_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.recurring_treatment_plans(id) ON DELETE CASCADE,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  veterinarian_id uuid NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
  review_type text NOT NULL CHECK (review_type IN (
    'PERIODIC_PROGRESS', 'POST_MISSED_VISIT', 'PLAN_MODIFICATION', 'DISCHARGE_EVALUATION'
  )),
  findings text NOT NULL,
  continue_plan boolean NOT NULL DEFAULT true,
  new_plan_version integer,
  laboratory_orders jsonb NOT NULL DEFAULT '[]'::jsonb,
  prescribed_adjustments text,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 7. Nueva Tabla: public.recurring_care_occurrence_events (Auditoría inmutable de hitos)
CREATE TABLE IF NOT EXISTS public.recurring_care_occurrence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.recurring_visit_occurrences(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  previous_status text,
  new_status text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.staff_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ==============================================================================
-- 8. PROCEDIMIENTOS ALMACENADOS (RPCs)
-- ==============================================================================

-- 8.1. Crear Plan de Tratamiento Recurrente Aprobado
CREATE OR REPLACE FUNCTION public.create_approved_recurring_plan(
  p_org_id uuid,
  p_pet_id uuid,
  p_owner_id uuid,
  p_vet_id uuid,
  p_diagnosis_title text,
  p_clinical_objective text,
  p_total_sessions integer,
  p_cadence_type text,
  p_interval_days integer,
  p_start_date date,
  p_is_strict boolean DEFAULT false,
  p_supplies text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id uuid;
  v_plan_code text;
  v_is_vet boolean;
  v_auth_status text;
BEGIN
  -- Validar que el creador sea veterinario clínico activo
  SELECT is_clinical INTO v_is_vet
  FROM public.staff_profiles
  WHERE id = p_vet_id AND is_active = true;

  IF v_is_vet IS NOT TRUE THEN
    v_auth_status := 'PENDING_REVIEW';
  ELSE
    v_auth_status := 'APPROVED';
  END IF;

  v_plan_code := 'REC-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  INSERT INTO public.recurring_treatment_plans (
    organization_id, pet_id, owner_id, prescribing_veterinarian_id,
    diagnosis_title, clinical_objective, total_prescribed_sessions,
    cadence_type, cadence_interval_days, start_date, is_window_strict,
    required_supplies_summary, plan_code, plan_version,
    clinical_authorization_status, approved_by_vet_id, approved_at,
    idempotency_key, status
  ) VALUES (
    p_org_id, p_pet_id, p_owner_id, p_vet_id,
    p_diagnosis_title, p_clinical_objective, p_total_sessions,
    p_cadence_type, p_interval_days, p_start_date, p_is_strict,
    p_supplies, v_plan_code, 1,
    v_auth_status, CASE WHEN v_auth_status = 'APPROVED' THEN p_vet_id ELSE NULL END,
    CASE WHEN v_auth_status = 'APPROVED' THEN now() ELSE NULL END,
    p_idempotency_key, 'ACTIVE'
  )
  RETURNING id INTO v_plan_id;

  -- Crear snapshot inicial en tabla de versiones
  INSERT INTO public.recurring_care_plan_versions (
    plan_id, plan_version, status, diagnosis_title, clinical_objective,
    total_prescribed_sessions, cadence_type, cadence_interval_days,
    prescribed_veterinarian_id, justification_notes, created_by
  ) VALUES (
    v_plan_id, 1, v_auth_status, p_diagnosis_title, p_clinical_objective,
    p_total_sessions, p_cadence_type, p_interval_days,
    p_vet_id, 'Creación inicial del plan clínico recurrente', p_vet_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'plan_id', v_plan_id,
    'plan_code', v_plan_code,
    'clinical_authorization_status', v_auth_status,
    'plan_version', 1
  );
END;
$$;


-- 8.2. Generación Determinística de Ocurrencias
CREATE OR REPLACE FUNCTION public.generate_plan_occurrences(
  p_plan_id uuid,
  p_performed_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan record;
  v_target_date date;
  v_w_start date;
  v_w_end date;
  v_seq integer;
  v_tol_before integer;
  v_tol_after integer;
  v_count integer := 0;
BEGIN
  SELECT * INTO v_plan
  FROM public.recurring_treatment_plans
  WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan no encontrado');
  END IF;

  IF v_plan.clinical_authorization_status != 'APPROVED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'El plan clínico no está aprobado por un veterinario');
  END IF;

  v_tol_before := COALESCE(v_plan.window_tolerance_days_before, 1);
  v_tol_after := COALESCE(v_plan.window_tolerance_days_after, 1);

  FOR v_seq IN 1..v_plan.total_prescribed_sessions LOOP
    v_target_date := v_plan.start_date + ((v_seq - 1) * v_plan.cadence_interval_days);
    
    IF v_plan.is_window_strict THEN
      v_w_start := v_target_date;
      v_w_end := v_target_date;
    ELSE
      v_w_start := v_target_date - v_tol_before;
      v_w_end := v_target_date + v_tol_after;
    END IF;

    -- Inserción idempotente que no duplica secuencias
    INSERT INTO public.recurring_visit_occurrences (
      plan_id, plan_version, session_number, occurrence_sequence,
      occurrence_code, target_date, window_start_date, window_end_date,
      is_window_strict, assigned_veterinarian_id, status
    ) VALUES (
      p_plan_id, v_plan.plan_version, v_seq, v_seq,
      v_plan.plan_code || '-S' || lpad(v_seq::text, 2, '0'),
      v_target_date, v_w_start, v_w_end,
      v_plan.is_window_strict, v_plan.prescribing_veterinarian_id,
      'PLANNED'
    )
    ON CONFLICT (plan_id, plan_version, occurrence_sequence) DO NOTHING;

    v_count := v_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'plan_id', p_plan_id,
    'plan_version', v_plan.plan_version,
    'total_generated', v_count
  );
END;
$$;


-- 8.3. Agendar Cita para una Ocurrencia Verificando Ventana Clínica
CREATE OR REPLACE FUNCTION public.schedule_occurrence_appointment(
  p_occurrence_id uuid,
  p_appointment_id uuid,
  p_scheduled_date date,
  p_performed_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_occ record;
BEGIN
  SELECT * INTO v_occ
  FROM public.recurring_visit_occurrences
  WHERE id = p_occurrence_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ocurrencia no encontrada');
  END IF;

  -- Validación de ventana clínica estricta
  IF v_occ.is_window_strict AND (p_scheduled_date < v_occ.window_start_date OR p_scheduled_date > v_occ.window_end_date) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Violación de ventana clínica protegida estricta',
      'target_date', v_occ.target_date,
      'window_start', v_occ.window_start_date,
      'window_end', v_occ.window_end_date
    );
  END IF;

  UPDATE public.recurring_visit_occurrences
  SET appointment_id = p_appointment_id,
      target_date = p_scheduled_date,
      status = 'SCHEDULED'
  WHERE id = p_occurrence_id;

  -- Registrar evento de auditoría
  INSERT INTO public.recurring_care_occurrence_events (
    occurrence_id, event_type, previous_status, new_status,
    payload, created_by
  ) VALUES (
    p_occurrence_id, 'APPOINTMENT_SCHEDULED', v_occ.status, 'SCHEDULED',
    jsonb_build_object('appointment_id', p_appointment_id, 'scheduled_date', p_scheduled_date),
    p_performed_by
  );

  RETURN jsonb_build_object(
    'success', true,
    'occurrence_id', p_occurrence_id,
    'appointment_id', p_appointment_id,
    'status', 'SCHEDULED'
  );
END;
$$;


-- 8.4. Registrar Hito de Ocurrencia (En camino, llegada, finalización de servicio)
CREATE OR REPLACE FUNCTION public.record_occurrence_milestone(
  p_occurrence_id uuid,
  p_milestone text,
  p_performed_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_occ record;
  v_new_status text;
BEGIN
  SELECT * INTO v_occ
  FROM public.recurring_visit_occurrences
  WHERE id = p_occurrence_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ocurrencia no encontrada');
  END IF;

  CASE p_milestone
    WHEN 'CONFIRMED' THEN v_new_status := 'CONFIRMED';
    WHEN 'EN_ROUTE' THEN v_new_status := 'EN_ROUTE';
    WHEN 'SERVICE_STARTED' THEN v_new_status := 'IN_SERVICE';
    WHEN 'SERVICE_COMPLETED' THEN v_new_status := 'COMPLETED';
    ELSE
      RETURN jsonb_build_object('success', false, 'error', 'Hito no reconocido');
  END CASE;

  UPDATE public.recurring_visit_occurrences
  SET status = v_new_status
  WHERE id = p_occurrence_id;

  IF v_new_status = 'COMPLETED' THEN
    UPDATE public.recurring_treatment_plans
    SET completed_sessions_count = completed_sessions_count + 1
    WHERE id = v_occ.plan_id;
  END IF;

  INSERT INTO public.recurring_care_occurrence_events (
    occurrence_id, event_type, previous_status, new_status,
    payload, created_by
  ) VALUES (
    p_occurrence_id, 'MILESTONE_' || p_milestone, v_occ.status, v_new_status,
    jsonb_build_object('milestone', p_milestone), p_performed_by
  );

  RETURN jsonb_build_object(
    'success', true,
    'occurrence_id', p_occurrence_id,
    'previous_status', v_occ.status,
    'new_status', v_new_status
  );
END;
$$;


-- 8.5. Reportar Visita Perdida (MISSED_REQUIRES_REVIEW) y Alerta de Abandono
CREATE OR REPLACE FUNCTION public.report_missed_occurrence(
  p_occurrence_id uuid,
  p_missed_type text,
  p_severity text,
  p_reason text,
  p_reported_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_occ record;
  v_plan record;
  v_incident_id uuid;
BEGIN
  SELECT * INTO v_occ
  FROM public.recurring_visit_occurrences
  WHERE id = p_occurrence_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ocurrencia no encontrada');
  END IF;

  SELECT * INTO v_plan
  FROM public.recurring_treatment_plans
  WHERE id = v_occ.plan_id;

  UPDATE public.recurring_visit_occurrences
  SET status = 'MISSED_REQUIRES_REVIEW',
      missed_reason = p_reason,
      missed_at = now()
  WHERE id = p_occurrence_id;

  -- Actualizar semáforo de abandono en el plan
  UPDATE public.recurring_treatment_plans
  SET abandonment_risk_status = 'HIGH_RISK_MISSED'
  WHERE id = v_occ.plan_id;

  -- Crear incidente clínico formal
  INSERT INTO public.recurring_care_missed_incidents (
    occurrence_id, plan_id, organization_id, detected_at,
    missed_type, clinical_severity, attending_vet_notified_at,
    coordinator_notified_at, clinical_decision, decision_notes
  ) VALUES (
    p_occurrence_id, v_occ.plan_id, v_plan.organization_id, now(),
    p_missed_type, p_severity, now(),
    now(), 'PENDING_VET_REVIEW', p_reason
  )
  RETURNING id INTO v_incident_id;

  -- Registrar evento
  INSERT INTO public.recurring_care_occurrence_events (
    occurrence_id, event_type, previous_status, new_status,
    payload, created_by
  ) VALUES (
    p_occurrence_id, 'OCCURRENCE_MISSED', v_occ.status, 'MISSED_REQUIRES_REVIEW',
    jsonb_build_object('incident_id', v_incident_id, 'missed_type', p_missed_type, 'severity', p_severity),
    p_reported_by
  );

  RETURN jsonb_build_object(
    'success', true,
    'occurrence_id', p_occurrence_id,
    'incident_id', v_incident_id,
    'status', 'MISSED_REQUIRES_REVIEW',
    'clinical_alert_raised', true,
    'rule', 'Prohibición de compensación o duplicación automática de dosis'
  );
END;
$$;


-- 8.6. Manejo Seguro de Ausencia de Personal (Handover de Veterinario)
CREATE OR REPLACE FUNCTION public.handle_staff_absence_for_plan(
  p_plan_id uuid,
  p_backup_vet_id uuid,
  p_justification text,
  p_authorized_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan record;
  v_backup_vet record;
BEGIN
  SELECT * INTO v_plan
  FROM public.recurring_treatment_plans
  WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan no encontrado');
  END IF;

  SELECT * INTO v_backup_vet
  FROM public.staff_profiles
  WHERE id = p_backup_vet_id AND is_active = true AND is_clinical = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'El profesional suplente no está habilitado clínicamente');
  END IF;

  UPDATE public.recurring_treatment_plans
  SET backup_vet_id = p_backup_vet_id
  WHERE id = p_plan_id;

  -- Reasignar ocurrencias futuras no completadas
  UPDATE public.recurring_visit_occurrences
  SET backup_veterinarian_id = p_backup_vet_id
  WHERE plan_id = p_plan_id AND status IN ('PLANNED', 'PENDING_SCHEDULING', 'SCHEDULED');

  RETURN jsonb_build_object(
    'success', true,
    'plan_id', p_plan_id,
    'backup_vet_id', p_backup_vet_id,
    'backup_vet_name', v_backup_vet.name,
    'windows_preserved', true
  );
END;
$$;


-- 8.7. Actualización de Versión de Plan (v1 -> v2)
CREATE OR REPLACE FUNCTION public.update_plan_version(
  p_plan_id uuid,
  p_new_diagnosis text,
  p_new_objective text,
  p_new_total_sessions integer,
  p_new_cadence_days integer,
  p_justification text,
  p_vet_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan record;
  v_new_version integer;
BEGIN
  SELECT * INTO v_plan
  FROM public.recurring_treatment_plans
  WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan no encontrado');
  END IF;

  -- Verificar que sea veterinario clínico
  IF NOT EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = p_vet_id AND is_clinical = true AND is_active = true) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo un veterinario clínico activo puede autorizar cambios de versión de plan');
  END IF;

  v_new_version := v_plan.plan_version + 1;

  -- Actualizar plan
  UPDATE public.recurring_treatment_plans
  SET plan_version = v_new_version,
      diagnosis_title = COALESCE(p_new_diagnosis, diagnosis_title),
      clinical_objective = COALESCE(p_new_objective, clinical_objective),
      total_prescribed_sessions = COALESCE(p_new_total_sessions, total_prescribed_sessions),
      cadence_interval_days = COALESCE(p_new_cadence_days, cadence_interval_days),
      approved_by_vet_id = p_vet_id,
      approved_at = now()
  WHERE id = p_plan_id;

  -- Crear registro en historial de versiones
  INSERT INTO public.recurring_care_plan_versions (
    plan_id, plan_version, status, diagnosis_title, clinical_objective,
    total_prescribed_sessions, cadence_type, cadence_interval_days,
    prescribed_veterinarian_id, justification_notes, created_by
  ) VALUES (
    p_plan_id, v_new_version, 'APPROVED', COALESCE(p_new_diagnosis, v_plan.diagnosis_title),
    COALESCE(p_new_objective, v_plan.clinical_objective),
    COALESCE(p_new_total_sessions, v_plan.total_prescribed_sessions),
    v_plan.cadence_type, COALESCE(p_new_cadence_days, v_plan.cadence_interval_days),
    p_vet_id, p_justification, p_vet_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'plan_id', p_plan_id,
    'previous_version', v_plan.plan_version,
    'new_version', v_new_version,
    'approved_by_vet', p_vet_id
  );
END;
$$;


-- ==============================================================================
-- 9. SEGURIDAD Y CONTROL DE ACCESO (RLS & REVOCACIONES)
-- ==============================================================================

ALTER TABLE public.recurring_treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_visit_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_care_plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_care_supply_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_care_missed_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_care_clinical_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_care_occurrence_events ENABLE ROW LEVEL SECURITY;

-- Revocar permisos anónimos
REVOKE ALL ON public.recurring_treatment_plans FROM anon, public;
REVOKE ALL ON public.recurring_visit_occurrences FROM anon, public;
REVOKE ALL ON public.recurring_care_plan_versions FROM anon, public;
REVOKE ALL ON public.recurring_care_supply_checklists FROM anon, public;
REVOKE ALL ON public.recurring_care_missed_incidents FROM anon, public;
REVOKE ALL ON public.recurring_care_clinical_reviews FROM anon, public;
REVOKE ALL ON public.recurring_care_occurrence_events FROM anon, public;

-- Revocar ejecución de RPC a anónimos
REVOKE ALL ON FUNCTION public.create_approved_recurring_plan FROM anon, public;
REVOKE ALL ON FUNCTION public.generate_plan_occurrences FROM anon, public;
REVOKE ALL ON FUNCTION public.schedule_occurrence_appointment FROM anon, public;
REVOKE ALL ON FUNCTION public.record_occurrence_milestone FROM anon, public;
REVOKE ALL ON FUNCTION public.report_missed_occurrence FROM anon, public;
REVOKE ALL ON FUNCTION public.handle_staff_absence_for_plan FROM anon, public;
REVOKE ALL ON FUNCTION public.update_plan_version FROM anon, public;

-- Conceder a authenticated y service_role
GRANT ALL ON public.recurring_treatment_plans TO authenticated, service_role;
GRANT ALL ON public.recurring_visit_occurrences TO authenticated, service_role;
GRANT ALL ON public.recurring_care_plan_versions TO authenticated, service_role;
GRANT ALL ON public.recurring_care_supply_checklists TO authenticated, service_role;
GRANT ALL ON public.recurring_care_missed_incidents TO authenticated, service_role;
GRANT ALL ON public.recurring_care_clinical_reviews TO authenticated, service_role;
GRANT ALL ON public.recurring_care_occurrence_events TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.create_approved_recurring_plan TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_plan_occurrences TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.schedule_occurrence_appointment TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_occurrence_milestone TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.report_missed_occurrence TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_staff_absence_for_plan TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_plan_version TO authenticated, service_role;

-- Políticas de aislamiento multi-tenant y roles autorizados
DROP POLICY IF EXISTS rls_recurring_treatment_plans ON public.recurring_treatment_plans;
CREATE POLICY rls_recurring_treatment_plans ON public.recurring_treatment_plans
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff_profiles WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS rls_recurring_care_plan_versions ON public.recurring_care_plan_versions;
CREATE POLICY rls_recurring_care_plan_versions ON public.recurring_care_plan_versions
  FOR ALL TO authenticated
  USING (
    plan_id IN (SELECT id FROM public.recurring_treatment_plans)
  );

DROP POLICY IF EXISTS rls_recurring_visit_occurrences ON public.recurring_visit_occurrences;
CREATE POLICY rls_recurring_visit_occurrences ON public.recurring_visit_occurrences
  FOR ALL TO authenticated
  USING (
    plan_id IN (SELECT id FROM public.recurring_treatment_plans)
  );

DROP POLICY IF EXISTS rls_recurring_care_supply_checklists ON public.recurring_care_supply_checklists;
CREATE POLICY rls_recurring_care_supply_checklists ON public.recurring_care_supply_checklists
  FOR ALL TO authenticated
  USING (
    plan_id IN (SELECT id FROM public.recurring_treatment_plans)
  );

DROP POLICY IF EXISTS rls_recurring_care_missed_incidents ON public.recurring_care_missed_incidents;
CREATE POLICY rls_recurring_care_missed_incidents ON public.recurring_care_missed_incidents
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff_profiles WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS rls_recurring_care_clinical_reviews ON public.recurring_care_clinical_reviews;
CREATE POLICY rls_recurring_care_clinical_reviews ON public.recurring_care_clinical_reviews
  FOR ALL TO authenticated
  USING (
    plan_id IN (SELECT id FROM public.recurring_treatment_plans)
  );

DROP POLICY IF EXISTS rls_recurring_care_occurrence_events ON public.recurring_care_occurrence_events;
CREATE POLICY rls_recurring_care_occurrence_events ON public.recurring_care_occurrence_events
  FOR ALL TO authenticated
  USING (
    occurrence_id IN (SELECT id FROM public.recurring_visit_occurrences)
  );
