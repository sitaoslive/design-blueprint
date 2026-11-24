DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
-- Fórmula: 2696154 para LLUVIA (PAULINA MESA)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573136308170' OR (document_number = '43160403' AND '43160403' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'PAULINA', 'MESA', 'CC', '43160403', '+573136308170', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'LLUVIA' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'LLUVIA', 'CANINE', 'Pastor Alemán', 'FEMALE', 'OKV-P-2696154', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696154' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696154',
                'APPROVED', 'medical-records', 'prescriptions/2696154.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696154') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696154',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Injuria renal aguda',
                '[{"name":"Vitamina E capsulas 400UI (Capsulas)","dose":"Administrar por via oral 1 capsula cada 24 horas durante 1 mes. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 24 horas durante 1 mes. Dar siempre después de comer"},{"name":"Hidroxido aluminio frasco oral (frasco)","dose":"Administrar por via sonda de alimentación 12ml cada 8 horas durante 10 dias.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via sonda de alimentación 12ml cada 8 horas durante 10 dias."},{"name":"Hidrataciones subcutáneas cada 24 horas (inyectable)","dose":"Aplicar por via subcutanea 70ml/kg/dia hasta nueva indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar por via subcutanea 70ml/kg/dia hasta nueva indicación"},{"name":"LATA EN de proplan (Lata)","dose":"Administrar por via sonda de alimentación 130ml cada 6 horas hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via sonda de alimentación 130ml cada 6 horas hasta nueva orden"}]'::jsonb, 'RECOMENDACIONES *Se sugiere realizar perfil renal completo *se sugiere realizar ecografía abdominal especializada',
                '2026-11-19'::date, ('2026-11-19'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696154.pdf'
            );
        END IF;

-- Fórmula: 2696628 para TRUFA (Viviana Trujillo)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573108374247' OR (document_number = '43873702' AND '43873702' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Viviana', 'Trujillo', 'CC', '43873702', '+573108374247', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'TRUFA' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'TRUFA', 'FELINE', 'Mestizo', 'FEMALE', 'OKV-P-2696628', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696628' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696628',
                'APPROVED', 'medical-records', 'prescriptions/2696628.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696628') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696628',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Gastritis · Indiscreción alimentaria',
                '[{"name":"Cerenia frasco inyectable (inyectable)","dose":"Aplicar por via intravenosa 0.4ml cada 24 horas durante 2 días. Se sugiere diluir con solución salina","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar por via intravenosa 0.4ml cada 24 horas durante 2 días. Se sugiere diluir con solución salina"},{"name":"Omeprazol frasco inyectable 8mg/ml (frasco)","dose":"Aplicar por via intravenosa 0.39ml cada 24 horas durante 2 días.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar por via intravenosa 0.39ml cada 24 horas durante 2 días."},{"name":"Ondansetron ampolla de 2mg (ampolla)","dose":"Aplicar por via intravenosa 0,45ml cada 24 horas durante 2 dias.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar por via intravenosa 0,45ml cada 24 horas durante 2 dias."}]'::jsonb, 'RECOMENDACIONES *Se sugiere administrar alimento blando digestivo',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696628.pdf'
            );
        END IF;

-- Fórmula: 2696634 para OSCAR (Tomas Echavarria)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573104842901' OR (document_number = '10376344196' AND '10376344196' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Tomas', 'Echavarria', 'CC', '10376344196', '+573104842901', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'OSCAR' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'OSCAR', 'CANINE', 'Criollo(a)', 'MALE', 'OKV-P-2696634', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696634' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696634',
                'APPROVED', 'medical-records', 'prescriptions/2696634.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696634') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696634',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Infección en el sitio quirurgico',
                '[{"name":"Marboquin tabletas 50mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas Durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas Durante 6 dias. Dar siempre después de comer"},{"name":"Baxidin/ Sanix o ciclorac frasco spray (frasco)","dose":"Realizar limpiezas en la zona de la herida 3 veces hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpiezas en la zona de la herida 3 veces hasta nueva orden"},{"name":"Fitoestimule gel (gel)","dose":"Aplicar a nivel de la zona de la herida 3 veces al dia hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar a nivel de la zona de la herida 3 veces al dia hasta nueva orden"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer  *Uso de collar isabelino  *Control medico en 3 dias, agendar cita previa',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696634.pdf'
            );
        END IF;

-- Fórmula: 2696649 para Toby (Rodrigo Cuesta)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113413925' OR (document_number = '70074581' AND '70074581' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Rodrigo', 'Cuesta', 'CC', '70074581', '+573113413925', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Toby' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Toby', 'FELINE', 'Ragdoll', 'MALE', 'OKV-P-2696649', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696649' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696649',
                'APPROVED', 'medical-records', 'prescriptions/2696649.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696649') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696649',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'ENFERMEDAD RENAL CRONICA (IRIS 1) · ENFERMEDAD INFLAMATORIA INTESTINAL · HIPERTIROIDISMO FELINO',
                '[{"name":"Nefrotec ds tabletas (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 1 mes. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 1 mes. Dar siempre después de comer"},{"name":"Proplan NF early (concentrado)","dose":"Administrar como unica fuente de alimento durante 3 meses.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar como unica fuente de alimento durante 3 meses."}]'::jsonb, 'RECOMENDACIONES *Se sugiere agendar cita de nefrologia  *Se recomienda realizar ecografía abdominal y examenes de seguimiento en 3 meses *En caso de vomitos, inapetencia, decaimiento, notificar para control medico',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696649.pdf'
            );
        END IF;

-- Fórmula: 2696656 para Ganya (Jhon Esteban Patiño)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573506850553' OR (document_number = '1128457811' AND '1128457811' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Jhon', 'Esteban Patiño', 'CC', '1128457811', '+573506850553', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Ganya' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Ganya', 'CANINE', 'Pit bull', 'FEMALE', 'OKV-P-2696656', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696656' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696656',
                'APPROVED', 'medical-records', 'prescriptions/2696656.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696656') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696656',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'CCE',
                '[{"name":"Previcox tableta 227mg (tableta)","dose":"Administrar por via oral 3/4 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 3/4 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Lyrica capsulas 50mg (capsulas)","dose":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696656.pdf'
            );
        END IF;
END;
$$;
