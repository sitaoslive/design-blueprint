DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
-- Fórmula: 2656354 para Nilo (CATALINA GONZALEZ)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573193735380' OR (document_number = '43756414' AND '43756414' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'CATALINA', 'GONZALEZ', 'CC', '43756414', '+573193735380', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Nilo' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Nilo', 'CANINE', 'Pointer', 'MALE', 'OKV-P-2656354', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2656354' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2656354',
                'APPROVED', 'medical-records', 'prescriptions/2656354.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2656354') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2656354',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Pancreatitis? · Hemoparasitos? · Pielonefritis?',
                '[{"name":"Prednisolona 20mg (tableta)","dose":"Administrar por via oral  1 tableta cada 24 horas durante 5 dias. Luego 1 tableta cada 48 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral  1 tableta cada 24 horas durante 5 dias. Luego 1 tableta cada 48 horas durante 5 dias. Dar siempre después de comer"},{"name":"Dipirona tableta 500mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Acetaminofen tabletas 500mg (tableta)","dose":"Administrar por via oral 1/4 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/4 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Marboquin tableta 50mg (tableta)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Control medico en 2 dias, agendar cita previa *En caso de vomitos, inapetencia, decaimiento, diarreas, notificar para control medico *Se sugiere realizar ecografía abdominal especializada',
                '2026-11-04'::date, ('2026-11-04'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2656354.pdf'
            );
        END IF;

-- Fórmula: 2658407 para Samantha (Nathalia Andrea Robles Ortiz)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573006064980' OR (document_number = '1096240077' AND '1096240077' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Nathalia', 'Andrea Robles Ortiz', 'CC', '1096240077', '+573006064980', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Samantha' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Samantha', 'CANINE', 'French Poodle', 'FEMALE', 'OKV-P-2658407', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2658407' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2658407',
                'APPROVED', 'medical-records', 'prescriptions/2658407.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2658407') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2658407',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Indiscreción alimentaria · Disbiosis intestinal · Pancreatitis?',
                '[{"name":"Metronid suspensión 250mg (suspensión)","dose":"Administrar por via oral 0.5ml cada 12 horas Durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 0.5ml cada 12 horas Durante 5 dias. Dar siempre después de comer"},{"name":"Aciflux suspensión 20gr (suspensión)","dose":"Administrar por via oral 1ml cada 12 horas durante 5 dias. Dar media hora antes del desayuno y la cena","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1ml cada 12 horas durante 5 dias. Dar media hora antes del desayuno y la cena"},{"name":"Digyton frasco oral (frasco)","dose":"Administrar por via oral 1ml cada 12 horas durante 20 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1ml cada 12 horas durante 20 dias. Dar siempre después de comer"},{"name":"Fortiflora sobres caninos (sobres)","dose":"Administrar por via oral 1/2 sobre cada 12 horas durante 10 dias. Adicionar a la ración de alimento","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 sobre cada 12 horas durante 10 dias. Adicionar a la ración de alimento"},{"name":"Hills Z/D  concentrado (concentrado)","dose":"Administrar como unica fuente de alimento como unica fuente durante 3 meses","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar como unica fuente de alimento como unica fuente durante 3 meses"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Se sugiere realizar ecografía abdominal especializada  *Se sugiere realizar coprologico  *En caso de vomitos, inapetencia, decaimiento, diarreas, notificar para control medico',
                '2026-11-05'::date, ('2026-11-05'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2658407.pdf'
            );
        END IF;

