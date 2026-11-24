-- ==============================================================================
-- Migration: 011_commitments_and_customer_experience.sql
-- Description: Patient referrals, medical director approvals, referral documents,
--              post-visit commitments, reminders, and customer satisfaction surveys (NPS).
-- Module: Module O (Remisiones), Módulo P (Compromisos) y Módulo Q (Experiencia)
-- Requirements: WF3-029..WF3-056, AT3-026..AT3-060
-- ==============================================================================

-- 1. PATIENT REFERRALS (Remisiones a especialistas aliados)
CREATE TABLE IF NOT EXISTS public.patient_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    originating_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    referring_veterinarian_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
    specialty_requested TEXT NOT NULL,
    target_specialist_id UUID REFERENCES public.specialist_profiles(id) ON DELETE SET NULL,
    clinical_reason TEXT NOT NULL,
    triage_priority TEXT NOT NULL DEFAULT 'ROUTINE' CHECK (triage_priority IN (
        'ROUTINE', 'PRIORITY_48H', 'URGENT_24H', 'EMERGENCY_IMMEDIATE'
    )),
    status TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status IN (
        'PROPOSED', 'APPROVED_BY_DIRECTOR', 'REJECTED', 
        'OFFERED_TO_CLIENT', 'ACCEPTED_BY_CLIENT', 
        'SCHEDULED_SPECIALIST', 'ATTENDED', 
        'COUNTER_REFERRAL_RECEIVED', 'CLOSED'
    )),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_referrals_updated_at
BEFORE UPDATE ON public.patient_referrals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. REFERRAL APPROVALS (Aprobación formal de remisiones por Dirección / Dr. Luis)
CREATE TABLE IF NOT EXISTS public.referral_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.patient_referrals(id) ON DELETE CASCADE,
    approved_by_user_id UUID NOT NULL REFERENCES auth.users(id),
    decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'MODIFIED', 'REJECTED')),
    decision_notes TEXT,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. REFERRAL DOCUMENTS (Epicrisis, resultados de laboratorio, RX)
CREATE TABLE IF NOT EXISTS public.referral_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.patient_referrals(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN (
        'EPICRISIS', 'LAB_RESULT', 'XRAY_ULTRASOUND', 'PHOTO', 
        'TREATMENT_HISTORY', 'SPECIALIST_COUNTER_REPORT'
    )),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    is_confidential_clinical BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. REFERRAL FOLLOWUPS (Seguimiento a la evolución con especialista)
CREATE TABLE IF NOT EXISTS public.referral_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referral_id UUID NOT NULL REFERENCES public.patient_referrals(id) ON DELETE CASCADE,
    followup_date DATE NOT NULL,
    contact_channel TEXT NOT NULL DEFAULT 'WHATSAPP' CHECK (contact_channel IN ('WHATSAPP', 'PHONE', 'EMAIL')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'CONTACTED_FEEDBACK_RECEIVED', 
        'CONTACTED_NO_REPLY', 'SPECIALIST_REPORT_RECEIVED'
    )),
    client_feedback_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. POST VISIT COMMITMENTS (Compromisos post-atención domiciliaria)
CREATE TABLE IF NOT EXISTS public.post_visit_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    commitment_type TEXT NOT NULL CHECK (commitment_type IN (
        'SEND_LAB_RESULTS', 'PRESCRIPTION_CHECK', 'EVOLUTION_INQUIRY', 
        'MEDICATION_ADHERENCE', 'SPECIALIST_SCHEDULING'
    )),
    description TEXT NOT NULL,
    due_date DATE NOT NULL,
    responsible_staff_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'IN_PROGRESS', 'FULFILLED', 'ESCALATED', 'CANCELLED'
    )),
    fulfillment_evidence TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_commitments_updated_at
BEFORE UPDATE ON public.post_visit_commitments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. POST VISIT REMINDERS
CREATE TABLE IF NOT EXISTS public.post_visit_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commitment_id UUID NOT NULL REFERENCES public.post_visit_commitments(id) ON DELETE CASCADE,
    reminder_channel TEXT NOT NULL DEFAULT 'WHATSAPP',
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'SENT', 'FAILED', 'CANCELLED_PREVENTIVELY'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. FEEDBACK SURVEYS (NPS y satisfacción de clientes)
CREATE TABLE IF NOT EXISTS public.feedback_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE RESTRICT,
    nps_score SMALLINT CHECK (nps_score BETWEEN 0 AND 10),
    clinical_care_rating SMALLINT CHECK (clinical_care_rating BETWEEN 1 AND 5),
    punctuality_rating SMALLINT CHECK (punctuality_rating BETWEEN 1 AND 5),
    staff_kindness_rating SMALLINT CHECK (staff_kindness_rating BETWEEN 1 AND 5),
    comments TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
