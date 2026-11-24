-- ==============================================================================
-- VET FREEDOM OS — MIGRACIÓN 028: APPOINTMENT NOTIFICATIONS, OKVET & LIFECYCLE
-- Módulo: VET-CORE-05 | Appointment Notification Service & Scheduling Gate
-- Dirección Médica: Dr. Luis Eduardo Ríos
-- Dirección Estratégica: Alpha Vision Method
-- Base de Datos: Supabase PostgreSQL 17
-- ==============================================================================

-- 1. Ampliar tabla public.appointments con versionado y auditoría OKVET
ALTER TABLE public.appointments 
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS okvet_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS okvet_verified_by uuid REFERENCES auth.users(id);

-- Ampliar restricción de estados de citas para soportar el ciclo de vida completo
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_status_check CHECK (
  status = ANY (ARRAY[
    'REQUESTED'::text,
    'NEEDS_INFORMATION'::text,
    'VALIDATING_COVERAGE'::text,
    'VALIDATING_AVAILABILITY'::text,
    'PROVISIONAL'::text,
    'HOLD_ACTIVE'::text,
    'SCHEDULED'::text,
    'PENDING_OKVET'::text,
    'CONFIRMED_OFFICIAL'::text,
    'RESCHEDULE_REQUESTED'::text,
    'RESCHEDULE_PROPOSED'::text,
    'RESCHEDULE_PENDING_ACCEPTANCE'::text,
    'RESCHEDULE_PENDING_OKVET'::text,
    'RESCHEDULED'::text,
    'CANCELLATION_REQUESTED'::text,
    'CANCELLED_CLIENT'::text,
    'CANCELLED_CLINICAL'::text,
    'CANCELLED'::text,
    'EN_ROUTE'::text,
    'ARRIVED'::text,
    'IN_PROGRESS'::text,
    'COMPLETED'::text,
    'NO_SHOW'::text,
    'VISIT_NOT_COMPLETED'::text,
    'ADMINISTRATIVELY_CLOSED'::text
  ])
);

-- 2. Planes de Notificación de Citas (Persistencia Durable)
CREATE TABLE IF NOT EXISTS public.appointment_notification_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  appointment_version integer NOT NULL DEFAULT 1,
  policy_version text NOT NULL DEFAULT 'v1.0',
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INVALIDATED', 'SUPERSEDED', 'CANCELLED', 'COMPLETED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_apt_plan_version UNIQUE (organization_id, appointment_id, appointment_version)
);

