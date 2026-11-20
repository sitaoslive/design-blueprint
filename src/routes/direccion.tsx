import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/direccion")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("direccion", location.href),
  component: () => <AppShell area="direccion" />,
});
