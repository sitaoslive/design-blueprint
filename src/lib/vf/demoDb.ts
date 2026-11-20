import * as seed from "./data";

/** Read-only fake of the data client for /demo: sample rows, every write is a no-op. */
const now = new Date().toISOString();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const snake = (o: any): Record<string, unknown> => Object.fromEntries(Object.entries(o).flatMap(([k, v]) => { const s = k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase()); return s === k ? [[k, v]] : [[k, v], [s, v]]; }));
const FLAGS: [string, string, boolean, boolean][] = [["client_portal_enabled", "Portal de clientes", true, false], ["quick_booking_enabled", "Cita rápida", true, false], ["schedule_simulator_enabled", "Simulador de agenda", true, false], ["specialist_portal_enabled", "Portal de especialistas", true, false], ["whatsapp_ai_enabled", "IA por WhatsApp", false, true], ["calendar_sync_enabled", "Sincronización de calendario", false, true], ["route_optimization_enabled", "Optimización de rutas", false, true], ["online_payments_enabled", "Pagos en línea", false, true], ["ai_assistant_actions_enabled", "Acciones del asistente IA", false, true], ["external_notifications_enabled", "Notificaciones externas", false, true], ["n8n_dispatch_enabled", "Envío de eventos a n8n", false, true]];
const USERS = [["Andrea Gómez", "cliente"], ["Dr. Luis Eduardo Ríos", "luis"], ["Dra. Valeria Torres", "veterinario"], ["Camila Rincón", "auxiliar"], ["Laura Peña", "coordinador"]];

const TABLES: Record<string, () => Record<string, unknown>[]> = {
  pets: () => seed.pets.map(snake), staff_members: () => seed.staff.map(snake), visits: () => seed.visits.map(snake),
  service_requests: () => seed.requests.map(snake), incidents: () => seed.incidents.map(snake), approvals: () => seed.approvals.map(snake),
  payments: () => seed.payments.map(snake), tasks: () => seed.tasks.map(snake), inventory_items: () => seed.items.map(snake),
  courses: () => seed.courses.map(snake), referrals: () => seed.referrals.map(snake), specialists: () => seed.specialists.map((s) => snake(s as Record<string, unknown>)),
  treatments: () => seed.treatments.map(snake), notifications: () => seed.notifications.map(snake),
  feature_flags: () => FLAGS.map(([key, label, enabled, requires_integration]) => ({ key, label, enabled, requires_integration })),
  event_outbox: () => [["appointment.confirmed", "v1"], ["pet.created", "luna"], ["task.created", "t1"], ["caregiver.authorized", "luna"]].map(([t, e], i) => ({ event_id: "d" + i, event_type: t, entity_id: e, occurred_at: now, attempt_count: 0, status: "pendiente" })),
  customer_memory: () => [{ id: "m1", client_id: "demo-cliente", kind: "preferencia", content: "Prefiere visitas en la mañana", source: "cliente", validation: "validada", sensitivity: "normal", created_at: now }, { id: "m2", client_id: "demo-cliente", kind: "acceso_hogar", content: "Timbre dañado: llamar al llegar", source: "equipo", validation: "sin_validar", sensitivity: "normal", created_at: now }],
  profiles: () => USERS.map(([n], i) => ({ id: "u" + i, display_name: n, created_at: now })),
  user_roles: () => USERS.map(([, r], i) => ({ id: "r" + i, user_id: "u" + i, role: r })),
  conversations: () => [
    { id: "c1", contact_name: "Andrea Gómez", contact_phone: "573005551201", owner_id: null, verified: false, pet_id: "luna", status: "AI_ACTIVE", control_mode: "ai", priority: "normal", sensitive: false, synthetic: true, last_message_at: now, last_inbound_at: now, version: 1 },
    { id: "c2", contact_name: "Carlos Pérez", contact_phone: "573105558844", owner_id: null, verified: false, pet_id: null, status: "PENDING_CLINICAL_ESCALATION", control_mode: "human", priority: "alta", sensitive: false, synthetic: true, last_message_at: now, last_inbound_at: now, version: 1 }],
  conversation_messages: () => [
    { id: "dm1", conversation_id: "c1", direction: "in", sender: "cliente", body: "Hola, quiero una cita para Luna mañana y también saber cuánto cuesta", intents: ["NEW_APPOINTMENT", "PRICE_INQUIRY"], created_at: now },
    { id: "dm2", conversation_id: "c1", direction: "out", sender: "ia", body: "Con gusto registro la solicitud de cita para Luna. Nuestro equipo confirmará el horario cuando esté validado.", intents: [], created_at: now },
    { id: "dm3", conversation_id: "c2", direction: "in", sender: "cliente", body: "Mi perro no quiere comer desde ayer", intents: ["CLINICAL_QUESTION"], created_at: now },
    { id: "dm4", conversation_id: "c2", direction: "out", sender: "sistema", body: "Consulta clínica detectada: transferida a coordinación.", intents: [], created_at: now }],
  outbound_messages: () => [],
  knowledge_articles: () => [{ id: "k1", title: "Zonas de cobertura", category: "zonas", content: "Atendemos en Bogotá: Zona Norte, Centro y Sur.", status: "aprobado", version: 1 }, { id: "k2", title: "Tarifas", category: "tarifas", content: "Pendiente de aprobación de Dirección.", status: "borrador", version: 1 }],
  message_templates: () => [["bienvenida", "Bienvenida"], ["solicitud_recibida", "Solicitud recibida"], ["recordatorio_cita", "Recordatorio de cita"]].map(([name, label], i) => ({ id: "t" + i, name, label, category: "UTILITY", body: "Hola {{1}}…", status: "DRAFT" })),
  integrations: () => [["okvet", "OKVET", "Historia clínica oficial", "PREPARADA"], ["whatsapp", "WhatsApp Business", "Mensajes a clientes", "NO CONFIGURADA"], ["n8n", "n8n", "Automatizaciones", "PREPARADA"]].map(([id, name, purpose, status]) => ({ id, name, purpose, status, note: "Demo" })),
};

function query(table: string) {
  const filters: [string, unknown][] = []; let single = false;
  const rows = () => { const all = TABLES[table]?.() ?? []; return all.filter((r) => filters.every(([c, v]) => !(c in r) || r[c] === v)); };
  const result = () => { const r = rows(); return { data: single ? r[0] ?? null : r, error: null, count: r.length }; };
  const q: Record<string, unknown> = {};
  const self = new Proxy(q, {
    get(_t, prop) {
      if (prop === "then") return (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(result()).then(res, rej);
      if (prop === "eq") return (c: string, v: unknown) => (filters.push([c, v]), self);
      if (prop === "maybeSingle" || prop === "single") return () => ((single = true), self);
      if (["insert", "update", "upsert", "delete"].includes(String(prop))) return () => ((filters.push(["__none", 1]), self));
      return () => self;
    },
  });
  return self;
}
export const demoDb = { from: (t: string) => query(t), rpc: () => Promise.resolve({ data: null, error: null }) };
export const isDemo = () => typeof sessionStorage !== "undefined" && !!sessionStorage.getItem("vf_demo");
