import { z } from "zod";
import type { RefState } from "./index";
export const CONNECTION_LABEL = {
  INTERNAL: "Interno",
  AUTHORIZED_CALENDAR: "Calendario autorizado",
  REPORTED_WINDOWS: "Horarios comunicados",
  PER_REQUEST: "Confirmación por solicitud",
  CLINIC_SYSTEM: "Sistema de la clínica",
} as const;
export const CredentialSchema = z.object({
  state: z.enum(["NOT_SUBMITTED", "UNDER_REVIEW", "VERIFIED", "EXPIRED", "REJECTED", "SUSPENDED"]),
  reference: z.string(),
  expiresAt: z.string(),
  reviewedAt: z.string(),
  reviewedBy: z.string(),
});
export const ProfileSchema = z.object({
  mode: z.enum([
    "INTERNAL",
    "AUTHORIZED_CALENDAR",
    "REPORTED_WINDOWS",
    "PER_REQUEST",
    "CLINIC_SYSTEM",
  ]),
  center: z.string(),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  contact: z.string(),
  zones: z.string(),
  channel: z.string(),
  conditions: z.string(),
  credential: CredentialSchema,
});
export type SpecialistProfile = z.infer<typeof ProfileSchema>;
export const emptyProfile = (): SpecialistProfile => ({
  mode: "REPORTED_WINDOWS",
  center: "",
  address: "",
  phone: "",
  email: "",
  contact: "",
  zones: "",
  channel: "",
  conditions: "",
  credential: {
    state: "NOT_SUBMITTED",
    reference: "",
    expiresAt: "",
    reviewedAt: "",
    reviewedBy: "",
  },
});
export function credentialStatus(
  c: SpecialistProfile["credential"],
  now: Date,
): SpecialistProfile["credential"]["state"] {
  if (c.state !== "VERIFIED") return c.state;
  if (!c.reference.trim() || !c.reviewedBy || !Number.isFinite(Date.parse(c.reviewedAt)))
    return "UNDER_REVIEW";
  return Number.isFinite(Date.parse(c.expiresAt)) && Date.parse(c.expiresAt) > +now
    ? "VERIFIED"
    : "EXPIRED";
}
export const CREDENTIAL_LABEL = {
  NOT_SUBMITTED: "Sin documentación",
  UNDER_REVIEW: "En revisión",
  VERIFIED: "Verificado",
  EXPIRED: "Documentación vencida",
  REJECTED: "Rechazado",
  SUSPENDED: "Suspendido",
} as const;
export function connectionPolicy(mode: SpecialistProfile["mode"]) {
  return {
    canShowLiveCalendar: mode === "AUTHORIZED_CALENDAR",
    canHoldLocally: false,
    confirmationRequired: true,
    source:
      mode === "AUTHORIZED_CALENDAR"
        ? "Integración autorizada necesaria"
        : mode === "INTERNAL"
          ? "Agenda interna autorizada"
          : "Comunicación identificable del especialista",
  };
}
export const WindowSchema = z.object({
  specialistId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duration: z.number().int().positive(),
  capacity: z.number().int().nonnegative(),
  expiresAt: z.string(),
  source: z.string().trim().min(1),
  location: z.string().trim().min(1),
  fee: z.number().nonnegative().nullable(),
  timezone: z.literal("America/Bogota"),
});
export type ReportedWindow = z.infer<typeof WindowSchema>;
export const colombiaInstant = (day: string, time: string) => new Date(`${day}T${time}:00-05:00`);
export const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return (h ?? NaN) * 60 + (m ?? NaN);
};
export function validateWindow(w: ReportedWindow, now: Date): string | null {
  if (!WindowSchema.safeParse(w).success) return "Revisa los campos obligatorios del horario";
  if (
    minutes(w.start) < 0 ||
    minutes(w.end) > 1440 ||
    minutes(w.start) >= minutes(w.end) ||
    w.duration > minutes(w.end) - minutes(w.start)
  )
    return "La duración debe caber entre la hora inicial y final";
  const at = colombiaInstant(w.date, w.start);
  const expiry = Date.parse(w.expiresAt);
  if (
    !Number.isFinite(+at) ||
    new Date(`${w.date}T00:00:00Z`).toISOString().slice(0, 10) !== w.date ||
    at <= now
  )
    return "La fecha del horario no es válida o ya pasó";
  if (!Number.isFinite(expiry) || expiry <= +now || expiry > +at)
    return "La vigencia debe terminar antes del horario y después de ahora";
  return null;
}
export function windowState(w: ReportedWindow, now: Date) {
  if (
    !Number.isFinite(Date.parse(w.expiresAt)) ||
    Date.parse(w.expiresAt) <= +now ||
    +colombiaInstant(w.date, w.start) <= +now
  )
    return "EXPIRED";
  return w.capacity === 0 ? "UNAVAILABLE" : "SPECIALIST_REPORTED_WINDOW";
}
export function compareSpecialists<T extends { id: string; specialty: string; city: string }>(
  specialists: T[],
  profiles: Record<string, SpecialistProfile>,
  windows: ReportedWindow[],
  specialty: string,
  city: string,
  now: Date,
) {
  return specialists
    .filter(
      (s) =>
        (!specialty || s.specialty === specialty) &&
        (!city || s.city.toLowerCase().includes(city.toLowerCase())),
    )
    .map((s) => {
      const p = profiles[s.id] ?? emptyProfile();
      const credential = credentialStatus(p.credential, now);
      return {
        specialist: s,
        profile: p,
        credential,
        windows: windows.filter(
          (w) => w.specialistId === s.id && windowState(w, now) === "SPECIALIST_REPORTED_WINDOW",
        ),
        eligible: credential === "VERIFIED",
        warnings: [
          ...(credential !== "VERIFIED" ? ["Falta verificación profesional vigente"] : []),
          "La disponibilidad informada no garantiza un cupo",
        ],
      };
    })
    .sort(
      (a, b) =>
        Number(b.eligible) - Number(a.eligible) || a.specialist.id.localeCompare(b.specialist.id),
    );
}
export const DraftSchema = z.object({
  petId: z.string().min(1),
  visitId: z.string(),
  specialty: z.string().trim().min(1),
  okvetRef: z.string(),
  modality: z.enum(["Externo", "Interno", "Clínica", "Centro de diagnóstico"]),
  preferredSpecialist: z.string(),
  preferences: z.string(),
  documents: z.string(),
  assignee: z.string().trim().min(1),
  dueAt: z.string().refine((v) => Number.isFinite(Date.parse(v)), "Fecha objetivo inválida"),
  nextAction: z.string().trim().min(1),
});
export type ReferralDraft = z.infer<typeof DraftSchema>;
export const draftKey = (d: ReferralDraft) =>
  `ref-draft:${d.visitId || d.petId}:${d.specialty.trim().toLowerCase()}`;
