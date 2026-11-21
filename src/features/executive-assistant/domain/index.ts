import { z } from "zod";
import { bogotaDate, inFinancePeriod, validPeriod } from "@/features/finance/domain/presentation";

export const IntentNames = [
  "OPERATIONAL_QUERY",
  "SCHEDULING_QUERY",
  "AVAILABILITY_QUERY",
  "STAFF_QUERY",
  "ROUTE_QUERY",
  "CUSTOMER_QUERY",
  "FINANCIAL_QUERY",
  "QUALITY_QUERY",
  "REFERRAL_QUERY",
  "TRAINING_QUERY",
  "TASK_QUERY",
  "REPORT_REQUEST",
  "ACTION_PROPOSAL",
  "SIMULATION_REQUEST",
  "APPROVAL_REQUEST",
  "DELEGATION_REQUEST",
  "ABSENCE_MODE_REQUEST",
  "CONFIGURATION_QUERY",
  "FOLLOW_UP_REQUEST",
  "OTHER",
] as const;
export type ExecutiveIntent = (typeof IntentNames)[number];
export const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const intentPatterns: [ExecutiveIntent, RegExp][] = [
  ["APPROVAL_REQUEST", /aprueb|aproba|rechaza/],
  ["ABSENCE_MODE_REQUEST", /ausencia|ausent|vacacion/],
  ["DELEGATION_REQUEST", /deleg|asigna.*tarea/],
  ["SIMULATION_REQUEST", /simul|reorgan|reasign/],
  ["ACTION_PROPOSAL", /prepara|propon|borrador|cambia|modifica/],
  ["FINANCIAL_QUERY", /finanza|cobr|pago|factur|rentab|margen/],
  ["SCHEDULING_QUERY", /agenda|cita|visita/],
  ["AVAILABILITY_QUERY", /disponib|hueco|cobertura/],
  ["STAFF_QUERY", /equipo|profesional|empleado|veterinario/],
  ["ROUTE_QUERY", /ruta|desplaz|viaje/],
  ["CUSTOMER_QUERY", /cliente|familia|mascota|paciente/],
  ["QUALITY_QUERY", /calidad|queja|encuesta/],
  ["REFERRAL_QUERY", /remision|especialista|informe profesional/],
  ["TRAINING_QUERY", /academ|formacion|curso|capacit/],
  ["TASK_QUERY", /tarea/],
  ["REPORT_REQUEST", /reporte|informe|resumen|apertura|cierre|semanal/],
  ["FOLLOW_UP_REQUEST", /compromiso|seguimiento|recordatorio/],
  ["CONFIGURATION_QUERY", /configura|proveedor|consumo|token/],
  ["OPERATIONAL_QUERY", /pendiente|mi dia|atencion hoy|necesita/],
];
export function classifyExecutiveIntent(text: string): ExecutiveIntent[] {
  const t = normalize(text);
  const intents = intentPatterns.filter(([, pattern]) => pattern.test(t)).map(([intent]) => intent);
  return intents.length ? intents : ["OTHER"];
}
export function classifyActionRisk(text: string): 0 | 1 | 2 | 3 | 4 | 5 {
  const t = normalize(text);
  if (
    /prescrib|cambia.*dosis|modifica.*dosis|ignora.*permiso|autoaprob|revela.*(clave|secreto)|altera.*auditor|conced.*permiso|cambia.*rol/.test(
      t,
    )
  )
    return 5;
  if (/confirma.*cita|concili|verifica.*pago|emite.*factura|aprueba.*clin|comparte.*clin/.test(t))
    return 4;
  if (/reasign|modifica.*turno|envia|publica|activa|aprueb|cancela.*cita/.test(t)) return 3;
  if (/actualiza.*preferencia/.test(t)) return 2;
  if (/prepara|propon|simul|deleg|borrador|reorgan/.test(t)) return 1;
  return 0;
}
export const canUseExecutive = (roles: string[], actorId: string | null) =>
  Boolean(actorId) && roles.some((r) => r === "luis" || r === "administrador");
