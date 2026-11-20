/** ShiftHandoverService (§29). */
export type HandoverStatus = "BORRADOR" | "PENDIENTE_ACEPTACION" | "ACEPTADO" | "RECHAZADO";
export interface HandoverItem { id: string; title: string; critical: boolean }
export interface Handover { from: string; to: string; items: HandoverItem[]; notes: string; status: HandoverStatus; acceptedBy?: string | null }
export function prepareHandover(from: string, to: string, items: HandoverItem[], notes: string): Handover | string {
  if (!to || to === from) return "Elige a quién entregas el turno";
  const uniq = items.filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i);
  if (!uniq.length && !notes.trim()) return "No hay nada que entregar";
  return { from, to, items: uniq, notes, status: "PENDIENTE_ACEPTACION" };
}
/** Only the incoming person accepts; critical items are not transferred until then. */
export function acceptHandover(h: Handover, by: string, accept: boolean): Handover | string {
  if (h.status !== "PENDIENTE_ACEPTACION") return "Esta entrega ya fue respondida";
  if (by !== h.to) return "Solo la persona que recibe puede aceptar";
  return { ...h, status: accept ? "ACEPTADO" : "RECHAZADO", acceptedBy: accept ? by : null };
}
export const isTransferred = (h: Handover, itemId: string) => h.status === "ACEPTADO" && h.items.some((i) => i.id === itemId);
export const handoverKey = (from: string, to: string, day: string) => `handover:${from}:${to}:${day}`;