-- Fórmula: 2658527 para SMILE (nancy perez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573148702123' OR (document_number = '43039998' AND '43039998' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'nancy', 'perez', 'CC', '43039998', '+573148702123', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'SMILE' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'SMILE', 'FELINE', 'Mestizo', 'FEMALE', 'OKV-P-2658527', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2658527' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2658527',
                'APPROVED', 'medical-records', 'prescriptions/2658527.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2658527') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2658527',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'EII · Indiscreción alimentaria · Disbiosis intestinal',
                '[{"name":"Aciflux suspensión 20gr (suspensión)","dose":"Administrar por via oral 0.8ml cada 12 horas durante 5 dias. Dar media hora antes del desayuno a la cena","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 0.8ml cada 12 horas durante 5 dias. Dar media hora antes del desayuno a la cena"},{"name":"Fortiflora sobres felinos (sobres)","dose":"Administrar por via oral 1/2 sobre cada 12 horas durante 5 dias. Adicionar a la ración de alimento","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 sobre cada 12 horas durante 5 dias. Adicionar a la ración de alimento"},{"name":"Digyton frasco oral (frasco)","dose":"Administrar por via oral 0.5ml cada 12 horas durante 20 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 0.5ml cada 12 horas durante 20 dias. Dar siempre después de comer"},{"name":"concentrado ID de hills (concentrado)","dose":"Administrar como unica fuente de alimento durante 3 meses","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar como unica fuente de alimento durante 3 meses"},{"name":"Prednisolona tableta 5mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 5 dias. Luego 1/2 tableta cada 48 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 5 dias. Luego 1/2 tableta cada 48 horas durante 5 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Control medico en 4 dias, agendar cita previa *En caso de vomitos, inapetencia, decaimiento, diarreas, notificar para control medico  *Se sugiere realizar ecografía abdominal especializada de control en 20 dias a 1 mes',
                '2026-11-05'::date, ('2026-11-05'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2658527.pdf'
            );
        END IF;

-- Fórmula: 2665552 para Akira (David Camilo Hayala Marín)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573208692047' OR (document_number = '1000578603' AND '1000578603' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'David', 'Camilo Hayala Marín', 'CC', '1000578603', '+573208692047', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Akira' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Akira', 'CANINE', 'Husky siberiano', 'FEMALE', 'OKV-P-2665552', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2665552' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2665552',
                'APPROVED', 'medical-records', 'prescriptions/2665552.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2665552') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2665552',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Posquirurgico de sacolitis',
                '[{"name":"Previcox 227 mg (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 24 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 24 horas durante 6 días"},{"name":"Marboquin tabletas 50mg (Tabletas)","dose":"Administrar vía oral 1 tableta y 1/2 cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta y 1/2 cada 12 horas durante 6 días"},{"name":"Acetaminofen tableta 500mg (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 12 horas durante 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 12 horas durante 5 días"},{"name":"Lyrica capsulas 75mg (Cápsulas)","dose":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días"},{"name":"Baxidin/ Sanix o ciclorac frasco spray (Spray)","dose":"Realizar limpieza en la zona de la herida con ayuda de una gasa cada 8 durante 15 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpieza en la zona de la herida con ayuda de una gasa cada 8 durante 15 días"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de Inapetencia, decaimiento, diarreas o vómitos informar para control medico *Control medico el día lunes, agendar cita previa *Retiro de puntos en 10 días, agendar cita previa',
                '2026-11-07'::date, ('2026-11-07'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2665552.pdf'
            );
        END IF;

-- Fórmula: 2668472 para LUNA (MARTHA ESTRADA)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573044448283' OR (document_number = '42777363' AND '42777363' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'MARTHA', 'ESTRADA', 'CC', '42777363', '+573044448283', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'LUNA' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'LUNA', 'CANINE', 'Bulldog francés', 'FEMALE', 'OKV-P-2668472', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2668472' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2668472',
                'APPROVED', 'medical-records', 'prescriptions/2668472.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2668472') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2668472',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Luxación Coxofemoral · Fractura Cabeza Femoral',
                '[{"name":"Lyrica cápsulas 25mg (Cápsulas)","dose":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días"},{"name":"Previcox tableta 57mg (Tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas durante 6 días"},{"name":"Acetaminofen tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1/4 tableta cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/4 tableta cada 12 horas durante 6 días"},{"name":"Dipirona tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1/4 tableta cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/4 tableta cada 12 horas durante 6 días"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de inapetencias, decaimiento, vómitos o diarreas informar para control medico  *Se sugiere realizar radiografías de cadera *Pendiente resultado de exámenes de sangre',
                '2026-11-09'::date, ('2026-11-09'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2668472.pdf'
            );
        END IF;

