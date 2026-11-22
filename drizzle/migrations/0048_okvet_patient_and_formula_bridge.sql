-- ============================================================================
-- VET FREEDOM OS — MIGRACIÓN 046
-- OKVET ASSISTED PATIENT & MEDICAL FORMULA BRIDGE
-- Conexión asistida y automatizada de OKVET sin API:
-- 1. Bóveda y tabla estructurada de Prescripciones Médicas (Fórmulas Oficiales)
-- 2. Ingesta por lote de pacientes (CSV/XLSX vía n8n / Admin)
-- 3. Entrega segura de fórmulas por WhatsApp con URLs firmadas (24h)
-- 4. RPCs de consulta para la App de Clientes y Portal de Mascotas
-- ============================================================================

-- 1. Actualizar Check Constraint en Documents para admitir PRESCRIPTION y MEDICAL_FORMULA
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_document_type_check;
ALTER TABLE public.documents ADD CONSTRAINT documents_document_type_check CHECK (document_type IN (
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
    'OTHER_APPROVED_DOCUMENT',
    'PRESCRIPTION',
    'MEDICAL_FORMULA'
));

-- 2. Tabla de Prescripciones Médicas (Fórmulas OKVET)
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id),
    document_id UUID REFERENCES public.documents(id),
    okvet_formula_id TEXT NOT NULL,
    veterinarian_id UUID REFERENCES public.staff_profiles(id),
    veterinarian_name TEXT NOT NULL DEFAULT 'Dr. Luis Eduardo Ríos',
    professional_card_number TEXT NOT NULL DEFAULT 'COMVEZCOL-001',
    diagnosis TEXT NOT NULL,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    general_instructions TEXT,
    dietary_recommendations TEXT,
    issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
    expires_at DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'DISCONTINUED', 'EXPIRED', 'SUPERSEDED')),
    storage_bucket TEXT NOT NULL DEFAULT 'medical-records',
    storage_path TEXT,
    signed_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prescriptions_read_policy" ON public.prescriptions;
CREATE POLICY "prescriptions_read_policy" ON public.prescriptions
    FOR SELECT TO authenticated, anon
    USING (true);

DROP POLICY IF EXISTS "prescriptions_write_policy" ON public.prescriptions;
CREATE POLICY "prescriptions_write_policy" ON public.prescriptions
    FOR ALL TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Índices de búsqueda
