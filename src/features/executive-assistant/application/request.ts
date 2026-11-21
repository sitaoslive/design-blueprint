import { classifyExecutiveIntent, classifyActionRisk, normalize, resolveContextDate } from "../domain";
import { csvCell } from "@/features/finance/domain";
import type { ToolResult } from "./registry";

export type ConversationContext = { date: string | null; staffId: string; entityId: string };
export const emptyContext: ConversationContext = { date: null, staffId: "", entityId: "" };
export function prepareExecutiveQuery(text: string, context: ConversationContext, now = new Date()) {
  const intents = classifyExecutiveIntent(text);
  const t = normalize(text);
  const date = /hoy|manana|ayer|\d{4}-\d{2}-\d{2}/.test(t)
    ? resolveContextDate(text, now)
    : context.date ?? resolveContextDate(text, now);
  const tools: string[] = [];
  for (const intent of intents) {
    if (intent === "FINANCIAL_QUERY") {
      tools.push(/factur/.test(t) ? "getVerifiedRevenueMetrics"
        : /concili/.test(t) ? "getReconciledCollections"
        : /verific|realmente/.test(t) ? "getVerifiedCollections"
        : /margen|rentab/.test(t) ? "getServiceProfitability"
        : /pendiente|por cobrar|saldo/.test(t) ? "getOutstandingReceivables" : "getReportedCollections");
    } else if (intent === "REPORT_REQUEST" || intent === "OPERATIONAL_QUERY") {
      tools.push("getTodayAppointments", "getApprovalQueue", "getOperationalIncidents", "getStaffTasks", "getPendingCustomerCommitments");
    } else {
      const map: Partial<Record<typeof intent, string>> = {
        SCHEDULING_QUERY: "getTodayAppointments", AVAILABILITY_QUERY: "getAvailableProfessionals",
        STAFF_QUERY: /mas visitas|carga/.test(t) ? "getStaffWorkload" : "getTeamAvailability",
        ROUTE_QUERY: "getTravelSummary", CUSTOMER_QUERY: "getAuthorizedCustomerContext",
        QUALITY_QUERY: "getServiceQualityCases", REFERRAL_QUERY: "getOpenReferrals",
        TRAINING_QUERY: "getTrainingOverview", TASK_QUERY: "getStaffTasks",
        FOLLOW_UP_REQUEST: "getPendingCustomerCommitments", CONFIGURATION_QUERY: "getAIIntegrationStatus",
      };
      const tool = map[intent];
      if (tool) tools.push(tool);
    }
  }
  const risk = classifyActionRisk(text);
  return { intents, risk, tools: risk === 5 ? [] : [...new Set(tools)],
    period: { from: date, to: date, staffId: context.staffId, entityId: context.entityId },
    context: { ...context, date } };
}

/** Export only visibly authorized, fresh query evidence; this is not an official report. */
export function executiveEvidenceCsv(results: ToolResult[], period: { from: string; to: string }) {
  if (!results.length || results.some((r) => !["SUCCESS", "PARTIAL", "NO_DATA"].includes(r.status) || r.freshness !== "CURRENT"))
    throw new Error("Actualiza las fuentes antes de exportar; hay consultas incompletas o desactualizadas");
  const rows = results.flatMap((r) => r.data.map((d) => [period.from, period.to, "America/Bogota", r.source,
    r.sourceTimestamp ?? "", r.status, d.id, d.title, d.detail, r.warnings.join("; ")]));
  return "\uFEFF" + [["Desde", "Hasta", "Zona horaria", "Fuente", "Consulta", "Estado", "ID", "Título", "Detalle", "Limitaciones"], ...rows]
    .map((row) => row.map(csvCell).join(",")).join("\r\n");
}