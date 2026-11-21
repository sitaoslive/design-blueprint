import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, PawPrint, ShieldCheck, Stethoscope, HeartHandshake } from "lucide-react";
import { enterDemo } from "@/lib/vf/session";
import { Btn } from "./ui";

/** One tap enters a role's dashboard with sample data — no sign-in. */
export const DEMO_PROFILES = [
  {
    role: "cliente",
    name: "Andrea Gómez",
    label: "Cliente",
    to: "/cliente",
    hint: "Mascotas, citas, documentos y pagos",
  },
  {
    role: "administrador",
    name: "Laura Peña",
    label: "Administración",
    to: "/admin/inicio",
    hint: "Configuración, usuarios, integraciones y módulos",
  },
  {
    role: "luis",
    name: "Dr. Luis",
    label: "Luis · Dueño y Veterinario",
    to: "/luis",
    hint: "Dirección y atención de pacientes",
  },
  {
    role: "coordinador",
    name: "Laura Peña",
    label: "Coordinación",
    to: "/coordinacion",
    hint: "Agenda, solicitudes, equipo y WhatsApp",
  },
  {
    role: "veterinario",
    name: "Dra. Valeria Torres",
    label: "Veterinaria",
    to: "/equipo",
    hint: "Jornada, ruta y visitas",
  },
  {
    role: "auxiliar",
    name: "Camila Rincón",
    label: "Auxiliar",
    to: "/auxiliar/inicio",
    hint: "Sus visitas y tareas asignadas",
  },
  {
    role: "recepcion",
    name: "Sofía Díaz",
    label: "Recepción",
    to: "/recepcion/inicio",
    hint: "Atención y solicitudes",
  },
  {
    role: "finanzas",
    name: "Jorge Ramírez",
    label: "Finanzas",
    to: "/finanzas/inicio",
    hint: "Cobros y conciliación",
  },
  {
    role: "cuidador",
    name: "Mateo Gómez",
    label: "Cuidador",
    to: "/cuidador/inicio",
    hint: "Mascotas que le autorizaron",
  },
  {
    role: "especialista",
    name: "Dr. Andrés Vela",
    label: "Especialista",
    to: "/especialista/inicio",
    hint: "Remisiones asignadas",
  },
  {
    role: "soporte",
    name: "Soporte técnico",
    label: "Soporte",
    to: "/soporte/inicio",
    hint: "Diagnóstico técnico",
  },
  {
    role: "consultor",
    name: "Alpha Vision",
    label: "Consultor",
    to: "/consultor/inicio",
    hint: "Indicadores agregados",
  },
];

export function DemoProfiles() {
  const nav = useNavigate();
  const active = ["cliente", "administrador", "luis", "auxiliar"];
  const icons = {
    cliente: PawPrint,
    administrador: ShieldCheck,
    luis: Stethoscope,
    auxiliar: HeartHandshake,
  };
  const render = (p: (typeof DEMO_PROFILES)[number]) => {
    const Icon = icons[p.role as keyof typeof icons] ?? ShieldCheck;
    return (
      <Btn
        key={p.role}
        variant="outline"
        onClick={() => {
          enterDemo(p.role, p.name);
          void nav({ to: p.to as "/" });
        }}
        className="group h-full w-full justify-start gap-4 border-border p-5 text-left shadow-soft hover:border-primary/40"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent text-sage-foreground">
          <Icon className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold text-primary">{p.label}</span>
          <b className="mt-1 block text-lg">{p.name}</b>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1" />
      </Btn>
    );
  };
  return (
    <>
      <div className="grid auto-rows-fr gap-3 sm:grid-cols-2">
        {DEMO_PROFILES.filter((profile) => active.includes(profile.role)).map(render)}
      </div>
      <details className="mt-5 border-t border-border pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">
          Perfiles demo históricos conservados
        </summary>
        <div className="mt-4 grid auto-rows-fr gap-3 sm:grid-cols-2">
          {DEMO_PROFILES.filter((profile) => !active.includes(profile.role)).map(render)}
        </div>
      </details>
    </>
  );
}
