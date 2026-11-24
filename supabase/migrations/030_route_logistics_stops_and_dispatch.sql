-- ==============================================================================
-- VET FREEDOM OS — MIGRATION 030: ROUTE LOGISTICS, STOPS & DISPATCH ENGINE
-- Módulo: VET-CORE-08 | Route Notifications & Operational Logistics Dispatch
-- Dirección Médica: Dr. Luis Eduardo Ríos | Alpha Vision Method
-- Fecha: 2026-11-21
-- Motor: PostgreSQL 17.12.0 (Supabase)
-- ==============================================================================

-- 1. Ampliación y Endurecimiento de la Tabla Existente: public.routes
ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS route_code text,
  ADD COLUMN IF NOT EXISTS route_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS source_snapshot_id uuid,
  ADD COLUMN IF NOT EXISTS proposed_by uuid REFERENCES public.staff_profiles(id),
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.staff_profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Bogota',
  ADD COLUMN IF NOT EXISTS idempotency_key text UNIQUE;

-- Ajuste de la restricción de estados para routes (permitiendo ciclo completo)
ALTER TABLE public.routes DROP CONSTRAINT IF EXISTS routes_status_check;
ALTER TABLE public.routes ADD CONSTRAINT routes_status_check
  CHECK (status = ANY (ARRAY[
    'DRAFT'::text, 'PREPARING'::text, 'SIMULATED'::text, 'PENDING_APPROVAL'::text,
    'APPROVED'::text, 'PUBLISHED'::text, 'IN_PROGRESS'::text, 'PARTIALLY_COMPLETED'::text,
    'COMPLETED'::text, 'CHANGE_REQUESTED'::text, 'CHANGE_PENDING_APPROVAL'::text,
    'SUPERSEDED'::text, 'CANCELLED'::text, 'BLOCKED'::text, 'PLANNED'::text,
    'OPTIMIZED'::text, 'DISRUPTED'::text
  ]));

-- 2. Ampliación y Endurecimiento de la Tabla Existente: public.route_stops
ALTER TABLE public.route_stops
  ADD COLUMN IF NOT EXISTS state_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS actual_service_start_at timestamptz,
  ADD COLUMN IF NOT EXISTS actual_service_end_at timestamptz,
  ADD COLUMN IF NOT EXISTS travel_buffer_minutes integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS service_duration_minutes integer NOT NULL DEFAULT 45,
  ADD COLUMN IF NOT EXISTS is_clinically_protected boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS client_notified_en_route boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS client_notified_delay boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS destination_address text,
  ADD COLUMN IF NOT EXISTS destination_lat double precision,
  ADD COLUMN IF NOT EXISTS destination_lng double precision,
  ADD COLUMN IF NOT EXISTS geocoding_status text NOT NULL DEFAULT 'VERIFIED',
  ADD COLUMN IF NOT EXISTS waze_url text,
  ADD COLUMN IF NOT EXISTS google_maps_url text;

-- Ajuste de la restricción de estados para route_stops
ALTER TABLE public.route_stops DROP CONSTRAINT IF EXISTS route_stops_status_check;
ALTER TABLE public.route_stops ADD CONSTRAINT route_stops_status_check
  CHECK (status = ANY (ARRAY[
    'PLANNED'::text, 'READY'::text, 'EN_ROUTE'::text, 'ARRIVED'::text,
    'SERVICE_STARTED'::text, 'SERVICE_COMPLETED'::text, 'NOT_COMPLETED'::text,
    'SKIPPED_WITH_APPROVAL'::text, 'RESCHEDULE_PENDING'::text, 'CANCELLED_OFFICIALLY'::text,
    'PENDING'::text, 'COMPLETED'::text, 'SKIPPED'::text, 'RESCHEDULED_EMERGENCY'::text
  ]));

-- 3. Nueva Tabla: public.route_plan_versions (Historial inmutable de versiones de ruta)
CREATE TABLE IF NOT EXISTS public.route_plan_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  route_version integer NOT NULL,
  status text NOT NULL,
  stops_snapshot jsonb NOT NULL,
  snapshot_hash text,
  created_by uuid REFERENCES public.staff_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_route_version_entry UNIQUE (route_id, route_version)
);

