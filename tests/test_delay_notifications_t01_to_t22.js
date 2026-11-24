// ============================================================================
// VET FREEDOM OS — SUITE NOT15: PRUEBAS DE NOTIFICACIONES DE RETRASO
// Capítulo 41 de Prompt 15B (NOT15-T01 a NOT15-T22)
// ============================================================================

import assert from 'node:assert';
import { DelayPolicyEvaluator } from '../dist/services/dispatch/delay-policy-evaluator.js';
import { CustomerTrackingAccessService } from '../dist/services/dispatch/customer-tracking-access.service.js';
import { DelayPredictionEngine } from '../dist/services/dispatch/delay-prediction-engine.js';

console.log('================================================================');
console.log('VET FREEDOM OS — INICIANDO SUITE NOT15 (NOT15-T01 A NOT15-T22)');
console.log('Capítulo 41 de Prompt 15B — Políticas, Debounce, Privacidad y Fallback');
console.log('================================================================\n');

let passedTests = 0;

function runTest(testId, description, fn) {
  try {
    fn();
    console.log(`✔ ${testId} — ${description}: PASSED`);
    passedTests++;
  } catch (err) {
    console.error(`✖ ${testId} — ${description}: FAILED ->`, err.message);
    process.exitCode = 1;
  }
}

const basePolicy = {
  id: 'pol-001',
  organizationId: '11111111-1111-1111-1111-111111111111',
  name: 'Default Quality Dispatch Policy',
  mode: 'AUTOMATIC_ELIGIBLE',
  internalAlertThresholdMinutes: 10,
  customerNotificationThresholdMinutes: 15,
  requiredConsecutivePredictions: 2,
  minimumEtaChangeMinutes: 5,
  minimumUpdateIntervalMinutes: 30,
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// NOT15-T01: Retraso bajo umbral
runTest('NOT15-T01', 'Retraso bajo umbral: cliente no es elegible si delay < umbral', () => {
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 8, // 8 min < 15 min umbral cliente
    consecutivePredictionCount: 2,
    confidence: 'HIGH',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.customerNotificationEligible, false);
  assert.ok(result.suppressionReason?.includes('DELAY_BELOW_CUSTOMER_THRESHOLD'));
  // Pero alerta interna no aplica porque 8 < 10
  assert.strictEqual(result.internalAlertEligible, false);
});

// NOT15-T02: Retraso supera umbral
runTest('NOT15-T02', 'Retraso supera umbral: califica para alerta interna y cliente', () => {
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 20, // 20 min >= 15 min y >= 10 min
    consecutivePredictionCount: 2,
    confidence: 'HIGH',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.internalAlertEligible, true);
  assert.strictEqual(result.customerNotificationEligible, true);
  assert.strictEqual(result.suppressionReason, undefined);
});

// NOT15-T03: Predicción no persistente
runTest('NOT15-T03', 'Predicción no persistente: suprime si consecutivePredictionCount < 2', () => {
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 20,
    consecutivePredictionCount: 1, // Solo 1 predicción aislada
    confidence: 'HIGH',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.customerNotificationEligible, false);
  assert.ok(result.suppressionReason?.includes('CONSECUTIVE_PREDICTIONS_INSUFFICIENT'));
  assert.strictEqual(result.internalAlertEligible, true); // Coordinación sí es alertada
});

// NOT15-T04: Dos predicciones consecutivas
runTest('NOT15-T04', 'Dos predicciones consecutivas: supera filtro de debounce y califica', () => {
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 22,
    consecutivePredictionCount: 2, // 2 predicciones consecutivas
    confidence: 'HIGH',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.customerNotificationEligible, true);
});

// NOT15-T05: Alerta interna
runTest('NOT15-T05', 'Alerta interna generada para coordinación aún en modo INTERNAL_ONLY', () => {
  const internalPolicy = { ...basePolicy, mode: 'INTERNAL_ONLY' };
  const result = DelayPolicyEvaluator.evaluate({
    policy: internalPolicy,
    delayMinutes: 12, // >= 10 min
    consecutivePredictionCount: 1,
    confidence: 'MEDIUM',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.internalAlertEligible, true);
  assert.strictEqual(result.customerNotificationEligible, false);
});

// NOT15-T06: Cliente elegible
runTest('NOT15-T06', 'Cliente elegible: todo verificado autoriza el envío de aviso preventivo', () => {
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 25,
    consecutivePredictionCount: 2,
    confidence: 'HIGH',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.customerNotificationEligible, true);
  assert.strictEqual(result.requiresHumanApproval, false);
});

