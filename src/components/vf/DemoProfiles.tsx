import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { enterDemo } from "@/lib/vf/session";

/** One tap enters a role's dashboard with sample data — no sign-in. */
export const DEMO_PROFILES = [
  { role: "cliente", name: "Andrea Gómez", label: "Cliente", to: "/cliente", hint: "Mascotas, citas, documentos y pagos" },
  { role: "administrador", name: "Laura Peña", label: "Administración", to: "/admin/inicio", hint: "Configuración, usuarios, integraciones y módulos" },
  { role: "luis", name: "Dr. Luis", label: "Dirección", to: "/luis", hint: "Panel del director y asistente" },
  { role: "coordinador", name: "Laura Peña", label: "Coordinación", to: "/coordinacion", hint: "Agenda, solicitudes, equipo y WhatsApp" },
  { role: "veterinario", name: "Dra. Valeria Torres", label: "Veterinaria", to: "/equipo", hint: "Jornada, ruta y visitas" },
  { role: "auxiliar", name: "Camila Rincón", label: "Auxiliar", to: "/auxiliar/inicio", hint: "Sus visitas y tareas asignadas" },
  { role: "recepcion", name: "Sofía Díaz", label: "Recepción", to: "/recepcion/inicio", hint: "Atención y solicitudes" },
  { role: "finanzas", name: "Jorge Ramírez", label: "Finanzas", to: "/finanzas/inicio", hint: "Cobros y conciliación" },
  { role: "cuidador", name: "Mateo Gómez", label: "Cuidador", to: "/cuidador/inicio", hint: "Mascotas que le autorizaron" },
  { role: "especialista", name: "Dr. Andrés Vela", label: "Especialista", to: "/especialista/inicio", hint: "Remisiones asignadas" },
  { role: "soporte", name: "Soporte técnico", label: "Soporte", to: "/soporte/inicio", hint: "Diagnóstico técnico" },
  { role: "consultor", name: "Alpha Vision", label: "Consultor", to: "/consultor/inicio", hint: "Indicadores agregados" },
];

export function DemoProfiles() {
  const nav = useNavigate();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {DEMO_PROFILES.map((p) => (
        <button key={p.role} onClick={() => { enterDemo(p.role, p.name); void nav({ to: p.to as "/" }); }} className="flex w-full items-center gap-3 rounded-3xl bg-card p-4 text-left shadow-soft transition active:scale-[.99]">
          <span className="flex-1"><span className="text-xs font-bold uppercase text-primary">{p.label}</span><b className="block text-lg">{p.name}</b><span className="text-sm text-muted-foreground">{p.hint}</span></span>
          <ChevronRight className="text-primary" />
        </button>
      ))}
    </div>
  );
}
