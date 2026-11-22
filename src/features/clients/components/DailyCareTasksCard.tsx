import { useState } from "react";
import { CheckCircle2, Circle, Clock, Utensils, Pill, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CareTask {
  id: string;
  title: string;
  detail: string;
  time: string;
  category: "FOOD" | "MED" | "VACCINE" | "WALK";
  completed: boolean;
}

export function DailyCareTasksCard({ petName = "Maximilian" }: { petName?: string }) {
  const [tasks, setTasks] = useState<CareTask[]>([
    {
      id: "t1",
      title: "Alimentación matutina",
      detail: "Hill's Prescription Diet c/d (80g)",
      time: "08:00 AM",
      category: "FOOD",
      completed: true,
    },
    {
      id: "t2",
      title: "Simparica Trio Antiparasitario",
      detail: "1 Comprimido masticable mensual",
      time: "02:00 PM",
      category: "MED",
      completed: false,
    },
    {
      id: "t3",
      title: "Cepillado y revisión de pelaje",
      detail: "Cuidado de nudos y bienestar cutáneo",
      time: "06:00 PM",
      category: "WALK",
      completed: false,
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-foreground">Cuidados y Tareas de Hoy</h3>
          <p className="text-xs text-muted-foreground">Rutina diaria para {petName}</p>
        </div>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-extrabold text-primary">
          {tasks.filter((t) => t.completed).length}/{tasks.length} Listas
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {tasks.map((task) => {
          const isDone = task.completed;
          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all active:scale-[0.99]",
                isDone
                  ? "border-sage/40 bg-sage/10 text-muted-foreground"
                  : "border-border bg-secondary/50 hover:border-primary/40"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                    isDone ? "bg-sage text-sage-foreground" : "bg-card text-primary shadow-sm"
                  )}
                >
                  {task.category === "FOOD" && <Utensils className="h-4 w-4" />}
                  {task.category === "MED" && <Pill className="h-4 w-4" />}
                  {task.category === "WALK" && <Sparkles className="h-4 w-4" />}
                </span>
                <div>
                  <p
                    className={cn(
                      "text-sm font-bold text-foreground",
                      isDone && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{task.detail}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-card/80 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {task.time}
                </span>
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/60" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
