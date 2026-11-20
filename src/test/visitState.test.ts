import { describe, it, expect } from "vitest";
import { checkTransition, canTransition } from "@/lib/vf/visitState";

describe("estados de cita", () => {
  it("no confirma sin referencia OKVET", () => {
    expect(checkTransition("pendiente", "confirmada")).toMatch(/OKVET/);
    expect(checkTransition("pendiente", "confirmada", "  ")).toMatch(/OKVET/);
  });
  it("confirma con referencia OKVET", () => {
    expect(checkTransition("pendiente_okvet", "confirmada", "OK-123")).toBeNull();
  });
  it("una visita finalizada o cancelada no cambia", () => {
    expect(canTransition("finalizada", "pendiente")).toBe(false);
    expect(canTransition("cancelada", "confirmada")).toBe(false);
  });
  it("una visita en curso solo puede finalizar", () => {
    expect(canTransition("en_curso", "cancelada")).toBe(false);
    expect(canTransition("en_curso", "finalizada")).toBe(true);
  });
});
