/** Prompt 07 §7–16 advanced scenarios (ADV-01..10). Pure, never touches real visits; outputs the shared SimResult. */
import type { SimParams, SimResult, Change, SVisit, SStaff } from "./sim";
export type AdvParam = "staff" | "staffList" | "zone" | "visit" | "day" | "hours" | "count" | "priority";
export const ADV_TYPES: { id: string; name: string; desc: string; params: AdvParam[] }[] = [
  { id: "ADV-01", name: "Reasignar veterinarios", desc: "Sustituir a un profesional solo con personas habilitadas y con turno", params: ["staff", "day"] },
  { id: "ADV-02", name: "Citas flexibles", desc: "Mover solo citas con flexibilidad autorizada; sin regla queda pendiente de validación", params: ["day", "hours"] },
  { id: "ADV-03", name: "Turno adicional", desc: "Simular horas extra de un profesional (no activa ningún turno real)", params: ["staff", "day", "hours"] },
  { id: "ADV-04", name: "Cambio a otro día", desc: "Opciones de otros días para una cita, sin moverla", params: ["visit"] },
  { id: "ADV-05", name: "Apoyo temporal", desc: "Profesionales de respaldo registrados y verificados (no contrata a nadie)", params: ["zone", "day"] },
  { id: "ADV-06", name: "Redistribución por sectores", desc: "Agrupar por zona para reducir traslados; sin coordenadas es estimación", params: ["day"] },
  { id: "ADV-07", name: "Urgencias", desc: "Hacer espacio a una urgencia cuya prioridad definió un profesional", params: ["zone", "day", "priority"] },
  { id: "ADV-08", name: "Tratamientos recurrentes", desc: "Revisar ocurrencias de un plan sin cambiar frecuencia, dosis ni indicación", params: ["staff"] },
  { id: "ADV-09", name: "Ausencia múltiple", desc: "Dos o más profesionales ausentes; puede no haber solución", params: ["staffList", "day"] },
  { id: "ADV-10", name: "Crecimiento de demanda", desc: "Hipótesis de visitas adicionales por día (ESTIMACIÓN)", params: ["zone", "count"] },
];
export type AVisit = SVisit & { date?: string; petId?: string };
export type AStaff = SStaff & { skills?: string[]; role?: string };
export type AParams = SimParams & { staffList?: string[]; day?: string; hours?: number; priority?: boolean; shifts?: { staff_id: string | null; day: string }[]; flexible?: string[]; objective?: string };
const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const weekday = (d?: string) => (d ? DAYS[new Date(`${d}T12:00:00`).getDay()] ?? "" : "");
const open = (v: AVisit) => v.status !== "finalizada" && v.status !== "cancelada";
const PER_DAY = 6;
const onDay = (v: AVisit, day?: string) => !day || !v.date || v.date === day;
const needsVet = (service: string) => !/muestra|curaci/i.test(service);

/** A professional is eligible only if active, with a shift that weekday (when shifts are known) and qualified (vet for clinical services). */
export function eligible(s: AStaff, v: AVisit, p: AParams, exclude: string[]): string | null {
  if (exclude.includes(s.id)) return "Ausente en el escenario";
  if (s.status === "ausente") return "Ausente";
  if (needsVet(v.service) && s.role && s.role !== "Veterinario") return "No habilitado para el servicio";
  if (p.shifts?.length && !p.shifts.some((x) => x.staff_id === s.id && x.day.toLowerCase() === weekday(v.date))) return `Sin turno el ${weekday(v.date)}`;
  return null;
}
function reassign(vs: AVisit[], staff: AStaff[], p: AParams, exclude: string[], visits: AVisit[]) {
  const name = (id: string | null) => staff.find((s) => s.id === id)?.name ?? "Sin asignar";
  const extra: Record<string, number> = {}; const changes: Change[] = []; const warnings: string[] = []; const keep: string[] = [];
  for (const v of vs) {
    const cands = staff.map((s) => ({ s, why: eligible(s, v, p, exclude) })).filter((x) => !x.why).map((x) => x.s)
      .map((s) => ({ s, load: visits.filter((o) => o.staffId === s.id && o.date === v.date && open(o)).length + (extra[s.id] ?? 0) }))
      .filter((x) => x.load < PER_DAY && !visits.some((o) => o.staffId === x.s.id && o.date === v.date && o.time === v.time && open(o)))
      .sort((a, b) => Number(b.s.zone === v.zone) - Number(a.s.zone === v.zone) || a.load - b.load);
    const to = cands[0]?.s;
    if (!to) { warnings.push(`Sin profesional habilitado para ${v.date ?? ""} ${v.time} · ${v.service}: requiere coordinación`); keep.push(v.id); continue; }
    extra[to.id] = (extra[to.id] ?? 0) + 1;
    changes.push({ visitId: v.id, field: "staffId", before: v.staffId, after: to.id, label: `${v.time} · ${v.service}: ${name(v.staffId)} → ${to.name}${to.zone !== v.zone ? " (otra zona)" : ""}` });
  }
  return { changes, warnings, keep };
}

