import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { qualityScreen } from "@/features/customer-experience/catalog";
import { dispatchScreen } from "@/features/live-dispatch/catalog";

export const Route = createFileRoute("/operaciones/$")({
  head: ({ params }) => meta(dispatchScreen("/operaciones/" + params._splat) ?? qualityScreen("/operaciones/" + params._splat)?.[1] ?? findScreen("/operaciones/" + params._splat)?.name ?? "Operaciones de Vet Life", "Despacho, coordinación y seguimiento de visitas de Veterinaria Dr. Luis Ríos, con fuentes autorizadas."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
