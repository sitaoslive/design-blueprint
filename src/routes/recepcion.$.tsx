import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/recepcion/$")({
  head: ({ params }) => meta(findScreen("/recepcion/" + params._splat)?.name ?? "Recepción", "Portal de Recepción en Vet Freedom OS."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
