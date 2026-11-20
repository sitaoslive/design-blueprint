import { createFileRoute } from "@tanstack/react-router";
import { QuickBooking } from "@/components/vf/pages/ops";
import { meta } from "@/lib/vf/meta";
export const Route = createFileRoute("/coordinacion/nueva-cita")({ head: () => meta("Nueva cita rápida", "Agendamiento durante llamada."), component: () => <QuickBooking base="/coordinacion" /> });