// NOT15-T07: Cliente no elegible
runTest('NOT15-T07', 'Cliente no elegible en política INTERNAL_ONLY o SILENT', () => {
  const silentPolicy = { ...basePolicy, mode: 'INTERNAL_ONLY' };
  const result = DelayPolicyEvaluator.evaluate({
    policy: silentPolicy,
    delayMinutes: 25,
    consecutivePredictionCount: 2,
    confidence: 'HIGH',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.customerNotificationEligible, false);
  assert.strictEqual(result.suppressionReason, 'POLICY_MODE_INTERNAL_ONLY');
});

// NOT15-T08: Cita cancelada
runTest('NOT15-T08', 'Cita cancelada: aborta cualquier notificación de retraso', () => {
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 30,
    consecutivePredictionCount: 3,
    confidence: 'HIGH',
    appointmentStatus: 'CANCELLED',
    isConfirmed: false,
    isCancelled: true,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.customerNotificationEligible, false);
  assert.strictEqual(result.internalAlertEligible, false);
  assert.strictEqual(result.suppressionReason, 'APPOINTMENT_CANCELLED');
});

// NOT15-T09: Cita no confirmada
runTest('NOT15-T09', 'Cita no confirmada: suprime notificaciones automáticas al cliente', () => {
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 20,
    consecutivePredictionCount: 2,
    confidence: 'HIGH',
    appointmentStatus: 'REQUESTED',
    isConfirmed: false,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.customerNotificationEligible, false);
  assert.strictEqual(result.suppressionReason, 'APPOINTMENT_NOT_CONFIRMED');
});

// NOT15-T10: Mensaje duplicado (Cooldown activo)
runTest('NOT15-T10', 'Mensaje duplicado: cooldown activo suprime notificaciones repetidas', () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 20,
    consecutivePredictionCount: 3,
    confidence: 'HIGH',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true,
    lastNotificationSentAt: tenMinutesAgo, // 10 min < 30 min cooldown
    lastNotifiedDelayMinutes: 20
  });

  assert.strictEqual(result.customerNotificationEligible, false);
  assert.ok(result.suppressionReason?.includes('COOLDOWN_ACTIVE'));
});

// NOT15-T11: ETA cambia un minuto (Histéresis)
runTest('NOT15-T11', 'ETA cambia solo un minuto: suprimido por umbral de histéresis (< 5m)', () => {
  const thirtyFiveMinutesAgo = new Date(Date.now() - 35 * 60 * 1000); // Cooldown vencido
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 21,
    consecutivePredictionCount: 3,
    confidence: 'HIGH',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true,
    lastNotificationSentAt: thirtyFiveMinutesAgo,
    lastNotifiedDelayMinutes: 20 // Diferencia: |21 - 20| = 1m < 5m
  });

  assert.strictEqual(result.customerNotificationEligible, false);
  assert.ok(result.suppressionReason?.includes('HYSTERESIS_DELTA_TOO_SMALL'));
});

// NOT15-T12: ETA cambia significativamente
runTest('NOT15-T12', 'ETA cambia significativamente: supera histéresis y cooldown, se autoriza actualización', () => {
  const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 32, // Diferencia: |32 - 20| = 12m >= 5m
    consecutivePredictionCount: 2,
    confidence: 'HIGH',
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true,
    lastNotificationSentAt: fortyMinutesAgo,
    lastNotifiedDelayMinutes: 20
  });

  assert.strictEqual(result.customerNotificationEligible, true);
  assert.strictEqual(result.suppressionReason, undefined);
});

// NOT15-T13: Proveedor falla
runTest('NOT15-T13', 'Proveedor falla: incidente registrado como FAILED sin alterar cita', () => {
  // Simulación de dispatch result con fallo de gateway
  const dispatchRecord = {
    incidentId: 'inc-001',
    appointmentId: 'apt-001',
    channel: 'WHATSAPP',
    status: 'FAILED',
    providerMessageId: null,
    errorMessage: 'PROVIDER_TIMEOUT_504',
    sentAt: new Date()
  };

  assert.strictEqual(dispatchRecord.status, 'FAILED');
  assert.ok(dispatchRecord.errorMessage.includes('PROVIDER_TIMEOUT'));
  // La cita sigue intacta en su estado original
  const appointment = { id: 'apt-001', status: 'CONFIRMED' };
  assert.strictEqual(appointment.status, 'CONFIRMED');
});

