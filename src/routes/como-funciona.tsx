import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/como-funciona")({
  head: () => meta("Cómo funciona", "Cuidado veterinario sin salir de casa, en cuatro pasos."),
  component: () => (
    <PublicPage title="Cómo funciona" intro="Cuidado veterinario sin salir de casa, en cuatro pasos.">
      <Block t="1. Solicitas">Por la app o WhatsApp.</Block><Block t="2. Confirmamos">Coordinación asigna profesional y horario.</Block><Block t="3. Te visitamos">Seguimiento del profesional en camino.</Block><Block t="4. Seguimiento">Indicaciones, pagos y próximos controles en tu portal.</Block>
    </PublicPage>
  ),
});
