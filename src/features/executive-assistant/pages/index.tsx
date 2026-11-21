import type { ReactNode } from "react";
import { useVF } from "@/lib/vf/store";
import { Empty } from "@/components/vf/ui";
import { canUseExecutive } from "../domain";
import { executiveScreen } from "../catalog";
import { ExecutiveChat } from "../components/ExecutiveChat";
import {
  ExecutiveDraftCenter,
  ExecutiveDecisionCenter,
  ExecutiveReports,
  ExecutiveAbsence,
  ExecutiveAutonomy,
  ExecutiveResults,
  ExecutiveUsage,
} from "./ExecutivePages";
export function ExecutiveEntry({ path }: { path: string }) {
  const roles = useVF((s) => s.roles);
  const uid = useVF((s) => s.userId);
  if (!canUseExecutive(roles, uid))
    return <Empty title="Asistente privada: acceso no autorizado" />;
  if (path === "/direccion/asistente" || path === "/luis/asistente") return <ExecutiveChat />;
  if (path === "/direccion/propuestas") return <ExecutiveDraftCenter kind="proposal" />;
  if (path === "/direccion/delegaciones") return <ExecutiveDraftCenter kind="delegation" />;
  if (path === "/direccion/memoria-decisiones") return <ExecutiveDraftCenter kind="memory" />;
  if (path === "/direccion/aprobaciones") return <ExecutiveDecisionCenter mode="approvals" />;
  if (path === "/direccion/excepciones") return <ExecutiveDecisionCenter mode="exceptions" />;
  if (path === "/direccion/decisiones") return <ExecutiveDecisionCenter mode="decisions" />;
  if (path.startsWith("/direccion/reportes"))
    return <ExecutiveReports kind={path.split("/")[3] ?? "builder"} />;
  if (path === "/direccion/modo-ausencia") return <ExecutiveAbsence />;
  if (path === "/direccion/autonomia") return <ExecutiveAutonomy />;
  if (path === "/direccion/asistente/auditoria") return <ExecutiveResults audit />;
  if (path === "/direccion/asistente/resultados") return <ExecutiveResults />;
  if (path === "/admin/ia-direccion") return <ExecutiveUsage />;
  return <Empty title="Sección no disponible" />;
}
export function executivePage(path: string): ReactNode | null {
  return executiveScreen(path) ? <ExecutiveEntry path={path.replace(/\/$/, "")} /> : null;
}
