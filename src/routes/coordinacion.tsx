import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";

export const Route = createFileRoute("/coordinacion")({ component: () => <AppShell area="coordinacion" /> });
