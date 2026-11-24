-- ==============================================================================
-- Migration: 007_recurring_care_and_prevention.sql
-- Description: Recurring treatment plans, occurrences, preventive due dates,
--              preventive health plans, and clinical safety constraints.
-- Module: Module I (Tratamientos Recurrentes) y Módulo J (Prevención)
-- Requirements: WF2-029..WF2-042, AT2-026..AT2-038
-- ==============================================================================

-- 1. RECURRENCE TEMPLATES
CREATE TABLE IF NOT EXISTS public.recurrence_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    frequency_unit TEXT NOT NULL CHECK (frequency_unit IN ('DAYS', 'WEEKS', 'MONTHS', 'YEARS')),
    frequency_interval INTEGER NOT NULL DEFAULT 1 CHECK (frequency_interval > 0),
    total_occurrences INTEGER CHECK (total_occurrences > 0), -- NULL = indefinido
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_recurrence_tpl_updated_at
BEFORE UPDATE ON public.recurrence_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. RECURRING TREATMENT PLANS (Planes de tratamiento crónico o seriado)
CREATE TABLE IF NOT EXISTS public.recurring_treatment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    template_id UUID REFERENCES public.recurrence_templates(id) ON DELETE SET NULL,
    diagnosis_title TEXT NOT NULL,
    prescribing_veterinarian_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE,
    total_prescribed_sessions INTEGER NOT NULL DEFAULT 1 CHECK (total_prescribed_sessions > 0),
    completed_sessions_count INTEGER NOT NULL DEFAULT 0 CHECK (completed_sessions_count >= 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'DISCONTINUED_CLINICAL')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_plan_sessions CHECK (completed_sessions_count <= total_prescribed_sessions)
);

CREATE TRIGGER trg_treatment_plans_updated_at
BEFORE UPDATE ON public.recurring_treatment_plans
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. RECURRING VISIT OCCURRENCES (Sesiones individuales planificadas)
CREATE TABLE IF NOT EXISTS public.recurring_visit_occurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.recurring_treatment_plans(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL CHECK (session_number > 0),
    target_date DATE NOT NULL,
    window_start_date DATE NOT NULL,
    window_end_date DATE NOT NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_SCHEDULING' CHECK (status IN (
        'PENDING_SCHEDULING', 'SCHEDULED', 'COMPLETED', 'SKIPPED_CLINICAL', 'RESCHEDULED'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_plan_session UNIQUE (plan_id, session_number),
    CONSTRAINT chk_window_dates CHECK (window_start_date <= target_date AND target_date <= window_end_date)
);

-- 4. PREVENTIVE CARE PLANS
CREATE TABLE IF NOT EXISTS public.preventive_care_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL CHECK (plan_type IN (
        'PUPPY_KITTEN_ESSENTIALS', 'ANNUAL_ADULT_PREVENTION', 
        'SENIOR_CARE_GOLD', 'CUSTOM'
    )),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RENEWED', 'EXPIRED', 'CANCELLED')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_prev_plan_dates CHECK (start_date < end_date)
);

-- 5. PREVENTIVE DUE DATES (Alertas de vencimiento de vacunas y desparasitación)
CREATE TABLE IF NOT EXISTS public.preventive_due_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    preventive_type TEXT NOT NULL CHECK (preventive_type IN (
        'RABIES_VACCINE', 'POLYVALENT_VACCINE', 'FELINE_TRIPLE', 
        'INTERNAL_DEWORMING', 'EXTERNAL_ANTIPARASITIC', 
        'DENTAL_PROPHYLAXIS', 'GERIATRIC_CHECKUP'
    )),
    last_applied_date DATE,
    due_date DATE NOT NULL,
    reminder_lead_days INTEGER NOT NULL DEFAULT 7 CHECK (reminder_lead_days >= 0),
    reminder_sent_count INTEGER NOT NULL DEFAULT 0,
    last_reminder_sent_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'NOTIFIED', 'SCHEDULED', 'OVERDUE', 'APPLIED', 'WAIVED_CONTRAINDICATION'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_preventive_due_updated_at
BEFORE UPDATE ON public.preventive_due_dates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. CLINICAL SAFETY CONSTRAINTS (Reglas biológicas ineludibles)
CREATE TABLE IF NOT EXISTS public.clinical_constraints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    constraint_code TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('CANINE', 'FELINE', 'ALL')),
    description TEXT NOT NULL,
    min_interval_days_between_vaccines INTEGER NOT NULL DEFAULT 15 CHECK (min_interval_days_between_vaccines >= 0),
    min_age_weeks_for_rabies INTEGER NOT NULL DEFAULT 12 CHECK (min_age_weeks_for_rabies >= 0),
    is_strict_block BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_clinical_constraint_code UNIQUE (organization_id, constraint_code)
);
