import type { SchedulingContext } from "@/features/scheduling/domain";
export function durationPreviewContext(context: SchedulingContext, service: string, duration: number): SchedulingContext {
  if (!Number.isInteger(duration) || duration <= 0 || duration > 480) throw new Error("Duración de previsualización inválida");
  if (!context.services.some((s) => s.name === service)) throw new Error("Servicio desconocido");
  return { ...context, services: context.services.map((s) => s.name === service ? { ...s, duration } : s) };
}