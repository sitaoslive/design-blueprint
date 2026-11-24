-- ============================================================================
-- VET FREEDOM OS — MIGRACIÓN 043: LIVE DISPATCH BACKEND, GPS TRACKING & SMART ETA
-- Proyecto: Vet Life — Veterinaria a Domicilio
-- Dirección: Dr. Luis Eduardo Ríos / Alpha Vision Method
-- Entorno: Supabase Cloud (PostgreSQL 17.12.0)
-- Fecha: 2026-11-21
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TIPOS DE CITA Y VERSIONAMIENTO DE DURACIONES (CAPÍTULO 10)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.appointment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'GENERAL_CONSULTATION',
        'SPECIALIST_CONSULTATION',
        'PREVENTIVE_VACCINATION',
        'FOLLOW_UP',
        'PROCEDURE_MINOR',
        'SURGICAL_EVALUATION',
        'EMERGENCY_TRIAGE',
        'EUTHANASIA_COMPASSIONATE'
    )),
    requires_veterinarian BOOLEAN NOT NULL DEFAULT true,
    requires_auxiliary BOOLEAN NOT NULL DEFAULT false,
    requires_specialist BOOLEAN NOT NULL DEFAULT false,
    clinical_approval_required BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS public.appointment_type_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_type_id UUID NOT NULL REFERENCES public.appointment_types(id) ON DELETE CASCADE,
    version INT NOT NULL DEFAULT 1,
    default_duration_minutes INT NOT NULL CHECK (default_duration_minutes > 0),
    min_duration_minutes INT NOT NULL CHECK (min_duration_minutes > 0),
    max_duration_minutes INT NOT NULL CHECK (max_duration_minutes >= min_duration_minutes),
    preparation_buffer_minutes INT NOT NULL DEFAULT 15 CHECK (preparation_buffer_minutes >= 0),
    administrative_buffer_minutes INT NOT NULL DEFAULT 15 CHECK (administrative_buffer_minutes >= 0),
    allowed_duration_increments INT NOT NULL DEFAULT 15 CHECK (allowed_duration_increments > 0),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    effective_until TIMESTAMPTZ,
    approved_by UUID REFERENCES public.user_profiles(id),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'SUPERSEDED', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (appointment_type_id, version)
);

CREATE TABLE IF NOT EXISTS public.appointment_duration_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    original_duration_minutes INT NOT NULL,
    overridden_duration_minutes INT NOT NULL CHECK (overridden_duration_minutes > 0),
    override_reason TEXT NOT NULL,
    approved_by UUID NOT NULL REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extensión no destructiva de appointments (Capítulo 11)
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS appointment_type_id UUID REFERENCES public.appointment_types(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS appointment_type_version_id UUID REFERENCES public.appointment_type_versions(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS planned_duration_minutes INT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_source TEXT DEFAULT 'DEFAULT_POLICY';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_override_reason TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS duration_override_approved_by UUID REFERENCES public.user_profiles(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS scheduled_start_at TIMESTAMPTZ;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS scheduled_end_at TIMESTAMPTZ;

-- Extensión no destructiva de visits (Capítulo 13)
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ASSIGNED';
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS assigned_assistant_id UUID REFERENCES public.staff_profiles(id);
ALTER TABLE public.visits ADD COLUMN IF NOT EXISTS actual_service_duration_minutes INT;

-- ----------------------------------------------------------------------------
-- 2. REGISTRO DE TIEMPOS DE VISITA EN CAMPO (CAPÍTULO 14)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.visit_timing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE RESTRICT,
    planned_start_at TIMESTAMPTZ NOT NULL,
    planned_end_at TIMESTAMPTZ NOT NULL,
    planned_duration_minutes INT NOT NULL,
    travel_started_at TIMESTAMPTZ,
    arrived_at TIMESTAMPTZ,
    service_started_at TIMESTAMPTZ,
    estimated_service_finish_at TIMESTAMPTZ,
    service_finished_at TIMESTAMPTZ,
    last_estimate_updated_at TIMESTAMPTZ,
    updated_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (visit_id)
);

-- ----------------------------------------------------------------------------
-- 3. IDENTIDAD DE DISPOSITIVOS Y SESIONES DE SEGUIMIENTO (CAPÍTULO 6 Y 7)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staff_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    staff_id UUID NOT NULL REFERENCES public.staff_profiles(id),
    device_identifier TEXT NOT NULL,
    device_model TEXT,
    platform TEXT NOT NULL CHECK (platform IN ('ANDROID', 'IOS', 'WEB_BROWSER')),
    client_type TEXT NOT NULL CHECK (client_type IN ('TRACCAR_CLIENT', 'LOVABLE_WEB_FOREGROUND', 'NATIVE_SDK')),
    is_authorized BOOLEAN NOT NULL DEFAULT true,
    authorized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, device_identifier)
);

