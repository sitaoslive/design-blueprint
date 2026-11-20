import type { Visit } from "@/lib/vf/data";
export interface Reminder { id: string; referral_id: string | null; pet_id: string | null; title: string; due_at: string; assignee: string; status: string }
/** Pending reminders sorted by due date, with overdue / due-today counts. */
export function remindersDue(rows: Reminder[], now: Date) {
  const list = rows.filter((r) => r.status === "pendiente").sort((a, b) => a.due_at.localeCompare(b.due_at));
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  return { list, overdue: list.filter((r) => new Date(r.due_at) < now).length, today: list.filter((r) => { const d = new Date(r.due_at); return d >= now && d <= end; }).length };
}
/** Visits happening right now (travelling, arrived or in care), for "en cita ahora". */
export const liveVisits = (v: Visit[]) => v.filter((x) => ["en_desplazamiento", "llegada", "en_atencion"].includes(x.step));
/** A patient's current visit: one in progress, else the next one from today (not cancelled/finished). */
export function currentVisit(visits: Visit[], today: string): Visit | undefined {
  const live = liveVisits(visits)[0]; if (live) return live;
  return visits.filter((v) => !(/^\d{4}-\d{2}-\d{2}$/.test(v.date) && v.date < today) && !["cancelada", "finalizada", "completada", "no_realizada"].includes(v.status) && v.step !== "finalizada")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
}