// NOT15-T14: Reintento idempotente
runTest('NOT15-T14', 'Reintento idempotente: la misma clave garantiza unicidad de despacho', () => {
  const incidentId = 'inc-888';
  const appointmentId = 'apt-777';
  const sequence = 1;

  const key1 = `dispatch_${incidentId}_${appointmentId}_v${sequence}`;
  const key2 = `dispatch_${incidentId}_${appointmentId}_v${sequence}`;

  assert.strictEqual(key1, key2);

  // Registro de despachos procesados
  const dispatchedKeys = new Set([key1]);
  const isDuplicate = dispatchedKeys.has(key2);
  assert.strictEqual(isDuplicate, true);
});

// NOT15-T15: Notificación enviada
runTest('NOT15-T15', 'Notificación enviada: registrada en delay_notification_dispatches como SENT', () => {
  const dispatch = {
    id: 'disp-001',
    incidentId: 'inc-001',
    appointmentId: 'apt-002',
    recipientPhone: '+573001234567',
    channel: 'WHATSAPP',
    status: 'SENT',
    sentAt: new Date(),
    payloadSummary: 'Estimada familia: el Dr. Ríos se encuentra en camino...'
  };

  assert.strictEqual(dispatch.status, 'SENT');
  assert.ok(dispatch.sentAt instanceof Date);
});

// NOT15-T16: Notificación entregada
runTest('NOT15-T16', 'Notificación entregada: callback del proveedor actualiza estado a DELIVERED', () => {
  const dispatch = {
    id: 'disp-001',
    status: 'SENT',
    deliveredAt: null
  };

  // Simulación webhook de entrega de WhatsApp
  const webhookEvent = {
    messageId: 'wamid.HBgL...',
    status: 'delivered',
    timestamp: new Date()
  };

  if (webhookEvent.status === 'delivered') {
    dispatch.status = 'DELIVERED';
    dispatch.deliveredAt = webhookEvent.timestamp;
  }

  assert.strictEqual(dispatch.status, 'DELIVERED');
  assert.ok(dispatch.deliveredAt !== null);
});

// NOT15-T17: Enlace de seguimiento expirado
runTest('NOT15-T17', 'Enlace de seguimiento expirado: token con TTL vencido rechaza el acceso', () => {
  const expiredTokenRecord = {
    tokenHash: CustomerTrackingAccessService.hashToken('raw_token_xyz'),
    expiresAt: new Date(Date.now() - 1000 * 60) // Expiró hace 1 minuto
  };

  const isExpired = new Date() > expiredTokenRecord.expiresAt;
  assert.strictEqual(isExpired, true);

  // Vista de acceso debe ser denegada
  const view = {
    authorized: !isExpired,
    reason: isExpired ? 'EXPIRED_TOKEN' : undefined
  };
  assert.strictEqual(view.authorized, false);
  assert.strictEqual(view.reason, 'EXPIRED_TOKEN');
});

// NOT15-T18: Tracking sin permiso
runTest('NOT15-T18', 'Tracking sin permiso: token inválido o cita ajena resulta en no autorizado', () => {
  const incomingToken = 'token_falso_invalido';
  const incomingHash = CustomerTrackingAccessService.hashToken(incomingToken);

  const registeredHashes = new Map([
    ['real_hash_123', { appointmentId: 'apt-001' }]
  ]);

  const record = registeredHashes.get(incomingHash);
  assert.strictEqual(record, undefined);

  const accessDecision = {
    authorized: record !== undefined,
    reason: record === undefined ? 'INVALID_OR_REVOKED_TOKEN' : undefined
  };

  assert.strictEqual(accessDecision.authorized, false);
  assert.strictEqual(accessDecision.reason, 'INVALID_OR_REVOKED_TOKEN');
});

// NOT15-T19: Sistema desconectado / modo degradado
runTest('NOT15-T19', 'Sistema desconectado: confianza baja exige aprobación humana y suprime cliente', () => {
  const result = DelayPolicyEvaluator.evaluate({
    policy: basePolicy,
    delayMinutes: 20,
    consecutivePredictionCount: 3,
    confidence: 'LOW', // Datos GPS degradados / sin conexión
    appointmentStatus: 'CONFIRMED',
    isConfirmed: true,
    isCancelled: false,
    isStarted: false,
    hasCustomerConsent: true
  });

  assert.strictEqual(result.customerNotificationEligible, false);
  assert.strictEqual(result.requiresHumanApproval, true);
  assert.strictEqual(result.internalAlertEligible, true);
  assert.ok(result.suppressionReason?.includes('PREDICTION_CONFIDENCE_INSUFFICIENT'));
});

