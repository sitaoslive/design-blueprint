import { useCallback, useRef, useSyncExternalStore } from "react";
import * as seed from "./data";
import type { Visit, VisitStep, StaffStatus } from "./data";
import type { AbsencePlan } from "./rules";
import { db, loadAll, write } from "./db";

export interface AuditEntry { id: string; at: string; action: string; }
export interface ChatMsg { id: string; from: "user" | "ai"; text: string; proposal?: { title: string; effects: string; approvalId?: string; status: "propuesta" | "aprobada" | "rechazada" } }

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function initial() {
  return {
    loaded: false, roles: [] as string[], userId: null as string | null, displayName: "",
    pets: clone(seed.pets).map((p) => ({ ...p, ownerId: null as string | null })), specialists: clone(seed.specialists),
    integrations: [] as { id: string; name: string; purpose: string; status: string; note: string }[],
    visits: clone(seed.visits), staff: clone(seed.staff), requests: clone(seed.requests),
    incidents: clone(seed.incidents), approvals: clone(seed.approvals), payments: clone(seed.payments),
    tasks: clone(seed.tasks), items: clone(seed.items), courses: clone(seed.courses),
    referrals: clone(seed.referrals), notifications: clone(seed.notifications), treatments: clone(seed.treatments),
    audit: [] as AuditEntry[],
    absence: null as (AbsencePlan & { active: boolean; id?: string }) | null,
    chat: [
      { id: "m1", from: "user", text: "¿Qué tengo que revisar hoy?" },
      { id: "m2", from: "ai", text: "Tienes 2 citas sin confirmar, 1 solicitud de reemplazo y un cobro alto pendiente." },
    ] as ChatMsg[],
  };
}
export type VFState = ReturnType<typeof initial>;

