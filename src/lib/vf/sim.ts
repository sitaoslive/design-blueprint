/** Agenda simulator: 10 scenario types, pure computation, and the state machine SIMULADO → PROPUESTO → APROBADO → EJECUTADO. */
export type SimStatus = "simulado" | "propuesto" | "aprobado" | "ejecutado" | "rechazado";
export type SimParam = "staff" | "zone" | "visit" | "minutes" | "count";
export interface SimType { id: string; name: string; desc: string; params: SimParam[] }
export const SIM_TYPES: SimType[] = [
  { id: "SIM-01", name: "Ausencia de profesional", desc: "Reasignar las visitas de una persona ausente", params: ["staff"] },
  { id: "SIM-02", name: "Retraso en ruta", desc: "Desplazar visitas siguientes por un retraso", params: ["staff", "minutes"] },
  { id: "SIM-03", name: "Urgencia entrante", desc: "Insertar una urgencia y mover la visita menos prioritaria", params: ["zone"] },
  { id: "SIM-04", name: "Cancelación de cita", desc: "Liberar un horario y ofrecerlo a la lista de espera", params: ["visit"] },
  { id: "SIM-05", name: "Reprogramación de cita", desc: "Mover una cita a otro horario", params: ["visit", "minutes"] },
  { id: "SIM-06", name: "Cierre de zona", desc: "Visitas de una zona sin cobertura ese día", params: ["zone"] },
  { id: "SIM-07", name: "Sobrecarga de agenda", desc: "Redistribuir a quien supera la carga sana", params: ["staff"] },
  { id: "SIM-08", name: "Nuevo profesional", desc: "Sumar capacidad y equilibrar la carga", params: ["zone"] },
  { id: "SIM-09", name: "Aumento de demanda", desc: "Simular solicitudes adicionales en una zona", params: ["zone", "count"] },
  { id: "SIM-10", name: "Reorganización de rutas", desc: "Agrupar visitas por zona para reducir traslados", params: [] },
];
export interface SVisit { id: string; staffId: string | null; zone: string; time: string; status: string; service: string }
export interface SStaff { id: string; name: string; zone: string; status: string; load: number }
export interface SimParams { staff?: string | undefined; zone?: string | undefined; visit?: string | undefined; minutes?: number | undefined; count?: number | undefined }
export interface Change { visitId: string; field: "staffId" | "time" | "status"; before: string | null; after: string | null; label: string }
export interface SimResult { changes: Change[]; summary: string; impact: { label: string; before: number; after: number }[]; warnings: string[] }

