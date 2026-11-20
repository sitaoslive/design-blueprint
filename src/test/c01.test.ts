import { describe, it, expect } from "vitest";
import { SCREENS } from "@/lib/vf/screens";
import { c01Page, calendarConflicts } from "@/components/vf/screens/c01";

describe("PROMPT 01C coverage", () => {
  const c01 = SCREENS.filter((s) => s.id.startsWith("C01-"));
  it("registers the 01C screens", () => { expect(c01.length).toBeGreaterThanOrEqual(120); });
  it("every 01C app screen resolves to a real page", () => {
    const tech = ["/sin-conexion", "/servicio-no-disponible", "/mantenimiento", "/error", "/no-encontrado", "/actualizacion-requerida"];
    const missing = c01.filter((s) => !tech.includes(s.path)).filter((s) => !c01Page(s.path.replace(/:id/g, "x1"))).map((s) => s.path);
    expect(missing).toEqual([]);
  });
});
describe("calendar conflicts", () => {
  it("flags double booking and absent professional", () => {
    const out = calendarConflicts([{ id: "a", staffId: "s1", date: "d", time: "10:00" }, { id: "b", staffId: "s1", date: "d", time: "10:00" }, { id: "c", staffId: "s2", date: "d", time: "11:00" }], new Set(["s2"]));
    expect(out.map((o) => o.id)).toEqual(["b", "c"]);
  });
});
