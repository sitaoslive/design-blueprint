/** Time helpers. Bogotá has no DST, so day labels + minutes are enough for the scheduler. */
export const toMin = (hhmm: string): number => { const [h = "0", m = "0"] = hhmm.split(":"); return Number(h) * 60 + Number(m); };
export const toHHMM = (m: number): string => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const overlaps = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && b0 < a1;
const ABBR: Record<string, string> = { lun: "Lunes", mar: "Martes", mie: "Miércoles", mié: "Miércoles", jue: "Jueves", vie: "Viernes", sab: "Sábado", sáb: "Sábado", dom: "Domingo" };
export const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
/** "Mar, 28 de enero" → "Martes"; a full weekday passes through. */
export function weekdayOf(label: string): string {
  const w = label.trim().split(/[ ,]/)[0]!.toLowerCase();
  return ABBR[w.slice(0, 3)] ?? WEEKDAYS.find((d) => d.toLowerCase() === w) ?? label;
}