-- 3. Trabajos de Notificación Programada (Notification Jobs)
CREATE TABLE IF NOT EXISTS public.appointment_notification_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.appointment_notification_plans(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  appointment_version integer NOT NULL DEFAULT 1,
  notification_type text NOT NULL CHECK (notification_type IN (
    'REQUEST_RECEIVED',
    'CONFIRMATION_OFFICIAL',
    'REMINDER_24H',
    'REMINDER_2H',
    'RESCHEDULE_PROPOSAL',
    'RESCHEDULE_CONFIRMED',
    'CANCELLATION_CONFIRMED',
    'NO_SHOW_FOLLOWUP',
    'DELAY_NOTICE',
    'WAITLIST_OFFER'
  )),
  channel text NOT NULL DEFAULT 'WHATSAPP' CHECK (channel IN ('WHATSAPP', 'SMS', 'EMAIL', 'SYSTEM')),
  recipient_phone text NOT NULL,
  recipient_name text NOT NULL,
  template_code text NOT NULL,
  template_parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  planned_for timestamptz NOT NULL,
  eligible_after timestamptz NOT NULL,
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
  dispatch_request_id uuid REFERENCES public.outbound_dispatch_requests(id) ON DELETE SET NULL,
  idempotency_key text NOT NULL UNIQUE,
  suppression_reason text,
  executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Propuestas de Reprogramación de Citas
CREATE TABLE IF NOT EXISTS public.appointment_reschedule_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  source_version integer NOT NULL,
  requested_by_user_id uuid REFERENCES auth.users(id),
  requested_by_actor_type text NOT NULL DEFAULT 'CLIENT' CHECK (requested_by_actor_type IN ('CLIENT', 'COORDINATOR', 'VETERINARIAN', 'SYSTEM')),
  reason text NOT NULL,
  original_start_time timestamptz NOT NULL,
  proposed_start_time timestamptz NOT NULL,
  proposed_end_time timestamptz NOT NULL,
  proposed_veterinarian_id uuid REFERENCES public.staff_profiles(id),
  status text NOT NULL DEFAULT 'PENDING_ACCEPTANCE' CHECK (status IN (
    'PENDING_ACCEPTANCE',
    'ACCEPTED_BY_CLIENT',
    'REJECTED_BY_CLIENT',
    'PENDING_OKVET',
    'CONFIRMED_APPLIED',
    'CANCELLED',
    'EXPIRED'
  )),
  client_accepted_at timestamptz,
  okvet_reference text,
  okvet_verified_at timestamptz,
  okvet_verified_by uuid REFERENCES auth.users(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Lista de Espera de Citas
CREATE TABLE IF NOT EXISTS public.appointment_waitlist_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  preferred_date_start date NOT NULL,
  preferred_date_end date NOT NULL,
  preferred_time_windows text[] DEFAULT ARRAY['MORNING', 'AFTERNOON'],
  priority text NOT NULL DEFAULT 'STANDARD' CHECK (priority IN ('STANDARD', 'HIGH', 'CLINICAL_URGENT')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'OFFER_EXTENDED', 'BOOKED', 'EXPIRED', 'CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Ofertas de Lista de Espera
CREATE TABLE IF NOT EXISTS public.appointment_waitlist_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  waitlist_entry_id uuid NOT NULL REFERENCES public.appointment_waitlist_entries(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  offered_start_time timestamptz NOT NULL,
  offered_end_time timestamptz NOT NULL,
  offered_veterinarian_id uuid NOT NULL REFERENCES public.staff_profiles(id),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Tareas de Recuperación de Visitas No Realizadas / No-Show
CREATE TABLE IF NOT EXISTS public.appointment_recovery_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  incident_type text NOT NULL CHECK (incident_type IN (
    'CLIENT_NO_SHOW',
    'VET_UNABLE_TO_ATTEND',
    'TRAFFIC_ROUTE_ABORTED',
    'ADDRESS_UNREACHABLE',
    'CLINICAL_FORCE_MAJEURE'
  )),
  assigned_staff_id uuid REFERENCES public.staff_profiles(id),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESCHEDULED', 'CLOSED_LOST', 'CANCELLED')),
  notes text,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices de cobertura para rendimiento óptimo
CREATE INDEX IF NOT EXISTS idx_apt_notif_plans_apt ON public.appointment_notification_plans(appointment_id, appointment_version);
CREATE INDEX IF NOT EXISTS idx_apt_notif_jobs_status_planned ON public.appointment_notification_jobs(status, planned_for) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_apt_reschedule_proposals_apt ON public.appointment_reschedule_proposals(appointment_id, status);
CREATE INDEX IF NOT EXISTS idx_apt_waitlist_org_status ON public.appointment_waitlist_entries(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_apt_recovery_tasks_apt ON public.appointment_recovery_tasks(appointment_id, status);

-- Habilitar RLS al 100% en las nuevas tablas
ALTER TABLE public.appointment_notification_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_reschedule_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_waitlist_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_waitlist_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_recovery_tasks ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DO $$
BEGIN
  -- Plans
  DROP POLICY IF EXISTS p_apt_plans_member ON public.appointment_notification_plans;
  CREATE POLICY p_apt_plans_member ON public.appointment_notification_plans
    FOR ALL TO authenticated
    USING (public.is_org_member(organization_id));

  -- Jobs
  DROP POLICY IF EXISTS p_apt_jobs_member ON public.appointment_notification_jobs;
  CREATE POLICY p_apt_jobs_member ON public.appointment_notification_jobs
    FOR ALL TO authenticated
    USING (public.is_org_member(organization_id));

  -- Reschedule
  DROP POLICY IF EXISTS p_apt_reschedule_member ON public.appointment_reschedule_proposals;
  CREATE POLICY p_apt_reschedule_member ON public.appointment_reschedule_proposals
    FOR ALL TO authenticated
    USING (public.is_org_member(organization_id));

  -- Waitlist Entries
  DROP POLICY IF EXISTS p_apt_waitlist_member ON public.appointment_waitlist_entries;
  CREATE POLICY p_apt_waitlist_member ON public.appointment_waitlist_entries
    FOR ALL TO authenticated
    USING (public.is_org_member(organization_id));

  -- Waitlist Offers
  DROP POLICY IF EXISTS p_apt_offers_member ON public.appointment_waitlist_offers;
  CREATE POLICY p_apt_offers_member ON public.appointment_waitlist_offers
    FOR ALL TO authenticated
    USING (public.is_org_member(organization_id));

  -- Recovery Tasks
  DROP POLICY IF EXISTS p_apt_recovery_member ON public.appointment_recovery_tasks;
  CREATE POLICY p_apt_recovery_member ON public.appointment_recovery_tasks
    FOR ALL TO authenticated
    USING (public.is_org_member(organization_id));
END $$;

-- ==============================================================================
-- 8. FUNCIONES ATÓMICAS (RPCs)
-- ==============================================================================

-- A. Gate de Confirmación Oficial OKVET
CREATE OR REPLACE FUNCTION public.verify_and_confirm_appointment_okvet(
  p_appointment_id uuid,
  p_okvet_reference text,
  p_verified_by uuid,
  p_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_apt record;
  v_new_version integer;
  v_outbox_id uuid;
BEGIN
  IF p_okvet_reference IS NULL OR trim(p_okvet_reference) = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'OKVET_REFERENCE_REQUIRED',
      'message', 'No se puede confirmar una cita oficial sin la referencia verificable de OKVET.'
    );
  END IF;

  SELECT * INTO v_apt
  FROM public.appointments
  WHERE id = p_appointment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'APPOINTMENT_NOT_FOUND');
  END IF;

  IF v_apt.status = 'CANCELLED' OR v_apt.status LIKE 'CANCELLED%' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CANNOT_CONFIRM_CANCELLED_APPOINTMENT',
      'message', 'La cita se encuentra cancelada y no puede ser confirmada.'
    );
  END IF;

  IF v_apt.status = 'CONFIRMED_OFFICIAL' AND v_apt.okvet_appointment_id = p_okvet_reference THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'ALREADY_CONFIRMED',
      'appointment_id', v_apt.id,
      'version', v_apt.version,
      'message', 'La cita ya fue confirmada previamente con la misma referencia OKVET.'
    );
  END IF;

  v_new_version := COALESCE(v_apt.version, 1) + 1;

  UPDATE public.appointments
  SET status = 'CONFIRMED_OFFICIAL',
      okvet_appointment_id = p_okvet_reference,
      okvet_sync_status = 'SYNCED_MANUAL',
      okvet_verified_at = now(),
      okvet_verified_by = p_verified_by,
      confirmation_evidence = COALESCE(p_notes, 'Confirmado oficialmente en OKVET por personal asistido'),
      version = v_new_version,
      updated_at = now()
  WHERE id = p_appointment_id;

  INSERT INTO public.appointment_status_history (
    organization_id,
    appointment_id,
    from_status,
    to_status,
    changed_by,
    reason,
    metadata
  ) VALUES (
    v_apt.organization_id,
    v_apt.id,
    v_apt.status,
    'CONFIRMED_OFFICIAL',
    p_verified_by,
    'Confirmación oficial OKVET verificada',
    jsonb_build_object(
      'okvet_reference', p_okvet_reference,
      'version', v_new_version,
      'notes', p_notes
    )
  );

  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    correlation_id,
    source_system
  ) VALUES (
    v_apt.organization_id,
    'APPOINTMENT',
    v_apt.id,
    'appointment.confirmed',
    jsonb_build_object(
      'appointment_id', v_apt.id,
      'organization_id', v_apt.organization_id,
      'owner_id', v_apt.owner_id,
      'pet_id', v_apt.pet_id,
      'service_id', v_apt.service_id,
      'assigned_veterinarian_id', v_apt.assigned_veterinarian_id,
      'start_time', v_apt.start_time,
      'end_time', v_apt.end_time,
      'okvet_reference', p_okvet_reference,
      'version', v_new_version,
      'verified_at', now()
    ),
    'apt-conf-' || v_apt.id || '-v' || v_new_version,
    'corr-apt-' || gen_random_uuid(),
    'OKVET_GATE'
  ) RETURNING id INTO v_outbox_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'CONFIRMED_OFFICIAL',
    'appointment_id', v_apt.id,
    'version', v_new_version,
    'okvet_reference', p_okvet_reference,
    'outbox_event_id', v_outbox_id,
    'confirmed_at', now()
  );
