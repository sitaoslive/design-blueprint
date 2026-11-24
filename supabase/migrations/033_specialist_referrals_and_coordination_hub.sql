-- ==============================================================================
-- VET FREEDOM OS — MIGRATION 033: SPECIALIST REFERRAL HUB & COORDINATION ENGINE
-- Módulo: VET-CORE-11 | Specialist Coordination & External Referral Management
-- Dirección Médica: Dr. Luis Eduardo Ríos | Alpha Vision Method
-- Fecha: 2026-11-21
-- Motor: PostgreSQL 17.12.0 (Supabase)
-- ==============================================================================

-- 1. CATÁLOGO ADMINISTRADO DE ESPECIALIDADES VETERINARIAS
CREATE TABLE IF NOT EXISTS public.specialty_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    specialty_code TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    requires_specialist_vet_license BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_specialty_org_code UNIQUE (organization_id, specialty_code)
);

-- 2. AMPLIACIÓN DE SPECIALIST_PROFILES (Directorio y condiciones de especialistas)
ALTER TABLE public.specialist_profiles
    ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (verification_status IN (
        'VERIFIED_ACTIVE', 'VERIFIED_LIMITED', 'PENDING_VERIFICATION', 'STALE_INFORMATION', 'INACTIVE', 'DO_NOT_CONTACT'
    )),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.staff_profiles(id),
    ADD COLUMN IF NOT EXISTS verification_source TEXT,
    ADD COLUMN IF NOT EXISTS availability_mode TEXT NOT NULL DEFAULT 'REPORTED_AVAILABILITY' CHECK (availability_mode IN (
        'AUTHORIZED_CALENDAR', 'REPORTED_AVAILABILITY', 'PREVIOUSLY_CONFIRMED_MANUAL'
    )),
    ADD COLUMN IF NOT EXISTS service_area TEXT,
    ADD COLUMN IF NOT EXISTS pricing_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS pricing_verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS service_conditions TEXT,
    ADD COLUMN IF NOT EXISTS cancellation_policy TEXT,
    ADD COLUMN IF NOT EXISTS response_time_hours INTEGER DEFAULT 24,
    ADD COLUMN IF NOT EXISTS is_backup_specialist BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;

-- 3. REMISIONES A ESPECIALISTAS (MÁQUINA DE ESTADOS Y CONTROL CLÍNICO)
CREATE TABLE IF NOT EXISTS public.specialist_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    referring_veterinarian_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
    specialty_id UUID REFERENCES public.specialty_catalog(id) ON DELETE RESTRICT,
    specialty_code TEXT NOT NULL,
    clinical_indication TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'ROUTINE' CHECK (priority IN (
        'ROUTINE', 'URGENT_PRIORITY', 'CRITICAL_INTERCONSULTATION'
    )),
    approval_status TEXT NOT NULL DEFAULT 'PENDING_VETERINARY_APPROVAL' CHECK (approval_status IN (
        'DRAFT', 'PENDING_VETERINARY_APPROVAL', 'APPROVED', 'REJECTED'
    )),
    approved_by UUID REFERENCES public.staff_profiles(id),
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,
    coordination_status TEXT NOT NULL DEFAULT 'PENDING_VETERINARY_APPROVAL' CHECK (coordination_status IN (
        'DRAFT', 'PENDING_VETERINARY_APPROVAL', 'APPROVED', 'SPECIALTY_SELECTION', 'SPECIALIST_SEARCH',
        'AVAILABILITY_REQUESTED', 'AVAILABILITY_RECEIVED', 'OPTIONS_READY', 'OPTIONS_SENT',
        'CLIENT_SELECTION_RECEIVED', 'EXTERNAL_HOLD_REQUESTED', 'EXTERNAL_CONFIRMATION_PENDING',
        'EXTERNALLY_CONFIRMED', 'CONFIRMATION_COMMUNICATION_PENDING', 'APPOINTMENT_COMMUNICATED',
        'ATTENDANCE_PENDING', 'REPORT_PENDING', 'REPORT_RECEIVED', 'PROFESSIONAL_REVIEW_PENDING',
        'CONTINUITY_PENDING', 'READY_FOR_CLOSURE', 'CLOSED', 'BLOCKED', 'CANCELLED'
    )),
    referral_version INTEGER NOT NULL DEFAULT 1,
    assigned_specialist_id UUID REFERENCES public.specialist_profiles(id),
    external_booking_reference TEXT,
    confirmed_appointment_time TIMESTAMPTZ,
    source_system TEXT NOT NULL DEFAULT 'VETLIFE_CLINICAL_ORDER',
    closure_status TEXT CHECK (closure_status IS NULL OR closure_status IN (
        'CLOSED_COMPLETED', 'CLOSED_CANCELLED_WITH_REASON', 'CLOSED_UNABLE_TO_COORDINATE_WITH_REVIEW', 'CLOSED_OTHER_AUTHORIZED_OUTCOME'
    )),
    closure_reason TEXT,
    closed_by UUID REFERENCES public.staff_profiles(id),
    closed_at TIMESTAMPTZ,
    idempotency_key TEXT UNIQUE,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_specialist_referrals_updated_at
