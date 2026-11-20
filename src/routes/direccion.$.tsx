import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/direccion/$")({
  head: ({ params }) => meta(findScreen("/direccion/" + params._splat)?.name ?? "Vet Freedom OS", "Pantalla de Vet Freedom OS."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
