DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
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
END;
$$;
