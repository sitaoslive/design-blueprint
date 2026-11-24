import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/lib/vf/meta";
import { DualIndustryDemoShowcase } from "@/features/demos/DualIndustryDemoShowcase";

export const Route = createFileRoute("/demo")({
  head: () =>
    meta(
      "Demo Dual Interactiva · Alpha Vision Method",
      "Demostrador interactivo completo para Vet Freedom OS (veterinaria a domicilio) y Contractor Field Service OS (contratistas). Elige tu industria o compara ambas lado a lado."
    ),
  ssr: false,
  component: DualDemoRoutePage,
});

function DualDemoRoutePage() {
  return <DualIndustryDemoShowcase />;
}
