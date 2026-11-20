import { describe, expect, it, beforeEach } from "vitest";
import { validateAbsence, autonomyIndex } from "@/lib/vf/rules";
import { formatCOP } from "@/lib/vf/format";
import { staff } from "@/lib/vf/data";
import { actions, getVF, resetVF } from "@/lib/vf/store";

const ok = { coordinator: "Camila", replacements: ["valeria"], limits: "", from: "2026-02-01", to: "2026-02-10" };

describe("Modo ausencia (EXEC-005)", () => {
  it("activates only with a coordinator and replacement", () => {
    expect(validateAbsence(ok, staff)).toEqual([]);
    expect(validateAbsence({ ...ok, replacements: [] }, staff).length).toBe(1);
    expect(validateAbsence({ ...ok, coordinator: "" }, staff).length).toBe(1);
  });
  it("rejects an absent replacement", () => {
    expect(validateAbsence({ ...ok, replacements: ["sofia"] }, staff)).toContain("Un reemplazo seleccionado está ausente.");
  });
  it("rejects an end date before start", () => {
    expect(validateAbsence({ ...ok, to: "2026-01-01" }, staff).length).toBe(1);
  });
});

describe("Formatos y métricas", () => {
  it("formats COP with dot thousands", () => expect(formatCOP(4280000)).toBe("$ 4.280.000 COP"));
  it("autonomy index is a percentage", () => {
    expect(autonomyIndex(18, 22)).toBe(82);
    expect(autonomyIndex(1, 0)).toBe(0);
  });
});

describe("Flujo de visita", () => {
  beforeEach(() => resetVF());
  it("finishing a visit marks it finalizada and audits it", () => {
    actions.advanceStep("v1", "finalizada");
    expect(getVF().visits.find((v) => v.id === "v1")?.status).toBe("finalizada");
    expect(getVF().audit.length).toBe(1);
  });
  it("assigning the unassigned visit confirms it", () => {
    actions.assignVisit("v3", "valeria");
    expect(getVF().visits.find((v) => v.id === "v3")?.status).toBe("pendiente_okvet");
  });
});