CREATE TABLE IF NOT EXISTS public.tracking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    staff_id UUID NOT NULL REFERENCES public.staff_profiles(id),
    device_id UUID NOT NULL REFERENCES public.staff_devices(id),
    route_id UUID REFERENCES public.routes(id),
    visit_id UUID REFERENCES public.visits(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    purpose TEXT NOT NULL CHECK (purpose IN ('VISIT_DISPATCH', 'ROUTE_TRANSIT', 'SHIFT_DUTY')),
    source TEXT NOT NULL CHECK (source IN ('FOREGROUND_WEB', 'BACKGROUND_TRACCAR', 'MANUAL_DISPATCH')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN (
        'REQUESTED',
        'AUTHORIZED',
        'ACTIVE',
        'PAUSED',
        'STOPPED',
        'EXPIRED',
        'REVOKED',
        'ERROR'
    )),
    authorized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. OBSERVACIONES DE UBICACIÓN (CAPÍTULO 8)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.location_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    staff_id UUID NOT NULL REFERENCES public.staff_profiles(id),
    device_id UUID NOT NULL REFERENCES public.staff_devices(id),
    tracking_session_id UUID NOT NULL REFERENCES public.tracking_sessions(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    accuracy_meters DOUBLE PRECISION NOT NULL CHECK (accuracy_meters >= 0),
    speed_mps DOUBLE PRECISION,
    heading_degrees DOUBLE PRECISION,
    observed_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source TEXT NOT NULL CHECK (source IN ('GPS', 'NETWORK', 'FUSED', 'SIMULATION')),
    quality_status TEXT NOT NULL DEFAULT 'VALID' CHECK (quality_status IN (
        'VALID',
        'DEGRADED_ACCURACY',
        'STALE_TIMESTAMP',
        'OUT_OF_BOUNDS',
        'SUSPICIOUS_SPEED'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 5. PREDICCIONES DE ETA Y RUTAS (CAPÍTULO 15)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.eta_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    visit_id UUID REFERENCES public.visits(id),
    predicted_arrival_at TIMESTAMPTZ NOT NULL,
    predicted_travel_minutes INT NOT NULL CHECK (predicted_travel_minutes >= 0),
    eta_source TEXT NOT NULL CHECK (eta_source IN (
        'GOOGLE_ROUTES_TRAFFIC',
        'OSRM_NO_TRAFFIC',
        'HISTORICAL_AVERAGE',
        'MANUAL_ESTIMATE'
    )),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    location_observed_at TIMESTAMPTZ,
    confidence TEXT NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW', 'UNAVAILABLE')),
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'DEGRADED', 'STALE', 'UNAVAILABLE')),
    warnings JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. POLÍTICAS DE NOTIFICACIÓN DE RETRASO (CAPÍTULO 20)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.delay_notification_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    enabled BOOLEAN NOT NULL DEFAULT true,
    mode TEXT NOT NULL DEFAULT 'INTERNAL_ONLY' CHECK (mode IN (
        'OFF',
        'INTERNAL_ONLY',
        'HUMAN_APPROVAL',
        'AUTOMATIC_ELIGIBLE'
    )),
    internal_alert_threshold_minutes INT NOT NULL DEFAULT 10 CHECK (internal_alert_threshold_minutes >= 0),
    customer_notification_threshold_minutes INT NOT NULL DEFAULT 15 CHECK (customer_notification_threshold_minutes >= internal_alert_threshold_minutes),
    minimum_update_interval_minutes INT NOT NULL DEFAULT 15 CHECK (minimum_update_interval_minutes >= 0),
    minimum_eta_change_minutes INT NOT NULL DEFAULT 10 CHECK (minimum_eta_change_minutes >= 0),
    required_consecutive_predictions INT NOT NULL DEFAULT 2 CHECK (required_consecutive_predictions >= 1),
    location_stale_after_seconds INT NOT NULL DEFAULT 300,
    eta_recalculation_interval_seconds INT NOT NULL DEFAULT 180,
    customer_notification_window JSONB NOT NULL DEFAULT '{"start_hour": "07:00", "end_hour": "21:00"}'::jsonb,
    escalation_policy_id TEXT DEFAULT 'ESC_COORD_DISPATCH',
    version INT NOT NULL DEFAULT 1,
    approved_by UUID REFERENCES public.user_profiles(id),
    effective_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, version)
);

