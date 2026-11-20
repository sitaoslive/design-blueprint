import { BREAK, MAX_DAY_MINUTES } from "./catalog";
import type { SchedulingContext } from "./types";

export interface StaffCapacity { staffId: string; shiftMinutes: number; committed: number; free: number; overloaded: boolean; knownShift: boolean }
/** CapacityAnalysisEngine for one day. Projections are estimates, never hiring decisions. */
export function analyzeCapacity(ctx: SchedulingContext, day: string, avgVisit = 45) {
  const rows: StaffCapacity[] = ctx.staff.map((m) => {
    const shifts = ctx.shifts.filter((s) => s.staffId === m.id && s.day === day);
    const turn = shifts.filter((s) => s.kind === "turno").reduce((a, s) => a + (s.end - s.start - (s.end - s.start >= BREAK.minShift ? BREAK.end - BREAK.start : 0)), 0);
    const off = shifts.filter((s) => s.kind === "ausencia").reduce((a, s) => a + (s.end - s.start), 0);
    const committed = ctx.bookings.filter((b) => b.staffId === m.id && b.day === day && !["cancelada"].includes(b.status)).reduce((a, b) => a + b.duration, 0);
    const shiftMinutes = Math.max(0, turn - off);
    return { staffId: m.id, shiftMinutes, committed, free: Math.max(0, shiftMinutes - committed), overloaded: committed > Math.min(MAX_DAY_MINUTES, shiftMinutes || MAX_DAY_MINUTES), knownShift: turn > 0 };
  });
  const free = rows.reduce((a, r) => a + r.free, 0);
  const byZone: Record<string, { visits: number; staff: number }> = {};
  for (const z of ctx.coveredZones) byZone[z] = { visits: ctx.bookings.filter((b) => b.day === day && b.zone === z && b.status !== "cancelada").length, staff: ctx.staff.filter((m) => m.zone === z && rows.find((r) => r.staffId === m.id)?.knownShift).length };
  const unassigned = ctx.bookings.filter((b) => b.day === day && !b.staffId && b.status !== "cancelada").length;
  const gaps = Object.entries(byZone).filter(([, v]) => v.visits > 0 && v.staff === 0).map(([z]) => z);
  const recs: string[] = [];
  if (gaps.length) recs.push(`Cobertura a evaluar: ${gaps.join(", ")} tiene visitas pero nadie con turno registrado ese día.`);
  rows.filter((r) => r.overloaded).forEach((r) => recs.push(`Redistribuir: ${ctx.staff.find((m) => m.id === r.staffId)?.name} supera su capacidad del día.`));
  if (unassigned) recs.push(`${unassigned} visita(s) sin profesional: usa el buscador de disponibilidad.`);
  if (!rows.some((r) => r.knownShift)) recs.push("No hay turnos registrados para ese día: la capacidad es desconocida, no cero.");
  return { day, rows, freeMinutes: free, extraVisits: Math.floor(free / (avgVisit + 30)), byZone, unassigned, gaps, recommendations: recs };
}
