import { describe, expect, it } from "vitest";
import { DurationPolicySchema, resolveDuration, visitTimer, downstreamImpact, freshEta, trackingVisible, dispatchAccess } from "@/features/live-dispatch/domain";
import { requestDispatchOperation, DISPATCH_CONTRACTS } from "@/features/live-dispatch/application/contracts";
const policy = DurationPolicySchema.parse({ name: "Control", category: "CONTROL", duration: 30, minimum: 15, maximum: 120, increment: 5, preparation: 10, administration: 5, reason: "Propuesta de prueba sintética" });
const now = Date.parse("2026-11-21T19:38:00Z");
describe("P15A duración y tiempo", () => {
  it("DUR15-T15 separa servicio, preparación y administración", () => expect(resolveDuration(policy, 45, true, "Más tiempo aprobado", false)).toEqual({ serviceMinutes: 45, preparationMinutes: 10, administrationMinutes: 5, occupiedMinutes: 60 }));
  it("DUR15-T06 rechaza override sin permiso", () => expect(() => resolveDuration(policy, 45, false, "Motivo completo", false)).toThrow());
  it("DUR15-T08 no cambia una cita confirmada", () => expect(() => resolveDuration(policy, 30, true, "Motivo completo", true)).toThrow());
  it("DUR15-T05 valida rango e incremento", () => { expect(() => resolveDuration(policy, 31, true, "Motivo completo", false)).toThrow(); expect(() => resolveDuration(policy, 125, true, "Motivo completo", false)).toThrow(); });
  it("VIS15-T02/T03 reconstruye 38 transcurridos y 7 restantes", () => expect(visitTimer({ actualStartAt: "2026-11-21T19:00:00Z", actualEndAt: null, plannedMinutes: 45 }, now)).toEqual({ elapsed: 38, remaining: 7, overrun: 0 }));
  it("VIS15-T04 no finaliza al superar duración", () => expect(visitTimer({ actualStartAt: "2026-11-21T19:00:00Z", actualEndAt: null, plannedMinutes: 30 }, now)).toEqual({ elapsed: 38, remaining: 0, overrun: 8 }));
  it("VIS15-T07 tiempo finalizado deja de crecer", () => expect(visitTimer({ actualStartAt: "2026-11-21T19:00:00Z", actualEndAt: "2026-11-21T19:20:00Z", plannedMinutes: 30 }, now).elapsed).toBe(20));
  it("Sin duración aprobada no inventa restante", () => expect(visitTimer({ actualStartAt: "2026-11-21T19:00:00Z", actualEndAt: null, plannedMinutes: null }, now).remaining).toBeNull());
  it("Rechaza timestamps inválidos o futuros", () => { expect(visitTimer({ actualStartAt: "bad", actualEndAt: null, plannedMinutes: 30 }, now).elapsed).toBeNull(); expect(visitTimer({ actualStartAt: "2026-11-22T19:00:00Z", actualEndAt: null, plannedMinutes: 30 }, now).elapsed).toBeNull(); });
});
describe("P15A estimaciones y privacidad", () => {
  it("ETA15-T05/T06 calcula cascada sin mover citas", () => { const b = { id: "B", scheduledAt: Date.parse("2026-11-21T19:30:00Z"), travelMinutes: 15, occupiedMinutes: 30 }; const c = { id: "C", scheduledAt: Date.parse("2026-11-21T20:10:00Z"), travelMinutes: 15, occupiedMinutes: 30 }; expect(downstreamImpact(Date.parse("2026-11-21T19:20:00Z"), [b, c]).map((x) => x.delayMinutes)).toEqual([5, 10]); expect(b.scheduledAt).toBe(Date.parse("2026-11-21T19:30:00Z")); });
  it("No sustituye viaje desconocido por distancia o cero", () => expect(downstreamImpact(now, [{ id: "B", scheduledAt: now, travelMinutes: null, occupiedMinutes: 30 }])[0]?.delayMinutes).toBeNull());
  it("ETA15-T02 oculta ETA antiguo", () => expect(freshEta({ predictedArrivalAt: "2026-11-21T19:45:00Z", calculatedAt: "2026-11-21T19:00:00Z", source: "ROUTING_PROVIDER", confidence: "HIGH" }, now, 120000)).toBeNull());
  const visibility = { ownVisit: true, assigned: true, enRoute: true, consent: true, onShift: true, expiresAt: "2026-11-21T20:00:00Z", observedAt: "2026-11-21T19:37:00Z", maximumAgeMs: 120000 };
  it("ETA15-T12/T13/T20 no muestra ubicación ajena, expirada o fuera de jornada", () => { expect(trackingVisible(visibility, now)).toBe(true); for (const key of ["ownVisit", "assigned", "enRoute", "consent", "onShift"] as const) expect(trackingVisible({ ...visibility, [key]: false }, now)).toBe(false); expect(trackingVisible({ ...visibility, expiresAt: "2026-11-21T19:00:00Z" }, now)).toBe(false); });
  it("Ubicación antigua no es en vivo", () => expect(trackingVisible({ ...visibility, observedAt: "2026-11-21T19:00:00Z" }, now)).toBe(false));
  it("VIS15-T08 mantiene auxiliar asignado y finanzas fuera de despacho", () => { expect(dispatchAccess(["auxiliar"], "uid")).toBe("OWN_ASSIGNMENTS"); expect(dispatchAccess(["finanzas"], "uid")).toBe("NONE"); });
  for (const operation of DISPATCH_CONTRACTS) it(`${operation} falla cerrado sin autoridad`, async () => expect(requestDispatchOperation({ operation, entityId: "visit", expectedVersion: 1, correlationId: "e374a1b5-301b-47e9-bb50-b095a6364ec4", idempotencyKey: "e374a1b5-301b-47e9-bb50-b095a6364ec4" })).rejects.toThrow("BACKEND_UNAVAILABLE"));
});