-- Fórmula: 2669593 para Danna (Yesenia Alexandra Gómez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573117898195' OR (document_number = '1036957661' AND '1036957661' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Yesenia', 'Alexandra Gómez', 'CC', '1036957661', '+573117898195', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Danna' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Danna', 'CANINE', 'Golden retriever', 'FEMALE', 'OKV-P-2669593', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2669593' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2669593',
                'APPROVED', 'medical-records', 'prescriptions/2669593.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2669593') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2669593',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Hipotiroidismo',
                '[{"name":"Neurobion tabletas (Tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas durante 90 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas durante 90 días"},{"name":"Vitamina E  cápsulas 400UI (capsula)","dose":"Administrar vía oral 1 cápsula cada 24 horas durante 30 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cápsula cada 24 horas durante 30 días"},{"name":"Dipirona tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1 tableta cada 12 horas durante 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 12 horas durante 5 días"}]'::jsonb, '*Administrar medicamentos después de comer  *En caso de decaimiento, inapetencias, vómitos o diarreas informar para control medico *Se sugiere realizar ecografía de Tiroides *Se sugiere realizar Perfil tiroideo  *Se sugiere realizar exámenes de sangre (Hemograma, creatinina,BUN/UREA,albumina) *Según evolución realizar cita cardiología',
                '2026-11-09'::date, ('2026-11-09'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2669593.pdf'
            );
        END IF;

-- Fórmula: 2669711 para Chiquitin (Sofía Serrano)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573116640190' OR (document_number = '1036955085' AND '1036955085' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Sofía', 'Serrano', 'CC', '1036955085', '+573116640190', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Chiquitin' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Chiquitin', 'FELINE', 'Mestizo', 'MALE', 'OKV-P-2669711', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2669711' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2669711',
                'APPROVED', 'medical-records', 'prescriptions/2669711.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2669711') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2669711',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Accidente por congénere',
                '[{"name":"Marboquin tableta 25mg (Tabletas)","dose":"Administrar vía oral 3/4 de tableta cada 24 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 3/4 de tableta cada 24 horas durante 6 días"},{"name":"Meloxicam  frasco goteo 0.15% (Gotas)","dose":"Administrar vía oral 5 gotas cada 24 horas durante 4 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 5 gotas cada 24 horas durante 4 días"},{"name":"Baxidin/ Sanix o ciclorac frasco spray (Spray)","dose":"Realizar limpieza en la zona de la herida con ayuda de una gasa cada 8 horas durante 15 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpieza en la zona de la herida con ayuda de una gasa cada 8 horas durante 15 días"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de Decaimiento, inapetencias, vómitos o diarreas informar para control medico *Control medico el día miércoles, agendar cita previa',
                '2026-11-09'::date, ('2026-11-09'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2669711.pdf'
            );
        END IF;

-- Fórmula: 2671475 para Kenji (sara velasquez1037)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573003563036' OR (document_number = '1037593664' AND '1037593664' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'sara', 'velasquez1037', 'CC', '1037593664', '+573003563036', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Kenji' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Kenji', 'CANINE', 'Goldendoodle', 'MALE', 'OKV-P-2671475', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2671475' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2671475',
                'APPROVED', 'medical-records', 'prescriptions/2671475.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2671475') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2671475',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Gastritis · Dermatofitosis',
                '[{"name":"Aciflux suspensión 200mg (Suspensión)","dose":"Administrar vía oral 3 ml cada 12 horas durante 10 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 3 ml cada 12 horas durante 10 días"},{"name":"Anavimin tabletas (Tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas durante 20 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas durante 20 días"},{"name":"Shed-x frasco oral (Suspensión)","dose":"Administrar vía oral 1 cucharada en el alimento cada 24 horas durante 30 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cucharada en el alimento cada 24 horas durante 30 días"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de inapetencias, decaimiento, vómitos o diarreas informar para control medico *Continuar con los baños cada 15 a 21 días con el shampoo enviado anteriormente',
                '2026-11-10'::date, ('2026-11-10'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2671475.pdf'
            );
        END IF;

