import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Crown,
  Sparkles,
  Stethoscope,
  Wrench,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Play,
  Building2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  Lock,
  PhoneCall,
  MapPin,
  Heart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { currentUser } from "@/lib/vf/session";
import { clearVF } from "@/lib/vf/store";
import { visibleAccountProfiles } from "@/lib/vf/roles";
import { Badge } from "@/components/ui/badge";
import {
  useSubdomainResolution,
  AdminAutoRedirect,
} from "@/features/tenant-routing/SubdomainTenantRouter";
import { DrLuisClinicLanding } from "@/features/tenant-routing/DrLuisClinicLanding";
import { WhiteLabelVetClinicLanding } from "@/features/tenant-routing/WhiteLabelVetClinicLanding";
import { WhiteLabelContractorLanding } from "@/features/tenant-routing/WhiteLabelContractorLanding";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => {
    const isLuis =
      typeof window !== "undefined" &&
      (window.location.hostname.startsWith("luis.") ||
        new URLSearchParams(window.location.search).get("subdomain") === "luis" ||
        new URLSearchParams(window.location.search).get("tenant") === "luis");

    if (isLuis) {
      return {
        meta: [
          {
            title: "Vet Life · Dr. Luis Eduardo Ríos | Medicina Veterinaria a Domicilio",
          },
          {
            name: "description",
            content:
              "Atención clínica integral a domicilio en Medellín y Oriente Antioqueño por el Dr. Luis Eduardo Ríos. Registro COMVEZCOL y recetas oficiales Ley 576/2000.",
          },
          {
            property: "og:title",
            content: "Vet Life · Dr. Luis Eduardo Ríos | Veterinaria a Domicilio",
          },
          {
            property: "og:description",
            content:
              "Medicina veterinaria de élite en la comodidad de tu hogar en Medellín, Envigado y Oriente Antioqueño.",
          },
        ],
      };
    }

    return {
      meta: [
        {
          title: "Alpha Vision Method · Sistemas Operativos Verticales para Negocios Reales",
        },
        {
          name: "description",
          content:
            "Plataforma matriz multi-industria. Vet Freedom OS para medicina veterinaria a domicilio y Contractor Field Service OS para servicios de campo y oficios.",
        },
        {
          property: "og:title",
          content: "Alpha Vision Method · Suite Maestra de Sistemas Operativos Verticales",
        },
        {
          property: "og:description",
          content: "Tecnología soberana de élite para clínicas veterinarias y empresas de contratistas.",
        },
      ],
    };
  },
  component: RootSubdomainRouter,
});

function RootSubdomainRouter() {
  const { viewType, tenant, isLoading } = useSubdomainResolution();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 1. Dr. Luis Eduardo Ríos: EXCLUSIVAMENTE Veterinaria a Domicilio (nada más)
  if (viewType === "DR_LUIS_CLINIC") {
    return <DrLuisClinicLanding />;
  }

  // 2. Super Admin Command Center (admin.alphavisionm.com)
  if (viewType === "PLATFORM_ADMIN") {
    return <AdminAutoRedirect />;
  }

  // 3. Clínica Veterinaria Multi-Tenant (<nombreclinica>.alphavisionm.com)
  if (viewType === "WHITE_LABEL_VET") {
    return <WhiteLabelVetClinicLanding tenant={tenant} />;
  }

  // 4. Contratista Multi-Tenant (<nombrecontratista>.alphavisionm.com)
  if (viewType === "WHITE_LABEL_CONTRACTOR") {
    return <WhiteLabelContractorLanding tenant={tenant} />;
  }

  // 5. Plataforma Matriz Central (alphavisionm.com / www.alphavisionm.com)
  return <AlphaVisionMasterLanding />;
}

