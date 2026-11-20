import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/app")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("app", location.href),
  component: () => <AppShell area="app" />,
});
