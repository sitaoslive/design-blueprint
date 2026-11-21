/** Prompt 08 Specialist Referral Hub — pure rules. Remote authority stays backend-owned. */
import { colombiaInstant } from "./advanced";
export type RefState =
  | "PROPOSED"
  | "PENDING_CLINICAL_APPROVAL"
  | "APPROVED"
  | "PENDING_COORDINATION"
  | "SPECIALIST_CONTACT_PENDING"
  | "AVAILABILITY_REQUESTED"
  | "AVAILABILITY_RECEIVED"
  | "OPTIONS_PREPARED"
  | "OPTIONS_SENT_TO_CUSTOMER"
  | "AWAITING_CUSTOMER_SELECTION"
  | "SLOT_SELECTED"
  | "PENDING_EXTERNAL_CONFIRMATION"
  | "APPOINTMENT_CONFIRMED"
  | "RESCHEDULE_REQUESTED"
  | "CANCELLED"
  | "APPOINTMENT_PENDING"
  | "ATTENDANCE_RECORDED"
  | "REPORT_PENDING"
  | "REPORT_RECEIVED"
  | "PROFESSIONAL_REVIEW_PENDING"
  | "FOLLOW_UP_SCHEDULED"
  | "REFERRAL_CLOSED";
export type RefActor = "clinico" | "coordinacion" | "cliente" | "especialista";
export const REF_LABEL: Record<RefState, string> = {
  PROPOSED: "Propuesta",
  PENDING_CLINICAL_APPROVAL: "Pendiente de aprobación clínica",
  APPROVED: "Aprobada",
  PENDING_COORDINATION: "Pendiente de coordinación",
  SPECIALIST_CONTACT_PENDING: "Contactar especialista",
  AVAILABILITY_REQUESTED: "Disponibilidad solicitada",
  AVAILABILITY_RECEIVED: "Disponibilidad recibida",
  OPTIONS_PREPARED: "Opciones preparadas",
  OPTIONS_SENT_TO_CUSTOMER: "Opciones enviadas al cliente",
  AWAITING_CUSTOMER_SELECTION: "Esperando elección del cliente",
  SLOT_SELECTED: "Horario elegido",
  PENDING_EXTERNAL_CONFIRMATION: "Pendiente de confirmación del especialista",
  APPOINTMENT_CONFIRMED: "Cita confirmada",
  RESCHEDULE_REQUESTED: "Reprogramación solicitada",
  CANCELLED: "Cancelada",
  APPOINTMENT_PENDING: "Cita por realizarse",
  ATTENDANCE_RECORDED: "Asistencia registrada",
  REPORT_PENDING: "Informe pendiente",
  REPORT_RECEIVED: "Informe recibido",
  PROFESSIONAL_REVIEW_PENDING: "Revisión profesional pendiente",
  FOLLOW_UP_SCHEDULED: "Seguimiento programado",
  REFERRAL_CLOSED: "Cerrada",
};
type T = {
  to: RefState;
  from: RefState[];
  actors: RefActor[];
  label: string;
  needs?: "evidence" | "offers" | "choice" | "reason";
};
export const REF_TRANSITIONS: Record<string, T> = {
  solicitar_aprobacion: {
    to: "PENDING_CLINICAL_APPROVAL",
    from: ["PROPOSED"],
    actors: ["clinico", "coordinacion"],
    label: "Pedir aprobación clínica",
  },
  aprobar: {
    to: "APPROVED",
    from: ["PENDING_CLINICAL_APPROVAL", "PROPOSED"],
    actors: ["clinico"],
    label: "Aprobar indicación",
  },
  coordinar: {
    to: "SPECIALIST_CONTACT_PENDING",
    from: ["APPROVED", "PENDING_COORDINATION"],
    actors: ["coordinacion"],
    label: "Pasar a coordinación",
  },
  pedir_disponibilidad: {
    to: "AVAILABILITY_REQUESTED",
    from: ["SPECIALIST_CONTACT_PENDING"],
    actors: ["coordinacion"],
    label: "Registrar solicitud de disponibilidad",
  },
  recibir_disponibilidad: {
    to: "AVAILABILITY_RECEIVED",
    from: ["AVAILABILITY_REQUESTED"],
    actors: ["coordinacion"],
    label: "Disponibilidad recibida",
  },
  preparar_opciones: {
    to: "OPTIONS_PREPARED",
    from: ["AVAILABILITY_RECEIVED", "OPTIONS_PREPARED"],
    actors: ["coordinacion"],
    label: "Guardar opciones",
    needs: "offers",
  },
  enviar_opciones: {
    to: "AWAITING_CUSTOMER_SELECTION",
    from: ["OPTIONS_PREPARED"],
    actors: ["coordinacion"],
    label: "Enviar opciones al cliente",
    needs: "offers",
  },
  registrar_eleccion: {
    to: "SLOT_SELECTED",
    from: ["AWAITING_CUSTOMER_SELECTION", "OPTIONS_SENT_TO_CUSTOMER"],
    actors: ["coordinacion"],
    label: "Registrar elección del cliente",
    needs: "choice",
  },
  pedir_confirmacion: {
    to: "PENDING_EXTERNAL_CONFIRMATION",
    from: ["SLOT_SELECTED"],
    actors: ["coordinacion"],
    label: "Pedir confirmación al especialista",
  },
  confirmar_externa: {
    to: "APPOINTMENT_CONFIRMED",
    from: ["PENDING_EXTERNAL_CONFIRMATION"],
    actors: ["coordinacion"],
    label: "Registrar confirmación del especialista",
    needs: "evidence",
  },
  reprogramar: {
    to: "RESCHEDULE_REQUESTED",
    from: ["APPOINTMENT_CONFIRMED", "APPOINTMENT_PENDING"],
    actors: ["coordinacion", "cliente"],
    label: "Solicitar reprogramación",
    needs: "reason",
  },
  reofrecer: {
    to: "AVAILABILITY_REQUESTED",
    from: ["RESCHEDULE_REQUESTED"],
    actors: ["coordinacion"],
    label: "Volver a pedir disponibilidad",
  },
  asistencia: {
    to: "ATTENDANCE_RECORDED",
    from: ["APPOINTMENT_CONFIRMED", "APPOINTMENT_PENDING"],
    actors: ["coordinacion", "especialista"],
    label: "Registrar asistencia",
    needs: "evidence",
  },
  esperar_informe: {
    to: "REPORT_PENDING",
    from: ["ATTENDANCE_RECORDED"],
    actors: ["coordinacion"],
    label: "Esperar informe",
  },
  informe_recibido: {
    to: "REPORT_RECEIVED",
    from: ["REPORT_PENDING", "ATTENDANCE_RECORDED"],
    actors: ["coordinacion", "especialista"],
    label: "Informe recibido",
  },
  a_revision: {
    to: "PROFESSIONAL_REVIEW_PENDING",
    from: ["REPORT_RECEIVED"],
    actors: ["coordinacion", "clinico"],
    label: "Enviar a revisión profesional",
  },
  revisar: {
    to: "FOLLOW_UP_SCHEDULED",
    from: ["PROFESSIONAL_REVIEW_PENDING"],
    actors: ["clinico"],
    label: "Revisión hecha · programar seguimiento",
    needs: "evidence",
  },
  cerrar: {
    to: "REFERRAL_CLOSED",
    from: ["FOLLOW_UP_SCHEDULED"],
    actors: ["clinico", "coordinacion"],
    label: "Cerrar remisión",
  },
  cancelar: {
    to: "CANCELLED",
    from: [
      "PROPOSED",
      "PENDING_CLINICAL_APPROVAL",
      "APPROVED",
      "PENDING_COORDINATION",
      "SPECIALIST_CONTACT_PENDING",
      "AVAILABILITY_REQUESTED",
      "AVAILABILITY_RECEIVED",
      "OPTIONS_PREPARED",
      "AWAITING_CUSTOMER_SELECTION",
      "SLOT_SELECTED",
      "PENDING_EXTERNAL_CONFIRMATION",
      "APPOINTMENT_CONFIRMED",
      "RESCHEDULE_REQUESTED",
    ],
    actors: ["coordinacion", "clinico"],
    label: "Cancelar",
    needs: "reason",
  },
};
export interface Offer {
  id: string;
  date: string;
  time: string;
  location: string;
  fee?: number;
  expiresAt: string;
  subjectToConfirmation: boolean;
}
export interface RefCase {
  state: RefState;
  version: number;
  offers: Offer[];
  choice?: string | null;
  history: { at: string; from: RefState; to: RefState; by: string; note?: string }[];
}
export function refActions(s: RefState, a: RefActor) {
  return Object.entries(REF_TRANSITIONS)
    .filter(([, t]) => t.from.includes(s) && t.actors.includes(a))
    .map(([k]) => k);
}
export function applyRef(
  c: RefCase,
  action: string,
  actor: RefActor,
  by: string,
  input: {
    evidence?: string;
    reason?: string;
    choice?: string | null;
    expectedVersion: number;
    now: Date;
  },
): RefCase | string {
  const t = REF_TRANSITIONS[action];
  if (!t) return "Acción desconocida";
  if (c.version !== input.expectedVersion) return "La remisión cambió; recarga antes de continuar";
  if (!t.from.includes(c.state)) return `No se puede «${t.label}» desde ${REF_LABEL[c.state]}`;
  if (!t.actors.includes(actor))
    return action === "aprobar" || action === "revisar"
      ? "Solo un profesional clínico autorizado puede hacerlo"
      : "No tienes permiso para esta acción";
  if (t.needs === "evidence" && !input.evidence?.trim())
    return "Registra la evidencia (referencia, quién confirmó o nota de revisión)";
  if (t.needs === "reason" && !input.reason?.trim()) return "Indica el motivo";
  if (t.needs === "offers" && !validOffers(c.offers, input.now).length)
    return "Agrega al menos un horario vigente";
  if (
    t.needs === "choice" &&
    !(input.choice && validOffers(c.offers, input.now).some((o) => o.id === input.choice))
  )
    return "La opción elegida no existe o ya venció";
  const note = input.evidence ?? input.reason;
  return {
    ...c,
    state: t.to,
    version: c.version + 1,
    choice: t.needs === "choice" ? (input.choice ?? null) : (c.choice ?? null),
    history: [
      ...c.history,
      { at: input.now.toISOString(), from: c.state, to: t.to, by, ...(note ? { note } : {}) },
    ],
  };
}
// §16 offers
export const validOffers = (o: Offer[], now: Date) =>
  o.filter((x) => new Date(x.expiresAt) > now && colombiaInstant(x.date, x.time) > now);
