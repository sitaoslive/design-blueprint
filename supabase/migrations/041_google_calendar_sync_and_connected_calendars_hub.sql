-- ==============================================================================
-- VET FREEDOM OS — MIGRACIÓN 041
-- VET-CORE-06 | GOOGLE CALENDAR SYNC & CONNECTED CALENDARS HUB
-- Sistema empresarial de calendarios conectados, disponibilidad inteligente,
-- sincronización bidireccional controlada, privacidad BUSY_ONLY, conflictos,
-- turnos, prevención de bucles y recuperación automática 410.
--
-- Fecha: 2026-11-21
-- Dirección Médica: Dr. Luis Eduardo Ríos
-- Dirección Estratégica: Alpha Vision Method
-- Motor: PostgreSQL 17.12.0 (Supabase)
-- ==============================================================================

-- 1. ENRIQUECIMIENTO DE TABLAS PRE-EXISTENTES
-- 1.1 staff_calendar_connections
ALTER TABLE IF EXISTS public.staff_calendar_connections
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS calendar_name text DEFAULT 'Google Calendar Principal',
  ADD COLUMN IF NOT EXISTS account_email text,
  ADD COLUMN IF NOT EXISTS permission_mode text DEFAULT 'PERSONAL_BUSY_ONLY' CHECK (permission_mode IN ('PERSONAL_BUSY_ONLY', 'OPERATIONAL_READ_WRITE', 'OPERATIONAL_READ_ONLY')),
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'CONNECTED' CHECK (status IN ('NOT_CONNECTED', 'AUTHORIZING', 'CONNECTED', 'SYNCING', 'HEALTHY', 'STALE', 'REAUTH_REQUIRED', 'DISCONNECTED', 'ERROR')),
  ADD COLUMN IF NOT EXISTS selected_for_availability boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_success_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_failure_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS revoked_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS stale_after interval DEFAULT interval '3 hours';

-- 1.2 calendar_sync_state
ALTER TABLE IF EXISTS public.calendar_sync_state
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS sync_mode text DEFAULT 'FREE_BUSY' CHECK (sync_mode IN ('FREE_BUSY', 'INCREMENTAL_EVENTS', 'FULL_MIRROR')),
  ADD COLUMN IF NOT EXISTS next_sync_token text,
  ADD COLUMN IF NOT EXISTS sync_generation integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_full_sync_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_incremental_sync_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_reconciliation_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS stale_after interval DEFAULT interval '3 hours';

-- 1.3 external_calendar_events
ALTER TABLE IF EXISTS public.external_calendar_events
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS privacy_mode text DEFAULT 'BUSY_ONLY' CHECK (privacy_mode IN ('BUSY_ONLY', 'DETAILED_OPERATIONAL')),
  ADD COLUMN IF NOT EXISTS is_busy boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS sync_hash text,
  ADD COLUMN IF NOT EXISTS source_provider text DEFAULT 'GOOGLE_CALENDAR';

-- 1.4 calendar_conflicts
ALTER TABLE IF EXISTS public.calendar_conflicts
  ADD COLUMN IF NOT EXISTS calendar_connection_id uuid REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS severity text DEFAULT 'HIGH_OPS' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH_OPS', 'CRITICAL_CLINICAL')),
  ADD COLUMN IF NOT EXISTS resolution_owner uuid,
  ADD COLUMN IF NOT EXISTS resolution_evidence text,
  ADD COLUMN IF NOT EXISTS detected_at timestamp with time zone DEFAULT now();

-- 2. NUEVAS TABLAS DE LA CAPACIDAD CORE-06
-- 2.1 calendar_blocked_times (Intervalos ocupados normalizados y anonimizados)
CREATE TABLE IF NOT EXISTS public.calendar_blocked_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  staff_profile_id uuid NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
  start_at timestamp with time zone NOT NULL,
  end_at timestamp with time zone NOT NULL,
  block_type text NOT NULL DEFAULT 'EXTERNAL_BUSY' CHECK (block_type IN ('EXTERNAL_BUSY', 'PERSONAL_LEAVE', 'ADMINISTRATIVE', 'BREAK')),
  privacy_mode text NOT NULL DEFAULT 'BUSY_ONLY' CHECK (privacy_mode IN ('BUSY_ONLY', 'OPERATIONAL')),
  sanitized_summary text NOT NULL DEFAULT 'OCUPADO / NO DISPONIBLE (BUSY_ONLY)',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chk_blocked_times_duration CHECK (end_at > start_at)
);

