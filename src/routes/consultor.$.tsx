import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/consultor/$")({
  head: ({ params }) => meta(findScreen("/consultor/" + params._splat)?.name ?? "Alpha Vision", "Portal de Alpha Vision en Vet Freedom OS."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