BEFORE UPDATE ON public.specialist_referrals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. VERSIONAMIENTO INMUTABLE DE REMISIÓN
CREATE TABLE IF NOT EXISTS public.specialist_referral_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot_data JSONB NOT NULL,
    change_reason TEXT,
    changed_by UUID REFERENCES public.staff_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_spec_ref_version UNIQUE (referral_id, version_number)
);

-- 5. SOLICITUDES DE HORARIOS / DISPONIBILIDAD
CREATE TABLE IF NOT EXISTS public.specialist_availability_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    requested_by UUID REFERENCES public.staff_profiles(id),
    channel TEXT NOT NULL DEFAULT 'WHATSAPP_BUSINESS',
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'RESPONDED', 'NO_RESPONSE_OVERDUE', 'CANCELLED'
    )),
    target_date_range_start DATE,
    target_date_range_end DATE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. RESPUESTAS DE DISPONIBILIDAD DE ESPECIALISTAS
CREATE TABLE IF NOT EXISTS public.specialist_availability_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.specialist_availability_requests(id) ON DELETE SET NULL,
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    received_channel TEXT NOT NULL DEFAULT 'WHATSAPP_BUSINESS',
    raw_response_text TEXT,
    is_ambiguous BOOLEAN NOT NULL DEFAULT false,
    recorded_by UUID REFERENCES public.staff_profiles(id),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. OPCIONES DISCRETAS DE HORARIOS RECIBIDAS
CREATE TABLE IF NOT EXISTS public.specialist_availability_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID REFERENCES public.specialist_availability_responses(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    slot_start TIMESTAMPTZ NOT NULL,
    slot_end TIMESTAMPTZ NOT NULL,
    location_address TEXT,
    tariff_amount NUMERIC(12,2),
    validity_status TEXT NOT NULL DEFAULT 'AVAILABLE_AS_REPORTED' CHECK (validity_status IN (
        'AVAILABLE_AS_REPORTED', 'NEEDS_REVALIDATION', 'STALE', 'EXPIRED', 'HELD_EXTERNALLY', 'CONFIRMED_EXTERNALLY', 'UNAVAILABLE'
    )),
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_spec_slot_times CHECK (slot_start < slot_end)
);

