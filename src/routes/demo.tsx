import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/lib/vf/meta";
import { DemoProfiles } from "@/components/vf/DemoProfiles";
import { PawIcon } from "@/components/vf/ui";

export const Route = createFileRoute("/demo")({
  head: () => meta("Demo por perfil", "Explora Vet Freedom OS como cliente, administración, dirección, coordinación, veterinario o auxiliar sin iniciar sesión."),
  ssr: false,
  component: DemoPage,
});

function DemoPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center gap-2 text-primary"><PawIcon className="h-8 w-8" /><b className="text-xl">Vet Freedom OS · Demo</b></div>
      <h1 className="mt-6 text-3xl font-extrabold">¿Cómo quieres entrar?</h1>
      <p className="mt-2 text-muted-foreground">Sin contraseña. Verás datos de ejemplo y nada de lo que hagas se guarda.</p>
      <div className="mt-6"><DemoProfiles /></div>
    </main>
  );
}