END;
$$;

-- B. Generación Durable del Plan de Notificaciones de Cita
CREATE OR REPLACE FUNCTION public.generate_appointment_notification_plan(
  p_appointment_id uuid,
  p_org_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_apt record;
  v_owner record;
  v_pet record;
  v_staff record;
  v_plan_id uuid;
  v_job_conf_id uuid;
  v_job_24h_id uuid;
  v_job_2h_id uuid;
  v_planned_24h timestamptz;
  v_planned_2h timestamptz;
  v_tutor_name text;
  v_pet_name text;
  v_vet_name text;
BEGIN
  SELECT a.*, o.name as org_name INTO v_apt
  FROM public.appointments a
  JOIN public.organizations o ON a.organization_id = o.id
  WHERE a.id = p_appointment_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'APPOINTMENT_NOT_FOUND');
  END IF;

  IF v_apt.status != 'CONFIRMED_OFFICIAL' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CANNOT_PLAN_NOTIFICATIONS_FOR_UNCONFIRMED_APPOINTMENT',
      'current_status', v_apt.status
    );
  END IF;

  SELECT * INTO v_owner FROM public.owners WHERE id = v_apt.owner_id;
  SELECT * INTO v_pet FROM public.pets WHERE id = v_apt.pet_id;
  SELECT sp.*, u.raw_user_meta_data INTO v_staff 
  FROM public.staff_profiles sp
  LEFT JOIN auth.users u ON sp.user_id = u.id
  WHERE sp.id = v_apt.assigned_veterinarian_id;

  v_tutor_name := COALESCE(v_owner.first_name, 'Tutor');
  v_pet_name := COALESCE(v_pet.name, 'Mascota');
  v_vet_name := COALESCE(v_staff.full_name, 'Dr. Luis Eduardo Ríos');

  UPDATE public.appointment_notification_plans
  SET status = 'SUPERSEDED', updated_at = now()
  WHERE appointment_id = p_appointment_id AND status = 'ACTIVE';

  INSERT INTO public.appointment_notification_plans (
    organization_id,
    appointment_id,
    appointment_version,
    policy_version,
    status
  ) VALUES (
    v_apt.organization_id,
    v_apt.id,
    COALESCE(v_apt.version, 1),
    'v1.0',
    'ACTIVE'
  )
  ON CONFLICT (organization_id, appointment_id, appointment_version)
  DO UPDATE SET status = 'ACTIVE', updated_at = now()
  RETURNING id INTO v_plan_id;

  -- 1. Notificación Oficial de Confirmación Inmediata
  INSERT INTO public.appointment_notification_jobs (
    plan_id,
    organization_id,
    appointment_id,
    appointment_version,
    notification_type,
    channel,
    recipient_phone,
    recipient_name,
    template_code,
    template_parameters,
    planned_for,
    eligible_after,
    expires_at,
    status,
    idempotency_key
  ) VALUES (
    v_plan_id,
    v_apt.organization_id,
    v_apt.id,
    v_apt.version,
    'CONFIRMATION_OFFICIAL',
    'WHATSAPP',
    v_owner.primary_phone,
    v_tutor_name,
    'vet_appointment_confirmed',
    jsonb_build_object(
      'owner_name', v_tutor_name,
      'pet_name', v_pet_name,
      'date', to_char(v_apt.start_time AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD'),
      'time_window', to_char(v_apt.start_time AT TIME ZONE 'America/Bogota', 'HH12:MI AM'),
      'veterinarian_name', v_vet_name
    ),
    now(),
    now(),
    v_apt.start_time,
    'PENDING',
    'apt-job-' || v_apt.organization_id || '-' || v_apt.id || '-v' || v_apt.version || '-CONF'
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_job_conf_id;

  -- 2. Recordatorio 24h Antes
  v_planned_24h := v_apt.start_time - interval '24 hours';
  IF v_planned_24h > now() THEN
    INSERT INTO public.appointment_notification_jobs (
      plan_id,
      organization_id,
      appointment_id,
      appointment_version,
      notification_type,
      channel,
      recipient_phone,
      recipient_name,
      template_code,
      template_parameters,
      planned_for,
      eligible_after,
      expires_at,
      status,
      idempotency_key
    ) VALUES (
      v_plan_id,
      v_apt.organization_id,
      v_apt.id,
      v_apt.version,
      'REMINDER_24H',
      'WHATSAPP',
      v_owner.primary_phone,
      v_tutor_name,
      'vet_appointment_reminder_24h',
      jsonb_build_object(
        'owner_name', v_tutor_name,
        'pet_name', v_pet_name,
        'date', to_char(v_apt.start_time AT TIME ZONE 'America/Bogota', 'YYYY-MM-DD'),
        'time_window', to_char(v_apt.start_time AT TIME ZONE 'America/Bogota', 'HH12:MI AM')
      ),
      v_planned_24h,
      v_planned_24h,
      v_apt.start_time - interval '2 hours',
      'PENDING',
      'apt-job-' || v_apt.organization_id || '-' || v_apt.id || '-v' || v_apt.version || '-REM24H'
    )
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING id INTO v_job_24h_id;
  END IF;

  -- 3. Recordatorio Cercano 2h Antes
  v_planned_2h := v_apt.start_time - interval '2 hours';
  IF v_planned_2h > now() THEN
    INSERT INTO public.appointment_notification_jobs (
      plan_id,
      organization_id,
      appointment_id,
      appointment_version,
      notification_type,
      channel,
      recipient_phone,
      recipient_name,
      template_code,
      template_parameters,
      planned_for,
      eligible_after,
      expires_at,
      status,
      idempotency_key
    ) VALUES (
      v_plan_id,
      v_apt.organization_id,
      v_apt.id,
      v_apt.version,
      'REMINDER_2H',
      'WHATSAPP',
      v_owner.primary_phone,
      v_tutor_name,
      'vet_veterinarian_on_the_way',
      jsonb_build_object(
        'owner_name', v_tutor_name,
        'pet_name', v_pet_name,
        'time_window', to_char(v_apt.start_time AT TIME ZONE 'America/Bogota', 'HH12:MI AM'),
        'veterinarian_name', v_vet_name
      ),
      v_planned_2h,
      v_planned_2h,
      v_apt.start_time,
      'PENDING',
      'apt-job-' || v_apt.organization_id || '-' || v_apt.id || '-v' || v_apt.version || '-REM2H'
    )
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING id INTO v_job_2h_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'plan_id', v_plan_id,
    'appointment_id', v_apt.id,
    'version', v_apt.version,
    'jobs_created', jsonb_build_object(
      'confirmation_job', v_job_conf_id,
      'reminder_24h_job', v_job_24h_id,
      'reminder_2h_job', v_job_2h_id
    )
  );
END;
$$;

-- C. Procesador de Trabajos Vencidos y Creación de Outbound Dispatch Requests
CREATE OR REPLACE FUNCTION public.process_due_appointment_notification_jobs(
  p_batch_size integer DEFAULT 25
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job record;
  v_apt record;
  v_processed_count integer := 0;
  v_suppressed_count integer := 0;
  v_cancelled_count integer := 0;
  v_outbound_id uuid;
  v_is_bereaved boolean := false;
BEGIN
  FOR v_job IN
    SELECT j.*
    FROM public.appointment_notification_jobs j
    WHERE j.status = 'PENDING'
      AND j.planned_for <= now()
      AND j.expires_at > now()
    ORDER BY j.planned_for ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  LOOP
    SELECT * INTO v_apt FROM public.appointments WHERE id = v_job.appointment_id;

    -- 1. Validar si la cita fue cancelada
    IF NOT FOUND OR v_apt.status LIKE 'CANCELLED%' OR v_apt.status = 'CANCELLED' THEN
      UPDATE public.appointment_notification_jobs
      SET status = 'CANCELLED', suppression_reason = 'APPOINTMENT_CANCELLED', updated_at = now()
      WHERE id = v_job.id;
      v_cancelled_count := v_cancelled_count + 1;
      CONTINUE;
    END IF;

    -- 2. Validar versión de la cita (control de reprogramaciones)
    IF v_apt.version != v_job.appointment_version THEN
      UPDATE public.appointment_notification_jobs
      SET status = 'SUPERSEDED', suppression_reason = 'APPOINTMENT_VERSION_MISMATCH', updated_at = now()
      WHERE id = v_job.id;
      v_cancelled_count := v_cancelled_count + 1;
      CONTINUE;
    END IF;

    -- 3. Validar protocolo de duelo
    SELECT EXISTS (
      SELECT 1 FROM public.whatsapp_contact_suppressions
      WHERE phone_number = v_job.recipient_phone AND suppression_reason = 'BEREAVEMENT' AND active = true
    ) INTO v_is_bereaved;

    IF v_is_bereaved THEN
      UPDATE public.appointment_notification_jobs
      SET status = 'SUPPRESSED', suppression_reason = 'BEREAVEMENT_ACTIVE', updated_at = now()
      WHERE id = v_job.id;
      v_suppressed_count := v_suppressed_count + 1;
      CONTINUE;
    END IF;

    -- 4. Crear solicitud de despacho en public.outbound_dispatch_requests
    INSERT INTO public.outbound_dispatch_requests (
      organization_id,
      recipient_phone,
      recipient_name,
      sender_phone_number_id,
      message_category,
      message_purpose,
      business_entity_type,
      business_entity_id,
      business_entity_version,
      template_id,
      template_parameters,
      has_consent,
      is_bereaved,
      idempotency_key,
      correlation_id,
      status,
      expires_at
    )
    SELECT
      v_job.organization_id,
      v_job.recipient_phone,
      v_job.recipient_name,
      '109876543210987',
      'UTILITY',
      v_job.notification_type,
      'APPOINTMENT',
      v_job.appointment_id,
      v_job.appointment_version,
      t.id,
      v_job.template_parameters,
      true,
      false,
      'disp-' || v_job.idempotency_key,
      'corr-job-' || v_job.id,
      'QUEUED',
      v_job.expires_at
    FROM public.message_templates t
    WHERE t.template_name = v_job.template_code
    LIMIT 1
    RETURNING id INTO v_outbound_id;

    UPDATE public.appointment_notification_jobs
    SET status = 'DISPATCHED',
        dispatch_request_id = v_outbound_id,
        executed_at = now(),
        updated_at = now()
    WHERE id = v_job.id;

    v_processed_count := v_processed_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'processed_count', v_processed_count,
    'suppressed_count', v_suppressed_count,
    'cancelled_count', v_cancelled_count,
    'executed_at', now()
  );
END;
$$;

-- D. Proponer Reprogramación de Cita
CREATE OR REPLACE FUNCTION public.propose_appointment_reschedule(
  p_appointment_id uuid,
  p_proposed_start timestamptz,
  p_proposed_end timestamptz,
  p_proposed_vet_id uuid,
  p_reason text,
  p_requested_by uuid,
  p_actor_type text DEFAULT 'CLIENT'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_apt record;
  v_proposal_id uuid;
BEGIN
  SELECT * INTO v_apt FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'APPOINTMENT_NOT_FOUND');
  END IF;

  IF v_apt.status LIKE 'CANCELLED%' OR v_apt.status = 'CANCELLED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'CANNOT_RESCHEDULE_CANCELLED_APPOINTMENT');
  END IF;

  INSERT INTO public.appointment_reschedule_proposals (
    organization_id,
    appointment_id,
    source_version,
    requested_by_user_id,
    requested_by_actor_type,
    reason,
    original_start_time,
    proposed_start_time,
    proposed_end_time,
    proposed_veterinarian_id,
    status,
    expires_at
  ) VALUES (
    v_apt.organization_id,
    v_apt.id,
    v_apt.version,
    p_requested_by,
    p_actor_type,
    p_reason,
    v_apt.start_time,
    p_proposed_start,
    p_proposed_end,
    p_proposed_vet_id,
    'PENDING_ACCEPTANCE',
    now() + interval '24 hours'
  ) RETURNING id INTO v_proposal_id;

  UPDATE public.appointments
  SET status = 'RESCHEDULE_PROPOSED', updated_at = now()
  WHERE id = p_appointment_id;

  UPDATE public.appointment_notification_jobs
  SET status = 'SUPERSEDED', suppression_reason = 'RESCHEDULE_PROPOSED', updated_at = now()
  WHERE appointment_id = p_appointment_id AND status = 'PENDING';

  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    source_system
  ) VALUES (
    v_apt.organization_id,
    'APPOINTMENT',
    v_apt.id,
    'appointment.reschedule_proposed',
    jsonb_build_object(
      'proposal_id', v_proposal_id,
      'appointment_id', v_apt.id,
      'original_start', v_apt.start_time,
      'proposed_start', p_proposed_start,
      'reason', p_reason
    ),
    'apt-prop-' || v_proposal_id,
    'RESCHEDULE_ENGINE'
  );

  RETURN jsonb_build_object(
    'success', true,
    'proposal_id', v_proposal_id,
    'status', 'RESCHEDULE_PROPOSED',
    'appointment_id', v_apt.id
  );
