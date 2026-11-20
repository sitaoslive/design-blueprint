import { describe, it, expect } from "vitest";
import { evaluateSlot, searchAvailability, recommendReplacements, analyzeCapacity, generateOccurrences, withinWindow, eligibleFor, acceptOffer, effectiveHold, canMoveHold, bookingLabel, SERVICES, weekdayOf, type SchedulingContext } from "@/features/scheduling/domain";

const H = (h: number, m = 0) => h * 60 + m;
const base = (): SchedulingContext => ({
  staff: [
    { id: "val", name: "Valeria", role: "Veterinario", zone: "Zona Norte", skills: ["Medicina preventiva", "Vacunación"] },
    { id: "mar", name: "Martín", role: "Veterinario", zone: "Zona Centro", skills: ["Curaciones"] },
    { id: "cam", name: "Camila", role: "Auxiliar", zone: "Zona Norte", skills: ["Toma de muestras"] },
  ],
  shifts: [
    { staffId: "val", day: "Martes", start: H(8), end: H(16), kind: "turno" },
    { staffId: "mar", day: "Martes", start: H(8), end: H(16), kind: "turno" },
    { staffId: "cam", day: "Martes", start: H(8), end: H(12), kind: "turno" },
  ],
  bookings: [], holds: [], services: SERVICES, coveredZones: ["Zona Norte", "Zona Centro", "Zona Sur"], now: 1000, dataAgeMinutes: 0,
});
const ev = (c: SchedulingContext, id: string, service: string, start: number, zone = "Zona Norte", day = "Martes") => evaluateSlot(c, id, { service, zone, day, start });

describe("motor de disponibilidad", () => {
  it("jornada libre → disponible y nunca confirmada sin OKVET", () => { const r = ev(base(), "val", "Vacunación", H(9)); expect(r.status).toBe("AVAILABLE"); expect(r.requiresOkvetConfirmation).toBe(true); });
  it("fuera de turno", () => expect(ev(base(), "val", "Vacunación", H(17)).status).toBe("UNAVAILABLE"));
  it("sin turno ese día", () => expect(ev(base(), "val", "Vacunación", H(9), "Zona Norte", "Jueves").constraints[0]?.code).toBe("NO_SHIFT"));
  it("ausencia registrada", () => { const c = base(); c.shifts.push({ staffId: "val", day: "Martes", start: H(9), end: H(11), kind: "ausencia" }); expect(ev(c, "val", "Vacunación", H(10)).constraints[0]?.code).toBe("ABSENCE"); });
  it("descanso obligatorio 12:30–13:00", () => expect(ev(base(), "val", "Vacunación", H(12, 30)).constraints[0]?.code).toBe("BREAK"));
  it("servicio demasiado largo para el cierre del turno", () => expect(ev(base(), "val", "Control preventivo", H(15, 30)).status).toBe("UNAVAILABLE"));
  it("auxiliar no habilitada para vacunar", () => expect(ev(base(), "cam", "Vacunación", H(9)).status).toBe("INCOMPATIBLE"));
  it("zona no cubierta", () => expect(ev(base(), "val", "Vacunación", H(9), "Envigado").constraints[0]?.code).toBe("ZONE_NOT_COVERED"));
  it("cita anterior cercana en la misma zona → cabe", () => { const c = base(); c.bookings.push({ id: "b", staffId: "val", day: "Martes", start: H(9), duration: 30, zone: "Zona Norte", status: "confirmada" }); expect(ev(c, "val", "Vacunación", H(10)).status).toBe("AVAILABLE"); });
  it("cita anterior lejana → no alcanza a llegar", () => { const c = base(); c.bookings.push({ id: "b", staffId: "val", day: "Martes", start: H(9), duration: 30, zone: "Zona Sur", status: "confirmada" }); expect(ev(c, "val", "Vacunación", H(9, 45)).constraints[0]?.code).toBe("TRAVEL_BEFORE"); });
  it("cita posterior incompatible", () => { const c = base(); c.bookings.push({ id: "b", staffId: "val", day: "Martes", start: H(10), duration: 30, zone: "Zona Sur", status: "confirmada" }); expect(ev(c, "val", "Vacunación", H(9)).constraints[0]?.code).toBe("TRAVEL_AFTER"); });
  it("visita protegida no se pisa", () => { const c = base(); c.bookings.push({ id: "b", staffId: "val", day: "Martes", start: H(9), duration: 40, zone: "Zona Norte", status: "confirmada", protected: true }); expect(ev(c, "val", "Vacunación", H(9)).constraints[0]?.code).toBe("PROTECTED"); });
  it("reserva provisional vigente bloquea; expirada no", () => { const c = base(); c.holds.push({ holdId: "h", staffId: "val", day: "Martes", start: H(9), end: H(9, 30), expiresAt: 2000, status: "ACTIVE" }); expect(ev(c, "val", "Vacunación", H(9)).status).toBe("PROVISIONALLY_HELD"); c.now = 3000; expect(ev(c, "val", "Vacunación", H(9)).status).toBe("AVAILABLE"); });
  it("agenda desactualizada", () => { const c = base(); c.dataAgeMinutes = 120; expect(ev(c, "val", "Vacunación", H(9)).status).toBe("STALE_DATA"); });
  it("sobrecarga exige aprobación", () => { const c = base(); for (let i = 0; i < 7; i++) c.bookings.push({ id: "b" + i, staffId: "val", day: "Martes", start: H(8) + i * 0, duration: 0, zone: "Zona Norte", status: "confirmada" }); c.bookings.push({ id: "big", staffId: "val", day: "Martes", start: H(13), duration: 400, zone: "Zona Norte", status: "cancelada" }); c.bookings.push({ id: "long", staffId: "val", day: "Martes", start: H(0), duration: 420, zone: "Zona Norte", status: "confirmada" }); const r = ev(c, "val", "Vacunación", H(9)); expect(r.status).toBe("POSSIBLE"); expect(r.requiresApproval).toBe(true); });
  it("sin turnos registrados → requiere coordinación, no disponible", () => { const c = base(); c.shifts = []; expect(ev(c, "val", "Vacunación", H(9)).status).toBe("COORDINATION_REQUIRED"); });
  it("búsqueda ordena la mejor opción y explica los descartes", () => { const r = searchAvailability(base(), { service: "Vacunación", zone: "Zona Norte", day: "Martes", from: H(8), to: H(10), step: 30 }); expect(r.options[0]?.professionalId).toBe("val"); expect(r.blocked.find((b) => b.staffId === "cam")?.reasons[0]).toMatch(/no está habilitado/); });
  it("slot ocupado entre búsqueda y confirmación deja de ofrecerse", () => { const c = base(); const first = ev(c, "val", "Vacunación", H(9)); expect(first.status).toBe("AVAILABLE"); c.bookings.push({ id: "x", staffId: "val", day: "Martes", start: H(9), duration: 30, zone: "Zona Norte", status: "pendiente" }); expect(ev(c, "val", "Vacunación", H(9)).status).toBe("BUSY"); });
  it("fecha del sistema → día de semana", () => expect(weekdayOf("Mar, 28 de enero")).toBe("Martes"));
});

