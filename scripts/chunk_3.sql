DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
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

-- Fórmula: 2675545 para Chester (Carlos Andres Cardona)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573136099343' OR (document_number = '71384767' AND '71384767' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Carlos', 'Andres Cardona', 'CC', '71384767', '+573136099343', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Chester' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Chester', 'CANINE', 'Pastor Alemán', 'MALE', 'OKV-P-2675545', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2675545' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2675545',
                'APPROVED', 'medical-records', 'prescriptions/2675545.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2675545') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2675545',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Otitis interna',
                '[{"name":"Acetaminofen tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1 tableta cada 12 horas durante 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 12 horas durante 5 días"},{"name":"Lyrica cápsulas 75mg","dose":"Administrar vía oral 1 cápsula cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cápsula cada 12 horas durante 6 días"},{"name":"Epiotic frasco otico (Gotas)","dose":"Instilar cantidad abundante en ambos oídos, hacer masajes por unos segundos y dejar que se sacuda. REPETIR ESTE PROCESO. Luego secar y limpiar con gasa suave. REPETIR cada 12 horas por 21 días, luego cada 3 días, hasta nueva orden.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Instilar cantidad abundante en ambos oídos, hacer masajes por unos segundos y dejar que se sacuda. REPETIR ESTE PROCESO. Luego secar y limpiar con gasa suave. REPETIR cada 12 horas por 21 días, luego cada 3 días, hasta nueva orden."},{"name":"Cortanvance spray (Spray)","dose":"15 MINUTOS DESPUES de la limpieza, hacer aspersión en cada oído","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"15 MINUTOS DESPUES de la limpieza, hacer aspersión en cada oído"},{"name":"adentro y en la cara interna de estos. REPETIR cada 24 horas por 10 días, luego cada 3 días hasta nueva orden.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"},{"name":"Gentax otico (Ungüento)","dose":"15 MINUTOS DESPUES de la aplicación de CORTAVANCE aplicar dentro","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"15 MINUTOS DESPUES de la aplicación de CORTAVANCE aplicar dentro"},{"name":"de ambos oídos cantidad suficiente Y luego realizar masaje para mejor distribución. REPETIR CADA 12 HORAS POR 21 DÍAS.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"}]'::jsonb, '*Administrar medicamentos después de comer  *En caso de inapetencias, decaimiento, vómitos y diarreas informar ara control medico',
                '2026-11-11'::date, ('2026-11-11'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2675545.pdf'
            );
        END IF;

-- Fórmula: 2675773 para Ziggy (Derlly Katherin Narvaez Castaño)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573207949591' OR (document_number = '1036392309' AND '1036392309' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Derlly', 'Katherin Narvaez Castaño', 'CC', '1036392309', '+573207949591', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Ziggy' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Ziggy', 'FELINE', 'Persa', 'MALE', 'OKV-P-2675773', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2675773' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2675773',
                'APPROVED', 'medical-records', 'prescriptions/2675773.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2675773') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2675773',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Chequeo medico preventivo',
                '[{"name":"Advocate pipeta hastas el 4kg (pipeta)","dose":"Aplicar a nivel del dorso en contra pelo. Repetir dosis a los 2 a 3 meses.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar a nivel del dorso en contra pelo. Repetir dosis a los 2 a 3 meses."},{"name":"Shed-x frasco oral felinos (frasco)","dose":"Administrar por via oral 1 cucharada cada 24 horas durante 1 a 2 meses. Adicionar a la ración de alimento","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 cucharada cada 24 horas durante 1 a 2 meses. Adicionar a la ración de alimento"},{"name":"Oftaproc E frasco ocular (Frasco)","dose":"Aplicar a nivel ocular 1 gota cada 12 horas durante 10 dias. Luego a necesidad según evolución","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar a nivel ocular 1 gota cada 12 horas durante 10 dias. Luego a necesidad según evolución"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Pendiente resultados de examenes de sangre  *En caso de vomitos, inapetencia, decaimiento, notificar para control medico',
                '2026-11-11'::date, ('2026-11-11'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2675773.pdf'
            );
        END IF;

-- Fórmula: 2677077 para DANKO IBARGÜEN - 1036938509 (LUISA FERNANDA IBARGUEN)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113682189' OR (document_number = '1036938509' AND '1036938509' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'LUISA', 'FERNANDA IBARGUEN', 'CC', '1036938509', '+573113682189', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'DANKO IBARGÜEN - 1036938509' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'DANKO IBARGÜEN - 1036938509', 'CANINE', 'Pastor Alemán', 'MALE', 'OKV-P-2677077', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2677077' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2677077',
                'APPROVED', 'medical-records', 'prescriptions/2677077.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2677077') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2677077',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Posquirurgico retiro masa',
                '[{"name":"Trazodona tableta 50mg (Tabletas)","dose":"Administrar vía oral 3 tabletas cada 24 horas hasta nueva indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 3 tabletas cada 24 horas hasta nueva indicación"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de inapetencias, decaimiento, vómitos y diarreas informar para control medico',
                '2026-11-12'::date, ('2026-11-12'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2677077.pdf'
            );
        END IF;