END;
$$;

-- E. Confirmar Reprogramación Oficialmente con Gate OKVET
CREATE OR REPLACE FUNCTION public.confirm_appointment_reschedule_okvet(
  p_proposal_id uuid,
  p_okvet_reference text,
  p_verified_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prop record;
  v_apt record;
  v_new_version integer;
BEGIN
  IF p_okvet_reference IS NULL OR trim(p_okvet_reference) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'OKVET_REFERENCE_REQUIRED');
  END IF;

  SELECT * INTO v_prop FROM public.appointment_reschedule_proposals WHERE id = p_proposal_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'PROPOSAL_NOT_FOUND');
  END IF;

  SELECT * INTO v_apt FROM public.appointments WHERE id = v_prop.appointment_id FOR UPDATE;
  v_new_version := v_apt.version + 1;

  UPDATE public.appointment_reschedule_proposals
  SET status = 'CONFIRMED_APPLIED',
      okvet_reference = p_okvet_reference,
      okvet_verified_at = now(),
      okvet_verified_by = p_verified_by,
      updated_at = now()
  WHERE id = p_proposal_id;

  UPDATE public.appointments
  SET status = 'CONFIRMED_OFFICIAL',
      start_time = v_prop.proposed_start_time,
      end_time = v_prop.proposed_end_time,
      assigned_veterinarian_id = COALESCE(v_prop.proposed_veterinarian_id, v_apt.assigned_veterinarian_id),
      okvet_appointment_id = p_okvet_reference,
      okvet_sync_status = 'SYNCED_MANUAL',
      okvet_verified_at = now(),
      okvet_verified_by = p_verified_by,
      version = v_new_version,
      updated_at = now()
  WHERE id = v_apt.id;

  -- Generar el nuevo plan durable para la nueva versión de la cita
  PERFORM public.generate_appointment_notification_plan(v_apt.id);

  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    source_system
  ) VALUES (
    v_apt.organization_id,
    'APPOINTMENT',
    v_apt.id,
    'appointment.rescheduled',
    jsonb_build_object(
      'proposal_id', v_prop.id,
      'appointment_id', v_apt.id,
      'new_start_time', v_prop.proposed_start_time,
      'version', v_new_version,
      'okvet_reference', p_okvet_reference
    ),
    'apt-resched-conf-' || v_apt.id || '-v' || v_new_version,
    'OKVET_GATE'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'CONFIRMED_OFFICIAL',
    'appointment_id', v_apt.id,
    'new_version', v_new_version,
    'new_start_time', v_prop.proposed_start_time
  );
