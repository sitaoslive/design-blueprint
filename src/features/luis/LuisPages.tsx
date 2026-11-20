import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Stethoscope, Briefcase, Search, Bell, CalendarPlus, Pill, ClipboardList, Users } from "lucide-react";
import { db } from "@/lib/vf/db";
import { useVF, getVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn, QuickAction } from "@/components/vf/ui";
import { REF_LABEL, stalled, type RefState } from "@/features/referrals/domain";
import { remindersDue, liveVisits, currentVisit, type Reminder } from "./domain";
import { VisitExecution } from "@/features/field-operations/components/FieldPages";

const inp = "w-full rounded-2xl bg-accent p-3";
export type LuisMode = "dueno" | "veterinario";
const KEY = "vf-luis-mode";
export function useLuisMode(): [LuisMode, (m: LuisMode) => void] {
  const [m, setM] = useState<LuisMode>("dueno");
  useEffect(() => { const v = localStorage.getItem(KEY); if (v === "veterinario" || v === "dueno") setM(v); }, []);
  return [m, (v) => { localStorage.setItem(KEY, v); setM(v); }];
}
export function LuisModeSwitch({ mode, onChange }: { mode: LuisMode; onChange: (m: LuisMode) => void }) {
  return (<div role="tablist" aria-label="Modo de Luis" className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
    {([["dueno", "Dueño", Briefcase], ["veterinario", "Veterinario", Stethoscope]] as const).map(([k, l, I]) => <button key={k} role="tab" aria-selected={mode === k} onClick={() => onChange(k)} className={`flex items-center justify-center gap-2 rounded-full py-2 font-bold ${mode === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><I className="h-4 w-4" />{l}</button>)}</div>);
}

/** Luis's own staff record (linked by user id). Demo falls back to the first vet. */
export function useMyStaffId() {
  const uid = useVF((s) => s.userId); const staff = useVF((s) => s.staff); const [id, setId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (uid?.startsWith("demo-")) { setId(staff.find((s) => s.role === "Veterinario")?.id ?? null); return; }
    if (!uid) return; void db.from("staff_members").select("id").eq("user_id", uid).maybeSingle().then(({ data }: { data: { id: string } | null }) => setId(data?.id ?? null));
  }, [uid, staff]);
  return id;
}
export function useReminders() {
  const [rows, setRows] = useState<Reminder[] | null>(null);
  const reload = async () => { const { data, error } = await db.from("referral_reminders").select("*").order("due_at"); if (error) toast.error(error.message); setRows(data ?? []); };
  useEffect(() => { void reload(); }, []);
  return { rows, reload };
}
const today = () => new Date().toISOString().slice(0, 10);

export function LuisVetHome() {
  const visits = useVF((s) => s.visits); const pets = useVF((s) => s.pets); const staff = useVF((s) => s.staff); const myId = useMyStaffId(); const { rows } = useReminders();
  const mine = visits.filter((v) => v.staffId && v.staffId === myId).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const live = liveVisits(visits); const due = remindersDue(rows ?? [], new Date());
  const pet = (id: string) => pets.find((p) => p.id === id);
  return (<>
    <PageTitle title="Hola, Dr. Luis" subtitle="Tus pacientes y tu jornada" />
    {myId === null && <Card className="mb-3"><b>Tu perfil de profesional no está vinculado</b><p className="text-sm text-muted-foreground">Vincúlalo en Administración → Cuentas del equipo para que te asignen citas.</p></Card>}
    <div className="grid grid-cols-2 gap-3">
      <QuickAction icon={Search} label="Todos los pacientes" to="/luis/pacientes" />
      <QuickAction icon={Bell} label={`Recordatorios${due.overdue + due.today ? ` (${due.overdue + due.today})` : ""}`} tone="sage" to="/luis/recordatorios" />
      <QuickAction icon={CalendarPlus} label="Nueva cita" tone="sage" to="/luis/nueva-cita" />
      <QuickAction icon={ClipboardList} label="Remisiones" to="/luis/remisiones-pacientes" />
    </div>
    <SectionTitle>En cita ahora</SectionTitle>
    {live.length ? live.map((v) => <Link key={v.id} to={`/luis/pacientes?p=${v.petId}` as never} className="mb-2 block"><Card><b>{pet(v.petId)?.name ?? v.petId} · {v.service}</b><p className="text-sm">{({ en_desplazamiento: "En camino", llegada: "Llegó al domicilio", en_atencion: "En atención" } as Record<string, string>)[v.step] ?? v.step} · {staff.find((s) => s.id === v.staffId)?.name ?? "Sin asignar"}</p></Card></Link>) : <Empty title="Nadie está en cita en este momento" />}
    <SectionTitle>Mi jornada</SectionTitle>
    {mine.length ? mine.slice(0, 8).map((v) => <Link key={v.id} to={`/luis/pacientes?p=${v.petId}` as never} className="mb-2 block"><Card><div className="flex justify-between"><b>{v.time} · {pet(v.petId)?.name}</b><span className="text-sm text-muted-foreground">{v.date === today() ? "Hoy" : v.date}</span></div><p className="text-sm">{v.service} · {v.address}</p></Card></Link>) : <Empty title="No tienes citas asignadas" />}
    <SectionTitle>Recordatorios próximos</SectionTitle>
    {due.list.length ? due.list.slice(0, 4).map((r) => <Card key={r.id} className="mb-2"><b>{r.title}</b><p className="text-sm text-muted-foreground">{new Date(r.due_at).toLocaleString("es-CO")}{new Date(r.due_at) < new Date() ? " · vencido" : ""}</p></Card>) : <Empty title="Sin recordatorios pendientes" />}
  </>);
}

export function LuisPatients() {
  const pets = useVF((s) => s.pets); const [q, setQ] = useState(""); const [sel, setSel] = useState<string | null>(null);
  useEffect(() => { const p = new URLSearchParams(window.location.search).get("p"); if (p) setSel(p); }, []);
  const list = useMemo(() => { const t = q.trim().toLowerCase(); return pets.filter((p) => !t || `${p.name} ${p.owner} ${p.breed}`.toLowerCase().includes(t)); }, [pets, q]);
  if (sel) return <PatientFile id={sel} onBack={() => setSel(null)} />;
  return (<><PageTitle title="Todos los pacientes" subtitle={`${pets.length} mascotas`} />
    <input className={`${inp} mb-3`} placeholder="Buscar por mascota, dueño o raza" aria-label="Buscar paciente" value={q} onChange={(e) => setQ(e.target.value)} />
    {list.length ? list.map((p) => <button key={p.id} className="mb-2 block w-full text-left" onClick={() => setSel(p.id)}><Card><b>{p.name}</b> <span className="text-sm text-muted-foreground">· {p.species} {p.breed}</span><p className="text-sm">{p.owner}</p>{p.allergies && p.allergies !== "Ninguna" && <p className="text-xs font-bold text-primary">Alergias: {p.allergies}</p>}</Card></button>) : <Empty title="Sin resultados" />}</>);
}

function PatientFile({ id, onBack }: { id: string; onBack: () => void }) {
  const pet = useVF((s) => s.pets.find((p) => p.id === id)); const visits = useVF((s) => s.visits.filter((v) => v.petId === id)); const treatments = useVF((s) => s.treatments); const referrals = useVF((s) => s.referrals);
  const staff = useVF((s) => s.staff); const staffName = (sid?: string | null) => staff.find((x) => x.id === sid)?.name ?? "Sin asignar";
  const [mem, setMem] = useState<{ id: string; kind: string; content: string; validation: string }[] | null>(null);
  useEffect(() => { void db.from("customer_memory").select("id,kind,content,validation").eq("pet_id", id).then(({ data }: { data: typeof mem }) => setMem(data ?? [])); }, [id]);
  if (!pet) return <Empty title="Paciente no encontrado" />;
  const refs = referrals.filter((r) => r.pet === pet.name); const tr = treatments.filter((t) => t.pet === pet.name);
  const cur = currentVisit(visits, today());
  return (<><button className="mb-2 font-bold text-primary" onClick={onBack}>← Pacientes</button>
    <PageTitle title={pet.name} subtitle={`${pet.species} · ${pet.breed} · ${pet.age} · ${pet.owner}`} />
    {pet.allergies && <Card className="mb-3"><b>Alergias</b><p className="text-sm">{pet.allergies}</p></Card>}
    <div className="grid grid-cols-2 gap-3">
      <QuickAction icon={CalendarPlus} label="Nueva cita" to="/luis/nueva-cita" />
      <QuickAction icon={ClipboardList} label="Nueva remisión" tone="sage" to="/luis/remisiones" />
      <QuickAction icon={Pill} label="Registrar dosis" tone="sage" to="/luis/tratamientos" />
      <QuickAction icon={Users} label="Ficha completa" to={`/cliente/mascotas/${pet.id}`} />
    </div>
    <SectionTitle>Cita actual</SectionTitle>
    {cur ? <Card className="mb-3"><b>{cur.date === today() ? "Hoy" : cur.date} {cur.time} · {cur.service}</b><p className="mb-2 text-sm text-muted-foreground">{cur.address} · {staffName(cur.staffId)}</p>
      <VisitExecution id={cur.id} embedded /></Card> : <Empty title="Sin cita en curso ni próxima" />}
    <SectionTitle>Citas</SectionTitle>{visits.length ? visits.map((v) => <Card key={v.id} className="mb-2"><b>{v.date} {v.time} · {v.service}</b><p className="text-sm text-muted-foreground">{v.status}</p></Card>) : <Empty title="Sin citas" />}
    <SectionTitle>Tratamientos</SectionTitle>{tr.length ? tr.map((t) => <Card key={t.id} className="mb-2"><b>{t.plan}</b><p className="text-sm">{t.frequency} · {t.done}/{t.total}</p></Card>) : <Empty title="Sin tratamientos" />}
    <SectionTitle>Remisiones</SectionTitle>{refs.length ? refs.map((r) => <Link key={r.id} to={`/operaciones/remisiones/${r.id}/gestion` as never} className="mb-2 block"><Card><b>{r.specialty}</b><p className="text-sm">{r.specialist ?? "Sin especialista"}</p></Card></Link>) : <Empty title="Sin remisiones" />}
    <SectionTitle>Memoria del cliente</SectionTitle>{mem === null ? <p className="text-muted-foreground">Cargando…</p> : mem.length ? mem.map((m) => <Card key={m.id} className="mb-2"><p className="text-sm">{m.content}</p><p className="text-xs text-muted-foreground">{m.kind} · {m.validation}</p></Card>) : <Empty title="Sin datos recordados" />}
  </>);
}

export function LuisReminders() {
  const referrals = useVF((s) => s.referrals); const pets = useVF((s) => s.pets); const { rows, reload } = useReminders();
  const [f, setF] = useState({ referral: "", title: "", due: "", assignee: "Luis" });
  const add = async () => {
    if (!f.title.trim() || !f.due) { toast.error("Escribe el recordatorio y la fecha"); return; }
    const ref = referrals.find((r) => r.id === f.referral);
    if (getVF().userId?.startsWith("demo-")) { toast.success("Recordatorio creado (demo, no se guarda)"); return; }
    const { error } = await db.from("referral_reminders").insert({ referral_id: ref?.id ?? null, pet_id: pets.find((p) => p.name === ref?.pet)?.id ?? null, title: f.title.trim(), due_at: new Date(f.due).toISOString(), assignee: f.assignee });
    if (error) toast.error(error.message); else { toast.success("Recordatorio creado"); setF({ ...f, title: "", due: "" }); await reload(); }
  };
  const done = async (r: Reminder) => { if (getVF().userId?.startsWith("demo-")) { toast.success("Hecho (demo)"); return; } const { error } = await db.from("referral_reminders").update({ status: "hecho" }).eq("id", r.id); if (error) toast.error(error.message); else await reload(); };
  const pend = (rows ?? []).filter((r) => r.status === "pendiente");
  return (<><PageTitle title="Recordatorios de pacientes" subtitle="Seguimiento de pacientes con especialistas" />
    <Card className="mb-3 space-y-2">
      <select className={inp} aria-label="Remisión" value={f.referral} onChange={(e) => setF({ ...f, referral: e.target.value })}><option value="">Sin remisión (general)</option>{referrals.map((r) => <option key={r.id} value={r.id}>{r.pet} · {r.specialty}</option>)}</select>
      <input className={inp} placeholder="Ej. Llamar por el informe de cardiología" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <input type="datetime-local" className={inp} aria-label="Fecha del recordatorio" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} />
      <input className={inp} placeholder="Responsable" value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })} />
      <Btn onClick={() => void add()}>Crear recordatorio</Btn></Card>
    {rows === null ? <p className="text-muted-foreground">Cargando…</p> : pend.length ? pend.map((r) => { const ref = referrals.find((x) => x.id === r.referral_id); return <Card key={r.id} className="mb-2"><div className="flex items-start justify-between gap-2"><div><b>{r.title}</b><p className="text-sm">{ref ? `${ref.pet} · ${ref.specialty}` : "General"} · {r.assignee}</p><p className={`text-xs ${new Date(r.due_at) < new Date() ? "font-bold text-primary" : "text-muted-foreground"}`}>{new Date(r.due_at).toLocaleString("es-CO")}{new Date(r.due_at) < new Date() ? " · vencido" : ""}</p></div><Btn variant="outline" onClick={() => void done(r)}>Hecho</Btn></div></Card>; }) : <Empty title="Sin recordatorios pendientes" />}</>);
}

export function LuisPatientReferrals() {
  const referrals = useVF((s) => s.referrals); const [cases, setCases] = useState<{ referral_id: string; state: RefState; updated_at: string }[] | null>(null);
  useEffect(() => { void db.from("referral_cases").select("referral_id,state,updated_at").then(({ data }: { data: typeof cases }) => setCases(data ?? [])); }, []);
  return (<><PageTitle title="Remisiones de pacientes" subtitle="En qué paso va cada una" />
    {cases === null ? <p className="text-muted-foreground">Cargando…</p> : referrals.length ? referrals.map((r) => { const c = cases.find((x) => x.referral_id === r.id); const st = c ? stalled(c.state, new Date(c.updated_at), new Date()) : null;
      return <Link key={r.id} to={`/operaciones/remisiones/${r.id}/gestion` as never} className="mb-2 block"><Card><div className="flex justify-between"><b>{r.pet} · {r.specialty}</b>{st?.stalled && <span className="rounded-full bg-blush px-2 text-xs font-bold">Estancada</span>}</div><p className="text-sm">{REF_LABEL[c?.state ?? "PROPOSED"]}</p><p className="text-xs text-muted-foreground">{r.specialist ?? "Sin especialista"}</p></Card></Link>; }) : <Empty title="Sin remisiones" />}</>);
}

/** Owner home extras: things only the owner decides, on one card list. */
export function OwnerAlerts() {
  const approvals = useVF((s) => s.approvals.filter((a) => a.status === "pendiente").length); const incidents = useVF((s) => s.incidents.filter((i) => i.status !== "cerrada").length);
  const [n, setN] = useState({ stalled: 0, collections: 0, escalated: 0 });
  useEffect(() => { void (async () => {
    const [c, r, v] = await Promise.all([db.from("referral_cases").select("state,updated_at"), db.from("records").select("id").eq("kind", "cobro_campo").eq("status", "informado"), db.from("conversations").select("id").eq("control_mode", "human")]);
    setN({ stalled: ((c.data ?? []) as { state: RefState; updated_at: string }[]).filter((x) => stalled(x.state, new Date(x.updated_at), new Date()).stalled).length, collections: (r.data ?? []).length, escalated: (v.data ?? []).length });
  })(); }, []);
  const items: [number, string, string][] = [[approvals, "Aprobaciones pendientes", "/luis/aprobaciones"], [n.stalled, "Remisiones estancadas", "/operaciones/remisiones/estancadas"], [n.collections, "Cobros por verificar", "/luis/finanzas"], [incidents, "Incidentes abiertos", "/luis/incidencias"], [n.escalated, "Conversaciones con una persona", "/operaciones/whatsapp"]];
  return (<div className="mt-3 grid grid-cols-2 gap-2">{items.map(([v, l, to]) => <Link key={l} to={to as never}><Card className="h-full"><b className="text-2xl">{v}</b><p className="text-sm leading-tight">{l}</p></Card></Link>)}</div>);
}
