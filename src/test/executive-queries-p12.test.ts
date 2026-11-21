import { describe, it, expect } from "vitest";
import { queryExecutiveTool, executiveSnapshot, type ExecutiveSources } from "@/features/executive-assistant/application/queries";
const loadedAt = "2026-11-21T15:00:00Z";
const source = <T,>(rows: T[]) => ({ rows, error: "", loadedAt, owner: "luis", reload: async () => {} });
const fixture: ExecutiveSources = { actorId: "luis", roles: ["luis"], demo: false,
  visits: source([{ id: "v1", pet_id: "p1", staff_id: "luis", service: "Consulta", date: "2026-11-21", operational_on: null, time: "10:00", status: "confirmada", zone: "Norte" }, { id: "v2", pet_id: "p1", staff_id: "luis", service: "Consulta", date: "2026-11-21", operational_on: null, time: "11:00", status: "finalizada", zone: "Norte" }]),
  staff: source([{ id: "s1", name: "Dr. QA", role: "Veterinario", status: "disponible", user_id: "u1", load: 50 }]),
  tasks: source([{ id: "t1", title: "Revisar solicitud", done: false, staff_id: "s1" }]), approvals: source([{ id: "a1", title: "Revisión", detail: "Privado", kind: "reorganizacion", status: "pendiente" }]),
  incidents: source([{ id: "i1", title: "Incidencia", status: "abierta", severity: "alta" }]), requests: source([{ id: "r1", pet: "Luna", status: "nueva", at: "2026-11-21" }]),
  referrals: source([{ referral_id: "rf1", state: "DRAFT", version: 1, updated_at: loadedAt }]), reminders: source([{ id: "rr1", title: "Revisar informe", status: "pendiente", due_at: loadedAt, assignee: "Luis" }]),
  courses: source([{ id: "c1", title: "Formación", progress: 20, required: true }]), quality: source([{ id: "q1", kind: "complaint", state: "OPEN", version: 1, updated_at: loadedAt }]),
  payments: source([{ id: "p1", client_id: null, client: "QA", concept: "Consulta", amount: "120000", status: "pendiente", date: "2026-11-21" }]),
  records: source([{ id: "rc1", kind: "cobro_campo", ref_id: "v1", title: "Reporte", detail: "Efectivo", scope: "staff", status: "informado", data: { amount: 60000 }, created_at: loadedAt }]),
};
const period = { from: "2026-11-21", to: "2026-11-21" };
describe("P12 consultas sobre fuentes existentes", () => {
  it("TOOL12-T01 agenda conserva cita confirmada vs realizada", () => expect(queryExecutiveTool("getTodayAppointments", fixture, period, new Date(loadedAt)).data.map(r => r.detail)).toEqual(["confirmada · Norte · 2026-11-21", "finalizada · Norte · 2026-11-21"]));
  it("TOOL12-T02 equipo no inventa disponibilidad futura", () => expect(queryExecutiveTool("getTeamAvailability", fixture, period, new Date(loadedAt)).status).toBe("PARTIAL"));
  it("TOOL12-T03 no inventa tiempos de ruta", () => expect(queryExecutiveTool("getTravelSummary", fixture, period, new Date(loadedAt)).status).toBe("UNAVAILABLE"));
  it("TOOL12-T04 cobro informado mantiene 60000 COP", () => expect(queryExecutiveTool("getReportedCollections", fixture, period, new Date(loadedAt)).data[0]?.detail).toBe("$ 60.000 COP"));
  it("TOOL12-T05 remisión devuelve versión autoritativa", () => expect(queryExecutiveTool("getOpenReferrals", fixture, period, new Date(loadedAt)).data[0]?.detail).toBe("DRAFT · Versión 1"));
  it("TOOL12-T06 calidad no devuelve datos privados completos", () => expect(queryExecutiveTool("getServiceQualityCases", fixture, period, new Date(loadedAt)).data[0]).toEqual({ id: "q1", title: "complaint · q1", detail: "OPEN · Versión 1", href: "/direccion/calidad" }));
  it("TOOL12-T07 formación viene de cursos", () => expect(queryExecutiveTool("getTrainingOverview", fixture, period, new Date(loadedAt)).data[0]?.title).toBe("Formación"));
  it("TOOL12-T08 no entrega datos al auxiliar", () => expect(queryExecutiveTool("getTodayAppointments", { ...fixture, roles: ["auxiliar"] }, period, new Date(loadedAt)).status).toBe("FORBIDDEN"));
  it("TOOL12-T09 desconocida no se ejecuta", () => expect(queryExecutiveTool("deleteAllAppointments", fixture, period, new Date(loadedAt)).data).toEqual([]));
  it("TOOL12-T11 resultados viejos no son actuales", () => expect(queryExecutiveTool("getTodayAppointments", fixture, period, new Date("2026-11-21T15:03:00Z")).status).toBe("STALE"));
  it("TOOL12-T12 error de lectura no entrega filas viejas", () => expect(queryExecutiveTool("getTodayAppointments", { ...fixture, visits: { ...fixture.visits, error: "denied" } }, period, new Date(loadedAt)).data).toEqual([]));
  it("TOOL12-T14 evidencia conserva fuente y momento de consulta", () => expect(queryExecutiveTool("getTodayAppointments", fixture, period, new Date(loadedAt)).sourceTimestamp).toBe(loadedAt));
  it("AI12-T13 demo no se presenta como dato real", () => expect(queryExecutiveTool("getTodayAppointments", { ...fixture, demo: true }, period, new Date(loadedAt)).source).toContain("DEMO sintético"));
  it("REP12-T07 reporte no se convierte en verificado", () => { const result = executiveSnapshot(fixture, period); expect(result.reported).toBe(6000000n); expect(result.verified).toBe(0n); });
  it("REP12-T08 visitas programadas no son realizadas", () => { const result = executiveSnapshot(fixture, period); expect(result.scheduled).toBe(2); expect(result.performed).toBe(1); });
  it("REP12-T06 no crea utilidad ni horas recuperadas", () => { const result = executiveSnapshot(fixture, period); expect(result.officialRevenue).toBeNull(); expect(result.savedHours).toBeNull(); });
});