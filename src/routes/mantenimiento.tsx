import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { Btn } from "@/components/vf/ui";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/mantenimiento")({
  head: () => meta("En mantenimiento", "Estamos mejorando Vet Freedom OS. Volvemos pronto; las urgencias se atienden por teléfono."),
  component: () => (
    <PublicPage title="En mantenimiento" intro="Estamos mejorando Vet Freedom OS. Volvemos pronto; las urgencias se atienden por teléfono.">
      <Block t="¿Qué puedo hacer?">Si es una urgencia con tu mascota, llama directamente a Vet Life.</Block>
      <Btn className="mt-4 w-full" onClick={() => window.location.assign("/")}>Volver al inicio</Btn>
    </PublicPage>
  ),
});
