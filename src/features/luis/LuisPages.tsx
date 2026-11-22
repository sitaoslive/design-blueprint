import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Stethoscope, Briefcase, Search, Bell, CalendarPlus, Pill, ClipboardList, Users, Palette, ShieldCheck, Sparkles, Copy, Check } from "lucide-react";
import { db } from "@/lib/vf/db";
import { useVF, getVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn, QuickAction } from "@/components/vf/ui";
import { REF_LABEL, stalled, type RefState } from "@/features/referrals/domain";
import { remindersDue, liveVisits, currentVisit, type Reminder } from "./domain";
import { VisitExecution } from "@/features/field-operations/components/FieldPages";
import { supabase } from "@/integrations/supabase/client";

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
  useEffect(() => { void reload(); const fn = () => void reload(); addEventListener("vf-referral-change", fn); const timer = setInterval(fn, 15000); return () => { removeEventListener("vf-referral-change", fn); clearInterval(timer); }; }, []);
  return { rows, reload };
}
const today = () => new Date().toISOString().slice(0, 10);

export function LuisVetHome() {
  const visits = useVF((s) => s.visits); const pets = useVF((s) => s.pets); const staff = useVF((s) => s.staff); const myId = useMyStaffId(); const { rows } = useReminders();
  const mine = visits.filter((v) => v.staffId && v.staffId === myId).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const live = liveVisits(visits); const due = remindersDue(rows ?? [], new Date());
  const pet = (id: string) => pets.find((p) => p.id === id);

  const [inviteModal, setInviteModal] = useState(false);
  const [clientPhone, setClientPhone] = useState("");
  const [petNameInput, setPetNameInput] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = `VET-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;
    try {
      await supabase.from("user_invitations").insert({
        organization_id: "11111111-1111-1111-1111-111111111111",
        email: `tutor.${code.toLowerCase()}@vetlife.co`,
        invited_phone: clientPhone || null,
        role: "OWNER_CLIENT",
        invited_by: "d1111111-1111-1111-1111-111111111111",
        token_hash: `hash_${code}`,
        short_code: code,
        status: "PENDING",
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
      });
      setGeneratedCode(code);
      toast.success(`Código ${code} creado exitosamente`);
    } catch {
      setGeneratedCode(code);
      toast.success(`Código de demostración ${code} generado`);
    }
  };

  const copyWhatsApp = () => {
    const text = `¡Hola! Soy el Dr. Luis Eduardo Ríos de Vet Life. Ya preparé el expediente clínico domiciliario para tu mascota. Puedes ingresar y activar tu carnet en: https://design-blueprint.lovable.app/invite/${generatedCode} (o ingresa el código ${generatedCode}).`;
    void navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Mensaje copiado al portapapeles listo para enviar por WhatsApp");
    setTimeout(() => setCopied(false), 3000);
  };

  return (<>
    <PageTitle title="Hola, Dr. Luis" subtitle="Tus pacientes, jornada y herramientas clínicas" />
    {myId === null && <Card className="mb-3"><b>Tu perfil de profesional no está vinculado</b><p className="text-sm text-muted-foreground">Vincúlalo en Administración → Cuentas del equipo para que te asignen citas.</p></Card>}
    <div className="grid grid-cols-2 gap-3">
      <QuickAction icon={Search} label="Todos los pacientes" to="/luis/pacientes" />
      <QuickAction icon={Sparkles} label="Invitar Tutor WhatsApp" tone="amber" onClick={() => setInviteModal(true)} />
      <QuickAction icon={Palette} label="Estudio de Diseño" tone="sage" to="/admin/estudio-diseno" />
      <QuickAction icon={ShieldCheck} label="Vinculaciones" tone="sage" to="/admin/solicitudes-vinculacion" />
      <QuickAction icon={CalendarPlus} label="Nueva cita" to="/luis/nueva-cita" />
      <QuickAction icon={ClipboardList} label="Remisiones" to="/luis/remisiones-pacientes" />
    </div>

    {/* Quick Invitation Generator Modal */}
    {inviteModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="font-extrabold text-foreground">Generador de Invitación para Cliente</h3>
            </div>
            <button type="button" onClick={() => { setInviteModal(false); setGeneratedCode(null); }} className="text-muted-foreground hover:text-foreground font-bold">✕</button>
          </div>

          {!generatedCode ? (
            <form onSubmit={handleCreateInvitation} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Crea un código de acceso único y seguro para que el dueño de la mascota ingrese a su portal sin fricción.
              </p>
              <div>
                <label className="text-xs font-bold text-foreground">Nombre de la Mascota</label>
                <input
                  type="text"
                  placeholder="Ej. Toby, Luna, Bruno"
                  value={petNameInput}
                  onChange={(e) => setPetNameInput(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-accent px-3 py-2 text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground">WhatsApp del Tutor</label>
                <input
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-accent px-3 py-2 text-sm font-medium"
                />
              </div>
              <Btn type="submit" className="w-full shadow-button mt-2">
                Generar Código de Invitación
              </Btn>
            </form>
          ) : (
            <div className="space-y-3 text-center">
              <span className="rounded-full bg-sage px-3 py-1 text-xs font-bold text-sage-foreground">¡Código Generado!</span>
              <div className="rounded-2xl border-2 border-primary/40 bg-secondary/60 p-4">
                <p className="text-xs text-muted-foreground">Código de Vinculación:</p>
                <p className="text-2xl font-black font-mono text-primary mt-1">{generatedCode}</p>
                <p className="text-[11px] text-muted-foreground mt-2">Enlace directo: vetlife.co/invite/{generatedCode}</p>
              </div>

              <Btn onClick={copyWhatsApp} className="w-full gap-2 shadow-button">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "¡Copiado para WhatsApp!" : "Copiar Invitación para WhatsApp"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    )}

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
  const auto = currentVisit(visits, today()); const [pin, setPin] = useState<string | null>(null);
  useEffect(() => { if (auto && !pin) setPin(auto.id); }, [auto, pin]);
  if (!pet) return <Empty title="Paciente no encontrado" />;
  const refs = referrals.filter((r) => r.pet === pet.name); const tr = treatments.filter((t) => t.pet === pet.name);
  const cur = visits.find((v) => v.id === pin) ?? auto;
  return (<><button className="mb-2 font-bold text-primary" onClick={onBack}>← Pacientes</button>
    <PageTitle title={pet.name} subtitle={`${pet.species} · ${pet.breed} · ${pet.age} · ${pet.owner}`} />
    {pet.allergies && <Card className="mb-3"><b>Alergias</b><p className="text-sm">{pet.allergies}</p></Card>}
    <div className="grid grid-cols-2 gap-3">
      <QuickAction icon={CalendarPlus} label="Nueva cita" to="/luis/nueva-cita" />
      <QuickAction icon={ClipboardList} label="Nueva remisión" tone="sage" to="/luis/remisiones" />
      <QuickAction icon={Pill} label="Registrar dosis" tone="sage" to="/luis/tratamientos" />
      <QuickAction icon={Users} label="Ficha completa" to={`/cliente/mascotas/${pet.id}`} />
    </div>
    <SectionTitle>Cita seleccionada</SectionTitle>
    {cur ? <Card className="mb-3"><b>{cur.date === today() ? "Hoy" : cur.date} {cur.time} · {cur.service}</b><p className="mb-2 text-sm text-muted-foreground">{cur.address} · {staffName(cur.staffId)}</p>
      <VisitExecution key={cur.id} id={cur.id} embedded /></Card> : <Empty title="Sin cita en curso ni próxima" />}
    <SectionTitle>Citas</SectionTitle>{visits.length ? visits.map((v) => <button key={v.id} className="mb-2 block w-full text-left" onClick={() => { setPin(v.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Card className={v.id === cur?.id ? "ring-2 ring-primary" : ""}><b>{v.date} {v.time} · {v.service}</b><p className="text-sm text-muted-foreground">{v.status} · {staffName(v.staffId)} · Toca para abrir</p></Card></button>) : <Empty title="Sin citas" />}
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
