import { describe, it, expect } from "vitest";
import { simulate, canTransition, SIM_TYPES } from "@/lib/vf/sim";

const staff = [{ id: "a", name: "A", zone: "Norte", status: "disponible", load: 50 }, { id: "b", name: "B", zone: "Norte", status: "disponible", load: 20 }];
const visits = [{ id: "v1", staffId: "a", zone: "Norte", time: "09:00", status: "confirmada", service: "Control" }, { id: "v2", staffId: "a", zone: "Norte", time: "10:00", status: "finalizada", service: "Vacuna" }];

describe("simulator", () => {
  it("has ten types SIM-01..SIM-10", () => expect(SIM_TYPES.map((t) => t.id)).toEqual(Array.from({ length: 10 }, (_, i) => `SIM-${String(i + 1).padStart(2, "0")}`)));
  it("absence reassigns only open visits", () => { const r = simulate("SIM-01", { staff: "a" }, visits, staff); expect(r.changes).toHaveLength(1); expect(r.changes[0]?.after).toBe("b"); });
  it("delay shifts times", () => expect(simulate("SIM-02", { staff: "a", minutes: 45 }, visits, staff).changes[0]?.after).toBe("09:45"));
  it("cannot execute before approval", () => { expect(canTransition("simulado", "ejecutado")).toBe(false); expect(canTransition("propuesto", "ejecutado")).toBe(false); expect(canTransition("aprobado", "ejecutado")).toBe(true); });
});