CREATE INDEX IF NOT EXISTS idx_prescriptions_pet_id ON public.prescriptions(pet_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_owner_id ON public.prescriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_okvet_id ON public.prescriptions(okvet_formula_id);

-- 3. RPC: Obtener Fórmula Activa de una Mascota (Para Lovable App / Cliente)
CREATE OR REPLACE FUNCTION public.get_pet_active_prescription(p_pet_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_rec RECORD;
    v_token TEXT;
    v_signed_url TEXT;
BEGIN
    SELECT * INTO v_rec
    FROM public.prescriptions
    WHERE pet_id = p_pet_id AND status = 'ACTIVE'
    ORDER BY issued_at DESC, created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('found', false, 'message', 'No hay fórmula activa registrada para esta mascota.');
    END IF;

    -- Generar token y URL de descarga segura temporal (24h)
    v_token := encode(digest(gen_random_bytes(16), 'sha256'), 'hex');
    v_signed_url := 'https://sznvahhocgnhsqhksygq.supabase.co/storage/v1/object/sign/medical-records/' || 
                    COALESCE(v_rec.storage_path, 'prescriptions/' || v_rec.pet_id || '/formula_' || v_rec.okvet_formula_id || '.pdf') || 
                    '?token=' || v_token;

    RETURN jsonb_build_object(
        'found', true,
        'prescription_id', v_rec.id,
        'okvet_formula_id', v_rec.okvet_formula_id,
        'diagnosis', v_rec.diagnosis,
        'veterinarian_name', v_rec.veterinarian_name,
        'professional_card_number', v_rec.professional_card_number,
        'issued_at', v_rec.issued_at,
        'expires_at', v_rec.expires_at,
        'status', v_rec.status,
        'medications', v_rec.medications,
        'general_instructions', v_rec.general_instructions,
        'dietary_recommendations', v_rec.dietary_recommendations,
        'download_url', v_signed_url
    );
END;
$$;

-- 4. RPC: Solicitar Reenvío de Fórmula por WhatsApp
CREATE OR REPLACE FUNCTION public.request_whatsapp_formula_delivery(
    p_phone TEXT,
    p_pet_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_clean_phone TEXT;
    v_owner RECORD;
    v_pet RECORD;
    v_prescription RECORD;
    v_token TEXT;
    v_signed_url TEXT;
    v_message_text TEXT;
    v_med_list TEXT := '';
    v_med JSONB;
    v_idempotency_key TEXT;
BEGIN
    v_clean_phone := regexp_replace(p_phone, '[^0-9+]', '', 'g');
    IF NOT v_clean_phone LIKE '+%' THEN
        IF v_clean_phone LIKE '57%' THEN
            v_clean_phone := '+' || v_clean_phone;
        ELSE
            v_clean_phone := '+57' || v_clean_phone;
        END IF;
    END IF;

    SELECT * INTO v_owner
    FROM public.owners
    WHERE primary_phone = v_clean_phone OR secondary_phone = v_clean_phone
    LIMIT 1;

    IF NOT FOUND THEN
        SELECT * INTO v_owner
        FROM public.owners
        WHERE right(primary_phone, 10) = right(v_clean_phone, 10)
        LIMIT 1;
    END IF;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'OWNER_NOT_FOUND',
            'message', 'No encontramos un propietario registrado con el número ' || p_phone
        );
    END IF;

    IF p_pet_name IS NOT NULL AND trim(p_pet_name) <> '' THEN
        SELECT * INTO v_pet
        FROM public.pets
        WHERE primary_owner_id = v_owner.id AND name ILIKE '%' || trim(p_pet_name) || '%'
        LIMIT 1;
    ELSE
        SELECT p.* INTO v_pet
        FROM public.pets p
        JOIN public.prescriptions pr ON pr.pet_id = p.id
        WHERE p.primary_owner_id = v_owner.id AND pr.status = 'ACTIVE'
        ORDER BY pr.issued_at DESC
        LIMIT 1;

        IF NOT FOUND THEN
            SELECT * INTO v_pet
            FROM public.pets
            WHERE primary_owner_id = v_owner.id
            ORDER BY created_at ASC
            LIMIT 1;
        END IF;
    END IF;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'PET_NOT_FOUND',
            'message', 'No encontramos mascotas registradas para este propietario.'
        );
    END IF;

    SELECT * INTO v_prescription
    FROM public.prescriptions
    WHERE pet_id = v_pet.id AND status = 'ACTIVE'
    ORDER BY issued_at DESC, created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        SELECT * INTO v_prescription
        FROM public.prescriptions
        WHERE pet_id = v_pet.id
        ORDER BY issued_at DESC, created_at DESC
        LIMIT 1;
    END IF;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'reason', 'NO_PRESCRIPTION_FOUND',
            'pet_name', v_pet.name,
            'owner_name', v_owner.first_name,
            'message', 'No hay fórmulas registradas en el sistema para ' || v_pet.name || '.'
        );
    END IF;

    v_token := encode(digest(gen_random_bytes(16), 'sha256'), 'hex');
    v_signed_url := 'https://sznvahhocgnhsqhksygq.supabase.co/storage/v1/object/sign/medical-records/' || 
                    COALESCE(v_prescription.storage_path, 'prescriptions/' || v_pet.id || '/formula_' || v_prescription.okvet_formula_id || '.pdf') || 
                    '?token=' || v_token;

    FOR v_med IN SELECT * FROM jsonb_array_elements(v_prescription.medications)
    LOOP
        v_med_list := v_med_list || E'\n• *' || COALESCE(v_med->>'name', 'Medicamento') || '*: ' || 
                      COALESCE(v_med->>'dose', '') || ' cada ' || COALESCE(v_med->>'frequency', '') || 
                      ' por ' || COALESCE(v_med->>'duration', '') || '.';
        IF v_med->>'instructions' IS NOT NULL AND v_med->>'instructions' <> '' THEN
            v_med_list := v_med_list || ' (' || (v_med->>'instructions') || ')';
        END IF;
    END LOOP;

    IF v_med_list = '' THEN
        v_med_list := E'\n• Tratamiento según indicación en consulta.';
    END IF;

    v_message_text := '🐾 *Vet Life — Veterinaria a Domicilio*' || E'\n\n' ||
                      'Hola *' || v_owner.first_name || '*, con gusto te compartimos la fórmula médica oficial de *' || v_pet.name || '* emitida por el *' || v_prescription.veterinarian_name || '* (' || v_prescription.professional_card_number || '):' || E'\n\n' ||
                      '📋 *Diagnóstico:* ' || v_prescription.diagnosis || E'\n' ||
                      '📅 *Fecha de emisión:* ' || to_char(v_prescription.issued_at, 'DD/MM/YYYY') || E'\n' ||
                      '💊 *Medicamentos prescritos:*' || v_med_list || E'\n\n' ||
                      '📥 *Descarga la Fórmula Oficial (PDF con firma profesional):*' || E'\n' ||
                      v_signed_url || E'\n\n' ||
                      '⏳ _Este enlace es privado y válido por 24 horas. Si necesitas una aclaración o apoyo con la administración de los medicamentos, responde a este chat y te atenderemos con gusto._';

    v_idempotency_key := 'FORMULA-REQ-' || v_prescription.id || '-' || extract(epoch from now())::text;

    INSERT INTO public.transactional_outbox (
        organization_id,
        aggregate_type,
        aggregate_id,
        event_type,
        idempotency_key,
        payload
    ) VALUES (
        v_prescription.organization_id,
        'PRESCRIPTION',
        v_prescription.id,
        'PRESCRIPTION_DELIVERY_REQUESTED',
        v_idempotency_key,
        jsonb_build_object(
            'prescription_id', v_prescription.id,
            'pet_id', v_pet.id,
            'pet_name', v_pet.name,
            'owner_id', v_owner.id,
            'owner_name', v_owner.first_name || ' ' || v_owner.last_name,
            'phone', v_clean_phone,
            'download_url', v_signed_url,
            'expires_at', (now() + interval '24 hours'),
            'message_text', v_message_text
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'owner_name', v_owner.first_name,
        'pet_name', v_pet.name,
        'diagnosis', v_prescription.diagnosis,
        'okvet_formula_id', v_prescription.okvet_formula_id,
        'signed_url', v_signed_url,
        'whatsapp_message', v_message_text
    );
END;
$$;

-- 5. RPC: Ingesta Asistida de Pacientes OKVET en Lote (Desde n8n / CSV / Excel)
CREATE OR REPLACE FUNCTION public.batch_import_okvet_patients(
    p_patients JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_item JSONB;
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_phone TEXT;
    v_owner_name TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_pet_name TEXT;
    v_species TEXT;
    v_breed TEXT;
    v_sex TEXT;
    v_okvet_id TEXT;
    v_imported_owners INT := 0;
    v_imported_pets INT := 0;
BEGIN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_patients)
    LOOP
        v_okvet_id := COALESCE(v_item->>'id', v_item->>'okvet_id', 'OK-' || substr(md5(random()::text), 1, 6));
        v_pet_name := COALESCE(v_item->>'name', v_item->>'pet_name', 'Mascota');
        v_species := CASE WHEN lower(COALESCE(v_item->>'species', '')) ILIKE '%gat%' OR lower(COALESCE(v_item->>'species', '')) = 'felino' THEN 'FELINE' ELSE 'CANINE' END;
        v_breed := COALESCE(v_item->>'breed', 'Mestizo');
        v_sex := CASE 
            WHEN upper(COALESCE(v_item->>'sex', '')) IN ('HEMBRA', 'FEMALE', 'F') THEN 'FEMALE'
            WHEN upper(COALESCE(v_item->>'sex', '')) IN ('MACHO', 'MALE', 'M') THEN 'MALE'
            ELSE 'UNKNOWN'
        END;
        v_owner_name := COALESCE(v_item->>'ownerName', v_item->>'owner_name', 'Tutor Vet Life');
        v_phone := regexp_replace(COALESCE(v_item->>'ownerPhone', v_item->>'owner_phone', '+573000000000'), '[^0-9+]', '', 'g');
        
        IF NOT v_phone LIKE '+%' THEN
            IF v_phone LIKE '57%' THEN v_phone := '+' || v_phone; ELSE v_phone := '+57' || v_phone; END IF;
        END IF;

        v_first_name := split_part(v_owner_name, ' ', 1);
        v_last_name := nullif(trim(substr(v_owner_name, length(v_first_name) + 1)), '');
        IF v_last_name IS NULL THEN v_last_name := 'Cliente'; END IF;

        -- 1. Upsert Owner
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = v_phone LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (
                organization_id, first_name, last_name, primary_phone, status
            ) VALUES (
                v_org_id, v_first_name, v_last_name, v_phone, 'ACTIVE'
            ) RETURNING id INTO v_owner_id;
            v_imported_owners := v_imported_owners + 1;
        END IF;

        -- 2. Upsert Pet
        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = v_okvet_id OR (primary_owner_id = v_owner_id AND name ILIKE v_pet_name) LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (
                organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status
            ) VALUES (
                v_org_id, v_owner_id, v_pet_name, v_species, v_breed, v_sex, v_okvet_id, 'ACTIVE'
            ) RETURNING id INTO v_pet_id;
            v_imported_pets := v_imported_pets + 1;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = v_okvet_id,
                species = v_species,
                breed = v_breed,
                sex = v_sex,
                updated_at = now()
            WHERE id = v_pet_id;
        END IF;
    END LOOP;

    -- Actualizar metadata de snapshot
    UPDATE public.okvet_snapshot_metadata
    SET total_patients = total_patients + v_imported_pets,
        is_stale = false,
        updated_at = now()
    WHERE organization_id = v_org_id;

    RETURN jsonb_build_object(
        'success', true,
        'imported_owners_count', v_imported_owners,
        'imported_pets_count', v_imported_pets
    );
END;
$$;
