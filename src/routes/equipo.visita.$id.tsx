import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { VisitExecution } from "@/features/field-operations/components/FieldPages";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/equipo/visita/$id")({
  head: () => meta("Visita", "Desplazamiento, llegada, atención y cierre de la visita."),
  component: VisitPage,
});

function VisitPage() {
  const { id } = Route.useParams();
  return <><Link to="/equipo" className="mt-4 inline-flex items-center gap-1 text-primary"><ChevronLeft className="h-5 w-5" />Jornada</Link><VisitExecution id={id} /></>;
}
