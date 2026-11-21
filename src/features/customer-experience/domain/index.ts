import { z } from "zod";

export const ComplaintStates = [
  "NEW",
  "ACKNOWLEDGED",
  "UNDER_REVIEW",
  "ASSIGNED",
  "ACTION_PLAN_PENDING",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "WAITING_INTERNAL_TEAM",
  "WAITING_EXTERNAL_PARTY",
  "RESOLUTION_PROPOSED",
  "RESOLUTION_CONFIRMED",
  "CLOSED",
  "REOPENED",
  "ESCALATED",
] as const;
export type ComplaintState = (typeof ComplaintStates)[number];
export const stateLabels: Record<ComplaintState, string> = {
  NEW: "Nueva",
  ACKNOWLEDGED: "Recibida",
  UNDER_REVIEW: "En revisión",
  ASSIGNED: "Asignada",
  ACTION_PLAN_PENDING: "Plan pendiente",
  IN_PROGRESS: "En curso",
  WAITING_CUSTOMER: "Esperando cliente",
  WAITING_INTERNAL_TEAM: "Esperando equipo",
  WAITING_EXTERNAL_PARTY: "Esperando tercero",
  RESOLUTION_PROPOSED: "Solución propuesta",
  RESOLUTION_CONFIRMED: "Solución implementada",
  CLOSED: "Cerrada con evidencia",
  REOPENED: "Reabierta",
  ESCALATED: "Escalada",
};
export const categories = [
  "Demora",
  "Comunicación",
  "Reprogramación",
  "Cancelación",
  "Cobro",
  "Atención administrativa",
  "Trato recibido",
  "Documentación",
  "Coordinación de especialista",
  "Otro motivo",
] as const;
export const ComplaintDraftSchema = z.object({
  customerId: z.string().min(1, "Selecciona una familia"),
  petId: z.string(),
  visitId: z.string(),
  conversationId: z.string(),
  category: z.enum(categories),
  description: z
    .string()
    .trim()
    .min(10, "Describe el inconveniente (mínimo 10 caracteres)")
    .max(5000),
  assignedTo: z.string(),
  dueAt: z.string().refine((v) => Number.isFinite(Date.parse(v)), "Registra una fecha objetivo"),
  clinical: z.boolean(),
  sourceReference: z.string().trim().min(1, "Registra la fuente"),
});
export type ComplaintDraft = z.infer<typeof ComplaintDraftSchema>;
export interface ComplaintEvent {
  id: string;
  at: string;
  actorId: string;
  from: ComplaintState;
  to: ComplaintState;
  reason: string;
  evidence: string;
  version: number;
}
export interface Complaint extends ComplaintDraft {
  id: string;
  state: ComplaintState;
  version: number;
  createdAt: string;
  updatedAt: string;
  events: ComplaintEvent[];
  plan: string;
  evidence: string;
  customerConfirmation: "UNKNOWN" | "CONFIRMED" | "DECLINED";
  professionalReviewed: boolean;
  solutionImplemented: boolean;
}
const transitions: Record<ComplaintState, readonly ComplaintState[]> = {
  NEW: ["ACKNOWLEDGED", "ESCALATED"],
  ACKNOWLEDGED: ["UNDER_REVIEW", "ASSIGNED", "ESCALATED"],
  UNDER_REVIEW: ["ASSIGNED", "ACTION_PLAN_PENDING", "ESCALATED"],
  ASSIGNED: ["ACTION_PLAN_PENDING", "IN_PROGRESS", "ESCALATED"],
  ACTION_PLAN_PENDING: ["IN_PROGRESS", "ESCALATED"],
  IN_PROGRESS: [
    "WAITING_CUSTOMER",
    "WAITING_INTERNAL_TEAM",
    "WAITING_EXTERNAL_PARTY",
    "RESOLUTION_PROPOSED",
    "ESCALATED",
  ],
  WAITING_CUSTOMER: ["IN_PROGRESS", "RESOLUTION_PROPOSED", "ESCALATED"],
  WAITING_INTERNAL_TEAM: ["IN_PROGRESS", "ESCALATED"],
  WAITING_EXTERNAL_PARTY: ["IN_PROGRESS", "ESCALATED"],
  RESOLUTION_PROPOSED: ["IN_PROGRESS", "RESOLUTION_CONFIRMED", "ESCALATED"],
  RESOLUTION_CONFIRMED: ["CLOSED", "REOPENED"],
  CLOSED: ["REOPENED"],
  REOPENED: ["UNDER_REVIEW", "ASSIGNED", "ESCALATED"],
  ESCALATED: ["UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS"],
};
export interface TransitionCommand {
  to: ComplaintState;
  expectedVersion: number;
  actorId: string;
  reason: string;
  evidence: string;
  professionalReviewed: boolean;
  solutionImplemented: boolean;
  at: string;
}
export function validateComplaintTransition(
  c: Complaint,
  command: TransitionCommand,
): string | null {
  if (command.expectedVersion !== c.version) return "STALE_DATA";
  if (!command.actorId || !command.reason.trim() || !Number.isFinite(Date.parse(command.at)))
    return "DATA_INCOMPLETE";
  if (!transitions[c.state].includes(command.to)) return "INVALID_STATE_TRANSITION";
  if (["ASSIGNED", "IN_PROGRESS"].includes(command.to) && !c.assignedTo) return "DATA_INCOMPLETE";
  if (command.to === "IN_PROGRESS" && !c.plan.trim()) return "DATA_INCOMPLETE";
  if (["RESOLUTION_CONFIRMED", "CLOSED"].includes(command.to)) {
    if (!command.evidence.trim() || !command.solutionImplemented) return "DATA_INCOMPLETE";
    if (c.clinical && !command.professionalReviewed) return "PROFESSIONAL_REVIEW_REQUIRED";
  }
  return null;
}
export function transitionComplaint(c: Complaint, command: TransitionCommand): Complaint {
  const error = validateComplaintTransition(c, command);
  if (error) throw new Error(error);
  return {
    ...c,
    state: command.to,
    version: c.version + 1,
    updatedAt: command.at,
    evidence: command.evidence,
    solutionImplemented: command.solutionImplemented,
    professionalReviewed: command.professionalReviewed,
    events: [
      ...c.events,
      {
        id: `${c.id}:${c.version + 1}`,
        at: command.at,
        actorId: command.actorId,
        from: c.state,
        to: command.to,
        reason: command.reason,
        evidence: command.evidence,
        version: c.version + 1,
      },
    ],
  };
}
export function prepareEscalation(c: Complaint, now: string): { level: string; reason: string } {
  if (c.clinical)
    return {
      level: "Revisión veterinaria",
      reason: "Cuestión clínica declarada; requiere profesional competente",
    };
  if (c.state === "CLOSED")
    return { level: "Atención habitual", reason: "Caso cerrado; admite reapertura justificada" };
  if (Date.parse(c.dueAt) < Date.parse(now))
    return { level: "Responsable de calidad", reason: "Fecha objetivo vencida" };
  if (!c.assignedTo) return { level: "Coordinación", reason: "Falta responsable" };
  return { level: "Atención habitual", reason: "Dentro del plazo registrado" };
}

