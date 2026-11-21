import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { dispatchScreen } from "@/features/live-dispatch/catalog";

export const Route = createFileRoute("/equipo/$")({
  head: ({ params }) => meta(dispatchScreen("/equipo/" + params._splat) ?? findScreen("/equipo/" + params._splat)?.name ?? "Equipo", "Jornada y tiempos del equipo de Veterinaria Dr. Luis Ríos."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
