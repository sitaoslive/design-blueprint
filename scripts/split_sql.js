const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'ingest_real_okvet_data.sql');
const content = fs.readFileSync(sqlPath, 'utf-8');

// Header template
const header = `DO $$
DECLARE
    v_org_id UUID := '11111111-1111-1111-1111-111111111111';
    v_owner_id UUID;
    v_pet_id UUID;
    v_doc_id UUID;
BEGIN
`;

const footer = `
END;
$$;
`;

// Extract individual patient and formula blocks
const regex = /(-- (?:Paciente|Fórmula):[\s\S]*?)(?=(?:-- (?:Paciente|Fórmula):|-- Actualizar metadata|$))/g;
const blocks = [];
let match;
while ((match = regex.exec(content)) !== null) {
  const block = match[1].trim();
  if (block.length > 0) {
    blocks.push(block);
  }
}

console.log(`Total bloques limpios encontrados: ${blocks.length}`);

// Group in chunks of 5 blocks
const chunkSize = 5;
const totalChunks = Math.ceil(blocks.length / chunkSize);

for (let c = 0; c < totalChunks; c++) {
  const chunkBlocks = blocks.slice(c * chunkSize, (c + 1) * chunkSize);
  const isLast = (c === totalChunks - 1);

  let body = chunkBlocks.join('\n\n');
  if (isLast) {
    body += `\n\n    -- Actualizar metadata de snapshot
    UPDATE public.okvet_snapshot_metadata
    SET total_patients = (SELECT count(*) FROM public.pets),
        is_stale = false,
        updated_at = now()
    WHERE organization_id = v_org_id;`;
  }

  const chunkSql = header + body + footer;
  const chunkFile = path.join(__dirname, `part_${c + 1}.sql`);
  fs.writeFileSync(chunkFile, chunkSql, 'utf-8');
  console.log(`Guardado ${chunkFile} (${chunkSql.length} bytes, ${chunkBlocks.length} bloques)`);
}