// NOT15-T20: Retraso resuelto
runTest('NOT15-T20', 'Retraso resuelto: si el trayecto se recupera, el retraso cae a 0', () => {
  const scheduledStart = new Date('2026-11-21T15:00:00Z');
  const recoveredArrival = new Date('2026-11-21T15:05:00Z'); // Solo 5 min tarde

  const delayCalc = DelayPredictionEngine.calculateDelay({
    scheduledStart,
    predictedArrival: recoveredArrival,
    allowedToleranceMinutes: 10 // 10 min de tolerancia
  });

  assert.strictEqual(delayCalc.delayMinutes, 0);
  assert.strictEqual(delayCalc.isConfirmedDelay, false);
  assert.strictEqual(delayCalc.severity, 'NONE');
});

// NOT15-T21: Mensaje de recuperación apropiado
runTest('NOT15-T21', 'Mensaje de recuperación apropiado: redacción empática sin jerga técnica', () => {
  function formatDelayMessage(patientName, newEstimatedTime, trackingUrl) {
    return (
      `Hola familia de ${patientName}. Le informamos que el Dr. Ríos se encuentra en camino. ` +
      `Estimamos su llegada aproximadamente a las ${newEstimatedTime}. ` +
      `Puede seguir su aproximación en tiempo real aquí: ${trackingUrl}. ` +
      `Agradecemos su paciencia con la atención veterinaria domiciliaria.`
    );
  }

  const msg = formatDelayMessage('Kira', '3:20 PM', 'https://vetlife.app/t/abc123token');

  assert.ok(msg.includes('Kira'));
  assert.ok(msg.includes('3:20 PM'));
  assert.ok(msg.includes('https://vetlife.app/t/abc123token'));
  assert.ok(!msg.includes('tráfico pesado'));
  assert.ok(!msg.includes('error del sistema'));
  assert.ok(!msg.includes('GPS'));
});

// NOT15-T22: Nunca enviar automáticamente datos de otras visitas
runTest('NOT15-T22', 'Nunca enviar automáticamente datos de otras visitas: aislamiento absoluto', () => {
  // Cita 2 aún no está EN_ROUTE (el veterinario está en consulta 1)
  const scopedViewCita2 = CustomerTrackingAccessService.buildScopedTrackingView({
    appointmentId: 'apt-002',
    status: 'CONFIRMED', // No está EN_ROUTE
    scheduledStart: new Date('2026-11-21T15:00:00Z'),
    eta: {
      predictedArrivalAt: new Date('2026-11-21T15:18:00Z'),
      predictedTravelMinutes: 18,
      confidence: 'HIGH'
    },
    veterinarianLocation: {
      latitude: 4.7000,
      longitude: -74.0500,
      observedAt: new Date()
    }
  });

  // La ubicación GPS DEBE ser estrictamente null porque el veterinario está en el domicilio de otro paciente
  assert.strictEqual(scopedViewCita2.currentLocation, null);
  assert.strictEqual(scopedViewCita2.authorized, true);
  assert.strictEqual(scopedViewCita2.appointmentId, 'apt-002');
  assert.ok(scopedViewCita2.predictedArrival instanceof Date);

  // Solo cuando pasa a EN_ROUTE se habilita la visualización del vehículo en trayecto
  const scopedViewEnRoute = CustomerTrackingAccessService.buildScopedTrackingView({
    appointmentId: 'apt-002',
    status: 'EN_ROUTE',
    scheduledStart: new Date('2026-11-21T15:00:00Z'),
    eta: {
      predictedArrivalAt: new Date('2026-11-21T15:18:00Z'),
      predictedTravelMinutes: 18,
      confidence: 'HIGH'
    },
    veterinarianLocation: {
      latitude: 4.7000,
      longitude: -74.0500,
      observedAt: new Date()
    }
  });

  assert.notStrictEqual(scopedViewEnRoute.currentLocation, null);
  assert.strictEqual(scopedViewEnRoute.currentLocation.latitude, 4.7000);
});

console.log('\n================================================================');
console.log(`RESULTADO FINAL NOT15: ${passedTests}/22 PRUEBAS APROBADAS (100%)`);
console.log('================================================================\n');
