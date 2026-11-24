-- ==============================================================================
-- VET FREEDOM OS — MIGRATION 032: PREVENTION CARE PLANS & TRACEABILITY ENGINE
-- Módulo: VET-CORE-10 | Prevention Communications & Individualized Preventive Care
-- Dirección Médica: Dr. Luis Eduardo Ríos | Alpha Vision Method
-- Fecha: 2026-11-21
-- Motor: PostgreSQL 17.12.0 (Supabase)
-- ==============================================================================

-- 1. Ampliación y Endurecimiento de la Tabla Existente: public.preventive_care_plans
ALTER TABLE public.preventive_care_plans
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.owners(id),
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.staff_profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approval_reference text,
  ADD COLUMN IF NOT EXISTS source_system text NOT NULL DEFAULT 'VET_CLINICAL_ORDER',
  ADD COLUMN IF NOT EXISTS source_record_id text,
  ADD COLUMN IF NOT EXISTS plan_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS effective_from date,
  ADD COLUMN IF NOT EXISTS effective_until date,
  ADD COLUMN IF NOT EXISTS clinical_schedule_reference text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS idempotency_key text UNIQUE;

-- Ajuste de la restricción de estados para preventive_care_plans
ALTER TABLE public.preventive_care_plans DROP CONSTRAINT IF EXISTS preventive_care_plans_status_check;
ALTER TABLE public.preventive_care_plans ADD CONSTRAINT preventive_care_plans_status_check
  CHECK (status = ANY (ARRAY[
    'DRAFT'::text, 'PENDING_PROFESSIONAL_REVIEW'::text, 'APPROVED'::text,
    'ACTIVE'::text, 'STALE_REQUIRES_REVALIDATION'::text, 'CHANGE_PENDING_APPROVAL'::text,
    'SUSPENDED_BY_VETERINARIAN'::text, 'COMPLETED'::text, 'CANCELLED_BY_AUTHORIZED_PROFESSIONAL'::text,
    'RENEWED'::text, 'EXPIRED'::text, 'CANCELLED'::text
  ]));


-- 2. Nueva Tabla: public.preventive_care_plan_versions (Historial inmutable de versiones de plan)
CREATE TABLE IF NOT EXISTS public.preventive_care_plan_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.preventive_care_plans(id) ON DELETE CASCADE,
  plan_version integer NOT NULL,
  status text NOT NULL,
  approved_by uuid NOT NULL REFERENCES public.staff_profiles(id),
  approval_reference text,
  justification_notes text,
  plan_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_prev_plan_version UNIQUE (plan_id, plan_version)
);


-- 3. Nueva Tabla: public.preventive_care_source_records (Procedencia, fuentes y vigencia)
CREATE TABLE IF NOT EXISTS public.preventive_care_source_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  source_system text NOT NULL CHECK (source_system IN ('OKVET', 'IMPORT_CSV', 'VET_CLINICAL_ORDER', 'CLIENT_REPORTED', 'MANUAL_ENTRY')),
  source_record_reference text,
  reported_by text,
  verified_by uuid REFERENCES public.staff_profiles(id),
  verified_at timestamptz,
  effective_at timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  confidence_status text NOT NULL DEFAULT 'UNVERIFIED' CHECK (confidence_status IN ('VERIFIED_HIGH', 'PENDING_AUDIT', 'UNVERIFIED', 'STALE')),
  conflict_status text NOT NULL DEFAULT 'NO_CONFLICT' CHECK (conflict_status IN ('NO_CONFLICT', 'CONFLICT_DETECTED', 'RESOLVED')),
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 4. Nueva Tabla: public.preventive_care_events (Eventos preventivos individuales autorizados)
CREATE TABLE IF NOT EXISTS public.preventive_care_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.preventive_care_plans(id) ON DELETE CASCADE,
  plan_version integer NOT NULL DEFAULT 1,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  preventive_category text NOT NULL CHECK (preventive_category IN (
    'VACCINATION_PLAN', 'INTERNAL_PARASITE_PREVENTION',
    'EXTERNAL_PARASITE_PREVENTION', 'DOCUMENTED_PREVENTIVE_CONTROL', 'OTHER_APPROVED_PREVENTION'
  )),
  approved_action_reference text NOT NULL,
  approved_due_at date NOT NULL,
  approved_window_start date NOT NULL,
  approved_window_end date NOT NULL,
  verification_status text NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (verification_status IN (
    'CONFIRMED', 'PENDING_VERIFICATION', 'STALE', 'CONFLICTING', 'UNKNOWN', 'REVOKED'
  )),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  application_record_id uuid,
  status text NOT NULL DEFAULT 'PENDING_SCHEDULING' CHECK (status IN (
    'PENDING_SCHEDULING', 'SCHEDULED', 'CONFIRMED', 'APPLIED_VERIFIED', 'SKIPPED_CLINICAL', 'CANCELLED'
  )),
  source_id uuid REFERENCES public.preventive_care_source_records(id) ON DELETE SET NULL,
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_prev_event_window CHECK (approved_window_start <= approved_due_at AND approved_due_at <= approved_window_end)
);


