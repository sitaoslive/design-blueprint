-- ==============================================================================
-- Migration: 001_extensions_and_core_config.sql
-- Description: Core extensions, organizations, branches, services, tariffs,
--              operating hours, non-working days, and system settings.
-- Module: Module A (Organizaciones y Configuración)
-- Requirements: WF-001..WF-008, Core Tenant Isolation
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. HELPER FUNCTION: update_timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ORGANIZATIONS (Multi-tenant Root)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    tax_id TEXT,
    slug TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    timezone TEXT NOT NULL DEFAULT 'America/Bogota',
    default_currency TEXT NOT NULL DEFAULT 'COP',
    contact_phone TEXT,
    contact_email TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. BRANCHES / OPERATING ZONES
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    city TEXT NOT NULL DEFAULT 'Bogotá',
    coverage_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_branches_org_code UNIQUE (organization_id, code)
);

CREATE TRIGGER trg_branches_updated_at
BEFORE UPDATE ON public.branches
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_system_settings_org_key UNIQUE (organization_id, key)
);

CREATE TRIGGER trg_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. SERVICES CATALOG
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'CONSULTATION', 'VACCINATION', 'DEWORMING', 'PROCEDURE', 
        'LABORATORY', 'SPECIALIST_REFERRAL', 'EMERGENCY_TRIAGE', 
        'EUTHANASIA', 'OTHER'
    )),
    duration_minutes INTEGER NOT NULL DEFAULT 45 CHECK (duration_minutes > 0),
    buffer_before_minutes INTEGER NOT NULL DEFAULT 15 CHECK (buffer_before_minutes >= 0),
    buffer_after_minutes INTEGER NOT NULL DEFAULT 15 CHECK (buffer_after_minutes >= 0),
    requires_veterinarian BOOLEAN NOT NULL DEFAULT true,
    is_domiciliary BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_services_org_code UNIQUE (organization_id, code)
);

CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. TARIFFS (Tarifas en COP)
CREATE TABLE IF NOT EXISTS public.tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'COP' CHECK (currency = 'COP'),
    base_price NUMERIC(14,2) NOT NULL CHECK (base_price >= 0),
    domiciliary_surcharge NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (domiciliary_surcharge >= 0),
    emergency_surcharge NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (emergency_surcharge >= 0),
    weekend_surcharge NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (weekend_surcharge >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_tariffs_updated_at
BEFORE UPDATE ON public.tariffs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. OPERATING HOURS
CREATE TABLE IF NOT EXISTS public.operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_operating_hours_times CHECK (open_time < close_time)
);

-- 9. NON WORKING DAYS / HOLIDAYS
CREATE TABLE IF NOT EXISTS public.non_working_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    holiday_date DATE NOT NULL,
    description TEXT NOT NULL,
    is_recurring_annual BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_non_working_days UNIQUE (organization_id, branch_id, holiday_date)
);
