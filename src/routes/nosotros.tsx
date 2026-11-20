import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/nosotros")({
  head: () => meta("Nosotros", "Vet Life: medicina veterinaria a domicilio con calidez."),
  component: () => (
    <PublicPage title="Nosotros" intro="Vet Life: medicina veterinaria a domicilio con calidez.">
      <Block t="Nuestra misión">Que cada mascota reciba atención de calidad en su hogar.</Block><Block t="Nuestro equipo">Veterinarios y auxiliares formados en Vet Life Academy.</Block>
    </PublicPage>
  ),
});
