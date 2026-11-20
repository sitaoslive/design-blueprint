import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/cliente")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("cliente", location.href),
  component: () => <AppShell area="cliente" />,
});
