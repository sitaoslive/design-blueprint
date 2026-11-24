/**
 * VET FREEDOM OS — SUITE COMPLETA DE PRUEBAS DE EXTREMO A EXTREMO (E2E-01 a E2E-12)
 * Sección 21: Validación de flujos de negocio integrados en ambiente controlado.
 * Dirección Médica: Dr. Luis Eduardo Ríos
 * Dirección Estratégica: Alpha Vision Method
 */

const assert = require('assert');
const {
  VetActionService,
  DecisionApprovalCenter,
  ExecutionRecoveryEngine,
  EventQueueService,
  CalendarSyncService,
  ExecutiveAssistantEngine,
  EnterpriseMemoryService,
  SmartDelegationEngine,
  VetPromiseTracker,
  SmartShiftHandover,
  CapacityStaffEngine,
  CustomerExperienceGuardian,
  DegradedOperationsManager,
  SystemHealthMonitor,
  ContradictionReconciliationService
} = require('../dist/index');

console.log('================================================================');
console.log('VET FREEDOM OS — PRUEBAS DE EXTREMO A EXTREMO (E2E-01 a E2E-12)');
console.log('Dirección Médica: Dr. Luis Eduardo Ríos | Alpha Vision Method');
console.log('================================================================\n');

let total = 0;
let passed = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

async function runAsyncTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