-- Fórmula: 2677531 para Perla Ospina (clara ospina)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573102919556' OR (document_number = '43610721' AND '43610721' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'clara', 'ospina', 'CC', '43610721', '+573102919556', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Perla Ospina' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Perla Ospina', 'CANINE', 'Criollo(a)', 'FEMALE', 'OKV-P-2677531', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2677531' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2677531',
                'APPROVED', 'medical-records', 'prescriptions/2677531.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2677531') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2677531',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Manejo del dolor',
                '[{"name":"Previcox tableta 227mg (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 24 horas durante 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 24 horas durante 5 días"},{"name":"Lyrica capsulas 50mg (Cápsulas)","dose":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cápsula cada 12 horas durante 10 días"},{"name":"Acetaminofen tabletas 500mg (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 12 horas durante 6 días"},{"name":"Neurobion tabletas (Tabletas)","dose":"Administrar vía oral 1/2 tableta cada 24 horas durante 20 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1/2 tableta cada 24 horas durante 20 días"},{"name":"Omeprazol cápsulas 20mg (Cápsulas)","dose":"Administrar vía oral 1 cápsula cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 cápsula cada 12 horas durante 6 días"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de Decaimiento, inapetencias, vómitos o diarreas informar para control medico',
                '2026-11-12'::date, ('2026-11-12'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2677531.pdf'
            );
        END IF;

-- Fórmula: 2681916 para LUCCA (Melanie Van Grieken)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573228898654' OR (document_number = '1129566126' AND '1129566126' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Melanie', 'Van Grieken', 'CC', '1129566126', '+573228898654', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'LUCCA' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'LUCCA', 'FELINE', 'Criollo(a)', 'MALE', 'OKV-P-2681916', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2681916' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2681916',
                'APPROVED', 'medical-records', 'prescriptions/2681916.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2681916') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2681916',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'inflamación de tejidos blandos por congénere',
                '[{"name":"liryca 50 mg (capsulas)","dose":"Diluir una cápsulas en 2 ml y administrar por via oral 1 ml cada 12 horas durante 10 días, después del consumo de alimento.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Diluir una cápsulas en 2 ml y administrar por via oral 1 ml cada 12 horas durante 10 días, después del consumo de alimento."},{"name":"meloxican gotas al 0.15% (Suspensión)","dose":"administrar via oral 7 gotas cada 24 horas durante 4 dias, después del consumo de alimento.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"administrar via oral 7 gotas cada 24 horas durante 4 dias, después del consumo de alimento."},{"name":"Marboquin tableta 25mg (tabletas)","dose":"Administrar via oral 1 tableta cada 24 horas durante 5 dias, después del consumo de alimento.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar via oral 1 tableta cada 24 horas durante 5 dias, después del consumo de alimento."},{"name":"Clorhexidina frasco spray (solución antiseptica)","dose":"realizar limpiezas en la herida cada 8 horas durante 6 días, con ayuda de gasas, (no necesariamente estériles).","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"realizar limpiezas en la herida cada 8 horas durante 6 días, con ayuda de gasas, (no necesariamente estériles)."}]'::jsonb, 'recomendaciones * reportar cualquier cambio desfavorable en la zona de la herida. * en caso de que comienza a lamerse se indica uso de collar isabelino. * evitar el lamido de la otra mascota. * en caso de presentar sintomatologia como vomito diarrea, decaimiento o inapetencia consultar con el medico tratante.',
                '2026-11-13'::date, ('2026-11-13'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2681916.pdf'
            );
        END IF;

-- Fórmula: 2682373 para Chiqui (Isabel Cristina Yepes)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573013309000' OR (document_number = '43751199' AND '43751199' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Isabel', 'Cristina Yepes', 'CC', '43751199', '+573013309000', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Chiqui' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Chiqui', 'CANINE', 'Criollo(a)', 'FEMALE', 'OKV-P-2682373', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2682373' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2682373',
                'APPROVED', 'medical-records', 'prescriptions/2682373.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2682373') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2682373',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Hemoparasitos · Parasitosis  · Síndrome de mala absorción',
                '[{"name":"Hemolitan frasco oral (Frasco)","dose":"Administrar por vía oral 0.2ml cada 12 horas durante 20 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por vía oral 0.2ml cada 12 horas durante 20 días"},{"name":"Shed-x frasco oral (Frasco)","dose":"Administrar por vía oral 1 cucharada cada 12 horas durante 1 mes. Adicionar a la ración de alimento","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por vía oral 1 cucharada cada 12 horas durante 1 mes. Adicionar a la ración de alimento"},{"name":"Canisan D jeringa 2.5ml (Jeringa)","dose":"Administrar por vía oral 0.3ml cada 24 horas durante 4 días. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por vía oral 0.3ml cada 24 horas durante 4 días. Dar siempre después de comer"}]'::jsonb, 'Realizar hemograma de control en 1 semana En caso de vómitos, inapetencia, decaimiento,  notificar para control médico',
                '2026-11-14'::date, ('2026-11-14'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2682373.pdf'
            );
        END IF;

