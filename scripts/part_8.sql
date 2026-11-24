DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
-- Fórmula: 2695048 para Ramona (Isabela Londoño)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573117482184' OR (document_number = '1053825487' AND '1053825487' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Isabela', 'Londoño', 'CC', '1053825487', '+573117482184', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Ramona' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Ramona', 'CANINE', 'Cane corso o mastín italiano', 'FEMALE', 'OKV-P-2695048', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2695048' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2695048',
                'APPROVED', 'medical-records', 'prescriptions/2695048.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2695048') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2695048',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Accidente por congénere',
                '[{"name":"Meloxic tabletas 2mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 24 horas durante 4 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 24 horas durante 4 dias. Dar siempre después de comer"},{"name":"Metronidazol tableta 500mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Cefalexina tabletas 500mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"baxidin frasco spray (frasco)","dose":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Uso de collar isabelino  *Mantener reposo y quietud *Control medico en 4 dias, agendar cita previa',
                '2026-11-19'::date, ('2026-11-19'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2695048.pdf'
            );
        END IF;

-- Fórmula: 2695210 para Chiska Guzman (LILIBETH GUZMAN)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573043580896' OR (document_number = '1129580474' AND '1129580474' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'LILIBETH', 'GUZMAN', 'CC', '1129580474', '+573043580896', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Chiska Guzman' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Chiska Guzman', 'CANINE', 'Golden retriever', 'FEMALE', 'OKV-P-2695210', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2695210' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2695210',
                'APPROVED', 'medical-records', 'prescriptions/2695210.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2695210') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2695210',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Sindrome vestibular · otitis media · Sindrome de Horner',
                '[{"name":"Neurobion tabletas (tabletas)","dose":"Administrar por via oral 1 tableta cada 24 horas durante 15 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 24 horas durante 15 dias. Dar siempre después de comer"},{"name":"Betahistina tabletas 16mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 24 horas durante 8 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 24 horas durante 8 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Se sugiere realizar radiografia de craneo *control medico en 24 horas, agendar cita previa',
                '2026-11-19'::date, ('2026-11-19'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2695210.pdf'
            );
        END IF;

-- Fórmula: 2695228 para PERLA (CLAUDIA ALZTE)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573148408140' OR (document_number = '1041327260' AND '1041327260' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'CLAUDIA', 'ALZTE', 'CC', '1041327260', '+573148408140', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'PERLA' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'PERLA', 'CANINE', 'Shih Tzu', 'FEMALE', 'OKV-P-2695228', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2695228' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2695228',
                'APPROVED', 'medical-records', 'prescriptions/2695228.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2695228') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2695228',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Displasia de cadera · Espondiloartrosis · enfermedad degenerativa articular',
                '[{"name":"Previcox tableta 57mg (tableta)","dose":"Administrar por via oral 1 tableta cada 24 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 24 horas durante 5 dias. Dar siempre después de comer"},{"name":"Lyrica capsulas 25mg (capsulas)","dose":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar siempre después de comer"},{"name":"Dipirona tableta 500mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Omeprazol capsulas (capsulas)","dose":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar media hora antes del desayuno","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar media hora antes del desayuno"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Mantener reposo y quietud *Pendiente informe de radiografia *Control medico en 2 dias, agendar cita previa',
                '2026-11-19'::date, ('2026-11-19'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2695228.pdf'
            );
        END IF;

-- Fórmula: 2695639 para MICHI (JOSE MANUEL GONZALEZ)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573004957965' OR (document_number = '1001725416' AND '1001725416' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'JOSE', 'MANUEL GONZALEZ', 'CC', '1001725416', '+573004957965', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'MICHI' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'MICHI', 'FELINE', 'Criollo(a)', 'FEMALE', 'OKV-P-2695639', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2695639' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2695639',
                'APPROVED', 'medical-records', 'prescriptions/2695639.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2695639') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2695639',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Bronquitis cronica alergica · Neumonía',
                '[{"name":"Prednisolona tableta 5mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 12 horas durante 1 semana. Luego 1/2 tableta cada 24 horas durante 1 semana. Terminando 1/2 tableta cada 48 horas durante 1 semana. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 12 horas durante 1 semana. Luego 1/2 tableta cada 24 horas durante 1 semana. Terminando 1/2 tableta cada 48 horas durante 1 semana. Dar siempre después de comer"},{"name":"Marboquin tableta 25mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Seretide 25/125 mcg inhalador uso humano (inhalador)","dose":"Aplicar  2 puff cada 8 horas durante 10 dias. Luego 2 puff cada 12 horas durante 20 dias. Se sugiere utilizar inhalocamara","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar  2 puff cada 8 horas durante 10 dias. Luego 2 puff cada 12 horas durante 20 dias. Se sugiere utilizar inhalocamara"},{"name":"Nebulizaciones (0.5ml de berudual + 3ml solucion salina) (nebulizaciónes)","dose":"Se sugiere realizar nebulizaciones cada 8 horas durante 30 dias. Aplicar 0.5ml de berudual en 3ml de solución salina","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Se sugiere realizar nebulizaciones cada 8 horas durante 30 dias. Aplicar 0.5ml de berudual en 3ml de solución salina"},{"name":"Teofilina tabletas de 80mg formula magistral (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 10 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 10 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Pendiente resultados de radiogafia *Se sugiere agendar cita de neumológia *En caso de vomitos, inapetencia, decaimiento, diarreas, notificar para control medico *control medico en 48 horas, agendar cita previa',
                '2026-11-19'::date, ('2026-11-19'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2695639.pdf'
            );
        END IF;

-- Fórmula: 2696038 para ONIX (YESENIA LOPERA)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573157815806' OR (document_number = '1128459292' AND '1128459292' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'YESENIA', 'LOPERA', 'CC', '1128459292', '+573157815806', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'ONIX' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'ONIX', 'CANINE', 'Bulldog francés', 'MALE', 'OKV-P-2696038', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696038' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696038',
                'APPROVED', 'medical-records', 'prescriptions/2696038.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696038') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696038',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Enfermedad degenerativa articular  · displasia de codo · trauma tejidos blandos',
                '[{"name":"Previcox tableta 57mg (tableta)","dose":"Administrar por via oral 1 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Lyrica capsulas 25mg (capsulas)","dose":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar siempre después de comer"},{"name":"Acetaminofen tabletas 500mg (tabletas)","dose":"Administrar por via oral 1/4 tableta cada 12 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/4 tableta cada 12 horas durante 6 dias. Dar siempre después de comer"},{"name":"Neurobion tabletas (tableta)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 30 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 30 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Mantener reposo y quietud *En caso de vomitos, inapetencia, decaimiento, diarreas, notificar para control medico  *Control medico en 4 dias, agendar cita previa',
                '2026-11-19'::date, ('2026-11-19'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696038.pdf'
            );
        END IF;
END;
$$;
