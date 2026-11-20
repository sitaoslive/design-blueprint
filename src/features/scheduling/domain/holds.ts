import type { AppointmentHold, HoldStatus } from "./types";
const NEXT: Record<HoldStatus, HoldStatus[]> = { REQUESTED: ["ACTIVE", "FAILED"], ACTIVE: ["EXPIRED", "RELEASED", "CONVERTED"], EXPIRED: [], RELEASED: [], CONVERTED: [], FAILED: [] };
export const canMoveHold = (a: HoldStatus, b: HoldStatus) => NEXT[a].includes(b);
/** Effective status uses the server clock passed in, never the browser timer. */
export function effectiveHold(h: AppointmentHold, serverNow: number): HoldStatus { return h.status === "ACTIVE" && h.expiresAt <= serverNow ? "EXPIRED" : h.status; }
/** Booking UI label: a request or a hold is never shown as confirmed. */
export function bookingLabel(s: { hasOkvetRef: boolean; hold?: HoldStatus | undefined; requested: boolean; error?: boolean }): "CONFIRMADA" | "PENDIENTE DE OKVET" | "RESERVA PROVISIONAL" | "SOLICITUD REGISTRADA" | "ERROR" {
  if (s.error) return "ERROR";
  if (s.hasOkvetRef) return "CONFIRMADA";
  if (s.hold === "ACTIVE") return "RESERVA PROVISIONAL";
  if (s.hold === "CONVERTED") return "PENDIENTE DE OKVET";
  return s.requested ? "SOLICITUD REGISTRADA" : "ERROR";
}
