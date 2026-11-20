import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/zonas")({
  head: () => meta("Zonas de atención", "Atendemos a domicilio en Bogotá y municipios cercanos."),
  component: () => (
    <PublicPage title="Zonas de atención" intro="Atendemos a domicilio en Bogotá y municipios cercanos.">
      <Block t="Zona Norte">Usaquén, Chapinero, Suba.</Block><Block t="Zona Centro">Teusaquillo, Centro, Barrios Unidos.</Block><Block t="Zona Sur">Kennedy, Puente Aranda, Tunjuelito.</Block><Block t="¿No ves tu barrio?">Escríbenos y revisamos cobertura.</Block>
    </PublicPage>
  ),
});
