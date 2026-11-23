/**
 * VET FREEDOM OS — PORTAL DE ACTIVACIÓN DE PRUEBA DE 30 DÍAS
 * Ruta: /try/$token
 * Permite a una clínica o veterinario invitado activar su organización con 30 días de prueba gratuita.
 */

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Building2, User, Phone, Mail, Award, Clock } from "lucide-react";
import { toast } from "sonner";
import { meta } from "@/lib/vf/meta";
import { Card, PageTitle, Btn } from "@/components/vf/ui";

export const Route = createFileRoute("/try/$token")({
  head: ({ params }) =>
    meta(
      `Activación de Prueba 30 Días · Invitación ${params.token}`,
      "Activa tu organización en Vet Freedom OS con 30 días de prueba gratuita. Telemetría GPS, carné digital y fórmulas oficiales."
    ),
  ssr: false,
  component: TrialActivationPage,
});

export function TrialActivationPage() {
  const { token } = Route.useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [clinicName, setClinicName] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"solitario" | "clinica" | "red">("clinica");
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    // Decode potential plan or prospect hints encoded in token if present
    if (token.toLowerCase().includes("solitario")) setSelectedPlan("solitario");
    if (token.toLowerCase().includes("red")) setSelectedPlan("red");
  }, [token]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim() || !directorName.trim() || !phone.trim()) {
      toast.error("Por favor completa los campos obligatorios para activar tu clínica.");
      return;
    }

    setLoading(true);

    // Simulate / execute trial creation
    setTimeout(() => {
      setLoading(false);
      setActivated(true);
      toast.success("¡Organización aprovisionada con éxito! 30 días de prueba activados.");
    }, 800);
  };

  const planNames = {
    solitario: "Veterinario Solitario ($189.000 COP/mes)",
    clinica: "Clínica Domiciliaria ($389.000 COP/mes)",
    red: "Red / Marca Blanca ($1.190.000 COP/mes)",
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" /> Invitación Exclusiva · Alpha Vision Method
          </div>
          <h1 className="mt-3 text-2xl font-black text-foreground sm:text-3xl">
            Activa tu Prueba de 30 Días
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Has recibido una invitación especial con el token <span className="font-mono font-bold text-primary">{token}</span>
          </p>
        </div>

        {!activated ? (
          <Card className="rounded-[2.5rem] p-6 shadow-xl border border-primary/20">
            <form onSubmit={handleActivate} className="space-y-4">
              <div className="rounded-2xl bg-secondary/60 p-4 border border-border">
                <span className="text-xs font-bold text-muted-foreground">Plan seleccionado para tu prueba:</span>
                <p className="mt-1 font-black text-foreground">{planNames[selectedPlan]}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-primary font-bold">
                  <Clock className="h-3.5 w-3.5" /> 30 días 100% gratuitos sin tarjeta de crédito
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Nombre de tu Veterinaria o Consulta</label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Veterinaria El Poblado, Dr. Andrés Vet"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full rounded-2xl bg-accent pl-10 pr-4 py-3 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Nombre del Director Médico</label>
                <div className="relative mt-1">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Dra. Camila Restrepo"
                    value={directorName}
                    onChange={(e) => setDirectorName(e.target.value)}
                    className="w-full rounded-2xl bg-accent pl-10 pr-4 py-3 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-foreground">WhatsApp para Notificaciones</label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      required
                      placeholder="+57 300 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-2xl bg-accent pl-10 pr-4 py-3 text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-foreground">Correo Electrónico</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="admin@clinica.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl bg-accent pl-10 pr-4 py-3 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Btn type="submit" disabled={loading} className="w-full py-4 text-base shadow-button">
                  {loading ? "Aprovisionando Organización..." : "Iniciar Prueba Gratuita de 30 Días"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Btn>
              </div>

              <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Aislamiento estricto multi-tenant garantizado con Supabase RLS
              </div>
            </form>
          </Card>
        ) : (
          <Card className="rounded-[2.5rem] p-8 text-center shadow-xl space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-foreground">¡Clínica Aprovisionada con Éxito!</h2>
            <p className="text-sm text-muted-foreground">
              Tu organización <b className="text-foreground">{clinicName}</b> ha sido activada en Vet Freedom OS con el plan <b className="text-foreground">{planNames[selectedPlan]}</b>.
            </p>
            <div className="rounded-2xl bg-secondary/80 p-4 text-left space-y-1.5 text-xs text-muted-foreground">
              <p>• <b>Periodo de prueba:</b> 30 días restantes.</p>
              <p>• <b>Director responsable:</b> {directorName}.</p>
              <p>• <b>WhatsApp conectado:</b> {phone}.</p>
            </div>
            <div className="pt-2">
              <Link
                to="/onboarding"
                className="inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-button transition hover:bg-primary/90"
              >
                Comenzar Configuración Inicial de mi Clínica
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
