import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  Play,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  PhoneCall,
  Heart,
  FileText,
  Smartphone,
  ChevronRight,
  Building2,
  Bot,
  Zap,
  Lock,
} from "lucide-react";
import { meta } from "@/lib/vf/meta";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vet")({
  head: () =>
    meta(
      "Vet Freedom OS · El Sistema Operativo Veterinario a Domicilio",
      "Software clínico integral para veterinarias y médicos a domicilio. Rutas inteligentes, triaje por WhatsApp, recetas COMVEZCOL Ley 576/2000 y portal familiar estilo Uber."
    ),
  component: VetSalesAndDemoPage,
});

function VetSalesAndDemoPage() {
  const [activeTab, setActiveTab] = useState<"luis" | "valeria" | "camila" | "cliente">("luis");

  const previewTabs = [
    {
      id: "luis" as const,
      name: "Dr. Luis Eduardo Ríos",
      role: "DIRECCIÓN MÉDICA & SOBERANÍA",
      badge: "Director Médico",
      earnings: "$1.480.000 COP",
      subtitle: "Briefing ejecutivo diario, proyección en COP y control de pacientes críticos.",
      screenUrl: "/luis",
      screenText: "Abrir Centro de Mando Dr. Luis (/luis)",
      highlights: [
        "Proyección de ingresos en COP en tiempo real ($1.480.000 COP hoy)",
        "Control de 5 citas prioritarias entre Medellín, Envigado y Rionegro",
        "Asistente por voz para consultar agenda y reprogramar en segundos",
        "Compuerta de firma COMVEZCOL para recetas médicas oficiales",
      ],
      mockupData: {
        title: "Centro Ejecutivo · Dr. Luis Ríos",
        metricLabel: "Ingresos Proyectados Hoy",
        metricVal: "$1.480.000 COP",
        submetric: "5 Visitas Domiciliarias Programadas",
        status: "Soberanía Médica Activa · Ley 576/2000",
      },
    },
    {
      id: "valeria" as const,
      name: "Dra. Valeria Gómez",
      role: "MÉDICO VETERINARIO EN TERRENO",
      badge: "Atención Clínica",
      earnings: "Ruta Llanogrande",
      subtitle: "Desplazamiento optimizado en Oriente Antioqueño y dictado SOAP por voz.",
      screenUrl: "/equipo",
      screenText: "Abrir Vista de Equipo Clínico (/equipo)",
      highlights: [
        "Hoja de ruta con tiempos de traslado calculados (buffer de 35 min)",
        "Dictado de notas clínicas SOAP directamente desde el celular",
        "Funcionamiento offline resiliente ante pérdida de señal en veredas",
        "Liquidación automática de honorarios al 50% por consulta completada",
      ],
      mockupData: {
        title: "Ruta del Día · Dra. Valeria Gómez",
        metricLabel: "Próxima Parada en Terreno",
        metricVal: "Paciente Luna (Golden)",
        submetric: "Llanogrande · Llegada estimada: 10:45 AM",
        status: "Notas SOAP Listas para Dictado por Voz",
      },
    },
    {
      id: "camila" as const,
      name: "Camila Restrepo",
      role: "COORDINADORA DE DESPACHO & TRIAJE",
      badge: "Coordinación y Logística",
      earnings: "4 Despachos Activos",
      subtitle: "Triaje automático por WhatsApp y emisión de enlaces de seguimiento estilo Uber.",
      screenUrl: "/coordinacion",
      screenText: "Abrir Bandeja de Coordinación (/coordinacion)",
      highlights: [
        "Canalización unificada de chats de WhatsApp Business Cloud API",
        "Clasificación automática de triaje: Urgencia vs Consulta de Rutina",
        "Despacho geográfico al veterinario más cercano por zonas",
        "Generación instantánea de enlaces efímeros de rastreo (/t/:token)",
      ],
      mockupData: {
        title: "Bandeja de Despacho · Camila Restrepo",
        metricLabel: "Solicitudes de Triaje WhatsApp",
        metricVal: "12 Conversaciones Hoy",
        submetric: "3 Citas Asignadas · 1 Tele-triaje en curso",
        status: "Modo Seguro: send_enabled verificado",
      },
    },
    {
      id: "cliente" as const,
      name: "Carolina Gómez & Luna",
      role: "PORTAL FAMILIAR DEL PACIENTE",
      badge: "Tutor / Dueño de Mascota",
      earnings: "Tarjeta de Salud Activa",
      subtitle: "Rastreo vehicular en mapa satelital y pago inmediato por Nequi/Wompi.",
      screenUrl: "/cliente",
      screenText: "Abrir Portal Familiar (/cliente)",
      highlights: [
        "Visualización en tiempo real del vehículo del doctor acercándose al hogar",
        "Historial de vacunas, desparasitaciones y recetas oficiales en el celular",
        "Liquidación en línea sin efectivo mediante pasarela segura Wompi/Nequi",
        "Recordatorios automáticos de refuerzos preventivos por WhatsApp",
      ],
      mockupData: {
        title: "Portal Familiar · Mascota Luna",
        metricLabel: "Estado del Servicio Domiciliario",
        metricVal: "Dr. Luis en Camino",
        submetric: "Tiempo estimado de llegada: 18 minutos",
        status: "Fórmula Médica Firmada y Descargable",
      },
    },
  ];

  const currentTab = previewTabs.find((t) => t.id === activeTab) ?? previewTabs[0]!;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Stethoscope className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-wider uppercase">
                  Vet Freedom OS
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Por Alpha Vision
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">El Sistema Operativo Veterinario a Domicilio</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/demo-interactiva"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-400" />
              <span>Sala de Cine (6 Videos)</span>
            </Link>

            <Link
              to="/onboarding"
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 transition hidden sm:inline"
            >
              Probar 30 Días Gratis
            </Link>

            <Link
              to="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 transition"
            >
              ← Portal Matriz
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-14 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full text-center space-y-6">
        <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-xs font-bold gap-1.5 px-3 py-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          CASO REAL DE ÉXITO EN MEDELLÍN Y ORIENTE ANTIOQUEÑO
        </Badge>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Transforma tu Práctica Veterinaria en una{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Empresa Rentable, Libre y Escalable
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Diseñado específicamente para veterinarias y médicos a domicilio. Elimina el desorden de WhatsApp, optimiza tus rutas en calle, cumple con la Ley 576 de 2000 y ofrece a tus clientes una experiencia digna de Uber.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/onboarding"
            className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-700 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Crear mi Clínica en 3 Minutos (/onboarding)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/demo-interactiva"
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Ver Video-Tours Interactivos</span>
          </Link>
        </div>
      </section>

      {/* Interactive Live Demo Preview Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full space-y-8">
        <div className="text-center space-y-2">
          <Badge className="bg-slate-900 border-slate-800 text-slate-400 text-xs font-mono">
            SIMULADOR INTERACTIVO EN VIVO
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Explora Vet Freedom OS a través de sus 4 Roles Clave
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Haz clic en cada rol para ver cómo el sistema resuelve la jornada real de médicos, coordinadores y tutores.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800">
          {previewTabs.map((t) => {
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`p-3 rounded-xl text-left transition flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-950 border border-emerald-500/40 text-white shadow-lg shadow-emerald-500/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-950/40"
                }`}
              >
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  {t.badge}
                </div>
                <div className="text-xs font-bold truncate text-slate-100">
                  {t.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Showcase Box */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-2xl backdrop-blur-xl">
          
          {/* Left Column: Role Details & Highlights */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800/60 inline-block">
                {currentTab.role}
              </span>
              <h3 className="text-2xl font-black text-white">{currentTab.name}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{currentTab.subtitle}</p>
            </div>

            <div className="space-y-2.5">
              {currentTab.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to={currentTab.screenUrl as "/"}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition active:scale-[0.99]"
              >
                <span>{currentTab.screenText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Simulated Screen Display */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">
                    {currentTab.mockupData.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  SIMULACIÓN EN VIVO
                </span>
              </div>

              <div className="space-y-3 py-2">
                <div className="text-xs text-slate-400">{currentTab.mockupData.metricLabel}</div>
                <div className="text-3xl font-black text-white font-mono tracking-tight text-emerald-300">
                  {currentTab.mockupData.metricVal}
                </div>
                <div className="text-xs text-slate-300 font-medium">
                  {currentTab.mockupData.submetric}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {currentTab.mockupData.status}
                </span>
                <span className="text-emerald-400 font-mono font-bold">100% OK</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Tiers Section */}
      <section className="relative z-10 bg-slate-900/60 border-t border-b border-slate-800 py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-xs font-mono font-bold">
              PLANES TRANSPARENTES EN COP
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Invierte en la Eficiencia de tu Clínica
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Sin costos ocultos ni permanencia obligatoria. Todos los planes incluyen 30 días de prueba gratuita.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Tier 1: Solo Vet */}
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Médico Independiente</h3>
                  <p className="text-xs text-slate-400">Para veterinarios independientes a domicilio.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">$149.000</span>
                  <span className="text-xs text-slate-400">COP / mes</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1 Médico habilitado COMVEZCOL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Agenda móvil con rutas optimizadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fórmulas oficiales Ley 576/2000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Portal familiar para 100 tutores</span>
                  </div>
                </div>
              </div>

              <Link
                to="/onboarding"
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition block"
              >
                Comenzar Prueba de 30 Días
              </Link>
            </div>

            {/* Tier 2: Clinica Pro (Highlighted) */}
            <div className="rounded-3xl bg-slate-900 border-2 border-emerald-500 p-6 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-emerald-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                Plan Más Recomendado
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Clínica Pro</h3>
                  <p className="text-xs text-slate-400">Para clínicas veterinarias y equipos de campo.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono text-emerald-300">
                    $399.000
                  </span>
                  <span className="text-xs text-slate-400">COP / mes</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hasta 5 Veterinarios y Auxiliares</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Triaje automático por WhatsApp 24/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Rastreo estilo Uber para tutores (/t/:token)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Puente de importación asistida OKVET</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pasarela de pagos en línea (Wompi/Nequi)</span>
                  </div>
                </div>
              </div>

              <Link
                to="/onboarding"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider text-center transition block shadow-lg shadow-emerald-500/20"
              >
                Activar Clínica Pro (30 Días Gratis)
              </Link>
            </div>

            {/* Tier 3: Red Multi-Sede */}
            <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Red Multi-Sede</h3>
                  <p className="text-xs text-slate-400">Para hospitales veterinarios y franquicias.</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono">$890.000</span>
                  <span className="text-xs text-slate-400">COP / mes</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Veterinarios y sedes ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Personalización White-Label completa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Subdominio propio y WhatsApp exclusivo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Soporte prioritario 24/7 y SLA garantizado</span>
                  </div>
                </div>
              </div>

              <Link
                to="/onboarding"
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition block"
              >
                Consultar Plan Red Multi-Sede
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-8 text-center text-xs text-slate-500 font-mono">
        Vet Freedom OS · Alpha Vision Method © 2026 · Cumplimiento Ley 576 de 2000 (COMVEZCOL)
      </footer>

    </div>
  );
}
