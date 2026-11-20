import { evaluateSlot, OFFERABLE } from "./engine";
import type { AvailabilityResult, Booking, SchedulingContext } from "./types";

export interface ReplacementOption { visit: Booking; candidates: AvailabilityResult[]; keeps: boolean }
/** ReplacementRecommendationEngine: proposals only — never reschedules anything by itself. */
export function recommendReplacements(ctx: SchedulingContext, absentId: string, day: string) {
  const affected = ctx.bookings.filter((b) => b.staffId === absentId && b.day === day && !["finalizada", "cancelada"].includes(b.status));
  // Evaluate without the absent person's own bookings blocking others, and incrementally reserve chosen candidates.
  const working: SchedulingContext = { ...ctx, staff: ctx.staff.filter((s) => s.id !== absentId), bookings: ctx.bookings.filter((b) => b.staffId !== absentId) };
  const out: ReplacementOption[] = [];
  for (const v of [...affected].sort((a, b) => a.start - b.start)) {
    const service = ctx.services.find((s) => s.name === v.label)?.name ?? "Consulta general";
    const candidates = working.staff.map((m) => evaluateSlot(working, m.id, { service, zone: v.zone, day, start: v.start })).filter((r) => OFFERABLE.includes(r.status)).sort((a, b) => b.score - a.score);
    const best = candidates[0];
    if (best) working.bookings = [...working.bookings, { ...v, staffId: best.professionalId }];
    out.push({ visit: v, candidates, keeps: !!best });
  }
  return { affected: out, kept: out.filter((o) => o.keeps).length, needChange: out.filter((o) => !o.keeps).length, requiresApproval: true as const };
}
