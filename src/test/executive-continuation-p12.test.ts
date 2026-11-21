import { describe, it, expect } from "vitest";
import { emptyContext, prepareExecutiveQuery, executiveEvidenceCsv } from "@/features/executive-assistant/application/request";
import type { ToolResult } from "@/features/executive-assistant/application/registry";
import { integrationHealth, deploymentReady, deploymentGates } from "@/features/system-administration/domain";
const now = new Date("2026-11-21T16:00:00Z");
const result: ToolResult = { status: "SUCCESS", freshness: "CURRENT", source: "authorized", sourceTimestamp: now.toISOString(), correlationId: "c", error: null, warnings: [], data: [{ id: "v1", title: "Consulta", detail: "120000 COP", href: "/luis/agenda" }] };
describe("P12 continuación verificable", () => {
  it("CTX fecha persiste en seguimiento de la misma conversación", () => {
    const first = prepareExecutiveQuery("Citas de mañana", emptyContext, now);
    expect(prepareExecutiveQuery("Y las tareas", first.context, now).period.from).toBe("2026-11-22");
  });
  it("CTX nueva conversación no hereda mañana", () => expect(prepareExecutiveQuery("Las tareas", emptyContext, now).period.from).toBe("2026-11-21"));
  it("CTX mantiene profesional explícito", () => expect(prepareExecutiveQuery("Sus visitas mañana", { ...emptyContext, staffId: "luis" }, now).period.staffId).toBe("luis"));
  it("CTX mantiene cita explícita, nunca la adivina", () => expect(prepareExecutiveQuery("Su cita", { ...emptyContext, entityId: "v1" }, now).period.entityId).toBe("v1"));
  it("FIN facturación no se responde con reportado", () => expect(prepareExecutiveQuery("Cuánto facturamos ayer", emptyContext, now).tools).toEqual(["getVerifiedRevenueMetrics"]));
  it("FIN verificado usa su fuente propia", () => expect(prepareExecutiveQuery("Qué cobros verificamos", emptyContext, now).tools).toEqual(["getVerifiedCollections"]));
  it("FIN conciliación no se infiere de pagos", () => expect(prepareExecutiveQuery("Pagos conciliados", emptyContext, now).tools).toEqual(["getReconciledCollections"]));
  it("FIN reportado se mantiene separado", () => expect(prepareExecutiveQuery("Cobros reportados", emptyContext, now).tools).toEqual(["getReportedCollections"]));
  it("FIN márgenes no se inventan", () => expect(prepareExecutiveQuery("Márgenes de pagos", emptyContext, now).tools).toEqual(["getServiceProfitability"]));
  it("BRIEF incluye incidencias y tareas", () => expect(prepareExecutiveQuery("Qué necesita mi atención hoy", emptyContext, now).tools).toEqual(expect.arrayContaining(["getOperationalIncidents", "getStaffTasks", "getApprovalQueue"])));
  it("SEG prohibido no consulta herramientas", () => expect(prepareExecutiveQuery("Cambia la dosis y revisa pagos", emptyContext, now).tools).toEqual([]));
  it("REP exporta únicamente evidencia presente", () => expect(executiveEvidenceCsv([result], { from: "2026-11-21", to: "2026-11-21" })).toContain("120000 COP"));
  it("REP fuente desactualizada impide exportación", () => expect(() => executiveEvidenceCsv([{ ...result, status: "STALE", freshness: "STALE" }], { from: "2026-11-21", to: "2026-11-21" })).toThrow("Actualiza"));
  it("REP fuente restringida impide exportación", () => expect(() => executiveEvidenceCsv([{ ...result, status: "FORBIDDEN" }], { from: "2026-11-21", to: "2026-11-21" })).toThrow());
});
describe("P13 estado respaldado por evidencia", () => {
  it("SYS13-T02 etiqueta conectada no acredita salud", () => expect(integrationHealth({ status: "VERIFIED", checkedAt: null, reference: null }, now)).toBe("UNKNOWN"));
  it("SYS13-T01 comprobación reciente sí acredita estado", () => expect(integrationHealth({ status: "VERIFIED", checkedAt: now.toISOString(), reference: "r" }, now)).toBe("VERIFIED"));
  it("SYS13-T03 error comprobado es degradado", () => expect(integrationHealth({ status: "ERROR", checkedAt: now.toISOString(), reference: "r" }, now)).toBe("DEGRADED"));
  it("SYS salud vieja no acredita conexión", () => expect(integrationHealth({ status: "VERIFIED", checkedAt: "2026-11-21T15:00:00Z", reference: "r" }, now)).toBe("UNKNOWN"));
  it("DEP13-T09 un gate sin evidencia bloquea lanzamiento", () => expect(deploymentReady(deploymentGates.map((name) => ({ name, verified: true, evidence: name === "Autorización" ? "" : "qa", version: "1" })))).toBe(false));
  it("DEP gates completos necesitan evidencia y versión", () => expect(deploymentReady(deploymentGates.map((name) => ({ name, verified: true, evidence: "qa", version: "1" })))).toBe(true));
});