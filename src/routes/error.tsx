import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { Btn } from "@/components/vf/ui";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/error")({
  head: () => meta("Algo salió mal", "Ocurrió un error recuperable. Tus datos están a salvo; vuelve a intentarlo."),
  component: () => (
    <PublicPage title="Algo salió mal" intro="Ocurrió un error recuperable. Tus datos están a salvo; vuelve a intentarlo.">
      <Block t="¿Qué puedo hacer?">Si es una urgencia con tu mascota, llama directamente a Vet Life.</Block>
      <Btn className="mt-4 w-full" onClick={() => window.location.reload()}>Reintentar</Btn>
    </PublicPage>
  ),
});