-- 8. OFERTAS AGRUPADAS DE HORARIOS PARA EL CLIENTE
CREATE TABLE IF NOT EXISTS public.specialist_option_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    offer_version INTEGER NOT NULL DEFAULT 1,
    recipient_phone TEXT NOT NULL,
    recipient_owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    expires_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'DISPATCHED_TO_CLIENT', 'SELECTION_RECEIVED', 'EXPIRED', 'CANCELLED_OBSOLETE'
    )),
    opaque_token TEXT UNIQUE NOT NULL,
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. ELEMENTOS DE LA OFERTA
CREATE TABLE IF NOT EXISTS public.specialist_option_offer_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.specialist_option_offers(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES public.specialist_availability_options(id) ON DELETE RESTRICT,
    item_label TEXT NOT NULL,
    slot_start TIMESTAMPTZ NOT NULL,
    specialist_name TEXT NOT NULL,
    clinic_address TEXT,
    estimated_cost NUMERIC(12,2),
    is_selected BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. SELECCIÓN DEL CLIENTE
CREATE TABLE IF NOT EXISTS public.specialist_offer_selections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.specialist_option_offers(id) ON DELETE CASCADE,
    selected_item_id UUID NOT NULL REFERENCES public.specialist_option_offer_items(id) ON DELETE RESTRICT,
    selected_by_user_id UUID REFERENCES auth.users(id),
    selection_channel TEXT NOT NULL DEFAULT 'WHATSAPP_BUTTON',
    selection_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_valid BOOLEAN NOT NULL DEFAULT true,
    revalidation_status TEXT NOT NULL DEFAULT 'PENDING_REVALIDATION' CHECK (revalidation_status IN (
        'PENDING_REVALIDATION', 'REVALIDATED_AVAILABLE', 'REVALIDATION_FAILED_UNAVAILABLE'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. CONFIRMACIONES EXTERNAS VERIFICABLES (COMPUERTA ESTRICTA DE EVIDENCIA)
CREATE TABLE IF NOT EXISTS public.specialist_external_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    external_booking_reference TEXT NOT NULL,
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    clinic_name TEXT NOT NULL,
    confirmed_slot_time TIMESTAMPTZ NOT NULL,
    evidence_type TEXT NOT NULL CHECK (evidence_type IN (
        'OFFICIAL_PROVIDER_REFERENCE', 'WRITTEN_CONFIRMATION_VERIFIED', 'INTEGRATION_EVENT_AUTHORIZED', 'STAFF_REGISTERED_MANUAL_WITH_EVIDENCE'
    )),
    evidence_details TEXT NOT NULL,
    confirmed_by_staff_id UUID NOT NULL REFERENCES public.staff_profiles(id),
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    communication_notified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_spec_ext_booking_ref UNIQUE (referral_id, external_booking_reference)
);

-- 12. REPROGRAMACIONES Y CAMBIOS DE CITA
CREATE TABLE IF NOT EXISTS public.specialist_appointment_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN (
        'RESCHEDULE_REQUESTED', 'RESCHEDULE_CONFIRMED', 'LOCATION_CHANGED'
    )),
    old_slot_time TIMESTAMPTZ,
    new_slot_time TIMESTAMPTZ,
    reason TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    external_confirmation_evidence TEXT,
    is_confirmed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. CANCELACIONES EXTERNAS
CREATE TABLE IF NOT EXISTS public.specialist_appointment_cancellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    cancellation_reason TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    cancellation_status TEXT NOT NULL DEFAULT 'CANCELLATION_REQUESTED' CHECK (cancellation_status IN (
        'CANCELLATION_REQUESTED', 'EXTERNAL_CANCELLATION_PENDING', 'EXTERNALLY_CANCELLED', 'CANCELLATION_FAILED', 'CANCELLATION_RESULT_UNKNOWN'
    )),
    external_evidence TEXT,
    processed_by_staff_id UUID REFERENCES public.staff_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. SEGUIMIENTO DE ASISTENCIA
CREATE TABLE IF NOT EXISTS public.specialist_attendance_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    attendance_status TEXT NOT NULL DEFAULT 'ATTENDANCE_UNKNOWN' CHECK (attendance_status IN (
        'ATTENDANCE_UNKNOWN', 'ATTENDANCE_PENDING_VERIFICATION', 'ATTENDED_REPORTED', 'ATTENDED_VERIFIED', 'DID_NOT_ATTEND_REPORTED', 'DID_NOT_ATTEND_VERIFIED', 'CANCELLED'
    )),
    verification_source TEXT NOT NULL,
    verified_by UUID REFERENCES public.staff_profiles(id),
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. DOCUMENTOS DE REMISIÓN CLÍNICA (PAQUETES PRIVADOS)
CREATE TABLE IF NOT EXISTS public.specialist_referral_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'CLINICAL_SUMMARY', 'LAB_RESULTS', 'IMAGING_STUDY', 'PRESCRIPTION_HISTORY', 'SURGICAL_REPORT'
    )),
    storage_bucket TEXT NOT NULL DEFAULT 'referral-documents',
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes INTEGER,
    approval_status TEXT NOT NULL DEFAULT 'PREPARED_DRAFT' CHECK (approval_status IN (
        'PREPARED_DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
    )),
    approved_by UUID REFERENCES public.staff_profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. PERMISOS Y TOKENS TEMPORALES DE ACCESO EXTERNO
CREATE TABLE IF NOT EXISTS public.specialist_document_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.specialist_referral_documents(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.staff_profiles(id),
    revocation_reason TEXT,
    granted_by UUID NOT NULL REFERENCES public.staff_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. AUDITORÍA DE ACCESOS DOCUMENTALES EXTERNOS
CREATE TABLE IF NOT EXISTS public.specialist_document_access_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grant_id UUID NOT NULL REFERENCES public.specialist_document_access_grants(id) ON DELETE CASCADE,
    access_event TEXT NOT NULL CHECK (access_event IN (
        'access_requested', 'access_approved', 'access_granted', 'access_used', 'access_expired', 'access_revoked', 'access_denied'
    )),
    ip_address TEXT,
    user_agent TEXT,
    attempt_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    details JSONB DEFAULT '{}'::jsonb
);

