import { usePets } from "@/lib/vf/store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, CalendarPlus } from "lucide-react";
import { useVF } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, Card, StatusBadge, Empty, QuickAction } from "@/components/vf/ui";

export const Route = createFileRoute("/cliente/mascotas/$id")({
  head: () => meta("Perfil de mascota", "Datos, visitas e historial autorizado."),
  component: PetPage,
});

function PetPage() {
  const pets = usePets();
  const { id } = Route.useParams();
  const p = pets.find((x) => x.id === id);
  const visits = useVF((s) => s.visits.filter((v) => v.petId === id && v.status !== "cancelada"));
  if (!p) return <div className="mt-8"><Empty title="Mascota no encontrada" /></div>;
  return (
    <>
      <Link to="/cliente/mascotas" className="mt-4 inline-flex items-center gap-1 text-primary"><ChevronLeft className="h-5 w-5" />Mascotas</Link>
      <img src={p.photo} alt={p.name} className="mt-3 aspect-[4/3] w-full rounded-3xl object-cover shadow-soft" />
      <PageTitle title={p.name} subtitle={`${p.breed} · ${p.age}`} />
      <Card><p><b>Especie:</b> {p.species}</p><p><b>Alergias:</b> {p.allergies}</p><p className="mt-1 text-sm text-muted-foreground">Información clínica completa: disponible al integrar OKVET.</p></Card>
      <SectionTitle>Visitas</SectionTitle>
      <div className="space-y-2">{visits.map((v) => <Card key={v.id} className="flex items-center justify-between gap-2"><span><b>{v.service}</b><br /><span className="text-muted-foreground">{v.date} · {v.time}</span></span><StatusBadge status={v.status} /></Card>)}</div>
      <div className="mt-4"><QuickAction icon={CalendarPlus} label={`Reservar para ${p.name}`} to="/cliente/reservar" /></div>
    </>
  );
}