describe("reemplazos y capacidad", () => {
  it("propone reemplazo habilitado sin mover nada y pide aprobación (WF-T06/T11)", () => { const c = base(); c.bookings.push({ id: "v", staffId: "val", day: "Martes", start: H(9), duration: 30, zone: "Zona Norte", status: "confirmada", label: "Vacunación" }); const r = recommendReplacements(c, "val", "Martes"); expect(r.affected[0]?.candidates[0]?.professionalId).toBe("mar"); expect(r.requiresApproval).toBe(true); expect(c.bookings[0]?.staffId).toBe("val"); });
  it("sin reemplazo habilitado → requiere cambio (WF-T07)", () => { const c = base(); c.staff = c.staff.filter((s) => s.id !== "mar"); c.bookings.push({ id: "v", staffId: "val", day: "Martes", start: H(9), duration: 30, zone: "Zona Norte", status: "confirmada", label: "Vacunación" }); expect(recommendReplacements(c, "val", "Martes").needChange).toBe(1); });
  it("dos visitas a la misma hora no se asignan al mismo reemplazo", () => { const c = base(); c.staff.push({ id: "x", name: "X", role: "Veterinario", zone: "Zona Norte", skills: [] }); c.shifts.push({ staffId: "x", day: "Martes", start: H(8), end: H(16), kind: "turno" }); c.bookings.push({ id: "a", staffId: "val", day: "Martes", start: H(9), duration: 30, zone: "Zona Norte", status: "confirmada", label: "Vacunación" }, { id: "b", staffId: "val", day: "Martes", start: H(9), duration: 30, zone: "Zona Norte", status: "confirmada", label: "Vacunación" }); const r = recommendReplacements(c, "val", "Martes"); expect(r.affected[0]?.candidates[0]?.professionalId).not.toBe(r.affected[1]?.candidates[0]?.professionalId); });
  it("capacidad: horas libres descuentan descanso y citas; zona sin turno es brecha", () => { const c = base(); c.bookings.push({ id: "s", staffId: "", day: "Martes", start: H(9), duration: 45, zone: "Zona Sur", status: "pendiente" }); const k = analyzeCapacity(c, "Martes"); expect(k.rows.find((r) => r.staffId === "val")?.shiftMinutes).toBe(H(8) - 30); expect(k.gaps).toContain("Zona Sur"); expect(k.unassigned).toBe(1); });
  it("sin turnos: capacidad desconocida, no cero", () => { const c = base(); c.shifts = []; expect(analyzeCapacity(c, "Martes").recommendations.join(" ")).toMatch(/desconocida/); });
});

