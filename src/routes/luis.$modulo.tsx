import { createFileRoute } from "@tanstack/react-router";
import { ModuleView, MODULES } from "@/components/vf/pages/registry";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/luis/$modulo")({
  head: ({ params }) => meta(MODULES[params.modulo]?.title ?? "Más", "Módulo operativo de Vet Freedom OS."),
  component: Page,
});
function Page() {
  const { modulo } = Route.useParams();
  return <ModuleView base="/luis" slug={modulo} />;
}
