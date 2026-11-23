import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Crown,
  Building2,
  KeyRound,
  Wrench,
  Palette,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Globe,
  Sliders,
  DollarSign,
  Users,
  Database,
  Layers,
  ChevronRight,
  FileText,
  Clock,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SuperAdminAcademyPage() {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([0]);

  const modules = [
    {
      id: "onboarding-clinicas",
      number: "01",
      title: "Alta y Onboarding de Nuevas Clínicas en 5 Pasos",
      tag: "MULTI-TENANT SAAS",
      duration: "04:30 Minutos",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description:
        "Aprende cómo incorporar a una nueva clínica veterinaria en menos de 3 minutos sin escribir una sola línea de código, aprovisionando su base de datos aislada con PostgreSQL 17 y RLS.",
      steps: [
        "Ingresa al asistente guiado en /onboarding.",
        "Registra los datos legales: Nombre de la clínica, NIT y correo del director médico.",
        "Asigna el subdominio único o slug (ej. /san-roque o sanroque.alphavisionm.com).",
        "Sube el logotipo oficial y define la paleta cromática de la clínica.",
        "Ingresa el token de WhatsApp Business Cloud API para triaje automático y activa el tenant.",
      ],
      actionUrl: "/onboarding",
      actionLabel: "Abrir Asistente de Onboarding (/onboarding)",
      keyTakeaway:
        "Cada clínica queda 100% aislada con su propio organization_id. Sus historias clínicas, recetas y clientes jamás se mezclan con otras organizaciones.",
    },
    {
      id: "licencias-entitlements",
      number: "02",
      title: "Gestión de Licencias, Tokens de 30 Días y Activación de Claves",
      tag: "FACTURACIÓN & SUSCRIPCIONES",
      duration: "03:45 Minutos",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description:
        "Domina el motor de suscripciones y entitlements de Alpha Vision. Aprende a crear enlaces de prueba gratuita de 30 días y habilitar módulos premium bajo demanda.",
      steps: [
        "Abre el inspector de licencias en /admin/inspeccionar-entitlements.",
        "Selecciona el inquilino objetivo (ej. Vet Life Dr. Luis o Clínica San Roque).",
        "Genera un token de prueba de 30 días con 1 clic para compartir por WhatsApp (/try/:token).",
        "Configura el plan SaaS: Starter ($149k COP), Pro ($399k COP) o Enterprise ($890k COP).",
        "Activa módulos avanzados: Tele-triaje nocturno, facturación electrónica DIAN o IA de voz.",
      ],
      actionUrl: "/admin/inspeccionar-entitlements",
      actionLabel: "Abrir Inspector de Licencias y Claves",
      keyTakeaway:
        "Las claves de licencia y tokens de prueba utilizan hashes criptográficos SHA-256 en PostgreSQL 17 con expiración automática de 30 días si no se suscribe.",
    },
    {
      id: "control-contractors",
      number: "03",
      title: "Control y Supervisión Integral de Contractor Field Service OS",
      tag: "EXPANSIÓN MULTI-INDUSTRIA",
      duration: "04:15 Minutos",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      description:
        "Entiende cómo opera el segundo producto estrella de Alpha Vision: el sistema operativo para contratistas de campo (plomería, HVAC, electricidad, remodelaciones).",
      steps: [
        "Accede al Centro de Control de Contratistas en /contractors.",
        "Supervisa el tablero Kanban de leads calificados y conversión en calle.",
        "Inspecciona el cotizador con margen markup automático para cuadrillas.",
        "Revisa la bóveda fotográfica antes/después geolocalizada con sello de tiempo.",
        "Prueba el portal de cliente final con firma de contrato y pago móvil en USD.",
      ],
      actionUrl: "/contractors",
      actionLabel: "Abrir Contractor Field Service OS (/contractors)",
      keyTakeaway:
        "Contractor OS comparte el mismo núcleo arquitectónico de alta seguridad pero está adaptado para oficios de construcción y mantenimiento en USA, Canadá y Colombia.",
    },
    {
      id: "white-label-branding",
      number: "04",
      title: "Estudio White-Label: Cobro por Personalización de Marca",
      tag: "MONETIZACIÓN DE DISEÑO",
      duration: "03:10 Minutos",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      description:
        "Aprende cómo transformar la interfaz de cualquier clínica o contratista inyectando tokens CSS en tiempo real, cobrando tarifas de setup premium.",
      steps: [
        "Entra al Visual White-Label Studio en /admin/estudio-diseno.",
        "Elige entre 8 colecciones arquitectónicas curadas o define colores HEX personalizados.",
        "Ajusta el radio de bordes, tipografías y el estilo de los botones.",
        "Compara la vista previa simultánea en escritorio y móvil en tiempo real.",
        "Presiona 'Publicar Tema': los tokens se sincronizan al instante en la PWA de la clínica.",
      ],
      actionUrl: "/admin/estudio-diseno",
      actionLabel: "Abrir White-Label Studio (/admin/estudio-diseno)",
      keyTakeaway:
        "Cero recompilación: los temas se inyectan en tiempo de ejecución en CSS. Puedes cobrar entre $1.500.000 COP y $3.000.000 COP por este servicio a cada clínica.",
    },
    {
      id: "readiness-produccion",
      number: "05",
      title: "Auditoría de Infraestructura, Conectores y Salida a Producción",
      tag: "GOBERNANZA & SRE",
      duration: "04:50 Minutos",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      description:
        "Aprende a ejecutar las 3 acciones exactas de salida: visto bueno con acta digital SHA-256, conmutación de Meta WhatsApp API y pasarela Wompi.",
      steps: [
        "Ingresa al Tablero de Salida a Producción en /admin/readiness.",
        "Paso 1: Emite la convocatoria formal y el acta de visto bueno del Dr. Luis.",
        "Paso 2: Conmuta send_enabled: true con el token oficial de Meta WhatsApp Cloud API.",
        "Paso 3: Activa la pasarela de pagos Wompi Colombia para cobros automáticos a Bancolombia.",
        "Verifica que las 20 categorías operativas y los 74 criterios de aceptación estén en verde.",
      ],
      actionUrl: "/admin/readiness",
      actionLabel: "Abrir Tablero de Salida a Producción (/admin/readiness)",
      keyTakeaway:
        "Garantiza el 100% de cumplimiento con la Ley 576 de 2000 (cero diagnósticos por IA sin COMVEZCOL) y el modo seguro anti-fraude.",
    },
  ];

  const currentMod = modules[activeModuleIndex] ?? modules[0]!;

  const handleMarkCompleted = (idx: number) => {
    if (!completedModules.includes(idx)) {
      setCompletedModules([...completedModules, idx]);
      const mod = modules[idx];
      if (mod) {
        toast.success(`¡Módulo ${mod.number} completado!`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-105 transition"
            >
              <Crown className="w-5 h-5 text-slate-950" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-wider uppercase">
                  Academia de la Dueña de Plataforma
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Super Admin Hub
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Manual Maestro para Administrar, Escalar y Monetizar Vet Freedom OS & Contractor OS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/demo-interactiva"
              className="text-xs text-slate-400 hover:text-emerald-400 transition font-medium hidden md:inline"
            >
              Ver Academia Vet (/demo-interactiva)
            </Link>
            <span className="text-slate-700 hidden md:inline">•</span>
            <Link
              to="/contractors/demo"
              className="text-xs text-slate-400 hover:text-amber-400 transition font-medium hidden md:inline"
            >
              Ver Demo Contractor (/contractors/demo)
            </Link>
            <Link
              to="/admin"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 transition"
            >
              ← Centro de Mando
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-bold gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              FORMACIÓN EXCLUSIVA PARA LA PROPIETARIA
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Aprende a Operar tu Negocio SaaS como una Experta
            </h1>
            <p className="text-sm text-slate-400">
              Esta academia está completamente separada de las academias de veterinarios y clientes.
              Aquí aprenderás los flujos exactos para dar de alta clínicas, generar claves, cobrar suscripciones y supervisar la infraestructura.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Progreso Maestro</div>
              <div className="text-lg font-black text-amber-400 font-mono">
                {completedModules.length} de {modules.length} Módulos
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm">
              {Math.round((completedModules.length / modules.length) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Module Tabs + Active Lesson Card */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 5 Module Cards */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Plan de Estudio de la Dueña:
            </div>

            {modules.map((m, idx) => {
              const isSelected = activeModuleIndex === idx;
              const isDone = completedModules.includes(idx);

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setActiveModuleIndex(idx);
                    handleMarkCompleted(idx);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition text-left relative overflow-hidden ${
                    isSelected
                      ? "bg-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/10"
                      : "bg-slate-950/70 hover:bg-slate-900/60 border-slate-800/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                          isSelected
                            ? "bg-amber-500 text-slate-950"
                            : isDone
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : m.number}
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${m.badgeColor}`}
                        >
                          {m.tag}
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                          {m.title}
                        </h3>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-500 shrink-0 mt-1">
                      {m.duration}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Module Deep Dive */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
              
              {/* Header of Active Lesson */}
              <div className="space-y-2 border-b border-slate-800 pb-5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${currentMod.badgeColor}`}
                  >
                    MÓDULO {currentMod.number} · {currentMod.tag}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {currentMod.duration}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentMod.title}
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentMod.description}
                </p>
              </div>

              {/* Step-by-Step Procedure */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Procedimiento Operativo Paso a Paso:
                </h4>

                <div className="space-y-2.5">
                  {currentMod.steps.map((step, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80"
                    >
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-mono font-bold text-xs mt-0.5">
                        {sIdx + 1}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-snug">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Architecture / Business Takeaway */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Regla de Oro de la Plataforma:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentMod.keyTakeaway}
                </p>
              </div>

              {/* Direct Action Link */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  to={currentMod.actionUrl as "/"}
                  className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.99]"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>{currentMod.actionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Button
                  variant="outline"
                  onClick={() => {
                    const nextIdx = (activeModuleIndex + 1) % modules.length;
                    setActiveModuleIndex(nextIdx);
                    handleMarkCompleted(nextIdx);
                  }}
                  className="w-full sm:w-auto border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs"
                >
                  Siguiente Lección →
                </Button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500 font-mono">
        Academia de la Dueña · Alpha Vision Method © 2026 · Aislamiento Multi-Tenant Garantizado
      </footer>
    </div>
  );
}