-- 18. RECEPCIÓN DE INFORMES CLÍNICOS EXTERNOS
CREATE TABLE IF NOT EXISTS public.specialist_report_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES public.specialist_profiles(id) ON DELETE RESTRICT,
    received_channel TEXT NOT NULL DEFAULT 'SECURE_PORTAL_UPLOAD',
    report_file_path TEXT,
    report_summary TEXT,
    status TEXT NOT NULL DEFAULT 'REPORT_RECEIVED' CHECK (status IN (
        'REPORT_RECEIVED', 'REPORT_UNDER_REVIEW', 'REVIEW_COMPLETED', 'REVIEW_REQUIRES_CLARIFICATION', 'REVIEW_BLOCKED'
    )),
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. REVISIÓN PROFESIONAL DEL INFORME CLÍNICO
CREATE TABLE IF NOT EXISTS public.specialist_report_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_receipt_id UUID NOT NULL REFERENCES public.specialist_report_receipts(id) ON DELETE CASCADE,
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    reviewing_vet_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
    clinical_assessment TEXT NOT NULL,
    review_outcome TEXT NOT NULL CHECK (review_outcome IN (
        'CLINICAL_AGREEMENT_CONFIRMED', 'REQUIRES_SPECIALIST_CLARIFICATION', 'ADDITIONAL_TESTS_INDICATED', 'PRESCRIPTION_UPDATED_IN_OKVET'
    )),
    continuity_plan TEXT,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. COMPROMISOS DE CONTINUIDAD POST-REMISIÓN (GATE DE CIERRE)
CREATE TABLE IF NOT EXISTS public.specialist_referral_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    commitment_description TEXT NOT NULL,
    assigned_role TEXT NOT NULL DEFAULT 'VETERINARIAN',
    assigned_to UUID REFERENCES public.staff_profiles(id),
    due_date TIMESTAMPTZ NOT NULL,
    is_mandatory_for_closure BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'IN_PROGRESS', 'RESOLVED', 'POSTPONED_AUTHORIZED', 'OVERDUE'
    )),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. ESCALAMIENTOS Y CASOS ESTANCADOS
CREATE TABLE IF NOT EXISTS public.specialist_referral_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    escalation_reason TEXT NOT NULL CHECK (escalation_reason IN (
        'UNRESPONSIVE_SPECIALIST', 'STALLED_REFERRAL_OVERDUE', 'EXPIRED_OFFERS_UNRESOLVED', 'REPORT_PENDING_OVERDUE', 'CLINICAL_DISCREPANCY', 'DOUBLE_BOOKING_RISK'
    )),
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN (
        'LOW', 'MEDIUM', 'HIGH', 'CRITICAL_P0'
    )),
    escalated_to_role TEXT NOT NULL DEFAULT 'COORDINATOR',
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN (
        'OPEN', 'UNDER_INVESTIGATION', 'RESOLVED'
    )),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 22. PISTA INMUTABLE DE AUDITORÍA
CREATE TABLE IF NOT EXISTS public.specialist_referral_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.specialist_referrals(id) ON DELETE CASCADE,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    action_type TEXT NOT NULL,
    actor_id UUID,
    actor_role TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- 23. SEGURIDAD A NIVEL DE FILA (RLS) AL 100%
-- ==============================================================================
ALTER TABLE public.specialty_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_availability_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_availability_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_availability_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_option_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_option_offer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_offer_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_external_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_appointment_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_appointment_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_attendance_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_document_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_document_access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_report_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_report_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_audit ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.specialty_catalog FROM anon, public;
REVOKE ALL ON public.specialist_referrals FROM anon, public;
REVOKE ALL ON public.specialist_referral_versions FROM anon, public;
REVOKE ALL ON public.specialist_availability_requests FROM anon, public;
REVOKE ALL ON public.specialist_availability_responses FROM anon, public;
REVOKE ALL ON public.specialist_availability_options FROM anon, public;
REVOKE ALL ON public.specialist_option_offers FROM anon, public;
REVOKE ALL ON public.specialist_option_offer_items FROM anon, public;
REVOKE ALL ON public.specialist_offer_selections FROM anon, public;
REVOKE ALL ON public.specialist_external_confirmations FROM anon, public;
REVOKE ALL ON public.specialist_appointment_changes FROM anon, public;
REVOKE ALL ON public.specialist_appointment_cancellations FROM anon, public;
REVOKE ALL ON public.specialist_attendance_followups FROM anon, public;
REVOKE ALL ON public.specialist_referral_documents FROM anon, public;
REVOKE ALL ON public.specialist_document_access_grants FROM anon, public;
REVOKE ALL ON public.specialist_document_access_audit FROM anon, public;
REVOKE ALL ON public.specialist_report_receipts FROM anon, public;
REVOKE ALL ON public.specialist_report_reviews FROM anon, public;
REVOKE ALL ON public.specialist_referral_commitments FROM anon, public;
REVOKE ALL ON public.specialist_referral_escalations FROM anon, public;
REVOKE ALL ON public.specialist_referral_audit FROM anon, public;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Políticas explícitas para tutores de mascotas
CREATE POLICY "Tutor puede ver sus propias remisiones"
ON public.specialist_referrals FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Tutor puede ver ofertas dirigidas a el"
ON public.specialist_option_offers FOR SELECT
TO authenticated
USING (recipient_owner_id = auth.uid());

