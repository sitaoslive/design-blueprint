import { createFileRoute } from "@tanstack/react-router";
import { VisitDetail } from "@/components/vf/pages/ops";
import { meta } from "@/lib/vf/meta";
export const Route = createFileRoute("/luis/cita/$id")({ head: () => meta("Detalle de cita", "Asignación y estado de la cita."), component: Page });
function Page() { const { id } = Route.useParams(); return <VisitDetail id={id} base="/luis" />; }
