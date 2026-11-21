import { useVF } from "@/lib/vf/store";
import { PermissionDenied, ErrorState, LoadingSkeleton } from "@/components/vf/shared/states";
import { qualityScreen } from "../catalog";
import { useQualityWorkspace, QualityWorkspaceProvider } from "../application/service";
import { canOpenQualityPath } from "../application/access";
import {
  QualityDashboard,
  QualityConversations,
  QualityPatterns,
  Improvements,
  Escalations,
} from "./Quality";
import { ComplaintList, ComplaintCreate, ComplaintDetail } from "./Complaints";
import { Surveys, SurveyBuilder, CustomerSurvey } from "./Surveys";
import {
  LoyaltyHome,
  FamilyExperience,
  Eligibility,
  Recovery,
  Reviews,
  Preventive,
  Attribution,
  SensitiveContext,
  BrandStandards,
  Education,
  CustomerHelp,
} from "./Loyalty";
import { AssistantQuality } from "./AssistantQuality";
import { InternalApprovals, CustomerConsents } from "./Official";

function QualityPage({ path }: { path: string }) {
  const roles = useVF((s) => s.roles);
  if (!canOpenQualityPath(path, roles))
    return (
      <PermissionDenied hint="La revisión y los borradores reservados requieren Dirección o Administración." />
    );
  return <QualityWorkspaceProvider><QualityContent path={path} /></QualityWorkspaceProvider>;
}
function QualityContent({ path }: { path: string }) {
  const data = useQualityWorkspace();
  const parts = path.split("/").filter(Boolean);
  const tail = parts.at(-1) ?? "";
  if (data.loading) return <LoadingSkeleton />;
  if (data.error) return <ErrorState message={data.error} onRetry={data.reload} />;
  if (path === "/admin/calidad/aprobaciones" || path === "/equipo/calidad") return <InternalApprovals />;
  if (path === "/app/consentimientos") return <CustomerConsents />;
  if (path === "/app/ayuda") return <CustomerHelp />;
  if (path === "/app/recursos") return <Education client />;
  if (path.startsWith("/app/encuestas/")) return <CustomerSurvey id={tail} />;
  if (path.startsWith("/operaciones/clientes/")) return <FamilyExperience id={parts[2] ?? ""} />;
  if (path.startsWith("/admin/contenido-educativo"))
    return (
      <Education create={tail === "nuevo"} id={parts.length > 2 && tail !== "nuevo" ? tail : ""} />
    );
  if (path.startsWith("/admin/encuestas"))
    return tail === "nueva" ? <SurveyBuilder /> : <Surveys id={parts.length > 2 ? tail : ""} />;
  if (path.startsWith("/operaciones/quejas"))
    return tail === "nueva" ? (
      <ComplaintCreate />
    ) : parts.length > 2 ? (
      <ComplaintDetail id={tail} />
    ) : (
      <ComplaintList />
    );
  if (path === "/admin/calidad/ia") return <AssistantQuality />;
  if (tail === "conversaciones") return <QualityConversations />;
  if (["causas", "patrones"].includes(tail)) return <QualityPatterns />;
  if (["mejoras", "procedimientos-correctivos"].includes(tail)) return <Improvements />;
  if (tail === "escalamientos") return <Escalations />;
  if (tail === "duelo") return <SensitiveContext />;
  if (tail === "fidelizacion") return <LoyaltyHome />;
  if (tail === "consentimientos") return <Eligibility consentOnly />;
  if (tail === "frecuencia") return <Eligibility />;
  if (tail === "resenas") return <Reviews />;
  if (tail === "testimonios") return <Reviews testimonials />;
  if (tail === "referidos") return <Reviews referrals />;
  if (tail === "recuperacion") return <Recovery />;
  if (tail === "recordatorios") return <Preventive />;
  if (tail === "instagram") return <Attribution />;
  if (tail === "marca") return <BrandStandards />;
  return <QualityDashboard pending={tail === "pendientes"} />;
}
export function qualityPage(path: string) {
  return qualityScreen(path) ? <QualityPage key={path} path={path} /> : null;
}
