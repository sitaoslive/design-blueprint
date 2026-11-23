import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  PawPrint,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Building2,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { enterDemo } from "@/lib/vf/session";
import { Btn, Card } from "./ui";

/** Cuentas Demo Oficiales del Dr. Luis (Luis Vet) */
export const LUIS_VET_DEMO_PROFILES = [
  {
    role: "luis",
    name: "Dr. Luis Eduardo Ríos",
    label: "Luis Vet · Fundador & Director Médico",
    to: "/luis",
    hint: "Expedientes OKVET oficiales, fórmulas médicas firmadas, visitas y consultas a domicilio",
    badge: "Médico Director",
    icon: Stethoscope,
    color: "from-blue-600 to-indigo-700",
  },
  {
    role: "cliente",
    name: "Andrea Gómez (Luna 🐕)",
    label: "Luis Vet · Tutor de Mascota",
    to: "/cliente",
    hint: "Carné digital de vacunación, telemetría GPS en vivo de la visita y chat directo con la veterinaria",
    badge: "Tutor PWA",
    icon: PawPrint,
    color: "from-emerald-600 to-teal-700",
  },
  {
    role: "auxiliar",
    name: "Camila Rincón",
    label: "Luis Vet · Auxiliar de Campo en Ruta",
    to: "/auxiliar/inicio",
    hint: "Ruta del día en Medellín y Oriente, cronómetro de atención presencial y confirmación de llegada",
    badge: "Auxiliar en Ruta",
    icon: HeartHandshake,
    color: "from-amber-600 to-orange-700",
  },
  {
    role: "administrador",
    name: "Laura Peña",
    label: "Luis Vet · Administración & Equipo",
    to: "/admin/inicio",
    hint: "Panel de control general, facturación en COP, gestión de auxiliares y auditoría clínica",
    badge: "Administración",
    icon: ShieldCheck,
    color: "from-slate-700 to-slate-900",
  },
];

/** Cuenta Demo para Nuevas Clínicas que quieren unirse (SaaS B2B / Prueba 30 Días) */
export const NEW_CLINIC_DEMO_PROFILES = [
  {
    role: "administrador",
    name: "Dra. Sofía Morales",
    clinicName: "Clínica Veterinaria San Roque",
    label: "Nueva Clínica (Trial 30 Días) · San Roque Vet",
    to: "/try/demo-trial-san-roque",
    hint: "Experiencia B2B de una clínica que se une a Vet Freedom OS: 30 días de prueba gratuita, marca blanca propia, catálogo personalizado y sin publicidad de terceros",
    badge: "Prueba 30 Días",
    icon: Building2,
    color: "from-emerald-500 to-green-700",
  },
  {
    role: "administrador",
    name: "Configuración Inicial",
    clinicName: "San Roque Vet",
    label: "Nueva Clínica · Asistente de Onboarding",
    to: "/onboarding",
    hint: "Paso a paso guiado para nuevas clínicas: subida de logotipo, horarios de atención, WhatsApp y servicios",
    badge: "Setup Inicial",
    icon: Sparkles,
    color: "from-purple-600 to-indigo-800",
  },
];

/** Perfiles demo históricos conservados para testing */
export const HISTORICAL_DEMO_PROFILES = [
  { role: "coordinador", name: "Laura Peña", label: "Coordinación", to: "/coordinacion", hint: "Agenda, solicitudes y equipo" },
  { role: "veterinario", name: "Dra. Valeria Torres", label: "Veterinaria", to: "/equipo", hint: "Jornada, ruta y visitas" },
  { role: "recepcion", name: "Sofía Díaz", label: "Recepción", to: "/recepcion/inicio", hint: "Atención y solicitudes" },
  { role: "finanzas", name: "Jorge Ramírez", label: "Finanzas", to: "/finanzas/inicio", hint: "Cobros y conciliación" },
  { role: "cuidador", name: "Mateo Gómez", label: "Cuidador", to: "/cuidador/inicio", hint: "Mascotas autorizadas" },
  { role: "especialista", name: "Dr. Andrés Vela", label: "Especialista", to: "/especialista/inicio", hint: "Remisiones asignadas" },
  { role: "soporte", name: "Soporte técnico", label: "Soporte", to: "/soporte/inicio", hint: "Diagnóstico técnico" },
  { role: "consultor", name: "Alpha Vision", label: "Consultor", to: "/consultor/inicio", hint: "Indicadores agregados" },
];

