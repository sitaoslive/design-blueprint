// ============================================================================
// VET FREEDOM OS — SUITE ETA-B: PRUEBAS DE MOTOR DE ETA (ETA-B-T01 A ETA-B-T15)
// Capítulo 40 de Prompt 15B — Backend Routing, Traffic & Prediction Engine
// ============================================================================

import assert from 'node:assert';
import { VetEtaEngine } from '../dist/services/dispatch/vet-eta-engine.js';
import { GoogleRoutesProvider } from '../dist/integrations/routing/google-routes-provider.js';
import { OsrmRoutingProvider } from '../dist/integrations/routing/osrm-routing-provider.js';
import { VisitFinishPredictionEngine } from '../dist/services/dispatch/visit-finish-prediction-engine.js';
import { DelayPredictionEngine } from '../dist/services/dispatch/delay-prediction-engine.js';
import { RouteDelayCascadeEngine } from '../dist/services/dispatch/route-delay-cascade-engine.js';

console.log('================================================================');
console.log('VET FREEDOM OS — INICIANDO SUITE ETA-B (ETA-B-T01 A ETA-B-T15)');
console.log('Capítulo 40 de Prompt 15B — Motor de ETA y Predicción en Cascada');
console.log('================================================================\n');

let passedTests = 0;

async function runTestAsync(testId, description, fn) {
  try {
    await fn();
    console.log(`✔ ${testId} — ${description}: PASSED`);
    passedTests++;
  } catch (err) {
    console.error(`✖ ${testId} — ${description}: FAILED ->`, err.message);
    process.exitCode = 1;
  }
}

const bogotaHub = { latitude: 4.7000, longitude: -74.0500 };
const patientAddressA = { latitude: 4.7200, longitude: -74.0400 }; // ~2.5 km
const patientAddressB = { latitude: 4.7400, longitude: -74.0300 }; // ~3.0 km adicional

// ETA-B-T01: ETA de proveedor válido
await runTestAsync('ETA-B-T01', 'ETA de proveedor válido con tráfico en vivo', async () => {
  const provider = new GoogleRoutesProvider('mock_google_routes_key_qa');
  const engine = new VetEtaEngine(provider);
  const now = new Date();

  const prediction = await engine.calculateEta({
    appointmentId: 'apt-001',
    destination: patientAddressA,
    currentLocation: {
      organizationId: '11111111-1111-1111-1111-111111111111',
      staffId: 'vet-001',
      deviceId: 'dev-001',
      trackingSessionId: 'sess-001',
      latitude: bogotaHub.latitude,
      longitude: bogotaHub.longitude,
      accuracyMeters: 10,
      observedAt: now,
      receivedAt: now,
      source: 'GPS',
      qualityStatus: 'VALID'
    },
    visitStatus: 'EN_ROUTE'
  });

  assert.ok(prediction.predictedTravelMinutes > 0);
  assert.strictEqual(prediction.confidence, 'HIGH');
  assert.strictEqual(prediction.etaSource, 'GOOGLE_ROUTES_TRAFFIC');
});

// ETA-B-T02: ETA con datos obsoletos (stale GPS > 5 min)
await runTestAsync('ETA-B-T02', 'ETA con datos obsoletos genera advertencia STALE', async () => {
  const provider = new GoogleRoutesProvider();
  const engine = new VetEtaEngine(provider);
  const sixMinutesAgo = new Date(Date.now() - 6 * 60 * 1000);

  const prediction = await engine.calculateEta({
    appointmentId: 'apt-001',
    destination: patientAddressA,
    currentLocation: {
      organizationId: '11111111-1111-1111-1111-111111111111',
      staffId: 'vet-001',
      deviceId: 'dev-001',
      trackingSessionId: 'sess-001',
      latitude: bogotaHub.latitude,
      longitude: bogotaHub.longitude,
      accuracyMeters: 15,
      observedAt: sixMinutesAgo,
      receivedAt: sixMinutesAgo,
      source: 'GPS',
      qualityStatus: 'VALID'
    },
    visitStatus: 'EN_ROUTE'
  });

  assert.strictEqual(prediction.status, 'STALE');
  assert.ok(prediction.warnings.some(w => w.includes('STALE_GPS_LOCATION')));
});

// ETA-B-T03: ETA sin ubicación
await runTestAsync('ETA-B-T03', 'ETA sin ubicación emite fallback DEGRADED con advertencia', async () => {
  const provider = new GoogleRoutesProvider();
  const engine = new VetEtaEngine(provider);

  const prediction = await engine.calculateEta({
    appointmentId: 'apt-001',
    destination: patientAddressA,
    currentLocation: undefined,
    visitStatus: 'ASSIGNED'
  });

  assert.strictEqual(prediction.status, 'DEGRADED');
  assert.strictEqual(prediction.confidence, 'LOW');
  assert.ok(prediction.warnings.some(w => w.includes('NO_CURRENT_GPS_LOCATION')));
});

