import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/zonas")({
  head: () => meta("Zonas de atención", "Atendemos a domicilio en Medellín y el Oriente Antioqueño."),
  component: () => (
    <PublicPage title="Zonas de atención" intro="Atendemos a domicilio en Medellín, Valle de Aburrá y Oriente Antioqueño.">
      <Block t="Medellín y Valle de Aburrá">El Poblado, Laureles, Envigado, Sabaneta, Belén, Conquistadores y Calasanz.</Block>
      <Block t="Oriente Antioqueño">Rionegro, Llanogrande, El Retiro, La Ceja, San Antonio de Pereira, Guarne y Marinilla.</Block>
      <Block t="Logística y Puntualidad">Coordinamos rutas por sectores geográficos para llegar con puntualidad y tranquilidad para tu mascota.</Block>
      <Block t="¿Tienes dudas sobre tu ubicación?">Escríbenos directamente por WhatsApp y confirmamos disponibilidad en tu sector.</Block>
    </PublicPage>
  ),
});
