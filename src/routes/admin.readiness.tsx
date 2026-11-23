import { createFileRoute } from "@tanstack/react-router";
import { ProductionReadinessDashboard } from "@/features/system-administration/pages/ProductionReadinessDashboard";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/admin/readiness")({
  head: () =>
    meta(
      "Tablero de Preparación de Producción · Alpha Vision Method",
      "Auditoría forense de producción en 20 categorías y 74 criterios de aceptación para Vet Freedom OS y Contractor OS."
    ),
  component: ProductionReadinessDashboard,
});