-- ----------------------------------------------------------------------------
-- 7. INCIDENCIAS DE RETRASO Y PROPAGACIÓN EN CASCADA (CAPÍTULO 18 Y 21)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.delay_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    route_id UUID REFERENCES public.routes(id),
    visit_id UUID REFERENCES public.visits(id),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id),
    initial_delay_minutes INT NOT NULL,
    current_delay_minutes INT NOT NULL,
    consecutive_count INT NOT NULL DEFAULT 1,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status TEXT NOT NULL DEFAULT 'DETECTED' CHECK (status IN (
        'DETECTED',
        'INTERNAL_ALERTED',
        'CUSTOMER_NOTIFIED',
        'RECOVERING',
        'RESOLVED',
        'DISMISSED'
    )),
    internal_alert_sent BOOLEAN NOT NULL DEFAULT false,
    customer_notified BOOLEAN NOT NULL DEFAULT false,
    recovery_state TEXT NOT NULL DEFAULT 'ON_DELAY' CHECK (recovery_state IN ('ON_DELAY', 'RECOVERING', 'WITHIN_TOLERANCE')),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.delay_affected_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delay_incident_id UUID NOT NULL REFERENCES public.delay_incidents(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    stop_order INT NOT NULL,
    original_scheduled_start TIMESTAMPTZ NOT NULL,
    predicted_delayed_start TIMESTAMPTZ NOT NULL,
    delay_minutes INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AFFECTED' CHECK (status IN ('AFFECTED', 'RESCHEDULE_PROPOSED', 'MITIGATED', 'UNIMPACTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (delay_incident_id, appointment_id)
);

-- ----------------------------------------------------------------------------
-- 8. ACCESO PRIVADO DE CLIENTE TIPO UBER (CAPÍTULO 30 Y 31)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.customer_tracking_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    visit_id UUID REFERENCES public.visits(id),
    access_token_hash TEXT NOT NULL UNIQUE,
    client_id UUID NOT NULL REFERENCES public.owners(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_queries INT NOT NULL DEFAULT 50,
    query_count INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (appointment_id)
);

