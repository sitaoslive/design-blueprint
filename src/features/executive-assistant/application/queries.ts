import { useVF } from "@/lib/vf/store";
import {
  useFinanceRows,
  type Charge,
  type RecordRow,
} from "@/features/finance/application/sources";
import { knownTotal, collectionState, bogotaDate } from "@/features/finance/domain/presentation";
import { moneyLabel } from "@/features/finance/domain";
import { TOOL_REGISTRY, type ToolResult } from "./registry";
import { canUseExecutive, inExecutivePeriod, evaluateToolPermission } from "../domain";
import { validPeriod } from "@/features/finance/domain/presentation";

export type VisitRow = {
  id: string;
  pet_id: string;
  staff_id: string | null;
  service: string;
  date: string;
  operational_on: string | null;
  time: string;
  status: string;
  zone: string;
};
export type StaffRow = {
  id: string;
  name: string;
  role: string;
  status: string;
  user_id: string | null;
  load: number;
};
export type TaskRow = { id: string; title: string; done: boolean; staff_id: string | null };
export type ApprovalRow = {
  id: string;
  title: string;
  detail: string;
  status: string;
  kind: string;
};
export type IncidentRow = { id: string; title: string; status: string; severity: string };
export type RequestRow = { id: string; pet: string; status: string; at: string };
export type ReferralRow = {
  referral_id: string;
  state: string;
  version: number;
  updated_at: string;
};
export type ReminderRow = {
  id: string;
  title: string;
  status: string;
  due_at: string;
  assignee: string;
};
export type CourseRow = { id: string; title: string; progress: number; required: boolean };
export type QualityRow = {
  id: string;
  kind: string;
  state: string;
  version: number;
  updated_at: string;
};
export function useExecutiveSources() {
  const actorId = useVF((s) => s.userId);
  const roles = useVF((s) => s.roles);
  const visits = useFinanceRows<VisitRow>("visits");
  const staff = useFinanceRows<StaffRow>("staff_members");
  const tasks = useFinanceRows<TaskRow>("tasks");
  const approvals = useFinanceRows<ApprovalRow>("approvals");
  const incidents = useFinanceRows<IncidentRow>("incidents");
  const requests = useFinanceRows<RequestRow>("service_requests");
  const referrals = useFinanceRows<ReferralRow>("referral_cases");
  const reminders = useFinanceRows<ReminderRow>("referral_reminders");
  const courses = useFinanceRows<CourseRow>("courses");
  const quality = useFinanceRows<QualityRow>("quality_items");
  const payments = useFinanceRows<Charge>("payments");
  const records = useFinanceRows<RecordRow>("records");
  return {
    actorId,
    roles,
    demo: Boolean(actorId?.startsWith("demo-")),
    visits,
    staff,
    tasks,
    approvals,
    incidents,
    requests,
    referrals,
    reminders,
    courses,
    quality,
    payments,
    records,
  };
}
export type ExecutiveSources = ReturnType<typeof useExecutiveSources>;
export const destinations: Record<string, string> = {
  visits: "/luis/agenda",
  staff_members: "/luis/equipo",
  tasks: "/equipo/tareas",
  approvals: "/direccion/aprobaciones",
  incidents: "/luis/incidencias",
  service_requests: "/luis/solicitudes",
  referral_cases: "/operaciones/remisiones",
  referral_reminders: "/luis/recordatorios",
  courses: "/luis/academia",
  quality_items: "/direccion/calidad",
  payments: "/direccion/finanzas/cobros",
  records: "/direccion/finanzas/cobros",
};
export function queryExecutiveTool(
  toolId: string,
  sources: ExecutiveSources,
  period: { from: string; to: string; staffId?: string; entityId?: string },
  now = new Date(),
  origin: "user" | "document" | "result" = "user",
): ToolResult {
  const result: ToolResult = {
    status: "UNAVAILABLE",
    data: [],
    source: "",
    sourceTimestamp: null,
    freshness: "UNKNOWN",
    warnings: [],
    correlationId: crypto.randomUUID(),
    error: null,
  };
  if (evaluateToolPermission(sources.roles, sources.actorId, origin))
    return {
      ...result,
      status: "FORBIDDEN",
      error: "Acceso privado de Dirección; los documentos no conceden permisos",
    };
  const tool = TOOL_REGISTRY.find((t) => t.toolId === toolId);
  if (!tool) return { ...result, error: "TOOL_NOT_AVAILABLE: herramienta no registrada" };
  if (!validPeriod(period)) return { ...result, status: "ERROR", error: "Periodo inválido" };
  if (toolId === "getAppointmentDetails" && !period.entityId)
    return { ...result, error: "Selecciona una cita; no se eligió automáticamente" };
  if (["getRecurringVisitSummary", "getPendingSpecialistConfirmations", "getOutstandingReports", "getPendingProfessionalReviews"].includes(toolId))
    return { ...result, error: "Consulta especializada pendiente de adaptador; no se devuelve una lista genérica como respuesta" };
  if (!tool.available)
    return {
      ...result,
      source: tool.name,
      error: "Herramienta protegida o fuente completa no disponible",
      warnings: ["Consulta el módulo de origen; no se simuló una respuesta real"],
    };
  const table = tool.sourceSystem;
  const data: ToolResult["data"] = [];
  let source: { rows: unknown[] | null; error: string; loadedAt: string | null };
  switch (table) {
    case "visits": {
      source = sources.visits;
      if (toolId === "getTravelSummary" || toolId === "prepareRouteSimulation" || toolId === "getActiveRoutes") {
        // Travel times and distances are never invented: without a connected map provider the
        // summary stays unavailable instead of reporting estimated kilometres or minutes.
        return {
          ...result,
          source: tool.name,
          status: "UNAVAILABLE",
          error: "Tiempos y distancias de ruta no disponibles: el proveedor de mapas no está conectado",
          warnings: ["No se estimaron kilómetros ni minutos de viaje"],
        };
      }
      for (const v of sources.visits.rows ?? [])
        if (inExecutivePeriod(v.operational_on ?? v.date, period) && (!period.staffId || v.staff_id === period.staffId) && (!period.entityId || v.id === period.entityId))
          data.push({
            id: v.id,
            title: `${v.time} · ${v.service}`,
            detail: `${v.status} · ${v.zone} · ${bogotaDate(v.operational_on ?? v.date)}`,
            href: `/luis/cita/${encodeURIComponent(v.id)}`,
          });
      if ((sources.visits.rows ?? []).some((v) => !bogotaDate(v.operational_on ?? v.date)))
        result.warnings.push("Visitas sin fecha completa excluidas; no se inventó su día");
      break;
    }
    case "staff_members":
      source = sources.staff;
      if (toolId === "getAvailableProfessionals") {
        const dayVisits = (sources.visits.rows ?? []).filter((v) => inExecutivePeriod(v.operational_on ?? v.date, period) && v.status !== "cancelada");
        for (const s of sources.staff.rows ?? []) {
          const sVisits = dayVisits.filter((v) => v.staff_id === s.id);
          const isAux = s.role.toLowerCase().includes("auxiliar") || s.id === "camila";
          const bookedHours = sVisits.map((v) => v.time);
          const slots = ["08:30", "10:30", "14:00", "16:00"];
          const free = slots.filter((slot) => !bookedHours.some((bh) => bh.startsWith(slot.slice(0, 2))));
          data.push({
            id: s.id,
            title: `${s.name} · ${isAux ? "Auxiliar de Veterinaria" : "Médico Veterinario"}`,
            detail: free.length
              ? `🟢 Disponible (${free.length} franjas libres: ${free.join(", ")}) · Citas del día: ${sVisits.length}`
              : `🔴 Agenda completa (${sVisits.length} visitas asignadas)`,
            href: "/luis/agenda",
          });
        }
        break;
      }
      if (toolId === "getStaffWorkload") {
        if (sources.visits.error || !sources.visits.rows) return { ...result, status: "ERROR", error: sources.visits.error || "Agenda aún no disponible" };
        if (!sources.visits.loadedAt || now.getTime() - Date.parse(sources.visits.loadedAt) > 120000) return { ...result, status: "STALE", error: "Actualiza la agenda antes de comparar cargas" };
      }
      for (const s of sources.staff.rows ?? [])
        if (!period.staffId || s.id === period.staffId)
        data.push({
          id: s.id,
          title: s.name,
          detail: toolId === "getStaffWorkload"
            ? `${(sources.visits.rows ?? []).filter((v) => v.staff_id === s.id && inExecutivePeriod(v.operational_on ?? v.date, period) && v.status !== "cancelada").length} visitas registradas en el periodo · No mide duración ni desplazamientos`
            : `${s.role} · Estado registrado: ${s.status} · Carga registrada ${s.load}%`,
          href: "/luis/equipo",
        });
      result.warnings.push(
        "Estado actual no demuestra disponibilidad futura; consulta el buscador de disponibilidad",
      );
      break;
    case "tasks":
      source = sources.tasks;
      for (const t of sources.tasks.rows ?? [])
        if (!t.done && (!period.staffId || t.staff_id === period.staffId))
          data.push({
            id: t.id,
            title: t.title,
            detail: `Pendiente · Responsable: ${t.staff_id ?? "No registrado"}`,
            href: "/direccion/delegaciones",
          });
      result.warnings.push("Sin fechas históricas suficientes para atribuir tareas a este periodo");
      break;
    case "approvals":
      source = sources.approvals;
      for (const a of sources.approvals.rows ?? [])
        if (a.status === "pendiente")
          data.push({
            id: a.id,
            title: a.title,
            detail: `Pendiente · ${a.kind}`,
            href: "/direccion/aprobaciones",
          });
      result.warnings.push(
        "Registros históricos sin versión/expiración ejecutiva: no se pueden aprobar desde el chat",
      );
      break;
    case "incidents":
      source = sources.incidents;
      for (const i of sources.incidents.rows ?? [])
        if (i.status !== "cerrada")
          data.push({
            id: i.id,
            title: i.title,
            detail: `${i.status} · severidad registrada ${i.severity}`,
            href: "/luis/incidencias",
          });
      break;
    case "service_requests":
      source = sources.requests;
      for (const r of sources.requests.rows ?? [])
        if (r.status !== "resuelta")
          data.push({
            id: r.id,
            title: `Solicitud ${r.id}`,
            detail: `${r.status} · Paciente: ${r.pet}`,
            href: "/luis/solicitudes",
          });
      result.warnings.push(
        "Pendientes actuales; fecha de recepción original puede estar incompleta",
      );
      break;
    case "referral_cases":
      source = sources.referrals;
      for (const r of sources.referrals.rows ?? [])
        if (!["CLOSED", "CANCELLED"].includes(r.state))
          data.push({
            id: r.referral_id,
            title: `Remisión ${r.referral_id}`,
            detail: `${r.state} · Versión ${r.version}`,
            href: "/operaciones/remisiones",
          });
      break;
    case "referral_reminders":
      source = sources.reminders;
      for (const r of sources.reminders.rows ?? [])
        if (r.status === "pendiente")
          data.push({
            id: r.id,
            title: r.title,
            detail: `${r.assignee} · Vence ${bogotaDate(r.due_at) ?? "Fecha incompleta"}`,
            href: "/luis/recordatorios",
          });
      break;
    case "courses":
      source = sources.courses;
      for (const c of sources.courses.rows ?? [])
        data.push({
          id: c.id,
          title: c.title,
          detail: `${c.progress}% registrado · ${c.required ? "Obligatorio" : "Opcional"}`,
          href: "/luis/academia",
        });
      result.warnings.push(
        "Progreso registrado no demuestra lectura vigente de todos los procedimientos",
      );
      break;
    case "quality_items":
      source = sources.quality;
      for (const q of sources.quality.rows ?? [])
        if (!["CLOSED", "RESOLVED", "ARCHIVED", "CANCELLED"].includes(q.state))
        data.push({
          id: q.id,
          title: `${q.kind} · ${q.id}`,
          detail: `${q.state} · Versión ${q.version}`,
          href: "/direccion/calidad",
        });
      break;
    case "payments":
      source = sources.payments;
      for (const p of sources.payments.rows ?? [])
        if (p.status !== "pagado" && inExecutivePeriod(p.date, period))
          data.push({
            id: p.id,
            title: p.concept,
            detail: `${moneyLabel(knownTotal([p.amount]))} · Estado histórico ${p.status}`,
            href: `/direccion/finanzas/cobros/${encodeURIComponent(p.id)}`,
          });
      result.warnings.push("Saldo histórico de cargos, no saldo bancario conciliado");
      break;
    case "records": {
      source = sources.records;
      const reported = (sources.records.rows ?? []).filter(
        (r) =>
          collectionState(r.kind, r.status) === (toolId === "getVerifiedCollections" ? "VERIFIED" : "REPORTED") &&
          inExecutivePeriod(r.created_at, period),
      );
      data.push({
        id: "reported",
        title: toolId === "getVerifiedCollections" ? "Cobros verificados internamente" : "Cobros reportados",
        detail: moneyLabel(knownTotal(reported.map((r) => r.data["amount"]))),
        href: "/direccion/finanzas/cobros",
      });
      result.warnings.push(toolId === "getVerifiedCollections" ? "Verificación interna no demuestra conciliación bancaria, facturación ni aplicación a un cargo" : "Reportado no significa verificado, conciliado ni aplicado a un cargo");
      break;
    }
    default:
      return result;
  }
  if (source.error) return { ...result, status: "ERROR", source: table, error: source.error };
  if (!source.rows) return { ...result, source: table, error: "Fuentes todavía no disponibles" };
  const stale = !source.loadedAt || now.getTime() - Date.parse(source.loadedAt) > 120000;
  return {
    ...result,
    status: stale
      ? "STALE"
      : !data.length
        ? "NO_DATA"
        : result.warnings.length
          ? "PARTIAL"
          : "SUCCESS",
    data,
    source: `${sources.demo ? "DEMO sintético" : "Lovable Cloud"} · ${table}`,
    sourceTimestamp: source.loadedAt,
    freshness: stale ? "STALE" : "CURRENT",
  };
}
export function executiveSnapshot(sources: ExecutiveSources, period: { from: string; to: string }) {
  const visits = (sources.visits.rows ?? []).filter((v) =>
    inExecutivePeriod(v.operational_on ?? v.date, period),
  );
  return {
    period,
    scheduled: sources.visits.rows && !sources.visits.error ? visits.length : null,
    performed:
      sources.visits.rows && !sources.visits.error
        ? visits.filter((v) => v.status === "finalizada").length
        : null,
    pendingApprovals:
      sources.approvals.rows && !sources.approvals.error
        ? sources.approvals.rows.filter((a) => a.status === "pendiente").length
        : null,
    pendingRequests:
      sources.requests.rows && !sources.requests.error
        ? sources.requests.rows.filter((r) => r.status !== "resuelta").length
        : null,
    reported:
      sources.records.rows && !sources.records.error
        ? knownTotal(
            sources.records.rows
              .filter(
                (r) =>
                  inExecutivePeriod(r.created_at, period) &&
                  collectionState(r.kind, r.status) === "REPORTED",
              )
              .map((r) => r.data["amount"]),
          )
        : null,
    verified:
      sources.records.rows && !sources.records.error
        ? knownTotal(
            sources.records.rows
              .filter(
                (r) =>
                  inExecutivePeriod(r.created_at, period) &&
                  collectionState(r.kind, r.status) === "VERIFIED",
              )
              .map((r) => r.data["amount"]),
          )
        : null,
    officialRevenue: null,
    autonomy: null,
    savedHours: null,
    allowed: canUseExecutive(sources.roles, sources.actorId),
  };
}
