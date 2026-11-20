import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/especialista")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("especialista", location.href),
  component: () => <AppShell area="especialista" />,
});
