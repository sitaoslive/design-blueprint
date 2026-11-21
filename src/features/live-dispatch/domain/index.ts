import { z } from "zod";

export const DurationPolicySchema = z.object({
  name: z.string().trim().min(1).max(100), category: z.enum(["CONTROL", "CONSULTA_GENERAL", "APLICACION_MEDICAMENTO", "VACUNACION", "DESPARASITACION", "URGENCIA", "ESPECIALISTA", "SEGUIMIENTO_POSTOPERATORIO", "TRATAMIENTO_RECURRENTE", "TOMA_DE_MUESTRAS", "PROCEDIMIENTO_AUTORIZADO", "OTRO"]),
  duration: z.number().int().min(1).max(480), minimum: z.number().int().min(1).max(480),
  maximum: z.number().int().min(1).max(480), increment: z.number().int().min(1).max(120),
  preparation: z.number().int().min(0).max(120), administration: z.number().int().min(0).max(120),
  reason: z.string().trim().min(10).max(1000),
}).strict().superRefine((p, ctx) => {
  if (p.minimum > p.duration || p.duration > p.maximum || (p.duration - p.minimum) % p.increment !== 0) ctx.addIssue({ code: "custom", message: "Duración fuera del rango o incremento permitido" });
});
export type DurationPolicy = z.infer<typeof DurationPolicySchema>;
export function resolveDuration(policy: DurationPolicy, applied: number, authorized: boolean, reason: string, confirmed: boolean) {
  DurationPolicySchema.parse(policy);
  if (confirmed) throw new Error("La cita confirmada requiere reprogramación autorizada");
  if (!Number.isInteger(applied) || applied < policy.minimum || applied > policy.maximum || (applied - policy.minimum) % policy.increment !== 0) throw new Error("Duración inválida");
  if (applied !== policy.duration && (!authorized || reason.trim().length < 10)) throw new Error("Cambio sin permiso o motivo");
  return { serviceMinutes: applied, preparationMinutes: policy.preparation, administrationMinutes: policy.administration, occupiedMinutes: applied + policy.preparation + policy.administration };
}
export type VisitTiming = { actualStartAt: string | null; actualEndAt: string | null; plannedMinutes: number | null };
export function visitTimer(timing: VisitTiming, now: number) {
  const start = timing.actualStartAt ? Date.parse(timing.actualStartAt) : NaN;
  const end = timing.actualEndAt ? Date.parse(timing.actualEndAt) : now;
  const elapsed = Number.isFinite(start) && Number.isFinite(end) && end >= start && now >= start ? Math.floor((end - start) / 60000) : null;
  const planned = timing.plannedMinutes !== null && Number.isFinite(timing.plannedMinutes) && timing.plannedMinutes > 0 ? timing.plannedMinutes : null;
  return { elapsed, remaining: elapsed !== null && planned !== null ? Math.max(0, planned - elapsed) : null, overrun: elapsed !== null && planned !== null ? Math.max(0, elapsed - planned) : null };
}
export type EtaEstimate = { predictedArrivalAt: string; calculatedAt: string; source: "ROUTING_PROVIDER" | "PROFESSIONAL_REPORTED"; confidence: "HIGH" | "MEDIUM" | "LOW" };
export function freshEta(eta: EtaEstimate | null, now: number, maxAgeMs: number): EtaEstimate | null {
  if (!eta || !Number.isFinite(maxAgeMs) || maxAgeMs <= 0) return null;
  const age = now - Date.parse(eta.calculatedAt);
  return age >= 0 && age <= maxAgeMs && Number.isFinite(Date.parse(eta.predictedArrivalAt)) ? eta : null;
}
export function trackingVisible(input: { ownVisit: boolean; assigned: boolean; enRoute: boolean; consent: boolean; onShift: boolean; expiresAt: string; observedAt: string; maximumAgeMs: number }, now: number): boolean {
  const age = now - Date.parse(input.observedAt);
  return input.ownVisit && input.assigned && input.enRoute && input.consent && input.onShift && Date.parse(input.expiresAt) > now && input.maximumAgeMs > 0 && age >= 0 && age <= input.maximumAgeMs;
}
export function downstreamImpact(finishAt: number, visits: readonly { id: string; scheduledAt: number; travelMinutes: number | null; occupiedMinutes: number | null }[]) {
  let finish: number | null = Number.isFinite(finishAt) ? finishAt : null;
  return visits.map((visit) => {
    const known = finish !== null && visit.travelMinutes !== null && Number.isFinite(visit.travelMinutes) && visit.travelMinutes >= 0 && visit.occupiedMinutes !== null && Number.isFinite(visit.occupiedMinutes) && visit.occupiedMinutes > 0 && Number.isFinite(visit.scheduledAt);
    const arrival: number | null = known && finish !== null && visit.travelMinutes !== null ? finish + visit.travelMinutes * 60000 : null;
    const delay = arrival !== null ? Math.max(0, Math.ceil((arrival - visit.scheduledAt) / 60000)) : null;
    finish = arrival !== null && visit.occupiedMinutes !== null ? Math.max(arrival, visit.scheduledAt) + visit.occupiedMinutes * 60000 : null;
    return { id: visit.id, predictedArrivalAt: arrival, delayMinutes: delay };
  });
}
export function dispatchAccess(roles: readonly string[], uid: string | null) {
  if (!uid) return "NONE";
  if (roles.some((r) => ["administrador", "luis", "coordinador", "recepcion"].includes(r))) return "OPERATIONS";
  if (roles.some((r) => ["veterinario", "auxiliar"].includes(r))) return "OWN_ASSIGNMENTS";
  if (roles.includes("cliente")) return "OWN_VISIT";
  return "NONE";
}