const addMin = (t: string, m: number) => { const [h = 0, mm = 0] = t.split(":").map(Number); const x = Math.max(0, Math.min(23 * 60 + 59, h * 60 + mm + m)); return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
const open = (v: SVisit) => v.status !== "finalizada" && v.status !== "cancelada";

export function simulate(type: string, p: SimParams, visits: SVisit[], staff: SStaff[]): SimResult {
  const name = (id: string | null) => staff.find((s) => s.id === id)?.name ?? "Sin asignar";
  const active = staff.filter((s) => s.status !== "ausente");
  const loads = () => staff.map((s) => ({ label: s.name, before: s.load, after: s.load }));
  const reassign = (vs: SVisit[], exclude: string | undefined, warnings: string[]) => {
    const pool = active.filter((s) => s.id !== exclude).sort((a, b) => a.load - b.load); const impact = loads(); const changes: Change[] = [];
    vs.forEach((v, i) => { const to = pool.find((s) => s.zone === v.zone) ?? pool[i % Math.max(1, pool.length)];
      if (!to) { warnings.push(`Sin reemplazo para ${v.time} · ${v.service}`); return; }
      changes.push({ visitId: v.id, field: "staffId", before: v.staffId, after: to.id, label: `${v.time} · ${v.service}: ${name(v.staffId)} → ${to.name}` });
      const r = impact.find((x) => x.label === to.name); if (r) r.after = Math.min(100, r.after + 10); const o = impact.find((x) => x.label === name(v.staffId)); if (o) o.after = Math.max(0, o.after - 10); });
    return { changes, impact };
  };
  const w: string[] = [];
  switch (type) {
    case "SIM-01": case "SIM-07": {
      let vs = visits.filter((v) => v.staffId === p.staff && open(v)); if (type === "SIM-07") vs = vs.slice(Math.ceil(vs.length / 2));
      const { changes, impact } = reassign(vs, p.staff, w);
      return { changes, impact, warnings: w, summary: `${changes.length} visitas de ${name(p.staff ?? null)} pasan a otras personas` };
    }
    case "SIM-02": case "SIM-05": {
      const m = p.minutes ?? 30; const vs = type === "SIM-02" ? visits.filter((v) => v.staffId === p.staff && open(v)) : visits.filter((v) => v.id === p.visit);
      const changes = vs.map((v) => ({ visitId: v.id, field: "time" as const, before: v.time, after: addMin(v.time, m), label: `${v.service}: ${v.time} → ${addMin(v.time, m)}` }));
      if (changes.some((c) => (c.after ?? "") > "18:00")) w.push("Alguna visita queda después de las 18:00");
      return { changes, impact: [{ label: "Minutos desplazados", before: 0, after: m * changes.length }], warnings: w, summary: `${changes.length} visitas se mueven ${m} min` };
    }
    case "SIM-03": {
      const z = visits.filter((v) => v.zone === p.zone && open(v)).sort((a, b) => b.time.localeCompare(a.time))[0];
      if (!z) return { changes: [], impact: [], warnings: ["No hay visitas en esa zona"], summary: "La urgencia se atiende sin mover citas" };
      return { changes: [{ visitId: z.id, field: "time", before: z.time, after: addMin(z.time, 60), label: `${z.service}: ${z.time} → ${addMin(z.time, 60)} para atender la urgencia` }], impact: [{ label: "Citas movidas", before: 0, after: 1 }], warnings: w, summary: `Se libera tiempo en ${p.zone}` };
    }
    case "SIM-04": {
      const v = visits.find((x) => x.id === p.visit);
      return v ? { changes: [{ visitId: v.id, field: "status", before: v.status, after: "cancelada", label: `${v.time} · ${v.service} se cancela y el horario queda libre` }], impact: [{ label: "Horarios libres", before: 0, after: 1 }], warnings: w, summary: "Un horario queda disponible para la lista de espera" } : { changes: [], impact: [], warnings: ["Elige una cita"], summary: "Sin cambios" };
    }
    case "SIM-06": {
      const vs = visits.filter((v) => v.zone === p.zone && open(v));
      return { changes: vs.map((v) => ({ visitId: v.id, field: "status" as const, before: v.status, after: "pendiente", label: `${v.time} · ${v.service} queda por reprogramar` })), impact: [{ label: `Visitas en ${p.zone}`, before: vs.length, after: 0 }], warnings: vs.length ? ["Avisar a los clientes antes de ejecutar"] : [], summary: `${vs.length} visitas de ${p.zone ?? "la zona"} por reprogramar` };
    }
    case "SIM-08": {
      const avg = staff.length ? Math.round(staff.reduce((a, s) => a + s.load, 0) / staff.length) : 0; const after = Math.round((avg * staff.length) / (staff.length + 1));
      return { changes: [], impact: [{ label: "Carga promedio %", before: avg, after }], warnings: ["Requiere contratar y registrar a la persona antes de ejecutar"], summary: `Con una persona más en ${p.zone ?? "la zona"}, la carga baja a ${after}%` };
    }
    case "SIM-09": {
      const n = p.count ?? 5; const cap = active.filter((s) => s.zone === p.zone).length * 6; const cur = visits.filter((v) => v.zone === p.zone && open(v)).length;
      if (cur + n > cap) w.push(`Supera la capacidad de ${p.zone} (${cap} visitas)`);
      return { changes: [], impact: [{ label: `Visitas en ${p.zone}`, before: cur, after: cur + n }, { label: "Capacidad", before: cap, after: cap }], warnings: w, summary: `${n} solicitudes más en ${p.zone ?? "la zona"}` };
    }
    case "SIM-10": {
      const vs = visits.filter(open); const changes: Change[] = [];
      vs.forEach((v) => { const best = active.filter((s) => s.zone === v.zone).sort((a, b) => a.load - b.load)[0]; if (best && best.id !== v.staffId) changes.push({ visitId: v.id, field: "staffId", before: v.staffId, after: best.id, label: `${v.time} · ${v.service}: ${name(v.staffId)} → ${best.name} (${v.zone})` }); });
      return { changes, impact: [{ label: "Visitas fuera de zona", before: changes.length, after: 0 }], warnings: w, summary: `${changes.length} visitas pasan a quien cubre su zona` };
    }
  }
  return { changes: [], impact: [], warnings: ["Tipo desconocido"], summary: "Sin cambios" };
}

const NEXT: Record<SimStatus, SimStatus[]> = { simulado: ["propuesto"], propuesto: ["aprobado", "rechazado"], aprobado: ["ejecutado"], ejecutado: [], rechazado: [] };
export const canTransition = (from: SimStatus, to: SimStatus) => NEXT[from].includes(to);
export const SIM_LABEL: Record<SimStatus, string> = { simulado: "SIMULADO", propuesto: "PROPUESTO", aprobado: "APROBADO", ejecutado: "EJECUTADO", rechazado: "RECHAZADO" };
