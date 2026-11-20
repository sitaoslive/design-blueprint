import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/preguntas")({
  head: () => meta("Preguntas frecuentes", "Respuestas rápidas sobre nuestras visitas."),
  component: () => (
    <PublicPage title="Preguntas frecuentes" intro="Respuestas rápidas sobre nuestras visitas.">
      <Block t="¿Cuánto tarda en llegar el veterinario?">Te damos una ventana de llegada al confirmar.</Block><Block t="¿Cómo pago?">En línea o al profesional, según el servicio.</Block><Block t="¿Atienden urgencias?">Te orientamos y, si es necesario, remitimos a un centro.</Block>
    </PublicPage>
  ),
});
