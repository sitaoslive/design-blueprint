-- ============================================================================
-- VET FREEDOM OS — MIGRACIÓN 035
-- VET-CORE-13 | APPROVED DOCUMENT DELIVERY & SECURE DOCUMENT HUB
-- Sistema empresarial de documentos privados, aprobaciones veterinarias,
-- versiones inmutables, destinatarios autorizados, accesos temporales,
-- revocaciones, auditoría y continuidad asistencial
-- ============================================================================

-- 1. Tabla Maestra de Documentos
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    pet_id UUID NOT NULL REFERENCES public.pets(id),
    customer_id UUID NOT NULL REFERENCES public.owners(id),
    visit_id UUID REFERENCES public.visits(id),
    appointment_id UUID REFERENCES public.appointments(id),
    referral_id UUID REFERENCES public.specialist_referrals(id),
    document_type TEXT NOT NULL CHECK (document_type IN (
        'REFERRAL_LETTER',
        'SPECIALIST_REPORT',
        'LAB_RESULT',
        'CLINICAL_REPORT_APPROVED',
        'VACCINATION_CERTIFICATE',
        'PREVENTIVE_CARE_RECORD',
        'VISIT_SUMMARY_APPROVED',
        'POST_VISIT_INSTRUCTIONS_APPROVED',
        'ADMINISTRATIVE_CERTIFICATE',
        'INVOICE_OR_PAYMENT_DOCUMENT',
        'CUSTOMER_AUTHORIZATION',
        'OTHER_APPROVED_DOCUMENT'
    )),
    source_system TEXT NOT NULL DEFAULT 'VET_LIFE_INTERNAL',
    source_reference TEXT,
    document_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (document_status IN (
        'DRAFT',
        'UPLOAD_PENDING',
        'UPLOADED',
        'VALIDATION_PENDING',
        'VALIDATION_FAILED',
        'SECURITY_REVIEW_PENDING',
        'READY_FOR_REVIEW',
        'APPROVAL_PENDING',
        'APPROVED',
        'REJECTED',
        'SUPERSEDED',
        'REVOKED',
        'RETAINED_ARCHIVE',
        'DELETION_PENDING',
        'DELETED_WITH_AUDIT'
    )),
    current_version_number INTEGER NOT NULL DEFAULT 1,
    current_version_id UUID,
    classification TEXT NOT NULL DEFAULT 'CONFIDENTIAL_CLINICAL' CHECK (classification IN (
        'CONFIDENTIAL_CLINICAL',
        'RESTRICTED_ADMINISTRATIVE',
        'FINANCIAL_SENSITIVE',
        'PUBLIC_DISCLOSURE_PROHIBITED'
    )),
    storage_bucket_reference TEXT NOT NULL DEFAULT 'medical-records',
    storage_object_reference TEXT,
    is_confidential_clinical BOOLEAN NOT NULL DEFAULT true,
    retention_category TEXT NOT NULL DEFAULT 'CLINICAL_RECORD_STATUTORY',
    created_by UUID REFERENCES public.staff_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    correlation_id TEXT
);

-- 2. Versiones Inmutables del Documento (v1..vn)
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    storage_object_key TEXT NOT NULL,
    sha256_digest TEXT NOT NULL,
    declared_mime_type TEXT NOT NULL,
    detected_file_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    upload_status TEXT NOT NULL DEFAULT 'UPLOADED' CHECK (upload_status IN ('PENDING', 'UPLOADED', 'CORRUPT', 'FAILED')),
    validation_status TEXT NOT NULL DEFAULT 'VALIDATED' CHECK (validation_status IN ('PENDING', 'VALIDATED', 'INVALID_SCHEMA', 'SUSPICIOUS_CONTENT', 'REJECTED')),
    security_scan_status TEXT NOT NULL DEFAULT 'SECURITY_SCAN_NOT_AVAILABLE' CHECK (security_scan_status IN ('SECURITY_SCAN_NOT_AVAILABLE', 'CLEAN', 'QUARANTINED', 'SUSPICIOUS')),
    approval_status TEXT NOT NULL DEFAULT 'APPROVAL_PENDING' CHECK (approval_status IN ('APPROVAL_PENDING', 'APPROVED', 'REJECTED', 'SUPERSEDED')),
    approved_by UUID REFERENCES public.staff_profiles(id),
    approved_at TIMESTAMPTZ,
    approval_notes TEXT,
    superseded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_document_version UNIQUE (document_id, version_number)
);

-- Vincular current_version_id como FK diferida
ALTER TABLE public.documents 
    DROP CONSTRAINT IF EXISTS fk_doc_current_version,
    ADD CONSTRAINT fk_doc_current_version FOREIGN KEY (current_version_id) REFERENCES public.document_versions(id) DEFERRABLE INITIALLY DEFERRED;

