import { createFileRoute } from "@tanstack/react-router";
import { OwnerCommandCenter } from "@/features/system-administration/pages/OwnerCommandCenter";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/admin/")({
  head: () =>
    meta(
      "Owner Command Center · Vet Freedom OS & Alpha Vision",
      "Centro de mando para el dueño de la plataforma. Clínicas activas, métricas comerciales, pruebas de 30 días y salud del sistema."
    ),
  component: () => <OwnerCommandCenter />,
});
