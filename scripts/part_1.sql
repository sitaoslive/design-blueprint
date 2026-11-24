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
END;
$$;
