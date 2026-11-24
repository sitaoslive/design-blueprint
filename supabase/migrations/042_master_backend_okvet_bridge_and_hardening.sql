-- ============================================================================
-- VET FREEDOM OS — MIGRATION 042
-- Master Backend OKVET Assisted Bridge, Feature Flags & Security Hardening
-- Proyecto: Vet Life — Veterinaria a Domicilio
-- Fecha: 2026-11-21
-- ============================================================================

-- 1. FEATURE FLAGS EMPRESARIALES (Capítulo 47)
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    flag_key TEXT NOT NULL,
    environment TEXT NOT NULL DEFAULT 'development',
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    approved_by UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_feature_flag UNIQUE(organization_id, flag_key, environment)
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feature_flags_read_policy" ON public.feature_flags;
CREATE POLICY "feature_flags_read_policy" ON public.feature_flags
    FOR SELECT TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

DROP POLICY IF EXISTS "feature_flags_write_policy" ON public.feature_flags;
CREATE POLICY "feature_flags_write_policy" ON public.feature_flags
    FOR ALL TO authenticated
    USING (
        organization_id = '11111111-1111-1111-1111-111111111111'::uuid
        AND EXISTS (
            SELECT 1 FROM public.organization_memberships m
            WHERE m.user_id = auth.uid()
            AND m.organization_id = public.feature_flags.organization_id
            AND m.role IN ('DIRECTOR', 'ADMINISTRATOR')
        )
    );

-- Seed de los 12 Feature Flags de Vet Freedom OS
INSERT INTO public.feature_flags (organization_id, flag_key, environment, enabled, description)
VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'WHATSAPP_REAL_SENDING', 'development', FALSE, 'Habilita despacho a clientes reales en WhatsApp Meta API'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'CALENDAR_REAL_WRITES', 'development', FALSE, 'Habilita escritura real en Google Calendar API'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'LIVE_APPOINTMENT_CHANGES', 'development', FALSE, 'Habilita reprogramaciones automáticas sin autorización humana'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'ROUTE_PUBLICATION', 'development', FALSE, 'Publica rutas activas a veterinarios en campo'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'EXTERNAL_SPECIALIST_ACTIONS', 'development', FALSE, 'Permite confirmed bookings directos con especialistas externos'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'DOCUMENT_REAL_DELIVERY', 'development', FALSE, 'Habilita despacho real de documentos a destinatarios'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'PAYMENT_REAL_CHARGES', 'development', FALSE, 'Habilita cobros reales en pasarelas Wompi/Bold'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'REAL_REFUNDS', 'development', FALSE, 'Habilita dispersión de devoluciones financieras automáticas'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'PUBLIC_REVIEW_INVITATIONS', 'development', FALSE, 'Envío masivo de invitaciones de reseñas Google Business'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'PRODUCTION_REPORT_DELIVERY', 'development', FALSE, 'Envío de informes diarios/semanales a teléfonos de Luis'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'AI_PRIVILEGED_ACTIONS', 'development', FALSE, 'Permite a modelos LLM ejecutar acciones sin PIN de Luis'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'OKVET_DIRECT_API_INTEGRATION', 'development', FALSE, 'Integración API directa OKVET (Desactivado: no existe API oficial)')
ON CONFLICT (organization_id, flag_key, environment) DO NOTHING;

-- 2. TABLAS DEL OKVET ASSISTED BRIDGE (Capítulo 32)
CREATE TABLE IF NOT EXISTS public.okvet_connector_configuration (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    integration_mode TEXT NOT NULL DEFAULT 'HUMAN_ASSISTED_RECONCILIATION',
    status TEXT NOT NULL DEFAULT 'ACTIVE_STANDBY',
    last_verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.okvet_connector_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_connector_configuration FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okvet_config_read" ON public.okvet_connector_configuration;
CREATE POLICY "okvet_config_read" ON public.okvet_connector_configuration
    FOR SELECT TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

INSERT INTO public.okvet_connector_configuration (organization_id, integration_mode, status, notes)
VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'HUMAN_ASSISTED_RECONCILIATION', 'ACTIVE_STANDBY', 'Puente asistido conforme a Ley 576 de 2000 sin scraping ni bots')
ON CONFLICT (organization_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.okvet_capability_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    capability_code TEXT NOT NULL,
    availability_status TEXT NOT NULL DEFAULT 'UNSUPPORTED_CONFIRMED',
    verification_source TEXT NOT NULL DEFAULT 'OFFICIAL_VENDOR_ASSESSMENT',
    verified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    notes TEXT,
    CONSTRAINT uq_okvet_capability UNIQUE(organization_id, capability_code)
);

