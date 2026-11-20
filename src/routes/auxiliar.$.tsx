import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/auxiliar/$")({
  head: ({ params }) => meta(findScreen("/auxiliar/" + params._splat)?.name ?? "Auxiliar", "Portal del auxiliar veterinario de Vet Life."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
