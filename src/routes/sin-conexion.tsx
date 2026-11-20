import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { Btn } from "@/components/vf/ui";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/sin-conexion")({
  head: () => meta("Sin conexión", "No hay conexión a internet. Lo que registraste se guardará cuando vuelvas a estar en línea."),
  component: () => (
    <PublicPage title="Sin conexión" intro="No hay conexión a internet. Lo que registraste se guardará cuando vuelvas a estar en línea.">
      <Block t="¿Qué puedo hacer?">Si es una urgencia con tu mascota, llama directamente a Vet Life.</Block>
      <Btn className="mt-4 w-full" onClick={() => window.location.reload()}>Reintentar</Btn>
    </PublicPage>
  ),
});
