/**
 * VET FREEDOM OS — PORTAL DE REGISTRO Y ONBOARDING PARA CLÍNICAS VETERINARIAS B2B SAAS
 * Ruta: /registro-clinica
 * Permite a cualquier veterinario independiente o director de clínica registrar su propia
 * organización con 30 días de prueba gratuita, aislada mediante multi-tenancy y RLS.
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  PawPrint,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Car,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "@/lib/vf/meta";
import { Btn, Card } from "@/components/vf/ui";

export const Route = createFileRoute("/registro-clinica")({
  head: () =>
    meta(
      "Registrar Mi Veterinaria · Vet Freedom OS",
      "Activa Vet Freedom OS para tu clínica o consulta a domicilio. 30 días de prueba gratis, asistente por voz, rutas optimizadas y fórmulas automáticas."
    ),
  ssr: false,
  component: ClinicOnboardingPage,
});

type PlanId = "veterinario_solitario" | "clinica_domiciliaria" | "red_marca_blanca";

const PLANS = [
  {
    id: "veterinario_solitario" as PlanId,
    name: "Veterinario Solitario",
    badge: "Para independientes",
    usdPrice: 49,
    copPrice: "189.000 COP",
    desc: "Para médicos veterinarios que atienden a domicilio o consultorio individual.",
    features: [
      "1 Médico Veterinario activo",
      "Asistente privada por voz en español (IA)",
      "Navegación 1-tap en Waze y Google Maps",
      "Bóveda y despacho de fórmulas médicas",
      "Portal web para familias y clientes",
      "Sincronización con Google Calendar (BUSY_ONLY)",
    ],
  },
  {
    id: "clinica_domiciliaria" as PlanId,
    name: "Clínica Domiciliaria",
    badge: "Más Popular ⭐",
    popular: true,
    usdPrice: 99,
    copPrice: "389.000 COP",
    desc: "Para equipos en crecimiento con médicos veterinarios y auxiliares en calle.",
    features: [
      "Hasta 6 profesionales (Vets y Auxiliares)",
      "Centro de Despacho en Vivo y Telemetría",
      "Cronómetro de consulta y cascada de retrasos",
      "Gestión de Cobros (Nequi, Bre-B, Efectivo, Tarjeta)",
      "Sirena médica y alertas de urgencia vital P0",
      "Customer Experience Memory (CEM) y Protocolo de Duelo",
      "Simulador de agenda ante imprevistos",
    ],
  },
  {
    id: "red_marca_blanca" as PlanId,
    name: "Red / Marca Blanca",
    badge: "Empresarial",
    usdPrice: 299,
    copPrice: "1.190.000 COP",
    desc: "Para redes de clínicas, hospitales o franquicias veterinarias de alto volumen.",
    features: [
      "Profesionales y sedes ilimitadas",
      "Dominio propio (ej: app.tuclinica.com)",
      "Logotipo, colores y marca institucional",
      "Líneas de WhatsApp Cloud API dedicadas",
      "SLA de soporte prioritario 24/7 y Onboarding VIP",
    ],
  },
];

function ClinicOnboardingPage() {
  const nav = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("clinica_domiciliaria");
  const [currency, setCurrency] = useState<"COP" | "USD">("COP");

  // Form states
  const [clinicName, setClinicName] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Medellín");
  const [country, setCountry] = useState("Colombia");
  const [operationType, setOperationType] = useState<"domicilio" | "mixto" | "urgencias">("domicilio");

  const [loading, setLoading] = useState(false);
  const [registeredOrg, setRegisteredOrg] = useState<{
    id: string;
    name: string;
    slug: string;
    trialDays: number;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim() || !directorName.trim() || !email.trim()) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    setLoading(true);
    // Clinic registration (`register_new_veterinary_organization`) is not backed by the
    // database yet, so no organization is created here.
    toast.error("El registro de clínicas todavía no está disponible. Escríbenos y activamos tu cuenta manualmente.");
    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-primary font-black text-xl">
          <PawPrint className="h-7 w-7" />
          <span>Vet Freedom OS</span>
        </Link>
        <div className="mt-3 inline-block rounded-full bg-emerald-500/10 px-4 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
          🎁 30 DÍAS DE PRUEBA GRATIS · SIN TARJETA DE CRÉDITO OBLIGATORIA
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Activa Vet Freedom OS para tu Veterinaria
        </h1>
        <p className="mt-2 text-base text-muted-foreground max-w-2xl mx-auto">
          La plataforma inteligente que organiza tus citas a domicilio, optimiza rutas en el tráfico
          y te devuelve tiempo y libertad para tu vida personal.
        </p>
      </div>

      {registeredOrg ? (
        /* Pantalla de Éxito / Confirmación */
        <Card className="mt-8 border-2 border-emerald-500/40 bg-emerald-500/5 p-6 sm:p-8 text-center space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Espacio de Trabajo Listo
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground">
              ¡Bienvenido a Vet Freedom OS, {registeredOrg.name}!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
              Tu organización ha sido aprovisionada con éxito en Supabase con aislamiento de datos
              estricto (RLS). Tu periodo de <b>30 días de prueba gratuita</b> está activo desde hoy.
            </p>
          </div>

          <div className="mx-auto max-w-md rounded-2xl bg-card border border-border p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">ID de Organización:</span>
              <span className="font-mono font-bold text-foreground">{registeredOrg.id.slice(0, 18)}...</span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Plan Seleccionado:</span>
              <span className="font-bold text-foreground">
                {PLANS.find((p) => p.id === selectedPlan)?.name}
              </span>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <span className="text-muted-foreground">Prueba Gratuita:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                30 días restantes (Sin cobro anticipado)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Director Médico:</span>
              <span className="font-bold text-foreground">{directorName}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <Link to="/luis">
              <Btn className="w-full sm:w-auto px-8 py-3 text-base">
                <Zap className="mr-2 h-4 w-4" />
                Ingresar al Panel de Dirección
              </Btn>
            </Link>
            <Link to="/demo">
              <Btn variant="outline" className="w-full sm:w-auto">
                <Sparkles className="mr-2 h-4 w-4" />
                Explorar Demo Interactiva
              </Btn>
            </Link>
          </div>
        </Card>
      ) : (
        /* Formulario de Onboarding & Planes */
        <div className="mt-8 space-y-8">
          {/* Selector de Planes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">1. Elige tu Plan</h2>
                <p className="text-xs text-muted-foreground">
                  Puedes cambiar o cancelar tu plan en cualquier momento durante los 30 días de prueba.
                </p>
              </div>

              {/* Selector de Moneda */}
              <div className="flex items-center gap-1 rounded-xl bg-secondary p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCurrency("COP")}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    currency === "COP" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  COP ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`rounded-lg px-2.5 py-1 transition ${
                    currency === "USD" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {PLANS.map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={`cursor-pointer relative flex flex-col justify-between rounded-3xl p-5 transition active:scale-[0.99] border-2 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                            p.popular
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {p.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-foreground">{p.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>

                      <div className="mt-4">
                        <span className="text-2xl font-black text-foreground">
                          {currency === "COP" ? p.copPrice : `$${p.usdPrice} USD`}
                        </span>
                        <span className="text-xs text-muted-foreground"> / mes</span>
                      </div>

                      <ul className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
                        {p.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border">
                      <span
                        className={`block text-center rounded-xl py-2 text-xs font-bold transition ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-secondary text-foreground hover:bg-accent"
                        }`}
                      >
                        {isSelected ? "Plan Seleccionado" : "Seleccionar Plan"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Formulario de Datos de la Clínica */}
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-foreground">2. Datos de tu Veterinaria</h2>
              <p className="text-xs text-muted-foreground">
                Configuraremos tu entorno en Supabase con aislamiento de datos exclusivo para tu equipo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  Nombre de la Veterinaria o Clínica *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Clínica Veterinaria San Roque"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <User className="h-3.5 w-3.5 text-primary" />
                  Nombre del Director / Médico Fundador *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dr. Andrés Felipe Morales"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  Correo Electrónico Profesional *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contacto@veterinaria.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  WhatsApp de Contacto / Notificaciones
                </label>
                <input
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Ciudad Principal de Operación
                </label>
                <input
                  type="text"
                  placeholder="Bogotá, Medellín, Cali, etc."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1.5">
                  <Car className="h-3.5 w-3.5 text-primary" />
                  Modalidad de Atención
                </label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value as any)}
                  className="w-full rounded-2xl border border-border bg-background p-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="domicilio">100% Veterinaria a Domicilio</option>
                  <option value="mixto">Clínica con Consultorio + Domicilios</option>
                  <option value="urgencias">Ambulancia y Urgencias Veterinarias</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-secondary/60 p-4 flex items-start gap-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <b className="text-foreground">Garantía de Privacidad y Soberanía de Datos:</b>
                <p className="mt-0.5 leading-relaxed">
                  Tus historias clínicas, clientes y finanzas se almacenan en una partición de base de datos
                  independiente. Ninguna otra clínica ni terceros tendrán acceso a tu información.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Btn type="submit" disabled={loading} className="w-full py-4 text-base font-extrabold shadow-button">
                {loading ? (
                  "Aprovisionando Organización en Servidor..."
                ) : (
                  <>
                    <span>Activar Mi Clínica (30 Días de Prueba Gratis)</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Btn>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                No requerimos tarjeta de crédito para iniciar. Recibirás acceso inmediato.
              </p>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
