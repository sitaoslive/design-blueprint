DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
-- Paciente: Mamba Álvarez (Sergio Álvarez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113058304' OR (document_number = '71319473' AND '71319473' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, 'Sergio', 'Álvarez', 'CC', '71319473', '+573113058304', 'salvarezgaviria@gmail.com', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = '949856' OR (primary_owner_id = v_owner_id AND name ILIKE 'Mamba Álvarez') LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Mamba Álvarez', 'CANINE', 'Criollo(a)', 'FEMALE', '949856', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = '949856',
                species = 'CANINE',
                breed = 'Criollo(a)',
                sex = 'FEMALE'
            WHERE id = v_pet_id;
        END IF;

-- Paciente: Rosy (Rodrigo Cuesta)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113413925' OR (document_number = '70074581' AND '70074581' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, 'Rodrigo', 'Cuesta', 'CC', '70074581', '+573113413925', 'rcuesta1@outlook.com', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = '1334059' OR (primary_owner_id = v_owner_id AND name ILIKE 'Rosy') LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Rosy', 'FELINE', 'Maine Coon', 'FEMALE', '1334059', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = '1334059',
                species = 'FELINE',
                breed = 'Maine Coon',
                sex = 'FEMALE'
            WHERE id = v_pet_id;
        END IF;

-- Paciente: Rocco Cuesta (Rodrigo Cuesta)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113413925' OR (document_number = '70074581' AND '70074581' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, 'Rodrigo', 'Cuesta', 'CC', '70074581', '+573113413925', 'rcuesta1@outlook.com', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = '1334174' OR (primary_owner_id = v_owner_id AND name ILIKE 'Rocco Cuesta') LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Rocco Cuesta', 'FELINE', 'Maine Coon', 'MALE', '1334174', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = '1334174',
                species = 'FELINE',
                breed = 'Maine Coon',
                sex = 'MALE'
            WHERE id = v_pet_id;
        END IF;

-- Paciente: Toby (Rodrigo Cuesta)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113413925' OR (document_number = '70074581' AND '70074581' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, 'Rodrigo', 'Cuesta', 'CC', '70074581', '+573113413925', 'rcuesta1@outlook.com', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = '1334242' OR (primary_owner_id = v_owner_id AND name ILIKE 'Toby') LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Toby', 'FELINE', 'Ragdoll', 'MALE', '1334242', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = '1334242',
                species = 'FELINE',
                breed = 'Ragdoll',
                sex = 'MALE'
            WHERE id = v_pet_id;
        END IF;

-- Paciente: MICHI (JOSE MANUEL GONZALEZ)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573004957965' OR (document_number = '1001725416' AND '1001725416' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, 'JOSE', 'MANUEL GONZALEZ', 'CC', '1001725416', '+573004957965', 'GONZALEZMORALES201@GMAIL.COM', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = '3199738' OR (primary_owner_id = v_owner_id AND name ILIKE 'MICHI') LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'MICHI', 'FELINE', 'Criollo(a)', 'FEMALE', '3199738', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = '3199738',
                species = 'FELINE',
                breed = 'Criollo(a)',
                sex = 'FEMALE'
            WHERE id = v_pet_id;
        END IF;

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
END;
$$;