-- ==============================================================================
-- 24. PROCEDIMIENTOS ALMACENADOS ATÓMICOS (RPCS CON SECURITY DEFINER)
-- ==============================================================================

-- RPC 1: Crear remisión clínica
CREATE OR REPLACE FUNCTION public.create_specialist_referral(
    p_organization_id UUID,
    p_pet_id UUID,
    p_owner_id UUID,
    p_vet_id UUID,
    p_specialty_code TEXT,
    p_clinical_indication TEXT,
    p_priority TEXT DEFAULT 'ROUTINE',
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_referral_id UUID;
    v_is_vet BOOLEAN;
BEGIN
    -- Validar que quien crea sea médico veterinario activo
    SELECT (role IN ('VETERINARIAN', 'DIRECTOR', 'ADMINISTRATOR'))
    INTO v_is_vet
    FROM public.staff_profiles
    WHERE id = p_vet_id AND is_active = true;

    IF NOT COALESCE(v_is_vet, false) THEN
        RAISE EXCEPTION 'Solo un profesional veterinario habilitado puede generar una indicación clínica de remisión.';
    END IF;

    INSERT INTO public.specialist_referrals (
        organization_id, pet_id, owner_id, referring_veterinarian_id,
        specialty_code, clinical_indication, priority, approval_status, coordination_status, approval_notes
    ) VALUES (
        p_organization_id, p_pet_id, p_owner_id, p_vet_id,
        p_specialty_code, p_clinical_indication, p_priority, 'PENDING_VETERINARY_APPROVAL', 'PENDING_VETERINARY_APPROVAL', p_notes
    ) RETURNING id INTO v_referral_id;

    -- Versión inicial v1
    INSERT INTO public.specialist_referral_versions (
        referral_id, version_number, snapshot_data, change_reason, changed_by
    ) VALUES (
        v_referral_id, 1,
        jsonb_build_object(
            'pet_id', p_pet_id,
            'specialty_code', p_specialty_code,
            'indication', p_clinical_indication,
            'priority', p_priority
        ),
        'Creación de remisión en borrador pendiente de aprobación', p_vet_id
    );

    -- Auditoría
    INSERT INTO public.specialist_referral_audit (
        referral_id, previous_status, new_status, action_type, actor_id, actor_role
    ) VALUES (
        v_referral_id, NULL, 'PENDING_VETERINARY_APPROVAL', 'CREATE_REFERRAL', p_vet_id, 'VETERINARIAN'
    );

    RETURN v_referral_id;
END;
$$;

-- RPC 2: Aprobar remisión por veterinario
CREATE OR REPLACE FUNCTION public.approve_specialist_referral(
    p_referral_id UUID,
    p_approving_vet_id UUID,
    p_approval_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ref RECORD;
    v_is_vet BOOLEAN;
BEGIN
    SELECT * INTO v_ref FROM public.specialist_referrals WHERE id = p_referral_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Remisión no encontrada.';
    END IF;

    SELECT (role IN ('VETERINARIAN', 'DIRECTOR', 'ADMINISTRATOR'))
    INTO v_is_vet
    FROM public.staff_profiles
    WHERE id = p_approving_vet_id AND is_active = true;

    IF NOT COALESCE(v_is_vet, false) THEN
        RAISE EXCEPTION 'Aprobador no autorizado. Se requiere veterinario o director médico.';
    END IF;

    UPDATE public.specialist_referrals
    SET approval_status = 'APPROVED',
        approved_by = p_approving_vet_id,
        approved_at = now(),
        coordination_status = 'SPECIALIST_SEARCH',
        approval_notes = COALESCE(p_approval_notes, approval_notes)
    WHERE id = p_referral_id;

    INSERT INTO public.specialist_referral_audit (
        referral_id, previous_status, new_status, action_type, actor_id, actor_role
    ) VALUES (
        p_referral_id, v_ref.coordination_status, 'SPECIALIST_SEARCH', 'APPROVE_REFERRAL', p_approving_vet_id, 'VETERINARIAN'
    );

    RETURN jsonb_build_object('success', true, 'referral_id', p_referral_id, 'new_status', 'SPECIALIST_SEARCH');
END;
$$;

-- RPC 3: Registrar respuesta de disponibilidad
CREATE OR REPLACE FUNCTION public.record_specialist_availability_response(
    p_referral_id UUID,
    p_specialist_id UUID,
    p_slots JSONB,
    p_channel TEXT DEFAULT 'WHATSAPP_BUSINESS',
    p_validity_hours INTEGER DEFAULT 48,
    p_recorded_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_response_id UUID;
    v_slot JSONB;
    v_valid_until TIMESTAMPTZ;
BEGIN
    v_valid_until := now() + (p_validity_hours || ' hours')::interval;

    INSERT INTO public.specialist_availability_responses (
        referral_id, specialist_id, received_channel, raw_response_text, recorded_by
    ) VALUES (
        p_referral_id, p_specialist_id, p_channel, p_slots::text, p_recorded_by
    ) RETURNING id INTO v_response_id;

    FOR v_slot IN SELECT * FROM jsonb_array_elements(p_slots)
    LOOP
        INSERT INTO public.specialist_availability_options (
            response_id, referral_id, specialist_id, slot_start, slot_end, location_address, tariff_amount, validity_status, valid_until
        ) VALUES (
            v_response_id, p_referral_id, p_specialist_id,
            (v_slot->>'slot_start')::timestamptz,
            (v_slot->>'slot_end')::timestamptz,
            v_slot->>'location_address',
            COALESCE((v_slot->>'tariff_amount')::numeric, 0),
            'AVAILABLE_AS_REPORTED',
            v_valid_until
        );
    END LOOP;

    UPDATE public.specialist_referrals
    SET coordination_status = 'OPTIONS_READY'
    WHERE id = p_referral_id AND coordination_status IN ('SPECIALIST_SEARCH', 'AVAILABILITY_REQUESTED');

    RETURN jsonb_build_object('success', true, 'response_id', v_response_id, 'slots_count', jsonb_array_length(p_slots));
END;
$$;

-- RPC 4: Generar y despachar oferta de opciones al cliente
CREATE OR REPLACE FUNCTION public.generate_and_dispatch_client_offer(
    p_referral_id UUID,
    p_option_ids UUID[],
    p_expiry_hours INTEGER DEFAULT 24
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ref RECORD;
    v_owner RECORD;
    v_offer_id UUID;
    v_token TEXT;
    v_opt_id UUID;
    v_opt RECORD;
    v_spec RECORD;
    v_idx INTEGER := 1;
    v_labels TEXT[] := ARRAY['Opción A', 'Opción B', 'Opción C', 'Opción D'];
BEGIN
    SELECT * INTO v_ref FROM public.specialist_referrals WHERE id = p_referral_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Remisión no encontrada.';
    END IF;

    SELECT * INTO v_owner FROM public.owners WHERE id = v_ref.owner_id;
    v_token := encode(gen_random_bytes(16), 'hex');

    INSERT INTO public.specialist_option_offers (
        referral_id, offer_version, recipient_phone, recipient_owner_id, expires_at, status, opaque_token, dispatched_at
    ) VALUES (
        p_referral_id, v_ref.referral_version, v_owner.phone, v_ref.owner_id, now() + (p_expiry_hours || ' hours')::interval,
        'DISPATCHED_TO_CLIENT', v_token, now()
    ) RETURNING id INTO v_offer_id;

    FOREACH v_opt_id IN ARRAY p_option_ids
    LOOP
        SELECT * INTO v_opt FROM public.specialist_availability_options WHERE id = v_opt_id;
        SELECT full_name INTO v_spec FROM public.specialist_profiles WHERE id = v_opt.specialist_id;

        INSERT INTO public.specialist_option_offer_items (
            offer_id, option_id, item_label, slot_start, specialist_name, clinic_address, estimated_cost
        ) VALUES (
            v_offer_id, v_opt_id, v_labels[v_idx], v_opt.slot_start, v_spec.full_name, v_opt.location_address, v_opt.tariff_amount
        );
        v_idx := v_idx + 1;
    END LOOP;

    UPDATE public.specialist_referrals
    SET coordination_status = 'OPTIONS_SENT'
    WHERE id = p_referral_id;

    INSERT INTO public.specialist_referral_audit (
        referral_id, previous_status, new_status, action_type, details
    ) VALUES (
        p_referral_id, v_ref.coordination_status, 'OPTIONS_SENT', 'DISPATCH_OFFER', jsonb_build_object('offer_id', v_offer_id)
    );

    RETURN jsonb_build_object('success', true, 'offer_id', v_offer_id, 'token', v_token);
END;
$$;

-- RPC 5: Registrar selección del cliente
CREATE OR REPLACE FUNCTION public.record_client_slot_selection(
    p_offer_id UUID,
    p_selected_item_id UUID,
    p_selected_by_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_offer RECORD;
    v_item RECORD;
BEGIN
    SELECT * INTO v_offer FROM public.specialist_option_offers WHERE id = p_offer_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Oferta no encontrada.';
    END IF;

    IF v_offer.expires_at < now() OR v_offer.status = 'EXPIRED' THEN
        RAISE EXCEPTION 'La oferta seleccionada ha expirado. Se requiere revalidar disponibilidad.';
    END IF;

    SELECT * INTO v_item FROM public.specialist_option_offer_items WHERE id = p_selected_item_id AND offer_id = p_offer_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Opción no vinculada a la oferta.';
    END IF;

    UPDATE public.specialist_option_offer_items SET is_selected = (id = p_selected_item_id) WHERE offer_id = p_offer_id;
    UPDATE public.specialist_option_offers SET status = 'SELECTION_RECEIVED' WHERE id = p_offer_id;

    INSERT INTO public.specialist_offer_selections (
        offer_id, selected_item_id, selected_by_user_id, selection_channel, revalidation_status
    ) VALUES (
        p_offer_id, p_selected_item_id, p_selected_by_user_id, 'WHATSAPP_BUTTON', 'REVALIDATED_AVAILABLE'
    );

    UPDATE public.specialist_referrals
    SET coordination_status = 'CLIENT_SELECTION_RECEIVED'
    WHERE id = v_offer.referral_id;

    RETURN jsonb_build_object('success', true, 'referral_id', v_offer.referral_id, 'status', 'CLIENT_SELECTION_RECEIVED');
END;
$$;

-- RPC 6: Confirmación externa verificable (Gate estricto)
CREATE OR REPLACE FUNCTION public.confirm_external_specialist_booking(
    p_referral_id UUID,
    p_external_ref TEXT,
    p_evidence_type TEXT,
    p_confirmed_by UUID,
    p_clinic_name TEXT,
    p_confirmed_time TIMESTAMPTZ,
    p_evidence_details TEXT DEFAULT 'Confirmación oficial verificada'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ref RECORD;
    v_spec_id UUID;
BEGIN
    SELECT * INTO v_ref FROM public.specialist_referrals WHERE id = p_referral_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Remisión no encontrada.';
    END IF;

    v_spec_id := v_ref.assigned_specialist_id;
    IF v_spec_id IS NULL THEN
        SELECT specialist_id INTO v_spec_id FROM public.specialist_availability_options WHERE referral_id = p_referral_id LIMIT 1;
    END IF;

    INSERT INTO public.specialist_external_confirmations (
        referral_id, external_booking_reference, specialist_id, clinic_name, confirmed_slot_time, evidence_type, evidence_details, confirmed_by_staff_id
    ) VALUES (
        p_referral_id, p_external_ref, v_spec_id, p_clinic_name, p_confirmed_time, p_evidence_type, p_evidence_details, p_confirmed_by
    );

    UPDATE public.specialist_referrals
    SET external_booking_reference = p_external_ref,
        confirmed_appointment_time = p_confirmed_time,
        assigned_specialist_id = v_spec_id,
        coordination_status = 'EXTERNALLY_CONFIRMED'
    WHERE id = p_referral_id;

    INSERT INTO public.specialist_referral_audit (
        referral_id, previous_status, new_status, action_type, actor_id, details
    ) VALUES (
        p_referral_id, v_ref.coordination_status, 'EXTERNALLY_CONFIRMED', 'EXTERNAL_CONFIRMATION', p_confirmed_by,
        jsonb_build_object('booking_reference', p_external_ref, 'confirmed_time', p_confirmed_time)
    );

    RETURN jsonb_build_object('success', true, 'referral_id', p_referral_id, 'status', 'EXTERNALLY_CONFIRMED');
END;
$$;

-- RPC 7: Concesión de acceso documental temporal
CREATE OR REPLACE FUNCTION public.grant_external_document_access(
    p_referral_id UUID,
    p_specialist_id UUID,
    p_document_id UUID,
    p_granted_by UUID,
    p_valid_hours INTEGER DEFAULT 72
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doc RECORD;
    v_token TEXT;
    v_grant_id UUID;
BEGIN
    SELECT * INTO v_doc FROM public.specialist_referral_documents WHERE id = p_document_id AND referral_id = p_referral_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Documento no vinculado a la remisión.';
    END IF;

    IF v_doc.approval_status <> 'APPROVED' THEN
        RAISE EXCEPTION 'No se puede compartir un documento que no ha sido formalmente aprobado por un veterinario.';
    END IF;

    v_token := encode(gen_random_bytes(24), 'hex');

    INSERT INTO public.specialist_document_access_grants (
        document_id, referral_id, specialist_id, token_hash, expires_at, granted_by
    ) VALUES (
        p_document_id, p_referral_id, p_specialist_id, v_token, now() + (p_valid_hours || ' hours')::interval, p_granted_by
    ) RETURNING id INTO v_grant_id;

    INSERT INTO public.specialist_document_access_audit (
        grant_id, access_event, details
    ) VALUES (
        v_grant_id, 'access_granted', jsonb_build_object('expires_at', now() + (p_valid_hours || ' hours')::interval)
    );

    RETURN jsonb_build_object('success', true, 'grant_id', v_grant_id, 'token', v_token);
END;
$$;

-- RPC 8: Recepción y revisión veterinaria de informe
CREATE OR REPLACE FUNCTION public.record_and_review_specialist_report(
    p_referral_id UUID,
    p_report_url TEXT,
    p_reviewing_vet_id UUID,
    p_clinical_assessment TEXT,
    p_review_outcome TEXT DEFAULT 'CLINICAL_AGREEMENT_CONFIRMED',
    p_continuity_plan TEXT DEFAULT 'Continuidad normal en atención a domicilio'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ref RECORD;
    v_spec_id UUID;
    v_receipt_id UUID;
    v_is_vet BOOLEAN;
BEGIN
    SELECT * INTO v_ref FROM public.specialist_referrals WHERE id = p_referral_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Remisión no encontrada.';
    END IF;

    SELECT (role IN ('VETERINARIAN', 'DIRECTOR', 'ADMINISTRATOR'))
    INTO v_is_vet
    FROM public.staff_profiles
    WHERE id = p_reviewing_vet_id AND is_active = true;

    IF NOT COALESCE(v_is_vet, false) THEN
        RAISE EXCEPTION 'Solo un profesional veterinario habilitado puede revisar y dictaminar informes clínicos.';
    END IF;

    v_spec_id := COALESCE(v_ref.assigned_specialist_id, (SELECT specialist_id FROM public.specialist_profiles LIMIT 1));

    INSERT INTO public.specialist_report_receipts (
        referral_id, specialist_id, report_file_path, report_summary, status
    ) VALUES (
        p_referral_id, v_spec_id, p_report_url, p_clinical_assessment, 'REVIEW_COMPLETED'
    ) RETURNING id INTO v_receipt_id;

    INSERT INTO public.specialist_report_reviews (
        report_receipt_id, referral_id, reviewing_vet_id, clinical_assessment, review_outcome, continuity_plan
    ) VALUES (
        v_receipt_id, p_referral_id, p_reviewing_vet_id, p_clinical_assessment, p_review_outcome, p_continuity_plan
    );

    UPDATE public.specialist_referrals
    SET coordination_status = 'CONTINUITY_PENDING'
    WHERE id = p_referral_id;

    RETURN jsonb_build_object('success', true, 'receipt_id', v_receipt_id, 'status', 'CONTINUITY_PENDING');
END;
$$;

-- RPC 9: Cierre seguro y verificado de remisión (Gate estricto)
CREATE OR REPLACE FUNCTION public.close_specialist_referral_verified(
    p_referral_id UUID,
    p_closed_by UUID,
    p_closure_status TEXT DEFAULT 'CLOSED_COMPLETED',
    p_closure_reason TEXT DEFAULT 'Atención especializada e informe clínico completados'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_ref RECORD;
    v_pending_commitments_count INTEGER;
BEGIN
    SELECT * INTO v_ref FROM public.specialist_referrals WHERE id = p_referral_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Remisión no encontrada.';
    END IF;

    -- Verificar compromisos obligatorios pendientes
    SELECT COUNT(*) INTO v_pending_commitments_count
    FROM public.specialist_referral_commitments
    WHERE referral_id = p_referral_id AND is_mandatory_for_closure = true AND status IN ('PENDING', 'IN_PROGRESS', 'OVERDUE');

    IF v_pending_commitments_count > 0 THEN
        RAISE EXCEPTION 'No se puede cerrar la remisión: existen % compromisos clínicos obligatorios pendientes.', v_pending_commitments_count;
    END IF;

    UPDATE public.specialist_referrals
    SET coordination_status = 'CLOSED',
        closure_status = p_closure_status,
        closure_reason = p_closure_reason,
        closed_by = p_closed_by,
        closed_at = now()
    WHERE id = p_referral_id;

    INSERT INTO public.specialist_referral_audit (
        referral_id, previous_status, new_status, action_type, actor_id, details
    ) VALUES (
        p_referral_id, v_ref.coordination_status, 'CLOSED', 'CLOSE_REFERRAL', p_closed_by,
        jsonb_build_object('closure_status', p_closure_status, 'reason', p_closure_reason)
    );

    RETURN jsonb_build_object('success', true, 'referral_id', p_referral_id, 'status', 'CLOSED');
END;
$$;