-- 5. Nueva Tabla: public.preventive_product_lots (Control de lotes, vencimientos y cadena de frío)
CREATE TABLE IF NOT EXISTS public.preventive_product_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  product_reference text NOT NULL,
  lot_number text NOT NULL,
  manufacturer text,
  expiration_date date NOT NULL,
  received_at date NOT NULL DEFAULT CURRENT_DATE,
  stock_location text NOT NULL DEFAULT 'FARMACIA_CENTRAL',
  status text NOT NULL DEFAULT 'ACTIVE_VALID' CHECK (status IN ('ACTIVE_VALID', 'EXPIRED', 'QUARANTINE_BLOCKED', 'DEPLETED')),
  requires_cold_chain boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_product_lot UNIQUE (organization_id, product_reference, lot_number)
);


-- 6. Nueva Tabla: public.preventive_cold_chain_checks (Monitoreo de evidencias de conservación)
CREATE TABLE IF NOT EXISTS public.preventive_cold_chain_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id uuid NOT NULL REFERENCES public.preventive_product_lots(id) ON DELETE CASCADE,
  checked_at timestamptz NOT NULL DEFAULT now(),
  checked_by_staff_id uuid NOT NULL REFERENCES public.staff_profiles(id),
  storage_location text NOT NULL,
  evidence_status text NOT NULL DEFAULT 'VALID_PROTOCOL' CHECK (evidence_status IN (
    'VALID_PROTOCOL', 'MISSING_EVIDENCE', 'ISOLATED_READING_INSUFFICIENT', 'BREACH_INCIDENT'
  )),
  incident_reported boolean NOT NULL DEFAULT false,
  incident_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 7. Nueva Tabla: public.preventive_care_application_records (Registro oficial de aplicación clínica)
CREATE TABLE IF NOT EXISTS public.preventive_care_application_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  preventive_event_id uuid NOT NULL REFERENCES public.preventive_care_events(id) ON DELETE CASCADE,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  applied_by_vet_id uuid NOT NULL REFERENCES public.staff_profiles(id),
  verified_by_vet_id uuid NOT NULL REFERENCES public.staff_profiles(id),
  status text NOT NULL DEFAULT 'VERIFIED_APPLIED' CHECK (status IN (
    'SCHEDULED', 'APPOINTMENT_CONFIRMED', 'APPLICATION_REPORTED',
    'PENDING_PROFESSIONAL_VERIFICATION', 'VERIFIED_APPLIED', 'NOT_APPLIED', 'RECORD_CONFLICT'
  )),
  product_reference text NOT NULL,
  product_lot_id uuid REFERENCES public.preventive_product_lots(id),
  lot_number text,
  cold_chain_verified boolean NOT NULL DEFAULT false,
  adverse_reaction_reported boolean NOT NULL DEFAULT false,
  adverse_reaction_notes text,
  okvet_sync_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 8. Nueva Tabla: public.preventive_care_incidents (Gestión de incidencias y reacciones adversas)
CREATE TABLE IF NOT EXISTS public.preventive_care_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.preventive_care_plans(id) ON DELETE CASCADE,
  preventive_event_id uuid REFERENCES public.preventive_care_events(id) ON DELETE SET NULL,
  incident_type text NOT NULL CHECK (incident_type IN (
    'PRODUCT_EXPIRED', 'COLD_CHAIN_BREACH', 'ADVERSE_EVENT_SUSPECTED',
    'DATA_CONFLICT', 'SCHEDULE_UNVERIFIED', 'CARE_DISCONTINUITY'
  )),
  severity text NOT NULL CHECK (severity IN (
    'CRITICAL_CLINICAL', 'MODERATE_OPERATIONAL', 'LOW_ADMINISTRATIVE'
  )),
  detected_at timestamptz NOT NULL DEFAULT now(),
  assigned_veterinarian_id uuid REFERENCES public.staff_profiles(id),
  status text NOT NULL DEFAULT 'OPEN_REQUIRES_REVIEW' CHECK (status IN (
    'OPEN_REQUIRES_REVIEW', 'INVESTIGATING', 'RESOLVED', 'CLOSED_BY_VET'
  )),
  resolution_notes text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- 9. Nueva Tabla: public.preventive_care_audit (Auditoría inmutable de correcciones y modificaciones)
