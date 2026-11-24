-- ============================================================================
-- VET FREEDOM OS — INGESTA MASIVA DE DATOS REALES DE OKVET
-- Generado automáticamente desde exportaciones oficiales de sys.okvet.co
-- ============================================================================
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
      

        -- Fórmula: 2696154 para LLUVIA (PAULINA MESA)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573136308170' OR (document_number = '43160403' AND '43160403' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'PAULINA', 'MESA', 'CC', '43160403', '+573136308170', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'LLUVIA' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'LLUVIA', 'CANINE', 'Pastor Alemán', 'FEMALE', 'OKV-P-2696154', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696154' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696154',
                'APPROVED', 'medical-records', 'prescriptions/2696154.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696154') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696154',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Injuria renal aguda',
                '[{"name":"Vitamina E capsulas 400UI (Capsulas)","dose":"Administrar por via oral 1 capsula cada 24 horas durante 1 mes. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 24 horas durante 1 mes. Dar siempre después de comer"},{"name":"Hidroxido aluminio frasco oral (frasco)","dose":"Administrar por via sonda de alimentación 12ml cada 8 horas durante 10 dias.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via sonda de alimentación 12ml cada 8 horas durante 10 dias."},{"name":"Hidrataciones subcutáneas cada 24 horas (inyectable)","dose":"Aplicar por via subcutanea 70ml/kg/dia hasta nueva indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar por via subcutanea 70ml/kg/dia hasta nueva indicación"},{"name":"LATA EN de proplan (Lata)","dose":"Administrar por via sonda de alimentación 130ml cada 6 horas hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via sonda de alimentación 130ml cada 6 horas hasta nueva orden"}]'::jsonb, 'RECOMENDACIONES *Se sugiere realizar perfil renal completo *se sugiere realizar ecografía abdominal especializada',
                '2026-11-19'::date, ('2026-11-19'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696154.pdf'
            );
        END IF;
      

        -- Fórmula: 2696628 para TRUFA (Viviana Trujillo)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573108374247' OR (document_number = '43873702' AND '43873702' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Viviana', 'Trujillo', 'CC', '43873702', '+573108374247', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'TRUFA' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'TRUFA', 'FELINE', 'Mestizo', 'FEMALE', 'OKV-P-2696628', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696628' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696628',
                'APPROVED', 'medical-records', 'prescriptions/2696628.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696628') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696628',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Gastritis · Indiscreción alimentaria',
                '[{"name":"Cerenia frasco inyectable (inyectable)","dose":"Aplicar por via intravenosa 0.4ml cada 24 horas durante 2 días. Se sugiere diluir con solución salina","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar por via intravenosa 0.4ml cada 24 horas durante 2 días. Se sugiere diluir con solución salina"},{"name":"Omeprazol frasco inyectable 8mg/ml (frasco)","dose":"Aplicar por via intravenosa 0.39ml cada 24 horas durante 2 días.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar por via intravenosa 0.39ml cada 24 horas durante 2 días."},{"name":"Ondansetron ampolla de 2mg (ampolla)","dose":"Aplicar por via intravenosa 0,45ml cada 24 horas durante 2 dias.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar por via intravenosa 0,45ml cada 24 horas durante 2 dias."}]'::jsonb, 'RECOMENDACIONES *Se sugiere administrar alimento blando digestivo',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696628.pdf'
            );
        END IF;
      

        -- Fórmula: 2696634 para OSCAR (Tomas Echavarria)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573104842901' OR (document_number = '10376344196' AND '10376344196' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Tomas', 'Echavarria', 'CC', '10376344196', '+573104842901', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'OSCAR' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'OSCAR', 'CANINE', 'Criollo(a)', 'MALE', 'OKV-P-2696634', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696634' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696634',
                'APPROVED', 'medical-records', 'prescriptions/2696634.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696634') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696634',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Infección en el sitio quirurgico',
                '[{"name":"Marboquin tabletas 50mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas Durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas Durante 6 dias. Dar siempre después de comer"},{"name":"Baxidin/ Sanix o ciclorac frasco spray (frasco)","dose":"Realizar limpiezas en la zona de la herida 3 veces hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpiezas en la zona de la herida 3 veces hasta nueva orden"},{"name":"Fitoestimule gel (gel)","dose":"Aplicar a nivel de la zona de la herida 3 veces al dia hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Aplicar a nivel de la zona de la herida 3 veces al dia hasta nueva orden"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer  *Uso de collar isabelino  *Control medico en 3 dias, agendar cita previa',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696634.pdf'
            );
        END IF;
      

        -- Fórmula: 2696649 para Toby (Rodrigo Cuesta)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113413925' OR (document_number = '70074581' AND '70074581' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Rodrigo', 'Cuesta', 'CC', '70074581', '+573113413925', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Toby' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Toby', 'FELINE', 'Ragdoll', 'MALE', 'OKV-P-2696649', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696649' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696649',
                'APPROVED', 'medical-records', 'prescriptions/2696649.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696649') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696649',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'ENFERMEDAD RENAL CRONICA (IRIS 1) · ENFERMEDAD INFLAMATORIA INTESTINAL · HIPERTIROIDISMO FELINO',
                '[{"name":"Nefrotec ds tabletas (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 1 mes. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 1 mes. Dar siempre después de comer"},{"name":"Proplan NF early (concentrado)","dose":"Administrar como unica fuente de alimento durante 3 meses.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar como unica fuente de alimento durante 3 meses."}]'::jsonb, 'RECOMENDACIONES *Se sugiere agendar cita de nefrologia  *Se recomienda realizar ecografía abdominal y examenes de seguimiento en 3 meses *En caso de vomitos, inapetencia, decaimiento, notificar para control medico',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696649.pdf'
            );
        END IF;
      

        -- Fórmula: 2696656 para Ganya (Jhon Esteban Patiño)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573506850553' OR (document_number = '1128457811' AND '1128457811' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Jhon', 'Esteban Patiño', 'CC', '1128457811', '+573506850553', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Ganya' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Ganya', 'CANINE', 'Pit bull', 'FEMALE', 'OKV-P-2696656', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696656' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696656',
                'APPROVED', 'medical-records', 'prescriptions/2696656.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696656') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696656',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'CCE',
                '[{"name":"Previcox tableta 227mg (tableta)","dose":"Administrar por via oral 3/4 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 3/4 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Lyrica capsulas 50mg (capsulas)","dose":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 12 horas durante 10 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696656.pdf'
            );
        END IF;
      

        -- Fórmula: 2696832 para Limon (Margarita Maria Ruiz Maya)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573006038517' OR (document_number = '1128283893' AND '1128283893' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Margarita', 'Maria Ruiz Maya', 'CC', '1128283893', '+573006038517', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Limon' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Limon', 'FELINE', 'Criollo(a)', 'MALE', 'OKV-P-2696832', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2696832' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2696832',
                'APPROVED', 'medical-records', 'prescriptions/2696832.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2696832') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2696832',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Hemoparasitos · ERA · Lipidosis hepatica',
                '[{"name":"Marbofloxacina tabletas 5mg (tabletas)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Prednisolona tabletas 5mg (tabletas)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Silimarina capsulas 150mg (capsulas)","dose":"Administrar por via oral 1 capsula cada 24 horas durante 10 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 capsula cada 24 horas durante 10 dias. Dar siempre después de comer"},{"name":"Liv 52 frasco oral (frasco)","dose":"Administrar por via oral 3ml cada 12 horas durante 1 mes. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 3ml cada 12 horas durante 1 mes. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Se sugiere realizar examenes de sangre  *Se sugiere realizar ecografía abdominal especializada *Se recomienda realizar procedimiento de colocar tubo de esofágostomia',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2696832.pdf'
            );
        END IF;
      

        -- Fórmula: 2697689 para Max (Carolina Gomez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573147923927' OR (document_number = '1053784160' AND '1053784160' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Carolina', 'Gomez', 'CC', '1053784160', '+573147923927', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Max' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Max', 'CANINE', 'Rottweiler', 'MALE', 'OKV-P-2697689', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2697689' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2697689',
                'APPROVED', 'medical-records', 'prescriptions/2697689.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2697689') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2697689',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'OTITIS CRONICA',
                '[{"name":"Prednisolona tableta 20mg (tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas durante 8 días,","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas durante 8 días,"},{"name":"después 1 tableta cada 48 horas horas durante 8 dias,","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"},{"name":"después 1 tableta cada 72 horas durante 8 dias, después del consumo de alimento.","dose":"Según indicación","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Según indicación"},{"name":"Apoquel tabletas 16mg (tabletas)","dose":"Administrar vía oral 1 tableta cada 24 horas, durante 10 dias, después del consumo de alimento.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar vía oral 1 tableta cada 24 horas, durante 10 dias, después del consumo de alimento."},{"name":"Gentax otico (solución antiseptica)","dose":"continuar con el gentax.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"continuar con el gentax."},{"name":"epioptic (solución antiseptica)","dose":"continuar con la medicación.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"continuar con la medicación."}]'::jsonb, 'Recomendaciones  * se sugiere realizar interconsulta dermatológica con prontitud.',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2697689.pdf'
            );
        END IF;
      

        -- Fórmula: 2698587 para Sol (Juan Pablo Agudelo)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573004837934' OR (document_number = '70908932' AND '70908932' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Juan', 'Pablo Agudelo', 'CC', '70908932', '+573004837934', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Sol' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Sol', 'CANINE', 'Mestizo', 'FEMALE', 'OKV-P-2698587', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2698587' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2698587',
                'APPROVED', 'medical-records', 'prescriptions/2698587.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2698587') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2698587',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Postquirurgico de criocirugia',
                '[{"name":"Cefalexina tabletas 500mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Dipirona tabletas 500mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas durante 5 dias. Dar siempre después de comer"},{"name":"Baxidin/ Sanix o ciclorac frasco spray (frasco)","dose":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar limpiezas en la zona de la herida 3 veces al dia hasta nueva orden"},{"name":"Meloxicam tabletas 3mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 24 horas durante 4 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 24 horas durante 4 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Uso de collar isabelino *Revision medica en 2 dias, agendar cita previa',
                '2026-11-20'::date, ('2026-11-20'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2698587.pdf'
            );
        END IF;
      

        -- Fórmula: 2699355 para Martin (SONIA PEREZ ECHEVERRI)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573245511827' OR (document_number = '430889230' AND '430889230' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'SONIA', 'PEREZ ECHEVERRI', 'CC', '430889230', '+573245511827', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Martin' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Martin', 'FELINE', 'Persa', 'MALE', 'OKV-P-2699355', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2699355' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2699355',
                'APPROVED', 'medical-records', 'prescriptions/2699355.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2699355') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2699355',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Bronquitis cronica alergica · Neumonía',
                '[{"name":"Prednisolona tableta 5mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Luego 1/2 tableta cada 48 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Luego 1/2 tableta cada 48 horas durante 6 dias. Dar siempre después de comer"},{"name":"Marboquin tabletas 25mg (tableta)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 6 dias. Dar siempre después de comer"},{"name":"Seretide 25/125 mcg inhalador uso humano (inhalador)","dose":"Realizar 2 puff cada 8 horas durante 10 dias. Se sugiere utilizar inhalocamara. Luego 2 puff cada 12 horas durante 20 dias.","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar 2 puff cada 8 horas durante 10 dias. Se sugiere utilizar inhalocamara. Luego 2 puff cada 12 horas durante 20 dias."},{"name":"Nebulizaciones (0.5ml de berudual + 3ml solucion salina) (nebulizaciónes)","dose":"Realizar nebulizaciónes cada 8 horas durante 10 dias. Luego cada 12 horas durante 20 dias. Aplicar a la cámara del nebulizador 3ml de solución salina + 0.5ml de berudual","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Realizar nebulizaciónes cada 8 horas durante 10 dias. Luego cada 12 horas durante 20 dias. Aplicar a la cámara del nebulizador 3ml de solución salina + 0.5ml de berudual"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Se sugiere realizar radiografia de torax *Evitar corrientes de aire, humedad y baños *Control medico en 2 dias, agendar cita previa',
                '2026-11-21'::date, ('2026-11-21'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2699355.pdf'
            );
        END IF;
      

        -- Fórmula: 2701130 para Mamba Álvarez (Sergio Álvarez)
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = '+573113058304' OR (document_number = '71319473' AND '71319473' <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, 'Sergio', 'Álvarez', 'CC', '71319473', '+573113058304', 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE 'Mamba Álvarez' LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, 'Mamba Álvarez', 'CANINE', 'Criollo(a)', 'FEMALE', 'OKV-P-2701130', 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = '2701130' LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', '2701130',
                'APPROVED', 'medical-records', 'prescriptions/2701130.pdf', true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = '2701130') THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, '2701130',
                'Luis Eduardo Ríos Ortiz', 'COMVEZCOL-001', 'Otitis interna',
                '[{"name":"Previcox tableta 227mg (tabletas)","dose":"Administrar por via oral 1/2 tableta cada 24 horas durante 5 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1/2 tableta cada 24 horas durante 5 dias. Dar siempre después de comer"},{"name":"Dipirona tabletas 500mg (tabletas)","dose":"Administrar por via oral 1 tableta cada 12 horas Durante 4 dias. Dar siempre después de comer","frequency":"Según pauta médica","duration":"Periodo prescrito","instructions":"Administrar por via oral 1 tableta cada 12 horas Durante 4 dias. Dar siempre después de comer"}]'::jsonb, 'RECOMENDACIONES *Administrar medicamentos después de comer *Control medico en 4 dias, agendar cita previa',
                '2026-11-21'::date, ('2026-11-21'::date + INTERVAL '30 days'),
                'ACTIVE', 'prescriptions/2701130.pdf'
            );
        END IF;
      
    -- Actualizar metadata de snapshot
    UPDATE public.okvet_snapshot_metadata
    SET total_patients = (SELECT count(*) FROM public.pets),
        is_stale = false,
        updated_at = now()
    WHERE organization_id = v_org_id;
END;
$$;