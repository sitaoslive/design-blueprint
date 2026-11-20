import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/terminos")({
  head: () => meta("Términos", "Condiciones de uso del servicio."),
  component: () => (
    <PublicPage title="Términos" intro="Condiciones de uso del servicio.">
      <Block t="Reservas">Las citas se confirman por coordinación.</Block><Block t="Cancelaciones">Política por definir con Vet Life.</Block><Block t="Estado">Texto provisional pendiente de revisión legal.</Block>
    </PublicPage>
  ),
});