export function simulateAdvanced(type: string, p: AParams, visits: AVisit[], staff: AStaff[]): SimResult {
  const name = (id?: string | null) => staff.find((s) => s.id === id)?.name ?? "—";
  switch (type) {
    case "ADV-01": case "ADV-09": {
      const out = type === "ADV-01" ? [p.staff ?? ""] : p.staffList ?? [];
      if (type === "ADV-09" && out.length < 2) return { changes: [], impact: [], warnings: ["Elige al menos dos profesionales"], summary: "Faltan datos" };
      const vs = visits.filter((v) => v.staffId && out.includes(v.staffId) && open(v) && onDay(v, p.day));
      const r = reassign(vs, staff, p, out, visits);
      const left = staff.filter((s) => !out.includes(s.id) && s.status !== "ausente").length;
      return { changes: r.changes, warnings: r.warnings, impact: [{ label: "Visitas afectadas", before: vs.length, after: r.keep.length }, { label: "Capacidad restante (visitas/día)", before: staff.length * PER_DAY, after: left * PER_DAY }],
        summary: vs.length === 0 ? "No hay visitas que reasignar" : r.keep.length ? `${r.changes.length} de ${vs.length} visitas tienen reemplazo; ${r.keep.length} sin solución válida` : `Las ${vs.length} visitas tienen reemplazo habilitado` };
    }
    case "ADV-02": {
      const vs = visits.filter((v) => open(v) && onDay(v, p.day)); const ok = vs.filter((v) => p.flexible?.includes(v.id)); const h = p.hours ?? 1;
      const add = (t: string) => { const [a = 0, b = 0] = t.split(":").map(Number); const m = Math.min(18 * 60, a * 60 + b + h * 60); return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
      return { changes: ok.map((v) => ({ visitId: v.id, field: "time" as const, before: v.time, after: add(v.time), label: `${v.service}: ${v.time} → ${add(v.time)} · requiere aceptación del cliente` })),
        warnings: vs.length - ok.length ? [`${vs.length - ok.length} citas sin regla de flexibilidad: pendientes de validación profesional`] : [], impact: [{ label: "Citas movibles", before: 0, after: ok.length }], summary: ok.length ? `${ok.length} citas flexibles se mueven ${h} h` : "Ninguna cita tiene flexibilidad autorizada" };
    }
    case "ADV-03": {
      const h = p.hours ?? 2; const add = Math.floor((h * 60) / 75); const waiting = visits.filter((v) => !v.staffId && open(v) && onDay(v, p.day));
      const covered = waiting.slice(0, add);
      return { changes: covered.map((v) => ({ visitId: v.id, field: "staffId" as const, before: null, after: p.staff ?? null, label: `${v.time} · ${v.service} → ${name(p.staff)} en turno extra` })),
        warnings: ["El turno extra no se activa hasta registrarlo en Turnos", ...(h > 3 ? ["Más de 3 h extra: revisa descanso y carga sana"] : [])], impact: [{ label: "Horas adicionales", before: 0, after: h }, { label: "Visitas adicionales posibles", before: 0, after: add }], summary: `${h} h extra de ${name(p.staff)}: hasta ${add} visitas más, ${covered.length} sin asignar cubiertas` };
    }
    case "ADV-04": {
      const v = visits.find((x) => x.id === p.visit); if (!v?.date) return { changes: [], impact: [], warnings: ["Elige una cita con fecha"], summary: "Faltan datos" };
      const opts: string[] = [];
      for (let i = 1; i <= 7 && opts.length < 3; i++) { const d = new Date(`${v.date}T12:00:00`); d.setDate(d.getDate() + i); const ds = d.toISOString().slice(0, 10);
        if (d.getDay() === 0) continue; const load = visits.filter((o) => o.date === ds && o.staffId === v.staffId && open(o)).length; if (load < PER_DAY) opts.push(`${ds} (${PER_DAY - load} cupos de ${name(v.staffId)})`); }
      return { changes: [], impact: [{ label: "Opciones de día", before: 0, after: opts.length }], warnings: ["No se mueve la cita: el cliente debe aceptar el nuevo día", "Si la cita tiene ventana clínica protegida, otro día requiere autorización clínica"], summary: opts.length ? `Opciones: ${opts.join(" · ")}` : "No hay días con cupo esta semana" };
    }
    case "ADV-05":
      return { changes: [], impact: [{ label: "Respaldos verificados", before: 0, after: 0 }], warnings: ["No hay profesionales de respaldo registrados y verificados", "La plataforma no contrata ni firma contratos"], summary: "Sin apoyo temporal disponible: registra respaldos verificados primero" };
    case "ADV-06": {
      const vs = visits.filter((v) => open(v) && onDay(v, p.day)); const changes: Change[] = [];
      for (const v of vs) { const best = staff.filter((s) => s.zone === v.zone && !eligible(s, v, p, [])).sort((a, b) => a.load - b.load)[0]; if (best && best.id !== v.staffId && staff.find((s) => s.id === v.staffId)?.zone !== v.zone) changes.push({ visitId: v.id, field: "staffId", before: v.staffId, after: best.id, label: `${v.time} · ${v.zone}: ${name(v.staffId)} → ${best.name}` }); }
      return { changes, impact: [{ label: "Visitas fuera de zona", before: changes.length, after: 0 }], warnings: ["ESTIMACIÓN INCOMPLETA: no hay coordenadas ni tiempos de viaje reales"], summary: `${changes.length} visitas pasan a quien cubre su zona` };
    }
    case "ADV-07": {
      if (!p.priority) return { changes: [], impact: [], warnings: ["Un profesional autorizado debe definir la prioridad de la urgencia antes de simular"], summary: "Bloqueado: falta prioridad profesional" };
      const vs = visits.filter((v) => v.zone === p.zone && open(v) && onDay(v, p.day)).sort((a, b) => b.time.localeCompare(a.time)); const v = vs[0];
      const free = staff.find((s) => s.zone === p.zone && s.status !== "ausente" && !visits.some((o) => o.staffId === s.id && o.date === p.day && open(o)));
      if (free) return { changes: [], impact: [{ label: "Citas movidas", before: 0, after: 0 }], warnings: [], summary: `${free.name} está libre en ${p.zone}: atiende la urgencia sin mover citas` };
      return { changes: v ? [{ visitId: v.id, field: "status", before: v.status, after: "pendiente", label: `${v.time} · ${v.service} se propone mover (requiere evaluación profesional y aviso al cliente)` }] : [], impact: [{ label: "Clientes afectados", before: 0, after: v ? 1 : 0 }], warnings: ["Nunca se cancela una cita sin avisar", "No se mueve una visita de mayor riesgo sin evaluación profesional"], summary: v ? "Se propone mover la última cita de la zona" : "No hay citas en esa zona" };
    }
    case "ADV-08": {
      const vs = visits.filter((v) => v.staffId === p.staff && open(v) && /control|recurrente|curaci/i.test(v.service));
      const conflicts = vs.filter((v) => visits.some((o) => o.id !== v.id && o.staffId === v.staffId && o.date === v.date && o.time === v.time && open(o)));
      return { changes: [], impact: [{ label: "Ocurrencias revisadas", before: vs.length, after: vs.length }, { label: "Conflictos", before: conflicts.length, after: conflicts.length }], warnings: ["No se cambian frecuencia, dosis, medicamento ni indicación", ...conflicts.map((c) => `Conflicto ${c.date} ${c.time}`)], summary: `${vs.length} ocurrencias de ${name(p.staff)}, ${conflicts.length} con conflicto` };
    }
    case "ADV-10": {
      const n = p.count ?? 5; const cap = staff.filter((s) => s.zone === p.zone && s.status !== "ausente").length * PER_DAY; const cur = visits.filter((v) => v.zone === p.zone && open(v)).length;
      const need = Math.max(0, Math.ceil((cur + n - cap) / PER_DAY));
      return { changes: [], impact: [{ label: `Visitas en ${p.zone}`, before: cur, after: cur + n }, { label: "Capacidad", before: cap, after: cap }, { label: "Profesionales adicionales", before: 0, after: need }], warnings: ["ESTIMACIÓN: hipótesis, no confirmación operativa", ...(need ? [`Cuello de botella en ${p.zone}`] : [])], summary: need ? `Con ${n} visitas más por día se necesitan ${need} profesionales más en ${p.zone}` : `La capacidad actual absorbe ${n} visitas más` };
    }
  }
  return { changes: [], impact: [], warnings: ["Tipo desconocido"], summary: "Sin cambios" };
}
