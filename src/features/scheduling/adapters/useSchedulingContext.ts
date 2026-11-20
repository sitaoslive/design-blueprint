import { useMemo } from "react";
import { useVF } from "@/lib/vf/store";
import { useRows } from "@/components/vf/screens/useRow";
import { zones } from "@/lib/vf/data";
import { SERVICES, toMin, weekdayOf, type SchedulingContext, type StaffShift } from "../domain";

type ShiftRow = { staff_id: string | null; day: string; start_time: string; end_time: string; kind: string };
/** Infrastructure adapter: maps the app store + shifts table into the pure scheduling context. */
export function useSchedulingContext(): { ctx: SchedulingContext | null; loading: boolean } {
  const staff = useVF((s) => s.staff); const visits = useVF((s) => s.visits);
  const { rows } = useRows<ShiftRow>("shifts");
  const ctx = useMemo<SchedulingContext | null>(() => {
    if (!rows) return null;
    const shifts: StaffShift[] = rows.filter((r) => r.staff_id).map((r) => ({ staffId: r.staff_id!, day: weekdayOf(r.day), start: toMin(r.start_time), end: toMin(r.end_time), kind: r.kind === "ausencia" ? "ausencia" : "turno" }));
    return {
      staff: staff.map((m) => ({ id: m.id, name: m.name, role: m.role, zone: m.zone, skills: m.skills, absentToday: m.status === "ausente" })),
      shifts,
      bookings: visits.map((v) => ({ id: v.id, staffId: v.staffId ?? "", day: weekdayOf(v.date), start: toMin(v.time), duration: SERVICES.find((s) => s.name === v.service)?.duration ?? 45, zone: v.zone, status: v.status, protected: SERVICES.find((s) => s.name === v.service)?.protected ?? false, label: v.service })),
      holds: [], services: SERVICES, coveredZones: zones, now: Date.now(), dataAgeMinutes: 0,
    };
  }, [rows, staff, visits]);
  return { ctx, loading: !rows };
}
