import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { qualityScreen } from "@/features/customer-experience/catalog";
import { executiveScreen } from "@/features/executive-assistant/catalog";
import { dispatchScreen } from "@/features/live-dispatch/catalog";

export const Route = createFileRoute("/direccion/$")({
  head: ({ params }) => meta(dispatchScreen("/direccion/" + params._splat) ?? executiveScreen("/direccion/" + params._splat)?.[1] ?? qualityScreen("/direccion/" + params._splat)?.[1] ?? findScreen("/direccion/" + params._splat)?.name ?? "Dirección de Vet Life", "Despacho, decisiones y propuestas de Veterinaria Dr. Luis Ríos con fuentes autorizadas y revisión humana."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
