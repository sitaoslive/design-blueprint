/**
 * VET FREEDOM OS — PARSER DE EXPORTACIONES REALES DE OKVET
 * Procesa los archivos descargados de OKVET:
 * - OkVet_-_Mascotas.csv
 * - OkVet_-_F_rmulas_m_dicas.csv
 * Genera un script SQL idempotent para poblar Supabase con pacientes, tutores y fórmulas reales.
 */

const fs = require('fs');
const path = require('path');

const downloadsDir = path.join(__dirname, '../browser_sandbox/downloads');
const fallbackDir = 'C:\\Users\\Freud\\.gemini\\antigravity\\brain\\2baa47be-9be0-4ce5-8b4c-86cc3f24b84c\\browser_sandbox\\downloads';

const actualDir = fs.existsSync(downloadsDir) ? downloadsDir : fallbackDir;
const mascotasFile = path.join(actualDir, 'OkVet_-_Mascotas.csv');
const formulasFile = path.join(actualDir, 'OkVet_-_F_rmulas_m_dicas.csv');

// Parser simple de CSV con soporte multilínea dentro de comillas
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentField.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }

  return rows;
}

function escapeSQL(str) {
  if (str === null || str === undefined) return "''";
  return "'" + String(str).replace(/'/g, "''") + "'";
}

function cleanPhone(raw) {
  if (!raw) return '+573000000000';
  let p = String(raw).replace(/[^0-9+]/g, '');
  if (!p.startsWith('+')) {
    if (p.startsWith('57')) p = '+' + p;
    else p = '+57' + p;
  }
  return p;
}

function run() {
  console.log("Leyendo archivos desde:", actualDir);

  const sqlStatements = [];
  sqlStatements.push(`-- ============================================================================`);
  sqlStatements.push(`-- VET FREEDOM OS — INGESTA MASIVA DE DATOS REALES DE OKVET`);
  sqlStatements.push(`-- Generado automáticamente desde exportaciones oficiales de sys.okvet.co`);
  sqlStatements.push(`-- ============================================================================`);
  sqlStatements.push(`DO $$`);
  sqlStatements.push(`DECLARE`);
  sqlStatements.push(`    v_org_id UUID := '11111111-1111-1111-1111-111111111111';`);
  sqlStatements.push(`    v_owner_id UUID;`);
  sqlStatements.push(`    v_pet_id UUID;`);
  sqlStatements.push(`    v_doc_id UUID;`);
  sqlStatements.push(`BEGIN`);

  // 1. Procesar Mascotas
  if (fs.existsSync(mascotasFile)) {
    console.log("Procesando Mascotas...");
    const rawMascotas = fs.readFileSync(mascotasFile, 'utf-8');
    const rows = parseCSV(rawMascotas);
    console.log(`Filas encontradas en Mascotas: ${rows.length}`);

    // Headers: Id, Nombre, Especie, Raza, Peso, Género, E.Reproductivo, Temperamento, Nacimiento, Color, Comida, Fallecido, Código/Chip, Id, Nombres, TIdent, Ident., Correo, Celular, Teléfono, Dirección, Contacto, TContacto, Vinculado, Actualizado, Autorización
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r.length < 15) continue;

      const petOkvetId = r[0] || ('OKV-' + i);
      const petName = r[1] || 'Mascota';
      const speciesRaw = (r[2] || '').toLowerCase();
      const species = speciesRaw.includes('gat') || speciesRaw.includes('fel') ? 'FELINE' : 'CANINE';
      const breed = r[3] || 'Mestizo';
      const genderRaw = (r[5] || '').toLowerCase();
      const sex = genderRaw.includes('hem') ? 'FEMALE' : (genderRaw.includes('mach') ? 'MALE' : 'UNKNOWN');

      const ownerName = r[14] || 'Tutor Vet Life';
      const firstName = ownerName.split(' ')[0] || 'Tutor';
      const lastName = ownerName.substring(firstName.length).trim() || 'Cliente';
      const docType = r[15] || 'CC';
      const docNum = r[16] || '';
      const email = r[17] || '';
      const phone = cleanPhone(r[18] || r[19] || '');
      const address = r[20] || '';

      sqlStatements.push(`
        -- Paciente: ${petName} (${ownerName})
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = ${escapeSQL(phone)} OR (document_number = ${escapeSQL(docNum)} AND ${escapeSQL(docNum)} <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, email, status)
            VALUES (v_org_id, ${escapeSQL(firstName)}, ${escapeSQL(lastName)}, ${escapeSQL(docType)}, ${escapeSQL(docNum)}, ${escapeSQL(phone)}, ${escapeSQL(email)}, 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE okvet_patient_id = ${escapeSQL(petOkvetId)} OR (primary_owner_id = v_owner_id AND name ILIKE ${escapeSQL(petName)}) LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, ${escapeSQL(petName)}, ${escapeSQL(species)}, ${escapeSQL(breed)}, ${escapeSQL(sex)}, ${escapeSQL(petOkvetId)}, 'ACTIVE')
            RETURNING id INTO v_pet_id;
        ELSE
            UPDATE public.pets
            SET okvet_patient_id = ${escapeSQL(petOkvetId)},
                species = ${escapeSQL(species)},
                breed = ${escapeSQL(breed)},
                sex = ${escapeSQL(sex)}
            WHERE id = v_pet_id;
        END IF;
      `);
    }
  }

  // 2. Procesar Fórmulas Médicas
  if (fs.existsSync(formulasFile)) {
    console.log("Procesando Fórmulas Médicas...");
    const rawFormulas = fs.readFileSync(formulasFile, 'utf-8');
    const rows = parseCSV(rawFormulas);
    console.log(`Filas encontradas en Fórmulas: ${rows.length}`);

    // Headers: Fecha fórmula, Diagnóstico presuntivo y/o final, Tratamientos (raw), Tratamientos (I. II.), Observaciones, Nombre, Especie, Otra especie, Raza, Otra Raza, Género, E.Reproductivo, Temperamento, Fecha nacimiento, Edad, Peso, Color, Comida, Código/Chip, Nombre (owner), Identificación, Expedición, Celular, Teléfono, Dirección, País, Región, Ciudad, Localidad, Id (formula), Autor, Fecha registro, Fecha edición
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r.length < 30) continue;

      const formulaDate = r[0] || '2026-11-01';
      const diagnosis = (r[1] || 'Consulta médica').replace(/\r?\n+/g, ' · ').trim();
      const rawTreatments = r[3] || r[2] || '';
      const observations = (r[4] || '').replace(/\r?\n+/g, ' ').trim();

      const petName = r[5] || 'Mascota';
      const speciesRaw = (r[6] || '').toLowerCase();
      const species = speciesRaw.includes('gat') || speciesRaw.includes('fel') ? 'FELINE' : 'CANINE';
      const breed = r[8] || 'Mestizo';
      const genderRaw = (r[10] || '').toLowerCase();
      const sex = genderRaw.includes('hem') ? 'FEMALE' : (genderRaw.includes('mach') ? 'MALE' : 'UNKNOWN');

      const ownerName = r[19] || 'Tutor';
      const firstName = ownerName.split(' ')[0] || 'Tutor';
      const lastName = ownerName.substring(firstName.length).trim() || 'Cliente';
      const docNum = r[20] || '';
      const phone = cleanPhone(r[22] || r[23] || '');
      const formulaOkvetId = r[29] || ('FORM-' + i);
      const doctorName = r[30] || 'Dr. Luis Eduardo Ríos Ortiz';

      // Parsear tratamientos a lista JSON
      const medLines = rawTreatments.split(/\n+/).filter(l => l.trim().length > 0);
      const medications = [];

      for (const line of medLines) {
        const cleanLine = line.replace(/^[I|V|X]+\.\s*/, '').trim();
        if (!cleanLine) continue;

        // Intentar separar medicamento de posología
        const parts = cleanLine.split(/\s*#\d+\.\s*/);
        const medName = parts[0] || cleanLine;
        const doseInfo = parts[1] || 'Según indicación';

        medications.push({
          name: medName,
          dose: doseInfo,
          frequency: "Según pauta médica",
          duration: "Periodo prescrito",
          instructions: doseInfo
        });
      }

      if (medications.length === 0) {
        medications.push({
          name: "Tratamiento ambulatorio",
          dose: "Según evolución",
          frequency: "Indicada en consulta",
          duration: "7 días"
        });
      }

      const medsJson = JSON.stringify(medications);

      sqlStatements.push(`
        -- Fórmula: ${formulaOkvetId} para ${petName} (${ownerName})
        SELECT id INTO v_owner_id FROM public.owners WHERE primary_phone = ${escapeSQL(phone)} OR (document_number = ${escapeSQL(docNum)} AND ${escapeSQL(docNum)} <> '') LIMIT 1;
        IF v_owner_id IS NULL THEN
            INSERT INTO public.owners (organization_id, first_name, last_name, document_type, document_number, primary_phone, status)
            VALUES (v_org_id, ${escapeSQL(firstName)}, ${escapeSQL(lastName)}, 'CC', ${escapeSQL(docNum)}, ${escapeSQL(phone)}, 'ACTIVE')
            RETURNING id INTO v_owner_id;
        END IF;

        SELECT id INTO v_pet_id FROM public.pets WHERE primary_owner_id = v_owner_id AND name ILIKE ${escapeSQL(petName)} LIMIT 1;
        IF v_pet_id IS NULL THEN
            INSERT INTO public.pets (organization_id, primary_owner_id, name, species, breed, sex, okvet_patient_id, status)
            VALUES (v_org_id, v_owner_id, ${escapeSQL(petName)}, ${escapeSQL(species)}, ${escapeSQL(breed)}, ${escapeSQL(sex)}, ${escapeSQL('OKV-P-' + formulaOkvetId)}, 'ACTIVE')
            RETURNING id INTO v_pet_id;
        END IF;

        -- Documento en storage y bóveda
        SELECT id INTO v_doc_id FROM public.documents WHERE source_reference = ${escapeSQL(formulaOkvetId)} LIMIT 1;
        IF v_doc_id IS NULL THEN
            INSERT INTO public.documents (
                organization_id, pet_id, customer_id, document_type, source_system, source_reference,
                document_status, storage_bucket_reference, storage_object_reference, is_confidential_clinical
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, 'PRESCRIPTION', 'OKVET', ${escapeSQL(formulaOkvetId)},
                'APPROVED', 'medical-records', ${escapeSQL('prescriptions/' + formulaOkvetId + '.pdf')}, true
            ) RETURNING id INTO v_doc_id;
        END IF;

        -- Prescripción estructurada
        IF NOT EXISTS (SELECT 1 FROM public.prescriptions WHERE okvet_formula_id = ${escapeSQL(formulaOkvetId)}) THEN
            INSERT INTO public.prescriptions (
                organization_id, pet_id, owner_id, document_id, okvet_formula_id,
                veterinarian_name, professional_card_number, diagnosis,
                medications, general_instructions, issued_at, expires_at, status, storage_path
            ) VALUES (
                v_org_id, v_pet_id, v_owner_id, v_doc_id, ${escapeSQL(formulaOkvetId)},
                ${escapeSQL(doctorName)}, 'COMVEZCOL-001', ${escapeSQL(diagnosis)},
                ${escapeSQL(medsJson)}::jsonb, ${escapeSQL(observations)},
                ${escapeSQL(formulaDate)}::date, (${escapeSQL(formulaDate)}::date + INTERVAL '30 days'),
                'ACTIVE', ${escapeSQL('prescriptions/' + formulaOkvetId + '.pdf')}
            );
        END IF;
      `);
    }
  }

  sqlStatements.push(`    -- Actualizar metadata de snapshot`);
  sqlStatements.push(`    UPDATE public.okvet_snapshot_metadata`);
  sqlStatements.push(`    SET total_patients = (SELECT count(*) FROM public.pets),`);
  sqlStatements.push(`        is_stale = false,`);
  sqlStatements.push(`        updated_at = now()`);
  sqlStatements.push(`    WHERE organization_id = v_org_id;`);
  sqlStatements.push(`END;`);
  sqlStatements.push(`$$;`);

  const outputPath = path.join(__dirname, 'ingest_real_okvet_data.sql');
  fs.writeFileSync(outputPath, sqlStatements.join('\n'), 'utf-8');
  console.log(`Script SQL generado exitosamente en: ${outputPath}`);
}

run();
