import { createFileRoute } from "@tanstack/react-router";
import { TeamPage } from "@/components/vf/pages/ops";
import { meta } from "@/lib/vf/meta";
export const Route = createFileRoute("/coordinacion/equipo")({ head: () => meta("Equipo", "Disponibilidad del equipo veterinario y coberturas."), component: () => <TeamPage base="/coordinacion" /> });
