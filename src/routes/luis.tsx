import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";
import { guardArea } from "@/lib/vf/session";

export const Route = createFileRoute("/luis")({
  ssr: false,
  beforeLoad: ({ location }) => guardArea("luis", location.href),
  component: () => <AppShell area="luis" />,
});
