import { createFileRoute } from "@tanstack/react-router";
import { VisualWhiteLabelStudio } from "@/features/system-administration/components/VisualWhiteLabelStudio";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/admin/estudio-diseno")({
  head: () =>
    meta(
      "Estudio de Diseño White-Label & Clinic DNA · Vet Freedom OS",
      "Configuración dinámica de tokens de color, marcas personalizadas y ADN clínico sin recompilación."
    ),
  ssr: false,
  component: VisualWhiteLabelStudio,
});