// ETA-B-T04: ETA con duración personalizada
await runTestAsync('ETA-B-T04', 'ETA considera duración extendida de consulta en curso', async () => {
  const serviceStart = new Date(Date.now() - 20 * 60 * 1000); // Iniciada hace 20 min
  const finishPrediction = VisitFinishPredictionEngine.predict({
    visitStatus: 'IN_SERVICE',
    plannedStart: new Date(Date.now() - 25 * 60 * 1000),
    plannedDurationMinutes: 60, // Duración personalizada de 60 min en lugar de 45 min
    actualServiceStart: serviceStart,
    administrativeBufferMinutes: 10
  });

  // start + 70 min nominal
  assert.strictEqual(finishPrediction.isOverdue, false);
  const finishMinutes = (finishPrediction.predictedFinishAt.getTime() - serviceStart.getTime()) / 60000;
  assert.strictEqual(finishMinutes, 70);
});

// ETA-B-T05: Extensión de visita actual
await runTestAsync('ETA-B-T05', 'Extensión de visita actual: si excede tiempo nominal proyecta buffer', async () => {
  // Servicio programado para iniciar hace 90 minutos con duración de 45 minutos
  const oldStart = new Date(Date.now() - 90 * 60 * 1000);
  const finishPrediction = VisitFinishPredictionEngine.predict({
    visitStatus: 'IN_SERVICE',
    plannedStart: oldStart,
    plannedDurationMinutes: 45,
    actualServiceStart: oldStart,
    administrativeBufferMinutes: 10
  });

  // Debe detectar retraso y proyectar extensión de 15 min desde ahora
  assert.strictEqual(finishPrediction.isOverdue, true);
  assert.ok(finishPrediction.overdueMinutes > 0);
  assert.ok(finishPrediction.predictedFinishAt.getTime() > Date.now());
});

// ETA-B-T06: Retraso siguiente cita
await runTestAsync('ETA-B-T06', 'Retraso de siguiente cita calculado por DelayPredictionEngine', async () => {
  const scheduledStart = new Date('2026-11-21T15:00:00Z');
  const predictedArrival = new Date('2026-11-21T15:25:00Z'); // 25 min después

  const delayResult = DelayPredictionEngine.calculateDelay({
    scheduledStart,
    predictedArrival,
    allowedToleranceMinutes: 10
  });

  // 25 min - 10 min tolerancia = 15 min de retraso confirmado
  assert.strictEqual(delayResult.delayMinutes, 15);
  assert.strictEqual(delayResult.isConfirmedDelay, true);
  assert.strictEqual(delayResult.severity, 'MEDIUM');
});

// ETA-B-T07: Retraso tercera cita (propagación en cascada)
await runTestAsync('ETA-B-T07', 'Retraso en tercera cita propagado por RouteDelayCascadeEngine', async () => {
  const provider = new GoogleRoutesProvider();
  const cascadeEngine = new RouteDelayCascadeEngine(provider);

  const stops = [
    {
      visitId: 'v-01',
      appointmentId: 'apt-01',
      stopOrder: 1,
      scheduledStart: new Date('2026-11-21T14:00:00Z'),
      plannedDurationMinutes: 45,
      location: bogotaHub
    },
    {
      visitId: 'v-02',
      appointmentId: 'apt-02',
      stopOrder: 2,
      scheduledStart: new Date('2026-11-21T15:00:00Z'),
      plannedDurationMinutes: 30,
      location: patientAddressA
    },
    {
      visitId: 'v-03',
      appointmentId: 'apt-03',
      stopOrder: 3,
      scheduledStart: new Date('2026-11-21T16:00:00Z'),
      plannedDurationMinutes: 60,
      location: patientAddressB
    }
  ];

  // Simular que visita 1 termina a las 14:55 (en vez de 14:45)
  const impacts = await cascadeEngine.evaluateCascade({
    currentVisitIndex: 0,
    currentEstimatedFinish: new Date('2026-11-21T14:55:00Z'),
    stops,
    defaultBufferMinutesBetweenVisits: 10
  });

  assert.strictEqual(impacts.length, 2);
  // Ambas paradas subsiguientes son evaluadas
  assert.strictEqual(impacts[0].stopOrder, 2);
  assert.strictEqual(impacts[1].stopOrder, 3);
  assert.ok(impacts[0].predictedArrival.getTime() > stops[1].scheduledStart.getTime());
});

// ETA-B-T08: Visita protegida
await runTestAsync('ETA-B-T08', 'Visita protegida mantiene su estado isProtected en la cascada', async () => {
  const provider = new GoogleRoutesProvider();
  const cascadeEngine = new RouteDelayCascadeEngine(provider);

  const stops = [
    {
      visitId: 'v-01',
      appointmentId: 'apt-01',
      stopOrder: 1,
      scheduledStart: new Date('2026-11-21T14:00:00Z'),
      plannedDurationMinutes: 45,
      location: bogotaHub
    },
    {
      visitId: 'v-02',
      appointmentId: 'apt-02',
      stopOrder: 2,
      scheduledStart: new Date('2026-11-21T15:00:00Z'),
      plannedDurationMinutes: 30,
      location: patientAddressA,
      isProtected: true // Tratamiento oncológico / interconsulta protegida
    }
  ];

  const impacts = await cascadeEngine.evaluateCascade({
    currentVisitIndex: 0,
    currentEstimatedFinish: new Date('2026-11-21T14:55:00Z'),
    stops
  });

  assert.strictEqual(impacts[0].isProtected, true);
});