function AlphaVisionMasterLanding() {
  const nav = useNavigate();
  const [user, setUser] = useState<Awaited<ReturnType<typeof currentUser>> | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"ALL" | "VET" | "CONTRACTORS">("ALL");

  useEffect(() => {
    void currentUser().then(setUser);
  }, []);

  const profiles = user ? visibleAccountProfiles(user.roles) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
      {/* Dynamic Ambient Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[450px] bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent blur-[120px] opacity-80" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[450px] bg-gradient-to-bl from-amber-500/10 via-transparent to-transparent blur-[120px] opacity-80" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-purple-500/5 to-transparent blur-[100px] opacity-60" />
      </div>

      {/* Sovereign Master Navigation Header */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Crown className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-wider uppercase">
                  Alpha Vision Method
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline">
                  Enterprise Suite
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden md:block">
                Sistemas Operativos Verticales para Negocios Reales
              </p>
            </div>
          </Link>

          {/* Nav Items */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/vet"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vet OS (/vet)</span>
            </Link>

            <Link
              to="/contractors"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-amber-400 hover:bg-slate-900 transition flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Contractors (/contractors)</span>
            </Link>

            <Link
              to="/demo-interactiva"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-purple-400 hover:bg-slate-900 transition hidden lg:flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-purple-400" />
              <span>Sala de Cine</span>
            </Link>

            {/* Sovereign Super Admin Entrance */}
            <Link
              to="/admin/login"
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold tracking-wide flex items-center gap-2 shadow-md shadow-amber-500/10 transition hover:scale-105"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Acceso Dueña (Super Admin)</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-6">
        
        {/* Top Sovereign Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Plataforma Matriz Multi-Industria de Alpha Vision Method</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-mono text-[11px]">2 Apps Disponibles</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Sistemas Operativos Verticales para{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Clínicas Veterinarias
          </span>{" "}
          y{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-500">
            Empresas de Contratistas
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Diseñados desde cero para el mundo real. Con PostgreSQL 17 multi-tenant, 32 flujos de automatización en n8n Cloud, inteligencia artificial con Claude 3.5 y soberanía de datos estricta.
        </p>

        {/* Quick App Selector Filter */}
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "ALL"
                ? "bg-slate-800 text-white border border-slate-700 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ver Ambas Plataformas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("VET")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "VET"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vet Freedom OS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CONTRACTORS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "CONTRACTORS"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Contractor OS</span>
          </button>
        </div>

      </section>

      {/* Dual Flagship Product Cards Showcase */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* ======================================================== */}
          {/* CARD 1: VET FREEDOM OS */}
          {/* ======================================================== */}
          {(activeTab === "ALL" || activeTab === "VET") && (
            <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/60 transition duration-300">
              
              {/* Top Accent Light */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-bold gap-1.5 px-3 py-1">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                    PRODUCTO 1: MEDICINA VETERINARIA
                  </Badge>

                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                    Ruta: /vet
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Vet Freedom OS
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    El sistema operativo integral para clínicas veterinarias y médicos a domicilio. Rutas geolocalizadas, triaje inteligente en WhatsApp, recetas Ley 576/2000 con COMVEZCOL y portal familiar estilo Uber.
                  </p>
                </div>

                {/* Real World Success Case Metrics */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">Caso Real de Éxito:</span>
                    <span className="text-emerald-400 font-mono">Dr. Luis Eduardo Ríos</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center">
                    <div>
                      <div className="text-lg font-black text-white font-mono">$1.48M COP</div>
                      <div className="text-[10px] text-slate-400">Proyección Día</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-emerald-400 font-mono">46 Pacientes</div>
                      <div className="text-[10px] text-slate-400">Puente OKVET</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-white font-mono">+35%</div>
                      <div className="text-[10px] text-slate-400">Margen Domicilio</div>
                    </div>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Asistente ejecutivo por voz en español para agendamiento clínico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Firma digital con verificación de matrícula COMVEZCOL (Ley 576/2000)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Rastreo vehicular en vivo para tutores con enlace efímero (/t/:token)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/vet"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-[0.99]"
                  >
                    <span>Ver App & Demo Vet (/vet)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/demo-interactiva"
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    <span>Sala de Cine (6 Videos)</span>
                  </Link>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>¿Tienes una veterinaria?</span>
                  <Link
                    to="/onboarding"
                    className="text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    Probar 30 Días Gratis (/onboarding) →
                  </Link>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* CARD 2: CONTRACTOR FIELD SERVICE OS */}
          {/* ======================================================== */}
          {(activeTab === "ALL" || activeTab === "CONTRACTORS") && (
            <div className="rounded-3xl bg-slate-900/90 border border-amber-500/30 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl shadow-amber-500/10 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/60 transition duration-300">
              
              {/* Top Accent Light */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-bold gap-1.5 px-3 py-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-400" />
                    PRODUCTO 2: SERVICIOS DE CAMPO & CONTRATISTAS
                  </Badge>

                  <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/60">
                    Ruta: /contractors
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Contractor Field Service OS
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    El motor definitivo de conversión y operaciones para contratistas (HVAC, plomería, electricidad, remodelación y pintura). Cotizador digital en campo con margen markup, Kanban de prospectos y bóveda fotográfica antes/después.
                  </p>
                </div>

                {/* Real World Performance Metrics */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-200">Operación Comercial:</span>
                    <span className="text-amber-400 font-mono">Bilingüe (EN / ES)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-center">
                    <div>
                      <div className="text-lg font-black text-white font-mono">$58.5M</div>
                      <div className="text-[10px] text-slate-400">Pipeline Activo</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-amber-400 font-mono">3 Cuadrillas</div>
                      <div className="text-[10px] text-slate-400">Despacho en Calle</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-white font-mono">+40%</div>
                      <div className="text-[10px] text-slate-400">Cierre de Obras</div>
                    </div>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Cotizador Bueno/Mejor/Excelente con markup automático y firma en campo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Bóveda fotográfica antes/después con georreferenciación y sellado de tiempo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Portal de cliente final con marca blanca y liquidación en línea en USD/COP</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/contractors"
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.99]"
                  >
                    <span>Ver App & Demo Contractor (/contractors)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/contractors/demo"
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Demo 8 Pasos (Bilingüe)</span>
                  </Link>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>¿Eres contratista?</span>
                  <Link
                    to="/contractors/leads"
                    className="text-amber-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    Explorar Tablero de Prospectos →
                  </Link>
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* Platform Owner / Super Admin Sovereign Spotlight Section */}
      <section className="relative z-10 bg-slate-900/60 border-t border-b border-slate-800 py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/30 p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
              <Crown className="w-4 h-4 text-amber-400" />
              SALA DE COMANDO DE LA PROPIETARIA
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ¿Eres la dueña de Alpha Vision Method?
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ingresa al Super Admin dedicado para activar claves de licencia, dar de alta nuevas veterinarias en 5 pasos, controlar contratistas y consultar la Academia de la Dueña.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              to="/admin/login"
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition hover:scale-105 active:scale-[0.99]"
            >
              <Crown className="w-5 h-5 text-slate-950" />
              <span>Entrar al Super Admin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin/academia"
              className="py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <span>Academia Dueña</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
              α
            </div>
            <span>Alpha Vision Method © 2026 · Todos los derechos reservados</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/vet" className="hover:text-emerald-400 transition">
              Vet Freedom OS
            </Link>
            <Link to="/contractors" className="hover:text-amber-400 transition">
              Contractor OS
            </Link>
            <Link to="/demo-interactiva" className="hover:text-purple-400 transition">
              Sala de Cine
            </Link>
            <Link to="/admin/login" className="hover:text-amber-400 transition font-bold">
              Super Admin
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
