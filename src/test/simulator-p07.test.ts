import { describe, it, expect } from "vitest";
import { takeSnapshot, checkFreshness, hardViolations, generateAlternatives, scoreAlternatives, buildPlan, reconcile } from "@/features/simulator/domain";
const staff = [{ id: "a", name: "Ana", zone: "Zona Norte", status: "disponible", load: 40 }, { id: "b", name: "Beto", zone: "Zona Norte", status: "ausente", load: 10 }, { id: "c", name: "Caro", zone: "Zona Norte", status: "disponible", load: 20 }];
const visits = [{ id: "v1", staffId: "a", zone: "Zona Norte", time: "09:00", status: "confirmada", service: "Control", petId: "luna" }, { id: "v2", staffId: "a", zone: "Zona Norte", time: "17:30", status: "confirmada", service: "Vacuna", petId: "max" }];
describe("Prompt 07 simulador", () => {
  it("foto vigente si nada cambió", () => expect(checkFreshness(takeSnapshot(visits, staff), visits, staff, ["v1"]).status).toBe("CURRENT"));
  it("cita tocada que cambió deja el escenario vencido", () => { const s = takeSnapshot(visits, staff); expect(checkFreshness(s, [{ ...visits[0]!, time: "10:00" }, visits[1]!], staff, ["v1"]).status).toBe("STALE"); });
  it("cambio en cita no tocada es parcial", () => { const s = takeSnapshot(visits, staff); expect(checkFreshness(s, [visits[0]!, { ...visits[1]!, time: "16:00" }], staff, ["v1"]).status).toBe("PARTIALLY_STALE"); });
  it("asignar a alguien ausente o después de 18:00 es restricción dura", () => {
    expect(hardViolations({ changes: [{ visitId: "v1", field: "staffId", before: "a", after: "b", label: "x" }], impact: [], warnings: [], summary: "" }, staff)[0]).toContain("ausente");
    expect(hardViolations({ changes: [{ visitId: "v2", field: "time", before: "17:30", after: "18:30", label: "y" }], impact: [], warnings: [], summary: "" }, staff).length).toBe(1);
  });
  it("alternativa con restricción dura no es ejecutable ni recomendada", () => {
    const alts = generateAlternatives("SIM-02", { staff: "a", minutes: 60 }, visits, staff);
    const r = scoreAlternatives(alts, "cliente", visits, staff);
    const base = r.scored.find((s) => s.alt.key === "base")!; expect(base.executable).toBe(false); expect(r.best).not.toBe("base");
  });
  it("plan con un paso omitido queda parcial", () => { const p = buildPlan("s1", { changes: [{ visitId: "v1", field: "time", before: "09:00", after: "09:30", label: "" }, { visitId: "v2", field: "time", before: "17:30", after: "17:45", label: "" }], impact: [], warnings: [], summary: "" });
    expect(p[0]!.key).toBe("sim:s1:v1:time"); expect(reconcile([{ ...p[0]!, status: "APLICADO" }, { ...p[1]!, status: "OMITIDO" }]).outcome).toBe("PARCIAL"); });
});
