import { usePets, actions } from "@/lib/vf/store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { CheckCircle2, Calendar, Clock, MapPin, Sparkles, Plus, Heart, ShieldCheck, ChevronRight } from "lucide-react";
import { services } from "@/lib/vf/data";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, Btn, Card } from "@/components/vf/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/cliente/reservar")({
  ssr: false,
  head: () => meta("Reservar Visita Domiciliaria · Vet Freedom OS", "Solicita una visita a domicilio para tu mascota en Medellín y Oriente Antioqueño."),
  component: Book,
});

function getDynamicSlots(): string[] {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const now = new Date();
  
  const d1 = new Date(now);
  d1.setDate(d1.getDate() + 1);
  const d2 = new Date(now);
  d2.setDate(d2.getDate() + 2);

  return [
    `Hoy · 16:30 (Urgencia Domiciliaria)`,
    `${days[d1.getDay()]}, ${d1.getDate()} de ${months[d1.getMonth()]} · 09:30 (Mañana)`,
    `${days[d1.getDay()]}, ${d1.getDate()} de ${months[d1.getMonth()]} · 15:00 (Tarde)`,
    `${days[d2.getDay()]}, ${d2.getDate()} de ${months[d2.getMonth()]} · 11:00 (Mediodía)`,
  ];
}

