import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { qualityScreen } from "@/features/customer-experience/catalog";
import { executiveScreen } from "@/features/executive-assistant/catalog";

export const Route = createFileRoute("/direccion/$")({
  head: ({ params }) => meta(executiveScreen("/direccion/" + params._splat)?.[1] ?? qualityScreen("/direccion/" + params._splat)?.[1] ?? findScreen("/direccion/" + params._splat)?.name ?? "Dirección de Vet Life", "Decisiones, propuestas y reportes de Vet Life con fuentes autorizadas y revisión humana."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
