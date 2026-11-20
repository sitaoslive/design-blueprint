import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("admin", location.href),
  component: () => <AppShell area="admin" />,
});