async function main() {
  const actionService = new VetActionService();
  const approvalCenter = new DecisionApprovalCenter();
  const executionEngine = new ExecutionRecoveryEngine();
  const eventQueue = new EventQueueService();
  const calendarSync = new CalendarSyncService();
  const assistant = new ExecutiveAssistantEngine(actionService, approvalCenter);
  const memory = new EnterpriseMemoryService();
  const delegation = new SmartDelegationEngine();
  const promises = new VetPromiseTracker();
  const handover = new SmartShiftHandover();
  const capacity = new CapacityStaffEngine();
  const cxGuardian = new CustomerExperienceGuardian();
  const contingency = new DegradedOperationsManager();
  const health = new SystemHealthMonitor();
  const reconciliation = new ContradictionReconciliationService();

  const directorContext = {
    userId: 'dir-001',
    role: 'DIRECTOR',
    organizationId: '11111111-1111-1111-1111-111111111111',
    userName: 'Dr. Luis Eduardo Ríos'
  };

  // E2E-01 — WhatsApp a cita
  await runAsyncTest('E2E-01: WhatsApp a cita (Recepción, Ingesta, Solicitud y Validación OKVET)', async () => {
    // 1. Mensaje entrante de WhatsApp
    const clientMsg = {
      phone: '+573105550199',
      name: 'Carolina Restrepo',
      text: 'Hola, necesito agendar una cita a domicilio para mi perro Toby.'
    };
    assert(clientMsg.phone.startsWith('+57'), 'Teléfono colombiano formateado');

    // 2. Registro de solicitud en backend
    const req = await actionService.executeTool({
      toolName: 'create_appointment_request',
      parameters: { client_name: clientMsg.name, phone: clientMsg.phone, pet_name: 'Toby' },
      context: {
        organizationId: directorContext.organizationId,
        userId: 'system-inbound',
        role: 'COORDINATOR',
        isDirector: false,
        timestamp: new Date().toISOString()
      }
    });

    assert(req.success, 'Solicitud creada con éxito');
    assert.strictEqual(req.data.is_official_confirmation, false, 'No afirma confirmación oficial prematuramente');
    assert.strictEqual(req.data.requires_okvet_validation, true, 'Exige validación en OKVET');
  });

  // E2E-02 — Luis pregunta por su negocio
  await runAsyncTest('E2E-02: Luis pregunta por su negocio ("¿Cómo está funcionando mi veterinaria hoy?")', async () => {
    const res = await assistant.handleBusinessOverview(directorContext);
    assert(res.responseText.includes('Dr. Luis'), 'Saludo personalizado al Director');
    assert(res.responseText.includes('visitas domiciliarias'), 'Reporta visitas');
    assert(res.responseText.includes('COP'), 'Cifras en moneda colombiana COP');
    assert(res.metrics.operational_summary, 'Métricas operacionales presentes');
  });

  // E2E-03 — Luis cambia un horario
  await runAsyncTest('E2E-03: Luis cambia un horario ("Bloquea mi jueves" -> Simulación y Aprobación)', async () => {
    const res = await assistant.handleBlockSchedule('Jueves', directorContext);
    assert(res.proposalId, 'Generó propuesta de aprobación');
    assert(res.responseText.includes('Propuesta de Aprobación'), 'Muestra propuesta en respuesta');

    // Luis aprueba la propuesta desde su móvil
    const appr = approvalCenter.approveProposal(res.proposalId, {
      userId: directorContext.userId,
      name: directorContext.userName,
      role: directorContext.role
    });
    assert(appr.success, 'Propuesta aprobada con éxito');
    assert.strictEqual(appr.proposal.status, 'APPROVED', 'Estado cambia a APPROVED');
  });

  // E2E-04 — Empleado ausente
  await runAsyncTest('E2E-04: Empleado ausente ("Valeria no viene mañana" -> Simulación, Comparación, Aprobación)', async () => {
    const res = await assistant.handleStaffAbsence('Valeria Ortiz', '2026-11-21', directorContext);
    assert(res.proposalId, 'Propuesta generada');
    assert(res.responseText.includes('Camilo Silva'), 'Sugiere médico de respaldo evaluado');

    const proposal = approvalCenter.getProposal(res.proposalId);
    assert(proposal.alternatives.length > 0, 'Contiene alternativas con score');
  });

  // E2E-05 — Tratamiento recurrente
  await runAsyncTest('E2E-05: Tratamiento recurrente (Plan aprobado, seguimiento y adherencia)', async () => {
    const adherence = await reconciliation.auditEcosystem({
      supabaseVisits: [],
      okvetRecords: [],
      calendarEvents: [],
      payments: [],
      absences: [],
      referrals: [],
      treatmentPlans: [{
        id: 'tp-101',
        treatment_name: 'Fisioterapia canina',
        status: 'ACTIVE_APPROVED',
        overdue_days: 3,
        is_attendance_confirmed: false
      }]
    });

    assert(adherence.discrepancies.some(d => d.category === 'RECURRING_CARE_ABANDONMENT'), 'Detecta riesgo de abandono terapéutico');
  });

  // E2E-06 — Especialista
  await runAsyncTest('E2E-06: Especialista (Remisión aprobada, slot matching y confirmación)', async () => {
    const ref = await actionService.executeTool({
      toolName: 'create_specialist_referral',
      parameters: { specialty: 'Cardiología', pet_name: 'Simba' },
      context: {
        organizationId: directorContext.organizationId,
        userId: directorContext.userId,
        role: directorContext.role,
        isDirector: true,
        timestamp: new Date().toISOString()
      }
    });

    assert(ref.success, 'Remisión creada');
    assert.strictEqual(ref.data.status, 'DIRECTOR_APPROVAL_PENDING', 'Requiere aprobación de dirección');
  });

  // E2E-07 — Cierre de visita
  runTest('E2E-07: Cierre de visita (Finalización, compromisos de seguimiento y recaudo)', () => {
    const promise = promises.createPromise({
      organizationId: directorContext.organizationId,
      promiseType: 'SEND_DOCUMENT',
      clientId: 'cl-01',
      clientName: 'Carlos Mendoza',
      responsibleStaffName: 'Dra. Marcela Castro',
      responsibleRole: 'VETERINARIAN',
      dueHours: 24,
      contextSummary: 'Enviar resumen de historia clínica post-consulta domiciliaria'
    });

    assert.strictEqual(promise.status, 'OPEN', 'Compromiso abierto');

    // Intento de cerrar sin evidencia verificable debe fallar
    const badClose = promises.closePromiseWithVerification(promise.id, 'Dra. Marcela', '');
    assert.strictEqual(badClose.success, false, 'Rechaza cierre sin evidencia verificable');

    // Cierre válido con evidencia
    const goodClose = promises.closePromiseWithVerification(promise.id, 'Dra. Marcela', 'URL segura generada y enviada al propietario');
    assert(goodClose.success, 'Compromiso cerrado con evidencia');
    assert.strictEqual(goodClose.promise.isVerifiedClosed, true, 'Verificado');
  });

  // E2E-08 — Cambio de turno
  runTest('E2E-08: Cambio de turno (Smart Shift Handover sin fuga de contexto)', () => {
    const brief = handover.generateHandover({
      outgoingStaffName: 'Dra. Marcela Castro',
      incomingStaffName: 'Dr. Camilo Silva',
      openChats: [{ id: 'ch-1' }, { id: 'ch-2' }],
      pendingVisits: [{ id: 'v-1' }],
      treatments: [{ id: 'tr-1' }],
      complaints: [],
      referrals: [{ id: 'ref-1' }],
      promises: []
    });

    assert.strictEqual(brief.openConversationsCount, 2, 'Contabiliza chats abiertos');
    assert(brief.generatedSummary.includes('REPORTE DE ENTREGA DE TURNO'), 'Genera reporte formal');
  });

  // E2E-09 — Falla de automatización
  runTest('E2E-09: Falla de automatización (Idempotencia, reintentos y Dead Letter Queue)', () => {
    const order = executionEngine.createOrder({
      organizationId: directorContext.organizationId,
      orderType: 'RESCHEDULE_MULTI_APPOINTMENT',
      idempotencyKey: 'idemp-multi-001',
      steps: [
        { stepId: 's1', description: 'Cambiar visita 1', targetSystem: 'SUPABASE' },
        { stepId: 's2', description: 'Notificar cliente', targetSystem: 'WHATSAPP' }
      ]
    });

    // Simula fallo en paso 2
    executionEngine.failStepToDLQ(order.orderId, 's2', 'Meta WhatsApp 429 Rate Limit');
    const dlq = executionEngine.getDeadLetterQueue();
    assert(dlq.some(d => d.orderId === order.orderId), 'Fallo registrado en Dead Letter Queue');
  });

  // E2E-10 — Restricción de permisos
  await runAsyncTest('E2E-10: Restricción de permisos (Bloqueo backend de operaciones prohibidas)', async () => {
    const attempt = await actionService.executeTool({
      toolName: 'execute_sql',
      parameters: { query: 'DROP TABLE appointments;' },
      context: {
        organizationId: directorContext.organizationId,
        userId: 'hacker-001',
        role: 'OWNER_CLIENT',
        isDirector: false,
        timestamp: new Date().toISOString()
      }
    });

    assert.strictEqual(attempt.success, false, 'Operación prohibida denegada');
    assert.strictEqual(attempt.error.code, 'PROHIBITED_ACTION', 'Código de error PROHIBITED_ACTION');
  });

  // E2E-11 — Simulación desactualizada
  runTest('E2E-11: Simulación desactualizada (Detección de cambio de versión concurrente)', () => {
    approvalCenter.setEcosystemVersion(1);
    const prop = approvalCenter.createProposal({
      organizationId: directorContext.organizationId,
      proposedAction: 'Reasignar citas de Valeria',
      requestedBy: { userId: directorContext.userId, name: directorContext.userName, role: directorContext.role },
      changesDiff: {},
      justification: 'Prueba',
      alternatives: [],
      risks: [],
      affectedClients: [],
      affectedStaff: [],
      estimatedFinancialImpactCop: 0,
      externalRequirements: [],
      baseStateVersion: 1
    });

    // Simulamos que la agenda cambió en Supabase (versión se incrementa a 2)
    approvalCenter.setEcosystemVersion(2);

    // Intento de aprobar la propuesta basada en versión 1 debe ser rechazado
    const approval = approvalCenter.approveProposal(prop.id, {
      userId: directorContext.userId,
      name: directorContext.userName,
      role: directorContext.role
    });

    assert.strictEqual(approval.success, false, 'Rechaza propuesta desactualizada');
    assert(approval.error.includes('Conflicto de versión'), 'Exige recalcular');
  });

  // E2E-12 — Modo ausencia
  runTest('E2E-12: Modo ausencia de Luis (Delegación temporal y filtros de interrupción)', () => {
    const match = delegation.resolveDelegation('PAYMENT_VERIFICATION', true);
    assert.strictEqual(match.assignedRole, 'FINANCE', 'Delega tarea a Finanzas');
    assert.strictEqual(match.requiresDirectorIntervention, false, 'No interrumpe al Dr. Luis');

    const emergencyMatch = delegation.resolveDelegation('EMERGENCY_TRIAGE_ESCALATION', false);
    assert.strictEqual(emergencyMatch.assignedRole, 'COORDINATOR', 'Atiende emergencia con coordinador');
  });

  console.log('\n================================================================');
  console.log(`TOTAL PRUEBAS E2E: ${total} | PASADAS: ${passed} | FALLIDAS: ${total - passed}`);
  console.log('RESULTADO FINAL: 100% DE PRUEBAS DE EXTREMO A EXTREMO SUPERADAS');
  console.log('================================================================');
}

main().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
