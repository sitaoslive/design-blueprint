import { describe, it, expect } from "vitest";
import {
  money,
  amountText,
  quote,
  outstanding,
  allocatePayment,
  reconciliationCandidate,
  visitCost,
  timeCost,
  supplyCost,
  contribution,
  stockValue,
  replenish,
  batchState,
  customerValue,
  scenario,
  csvCell,
  type PaymentReport,
  type CostPart,
} from "@/features/finance/domain";
const price = {
  id: "home",
  service: "Visita a domicilio",
  base: "120000",
  currency: "COP" as const,
  validFrom: "2026-11-20",
  validTo: "2026-12-31",
  state: "ACTIVE" as const,
  version: 1,
  source: "Tarifa aprobada por usuario",
};
const payment: PaymentReport = {
  id: "p1",
  chargeId: "c1",
  amount: "60000",
  currency: "COP",
  state: "VERIFIED",
  reference: "r1",
  date: "2026-11-21",
  clientId: "u1",
};
const cost: CostPart[] = ["professional", "travel", "supplies", "other"].map((c, i) => ({
  id: `x${i}`,
  component: c as CostPart["component"],
  amount: String([40000, 10000, 5000, 0][i]),
  source: "Referencia QA",
  estimated: false,
  version: "v1",
}));
describe("Prompt 09 — precisión y estados financieros", () => {
  it("COST9-T19 sumas repetidas 0.10 + 0.20 exactas", () =>
    expect(amountText(money("0.10") + money("0.20"))).toBe("0.30"));
  it("COST9-T19 importes grandes mantienen precisión", () =>
    expect(amountText(money("9999999999999999.99") + money("0.01"))).toBe("10000000000000000.00"));
  it("FIN9-T03 visita a domicilio cotiza tarifa aprobada de 120000 COP", () =>
    expect(quote(price, 1, "2026-11-21").total).toBe(12000000n));
  it("FIN9-T03 conserva versión de tarifa aplicada", () =>
    expect(quote(price, 1, "2026-11-21").priceVersion).toBe(1));
  it("FIN9-T05 rechaza descuento no autorizado", () =>
    expect(() => quote(price, 1, "2026-11-21", [], { amount: "10000", approved: false })).toThrow(
      "Descuento no autorizado",
    ));
  it("FIN9-T04 aplica descuento autorizado", () =>
    expect(quote(price, 1, "2026-11-21", [], { amount: "10000", approved: true }).total).toBe(
      11000000n,
    ));
  it("no inventa impuestos no configurados", () =>
    expect(() =>
      quote(price, 1, "2026-11-21", [], { amount: "0", approved: true }, [
        { basisPoints: 1900, approved: false },
      ]),
    ).toThrow("Impuesto"));
  it("FIN9-T20 reportado no reduce saldo verificado", () =>
    expect(outstanding("120000", [{ ...payment, state: "REPORTED" }])).toBe(12000000n));
  it("FIN9-T10 pago parcial conserva saldo", () =>
    expect(outstanding("120000", [payment])).toBe(6000000n));
  it("FIN9-T11 dos pagos aplicados cubren cargo", () =>
    expect(outstanding("120000", [payment, { ...payment, id: "p2" }])).toBe(0n));
  it("FIN9-T12 distribuye pago sin duplicar cargos", () => {
    const r = allocatePayment("120000", [
      { id: "c1", balance: "80000" },
      { id: "c2", balance: "50000" },
    ]);
    expect(r.allocations.map((x) => x.amount)).toEqual([8000000n, 4000000n]);
    expect(r.remaining).toBe(0n);
  });
  it("FIN9-T13 referencia duplicada requiere revisión", () =>
    expect(
      reconciliationCandidate(
        payment,
        { id: "c1", amount: "60000", reference: "r1", currency: "COP", clientId: "u1" },
        [{ ...payment, id: "p2" }],
      ),
    ).toBe("DUPLICATE_CANDIDATE"));
  it("FIN9-T14 coincidencia exacta no ejecuta conciliación", () =>
    expect(
      reconciliationCandidate(
        payment,
        { id: "c1", amount: "60000", reference: "r1", currency: "COP", clientId: "u1" },
        [],
      ),
    ).toBe("EXACT_MATCH"));
  it("FIN9-T15 diferencia de importe señalada", () =>
    expect(
      reconciliationCandidate(
        payment,
        { id: "c1", amount: "120000", reference: "r1", currency: "COP", clientId: "u1" },
        [],
      ),
    ).toBe("AMOUNT_MISMATCH"));
  it("FIN9-T09 comprobante reportado no verifica recepción", () =>
    expect(
      reconciliationCandidate(
        { ...payment, state: "REPORTED" },
        { id: "c1", amount: "60000", reference: "r1", currency: "COP", clientId: "u1" },
        [],
      ),
    ).toBe("REQUIRES_REVIEW"));
  it("COST9-T01 costo horario aplicado al tiempo registrado", () =>
    expect(timeCost(30, "40000")).toBe(2000000n));
  it("COST9-T03 insumos valorizados por cantidad", () =>
    expect(supplyCost(2, "5000")).toBe(1000000n));
  it("COST9-T04 costos completos suman 55000 COP", () =>
    expect(visitCost(cost).total).toBe(5500000n));
  it("COST9-T05 costo esencial faltante no es cero", () => {
    expect(visitCost(cost.slice(0, 2)).total).toBeNull();
    expect(visitCost(cost.slice(0, 2)).status).toBe("INCOMPLETE");
  });
  it("COST9-T06 distingue costo estimado", () =>
    expect(visitCost(cost.map((x) => ({ ...x, estimated: true }))).status).toBe("ESTIMATED"));
  it("COST9-T07 no imputa costo duplicado", () =>
    expect(() => visitCost([...cost, ...cost])).toThrow("duplicado"));
  it("COST9-T12 margen negativo se conserva", () =>
    expect(contribution("10000", 2000000n).margin).toBe(-1000000n));
  it("COST9-T13 ingreso cero no produce porcentaje inválido", () =>
    expect(contribution("0", 100n).percentage).toBeNull());
  it("COST9-T14 ingresos desconocidos no inventan utilidad", () =>
    expect(contribution(null, 100n).margin).toBeNull());
  it("INV9-T03 valorización exige método", () => expect(stockValue(5, "1000", null)).toBeNull());
  it("INV9-T02 valor de lote con costo conocido", () =>
    expect(stockValue(5, "1000", "costo_identificado")).toBe(500000n));
  it("INV9-T04 y T05 reservas restan al disponible no al físico", () =>
    expect(replenish(10, 3, 8)).toEqual({
      available: 7,
      suggested: 1,
      reason: "Disponible por debajo del mínimo",
    }));
  it("INV9-T09 lote vencido no se recomienda", () =>
    expect(batchState("2026-11-20", "2026-11-21")).toBe("EXPIRED"));
  it("INV9-T10 lote bloqueado permanece restringido", () =>
    expect(batchState("2027-01-01", "2026-11-21", true)).toBe("QUARANTINED"));
  it("CV9-T04 ticket promedio calculado de cargos incluidos", () =>
    expect(
      customerValue(
        [
          { id: "c1", amount: "120000", clientId: "u1" },
          { id: "c2", amount: "80000", clientId: "u1" },
        ],
        [payment],
        "u1",
        2,
        1,
      ).averageTicket,
    ).toBe(10000000n));
  it("CV9-T07 cliente sin visitas no es recurrente", () =>
    expect(customerValue([], [], "u1", 0, 2).segment).toBe("sin_visitas"));
  it("CV9-T15 deduplica cargos por identificador", () =>
    expect(
      customerValue(
        [
          { id: "c1", amount: "120000", clientId: "u1" },
          { id: "c1", amount: "120000", clientId: "u1" },
        ],
        [],
        "u1",
        1,
        1,
      ).revenue,
    ).toBe(12000000n));
  it("escenario no modifica ingresos realizados", () =>
    expect(scenario("120000", "55000", 1000, 2000)).toEqual({
      projectedRevenue: 13200000n,
      projectedCost: 6600000n,
      margin: 6600000n,
      hypothetical: true,
    }));
  it("exportación neutraliza fórmulas de hoja de cálculo", () =>
    expect(csvCell('=IMPORTXML("url")')).toBe('"\'=IMPORTXML(""url"")"'));
});
