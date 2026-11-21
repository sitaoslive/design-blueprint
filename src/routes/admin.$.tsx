import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { qualityScreen } from "@/features/customer-experience/catalog";

export const Route = createFileRoute("/admin/$")({
  head: ({ params }) => meta(qualityScreen("/admin/" + params._splat)?.[1] ?? findScreen("/admin/" + params._splat)?.name ?? "Administración de Vet Life", "Revisión autorizada de calidad, encuestas y contenido educativo de Vet Life."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
