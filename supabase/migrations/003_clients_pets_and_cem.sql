-- ==============================================================================
-- Migration: 003_clients_pets_and_cem.sql
-- Description: Owners, pets, addresses, consents, Customer Experience Memory (CEM),
--              bereavement suppression records, contact restrictions, and complaints.
-- Module: Module C (Clientes, Mascotas y Customer Experience Memory)
-- Requirements: WF-021..WF-036, AT-016..AT-025
-- ==============================================================================

-- 1. OWNERS / CLIENTS
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable para prospectos o pre-registro telefónico
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    document_type TEXT DEFAULT 'CC' CHECK (document_type IN ('CC', 'CE', 'NIT', 'PASSPORT', 'OTHER')),
    document_number TEXT,
    primary_phone TEXT NOT NULL,
    secondary_phone TEXT,
    email TEXT,
    is_vip BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED', 'DECEASED_CLIENT')),
    communication_channel_preference TEXT NOT NULL DEFAULT 'WHATSAPP' CHECK (communication_channel_preference IN ('WHATSAPP', 'PHONE', 'EMAIL', 'SMS')),
    notes TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_owners_updated_at
BEFORE UPDATE ON public.owners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. ADDRESSES (Soporta domicilios múltiples: casa, oficina, finca)
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Casa',
    address_line TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Bogotá',
    neighborhood TEXT,
    postal_code TEXT,
    access_instructions TEXT, -- Conjunto, torre, apartamento, instrucciones para el vehículo
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_primary BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_addresses_updated_at
BEFORE UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. PETS
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    primary_owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    species TEXT NOT NULL CHECK (species IN ('CANINE', 'FELINE', 'OTHER')),
    breed TEXT,
    sex TEXT NOT NULL CHECK (sex IN ('MALE', 'FEMALE', 'UNKNOWN')),
    is_neutered BOOLEAN NOT NULL DEFAULT false,
    birth_date DATE,
    approximate_age_months INTEGER CHECK (approximate_age_months >= 0),
    color TEXT,
    microchip_number TEXT,
    weight_kg NUMERIC(5,2) CHECK (weight_kg > 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DECEASED', 'RELOCATED', 'INACTIVE')),
    temperament TEXT DEFAULT 'FRIENDLY' CHECK (temperament IN ('FRIENDLY', 'NERVOUS', 'AGGRESSIVE', 'REQUIRES_MUZZLE', 'FEARFUL')),
    special_handling_notes TEXT,
    is_temperament_warning BOOLEAN NOT NULL DEFAULT false,
    okvet_patient_id TEXT, -- Referencia externa si fue importado
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_pets_updated_at
BEFORE UPDATE ON public.pets
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. PET OWNER RELATIONS (Cotitulares y cuidadores secundarios)
CREATE TABLE IF NOT EXISTS public.pet_owner_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL DEFAULT 'CO_OWNER' CHECK (relation_type IN ('PRIMARY', 'CO_OWNER', 'FAMILY_MEMBER', 'CAREGIVER')),
    is_authorized_decision_maker BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_pet_owner_relation UNIQUE (pet_id, owner_id)
);

-- 5. CONSENTS (Habeas Data, Sedación, Procedimientos)
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    consent_type TEXT NOT NULL CHECK (consent_type IN (
        'TERMS_OF_SERVICE', 'DATA_PROCESSING_HABEAS_DATA', 
        'PROCEDURE_SEDATION', 'EUTHANASIA', 'HOME_VISIT_PROTOCOL', 'MARKETING'
    )),
    consent_text_version TEXT NOT NULL,
    is_granted BOOLEAN NOT NULL DEFAULT true,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,
    ip_address TEXT,
    signature_url TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. CUSTOMER EXPERIENCE MEMORY (CEM)
CREATE TABLE IF NOT EXISTS public.customer_experience_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN (
        'PERSONAL_PREFERENCE', 'COMMUNICATION_STYLE', 'PET_HABIT', 
        'HOME_ACCESS_TIP', 'FAMILY_CONTEXT', 'EMOTIONAL_SENSITIVITY', 
        'PAST_INCIDENT', 'TREATMENT_TOLERANCE'
    )),
    observation TEXT NOT NULL,
    importance_level TEXT NOT NULL DEFAULT 'NORMAL' CHECK (importance_level IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
    source_type TEXT NOT NULL CHECK (source_type IN ('STAFF_OBSERVATION', 'CLIENT_STATED', 'WHATSAPP_INTERACTION', 'POST_VISIT_REPORT')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_verified BOOLEAN NOT NULL DEFAULT true,
    verified_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_cem_updated_at
BEFORE UPDATE ON public.customer_experience_memory
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. BEREAVEMENT RECORDS (Duelo y supresión de comunicaciones)
CREATE TABLE IF NOT EXISTS public.bereavement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    deceased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    cause_of_death TEXT,
    is_euthanasia BOOLEAN NOT NULL DEFAULT false,
    suppress_marketing_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 year'),
    suppress_reminders BOOLEAN NOT NULL DEFAULT true,
    condolence_card_sent BOOLEAN NOT NULL DEFAULT false,
    condolence_card_sent_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_bereavement_updated_at
BEFORE UPDATE ON public.bereavement_records
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. CONTACT RESTRICTIONS (No molestar / Opt-outs)
CREATE TABLE IF NOT EXISTS public.contact_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    do_not_disturb_start TIME,
    do_not_disturb_end TIME,
    opt_out_marketing BOOLEAN NOT NULL DEFAULT false,
    opt_out_all_automated BOOLEAN NOT NULL DEFAULT false,
    restriction_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. CLIENT COMPLAINTS & INCIDENTS
CREATE TABLE IF NOT EXISTS public.client_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    incident_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    category TEXT NOT NULL CHECK (category IN ('DELAY', 'ATTENTION_QUALITY', 'BILLING', 'COMMUNICATION', 'CLINICAL', 'OTHER')),
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED_ESCALATED')),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_complaints_updated_at
BEFORE UPDATE ON public.client_complaints
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
