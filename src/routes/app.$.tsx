import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { qualityScreen } from "@/features/customer-experience/catalog";
import { dispatchScreen } from "@/features/live-dispatch/catalog";

export const Route = createFileRoute("/app/$")({
  head: ({ params }) => meta(dispatchScreen("/app/" + params._splat) ?? qualityScreen("/app/" + params._splat)?.[1] ?? findScreen("/app/" + params._splat)?.name ?? "Mi familia en Vet Life", "Seguimiento privado y atención de tu familia con Veterinaria Dr. Luis Ríos."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
