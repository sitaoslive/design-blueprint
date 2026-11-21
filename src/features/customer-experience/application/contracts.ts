import { z } from "zod";
import { ComplaintDraftSchema, SurveySchema, EducationSchema } from "../domain";
import { executeOfficialQuality, readOfficialQuality } from "./official.functions";
export const internalQualityOperations = ["createComplaint","assignComplaint","requestComplaintEscalation","submitResolutionProposal","recordResolutionEvidence","createSurveyDraft","publishApprovedSurvey","createCorrectiveAction","getConsentStatus","getSurveyResponses","getApprovedEducationContent","getCustomerFeedback","getQualityCase"] as const;
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
  endpoint: internalQualityOperations.some(o=>o===operation) ? "server-function:quality" : null,
  status: internalQualityOperations.some(o=>o===operation) ? "INTERNAL_AUTHORITY_CONNECTED" : "SERVER_AUTHORITY_PENDING",
}));
export const payloadSchemas = {
  createComplaint: ComplaintDraftSchema,
  createSurveyDraft: SurveySchema,
  getApprovedEducationContent: EducationSchema,
};
export async function qualityGateway(request: unknown): Promise<z.infer<typeof ResponseSchema>> {
  const parsed = RequestSchema.safeParse(request);
  if (!parsed.success) throw new Error("DATA_INCOMPLETE: solicitud incompleta");
  const r=parsed.data;
  if(internalQualityOperations.some(o=>o===r.operation)){
    const maps: Record<string,{kind:string;action:'create'|'transition';state?:string}>={createComplaint:{kind:'complaints',action:'create'},assignComplaint:{kind:'complaints',action:'transition',state:'ASSIGNED'},requestComplaintEscalation:{kind:'complaints',action:'transition',state:'ESCALATED'},submitResolutionProposal:{kind:'complaints',action:'transition',state:'RESOLUTION_PROPOSED'},recordResolutionEvidence:{kind:'complaints',action:'transition'},createSurveyDraft:{kind:'surveys',action:'create'},publishApprovedSurvey:{kind:'surveys',action:'transition',state:'PUBLISHED'},createCorrectiveAction:{kind:'improvements',action:'create'}};
    const target=maps[r.operation];
    if(target){const result=await executeOfficialQuality({data:{action:target.action,kind:target.kind,entityId:r.entityId,expectedVersion:r.expectedVersion,idempotencyKey:r.idempotencyKey,reason:String(r.payload['reason']??''),payload:{...r.payload,...(target.state?{state:target.state}:{})}}});const data=z.record(z.unknown()).parse(result);return ResponseSchema.parse({operation:r.operation,entityId:r.entityId,version:data['version'],correlationId:r.correlationId,fetchedAt:new Date().toISOString(),authoritative:true,data});}
    const kinds: Record<string,string>={getConsentStatus:'consent',getSurveyResponses:'response',getApprovedEducationContent:'education',getCustomerFeedback:'complaints',getQualityCase:'complaints'};
    const rows=(await readOfficialQuality()).filter(i=>i.kind===kinds[r.operation]&&(r.operation!=='getQualityCase'||i.id===r.entityId)&&(r.operation!=='getApprovedEducationContent'||i.state==='PUBLISHED'));
    return ResponseSchema.parse({operation:r.operation,entityId:r.entityId,version:0,correlationId:r.correlationId,fetchedAt:new Date().toISOString(),authoritative:true,data:{items:rows}});
  }
  // External delivery and unimplemented providers remain closed.
  throw new Error(
    "INTEGRATION_UNAVAILABLE: esta operación oficial requiere el servicio autorizado; no se ejecutó ningún envío ni cambio oficial",
  );
}