describe("recurrencias, lista de espera y reservas", () => {
  it("plan no aprobado no genera ocurrencias (RC-T01)", () => expect(generateOccurrences({ id: "p", approved: false, frequency: "diaria", startIndex: 0, count: 3, time: H(9) })).toHaveLength(0));
  it("diaria y días específicos (RC-T03/T04)", () => { expect(generateOccurrences({ id: "p", approved: true, frequency: "diaria", startIndex: 0, count: 3, time: H(9) }).map((o) => o.day)).toEqual(["Lunes", "Martes", "Miércoles"]); expect(generateOccurrences({ id: "p", approved: true, frequency: "dias", days: ["Lunes", "Jueves"], startIndex: 0, count: 3, time: H(9) }).map((o) => o.day)).toEqual(["Lunes", "Jueves", "Lunes"]); });
  it("ventana clínica protegida (RC-T06)", () => { const [o] = generateOccurrences({ id: "p", approved: true, frequency: "diaria", startIndex: 0, count: 1, time: H(8), window: { from: H(7), to: H(9) } }); expect(withinWindow(o!, H(10))).toBe(false); });
  it("lista de espera: elegibilidad y sin doble asignación (WL-T02/T06/T07)", () => {
    const v = { id: "v", service: "Vacunación", zone: "Zona Norte", day: "Martes", start: H(9) };
    const list = [{ id: "a", service: "Vacunación", zone: "Zona Norte", status: "activa", createdAt: 2 }, { id: "b", service: "Vacunación", zone: "Zona Norte", status: "activa", createdAt: 1 }, { id: "c", service: "Curación", zone: "Zona Norte", status: "activa", createdAt: 0 }];
    expect(eligibleFor(v, list, [], 0).map((e) => e.id)).toEqual(["b", "a"]);
    const o1 = { entryId: "b", vacancyId: "v", status: "PENDING_OKVET" as const, expiresAt: 100 }; const o2 = { entryId: "a", vacancyId: "v", status: "OFFERED" as const, expiresAt: 100 };
    expect(acceptOffer(o2, [o1, o2], 50).ok).toBe(false);
    expect(acceptOffer({ ...o2, vacancyId: "w" }, [], 50).status).toBe("PENDING_OKVET");
    expect(acceptOffer(o2, [], 200).status).toBe("EXPIRED");
  });
  it("reserva provisional: expira por reloj del servidor y nunca se muestra como confirmada (QB-T10/T13)", () => {
    const h = { holdId: "h", staffId: "val", day: "Martes", start: 0, end: 30, expiresAt: 100, status: "ACTIVE" as const };
    expect(effectiveHold(h, 150)).toBe("EXPIRED"); expect(canMoveHold("EXPIRED", "CONVERTED")).toBe(false);
    expect(bookingLabel({ hasOkvetRef: false, hold: "ACTIVE", requested: true })).toBe("RESERVA PROVISIONAL");
    expect(bookingLabel({ hasOkvetRef: false, requested: true })).toBe("SOLICITUD REGISTRADA");
    expect(bookingLabel({ hasOkvetRef: true, requested: true })).toBe("CONFIRMADA");
  });
});

import { parseDayLabel, monthGrid, dayLabelOf } from "@/features/scheduling/domain";
describe("calendario mensual", () => {
  it("lee la fecha de una cita", () => { expect(parseDayLabel("Mar, 28 de enero")).toEqual({ day: 28, month: 0 }); expect(parseDayLabel("sin fecha")).toBeNull(); });
  it("noviembre 2026 empieza en domingo y tiene 30 días", () => { const g = monthGrid(2026, 10); expect(g[0]![6]).toBe(1); expect(g.flat().filter(Boolean).length).toBe(30); });
  it("formatea la fecha como las citas", () => { expect(dayLabelOf(new Date(2026, 10, 20))).toBe("Vie, 20 de noviembre"); });
});
