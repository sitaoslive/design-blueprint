import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminLoginPage } from "@/features/system-administration/pages/SuperAdminLoginPage";
import { meta } from "@/lib/vf/meta";

type AdminLoginSearch = {
  next?: string;
};

export const Route = createFileRoute("/admin/login")({
  validateSearch: (s: Record<string, unknown>): AdminLoginSearch => {
    const next = typeof s["next"] === "string" ? s["next"] : undefined;
    return next ? { next } : {};
  },
  head: () =>
    meta(
      "Acceso Soberano · Dueña de Plataforma | Alpha Vision Method",
      "Portal maestro exclusivo para la propietaria de Alpha Vision Method. Control supremo de Vet Freedom OS y Contractor OS."
    ),
  component: SuperAdminLoginRoute,
});

function SuperAdminLoginRoute() {
  const { next } = Route.useSearch();
  return <SuperAdminLoginPage nextUrl={next} />;
}
