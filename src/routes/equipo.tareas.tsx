import { useMyStaff } from "@/lib/vf/me";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle } from "lucide-react";
import { useVF, actions } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { PageTitle } from "@/components/vf/ui";

export const Route = createFileRoute("/equipo/tareas")({
  head: () => meta("Tareas", "Pendientes del día del profesional."),
  component: Tasks,
});
function Tasks() {
  const { mine } = useMyStaff(); const all = useVF((s) => s.tasks); const tasks = all.filter((t) => mine(t.staffId));
  return (<><PageTitle title="Tareas" />
    <div className="space-y-2">{tasks.map((t) => (
      <button key={t.id} onClick={() => actions.toggleTask(t.id)} aria-pressed={t.done} className="flex w-full items-center gap-3 rounded-3xl bg-secondary p-4 text-left text-lg">
        {t.done ? <CheckCircle2 className="h-7 w-7 text-sage-foreground" /> : <Circle className="h-7 w-7 text-primary" />}<span className={t.done ? "text-muted-foreground line-through" : ""}>{t.title}</span>
      </button>))}</div></>);
}
