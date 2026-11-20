import type { Staff } from "./data";

export interface AbsencePlan { coordinator: string; replacements: string[]; limits: string; from: string; to: string; }

/** EXEC-005: absence mode can only activate when coverage exists. */
export function validateAbsence(plan: AbsencePlan, staff: Staff[]): string[] {
  const errors: string[] = [];
  if (!plan.coordinator) errors.push("Debes elegir un coordinador responsable.");
  if (plan.replacements.length === 0) errors.push("Debes asignar al menos un reemplazo.");
  const unavailable = plan.replacements.filter((id) => staff.find((s) => s.id === id)?.status === "ausente");
  if (unavailable.length) errors.push("Un reemplazo seleccionado está ausente.");
  if (!plan.from || !plan.to) errors.push("Define las fechas de la ausencia.");
  else if (plan.to < plan.from) errors.push("La fecha final debe ser posterior a la inicial.");
  return errors;
}

/** Freedom index: share of operational decisions resolved without Luis. */
export function autonomyIndex(resolvedWithoutLuis: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((resolvedWithoutLuis / total) * 100);
}
