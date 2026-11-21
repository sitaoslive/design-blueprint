import { z } from "zod";
export const DISPATCH_CONTRACTS = ["getAppointmentTypes", "getAppointmentDurationPolicy", "requestDurationPolicyChange", "createAppointmentWithDuration", "requestAppointmentDurationOverride", "getLiveVisitTiming", "requestTravelStart", "requestVisitArrival", "requestVisitStart", "requestVisitFinish", "submitUpdatedFinishEstimate", "getStaffTrackingStatus", "getDispatchOverview", "getRouteEta", "getDelayImpacts", "getDelayNotificationHistory", "getCustomerTrackingSession", "getCustomerTrackingStatus", "requestDelayPolicyChange", "requestDelayReview"] as const;
export const DispatchRequestSchema = z.object({ operation: z.enum(DISPATCH_CONTRACTS), entityId: z.string().min(1), expectedVersion: z.number().int().nonnegative(), idempotencyKey: z.string().uuid(), correlationId: z.string().uuid() }).strict();
export const DispatchReceiptSchema = z.object({ id: z.string(), version: z.number().int().positive(), auditReference: z.string().min(1), occurredAt: z.string().datetime(), source: z.literal("VERIFIED_BACKEND") }).strict();
export async function requestDispatchOperation(input: z.infer<typeof DispatchRequestSchema>): Promise<z.infer<typeof DispatchReceiptSchema>> {
  DispatchRequestSchema.parse(input);
  throw new Error("BACKEND_UNAVAILABLE: contrato de despacho no verificado; no se cambió la visita ni se envió un aviso");
}