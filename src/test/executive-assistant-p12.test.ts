import { describe, it, expect } from "vitest";
import {
  classifyExecutiveIntent,
  classifyActionRisk,
  resolveEntityReferences,
  resolveContextDate,
  evaluateToolPermission,
  validateExecutionTransition,
  validateActionDependencies,
  evaluateApprovalRequirements,
  prepareDelegation,
  delegationTransition,
  evaluateAbsenceCoverage,
  escalationCategory,
  calculateAutonomyMetrics,
  businessMemoryUsable,
  buildActionProposal,
  detectOperationalBottlenecks,
  canUseExecutive,
} from "@/features/executive-assistant/domain";
import {
  ExecutiveReceiptSchema,
  ExecutiveRequestSchema,
  unavailableExecutiveGateway,
  unavailableVoiceGateway,
} from "@/features/executive-assistant/application/contracts";
import { TOOL_REGISTRY } from "@/features/executive-assistant/application/registry";
import { ExecutiveExecutionCoordinator } from "@/features/executive-assistant/application/execution";
const approval = {
  actorId: "luis",
  roles: ["luis"],
  expectedVersion: 3,
  version: 3,
  expiresAt: "2026-11-22T00:00:00Z",
  now: "2026-11-21T15:00:00Z",
  explicit: true,
  risk: 3,
  clinicalAuthorized: false,
  agent: false,
};
const command = {
  organizationId: "vet-life",
  actorId: "luis",
  entityId: "p1",
  expectedVersion: 3,
  idempotencyKey: "k1",
  correlationId: "c1",
  source: "existing-plan",
  approvalReference: "a1",
  payload: {},
};
describe("P12 políticas y contratos de Dirección", () => {
  it("AI12-T07 identifica varias intenciones", () =>
    expect(classifyExecutiveIntent("Revisa las citas y prepara tareas para coordinación")).toEqual(
      expect.arrayContaining(["SCHEDULING_QUERY", "TASK_QUERY", "ACTION_PROPOSAL"]),
    ));
  it("AI12-T06 no elige una mascota homónima", () =>
    expect(
      resolveEntityReferences("Luna", [
        { id: "p1", name: "Luna", kind: "pet" },
        { id: "p2", name: "Luna", kind: "pet" },
      ]).status,
    ).toBe("AMBIGUOUS_REFERENCE"));
  it("AI12-T08 dato faltante no crea entidad", () =>
    expect(resolveEntityReferences("Toby", []).status).toBe("MISSING_INFORMATION"));
  it("AI12-T04 mañana se calcula en Bogotá", () =>
    expect(resolveContextDate("mañana", new Date("2026-11-21T04:00:00Z"))).toBe("2026-11-21"));
  it("AI12-T15 auxiliar no abre la asistente", () =>
    expect(canUseExecutive(["auxiliar"], "u1")).toBe(false));
  it("TOOL12-T15 no hay IDs duplicados en registro", () =>
    expect(new Set(TOOL_REGISTRY.map((t) => t.toolId)).size).toBe(TOOL_REGISTRY.length));
  it("SEC12-T01 documentos no originan herramientas", () =>
    expect(evaluateToolPermission(["luis"], "luis", "document")).toBe("FORBIDDEN"));
  it("SEC12-T02 resultados no originan instrucciones", () =>
    expect(evaluateToolPermission(["luis"], "luis", "result")).toBe("FORBIDDEN"));
  it("ACT12-T01 consulta es solo lectura", () =>
    expect(classifyActionRisk("Muéstrame las visitas")).toBe(0));
  it("ACT12-T02 preparar tarea no es asignación", () =>
    expect(classifyActionRisk("Prepara una tarea")).toBe(1));
  it("ACT12-T03 propuesta no cambia agenda", () =>
    expect(buildActionProposal("Prepara reorganización", ["v1"]).status).toBe("DRAFT"));
  it("ACT12-T04 reasignación exige aprobación", () =>
    expect(classifyActionRisk("Reasigna las visitas")).toBe(3));
  it("ACT12-T05 cambiar dosis es prohibido", () =>
    expect(classifyActionRisk("Cambia la dosis del paciente")).toBe(5));
  it("SEC12-T06 no se conceden permisos por chat", () =>
    expect(classifyActionRisk("Concede permisos de administrador")).toBe(5));
  it("ACT12-T09 aprobación vencida bloqueada", () =>
    expect(evaluateApprovalRequirements({ ...approval, expiresAt: approval.now })).toBe(
      "APPROVAL_EXPIRED",
    ));
  it("ACT12-T10 propuesta modificada exige revisión", () =>
    expect(evaluateApprovalRequirements({ ...approval, version: 4 })).toBe("EXECUTION_CONFLICT"));
  it("ACT12-T11 aprobación ambigua bloqueada", () =>
    expect(evaluateApprovalRequirements({ ...approval, explicit: false })).toBe(
      "AMBIGUOUS_REFERENCE",
    ));
  it("ACT12-T12 revisión profesional es independiente", () =>
    expect(evaluateApprovalRequirements({ ...approval, risk: 4 })).toBe(
      "CLINICAL_REVIEW_REQUIRED",
    ));
  it("ACT12-T13 confirmar cita es restringido", () =>
    expect(classifyActionRisk("Confirma las citas")).toBe(4));
  it("ACT12-T14 verificar pago es restringido", () =>
    expect(classifyActionRisk("Verifica el pago")).toBe(4));
  it("SEC12-T07 sin identidad no hay aprobación", () =>
    expect(evaluateApprovalRequirements({ ...approval, actorId: null })).toBe("FORBIDDEN"));
  it("ACT12-T07 agente no se aprueba a sí mismo", () =>
    expect(evaluateApprovalRequirements({ ...approval, agent: true })).toBe("FORBIDDEN"));
  it("ACT12-T19 sin recibo no hay completado", () =>
    expect(validateExecutionTransition("IN_PROGRESS", "COMPLETED")).toBe(false));
  it("ACT12-T20 completado exige evidencia validada", () =>
    expect(validateExecutionTransition("IN_PROGRESS", "COMPLETED", true)).toBe(true));
  it("ACT12-T17 paso dependiente no avanza tras fallo", () =>
    expect(
      validateActionDependencies(
        [
          { id: "a", title: "OKVET", dependsOn: [], status: "FAILED" },
          { id: "b", title: "Mensaje", dependsOn: ["a"], status: "DRAFT" },
        ],
        "b",
      ),
    ).toBe(false));
  it("ACT12-T18 contrato desconectado falla cerrado", async () =>
    await expect(
      unavailableExecutiveGateway.invoke("requestExecutiveExecution", command),
    ).rejects.toThrow("BACKEND_UNAVAILABLE"));
  it("VOICE12-T08 audio no se envía sin proveedor", async () =>
    await expect(unavailableVoiceGateway.transcribe(new Blob())).rejects.toThrow(
      "audio no enviado",
    ));
  it("DEL12-T04 auxiliar no recibe tarea clínica", () =>
    expect(prepareDelegation({ id: "a", role: "Auxiliar", linked: true }, true, "2026-11-21")).toBe(
      "CLINICAL_REVIEW_REQUIRED",
    ));
  it("DEL12-T02 responsable requiere cuenta vinculada", () =>
    expect(
      prepareDelegation({ id: "a", role: "Veterinario", linked: false }, false, "2026-11-21"),
    ).toBe("MISSING_INFORMATION"));
  it("DEL12-T07 no se inventa aceptación", () =>
    expect(delegationTransition("ASSIGNED", "ACCEPTED", "", false)).toBe(false));
  it("DEL12-T12 cierre requiere evidencia", () =>
    expect(delegationTransition("IN_PROGRESS", "COMPLETED", "", true)).toBe(false));
  it("DEL12-T13 notificar no cierra una tarea", () =>
    expect(delegationTransition("ASSIGNED", "COMPLETED", "Aviso enviado", false)).toBe(false));
  it("ABS12-T06 detecta cobertura inexistente", () =>
    expect(
      evaluateAbsenceCoverage(
        { from: "2026-11-21", to: "2026-11-22" },
        [{ responsibility: "clínica", substituteId: "a", enabled: false, available: true }],
        0,
      ).ready,
    ).toBe(false));
  it("ABS12-T07 plan no concede permisos", () =>
    expect(
      evaluateAbsenceCoverage(
        { from: "2026-11-21", to: "2026-11-22" },
        [{ responsibility: "clínica", substituteId: "a", enabled: true, available: true }],
        0,
      ).grantedPermissions,
    ).toEqual([]));
  it("ABS12-T11 pendientes críticos bloquean activación", () =>
    expect(
      evaluateAbsenceCoverage(
        { from: "2026-11-21", to: "2026-11-22" },
        [{ responsibility: "clínica", substituteId: "a", enabled: true, available: true }],
        1,
      ).ready,
    ).toBe(false));
  it("ABS12-T10 rutina no equivale a seguridad clínica", () =>
    expect(escalationCategory("clinica")).toBe("SEGURIDAD_CLINICA"));
  it("ABS12-T15 no inventa horas recuperadas", () =>
    expect(
      calculateAutonomyMetrics({ resolvedByTeam: 8, total: 10, coverage: 1, approvedPolicy: true })
        .savedHours,
    ).toBeNull());
  it("REP12-T05 sin política no hay score", () =>
    expect(
      calculateAutonomyMetrics({ resolvedByTeam: 8, total: 10, coverage: 1, approvedPolicy: false })
        .score,
    ).toBeNull());
  it("REP12-T12 score explica factores concretos", () =>
    expect(
      calculateAutonomyMetrics({ resolvedByTeam: 8, total: 10, coverage: 1, approvedPolicy: true })
        .score,
    ).toBe(86));
  it("REP12-T09 observación no atribuye causalidad", () =>
    expect(
      detectOperationalBottlenecks([{ id: "a", status: "pendiente" }], [])[0]?.observation,
    ).toBe("Decisión pendiente de revisión"));
  it("AI10 memoria revocada no aplica", () =>
    expect(
      businessMemoryUsable(
        {
          status: "REVOKED",
          source: "s",
          approvedBy: "luis",
          effectiveAt: "2026-11-01",
          reviewDueAt: "2026-12-01",
        },
        "2026-11-21",
      ),
    ).toBe(false));
  it("ACT12-T20 recibo incompleto no acredita acción", () =>
    expect(ExecutiveReceiptSchema.safeParse({ status: "COMPLETED" }).success).toBe(false));
  it("SEC12-T03 comando de otra organización bloqueado", async () => {
    const coordinator = new ExecutiveExecutionCoordinator(unavailableExecutiveGateway);
    await expect(
      coordinator.request(
        command,
        { actorId: "luis", organizationId: "otra", roles: ["luis"] },
        "Reasigna visitas",
        [],
        "a",
      ),
    ).rejects.toThrow("FORBIDDEN");
  });
  it("ACT12-T16 comando necesita correlación y clave", () =>
    expect(ExecutiveRequestSchema.safeParse({ ...command, idempotencyKey: "" }).success).toBe(
      false,
    ));
});
