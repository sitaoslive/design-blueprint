/**
 * VET FREEDOM OS — ASISTENTE DE ONBOARDING GUIADO EN 5 PASOS
 * Ruta: /onboarding
 * Diseñado para nuevas clínicas y veterinarios que activan su cuenta o prueba de 30 días.
 * Cero confusión. Pasos claros, visuales y progreso guardado.
 */

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Building2,
  Palette,
  Clock,
  Phone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  Sparkles,
  Stethoscope,
  Car,
  MapPin,
  Send,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { meta } from "@/lib/vf/meta";
import { Card, PageTitle, Btn } from "@/components/vf/ui";
import { enterDemo } from "@/lib/vf/session";

export const Route = createFileRoute("/onboarding")({
  head: () =>
    meta(
      "Configuración Inicial de tu Clínica · Onboarding Vet Freedom OS",
      "Asistente guiado de 5 pasos para configurar tu veterinaria: marca, catálogo de servicios, horarios, WhatsApp y subdominio propio."
    ),
  ssr: false,
  component: ClinicOnboardingWizard,
});

export function ClinicOnboardingWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);

  // Form State
  const [clinicName, setClinicName] = useState("Clínica Veterinaria San Roque");
  const [subdomain, setSubdomain] = useState("sanroque");
  const [directorName, setDirectorName] = useState("Dra. Sofía Morales");
  const [selectedTheme, setSelectedTheme] = useState("mint");
  const [practiceType, setPracticeType] = useState<"domiciliaria" | "clinica" | "mixta">("mixta");
  const [services, setServices] = useState<string[]>([
    "Consulta General a Domicilio",
    "Vacunación Canina & Felina",
    "Desparasitación Interna y Externa",
  ]);
  const [phone, setPhone] = useState("+57 310 987 6543");
  const [zones, setZones] = useState("El Poblado, Envigado, Laureles, Rionegro");
  const [loading, setLoading] = useState(false);

  const themes = [
    { id: "mint", name: "Mint Precision", desc: "Menta fresca y blanco clínico puro (Recomendado)", color: "from-teal-600 to-emerald-700" },
    { id: "botanical", name: "Botanical Luxe", desc: "Verde salvia, crema y fotografía cálida", color: "from-emerald-700 to-green-900" },
    { id: "warm", name: "Warm Companion", desc: "Melocotón, terracota y máxima empatía", color: "from-amber-600 to-orange-700" },
    { id: "midnight", name: "Midnight Clinical", desc: "Azul marino profundo y acentos dorados", color: "from-blue-900 to-indigo-950" },
  ];

  const handleNext = () => {
    if (step === 1 && (!clinicName.trim() || !subdomain.trim())) {
      toast.error("Por favor completa el nombre de tu clínica y subdominio.");
      return;
    }
    if (step < 5) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      enterDemo("administrador", directorName);
      toast.success("¡Tu clínica ha sido configurada y activada con éxito!");
      void nav({ to: "/admin" });
    }, 900);
  };

  const toggleService = (srv: string) => {
    setServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Barra de Progreso de 5 Pasos */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-black text-muted-foreground mb-2">
          <span>Paso {step} de 5</span>
          <span className="text-primary font-bold">
            {step === 1 && "1. Identidad & Subdominio"}
            {step === 2 && "2. Servicios & Práctica"}
            {step === 3 && "3. Horarios & Cobertura"}
            {step === 4 && "4. WhatsApp de Pacientes"}
            {step === 5 && "5. Resumen & Activación"}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Contenido por Paso */}
      <Card className="rounded-[2.5rem] border-border/80 p-6 sm:p-8 shadow-xl">
        {/* PASO 1: Identidad y Subdominio */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary uppercase">
                Paso 1: Identidad de tu Negocio
              </span>
              <h1 className="mt-2 text-2xl font-black text-foreground">
                ¿Cómo se llama tu Veterinaria?
              </h1>
              <p className="text-xs text-muted-foreground">
                Configura el nombre visible, el médico director responsable y tu subdominio exclusivo.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">Nombre de tu Veterinaria</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="Ej. Clínica Veterinaria San Roque"
                  className="mt-1 w-full rounded-2xl bg-secondary/80 px-4 py-3 text-sm font-semibold border border-border"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Médico Director o Responsable</label>
                <input
                  type="text"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  placeholder="Ej. Dra. Sofía Morales"
                  className="mt-1 w-full rounded-2xl bg-secondary/80 px-4 py-3 text-sm font-semibold border border-border"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Tu Subdominio Exclusivo</label>
                <div className="relative mt-1 flex items-center">
                  <span className="absolute left-4 text-xs font-bold text-muted-foreground">https://</span>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="w-full rounded-2xl bg-secondary/80 pl-16 pr-36 py-3 text-sm font-bold text-primary border border-border"
                  />
                  <span className="absolute right-4 text-xs font-bold text-muted-foreground">.alphavisionm.com</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Tus tutores descargarán la aplicación móvil directamente desde esta dirección.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Elige el Estilo Visual (Colección de Diseño)</label>
                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {themes.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setSelectedTheme(th.id)}
                      className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                        selectedTheme === th.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className={`h-8 w-8 rounded-xl bg-gradient-to-br ${th.color} shrink-0`} />
                      <div>
                        <b className="block text-xs text-foreground">{th.name}</b>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{th.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: Tipo de Práctica y Servicios */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary uppercase">
                Paso 2: Servicios y Práctica
              </span>
              <h1 className="mt-2 text-2xl font-black text-foreground">
                ¿Qué tipo de servicios ofreces?
              </h1>
              <p className="text-xs text-muted-foreground">
                Selecciona la modalidad de tu trabajo y activa los servicios iniciales de tu catálogo.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">Modalidad de Atención</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { id: "domiciliaria", label: "Solo Domicilios", icon: Car },
                    { id: "clinica", label: "Sede Física", icon: Building2 },
                    { id: "mixta", label: "Mixta (Ambas)", icon: Stethoscope },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPracticeType(m.id as any)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                          practiceType === m.id
                            ? "border-primary bg-primary/5 text-primary font-bold shadow-sm"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Servicios Iniciales del Catálogo</label>
                <div className="mt-2 space-y-2">
                  {[
                    "Consulta General a Domicilio",
                    "Vacunación Canina & Felina",
                    "Desparasitación Interna y Externa",
                    "Ecografía & Diagnóstico por Imagen",
                    "Cirugía y Procedimientos Menores",
                    "Guardería & Cuidado Especializado",
                  ].map((srv) => (
                    <label
                      key={srv}
                      className="flex items-center gap-3 rounded-2xl border border-border p-3 text-xs font-semibold hover:bg-secondary/40 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={services.includes(srv)}
                        onChange={() => toggleService(srv)}
                        className="h-4 w-4 rounded text-primary focus:ring-primary"
                      />
                      <span>{srv}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 3: Horarios y Cobertura Geográfica */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary uppercase">
                Paso 3: Horarios y Zonas
              </span>
              <h1 className="mt-2 text-2xl font-black text-foreground">
                ¿Dónde y cuándo atiendes?
              </h1>
              <p className="text-xs text-muted-foreground">
                El sistema usará estas zonas para calcular tiempos de viaje y mostrar disponibilidad a tus clientes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">Barrios o Municipios de Cobertura</label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={zones}
                    onChange={(e) => setZones(e.target.value)}
                    placeholder="Ej. El Poblado, Envigado, Laureles, Rionegro"
                    className="w-full rounded-2xl bg-secondary/80 pl-10 pr-4 py-3 text-sm font-semibold border border-border"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Separa con comas las zonas principales de atención.
                </p>
              </div>

              <div className="rounded-2xl border border-border p-4 bg-secondary/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Horario de Atención Predeterminado
                </div>
                <p className="text-xs text-muted-foreground">
                  Lunes a Sábado: 8:00 AM – 6:00 PM (Podrás personalizar turnos específicos en el panel de agenda).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PASO 4: WhatsApp de Pacientes */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary uppercase">
                Paso 4: WhatsApp del Consultorio
              </span>
              <h1 className="mt-2 text-2xl font-black text-foreground">
                Conecta las Notificaciones de tus Pacientes
              </h1>
              <p className="text-xs text-muted-foreground">
                Vet Freedom OS enviará recordatorios de vacunas y confirmaciones de citas usando este número.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground">Número de WhatsApp del Consultorio</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full rounded-2xl bg-secondary/80 pl-10 pr-4 py-3 text-sm font-semibold border border-border"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-700">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Conserje Inteligente 24/7 sin Trabajo Manual
                </div>
                <p className="text-muted-foreground">
                  Tus clientes recibirán la confirmación de la cita, el enlace para ver en tiempo real la llegada del médico y las fórmulas médicas firmadas directamente en su WhatsApp.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PASO 5: Resumen y Activación */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-600 uppercase">
                Paso 5: Resumen y Activación
              </span>
              <h1 className="mt-2 text-2xl font-black text-foreground">
                ¡Tu Clínica está Lista para Operar!
              </h1>
              <p className="text-xs text-muted-foreground">
                Revisa los datos antes de activar tu prueba de 30 días 100% gratuita.
              </p>
            </div>

            <div className="rounded-2xl bg-secondary/60 p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Veterinaria:</span>
                <b className="text-foreground text-sm">{clinicName}</b>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Directora Médica:</span>
                <b className="text-foreground">{directorName}</b>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Subdominio PWA:</span>
                <span className="font-mono font-bold text-primary">https://{subdomain}.alphavisionm.com</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">WhatsApp Conectado:</span>
                <span className="font-semibold text-foreground">{phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Servicios Configurados:</span>
                <span className="font-semibold text-foreground">{services.length} servicios</span>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <b className="text-foreground">Prueba de 30 Días Activada:</b>
                <p className="mt-0.5">
                  No se requiere tarjeta de crédito. Tu entorno cuenta con aislamiento estricto de base de datos garantizado por Supabase RLS.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de Navegación del Asistente */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
          {step > 1 ? (
            <Btn variant="outline" onClick={handleBack} className="text-xs font-bold gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Btn>
          ) : (
            <Link to="/admin" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Cancelar y volver
            </Link>
          )}

          {step < 5 ? (
            <Btn onClick={handleNext} className="text-xs font-bold gap-1.5">
              Siguiente Paso
              <ArrowRight className="h-4 w-4" />
            </Btn>
          ) : (
            <Btn
              onClick={handleFinish}
              disabled={loading}
              className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 shadow-button"
            >
              {loading ? "Activando Organización..." : "¡Activar y Abrir mi Clínica!"}
              <CheckCircle2 className="h-4 w-4" />
            </Btn>
          )}
        </div>
      </Card>
    </div>
  );
}
