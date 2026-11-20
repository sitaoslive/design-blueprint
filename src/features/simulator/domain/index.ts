import { simulate, type SimParams, type SimResult, type SVisit, type SStaff } from "@/lib/vf/sim";
/** Prompt 07 decision intelligence over the existing SIM engine (src/lib/vf/sim.ts). Pure; no writes. */

// §17 Snapshot
export interface SnapEntry { id: string; staffId: string | null; time: string; status: string; date?: string }
export interface Snapshot { takenAt: string; entries: SnapEntry[]; staffStatus: Record<string, string> }
export function takeSnapshot(visits: (SVisit & { date?: string })[], staff: SStaff[], now = new Date()): Snapshot {
  return { takenAt: now.toISOString(), entries: visits.map((v) => ({ id: v.id, staffId: v.staffId, time: v.time, status: v.status, ...(v.date ? { date: v.date } : {}) })), staffStatus: Object.fromEntries(staff.map((s) => [s.id, s.status])) };
}

// §25 Freshness
export type Freshness = "CURRENT" | "PARTIALLY_STALE" | "STALE";
export function checkFreshness(snap: Snapshot | undefined, visits: SVisit[], staff: SStaff[], touched: string[]): { status: Freshness; changed: string[]; reasons: string[] } {
  if (!snap) return { status: "STALE", changed: [], reasons: ["Escenario sin foto de la agenda: vuelve a simular"] };
  const changed: string[] = []; const reasons: string[] = [];
  for (const e of snap.entries) { const v = visits.find((x) => x.id === e.id);
    if (!v) { changed.push(e.id); reasons.push(`La cita ${e.id} ya no existe`); continue; }
    if (v.staffId !== e.staffId || v.time !== e.time || v.status !== e.status) { changed.push(e.id); reasons.push(`La cita ${v.time} · ${v.service} cambió`); } }
  for (const v of visits) if (!snap.entries.some((e) => e.id === v.id)) reasons.push(`Nueva cita ${v.time} · ${v.service}`);
  for (const s of staff) if (snap.staffStatus[s.id] && snap.staffStatus[s.id] !== s.status) reasons.push(`${s.name} cambió de estado (${s.status})`);
  const staffChanged = staff.some((s) => snap.staffStatus[s.id] && snap.staffStatus[s.id] !== s.status);
  const hit = changed.some((id) => touched.includes(id));
  return { status: hit || staffChanged ? "STALE" : reasons.length ? "PARTIALLY_STALE" : "CURRENT", changed, reasons };
}

// §18 Hard constraints
export function hardViolations(r: SimResult, staff: SStaff[]): string[] {
  const out: string[] = [];
  for (const c of r.changes) {
    if (c.field === "staffId" && c.after) { const s = staff.find((x) => x.id === c.after); if (!s) out.push(`${c.label}: profesional inexistente`); else if (s.status === "ausente") out.push(`${c.label}: ${s.name} está ausente`); }
    if (c.field === "time" && c.after && (c.after > "18:00" || c.after < "07:00")) out.push(`${c.label}: fuera del horario de atención`);
  }
  for (const i of r.impact) if (i.label !== "Minutos desplazados" && /%|carga/i.test(i.label) === false && staff.some((s) => s.name === i.label) && i.after > 100) out.push(`${i.label} supera el 100 % de carga`);
  return out;
}

// §19 Alternatives
export interface Alternative { key: string; name: string; goal: string; result: SimResult }
export function generateAlternatives(type: string, p: SimParams, visits: SVisit[], staff: SStaff[]): Alternative[] {
  const alts: Alternative[] = [{ key: "base", name: "Propuesta principal", goal: "Lo que pediste", result: simulate(type, p, visits, staff) }];
  if (["SIM-01", "SIM-07"].includes(type)) alts.push({ key: "aplazar", name: "Aplazar 60 min", goal: "Conservar profesional", result: simulate("SIM-02", { ...p, minutes: 60 }, visits, staff) });
  if (["SIM-02", "SIM-05"].includes(type)) alts.push({ key: "menos", name: "Mover solo 15 min", goal: "Menor impacto al cliente", result: simulate(type, { ...p, minutes: 15 }, visits, staff) });
  if (type === "SIM-06") alts.push({ key: "zona", name: "Redistribuir por zona", goal: "Conservar las citas", result: simulate("SIM-10", p, visits.filter((v) => v.zone === p.zone), staff) });
  alts.push({ key: "nada", name: "No hacer cambios", goal: "Referencia", result: { changes: [], impact: [], warnings: [], summary: "La agenda queda igual" } });
  return alts;
}

