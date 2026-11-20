import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, Navigation, Map, Car, MapPinCheck, Stethoscope, CheckCircle2, AlertTriangle } from "lucide-react";
import { useVF, actions } from "@/lib/vf/store";
import { pets } from "@/lib/vf/data";
import type { VisitStep } from "@/lib/vf/data";
import { meta } from "@/lib/vf/meta";
import { PageTitle, Card, Btn, Empty, SectionTitle } from "@/components/vf/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/equipo/visita/$id")({
  head: () => meta("Visita", "Desplazamiento, llegada, atención y cierre de la visita."),
  component: VisitPage,
});

const STEPS: { step: VisitStep; label: string; icon: typeof Car }[] = [
  { step: "en_desplazamiento", label: "Iniciar desplazamiento", icon: Car },
  { step: "llegada", label: "Registrar llegada", icon: MapPinCheck },
  { step: "en_atencion", label: "Iniciar atención", icon: Stethoscope },
  { step: "finalizada", label: "Finalizar visita", icon: CheckCircle2 },
];
const ORDER: VisitStep[] = ["programada", "en_desplazamiento", "llegada", "en_atencion", "finalizada"];

function VisitPage() {
  const { id } = Route.useParams();
  const v = useVF((s) => s.visits.find((x) => x.id === id));
  if (!v) return <div className="mt-8"><Empty title="Visita no encontrada" /></div>;
  const p = pets.find((x) => x.id === v.petId)!;
  const cur = ORDER.indexOf(v.step);
  const q = encodeURIComponent(v.address);
  return (
    <>
      <Link to="/equipo" className="mt-4 inline-flex items-center gap-1 text-primary"><ChevronLeft className="h-5 w-5" />Jornada</Link>
      <PageTitle title={`${v.time} · ${p.name}`} subtitle={v.service} />
      <Card className="flex gap-3"><img src={p.photo} alt="" className="h-20 w-20 rounded-2xl object-cover" /><div><p>{v.address}</p><p className="text-muted-foreground">Alergias: {p.allergies}</p><p className="text-muted-foreground">Preparar: {v.prep.join(", ") || "—"}</p></div></Card>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <a href={`https://waze.com/ul?q=${q}&navigate=yes`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 font-bold"><Navigation className="h-5 w-5 text-primary" />Abrir Waze</a>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-sage px-4 py-3 font-bold"><Map className="h-5 w-5 text-sage-foreground" />Google Maps</a>
      </div>
      <SectionTitle>Progreso</SectionTitle>
      <div className="space-y-2">
        {STEPS.map((s, i) => {
          const idx = i + 1; const isDone = cur >= idx; const isNext = cur === idx - 1;
          return (
            <Btn key={s.step} variant={isDone ? "sage" : isNext ? "primary" : "soft"} disabled={!isNext} className={cn("w-full justify-start py-4 text-lg", isDone && "opacity-100")}
              onClick={() => { actions.advanceStep(v.id, s.step); toast.success(s.label + " ✓"); }}>
              <s.icon className="h-6 w-6" />{s.label}{isDone && <CheckCircle2 className="ml-auto h-5 w-5" />}
            </Btn>
          );
        })}
      </div>
      <Btn variant="outline" className="mt-4 w-full" onClick={() => { actions.addIncident(`Incidencia en visita ${p.name}`, `${v.time} · reportada por Dra. Valeria`); toast.success("Incidencia enviada a Coordinación"); }}><AlertTriangle className="h-5 w-5" />Reportar incidencia</Btn>
    </>
  );
}
