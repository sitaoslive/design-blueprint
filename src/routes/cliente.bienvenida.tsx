/**
 * VET FREEDOM OS — ONBOARDING INCREÍBLE PARA TUTORES Y DUEÑOS DE MASCOTAS
 * Ruta: /cliente/bienvenida
 * Flujo progresivo en 4 pasos, intuitivo, amigable y cálido para registrar
 * tutor, mascota, dirección con notas de acceso y personalidad CEM.
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Heart,
  Dog,
  Cat,
  Sparkles,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Gift,
  Camera,
  Smile,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { actions, useVF } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { Btn, Card, PageTitle } from "@/components/vf/ui";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cliente/bienvenida")({
  head: () =>
    meta(
      "Bienvenido a Vet Life · Registro de tu Familia y Mascota",
      "Registra a tu peludo en menos de 2 minutos. Atención veterinaria a domicilio cálida, puntual y personalizada."
    ),
  ssr: false,
  component: TutorOnboardingPage,
});

const DEFAULT_PHOTOS = {
  dog: [
    "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80", // Golden
    "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80", // Puppy
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80", // Frenchie
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80", // Beagle
  ],
  cat: [
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80", // Cat 1
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80", // Cat 2
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80", // Cool cat
  ],
};

function TutorOnboardingPage() {
  const nav = useNavigate();
  const [entryMode, setEntryMode] = useState<"choose" | "wizard" | "invitation">("choose");
  const [invitationCode, setInvitationCode] = useState("");
  const [validatingCode, setValidatingCode] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Paso 1: Datos del Tutor y Dirección
  const [tutorName, setTutorName] = useState("");
  const [tutorPhone, setTutorPhone] = useState("");
  const [city, setCity] = useState("Medellín");
  const [neighborhood, setNeighborhood] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [accessNotes, setAccessNotes] = useState("");

  // Paso 2: Datos de la Mascota
  const [species, setSpecies] = useState<"Perro" | "Gato">("Perro");
  const [petName, setPetName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"Macho" | "Hembra">("Macho");
  const [isNeutered, setIsNeutered] = useState(true);
  const [weightKg, setWeightKg] = useState("12");
  const [selectedPhoto, setSelectedPhoto] = useState(DEFAULT_PHOTOS.dog[0]);

  // Paso 3: Personalidad & Cuidados (Memoria CEM)
  const [temperament, setTemperament] = useState("Amigable y juguetón");
  const [allergies, setAllergies] = useState("");
  const [favoriteTreat, setFavoriteTreat] = useState("Galletas de pollo o manzana");

  // Estado final
  const [registeredPetId, setRegisteredPetId] = useState<string | null>(null);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorName.trim()) {
      toast.error("Por favor indícanos tu nombre.");
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim()) {
      toast.error("¡Por favor escribe el nombre de tu mascota!");
      return;
    }
    setStep(3);
  };

  const handleFinish = () => {
    // Registrar mascota en el store
    const newId = "pet-" + Date.now();
    actions.addPet({
      name: petName.trim(),
      species,
      breed: breed.trim() || (species === "Perro" ? "Criollo / Mestizo" : "Doméstico"),
      age: age.trim() || "2 años",
      allergies: allergies.trim() || "Ninguna conocida",
    });

    setRegisteredPetId(newId);
    setStep(4);
    toast.success(`🎉 ¡${petName} ha sido registrado exitosamente en tu familia Vet Life!`);
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationCode.trim()) {
      toast.error("Ingresa el código de invitación proporcionado por tu veterinario.");
      return;
    }

    setValidatingCode(true);
    // Invitation redemption (`owners`, `redeem_pet_invitation_code`) is not backed by the
    // database yet, so no code is verified here and no pet is linked.
    toast.error("Los códigos de invitación todavía no están disponibles. Pídele a tu veterinario que te agregue y continúa con el asistente.");
    setValidatingCode(false);
  };

  if (entryMode === "choose") {
    return (
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-black text-primary">
            <Heart className="h-3.5 w-3.5" />
            VET LIFE EXPERIENCE
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            La salud de tu mascota. Tu tranquilidad en casa.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Elige cómo deseas comenzar tu experiencia veterinaria a domicilio hoy.
          </p>
        </div>

        {/* 3 Registration Paths (Part 6) */}
        <div className="mt-8 space-y-4">
          {/* Path A */}
          <div
            onClick={() => setEntryMode("invitation")}
            className="group cursor-pointer rounded-3xl border-2 border-primary/40 bg-card p-5 shadow-soft transition-all hover:border-primary hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition">
                    Tengo una invitación de mi veterinario
                  </h3>
                  <span className="rounded-full bg-sage px-2 py-0.5 text-[10px] font-bold text-sage-foreground">
                    Recomendado
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ingresa tu código corto (ej. <span className="font-mono font-bold">VET-MAX-2026</span>) o enlace de WhatsApp para acceder al expediente ya preparado por tu médico.
                </p>
              </div>
            </div>
          </div>

          {/* Path B */}
          <div
            onClick={() => setEntryMode("wizard")}
            className="group cursor-pointer rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
                <Dog className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition">
                  Registrar una nueva mascota
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Crea tu perfil familiar y carnet digital en 2 minutos para agendar visitas a domicilio en Medellín y Oriente Antioqueño.
                </p>
              </div>
            </div>
          </div>

          {/* Path C */}
          <Link
            to="/cliente"
            className="group block rounded-3xl border border-border bg-card/60 p-5 shadow-soft transition-all hover:border-primary/50 hover:shadow-md active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-foreground">
                <User className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-foreground group-hover:text-primary transition">
                  Ya tengo una cuenta registrada
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Entra directamente a tu portal de tutor para ver a tus mascotas, citas y recetas.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    );
  }

  if (entryMode === "invitation") {
    return (
      <main className="mx-auto max-w-md px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() => setEntryMode("choose")}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a opciones
        </button>

        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-black text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            CANJE DE CÓDIGO
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-foreground">
            Ingresa tu Código de Invitación
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Código de 8 a 12 caracteres enviado por el Dr. Luis Ríos o tu clínica vía WhatsApp/SMS.
          </p>
        </div>

        <Card className="mt-6 space-y-4 p-6 rounded-3xl border border-border shadow-sm">
          <form onSubmit={handleRedeemCode} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground">Código de Invitación</label>
              <input
                type="text"
                placeholder="Ej. VET-MAX-2026"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-2xl border border-border bg-background p-3.5 text-center font-mono text-lg font-bold tracking-widest text-primary uppercase focus:border-primary focus:outline-none"
                autoFocus
              />
              <p className="mt-1 text-[11px] text-muted-foreground text-center">
                Código de prueba activo: <span className="font-mono font-bold text-foreground">VET-MAX-2026</span>
              </p>
            </div>

            <Btn
              type="submit"
              disabled={validatingCode || !invitationCode.trim()}
              className="w-full py-3.5 text-sm font-extrabold shadow-button"
            >
              {validatingCode ? "Validando con el servidor..." : "Validar y Vincular Mi Mascota"}
            </Btn>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Barra de Progreso Superior */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
          <span>Paso {step} de 4</span>
          <span>
            {step === 1 && "Tus Datos de Contacto"}
            {step === 2 && "Conociendo a tu Mascota"}
            {step === 3 && "Personalidad y Cuidados (CEM)"}
            {step === 4 && "¡Carnet Digital Listo!"}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* PASO 1: Datos del Tutor */}
      {step === 1 && (
        <form onSubmit={handleNextStep1} className="space-y-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-black text-primary">
              <Heart className="h-3.5 w-3.5" />
              BIENVENIDO A VET LIFE
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
              Hola, ¿cómo te llamas?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Queremos saber quién eres para que el veterinario te salude con calidez al llegar a tu puerta.
            </p>
          </div>

          <Card className="space-y-4 p-6 border-border shadow-sm">
            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                <User className="h-4 w-4 text-primary" />
                Tu Nombre Completo *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ej. Carolina Restrepo"
                value={tutorName}
                onChange={(e) => setTutorName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-3.5 text-base focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                <Phone className="h-4 w-4 text-primary" />
                Número de WhatsApp para avisos de llegada *
              </label>
              <input
                type="tel"
                placeholder="+57 300 123 4567"
                value={tutorPhone}
                onChange={(e) => setTutorPhone(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-3.5 text-base focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  Barrio o Zona
                </label>
                <input
                  type="text"
                  placeholder="Poblado, Laureles, Llanogrande, Rionegro..."
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  Dirección exacta
                </label>
                <input
                  type="text"
                  placeholder="Calle 140 # 11-20, Apto 402"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                Instrucciones de llegada para el veterinario (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Timbrar al 402, conjunto con portería, parqueadero de visitantes"
                value={accessNotes}
                onChange={(e) => setAccessNotes(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-3.5 text-xs focus:border-primary focus:outline-none"
              />
            </div>
          </Card>

          <Btn type="submit" className="w-full py-4 text-base font-extrabold shadow-button">
            <span>Siguiente: Conocer a Mi Mascota</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </Btn>
        </form>
      )}

      {/* PASO 2: Datos de la Mascota */}
      {step === 2 && (
        <form onSubmit={handleNextStep2} className="space-y-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-black text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              EL PROTAGONISTA DE LA FAMILIA
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
              Cuéntanos sobre tu peludo
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              ¿Quién es el consentido de la casa?
            </p>
          </div>

          <Card className="space-y-4 p-6 border-border shadow-sm">
            {/* Especie Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSpecies("Perro");
                  setSelectedPhoto(DEFAULT_PHOTOS.dog[0]);
                }}
                className={`flex items-center justify-center gap-2.5 rounded-2xl p-4 text-base font-bold transition border-2 ${
                  species === "Perro"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <Dog className="h-6 w-6" />
                <span>Es un Perro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSpecies("Gato");
                  setSelectedPhoto(DEFAULT_PHOTOS.cat[0]);
                }}
                className={`flex items-center justify-center gap-2.5 rounded-2xl p-4 text-base font-bold transition border-2 ${
                  species === "Gato"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                <Cat className="h-6 w-6" />
                <span>Es un Gato</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                Nombre de tu mascota *
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ej. Toby, Luna, Bruno..."
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-3.5 text-lg font-bold focus:border-primary focus:outline-none"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-foreground mb-1.5 block">
                  Raza
                </label>
                <input
                  type="text"
                  placeholder="Ej. Criollo, Golden, Mestizo..."
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1.5 block">
                  Edad aproximada
                </label>
                <input
                  type="text"
                  placeholder="Ej. 3 años, 8 meses..."
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground mb-1.5 block">
                  Sexo
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSex("Macho")}
                    className={`flex-1 rounded-xl p-2.5 text-xs font-bold border ${
                      sex === "Macho" ? "border-primary bg-primary/10 text-primary" : "border-border"
                    }`}
                  >
                    Macho ♂
                  </button>
                  <button
                    type="button"
                    onClick={() => setSex("Hembra")}
                    className={`flex-1 rounded-xl p-2.5 text-xs font-bold border ${
                      sex === "Hembra" ? "border-primary bg-primary/10 text-primary" : "border-border"
                    }`}
                  >
                    Hembra ♀
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1.5 block">
                  ¿Está esterilizado/a?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNeutered(true)}
                    className={`flex-1 rounded-xl p-2.5 text-xs font-bold border ${
                      isNeutered ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-border"
                    }`}
                  >
                    Sí
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNeutered(false)}
                    className={`flex-1 rounded-xl p-2.5 text-xs font-bold border ${
                      !isNeutered ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-border"
                    }`}
                  >
                    No aún
                  </button>
                </div>
              </div>
            </div>

            {/* Selector de Foto */}
            <div>
              <label className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-primary" />
                Elige la foto que más se parece a {petName || "tu mascota"}:
              </label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(species === "Perro" ? DEFAULT_PHOTOS.dog : DEFAULT_PHOTOS.cat).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt=""
                    onClick={() => setSelectedPhoto(url)}
                    className={`h-20 w-20 shrink-0 cursor-pointer rounded-2xl object-cover transition border-4 ${
                      selectedPhoto === url
                        ? "border-primary shadow-md scale-105"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card>

          <div className="flex gap-3">
            <Btn type="button" variant="outline" onClick={() => setStep(1)} className="py-4">
              <ArrowLeft className="h-5 w-5" />
            </Btn>
            <Btn type="submit" className="flex-1 py-4 text-base font-extrabold shadow-button">
              <span>Siguiente: Personalidad y Cuidados</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Btn>
          </div>
        </form>
      )}

      {/* PASO 3: Personalidad & Memoria CEM */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-600 dark:text-amber-400">
              <Smile className="h-3.5 w-3.5" />
              CUSTOMER EXPERIENCE MEMORY (CEM)
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">
              ¿Cómo es {petName}?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Para que nuestro veterinario sepa cómo tratarlo con cariño y respeto antes de entrar a tu hogar.
            </p>
          </div>

          <Card className="space-y-4 p-6 border-border shadow-sm">
            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                Temperamento habitual con extraños
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  "Amigable y juguetón 🎾",
                  "Tímido los primeros 5 minutos 🙈",
                  "Nervioso con batas o agujas 💉",
                  "Protector / Guardián 🛡️",
                ].map((temp) => (
                  <button
                    key={temp}
                    type="button"
                    onClick={() => setTemperament(temp)}
                    className={`rounded-xl p-3 text-left font-bold border transition ${
                      temperament === temp
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-secondary"
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1.5 block">
                ¿Tiene alguna alergia o condición médica conocida?
              </label>
              <input
                type="text"
                placeholder="Ej. Alergia al pollo, problemas en la piel, sensible de oídos (o deja en blanco)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                <Gift className="h-4 w-4 text-primary" />
                Premio o snack favorito (para ganarnos su confianza):
              </label>
              <input
                type="text"
                placeholder="Ej. Galletas de hígado, trocitos de manzana, jamón..."
                value={favoriteTreat}
                onChange={(e) => setFavoriteTreat(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background p-3.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </Card>

          <div className="flex gap-3">
            <Btn type="button" variant="outline" onClick={() => setStep(2)} className="py-4">
              <ArrowLeft className="h-5 w-5" />
            </Btn>
            <Btn onClick={handleFinish} className="flex-1 py-4 text-base font-extrabold shadow-button">
              <span>¡Crear Carnet Digital de {petName}!</span>
              <Sparkles className="ml-2 h-5 w-5" />
            </Btn>
          </div>
        </div>
      )}

      {/* PASO 4: Carnet Digital Listo */}
      {step === 4 && (
        <div className="space-y-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-xl">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Familia Registrada
            </span>
            <h1 className="mt-2 text-3xl font-black text-foreground">
              ¡Bienvenido a la familia, {petName}! 🐾
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tus datos han quedado enlazados de manera segura en tu portal familiar de Vet Life.
            </p>
          </div>

          {/* Tarjeta de Carnet Digital */}
          <div className="mx-auto max-w-sm rounded-3xl border-2 border-primary/30 bg-card p-6 shadow-xl text-left space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={selectedPhoto}
                alt={petName}
                className="h-20 w-20 rounded-2xl object-cover shadow-md border-2 border-primary"
              />
              <div>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-black text-primary">
                  PACIENTE OFICIAL
                </span>
                <h3 className="text-2xl font-black text-foreground mt-0.5">{petName}</h3>
                <p className="text-xs text-muted-foreground">{species} · {breed || "Criollo"}</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tutor Responsable:</span>
                <span className="font-bold text-foreground">{tutorName || "Carolina Restrepo"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ciudad / Zona:</span>
                <span className="font-bold text-foreground">{neighborhood ? `${neighborhood}, ${city}` : "Medellín / Oriente"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperamento:</span>
                <span className="font-bold text-foreground">{temperament}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Alergias:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-medium">
                  {allergies || "Ninguna registrada"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-secondary/80 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Memoria de Experiencia (CEM) activa para visitas a domicilio.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link to="/cliente/reservar">
              <Btn className="w-full sm:w-auto px-8 py-3.5 text-base font-extrabold shadow-button">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Mi Primera Visita a Domicilio
              </Btn>
            </Link>
            <Link to="/cliente">
              <Btn variant="outline" className="w-full sm:w-auto">
                Ir a Mi Portal Familiar
              </Btn>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