export interface QualitySource {
  id: string;
  category: string;
  source: string;
  sourceReference: string;
  status: string;
  dueAt: string | null;
  updatedAt: string | null;
  assignedTo: string | null;
  href: string;
}
export interface QualityFinding extends QualitySource {
  findingId: string;
  detectedAt: string;
  reason: string;
  severityPolicy: "ROUTINE" | "COORDINATION";
  suggestedAction: string;
}
const resolved = new Set([
  "CLOSED",
  "RESOLVED",
  "CANCELLED",
  "COMPLETED",
  "REFERRAL_CLOSED",
  "cerrada",
  "cerrado",
  "resuelta",
  "cumplido",
  "cumplida",
  "completado",
  "completada",
  "cancelado",
  "cancelada",
]);
export function evaluateQualityFindings(
  sources: QualitySource[],
  now: string,
  waitingMinutes: number | null = null,
): QualityFinding[] {
  return sources
    .filter((s) => !resolved.has(s.status))
    .flatMap((s) => {
      const late =
        s.dueAt !== null &&
        Number.isFinite(Date.parse(s.dueAt)) &&
        Date.parse(s.dueAt) < Date.parse(now);
      const unanswered =
        waitingMinutes !== null &&
        s.category === "Conversación" &&
        ["NEW", "WAITING_TEAM", "IDENTIFICATION_REQUIRED", "PENDING_COORDINATION"].includes(
          s.status,
        ) &&
        s.updatedAt !== null &&
        Number.isFinite(Date.parse(s.updatedAt)) &&
        Date.parse(now) - Date.parse(s.updatedAt) >= waitingMinutes * 60000;
      const pending = ["Solicitud", "Cita sin confirmar", "Incidencia", "Queja", "Remisión"].includes(
        s.category,
      );
      if (!late && !unanswered && !pending) return [];
      return [
        {
          ...s,
          findingId: `${s.source}:${s.id}`,
          detectedAt: now,
          reason: late
            ? "Plazo registrado vencido"
            : unanswered
              ? "Sin respuesta dentro del umbral configurado"
              : "Pendiente registrado; revisar sin inferir gravedad clínica",
          severityPolicy: late ? ("COORDINATION" as const) : ("ROUTINE" as const),
          suggestedAction: s.assignedTo ? "Revisar con el responsable" : "Asignar responsable",
        },
      ];
    });
}
export function groupOperationalFindings(findings: QualityFinding[]) {
  return Array.from(new Set(findings.map((f) => f.category))).map((category) => ({
    category,
    count: findings.filter((f) => f.category === category).length,
    conclusion: "Patrón observado; no demuestra causalidad",
  }));
}
export function detectJourneyBottlenecks(events: QualitySource[], now: string) {
  return events.filter(
    (e) => !resolved.has(e.status) && e.dueAt && Date.parse(e.dueAt) < Date.parse(now),
  );
}
export function evaluateRecoveryActions(s: QualitySource): { status: string; action: string } {
  return resolved.has(s.status)
    ? { status: "EXCLUDED", action: "No reactivar automáticamente un caso cerrado o cancelado" }
    : {
        status: "REQUIRES_REVIEW",
        action: s.assignedTo
          ? "Verificar hechos y acordar seguimiento humano"
          : "Asignar responsable y verificar hechos",
      };
}

