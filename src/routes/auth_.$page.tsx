import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { ScaffoldPage } from "@/components/vf/pages/Scaffold";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/auth_/$page")({
  head: () => meta("Acceso", "Pantallas de acceso de Vet Freedom OS."),
  component: Page,
});
function Page() {
  const { pathname } = useLocation();
  return (
    <div className="mx-auto max-w-md px-5 pb-12 pt-6">
      <ScaffoldPage path={pathname} />
      <Link to="/auth" search={{ next: undefined }} className="mt-6 block text-center font-bold text-primary">Ir a iniciar sesión</Link>
    </div>
  );
}
