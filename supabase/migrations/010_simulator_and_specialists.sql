-- ==============================================================================
-- Migration: 010_simulator_and_specialists.sql
-- Description: Schedule simulator, snapshots, scenarios, external specialist network,
--              specialties, agreements, slot holds, and booking requests.
-- Module: Module M (Simulador Inteligente) y Módulo N (Especialistas)
-- Requirements: WF3-001..WF3-028, AT3-001..AT3-025
-- ==============================================================================

-- 1. SCHEDULE SIMULATIONS (Simulaciones de capacidad y reasignación de agenda)
CREATE TABLE IF NOT EXISTS public.schedule_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    simulation_name TEXT NOT NULL,
    target_date_range_start DATE NOT NULL,
    target_date_range_end DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'RUNNING', 'PROPOSED', 'APPROVED', 'DISCARDED', 'EXECUTED_PRODUCTION'
    )),
    objective TEXT NOT NULL CHECK (objective IN (
        'MAXIMIZE_THROUGHPUT', 'MINIMIZE_TRAVEL_TIME', 'WORKLOAD_BALANCE', 
        'EMERGENCY_REALLOCATION', 'SPECIALIST_CONTINUITY'
    )),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    executed_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_simulation_dates CHECK (target_date_range_start <= target_date_range_end)
);

CREATE TRIGGER trg_simulations_updated_at
BEFORE UPDATE ON public.schedule_simulations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. SIMULATION SNAPSHOTS (Fotografía inmutable antes de aplicar cambios)
CREATE TABLE IF NOT EXISTS public.simulation_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES public.schedule_simulations(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. SIMULATION SCENARIOS (Escenarios evaluados por el algoritmo o IA)
CREATE TABLE IF NOT EXISTS public.simulation_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES public.schedule_simulations(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL,
    score NUMERIC(5,2) DEFAULT 0,
    proposed_schedule JSONB NOT NULL,
    travel_time_saved_minutes INTEGER DEFAULT 0 CHECK (travel_time_saved_minutes >= 0),
    visits_accommodated_count INTEGER DEFAULT 0 CHECK (visits_accommodated_count >= 0),
    is_recommended BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. SPECIALIST PROFILES (Red de especialistas aliados)
CREATE TABLE IF NOT EXISTS public.specialist_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    professional_card_number TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    is_external_partner BOOLEAN NOT NULL DEFAULT true,
    clinic_address TEXT,
    offers_home_service BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_specialists_updated_at
BEFORE UPDATE ON public.specialist_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. SPECIALIST SPECIALTIES
CREATE TABLE IF NOT EXISTS public.specialist_specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE CASCADE,
    specialty_name TEXT NOT NULL CHECK (specialty_name IN (
        'CARDIOLOGY', 'DERMATOLOGY', 'OPHTHALMOLOGY', 'ORTHOPEDICS', 
        'NEUROLOGY', 'ONCOLOGY', 'ODONTOLOGY', 'ULTRASONOGRAPHY', 
        'BEHAVIOR_ETHOLOGY', 'INTERNAL_MEDICINE', 'OTHER'
    )),
    accreditation_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_specialist_specialty UNIQUE (specialist_id, specialty_name)
);

-- 6. SPECIALIST AGREEMENTS (Acuerdos comerciales)
CREATE TABLE IF NOT EXISTS public.specialist_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE CASCADE,
    agreement_type TEXT NOT NULL CHECK (agreement_type IN (
        'COMMISSION_PERCENTAGE', 'FIXED_FEE_REFERRAL', 
        'INVOICED_BY_VETLIFE', 'DIRECT_CLIENT_PAYMENT'
    )),
    commission_rate NUMERIC(5,2) DEFAULT 0 CHECK (commission_rate >= 0),
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. SPECIALIST SLOT HOLDS (Bloqueo preventivo de citas con especialista)
CREATE TABLE IF NOT EXISTS public.specialist_slot_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    held_for_patient_id UUID REFERENCES public.pets(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_confirmed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_spec_hold_times CHECK (start_time < end_time)
);

-- 8. SPECIALIST BOOKING REQUESTS
CREATE TABLE IF NOT EXISTS public.specialist_booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    requested_slot_start TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED', 'CONFIRMED_BY_SPECIALIST', 'REJECTED_UNAVAILABLE', 'EXPIRED'
    )),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. SPECIALIST APPOINTMENTS
CREATE TABLE IF NOT EXISTS public.specialist_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location_type TEXT NOT NULL DEFAULT 'SPECIALIST_CLINIC' CHECK (location_type IN (
        'SPECIALIST_CLINIC', 'PATIENT_HOME', 'VETLIFE_HEADQUARTERS'
    )),
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'ATTENDED', 'CANCELLED', 'NO_SHOW')),
    clinical_notes_received BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_spec_appt_times CHECK (start_time < end_time)
);
