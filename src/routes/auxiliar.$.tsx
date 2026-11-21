import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { dispatchScreen } from "@/features/live-dispatch/catalog";

export const Route = createFileRoute("/auxiliar/$")({
  head: ({ params }) => meta(dispatchScreen("/auxiliar/" + params._splat) ?? findScreen("/auxiliar/" + params._splat)?.name ?? "Auxiliar", "Tiempos y apoyo asignado del auxiliar de Veterinaria Dr. Luis Ríos."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
