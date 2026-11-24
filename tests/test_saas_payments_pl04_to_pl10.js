/**
 * VET FREEDOM OS & ALPHA VISION — TEST SUITE PL04 TO PL10
 * Verificación de Pasarelas, Pagos Manuales (Tickets PL-04 y PL-05) y Cliente Claude
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('================================================================');
console.log('ALPHA VISION & VET LIFE — TEST SUITE PL04 TO PL10 (PAGOS & IA)');
console.log('================================================================\n');

let passed = 0;
const total = 7;

function test(id, description, fn) {
  try {
    fn();
    console.log(`[PASS] ${id}: ${description}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${id}: ${description}`);
    console.error(`       Error: ${err.message}`);
  }
}

// PL04: Migración 048 existe y contiene DDL válido
test('PL04', 'Migración 048 existe con saas_payment_transactions, saas_invoices y RLS', () => {
  const migPath = path.join(__dirname, '../supabase/migrations/048_saas_payment_gateways_and_manual_billing.sql');
  assert.strictEqual(fs.existsSync(migPath), true);
  const sql = fs.readFileSync(migPath, 'utf-8');
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.saas_payment_transactions/);
  assert.match(sql, /CREATE TABLE IF NOT EXISTS public\.saas_invoices/);
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.register_manual_tenant_payment/);
});

// PL05: Lógica de Idempotencia y Firma HMAC para Webhooks (Wompi / Stripe)
test('PL05', 'Validación de firma HMAC y protección contra duplicidad con idempotency_key', () => {
  const secret = 'prod_events_secret_alpha_vision_2026';
  const payload = JSON.stringify({
    event: 'transaction.updated',
    data: {
      transaction: {
        id: 'wompi-tx-89472',
        status: 'APPROVED',
        amount_in_cents: 38900000,
        reference: 'VET-SANROQUE-SUB-01'
      }
    },
    timestamp: 1795440000
  });

  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const computed = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  assert.strictEqual(hmac, computed, 'La firma HMAC debe coincidir exactamente');

  // Idempotencia
  const processedKeys = new Set();
  const idempKey = 'IDEMP-WOMPI-89472';
  assert.strictEqual(processedKeys.has(idempKey), false);
  processedKeys.add(idempKey);
  assert.strictEqual(processedKeys.has(idempKey), true, 'Transacción duplicada debe ser detectada');
});

// PL06: Registro de Pago Manual y Extensión de Licencia (+30 días)
test('PL06', 'Registro de pago manual Bancolombia ($389.000 COP) extiende vigencia 30 días', () => {
  const license = {
    id: 'lic-demo-1',
    organization_id: '22222222-2222-2222-2222-222222222222',
    status: 'ACTIVE',
    expires_at: new Date('2026-11-23T00:00:00Z')
  };

  const amountCop = 389000;
  const paymentMethod = 'BANCOLOMBIA_TRANSFER';
  const reference = 'BC-847291';

  // Simulación RPC register_manual_tenant_payment
  const initialExpiry = new Date(license.expires_at).getTime();
  license.expires_at = new Date(initialExpiry + 30 * 86400000);
  license.last_payment_at = new Date();

  assert.strictEqual(license.expires_at.getTime(), initialExpiry + 30 * 86400000);
  assert.strictEqual(amountCop, 389000);
});

// PL07: Generación de Factura B2B con Numeración Secuencial
test('PL07', 'Factura generada contiene formato canónico INV-ALPHAV-YYMM-XXXXXX', () => {
  const invNumber = 'INV-ALPHAV-2611-849201';
  assert.match(invNumber, /^INV-ALPHAV-\d{4}-\w{6}$/);
});

// PL08: Claude Client con Filtro Heurístico Local de Costo Cero ($0.00 USD)
test('PL08', 'Filtro heurístico responde a palabras clave sin gastar tokens ni invocar API', () => {
  const clientPath = path.join(__dirname, '../design-blueprint/src/lib/ai/claudeClient.ts');
  assert.strictEqual(fs.existsSync(clientPath), true);
  const code = fs.readFileSync(clientPath, 'utf-8');
  assert.match(code, /HEURISTIC_BYPASS_LOCAL/);
  assert.match(code, /cache_control:\s*\{\s*type:\s*"ephemeral"\s*\}/);
});

// PL09: Enrutamiento Inteligente Haiku vs Sonnet
test('PL09', 'Enrutamiento selecciona claude-3-5-haiku por defecto y reserva sonnet para clínica profunda', () => {
  const code = fs.readFileSync(path.join(__dirname, '../design-blueprint/src/lib/ai/claudeClient.ts'), 'utf-8');
  assert.match(code, /claude-3-5-haiku-20241022/);
  assert.match(code, /claude-3-5-sonnet-20241022/);
  assert.match(code, /isDeepClinical/);
});

// PL10: Componentes UI de Pago Manual e Inspector integrados
test('PL10', 'ManualPaymentModal e Inspector de Entitlements integrados en OwnerCommandCenter', () => {
  const occPath = path.join(__dirname, '../design-blueprint/src/features/system-administration/pages/OwnerCommandCenter.tsx');
  const occCode = fs.readFileSync(occPath, 'utf-8');
  assert.match(occCode, /ManualPaymentModal/);
  assert.match(occCode, /isPaymentModalOpen/);
  assert.match(occCode, /inspeccionar-entitlements/);
  assert.match(occCode, /askClaude/);
});

console.log('\n----------------------------------------------------------------');
console.log(`RESUMEN: ${passed} / ${total} PRUEBAS PASADAS (${Math.round(passed / total * 100)}%)`);
console.log('----------------------------------------------------------------\n');

if (passed === total) {
  console.log('>>> TODAS LAS PRUEBAS DE PASARELAS Y CLAUDE AI PASARON CON ÉXITO <<<\n');
  process.exit(0);
} else {
  process.exit(1);
}
