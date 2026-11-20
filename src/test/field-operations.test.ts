import { describe, it, expect } from "vitest";
import { applyExecEvent, nextEvents, detectMissingSupplies, validateInventoryMovement, calculateAvailableStock, prepareInventoryConsumption, evaluateDayClose, prepareHandover, acceptHandover, isTransferred, evaluateWorkload, enqueue, markResult, purgeExpired, type Handover } from "@/features/field-operations/domain";

const today = new Date("2026-11-20");
describe("ejecución de visita", () => {
  const c = (state: Parameters<typeof applyExecEvent>[0]["state"], actor: "Veterinario" | "Auxiliar" | "coordinador" = "Veterinario", v = 1) => ({ state, actor, version: v, expectedVersion: 1, prepDone: true });
  it("veterinario inicia atención tras llegar", () => expect(applyExecEvent(c("ARRIVED"), "SERVICE_STARTED")).toEqual({ ok: true, to: "IN_SERVICE", version: 2 }));
  it("auxiliar no puede iniciar atención", () => expect(applyExecEvent(c("ARRIVED", "Auxiliar"), "SERVICE_STARTED").ok).toBe(false));
  it("no se salta la llegada", () => expect(applyExecEvent(c("EN_ROUTE"), "SERVICE_STARTED").ok).toBe(false));
  it("versión distinta bloquea", () => expect(applyExecEvent(c("ARRIVED", "Veterinario", 2), "SERVICE_STARTED").ok).toBe(false));
  it("no realizada exige motivo", () => expect(applyExecEvent(c("EN_ROUTE"), "NOT_PERFORMED").ok).toBe(false));
  it("solo coordinación verifica cierre", () => { expect(nextEvents("ADMINISTRATIVE_REVIEW", "Veterinario")).toEqual([]); expect(nextEvents("ADMINISTRATIVE_REVIEW", "coordinador")).toContain("CLOSURE_VERIFIED"); });
});
describe("inventario", () => {
  const vac = { id: "vac", name: "Vacuna", stock: 5, min: 2, lot: "L1", expires: "2027-01-01", reserved: 3 };
  it("disponible descuenta reservado", () => expect(calculateAvailableStock(vac)).toBe(2));
  it("detecta faltante y lote vencido", () => { expect(detectMissingSupplies([vac], [{ itemId: "vac", qty: 3 }], today)[0]?.reason).toBe("Faltan 1 (disponibles 2)"); expect(detectMissingSupplies([{ ...vac, expires: "2026-01-01" }], [{ itemId: "vac", qty: 1 }], today)[0]?.reason).toContain("vencido"); });
  it("movimiento sin motivo o sin stock se rechaza", () => { expect(validateInventoryMovement(vac, -1, "")).not.toBeNull(); expect(validateInventoryMovement(vac, -3, "uso")).toBe("No hay existencias suficientes"); });
  it("consumo con clave idempotente estable", () => expect(prepareInventoryConsumption("v1", [vac], [{ itemId: "vac", qty: 1 }], today).idempotencyKey).toBe("consume:v1:vacx1"));
});
describe("cierre y traspaso", () => {
  it("pendiente crítico sin responsable bloquea", () => { expect(evaluateDayClose([{ id: "1", kind: "incidencia", title: "x", critical: true }]).canClose).toBe(false); expect(evaluateDayClose([{ id: "2", kind: "tarea", title: "y", critical: false }]).canClose).toBe(true); });
  it("solo quien recibe acepta y entonces queda transferido", () => {
    const h = prepareHandover("a", "b", [{ id: "i", title: "t", critical: true }, { id: "i", title: "t", critical: true }], "") as Handover;
    expect(h.items.length).toBe(1); expect(acceptHandover(h, "a", true)).toBe("Solo la persona que recibe puede aceptar");
    expect(isTransferred(h, "i")).toBe(false); expect(isTransferred(acceptHandover(h, "b", true) as Handover, "i")).toBe(true);
  });
});
describe("bienestar", () => {
  const w = { staffId: "s", shiftMinutes: 480, serviceMinutes: 300, travelMinutes: 100, visits: 6, hasBreak: false, helpRequests: 0, reassignments: 0, absent: false };
  it("turno largo sin descanso se señala", () => expect(evaluateWorkload(w).signals).toContain("Sin descanso en turno de 6 h o más"));
  it("ruta que no cabe es sobrecarga", () => expect(evaluateWorkload({ ...w, travelMinutes: 200 }).level).toBe("sobrecarga"));
});
describe("sin conexión", () => {
  it("acciones oficiales se bloquean sin internet", () => expect(enqueue([], { key: "k", kind: "confirmar_llegada", payload: {}, capturedAt: 0 }, false).error).toBeTruthy());
  it("nota sin internet queda como borrador y no se duplica", () => { const a = { key: "k", kind: "nota_administrativa" as const, payload: {}, capturedAt: 0 }; const q = enqueue(enqueue([], a, false).queue, a, false).queue; expect(q.length).toBe(1); expect(q[0]?.state).toBe("ACTION_DRAFTED"); });
  it("enviado solo tras acuse y se purga", () => { const q = markResult([{ key: "k", kind: "checklist", payload: {}, capturedAt: 0, state: "SYNC_PENDING", attempts: 0 }], "k", true, 5); expect(q[0]?.acceptedAt).toBe(5); expect(purgeExpired(q, 6).length).toBe(0); });
});
import { validateFieldCollection } from "@/features/field-operations/domain";
describe("cobros informados en campo", () => {
  it("efectivo válido", () => expect(validateFieldCollection({ visitId: "v1", amount: 120000, method: "Efectivo" })).toBeNull());
  it("transferencia exige referencia", () => expect(validateFieldCollection({ visitId: "v1", amount: 120000, method: "Transferencia / Nequi" })).toContain("referencia"));
  it("datáfono no es forma aceptada", () => expect(validateFieldCollection({ visitId: "v1", amount: 120000, method: "Datáfono" })).toBe("Forma de pago no aceptada"));
});
describe("salida sin preparación", () => {
  it("no se puede salir directo desde asignada sin preparación", () => expect(applyExecEvent({ state: "ASSIGNED", version: 1, expectedVersion: 1, actor: "Auxiliar", prepDone: false }, "TRAVEL_STARTED").ok).toBe(false));
});
