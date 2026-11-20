import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/coordinacion")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("coordinacion", location.href),
  component: () => <AppShell area="coordinacion" />,
});