-- 2.2 calendar_change_events (Log de cambios crudos entrantes de Google)
CREATE TABLE IF NOT EXISTS public.calendar_change_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
  change_source text NOT NULL DEFAULT 'PUSH_WATCH' CHECK (change_source IN ('PUSH_WATCH', 'POLLING_RECONCILIATION', 'MANUAL_REFRESH')),
  external_resource_id text,
  change_type text NOT NULL DEFAULT 'SYNC_PING' CHECK (change_type IN ('SYNC_PING', 'EVENT_UPSERT', 'EVENT_DELETE', 'TOKEN_INVALIDATED')),
  raw_payload jsonb DEFAULT '{}'::jsonb,
  is_processed boolean NOT NULL DEFAULT false,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2.3 calendar_event_mappings (Mapeo bidireccional citas <-> eventos Google con prevención anti-bucle)
CREATE TABLE IF NOT EXISTS public.calendar_event_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
  google_calendar_id text NOT NULL,
  google_event_id text NOT NULL,
  current_sync_generation integer NOT NULL DEFAULT 1,
  last_published_hash text NOT NULL,
  last_direction text NOT NULL DEFAULT 'OUTBOUND_TO_GOOGLE' CHECK (last_direction IN ('OUTBOUND_TO_GOOGLE', 'INBOUND_FROM_GOOGLE')),
  status text NOT NULL DEFAULT 'SYNCED' CHECK (status IN ('SYNCED', 'PENDING_UPDATE', 'FAILED', 'DELETED_EXTERNALLY')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_event_mapping UNIQUE (appointment_id, connection_id)
);

-- 2.4 calendar_watch_channels (Suscripciones push notifications de Google Calendar)
CREATE TABLE IF NOT EXISTS public.calendar_watch_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
  channel_id text NOT NULL UNIQUE,
  resource_id text NOT NULL,
  webhook_url text NOT NULL,
  token_hash text NOT NULL,
  expiration_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'RENEWED', 'REVOKED')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_ping_at timestamp with time zone
);

-- 2.5 calendar_sync_runs (Historial auditable de corridas de sincronización)
CREATE TABLE IF NOT EXISTS public.calendar_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
  sync_type text NOT NULL CHECK (sync_type IN ('INITIAL', 'INCREMENTAL', 'FREE_BUSY', 'RECONCILIATION', 'RECOVERY_410')),
  status text NOT NULL CHECK (status IN ('STARTED', 'COMPLETED', 'FAILED', 'PARTIAL')),
  events_processed integer DEFAULT 0,
  conflicts_detected integer DEFAULT 0,
  duration_ms integer,
  error_message text,
  executed_by text DEFAULT 'n8n_VET-CORE-06',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- 2.6 calendar_availability_snapshots (Disponibilidad consolidada unificada)
CREATE TABLE IF NOT EXISTS public.calendar_availability_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  staff_profile_id uuid NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  target_date date NOT NULL,
  shift_start timestamp with time zone,
  shift_end timestamp with time zone,
  is_on_leave boolean DEFAULT false,
  leave_reason text,
  available_slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  busy_slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  conflicts_count integer DEFAULT 0,
  data_freshness text NOT NULL DEFAULT 'HEALTHY' CHECK (data_freshness IN ('HEALTHY', 'STALE', 'REAUTH_REQUIRED', 'UNKNOWN')),
  calculated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT uq_availability_snapshot UNIQUE (organization_id, staff_profile_id, target_date)
);

-- 2.7 calendar_sync_leases (Exclusión mutua pesimista para corridas concurrentes)
CREATE TABLE IF NOT EXISTS public.calendar_sync_leases (
  connection_id uuid PRIMARY KEY REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  lease_holder text NOT NULL,
  acquired_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

-- 2.8 calendar_reconciliation_tasks (Discrepancias de agenda para revisión en Lovable)
CREATE TABLE IF NOT EXISTS public.calendar_reconciliation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  staff_profile_id uuid NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('SCHEDULE_OVERLAP', 'EXTERNAL_UNMAPPED_EVENT', 'STALE_SYNC_RECOVERY', 'WATCH_CHANNEL_FAILURE')),
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'HIGH_OPS' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH_OPS', 'URGENT')),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED')),
  assigned_to uuid,
  resolution_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  resolved_at timestamp with time zone
);

