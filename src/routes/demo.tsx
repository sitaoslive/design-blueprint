import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { meta } from "@/lib/vf/meta";
import { enterDemo } from "@/lib/vf/session";
import { PawIcon } from "@/components/vf/ui";

const PROFILES = [
  { role: "cliente", name: "Andrea Gómez", label: "Cliente", to: "/cliente", hint: "Mascotas, citas, documentos y pagos" },
  { role: "administrador", name: "Laura Peña", label: "Administración", to: "/admin/inicio", hint: "Configuración, usuarios, integraciones y módulos" },
  { role: "luis", name: "Dr. Luis", label: "Dirección", to: "/luis", hint: "Panel del director y asistente" },
  { role: "coordinador", name: "Laura Peña", label: "Coordinación", to: "/coordinacion", hint: "Agenda, solicitudes y equipo" },
  { role: "veterinario", name: "Dra. Valeria Torres", label: "Veterinaria", to: "/equipo", hint: "Jornada, ruta y visitas" },
  { role: "auxiliar", name: "Camila Rincón", label: "Auxiliar", to: "/auxiliar", hint: "Sus visitas y tareas asignadas" },
];

export const Route = createFileRoute("/demo")({
  head: () => meta("Demo por perfil", "Explora Vet Freedom OS como cliente, administración, dirección, coordinación, veterinario o auxiliar sin iniciar sesión."),
  ssr: false,
  component: DemoPage,
});

function DemoPage() {
  const nav = useNavigate();
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <div className="flex items-center gap-2 text-primary"><PawIcon className="h-8 w-8" /><b className="text-xl">Vet Freedom OS · Demo</b></div>
      <h1 className="mt-6 text-3xl font-extrabold">¿Cómo quieres entrar?</h1>
      <p className="mt-2 text-muted-foreground">Sin contraseña. Verás datos de ejemplo y nada de lo que hagas se guarda.</p>
      <div className="mt-6 space-y-3">
        {PROFILES.map((p) => (
          <button key={p.role} onClick={() => { enterDemo(p.role, p.name); void nav({ to: p.to as "/" }); }} className="block w-full rounded-3xl bg-card p-4 text-left shadow-soft transition active:scale-[.99]">
            <span className="text-xs font-bold uppercase text-primary">{p.label}</span><b className="block text-lg">{p.name}</b><span className="text-sm text-muted-foreground">{p.hint}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
