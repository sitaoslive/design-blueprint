DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
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
END;
$$;