export const ConfirmationSchema = z.object({
  specialistId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  location: z.string().trim().min(1),
  duration: z.number().int().positive(),
  fee: z.number().nonnegative().nullable(),
  confirmedBy: z.string().trim().min(1),
  channel: z.string().trim().min(1),
  confirmedAt: z.string(),
  reference: z.string().trim().min(1),
  evidence: z.string().trim().min(1),
  instructions: z.string(),
  assignee: z.string().trim().min(1),
  timezone: z.literal("America/Bogota"),
});
export type BookingConfirmation = z.infer<typeof ConfirmationSchema>;
export function validateConfirmation(
  c: BookingConfirmation,
  state: RefState,
  now: Date,
  existing: BookingConfirmation[] = [],
): string | null {
  if (!ConfirmationSchema.safeParse(c).success)
    return "Completa los datos y la evidencia de confirmación";
  if (state !== "PENDING_EXTERNAL_CONFIRMATION")
    return "La remisión aún no está pendiente de confirmación externa";
  const confirmed = Date.parse(c.confirmedAt);
  const appointment = +colombiaInstant(c.date, c.time);
  if (
    !Number.isFinite(confirmed) ||
    confirmed > +now ||
    !Number.isFinite(appointment) ||
    appointment <= +now ||
    confirmed > appointment
  )
    return "Revisa la fecha de confirmación y la fecha de la cita";
  if (
    existing.some(
      (x) => x.specialistId === c.specialistId && x.date === c.date && x.time === c.time,
    )
  )
    return "Ya existe una confirmación para este especialista y horario";
  return null;
}
export function parseConfirmation(note: string | undefined): BookingConfirmation | null {
  if (!note?.startsWith("EXTERNAL_APPOINTMENT:")) return null;
  try {
    const parsed = ConfirmationSchema.safeParse(
      JSON.parse(note.slice("EXTERNAL_APPOINTMENT:".length)),
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
export const confirmationNote = (c: BookingConfirmation) =>
  `EXTERNAL_APPOINTMENT:${JSON.stringify(c)}`;
export function pendingActions(state: RefState) {
  const labels: Partial<Record<RefState, string>> = {
    PROPOSED: "Solicitar aprobación clínica",
    PENDING_CLINICAL_APPROVAL: "Revisar indicación profesional",
    APPROVED: "Asignar coordinación",
    SPECIALIST_CONTACT_PENDING: "Contactar al especialista",
    AVAILABILITY_REQUESTED: "Registrar respuesta del especialista",
    AVAILABILITY_RECEIVED: "Preparar opciones vigentes",
    OPTIONS_PREPARED: "Publicar opciones en el portal",
    AWAITING_CUSTOMER_SELECTION: "Esperar la elección del propietario",
    SLOT_SELECTED: "Solicitar confirmación externa",
    PENDING_EXTERNAL_CONFIRMATION: "Registrar evidencia de confirmación",
    APPOINTMENT_CONFIRMED: "Registrar asistencia con evidencia",
    ATTENDANCE_RECORDED: "Solicitar informe",
    REPORT_PENDING: "Solicitar informe pendiente",
    REPORT_RECEIVED: "Solicitar revisión profesional",
    PROFESSIONAL_REVIEW_PENDING: "Revisión por veterinario",
    FOLLOW_UP_SCHEDULED: "Completar compromisos de continuidad",
    RESCHEDULE_REQUESTED: "Consultar nuevas opciones",
    CANCELLED: "Reevaluar continuidad clínica si corresponde",
  };
  return labels[state] ?? "Consultar historial";
}
export const canCloseReferral = (state: RefState, pending: number) =>
  state === "FOLLOW_UP_SCHEDULED" && pending === 0;
export function sharingEligibility(
  input: {
    consent: boolean;
    approved: boolean;
    expiresAt: string;
    revoked: boolean;
    sameReferral: boolean;
  },
  now: Date,
) {
  return (
    input.sameReferral &&
    input.consent &&
    input.approved &&
    !input.revoked &&
    Number.isFinite(Date.parse(input.expiresAt)) &&
    Date.parse(input.expiresAt) > +now
  );
}
