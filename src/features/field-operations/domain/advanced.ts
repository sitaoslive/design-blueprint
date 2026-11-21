export type TaskStage = "assigned" | "accepted" | "in_progress" | "blocked" | "completed" | "cancelled";
export const TASK_LABEL: Record<TaskStage, string> = { assigned: "Asignada", accepted: "Aceptada", in_progress: "En curso", blocked: "Bloqueada", completed: "Completada", cancelled: "Cancelada" };
const taskEdges: Record<TaskStage, TaskStage[]> = { assigned: ["accepted", "cancelled"], accepted: ["in_progress", "blocked", "cancelled"], in_progress: ["completed", "blocked", "cancelled"], blocked: ["in_progress", "cancelled"], completed: [], cancelled: [] };
export function taskTransitions(stage: TaskStage, coordinator = false) { return taskEdges[stage].filter((next) => next !== "cancelled" || coordinator); }
export function validateTaskTransition(from: TaskStage, to: TaskStage, reason: string, coordinator = false): string | null {
  if (!taskTransitions(from, coordinator).includes(to)) return "Paso de tarea no permitido";
  if ((to === "blocked" || to === "cancelled") && !reason.trim()) return "Indica el motivo";
  return null;
}
export type SupportStage = "ASSIGNED" | "PREPARING" | "READY" | "EN_ROUTE" | "ARRIVED" | "COMPLETED";
export const SUPPORT_LABEL: Record<SupportStage, string> = { ASSIGNED: "Asignada", PREPARING: "En preparación", READY: "Preparada", EN_ROUTE: "En camino", ARRIVED: "Llegada", COMPLETED: "Apoyo terminado" };
export function nextSupportStage(stage: SupportStage): SupportStage | null {
  return ({ ASSIGNED: "PREPARING", PREPARING: "READY", READY: "EN_ROUTE", EN_ROUTE: "ARRIVED", ARRIVED: "COMPLETED", COMPLETED: null } as const)[stage];
}
export function operationalDay(now = new Date()) { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(now); }
export function taskOverdue(dueAt: string | null, stage: TaskStage, now = Date.now()) { return !!dueAt && !["completed", "cancelled"].includes(stage) && Date.parse(dueAt) < now; }