-- ----------------------------------------------------------------------------
-- 9. HISTORIAL DE DESPACHO DE NOTIFICACIONES DE RETRASO (CAPÍTULO 27)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.delay_notification_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id),
    customer_id UUID NOT NULL REFERENCES public.owners(id),
    delay_incident_id UUID REFERENCES public.delay_incidents(id),
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'DELAY_ALERT_INITIAL',
        'ETA_SIGNIFICANT_CHANGE',
        'DELAY_RECOVERED',
        'PROMPT_CONFIRMATION'
    )),
    policy_version INT NOT NULL DEFAULT 1,
    template_version TEXT NOT NULL DEFAULT 'TPL_DELAY_V1',
    delay_minutes INT NOT NULL,
    eta_reference TIMESTAMPTZ NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    correlation_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED',
        'ACCEPTED_BY_PROVIDER',
        'SENT',
        'DELIVERED',
        'FAILED',
        'UNKNOWN'
    )),
    provider_message_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 10. ÍNDICES DE RENDIMIENTO PARA DESPACHO Y GEOLOCALIZACIÓN
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_tracking_sessions_staff_active ON public.tracking_sessions(staff_id, status)
WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_location_obs_session_time ON public.location_observations(tracking_session_id, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_eta_predictions_apt ON public.eta_predictions(appointment_id, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_delay_incidents_active ON public.delay_incidents(organization_id, status)
WHERE status NOT IN ('RESOLVED', 'DISMISSED');

CREATE INDEX IF NOT EXISTS idx_customer_tracking_hash ON public.customer_tracking_access(access_token_hash)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_delay_notif_idempotency ON public.delay_notification_dispatches(idempotency_key);

-- ----------------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY (RLS) FORZADO AL 100%
-- ----------------------------------------------------------------------------

ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types FORCE ROW LEVEL SECURITY;

ALTER TABLE public.appointment_type_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_type_versions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.appointment_duration_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_duration_overrides FORCE ROW LEVEL SECURITY;

ALTER TABLE public.visit_timing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_timing_records FORCE ROW LEVEL SECURITY;

ALTER TABLE public.staff_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_devices FORCE ROW LEVEL SECURITY;

ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.location_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_observations FORCE ROW LEVEL SECURITY;

ALTER TABLE public.eta_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eta_predictions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.delay_notification_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delay_notification_policies FORCE ROW LEVEL SECURITY;

ALTER TABLE public.delay_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delay_incidents FORCE ROW LEVEL SECURITY;

ALTER TABLE public.delay_affected_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delay_affected_appointments FORCE ROW LEVEL SECURITY;

ALTER TABLE public.customer_tracking_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tracking_access FORCE ROW LEVEL SECURITY;

ALTER TABLE public.delay_notification_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delay_notification_dispatches FORCE ROW LEVEL SECURITY;

-- Políticas RLS Idempotentes usando is_org_staff
DO $$
BEGIN
    CREATE POLICY p_appointment_types_all ON public.appointment_types
        FOR ALL TO authenticated
        USING (is_org_staff(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_appointment_type_versions_all ON public.appointment_type_versions
        FOR ALL TO authenticated
        USING (appointment_type_id IN (
            SELECT id FROM public.appointment_types WHERE is_org_staff(organization_id)
        ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_duration_overrides_all ON public.appointment_duration_overrides
        FOR ALL TO authenticated
        USING (appointment_id IN (
            SELECT id FROM public.appointments WHERE is_org_staff(organization_id)
        ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_visit_timing_records_all ON public.visit_timing_records
        FOR ALL TO authenticated
        USING (visit_id IN (
            SELECT id FROM public.visits WHERE is_org_staff(organization_id)
        ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_staff_devices_all ON public.staff_devices
        FOR ALL TO authenticated
        USING (is_org_staff(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_tracking_sessions_all ON public.tracking_sessions
        FOR ALL TO authenticated
        USING (is_org_staff(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_location_observations_all ON public.location_observations
        FOR ALL TO authenticated
        USING (is_org_staff(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_eta_predictions_all ON public.eta_predictions
        FOR ALL TO authenticated
        USING (is_org_staff(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_delay_policies_all ON public.delay_notification_policies
        FOR ALL TO authenticated
        USING (is_org_staff(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_delay_incidents_all ON public.delay_incidents
        FOR ALL TO authenticated
        USING (is_org_staff(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_delay_affected_all ON public.delay_affected_appointments
        FOR ALL TO authenticated
        USING (delay_incident_id IN (
            SELECT id FROM public.delay_incidents WHERE is_org_staff(organization_id)
        ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_customer_tracking_all ON public.customer_tracking_access
        FOR ALL TO authenticated
        USING (
            client_id IN (SELECT id FROM public.owners WHERE user_id = auth.uid())
            OR is_org_staff(organization_id)
        );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE POLICY p_delay_notif_dispatches_all ON public.delay_notification_dispatches
        FOR ALL TO authenticated
        USING (is_org_staff(organization_id));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------------------------
-- 12. PROCEDIMIENTOS ALMACENADOS Y RPCS PROTEGIDAS
-- ----------------------------------------------------------------------------

-- A. Iniciar Sesión de Seguimiento GPS
CREATE OR REPLACE FUNCTION public.start_tracking_session(
    p_organization_id UUID,
    p_staff_id UUID,
    p_device_id UUID,
    p_purpose TEXT,
    p_route_id UUID DEFAULT NULL,
    p_visit_id UUID DEFAULT NULL,
    p_duration_hours INT DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
    v_session_id UUID;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Cerrar sesiones activas previas del mismo staff
    UPDATE public.tracking_sessions
    SET status = 'STOPPED', ended_at = now(), updated_at = now()
    WHERE staff_id = p_staff_id AND status = 'ACTIVE';

    v_expires_at := now() + (p_duration_hours || ' hours')::interval;

    INSERT INTO public.tracking_sessions (
        organization_id, staff_id, device_id, route_id, visit_id,
        purpose, source, status, authorized_at, expires_at
    ) VALUES (
        p_organization_id, p_staff_id, p_device_id, p_route_id, p_visit_id,
        p_purpose, 'FOREGROUND_WEB', 'ACTIVE', now(), v_expires_at
    ) RETURNING id INTO v_session_id;

    RETURN jsonb_build_object(
        'success', true,
        'tracking_session_id', v_session_id,
        'expires_at', v_expires_at,
        'status', 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- B. Detener Sesión de Seguimiento GPS
CREATE OR REPLACE FUNCTION public.stop_tracking_session(
    p_session_id UUID,
    p_reason TEXT DEFAULT 'SHIFT_FINISHED'
)
RETURNS JSONB AS $$
DECLARE
    v_rows INT;
BEGIN
    UPDATE public.tracking_sessions
    SET status = 'STOPPED', ended_at = now(), updated_at = now()
    WHERE id = p_session_id AND status = 'ACTIVE';
    GET DIAGNOSTICS v_rows = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', (v_rows > 0),
        'session_id', p_session_id,
        'status', 'STOPPED'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- C. Ingestar Observación de Ubicación GPS
CREATE OR REPLACE FUNCTION public.ingest_location_observation(
    p_session_id UUID,
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_accuracy_meters DOUBLE PRECISION,
    p_speed_mps DOUBLE PRECISION DEFAULT NULL,
    p_heading_degrees DOUBLE PRECISION DEFAULT NULL,
    p_source TEXT DEFAULT 'GPS'
)
RETURNS JSONB AS $$
DECLARE
    v_session RECORD;
    v_quality TEXT := 'VALID';
    v_obs_id UUID;
BEGIN
    SELECT * INTO v_session
    FROM public.tracking_sessions
    WHERE id = p_session_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_NOT_FOUND');
    END IF;

    IF v_session.status != 'ACTIVE' OR now() > v_session.expires_at THEN
        RETURN jsonb_build_object('success', false, 'error', 'SESSION_NOT_ACTIVE_OR_EXPIRED');
    END IF;

    -- Validar calidad
    IF p_accuracy_meters > 100.0 THEN
        v_quality := 'DEGRADED_ACCURACY';
    END IF;

    IF p_speed_mps IS NOT NULL AND p_speed_mps > 45.0 THEN
        v_quality := 'SUSPICIOUS_SPEED';
    END IF;

    INSERT INTO public.location_observations (
        organization_id, staff_id, device_id, tracking_session_id,
        latitude, longitude, accuracy_meters, speed_mps, heading_degrees,
        observed_at, received_at, source, quality_status
    ) VALUES (
        v_session.organization_id, v_session.staff_id, v_session.device_id, v_session.id,
        p_latitude, p_longitude, p_accuracy_meters, p_speed_mps, p_heading_degrees,
        now(), now(), p_source, v_quality
    ) RETURNING id INTO v_obs_id;

    RETURN jsonb_build_object(
        'success', true,
        'observation_id', v_obs_id,
        'quality_status', v_quality
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- D. Registrar Eventos de Temporización de Visita
CREATE OR REPLACE FUNCTION public.record_visit_timing_event(
    p_visit_id UUID,
    p_event_type TEXT,
    p_event_timestamp TIMESTAMPTZ,
    p_estimated_finish_at TIMESTAMPTZ DEFAULT NULL,
    p_performed_by UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_visit RECORD;
BEGIN
    SELECT * INTO v_visit FROM public.visits WHERE id = p_visit_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'VISIT_NOT_FOUND');
    END IF;

    -- Insertar o actualizar registro de temporización
    INSERT INTO public.visit_timing_records (
        visit_id, planned_start_at, planned_end_at, planned_duration_minutes,
        travel_started_at, arrived_at, service_started_at,
        estimated_service_finish_at, service_finished_at,
        last_estimate_updated_at, updated_by
    ) VALUES (
        p_visit_id, now(), now() + interval '45 minutes', 45,
        CASE WHEN p_event_type = 'TRAVEL_STARTED' THEN p_event_timestamp ELSE NULL END,
        CASE WHEN p_event_type = 'ARRIVED' THEN p_event_timestamp ELSE NULL END,
        CASE WHEN p_event_type = 'SERVICE_STARTED' THEN p_event_timestamp ELSE NULL END,
        p_estimated_finish_at,
        CASE WHEN p_event_type = 'SERVICE_FINISHED' THEN p_event_timestamp ELSE NULL END,
        CASE WHEN p_event_type = 'FINISH_ESTIMATE_UPDATED' THEN now() ELSE NULL END,
        p_performed_by
    )
    ON CONFLICT (visit_id) DO UPDATE SET
        travel_started_at = COALESCE(CASE WHEN p_event_type = 'TRAVEL_STARTED' THEN p_event_timestamp ELSE NULL END, visit_timing_records.travel_started_at),
        arrived_at = COALESCE(CASE WHEN p_event_type = 'ARRIVED' THEN p_event_timestamp ELSE NULL END, visit_timing_records.arrived_at),
        service_started_at = COALESCE(CASE WHEN p_event_type = 'SERVICE_STARTED' THEN p_event_timestamp ELSE NULL END, visit_timing_records.service_started_at),
        estimated_service_finish_at = COALESCE(p_estimated_finish_at, visit_timing_records.estimated_service_finish_at),
        service_finished_at = COALESCE(CASE WHEN p_event_type = 'SERVICE_FINISHED' THEN p_event_timestamp ELSE NULL END, visit_timing_records.service_finished_at),
        last_estimate_updated_at = CASE WHEN p_event_type = 'FINISH_ESTIMATE_UPDATED' THEN now() ELSE visit_timing_records.last_estimate_updated_at END,
        updated_by = COALESCE(p_performed_by, visit_timing_records.updated_by),
        updated_at = now();

    -- Actualizar estado de visits y appointments
    IF p_event_type = 'TRAVEL_STARTED' THEN
        UPDATE public.visits SET status = 'EN_ROUTE', updated_at = now() WHERE id = p_visit_id;
        UPDATE public.appointments SET status = 'EN_ROUTE', updated_at = now() WHERE id = v_visit.appointment_id;
    ELSIF p_event_type = 'ARRIVED' THEN
        UPDATE public.visits SET status = 'ARRIVED', check_in_at = p_event_timestamp, updated_at = now() WHERE id = p_visit_id;
        UPDATE public.appointments SET status = 'ARRIVED', updated_at = now() WHERE id = v_visit.appointment_id;
    ELSIF p_event_type = 'SERVICE_STARTED' THEN
        UPDATE public.visits SET status = 'IN_SERVICE', updated_at = now() WHERE id = p_visit_id;
        UPDATE public.appointments SET status = 'IN_PROGRESS', updated_at = now() WHERE id = v_visit.appointment_id;
    ELSIF p_event_type = 'SERVICE_FINISHED' THEN
        UPDATE public.visits SET status = 'SERVICE_FINISHED', check_out_at = p_event_timestamp, updated_at = now() WHERE id = p_visit_id;
        UPDATE public.appointments SET status = 'COMPLETED', updated_at = now() WHERE id = v_visit.appointment_id;
    END IF;

    -- Notificar evento durable en outbox
    INSERT INTO public.transactional_outbox (
        organization_id, event_type, aggregate_type, aggregate_id, payload
    ) VALUES (
        v_visit.organization_id,
        'VISIT_' || p_event_type,
        'VISIT',
        p_visit_id,
        jsonb_build_object(
            'visitId', p_visit_id,
            'appointmentId', v_visit.appointment_id,
            'eventType', p_event_type,
            'timestamp', p_event_timestamp,
            'estimatedFinishAt', p_estimated_finish_at,
            'performedBy', p_performed_by
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'visit_id', p_visit_id,
        'event_type', p_event_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- E. Emisión de Token de Seguimiento Seguro para Propietario (Uber-Style)
CREATE OR REPLACE FUNCTION public.issue_customer_tracking_token(
    p_appointment_id UUID,
    p_duration_hours INT DEFAULT 6
)
RETURNS JSONB AS $$
DECLARE
    v_apt RECORD;
    v_token TEXT;
    v_token_hash TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    SELECT * INTO v_apt FROM public.appointments WHERE id = p_appointment_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'APPOINTMENT_NOT_FOUND');
    END IF;

    v_token := encode(gen_random_bytes(32), 'hex');
    v_token_hash := encode(digest(v_token, 'sha256'), 'hex');
    v_expires_at := now() + (p_duration_hours || ' hours')::interval;

    INSERT INTO public.customer_tracking_access (
        organization_id, appointment_id, access_token_hash, client_id,
        is_active, expires_at
    ) VALUES (
        v_apt.organization_id, p_appointment_id, v_token_hash, v_apt.owner_id,
        true, v_expires_at
    )
    ON CONFLICT (appointment_id) DO UPDATE SET
        access_token_hash = v_token_hash,
        is_active = true,
        query_count = 0,
        expires_at = v_expires_at;

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', p_appointment_id,
        'tracking_token', v_token,
        'expires_at', v_expires_at
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- F. Consulta Acotada y Privada de Tracking por el Propietario
CREATE OR REPLACE FUNCTION public.validate_customer_tracking_view(
    p_token TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_token_hash TEXT;
    v_access RECORD;
    v_apt RECORD;
    v_last_obs RECORD;
    v_eta RECORD;
BEGIN
    v_token_hash := encode(digest(p_token, 'sha256'), 'hex');

    SELECT * INTO v_access
    FROM public.customer_tracking_access
    WHERE access_token_hash = v_token_hash;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('authorized', false, 'error', 'INVALID_TOKEN');
    END IF;

    IF NOT v_access.is_active OR now() > v_access.expires_at THEN
        RETURN jsonb_build_object('authorized', false, 'error', 'TOKEN_EXPIRED_OR_REVOKED');
    END IF;

    -- Incrementar conteo de queries
    UPDATE public.customer_tracking_access
    SET query_count = query_count + 1
    WHERE id = v_access.id;

    -- Obtener cita
    SELECT id, status, start_time, duration_minutes, assigned_veterinarian_id
    INTO v_apt
    FROM public.appointments
    WHERE id = v_access.appointment_id;

    -- Obtener último ETA
    SELECT predicted_arrival_at, predicted_travel_minutes, confidence, status
    INTO v_eta
    FROM public.eta_predictions
    WHERE appointment_id = v_access.appointment_id
    ORDER BY calculated_at DESC LIMIT 1;

    -- Solo mostrar ubicación si el veterinario va en camino hacia ESTA cita (EN_ROUTE)
    IF v_apt.status = 'EN_ROUTE' THEN
        SELECT latitude, longitude, observed_at, accuracy_meters
        INTO v_last_obs
        FROM public.location_observations
        WHERE staff_id = v_apt.assigned_veterinarian_id
        ORDER BY observed_at DESC LIMIT 1;
    END IF;

    RETURN jsonb_build_object(
        'authorized', true,
        'appointmentId', v_apt.id,
        'status', v_apt.status,
        'scheduledStart', v_apt.start_time,
        'predictedArrival', v_eta.predicted_arrival_at,
        'predictedTravelMinutes', v_eta.predicted_travel_minutes,
        'confidence', COALESCE(v_eta.confidence, 'UNAVAILABLE'),
        'currentLocation', CASE WHEN v_apt.status = 'EN_ROUTE' AND v_last_obs.latitude IS NOT NULL THEN
            jsonb_build_object(
                'latitude', v_last_obs.latitude,
                'longitude', v_last_obs.longitude,
                'observedAt', v_last_obs.observed_at
            )
        ELSE NULL END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ----------------------------------------------------------------------------
-- 13. REVOCACIÓN A ANON Y PERMISOS CONTROLADOS
-- ----------------------------------------------------------------------------

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;

GRANT EXECUTE ON FUNCTION public.start_tracking_session TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.stop_tracking_session TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.ingest_location_observation TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_visit_timing_event TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.issue_customer_tracking_token TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_customer_tracking_view TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 14. SEED DATA OFICIAL DE TIPOS DE CITA Y POLÍTICA DE RETRASO
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_t1 UUID;
    v_t2 UUID;
    v_t3 UUID;
    v_t4 UUID;
BEGIN
    -- Tipo 1: Consulta General
    INSERT INTO public.appointment_types (organization_id, code, name, description, category, requires_veterinarian, requires_auxiliary)
    VALUES (v_org_id, 'CONSULTA_GENERAL', 'Consulta Médica General Domiciliaria', 'Evaluación clínica completa en casa', 'GENERAL_CONSULTATION', true, false)
    ON CONFLICT (organization_id, code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_t1;

    INSERT INTO public.appointment_type_versions (appointment_type_id, version, default_duration_minutes, min_duration_minutes, max_duration_minutes)
    VALUES (v_t1, 1, 45, 30, 60)
    ON CONFLICT (appointment_type_id, version) DO NOTHING;

    -- Tipo 2: Vacunación Preventiva
    INSERT INTO public.appointment_types (organization_id, code, name, description, category, requires_veterinarian, requires_auxiliary)
    VALUES (v_org_id, 'VACUNACION', 'Vacunación y Salud Preventiva', 'Aplicación de biológicos y examen previo', 'PREVENTIVE_VACCINATION', true, false)
    ON CONFLICT (organization_id, code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_t2;

    INSERT INTO public.appointment_type_versions (appointment_type_id, version, default_duration_minutes, min_duration_minutes, max_duration_minutes)
    VALUES (v_t2, 1, 30, 20, 45)
    ON CONFLICT (appointment_type_id, version) DO NOTHING;

    -- Tipo 3: Consulta Especializada / Interconsulta
    INSERT INTO public.appointment_types (organization_id, code, name, description, category, requires_veterinarian, requires_specialist)
    VALUES (v_org_id, 'INTERCONSULTA', 'Interconsulta con Especialista', 'Atención especializada (cardiología, dermatología, etc.)', 'SPECIALIST_CONSULTATION', true, true)
    ON CONFLICT (organization_id, code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_t3;

    INSERT INTO public.appointment_type_versions (appointment_type_id, version, default_duration_minutes, min_duration_minutes, max_duration_minutes)
    VALUES (v_t3, 1, 60, 45, 90)
    ON CONFLICT (appointment_type_id, version) DO NOTHING;

    -- Tipo 4: Procedimiento Menor
    INSERT INTO public.appointment_types (organization_id, code, name, description, category, requires_veterinarian, requires_auxiliary)
    VALUES (v_org_id, 'PROCEDIMIENTO_MENOR', 'Procedimiento Menor con Auxiliar', 'Curación, vendaje o fluidoterapia en domicilio', 'PROCEDURE_MINOR', true, true)
    ON CONFLICT (organization_id, code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id INTO v_t4;

    INSERT INTO public.appointment_type_versions (appointment_type_id, version, default_duration_minutes, min_duration_minutes, max_duration_minutes)
    VALUES (v_t4, 1, 60, 30, 90)
    ON CONFLICT (appointment_type_id, version) DO NOTHING;

    -- Política de Retraso Inicial
    INSERT INTO public.delay_notification_policies (
        organization_id, enabled, mode, internal_alert_threshold_minutes,
        customer_notification_threshold_minutes, minimum_update_interval_minutes,
        minimum_eta_change_minutes, required_consecutive_predictions, version
    ) VALUES (
        v_org_id, true, 'INTERNAL_ONLY', 10, 15, 15, 10, 2, 1
    ) ON CONFLICT (organization_id, version) DO NOTHING;

END $$;