export const Purposes = [
  "operational",
  "appointment",
  "administrative",
  "followup",
  "education",
  "promotion",
  "review",
  "referral",
] as const;
export type ConsentPurpose = (typeof Purposes)[number];
export const purposeLabels: Record<ConsentPurpose, string> = {
  operational: "Comunicaciones operativas",
  appointment: "Confirmaciones de cita",
  administrative: "Información administrativa",
  followup: "Seguimientos del servicio",
  education: "Educación voluntaria",
  promotion: "Promociones",
  review: "Reseñas",
  referral: "Referidos",
};
export interface ContactContext {
  customerId: string;
  identityVerified: boolean;
  purpose: ConsentPurpose;
  channel: "whatsapp" | "email";
  consent: "GRANTED" | "REVOKED" | "UNKNOWN";
  consentSource: string;
  optOut: boolean;
  griefAuthorized: boolean;
  sensitiveComplaint: boolean;
  informationVerified: boolean;
  relevantEvent: boolean;
  necessaryOperational: boolean;
  eventAlreadyContacted: boolean;
  contactsInPeriod: number;
  maxInPeriod: number | null;
  lastContactAt: string | null;
  minimumIntervalMinutes: number | null;
  now: string;
}
export type EligibilityStatus =
  "ELIGIBLE" | "REQUIRES_REVIEW" | "SUPPRESSED" | "NOT_AUTHORIZED" | "DATA_INCOMPLETE";