-- 3. Aprobaciones Profesionales
CREATE TABLE IF NOT EXISTS public.document_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
    approval_type TEXT NOT NULL DEFAULT 'CLINICAL_SIGN_OFF' CHECK (approval_type IN (
        'CLINICAL_SIGN_OFF',
        'ADMINISTRATIVE_SIGN_OFF',
        'SPECIALIST_SIGN_OFF',
        'EMERGENCY_OVERRIDE'
    )),
    approver_id UUID NOT NULL REFERENCES public.staff_profiles(id),
    approver_role TEXT NOT NULL,
    professional_card_number TEXT,
    decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED')),
    reason TEXT,
    approval_policy_version TEXT NOT NULL DEFAULT 'v1.0',
    audit_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Permisos de Destinatarios
CREATE TABLE IF NOT EXISTS public.document_recipient_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN (
        'OWNER',
        'AUTHORIZED_CAREGIVER',
        'ASSIGNED_VETERINARIAN',
        'AUTHORIZED_COORDINATOR',
        'REFERRING_VETERINARIAN',
        'VERIFIED_EXTERNAL_SPECIALIST',
        'AUTHORIZED_ADMINISTRATIVE_STAFF',
        'OTHER_AUTHORIZED_PARTY'
    )),
    permission_level TEXT NOT NULL DEFAULT 'READ_DOWNLOAD' CHECK (permission_level IN ('READ_DOWNLOAD', 'VIEW_ONLY', 'ADMINISTER')),
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES public.staff_profiles(id),
    revocation_reason TEXT,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Concesiones de Acceso Seguro (Tokens efímeros / URLs temporales)
CREATE TABLE IF NOT EXISTS public.document_access_grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL,
    recipient_type TEXT NOT NULL,
    grant_strategy TEXT NOT NULL CHECK (grant_strategy IN ('AUTHENTICATED_GATEWAY', 'SIGNED_TEMPORARY_URL')),
    access_token TEXT UNIQUE NOT NULL,
    signed_url TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Solicitudes de Entrega Documental
