DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
-- Fórmula: 2696832 para Limon (Margarita Maria Ruiz Maya)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573006038517' OR (document_number = '1128283893' AND '1128283893' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Margarita', 'Maria Ruiz Maya', 'CC', '1128283893', '+573006038517', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Limon' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Limon', 'FELINE', 'Criollo(a)', 'MALE', 'OKV-P-2696832', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696832' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696832',
                'APPROVED', 'medical-records', 'prescriptions/2696832.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696832') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696832',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Hemoparasitos · ERA · Lipidosis hepatica',
                '[{"name":"Marbofloxacina tabletas 5mg (tabletas)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Prednisolona tabletas 5mg (tabletas)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Silimarina capsulas 150mg (capsulas)","dose":"Administrar por via oral 1 capsula cada 24 horas durante 10 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 24 horas durante 10 dias. Dar siempre después de comer"},{"name":"Liv 52 frasco oral (frasco)","dose":"Administrar por via oral 3ml cada 12 horas durante 1 mes. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 3ml cada 12 horas durante 1 mes. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Se sugiere realizar examenes de sangre  *Se sugiere realizar ecografía abdominal especializada *Se recomienda realizar procedimiento de colocar tubo de esofágostomia',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696832.pdf'
            );
        END IF;

-- Fórmula: 2697689 para Max (Carolina Gomez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573147923927' OR (document_number = '1053784160' AND '1053784160' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Carolina', 'Gomez', 'CC', '1053784160', '+573147923927', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Max' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Max', 'CANINE', 'Rottweiler', 'MALE', 'OKV-P-2697689', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2697689' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2697689',
                'APPROVED', 'medical-records', 'prescriptions/2697689.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2697689') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2697689',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'OTITIS CRONICA',
                '[{"name":"Prednisolona tableta 20mg (tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas durante 8 días,","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas durante 8 días,"},{"name":"después 1 tableta cada 48 horas horas durante 8 dias,","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"},{"name":"después 1 tableta cada 72 horas durante 8 dias, después del consumo de alimento.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"},{"name":"Apoquel tabletas 16mg (tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas, durante 10 dias, después del consumo de alimento.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas, durante 10 dias, después del consumo de alimento."},{"name":"Gentax otico (solución antiseptica)","dose":"continuar con el gentax.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"continuar con el gentax."},{"name":"epioptic (solución antiseptica)","dose":"continuar con la medicación.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"continuar con la medicación."}]'::jsonb, 'Recomendaciones  * se sugiere realizar interconsulta dermatológica con prontitud.',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2697689.pdf'
            );
        END IF;

-- Fórmula: 2698587 para Sol (Juan Pablo Agudelo)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573004837934' OR (document_number = '70908932' AND '70908932' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Juan', 'Pablo Agudelo', 'CC', '70908932', '+573004837934', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Sol' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Sol', 'CANINE', 'Mestizo', 'FEMALE', 'OKV-P-2698587', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2698587' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2698587',
                'APPROVED', 'medical-records', 'prescriptions/2698587.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2698587') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2698587',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Postquirurgico de criocirugia',
                '[{"name":"Cefalexina tabletas 500mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Dipirona tabletas 500mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Baxidin/ Sanix o ciclorac frasco spray (frasco)","dose":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden"},{"name":"Meloxicam tabletas 3mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 24 horas durante 4 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 24 horas durante 4 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Uso de collar isabelino *Revision medica en 2 dias, agendar cita previa',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2698587.pdf'
            );
        END IF;

-- Fórmula: 2699355 para Martin (SONIA PEREZ ECHEVERRI)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573245511827' OR (document_number = '430889230' AND '430889230' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'SONIA', 'PEREZ ECHEVERRI', 'CC', '430889230', '+573245511827', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Martin' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Martin', 'FELINE', 'Persa', 'MALE', 'OKV-P-2699355', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2699355' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2699355',
                'APPROVED', 'medical-records', 'prescriptions/2699355.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2699355') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2699355',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Bronquitis cronica alergica · Neumonía',
                '[{"name":"Prednisolona tableta 5mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Luego 1/2 tableta cada 48 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Luego 1/2 tableta cada 48 horas durante 6 dias. Dar siempre después de comer"},{"name":"Marboquin tabletas 25mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Seretide 25/125 mcg inhalador uso humano (inhalador)","dose":"Realizar 2 puff cada 8 horas durante 10 dias. Se sugiere utilizar inhalocamara. Luego 2 puff cada 12 horas durante 20 dias.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar 2 puff cada 8 horas durante 10 dias. Se sugiere utilizar inhalocamara. Luego 2 puff cada 12 horas durante 20 dias."},{"name":"Nebulizaciones (0.5ml de berudual + 3ml solucion salina) (nebulizaciónes)","dose":"Realizar nebulizaciónes cada 8 horas durante 10 dias. Luego cada 12 horas durante 20 dias. Aplicar a la cámara del nebulizador 3ml de solución salina + 0.5ml de berudual","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar nebulizaciónes cada 8 horas durante 10 dias. Luego cada 12 horas durante 20 dias. Aplicar a la cámara del nebulizador 3ml de solución salina + 0.5ml de berudual"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Se sugiere realizar radiografia de torax *Evitar corrientes de aire, humedad y baños *Control medico en 2 dias, agendar cita previa',
                '2026-11-21'::date, ('2026-11-21'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2699355.pdf'
            );
        END IF;

-- Fórmula: 2701130 para Mamba Álvarez (Sergio Álvarez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113058304' OR (document_number = '71319473' AND '71319473' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Sergio', 'Álvarez', 'CC', '71319473', '+573113058304', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Mamba Álvarez' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Mamba Álvarez', 'CANINE', 'Criollo(a)', 'FEMALE', 'OKV-P-2701130', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2701130' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2701130',
                'APPROVED', 'medical-records', 'prescriptions/2701130.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2701130') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2701130',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Otitis interna',
                '[{"name":"Previcox tableta 227mg (tabletas)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 5 dias. Dar siempre después de comer"},{"name":"Dipirona tabletas 500mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas Durante 4 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas Durante 4 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Control medico en 4 dias, agendar cita previa',
                '2026-11-21'::date, ('2026-11-21'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2701130.pdf'
            );
        END IF;

    -- Actualizar metadata de snapshot
    UPDATE public.okvet_snapshot_metadata
    SET total_patients = (SELECT count(*) FROM public.pets),
        is_stale = false,
        updated_at = now()
    WHERE organization_id = v_org_id;
END;
$$;
