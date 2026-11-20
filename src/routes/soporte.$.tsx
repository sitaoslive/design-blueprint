import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/soporte/$")({
  head: ({ params }) => meta(findScreen("/soporte/" + params._splat)?.name ?? "Soporte técnico", "Portal de Soporte técnico en Vet Freedom OS."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
