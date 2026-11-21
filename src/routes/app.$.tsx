import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { qualityScreen } from "@/features/customer-experience/catalog";

export const Route = createFileRoute("/app/$")({
  head: ({ params }) => meta(qualityScreen("/app/" + params._splat)?.[1] ?? findScreen("/app/" + params._splat)?.name ?? "Mi familia en Vet Life", "Ayuda, recursos revisados y seguimiento de tus solicitudes de atención con Vet Life."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
