import { BREAK, BUFFER, MAX_DAY_MINUTES, STALE_AFTER_MIN, travel } from "./catalog";
import { overlaps, toHHMM } from "./time";
import type { AvailabilityResult, AvailabilityStatus, Constraint, SchedulingContext, SlotRequest, StaffMember } from "./types";

const ACTIVE = new Set(["confirmada", "pendiente", "pendiente_okvet", "revision", "por_iniciar", "en_curso"]);

/** SchedulingEngine.evaluate — can this professional do this service at this time? Explains every rule. */
export function evaluateSlot(ctx: SchedulingContext, staffId: string, req: { service: string; zone: string; day: string; start: number; professionalPreferred?: string | undefined }): AvailabilityResult {
  const m = ctx.staff.find((s) => s.id === staffId);
  const svc = ctx.services.find((s) => s.name === req.service);
  const c: Constraint[] = []; const w: string[] = [];
  const dur = svc?.duration ?? 45; const end = req.start + dur;
  const base = (status: AvailabilityStatus, tb = 0, ta = 0, score = 0): AvailabilityResult => ({
    status, professionalId: staffId, day: req.day, startAt: req.start, endAt: end, serviceDuration: dur, travelBefore: tb, travelAfter: ta,
    bufferBefore: BUFFER, bufferAfter: BUFFER, constraints: c, warnings: w, confidence: ctx.dataAgeMinutes > STALE_AFTER_MIN ? "baja" : tb || ta ? "media" : "alta",
    sourceFreshness: ctx.dataAgeMinutes > STALE_AFTER_MIN ? "desactualizado" : "vigente", requiresApproval: false, requiresOkvetConfirmation: true, score,
  });
  if (!m) { c.push({ code: "NO_STAFF", hard: true, message: "Profesional no encontrado" }); return base("UNAVAILABLE"); }
  if (!svc) { c.push({ code: "NO_SERVICE", hard: true, message: "Servicio no está en el catálogo" }); return base("INCOMPATIBLE"); }
  if (!svc.roles.includes(m.role)) { c.push({ code: "NOT_QUALIFIED", hard: true, message: `${m.role} no está habilitado para ${svc.name}` }); return base("INCOMPATIBLE"); }
  if (!ctx.coveredZones.includes(req.zone)) { c.push({ code: "ZONE_NOT_COVERED", hard: true, message: `${req.zone} no está en la cobertura` }); return base("UNAVAILABLE"); }

  const mine = ctx.shifts.filter((s) => s.staffId === m.id);
  const absent = mine.find((s) => s.kind === "ausencia" && s.day === req.day && overlaps(s.start, s.end, req.start, end));
  if (absent) { c.push({ code: "ABSENCE", hard: true, message: "Ausencia registrada en esa franja" }); return base("UNAVAILABLE"); }
  if (m.absentToday && req.day === "hoy") { c.push({ code: "ABSENCE", hard: true, message: "Ausente hoy" }); return base("UNAVAILABLE"); }
  const turns = mine.filter((s) => s.kind === "turno");
  const shift = turns.find((s) => s.day === req.day && s.start <= req.start && s.end >= end);
  let needsCoord = false;
  if (!turns.length) { needsCoord = true; w.push("Sin turnos registrados: confirma la jornada con la persona"); }
  else if (!shift) {
    const sameDay = turns.find((s) => s.day === req.day);
    c.push({ code: sameDay ? "OUTSIDE_SHIFT" : "NO_SHIFT", hard: true, message: sameDay ? `Fuera de turno (${toHHMM(sameDay.start)}–${toHHMM(sameDay.end)}) o el servicio no cabe antes del cierre` : `Sin turno el ${req.day}` });
    return base("UNAVAILABLE");
  }
  if (shift && shift.end - shift.start >= BREAK.minShift && overlaps(BREAK.start, BREAK.end, req.start, end)) {
    c.push({ code: "BREAK", hard: true, message: `Descanso obligatorio ${toHHMM(BREAK.start)}–${toHHMM(BREAK.end)}` }); return base("UNAVAILABLE");
  }

  const hold = ctx.holds.find((h) => h.staffId === m.id && h.day === req.day && h.status === "ACTIVE" && h.expiresAt > ctx.now && overlaps(h.start, h.end, req.start, end));
  if (hold) { c.push({ code: "HELD", hard: true, message: "Reserva provisional de otra persona en esa franja" }); return base("PROVISIONALLY_HELD"); }

  const day = ctx.bookings.filter((b) => b.staffId === m.id && b.day === req.day && ACTIVE.has(b.status)).sort((a, b) => a.start - b.start);
  const prev = day.filter((b) => b.start + b.duration <= req.start).pop();
  const next = day.find((b) => b.start >= end);
  for (const b of day) {
    if (overlaps(b.start, b.start + b.duration, req.start, end)) {
      c.push({ code: b.protected ? "PROTECTED" : "OVERLAP", hard: true, message: `${b.protected ? "Visita protegida" : "Ocupado"}: ${b.label ?? "cita"} a las ${toHHMM(b.start)}` });
      return base("BUSY");
    }
  }
  const tb = prev ? travel(prev.zone, req.zone) : 0; const ta = next ? travel(req.zone, next.zone) : 0;
  if (prev && prev.start + prev.duration + BUFFER + tb > req.start) { c.push({ code: "TRAVEL_BEFORE", hard: true, message: `No alcanza a llegar desde ${prev.zone} (${tb} min de viaje + ${BUFFER} de margen)` }); return base("BUSY", tb, ta); }
  if (next && end + BUFFER + ta > next.start) { c.push({ code: "TRAVEL_AFTER", hard: true, message: `Pone en riesgo la cita de las ${toHHMM(next.start)} en ${next.zone}` }); return base("BUSY", tb, ta); }

  // soft rules
  let score = 100;
  const committed = day.reduce((a, b) => a + b.duration, 0) + dur;
  if (committed > MAX_DAY_MINUTES) { w.push(`Sobrecarga: ${Math.round(committed / 60 * 10) / 10} h comprometidas ese día`); score -= 30; }
  if (m.zone !== req.zone) { w.push(`Fuera de su zona habitual (${m.zone})`); score -= 15; }
  const skill = svc.preferredSkills.every((s) => m.skills.includes(s)); if (!skill) { w.push("Sin la competencia preferida registrada"); score -= 10; }
  score -= Math.round((tb + ta) / 5) + day.length * 3;
  if (req.professionalPreferred === m.id) score += 20;
  if (ctx.dataAgeMinutes > STALE_AFTER_MIN) { w.push("La agenda no se ha actualizado recientemente"); return base("STALE_DATA", tb, ta, score); }
  const r = base(needsCoord ? "COORDINATION_REQUIRED" : w.length ? "POSSIBLE" : "AVAILABLE", tb, ta, score);
  r.requiresApproval = committed > MAX_DAY_MINUTES;
  return r;
}