ALTER TABLE public.okvet_capability_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_capability_registry FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okvet_capabilities_read" ON public.okvet_capability_registry;
CREATE POLICY "okvet_capabilities_read" ON public.okvet_capability_registry
    FOR SELECT TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

-- Seed de capacidades verificadas (Capítulo 38)
INSERT INTO public.okvet_capability_registry (organization_id, capability_code, availability_status, notes)
VALUES
    ('11111111-1111-1111-1111-111111111111'::uuid, 'canReadAppointments', 'UNSUPPORTED_CONFIRMED', 'No existe endpoint REST oficial para lectura de citas'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'canWriteAppointments', 'UNSUPPORTED_CONFIRMED', 'No existe endpoint REST para creación programática de citas'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'canReadCustomers', 'UNSUPPORTED_CONFIRMED', 'Consulta nominal de clientes requiere operador humano'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'canReadPets', 'UNSUPPORTED_CONFIRMED', 'Historias clínicas protegidas bajo reserva legal Ley 576'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'canReadClinicalReferences', 'UNSUPPORTED_CONFIRMED', 'Solo vía referencia cruzada manual de ID oficial'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'canReceiveWebhooks', 'UNSUPPORTED_CONFIRMED', 'OKVET no emite webhooks de notificación'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'canExportFiles', 'SUPPORTED_VERIFIED', 'Exportación manual CSV/XLSX por usuario autorizado'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'canImportFiles', 'SUPPORTED_VERIFIED', 'Importación asistida en staging de Vet Freedom OS'),
    ('11111111-1111-1111-1111-111111111111'::uuid, 'canCheckBookingStatus', 'UNSUPPORTED_CONFIRMED', 'Verificación de estado requiere confirmación humana')
ON CONFLICT (organization_id, capability_code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.okvet_manual_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    okvet_reference TEXT NOT NULL,
    confirmed_by UUID NOT NULL REFERENCES public.user_profiles(id),
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    confirmation_method TEXT NOT NULL DEFAULT 'HUMAN_VERIFIED_AGAINST_OKVET',
    evidence_notes TEXT,
    evidence_file_reference TEXT,
    status TEXT NOT NULL DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_appointment_okvet_conf UNIQUE(organization_id, appointment_id)
);

ALTER TABLE public.okvet_manual_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_manual_confirmations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okvet_manual_confirmations_policy" ON public.okvet_manual_confirmations;
CREATE POLICY "okvet_manual_confirmations_policy" ON public.okvet_manual_confirmations
    FOR ALL TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

-- Pipeline de Importación de Archivos OKVET
CREATE TABLE IF NOT EXISTS public.okvet_import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'CSV',
    content_hash TEXT NOT NULL,
    source_date DATE NOT NULL DEFAULT CURRENT_DATE,
    uploaded_by UUID NOT NULL REFERENCES public.user_profiles(id),
    total_rows INTEGER NOT NULL DEFAULT 0,
    valid_rows INTEGER NOT NULL DEFAULT 0,
    error_rows INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'STAGED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.okvet_import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_import_batches FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okvet_import_batches_policy" ON public.okvet_import_batches;
CREATE POLICY "okvet_import_batches_policy" ON public.okvet_import_batches
    FOR ALL TO authenticated
    USING (organization_id = '11111111-1111-1111-1111-111111111111'::uuid);

CREATE TABLE IF NOT EXISTS public.okvet_import_row_staging (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.okvet_import_batches(id) ON DELETE CASCADE,
    row_number INTEGER NOT NULL,
    raw_data JSONB NOT NULL,
    normalized_data JSONB,
    match_status TEXT NOT NULL DEFAULT 'NEW_RECORD_CANDIDATE',
    validation_status TEXT NOT NULL DEFAULT 'PENDING',
    matched_entity_type TEXT,
    matched_entity_id UUID,
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.okvet_import_row_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_import_row_staging FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okvet_import_staging_policy" ON public.okvet_import_row_staging;
CREATE POLICY "okvet_import_staging_policy" ON public.okvet_import_row_staging
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.okvet_import_batches b
        WHERE b.id = public.okvet_import_row_staging.batch_id
        AND b.organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    ));

CREATE TABLE IF NOT EXISTS public.okvet_import_column_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.okvet_import_batches(id) ON DELETE CASCADE,
    source_column TEXT NOT NULL,
    target_field TEXT NOT NULL,
    transformation_rule TEXT NOT NULL DEFAULT 'DIRECT_TRIM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.okvet_import_column_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_import_column_mappings FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okvet_import_mappings_policy" ON public.okvet_import_column_mappings;