let state: VFState = initial();
const listeners = new Set<() => void>();
function set(fn: (s: VFState) => Partial<VFState>, action?: string) {
  const patch = fn(state);
  state = { ...state, ...patch };
  if (action) state.audit = [{ id: crypto.randomUUID(), at: new Date().toLocaleTimeString("es-CO"), action }, ...state.audit];
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export function useVF<T>(sel: (s: VFState) => T): T {
  // Cache per state snapshot so selectors returning new arrays don't loop.
  const cache = useRef<{ s: VFState; v: T } | null>(null);
  const selRef = useRef(sel); selRef.current = sel;
  const get = useCallback(() => {
    if (cache.current?.s !== state) cache.current = { s: state, v: selRef.current(state) };
    return cache.current.v;
  }, []);
  return useSyncExternalStore(subscribe, get, get);
}
export const getVF = () => state;
export const resetVF = () => { state = initial(); listeners.forEach((l) => l()); };

/** Load everything the signed-in user may see (RLS decides). */
export async function hydrateVF(userId: string, roles: string[], displayName: string) {
  const data = await loadAll();
  state = { ...state, ...(data as Partial<VFState>), roles, userId, displayName, loaded: true };
  listeners.forEach((l) => l());
}
export function clearVF() { state = initial(); listeners.forEach((l) => l()); }
const live = () => state.loaded;
const up = (table: string, id: string, patch: Record<string, unknown>) => { if (live()) void write(db.from(table).update(patch).eq("id", id)); };
const ins = (table: string, row: Record<string, unknown>) => { if (live()) void write(db.from(table).insert(row)); };

const uid = () => Math.random().toString(36).slice(2, 8);

export const actions = {
  setVisitStatus: (id: string, status: Visit["status"]) =>
    (set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, status } : v)) }), `Cita ${id} → ${status}`), up("visits", id, { status })),
  rescheduleVisit: (id: string, date: string, time: string) =>
    (set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, date, time, status: "pendiente" } : v)) }), `Cita ${id} reprogramada a ${date} ${time}`), up("visits", id, { date, time, status: "pendiente" })),
  assignVisit: (id: string, staffId: string) =>
    (set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, staffId, service: v.service === "Reasignación pendiente" ? "Consulta general" : v.service, status: "confirmada" } : v)) }), `Cita ${id} asignada a ${staffId}`), up("visits", id, { staff_id: staffId, status: "confirmada", ...(getVF().visits.find((v) => v.id === id)?.service ? { service: getVF().visits.find((v) => v.id === id)!.service } : {}) })),
  advanceStep: (id: string, step: VisitStep) =>
    (set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, step, status: step === "finalizada" ? "finalizada" : step === "programada" ? v.status : "en_curso" } : v)) }), `Visita ${id}: ${step}`), up("visits", id, { step, status: getVF().visits.find((v) => v.id === id)?.status })),
  createVisit: (v: Omit<Visit, "id" | "step" | "prep">) => {
    const id = "v" + uid();
    set((s) => ({ visits: [...s.visits, { ...v, id, step: "programada", prep: [] }] }), `Nueva cita ${id} (${v.status})`);
    ins("visits", { id, pet_id: v.petId, staff_id: v.staffId, service: v.service, date: v.date, time: v.time, status: v.status, zone: v.zone, address: v.address });
    return id;
  },
  setRequestStatus: (id: string, status: VFState["requests"][number]["status"]) =>
    (set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) }), `Solicitud ${id} → ${status}`), up("service_requests", id, { status })),
  decideApproval: (id: string, status: "aprobada" | "rechazada") =>
    (set((s) => ({ approvals: s.approvals.map((a) => (a.id === id ? { ...a, status } : a)) }), `Aprobación ${id} ${status}`), up("approvals", id, { status, decided_by: state.userId, decided_at: new Date().toISOString() })),
  setStaffStatus: (id: string, status: StaffStatus) =>
    (set((s) => ({ staff: s.staff.map((m) => (m.id === id ? { ...m, status } : m)) }), `Equipo ${id} → ${status}`), up("staff_members", id, { status })),
  addIncident: (title: string, detail: string) => {
    const id = "i" + uid();
    set((s) => ({ incidents: [{ id, title, detail, severity: "media", status: "abierta", owner: "Coordinación" }, ...s.incidents] }), `Incidencia: ${title}`);
    ins("incidents", { id, title, detail });
  },
  setIncidentStatus: (id: string, status: "abierta" | "en_gestion" | "cerrada") =>
    (set((s) => ({ incidents: s.incidents.map((i) => (i.id === id ? { ...i, status } : i)) }), `Incidencia ${id} → ${status}`), up("incidents", id, { status })),
  toggleTask: (id: string) => (set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }), `Tarea ${id} actualizada`), up("tasks", id, { done: getVF().tasks.find((t) => t.id === id)?.done })),
  markPaid: (id: string) => (set((s) => ({ payments: s.payments.map((p) => (p.id === id ? { ...p, status: "pagado" } : p)) }), `Cobro ${id} registrado`), up("payments", id, { status: "pagado" })),
  readNotification: (id: string) => ((set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })), up("notifications", id, { read: true }))),
  moveStock: (id: string, delta: number) => (set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i)) }), `Inventario ${id} ${delta > 0 ? "+" : ""}${delta}`), up("inventory_items", id, { stock: getVF().items.find((i) => i.id === id)?.stock })),
  progressCourse: (id: string) => (set((s) => ({ courses: s.courses.map((c) => (c.id === id ? { ...c, progress: Math.min(100, c.progress + 20) } : c)) }), `Formación ${id} avanzada`), up("courses", id, { progress: getVF().courses.find((c) => c.id === id)?.progress })),
  resolveReferral: (id: string, specialist: string) => (set((s) => ({ referrals: s.referrals.map((r) => (r.id === id ? { ...r, status: "agendada", specialist } : r)) }), `Remisión ${id} asignada`), up("referrals", id, { status: "agendada", specialist })),
  setAbsence: (plan: AbsencePlan & { active: boolean } | null) => {
    const prev = state.absence;
    set(() => ({ absence: plan }), plan?.active ? "Modo ausencia activado" : "Modo ausencia desactivado");
    if (plan) ins("absence_plans", { coordinator: plan.coordinator, replacements: plan.replacements, limits: plan.limits, date_from: plan.from, date_to: plan.to, created_by: state.userId });
    else if (prev?.id) up("absence_plans", prev.id, { active: false });
  },
  addPet: (p: { name: string; species: "Perro" | "Gato"; breed: string; age: string; allergies: string }) => {
    const id = "pet" + uid();
    set((s) => ({ pets: [...s.pets, { ...p, id, photo: p.species === "Gato" ? seed.IMG.cat : seed.IMG.dog, owner: s.displayName, ownerId: s.userId }] }), `Mascota ${p.name} registrada`);
    ins("pets", { id, ...p, photo: p.species === "Gato" ? "cat" : "dog", owner_id: state.userId, owner_name: state.displayName });
    return id;
  },
  updatePet: (id: string, patch: { name?: string; breed?: string; age?: string; allergies?: string }) =>
    (set((s) => ({ pets: s.pets.map((p) => (p.id === id ? { ...p, ...patch } : p)) }), `Mascota ${id} actualizada`), up("pets", id, patch)),
  togglePrep: (id: string, item: string) => {
    const v = getVF().visits.find((x) => x.id === id); if (!v) return;
    const prep = v.prep.includes(item) ? v.prep.filter((x) => x !== item) : [...v.prep, item];
    set((s) => ({ visits: s.visits.map((x) => (x.id === id ? { ...x, prep } : x)) })); up("visits", id, { prep });
  },
  createRequest: (r: { client: string; phone: string; pet: string; channel: "WhatsApp" | "Llamada" | "Portal"; message: string }) => {
    const id = "r" + uid();
    set((s) => ({ requests: [{ ...r, id, status: "nueva", at: new Date().toTimeString().slice(0, 5) }, ...s.requests] }), `Solicitud de ${r.client}`);
    ins("service_requests", { id, ...r, created_by: state.userId });
  },
  setIntegration: (id: string, status: string) => {
    set((s) => ({ integrations: s.integrations.map((i) => (i.id === id ? { ...i, status } : i)) }), `Integración ${id} → ${status}`);
    up("integrations", id, { status });
  },
  pushChat: (m: ChatMsg) => { set((s) => ({ chat: [...s.chat, m] })); ins("assistant_messages", { id: m.id, sender: m.from, text: m.text, proposal: m.proposal ?? null }); },
  setProposal: (msgId: string, status: "aprobada" | "rechazada") =>
    (set((s) => ({ chat: s.chat.map((m) => (m.id === msgId && m.proposal ? { ...m, proposal: { ...m.proposal, status } } : m)) }), `Propuesta del asistente ${status}`), up("assistant_messages", msgId, { proposal: { ...getVF().chat.find((m) => m.id === msgId)?.proposal, status } })),
};

export const usePets = () => useVF((s) => s.pets);
