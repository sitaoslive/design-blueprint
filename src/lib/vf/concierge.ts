/** Vet Life Concierge rules (WA-01..WA-20). Pure and deterministic: AI may later suggest, these rules decide. */
export type Intent = "GREETING" | "GENERAL_INFORMATION" | "SERVICE_INQUIRY" | "PRICE_INQUIRY" | "COVERAGE_INQUIRY" | "NEW_APPOINTMENT" | "APPOINTMENT_STATUS" | "RESCHEDULE_REQUEST" | "CANCEL_REQUEST" | "PAYMENT_INQUIRY" | "DOCUMENT_REQUEST" | "PET_INFORMATION_UPDATE" | "COMPLAINT" | "HUMAN_REQUEST" | "FOLLOW_UP" | "SPECIALIST_REFERRAL" | "CLINICAL_QUESTION" | "POSSIBLE_EMERGENCY" | "GRIEF_OR_SENSITIVE_SITUATION" | "OTHER";
export type ConvStatus = "NEW" | "IDENTIFICATION_REQUIRED" | "AI_ACTIVE" | "WAITING_CUSTOMER" | "WAITING_TEAM" | "HUMAN_ACTIVE" | "PENDING_COORDINATION" | "PENDING_CLINICAL_ESCALATION" | "FOLLOW_UP_SCHEDULED" | "RESOLVED" | "CLOSED" | "ERROR";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const RULES: [Intent, RegExp][] = [
  ["POSSIBLE_EMERGENCY", /(convulsion|no respira|respira mal|sangr|envenen|veneno|atropell|desmay|inconscien|no se mueve|vomita sangre|golpe fuerte|ahog)/],
  ["GRIEF_OR_SENSITIVE_SITUATION", /(fallecio|murio|se nos fue|eutanasia|perdimos a)/],
  ["CLINICAL_QUESTION", /(dosis|medicamento|pastilla|vomit|diarrea|no quiere comer|no come|cojea|fiebre|herida|tos|picazon|diagnost|que le doy|esta enferm)/],
  ["HUMAN_REQUEST", /(hablar con (alguien|una persona|un humano|el doctor|luis)|asesor|persona real|humano)/],
  ["COMPLAINT", /(queja|reclamo|pesimo|mal servicio|nunca llegaron|molest|inaceptable|no me han respondido)/],
  ["CANCEL_REQUEST", /(cancelar|anular)/],
  ["RESCHEDULE_REQUEST", /(reprogramar|cambiar (la )?(cita|hora|fecha)|mover la cita|otro dia)/],
  ["NEW_APPOINTMENT", /(cita|agendar|reservar|turno|visita|vacunar|vacuna|control)/],
  ["PRICE_INQUIRY", /(cuanto cuesta|precio|valor|tarifa|cuanto vale|cuanto cobran)/],
  ["COVERAGE_INQUIRY", /(cobertura|llegan a|van a|atienden en|zona|barrio)/],
  ["PAYMENT_INQUIRY", /(pago|pagar|transferencia|factura|comprobante)/],
  ["DOCUMENT_REQUEST", /(certificado|carnet|historia clinica|documento|resultado)/],
  ["SPECIALIST_REFERRAL", /(especialista|remision|cardiolog|dermatolog)/],
  ["SERVICE_INQUIRY", /(servicios|que hacen|ofrecen)/],
  ["GREETING", /^(hola|buen(os|as)|saludos|que tal)\b/],
];
export interface Classification { intents: Intent[]; requiresHuman: boolean; safety: "none" | "clinical" | "emergency"; pet?: string; }

export function classify(text: string, petNames: string[] = []): Classification {
  const t = norm(text);
  let intents = RULES.filter(([, re]) => re.test(t)).map(([i]) => i);
  if (intents.includes("RESCHEDULE_REQUEST") || intents.includes("CANCEL_REQUEST")) intents = intents.filter((i) => i !== "NEW_APPOINTMENT");
  if (!intents.length) intents = ["OTHER"];
  const safety = intents.includes("POSSIBLE_EMERGENCY") ? "emergency" : intents.includes("CLINICAL_QUESTION") ? "clinical" : "none";
  const requiresHuman = safety !== "none" || intents.some((i) => ["HUMAN_REQUEST", "COMPLAINT", "GRIEF_OR_SENSITIVE_SITUATION", "OTHER"].includes(i));
  const matches = petNames.filter((p) => new RegExp(`\\b${norm(p)}\\b`).test(t));
  return { intents, requiresHuman, safety, ...(matches.length === 1 ? { pet: matches[0]! } : {}) };
}

export interface Article { title: string; category: string; content: string; status: string; valid_until?: string | null; }
/** Only approved, current articles may be used. */
export function approvedFor(articles: Article[], category: string, today = new Date()): Article | null {
  return articles.find((a) => a.category === category && a.status === "aprobado" && (!a.valid_until || new Date(a.valid_until) >= today)) ?? null;
}

export const NO_INFO = "No tengo esa información confirmada. Voy a pasarte con nuestro equipo.";
export const EMERGENCY_REPLY = "Lo que describes puede ser una urgencia. Si tu mascota está en peligro, llévala ya a la clínica veterinaria de urgencias más cercana. Ya avisé a nuestro equipo para que te contacte.";
export const CLINICAL_REPLY = "Esa consulta la debe revisar un veterinario. Ya le pasé tu mensaje a nuestro equipo y te contactarán pronto.";