export interface EligibilityDecision {
  customerId: string;
  purpose: ConsentPurpose;
  channel: string;
  status: EligibilityStatus;
  reason: string;
  source: string;
  restrictions: string[];
  requiresHumanApproval: boolean;
}
const commercial = new Set<ConsentPurpose>(["education", "promotion", "review", "referral"]);
export function evaluateFrequencyLimit(c: ContactContext): string | null {
  if (c.eventAlreadyContacted) return "DUPLICATE_EVENT";
  if (c.necessaryOperational && !commercial.has(c.purpose)) return null;
  if (c.maxInPeriod !== null && c.contactsInPeriod >= c.maxInPeriod) return "FREQUENCY_LIMITED";
  if (
    c.minimumIntervalMinutes !== null &&
    c.lastContactAt &&
    Date.parse(c.now) - Date.parse(c.lastContactAt) < c.minimumIntervalMinutes * 60000
  )
    return "FREQUENCY_LIMITED";
  return null;
}
export function evaluateCommunicationEligibility(c: ContactContext): EligibilityDecision {
  const result = (status: EligibilityStatus, reason: string): EligibilityDecision => ({
    customerId: c.customerId,
    purpose: c.purpose,
    channel: c.channel,
    status,
    reason,
    source: c.consentSource,
    restrictions: status === "ELIGIBLE" ? [] : [reason],
    requiresHumanApproval: true,
  });
  if (
    !c.identityVerified ||
    !c.informationVerified ||
    !c.relevantEvent ||
    !Number.isFinite(Date.parse(c.now))
  )
    return result("DATA_INCOMPLETE", "Identidad, información o evento sin verificar");
  if (c.optOut || c.consent === "REVOKED")
    return result("SUPPRESSED", "Baja o consentimiento revocado para esta finalidad y canal");
  if (c.griefAuthorized && commercial.has(c.purpose))
    return result(
      "SUPPRESSED",
      "Contexto sensible autorizado: sin mensajes comerciales, reseñas ni referidos",
    );
  if (c.consent !== "GRANTED" || !c.consentSource.trim())
    return result("NOT_AUTHORIZED", "Falta autorización verificable para esta finalidad y canal");
  const frequency = evaluateFrequencyLimit(c);
  if (frequency) return result("SUPPRESSED", frequency);
  if (c.sensitiveComplaint)
    return result("REQUIRES_REVIEW", "Queja sensible abierta: requiere revisión humana");
  return result("ELIGIBLE", "Elegibilidad preliminar; el servidor debe revalidar antes de enviar");
}
export function validateReviewRequest(
  c: ContactContext,
  _satisfaction?: number,
): EligibilityDecision {
  return evaluateCommunicationEligibility({ ...c, purpose: "review" });
}
export function validateReferralRequest(
  c: ContactContext,
  thirdPartyAuthorized: boolean,
): EligibilityDecision {
  const d = evaluateCommunicationEligibility({ ...c, purpose: "referral" });
  return thirdPartyAuthorized
    ? d
    : {
        ...d,
        status: "NOT_AUTHORIZED",
        reason: "Un tercero no puede autorizar el contacto promocional de otra persona",
        restrictions: ["THIRD_PARTY_NOT_AUTHORIZED"],
      };
}
export function evaluatePreventiveReminder(
  p: {
    professionalApproved: boolean;
    source: string;
    dueAt: string | null;
    completed: boolean;
    equivalentConfirmedAppointment: boolean;
    validUntil: string | null;
  },
  now: string,
): string {
  if (
    !p.professionalApproved ||
    !p.source ||
    !p.dueAt ||
    !Number.isFinite(Date.parse(p.dueAt)) ||
    !p.validUntil ||
    !Number.isFinite(Date.parse(p.validUntil))
  )
    return "DATA_INCOMPLETE";
  if (Date.parse(p.validUntil) < Date.parse(now)) return "PROFESSIONAL_REVIEW_REQUIRED";
  if (p.completed || p.equivalentConfirmedAppointment) return "DUPLICATE_EVENT";
  return Date.parse(p.dueAt) <= Date.parse(now) ? "REQUIRES_REVIEW" : "SCHEDULED";
}