-- 4. Nueva Tabla: public.route_stop_events (Auditoría de eventos operativos del veterinario)
CREATE TABLE IF NOT EXISTS public.route_stop_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id uuid NOT NULL REFERENCES public.route_stops(id) ON DELETE CASCADE,
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY[
    'EN_ROUTE'::text, 'ARRIVED'::text, 'SERVICE_STARTED'::text,
    'SERVICE_COMPLETED'::text, 'DELAY_REPORTED'::text, 'INCIDENT_REPORTED'::text,
    'CORRECTION'::text
  ])),
  actor_id uuid REFERENCES public.staff_profiles(id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Nueva Tabla: public.route_travel_estimates (Cálculos de tiempos y distancias con tráfico)
CREATE TABLE IF NOT EXISTS public.route_travel_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_address text NOT NULL,
  destination_address text NOT NULL,
  origin_coords point,
  destination_coords point,
  provider text NOT NULL DEFAULT 'GOOGLE_ROUTES',
  estimated_duration_seconds integer NOT NULL,
  estimated_distance_meters integer NOT NULL,
  traffic_buffer_minutes integer NOT NULL DEFAULT 10,
  confidence_status text NOT NULL DEFAULT 'HIGH' CHECK (confidence_status = ANY (ARRAY[
    'HIGH'::text, 'MEDIUM'::text, 'LOW'::text, 'FALLBACK_AVERAGE'::text
  ])),
  cost_reference text,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '2 hours')
);

-- 6. Nueva Tabla: public.route_address_verifications (Validación y geocodificación de direcciones colombianas)
CREATE TABLE IF NOT EXISTS public.route_address_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  raw_address text NOT NULL,
  municipality text NOT NULL DEFAULT 'Bogotá',
  neighborhood text,
  normalized_address text NOT NULL,
  lat double precision,
  lng double precision,
  accuracy_status text NOT NULL DEFAULT 'EXACT_ROOFTOP' CHECK (accuracy_status = ANY (ARRAY[
    'EXACT_ROOFTOP'::text, 'RANGE_INTERPOLATED'::text, 'GEOMETRIC_CENTER'::text,
    'APPROXIMATE'::text, 'AMBIGUOUS'::text, 'OUT_OF_COVERAGE'::text, 'FAILED'::text
  ])),
  is_covered boolean NOT NULL DEFAULT true,
  coverage_zone text DEFAULT 'BOGOTA_URBANA',
  verified_by text NOT NULL DEFAULT 'GOOGLE_GEOCODING',
  verified_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text UNIQUE
);

-- 7. Nueva Tabla: public.route_delay_events (Registro de demoras y elegibilidad de avisos)
CREATE TABLE IF NOT EXISTS public.route_delay_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  stop_id uuid REFERENCES public.route_stops(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  delay_type text NOT NULL DEFAULT 'TRAVEL_DELAY' CHECK (delay_type = ANY (ARRAY[
    'DEPARTURE_DELAY'::text, 'TRAVEL_DELAY'::text, 'PREVIOUS_VISIT_OVERRUN'::text,
    'ADDRESS_ISSUE'::text, 'STAFF_UNAVAILABLE'::text, 'ROUTE_CONFLICT'::text, 'UNKNOWN_DELAY'::text
  ])),
  delay_minutes integer NOT NULL DEFAULT 0,
  delay_reason text NOT NULL,
  requires_client_notification boolean NOT NULL DEFAULT false,
  notification_dispatched boolean NOT NULL DEFAULT false,
  notification_outbox_id uuid,
  reported_by uuid REFERENCES public.staff_profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Nueva Tabla: public.route_operational_incidents (Incidentes viales, mecánicos o logísticos)
CREATE TABLE IF NOT EXISTS public.route_operational_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  stop_id uuid REFERENCES public.route_stops(id),
  incident_type text NOT NULL CHECK (incident_type = ANY (ARRAY[
    'TRAFFIC_GRIDLOCK'::text, 'VEHICLE_BREAKDOWN'::text, 'WEATHER_EMERGENCY'::text,
    'MISSING_SUPPLIES'::text, 'CLIENT_NO_ANSWER'::text, 'ACCESS_RESTRICTED'::text,
    'STAFF_HEALTH'::text
  ])),
  severity text NOT NULL DEFAULT 'MEDIUM' CHECK (severity = ANY (ARRAY[
    'P0_CRITICAL'::text, 'HIGH'::text, 'MEDIUM'::text, 'LOW'::text
  ])),
  description text NOT NULL,
  resolution_status text NOT NULL DEFAULT 'OPEN' CHECK (resolution_status = ANY (ARRAY[
    'OPEN'::text, 'INVESTIGATING'::text, 'RESOLVED'::text, 'RE_ROUTED'::text
  ])),
  requires_coordination_approval boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Nueva Tabla: public.route_api_cost_logs (Supervisión de cuotas y costos de Google Maps / OSRM)
CREATE TABLE IF NOT EXISTS public.route_api_cost_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider = ANY (ARRAY[
    'GOOGLE_MAPS_ROUTES'::text, 'GOOGLE_MAPS_GEOCODING'::text, 'GOOGLE_MAPS_MATRIX'::text,
    'OSRM'::text, 'OR_TOOLS'::text
  ])),
  endpoint text NOT NULL,
  call_count integer NOT NULL DEFAULT 1,
  cost_usd numeric(8,4) NOT NULL DEFAULT 0.0000,
  cost_cop numeric(12,2) NOT NULL DEFAULT 0.00,
  budget_pool text NOT NULL DEFAULT 'DAILY_OPERATIONS',
  logged_at timestamptz NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) EN TODAS LAS NUEVAS TABLAS (100% PROTECCIÓN)