-- 2.9 calendar_sync_audit (Bitácora forense inmutable de auditoría)
CREATE TABLE IF NOT EXISTS public.calendar_sync_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  connection_id uuid,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id text NOT NULL DEFAULT 'SYSTEM',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. HABILITACIÓN Y FORZADO DE ROW LEVEL SECURITY (100%)
DO $$
DECLARE
  tbl text;
  core06_tables text[] := ARRAY[
    'staff_calendar_connections',
    'calendar_sync_state',
    'external_calendar_events',
    'calendar_conflicts',
    'calendar_blocked_times',
    'calendar_change_events',
    'calendar_event_mappings',
    'calendar_watch_channels',
    'calendar_sync_runs',
    'calendar_availability_snapshots',
    'calendar_sync_leases',
    'calendar_reconciliation_tasks',
    'calendar_sync_audit'
  ];
BEGIN
  FOREACH tbl IN ARRAY core06_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY;', tbl);
    
    -- Eliminar políticas previas para evitar colisiones
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation_%I ON public.%I;', tbl, tbl);
    
    -- Crear política de aislamiento estricto por membresía
    EXECUTE format('
      CREATE POLICY tenant_isolation_%I ON public.%I
      FOR ALL TO authenticated
      USING (
        organization_id IN (
          SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        organization_id IN (
          SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid()
        )
      );
    ', tbl, tbl);
  END LOOP;
END $$;

-- 4. PROCEDIMIENTOS ALMACENADOS (STORED PROCEDURES SEGUROS)
-- 4.1 register_calendar_connection
CREATE OR REPLACE FUNCTION public.register_calendar_connection(
  p_org_id uuid,
  p_staff_profile_id uuid,
  p_provider text,
  p_calendar_id text,
  p_permission_mode text,
  p_calendar_name text DEFAULT 'Google Calendar Principal',
  p_account_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_connection_id uuid;
BEGIN
  INSERT INTO public.staff_calendar_connections (
    organization_id,
    staff_profile_id,
    provider,
    calendar_id,
    permission_mode,
    calendar_name,
    account_email,
    status,
    is_sync_enabled,
    selected_for_availability,
    last_success_at
  ) VALUES (
    p_org_id,
    p_staff_profile_id,
    p_provider,
    p_calendar_id,
    p_permission_mode,
    p_calendar_name,
    p_account_email,
    'CONNECTED',
    true,
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    permission_mode = EXCLUDED.permission_mode,
    calendar_name = EXCLUDED.calendar_name,
    status = 'CONNECTED',
    updated_at = now()
  RETURNING id INTO v_connection_id;

  -- Inicializar estado de sincronización
  INSERT INTO public.calendar_sync_state (
    connection_id,
    organization_id,
    status,
    last_sync_at,
    events_synced_count,
    sync_mode
  ) VALUES (
    v_connection_id,
    p_org_id,
    'HEALTHY',
    now(),
    0,
    CASE WHEN p_permission_mode = 'PERSONAL_BUSY_ONLY' THEN 'FREE_BUSY' ELSE 'INCREMENTAL_EVENTS' END
  )
  ON CONFLICT DO NOTHING;

  PERFORM public.record_calendar_audit(
    p_org_id,
    v_connection_id,
    'CALENDAR_CONNECTED',
    jsonb_build_object('staff_profile_id', p_staff_profile_id, 'permission_mode', p_permission_mode),
    'SYSTEM'
  );

  RETURN v_connection_id;
END;
$$;

-- 4.2 acquire_calendar_sync_lease
CREATE OR REPLACE FUNCTION public.acquire_calendar_sync_lease(
  p_connection_id uuid,
  p_org_id uuid,
  p_lease_holder text,
  p_duration_seconds integer DEFAULT 120
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamp with time zone := now();
  v_expires timestamp with time zone := v_now + (p_duration_seconds || ' seconds')::interval;
BEGIN
  -- Limpiar leases expirados
  DELETE FROM public.calendar_sync_leases
  WHERE connection_id = p_connection_id AND expires_at < v_now;

  -- Intentar adquirir el lease
  INSERT INTO public.calendar_sync_leases (
    connection_id,
    organization_id,
    lease_holder,
    acquired_at,
    expires_at
  ) VALUES (
    p_connection_id,
    p_org_id,
    p_lease_holder,
    v_now,
    v_expires
  )
  ON CONFLICT (connection_id) DO NOTHING;

  IF FOUND THEN
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

-- 4.3 release_calendar_sync_lease
CREATE OR REPLACE FUNCTION public.release_calendar_sync_lease(
  p_connection_id uuid,
  p_lease_holder text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.calendar_sync_leases
  WHERE connection_id = p_connection_id AND lease_holder = p_lease_holder;
  RETURN FOUND;
END;
$$;

-- 4.4 update_calendar_sync_state
CREATE OR REPLACE FUNCTION public.update_calendar_sync_state(
  p_connection_id uuid,
  p_status text,
  p_next_sync_token text DEFAULT NULL,
  p_events_synced integer DEFAULT 0,
  p_error_msg text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.calendar_sync_state
  SET
    status = p_status,
    next_sync_token = COALESCE(p_next_sync_token, next_sync_token),
    events_synced_count = p_events_synced,
    error_message = p_error_msg,
    last_sync_at = now(),
    last_incremental_sync_at = CASE WHEN p_next_sync_token IS NOT NULL THEN now() ELSE last_incremental_sync_at END
  WHERE connection_id = p_connection_id;

  UPDATE public.staff_calendar_connections
  SET
    status = p_status,
    last_success_at = CASE WHEN p_status = 'HEALTHY' THEN now() ELSE last_success_at END,
    last_failure_at = CASE WHEN p_status IN ('ERROR', 'REAUTH_REQUIRED') THEN now() ELSE last_failure_at END,
    updated_at = now()
  WHERE id = p_connection_id;
END;
$$;

-- 4.5 handle_calendar_410_invalidation (Recuperación segura de syncToken)
CREATE OR REPLACE FUNCTION public.handle_calendar_410_invalidation(
  p_connection_id uuid,
  p_org_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Invalidar sync token y marcar estado STALE para recuperación
  UPDATE public.calendar_sync_state
  SET
    next_sync_token = NULL,
    status = 'STALE',
    error_message = 'SyncToken expired/invalidated (HTTP 410 Gone). Recovery full-sync initiated.',
    sync_generation = sync_generation + 1
  WHERE connection_id = p_connection_id;

  UPDATE public.staff_calendar_connections
  SET status = 'STALE', updated_at = now()
  WHERE id = p_connection_id;

  -- Crear tarea de auditoría (sin tocar citas de negocio)
  PERFORM public.record_calendar_audit(
    p_org_id,
    p_connection_id,
    'SYNC_TOKEN_410_RECOVERY_TRIGGERED',
    jsonb_build_object('message', 'Full mirror sync scheduled to recover invalid token'),
    'SYSTEM'
  );
END;
$$;

-- 4.6 ingest_calendar_busy_slot (Ingesta sanitizada BUSY_ONLY)
CREATE OR REPLACE FUNCTION public.ingest_calendar_busy_slot(
  p_org_id uuid,
  p_staff_profile_id uuid,
  p_connection_id uuid,
  p_start_at timestamp with time zone,
  p_end_at timestamp with time zone,
  p_block_type text DEFAULT 'EXTERNAL_BUSY'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slot_id uuid;
BEGIN
  -- Invariante de Privacidad: CERO títulos, notas o invitados
  INSERT INTO public.calendar_blocked_times (
    organization_id,
    staff_profile_id,
    connection_id,
    start_at,
    end_at,
    block_type,
    privacy_mode,
    sanitized_summary
  ) VALUES (
    p_org_id,
    p_staff_profile_id,
    p_connection_id,
    p_start_at,
    p_end_at,
    p_block_type,
    'BUSY_ONLY',
    'OCUPADO / NO DISPONIBLE (BUSY_ONLY)'
  ) RETURNING id INTO v_slot_id;

  RETURN v_slot_id;
END;
$$;

-- 4.7 detect_calendar_conflicts
CREATE OR REPLACE FUNCTION public.detect_calendar_conflicts(
  p_org_id uuid,
  p_staff_profile_id uuid,
  p_connection_id uuid,
  p_start_at timestamp with time zone,
  p_end_at timestamp with time zone
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conflicting_apt uuid;
  v_conflict_id uuid;
BEGIN
  -- Buscar citas confirmadas que solapen el intervalo
  SELECT id INTO v_conflicting_apt
  FROM public.appointments
  WHERE organization_id = p_org_id
    AND staff_profile_id = p_staff_profile_id
    AND status IN ('CONFIRMED', 'SCHEDULED', 'IN_PROGRESS')
    AND appointment_date < p_end_at
    AND (appointment_date + interval '60 minutes') > p_start_at
  LIMIT 1;

  IF v_conflicting_apt IS NOT NULL THEN
    INSERT INTO public.calendar_conflicts (
      organization_id,
      staff_profile_id,
      calendar_connection_id,
      appointment_id,
      conflict_type,
      conflict_start,
      conflict_end,
      resolution_status,
      severity
    ) VALUES (
      p_org_id,
      p_staff_profile_id,
      p_connection_id,
      v_conflicting_apt,
      'EXTERNAL_BUSY_CONFLICT',
      p_start_at,
      p_end_at,
      'DETECTED_UNRESOLVED',
      'HIGH_OPS'
    ) RETURNING id INTO v_conflict_id;

    RETURN jsonb_build_object(
      'has_conflict', true,
      'conflict_id', v_conflict_id,
      'appointment_id', v_conflicting_apt,
      'severity', 'HIGH_OPS'
    );
  END IF;

  RETURN jsonb_build_object('has_conflict', false);
END;
$$;

-- 4.8 publish_operational_calendar_event (Anti-Loop Invariant)
CREATE OR REPLACE FUNCTION public.publish_operational_calendar_event(
  p_org_id uuid,
  p_appointment_id uuid,
  p_connection_id uuid,
  p_google_cal_id text,
  p_google_evt_id text,
  p_hash text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mapping_id uuid;
  v_perm_mode text;
BEGIN
  -- Validar que la conexión sea de tipo OPERATIONAL
  SELECT permission_mode INTO v_perm_mode
  FROM public.staff_calendar_connections
  WHERE id = p_connection_id;

  IF v_perm_mode = 'PERSONAL_BUSY_ONLY' THEN
    RAISE EXCEPTION 'ESCRITURA_PROHIBIDA: Prohibido publicar eventos en calendarios personales';
  END IF;

  INSERT INTO public.calendar_event_mappings (
    organization_id,
    appointment_id,
    connection_id,
    google_calendar_id,
    google_event_id,
    current_sync_generation,
    last_published_hash,
    last_direction,
    status
  ) VALUES (
    p_org_id,
    p_appointment_id,
    p_connection_id,
    p_google_cal_id,
    p_google_evt_id,
    1,
    p_hash,
    'OUTBOUND_TO_GOOGLE',
    'SYNCED'
  )
  ON CONFLICT (appointment_id, connection_id) DO UPDATE SET
    google_event_id = EXCLUDED.google_event_id,
    current_sync_generation = calendar_event_mappings.current_sync_generation + 1,
    last_published_hash = EXCLUDED.last_published_hash,
    last_direction = 'OUTBOUND_TO_GOOGLE',
    status = 'SYNCED',
    updated_at = now()
  RETURNING id INTO v_mapping_id;

  RETURN v_mapping_id;
END;
$$;

-- 4.9 disconnect_calendar_connection
CREATE OR REPLACE FUNCTION public.disconnect_calendar_connection(
  p_connection_id uuid,
  p_org_id uuid,
  p_reason text DEFAULT 'User requested disconnection'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.staff_calendar_connections
  SET
    status = 'DISCONNECTED',
    is_sync_enabled = false,
    selected_for_availability = false,
    revoked_at = now(),
    updated_at = now()
  WHERE id = p_connection_id;

  UPDATE public.calendar_sync_state
  SET status = 'DISCONNECTED', error_message = p_reason
  WHERE connection_id = p_connection_id;

  -- Desactivar canales watch push asociados
  UPDATE public.calendar_watch_channels
  SET status = 'REVOKED'
  WHERE connection_id = p_connection_id;

  -- Purga de bloqueos temporales para no retener datos privados tras desconexión
  DELETE FROM public.calendar_blocked_times
  WHERE connection_id = p_connection_id;

  PERFORM public.record_calendar_audit(
    p_org_id,
    p_connection_id,
    'CALENDAR_DISCONNECTED',
    jsonb_build_object('reason', p_reason),
    'SYSTEM'
  );
END;
$$;

-- 4.10 record_calendar_audit
CREATE OR REPLACE FUNCTION public.record_calendar_audit(
  p_org_id uuid,
  p_connection_id uuid,
  p_action text,
  p_details jsonb,
  p_actor text DEFAULT 'SYSTEM'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.calendar_sync_audit (
    organization_id,
    connection_id,
    action,
    details,
    actor_id
  ) VALUES (
    p_org_id,
    p_connection_id,
    p_action,
    p_details,
    p_actor
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- 5. REVOCACIÓN DE PERMISOS ANÓNIMOS / PÚBLICOS
REVOKE ALL ON FUNCTION public.register_calendar_connection FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.acquire_calendar_sync_lease FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.release_calendar_sync_lease FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.update_calendar_sync_state FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.handle_calendar_410_invalidation FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.ingest_calendar_busy_slot FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.detect_calendar_conflicts FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.publish_operational_calendar_event FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.disconnect_calendar_connection FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.record_calendar_audit FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_calendar_connection TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.acquire_calendar_sync_lease TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.release_calendar_sync_lease TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_calendar_sync_state TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_calendar_410_invalidation TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ingest_calendar_busy_slot TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.detect_calendar_conflicts TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.publish_operational_calendar_event TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.disconnect_calendar_connection TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_calendar_audit TO authenticated, service_role;