export const OFFERABLE: AvailabilityStatus[] = ["AVAILABLE", "POSSIBLE", "COORDINATION_REQUIRED"];

/** Search every professional and start time in the window; returns viable options ranked, and the rest explained. */
export function searchAvailability(ctx: SchedulingContext, req: SlotRequest) {
  const staff: StaffMember[] = req.professionalId ? ctx.staff.filter((s) => s.id === req.professionalId) : ctx.staff;
  const all: AvailabilityResult[] = [];
  for (const m of staff) for (let t = req.from; t < req.to; t += req.step) all.push(evaluateSlot(ctx, m.id, { service: req.service, zone: req.zone, day: req.day, start: t, professionalPreferred: req.professionalId }));
  const options = all.filter((r) => OFFERABLE.includes(r.status)).sort((a, b) => rank(a) - rank(b));
  const blocked = staff.map((m) => ({ staffId: m.id, reasons: [...new Set(all.filter((r) => r.professionalId === m.id && !OFFERABLE.includes(r.status)).flatMap((r) => r.constraints.map((x) => x.message)))] }));
  return { options, blocked };
}
const ORDER: Record<string, number> = { AVAILABLE: 0, POSSIBLE: 1, COORDINATION_REQUIRED: 2 };
const rank = (r: AvailabilityResult) => (ORDER[r.status] ?? 9) * 1000 - r.score + r.startAt / 1000;
