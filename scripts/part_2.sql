DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
-- Paciente: ONIX (YESENIA LOPERA)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573157815806' OR (document_number = '1128459292' AND '1128459292' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, 'YESENIA', 'LOPERA', 'CC', '1128459292', '+573157815806', 'loperayesenia@gmail.com', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = '231620' OR (primary_owner_id = v_owner_id AND name ILIKE 'ONIX') LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'ONIX', 'CANINE', 'Bulldog francés', 'MALE', '231620', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = '231620',
                species = 'CANINE',
                breed = 'Bulldog francés',
                sex = 'MALE'
            WHERE id = v_pet_id;
        END IF;

-- Paciente: ARI (YESENIA LOPERA)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573157815806' OR (document_number = '1128459292' AND '1128459292' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, 'YESENIA', 'LOPERA', 'CC', '1128459292', '+573157815806', 'loperayesenia@gmail.com', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = '1246300' OR (primary_owner_id = v_owner_id AND name ILIKE 'ARI') LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'ARI', 'CANINE', 'Bulldog francés', 'FEMALE', '1246300', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = '1246300',
                species = 'CANINE',
                breed = 'Bulldog francés',
                sex = 'FEMALE'
            WHERE id = v_pet_id;
        END IF;

-- Paciente: Limon (Margarita Maria Ruiz Maya)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573006038517' OR (document_number = '1128283893' AND '1128283893' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, 'Margarita', 'Maria Ruiz Maya', 'CC', '1128283893', '+573006038517', 'margaramaya2023@gmail.com', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = '3200529' OR (primary_owner_id = v_owner_id AND name ILIKE 'Limon') LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Limon', 'FELINE', 'Criollo(a)', 'MALE', '3200529', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = '3200529',
                species = 'FELINE',
                breed = 'Criollo(a)',
                sex = 'MALE'
            WHERE id = v_pet_id;
        END IF;

-- Paciente: Martin (SONIA PEREZ ECHEVERRI)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573245511827' OR (document_number = '430889230' AND '430889230' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, 'SONIA', 'PEREZ ECHEVERRI', 'CC', '430889230', '+573245511827', 'sony_perez@hotmail.com', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = '3202384' OR (primary_owner_id = v_owner_id AND name ILIKE 'Martin') LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Martin', 'FELINE', 'Persa', 'MALE', '3202384', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = '3202384',
                species = 'FELINE',
                breed = 'Persa',
                sex = 'MALE'
            WHERE id = v_pet_id;
        END IF;

-- Fórmula: 2652375 para Ginger (Carolina Londoño)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573225829583' OR (document_number = '1036945420' AND '1036945420' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Carolina', 'Londoño', 'CC', '1036945420', '+573225829583', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Ginger' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Ginger', 'CANINE', 'Teckel o Dachshund', 'FEMALE', 'OKV-P-2652375', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2652375' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2652375',
                'APPROVED', 'medical-records', 'prescriptions/2652375.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2652375') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2652375',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Indiscreción alimentaria · Lipidosis intestinal · Pancreatitis · Cuerpo Extraño',
                '[{"name":"Metronidazol suspensión 250mg/5ml (Suspensión)","dose":"Administrar vía oral 1ml cada 12 horas durante 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1ml cada 12 horas durante 5 días"},{"name":"Aciflux suspensión 200mg (Suspensión)","dose":"Administrar vía oral 0.4ml cada 12 horas durante 5 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 0.4ml cada 12 horas durante 5 días"},{"name":"Fortiflora sobres caninos (Sobres)","dose":"Administrar vía oral 1 sobre cada 12 horas durante 6 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 sobre cada 12 horas durante 6 días"},{"name":"Dygiton frasco oral (Gotas)","dose":"Administrar vía oral 1ml cada 12 horas durante 20 días","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1ml cada 12 horas durante 20 días"}]'::jsonb, '*Administrar medicamentos después de comer *En caso de decaimiento, inapetencias, diarreas o vómitos informar para control medico *Se sugiere realizar ecografía abdominal especializada *Control medico en 24 horas, agendar cita previa',
                '2026-11-03'::date, ('2026-11-03'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2652375.pdf'
            );
        END IF;
END;
$$;
