import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarPlus,
  Calendar,
  Wallet,
  MessageCircle,
  FileText,
  Stethoscope,
  Car,
  Package,
  Plane,
  Sparkles,
  Users,
  ShieldCheck,
  Plus,
  HeartHandshake,
  MapPin,
  Clock,
} from "lucide-react";
import { usePets, useVF } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, QuickAction, StatusBadge, Card, DemoNote } from "@/components/vf/ui";
import { PetProfileHeroCard } from "@/features/clients/components/PetProfileHeroCard";
import { DailyCareTasksCard } from "@/features/clients/components/DailyCareTasksCard";
import { HealthRecordsTimeline } from "@/features/clients/components/HealthRecordsTimeline";
import { BookingTimeSelector } from "@/features/clients/components/BookingTimeSelector";
import { TeleTriagePaidModal } from "@/features/fintech/components/TeleTriagePaidModal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cliente/")({
  head: () =>
    meta(
      "Portal Familiar · Vet Life",
      "Tus mascotas, cuidados diarios, carné digital y visitas a domicilio con el Dr. Luis Ríos."
    ),
  component: ClientHomePage,
});

function ClientHomePage() {
  const pets = usePets();
  const next = useVF((s) => s.visits.filter((v) => v.status !== "cancelada" && v.status !== "finalizada"))[0];
  const name = useVF((s) => s.displayName) || "Carolina";
  const visitsAll = useVF((s) => s.visits);

  const [selectedPetId, setSelectedPetId] = useState<string>(pets[0]?.id || "p1");
  const [showBooking, setShowBooking] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);

  // Active pet details
  const activePet = pets.find((p) => p.id === selectedPetId) || pets[0] || {
    id: "p1",
    name: "Maximilian",
    species: "FELINE",
    breed: "Maine Coon",
    sex: "FEMALE",
    age: "1 Año",
    weight_kg: 4.1,
    photo: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
  };

  const going = visitsAll.find((v) => v.step === "en_desplazamiento");

  return (
    <div className="space-y-6 pb-16">
      {/* Top Greeting & Location Header (Apple/Pawly inspired) */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
            <MapPin className="h-3.5 w-3.5" />
            <span>Chicó / Usaquén, Bogotá</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-foreground sm:text-3xl">
            Hola, {name} 👋
          </h1>
          <p className="text-xs text-muted-foreground">
            Dr. Luis Eduardo Ríos · Atención Médica a Domicilio
          </p>
        </div>
        <Link
          to="/cliente/perfil"
          className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary font-black shadow-sm"
        >
          {name[0]?.toUpperCase() || "C"}
        </Link>
      </div>

      {/* Live In-Transit Vehicle Banner */}
      {going && (
        <Link
          to="/app/$"
          params={{ _splat: `visitas/${going.id}/seguimiento` }}
          className="flex items-center gap-3 rounded-3xl border-2 border-primary/40 bg-card p-4 shadow-soft animate-pulse"
        >
          <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Car className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <b className="block text-base font-extrabold text-foreground">El equipo va en camino a tu domicilio</b>
            <span className="text-xs text-muted-foreground">{going.service} · Llegada estimada {going.time}</span>
          </div>
        </Link>
      )}

      {/* Horizontal Pet Selector Pills (Image 6 Pawly style) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mis Mascotas</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {pets.map((pt) => {
            const isSelected = (pt.id === selectedPetId);
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => setSelectedPetId(pt.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-full border px-3 py-2 transition-all active:scale-95 shrink-0",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                )}
              >
                <img
                  src={pt.photo}
                  alt={pt.name}
                  className="h-7 w-7 rounded-full object-cover border border-card"
                />
                <span className="text-xs font-extrabold">{pt.name}</span>
              </button>
            );
          })}

          <Link
            to="/cliente/bienvenida"
            className="flex items-center gap-1.5 rounded-full border border-dashed border-border bg-secondary/60 px-3.5 py-2 text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Añadir Mascota</span>
          </Link>
        </div>
      </div>

      {/* Hero Pet Profile Card (Images 1, 5, 6 inspired) */}
      <PetProfileHeroCard
        pet={{
          id: activePet.id,
          name: activePet.name,
          species: activePet.species === "Perro" ? "CANINE" : "FELINE",
          breed: activePet.breed || "Raza registrada",
          age: activePet.age || "1 Año",
          photo_url: activePet.photo,
        }}
        onBookVisit={() => setShowBooking(!showBooking)}
      />

      {/* In-Place Booking Drawer if toggled */}
      {showBooking && (
        <div className="animate-pop">
          <BookingTimeSelector
            selectedPetName={activePet.name}
            onConfirm={() => setShowBooking(false)}
          />
        </div>
      )}

      {/* Daily Care Tasks (Image 6 Pawly style) */}
      <DailyCareTasksCard petName={activePet.name} />

      {/* Verified Health Records (Image 6 Pawly style) */}
      <HealthRecordsTimeline />

      {/* Next Upcoming Appointment */}
      {next && (
        <div className="rounded-[2rem] border border-border bg-card p-5 shadow-soft">
          <SectionTitle>Próxima Visita Médica Programada</SectionTitle>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary font-black">
              <Calendar className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <b className="text-base font-extrabold text-foreground">{next.service}</b>
              <p className="text-xs text-muted-foreground">
                {next.date} · {next.time} · Dr. Luis Eduardo Ríos
              </p>
            </div>
            <StatusBadge status={next.status} />
          </div>
        </div>
      )}

      {/* Quick Action Matrix */}
      <div>
        <SectionTitle>Servicios & Familia</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction
            icon={CalendarPlus}
            label="Agendar Domicilio"
            onClick={() => setShowBooking(true)}
          />
          <QuickAction
            icon={Sparkles}
            label="Tele-Triaje 24/7 ($25k)"
            tone="blush"
            onClick={() => setShowTriageModal(true)}
          />
          <QuickAction
            icon={Package}
            label="Auto-Refill & Club"
            tone="amber"
            to="/cliente/suscripciones"
          />
          <QuickAction
            icon={Plane}
            label="Pasaporte de Viaje"
            tone="sage"
            to="/cliente/pasaporte/PAS-CO-2026-9821"
          />
          <QuickAction
            icon={Wallet}
            label="Pagos y Recibos"
            tone="sage"
            to="/cliente/pagos"
          />
        </div>
      </div>

      {/* Modals */}
      {showTriageModal && (
        <TeleTriagePaidModal onClose={() => setShowTriageModal(false)} />
      )}

      <DemoNote />
    </div>
  );
}
