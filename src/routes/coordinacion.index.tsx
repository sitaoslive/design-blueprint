import { createFileRoute, Link } from "@tanstack/react-router";
import { Layers, ClipboardCheck, Users, PauseCircle, CalendarPlus, Shuffle, MapPin, MessageCircle, Clock, Calendar, Navigation } from "lucide-react";
import { useVF } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, MetricTile, QuickAction, ListCard, AttentionRow, StatusBadge, DemoNote } from "@/components/vf/ui";

export const Route = createFileRoute("/coordinacion/")({
  head: () => meta("Coordinación", "Bandeja operativa: solicitudes, OKVET, equipo y rutas."),
  component: Coord,
});

function Coord() {
  const reqs = useVF((s) => s.requests.filter((r) => r.status === "nueva").length);
  const visits = useVF((s) => s.visits); const staff = useVF((s) => s.staff);
  const incidents = useVF((s) => s.incidents.filter((i) => i.status !== "cerrada"));
  const approvals = useVF((s) => s.approvals.filter((a) => a.status === "pendiente" && a.kind === "reemplazo"));
  const okvet = visits.filter((v) => v.status === "pendiente" || v.status === "pendiente_okvet").length;
  const avail = staff.filter((s) => s.status !== "ausente").length + 6;
  const abs = staff.filter((s) => s.status === "ausente").length;
  const pend = visits.find((v) => v.status === "pendiente" && v.petId === "bruno");
  return (
    <>
      <PageTitle title="Coordinación" />
      <div className="grid grid-cols-2 gap-3">
        <MetricTile icon={Layers} label="Solicitudes nuevas" value={reqs} to="/coordinacion/solicitudes" />
        <MetricTile icon={ClipboardCheck} label="Pendientes OKVET" value={okvet} tone="cream" to="/coordinacion/okvet" />
        <MetricTile icon={Users} label="Equipo disponible" value={avail} tone="sage" to="/coordinacion/equipo" />
        <MetricTile icon={PauseCircle} label="Ausencias" value={abs} tone="amber" to="/coordinacion/equipo" />
      </div>
      <SectionTitle>Operaciones rápidas</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <QuickAction icon={CalendarPlus} label="Agendar" to="/coordinacion/nueva-cita" />
        <QuickAction icon={Shuffle} label="Reasignar" tone="sage" to="/coordinacion/agenda" />
        <QuickAction icon={MapPin} label="Rutas" tone="sage" to="/coordinacion/rutas" />
        <QuickAction icon={MessageCircle} label="Informar cliente" to="/coordinacion/solicitudes" />
      </div>
      <SectionTitle>Requiere atención</SectionTitle>
      <ListCard>
        {incidents.slice(0, 1).map((i) => <AttentionRow key={i.id} icon={Clock} title={i.title} detail={i.detail} to="/coordinacion/incidencias" />)}
        {pend && <AttentionRow icon={Calendar} title="Confirmación pendiente" detail={`Bruno · ${pend.date.split(",")[0]}, ${pend.time}`} to={`/coordinacion/cita/${pend.id}`} tone="amber" />}
        {approvals.map((a) => <AttentionRow key={a.id} icon={Users} title={a.title} detail={a.detail} to="/coordinacion/aprobaciones" tone="sage" />)}
      </ListCard>
      <SectionTitle>Rutas de hoy</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {[{ n: "Ruta Norte", s: staff[1]!, st: "en_curso", i: Navigation }, { n: "Ruta Sur", s: staff[0]!, st: "por_iniciar", i: MapPin }].map((r) => (
          <Link key={r.n} to="/coordinacion/$modulo" params={{ modulo: "rutas" }} className="rounded-3xl bg-secondary p-4 shadow-soft">
            <div className="flex items-center gap-2"><r.i className="h-7 w-7 text-primary" /><b className="text-lg">{r.n}</b></div>
            <p className="my-2 text-muted-foreground">{r.s.name}</p><StatusBadge status={r.st} />
          </Link>
        ))}
      </div>
      <DemoNote />
    </>
  );
}