CREATE POLICY "okvet_import_mappings_policy" ON public.okvet_import_column_mappings
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.okvet_import_batches b
        WHERE b.id = public.okvet_import_column_mappings.batch_id
        AND b.organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    ));

CREATE TABLE IF NOT EXISTS public.okvet_import_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.okvet_import_batches(id) ON DELETE CASCADE,
    row_id UUID NOT NULL REFERENCES public.okvet_import_row_staging(id) ON DELETE CASCADE,
    conflict_type TEXT NOT NULL,
    local_reference TEXT,
    resolution_status TEXT NOT NULL DEFAULT 'PENDING_HUMAN_REVIEW',
    resolution_notes TEXT,
    resolved_by UUID REFERENCES public.user_profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.okvet_import_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_import_conflicts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okvet_import_conflicts_policy" ON public.okvet_import_conflicts;
CREATE POLICY "okvet_import_conflicts_policy" ON public.okvet_import_conflicts
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.okvet_import_batches b
        WHERE b.id = public.okvet_import_conflicts.batch_id
        AND b.organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    ));

CREATE TABLE IF NOT EXISTS public.okvet_import_application_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.okvet_import_batches(id) ON DELETE CASCADE,
    row_id UUID NOT NULL REFERENCES public.okvet_import_row_staging(id) ON DELETE CASCADE,
    action_taken TEXT NOT NULL,
    result_status TEXT NOT NULL DEFAULT 'SUCCESS',
    evidence_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE public.okvet_import_application_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_import_application_results FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "okvet_import_results_policy" ON public.okvet_import_application_results;
CREATE POLICY "okvet_import_results_policy" ON public.okvet_import_application_results
    FOR ALL TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.okvet_import_batches b
        WHERE b.id = public.okvet_import_application_results.batch_id
        AND b.organization_id = '11111111-1111-1111-1111-111111111111'::uuid
    ));

-- 3. FUNCIONES TRANSACCIONALES PROTEGIDAS (Capítulo 40)