export function buildOffer(
  o: Omit<Offer, "id">,
  now: Date,
  specialistActive: boolean,
): Offer | string {
  if (!specialistActive) return "El especialista no está activo";
  if (!o.date || !o.time) return "Indica fecha y hora";
  const at = colombiaInstant(o.date, o.time);
  if (isNaN(+at) || at <= now) return "El horario ya pasó";
  if (!Number.isFinite(Date.parse(o.expiresAt))) return "Indica una vigencia válida para la oferta";
  if (!o.location.trim()) return "Indica el lugar del horario";
  if (o.fee !== undefined && (!Number.isFinite(o.fee) || o.fee < 0))
    return "La tarifa informada no puede ser negativa";
  if (new Date(o.expiresAt) <= now) return "La oferta ya venció";
  if (new Date(o.expiresAt) > at) return "La oferta debe vencer antes del horario";
  return { ...o, id: `${o.date}T${o.time}` };
}
export const offerText = (o: Offer) =>
  `${colombiaInstant(o.date, o.time).toLocaleString("es-CO", { timeZone: "America/Bogota", weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" })} · ${o.location}${o.subjectToConfirmation ? " · Sujeto a confirmación del especialista" : ""}`;
// §30 stalled
export const STALL_HOURS: Partial<Record<RefState, number>> = {
  SPECIALIST_CONTACT_PENDING: 24,
  AVAILABILITY_REQUESTED: 48,
  AWAITING_CUSTOMER_SELECTION: 48,
  SLOT_SELECTED: 24,
  PENDING_EXTERNAL_CONFIRMATION: 48,
  REPORT_PENDING: 120,
  PROFESSIONAL_REVIEW_PENDING: 48,
  PENDING_CLINICAL_APPROVAL: 24,
};
export function stalled(
  state: RefState,
  since: Date,
  now: Date,
): { stalled: boolean; hours: number; reason: string } {
  const h = Math.floor((+now - +since) / 36e5);
  const lim = STALL_HOURS[state];
  return {
    stalled: lim !== undefined && h >= lim,
    hours: h,
    reason: lim === undefined ? "" : `${REF_LABEL[state]} hace ${h} h (límite ${lim} h)`,
  };
}
