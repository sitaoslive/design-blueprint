import { checkTransition } from "./visitState";
import { useCallback, useRef, useSyncExternalStore } from "react";
import * as seed from "./data";
import type { Visit, VisitStep, StaffStatus } from "./data";
import type { AbsencePlan } from "./rules";
import { db, loadAll, write } from "./db";
import { operationalDay } from "@/features/field-operations/domain/advanced";

export interface AuditEntry { id: string; at: string; action: string; }
export interface ChatMsg { id: string; from: "user" | "ai"; text: string; proposal?: { title: string; effects: string; approvalId?: string; status: "propuesta" | "aprobada" | "rechazada" } }

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function initial() {
  return {
    loaded: false, roles: [] as string[], userId: null as string | null, displayName: "",
    pets: clone(seed.pets).map((p) => ({ ...p, ownerId: null as string | null })), specialists: clone(seed.specialists),
    integrations: [] as { id: string; name: string; purpose: string; status: string; note: string }[],
    visits: clone(seed.visits) as (Visit & { operationalOn?: string | null })[], staff: clone(seed.staff), requests: clone(seed.requests),
    participants: [] as { id: string; visitId: string; staffId: string; active: boolean; supportState: string; version: number; prepChecked: string[] }[],
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
/** Demo mode: local sample data only, nothing is written to the backend (loaded stays false). */
export function startDemo(role: string, name: string) {
  const base = initial();
  const demoId = "demo-" + role;
  state = { ...base, roles: [role], userId: demoId, displayName: name,
    visits: base.visits.map((v) => ({ ...v, operationalOn: operationalDay() })),
    participants: role === "auxiliar" ? [{ id: "demo-support-v1", visitId: "v1", staffId: "camila", active: true, supportState: "ASSIGNED", version: 1, prepChecked: [] }] : [],
    staff: base.staff.map((m) => (role === "auxiliar" && m.id === "camila") || (role === "veterinario" && m.id === "valeria") ? { ...m, userId: demoId } : m),
    pets: base.pets.map((p) => (role === "cliente" ? { ...p, ownerId: demoId } : p)) };
  listeners.forEach((l) => l());
}
export function clearVF() { state = initial(); listeners.forEach((l) => l()); }
const live = () => state.loaded;
const up = (table: string, id: string, patch: Record<string, unknown>) => { if (live()) void write(db.from(table).update(patch).eq("id", id)); };
const ins = (table: string, row: Record<string, unknown>) => { if (live()) void write(db.from(table).insert(row)); };

const uid = () => Math.random().toString(36).slice(2, 8);
const pendingWrites = new Set<string>();
async function confirmedUpdate(table: string, id: string, patch: Record<string, unknown>, expected: Record<string, unknown>): Promise<boolean> {
  const owner = state.userId;
  const key = `${owner}:${table}:${id}`;
  if (pendingWrites.has(key)) return false;
  pendingWrites.add(key);
  try {
    if (!navigator.onLine) throw new Error("Requiere conexión para guardar este cambio");
    let query = db.from(table).update(patch).eq("id", id);
    for (const [field, value] of Object.entries(expected)) query = value === null || value === undefined ? query.is(field, null) : query.eq(field, value);
    const { data, error } = await query.select("id");
    if (owner !== state.userId) return false;
    if (error || !data?.length) throw new Error(error?.message ?? "El registro cambió o ya no tienes acceso. Recarga antes de continuar.");
    return true;
  } catch (error) {
    if (owner === state.userId) { const { toast } = await import("sonner"); toast.error(error instanceof Error ? error.message : "No se pudo guardar"); }
    return false;
  } finally { pendingWrites.delete(key); }
}

export const actions = {
  setVisitStatus: (id: string, status: Visit["status"], okvetRef?: string) => {
    const cur = getVF().visits.find((v) => v.id === id);
    const ref = okvetRef ?? cur?.okvetRef ?? null;
    const err = cur ? checkTransition(cur.status, status, ref) : null;
    if (err) { void import("sonner").then(({ toast }) => toast.error(err)); return false; }
    set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, status, okvetRef: ref } : v)) }), `Cita ${id} → ${status}`);
    up("visits", id, okvetRef ? { status, okvet_ref: okvetRef } : { status });
    return true;
  },
  rescheduleVisit: (id: string, date: string, time: string) =>
    (set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, date, time, status: "pendiente" } : v)) }), `Cita ${id} reprogramada a ${date} ${time}`), up("visits", id, { date, time, status: "pendiente" })),
  assignVisit: (id: string, staffId: string) =>
    (set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, staffId, service: v.service === "Reasignación pendiente" ? "Consulta general" : v.service, status: v.status === "confirmada" ? "confirmada" : "pendiente_okvet" } : v)) }), `Cita ${id} asignada a ${staffId}`), up("visits", id, { staff_id: staffId, status: getVF().visits.find((v) => v.id === id)?.status, ...(getVF().visits.find((v) => v.id === id)?.service ? { service: getVF().visits.find((v) => v.id === id)!.service } : {}) })),
  advanceStep: async (id: string, step: VisitStep) => {
    const visit = state.visits.find((v) => v.id === id); if (!visit) return false;
    const status = step === "finalizada" ? "finalizada" as const : step === "programada" ? visit.status : "en_curso" as const;
    if (live() && !await confirmedUpdate("visits", id, { step, status }, { step: visit.step })) return false;
    set((s) => ({ visits: s.visits.map((v) => v.id === id ? { ...v, step, status } : v) }), `Visita ${id}: ${step}`); return true;
  },
  createVisit: (input: Omit<Visit, "id" | "step" | "prep">) => {
    const id = "v" + uid();
    const v = { ...input, status: input.status === "confirmada" && !input.okvetRef?.trim() ? "pendiente_okvet" as const : input.status };
    set((s) => ({ visits: [...s.visits, { ...v, id, step: "programada", prep: [] }] }), `Nueva cita ${id} (${v.status})`);
    ins("visits", { id, pet_id: v.petId, staff_id: v.staffId, service: v.service, date: v.date, time: v.time, status: v.status, zone: v.zone, address: v.address, okvet_ref: v.okvetRef ?? null });
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
  toggleTask: async (id: string) => {
    const task = state.tasks.find((t) => t.id === id); if (!task) return false;
    const done = !task.done;
    if (live() && !await confirmedUpdate("tasks", id, { done }, { done: task.done })) return false;
    set((s) => ({ tasks: s.tasks.map((t) => t.id === id ? { ...t, done } : t) }), `Tarea ${id} actualizada`); return true;
  },
  markPaid: (id: string) => (set((s) => ({ payments: s.payments.map((p) => (p.id === id ? { ...p, status: "pagado" } : p)) }), `Cobro ${id} registrado`), up("payments", id, { status: "pagado" })),
  readNotification: (id: string) => ((set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })), up("notifications", id, { read: true }))),
  moveStock: async (id: string, delta: number) => {
    const item = state.items.find((i) => i.id === id); if (!item) return false;
    const stock = Math.max(0, item.stock + delta);
    if (live() && !await confirmedUpdate("inventory_items", id, { stock }, { stock: item.stock })) return false;
    set((s) => ({ items: s.items.map((i) => i.id === id ? { ...i, stock } : i) }), `Inventario ${id} ${delta > 0 ? "+" : ""}${delta}`); return true;
  },
  progressCourse: async (id: string) => {
    const course = state.courses.find((c) => c.id === id); if (!course) return false;
    const progress = Math.min(100, course.progress + 20);
    if (live() && !await confirmedUpdate("courses", id, { progress }, { progress: course.progress })) return false;
    set((s) => ({ courses: s.courses.map((c) => c.id === id ? { ...c, progress } : c) }), `Formación ${id} avanzada`); return true;
  },
  resolveReferral: async (id: string, specialist: string) => {
    const ref = state.referrals.find(r => r.id === id); if (!ref) return false;
    if (live() && !await confirmedUpdate("referrals", id, { specialist }, { specialist: ref.specialist })) return false;
    set(s => ({ referrals: s.referrals.map(r => r.id === id ? { ...r, specialist } : r) }), `Remisión ${id} asignada; sin confirmar cita`); return true;
  },
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

/** Re-read everything after direct table writes made outside `actions`. */
export async function refreshVF() {
  if (!state.loaded) return;
  const data = await loadAll();
  state = { ...state, ...(data as Partial<VFState>) };
  listeners.forEach((l) => l());
}