-- Fórmula: 2671717 para Max (Carolina Gomez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573147923927' OR (document_number = '1053784160' AND '1053784160' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Carolina', 'Gomez', 'CC', '1053784160', '+573147923927', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Max' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Max', 'CANINE', 'Rottweiler', 'MALE', 'OKV-P-2671717', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2671717' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2671717',
                'APPROVED', 'medical-records', 'prescriptions/2671717.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2671717') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2671717',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Otitis Interna · Hipotiroidismo',
                '[{"name":"Nicilan tableta 400/100mg (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 12 horas durante 6 días"},{"name":"Epiotic frasco otico (Gotas)","dose":"Instilar cantidad abundante en ambos oídos, hacer masajes por unos segundos y dejar que se sacuda. REPETIR ESTE PROCESO. Luego secar y limpiar con gasa suave. REPETIR cada 12 horas por 21 días, luego cada 3 días, hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Instilar cantidad abundante en ambos oídos, hacer masajes por unos segundos y dejar que se sacuda. REPETIR ESTE PROCESO. Luego secar y limpiar con gasa suave. REPETIR cada 12 horas por 21 días, luego cada 3 días, hasta nueva orden"},{"name":"Cortanvance spray (Spray)","dose":"15 MINUTOS DESPUES de la limpieza, hacer aspersión en cada oído","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"15 MINUTOS DESPUES de la limpieza, hacer aspersión en cada oído"},{"name":"adentro y en la cara interna de estos. REPETIR cada 24 horas por 10 días, luego cada 3 días hasta nueva orden.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"},{"name":"Gentax otico (Ungüento)","dose":"15 MINUTOS DESPUES de la aplicación de CORTAVANCE aplicar dentro","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"15 MINUTOS DESPUES de la aplicación de CORTAVANCE aplicar dentro"},{"name":"de ambos oídos cantidad suficiente Y luego realizar masaje para mejor distribución. REPETIR CADA 12 HORAS POR 21 DÍAS.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"},{"name":"Lyrica cápsulas 75mg (Cápsulas)","dose":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días"},{"name":"Dipirona tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 12 horas durante 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 12 horas durante 5 días"},{"name":"Acetaminofen tableta 500mg (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 12 horas 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 12 horas 5 días"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de decaimiento, inapetencias, vómitos o diarreas informar para control medico *Pendiente resultado del cultivo *Pendiente resultado examen de sangre',
                '2026-11-10'::date, ('2026-11-10'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2671717.pdf'
            );
        END IF;

-- Fórmula: 2674239 para Odin Silva (ANGELA MARIA SILVA)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573116064028' OR (document_number = '43022431' AND '43022431' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'ANGELA', 'MARIA SILVA', 'CC', '43022431', '+573116064028', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Odin Silva' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Odin Silva', 'CANINE', 'Bernes de la montaña o Boyero de Berna', 'MALE', 'OKV-P-2674239', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2674239' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2674239',
                'APPROVED', 'medical-records', 'prescriptions/2674239.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2674239') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2674239',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Otitis Interna',
                '[{"name":"Prednizoo tableta 20mg (Tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas durante 6 días, Luego 1 tableta cada 48 horas durante una semana","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas durante 6 días, Luego 1 tableta cada 48 horas durante una semana"},{"name":"Dipirona tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1 tableta cada 12 horas durante 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 12 horas durante 5 días"},{"name":"Ciprofloxacina tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas durante 7 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas durante 7 días"},{"name":"Anavimin tabletas (Tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas durante 20 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas durante 20 días"},{"name":"Epiotic frasco otico (Gotas)","dose":"Instilar cantidad abundante en ambos oídos, hacer masajes por unos segundos y dejar que se sacuda. REPETIR ESTE PROCESO. Luego secar y limpiar con gasa suave. REPETIR cada 12 horas por 21 días, luego cada 3 días, hasta nueva orden.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Instilar cantidad abundante en ambos oídos, hacer masajes por unos segundos y dejar que se sacuda. REPETIR ESTE PROCESO. Luego secar y limpiar con gasa suave. REPETIR cada 12 horas por 21 días, luego cada 3 días, hasta nueva orden."},{"name":"Cortanvance spray (spray)","dose":"15 MINUTOS DESPUES de la limpieza, hacer aspersión en cada oído","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"15 MINUTOS DESPUES de la limpieza, hacer aspersión en cada oído"},{"name":"adentro y en la cara interna de estos. REPETIR cada 24 horas por 10 días, luego cada 3 días hasta nueva orden.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"},{"name":"Gentax otico (Ungüento)","dose":"15 MINUTOS DESPUES de la aplicación de CORTAVANCE aplicar dentro","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"15 MINUTOS DESPUES de la aplicación de CORTAVANCE aplicar dentro"},{"name":"de ambos oídos cantidad suficiente Y luego realizar masaje para mejor distribución. REPETIR CADA 12 HORAS POR 21 DÍAS.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de Inapetencias, decaimiento, vómitos o diarreas informar para control medico  *Pendiente resultado examen de sangre',
                '2026-11-11'::date, ('2026-11-11'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2674239.pdf'
            );
        END IF;

