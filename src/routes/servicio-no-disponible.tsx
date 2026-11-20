import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { Btn } from "@/components/vf/ui";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/servicio-no-disponible")({
  head: () => meta("Servicio no disponible", "El servicio está temporalmente fuera de línea. Intenta de nuevo en unos minutos."),
  component: () => (
    <PublicPage title="Servicio no disponible" intro="El servicio está temporalmente fuera de línea. Intenta de nuevo en unos minutos.">
      <Block t="¿Qué puedo hacer?">Si es una urgencia con tu mascota, llama directamente a Vet Life.</Block>
      <Btn className="mt-4 w-full" onClick={() => window.location.reload()}>Reintentar</Btn>
    </PublicPage>
  ),
});