export const QuestionSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().trim().min(3),
    type: z.enum(["CSAT", "NPS", "TEXT", "CHOICE"]),
    required: z.boolean(),
    options: z.array(z.string().trim().min(1)).default([]),
  })
  .refine(
    (q) => q.type !== "CHOICE" || q.options.length >= 2,
    "Las opciones requieren al menos dos respuestas",
  );
export const SurveySchema = z
  .object({
    id: z.string(),
    title: z.string().trim().min(3),
    version: z.number().int().positive(),
    state: z.enum(["DRAFT", "APPROVED", "PUBLISHED", "ARCHIVED"]),
    approvedBy: z.string(),
    questions: z.array(QuestionSchema).min(1).max(20),
  })
  .refine(
    (s) => new Set(s.questions.map((q) => q.id)).size === s.questions.length,
    "Cada pregunta debe tener un identificador único",
  );
export type Survey = z.infer<typeof SurveySchema>;
export interface SurveyResponse {
  id: string;
  surveyId: string;
  surveyVersion: number;
  customerId: string;
  eventId: string;
  at: string;
  answers: Record<string, string | number>;
}
export function validateSurveyResponse(s: Survey, r: SurveyResponse): string | null {
  if (s.state !== "PUBLISHED" || !s.approvedBy) return "NOT_AUTHORIZED";
  if (s.id !== r.surveyId || s.version !== r.surveyVersion) return "STALE_DATA";
  if (!r.customerId || !r.eventId) return "DATA_INCOMPLETE";
  for (const q of s.questions) {
    const value = r.answers[q.id];
    if (value === undefined || value === "") {
      if (q.required) return "DATA_INCOMPLETE";
      continue;
    }
    if (
      q.type === "CSAT" &&
      (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 5)
    )
      return "DATA_INCOMPLETE";
    if (
      q.type === "NPS" &&
      (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 10)
    )
      return "DATA_INCOMPLETE";
    if (q.type === "CHOICE" && !q.options.includes(String(value))) return "DATA_INCOMPLETE";
    if (q.type === "TEXT" && typeof value !== "string") return "DATA_INCOMPLETE";
  }
  return null;
}
export function calculateSurveyMetrics(
  s: Survey,
  responses: SurveyResponse[],
  invited: number | null,
) {
  const seen = new Set<string>();
  const valid = responses.filter((r) => {
    const key = `${r.customerId}:${r.eventId}`;
    if (seen.has(key) || validateSurveyResponse(s, r)) return false;
    seen.add(key);
    return true;
  });
  const values = (type: "CSAT" | "NPS") => {
    const q = s.questions.find((x) => x.type === type);
    return q
      ? valid.map((r) => r.answers[q.id]).filter((v): v is number => typeof v === "number")
      : [];
  };
  const csat = values("CSAT"),
    nps = values("NPS");
  return {
    responses: valid.length,
    csatResponses: csat.length,
    npsResponses: nps.length,
    csat: csat.length ? (100 * csat.filter((x) => x >= 4).length) / csat.length : null,
    nps: nps.length
      ? (100 * (nps.filter((x) => x >= 9).length - nps.filter((x) => x <= 6).length)) / nps.length
      : null,
    responseRate:
      invited !== null && invited > 0 && invited >= valid.length
        ? (valid.length * 100) / invited
        : null,
    method:
      "CSAT: respuestas 4–5 / respuestas CSAT × 100. NPS: % 9–10 menos % 0–6. Sin respuesta no cuenta como satisfacción.",
  };
}
export const ImprovementStates = [
  "IDEA",
  "UNDER_REVIEW",
  "APPROVED",
  "IMPLEMENTATION_PENDING",
  "IN_PROGRESS",
  "VALIDATION_PENDING",
  "EFFECTIVE",
  "INEFFECTIVE",
  "CLOSED",
] as const;
export interface CorrectiveAction {
  id: string;
  title: string;
  hypothesis: string;
  confirmedCause: string;
  evidence: string;
  assignedTo: string;
  dueAt: string;
  state: (typeof ImprovementStates)[number];
  approvedBy: string;
  implementationEvidence: string;
  measuredAfter: string;
  trainingReference: string;
}
export function prepareCorrectiveAction(a: CorrectiveAction): string | null {
  if (
    !a.title.trim() ||
    !a.hypothesis.trim() ||
    !a.evidence.trim() ||
    !a.assignedTo ||
    !Number.isFinite(Date.parse(a.dueAt))
  )
    return "DATA_INCOMPLETE";
  if (
    [
      "APPROVED",
      "IMPLEMENTATION_PENDING",
      "IN_PROGRESS",
      "VALIDATION_PENDING",
      "EFFECTIVE",
      "INEFFECTIVE",
      "CLOSED",
    ].includes(a.state) &&
    !a.approvedBy
  )
    return "NOT_AUTHORIZED";
  if (
    ["VALIDATION_PENDING", "EFFECTIVE", "INEFFECTIVE", "CLOSED"].includes(a.state) &&
    !a.implementationEvidence.trim()
  )
    return "DATA_INCOMPLETE";
  if (["EFFECTIVE", "INEFFECTIVE", "CLOSED"].includes(a.state) && !a.measuredAfter.trim())
    return "DATA_INCOMPLETE";
  return null;
}
export function validateImprovementTransition(
  from: CorrectiveAction,
  next: CorrectiveAction,
): string | null {
  const graph: Record<CorrectiveAction["state"], readonly CorrectiveAction["state"][]> = {
    IDEA: ["UNDER_REVIEW"],
    UNDER_REVIEW: ["APPROVED", "IDEA"],
    APPROVED: ["IMPLEMENTATION_PENDING"],
    IMPLEMENTATION_PENDING: ["IN_PROGRESS"],
    IN_PROGRESS: ["VALIDATION_PENDING"],
    VALIDATION_PENDING: ["EFFECTIVE", "INEFFECTIVE"],
    EFFECTIVE: ["CLOSED"],
    INEFFECTIVE: ["UNDER_REVIEW", "CLOSED"],
    CLOSED: [],
  };
  if (from.id !== next.id || !graph[from.state].includes(next.state))
    return "INVALID_STATE_TRANSITION";
  return prepareCorrectiveAction(next);
}
export function bogotaDate(value: string): string | null {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export const EducationSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(3),
  category: z.string().min(1),
  body: z.string().trim().min(10),
  source: z.string().trim().min(1),
  clinical: z.boolean(),
  reviewer: z.string(),
  reviewedAt: z.string(),
  validUntil: z.string(),
  version: z.number().int().positive(),
  state: z.enum([
    "DRAFT",
    "PENDING_PROFESSIONAL_REVIEW",
    "APPROVED",
    "PUBLISHED",
    "OUTDATED",
    "ARCHIVED",
  ]),
});
export type EducationArticle = z.infer<typeof EducationSchema>;
export function approvedEducation(a: EducationArticle, now: string) {
  return (
    a.state === "PUBLISHED" &&
    Boolean(a.reviewer && a.source) &&
    Number.isFinite(Date.parse(a.reviewedAt)) &&
    Date.parse(a.reviewedAt) <= Date.parse(now) &&
    Number.isFinite(Date.parse(a.validUntil)) &&
    Date.parse(a.validUntil) >= Date.parse(now)
  );
}
export function validateTestimonialConsent(
  c: { granted: boolean; purpose: string; channels: string[]; validUntil: string; source: string },
  channel: string,
  now: string,
) {
  return (
    c.granted &&
    c.purpose === "advertising" &&
    c.channels.includes(channel) &&
    Boolean(c.source) &&
    Date.parse(c.validUntil) >= Date.parse(now)
  );
}
export function customerHealth(p: {
  restricted: boolean;
  complaints: number;
  overdue: number;
  pending: number;
  sources: number;
}): string {
  if (p.restricted) return "Contacto restringido";
  if (p.complaints) return "Queja abierta";
  if (p.overdue) return "Requiere atención";
  if (p.pending) return "Seguimiento pendiente";
  return p.sources ? "Sin pendientes conocidos" : "Datos insuficientes";
}
