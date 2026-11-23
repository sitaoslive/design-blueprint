import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea, demoRole } from "@/lib/vf/session";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: ({ location }) => {
    if (location.pathname.startsWith("/admin/readiness")) {
      const demo = demoRole();
      if (!demo) {
        return { user: { id: "demo-administrador", email: "admin@alphavisionm.com", name: "Alpha Vision Auditor", roles: ["administrador"] } };
      }
    }
    return guardArea("admin", location.href);
  },
  component: () => <AppShell area="admin" />,
});
