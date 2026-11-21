import { z } from "zod";
import { importFields } from "../domain/import";

export const PreparationSchema = z.object({
  requestId: z.string().uuid(),
  source: z.string().trim().min(1).max(200),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  rowCount: z.number().int().min(1).max(2000),
  mapping: z.object({ externalId: z.string().min(1).max(100), visitId: z.string().max(100), petId: z.string().min(1).max(100), staffId: z.string().min(1).max(100), date: z.string().min(1).max(100), status: z.string().min(1).max(100) }).strict(),
  authorizedFile: z.literal(true), mappingReviewed: z.literal(true),
  evidence: z.string().trim().min(10).max(1000),
  comparedAt: z.string().datetime(),
  conflictCount: z.number().int().min(0).max(2000),
}).strict().superRefine((value, ctx) => {
  const columns = importFields.map(([key]) => value.mapping[key]).filter(Boolean);
  if (new Set(columns).size !== columns.length) ctx.addIssue({ code: "custom", message: "Una columna no puede representar dos campos" });
});
export type Preparation = z.infer<typeof PreparationSchema>;
export function validatePreparation(input: unknown, now = Date.now()): Preparation {
  const parsed = PreparationSchema.parse(input);
  const age = now - Date.parse(parsed.comparedAt);
  if (age < -5000 || age > 120000) throw new Error("STALE: actualiza la comparación antes de guardar");
  return parsed;
}
export type SavedPreparation = { id: string; title: string; created_at: string; created_by: string; data: Preparation; status: string };