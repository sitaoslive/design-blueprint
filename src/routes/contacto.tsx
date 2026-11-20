import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/contacto")({
  head: () => meta("Contacto", "Estamos para ayudarte."),
  component: () => (
    <PublicPage title="Contacto" intro="Estamos para ayudarte.">
      <Block t="WhatsApp">Número oficial pendiente de configuración.</Block><Block t="Correo">Pendiente de configuración.</Block><Block t="Horario">Lunes a sábado, 7:00 a 19:00.</Block>
    </PublicPage>
  ),
});
