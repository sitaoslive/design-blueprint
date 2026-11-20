import { describe, it, expect } from "vitest";
import { remindersDue, liveVisits, type Reminder } from "@/features/luis/domain";
import type { Visit } from "@/lib/vf/data";
const now = new Date("2026-11-20T12:00:00");
const r = (id: string, due: string, status = "pendiente"): Reminder => ({ id, referral_id: null, pet_id: null, title: id, due_at: new Date(due).toISOString(), assignee: "Luis", status });
describe("Luis veterinario", () => {
  it("cuenta vencidos y de hoy, ignora hechos", () => { const d = remindersDue([r("a", "2026-11-19T10:00"), r("b", "2026-11-20T18:00"), r("c", "2026-11-21T09:00"), r("x", "2026-11-18T10:00", "hecho")], now); expect([d.overdue, d.today, d.list.length]).toEqual([1, 1, 3]); expect(d.list[0]!.id).toBe("a"); });
  it("en cita ahora: solo en camino, llegada o atención", () => { const v = (id: string, step: Visit["step"]) => ({ id, step } as Visit); expect(liveVisits([v("1", "programada"), v("2", "en_atencion"), v("3", "llegada"), v("4", "finalizada")]).map((x) => x.id)).toEqual(["2", "3"]); });
});
