import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/lib/vf/meta";
import { AdvancedTasks } from "@/features/field-operations/components/AdvancedPages";

export const Route = createFileRoute("/equipo/tareas")({
  head: () => meta("Tareas", "Pendientes del día del profesional."),
  component: Tasks,
});
function Tasks() {
  return <AdvancedTasks />;
}