// §21 Scoring
export type Profile = "cliente" | "continuidad" | "rutas" | "equipo" | "costo";
export const PROFILES: Record<Profile, { label: string; w: { changes: number; clients: number; cancel: number; minutes: number; balance: number; reassign: number } }> = {
  cliente: { label: "Mínimo impacto al cliente", w: { changes: 1, clients: 3, cancel: 5, minutes: 2, balance: 0.5, reassign: 1 } },
  continuidad: { label: "Máxima continuidad", w: { changes: 1, clients: 1, cancel: 4, minutes: 1, balance: 0.5, reassign: 3 } },
  rutas: { label: "Eficiencia de rutas", w: { changes: 0.5, clients: 1, cancel: 2, minutes: 3, balance: 0.5, reassign: 1 } },
  equipo: { label: "Equilibrio del equipo", w: { changes: 0.5, clients: 1, cancel: 2, minutes: 1, balance: 3, reassign: 0.5 } },
  costo: { label: "Menor costo operativo", w: { changes: 2, clients: 1, cancel: 2, minutes: 1, balance: 1, reassign: 2 } },
};
export interface Scored { alt: Alternative; executable: boolean; violations: string[]; score: number | null; explain: string[]; clients: number }
export function scoreAlternatives(alts: Alternative[], profile: Profile, visits: (SVisit & { petId?: string })[], staff: SStaff[]): { scored: Scored[]; best: string | null; note: string } {
  const w = PROFILES[profile].w;
  const scored = alts.map((alt) => {
    const violations = hardViolations(alt.result, staff); const ch = alt.result.changes;
    const clients = new Set(ch.map((c) => visits.find((v) => v.id === c.visitId)?.petId ?? c.visitId)).size;
    const cancel = ch.filter((c) => c.field === "status").length; const reassign = ch.filter((c) => c.field === "staffId").length;
    const minutes = alt.result.impact.find((i) => i.label === "Minutos desplazados")?.after ?? 0;
    const loads = alt.result.impact.filter((i) => staff.some((s) => s.name === i.label)).map((i) => i.after);
    const balance = loads.length ? Math.sqrt(loads.reduce((a, x) => a + (x - loads.reduce((b, y) => b + y, 0) / loads.length) ** 2, 0) / loads.length) / 10 : 0;
    const penalty = w.changes * ch.length + w.clients * clients + w.cancel * cancel + w.minutes * (minutes / 30) + w.balance * balance + w.reassign * reassign + alt.result.warnings.length;
    const explain = [`${ch.length} cambios`, `${clients} clientes afectados`, ...(cancel ? [`${cancel} quedan por reprogramar`] : []), ...(minutes ? [`${minutes} min desplazados`] : []), ...(alt.result.warnings.length ? [`${alt.result.warnings.length} advertencias`] : [])];
    return { alt, executable: violations.length === 0, violations, score: violations.length ? null : Math.max(0, Math.round(100 - penalty * 5)), explain, clients };
  });
  const ok = scored.filter((s) => s.executable && s.alt.key !== "nada");
  const sorted = [...ok].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const tie = sorted.length > 1 && sorted[0]!.score === sorted[1]!.score;
  return { scored, best: sorted.length && !tie ? sorted[0]!.alt.key : null, note: !sorted.length ? "Ninguna alternativa cumple las restricciones obligatorias" : tie ? "Datos insuficientes para recomendar una sola alternativa" : "Recomendación según el perfil elegido; Dirección decide" };
}

// §24 Affected clients
export function affectedClients(r: SimResult, visits: (SVisit & { petId?: string })[], pets: { id: string; name: string; owner: string }[]) {
  return r.changes.map((c) => { const v = visits.find((x) => x.id === c.visitId); const p = pets.find((x) => x.id === v?.petId);
    return { visitId: c.visitId, owner: p?.owner ?? "Cliente", pet: p?.name ?? "—", change: c.label, needsContact: c.field !== "staffId" }; });
}

// §27–29 Execution plan
export type StepStatus = "PENDIENTE" | "APLICADO" | "OMITIDO" | "FALLIDO";
export interface PlanStep { key: string; visitId: string; field: string; before: string | null; after: string | null; label: string; status: StepStatus; error?: string }
export const buildPlan = (simId: string, r: SimResult): PlanStep[] => r.changes.map((c) => ({ key: `sim:${simId}:${c.visitId}:${c.field}`, visitId: c.visitId, field: c.field, before: c.before, after: c.after, label: c.label, status: "PENDIENTE" }));
export function reconcile(steps: PlanStep[]): { done: boolean; applied: number; failed: number; skipped: number; outcome: "COMPLETO" | "PARCIAL" | "FALLIDO" | "PENDIENTE" } {
  const n = (s: StepStatus) => steps.filter((x) => x.status === s).length; const applied = n("APLICADO"), failed = n("FALLIDO"), skipped = n("OMITIDO");
  const done = n("PENDIENTE") === 0;
  return { done, applied, failed, skipped, outcome: !done ? "PENDIENTE" : failed + skipped === 0 ? "COMPLETO" : applied ? "PARCIAL" : "FALLIDO" };
}
