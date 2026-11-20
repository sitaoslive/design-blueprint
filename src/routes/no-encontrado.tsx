import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { Btn } from "@/components/vf/ui";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/no-encontrado")({
  head: () => meta("Página no encontrada", "La página que buscas no existe o cambió de lugar."),
  component: () => (
    <PublicPage title="Página no encontrada" intro="La página que buscas no existe o cambió de lugar.">
      <Block t="¿Qué puedo hacer?">Si es una urgencia con tu mascota, llama directamente a Vet Life.</Block>
      <Btn className="mt-4 w-full" onClick={() => window.location.assign("/")}>Volver al inicio</Btn>
    </PublicPage>
  ),
});