CREATE TABLE IF NOT EXISTS public.preventive_care_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name text NOT NULL,
  record_id uuid NOT NULL,
  action_type text NOT NULL,
  previous_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  new_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  performed_by uuid REFERENCES public.staff_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ==============================================================================
-- 10. PROCEDIMIENTOS ALMACENADOS (RPCs)
-- ==============================================================================

-- 10.1. Crear Plan de Cuidado Preventivo Individualizado Aprobado
CREATE OR REPLACE FUNCTION public.create_approved_preventive_plan(
  p_org_id uuid,
  p_pet_id uuid,
  p_owner_id uuid,
  p_vet_id uuid,
  p_plan_type text,
  p_approval_reference text,
  p_effective_from date,
  p_effective_until date,
  p_schedule_reference text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id uuid;
  v_is_vet boolean;
  v_status text;
BEGIN
  -- Validar que el autorizante sea veterinario clínico activo
  SELECT (is_clinical = true AND is_active = true) INTO v_is_vet
  FROM public.staff_profiles
  WHERE id = p_vet_id;

  IF v_is_vet IS NOT TRUE THEN
    v_status := 'PENDING_PROFESSIONAL_REVIEW';
  ELSE
    v_status := 'APPROVED';
  END IF;

  INSERT INTO public.preventive_care_plans (
    organization_id, pet_id, owner_id, plan_type, approved_by,
    approved_at, approval_reference, status, effective_from,
    effective_until, clinical_schedule_reference, plan_version,
    idempotency_key
  ) VALUES (
    p_org_id, p_pet_id, p_owner_id, p_plan_type,
    CASE WHEN v_status = 'APPROVED' THEN p_vet_id ELSE NULL END,
    CASE WHEN v_status = 'APPROVED' THEN now() ELSE NULL END,
    p_approval_reference, v_status, p_effective_from,
    p_effective_until, p_schedule_reference, 1,
    p_idempotency_key
  )
  RETURNING id INTO v_plan_id;

  -- Guardar snapshot inicial de versión
  INSERT INTO public.preventive_care_plan_versions (
    plan_id, plan_version, status, approved_by, approval_reference,
    justification_notes, plan_snapshot
  ) VALUES (
    v_plan_id, 1, v_status, p_vet_id, p_approval_reference,
    'Creación y prescripción inicial de programa preventivo individualizado',
    jsonb_build_object('plan_type', p_plan_type, 'effective_from', p_effective_from, 'effective_until', p_effective_until)
  );

  RETURN jsonb_build_object(
    'success', true,
    'plan_id', v_plan_id,
    'status', v_status,
    'plan_version', 1
  );
END;
$$;


-- 10.2. Generar Evento Preventivo Derivado Estrictamente de Plan Aprobado
CREATE OR REPLACE FUNCTION public.generate_preventive_event(
  p_plan_id uuid,
  p_category text,
  p_action_reference text,
  p_due_at date,
  p_tolerance_days_before integer DEFAULT 7,
  p_tolerance_days_after integer DEFAULT 7,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan record;
  v_event_id uuid;
  v_w_start date;
  v_w_end date;
BEGIN
  SELECT * INTO v_plan
  FROM public.preventive_care_plans
  WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan preventivo no encontrado');
  END IF;

  IF v_plan.status != 'APPROVED' AND v_plan.status != 'ACTIVE' THEN
    RETURN jsonb_build_object('success', false, 'error', 'El plan no está aprobado formalmente por un veterinario');
  END IF;

  v_w_start := p_due_at - p_tolerance_days_before;
  v_w_end := p_due_at + p_tolerance_days_after;

  INSERT INTO public.preventive_care_events (
    plan_id, plan_version, pet_id, preventive_category,
    approved_action_reference, approved_due_at,
    approved_window_start, approved_window_end,
    verification_status, status, idempotency_key
  ) VALUES (
    p_plan_id, v_plan.plan_version, v_plan.pet_id, p_category,
    p_action_reference, p_due_at, v_w_start, v_w_end,
    'CONFIRMED', 'PENDING_SCHEDULING', p_idempotency_key
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_event_id;

  RETURN jsonb_build_object(
    'success', true,
    'event_id', v_event_id,
    'plan_id', p_plan_id,
    'action_reference', p_action_reference,
    'due_date', p_due_at,
    'window_start', v_w_start,
    'window_end', v_w_end
  );
END;
$$;


-- 10.3. Reconciliación de Registros de Fuente (Detección de Datos Desactualizados o en Conflicto)
CREATE OR REPLACE FUNCTION public.reconcile_preventive_source_record(
  p_org_id uuid,
  p_pet_id uuid,
  p_source_system text,
  p_source_ref text,
  p_reported_date timestamptz,
  p_performed_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source_id uuid;
  v_confidence text := 'UNVERIFIED';
  v_conflict text := 'NO_CONFLICT';
  v_days_old integer;
BEGIN
  v_days_old := EXTRACT(DAY FROM (now() - p_reported_date))::integer;

  IF v_days_old > 365 THEN
    v_confidence := 'STALE';
  ELSIF p_source_system = 'OKVET' THEN
    v_confidence := 'VERIFIED_HIGH';
  END IF;

  -- Comprobar si existe contradicción con registros previos
  IF EXISTS (
    SELECT 1 FROM public.preventive_care_source_records
    WHERE pet_id = p_pet_id AND source_record_reference = p_source_ref AND confidence_status = 'VERIFIED_HIGH'
    AND effective_at != p_reported_date
  ) THEN
    v_conflict := 'CONFLICT_DETECTED';
  END IF;

  INSERT INTO public.preventive_care_source_records (
    organization_id, pet_id, source_system, source_record_reference,
    effective_at, confidence_status, conflict_status, verified_by, verified_at
  ) VALUES (
    p_org_id, p_pet_id, p_source_system, p_source_ref,
    p_reported_date, v_confidence, v_conflict,
    CASE WHEN v_confidence = 'VERIFIED_HIGH' THEN p_performed_by ELSE NULL END,
    CASE WHEN v_confidence = 'VERIFIED_HIGH' THEN now() ELSE NULL END
  )
  RETURNING id INTO v_source_id;

  RETURN jsonb_build_object(
    'success', true,
    'source_id', v_source_id,
    'confidence_status', v_confidence,
    'conflict_status', v_conflict,
    'requires_human_verification', (v_confidence = 'STALE' OR v_conflict = 'CONFLICT_DETECTED')
  );
END;
$$;


-- 10.4. Agendar Cita Preventiva Verificando Ventana y Requisitos
CREATE OR REPLACE FUNCTION public.schedule_preventive_appointment(
  p_event_id uuid,
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
  v_event record;
BEGIN
  SELECT * INTO v_event
  FROM public.preventive_care_events
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Evento preventivo no encontrado');
  END IF;

  IF p_scheduled_date < v_event.approved_window_start OR p_scheduled_date > v_event.approved_window_end THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Fecha de cita fuera de la ventana clínica aprobada',
      'window_start', v_event.approved_window_start,
      'window_end', v_event.approved_window_end
    );
  END IF;

  UPDATE public.preventive_care_events
  SET appointment_id = p_appointment_id,
      status = 'SCHEDULED',
      updated_at = now()
  WHERE id = p_event_id;

  RETURN jsonb_build_object(
    'success', true,
    'event_id', p_event_id,
    'appointment_id', p_appointment_id,
    'status', 'SCHEDULED'
  );
END;
$$;


-- 10.5. Verificación de Lote de Producto y Cadena de Frío
CREATE OR REPLACE FUNCTION public.verify_product_lot_and_cold_chain(
  p_lot_id uuid,
  p_performed_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lot record;
  v_cold record;
BEGIN
  SELECT * INTO v_lot
  FROM public.preventive_product_lots
  WHERE id = p_lot_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lote de producto no encontrado');
  END IF;

  -- 1. Control de vencimiento
  IF v_lot.expiration_date < CURRENT_DATE THEN
    UPDATE public.preventive_product_lots SET status = 'EXPIRED' WHERE id = p_lot_id;
    RETURN jsonb_build_object('success', false, 'error', 'Lote de producto expirado', 'expiration_date', v_lot.expiration_date);
  END IF;

  -- 2. Control de cadena de frío si aplica
  IF v_lot.requires_cold_chain THEN
    SELECT * INTO v_cold
    FROM public.preventive_cold_chain_checks
    WHERE lot_id = p_lot_id
    ORDER BY checked_at DESC
    LIMIT 1;

    IF NOT FOUND OR v_cold.evidence_status != 'VALID_PROTOCOL' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Incidencia o falta de evidencia en protocolo de cadena de frío',
        'cold_chain_status', COALESCE(v_cold.evidence_status, 'MISSING_EVIDENCE')
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'lot_id', p_lot_id,
    'lot_number', v_lot.lot_number,
    'status', 'ACTIVE_VALID',
    'cold_chain_verified', v_lot.requires_cold_chain
  );
END;
$$;


-- 10.6. Registro Oficial de Aplicación Clínica Verificada
CREATE OR REPLACE FUNCTION public.record_preventive_application(
  p_event_id uuid,
  p_pet_id uuid,
  p_org_id uuid,
  p_vet_id uuid,
  p_product_ref text,
  p_lot_id uuid DEFAULT NULL,
  p_okvet_ref text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_vet boolean;
  v_app_id uuid;
  v_lot_num text := NULL;
BEGIN
  -- Validar que el aplicador sea médico veterinario clínico habilitado
  SELECT (is_clinical = true AND is_active = true) INTO v_is_vet
  FROM public.staff_profiles
  WHERE id = p_vet_id;

  IF v_is_vet IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo un médico veterinario habilitado puede certificar una aplicación clínica');
  END IF;

  IF p_lot_id IS NOT NULL THEN
    SELECT lot_number INTO v_lot_num
    FROM public.preventive_product_lots
    WHERE id = p_lot_id;
  END IF;

  INSERT INTO public.preventive_care_application_records (
    preventive_event_id, pet_id, organization_id, applied_by_vet_id,
    verified_by_vet_id, status, product_reference, product_lot_id,
    lot_number, okvet_sync_reference
  ) VALUES (
    p_event_id, p_pet_id, p_org_id, p_vet_id,
    p_vet_id, 'VERIFIED_APPLIED', p_product_ref, p_lot_id,
    v_lot_num, p_okvet_ref
  )
  RETURNING id INTO v_app_id;

  -- Actualizar el evento preventivo a aplicado
  UPDATE public.preventive_care_events
  SET status = 'APPLIED_VERIFIED',
      application_record_id = v_app_id,
      updated_at = now()
  WHERE id = p_event_id;

  RETURN jsonb_build_object(
    'success', true,
    'application_record_id', v_app_id,
    'event_id', p_event_id,
    'status', 'VERIFIED_APPLIED',
    'okvet_sync_reference', p_okvet_ref
  );
END;
$$;


-- 10.7. Actualización de Versión de Plan Preventivo (v1 -> v2)
CREATE OR REPLACE FUNCTION public.update_preventive_plan_version(
  p_plan_id uuid,
  p_new_plan_type text,
  p_new_until date,
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
  v_next_version integer;
BEGIN
  SELECT * INTO v_plan
  FROM public.preventive_care_plans
  WHERE id = p_plan_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan no encontrado');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = p_vet_id AND is_clinical = true AND is_active = true) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Solo un veterinario clínico activo puede autorizar cambios de versión de plan');
  END IF;

  v_next_version := v_plan.plan_version + 1;

  UPDATE public.preventive_care_plans
  SET plan_version = v_next_version,
      plan_type = COALESCE(p_new_plan_type, plan_type),
      effective_until = COALESCE(p_new_until, effective_until),
      approved_by = p_vet_id,
      approved_at = now(),
      updated_at = now()
  WHERE id = p_plan_id;

  INSERT INTO public.preventive_care_plan_versions (
    plan_id, plan_version, status, approved_by,
    justification_notes, plan_snapshot
  ) VALUES (
    p_plan_id, v_next_version, 'APPROVED', p_vet_id,
    p_justification,
    jsonb_build_object('plan_type', COALESCE(p_new_plan_type, v_plan.plan_type), 'effective_until', COALESCE(p_new_until, v_plan.effective_until))
  );

  RETURN jsonb_build_object(
    'success', true,
    'plan_id', p_plan_id,
    'previous_version', v_plan.plan_version,
    'new_version', v_next_version,
    'approved_by_vet', p_vet_id
  );
END;
$$;


-- ==============================================================================
-- 11. SEGURIDAD Y CONTROL DE ACCESO (RLS & REVOCACIONES)
-- ==============================================================================

ALTER TABLE public.preventive_care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_care_plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_care_source_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_care_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_product_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_cold_chain_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_care_application_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_care_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_care_audit ENABLE ROW LEVEL SECURITY;

-- Revocar permisos anónimos
REVOKE ALL ON public.preventive_care_plans FROM anon, public;
REVOKE ALL ON public.preventive_care_plan_versions FROM anon, public;
REVOKE ALL ON public.preventive_care_source_records FROM anon, public;
REVOKE ALL ON public.preventive_care_events FROM anon, public;
REVOKE ALL ON public.preventive_product_lots FROM anon, public;
REVOKE ALL ON public.preventive_cold_chain_checks FROM anon, public;
REVOKE ALL ON public.preventive_care_application_records FROM anon, public;
REVOKE ALL ON public.preventive_care_incidents FROM anon, public;
REVOKE ALL ON public.preventive_care_audit FROM anon, public;

REVOKE ALL ON FUNCTION public.create_approved_preventive_plan FROM anon, public;
REVOKE ALL ON FUNCTION public.generate_preventive_event FROM anon, public;
REVOKE ALL ON FUNCTION public.reconcile_preventive_source_record FROM anon, public;
REVOKE ALL ON FUNCTION public.schedule_preventive_appointment FROM anon, public;
REVOKE ALL ON FUNCTION public.verify_product_lot_and_cold_chain FROM anon, public;
REVOKE ALL ON FUNCTION public.record_preventive_application FROM anon, public;
REVOKE ALL ON FUNCTION public.update_preventive_plan_version FROM anon, public;

-- Conceder a authenticated y service_role
GRANT ALL ON public.preventive_care_plans TO authenticated, service_role;
GRANT ALL ON public.preventive_care_plan_versions TO authenticated, service_role;
GRANT ALL ON public.preventive_care_source_records TO authenticated, service_role;
GRANT ALL ON public.preventive_care_events TO authenticated, service_role;
GRANT ALL ON public.preventive_product_lots TO authenticated, service_role;
GRANT ALL ON public.preventive_cold_chain_checks TO authenticated, service_role;
GRANT ALL ON public.preventive_care_application_records TO authenticated, service_role;
GRANT ALL ON public.preventive_care_incidents TO authenticated, service_role;
GRANT ALL ON public.preventive_care_audit TO authenticated, service_role;

GRANT EXECUTE ON FUNCTION public.create_approved_preventive_plan TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.generate_preventive_event TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reconcile_preventive_source_record TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.schedule_preventive_appointment TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_product_lot_and_cold_chain TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_preventive_application TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_preventive_plan_version TO authenticated, service_role;

-- Políticas multi-tenant
DROP POLICY IF EXISTS rls_preventive_care_plans ON public.preventive_care_plans;
CREATE POLICY rls_preventive_care_plans ON public.preventive_care_plans
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff_profiles WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS rls_preventive_care_plan_versions ON public.preventive_care_plan_versions;
CREATE POLICY rls_preventive_care_plan_versions ON public.preventive_care_plan_versions
  FOR ALL TO authenticated
  USING (
    plan_id IN (SELECT id FROM public.preventive_care_plans)
  );

DROP POLICY IF EXISTS rls_preventive_care_source_records ON public.preventive_care_source_records;
CREATE POLICY rls_preventive_care_source_records ON public.preventive_care_source_records
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff_profiles WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS rls_preventive_care_events ON public.preventive_care_events;
CREATE POLICY rls_preventive_care_events ON public.preventive_care_events
  FOR ALL TO authenticated
  USING (
    plan_id IN (SELECT id FROM public.preventive_care_plans)
  );

DROP POLICY IF EXISTS rls_preventive_product_lots ON public.preventive_product_lots;
CREATE POLICY rls_preventive_product_lots ON public.preventive_product_lots
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff_profiles WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS rls_preventive_cold_chain_checks ON public.preventive_cold_chain_checks;
CREATE POLICY rls_preventive_cold_chain_checks ON public.preventive_cold_chain_checks
  FOR ALL TO authenticated
  USING (
    lot_id IN (SELECT id FROM public.preventive_product_lots)
  );

DROP POLICY IF EXISTS rls_preventive_care_application_records ON public.preventive_care_application_records;
CREATE POLICY rls_preventive_care_application_records ON public.preventive_care_application_records
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff_profiles WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS rls_preventive_care_incidents ON public.preventive_care_incidents;
CREATE POLICY rls_preventive_care_incidents ON public.preventive_care_incidents
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff_profiles WHERE auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS rls_preventive_care_audit ON public.preventive_care_audit;
CREATE POLICY rls_preventive_care_audit ON public.preventive_care_audit
  FOR ALL TO authenticated
  USING (true);
