import { useCallback, useRef, useSyncExternalStore } from "react";
import * as seed from "./data";
import type { Visit, VisitStep, StaffStatus } from "./data";
import type { AbsencePlan } from "./rules";

export interface AuditEntry { id: string; at: string; action: string; }
export interface ChatMsg { id: string; from: "user" | "ai"; text: string; proposal?: { title: string; effects: string; approvalId?: string; status: "propuesta" | "aprobada" | "rechazada" } }

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function initial() {
  return {
    visits: clone(seed.visits), staff: clone(seed.staff), requests: clone(seed.requests),
    incidents: clone(seed.incidents), approvals: clone(seed.approvals), payments: clone(seed.payments),
    tasks: clone(seed.tasks), items: clone(seed.items), courses: clone(seed.courses),
    referrals: clone(seed.referrals), notifications: clone(seed.notifications), treatments: clone(seed.treatments),
    audit: [] as AuditEntry[],
    absence: null as (AbsencePlan & { active: boolean }) | null,
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

const uid = () => Math.random().toString(36).slice(2, 8);

export const actions = {
  setVisitStatus: (id: string, status: Visit["status"]) =>
    set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, status } : v)) }), `Cita ${id} → ${status}`),
  rescheduleVisit: (id: string, date: string, time: string) =>
    set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, date, time, status: "pendiente" } : v)) }), `Cita ${id} reprogramada a ${date} ${time}`),
  assignVisit: (id: string, staffId: string) =>
    set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, staffId, service: v.service === "Reasignación pendiente" ? "Consulta general" : v.service, status: "confirmada" } : v)) }), `Cita ${id} asignada a ${staffId}`),
  advanceStep: (id: string, step: VisitStep) =>
    set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, step, status: step === "finalizada" ? "finalizada" : step === "programada" ? v.status : "en_curso" } : v)) }), `Visita ${id}: ${step}`),
  createVisit: (v: Omit<Visit, "id" | "step" | "prep">) => {
    const id = "v" + uid();
    set((s) => ({ visits: [...s.visits, { ...v, id, step: "programada", prep: [] }] }), `Nueva cita ${id} (${v.status})`);
    return id;
  },
  setRequestStatus: (id: string, status: VFState["requests"][number]["status"]) =>
    set((s) => ({ requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)) }), `Solicitud ${id} → ${status}`),
  decideApproval: (id: string, status: "aprobada" | "rechazada") =>
    set((s) => ({ approvals: s.approvals.map((a) => (a.id === id ? { ...a, status } : a)) }), `Aprobación ${id} ${status}`),
  setStaffStatus: (id: string, status: StaffStatus) =>
    set((s) => ({ staff: s.staff.map((m) => (m.id === id ? { ...m, status } : m)) }), `Equipo ${id} → ${status}`),
  addIncident: (title: string, detail: string) =>
    set((s) => ({ incidents: [{ id: "i" + uid(), title, detail, severity: "media", status: "abierta", owner: "Coordinación" }, ...s.incidents] }), `Incidencia: ${title}`),
  setIncidentStatus: (id: string, status: "abierta" | "en_gestion" | "cerrada") =>
    set((s) => ({ incidents: s.incidents.map((i) => (i.id === id ? { ...i, status } : i)) }), `Incidencia ${id} → ${status}`),
  toggleTask: (id: string) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }), `Tarea ${id} actualizada`),
  markPaid: (id: string) => set((s) => ({ payments: s.payments.map((p) => (p.id === id ? { ...p, status: "pagado" } : p)) }), `Cobro ${id} registrado`),
  readNotification: (id: string) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  moveStock: (id: string, delta: number) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i)) }), `Inventario ${id} ${delta > 0 ? "+" : ""}${delta}`),
  progressCourse: (id: string) => set((s) => ({ courses: s.courses.map((c) => (c.id === id ? { ...c, progress: Math.min(100, c.progress + 20) } : c)) }), `Formación ${id} avanzada`),
  resolveReferral: (id: string, specialist: string) => set((s) => ({ referrals: s.referrals.map((r) => (r.id === id ? { ...r, status: "agendada", specialist } : r)) }), `Remisión ${id} asignada`),
  setAbsence: (plan: AbsencePlan & { active: boolean } | null) => set(() => ({ absence: plan }), plan?.active ? "Modo ausencia activado" : "Modo ausencia desactivado"),
  pushChat: (m: ChatMsg) => set((s) => ({ chat: [...s.chat, m] })),
  setProposal: (msgId: string, status: "aprobada" | "rechazada") =>
    set((s) => ({ chat: s.chat.map((m) => (m.id === msgId && m.proposal ? { ...m, proposal: { ...m.proposal, status } } : m)) }), `Propuesta del asistente ${status}`),
};
