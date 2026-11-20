import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/recepcion")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("recepcion", location.href),
  component: () => <AppShell area="recepcion" />,
});
