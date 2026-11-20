import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/finanzas/$")({
  head: ({ params }) => meta(findScreen("/finanzas/" + params._splat)?.name ?? "Finanzas", "Portal de Finanzas en Vet Freedom OS."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
