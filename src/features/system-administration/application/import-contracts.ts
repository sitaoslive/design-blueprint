import { z } from "zod";
export const ImportReviewSchema = z.object({
  actorId: z.string().min(1), source: z.string().min(1), expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().uuid(), correlationId: z.string().uuid(),
  authorizedFile: z.literal(true), mappingReviewed: z.literal(true), evidence: z.string().trim().min(10).max(1000),
  rowCount: z.number().int().min(1).max(2000),
});
export const ImportReceiptSchema = z.object({ id: z.string().min(1), status: z.enum(["PENDING", "REJECTED", "APPLIED"]), version: z.number().int(), auditReference: z.string().min(1), correlationId: z.string().uuid() });
export const ImportErrorSchema = z.object({ code: z.enum(["BACKEND_UNAVAILABLE", "FORBIDDEN", "STALE", "CONFLICT"]), message: z.string(), correlationId: z.string().uuid() });
export const IMPORT_CONTRACTS = ["getOkvetImportPreview", "submitImportMapping", "requestOkvetImport", "getOkvetReconciliationCases", "submitReconciliationDecision", "getDataQualityFindings"] as const;
export async function requestProtectedImport(input: z.infer<typeof ImportReviewSchema>): Promise<z.infer<typeof ImportReceiptSchema>> {
  ImportReviewSchema.parse(input);
  throw new Error("BACKEND_UNAVAILABLE: importación protegida no conectada; no se envió el archivo ni se modificó una cita");
}