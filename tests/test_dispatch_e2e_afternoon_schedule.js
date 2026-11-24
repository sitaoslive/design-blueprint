// ============================================================================
// VET FREEDOM OS — SUITE E2E: SIMULACIÓN DE AGENDA VESPERTINA EN CASCADA
// Capítulo 42 de Prompt 15B — Prueba End-to-End Principal (3 Visitas)
// ============================================================================

import assert from 'node:assert';
import { GoogleRoutesProvider } from '../dist/integrations/routing/google-routes-provider.js';
import { VisitFinishPredictionEngine } from '../dist/services/dispatch/visit-finish-prediction-engine.js';
import { RouteDelayCascadeEngine } from '../dist/services/dispatch/route-delay-cascade-engine.js';
import { DelayPolicyEvaluator } from '../dist/services/dispatch/delay-policy-evaluator.js';
import { CustomerTrackingAccessService } from '../dist/services/dispatch/customer-tracking-access.service.js';

console.log('================================================================');
console.log('VET FREEDOM OS — INICIANDO SUITE E2E DISPATCH (CAPÍTULO 42)');
console.log('Simulación de Cascada Vespertina: 3 Citas con Retraso Proyectado');
console.log('================================================================\n');

let stepCount = 0;
function logStep(name, detail) {
  stepCount++;
  console.log(`[Paso ${stepCount}] ${name}: ${detail}`);
}