-- Fórmula: 2690193 para África (Andrés García)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573162854460' OR (document_number = '10394631800' AND '10394631800' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Andrés', 'García', 'CC', '10394631800', '+573162854460', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'África' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'África', 'CANINE', 'Pastor Belga', 'FEMALE', 'OKV-P-2690193', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2690193' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2690193',
                'APPROVED', 'medical-records', 'prescriptions/2690193.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2690193') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2690193',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Postquirurgico de esterilización',
                '[{"name":"Meloxicam tableta 2mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 24 horas durante 4 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 24 horas durante 4 dias. Dar siempre después de comer"},{"name":"Cefalexina tabletas 500mg (tableta)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Baxidin/ Sanix o ciclorac frasco spray (frasco)","dose":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden"},{"name":"Dipirona tableta 500mg (tableta)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 4 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 4 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Uso de collar isabelino *Mantener reposo y quietud *En caso de vomitos, inapetencia, decaimiento, notificar para control medico *Control medico en 4 dias, agendar cita previa *Retiro de puntos en 12 dias, agendar cita previa',
                '2026-11-17'::date, ('2026-11-17'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2690193.pdf'
            );
        END IF;

-- Fórmula: 2692785 para Polo (Maria Elena Ramirez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573127571207' OR (document_number = '26259624' AND '26259624' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Maria', 'Elena Ramirez', 'CC', '26259624', '+573127571207', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Polo' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Polo', 'FELINE', 'Criollo(a)', 'MALE', 'OKV-P-2692785', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2692785' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2692785',
                'APPROVED', 'medical-records', 'prescriptions/2692785.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2692785') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2692785',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Accidente por congénere · Trauma tejidos blandos  · Absceso',
                '[{"name":"Meloxicam frasco gotero 0.15% (Frasco)","dose":"Administrar por via oral 4 gotas cada 24 horas durante 4 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 4 gotas cada 24 horas durante 4 dias. Dar siempre después de comer"},{"name":"Marboquin tabletas 25mg (tabletas)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Baxidin/ Sanix o ciclorac frasco spray (frasco)","dose":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden"},{"name":"Advocate pipeta  de 4 a 8kg (frasc)","dose":"Aplicar a nivel del dorso a contra pelo. Repetir dosis a los 2 meses","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar a nivel del dorso a contra pelo. Repetir dosis a los 2 meses"}]'::jsonb, 'Uso de collar isabelino Mantener reposo y quietud En caso de vomitos, inapetencia, decaimiento, notificar para control medico',
                '2026-11-18'::date, ('2026-11-18'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2692785.pdf'
            );
        END IF;

-- Fórmula: 2693404 para Mamba Álvarez (Sergio Álvarez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113058304' OR (document_number = '71319473' AND '71319473' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Sergio', 'Álvarez', 'CC', '71319473', '+573113058304', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Mamba Álvarez' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Mamba Álvarez', 'CANINE', 'Criollo(a)', 'FEMALE', 'OKV-P-2693404', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2693404' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2693404',
                'APPROVED', 'medical-records', 'prescriptions/2693404.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2693404') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2693404',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Polipo esofagico · Helicobacter pilori  · Gastritis linfoplasmocitaria',
                '[{"name":"Alsucral tabletas  1 gr (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 20 dias. Dar media hora antes del desayuno y la cena","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 20 dias. Dar media hora antes del desayuno y la cena"},{"name":"Omeprazol capsulas (capsulas)","dose":"Administrar por via oral 1 capsula cada 24 horas durante 20 dias. Dar con una diferencia de 3 a 4 horas del alsucral","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 24 horas durante 20 dias. Dar con una diferencia de 3 a 4 horas del alsucral"},{"name":"Digyton frasco oral (frasco)","dose":"Administrar por via oral 2ml cada  12 horas durante 20 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 2ml cada  12 horas durante 20 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Se sugiere realizar perfil hepático completo *Se recomienda realizar procedimiento de endoscopia diagnóstica con análisis de histopatología  *En caso de vomitos, inapetencia, decaimiento, notificar para control medico',
                '2026-11-18'::date, ('2026-11-18'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2693404.pdf'
            );
        END IF;

-- Fórmula: 2694969 para Nala (NATALIA VELÁSQUEZ ESCALANTE)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573204443511' OR (document_number = '67012503' AND '67012503' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'NATALIA', 'VELÁSQUEZ ESCALANTE', 'CC', '67012503', '+573204443511', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Nala' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Nala', 'CANINE', 'Chihuahueño o Chihuahua', 'FEMALE', 'OKV-P-2694969', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2694969' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2694969',
                'APPROVED', 'medical-records', 'prescriptions/2694969.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2694969') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2694969',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Dermatitis húmedo aguda/ dermatofitosis',
                '[{"name":"Dermosyn (frasco)","dose":"Aplicar a nivel de la zona afectada 3 veces al dia hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar a nivel de la zona afectada 3 veces al dia hasta nueva orden"}]'::jsonb, 'RECOMENDACIONES *Control medico el dia lunes, agendar cita previa',
                '2026-11-19'::date, ('2026-11-19'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2694969.pdf'
            );
        END IF;

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
END;
$$;
