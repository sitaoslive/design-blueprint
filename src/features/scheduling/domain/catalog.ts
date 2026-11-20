import type { ServiceDef } from "./types";
/** Operational defaults (durations in minutes). Coordination can override per visit. */
export const SERVICES: ServiceDef[] = [
  { name: "Consulta general", duration: 45, roles: ["Veterinario"], preferredSkills: [] },
  { name: "Control preventivo", duration: 45, roles: ["Veterinario"], preferredSkills: ["Medicina preventiva"] },
  { name: "Vacunación", duration: 30, roles: ["Veterinario"], preferredSkills: ["Vacunación"] },
  { name: "Control recurrente", duration: 40, roles: ["Veterinario"], preferredSkills: ["Tratamientos recurrentes"], protected: true },
  { name: "Curación", duration: 40, roles: ["Veterinario"], preferredSkills: ["Curaciones"] },
  { name: "Toma de muestras", duration: 30, roles: ["Veterinario", "Auxiliar"], preferredSkills: ["Toma de muestras"] },
];
export const BUFFER = 10;
export const BREAK = { start: 12 * 60 + 30, end: 13 * 60, minShift: 6 * 60 };
export const MAX_DAY_MINUTES = 7 * 60;
export const STALE_AFTER_MIN = 60;
const ADJ: Record<string, number> = { "Zona Norte|Zona Centro": 35, "Zona Centro|Zona Sur": 35, "Zona Norte|Zona Sur": 55 };
/** Estimated travel between zones (no live traffic yet → confidence media). */
export function travel(a: string, b: string): number { if (a === b) return 20; return ADJ[`${a}|${b}`] ?? ADJ[`${b}|${a}`] ?? 60; }
