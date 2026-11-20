import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/operaciones")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("operaciones", location.href),
  component: () => <AppShell area="operaciones" />,
});
