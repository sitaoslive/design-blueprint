import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/lib/vf/meta";
import { ExecutiveEntry } from "@/features/executive-assistant/pages";
export const Route = createFileRoute("/luis/asistente")({
  head: () =>
    meta(
      "Asistente de Dirección",
      "Consultas privadas con fuentes verificables, propuestas y revisión humana de Vet Life.",
    ),
  component: () => <ExecutiveEntry path="/luis/asistente" />,
});
