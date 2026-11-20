import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "../ui";

/** Ordered steps with the current one highlighted (visit steps, simulator states, assistant cycle). */
export function StatusTimeline({ steps, current, failed }: { steps: string[]; current: number; failed?: boolean }) {
  return (<ol className="flex flex-wrap items-center gap-1 text-xs font-bold" aria-label="Progreso">
    {steps.map((s, i) => <li key={s} aria-current={i === current ? "step" : undefined} className={`flex items-center gap-1 rounded-full px-3 py-1 ${i < current ? "bg-sage text-sage-foreground" : i === current ? (failed ? "bg-accent text-foreground" : "bg-gradient-primary text-primary-foreground") : "bg-secondary text-muted-foreground"}`}>
      {i < current ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}{s}{i < steps.length - 1 && <span aria-hidden className="ml-1">→</span>}</li>)}</ol>);
}
export const ASSISTANT_CYCLE = ["CONSULTA", "PROPUESTA", "REVISIÓN", "APROBACIÓN", "EJECUCIÓN", "VERIFICACIÓN"];
export const SIM_CYCLE = ["SIMULADO", "PROPUESTO", "APROBADO", "EJECUTADO"];

export function AuditTimeline({ items }: { items: { id: string; at: string; action: string }[] }) {
  return <ol className="border-l-2 border-secondary pl-4">{items.map((a) => <li key={a.id} className="mb-3"><span className="-ml-[1.4rem] mr-2 inline-block h-3 w-3 rounded-full bg-primary" /><b>{a.action}</b><p className="text-xs text-muted-foreground">{a.at}</p></li>)}</ol>;
}
export function BeforeAfterPanel({ rows }: { rows: { label: string; before: string | number; after: string | number }[] }) {
  return <Card><div className="grid grid-cols-3 gap-2 text-sm font-bold text-muted-foreground"><span /><span>Antes</span><span>Después</span></div>{rows.map((r) => <div key={r.label} className="grid grid-cols-3 gap-2 border-t border-secondary py-2"><span>{r.label}</span><span>{r.before}</span><b className={r.after !== r.before ? "text-primary" : ""}>{r.after}</b></div>)}</Card>;
}