-- ==============================================================================
ALTER TABLE public.route_plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stop_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_travel_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_address_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_delay_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_operational_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_api_cost_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento y acceso
DROP POLICY IF EXISTS p_route_plan_versions_auth ON public.route_plan_versions;
CREATE POLICY p_route_plan_versions_auth ON public.route_plan_versions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_route_stop_events_auth ON public.route_stop_events;
CREATE POLICY p_route_stop_events_auth ON public.route_stop_events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_route_travel_estimates_auth ON public.route_travel_estimates;
CREATE POLICY p_route_travel_estimates_auth ON public.route_travel_estimates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_route_address_verifications_auth ON public.route_address_verifications;
CREATE POLICY p_route_address_verifications_auth ON public.route_address_verifications
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_route_delay_events_auth ON public.route_delay_events;
CREATE POLICY p_route_delay_events_auth ON public.route_delay_events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_route_operational_incidents_auth ON public.route_operational_incidents;
CREATE POLICY p_route_operational_incidents_auth ON public.route_operational_incidents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_route_api_cost_logs_auth ON public.route_api_cost_logs;
CREATE POLICY p_route_api_cost_logs_auth ON public.route_api_cost_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Revocar permisos a anónimos en todas las nuevas entidades
REVOKE ALL ON TABLE public.route_plan_versions FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.route_stop_events FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.route_travel_estimates FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.route_address_verifications FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.route_delay_events FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.route_operational_incidents FROM anon, PUBLIC;
REVOKE ALL ON TABLE public.route_api_cost_logs FROM anon, PUBLIC;

GRANT ALL ON TABLE public.route_plan_versions TO authenticated, service_role;
GRANT ALL ON TABLE public.route_stop_events TO authenticated, service_role;
GRANT ALL ON TABLE public.route_travel_estimates TO authenticated, service_role;
GRANT ALL ON TABLE public.route_address_verifications TO authenticated, service_role;
GRANT ALL ON TABLE public.route_delay_events TO authenticated, service_role;
GRANT ALL ON TABLE public.route_operational_incidents TO authenticated, service_role;
GRANT ALL ON TABLE public.route_api_cost_logs TO authenticated, service_role;

-- ==============================================================================
-- 11. PROCEDIMIENTOS ALMACENADOS ATÓMICOS (RPCs)
-- ==============================================================================

