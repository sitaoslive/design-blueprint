import { usePets } from "@/lib/vf/store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarPlus, Calendar, Wallet, MessageCircle, FileText, Stethoscope, Car, Package, Plane } from "lucide-react";
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
  const visitsAll = useVF((s) => s.visits);
  const p = pets.find((x) => x.id === next?.petId);
  return (
    <>
      <PageTitle title={`Hola, ${name || "familia"}`} subtitle="Así va el cuidado de tu familia" />
      {(() => { const going = visitsAll.find((v) => v.step === "en_desplazamiento"); return going ? (
        <Link to="/app/$" params={{ _splat: `visitas/${going.id}/seguimiento` }} className="mb-4 flex items-center gap-3 rounded-3xl border-2 border-primary/30 bg-card p-4 shadow-soft">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Car className="h-6 w-6" /></span>
          <span className="flex-1"><b className="block text-lg">El equipo va en camino a tu casa</b><span className="text-sm text-muted-foreground">{going.service} · {going.time} · Ver en el mapa</span></span>
        </Link>) : null; })()}
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
        <QuickAction icon={Package} label="Auto-Refill & Club" tone="amber" to="/cliente/suscripciones" />
        <QuickAction icon={Plane} label="Pasaporte de Viaje" tone="sage" to="/cliente/pasaporte/PAS-CO-2026-9821" />
        <QuickAction icon={Wallet} label="Pagos" tone="sage" to="/cliente/pagos" />
        <QuickAction icon={MessageCircle} label="Ayuda" to="/cliente/ayuda" />
        <QuickAction icon={Stethoscope} label="Remisiones" to="/cliente/remisiones" />
        <QuickAction icon={FileText} label="Documentos" tone="sage" to="/cliente/documentos" />
      </div>
      <DemoNote />
    </>
  );
}
