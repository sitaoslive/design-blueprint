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

export const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
/** "Mar, 28 de enero" → { day: 28, month: 0 }; null when the label has no day/month. */
export function parseDayLabel(label: string): { day: number; month: number } | null {
  const m = label.toLowerCase().match(/(\d{1,2})\s*(?:de\s+)?([a-záéíóú]+)/);
  if (!m) return null;
  const month = MONTHS.findIndex((x) => x.startsWith(m[2]!.slice(0, 3)));
  const day = Number(m[1]);
  return month < 0 || day < 1 || day > 31 ? null : { day, month };
}
const SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
/** Date → app label "Mar, 28 de enero" (same format visits use). */
export function dayLabelOf(d: Date): string { return `${SHORT[(d.getDay() + 6) % 7]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`; }
/** Monday-first month grid: weeks of 7 cells, null outside the month. */
export function monthGrid(year: number, month: number): (number | null)[][] {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7; const days = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}
