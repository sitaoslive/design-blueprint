DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
-- Fórmula: 2652734 para GONZALO HENAO (Sara Paulina Castro Lavid)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113627136' OR (document_number = '43628217' AND '43628217' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Sara', 'Paulina Castro Lavid', 'CC', '43628217', '+573113627136', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'GONZALO HENAO' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'GONZALO HENAO', 'CANINE', 'Yorkshire terrier', 'MALE', 'OKV-P-2652734', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2652734' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2652734',
                'APPROVED', 'medical-records', 'prescriptions/2652734.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2652734') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2652734',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Bronquitis alergica',
                '[{"name":"Fexofenadina (Suspensión)","dose":"Administrar vía oral 0.2ml cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 0.2ml cada 12 horas durante 6 días"},{"name":"Seretide inhalador 25/125mcg (Inhalador uso humano)","dose":"Aplicar 2 puff cada 12 horas durante 20 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar 2 puff cada 12 horas durante 20 días"},{"name":"Nebulizaciones (0.5ml de berudual + 3ml solucion salina) (inhaladas)","dose":"Realizar nebulizaciónes cada 8 horas durante 15 días, luego una nebulización cada 24 horas durante 15 días mas","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar nebulizaciónes cada 8 horas durante 15 días, luego una nebulización cada 24 horas durante 15 días mas"},{"name":"salbutamol inhalador (Inhalador)","dose":"Aplicar 2 puff cada 12 horas durante 20 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar 2 puff cada 12 horas durante 20 días"},{"name":"Ciprofibrato tableta 100mg (Tabletas)","dose":"Administrar vía oral 1/4 tableta cada 24 horas durante 20 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/4 tableta cada 24 horas durante 20 días"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de inapetencias, decaimiento, diarreas o vómitos informar para control medico  *Se sugiere realizar exámenes de control Hepático en un mes',
                '2026-11-03'::date, ('2026-11-03'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2652734.pdf'
            );
        END IF;

-- Fórmula: 2655378 para JEY (JOHANA RAMIREZ)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573147021641' OR (document_number = '53146722' AND '53146722' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'JOHANA', 'RAMIREZ', 'CC', '53146722', '+573147021641', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'JEY' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'JEY', 'CANINE', 'Caniche o French Poodle', 'MALE', 'OKV-P-2655378', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2655378' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2655378',
                'APPROVED', 'medical-records', 'prescriptions/2655378.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2655378') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2655378',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Accidente por congénere · trauma tejidos blandos · Politraumatismo',
                '[{"name":"Meloxipets 0.15% frasco oral (frasco)","dose":"Administrar por via oral 4 gotas cada 24 horas durante 4 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 4 gotas cada 24 horas durante 4 dias. Dar siempre después de comer"},{"name":"Nicilan tableta 40/10mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Lyrica capsulas 25mg (capsulas)","dose":"Administrar por via oral 1 cápsula cada 24 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 cápsula cada 24 horas durante 5 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Pendiente resultados de exámenes de sangre *Control medico en 24 horas, agendar cita previa',
                '2026-11-04'::date, ('2026-11-04'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2655378.pdf'
            );
        END IF;

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
END;
$$;
