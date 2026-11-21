import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { qualityScreen } from "@/features/customer-experience/catalog";

export const Route = createFileRoute("/operaciones/$")({
  head: ({ params }) => meta(qualityScreen("/operaciones/" + params._splat)?.[1] ?? findScreen("/operaciones/" + params._splat)?.name ?? "Operaciones de Vet Life", "Coordinación, calidad y seguimiento de la experiencia de las familias de Vet Life."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
