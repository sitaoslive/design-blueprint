-- ==============================================================================
-- Migration: 005_appointments_and_scheduling.sql
-- Description: Appointment requests, appointments, multi-service lines, status history,
--              holds, domiciliary visits, check-ins, and OKVET official references.
-- Module: Module E (Solicitudes, Citas y Visitas)
-- Requirements: WF-049..WF-068, AT-036..AT-050
-- ==============================================================================

-- 1. APPOINTMENT REQUESTS (Fase previa a agendamiento)
CREATE TABLE IF NOT EXISTS public.appointment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    address_id UUID NOT NULL REFERENCES public.addresses(id) ON DELETE RESTRICT,
    preferred_date DATE NOT NULL,
    preferred_time_window TEXT NOT NULL DEFAULT 'MORNING' CHECK (preferred_time_window IN ('MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME')),
    reason_for_consultation TEXT NOT NULL,
    source_channel TEXT NOT NULL DEFAULT 'WHATSAPP' CHECK (source_channel IN ('WHATSAPP', 'LOVABLE_WEB', 'PHONE', 'INTERNAL')),
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED',             -- Solicitada por cliente
        'DATA_COMPLETE',        -- Datos verificados
        'OPERATIONAL_VALIDATION',-- Factibilidad de ruta y agenda validada
        'PENDING_OKVET',         -- Validando expediente clínico
        'APPROVED',              -- Convertida a cita
        'REJECTED',              -- Rechazada operativamente
        'CANCELLED_BY_CLIENT'    -- Cancelada por el usuario
    )),
    triage_level TEXT NOT NULL DEFAULT 'ROUTINE' CHECK (triage_level IN ('ROUTINE', 'URGENT_SAME_DAY', 'EMERGENCY_IMMEDIATE')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_appointment_requests_updated_at
BEFORE UPDATE ON public.appointment_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. APPOINTMENTS (Citas canónicas)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    request_id UUID REFERENCES public.appointment_requests(id) ON DELETE SET NULL,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    address_id UUID NOT NULL REFERENCES public.addresses(id) ON DELETE RESTRICT,
    assigned_veterinarian_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
    assigned_assistant_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    status TEXT NOT NULL DEFAULT 'PROVISIONAL' CHECK (status IN (
        'PROVISIONAL',          -- Hold o bloqueo temporal
        'SCHEDULED',            -- Agendada internamente
        'PENDING_OKVET',        -- Esperando confirmación/registro en OKVET
        'CONFIRMED_OFFICIAL',   -- Confirmada formalmente con OKVET
        'EN_ROUTE',             -- Médico en camino
        'ARRIVED',              -- En domicilio (Check-in)
        'IN_PROGRESS',          -- Atención en curso
        'COMPLETED',            -- Visita finalizada con éxito
        'CANCELLED_CLIENT',     -- Cancelada por cliente
        'CANCELLED_CLINICAL',   -- Cancelada por criterio veterinario
        'RESCHEDULED',          -- Reprogramada
        'NO_SHOW'               -- Cliente ausente en domicilio
    )),
    confirmation_evidence TEXT,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES auth.users(id),
    okvet_appointment_id TEXT, -- ID oficial en OKVET
    okvet_sync_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (okvet_sync_status IN ('PENDING', 'SYNCED_MANUAL', 'SYNCED_API', 'CONFLICT', 'NOT_REQUIRED')),
    is_double_booked_override BOOLEAN NOT NULL DEFAULT false,
    double_book_justification TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_appointment_times CHECK (start_time < end_time)
);

CREATE TRIGGER trg_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. APPOINTMENT SERVICES (Servicios combinados en una cita)
CREATE TABLE IF NOT EXISTS public.appointment_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    tariff_id UUID REFERENCES public.tariffs(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(14,2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. APPOINTMENT STATUS HISTORY (Auditoría inmutable de ciclo de vida)
CREATE TABLE IF NOT EXISTS public.appointment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    from_status TEXT NOT NULL,
    to_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. APPOINTMENT HOLDS (Bloqueos provisionales contra concurrencia de reservas)
CREATE TABLE IF NOT EXISTS public.appointment_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    staff_profile_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    hold_session_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_released BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_hold_times CHECK (start_time < end_time)
);

-- 6. VISITS (Atención domiciliaria en campo)
CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    veterinarian_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
    check_in_at TIMESTAMPTZ,
    check_in_latitude DOUBLE PRECISION,
    check_in_longitude DOUBLE PRECISION,
    check_out_at TIMESTAMPTZ,
    clinical_summary TEXT,
    prescriptions_issued BOOLEAN NOT NULL DEFAULT false,
    samples_collected BOOLEAN NOT NULL DEFAULT false,
    requires_followup BOOLEAN NOT NULL DEFAULT false,
    followup_due_days INTEGER CHECK (followup_due_days >= 0),
    followup_notes TEXT,
    okvet_clinical_record_id TEXT, -- ID del registro en OKVET
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_visits_updated_at
BEFORE UPDATE ON public.visits
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. OKVET REFERENCES (Mapeo verificado con el registro clínico oficial)
CREATE TABLE IF NOT EXISTS public.okvet_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('PATIENT', 'OWNER', 'APPOINTMENT', 'CLINICAL_RECORD', 'INVOICE')),
    internal_id UUID NOT NULL,
    okvet_id TEXT NOT NULL,
    verified_by_user_id UUID REFERENCES auth.users(id),
    verification_notes TEXT,
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_okvet_entity UNIQUE (organization_id, entity_type, internal_id)
);