CREATE TABLE IF NOT EXISTS public.document_delivery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    document_version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL,
    recipient_type TEXT NOT NULL,
    purpose TEXT NOT NULL,
    authorization_reference TEXT NOT NULL,
    delivery_channel TEXT NOT NULL CHECK (delivery_channel IN (
        'WHATSAPP_SANDBOX',
        'PORTAL_LOVABLE',
        'SECURE_EMAIL_SANDBOX',
        'INTERNAL_TRANSFER'
    )),
    status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN (
        'REQUESTED',
        'PENDING_AUTHORIZATION',
        'AUTHORIZED',
        'PENDING_DELIVERY',
        'ACCESS_PREPARED',
        'MESSAGE_REQUESTED',
        'PROVIDER_ACCEPTED',
        'MESSAGE_SENT',
        'MESSAGE_DELIVERED',
        'ACCESS_REQUESTED',
        'ACCESS_AUTHORIZED',
        'CONTENT_SERVED',
        'DOWNLOAD_COMPLETED_WHEN_OBSERVABLE',
        'ACKNOWLEDGED_BY_RECIPIENT',
        'FAILED',
        'EXPIRED',
        'REVOKED',
        'RECONCILIATION_REQUIRED'
    )),
    access_grant_id UUID REFERENCES public.document_access_grants(id),
    message_request_id UUID,
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Intentos de Entrega y Respuestas de Proveedor
CREATE TABLE IF NOT EXISTS public.document_delivery_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_request_id UUID NOT NULL REFERENCES public.document_delivery_requests(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    channel TEXT NOT NULL,
    target_destination TEXT NOT NULL,
    provider_status TEXT NOT NULL,
    provider_message_id TEXT,
    error_code TEXT,
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Eventos Observables de Acceso y Descarga
CREATE TABLE IF NOT EXISTS public.document_access_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    document_version_id UUID NOT NULL REFERENCES public.document_versions(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL,
    actor_id UUID,
    access_type TEXT NOT NULL CHECK (access_type IN (
        'DOCUMENT_ACCESS_REQUESTED',
        'DOCUMENT_ACCESS_AUTHORIZED',
        'DOCUMENT_ACCESS_DENIED',
        'DOCUMENT_LINK_CREATED',
        'DOCUMENT_LINK_EXPIRED',
        'DOCUMENT_CONTENT_SERVED',
        'DOCUMENT_DOWNLOAD_RECORDED',
        'DOCUMENT_ACCESS_REVOKED'
    )),
    access_result TEXT NOT NULL CHECK (access_result IN ('SUCCESS', 'DENIED', 'EXPIRED', 'REVOKED', 'ERROR')),
    ip_masked TEXT,
    user_agent_category TEXT,
    correlation_id TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Políticas de Retención
CREATE TABLE IF NOT EXISTS public.document_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT UNIQUE NOT NULL,
    retention_years INTEGER NOT NULL,
    statutory_legal_basis TEXT NOT NULL,
    allow_early_deletion BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Semilla de políticas de retención de Colombia
INSERT INTO public.document_retention_policies (category, retention_years, statutory_legal_basis, allow_early_deletion)
VALUES 
    ('CLINICAL_RECORD_STATUTORY', 20, 'Ley 576 de 2000 y Res 1995 de 1999 (Historia Clínica Oficial)', false),
    ('PREVENTIVE_CERTIFICATE', 5, 'Normativa Sanitaria ICA / Medicina Preventiva', false),
    ('ADMINISTRATIVE_CERTIFICATE', 3, 'Políticas de Calidad y Registro Vet Life', true),
    ('FINANCIAL_INVOICE', 5, 'Estatuto Tributario de Colombia (DIAN)', false),
    ('TEMPORARY_PROCESSING', 1, 'Archivos de proceso temporal y de intercambio', true)
ON CONFLICT (category) DO NOTHING;

-- 10. Solicitudes de Eliminación Documental
CREATE TABLE IF NOT EXISTS public.document_deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES public.staff_profiles(id),
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN (
        'PENDING_REVIEW',
        'APPROVED_FOR_DELETION',
        'REJECTED',
        'DELETED',
        'BLOCKED_BY_RETENTION_POLICY'
    )),
    reviewed_by UUID REFERENCES public.staff_profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Auditoría Inmutable Documental
CREATE TABLE IF NOT EXISTS public.document_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    document_id UUID,
    document_version_id UUID,
    actor_id UUID,
    action TEXT NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    correlation_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS en las 11 tablas
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_recipient_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_delivery_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_delivery_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_audit ENABLE ROW LEVEL SECURITY;

-- Políticas RLS Permisivas para autenticados y service_role
CREATE POLICY "documents_authenticated_select" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "documents_service_all" ON public.documents FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_versions_authenticated_select" ON public.document_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_versions_service_all" ON public.document_versions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_approvals_authenticated_select" ON public.document_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_approvals_service_all" ON public.document_approvals FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_recipient_permissions_authenticated_select" ON public.document_recipient_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_recipient_permissions_service_all" ON public.document_recipient_permissions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_access_grants_authenticated_select" ON public.document_access_grants FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_access_grants_service_all" ON public.document_access_grants FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_delivery_requests_authenticated_select" ON public.document_delivery_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_delivery_requests_service_all" ON public.document_delivery_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_delivery_attempts_authenticated_select" ON public.document_delivery_attempts FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_delivery_attempts_service_all" ON public.document_delivery_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_access_events_authenticated_select" ON public.document_access_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_access_events_service_all" ON public.document_access_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_retention_policies_authenticated_select" ON public.document_retention_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_retention_policies_service_all" ON public.document_retention_policies FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_deletion_requests_authenticated_select" ON public.document_deletion_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_deletion_requests_service_all" ON public.document_deletion_requests FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "document_audit_authenticated_select" ON public.document_audit FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_audit_service_all" ON public.document_audit FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS (STORED PROCEDURES)
-- ============================================================================

-- 1. request_document_upload
CREATE OR REPLACE FUNCTION public.request_document_upload(
    p_organization_id UUID,
    p_pet_id UUID,
    p_customer_id UUID,
    p_document_type TEXT,
    p_file_name TEXT,
    p_declared_mime TEXT,
    p_file_size BIGINT,
    p_visit_id UUID DEFAULT NULL,
    p_referral_id UUID DEFAULT NULL,
    p_created_by UUID DEFAULT NULL,
    p_correlation_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doc_id UUID;
    v_version_id UUID;
    v_storage_key TEXT;
    v_is_clinical BOOLEAN;
    v_bucket TEXT;
BEGIN
    -- Validaciones de seguridad de archivo
    IF p_file_size > 52428800 THEN
        RAISE EXCEPTION 'File size % exceeds maximum allowed limit (50MB)', p_file_size;
    END IF;

    IF p_declared_mime NOT IN ('application/pdf', 'image/jpeg', 'image/png', 'image/webp') THEN
        RAISE EXCEPTION 'Declared MIME type % is not authorized for secure document storage', p_declared_mime;
    END IF;

    -- Clasificación y bucket
    v_is_clinical := p_document_type IN ('REFERRAL_LETTER', 'SPECIALIST_REPORT', 'LAB_RESULT', 'CLINICAL_REPORT_APPROVED', 'VACCINATION_CERTIFICATE', 'PREVENTIVE_CARE_RECORD', 'VISIT_SUMMARY_APPROVED', 'POST_VISIT_INSTRUCTIONS_APPROVED');
    v_bucket := CASE WHEN p_document_type = 'REFERRAL_LETTER' THEN 'referral-documents' ELSE 'medical-records' END;

    -- Insertar documento
    INSERT INTO public.documents (
        organization_id, pet_id, customer_id, visit_id, referral_id,
        document_type, document_status, storage_bucket_reference,
        is_confidential_clinical, created_by, correlation_id
    ) VALUES (
        p_organization_id, p_pet_id, p_customer_id, p_visit_id, p_referral_id,
        p_document_type, 'UPLOAD_PENDING', v_bucket,
        v_is_clinical, p_created_by, p_correlation_id
    ) RETURNING id INTO v_doc_id;

    v_storage_key := 'docs/' || v_doc_id || '/v1_' || regexp_replace(p_file_name, '[^a-zA-Z0-9_\.-]', '_', 'g');

    -- Insertar versión v1 inicial
    INSERT INTO public.document_versions (
        document_id, version_number, storage_object_key,
        sha256_digest, declared_mime_type, detected_file_type,
        file_size_bytes, upload_status, validation_status, approval_status
    ) VALUES (
        v_doc_id, 1, v_storage_key,
        'PENDING_CALCULATION', p_declared_mime, p_declared_mime,
        p_file_size, 'PENDING', 'PENDING', 'APPROVAL_PENDING'
    ) RETURNING id INTO v_version_id;

    -- Asignar current_version_id
    UPDATE public.documents SET current_version_id = v_version_id, storage_object_reference = v_storage_key WHERE id = v_doc_id;

    -- Conceder permiso inicial al propietario
    INSERT INTO public.document_recipient_permissions (
        document_id, recipient_id, recipient_type, permission_level
    ) VALUES (
        v_doc_id, p_customer_id, 'OWNER', 'READ_DOWNLOAD'
    );

    -- Auditoría
    INSERT INTO public.document_audit (
        organization_id, document_id, document_version_id, actor_id,
        action, previous_state, new_state, correlation_id
    ) VALUES (
        p_organization_id, v_doc_id, v_version_id, p_created_by,
        'DOCUMENT_UPLOAD_REQUESTED', 'NONE', 'UPLOAD_PENDING', p_correlation_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'document_id', v_doc_id,
        'version_id', v_version_id,
        'storage_bucket', v_bucket,
        'storage_key', v_storage_key
    );
END;
$$;

-- 2. finalize_document_upload
CREATE OR REPLACE FUNCTION public.finalize_document_upload(
    p_version_id UUID,
    p_sha256_digest TEXT,
    p_detected_type TEXT,
    p_actor_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doc_id UUID;
    v_org_id UUID;
BEGIN
    SELECT document_id INTO v_doc_id FROM public.document_versions WHERE id = p_version_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document version % not found', p_version_id;
    END IF;

    SELECT organization_id INTO v_org_id FROM public.documents WHERE id = v_doc_id;

    -- Actualizar versión
    UPDATE public.document_versions
    SET sha256_digest = p_sha256_digest,
        detected_file_type = p_detected_type,
        upload_status = 'UPLOADED',
        validation_status = 'VALIDATED'
    WHERE id = p_version_id;

    -- Actualizar documento
    UPDATE public.documents
    SET document_status = 'READY_FOR_REVIEW',
        updated_at = now()
    WHERE id = v_doc_id;

    -- Auditoría
    INSERT INTO public.document_audit (
        organization_id, document_id, document_version_id, actor_id,
        action, previous_state, new_state
    ) VALUES (
        v_org_id, v_doc_id, p_version_id, p_actor_id,
        'DOCUMENT_UPLOAD_FINALIZED', 'UPLOAD_PENDING', 'READY_FOR_REVIEW'
    );

    RETURN jsonb_build_object(
        'success', true,
        'document_id', v_doc_id,
        'version_id', p_version_id,
        'status', 'READY_FOR_REVIEW'
    );
END;
$$;

-- 3. approve_document_version
CREATE OR REPLACE FUNCTION public.approve_document_version(
    p_version_id UUID,
    p_approver_id UUID,
    p_approval_type TEXT DEFAULT 'CLINICAL_SIGN_OFF',
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doc_id UUID;
    v_org_id UUID;
    v_is_clinical BOOLEAN;
    v_prof_card TEXT;
    v_is_active BOOLEAN;
    v_job_title TEXT;
BEGIN
    SELECT d.id, d.organization_id, d.is_confidential_clinical
    INTO v_doc_id, v_org_id, v_is_clinical
    FROM public.document_versions dv
    JOIN public.documents d ON d.id = dv.document_id
    WHERE dv.id = p_version_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document version % not found', p_version_id;
    END IF;

    -- Verificar que el aprobador esté activo en staff_profiles
    SELECT is_active, professional_card_number, job_title
    INTO v_is_active, v_prof_card, v_job_title
    FROM public.staff_profiles
    WHERE id = p_approver_id;

    IF NOT FOUND OR v_is_active IS NOT TRUE THEN
        RAISE EXCEPTION 'Approver % is not an active staff member', p_approver_id;
    END IF;

    -- Salvaguarda clínica obligatoria: Documentos clínicos exigen tarjeta COMVEZCOL
    IF v_is_clinical AND (v_prof_card IS NULL OR trim(v_prof_card) = '') THEN
        RAISE EXCEPTION 'Unauthorized: Only a licensed veterinarian with valid COMVEZCOL registration can approve clinical documents. Administrative staff or AI cannot approve clinical records.';
    END IF;

    -- Actualizar versión a APPROVED
    UPDATE public.document_versions
    SET approval_status = 'APPROVED',
        approved_by = p_approver_id,
        approved_at = now(),
        approval_notes = p_notes
    WHERE id = p_version_id;

    -- Actualizar documento maestro a APPROVED
    UPDATE public.documents
    SET document_status = 'APPROVED',
        current_version_id = p_version_id,
        updated_at = now()
    WHERE id = v_doc_id;

    -- Registrar aprobación formal
    INSERT INTO public.document_approvals (
        document_version_id, approval_type, approver_id,
        approver_role, professional_card_number, decision, reason
    ) VALUES (
        p_version_id, p_approval_type, p_approver_id,
        COALESCE(v_job_title, 'VETERINARIAN'), v_prof_card, 'APPROVED', p_notes
    );

    -- Auditoría
    INSERT INTO public.document_audit (
        organization_id, document_id, document_version_id, actor_id,
        action, previous_state, new_state, metadata
    ) VALUES (
        v_org_id, v_doc_id, p_version_id, p_approver_id,
        'DOCUMENT_APPROVED', 'READY_FOR_REVIEW', 'APPROVED',
        jsonb_build_object('professional_card', v_prof_card, 'notes', p_notes)
    );

    RETURN jsonb_build_object(
        'success', true,
        'document_id', v_doc_id,
        'version_id', p_version_id,
        'status', 'APPROVED',
        'approved_by', p_approver_id,
        'professional_card', v_prof_card
    );
END;
$$;

-- 4. reject_document_version
CREATE OR REPLACE FUNCTION public.reject_document_version(
    p_version_id UUID,
    p_approver_id UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doc_id UUID;
    v_org_id UUID;
    v_job_title TEXT;
BEGIN
    SELECT d.id, d.organization_id
    INTO v_doc_id, v_org_id
    FROM public.document_versions dv
    JOIN public.documents d ON d.id = dv.document_id
    WHERE dv.id = p_version_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document version % not found', p_version_id;
    END IF;

    SELECT job_title INTO v_job_title FROM public.staff_profiles WHERE id = p_approver_id;

    UPDATE public.document_versions
    SET approval_status = 'REJECTED',
        approved_by = p_approver_id,
        approved_at = now(),
        approval_notes = p_reason
    WHERE id = p_version_id;

    UPDATE public.documents
    SET document_status = 'REJECTED',
        updated_at = now()
    WHERE id = v_doc_id;

    INSERT INTO public.document_approvals (
        document_version_id, approval_type, approver_id,
        approver_role, decision, reason
    ) VALUES (
        p_version_id, 'CLINICAL_SIGN_OFF', p_approver_id,
        COALESCE(v_job_title, 'STAFF'), 'REJECTED', p_reason
    );

    INSERT INTO public.document_audit (
        organization_id, document_id, document_version_id, actor_id,
        action, previous_state, new_state, metadata
    ) VALUES (
        v_org_id, v_doc_id, p_version_id, p_approver_id,
        'DOCUMENT_REJECTED', 'READY_FOR_REVIEW', 'REJECTED',
        jsonb_build_object('reason', p_reason)
    );

    RETURN jsonb_build_object(
        'success', true,
        'document_id', v_doc_id,
        'version_id', p_version_id,
        'status', 'REJECTED'
    );
END;
$$;

-- 5. authorize_document_recipient
CREATE OR REPLACE FUNCTION public.authorize_document_recipient(
    p_document_id UUID,
    p_recipient_id UUID,
    p_recipient_type TEXT,
    p_actor_id UUID,
    p_valid_hours INTEGER DEFAULT 720
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_perm_id UUID;
    v_is_revoked BOOLEAN;
BEGIN
    -- Si es cuidador, verificar que no esté revocado en autorizaciones
    IF p_recipient_type = 'AUTHORIZED_CAREGIVER' THEN
        SELECT is_active INTO v_is_revoked
        FROM public.caregiver_authorizations
        WHERE caregiver_id = p_recipient_id AND is_active = false
        LIMIT 1;

        IF v_is_revoked IS TRUE THEN
            RAISE EXCEPTION 'Unauthorized: Caregiver % has been revoked and cannot receive documents', p_recipient_id;
        END IF;
    END IF;

    INSERT INTO public.document_recipient_permissions (
        document_id, recipient_id, recipient_type, permission_level,
        is_revoked, valid_until
    ) VALUES (
        p_document_id, p_recipient_id, p_recipient_type, 'READ_DOWNLOAD',
        false, now() + (p_valid_hours || ' hours')::interval
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_perm_id;

    RETURN jsonb_build_object(
        'success', true,
        'document_id', p_document_id,
        'recipient_id', p_recipient_id,
        'recipient_type', p_recipient_type,
        'permission_id', v_perm_id
    );
END;
$$;

-- 6. request_document_delivery
CREATE OR REPLACE FUNCTION public.request_document_delivery(
    p_version_id UUID,
    p_recipient_id UUID,
    p_recipient_type TEXT,
    p_delivery_channel TEXT,
    p_purpose TEXT,
    p_idempotency_key TEXT,
    p_valid_hours INTEGER DEFAULT 24
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doc_id UUID;
    v_org_id UUID;
    v_storage_key TEXT;
    v_approval_status TEXT;
    v_is_revoked BOOLEAN;
    v_req_id UUID;
    v_grant_id UUID;
    v_token TEXT;
    v_signed_url TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Idempotencia estricta
    SELECT id, status, access_grant_id INTO v_req_id, v_approval_status, v_grant_id
    FROM public.document_delivery_requests
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true,
            'delivery_request_id', v_req_id,
            'status', v_approval_status,
            'access_grant_id', v_grant_id,
            'idempotent_replay', true
        );
    END IF;

    -- Obtener versión y documento
    SELECT dv.document_id, dv.approval_status, dv.storage_object_key, d.organization_id
    INTO v_doc_id, v_approval_status, v_storage_key, v_org_id
    FROM public.document_versions dv
    JOIN public.documents d ON d.id = dv.document_id
    WHERE dv.id = p_version_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document version % not found', p_version_id;
    END IF;

    -- REGLA INQUEBRANTABLE: Prohibido entregar borradores o versiones no aprobadas
    IF v_approval_status != 'APPROVED' THEN
        RAISE EXCEPTION 'Unauthorized: Document version % is in state % and has not been approved by a licensed professional', p_version_id, v_approval_status;
    END IF;

    -- Verificar permisos del destinatario y revocación
    SELECT is_revoked INTO v_is_revoked
    FROM public.document_recipient_permissions
    WHERE document_id = v_doc_id AND recipient_id = p_recipient_id;

    IF v_is_revoked IS TRUE THEN
        RAISE EXCEPTION 'Unauthorized: Access permission for recipient % has been revoked', p_recipient_id;
    END IF;

    -- Generar concesión de acceso (Estrategia B: Enlace firmado temporal / Token seguro)
    v_token := 'doc_tok_' || encode(gen_random_bytes(24), 'hex');
    v_expires_at := now() + (p_valid_hours || ' hours')::interval;
    v_signed_url := 'https://sznvahhocgnhsqhksygq.supabase.co/storage/v1/object/sign/medical-records/' || v_storage_key || '?token=' || v_token;

    INSERT INTO public.document_access_grants (
        document_version_id, recipient_id, recipient_type,
        grant_strategy, access_token, signed_url, expires_at
    ) VALUES (
        p_version_id, p_recipient_id, p_recipient_type,
        'SIGNED_TEMPORARY_URL', v_token, v_signed_url, v_expires_at
    ) RETURNING id INTO v_grant_id;

    -- Crear solicitud de entrega
    INSERT INTO public.document_delivery_requests (
        organization_id, document_version_id, recipient_id, recipient_type,
        purpose, authorization_reference, delivery_channel, status,
        access_grant_id, idempotency_key
    ) VALUES (
        v_org_id, p_version_id, p_recipient_id, p_recipient_type,
        p_purpose, 'AUTH_VET_VERIFIED', p_delivery_channel, 'ACCESS_PREPARED',
        v_grant_id, p_idempotency_key
    ) RETURNING id INTO v_req_id;

    -- Registrar evento observable
    INSERT INTO public.document_access_events (
        document_id, document_version_id, recipient_id,
        access_type, access_result, correlation_id
    ) VALUES (
        v_doc_id, p_version_id, p_recipient_id,
        'DOCUMENT_LINK_CREATED', 'SUCCESS', p_idempotency_key
    );

    -- Auditoría
    INSERT INTO public.document_audit (
        organization_id, document_id, document_version_id,
        action, previous_state, new_state, correlation_id
    ) VALUES (
        v_org_id, v_doc_id, p_version_id,
        'DOCUMENT_DELIVERY_REQUESTED', 'APPROVED', 'ACCESS_PREPARED', p_idempotency_key
    );

    RETURN jsonb_build_object(
        'success', true,
        'delivery_request_id', v_req_id,
        'access_grant_id', v_grant_id,
        'status', 'ACCESS_PREPARED',
        'access_token', v_token,
        'signed_url', v_signed_url,
        'expires_at', v_expires_at
    );
END;
$$;

-- 7. validate_document_access (Gateway de Descarga Autenticado)
CREATE OR REPLACE FUNCTION public.validate_document_access(
    p_access_token TEXT,
    p_actor_id UUID DEFAULT NULL,
    p_ip_masked TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_grant_id UUID;
    v_version_id UUID;
    v_doc_id UUID;
    v_recipient_id UUID;
    v_expires_at TIMESTAMPTZ;
    v_is_grant_revoked BOOLEAN;
    v_is_perm_revoked BOOLEAN;
    v_storage_key TEXT;
    v_bucket TEXT;
BEGIN
    SELECT dag.id, dag.document_version_id, dag.recipient_id, dag.expires_at, dag.is_revoked,
           dv.document_id, dv.storage_object_key, d.storage_bucket_reference
    INTO v_grant_id, v_version_id, v_recipient_id, v_expires_at, v_is_grant_revoked,
         v_doc_id, v_storage_key, v_bucket
    FROM public.document_access_grants dag
    JOIN public.document_versions dv ON dv.id = dag.document_version_id
    JOIN public.documents d ON d.id = dv.document_id
    WHERE dag.access_token = p_access_token;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('valid', false, 'error', 'INVALID_TOKEN');
    END IF;

    -- Verificar expiración
    IF v_expires_at < now() THEN
        INSERT INTO public.document_access_events (
            document_id, document_version_id, recipient_id, actor_id,
            access_type, access_result, ip_masked
        ) VALUES (
            v_doc_id, v_version_id, v_recipient_id, p_actor_id,
            'DOCUMENT_LINK_EXPIRED', 'EXPIRED', p_ip_masked
        );
        RETURN jsonb_build_object('valid', false, 'error', 'TOKEN_EXPIRED');
    END IF;

    -- Verificar revocación de la concesión o del destinatario
    SELECT is_revoked INTO v_is_perm_revoked
    FROM public.document_recipient_permissions
    WHERE document_id = v_doc_id AND recipient_id = v_recipient_id;

    IF v_is_grant_revoked IS TRUE OR v_is_perm_revoked IS TRUE THEN
        INSERT INTO public.document_access_events (
            document_id, document_version_id, recipient_id, actor_id,
            access_type, access_result, ip_masked
        ) VALUES (
            v_doc_id, v_version_id, v_recipient_id, p_actor_id,
            'DOCUMENT_ACCESS_DENIED', 'REVOKED', p_ip_masked
        );
        RETURN jsonb_build_object('valid', false, 'error', 'ACCESS_REVOKED');
    END IF;

    -- Acceso válido: registrar descarga observable
    INSERT INTO public.document_access_events (
        document_id, document_version_id, recipient_id, actor_id,
        access_type, access_result, ip_masked
    ) VALUES (
        v_doc_id, v_version_id, v_recipient_id, p_actor_id,
        'DOCUMENT_CONTENT_SERVED', 'SUCCESS', p_ip_masked
    );

    RETURN jsonb_build_object(
        'valid', true,
        'document_id', v_doc_id,
        'version_id', v_version_id,
        'storage_bucket', v_bucket,
        'storage_key', v_storage_key,
        'expires_at', v_expires_at
    );
END;
$$;

-- 8. revoke_document_access
CREATE OR REPLACE FUNCTION public.revoke_document_access(
    p_document_id UUID,
    p_recipient_id UUID,
    p_revoked_by UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT organization_id INTO v_org_id FROM public.documents WHERE id = p_document_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Document % not found', p_document_id;
    END IF;

    -- Revocar permisos de destinatario
    UPDATE public.document_recipient_permissions
    SET is_revoked = true,
        revoked_at = now(),
        revoked_by = p_revoked_by,
        revocation_reason = p_reason
    WHERE document_id = p_document_id AND recipient_id = p_recipient_id;

    -- Invalidar tokens y concesiones activas para este documento y destinatario
    UPDATE public.document_access_grants dag
    SET is_revoked = true,
        revoked_at = now()
    FROM public.document_versions dv
    WHERE dv.id = dag.document_version_id
      AND dv.document_id = p_document_id
      AND dag.recipient_id = p_recipient_id;

    -- Actualizar solicitudes de entrega pendientes a REVOKED
    UPDATE public.document_delivery_requests ddr
    SET status = 'REVOKED',
        updated_at = now()
    FROM public.document_versions dv
    WHERE dv.id = ddr.document_version_id
      AND dv.document_id = p_document_id
      AND ddr.recipient_id = p_recipient_id
      AND ddr.status IN ('REQUESTED', 'PENDING_AUTHORIZATION', 'AUTHORIZED', 'PENDING_DELIVERY', 'ACCESS_PREPARED');

    -- Registrar evento observable
    INSERT INTO public.document_access_events (
        document_id, document_version_id, recipient_id, actor_id,
        access_type, access_result
    ) VALUES (
        p_document_id, 
        (SELECT current_version_id FROM public.documents WHERE id = p_document_id),
        p_recipient_id, p_revoked_by,
        'DOCUMENT_ACCESS_REVOKED', 'REVOKED'
    );

    -- Auditoría
    INSERT INTO public.document_audit (
        organization_id, document_id, actor_id,
        action, previous_state, new_state, metadata
    ) VALUES (
        v_org_id, p_document_id, p_revoked_by,
        'DOCUMENT_ACCESS_REVOKED', 'ACTIVE', 'REVOKED',
        jsonb_build_object('recipient_id', p_recipient_id, 'reason', p_reason)
    );

    RETURN jsonb_build_object(
        'success', true,
        'document_id', p_document_id,
        'recipient_id', p_recipient_id,
        'status', 'REVOKED'
    );
END;
$$;

-- 9. supersede_document_version
CREATE OR REPLACE FUNCTION public.supersede_document_version(
    p_old_version_id UUID,
    p_new_version_id UUID,
    p_actor_id UUID,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_doc_id UUID;
    v_org_id UUID;
BEGIN
    SELECT document_id INTO v_doc_id FROM public.document_versions WHERE id = p_old_version_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Old document version % not found', p_old_version_id;
    END IF;

    SELECT organization_id INTO v_org_id FROM public.documents WHERE id = v_doc_id;

    -- Marcar versión antigua como SUPERSEDED
    UPDATE public.document_versions
    SET approval_status = 'SUPERSEDED',
        superseded_at = now()
    WHERE id = p_old_version_id;

    -- Apuntar documento maestro a la nueva versión
    UPDATE public.documents
    SET current_version_id = p_new_version_id,
        updated_at = now()
    WHERE id = v_doc_id;

    -- Auditoría
    INSERT INTO public.document_audit (
        organization_id, document_id, document_version_id, actor_id,
        action, previous_state, new_state, metadata
    ) VALUES (
        v_org_id, v_doc_id, p_new_version_id, p_actor_id,
        'DOCUMENT_SUPERSEDED', 'ACTIVE_v1', 'SUPERSEDED_BY_v2',
        jsonb_build_object('old_version_id', p_old_version_id, 'reason', p_reason)
    );

    RETURN jsonb_build_object(
        'success', true,
        'document_id', v_doc_id,
        'superseded_version_id', p_old_version_id,
        'active_version_id', p_new_version_id
    );
END;
$$;

-- Revocar permisos de anon sobre todas las funciones
REVOKE EXECUTE ON FUNCTION public.request_document_upload FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.finalize_document_upload FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.approve_document_version FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.reject_document_version FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.authorize_document_recipient FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.request_document_delivery FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.validate_document_access FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.revoke_document_access FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.supersede_document_version FROM anon, public;

GRANT EXECUTE ON FUNCTION public.request_document_upload TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.finalize_document_upload TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.approve_document_version TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.reject_document_version TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.authorize_document_recipient TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_document_delivery TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_document_access TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.revoke_document_access TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.supersede_document_version TO authenticated, service_role;
