import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { Btn } from "@/components/vf/ui";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/actualizacion-requerida")({
  head: () => meta("Actualización requerida", "Hay una versión nueva de la aplicación. Recarga para continuar."),
  component: () => (
    <PublicPage title="Actualización requerida" intro="Hay una versión nueva de la aplicación. Recarga para continuar.">
      <Block t="¿Qué puedo hacer?">Si es una urgencia con tu mascota, llama directamente a Vet Life.</Block>
      <Btn className="mt-4 w-full" onClick={() => window.location.reload()}>Recargar</Btn>
    </PublicPage>
  ),
});
