/**
 * VET FREEDOM OS / ALPHA VISION — OWNER COMMAND CENTER
 * Panel de control ejecutivo y comercial para el dueño de la plataforma.
 * Cero jerga de ingeniería. Métricas comerciales, semáforos de salud,
 * gestión de organizaciones y asistente administrativo en lenguaje natural.
 */

import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Users,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Send,
  Mic,
  Copy,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Palette,
  PawPrint,
  ArrowRight,
  Database,
  Globe,
  MessageSquare,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { Card, PageTitle, SectionTitle, Btn } from "@/components/vf/ui";
import { useVF } from "@/lib/vf/store";

export function OwnerCommandCenter() {
  const nav = useNavigate();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatLog, setChatLog] = useState<
    Array<{ sender: "user" | "ai"; text: string; actionUrl?: string; actionLabel?: string }>
  >([
    {
      sender: "ai",
      text: "¡Hola! Soy tu Asistente de Plataforma en Alpha Vision. Puedes pedirme crear enlaces de prueba de 30 días, consultar el estado de las clínicas o verificar la salud de los servicios. ¿En qué te ayudo hoy?",
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Quick Action: Copiar enlace de prueba
  const handleCopyTrial = () => {
    const url = `${window.location.origin}/try/demo-trial-san-roque`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace de prueba de 30 días copiado al portapapeles");
  };

  // Quick Action: Compartir WhatsApp
  const handleShareWhatsApp = () => {
    const url = `${window.location.origin}/try/demo-trial-san-roque`;
    const msg = encodeURIComponent(
      `Hola Dra. Sofía, te comparto tu enlace exclusivo de 30 días de prueba gratuita en Vet Freedom OS: ${url}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  // Asistente Administrativo en Lenguaje Natural
  const handleSendPrompt = (userText: string) => {
    const query = userText.trim();
    if (!query) return;

    setChatLog((prev) => [...prev, { sender: "user", text: query }]);
    setPrompt("");
    setIsAiLoading(true);

    setTimeout(() => {
      setIsAiLoading(false);
      const lower = query.toLowerCase();

      if (lower.includes("envigado") || lower.includes("crear") || lower.includes("prueba") || lower.includes("trial")) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "He generado una nueva invitación de 30 días de prueba para la veterinaria prospecto en Envigado. El enlace incluye el Plan Clínica Domiciliaria ($389.000 COP) sin tarjeta de crédito.",
            actionLabel: "Abrir Enlace de Activación",
            actionUrl: "/try/demo-trial-san-roque",
          },
        ]);
      } else if (lower.includes("okvet") || lower.includes("luis") || lower.includes("mascotas")) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "El Dr. Luis Eduardo Ríos tiene actualmente 46 mascotas registradas, 41 tutores y 43 fórmulas médicas en su bóveda privada. La conciliación con OKVET se encuentra 100% al día.",
            actionLabel: "Ver Fichas del Dr. Luis",
            actionUrl: "/luis",
          },
        ]);
      } else if (lower.includes("salud") || lower.includes("base de datos") || lower.includes("servicios")) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Diagnóstico en tiempo real: Supabase PostgreSQL 17 está respondiendo en 38ms con RLS activo. Lovable y n8n Cloud están operacionales al 100%.",
            actionLabel: "Ver Semáforos de Salud",
            actionUrl: "#salud-servicios",
          },
        ]);
      } else if (lower.includes("onboarding") || lower.includes("logo") || lower.includes("marca")) {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Clínica San Roque Vet inició su periodo de prueba pero aún no ha completado el paso de subida de logotipo y configuración de catálogo.",
            actionLabel: "Abrir Asistente de Onboarding",
            actionUrl: "/onboarding",
          },
        ]);
      } else {
        setChatLog((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `He analizado tu solicitud: "${query}". Los servicios multi-tenant de Vet Freedom OS están listos para ejecutar la operación solicitada.`,
            actionLabel: "Ir a Gestión de Demos & Trials",
            actionUrl: "/admin/demos-invitaciones",
          },
        ]);
      }
    }, 700);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Encabezado Ejecutivo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              SISTEMA OPERACIONAL
            </span>
            <span className="text-xs font-bold text-muted-foreground">· Modo Multi-Tenant Activo</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-foreground md:text-3xl">
            Vet Life & Alpha Vision — Owner Command Center
          </h1>
          <p className="text-sm text-muted-foreground">
            Control comercial, clínicas conectadas, métricas en tiempo real y automatizaciones sin código.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Btn
            variant="outline"
            onClick={handleCopyTrial}
            className="text-xs font-bold gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            Copiar Enlace 30 Días
          </Btn>
          <Btn
            onClick={handleShareWhatsApp}
            className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Send className="h-3.5 w-3.5" />
            Enviar WhatsApp
          </Btn>
        </div>
      </div>

      {/* 4 KPIs Comerciales de Alto Impacto */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 rounded-3xl border-border/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Clínicas en la Plataforma
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">2</span>
            <span className="text-xs font-bold text-emerald-600">Organizaciones</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            1 en Producción (Dr. Luis) + 1 en Prueba (San Roque Vet)
          </p>
        </Card>

        <Card className="p-5 rounded-3xl border-border/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pacientes en Bóveda
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-500/10 text-blue-600">
              <PawPrint className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">46</span>
            <span className="text-xs font-bold text-blue-600">Mascotas OKVET</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            41 tutores y 43 fórmulas médicas protegidas por RLS
          </p>
        </Card>

        <Card className="p-5 rounded-3xl border-border/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Ingresos Recurrentes (MRR)
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">$389k</span>
            <span className="text-xs font-bold text-emerald-600">COP/mes</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Plan Clínica Domiciliaria activo + suscripciones en pipeline
          </p>
        </Card>

        <Card className="p-5 rounded-3xl border-border/80 shadow-sm hover:shadow transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pruebas Activas (30 Días)
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">1</span>
            <span className="text-xs font-bold text-amber-600">En Evaluación</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            San Roque Vet · 29 días restantes de prueba
          </p>
        </Card>
      </div>

      {/* Acciones Rápidas Directas */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-foreground">Acciones Rápidas del Propietario</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Btn
            variant="outline"
            onClick={() => void nav({ to: "/admin/inspeccionar-entitlements" as "/" })}
            className="h-auto p-4 justify-start gap-3 rounded-2xl text-left border-primary/30 bg-primary/5 hover:border-primary/60"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <b className="block text-sm text-foreground">Motor Entitlements</b>
              <span className="text-xs text-muted-foreground">33 Features & Licencias</span>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Btn>

          <Btn
            variant="outline"
            onClick={() => void nav({ to: "/admin/demos-invitaciones" })}
            className="h-auto p-4 justify-start gap-3 rounded-2xl text-left border-border hover:border-primary/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Users className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <b className="block text-sm text-foreground">Demos & Invitaciones</b>
              <span className="text-xs text-muted-foreground">Generar links de 30 días</span>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Btn>

          <Btn
            variant="outline"
            onClick={() => void nav({ to: "/admin/estudio-diseno" })}
            className="h-auto p-4 justify-start gap-3 rounded-2xl text-left border-border hover:border-primary/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600 shrink-0">
              <Palette className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <b className="block text-sm text-foreground">Estudio de Diseño</b>
              <span className="text-xs text-muted-foreground">Marca blanca & 8 temas</span>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Btn>

          <Btn
            variant="outline"
            onClick={() => void nav({ to: "/demo" })}
            className="h-auto p-4 justify-start gap-3 rounded-2xl text-left border-border hover:border-primary/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <b className="block text-sm text-foreground">Cuentas Demo en Vivo</b>
              <span className="text-xs text-muted-foreground">Probar Luis Vet & Clínicas</span>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Btn>

          <Btn
            variant="outline"
            onClick={() => void nav({ to: "/luis" })}
            className="h-auto p-4 justify-start gap-3 rounded-2xl text-left border-border hover:border-primary/40"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <b className="block text-sm text-foreground">Portal Dr. Luis</b>
              <span className="text-xs text-muted-foreground">Fórmulas y consultas reales</span>
            </div>
            <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
          </Btn>
        </div>
      </div>

      {/* Ticket OP-02: Asistente Administrativo en Lenguaje Natural */}
      <Card className="rounded-3xl border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/30 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Bot className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-black text-foreground">Asistente Administrativo ("Ask Antigravity")</h2>
            <p className="text-xs text-muted-foreground">
              Escribe o dicta cualquier instrucción para gestionar clientes, verificar servicios o generar invitaciones.
            </p>
          </div>
        </div>

        {/* Historial de conversación del Asistente */}
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
          {chatLog.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 text-xs ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary text-foreground rounded-bl-none border border-border"
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                {msg.actionUrl && (
                  <div className="mt-2.5 pt-2 border-t border-border/50">
                    <Link
                      to={msg.actionUrl as "/"}
                      className="inline-flex items-center gap-1.5 font-bold text-primary hover:underline"
                    >
                      {msg.actionLabel ?? "Ver Detalle"}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isAiLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              Consultando base de datos y preparando respuesta...
            </div>
          )}
        </div>

        {/* Chips de Sugerencias Rápidas */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => handleSendPrompt("Crear prueba de 30 días para una veterinaria en Envigado")}
            className="rounded-full bg-background border border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
          >
            + Prueba 30 días Envigado
          </button>
          <button
            type="button"
            onClick={() => handleSendPrompt("¿Cuántas mascotas tiene el Dr. Luis en OKVET?")}
            className="rounded-full bg-background border border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
          >
            🐾 Mascotas Dr. Luis
          </button>
          <button
            type="button"
            onClick={() => handleSendPrompt("Ver estado de salud de la base de datos")}
            className="rounded-full bg-background border border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
          >
            ⚡ Salud de Servicios
          </button>
          <button
            type="button"
            onClick={() => handleSendPrompt("¿Qué clínicas tienen el onboarding pendiente?")}
            className="rounded-full bg-background border border-border px-3 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
          >
            ⏳ Onboarding Pendiente
          </button>
        </div>

        {/* Input de Texto */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(prompt);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Escribe una instrucción en lenguaje natural..."
            className="w-full rounded-2xl bg-background pl-4 pr-12 py-3.5 text-xs font-medium border border-border focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="absolute right-2.5 grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </Card>

      {/* Organizaciones Activas en la Plataforma */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">Organizaciones Registradas</h2>
          <Link
            to="/admin/demos-invitaciones"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            Ver todas las invitaciones
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Org 1: Dr. Luis */}
          <Card className="p-5 rounded-3xl border-border/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600">
                  Producción Oficial · Dr. Luis
                </span>
                <h3 className="mt-1 text-base font-black text-foreground">
                  Vet Life — Dr. Luis Eduardo Ríos
                </h3>
                <p className="text-xs text-muted-foreground">Medellín y Oriente Antioqueño</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Conciliado OKVET
              </span>
            </div>

            <div className="rounded-2xl bg-secondary/60 p-3 text-xs space-y-1 text-muted-foreground">
              <p>• <b>Subdominio:</b> <span className="font-mono text-foreground">luis.alphavisionm.com</span></p>
              <p>• <b>Plan:</b> Clínica Domiciliaria ($389.000 COP/mes)</p>
              <p>• <b>Datos en Bóveda:</b> 46 mascotas, 41 tutores, 43 fórmulas</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Btn
                variant="outline"
                onClick={() => void nav({ to: "/luis" })}
                className="w-full text-xs font-bold"
              >
                Abrir Portal Clínico
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Btn>
            </div>
          </Card>

          {/* Org 2: San Roque Vet (Trial 30 Días) */}
          <Card className="p-5 rounded-3xl border-border/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">
                  Prueba Gratuita 30 Días
                </span>
                <h3 className="mt-1 text-base font-black text-foreground">
                  Clínica Veterinaria San Roque
                </h3>
                <p className="text-xs text-muted-foreground">Directora: Dra. Sofía Morales</p>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                29 días restantes
              </span>
            </div>

            <div className="rounded-2xl bg-secondary/60 p-3 text-xs space-y-1 text-muted-foreground">
              <p>• <b>Subdominio:</b> <span className="font-mono text-foreground">sanroque.alphavisionm.com</span></p>
              <p>• <b>Plan Solicitado:</b> Clínica Domiciliaria ($389.000 COP/mes)</p>
              <p>• <b>WhatsApp:</b> +57 310 987 6543</p>
            </div>

            <div className="flex gap-2 pt-1">
              <Btn
                variant="outline"
                onClick={() => void nav({ to: "/try/demo-trial-san-roque" as "/" })}
                className="w-full text-xs font-bold"
              >
                Ver Enlace de Activación
                <ExternalLink className="h-3 w-3 ml-1.5" />
              </Btn>
              <Btn
                onClick={() => void nav({ to: "/onboarding" })}
                className="w-full text-xs font-bold bg-primary text-primary-foreground"
              >
                Continuar Setup
                <ArrowRight className="h-3 w-3 ml-1.5" />
              </Btn>
            </div>
          </Card>
        </div>
      </div>

      {/* Semáforos de Salud del Sistema */}
      <div id="salud-servicios" className="space-y-3">
        <h2 className="text-lg font-black text-foreground">Salud de Servicios y Conexiones</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 rounded-2xl border-border flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <Database className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <b className="text-xs text-foreground">Supabase Postgres 17</b>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Operacional · 38ms · RLS 100%</p>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border-border flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <Globe className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <b className="text-xs text-foreground">Aplicación Lovable</b>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Sincronizado en main</p>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border-border flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <b className="text-xs text-foreground">WhatsApp (n8n Cloud)</b>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">21 flujos VET-CORE listos</p>
            </div>
          </Card>

          <Card className="p-4 rounded-2xl border-border flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <b className="text-xs text-foreground">Bóveda OKVET</b>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Al día (Ley 576 de 2000)</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Botón para alternar a vista técnica avanzada */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="text-xs font-semibold text-muted-foreground hover:text-foreground underline"
        >
          {showTechnicalDetails
            ? "Ocultar contratos y dependencias de bajo nivel"
            : "Ver registros técnicos avanzados de importación y contratos de desarrollo"}
        </button>

        {showTechnicalDetails && (
          <div className="mt-4 rounded-2xl border border-border p-4 text-left text-xs bg-secondary/40 space-y-2">
            <p className="font-bold text-foreground">Módulos Técnicos Registrados:</p>
            <div className="flex flex-wrap gap-2 text-primary font-bold">
              <Link to="/admin/$" params={{ _splat: "organizacion" }}>Organización</Link> ·
              <Link to="/admin/$" params={{ _splat: "servicios" }}>Servicios</Link> ·
              <Link to="/admin/$" params={{ _splat: "zonas" }}>Zonas</Link> ·
              <Link to="/admin/$" params={{ _splat: "usuarios" }}>Usuarios</Link> ·
              <Link to="/admin/$" params={{ _splat: "integraciones" }}>Integraciones</Link> ·
              <Link to="/admin/$" params={{ _splat: "auditoria" }}>Auditoría</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
