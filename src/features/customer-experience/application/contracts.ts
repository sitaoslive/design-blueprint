import { z } from "zod";
import { ComplaintDraftSchema, SurveySchema, EducationSchema } from "../domain";
export const operations = [
  "getQualityOverview",
  "listQualityFindings",
  "getQualityCase",
  "createComplaint",
  "getComplaintTimeline",
  "assignComplaint",
  "requestComplaintEscalation",
  "submitResolutionProposal",
  "recordResolutionEvidence",
  "getCustomerFeedback",
  "createSurveyDraft",
  "publishApprovedSurvey",
  "getSurveyResponses",
  "getSurveyMetrics",
  "getConsentStatus",
  "getCommunicationEligibility",
  "getCommunicationSuppressions",
  "prepareFollowUpRequest",
  "getPreventiveFollowUps",
  "getReviewRequestStatus",
  "prepareReviewRequest",
  "getReferralProgramStatus",
  "getCustomerRecoveryOpportunities",
  "getApprovedEducationContent",
  "getCustomerJourneyQuality",
  "getRootCauseFindings",
  "createCorrectiveAction",
  "getQualityMetrics",
  "getCustomerExperienceReport",
] as const;
export type QualityOperation = (typeof operations)[number];
export const ErrorSchema = z.object({
  code: z.enum([
    "UNAUTHORIZED",
    "FORBIDDEN",
    "CONSENT_REQUIRED",
    "COMMUNICATION_SUPPRESSED",
    "FREQUENCY_LIMITED",
    "SENSITIVE_CONTEXT",
    "COMPLAINT_ALREADY_EXISTS",
    "INVALID_STATE_TRANSITION",
    "CASE_ALREADY_CLOSED",
    "PROFESSIONAL_REVIEW_REQUIRED",
    "DATA_INCOMPLETE",
    "DUPLICATE_EVENT",
    "STALE_DATA",
    "INTEGRATION_UNAVAILABLE",
  ]),
  message: z.string(),
});
export const RequestSchema = z.object({
  operation: z.enum(operations),
  entityId: z.string().min(1),
  organizationId: z.string().min(1),
  expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(1),
  correlationId: z.string().min(1),
  requestedAt: z.string().datetime(),
  payload: z.record(z.unknown()),
});
export const ResponseSchema = z.object({
  operation: z.enum(operations),
  entityId: z.string(),
  version: z.number().int().nonnegative(),
  correlationId: z.string(),
  fetchedAt: z.string().datetime(),
  authoritative: z.literal(true),
  data: z.record(z.unknown()),
});
export const ContractRegistry = operations.map((operation) => ({
  operation,
  authentication: "Verified caller required",
  authorization:
    "Server-scoped organization, role, own-family or assigned-case; clinical reviewer and financial approvals kept separate",
  request: RequestSchema,
  response: ResponseSchema,
  error: ErrorSchema,
  dataFreshness:
    "Version and current consent must be rechecked atomically before mutation/delivery",
  audit: "actor + source + reason + old/new version + correlation + evidence; server-owned",
  endpoint: null,
  status: "SERVER_AUTHORITY_PENDING" as const,
}));
export const payloadSchemas = {
  createComplaint: ComplaintDraftSchema,
  createSurveyDraft: SurveySchema,
  getApprovedEducationContent: EducationSchema,
};
export async function qualityGateway(request: unknown): Promise<never> {
  const parsed = RequestSchema.safeParse(request);
  if (!parsed.success) throw new Error("DATA_INCOMPLETE: solicitud incompleta");
  // No endpoint is invented. Official mutation and external delivery belong to the protected provider.
  throw new Error(
    "INTEGRATION_UNAVAILABLE: esta operación oficial requiere el servicio autorizado; no se ejecutó ningún envío ni cambio oficial",
  );
}
