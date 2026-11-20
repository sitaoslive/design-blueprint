import { WEEKDAYS } from "./time";
export interface RecurringPlan { id: string; approved: boolean; frequency: "diaria" | "dias"; days?: string[]; startIndex: number; count: number; time: number; window?: { from: number; to: number } }
export interface Occurrence { planId: string; index: number; day: string; start: number; protectedWindow?: { from: number; to: number } | undefined }
/** Generates occurrences only for an approved plan. Never creates clinical indications. */
export function generateOccurrences(p: RecurringPlan): Occurrence[] {
  if (!p.approved) return [];
  const out: Occurrence[] = []; let i = p.startIndex;
  while (out.length < p.count && i < p.startIndex + 400) {
    const d = WEEKDAYS[i % 7]!;
    if (p.frequency === "diaria" || p.days?.includes(d)) out.push({ planId: p.id, index: out.length + 1, day: d, start: p.time, protectedWindow: p.window });
    i++;
  }
  return out;
}
export const withinWindow = (o: Occurrence, start: number) => !o.protectedWindow || (start >= o.protectedWindow.from && start <= o.protectedWindow.to);
