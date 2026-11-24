DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
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

-- Fórmula: 2675498 para FRIDA (Carlos Andres Cardona)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573136099343' OR (document_number = '71384767' AND '71384767' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Carlos', 'Andres Cardona', 'CC', '71384767', '+573136099343', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'FRIDA' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'FRIDA', 'CANINE', 'Husky siberiano', 'MALE', 'OKV-P-2675498', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2675498' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2675498',
                'APPROVED', 'medical-records', 'prescriptions/2675498.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2675498') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2675498',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Carcinoma de células hepatoides · Mastocitoma · Hemangeoma',
                '[{"name":"Previcox tableta 227mg","dose":"Administrar vía oral 1/2 tableta cada 24 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 24 horas durante 6 días"},{"name":"Lyrica capsulas 50mg (Cápsulas)","dose":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días"},{"name":"Acetaminofen tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 12 horas durante 6 días"},{"name":"Nicilan tableta 400/100mg (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 12 horas durante 6 días"},{"name":"Baxidin/ Sanix o ciclorac frasco spray (Spray)","dose":"Realizar limpiezas en la zona de la herida con ayuda de una gasa cada 8 horas durante 15 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpiezas en la zona de la herida con ayuda de una gasa cada 8 horas durante 15 días"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de inapetencias, decaimiento, vómitos o diarreas informar para control médico  *Pendiente resultado de exámenes de sangre *Pendiente resultado de citología',
                '2026-11-11'::date, ('2026-11-11'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2675498.pdf'
            );
        END IF;
END;
$$;
