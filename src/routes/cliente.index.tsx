import { usePets } from "@/lib/vf/store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Calendar, Wallet, MessageCircle, FileText, Stethoscope } from "lucide-react";
import { useVF } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, QuickAction, StatusBadge, Card, DemoNote } from "@/components/vf/ui";

export const Route = createFileRoute("/cliente/")({
  head: () => meta("Inicio", "Tus mascotas, próximas visitas y pagos en Vet Life."),
  component: Home,
});

function Home() {
  const pets = usePets();
  const next = useVF((s) => s.visits.filter((v) => v.status !== "cancelada" && v.status !== "finalizada"))[0];
  const name = useVF((s) => s.displayName);
  const p = pets.find((x) => x.id === next?.petId);
  return (
    <>
      <PageTitle title={`Hola, ${name || "familia"}`} subtitle="Así va el cuidado de tu familia" />
      <div className="flex gap-3 overflow-x-auto pb-1">
        {pets.length === 0 && <Link to="/cliente/mascotas" className="w-full rounded-3xl bg-accent p-5 text-center font-bold">Registra tu primera mascota →</Link>}
        {pets.map((pt) => (
          <Link key={pt.id} to="/cliente/mascotas/$id" params={{ id: pt.id }} className="w-36 shrink-0 rounded-3xl bg-secondary p-2 text-center shadow-soft">
            <img src={pt.photo} alt={pt.name} className="h-28 w-full rounded-2xl object-cover" /><b className="mt-1 block text-lg">{pt.name}</b><span className="text-sm text-muted-foreground">{pt.breed}</span>
          </Link>
        ))}
      </div>
      {next && p && (<>
        <SectionTitle>Próxima visita</SectionTitle>
        <Card className="flex items-center gap-3">
          <img src={p.photo} alt="" className="h-20 w-20 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1"><b className="text-lg">{p.name} · {next.service}</b><p className="text-muted-foreground">{next.date} · {next.time}</p></div>
          <StatusBadge status={next.status} />
        </Card>
      </>)}
      <SectionTitle>¿Qué necesitas?</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <QuickAction icon={CalendarPlus} label="Reservar visita" to="/cliente/reservar" />
        <QuickAction icon={Calendar} label="Mi agenda" tone="sage" to="/cliente/agenda" />
        <QuickAction icon={Wallet} label="Pagos" tone="sage" to="/cliente/pagos" />
        <QuickAction icon={MessageCircle} label="Ayuda" to="/cliente/ayuda" />
        <QuickAction icon={Stethoscope} label="Remisiones" to="/cliente/remisiones" />
        <QuickAction icon={FileText} label="Documentos" tone="sage" to="/cliente/documentos" />
      </div>
      <DemoNote />
    </>
  );
}
