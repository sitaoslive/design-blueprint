-- ==============================================================================
-- Migration: 002_auth_roles_and_permissions.sql
-- Description: 11 RBAC roles, user profiles, org memberships, staff profiles,
--              staff qualifications, caregiver authorizations, and invitations.
-- Module: Module B (Autenticación y Roles)
-- Requirements: WF-009..WF-020, AT-010..AT-015
-- ==============================================================================

-- 1. ROLE ENUM FOR 11 FORMAL ROLES
DO $$ BEGIN
    CREATE TYPE public.app_role_type AS ENUM (
        'OWNER_CLIENT',        -- 1. Propietario/Cliente
        'CAREGIVER',           -- 2. Cuidador autorizado
        'VETERINARIAN',        -- 3. Veterinario
        'VET_ASSISTANT',       -- 4. Auxiliar
        'COORDINATOR',         -- 5. Coordinador
        'RECEPTION',           -- 6. Recepción
        'FINANCE',             -- 7. Finanzas
        'ADMINISTRATOR',       -- 8. Administrador
        'DIRECTOR',            -- 9. Luis/Dirección
        'TECH_SUPPORT',        -- 10. Soporte técnico
        'ALPHA_CONSULTANT'     -- 11. Consultor Alpha Vision
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USER PROFILES (Extensions of auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    document_type TEXT DEFAULT 'CC' CHECK (document_type IN ('CC', 'CE', 'NIT', 'PASSPORT', 'OTHER')),
    document_number TEXT,
    avatar_url TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'es-CO',
    timezone TEXT NOT NULL DEFAULT 'America/Bogota',
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. ORGANIZATION MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role_type NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    permissions_override JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_org_role UNIQUE (organization_id, user_id, role)
);

CREATE TRIGGER trg_org_memberships_updated_at
BEFORE UPDATE ON public.organization_memberships
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. STAFF PROFILES (Veterinarios, Auxiliares, Coordinadores, Recepción)
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    professional_card_number TEXT, -- Tarjeta profesional COMVEZCOL
    job_title TEXT NOT NULL,
    default_branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_available_for_dispatch BOOLEAN NOT NULL DEFAULT true,
    specialties TEXT[] NOT NULL DEFAULT '{}',
    working_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_staff_user_org UNIQUE (organization_id, user_id)
);

CREATE TRIGGER trg_staff_profiles_updated_at
BEFORE UPDATE ON public.staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. STAFF QUALIFICATIONS & ACCREDITATIONS
CREATE TABLE IF NOT EXISTS public.staff_qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    institution TEXT NOT NULL,
    issuing_year INTEGER CHECK (issuing_year >= 1970 AND issuing_year <= 2100),
    verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED')),
    document_url TEXT,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. CAREGIVER AUTHORIZATIONS (Delegación explícita de clientes a cuidadores)
CREATE TABLE IF NOT EXISTS public.caregiver_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    primary_owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    caregiver_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    caregiver_name TEXT NOT NULL,
    caregiver_phone TEXT NOT NULL,
    caregiver_email TEXT,
    authorization_level TEXT NOT NULL DEFAULT 'ROUTINE_ONLY' CHECK (authorization_level IN (
        'FULL',           -- Todas las decisiones no quirúrgicas
        'ROUTINE_ONLY',   -- Vacunas, desparasitación, revisiones generales
        'EMERGENCY_ONLY', -- Consentimiento en urgencia si dueño no contesta
        'READ_ONLY'       -- Solo consulta de citas y estado
    )),
    scope_limitations TEXT,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
    valid_until TIMESTAMPTZ,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_caregiver_authorizations_updated_at
BEFORE UPDATE ON public.caregiver_authorizations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. USER INVITATIONS
CREATE TABLE IF NOT EXISTS public.user_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.app_role_type NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    token_hash TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