-- A) Registro de Confirmación Humana en OKVET
CREATE OR REPLACE FUNCTION public.submit_okvet_human_confirmation(
    p_org_id UUID,
    p_appointment_id UUID,
    p_okvet_reference TEXT,
    p_confirmed_by UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_apt RECORD;
    v_conf_id UUID;
    v_payload JSONB;
BEGIN
    IF p_org_id != '11111111-1111-1111-1111-111111111111'::uuid THEN
        RAISE EXCEPTION 'Organización inválida o no autorizada';
    END IF;

    SELECT * INTO v_apt FROM public.appointments
    WHERE id = p_appointment_id AND organization_id = p_org_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cita no encontrada con ID %', p_appointment_id;
    END IF;

    IF p_okvet_reference IS NULL OR trim(p_okvet_reference) = '' THEN
        RAISE EXCEPTION 'La referencia de OKVET es obligatoria para confirmación oficial';
    END IF;

    -- Registrar confirmación humana
    INSERT INTO public.okvet_manual_confirmations (
        organization_id, appointment_id, okvet_reference, confirmed_by,
        confirmation_method, evidence_notes, status
    ) VALUES (
        p_org_id, p_appointment_id, p_okvet_reference, p_confirmed_by,
        'HUMAN_VERIFIED_AGAINST_OKVET', p_notes, 'VERIFIED'
    )
    ON CONFLICT (organization_id, appointment_id) DO UPDATE
    SET okvet_reference = EXCLUDED.okvet_reference,
        confirmed_by = EXCLUDED.confirmed_by,
        confirmed_at = clock_timestamp(),
        evidence_notes = EXCLUDED.evidence_notes,
        status = 'VERIFIED'
    RETURNING id INTO v_conf_id;

    -- Actualizar estado oficial en appointments
    UPDATE public.appointments
    SET status = 'CONFIRMED',
        okvet_appointment_id = p_okvet_reference,
        okvet_sync_status = 'MATCHED',
        okvet_verified_at = clock_timestamp(),
        okvet_verified_by = p_confirmed_by,
        updated_at = clock_timestamp()
    WHERE id = p_appointment_id;

    -- Registrar auditoría inmutable
    INSERT INTO public.audit_logs (
        organization_id, actor_user_id, action, entity_type, entity_id,
        new_values, created_at
    ) VALUES (
        p_org_id, p_confirmed_by, 'CONFIRM_OKVET_APPOINTMENT', 'appointments', p_appointment_id,
        jsonb_build_object(
            'okvet_reference', p_okvet_reference,
            'confirmation_id', v_conf_id,
            'previous_status', v_apt.status,
            'new_status', 'CONFIRMED'
        ),
        clock_timestamp()
    );

    -- Emitir evento Outbox duradero
    v_payload := jsonb_build_object(
        'appointment_id', p_appointment_id,
        'pet_id', v_apt.pet_id,
        'owner_id', v_apt.owner_id,
        'assigned_veterinarian_id', v_apt.assigned_veterinarian_id,
        'okvet_reference', p_okvet_reference,
        'confirmation_method', 'HUMAN_VERIFIED_AGAINST_OKVET',
        'confirmed_by', p_confirmed_by,
        'confirmed_at', clock_timestamp()
    );

    INSERT INTO public.transactional_outbox (
        organization_id, aggregate_type, aggregate_id, event_type,
        payload, status, idempotency_key
    ) VALUES (
        p_org_id, 'appointment', p_appointment_id, 'appointment.confirmed',
        v_payload, 'PENDING', 'conf-okvet-' || p_appointment_id::text || '-' || extract(epoch from clock_timestamp())::bigint
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'confirmation_id', v_conf_id,
        'appointment_id', p_appointment_id,
        'status', 'CONFIRMED',
        'okvet_reference', p_okvet_reference
    );
END;
$$;

-- B) Creación de Hold Provisional con Control de Concurrencia
CREATE OR REPLACE FUNCTION public.create_appointment_hold(
    p_org_id UUID,
    p_staff_profile_id UUID,
    p_start_at TIMESTAMPTZ,
    p_end_at TIMESTAMPTZ,
    p_ttl_minutes INT DEFAULT 15
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_overlap_count INT;
    v_hold_id UUID;
    v_expires_at TIMESTAMPTZ;
    v_token TEXT;
BEGIN
    IF p_org_id != '11111111-1111-1111-1111-111111111111'::uuid THEN
        RAISE EXCEPTION 'Organización inválida';
    END IF;

    -- Verificar solapamientos de citas reales
    SELECT count(*) INTO v_overlap_count
    FROM public.appointments
    WHERE organization_id = p_org_id
      AND assigned_veterinarian_id = p_staff_profile_id
      AND status NOT IN ('CANCELLED', 'NO_SHOW')
      AND (start_time, end_time) OVERLAPS (p_start_at, p_end_at);

    IF v_overlap_count > 0 THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'reason', 'OVERLAPPING_CONFIRMED_APPOINTMENT'
        );
    END IF;

    -- Verificar solapamientos de holds activos vigentes
    SELECT count(*) INTO v_overlap_count
    FROM public.appointment_holds
    WHERE organization_id = p_org_id
      AND staff_profile_id = p_staff_profile_id
      AND is_released = FALSE
      AND expires_at > clock_timestamp()
      AND (start_time, end_time) OVERLAPS (p_start_at, p_end_at);

    IF v_overlap_count > 0 THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'reason', 'OVERLAPPING_ACTIVE_HOLD'
        );
    END IF;

    v_expires_at := clock_timestamp() + (p_ttl_minutes || ' minutes')::interval;
    v_token := 'hold-' || gen_random_uuid()::text;

    INSERT INTO public.appointment_holds (
        organization_id, staff_profile_id, start_time, end_time,
        expires_at, is_released, hold_session_token
    ) VALUES (
        p_org_id, p_staff_profile_id, p_start_at, p_end_at,
        v_expires_at, FALSE, v_token
    ) RETURNING id INTO v_hold_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'hold_id', v_hold_id,
        'expires_at', v_expires_at,
        'hold_token', v_token
    );
END;
$$;

-- C) Expiración de Holds Vencidos
CREATE OR REPLACE FUNCTION public.expire_stale_appointment_holds(
    p_org_id UUID DEFAULT '11111111-1111-1111-1111-111111111111'::uuid
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.appointment_holds
    SET is_released = TRUE
    WHERE organization_id = p_org_id
      AND is_released = FALSE
      AND expires_at <= clock_timestamp();

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- 4. HARDENING DE SEGURIDAD (Eliminación de Warnings del Advisor de Supabase)
-- Revocar ejecución de anon en todas las funciones y procedimientos de public
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE EXECUTE ON ALL PROCEDURES IN SCHEMA public FROM anon;

-- Conceder permisos explícitos de ejecución únicamente a authenticated y service_role
GRANT EXECUTE ON FUNCTION public.get_business_snapshot TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_schedule_simulation TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_okvet_human_confirmation TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_appointment_hold TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_appointment_holds TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_outbox_events TO service_role;
GRANT EXECUTE ON FUNCTION public.get_system_health_summary TO authenticated, service_role;
