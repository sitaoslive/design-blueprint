import { usePets } from "@/lib/vf/store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { actions } from "@/lib/vf/store";
import { services } from "@/lib/vf/data";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, Btn, Card } from "@/components/vf/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cliente/reservar")({
  head: () => meta("Reservar visita", "Solicita una visita a domicilio para tu mascota."),
  component: Book,
});

const SLOTS = ["Jue, 30 de enero · 09:00", "Jue, 30 de enero · 16:00", "Vie, 31 de enero · 11:00"];

function Book() {
  const pets = usePets();
  const [pet, setPet] = useState(""); const [svc, setSvc] = useState(""); const [slot, setSlot] = useState(""); const [done, setDone] = useState(false);
  if (done) return (<><PageTitle title="¡Solicitud enviada!" /><Card className="bg-sage text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-sage-foreground" /><p className="mt-2 text-lg">Coordinación confirmará tu visita pronto. Te avisaremos por WhatsApp.</p></Card><Link to="/cliente/agenda" className="mt-4 block text-center font-bold text-primary">Ver mi agenda</Link></>);
  const pick = (v: string, cur: string, set: (x: string) => void) => <button key={v} onClick={() => set(v)} aria-pressed={cur === v} className={cn("rounded-2xl px-4 py-3 text-left text-lg", cur === v ? "bg-gradient-primary text-primary-foreground" : "bg-accent")}>{v}</button>;
  return (
    <>
      <PageTitle title="Reservar visita" subtitle="Te visitamos en casa" />
      {pets.length === 0 && <Link to="/cliente/mascotas" className="block rounded-2xl bg-accent p-4 font-bold">Primero registra tu mascota →</Link>}
      <SectionTitle>¿Para quién?</SectionTitle><div className="grid grid-cols-2 gap-2">{pets.map((p) => pick(p.name, pet, setPet))}</div>
      <SectionTitle>Servicio</SectionTitle><div className="grid grid-cols-2 gap-2">{services.slice(0, 4).map((s) => pick(s, svc, setSvc))}</div>
      <SectionTitle>Horario</SectionTitle><div className="grid gap-2">{SLOTS.map((s) => pick(s, slot, setSlot))}</div>
      <Btn className="mt-6 w-full py-4 text-xl" disabled={!pet || !svc || !slot} onClick={() => {
        const [date, time] = slot.split(" · ");
        actions.createVisit({ petId: pets.find((p) => p.name === pet)!.id, staffId: null, service: svc, date: date!, time: time!, status: "pendiente", zone: "Medellín Sur / Poblado", address: "Calle 10 # 43E-12, Poblado, Medellín" });
        setDone(true);
      }}>Enviar solicitud</Btn>
    </>
  );
}