END;
$$;

-- F. Cancelación Autorizada de Cita y Purga de Recordatorios
CREATE OR REPLACE FUNCTION public.cancel_appointment_authorized(
  p_appointment_id uuid,
  p_reason text,
  p_cancelled_by uuid,
  p_actor_role text DEFAULT 'STAFF'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_apt record;
  v_new_version integer;
BEGIN
  SELECT * INTO v_apt FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'APPOINTMENT_NOT_FOUND');
  END IF;

  IF v_apt.status LIKE 'CANCELLED%' OR v_apt.status = 'CANCELLED' THEN
    RETURN jsonb_build_object('success', true, 'status', 'ALREADY_CANCELLED');
  END IF;

  v_new_version := v_apt.version + 1;

  UPDATE public.appointments
  SET status = 'CANCELLED',
      cancellation_reason = p_reason,
      cancelled_by = p_cancelled_by,
      version = v_new_version,
      updated_at = now()
  WHERE id = p_appointment_id;

  -- Invalidar planes y cancelar todos los trabajos futuros
  UPDATE public.appointment_notification_plans
  SET status = 'CANCELLED', updated_at = now()
  WHERE appointment_id = p_appointment_id;

  UPDATE public.appointment_notification_jobs
  SET status = 'CANCELLED', suppression_reason = 'APPOINTMENT_CANCELLED', updated_at = now()
  WHERE appointment_id = p_appointment_id AND status = 'PENDING';

  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    source_system
  ) VALUES (
    v_apt.organization_id,
    'APPOINTMENT',
    v_apt.id,
    'appointment.cancelled',
    jsonb_build_object(
      'appointment_id', v_apt.id,
      'reason', p_reason,
      'cancelled_by', p_cancelled_by,
      'version', v_new_version
    ),
    'apt-canc-' || v_apt.id || '-v' || v_new_version,
    'APPOINTMENT_SERVICE'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'CANCELLED',
    'appointment_id', v_apt.id,
    'version', v_new_version
  );
