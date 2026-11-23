import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea, demoRole, currentUser } from "@/lib/vf/session";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // 1. El login de la dueña es público y no requiere estar autenticado previamente
    if (location.pathname === "/admin/login") {
      return {};
    }

    // 2. Tablero de preparación técnica para auditorías
    if (location.pathname.startsWith("/admin/readiness")) {
      const demo = demoRole();
      if (!demo) {
        return {
          user: {
            id: "demo-administrador",
            email: "admin@alphavisionm.com",
            name: "Alpha Vision Auditor",
            roles: ["administrador"],
          },
        };
      }
    }

    // 3. Si hay sesión activa de administrador o luis, conceder acceso de inmediato
    const demo = demoRole();
    if (demo && (demo.role === "administrador" || demo.role === "luis")) {
      return {
        user: {
          id: "demo-" + demo.role,
          email: "admin@alphavisionm.com",
          name: demo.name,
          roles: [demo.role],
        },
      };
    }

    // 4. Si no hay sesión, redirigir a la compuerta exclusiva de la dueña (/admin/login)
    const u = await currentUser();
    if (!u) {
      throw redirect({ to: "/admin/login", search: { next: location.href } });
    }

    return guardArea("admin", location.href);
  },
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/admin/login") {
    return <Outlet />;
  }
  return <AppShell area="admin" />;
}
