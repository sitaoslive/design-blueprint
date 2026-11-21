import { describe, it, expect } from "vitest";
import {
  bogotaDate,
  validPeriod,
  inFinancePeriod,
  knownTotal,
  collectionState,
  duplicateReferences,
} from "@/features/finance/domain/presentation";

describe("P09 lote A — fuentes sin efectos financieros", () => {
  it("convierte el límite UTC al día de Bogotá", () =>
    expect(bogotaDate("2026-11-21T04:59:59Z")).toBe("2026-11-20"));
  it("incluye el inicio del día de Bogotá", () =>
    expect(inFinancePeriod("2026-11-21T05:00:00Z", { from: "2026-11-21", to: "2026-11-21" })).toBe(
      true,
    ));
  it("excluye el instante anterior del periodo", () =>
    expect(inFinancePeriod("2026-11-21T04:59:59Z", { from: "2026-11-21", to: "2026-11-21" })).toBe(
      false,
    ));
  it("no inventa año para fechas históricas incompletas", () =>
    expect(bogotaDate("21 nov")).toBeNull());
  it("rechaza una fecha de calendario imposible", () =>
    expect(validPeriod({ from: "2026-02-30", to: "2026-03-01" })).toBe(false));
  it("rechaza periodos invertidos", () =>
    expect(validPeriod({ from: "2026-11-22", to: "2026-11-21" })).toBe(false));
  it("no interpreta timestamps sin zona", () =>
    expect(bogotaDate("2026-11-21T00:00:00")).toBeNull());
  it("importe ausente produce total desconocido", () =>
    expect(knownTotal(["120000", null])).toBeNull());
  it("importe inválido no causa cero ni excepción", () =>
    expect(knownTotal(["120000", "pendiente"])).toBeNull());
  it("sumas conservan centésimas COP", () =>
    expect(knownTotal(["120000.10", "0.20"])).toBe(12000030n));
  it("borrador nunca acredita un pago verificado", () =>
    expect(collectionState("finance_payment_report", "verificado")).toBe("REPORTED"));
  it("el procedimiento de campo separa verificado de informado", () =>
    expect(collectionState("cobro_campo", "verificado")).toBe("VERIFIED"));
  it("ninguna etiqueta histórica inventa conciliación", () =>
    expect(collectionState("cobro_campo", "conciliado")).toBe("UNKNOWN"));
  it("señala duplicados sin suprimir reportes", () =>
    expect([
      ...duplicateReferences([
        { id: "r1", data: { reference: " REF-1 " } },
        { id: "r2", data: { reference: "REF-1" } },
      ]),
    ]).toEqual(["r1", "r2"]));
  it("efectivo sin referencia no genera falsos duplicados", () =>
    expect(
      duplicateReferences([
        { id: "r1", data: {} },
        { id: "r2", data: {} },
      ]).size,
    ).toBe(0));
});
