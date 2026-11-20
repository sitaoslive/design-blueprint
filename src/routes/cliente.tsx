import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/vf/AppShell";

export const Route = createFileRoute("/cliente")({ component: () => <AppShell area="cliente" /> });
