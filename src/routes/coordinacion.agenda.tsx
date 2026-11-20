import { createFileRoute } from "@tanstack/react-router";
import { SmartAgenda } from "@/components/vf/pages/ops";
import { meta } from "@/lib/vf/meta";
export const Route = createFileRoute("/coordinacion/agenda")({ head: () => meta("Agenda inteligente", "Agenda del día con estados y acciones rápidas."), component: () => <SmartAgenda base="/coordinacion" /> });
