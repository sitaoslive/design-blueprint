import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/cuidador")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("cuidador", location.href),
  component: () => <AppShell area="cuidador" />,
});
