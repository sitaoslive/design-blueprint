DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
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
END;
$$;