function Book() {
  const pets = usePets();
  const [selectedPet, setSelectedPet] = useState(pets.length > 0 ? pets[0]?.name ?? "" : "");
  const [isGuestPet, setIsGuestPet] = useState(pets.length === 0);
  const [guestPetName, setGuestPetName] = useState("");
  const [guestSpecies, setGuestSpecies] = useState<"Perro" | "Gato">("Perro");
  const [guestBreed, setGuestBreed] = useState("Criollo / Mestizo");

  const [svc, setSvc] = useState("Consulta General a Domicilio");
  const [slot, setSlot] = useState("");
  const [address, setAddress] = useState("Calle 10 # 43E-12, El Poblado, Medellín");
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const availableSlots = useMemo(() => getDynamicSlots(), []);

  if (done) {
    return (
      <div className="space-y-6 max-w-lg mx-auto py-6">
        <PageTitle title="¡Solicitud Enviada con Éxito!" subtitle="Coordinación médica está asignando la ruta más óptima" />
        <Card className="bg-emerald-500/10 border-2 border-emerald-500/30 text-center p-6 space-y-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-foreground">Visita Programada</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Te avisaremos por WhatsApp con el enlace de rastreo estilo Uber cuando el médico inicie su desplazamiento.
            </p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Paciente:</span>
              <span className="font-bold text-foreground">{isGuestPet ? guestPetName : selectedPet} ({isGuestPet ? guestSpecies : "Mascota"})</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Servicio:</span>
              <span className="font-bold text-foreground">{svc}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1.5">
              <span className="text-muted-foreground">Horario Estimado:</span>
              <span className="font-bold text-primary">{slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dirección:</span>
              <span className="font-medium text-foreground truncate max-w-[200px]">{address}</span>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-2 pt-2">
          <Link to="/cliente/agenda">
            <Btn className="w-full py-3.5 text-base font-bold shadow-button">
              Ver mi Agenda de Citas →
            </Btn>
          </Link>
          <Link to="/cliente/hogar">
            <Btn variant="outline" className="w-full text-xs">
              Volver al Inicio del Portal
            </Btn>
          </Link>
        </div>
      </div>
    );
  }

  const handleBookingSubmit = () => {
    setLoading(true);

    let effectivePetId = "";
    const activePetName = isGuestPet ? guestPetName.trim() : selectedPet;

    if (isGuestPet) {
      if (!guestPetName.trim()) {
        toast.error("Por favor ingresa el nombre de tu mascota.");
        setLoading(false);
        return;
      }
      // Register guest pet in local store
      actions.addPet({
        name: guestPetName.trim(),
        species: guestSpecies,
        breed: guestBreed || "Criollo",
        age: "1 año",
        allergies: "Ninguna registrada",
      });
      // Find created pet
      effectivePetId = `pet_${Date.now()}`;
    } else {
      const match = pets.find((p) => p.name === selectedPet);
      effectivePetId = match ? match.id : `pet_default`;
    }

    const [datePart, timePart] = slot.includes(" · ") ? slot.split(" · ") : [slot, "09:00"];
    const parsedTime = (timePart ? timePart.split(" ")[0] : "09:00") || "09:00";

    try {
      actions.createVisit({
        petId: effectivePetId,
        staffId: null,
        service: svc,
        date: datePart || "Hoy",
        time: parsedTime,
        status: "pendiente",
        zone: "Medellín Sur / Poblado",
        address: address,
      });
      toast.success("¡Solicitud enviada a coordinación!");
      setDone(true);
    } catch {
      toast.error("Error al procesar la cita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      <PageTitle
        title="Reservar Visita Domiciliaria"
        subtitle="Atención médica profesional en la tranquilidad de tu hogar"
      />

      {/* SECCIÓN 1: ¿A quién vamos a atender? */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="font-extrabold text-foreground text-sm uppercase tracking-wide">
              1. Paciente a Atender
            </span>
          </div>

          {pets.length > 0 && (
            <button
              type="button"
              onClick={() => setIsGuestPet(!isGuestPet)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              {isGuestPet ? "Elegir mascota registrada" : "+ Registrar otra mascota"}
            </button>
          )}
        </div>

        {pets.length > 0 && !isGuestPet ? (
          <div className="grid grid-cols-2 gap-2.5">
            {pets.map((p) => {
              const isSelected = selectedPet === p.name;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPet(p.name)}
                  className={cn(
                    "rounded-2xl p-3.5 text-left transition border-2 flex items-center justify-between",
                    isSelected
                      ? "border-primary bg-primary/10 font-black text-foreground shadow-sm"
                      : "border-border bg-card hover:border-primary/40 text-muted-foreground"
                  )}
                >
                  <div className="leading-tight">
                    <span className="block text-sm font-extrabold text-foreground">{p.name}</span>
                    <span className="text-[11px] text-muted-foreground">{p.species} · {p.breed}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        ) : (
          /* Inline Guest Pet Form */
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Registro Rápido de Paciente (Sin salir de esta pantalla)</span>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Nombre de tu Mascota *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Luna, Simón, Toby..."
                  value={guestPetName}
                  onChange={(e) => setGuestPetName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Especie *
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["Perro", "Gato"] as const).map((spec) => (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => setGuestSpecies(spec)}
                      className={cn(
                        "rounded-xl py-2 text-xs font-bold transition border",
                        guestSpecies === spec
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-muted-foreground border-border hover:bg-accent"
                      )}
                    >
                      {spec === "Perro" ? "🐶 Perro" : "🐱 Gato"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                Raza (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: Golden Retriever, Criollo, Siamés..."
                value={guestBreed}
                onChange={(e) => setGuestBreed(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </Card>

      {/* SECCIÓN 2: Servicio Clínico */}
      <Card className="p-5 space-y-3">
        <span className="font-extrabold text-foreground text-sm uppercase tracking-wide block">
          2. Servicio Requerido
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {services.slice(0, 6).map((s) => {
            const isSelected = svc === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSvc(s)}
                className={cn(
                  "rounded-2xl p-3 text-left transition border-2 flex items-center justify-between text-xs font-bold",
                  isSelected
                    ? "border-primary bg-primary/10 text-foreground shadow-sm"
                    : "border-border bg-card hover:border-primary/40 text-muted-foreground"
                )}
              >
                <span>{s}</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-primary shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* SECCIÓN 3: Horarios Disponibles */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-foreground text-sm uppercase tracking-wide block">
            3. Franja Horaria Sugerida
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
            Disponibilidad en Tiempo Real
          </span>
        </div>

        <div className="grid gap-2">
          {availableSlots.map((s) => {
            const isSelected = slot === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSlot(s)}
                className={cn(
                  "rounded-2xl p-3.5 text-left transition border-2 flex items-center justify-between text-xs font-bold",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "border-border bg-card hover:border-primary/40 text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{s}</span>
                </div>
                {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* SECCIÓN 4: Dirección de Visita */}
      <Card className="p-5 space-y-3">
        <span className="font-extrabold text-foreground text-sm uppercase tracking-wide block">
          4. Dirección de Atención
        </span>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Dirección, barrio, apto o indicaciones..."
            className="w-full bg-transparent text-xs font-medium outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          Cobertura garantizada en Medellín, Envigado, Sabaneta, Itagüí, Rionegro y Llanogrande.
        </p>
      </Card>

      {/* Botón de Enviar Solicitud */}
      <Btn
        type="button"
        disabled={loading || !slot || (isGuestPet ? !guestPetName.trim() : !selectedPet)}
        onClick={handleBookingSubmit}
        className="w-full py-4 text-base font-black shadow-button"
      >
        {loading ? "Confirmando con el Equipo de Turno..." : "Enviar Solicitud de Cita a Domicilio →"}
      </Btn>

      <div className="rounded-2xl border border-border bg-card/60 p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
        <span>Atención médica respaldada por la Ley 576 de 2000 COMVEZCOL.</span>
      </div>
    </div>
  );
}
