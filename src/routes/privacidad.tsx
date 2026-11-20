import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, Block } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/privacidad")({
  head: () => meta("Privacidad", "Cómo cuidamos tus datos y los de tu mascota."),
  component: () => (
    <PublicPage title="Privacidad" intro="Cómo cuidamos tus datos y los de tu mascota.">
      <Block t="Datos que recopilamos">Contacto, dirección, mascotas y visitas.</Block><Block t="Información clínica">El sistema clínico oficial es OKVET; aquí solo vemos lo autorizado.</Block><Block t="Tus derechos">Puedes consultar, corregir o pedir eliminar tus datos.</Block><Block t="Estado">Texto provisional pendiente de revisión legal.</Block>
    </PublicPage>
  ),
});
