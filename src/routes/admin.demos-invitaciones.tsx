/**
 * VET FREEDOM OS — PANEL SUPER ADMIN: DEMOS, INVITACIONES Y PRUEBAS 30 DÍAS
 * Ruta: /admin/demos-invitaciones
 * Permite al Super Admin de Alpha Vision Method gestionar la demo pública,
 * generar links únicos de prospectos y crear invitaciones de prueba de 30 días.
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Link2,
  Copy,
  Check,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Send,
  UserCheck,
  Clock,
  ChevronRight,
  Eye,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { meta } from "@/lib/vf/meta";
import { Card, PageTitle, SectionTitle, Btn, QuickAction } from "@/components/vf/ui";

export const Route = createFileRoute("/admin/demos-invitaciones")({
  head: () => meta("Demos, Invitaciones & Pruebas 30 Días", "Panel de control comercial de Alpha Vision Method"),
  ssr: false,
  component: AdminDemosInvitationsPage,
});

export function AdminDemosInvitationsPage() {
  const [prospectName, setProspectName] = useState("");
  const [prospectPlan, setProspectPlan] = useState<"solitario" | "clinica" | "red">("clinica");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active trial customers sample
  const trials = [
    {
      id: "org-trial-1",
      name: "Veterinaria Guarne Campestre",
      director: "Dr. Carlos Duque",
      plan: "Clínica Domiciliaria",
      daysLeft: 26,
      phone: "+57 312 456 7890",
      status: "Activo (Día 4)",
    },
    {
      id: "org-trial-2",
      name: "Dra. Marcela Vet Domicilios",
      director: "Dra. Marcela Cano",
      plan: "Veterinario Solitario",
      daysLeft: 18,
      phone: "+57 301 987 6543",
      status: "Activo (Día 12)",
    },
  ];

  const handleGenerateTrialLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prospectName.trim()) {
      toast.error("Ingresa el nombre de la clínica prospecto.");
      return;
    }

    const token = `TRY-${prospectName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)}-${prospectPlan}-${Math.random().toString(36).slice(2, 6)}`;
    const url = `https://alphavisionm.com/try/${token}`;
    setGeneratedLink(url);
    toast.success(`Enlace de 30 días generado para ${prospectName}`);
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    void navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Enlace copiado al portapapeles");
    setTimeout(() => setCopied(false), 3000);
  };

  const shareWhatsApp = () => {
    if (!generatedLink) return;
    const msg = `¡Hola! Te comparto tu invitación exclusiva para activar 30 días de prueba gratuita en Vet Freedom OS (Alpha Vision Method): ${generatedLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-6 pb-12">
      <PageTitle
        title="Demos, Invitaciones & Trials 30 Días"
        subtitle="Control central de accesos comerciales, entornos de prueba y enlaces para prospectos"
      />

      {/* Grid de Estado de los Entornos Principales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Tarjeta 1: Demo Pública */}
        <Card className="rounded-3xl p-5 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <b className="text-base text-foreground">Demo Comercial Pública</b>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
              Activo en Vivo
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Entorno interactivo bilingüe con datos sintéticos para captación abierta de clientes.
          </p>
          <div className="flex items-center justify-between rounded-2xl bg-secondary/70 p-3 text-xs">
            <span className="font-mono text-muted-foreground">alphavisionm.com/demo</span>
            <Link to="/demo" target="_blank" className="font-bold text-primary flex items-center gap-1 hover:underline">
              Abrir <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        {/* Tarjeta 2: Entorno Privado Dr. Luis Ríos */}
        <Card className="rounded-3xl p-5 border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
              <b className="text-base text-foreground">Entorno Privado Dr. Luis</b>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              Cliente #1 Operativo
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Bóveda aislada con 46 mascotas, 41 tutores y fórmulas de OKVET (Medellín & Oriente).
          </p>
          <div className="flex items-center justify-between rounded-2xl bg-secondary/70 p-3 text-xs">
            <span className="font-mono text-muted-foreground">luis.alphavisionm.com (/luis)</span>
            <Link to="/luis" className="font-bold text-primary flex items-center gap-1 hover:underline">
              Ir al Panel <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Generador de Invitaciones de Prueba de 30 Días */}
      <SectionTitle>Generador de Invitaciones Personalizadas (30 Días Gratis)</SectionTitle>
      <Card className="rounded-3xl p-6 shadow-sm border border-border">
        <form onSubmit={handleGenerateTrialLink} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-foreground">Nombre de la Clínica Prospecto</label>
              <input
                type="text"
                required
                placeholder="Ej. Clínica San Lucas, Dr. Felipe Vet"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                className="mt-1 w-full rounded-2xl bg-accent px-4 py-2.5 text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Plan Comercial a Ofrecer</label>
              <select
                value={prospectPlan}
                onChange={(e) => setProspectPlan(e.target.value as any)}
                className="mt-1 w-full rounded-2xl bg-accent px-4 py-2.5 text-sm font-medium"
              >
                <option value="solitario">Veterinario Solitario ($189.000 COP/mes)</option>
                <option value="clinica">Clínica Domiciliaria ($389.000 COP/mes)</option>
                <option value="red">Red / Marca Blanca ($1.190.000 COP/mes)</option>
              </select>
            </div>
          </div>

          <Btn type="submit" className="shadow-button">
            <Plus className="h-4 w-4 mr-1.5" />
            Generar Enlace Único de Activación
          </Btn>

          {generatedLink && (
            <div className="mt-4 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
              <span className="text-xs font-bold text-primary">Enlace de Activación Creado:</span>
              <p className="font-mono text-sm font-bold text-foreground break-all">{generatedLink}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Btn type="button" onClick={copyToClipboard} variant="soft" className="gap-1.5 text-xs">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "¡Copiado!" : "Copiar Enlace"}
                </Btn>
                <Btn type="button" onClick={shareWhatsApp} className="gap-1.5 text-xs shadow-button">
                  <Send className="h-3.5 w-3.5" />
                  Enviar por WhatsApp
                </Btn>
              </div>
            </div>
          )}
        </form>
      </Card>

      {/* Organizaciones Activas en Periodo de Prueba */}
      <SectionTitle>Clínicas en Prueba de 30 Días (Alpha Vision)</SectionTitle>
      <div className="space-y-3">
        {trials.map((t) => (
          <Card key={t.id} className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <b className="text-base text-foreground block">{t.name}</b>
              <span className="text-xs text-muted-foreground">
                Director: {t.director} · Plan: <b>{t.plan}</b> · Tel: {t.phone}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700">
                <Clock className="h-3 w-3" /> {t.daysLeft} días restantes
              </span>
              <span className="text-xs font-bold text-muted-foreground">{t.status}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
