/** Rule-based priority for new requests and referrals (AI analysis comes later). */
export type Priority = "alta" | "media" | "baja";
export interface Triage { priority: Priority; reason: string }

const URGENT = ["sangr", "convuls", "no respira", "envenen", "atropell", "urgencia", "urgente", "dolor fuerte", "vómito con sangre", "no come hace", "fractura", "desmay"];
const MEDIUM = ["vómito", "vomit", "diarrea", "cojea", "fiebre", "herida", "no come", "no quiere comer", "sin comer", "no ha comido", "decaído", "tos"]
const SCHEDULE = ["reprogram", "cancel", "cambiar la cita", "mover la cita"];;
const HIGH_SPECIALTIES = ["cardio", "neuro", "oncolog", "cirug"];

export function triageRequest(message: string, channel = ""): Triage {
  const m = message.toLowerCase();
  const u = URGENT.find((k) => m.includes(k));
  if (u) return { priority: "alta", reason: `Posible urgencia: menciona “${u}”` };
  const md = MEDIUM.find((k) => m.includes(k));
  if (md) return { priority: "media", reason: `Síntoma o cambio a revisar: “${md}”` };
  const sc = SCHEDULE.find((k) => m.includes(k));
  if (sc) return { priority: "media", reason: "Cambio de agenda solicitado: revisar disponibilidad" };
  return { priority: "baja", reason: channel ? `Consulta de rutina por ${channel}` : "Consulta de rutina" };
}

export function triageReferral(specialty: string, hasSpecialist: boolean): Triage {
  const s = specialty.toLowerCase();
  const h = HIGH_SPECIALTIES.find((k) => s.includes(k));
  if (h && !hasSpecialist) return { priority: "alta", reason: `${specialty} sin especialista asignado` };
  if (!hasSpecialist) return { priority: "media", reason: "Remisión sin especialista asignado" };
  return { priority: "baja", reason: "Especialista ya asignado; seguimiento" };
}
