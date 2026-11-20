import type { VisitStep } from "@/lib/vf/data";
/** Field execution of a visit — separate from appointment status and payment (Prompt 06 §7). */
export type ExecState = "ASSIGNED" | "PREPARING" | "READY_TO_DEPART" | "EN_ROUTE" | "ARRIVED" | "IN_SERVICE" | "SERVICE_FINISHED" | "ADMINISTRATIVE_REVIEW" | "ADMINISTRATIVELY_COMPLETED" | "NOT_PERFORMED" | "INCIDENT_REPORTED";
export type ExecEvent = "PREPARATION_STARTED" | "PREPARATION_COMPLETED" | "TRAVEL_STARTED" | "ARRIVAL_RECORDED" | "SERVICE_STARTED" | "SERVICE_FINISHED" | "INCIDENT_CREATED" | "NOT_PERFORMED" | "ADMINISTRATIVE_CLOSURE_REQUESTED" | "CLOSURE_VERIFIED";
export type Actor = "Veterinario" | "Auxiliar" | "coordinador" | "director";
const T: Record<ExecEvent, { from: ExecState[]; to: ExecState; actors: Actor[] }> = {
  PREPARATION_STARTED: { from: ["ASSIGNED"], to: "PREPARING", actors: ["Veterinario", "Auxiliar"] },
  PREPARATION_COMPLETED: { from: ["PREPARING"], to: "READY_TO_DEPART", actors: ["Veterinario", "Auxiliar"] },
  TRAVEL_STARTED: { from: ["READY_TO_DEPART", "ASSIGNED"], to: "EN_ROUTE", actors: ["Veterinario", "Auxiliar"] },
  ARRIVAL_RECORDED: { from: ["EN_ROUTE"], to: "ARRIVED", actors: ["Veterinario", "Auxiliar"] },
  SERVICE_STARTED: { from: ["ARRIVED"], to: "IN_SERVICE", actors: ["Veterinario"] },
  SERVICE_FINISHED: { from: ["IN_SERVICE"], to: "SERVICE_FINISHED", actors: ["Veterinario"] },
  INCIDENT_CREATED: { from: ["ASSIGNED", "PREPARING", "READY_TO_DEPART", "EN_ROUTE", "ARRIVED", "IN_SERVICE"], to: "INCIDENT_REPORTED", actors: ["Veterinario", "Auxiliar", "coordinador"] },
  NOT_PERFORMED: { from: ["ASSIGNED", "PREPARING", "READY_TO_DEPART", "EN_ROUTE", "ARRIVED", "INCIDENT_REPORTED"], to: "NOT_PERFORMED", actors: ["Veterinario", "coordinador", "director"] },
  ADMINISTRATIVE_CLOSURE_REQUESTED: { from: ["SERVICE_FINISHED"], to: "ADMINISTRATIVE_REVIEW", actors: ["Veterinario"] },
  CLOSURE_VERIFIED: { from: ["ADMINISTRATIVE_REVIEW"], to: "ADMINISTRATIVELY_COMPLETED", actors: ["coordinador", "director"] },
};
export interface ExecCtx { state: ExecState; version: number; actor: Actor; expectedVersion: number; prepDone?: boolean; reason?: string }
export type ExecResult = { ok: true; to: ExecState; version: number } | { ok: false; error: string };
/** Local UX validation only; the database trigger is the authority. */
export function applyExecEvent(c: ExecCtx, e: ExecEvent): ExecResult {
  const t = T[e];
  if (c.version !== c.expectedVersion) return { ok: false, error: "La visita cambió mientras la tenías abierta. Recarga antes de continuar." };
  if (!t.from.includes(c.state)) return { ok: false, error: `No se puede pasar de ${EXEC_LABEL[c.state]} con este paso` };
  if (!t.actors.includes(c.actor)) return { ok: false, error: c.actor === "Auxiliar" ? "Un auxiliar no puede realizar este paso clínico" : "No tienes permiso para este paso" };
  if (e === "PREPARATION_COMPLETED" && !c.prepDone) return { ok: false, error: "Completa la preparación antes de salir" };
  if ((e === "NOT_PERFORMED" || e === "INCIDENT_CREATED") && !c.reason?.trim()) return { ok: false, error: "Indica el motivo" };
  return { ok: true, to: t.to, version: c.version + 1 };
}
export const nextEvents = (s: ExecState, a: Actor): ExecEvent[] => (Object.keys(T) as ExecEvent[]).filter((e) => T[e].from.includes(s) && T[e].actors.includes(a));
export const EXEC_LABEL: Record<ExecState, string> = { ASSIGNED: "Asignada", PREPARING: "En preparación", READY_TO_DEPART: "Lista para salir", EN_ROUTE: "En camino", ARRIVED: "Llegada", IN_SERVICE: "En atención", SERVICE_FINISHED: "Servicio finalizado", ADMINISTRATIVE_REVIEW: "Revisión administrativa", ADMINISTRATIVELY_COMPLETED: "Cerrada", NOT_PERFORMED: "No realizada", INCIDENT_REPORTED: "Con incidencia" };
export const EVENT_LABEL: Record<ExecEvent, string> = { PREPARATION_STARTED: "Iniciar preparación", PREPARATION_COMPLETED: "Preparación lista", TRAVEL_STARTED: "Iniciar desplazamiento", ARRIVAL_RECORDED: "Registrar llegada", SERVICE_STARTED: "Iniciar atención", SERVICE_FINISHED: "Finalizar servicio", INCIDENT_CREATED: "Reportar incidencia", NOT_PERFORMED: "Marcar no realizada", ADMINISTRATIVE_CLOSURE_REQUESTED: "Solicitar cierre", CLOSURE_VERIFIED: "Verificar cierre" };
/** Map to the existing visit step column (kept for the current UI). */
export function stepOf(s: ExecState): VisitStep | null {
  return ({ EN_ROUTE: "en_desplazamiento", ARRIVED: "llegada", IN_SERVICE: "en_atencion", SERVICE_FINISHED: "finalizada", ADMINISTRATIVE_REVIEW: "finalizada", ADMINISTRATIVELY_COMPLETED: "finalizada" } as Partial<Record<ExecState, VisitStep>>)[s] ?? null;
}
export function stateFromStep(step: VisitStep): ExecState { return ({ programada: "ASSIGNED", en_desplazamiento: "EN_ROUTE", llegada: "ARRIVED", en_atencion: "IN_SERVICE", finalizada: "SERVICE_FINISHED" } as const)[step]; }
