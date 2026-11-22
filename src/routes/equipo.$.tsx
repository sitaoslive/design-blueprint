import { createFileRoute } from "@tanstack/react-router";
import { ModuleView, MODULES } from "@/components/vf/pages/registry";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/equipo/$")({
  head: ({ params }) =>
    meta(
      MODULES[params._splat ?? ""]?.title ?? `Equipo · ${params._splat ?? ""}`,
      "Jornada y formación del equipo de Veterinaria Dr. Luis Ríos."
    ),
  component: Page,
});

function Page() {
  const { _splat } = Route.useParams();
  return <ModuleView base="/equipo" slug={_splat ?? ""} />;
}
