import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/finanzas")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("finanzas", location.href),
  component: () => <AppShell area="finanzas" />,
});
