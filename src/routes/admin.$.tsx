import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { findScreen } from "@/lib/vf/screens";
import { meta } from "@/lib/vf/meta";
import { qualityScreen } from "@/features/customer-experience/catalog";
import { executiveScreen } from "@/features/executive-assistant/catalog";
import { controlScreen } from "@/features/system-administration/catalog";
import { dispatchScreen } from "@/features/live-dispatch/catalog";

export const Route = createFileRoute("/admin/$")({
  head: ({ params }) => meta(dispatchScreen("/admin/" + params._splat) ?? controlScreen("/admin/" + params._splat)?.[1] ?? executiveScreen("/admin/" + params._splat)?.[1] ?? qualityScreen("/admin/" + params._splat)?.[1] ?? findScreen("/admin/" + params._splat)?.name ?? "Administración de Vet Life", "Revisión autorizada de configuración, dependencias, calidad y estado de Veterinaria Dr. Luis Ríos; acciones externas apagadas."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return <ScaffoldPage path={pathname} />;
}