/** Proposed assistant reply. Never confirms appointments, never gives clinical advice. */
export function proposeReply(c: Classification, articles: Article[], opts: { outOfHours?: boolean; known?: boolean } = {}): { text: string; handoff: boolean } {
  if (c.safety === "emergency") return { text: EMERGENCY_REPLY, handoff: true };
  if (c.safety === "clinical") return { text: CLINICAL_REPLY, handoff: true };
  if (c.intents.includes("GRIEF_OR_SENSITIVE_SITUATION")) return { text: "Lamentamos mucho lo que estás viviendo. Una persona de nuestro equipo te escribirá.", handoff: true };
  if (c.intents.includes("HUMAN_REQUEST") || c.intents.includes("COMPLAINT")) return { text: "Claro, ya te paso con una persona de nuestro equipo.", handoff: true };
  const parts: string[] = []; let handoff = false;
  if (c.intents.includes("GREETING") && c.intents.length === 1) parts.push(opts.known ? "¡Hola de nuevo! Soy la asistente virtual de Vet Life 🐾 ¿En qué podemos ayudarte?" : "¡Hola! Bienvenido a Vet Life 🐾 Soy la asistente virtual. ¿En qué podemos ayudarte con tu mascota?");
  if (c.intents.includes("NEW_APPOINTMENT")) parts.push(`Con gusto registro la solicitud de cita${c.pet ? ` para ${c.pet}` : ""}. ${c.pet ? "" : "¿Para cuál de tus mascotas es? "}Nuestro equipo confirmará el horario cuando esté validado.`);
  if (c.intents.includes("RESCHEDULE_REQUEST")) parts.push("Registro tu solicitud de cambio. Tu cita actual se mantiene hasta que el equipo confirme el nuevo horario.");
  if (c.intents.includes("CANCEL_REQUEST")) parts.push("Registro tu solicitud de cancelación; el equipo la confirmará contigo.");
  for (const [intent, cat] of [["PRICE_INQUIRY", "tarifas"], ["COVERAGE_INQUIRY", "zonas"], ["SERVICE_INQUIRY", "servicios"], ["PAYMENT_INQUIRY", "pagos"]] as const) {
    if (!c.intents.includes(intent)) continue;
    const a = approvedFor(articles, cat); if (a) parts.push(a.content); else { parts.push(NO_INFO); handoff = true; }
  }
  if (!parts.length) return { text: NO_INFO, handoff: true };
  if (opts.outOfHours) parts.push("Estamos fuera de horario; el equipo te responderá en el próximo turno.");
  return { text: parts.join(" "), handoff };
}

export const CONV_TRANSITIONS: Record<ConvStatus, ConvStatus[]> = {
  NEW: ["IDENTIFICATION_REQUIRED", "AI_ACTIVE", "HUMAN_ACTIVE", "WAITING_TEAM", "PENDING_CLINICAL_ESCALATION", "CLOSED"],
  IDENTIFICATION_REQUIRED: ["AI_ACTIVE", "HUMAN_ACTIVE", "WAITING_CUSTOMER", "WAITING_TEAM", "CLOSED"],
  AI_ACTIVE: ["WAITING_CUSTOMER", "WAITING_TEAM", "HUMAN_ACTIVE", "PENDING_COORDINATION", "PENDING_CLINICAL_ESCALATION", "RESOLVED", "ERROR"],
  WAITING_CUSTOMER: ["AI_ACTIVE", "HUMAN_ACTIVE", "WAITING_TEAM", "RESOLVED", "CLOSED"],
  WAITING_TEAM: ["HUMAN_ACTIVE", "PENDING_COORDINATION", "PENDING_CLINICAL_ESCALATION", "RESOLVED"],
  HUMAN_ACTIVE: ["WAITING_CUSTOMER", "PENDING_COORDINATION", "PENDING_CLINICAL_ESCALATION", "FOLLOW_UP_SCHEDULED", "AI_ACTIVE", "RESOLVED"],
  PENDING_COORDINATION: ["HUMAN_ACTIVE", "WAITING_CUSTOMER", "FOLLOW_UP_SCHEDULED", "RESOLVED"],
  PENDING_CLINICAL_ESCALATION: ["HUMAN_ACTIVE", "FOLLOW_UP_SCHEDULED", "RESOLVED"],
  FOLLOW_UP_SCHEDULED: ["HUMAN_ACTIVE", "WAITING_CUSTOMER", "RESOLVED"],
  RESOLVED: ["CLOSED", "WAITING_TEAM"],
  CLOSED: ["WAITING_TEAM"],
  ERROR: ["HUMAN_ACTIVE", "WAITING_TEAM"],
};
export const canMove = (a: ConvStatus, b: ConvStatus) => a === b || CONV_TRANSITIONS[a].includes(b);

/** Opening hours like "Lun-Sáb 7:00-19:00" are simplified to Mon-Sat 07-19 America/Bogota. */
export function isOutOfHours(d: Date, open = 7, close = 19): boolean {
  const bog = new Date(d.toLocaleString("en-US", { timeZone: "America/Bogota" }));
  return bog.getDay() === 0 || bog.getHours() < open || bog.getHours() >= close;
}
