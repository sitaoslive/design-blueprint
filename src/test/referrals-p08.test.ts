import { describe, it, expect } from "vitest";
import { applyRef, buildOffer, stalled, refActions, type RefCase } from "@/features/referrals/domain";
const now = new Date("2026-11-20T12:00:00");
const base = (state: RefCase["state"], offers: RefCase["offers"] = []): RefCase => ({ state, version: 1, offers, history: [] });
const off = { id: "2026-11-24T10:00", date: "2026-11-24", time: "10:00", location: "Clínica Norte", expiresAt: "2026-11-22T18:00", subjectToConfirmation: true };
describe("Prompt 08 remisiones", () => {
  it("coordinación no aprueba indicación clínica", () => expect(applyRef(base("PENDING_CLINICAL_APPROVAL"), "aprobar", "coordinacion", "u", { expectedVersion: 1, now })).toContain("profesional clínico"));
  it("confirmar cita exige evidencia externa", () => expect(applyRef(base("PENDING_EXTERNAL_CONFIRMATION"), "confirmar_externa", "coordinacion", "u", { expectedVersion: 1, now })).toContain("evidencia"));
  it("no se pasa de esperando elección a confirmada", () => expect(refActions("AWAITING_CUSTOMER_SELECTION", "coordinacion")).not.toContain("confirmar_externa"));
  it("recibir el informe no es la revisión clínica", () => { const r = applyRef(base("REPORT_PENDING"), "informe_recibido", "coordinacion", "u", { expectedVersion: 1, now }) as RefCase; expect(r.state).toBe("REPORT_RECEIVED"); expect(refActions(r.state, "coordinacion")).not.toContain("revisar"); });
  it("no se ofrece horario pasado ni vencido", () => { expect(buildOffer({ ...off, date: "2026-11-19" }, now, true)).toBe("El horario ya pasó"); expect(buildOffer({ ...off, expiresAt: "2026-11-25T00:00" }, now, true)).toBe("La oferta debe vencer antes del horario"); expect(buildOffer(off, now, false)).toBe("El especialista no está activo"); });
  it("elegir una opción vencida falla", () => expect(applyRef(base("AWAITING_CUSTOMER_SELECTION", [{ ...off, expiresAt: "2026-11-20T08:00" }]), "registrar_eleccion", "coordinacion", "u", { choice: off.id, expectedVersion: 1, now })).toContain("venció"));
  it("versión distinta bloquea", () => expect(applyRef(base("PROPOSED"), "aprobar", "clinico", "u", { expectedVersion: 0, now })).toContain("cambió"));
  it("espera de confirmación 48 h queda estancada, sin cerrar", () => expect(stalled("PENDING_EXTERNAL_CONFIRMATION", new Date("2026-11-18T11:00:00"), now).stalled).toBe(true));
});
