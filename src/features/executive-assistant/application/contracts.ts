import { z } from "zod";
import { ExecutionStates } from "../domain";
export const ErrorCodes = [
  "UNAUTHORIZED",
  "FORBIDDEN",
  "TOOL_NOT_AVAILABLE",
  "AMBIGUOUS_REFERENCE",
  "DATA_STALE",
  "MISSING_INFORMATION",
  "ACTION_PROHIBITED",
  "APPROVAL_REQUIRED",
  "APPROVAL_EXPIRED",
  "EXECUTION_CONFLICT",
  "EXECUTION_PARTIAL",
  "BACKEND_UNAVAILABLE",
  "EXTERNAL_CONFIRMATION_REQUIRED",
  "CLINICAL_REVIEW_REQUIRED",
  "INSUFFICIENT_DATA",
] as const;
export const ExecutiveRequestSchema = z.object({
  organizationId: z.string().min(1),
  actorId: z.string().min(1),
  entityId: z.string().min(1),
  expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(1),
  correlationId: z.string().min(1),
  source: z.string().min(1),
  approvalReference: z.string().nullable(),
  payload: z.record(z.string(), z.unknown()),
});
export const ExecutiveReceiptSchema = z.object({
  id: z.string().min(1),
  entityId: z.string().min(1),
  status: z.enum(ExecutionStates),
  source: z.string().min(1),
  sourceTimestamp: z.string().datetime(),
  reference: z.string().min(1),
  responsible: z.string().min(1),
  version: z.number().int().nonnegative(),
  correlationId: z.string().min(1),
  auditReference: z.string().min(1),
  nextAction: z.string(),
});
export const ExecutiveErrorSchema = z.object({
  code: z.enum(ErrorCodes),
  message: z.string(),
  correlationId: z.string(),
});
export const EXECUTIVE_CONTRACTS = [
  "createExecutiveConversation",
  "getExecutiveConversation",
  "listExecutiveConversations",
  "submitExecutiveMessage",
  "getExecutiveToolRegistry",
  "queryExecutiveData",
  "requestExecutiveToolExecution",
  "getExecutiveToolResult",
  "createExecutiveProposal",
  "getExecutiveProposal",
  "getExecutiveApprovals",
  "submitExecutiveApproval",
  "requestExecutiveExecution",
  "getExecutiveExecutionStatus",
  "createExecutiveDelegation",
  "getDelegationStatus",
  "getExecutiveBriefing",
  "getExecutiveReport",
  "getExecutiveExceptions",
  "createAbsenceModePlan",
  "requestAbsenceModeActivation",
  "getAbsenceModeStatus",
  "getAutonomyMetrics",
  "getExecutiveBusinessMemory",
  "requestBusinessMemoryApproval",
  "getExecutiveAudit",
  "getAIIntegrationStatus",
  "transcribeExecutiveVoice",
  "speakExecutiveResponse",
] as const;
export const ExecutiveContracts = Object.fromEntries(
  EXECUTIVE_CONTRACTS.map((name) => [
    name,
    {
      name,
      requestSchema: ExecutiveRequestSchema,
      responseSchema: ExecutiveReceiptSchema,
      errorSchema: ExecutiveErrorSchema,
      authentication: "existing-session",
      authorization: "server-per-operation",
      supportedRoles: ["luis", "administrador"],
      auditRequired: true,
      retryPolicy: "same-key-only-after-status-check",
      timeoutMs: 15000,
      dataSensitivity: "private",
      status: "BACKEND_UNAVAILABLE",
    },
  ]),
) as Record<
  (typeof EXECUTIVE_CONTRACTS)[number],
  {
    name: string;
    requestSchema: typeof ExecutiveRequestSchema;
    responseSchema: typeof ExecutiveReceiptSchema;
    errorSchema: typeof ExecutiveErrorSchema;
    authentication: string;
    authorization: string;
    supportedRoles: string[];
    auditRequired: boolean;
    retryPolicy: string;
    timeoutMs: number;
    dataSensitivity: string;
    status: string;
  }
>;
export type ExecutiveAssistantGateway = {
  invoke: (
    operation: (typeof EXECUTIVE_CONTRACTS)[number],
    request: z.infer<typeof ExecutiveRequestSchema>,
  ) => Promise<z.infer<typeof ExecutiveReceiptSchema>>;
};
export const unavailableExecutiveGateway: ExecutiveAssistantGateway = {
  async invoke(operation, request) {
    ExecutiveRequestSchema.parse(request);
    throw new Error(
      `BACKEND_UNAVAILABLE: ${operation} requiere contrato protegido; no se ejecutó ninguna acción`,
    );
  },
};
export interface VoiceProcessingGateway {
  transcribe(audio: Blob): Promise<{ text: string; source: string }>;
}
export const unavailableVoiceGateway: VoiceProcessingGateway = {
  async transcribe() {
    throw new Error("Transcripción no disponible: no hay proveedor autorizado; audio no enviado");
  },
};