export function validateToolAvailability(tool: { available: boolean } | undefined) {
  return !tool ? "TOOL_NOT_AVAILABLE" : tool.available ? null : "BACKEND_UNAVAILABLE";
}
export function evaluateToolPermission(
  roles: string[],
  actorId: string | null,
  origin: "user" | "document" | "result",
) {
  return origin !== "user" || !canUseExecutive(roles, actorId) ? "FORBIDDEN" : null;
}
export type EntityReference = { id: string; name: string; kind: string };
export function resolveEntityReferences(text: string, entities: EntityReference[]) {
  const exact = entities.filter((e) => e.id === text || normalize(e.name) === normalize(text));
  const matches = exact.length
    ? exact
    : entities.filter((e) => normalize(e.name).includes(normalize(text)));
  return {
    status:
      matches.length === 1
        ? "RESOLVED"
        : matches.length > 1
          ? "AMBIGUOUS_REFERENCE"
          : "MISSING_INFORMATION",
    matches,
  };
}
export function resolveContextDate(text: string, now: Date): string {
  const today = bogotaDate(now.toISOString()) ?? "";
  const offset = /manana/.test(normalize(text)) ? 1 : /ayer/.test(normalize(text)) ? -1 : 0;
  const explicit = text.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (explicit && bogotaDate(explicit)) return explicit;
  const day = new Date(`${today}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() + offset);
  return day.toISOString().slice(0, 10);
}
export const ExecutionStates = [
  "DRAFT",
  "READY_FOR_REVIEW",
  "PENDING_APPROVAL",
  "APPROVED",
  "REVALIDATION_REQUIRED",
  "EXECUTION_REQUESTED",
  "IN_PROGRESS",
  "PARTIAL",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;
export type ExecutionState = (typeof ExecutionStates)[number];
const transitions: Record<ExecutionState, ExecutionState[]> = {
  DRAFT: ["READY_FOR_REVIEW", "CANCELLED"],
  READY_FOR_REVIEW: ["PENDING_APPROVAL", "DRAFT", "CANCELLED"],
  PENDING_APPROVAL: ["APPROVED", "DRAFT", "CANCELLED", "REVALIDATION_REQUIRED"],
  APPROVED: ["EXECUTION_REQUESTED", "REVALIDATION_REQUIRED", "CANCELLED"],
  REVALIDATION_REQUIRED: ["READY_FOR_REVIEW", "CANCELLED"],
  EXECUTION_REQUESTED: ["IN_PROGRESS", "FAILED"],
  IN_PROGRESS: ["PARTIAL", "COMPLETED", "FAILED"],
  PARTIAL: ["REVALIDATION_REQUIRED", "FAILED"],
  COMPLETED: [],
  FAILED: ["REVALIDATION_REQUIRED", "CANCELLED"],
  CANCELLED: [],
};
export function validateExecutionTransition(
  from: ExecutionState,
  to: ExecutionState,
  verifiedReceipt = false,
) {
  return transitions[from].includes(to) && (to !== "COMPLETED" || verifiedReceipt);
}
export type ActionStep = { id: string; title: string; dependsOn: string[]; status: ExecutionState };
export function validateActionDependencies(steps: ActionStep[], stepId: string) {
  const step = steps.find((s) => s.id === stepId);
  return (
    Boolean(step) &&
    (step?.dependsOn ?? []).every((id) => steps.find((s) => s.id === id)?.status === "COMPLETED")
  );
}
export function evaluateApprovalRequirements(input: {
  actorId: string | null;
  roles: string[];
  expectedVersion: number;
  version: number;
  expiresAt: string;
  now: string;
  explicit: boolean;
  risk: number;
  clinicalAuthorized: boolean;
  agent: boolean;
}) {
  if (input.agent || !canUseExecutive(input.roles, input.actorId)) return "FORBIDDEN";
  if (!input.explicit) return "AMBIGUOUS_REFERENCE";
  if (
    !Number.isFinite(Date.parse(input.expiresAt)) ||
    Date.parse(input.expiresAt) <= Date.parse(input.now)
  )
    return "APPROVAL_EXPIRED";
  if (input.expectedVersion !== input.version) return "EXECUTION_CONFLICT";
  if (input.risk >= 5) return "ACTION_PROHIBITED";
  if (input.risk === 4 && !input.clinicalAuthorized) return "CLINICAL_REVIEW_REQUIRED";
  return null;
}
export const DraftSchema = z.object({
  kind: z.enum(["proposal", "delegation", "memory", "absence"]),
  title: z.string().trim().min(1).max(200),
  objective: z.string().trim().min(1).max(2000),
  responsible: z.string().min(1),
  deadline: z.string().refine((v) => bogotaDate(v) !== null, "Fecha inválida"),
  sourceIds: z.array(z.string()),
  expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(1),
  correlationId: z.string().min(1),
});
export type ExecutiveDraft = z.infer<typeof DraftSchema>;
export function buildActionProposal(objective: string, sourceIds: string[]) {
  const risk = classifyActionRisk(objective);
  if (risk === 5) throw new Error("ACTION_PROHIBITED");
  return {
    objective,
    sourceIds,
    risk,
    status: "DRAFT" as const,
    requiredApprovals: risk >= 2 ? ["Revisión humana y contrato protegido"] : [],
    impact: "Pendiente de evaluación en el módulo de origen",
    steps: [
      {
        id: "source",
        title: "Consultar fuentes y restricciones",
        dependsOn: [],
        status: "DRAFT" as const,
      },
      {
        id: "prepare",
        title: "Preparar alternativa en el módulo existente",
        dependsOn: ["source"],
        status: "DRAFT" as const,
      },
      {
        id: "approval",
        title: "Revisar impacto, versión y autorizaciones",
        dependsOn: ["prepare"],
        status: "DRAFT" as const,
      },
      {
        id: "execute",
        title: "Solicitar ejecución protegida y comprobar recibo",
        dependsOn: ["approval"],
        status: "DRAFT" as const,
      },
    ],
  };
}
export function prepareDelegation(
  responsible: { id: string; role: string; linked: boolean } | undefined,
  clinical: boolean,
  deadline: string,
) {
  if (!responsible?.linked) return "MISSING_INFORMATION";
  if (clinical && !["Veterinario", "veterinario"].includes(responsible.role))
    return "CLINICAL_REVIEW_REQUIRED";
  if (!bogotaDate(deadline)) return "MISSING_INFORMATION";
  return null;
}
export function delegationTransition(
  from: string,
  to: string,
  evidence: string,
  accepted: boolean,
) {
  const allowed: Record<string, string[]> = {
    DRAFT: ["PENDING_ASSIGNMENT"],
    PENDING_ASSIGNMENT: ["ASSIGNED"],
    ASSIGNED: ["ACCEPTED", "CANCELLED"],
    ACCEPTED: ["IN_PROGRESS", "BLOCKED"],
    IN_PROGRESS: ["BLOCKED", "COMPLETED"],
    BLOCKED: ["IN_PROGRESS", "CANCELLED"],
  };
  return (
    (allowed[from] ?? []).includes(to) &&
    (to !== "ACCEPTED" || accepted) &&
    (to !== "COMPLETED" || Boolean(evidence.trim()))
  );
}
export function evaluateAbsenceCoverage(
  period: { from: string; to: string },
  assignments: {
    responsibility: string;
    substituteId: string;
    enabled: boolean;
    available: boolean;
  }[],
  criticalPending: number,
) {
  const gaps = assignments
    .filter((a) => !a.substituteId || !a.enabled || !a.available)
    .map((a) => a.responsibility);
  return {
    ready:
      validPeriod(period) && assignments.length > 0 && gaps.length === 0 && criticalPending === 0,
    gaps,
    criticalPending,
    grantedPermissions: [],
  };
}
export function escalationCategory(kind: string) {
  return /clinica/.test(kind)
    ? "SEGURIDAD_CLINICA"
    : /sistema/.test(kind)
      ? "CONTINGENCIA"
      : /pago|aprobacion/.test(kind)
        ? "DECISION_RESTRINGIDA"
        : /vencido/.test(kind)
          ? "IMPORTANTE"
          : "RUTINA";
}
export function calculateAutonomyMetrics(values: {
  resolvedByTeam: number | null;
  total: number | null;
  coverage: number | null;
  approvedPolicy: boolean;
}) {
  if (
    !values.approvedPolicy ||
    values.resolvedByTeam === null ||
    values.total === null ||
    values.coverage === null ||
    values.total <= 0 ||
    values.resolvedByTeam < 0 ||
    values.resolvedByTeam > values.total ||
    values.coverage < 0 ||
    values.coverage > 1
  )
    return { status: "INSUFFICIENT_DATA", score: null, savedHours: null };
  return {
    status: "ESTIMATED",
    score: Math.round(100 * ((values.resolvedByTeam / values.total) * 0.7 + values.coverage * 0.3)),
    savedHours: null,
  };
}
export function businessMemoryUsable(
  memory: {
    status: string;
    source: string;
    approvedBy: string | null;
    effectiveAt: string;
    reviewDueAt: string;
  },
  today: string,
) {
  return (
    memory.status === "APPROVED" &&
    Boolean(memory.source && memory.approvedBy) &&
    memory.effectiveAt <= today &&
    memory.reviewDueAt >= today
  );
}
export function detectOperationalBottlenecks(
  approvals: { id: string; status: string }[],
  tasks: { id: string; done: boolean; staff_id: string | null }[],
) {
  return [
    ...approvals
      .filter((a) => a.status === "pendiente")
      .map((a) => ({
        id: a.id,
        observation: "Decisión pendiente de revisión",
        hypothesis: "Dependencia de aprobación; responsable y tiempo deben verificarse",
        action: "Revisar la propuesta",
        priority: 2,
      })),
    ...tasks
      .filter((t) => !t.done && !t.staff_id)
      .map((t) => ({
        id: t.id,
        observation: "Tarea abierta sin responsable registrado",
        hypothesis: "Posible brecha de asignación, no culpa individual",
        action: "Preparar delegación",
        priority: 1,
      })),
  ];
}
export const inExecutivePeriod = inFinancePeriod;
