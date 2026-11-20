import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/auxiliar")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("auxiliar", location.href),
  component: () => <AppShell area="auxiliar" />,
});
