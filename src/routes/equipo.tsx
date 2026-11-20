import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/equipo")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("equipo", location.href),
  component: () => <AppShell area="equipo" />,
});