export function DemoProfiles() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"luis" | "nueva_clinica">("luis");

  const handleEnter = (p: { role: string; name: string; to: string }) => {
    enterDemo(p.role, p.name);
    void nav({ to: p.to as "/" });
  };

  return (
    <div className="space-y-6">
      {/* Selector de Entorno Demo */}
      <div className="flex rounded-2xl bg-secondary/80 p-1.5 shadow-sm">
        <button
          type="button"
          onClick={() => setTab("luis")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-extrabold transition ${
            tab === "luis"
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          <span>Cuentas Demo de Luis Vet</span>
          <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
            Dr. Luis
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab("nueva_clinica")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs sm:text-sm font-extrabold transition ${
            tab === "nueva_clinica"
              ? "bg-background text-emerald-600 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Nueva Clínica (Trial 30 Días)</span>
          <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 font-bold">
            Nueva
          </span>
        </button>
      </div>

      {/* Pestaña: Luis Vet */}
      {tab === "luis" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <b className="text-foreground">Entorno Real y Privado de Vet Life — Dr. Luis Eduardo Ríos:</b>
              <p className="mt-0.5">
                Datos sincronizados con OKVET (46 mascotas, 41 tutores y 43 fórmulas médicas oficiales). Elige cualquiera de los 4 perfiles para explorar la experiencia integral sin clave.
              </p>
            </div>
          </div>

          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
            {LUIS_VET_DEMO_PROFILES.map((p) => {
              const Icon = p.icon;
              return (
                <Btn
                  key={p.name}
                  variant="outline"
                  onClick={() => handleEnter(p)}
                  className="group relative h-full w-full justify-start gap-4 border-border p-5 text-left shadow-soft hover:border-primary/40 hover:bg-accent/40"
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block text-xs font-bold text-primary">{p.label}</span>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {p.badge}
                      </span>
                    </div>
                    <b className="mt-1 block text-base font-black text-foreground">{p.name}</b>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.hint}</p>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1" />
                </Btn>
              );
            })}
          </div>
        </div>
      )}

      {/* Pestaña: Nueva Clínica que quiere unirse */}
      {tab === "nueva_clinica" && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-muted-foreground flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <b className="text-foreground">Experiencia de Nueva Clínica Prospecto (Demostración B2B):</b>
              <p className="mt-0.5">
                Simula la experiencia de una clínica veterinaria externa (<b>Clínica San Roque Vet</b>) que ingresa mediante un enlace de prueba de 30 días con marca blanca y sin menciones comerciales.
              </p>
            </div>
          </div>

          <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
            {NEW_CLINIC_DEMO_PROFILES.map((p) => {
              const Icon = p.icon;
              return (
                <Btn
                  key={p.name}
                  variant="outline"
                  onClick={() => handleEnter(p)}
                  className="group relative h-full w-full justify-start gap-4 border-border p-5 text-left shadow-soft hover:border-emerald-500/40 hover:bg-emerald-50/20"
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${p.color} text-white shadow-sm`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block text-xs font-bold text-emerald-600">{p.label}</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {p.badge}
                      </span>
                    </div>
                    <b className="mt-1 block text-base font-black text-foreground">{p.name}</b>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.hint}</p>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-emerald-600 transition group-hover:translate-x-1" />
                </Btn>
              );
            })}
          </div>

          <div className="rounded-2xl bg-secondary/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              ¿Quieres registrar otra clínica con un enlace personalizado?
            </p>
            <div className="mt-2 flex justify-center gap-3">
              <Btn
                variant="ghost"
                size="sm"
                onClick={() => void nav({ to: "/registro-clinica" })}
                className="text-xs font-bold text-primary"
              >
                Ir a Registro Público de Clínicas
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Perfiles históricos colapsables */}
      <details className="mt-4 border-t border-border pt-4">
        <summary className="cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground">
          Ver perfiles secundarios (Coordinación, Veterinaria, Recepción, Finanzas, etc.)
        </summary>
        <div className="mt-3 grid auto-rows-fr gap-2.5 sm:grid-cols-2">
          {HISTORICAL_DEMO_PROFILES.map((p) => (
            <Btn
              key={p.role}
              variant="ghost"
              size="sm"
              onClick={() => handleEnter(p)}
              className="h-auto justify-start border border-border/50 p-3 text-left hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-primary">{p.label}</span>
                <p className="text-xs font-bold text-foreground">{p.name}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Btn>
          ))}
        </div>
      </details>
    </div>
  );
}
