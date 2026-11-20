import { describe, it, expect } from "vitest";
import { simulate } from "@/lib/vf/sim";
const staff = [{ id: "a", name: "Dra. A", zone: "Zona Norte", status: "disponible", load: 40, role: "Veterinario" }, { id: "b", name: "Dr. B", zone: "Zona Norte", status: "disponible", load: 20, role: "Veterinario" }, { id: "x", name: "Aux X", zone: "Zona Norte", status: "disponible", load: 10, role: "Auxiliar" }];
const v = (id: string, staffId: string | null, time: string, service = "Control preventivo") => ({ id, staffId, zone: "Zona Norte", time, status: "confirmada", service, date: "2026-11-24" });
const visits = [v("1", "a", "09:00"), v("2", "a", "10:00"), v("3", "b", "11:00")];
describe("Prompt 07 escenarios avanzados", () => {
  it("ADV-01 nunca asigna a un auxiliar un servicio clínico", () => { const r = simulate("ADV-01", { staff: "a", day: "2026-11-24" } as never, visits, staff as never); expect(r.changes.every((c) => c.after === "b")).toBe(true); });
  it("ADV-01 respeta turnos: sin turno ese día no hay reemplazo", () => { const r = simulate("ADV-01", { staff: "a", day: "2026-11-24", shifts: [{ staff_id: "b", day: "lunes" }] } as never, visits, staff as never); expect(r.changes).toHaveLength(0); expect(r.warnings.length).toBe(2); });
  it("ADV-09 puede no tener solución", () => { const r = simulate("ADV-09", { staffList: ["a", "b"], day: "2026-11-24" } as never, visits, staff as never); expect(r.changes).toHaveLength(0); expect(r.summary).toContain("sin solución"); });
  it("ADV-02 sin regla de flexibilidad no mueve nada", () => expect(simulate("ADV-02", { day: "2026-11-24", hours: 1 } as never, visits, staff as never).changes).toHaveLength(0));
  it("ADV-07 bloqueado sin prioridad profesional", () => expect(simulate("ADV-07", { zone: "Zona Norte", priority: false } as never, visits, staff as never).summary).toContain("Bloqueado"));
  it("ADV-10 es estimación", () => expect(simulate("ADV-10", { zone: "Zona Norte", count: 20 } as never, visits, staff as never).warnings[0]).toContain("ESTIMACIÓN"));
  it("ADV-05 no inventa respaldos", () => expect(simulate("ADV-05", {} as never, visits, staff as never).impact[0]!.after).toBe(0));
});
