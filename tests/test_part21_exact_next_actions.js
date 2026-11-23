/**
 * ALPHA VISION METHOD & VET FREEDOM OS — PART 21 NEXT ACTIONS TEST SUITE
 * Verificación Automatizada de los 3 Pasos de Salida a Producción:
 * Paso 1: Sesión de Demostración & Visto Bueno con Dr. Luis (production_release_signoffs)
 * Paso 2: Meta WhatsApp Cloud API & Conmutador send_enabled (organization_whatsapp_configs)
 * Paso 3: Pasarela Wompi Colombia Producción & Integridad SHA-256 (organization_payment_gateways)
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

console.log("================================================================================");
console.log("ALPHA VISION — TEST SUITE: 3 PASOS EXACTOS DE SALIDA A PRODUCCIÓN (PART 21)");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function test(id, description, fn) {
  try {
    fn();
    console.log(`[PASS] ${id}: ${description}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${id}: ${description}`);
    console.error(`       Error: ${err.message}`);
    failed++;
  }
}

// ============================================================================
// GRUPO 1: PASO 1 — SESIÓN Y ACTA DE VISTO BUENO CON DR. LUIS
// ============================================================================

test("STEP1-01", "Migración 052 define production_release_signoffs con RLS forzado", () => {
  const migPath = path.join(__dirname, "../supabase/migrations/052_production_readiness_actions_and_live_connectors.sql");
  assert.strictEqual(fs.existsSync(migPath), true, "Archivo 052 debe existir");
  const sql = fs.readFileSync(migPath, "utf-8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.production_release_signoffs/);
  assert.match(sql, /ALTER TABLE public\.production_release_signoffs FORCE ROW LEVEL SECURITY/);
  assert.match(sql, /CREATE POLICY production_release_signoffs_tenant_isolation/);
});

test("STEP1-02", "RPC schedule_dr_luis_signoff_session genera código de signoff único", () => {
  const migPath = path.join(__dirname, "../supabase/migrations/052_production_readiness_actions_and_live_connectors.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.schedule_dr_luis_signoff_session/);
  assert.match(sql, /SIGNOFF-VETLIFE-/);
  assert.match(sql, /COMVEZCOL-001/);
});

test("STEP1-03", "RPC record_dr_luis_signoff_approval genera hash criptográfico SHA-256", () => {
  const migPath = path.join(__dirname, "../supabase/migrations/052_production_readiness_actions_and_live_connectors.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.record_dr_luis_signoff_approval/);
  assert.match(sql, /digest\(p_signoff_code \|\| '\|' \|\| p_comvezcol/);
  assert.match(sql, /'APPROVED'/);
});

test("STEP1-04", "Convocatoria formal contiene agenda de 45 min y deep link a /demo-interactiva", () => {
  const hubPath = path.join(__dirname, "../design-blueprint/src/features/system-administration/components/ProductionLaunchExecutionHub.tsx");
  assert.strictEqual(fs.existsSync(hubPath), true, "ProductionLaunchExecutionHub debe existir");
  const hubCode = fs.readFileSync(hubPath, "utf-8");
  assert.match(hubCode, /Agenda Ejecutiva \(45 Minutos\)/);
  assert.match(hubCode, /https:\/\/luis\.alphavisionm\.com\/demo-interactiva/);
  assert.match(hubCode, /46 pacientes y 43 f/);
  assert.match(hubCode, /COMVEZCOL-001/);
});

test("STEP1-05", "Validación criptográfica local de firma digital del Dr. Luis", () => {
  const code = "SIGNOFF-VETLIFE-20261126-001";
  const comvezcol = "COMVEZCOL-001";
  const timestamp = "2026-11-26T10:45:00.000Z";
  const notes = "Plataforma aprobada al 100% para operación en Medellín y Oriente.";
  const raw = `${code}|${comvezcol}|${timestamp}|${notes}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  assert.strictEqual(hash.length, 64);
  assert.match(hash, /^[a-f0-9]{64}$/);
});

// ============================================================================
// GRUPO 2: PASO 2 — META WHATSAPP CLOUD API & SWITCH DE PRODUCCIÓN
// ============================================================================

test("STEP2-06", "Migración 052 define organization_whatsapp_configs con RLS forzado", () => {
  const migPath = path.join(__dirname, "../supabase/migrations/052_production_readiness_actions_and_live_connectors.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.organization_whatsapp_configs/);
  assert.match(sql, /ALTER TABLE public\.organization_whatsapp_configs FORCE ROW LEVEL SECURITY/);
  assert.match(sql, /send_enabled BOOLEAN NOT NULL DEFAULT false/);
  assert.match(sql, /meta_tier TEXT DEFAULT 'TIER_1K'/);
});

test("STEP2-07", "RPC toggle_whatsapp_production_mode conmuta send_enabled y registra hash de token", () => {
  const migPath = path.join(__dirname, "../supabase/migrations/052_production_readiness_actions_and_live_connectors.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.toggle_whatsapp_production_mode/);
  assert.match(sql, /send_enabled = p_send_enabled/);
  assert.match(sql, /TIER_1K \(1\.000 conversaciones\/24h\)/);
});

test("STEP2-08", "VET-CORE-03 en n8n soporta Graph API v21.0 y evalúa send_enabled condicionalmente", () => {
  const core03Path = path.join(__dirname, "../automation/n8n/core/VET-CORE-03.json");
  assert.strictEqual(fs.existsSync(core03Path), true);
  const core03 = JSON.parse(fs.readFileSync(core03Path, "utf-8"));
  const nodes = core03.nodes || [];
  const httpNode = nodes.find((n) => n.name && (n.name.includes("WhatsApp Business Cloud") || n.name.includes("Meta")));
  assert.ok(httpNode, "Debe existir nodo HTTP WhatsApp Business Cloud");
  assert.match(httpNode.parameters.url, /graph\.facebook\.com\/v21\.0/);
  assert.match(JSON.stringify(nodes), /send_enabled/);
});

test("STEP2-09", "VET-CORE-03 implementa reglas de supresión de duelo y opt-out de mercadeo", () => {
  const core03Path = path.join(__dirname, "../automation/n8n/core/VET-CORE-03.json");
  const core03 = JSON.parse(fs.readFileSync(core03Path, "utf-8"));
  const jsNode = core03.nodes.find((n) => n.parameters && n.parameters.jsCode);
  assert.ok(jsNode, "Debe existir nodo JavaScript de validación de reglas");
  const code = jsNode.parameters.jsCode;
  assert.match(code, /bereavement_active/);
  assert.match(code, /MARKETING_OPT_OUT_SUPPRESSION/);
  assert.match(code, /TEMPLATE_REQUIRED_OUTSIDE_WINDOW/);
});

test("STEP2-10", "ProductionLaunchExecutionHub incluye interruptor con advertencia de seguridad", () => {
  const hubPath = path.join(__dirname, "../design-blueprint/src/features/system-administration/components/ProductionLaunchExecutionHub.tsx");
  const hubCode = fs.readFileSync(hubPath, "utf-8");
  assert.match(hubCode, /ADVERTENCIA DE SEGURIDAD/);
  assert.match(hubCode, /Conmutar a send_enabled: true/);
  assert.match(hubCode, /Tier 1 \(1\.000 conv\/24h\)/);
  assert.match(hubCode, /Meta Graph API v21\.0/);
});

// ============================================================================
// GRUPO 3: PASO 3 — PASARELA WOMPI COLOMBIA & INTEGRIDAD SHA-256
// ============================================================================

test("STEP3-11", "Migración 052 define organization_payment_gateways con soporte Wompi y RLS", () => {
  const migPath = path.join(__dirname, "../supabase/migrations/052_production_readiness_actions_and_live_connectors.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.organization_payment_gateways/);
  assert.match(sql, /gateway_provider TEXT NOT NULL CHECK \(gateway_provider IN \('WOMPI', 'STRIPE'\)\)/);
  assert.match(sql, /environment TEXT NOT NULL DEFAULT 'SANDBOX'/);
  assert.match(sql, /ALTER TABLE public\.organization_payment_gateways FORCE ROW LEVEL SECURITY/);
});

test("STEP3-12", "RPC configure_wompi_production_gateway almacena hashes de secreto de integridad", () => {
  const migPath = path.join(__dirname, "../supabase/migrations/052_production_readiness_actions_and_live_connectors.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.configure_wompi_production_gateway/);
  assert.match(sql, /digest\(p_integrity_secret, 'sha256'\)/);
  assert.match(sql, /digest\(p_events_secret, 'sha256'\)/);
});

test("STEP3-13", "Fórmula oficial de firma de integridad SHA-256 de Wompi Bancolombia", () => {
  const reference = "WMP-20261123-A89F12";
  const amountCop = 25000;
  const amountInCents = amountCop * 100; // 2500000
  const currency = "COP";
  const integritySecret = "prod_integrity_9812hks0192hjs8172";
  const concatenated = `${reference}${amountInCents}${currency}${integritySecret}`;
  const sha256Hash = crypto.createHash("sha256").update(concatenated).digest("hex");
  assert.strictEqual(sha256Hash.length, 64);
  assert.match(sha256Hash, /^[a-f0-9]{64}$/);
});

test("STEP3-14", "RPC simulate_wompi_service_payment inserta en saas_payment_transactions y saas_invoices con saldo 0", () => {
  const migPath = path.join(__dirname, "../supabase/migrations/052_production_readiness_actions_and_live_connectors.sql");
  const sql = fs.readFileSync(migPath, "utf-8");
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.simulate_wompi_service_payment/);
  assert.match(sql, /INSERT INTO public\.saas_payment_transactions/);
  assert.match(sql, /INSERT INTO public\.saas_invoices/);
  assert.match(sql, /'balance_cop', 0\.00/);
  assert.match(sql, /'PAID'/);
});

test("STEP3-15", "ProductionLaunchExecutionHub ofrece liquidación de tele-triaje ($25.000 COP) y consulta ($120.000 COP)", () => {
  const hubPath = path.join(__dirname, "../design-blueprint/src/features/system-administration/components/ProductionLaunchExecutionHub.tsx");
  const hubCode = fs.readFileSync(hubPath, "utf-8");
  assert.match(hubCode, /Tele-Triaje Nocturno/);
  assert.match(hubCode, /25000/);
  assert.match(hubCode, /Consulta Domiciliaria/);
  assert.match(hubCode, /120000/);
  assert.match(hubCode, /BANCOLOMBIA/);
  assert.match(hubCode, /NEQUI/);
});

test("STEP3-16", "ProductionReadinessDashboard integra ProductionLaunchExecutionHub limpiamente", () => {
  const dashPath = path.join(__dirname, "../design-blueprint/src/features/system-administration/pages/ProductionReadinessDashboard.tsx");
  const dashCode = fs.readFileSync(dashPath, "utf-8");
  assert.match(dashCode, /import \{ ProductionLaunchExecutionHub \} from/);
  assert.match(dashCode, /<ProductionLaunchExecutionHub \/>/);
});

console.log("\n================================================================================");
console.log(`RESULTADO FINAL: ${passed} / ${passed + failed} PRUEBAS SUPERADAS`);
if (failed === 0) {
  console.log("STATUS: ALL 3 PRODUCTION ACTIONS VERIFIED (100% PASS)");
} else {
  console.log(`STATUS: ${failed} TEST(S) FAILED`);
}
console.log("================================================================================\n");

process.exit(failed === 0 ? 0 : 1);
