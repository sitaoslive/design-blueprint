-- ==============================================================================
-- Migration: 006_smart_calendar_and_capacity.sql
-- Description: External calendar connections, Google/Outlook sync, privacy modes,
--              calendar conflicts, staff shifts, absences, and capacity rules.
-- Module: Module F (Agenda Inteligente) y Módulo G/H (Capacidad y Personal)
-- Requirements: WF2-001..WF2-028, AT2-001..AT2-025
-- ==============================================================================

-- 1. STAFF CALENDAR CONNECTIONS (Google Calendar / Outlook / iCal)
CREATE TABLE IF NOT EXISTS public.staff_calendar_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('GOOGLE_CALENDAR', 'OUTLOOK', 'APPLE_ICAL', 'INTERNAL')),
    calendar_id TEXT NOT NULL,
    sync_token TEXT,
    is_sync_enabled BOOLEAN NOT NULL DEFAULT true,
    sync_frequency_minutes INTEGER NOT NULL DEFAULT 15 CHECK (sync_frequency_minutes >= 5),
    privacy_mode TEXT NOT NULL DEFAULT 'BUSY_ONLY' CHECK (privacy_mode IN ('BUSY_ONLY', 'FULL_DETAILS')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_staff_calendar UNIQUE (staff_profile_id, provider, calendar_id)
);

CREATE TRIGGER trg_calendar_conn_updated_at
BEFORE UPDATE ON public.staff_calendar_connections
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. EXTERNAL CALENDAR EVENTS (Eventos sincronizados que bloquean disponibilidad)
CREATE TABLE IF NOT EXISTS public.external_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
    external_event_id TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    title TEXT DEFAULT 'Ocupado',
    is_all_day BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_connection_external_event UNIQUE (connection_id, external_event_id),
    CONSTRAINT chk_ext_event_times CHECK (start_time < end_time)
);

CREATE TRIGGER trg_ext_event_updated_at
BEFORE UPDATE ON public.external_calendar_events
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. CALENDAR SYNC STATE
CREATE TABLE IF NOT EXISTS public.calendar_sync_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES public.staff_calendar_connections(id) ON DELETE CASCADE,
    last_sync_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'OK' CHECK (status IN ('OK', 'ERROR', 'IN_PROGRESS', 'EXPIRED_CREDENTIALS')),
    error_message TEXT,
    events_synced_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. CALENDAR CONFLICTS (Trazabilidad de solapamientos detectados)
CREATE TABLE IF NOT EXISTS public.calendar_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    staff_profile_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    conflict_type TEXT NOT NULL CHECK (conflict_type IN ('EXTERNAL_OVERLAP', 'DOUBLE_BOOKING', 'BUFFER_VIOLATION', 'OUTSIDE_SHIFT')),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    external_event_id UUID REFERENCES public.external_calendar_events(id) ON DELETE SET NULL,
    conflict_start TIMESTAMPTZ NOT NULL,
    conflict_end TIMESTAMPTZ NOT NULL,
    resolution_status TEXT NOT NULL DEFAULT 'UNRESOLVED' CHECK (resolution_status IN ('UNRESOLVED', 'RESOLVED_RESCHEDULED', 'RESOLVED_OVERRIDE', 'IGNORED')),
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_conflict_times CHECK (conflict_start < conflict_end)
);

-- 5. STAFF SHIFTS (Turnos laborales programados)
CREATE TABLE IF NOT EXISTS public.staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    staff_profile_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_appointments INTEGER NOT NULL DEFAULT 6 CHECK (max_appointments > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_shift_times CHECK (start_time < end_time),
    CONSTRAINT uq_staff_shift UNIQUE (staff_profile_id, shift_date, start_time)
);

-- 6. STAFF ABSENCES (Vacaciones, incapacidades, permisos)
CREATE TABLE IF NOT EXISTS public.staff_absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    staff_profile_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    absence_type TEXT NOT NULL CHECK (absence_type IN ('VACATION', 'SICK_LEAVE', 'TRAINING', 'PERSONAL', 'COMPENSATORY')),
    approval_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_absence_dates CHECK (start_date <= end_date)
);

-- 7. CAPACITY RULES (Reglas operativas de carga laboral)
CREATE TABLE IF NOT EXISTS public.capacity_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    max_daily_visits_per_vet INTEGER NOT NULL DEFAULT 6 CHECK (max_daily_visits_per_vet > 0),
    travel_buffer_default_minutes INTEGER NOT NULL DEFAULT 30 CHECK (travel_buffer_default_minutes >= 0),
    emergency_slot_buffer_count INTEGER NOT NULL DEFAULT 1 CHECK (emergency_slot_buffer_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_capacity_rule UNIQUE (organization_id, rule_name)
);