END;
$$;

-- G. Registro de Visita No Realizada / No-Show y Tarea de Recuperación
CREATE OR REPLACE FUNCTION public.record_appointment_no_show_or_uncompleted(
  p_appointment_id uuid,
  p_incident_type text,
  p_notes text,
  p_reported_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_apt record;
  v_task_id uuid;
  v_new_status text;
BEGIN
  SELECT * INTO v_apt FROM public.appointments WHERE id = p_appointment_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'APPOINTMENT_NOT_FOUND');
  END IF;

  IF p_incident_type = 'CLIENT_NO_SHOW' THEN
    v_new_status := 'NO_SHOW';
  ELSE
    v_new_status := 'VISIT_NOT_COMPLETED';
  END IF;

  UPDATE public.appointments
  SET status = v_new_status, updated_at = now()
  WHERE id = p_appointment_id;

  INSERT INTO public.appointment_recovery_tasks (
    organization_id,
    appointment_id,
    incident_type,
    notes,
    status
  ) VALUES (
    v_apt.organization_id,
    v_apt.id,
    p_incident_type,
    p_notes,
    'OPEN'
  ) RETURNING id INTO v_task_id;

  INSERT INTO public.transactional_outbox (
    organization_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload,
    idempotency_key,
    source_system
  ) VALUES (
    v_apt.organization_id,
    'APPOINTMENT',
    v_apt.id,
    CASE WHEN v_new_status = 'NO_SHOW' THEN 'appointment.no_show_recorded' ELSE 'appointment.visit_not_completed' END,
    jsonb_build_object(
      'recovery_task_id', v_task_id,
      'appointment_id', v_apt.id,
      'incident_type', p_incident_type,
      'notes', p_notes
    ),
    'apt-recov-' || v_task_id,
    'OPERATIONAL_RECOVERY'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', v_new_status,
    'recovery_task_id', v_task_id,
    'appointment_id', v_apt.id
  );
END;
$$;

-- 9. Endurecimiento de permisos de ejecución (0 anon warnings en Supabase Linter)
REVOKE EXECUTE ON FUNCTION public.verify_and_confirm_appointment_okvet FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_and_confirm_appointment_okvet TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.generate_appointment_notification_plan FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_appointment_notification_plan TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.process_due_appointment_notification_jobs FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_due_appointment_notification_jobs TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.propose_appointment_reschedule FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.propose_appointment_reschedule TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.confirm_appointment_reschedule_okvet FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_appointment_reschedule_okvet TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.cancel_appointment_authorized FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_appointment_authorized TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.record_appointment_no_show_or_uncompleted FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_appointment_no_show_or_uncompleted TO authenticated, service_role;