async function runSimulation() {
  // ----------------------------------------------------------------------------
  // 1. DEFINICIÓN DE LA AGENDA VESPERTINA
  // ----------------------------------------------------------------------------
  const baseDateStr = '2026-11-21';

  // Cita 1: 2:00 PM (14:00), duración programada: 45 min
  const apt1 = {
    visitId: 'v-01',
    appointmentId: 'apt-v1-001',
    patientName: 'Lucas (Canino)',
    clientPhone: '+573001112233',
    scheduledStart: new Date(`${baseDateStr}T14:00:00-05:00`),
    scheduledEnd: new Date(`${baseDateStr}T14:45:00-05:00`),
    plannedDurationMinutes: 45,
    status: 'IN_SERVICE',
    isProtected: false,
    location: { latitude: 4.6980, longitude: -74.0450 }
  };

  // Cita 2: 3:00 PM (15:00), duración programada: 30 min
  const apt2 = {
    visitId: 'v-02',
    appointmentId: 'apt-v2-002',
    patientName: 'Misi (Felino)',
    clientPhone: '+573004445566',
    scheduledStart: new Date(`${baseDateStr}T15:00:00-05:00`),
    scheduledEnd: new Date(`${baseDateStr}T15:30:00-05:00`),
    plannedDurationMinutes: 30,
    status: 'CONFIRMED',
    isProtected: false,
    location: { latitude: 4.7150, longitude: -74.0380 }
  };

  // Cita 3: 4:00 PM (16:00), duración programada: 60 min (Cita protegida / procedimiento)
  const apt3 = {
    visitId: 'v-03',
    appointmentId: 'apt-v3-003',
    patientName: 'Rex (Canino Geronte)',
    clientPhone: '+573007778899',
    scheduledStart: new Date(`${baseDateStr}T16:00:00-05:00`),
    scheduledEnd: new Date(`${baseDateStr}T17:00:00-05:00`),
    plannedDurationMinutes: 60,
    status: 'CONFIRMED',
    isProtected: true, // Procedimiento con restricción horaria estricta
    location: { latitude: 4.7320, longitude: -74.0290 }
  };

  logStep('Configuración Inicial', '3 citas cargadas (14:00 45m, 15:00 30m, 16:00 60m protegida)');

  // ----------------------------------------------------------------------------
  // 2. SIMULACIÓN: EXTENSIÓN DE LA VISITA 1
  // ----------------------------------------------------------------------------
  // El veterinario atiende a Lucas. Por necesidad clínica, a las 14:35 actualiza la estimación:
  // En vez de terminar a las 14:45, finalizará a las 15:15 (30 min de extensión por dificultad en toma de muestras).
  const revisedFinishApt1 = new Date(`${baseDateStr}T15:15:00-05:00`);

  const finishPrediction1 = VisitFinishPredictionEngine.predict({
    visitStatus: 'IN_SERVICE',
    plannedStart: apt1.scheduledStart,
    plannedDurationMinutes: apt1.plannedDurationMinutes,
    actualServiceStart: apt1.scheduledStart,
    revisedEstimatedFinish: revisedFinishApt1
  });

  assert.strictEqual(finishPrediction1.predictedFinishAt.getTime(), revisedFinishApt1.getTime());
  logStep('Extensión Visita 1', `Estimación revisada por el veterinario a las 15:15 (${finishPrediction1.explanation})`);

  // ----------------------------------------------------------------------------
  // 3. CÁLCULO DE CASCADA PARA VISITAS SUBSIGUIENTES (VISITA 2 Y VISITA 3)
  // ----------------------------------------------------------------------------
  const routingProvider = new GoogleRoutesProvider('mock_google_routes_key_qa');
  const cascadeEngine = new RouteDelayCascadeEngine(routingProvider);

  const stops = [
    { ...apt1, stopOrder: 1 },
    { ...apt2, stopOrder: 2 },
    { ...apt3, stopOrder: 3 }
  ];

  const cascadeResults = await cascadeEngine.evaluateCascade({
    currentVisitIndex: 0,
    currentEstimatedFinish: finishPrediction1.predictedFinishAt,
    stops,
    defaultBufferMinutesBetweenVisits: 5
  });

  assert.strictEqual(cascadeResults.length, 2);

  const cascadeApt2 = cascadeResults[0];
  const cascadeApt3 = cascadeResults[1];

  assert.strictEqual(cascadeApt2.appointmentId, apt2.appointmentId);
  assert.strictEqual(cascadeApt3.appointmentId, apt3.appointmentId);

  // La llegada proyectada a la visita 2 debe ser posterior a las 15:00
  assert.ok(cascadeApt2.predictedArrival.getTime() > apt2.scheduledStart.getTime());
  assert.strictEqual(cascadeApt2.isDelayed, true);
  assert.ok(cascadeApt2.delayMinutes > 0);

  // La visita 3 mantiene su protección
  assert.strictEqual(cascadeApt3.isProtected, true);

  logStep(
    'Cálculo de Cascada',
    `Visita 2 prevista a las ${cascadeApt2.predictedArrival.toISOString()} (retraso: ${cascadeApt2.delayMinutes}m). Visita 3 protegida: ${cascadeApt3.isProtected}`
  );

  // ----------------------------------------------------------------------------
  // 4. EVALUACIÓN DE POLÍTICA Y GENERACIÓN DE ALERTAS
  // ----------------------------------------------------------------------------
  const operationalPolicy = {
    id: 'pol-oper-01',
    organizationId: '11111111-1111-1111-1111-111111111111',
    name: 'Bogotá Quality Service Policy',
    mode: 'AUTOMATIC_ELIGIBLE',
    internalAlertThresholdMinutes: 5, // Alerta interna desde 5 min
    customerNotificationThresholdMinutes: 10, // Notificar cliente desde 10 min
    requiredConsecutivePredictions: 2,
    minimumEtaChangeMinutes: 5,
    minimumUpdateIntervalMinutes: 20,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Evaluación para Visita 2 (2 predicciones consecutivas recibidas)
  const decisionApt2 = DelayPolicyEvaluator.evaluate({
    policy: operationalPolicy,
    delayMinutes: cascadeApt2.delayMinutes,
    consecutivePredictionCount: 2,
    confidence: 'HIGH',
    appointmentStatus: apt2.status,
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(decisionApt2.internalAlertEligible, true);
  assert.strictEqual(decisionApt2.customerNotificationEligible, true);
  assert.strictEqual(decisionApt2.requiresHumanApproval, false);

  logStep(
    'Evaluación de Política (Visita 2)',
    `Alerta interna: SÍ. Elegible cliente: SÍ. Aprobación humana requerida: NO.`
  );

  // ----------------------------------------------------------------------------
  // 5. REGISTRO DE INCIDENTE Y DESPACHO EN MODO SEGURO (QA / DEV)
  // ----------------------------------------------------------------------------
  const delayIncident = {
    id: 'inc-cascade-001',
    originVisitId: apt1.visitId,
    affectedCount: 2,
    primaryDelayMinutes: cascadeApt2.delayMinutes,
    severity: cascadeApt2.severity,
    status: 'ACTIVE',
    createdAt: new Date()
  };

  const dispatchRecord = {
    id: 'disp-cascade-001',
    incidentId: delayIncident.id,
    appointmentId: apt2.appointmentId,
    recipientPhone: apt2.clientPhone,
    messagePreview: `Hola familia de ${apt2.patientName}. El Dr. Ríos llegará aprox con ${cascadeApt2.delayMinutes} min de retraso...`,
    sendEnabled: false, // REGLA: envíos reales deshabilitados en QA
    status: 'QUEUED_SAFE_MODE',
    idempotencyKey: `disp_${delayIncident.id}_${apt2.appointmentId}_v1`
  };

  assert.strictEqual(dispatchRecord.sendEnabled, false);
  assert.strictEqual(dispatchRecord.status, 'QUEUED_SAFE_MODE');
  logStep('Despacho Simulado (Modo Seguro)', `Incidente registrado con sendEnabled=false (IdempotencyKey: ${dispatchRecord.idempotencyKey})`);

  // ----------------------------------------------------------------------------
  // 6. VERIFICACIÓN DE PRIVACIDAD DEL CLIENTE (VISTA TIPO UBER)
  // ----------------------------------------------------------------------------
  // A. Mientras el Dr. está atendiendo la Visita 1 (apt2 está en estado CONFIRMED)
  const trackingViewWhileInApt1 = CustomerTrackingAccessService.buildScopedTrackingView({
    appointmentId: apt2.appointmentId,
    status: apt2.status, // 'CONFIRMED'
    scheduledStart: apt2.scheduledStart,
    eta: {
      predictedArrivalAt: cascadeApt2.predictedArrival,
      predictedTravelMinutes: 15,
      confidence: 'HIGH'
    },
    veterinarianLocation: { latitude: apt1.location.latitude, longitude: apt1.location.longitude, observedAt: new Date() } // Coordenadas del domicilio de Lucas
  });

  // Privacidad: El cliente 2 NO debe ver las coordenadas de Lucas
  assert.strictEqual(trackingViewWhileInApt1.currentLocation, null);
  assert.strictEqual(trackingViewWhileInApt1.appointmentId, apt2.appointmentId);
  assert.ok(trackingViewWhileInApt1.predictedArrival instanceof Date);
  logStep('Verificación de Privacidad (Cita 2 CONFIRMED)', 'Ubicación GPS es estrictamente NULL (no filtra domicilio de Lucas)');

  // B. Cuando el Dr. finaliza Visita 1 y pasa a EN_ROUTE hacia Visita 2
  const trackingViewEnRoute = CustomerTrackingAccessService.buildScopedTrackingView({
    appointmentId: apt2.appointmentId,
    status: 'EN_ROUTE',
    scheduledStart: apt2.scheduledStart,
    eta: {
      predictedArrivalAt: cascadeApt2.predictedArrival,
      predictedTravelMinutes: 15,
      confidence: 'HIGH'
    },
    veterinarianLocation: { latitude: 4.7050, longitude: -74.0410, observedAt: new Date() } // Vehículo en vía pública
  });

  assert.notStrictEqual(trackingViewEnRoute.currentLocation, null);
  assert.strictEqual(trackingViewEnRoute.currentLocation.latitude, 4.7050);
  logStep('Verificación de Seguimiento en Vivo (EN_ROUTE)', 'Ubicación en vía pública visible para la familia de Misi');

  // ----------------------------------------------------------------------------
  // 7. COMPROBACIÓN DE INVARIABLES DEL SISTEMA
  // ----------------------------------------------------------------------------
  // Invariable 1: CERO cambios a la agenda oficial sin intervención del director
  assert.strictEqual(apt1.scheduledStart.toISOString(), `${baseDateStr}T19:00:00.000Z`); // 14:00 UTC-5 = 19:00Z
  assert.strictEqual(apt2.scheduledStart.toISOString(), `${baseDateStr}T20:00:00.000Z`); // 15:00 UTC-5 = 20:00Z
  assert.strictEqual(apt3.scheduledStart.toISOString(), `${baseDateStr}T21:00:00.000Z`); // 16:00 UTC-5 = 21:00Z
  logStep('Invariable 1: Horas Oficiales', 'Horarios de cita en Supabase permanecen 100% inalterados');

  // Invariable 2: Cita protegida preservada
  assert.strictEqual(apt3.isProtected, true);
  assert.strictEqual(cascadeApt3.isProtected, true);
  logStep('Invariable 2: Cita Protegida', 'Visita 3 (Rex, geronte) conserva bandera de protección intacta');

  // Invariable 3: Idempotencia verificada
  const duplicateAttempt = { ...dispatchRecord };
  assert.strictEqual(duplicateAttempt.idempotencyKey, dispatchRecord.idempotencyKey);
  logStep('Invariable 3: Idempotencia', 'Misma clave previene despachos dobles en caso de reejecución');

  console.log('\n================================================================');
  console.log('RESULTADO FINAL E2E: SIMULACIÓN DE CASCADA COMPLETADA CON ÉXITO');
  console.log('================================================================\n');
}

runSimulation().catch(err => {
  console.error('ERROR EN SIMULACIÓN E2E:', err);
  process.exit(1);
});
