/** Unstable connection strategy (§34). */
export type SyncState = "ONLINE" | "CONNECTION_UNSTABLE" | "OFFLINE" | "ACTION_DRAFTED" | "SYNC_PENDING" | "SYNC_FAILED" | "SYNC_CONFIRMED";
export const SERVER_REQUIRED = ["confirmar_llegada", "confirmar_servicio", "descontar_inventario", "registrar_pago", "confirmar_cita", "cambiar_estado", "cerrar_procedimiento"] as const;
export const OFFLINE_ALLOWED = ["nota_administrativa", "checklist", "borrador_tarea"] as const;
export type ActionKind = (typeof SERVER_REQUIRED)[number] | (typeof OFFLINE_ALLOWED)[number];
export interface QueuedAction { key: string; kind: ActionKind; payload: Record<string, unknown>; capturedAt: number; state: SyncState; acceptedAt?: number | null; attempts: number }
export const MAX_AGE_MS = 24 * 3600e3;
export function canRunOffline(k: ActionKind) { return (OFFLINE_ALLOWED as readonly string[]).includes(k); }
/** Enqueue idempotently: same key never duplicates. Server-only actions are blocked offline. */
export function enqueue(q: QueuedAction[], a: Omit<QueuedAction, "state" | "attempts">, online: boolean): { queue: QueuedAction[]; error?: string } {
  if (!online && !canRunOffline(a.kind)) return { queue: q, error: "Requiere conexión: no se puede completar sin internet" };
  if (q.some((x) => x.key === a.key)) return { queue: q };
  return { queue: [...q, { ...a, state: online ? "SYNC_PENDING" : "ACTION_DRAFTED", attempts: 0 }] };
}
export function markResult(q: QueuedAction[], key: string, ok: boolean, now: number): QueuedAction[] {
  return q.map((x) => (x.key === key ? { ...x, state: ok ? "SYNC_CONFIRMED" : "SYNC_FAILED", acceptedAt: ok ? now : null, attempts: x.attempts + 1 } : x));
}
/** Private drafts are not kept indefinitely. */
export const purgeExpired = (q: QueuedAction[], now: number) => q.filter((x) => x.state === "SYNC_CONFIRMED" ? false : now - x.capturedAt < MAX_AGE_MS);
export const syncLabel = (s: SyncState) => ({ ONLINE: "En línea", CONNECTION_UNSTABLE: "Conexión inestable", OFFLINE: "Sin conexión", ACTION_DRAFTED: "Borrador local", SYNC_PENDING: "Pendiente de enviar", SYNC_FAILED: "No se pudo enviar", SYNC_CONFIRMED: "Enviado" })[s];
