import { describe, expect, it } from "vitest";
import { canManageQuality, canPersistDraft, canOpenQualityPath } from "@/features/customer-experience/application/access";

describe("Quality presentation matches existing role-area permissions", () => {
  for (const role of ["luis", "administrador"]) {
    it(`${role} opens quality, survey management and customer previews`, () => {
      expect(canManageQuality([role])).toBe(true);
      expect(canPersistDraft([role])).toBe(true);
      expect(canOpenQualityPath("/admin/encuestas", [role])).toBe(true);
      expect(canOpenQualityPath("/app/encuestas/example", [role])).toBe(true);
    });
  }
  for (const role of ["coordinador", "recepcion"]) {
    it(`${role} opens complaints and loyalty, not reserved surveys or customer accounts`, () => {
      expect(canOpenQualityPath("/operaciones/quejas", [role])).toBe(true);
      expect(canOpenQualityPath("/operaciones/fidelizacion", [role])).toBe(true);
      expect(canOpenQualityPath("/admin/encuestas", [role])).toBe(false);
      expect(canOpenQualityPath("/app/notificaciones/preferencias", [role])).toBe(false);
      expect(canOpenQualityPath("/direccion/calidad", [role])).toBe(false);
      expect(canPersistDraft([role])).toBe(false);
    });
  }
  it("cliente can open their survey and help, not operational complaints or loyalty", () => {
    expect(canOpenQualityPath("/app/encuestas/example", ["cliente"])).toBe(true);
    expect(canOpenQualityPath("/app/ayuda", ["cliente"])).toBe(true);
    expect(canOpenQualityPath("/operaciones/quejas", ["cliente"])).toBe(false);
    expect(canOpenQualityPath("/operaciones/fidelizacion", ["cliente"])).toBe(false);
    expect(canPersistDraft(["cliente"])).toBe(false);
  });
  for (const role of ["auxiliar", "veterinario", "especialista", "cuidador", "finanzas", "soporte", "consultor"]) {
    it(`${role} does not inherit quality or customer permissions`, () => {
      for (const path of ["/operaciones/quejas", "/operaciones/fidelizacion", "/admin/encuestas", "/app/encuestas/example"]) {
        expect(canOpenQualityPath(path, [role])).toBe(false);
      }
      expect(canPersistDraft([role])).toBe(false);
    });
  }
  it("no roles grants no quality access", () => {
    expect(canManageQuality([])).toBe(false);
    expect(canOpenQualityPath("/app/ayuda", [])).toBe(false);
  });
});