-- RPC 1: prepare_daily_route_proposal
CREATE OR REPLACE FUNCTION public.prepare_daily_route_proposal(
  p_organization_id uuid,
  p_veterinarian_id uuid,
  p_route_date date,
  p_start_hub text DEFAULT 'Sede Principal Vet Life - Bogotá',
  p_proposed_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route_id uuid;
  v_route_code text;
  v_appt_record record;
  v_stop_order integer := 1;
  v_current_eta timestamptz;
  v_current_etd timestamptz;
  v_stops_count integer := 0;
  v_snapshot jsonb := '[]'::jsonb;
BEGIN
  -- Verificar o crear registro de ruta
  SELECT id, route_code INTO v_route_id, v_route_code
  FROM public.routes
  WHERE veterinarian_id = p_veterinarian_id AND route_date = p_route_date
  LIMIT 1;

  IF v_route_id IS NULL THEN
    v_route_code := 'RT-' || to_char(p_route_date, 'YYYYMMDD') || '-' || substring(gen_random_uuid()::text from 1 for 4);
    INSERT INTO public.routes (
      organization_id, veterinarian_id, route_date, status,
      start_hub_address, route_code, route_version, proposed_by
    ) VALUES (
      p_organization_id, p_veterinarian_id, p_route_date, 'DRAFT',
      p_start_hub, v_route_code, 1, p_proposed_by
    ) RETURNING id INTO v_route_id;
  END IF;

  -- Hora base estimada: 08:00 AM hora Colombia
  v_current_eta := (p_route_date::text || ' 08:00:00-05')::timestamptz;

  -- Seleccionar citas confirmadas para ese veterinario y fecha
  FOR v_appt_record IN
    SELECT a.id, a.address_id, a.status, a.okvet_reference
    FROM public.appointments a
    WHERE a.veterinarian_id = p_veterinarian_id
      AND a.scheduled_start::date = p_route_date
      AND a.status NOT IN ('CANCELLED', 'RESCHEDULED')
    ORDER BY a.scheduled_start ASC
  LOOP
    -- Calcular salida estimada tras 45 min de servicio + 15 min buffer
    v_current_etd := v_current_eta + interval '45 minutes';

    INSERT INTO public.route_stops (
      route_id, appointment_id, stop_order,
      estimated_arrival, estimated_departure, status,
      travel_buffer_minutes, service_duration_minutes,
      destination_address,
      google_maps_url, waze_url
    ) VALUES (
      v_route_id, v_appt_record.id, v_stop_order,
      v_current_eta, v_current_etd, 'PLANNED',
      15, 45,
      COALESCE(p_start_hub, 'Bogotá D.C.'),
      'https://www.google.com/maps/dir/?api=1&destination=Bogota',
      'https://waze.com/ul?q=Bogota'
    ) ON CONFLICT (route_id, stop_order) DO UPDATE
      SET estimated_arrival = EXCLUDED.estimated_arrival,
          estimated_departure = EXCLUDED.estimated_departure;

    v_stops_count := v_stops_count + 1;
    v_stop_order := v_stop_order + 1;
    -- Siguiente llegada: tiempo de traslado estimado 30 mins
    v_current_eta := v_current_etd + interval '30 minutes';
  END LOOP;

  -- Actualizar estado de la ruta a PENDING_APPROVAL
  UPDATE public.routes
  SET status = 'PENDING_APPROVAL',
      estimated_duration_minutes = v_stops_count * 75,
      updated_at = now()
  WHERE id = v_route_id;

  -- Guardar snapshot en route_plan_versions
  INSERT INTO public.route_plan_versions (
    route_id, route_version, status, stops_snapshot, created_by
  ) VALUES (
    v_route_id, 1, 'PENDING_APPROVAL',
    jsonb_build_object('stops_count', v_stops_count, 'prepared_at', now()),
    p_proposed_by
  ) ON CONFLICT (route_id, route_version) DO UPDATE
    SET stops_snapshot = EXCLUDED.stops_snapshot;

  RETURN jsonb_build_object(
    'success', true,
    'route_id', v_route_id,
    'route_code', v_route_code,
    'stops_count', v_stops_count,
    'status', 'PENDING_APPROVAL'
  );
END;
$$;

-- RPC 2: approve_route_proposal
CREATE OR REPLACE FUNCTION public.approve_route_proposal(
  p_route_id uuid,
  p_approved_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_ver integer;
BEGIN
  SELECT status, route_version INTO v_status, v_ver
  FROM public.routes WHERE id = p_route_id FOR UPDATE;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'ROUTE_NOT_FOUND: La ruta indicada no existe';
  END IF;

  UPDATE public.routes
  SET status = 'APPROVED',
      approved_by = p_approved_by,
      approved_at = now(),
      updated_at = now()
  WHERE id = p_route_id;

  INSERT INTO public.route_plan_versions (
    route_id, route_version, status, stops_snapshot, created_by
  ) VALUES (
    p_route_id, v_ver, 'APPROVED',
    jsonb_build_object('approved_by', p_approved_by, 'approved_at', now()),
    p_approved_by
  ) ON CONFLICT (route_id, route_version) DO UPDATE
    SET status = 'APPROVED';

  RETURN jsonb_build_object(
    'success', true,
    'route_id', p_route_id,
    'status', 'APPROVED',
    'approved_at', now()
  );
END;
$$;

-- RPC 3: publish_authorized_route
CREATE OR REPLACE FUNCTION public.publish_authorized_route(
  p_route_id uuid,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_org_id uuid;
  v_vet_id uuid;
  v_rdate date;
  v_code text;
  v_ver integer;
  v_canc_count integer;
BEGIN
  SELECT status, organization_id, veterinarian_id, route_date, route_code, route_version
  INTO v_status, v_org_id, v_vet_id, v_rdate, v_code, v_ver
  FROM public.routes WHERE id = p_route_id FOR UPDATE;

  IF v_status NOT IN ('APPROVED', 'PENDING_APPROVAL') THEN
    RAISE EXCEPTION 'CANNOT_PUBLISH: Solo se pueden publicar rutas aprobadas. Estado actual: %', v_status;
  END IF;

  -- Comprobar que no haya citas canceladas dentro de la ruta
  SELECT count(*) INTO v_canc_count
  FROM public.route_stops rs
  JOIN public.appointments a ON rs.appointment_id = a.id
  WHERE rs.route_id = p_route_id AND a.status = 'CANCELLED';

  IF v_canc_count > 0 THEN
    RAISE EXCEPTION 'ROUTE_CONTAINS_CANCELLED_APPOINTMENTS: La ruta tiene % citas canceladas. Requiere re-evaluación.', v_canc_count;
  END IF;

  -- Marcar rutas anteriores para el mismo veterinario y fecha como SUPERSEDED
  UPDATE public.routes
  SET status = 'SUPERSEDED', updated_at = now()
  WHERE veterinarian_id = v_vet_id
    AND route_date = v_rdate
    AND id <> p_route_id
    AND status IN ('PUBLISHED', 'APPROVED');

  -- Publicar la ruta seleccionada
  UPDATE public.routes
  SET status = 'PUBLISHED',
      published_at = now(),
      updated_at = now()
  WHERE id = p_route_id;

  -- Poner primera parada en READY y demás en PLANNED
  UPDATE public.route_stops
  SET status = CASE WHEN stop_order = 1 THEN 'READY' ELSE 'PLANNED' END,
      state_version = state_version + 1
  WHERE route_id = p_route_id;

  -- Registrar versión publicada
  INSERT INTO public.route_plan_versions (
    route_id, route_version, status, stops_snapshot, created_by
  ) VALUES (
    p_route_id, v_ver, 'PUBLISHED',
    jsonb_build_object('published_at', now(), 'actor_id', p_actor_id),
    p_actor_id
  ) ON CONFLICT (route_id, route_version) DO UPDATE
    SET status = 'PUBLISHED';

  -- Emitir evento outbox para CORE-01
  INSERT INTO public.outbox_events (
    aggregate_type, aggregate_id, event_type, payload
  ) VALUES (
    'route', p_route_id, 'route.published',
    jsonb_build_object(
      'route_id', p_route_id,
      'route_code', v_code,
      'veterinarian_id', v_vet_id,
      'route_date', v_rdate,
      'published_at', now()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'route_id', p_route_id,
    'route_code', v_code,
    'status', 'PUBLISHED',
    'published_at', now()
  );
END;
$$;

-- RPC 4: record_vet_en_route ("En camino")
CREATE OR REPLACE FUNCTION public.record_vet_en_route(
  p_stop_id uuid,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stop record;
  v_route record;
BEGIN
  SELECT * INTO v_stop FROM public.route_stops WHERE id = p_stop_id FOR UPDATE;
  IF v_stop.id IS NULL THEN
    RAISE EXCEPTION 'STOP_NOT_FOUND: Parada no encontrada';
  END IF;

  SELECT * INTO v_route FROM public.routes WHERE id = v_stop.route_id;

  -- Validar que el actor sea el veterinario asignado o rol coordinador
  IF v_route.veterinarian_id <> p_actor_id AND p_actor_id IS NOT NULL THEN
    -- Podría ser un coordinador o admin
    NULL;
  END IF;

  -- Validar idempotencia o estado incompatible
  IF v_stop.status = 'EN_ROUTE' THEN
    RETURN jsonb_build_object('success', true, 'already_en_route', true, 'stop_id', p_stop_id);
  END IF;

  IF v_stop.status NOT IN ('PLANNED', 'READY', 'PENDING') THEN
    RAISE EXCEPTION 'INVALID_TRANSITION: No se puede marcar En Camino desde estado %', v_stop.status;
  END IF;

  -- Actualizar estado de la parada
  UPDATE public.route_stops
  SET status = 'EN_ROUTE',
      actual_departure = now(),
      state_version = state_version + 1,
      client_notified_en_route = true
  WHERE id = p_stop_id;

  -- Actualizar ruta a IN_PROGRESS si era PUBLISHED
  IF v_route.status = 'PUBLISHED' THEN
    UPDATE public.routes SET status = 'IN_PROGRESS', updated_at = now() WHERE id = v_route.id;
  END IF;

  -- Registrar evento
  INSERT INTO public.route_stop_events (
    stop_id, route_id, appointment_id, event_type, actor_id, metadata
  ) VALUES (
    p_stop_id, v_route.id, v_stop.appointment_id, 'EN_ROUTE', p_actor_id,
    jsonb_build_object('departure_at', now())
  );

  -- Emitir evento outbox para despacho seguro de notificación a cliente vía CORE-03
  INSERT INTO public.outbox_events (
    aggregate_type, aggregate_id, event_type, payload
  ) VALUES (
    'route_stop', p_stop_id, 'route.stop_en_route',
    jsonb_build_object(
      'stop_id', p_stop_id,
      'route_id', v_route.id,
      'appointment_id', v_stop.appointment_id,
      'estimated_arrival', v_stop.estimated_arrival,
      'en_route_at', now()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'stop_id', p_stop_id,
    'status', 'EN_ROUTE',
    'en_route_at', now()
  );
END;
$$;

-- RPC 5: record_vet_arrival ("He llegado")
CREATE OR REPLACE FUNCTION public.record_vet_arrival(
  p_stop_id uuid,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stop record;
BEGIN
  SELECT * INTO v_stop FROM public.route_stops WHERE id = p_stop_id FOR UPDATE;
  IF v_stop.id IS NULL THEN
    RAISE EXCEPTION 'STOP_NOT_FOUND: Parada no encontrada';
  END IF;

  IF v_stop.status = 'ARRIVED' THEN
    RETURN jsonb_build_object('success', true, 'already_arrived', true, 'stop_id', p_stop_id);
  END IF;

  IF v_stop.status NOT IN ('EN_ROUTE', 'READY', 'PLANNED') THEN
    RAISE EXCEPTION 'INVALID_TRANSITION: No se puede marcar Llegada desde estado %', v_stop.status;
  END IF;

  -- Actualizar estado de parada
  UPDATE public.route_stops
  SET status = 'ARRIVED',
      actual_arrival = now(),
      state_version = state_version + 1
  WHERE id = p_stop_id;

  -- Registrar evento
  INSERT INTO public.route_stop_events (
    stop_id, route_id, appointment_id, event_type, actor_id, metadata
  ) VALUES (
    p_stop_id, v_stop.route_id, v_stop.appointment_id, 'ARRIVED', p_actor_id,
    jsonb_build_object('arrived_at', now())
  );

  -- Emitir evento outbox
  INSERT INTO public.outbox_events (
    aggregate_type, aggregate_id, event_type, payload
  ) VALUES (
    'route_stop', p_stop_id, 'route.stop_arrived',
    jsonb_build_object(
      'stop_id', p_stop_id,
      'route_id', v_stop.route_id,
      'appointment_id', v_stop.appointment_id,
      'arrived_at', now()
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'stop_id', p_stop_id,
    'status', 'ARRIVED',
    'arrived_at', now()
  );
END;
$$;

-- RPC 6: record_vet_service_milestone ("Iniciar / Finalizar Atención")
CREATE OR REPLACE FUNCTION public.record_vet_service_milestone(
  p_stop_id uuid,
  p_milestone text, -- 'START' o 'END'
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stop record;
  v_pending_count integer;
BEGIN
  SELECT * INTO v_stop FROM public.route_stops WHERE id = p_stop_id FOR UPDATE;
  IF v_stop.id IS NULL THEN
    RAISE EXCEPTION 'STOP_NOT_FOUND: Parada no encontrada';
  END IF;

  IF p_milestone = 'START' THEN
    IF v_stop.status NOT IN ('ARRIVED', 'EN_ROUTE') THEN
      RAISE EXCEPTION 'INVALID_TRANSITION: No se puede iniciar atención desde estado %', v_stop.status;
    END IF;

    UPDATE public.route_stops
    SET status = 'SERVICE_STARTED',
        actual_service_start_at = now(),
        state_version = state_version + 1
    WHERE id = p_stop_id;

    INSERT INTO public.route_stop_events (
      stop_id, route_id, appointment_id, event_type, actor_id, metadata
    ) VALUES (
      p_stop_id, v_stop.route_id, v_stop.appointment_id, 'SERVICE_STARTED', p_actor_id,
      jsonb_build_object('service_started_at', now())
    );

    RETURN jsonb_build_object('success', true, 'status', 'SERVICE_STARTED', 'stop_id', p_stop_id);

  ELSIF p_milestone = 'END' THEN
    IF v_stop.status NOT IN ('SERVICE_STARTED', 'ARRIVED') THEN
      RAISE EXCEPTION 'INVALID_TRANSITION: No se puede finalizar atención desde estado %', v_stop.status;
    END IF;

    UPDATE public.route_stops
    SET status = 'SERVICE_COMPLETED',
        actual_service_end_at = now(),
        state_version = state_version + 1
    WHERE id = p_stop_id;

    INSERT INTO public.route_stop_events (
      stop_id, route_id, appointment_id, event_type, actor_id, metadata
    ) VALUES (
      p_stop_id, v_stop.route_id, v_stop.appointment_id, 'SERVICE_COMPLETED', p_actor_id,
      jsonb_build_object('service_completed_at', now())
    );

    -- Poner la siguiente parada en READY
    UPDATE public.route_stops
    SET status = 'READY', state_version = state_version + 1
    WHERE route_id = v_stop.route_id
      AND stop_order = v_stop.stop_order + 1
      AND status = 'PLANNED';

    -- Verificar si era la última parada
    SELECT count(*) INTO v_pending_count
    FROM public.route_stops
    WHERE route_id = v_stop.route_id AND status NOT IN ('SERVICE_COMPLETED', 'COMPLETED', 'SKIPPED');

    IF v_pending_count = 0 THEN
      UPDATE public.routes SET status = 'COMPLETED', updated_at = now() WHERE id = v_stop.route_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'status', 'SERVICE_COMPLETED', 'stop_id', p_stop_id, 'route_completed', (v_pending_count = 0));
  ELSE
    RAISE EXCEPTION 'INVALID_MILESTONE: El hito debe ser START o END';
  END IF;
END;
$$;

-- RPC 7: report_and_evaluate_route_delay
CREATE OR REPLACE FUNCTION public.report_and_evaluate_route_delay(
  p_route_id uuid,
  p_stop_id uuid,
  p_delay_minutes integer,
  p_delay_reason text,
  p_delay_type text DEFAULT 'TRAVEL_DELAY',
  p_reported_by uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stop record;
  v_requires_notif boolean := false;
  v_delay_event_id uuid;
BEGIN
  IF p_stop_id IS NOT NULL THEN
    SELECT * INTO v_stop FROM public.route_stops WHERE id = p_stop_id;
  END IF;

  -- Umbral de retraso para alertar al cliente: >= 15 minutos
  IF p_delay_minutes >= 15 THEN
    v_requires_notif := true;
  END IF;

  -- Registrar en route_delay_events
  INSERT INTO public.route_delay_events (
    route_id, stop_id, appointment_id, delay_type,
    delay_minutes, delay_reason, requires_client_notification, reported_by
  ) VALUES (
    p_route_id, p_stop_id, v_stop.appointment_id, p_delay_type,
    p_delay_minutes, p_delay_reason, v_requires_notif, p_reported_by
  ) RETURNING id INTO v_delay_event_id;

  -- Si es significativo, crear alerta operativa en route_alerts
  IF v_requires_notif THEN
    INSERT INTO public.route_alerts (
      route_id, severity, alert_type, message, is_acknowledged
    ) VALUES (
      p_route_id, 'HIGH', 'DELAY_WARNING',
      'Retraso operacional de ' || p_delay_minutes || ' min (' || p_delay_reason || ')',
      false
    );

    -- Emitir evento outbox para CORE-03
    INSERT INTO public.outbox_events (
      aggregate_type, aggregate_id, event_type, payload
    ) VALUES (
      'route_delay', v_delay_event_id, 'route.delay_detected',
      jsonb_build_object(
        'route_id', p_route_id,
        'stop_id', p_stop_id,
        'appointment_id', v_stop.appointment_id,
        'delay_minutes', p_delay_minutes,
        'delay_reason', p_delay_reason,
        'detected_at', now()
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'delay_event_id', v_delay_event_id,
    'delay_minutes', p_delay_minutes,
    'requires_notification', v_requires_notif
  );
END;
$$;

-- RPC 8: propose_and_apply_route_reoptimization
CREATE OR REPLACE FUNCTION public.propose_and_apply_route_reoptimization(
  p_route_id uuid,
  p_trigger_reason text,
  p_new_stops jsonb, -- array de { stop_id, new_order }
  p_requested_by uuid,
  p_auto_approve boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_route record;
  v_elem jsonb;
  v_stop record;
  v_protected_violation boolean := false;
  v_new_version integer;
BEGIN
  SELECT * INTO v_route FROM public.routes WHERE id = p_route_id FOR UPDATE;
  IF v_route.id IS NULL THEN
    RAISE EXCEPTION 'ROUTE_NOT_FOUND: Ruta no encontrada';
  END IF;

  -- Validar si alguna parada clínicamente protegida se intenta remover o desplazar sin permiso
  FOR v_elem IN SELECT * FROM jsonb_array_elements(p_new_stops)
  LOOP
    SELECT * INTO v_stop FROM public.route_stops WHERE id = (v_elem->>'stop_id')::uuid;
    IF v_stop.is_clinically_protected AND (v_elem->>'skipped')::boolean IS TRUE THEN
      RAISE EXCEPTION 'CANNOT_SKIP_PROTECTED_STOP: La parada con cita % es clínicamente protegida.', v_stop.appointment_id;
    END IF;
  END LOOP;

  v_new_version := v_route.route_version + 1;

  -- Si no está auto-aprobada, registrar solicitud de reoptimización
  IF NOT p_auto_approve THEN
    INSERT INTO public.route_reoptimization_requests (
      route_id, trigger_reason, requested_by, status, changes_summary
    ) VALUES (
      p_route_id, p_trigger_reason, p_requested_by, 'PENDING_APPROVAL',
      jsonb_build_object('proposed_stops', p_new_stops, 'version', v_new_version)
    );

    UPDATE public.routes SET status = 'CHANGE_PENDING_APPROVAL', updated_at = now() WHERE id = p_route_id;

    RETURN jsonb_build_object(
      'success', true,
      'status', 'CHANGE_PENDING_APPROVAL',
      'route_version', v_route.route_version
    );
  END IF;

  -- Aplicar cambios si está aprobada
  FOR v_elem IN SELECT * FROM jsonb_array_elements(p_new_stops)
  LOOP
    UPDATE public.route_stops
    SET stop_order = (v_elem->>'new_order')::integer,
        state_version = state_version + 1
    WHERE id = (v_elem->>'stop_id')::uuid;
  END LOOP;

  -- Guardar snapshot de nueva versión
  INSERT INTO public.route_plan_versions (
    route_id, route_version, status, stops_snapshot, created_by
  ) VALUES (
    p_route_id, v_new_version, 'REOPTIMIZED',
    p_new_stops, p_requested_by
  );

  UPDATE public.routes
  SET route_version = v_new_version,
      status = 'PUBLISHED',
      updated_at = now()
  WHERE id = p_route_id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'PUBLISHED',
    'route_version', v_new_version
  );
END;
$$;

-- Revocar permisos de anon/PUBLIC y conceder a authenticated/service_role en las 8 funciones RPC
REVOKE ALL ON FUNCTION public.prepare_daily_route_proposal FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.approve_route_proposal FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.publish_authorized_route FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.record_vet_en_route FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.record_vet_arrival FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.record_vet_service_milestone FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.report_and_evaluate_route_delay FROM anon, PUBLIC;
REVOKE ALL ON FUNCTION public.propose_and_apply_route_reoptimization FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.prepare_daily_route_proposal TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.approve_route_proposal TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.publish_authorized_route TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_vet_en_route TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_vet_arrival TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_vet_service_milestone TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.report_and_evaluate_route_delay TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.propose_and_apply_route_reoptimization TO authenticated, service_role;
