/**
 * VET FREEDOM OS — SCRIPT CLI DE IMPORTACIÓN DE PACIENTES OKVET
 * Permite cargar rápidamente cualquier archivo CSV o JSON de OKVET hacia Supabase
 * Ejecución: node scripts/import_okvet_csv.js <ruta_al_archivo_csv>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = "https://sznvahhocgnhsqhksygq.supabase.co";
const SUPABASE_KEY = "sb_publishable_caToaYTxjdravNvXvDuVLg_htNwLZzI";

async function main() {
  const filePath = process.argv[2] || path.join(__dirname, '../docs/templates/OKVET_EXPORT_TEMPLATE.csv');

  if (!fs.existsSync(filePath)) {
    console.error(`Error: Archivo no encontrado en ${filePath}`);
    process.exit(1);
  }

  console.log(`Leyendo exportación de OKVET desde: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');

  if (lines.length < 2) {
    console.error("El archivo está vacío o no contiene encabezados.");
    process.exit(1);
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const patients = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length >= 4) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      patients.push(row);
    }
  }

  console.log(`Procesando ${patients.length} registros de pacientes...`);

  // Llamada al RPC de Supabase
  const payload = JSON.stringify({ p_patients: patients });
  const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/batch_import_okvet_patients`);

  const req = https.request(url, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log("¡Importación exitosa en Supabase!", body);
      } else {
        console.error(`Fallo en Supabase (HTTP ${res.statusCode}):`, body);
      }
    });
  });

  req.on('error', (err) => {
    console.error("Error en la solicitud HTTP:", err.message);
  });

  req.write(payload);
  req.end();
}

main();
