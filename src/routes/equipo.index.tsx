import { usePets } from "@/lib/vf/store";
import { useMyStaff } from "@/lib/vf/me";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Navigation, ListChecks, AlertTriangle, Package, Clock, MapPin } from "lucide-react";
import { useVF } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, StatusBadge, QuickAction, DemoNote } from "@/components/vf/ui";

export const Route = createFileRoute("/equipo/")({
  head: () => meta("Mi jornada", "Visitas del día, preparación y tareas del profesional."),
  component: Day,
});

function Day() {
  const pets = usePets();
  const { me, mine } = useMyStaff(); const allV = useVF((s) => s.visits); const allT = useVF((s) => s.tasks);
  const visits = allV.filter((v) => mine(v.staffId) && v.date.startsWith("Mar")).sort((a, b) => a.time.localeCompare(b.time));
  const tasks = allT.filter((t) => mine(t.staffId) && !t.done).length;
  const done = visits.filter((v) => v.step === "finalizada").length;
  return (
    <>
      <PageTitle title={me ? `Hola, ${me.name}` : "Hola"} subtitle={`${visits.length} visitas hoy · ${done} finalizadas`} />
      <div className="grid grid-cols-2 gap-3">
        <QuickAction icon={Navigation} label="Mi ruta" to="/equipo/ruta" />
        <QuickAction icon={ListChecks} label={`Tareas (${tasks})`} tone="sage" to="/equipo/tareas" />
        <QuickAction icon={Package} label="Insumos" tone="sage" to="/equipo/inventario" />
        <QuickAction icon={AlertTriangle} label="Reportar incidencia" to="/equipo/incidencias" />
      </div>
      <SectionTitle>Visitas de hoy</SectionTitle>
      <div className="space-y-3">
        {visits.map((v) => { const p = pets.find((x) => x.id === v.petId)!; return (
          <Link key={v.id} to="/equipo/visita/$id" params={{ id: v.id }} className="flex items-center gap-3 rounded-3xl bg-secondary p-3 shadow-soft">
            <img src={p.photo} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <span className="flex-1"><b className="block text-lg">{v.time} · {p.name}</b><span className="flex items-center gap-1 text-muted-foreground"><MapPin className="h-4 w-4" />{v.address}</span><span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" />{v.service}</span></span>
            <StatusBadge status={v.step === "finalizada" ? "finalizada" : v.status} />
          </Link>); })}
      </div>
      <DemoNote />
    </>
  );
}
