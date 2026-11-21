import { describe, expect, it } from "vitest";
import {
  ComplaintDraftSchema,
  validateComplaintTransition,
  transitionComplaint,
  prepareEscalation,
  evaluateCommunicationEligibility,
  evaluateFrequencyLimit,
  validateReviewRequest,
  validateReferralRequest,
  evaluatePreventiveReminder,
  calculateSurveyMetrics,
  validateSurveyResponse,
  SurveySchema,
  evaluateQualityFindings,
  groupOperationalFindings,
  evaluateRecoveryActions,
  prepareCorrectiveAction,
  validateImprovementTransition,
  bogotaDate,
  approvedEducation,
  validateTestimonialConsent,
  customerHealth,
  type Complaint,
  type ContactContext,
  type Survey,
  type SurveyResponse,
  type QualitySource,
  type CorrectiveAction,
} from "@/features/customer-experience/domain";
import {
  qualityGateway,
  ContractRegistry,
  RequestSchema,
} from "@/features/customer-experience/application/contracts";
const now = "2026-11-21T14:21:00Z";
const complaint: Complaint = {
  id: "case-1",
  customerId: "family-1",
  petId: "pet-1",
  visitId: "visit-1",
  conversationId: "chat-1",
  category: "Comunicación",
  description: "No se confirmó el cambio de horario",
  assignedTo: "coordinator-1",
  dueAt: "2026-11-22T14:00:00Z",
  clinical: false,
  sourceReference: "chat-1",
  state: "NEW",
  version: 1,
  createdAt: now,
  updatedAt: now,
  events: [],
  plan: "Verificar el horario",
  evidence: "",
  customerConfirmation: "UNKNOWN",
  professionalReviewed: false,
  solutionImplemented: false,
};
const command = {
  to: "ACKNOWLEDGED" as const,
  expectedVersion: 1,
  actorId: "coordinator-1",
  reason: "Se recibió el caso",
  evidence: "",
  solutionImplemented: false,
  professionalReviewed: false,
  at: now,
};
const context: ContactContext = {
  customerId: "family-1",
  identityVerified: true,
  purpose: "review",
  channel: "whatsapp",
  consent: "GRANTED",
  consentSource: "consent-1:v2",
  optOut: false,
  griefAuthorized: false,
  sensitiveComplaint: false,
  informationVerified: true,
  relevantEvent: true,
  necessaryOperational: false,
  eventAlreadyContacted: false,
  contactsInPeriod: 0,
  maxInPeriod: null,
  lastContactAt: null,
  minimumIntervalMinutes: null,
  now,
};
const survey: Survey = {
  id: "survey-1",
  title: "Visita domiciliaria",
  version: 1,
  state: "PUBLISHED",
  approvedBy: "reviewer-1",
  questions: [
    { id: "csat", label: "Satisfacción", type: "CSAT", required: true, options: [] },
    { id: "nps", label: "Recomendación", type: "NPS", required: false, options: [] },
  ],
};
const response = (id: string, csat: number, nps: number): SurveyResponse => ({
  id,
  customerId: id,
  eventId: id,
  surveyId: survey.id,
  surveyVersion: 1,
  at: now,
  answers: { csat, nps },
});
const source: QualitySource = {
  id: "request-1",
  category: "Solicitud",
  source: "service_requests",
  sourceReference: "request-1",
  status: "nueva",
  dueAt: null,
  updatedAt: null,
  assignedTo: null,
  href: "/coordinacion/solicitudes",
};
describe("Prompt 10: quejas y resolución", () => {
  it("requiere cliente, fuente y fecha objetivo", () => {
    expect(ComplaintDraftSchema.safeParse({ ...complaint, customerId: "" }).success).toBe(false);
    expect(ComplaintDraftSchema.safeParse(complaint).success).toBe(true);
  });
  it("registra actor, motivo y versión al recibir", () => {
    const next = transitionComplaint(complaint, command);
    expect(next.version).toBe(2);
    expect(next.events[0]).toMatchObject({
      actorId: "coordinator-1",
      reason: "Se recibió el caso",
      version: 2,
    });
  });
  it("rechaza una versión obsoleta", () =>
    expect(validateComplaintTransition(complaint, { ...command, expectedVersion: 0 })).toBe(
      "STALE_DATA",
    ));
  it("no cierra una queja por enviar disculpas", () =>
    expect(
      validateComplaintTransition(complaint, {
        ...command,
        to: "CLOSED",
        reason: "Disculpa enviada",
      }),
    ).toBe("INVALID_STATE_TRANSITION"));
  it("no confirma solución por crear una tarea", () =>
    expect(
      validateComplaintTransition(
        { ...complaint, state: "RESOLUTION_PROPOSED" },
        { ...command, to: "RESOLUTION_CONFIRMED", reason: "Tarea creada" },
      ),
    ).toBe("DATA_INCOMPLETE"));
  it("requiere evidencia e implementación al cerrar", () =>
    expect(
      validateComplaintTransition(
        { ...complaint, state: "RESOLUTION_CONFIRMED" },
        { ...command, to: "CLOSED", evidence: "" },
      ),
    ).toBe("DATA_INCOMPLETE"));
  it("no exige una opinión positiva del cliente al cerrar una solución implementada", () =>
    expect(
      validateComplaintTransition(
        { ...complaint, state: "RESOLUTION_CONFIRMED", customerConfirmation: "DECLINED" },
        {
          ...command,
          to: "CLOSED",
          evidence: "Cambio aplicado y documentado",
          solutionImplemented: true,
        },
      ),
    ).toBeNull());
  it("permite reapertura justificada", () =>
    expect(
      transitionComplaint(
        { ...complaint, state: "CLOSED" },
        { ...command, to: "REOPENED", reason: "El inconveniente persiste" },
      ).state,
    ).toBe("REOPENED"));
  it("requiere revisión profesional para resolver una cuestión clínica", () =>
    expect(
      validateComplaintTransition(
        { ...complaint, state: "RESOLUTION_PROPOSED", clinical: true },
        {
          ...command,
          to: "RESOLUTION_CONFIRMED",
          evidence: "Referencia",
          solutionImplemented: true,
        },
      ),
    ).toBe("PROFESSIONAL_REVIEW_REQUIRED"));
  it("escala cuestión clínica al veterinario, no por valor comercial", () =>
    expect(prepareEscalation({ ...complaint, clinical: true }, now).level).toBe(
      "Revisión veterinaria",
    ));
  it("escala vencimiento al responsable de calidad, no todo a Luis", () =>
    expect(prepareEscalation({ ...complaint, dueAt: "2026-11-20T10:00:00Z" }, now).level).toBe(
      "Responsable de calidad",
    ));
  it("no avanza sin responsable ni plan", () =>
    expect(
      validateComplaintTransition(
        { ...complaint, state: "ASSIGNED", assignedTo: "", plan: "" },
        { ...command, to: "IN_PROGRESS" },
      ),
    ).toBe("DATA_INCOMPLETE"));
});
describe("Prompt 10: permisos, frecuencia y fidelización", () => {
  it("no convierte consentimiento operativo en permiso de promoción", () =>
    expect(
      evaluateCommunicationEligibility({ ...context, purpose: "promotion", consent: "UNKNOWN" })
        .status,
    ).toBe("NOT_AUTHORIZED"));
  it("respeta revocación antes del envío", () =>
    expect(evaluateCommunicationEligibility({ ...context, consent: "REVOKED" }).status).toBe(
      "SUPPRESSED",
    ));
  it("respeta opt-out", () =>
    expect(evaluateCommunicationEligibility({ ...context, optOut: true }).status).toBe(
      "SUPPRESSED",
    ));
  it("suprime reseñas durante duelo autorizado", () =>
    expect(evaluateCommunicationEligibility({ ...context, griefAuthorized: true }).status).toBe(
      "SUPPRESSED",
    ));
  it("permite evaluar comunicación operativa necesaria durante duelo con autorización específica", () =>
    expect(
      evaluateCommunicationEligibility({
        ...context,
        purpose: "operational",
        griefAuthorized: true,
        necessaryOperational: true,
      }).status,
    ).toBe("ELIGIBLE"));
  it("manda queja sensible a revisión humana", () =>
    expect(evaluateCommunicationEligibility({ ...context, sensitiveComplaint: true }).status).toBe(
      "REQUIRES_REVIEW",
    ));
  it("requiere identidad verificada", () =>
    expect(evaluateCommunicationEligibility({ ...context, identityVerified: false }).status).toBe(
      "DATA_INCOMPLETE",
    ));
  it("requiere información verificada", () =>
    expect(
      evaluateCommunicationEligibility({ ...context, informationVerified: false }).status,
    ).toBe("DATA_INCOMPLETE"));
  it("bloquea duplicado por evento", () =>
    expect(evaluateFrequencyLimit({ ...context, eventAlreadyContacted: true })).toBe(
      "DUPLICATE_EVENT",
    ));
  it("bloquea mensajes cuando se alcanza el límite configurado", () =>
    expect(evaluateFrequencyLimit({ ...context, contactsInPeriod: 3, maxInPeriod: 3 })).toBe(
      "FREQUENCY_LIMITED",
    ));
  it("bloquea un último contacto demasiado reciente", () =>
    expect(
      evaluateFrequencyLimit({
        ...context,
        lastContactAt: "2026-11-21T14:20:00Z",
        minimumIntervalMinutes: 30,
      }),
    ).toBe("FREQUENCY_LIMITED"));
  it("no aplica un límite comercial a la comunicación operativa necesaria", () =>
    expect(
      evaluateFrequencyLimit({
        ...context,
        purpose: "operational",
        necessaryOperational: true,
        contactsInPeriod: 3,
        maxInPeriod: 3,
      }),
    ).toBeNull());
  it("no filtra reseñas según satisfacción", () => {
    expect(validateReviewRequest(context, 1).status).toBe("ELIGIBLE");
    expect(validateReviewRequest(context, 5).status).toBe("ELIGIBLE");
  });
  it("no autoriza marketing a un tercero", () =>
    expect(validateReferralRequest(context, false).status).toBe("NOT_AUTHORIZED"));
  it("no publica un testimonio sin autorización publicitaria", () =>
    expect(
      validateTestimonialConsent(
        {
          granted: true,
          purpose: "public_review",
          channels: ["instagram"],
          validUntil: "2026-12-21T00:00:00Z",
          source: "review-public",
        },
        "instagram",
        now,
      ),
    ).toBe(false));
  it("no inventa fechas de control", () =>
    expect(
      evaluatePreventiveReminder(
        {
          professionalApproved: true,
          source: "plan-1",
          dueAt: null,
          validUntil: null,
          completed: false,
          equivalentConfirmedAppointment: false,
        },
        now,
      ),
    ).toBe("DATA_INCOMPLETE"));
  it("evita recordatorio si existe cita confirmada equivalente", () =>
    expect(
      evaluatePreventiveReminder(
        {
          professionalApproved: true,
          source: "plan-1",
          dueAt: now,
          validUntil: "2026-12-21T00:00:00Z",
          completed: false,
          equivalentConfirmedAppointment: true,
        },
        now,
      ),
    ).toBe("DUPLICATE_EVENT"));
  it("no reactiva una solicitud cancelada", () =>
    expect(evaluateRecoveryActions({ ...source, status: "cancelada" }).status).toBe("EXCLUDED"));
});
describe("Prompt 10: encuestas y mejora", () => {
  it("filtra periodos en America/Bogota, no con el día UTC", () =>
    expect(bogotaDate("2026-11-22T02:00:00Z")).toBe("2026-11-21"));
  it("no salta de idea a mejora efectiva", () => {
    const a: CorrectiveAction = {
      id: "a",
      title: "Mejora",
      hypothesis: "Hipótesis",
      evidence: "e",
      assignedTo: "coord",
      dueAt: now,
      state: "IDEA",
      approvedBy: "",
      confirmedCause: "",
      implementationEvidence: "",
      measuredAfter: "",
      trainingReference: "",
    };
    expect(
      validateImprovementTransition(a, {
        ...a,
        state: "EFFECTIVE",
        approvedBy: "director",
        implementationEvidence: "e",
        measuredAfter: "periodo",
      }),
    ).toBe("INVALID_STATE_TRANSITION");
  });
  it("no publica una encuesta sin aprobación", () =>
    expect(validateSurveyResponse({ ...survey, approvedBy: "" }, response("a", 5, 10))).toBe(
      "NOT_AUTHORIZED",
    ));
  it("rechaza pregunta obligatoria incompleta", () =>
    expect(validateSurveyResponse(survey, { ...response("a", 5, 10), answers: {} })).toBe(
      "DATA_INCOMPLETE",
    ));
  it("rechaza valores CSAT fuera de 1–5", () =>
    expect(validateSurveyResponse(survey, response("a", 6, 10))).toBe("DATA_INCOMPLETE"));
  it("rechaza versión antigua", () =>
    expect(validateSurveyResponse(survey, { ...response("a", 5, 10), surveyVersion: 0 })).toBe(
      "STALE_DATA",
    ));
  it("calcula CSAT 4–5 y NPS 9–10 menos 0–6", () => {
    const m = calculateSurveyMetrics(
      survey,
      [response("a", 5, 10), response("b", 4, 8), response("c", 2, 3)],
      6,
    );
    expect(m.csat).toBeCloseTo(66.6667);
    expect(m.nps).toBe(0);
    expect(m.responseRate).toBe(50);
  });
  it("muestra falta de datos sin inventar satisfacción", () => {
    const m = calculateSurveyMetrics(survey, [], null);
    expect(m.csat).toBeNull();
    expect(m.nps).toBeNull();
    expect(m.responseRate).toBeNull();
  });
  it("deduplica respuestas por cliente y evento", () =>
    expect(
      calculateSurveyMetrics(survey, [response("a", 5, 10), response("a", 5, 10)], 2).responses,
    ).toBe(1));
  it("valida opciones y unicidad de preguntas", () =>
    expect(
      SurveySchema.safeParse({ ...survey, questions: [survey.questions[0], survey.questions[0]] })
        .success,
    ).toBe(false));
  it("no infiere retraso si falta fecha", () =>
    expect(evaluateQualityFindings([source], now)[0]?.severityPolicy).toBe("ROUTINE"));
  it("detecta compromiso vencido con fuente", () =>
    expect(
      evaluateQualityFindings(
        [{ ...source, category: "Compromiso", dueAt: "2026-11-20T00:00:00Z" }],
        now,
      )[0]?.reason,
    ).toBe("Plazo registrado vencido"));
  it("detecta conversación sin respuesta con umbral explícito", () =>
    expect(
      evaluateQualityFindings(
        [
          {
            ...source,
            category: "Conversación",
            status: "WAITING_TEAM",
            updatedAt: "2026-11-21T13:00:00Z",
          },
        ],
        now,
        60,
      ),
    ).toHaveLength(1));
  it("excluye casos cerrados del monitor", () =>
    expect(evaluateQualityFindings([{ ...source, status: "CLOSED" }], now)).toHaveLength(0));
  it("agrupa patrones sin atribuir causalidad", () =>
    expect(
      groupOperationalFindings(evaluateQualityFindings([source, { ...source, id: "r2" }], now))[0]
        ?.count,
    ).toBe(2));
  it("no confunde hipótesis con acción aprobada", () => {
    const a: CorrectiveAction = {
      id: "a",
      title: "Verificar horarios",
      hypothesis: "Posible falta de confirmación",
      evidence: "event-1",
      assignedTo: "coord",
      dueAt: now,
      state: "APPROVED",
      approvedBy: "",
      confirmedCause: "",
      implementationEvidence: "",
      measuredAfter: "",
      trainingReference: "",
    };
    expect(prepareCorrectiveAction(a)).toBe("NOT_AUTHORIZED");
  });
  it("no usa contenido educativo vencido", () =>
    expect(
      approvedEducation(
        {
          id: "a",
          title: "Preparación",
          category: "Visitas",
          body: "Información revisada",
          source: "doc",
          clinical: true,
          reviewer: "vet",
          reviewedAt: "2026-11-01T00:00:00Z",
          validUntil: "2026-11-20T00:00:00Z",
          version: 1,
          state: "PUBLISHED",
        },
        now,
      ),
    ).toBe(false));
  it("no etiqueta emociones de una familia", () =>
    expect(
      customerHealth({ restricted: false, complaints: 0, overdue: 0, pending: 0, sources: 0 }),
    ).toBe("Datos insuficientes"));
});
describe("Prompt 10: contratos fail-closed", () => {
  it("incluye las 29 operaciones sin inventar endpoints", () => {
    expect(ContractRegistry).toHaveLength(29);
    expect(ContractRegistry.every((c) => c.endpoint === null)).toBe(true);
  });
  it("requiere versión e idempotencia", () =>
    expect(RequestSchema.safeParse({ operation: "createComplaint" }).success).toBe(false));
  it("nunca devuelve éxito ni envía desde un contrato desconectado", async () => {
    await expect(
      qualityGateway({
        operation: "prepareReviewRequest",
        entityId: "r",
        organizationId: "o",
        expectedVersion: 1,
        idempotencyKey: "r1",
        correlationId: "c1",
        requestedAt: now,
        payload: {},
      }),
    ).rejects.toThrow("INTEGRATION_UNAVAILABLE");
  });
});