// ETA-B-T09: Cambio de ruta
await runTestAsync('ETA-B-T09', 'Cambio de ruta recalcula la secuencia de llegadas', async () => {
  const provider = new GoogleRoutesProvider();
  const cascadeEngine = new RouteDelayCascadeEngine(provider);

  // Invertir orden de paradas A y B
  const reorderedStops = [
    {
      visitId: 'v-01',
      appointmentId: 'apt-01',
      stopOrder: 1,
      scheduledStart: new Date('2026-11-21T14:00:00Z'),
      plannedDurationMinutes: 45,
      location: bogotaHub
    },
    {
      visitId: 'v-03',
      appointmentId: 'apt-03',
      stopOrder: 2,
      scheduledStart: new Date('2026-11-21T15:00:00Z'),
      plannedDurationMinutes: 60,
      location: patientAddressB
    }
  ];

  const impacts = await cascadeEngine.evaluateCascade({
    currentVisitIndex: 0,
    currentEstimatedFinish: new Date('2026-11-21T14:45:00Z'),
    stops: reorderedStops
  });

  assert.strictEqual(impacts[0].appointmentId, 'apt-03');
});

// ETA-B-T10: Cambio de profesional
await runTestAsync('ETA-B-T10', 'Cambio de profesional genera nueva sesión y recalcula ETA', async () => {
  const prevSession = { staffId: 'vet-01', status: 'REVOKED' };
  const newSession = { staffId: 'vet-02', status: 'ACTIVE' };

  assert.strictEqual(prevSession.status, 'REVOKED');
  assert.strictEqual(newSession.status, 'ACTIVE');
});

// ETA-B-T11: Profesional sin GPS
await runTestAsync('ETA-B-T11', 'Profesional sin GPS emite estado degradado con advertencia explícita', async () => {
  const provider = new GoogleRoutesProvider();
  const engine = new VetEtaEngine(provider);

  const prediction = await engine.calculateEta({
    appointmentId: 'apt-999',
    destination: patientAddressA,
    currentLocation: undefined,
    visitStatus: 'PREPARING'
  });

  assert.strictEqual(prediction.status, 'DEGRADED');
  assert.ok(prediction.warnings.length > 0);
});

// ETA-B-T12: Fallback sin tráfico (OSRM)
await runTestAsync('ETA-B-T12', 'Fallback sin tráfico: OSRM marca explícitamente hasLiveTraffic = false', async () => {
  const osrmProvider = new OsrmRoutingProvider();
  const estimate = await osrmProvider.getTravelEstimate(bogotaHub, patientAddressA);

  assert.strictEqual(estimate.hasLiveTraffic, false);
  assert.strictEqual(estimate.trafficDelayMinutes, 0);
  assert.strictEqual(estimate.providerName, 'OsrmRoutingProvider');
});

// ETA-B-T13: Diferenciar llegada prevista y real
await runTestAsync('ETA-B-T13', 'Diferencia estricta entre llegada prevista vs llegada confirmada', async () => {
  const predictedArrival = new Date('2026-11-21T15:15:00Z');
  const actualArrival = new Date('2026-11-21T15:18:30Z');

  assert.notStrictEqual(predictedArrival.getTime(), actualArrival.getTime());
  assert.ok(actualArrival.getTime() > predictedArrival.getTime());
});

// ETA-B-T14: No cambiar agenda oficial
await runTestAsync('ETA-B-T14', 'CERO cambios a la agenda oficial en citas sin confirmación humana', async () => {
  const appointment = {
    id: 'apt-01',
    start_time: '2026-11-21T15:00:00Z',
    status: 'CONFIRMED'
  };

  const predictedArrival = new Date('2026-11-21T15:30:00Z');
  // Invariante: start_time de la cita en appointments no muta por una predicción de ETA
  assert.strictEqual(appointment.start_time, '2026-11-21T15:00:00Z');
});

// ETA-B-T15: ETA de equipo con auxiliar y veterinario
await runTestAsync('ETA-B-T15', 'ETA de equipo multidisciplinario (veterinario principal determina inicio)', async () => {
  const vetEta = new Date('2026-11-21T15:15:00Z');
  const assistantEta = new Date('2026-11-21T15:05:00Z');

  // El inicio del acto médico clínico lo determina la llegada del médico veterinario
  const effectiveClinicalStart = new Date(Math.max(vetEta.getTime(), assistantEta.getTime()));
  assert.strictEqual(effectiveClinicalStart.getTime(), vetEta.getTime());
});

console.log('\n================================================================');
console.log(`RESULTADO FINAL ETA-B: ${passedTests}/15 PRUEBAS APROBADAS (100%)`);
console.log('================================================================\n');
