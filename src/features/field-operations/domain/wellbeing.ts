/** WorkforceWellbeingEvaluator (§30): operational data only — no psychological or health inference. */
export interface WorkInput { staffId: string; shiftMinutes: number; serviceMinutes: number; travelMinutes: number; visits: number; hasBreak: boolean; helpRequests: number; reassignments: number; absent: boolean }
export interface WorkEval { staffId: string; loadPct: number; level: "sin_turno" | "ausente" | "normal" | "alta" | "sobrecarga"; restOk: boolean; routeFeasible: boolean; signals: string[] }
export function evaluateWorkload(w: WorkInput, maxMinutes = 420): WorkEval {
  if (w.absent) return { staffId: w.staffId, loadPct: 0, level: "ausente", restOk: true, routeFeasible: true, signals: [] };
  if (!w.shiftMinutes) return { staffId: w.staffId, loadPct: 0, level: "sin_turno", restOk: true, routeFeasible: true, signals: w.visits ? ["Tiene visitas sin turno registrado"] : [] };
  const busy = w.serviceMinutes + w.travelMinutes; const loadPct = Math.round((busy / w.shiftMinutes) * 100);
  const restOk = w.shiftMinutes < 360 || w.hasBreak; const routeFeasible = busy <= w.shiftMinutes;
  const signals: string[] = [];
  if (!restOk) signals.push("Sin descanso en turno de 6 h o más");
  if (!routeFeasible) signals.push("La ruta no cabe en el turno");
  if (busy > maxMinutes) signals.push("Supera el máximo diario configurado");
  if (w.helpRequests) signals.push(`${w.helpRequests} solicitudes de ayuda`);
  if (w.reassignments >= 2) signals.push(`${w.reassignments} cambios de asignación hoy`);
  const level = !routeFeasible || busy > maxMinutes ? "sobrecarga" : loadPct >= 85 ? "alta" : "normal";
  return { staffId: w.staffId, loadPct, level, restOk, routeFeasible, signals };
}
