import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { qualityScreen } from "@/features/customer-experience/catalog";

export const Route = createFileRoute("/direccion/$")({
  head: ({ params }) => meta(qualityScreen("/direccion/" + params._splat)?.[1] ?? findScreen("/direccion/" + params._splat)?.name ?? "Dirección de Vet Life", "Decisiones, excepciones y calidad de atención bajo la supervisión de Dirección en Vet Life."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