-- Fórmula: 2674718 para Celia (Juan Esteban Parra)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573016762836' OR (document_number = '1017132039' AND '1017132039' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Juan', 'Esteban Parra', 'CC', '1017132039', '+573016762836', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Celia' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Celia', 'CANINE', 'Mestizo', 'FEMALE', 'OKV-P-2674718', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2674718' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2674718',
                'APPROVED', 'medical-records', 'prescriptions/2674718.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2674718') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2674718',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Carcinoma de células transiciónales',
                '[{"name":"Previcox tableta 227mg (tableta)","dose":"Administrar por vía oral 1/2  tableta cada 24 horas durante 7 días. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por vía oral 1/2  tableta cada 24 horas durante 7 días. Dar siempre después de comer"},{"name":"Ut balance tabletas (tabletas)","dose":"Administrar por vía oral 1/2 tableta cada 24 horas durante  10 días. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por vía oral 1/2 tableta cada 24 horas durante  10 días. Dar siempre después de comer"},{"name":"Tranexam tabletas 500mg (tabletas)","dose":"Administrar por vía oral 1/2 tableta cada 12 horas Durante 5 días. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por vía oral 1/2 tableta cada 12 horas Durante 5 días. Dar siempre después de comer"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de decaimiento, inapetencias, vómitos o diarreas informar para control medico',
                '2026-11-11'::date, ('2026-11-11'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2674718.pdf'
            );
        END IF;

-- Fórmula: 2675224 para Chiska Guzman (LILIBETH GUZMAN)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573043580896' OR (document_number = '1129580474' AND '1129580474' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'LILIBETH', 'GUZMAN', 'CC', '1129580474', '+573043580896', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Chiska Guzman' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Chiska Guzman', 'CANINE', 'Golden retriever', 'FEMALE', 'OKV-P-2675224', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2675224' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2675224',
                'APPROVED', 'medical-records', 'prescriptions/2675224.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2675224') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2675224',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Otitis Interna · Sindrome Vestibular',
                '[{"name":"Prednizoo tableta 20mg (Tabletas)","dose":"Administrar vía oral3/4 de  tableta cada 24 horas durante 1 semana, Luego cada 48 horas durante 1 semana","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral3/4 de  tableta cada 24 horas durante 1 semana, Luego cada 48 horas durante 1 semana"},{"name":"Dipirona tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1 tableta cada 12 horas durante 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 12 horas durante 5 días"},{"name":"Lyrica capsulas 50mg (Cápsulas)","dose":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días"},{"name":"Epiotic frasco otico (Gotas)","dose":"Instilar cantidad abundante en ambos oídos, hacer masajes por unos segundos y dejar que se sacuda. REPETIR ESTE PROCESO. Luego secar y limpiar con gasa suave. REPETIR cada 12 horas por 21 días, luego cada 3 días, hasta nueva orden.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Instilar cantidad abundante en ambos oídos, hacer masajes por unos segundos y dejar que se sacuda. REPETIR ESTE PROCESO. Luego secar y limpiar con gasa suave. REPETIR cada 12 horas por 21 días, luego cada 3 días, hasta nueva orden."},{"name":"Cortanvance spray (Spray)","dose":"15 MINUTOS DESPUES de la limpieza, hacer aspersión en cada oído","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"15 MINUTOS DESPUES de la limpieza, hacer aspersión en cada oído"},{"name":"adentro y en la cara interna de estos. REPETIR cada 24 horas por 10 días, luego cada 3 días hasta nueva orden.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"},{"name":"Gentax otico (Ungüento)","dose":"15 MINUTOS DESPUES de la aplicación de CORTAVANCE aplicar dentro","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"15 MINUTOS DESPUES de la aplicación de CORTAVANCE aplicar dentro"},{"name":"de ambos oídos cantidad suficiente Y luego realizar masaje para mejor distribución. REPETIR CADA 12 HORAS POR 21 DÍAS.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de inapetencias, decaimiento, vómitos o diarreas informar para control medico *Pendiente resultado de exámenes de Sangre *Se sugiere realizar Consulta de dermatología',
                '2026-11-11'::date, ('2026-11-11'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2675224.pdf'
            );
        END IF;
END;
$$;
