import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Bot, User, ShieldAlert, Send, Info } from "lucide-react";
import { db } from "@/lib/vf/db";
import { useVF, getVF } from "@/lib/vf/store";
import { classify, proposeReply, isOutOfHours, type Article } from "@/lib/vf/concierge";
import { cn } from "@/lib/utils";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "../ui";

type Conv = { id: string; contact_name: string; contact_phone: string; owner_id: string | null; verified: boolean; pet_id: string | null; status: string; control_mode: "ai" | "human"; priority: string; sensitive: boolean; last_message_at: string; last_inbound_at: string | null; version: number; synthetic: boolean };
type Msg = { id: string; conversation_id: string; direction: "in" | "out"; sender: "cliente" | "ia" | "humano" | "sistema"; body: string; intents: string[]; created_at: string };
type Out = { id: string; conversation_id: string; body: string; status: string; error: string | null; sender: string; created_at: string };
const input = "w-full rounded-2xl bg-accent p-3";
const STATUS_ES: Record<string, string> = { NEW: "Nueva", IDENTIFICATION_REQUIRED: "Identificar", AI_ACTIVE: "IA atendiendo", WAITING_CUSTOMER: "Esperando cliente", WAITING_TEAM: "Esperando equipo", HUMAN_ACTIVE: "Persona atendiendo", PENDING_COORDINATION: "Coordinación", PENDING_CLINICAL_ESCALATION: "Escalada clínica", FOLLOW_UP_SCHEDULED: "Seguimiento", RESOLVED: "Resuelta", CLOSED: "Cerrada", ERROR: "Error" };
const OUT_ES: Record<string, string> = { QUEUED: "En cola", SUPPRESSED: "Bloqueado (baja)", FAILED: "No enviado", CANCELLED: "Cancelado", SENT: "Enviado", DELIVERED: "Entregado", READ: "Leído" };
const hhmm = (s: string) => new Date(s).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
const ago = (s: string) => { const m = Math.round((Date.now() - new Date(s).getTime()) / 60000); return m < 60 ? `${m} min` : m < 1440 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} d`; };
const INTENT_ES: Record<string, string> = { GREETING: "saludo", GENERAL_INFORMATION: "información", SERVICE_INQUIRY: "servicios", PRICE_INQUIRY: "precio", COVERAGE_INQUIRY: "cobertura", NEW_APPOINTMENT: "nueva cita", APPOINTMENT_STATUS: "estado de cita", RESCHEDULE_REQUEST: "reprogramar", CANCEL_REQUEST: "cancelar", PAYMENT_INQUIRY: "pagos", DOCUMENT_REQUEST: "documentos", PET_INFORMATION_UPDATE: "datos de mascota", COMPLAINT: "queja", HUMAN_REQUEST: "pide una persona", FOLLOW_UP: "seguimiento", SPECIALIST_REFERRAL: "especialista", CLINICAL_QUESTION: "consulta clínica", POSSIBLE_EMERGENCY: "posible urgencia", GRIEF_OR_SENSITIVE_SITUATION: "situación sensible", OTHER: "otro" };
const isDemo = () => getVF().userId?.startsWith("demo-") ?? false;

async function run<T>(p: PromiseLike<{ data?: T; error: { message: string } | null }>, ok?: string): Promise<T | null> {
  const { data, error } = await p; if (error) { toast.error(error.message); return null; } if (ok) toast.success(ok); return (data ?? ([] as unknown)) as T;
}

function useConcierge() {
  const [convs, setConvs] = useState<Conv[] | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => { void db.from("conversations").select("*").order("last_message_at", { ascending: false }).then(({ data }: { data: Conv[] | null }) => setConvs(data ?? [])); }, [n]);
  return { convs, reload: () => setN((x) => x + 1) };
}

export const FILTERS: Record<string, [string, (c: Conv) => boolean]> = {
  todas: ["Todas", (c) => c.status !== "CLOSED"],
  pendientes: ["Sin respuesta", (c) => ["WAITING_TEAM", "NEW", "IDENTIFICATION_REQUIRED"].includes(c.status)],
  traspasos: ["Traspasos", (c) => c.control_mode === "human" || ["PENDING_CLINICAL_ESCALATION", "PENDING_COORDINATION"].includes(c.status)],
  seguimientos: ["Seguimientos", (c) => c.status === "FOLLOW_UP_SCHEDULED"],
  cerradas: ["Cerradas", (c) => ["RESOLVED", "CLOSED"].includes(c.status)],
};

function ConversationList({ convs, base, active, filter }: { convs: Conv[]; base: string; active?: string; filter: string }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState(filter in FILTERS ? filter : "todas");
  const list = convs.filter(FILTERS[f]![1]).filter((c) => !q || `${c.contact_name} ${c.contact_phone}`.toLowerCase().includes(q.toLowerCase()));
  return (<div>
    <input className={input} placeholder="Buscar nombre o teléfono" aria-label="Buscar conversación" value={q} onChange={(e) => setQ(e.target.value)} />
    <div className="my-2 flex flex-wrap gap-1">{Object.entries(FILTERS).map(([k, [l]]) => <button key={k} onClick={() => setF(k)} className={cn("rounded-full px-3 py-1 text-xs font-bold", f === k ? "bg-primary text-primary-foreground" : "bg-secondary")}>{l}</button>)}</div>
    {list.length ? list.map((c) => (
      <Link key={c.id} to={`${base}/${c.id}` as never} className={cn("mb-2 block rounded-2xl p-3 transition", active === c.id ? "bg-blush" : "bg-card shadow-soft")}>
        <div className="flex items-center justify-between gap-2"><b className="truncate">{c.contact_name}</b><span className="shrink-0 text-xs text-muted-foreground">{ago(c.last_message_at)}</span></div>
        <div className="mt-1 flex flex-wrap items-center gap-1 text-xs">
          <span className="rounded-full bg-secondary px-2 py-0.5">{STATUS_ES[c.status] ?? c.status}</span>
          <span className={cn("rounded-full px-2 py-0.5", c.control_mode === "human" ? "bg-sage text-sage-foreground" : "bg-accent")}>{c.control_mode === "human" ? "Persona" : "IA"}</span>
          {c.priority === "alta" && <span className="rounded-full bg-amber px-2 py-0.5 font-bold text-amber-foreground">Prioridad alta</span>}
          {c.synthetic && <span className="text-muted-foreground">· prueba</span>}
        </div>
      </Link>)) : <Empty title="No hay conversaciones aquí" />}
  </div>);
}

function Bubble({ m, out }: { m: Msg; out?: Out }) {
  const mine = m.direction === "out";
  const who = m.sender === "ia" ? "Asistente virtual" : m.sender === "humano" ? "Equipo Vet Life" : m.sender === "sistema" ? "Sistema" : "Cliente";
  return (<div className={cn("mb-2 flex", mine ? "justify-end" : "justify-start")}>
    <div className={cn("max-w-[85%] rounded-3xl px-4 py-2", m.sender === "sistema" ? "bg-secondary text-sm italic" : mine ? (m.sender === "ia" ? "bg-accent" : "bg-blush") : "bg-card shadow-soft")}>
      <div className="mb-0.5 flex items-center gap-1 text-xs font-bold text-muted-foreground">{m.sender === "ia" ? <Bot className="h-3 w-3" /> : m.sender === "humano" ? <User className="h-3 w-3" /> : null}{who} · {hhmm(m.created_at)}</div>
      <p className="whitespace-pre-wrap">{m.body}</p>
      {m.intents.length > 0 && <p className="mt-1 text-[11px] text-muted-foreground">Intención: {m.intents.map((x) => INTENT_ES[x] ?? x).join(", ")}</p>}
      {out && <p className={cn("mt-1 text-[11px] font-bold", out.status === "QUEUED" ? "text-muted-foreground" : "text-primary")}>{OUT_ES[out.status] ?? out.status}{out.error ? ` · ${out.error}` : ""}</p>}
    </div></div>);
}

function Context({ c, onChange, tick = 0 }: { c: Conv; onChange: () => void; tick?: number }) {
  const pets = useVF((s) => s.pets); const visits = useVF((s) => s.visits);
  const last = (x: string) => x.trim().split(/\s+/).pop()!.toLowerCase();
  const candidates = pets.filter((p) => p.owner.toLowerCase() === c.contact_name.toLowerCase() || last(p.owner) === last(c.contact_name));
  const pet = pets.find((p) => p.id === c.pet_id);
  const [mem, setMem] = useState<{ content: string; validation: string }[]>([]);
  const [commits, setCommits] = useState<{ id: string; title: string; status: string }[]>([]);
  useEffect(() => {
    if (c.verified && c.owner_id) void db.from("customer_memory").select("content,validation").eq("client_id", c.owner_id).then(({ data }: { data: typeof mem | null }) => setMem(data ?? []));
    void db.from("records").select("id,title,status").eq("kind", "compromiso_conversacion").eq("ref_id", c.id).then(({ data }: { data: typeof commits | null }) => setCommits(data ?? []));
  }, [c.id, c.verified, c.owner_id, tick]);
  const verify = async (ownerId: string | null, petId: string) => { if (await run(db.from("conversations").update({ verified: true, owner_id: ownerId, pet_id: petId }).eq("id", c.id), "Identidad verificada")) { await db.from("conversation_events").insert({ conversation_id: c.id, kind: "identidad_verificada", detail: petId }); onChange(); } };
  const next = pet ? visits.find((v) => v.petId === pet.id && !["finalizada", "cancelada"].includes(v.status)) : undefined;
  return (<div className="space-y-3">
    <Card><b>{c.contact_name}</b><p className="text-sm text-muted-foreground">+{c.contact_phone}</p>
      {c.verified ? <p className="mt-1 text-sm font-bold text-sage-foreground">Identidad verificada</p> : <p className="mt-1 flex items-center gap-1 text-sm font-bold text-primary"><ShieldAlert className="h-4 w-4" />Sin verificar: no compartas datos privados</p>}
      {c.sensitive && <p className="mt-1 text-sm">Situación sensible: sin promociones ni reseñas.</p>}</Card>
    {!c.verified && <Card><SectionTitle>Verificar identidad</SectionTitle>
      {candidates.length ? candidates.map((p) => <Btn key={p.id} variant="outline" className="mb-2 w-full" onClick={() => void verify(p.ownerId ?? null, p.id)}>{p.owner} · {p.name}</Btn>) : <p className="text-sm text-muted-foreground">No hay coincidencias seguras. Pide nombre completo y mascota; no fusiones registros.</p>}
      <p className="mt-1 text-xs text-muted-foreground">El teléfono ayuda a buscar, pero no prueba identidad.</p></Card>}
    {c.verified && pet && <Card><b>{pet.name}</b><p className="text-sm text-muted-foreground">{pet.species} · {pet.breed} · {pet.age}</p>{pet.allergies && <p className="text-sm">Alergias: {pet.allergies}</p>}
      <p className="mt-2 text-sm">{next ? `Próxima cita: ${next.date} ${next.time} · ${next.status}` : "Sin próximas citas"}</p></Card>}
    {c.verified && <Card><b>Memoria autorizada</b>{mem.length ? mem.map((m, i) => <p key={i} className="text-sm">• {m.content} <span className="text-xs text-muted-foreground">({m.validation === "validada" ? "verificado" : "declarado"})</span></p>) : <p className="text-sm text-muted-foreground">Sin datos registrados</p>}</Card>}
    <Card><b>Compromisos</b>{commits.length ? commits.map((m) => <p key={m.id} className="text-sm">• {m.title} · {m.status}</p>) : <p className="text-sm text-muted-foreground">Ninguno</p>}</Card>
  </div>);
}

function Chat({ c, onChange, back }: { c: Conv; onChange: () => void; back: ReactNode }) {
  const [msgs, setMsgs] = useState<Msg[] | null>(null); const [outs, setOuts] = useState<Out[]>([]);
  const [text, setText] = useState(""); const [sim, setSim] = useState(""); const [n, setN] = useState(0); const [ctx, setCtx] = useState(false);
  const [arts, setArts] = useState<Article[]>([]);
  const pets = useVF((s) => s.pets);
  useEffect(() => {
    void db.from("conversation_messages").select("*").eq("conversation_id", c.id).order("created_at").then(({ data }: { data: Msg[] | null }) => setMsgs(data ?? []));
    void db.from("outbound_messages").select("*").eq("conversation_id", c.id).then(({ data }: { data: Out[] | null }) => setOuts(data ?? []));
    void db.from("knowledge_articles").select("*").then(({ data }: { data: Article[] | null }) => setArts(data ?? []));
  }, [c.id, n]);
  const refresh = () => { setN((x) => x + 1); onChange(); };
  const event = (kind: string, detail = "") => db.from("conversation_events").insert({ conversation_id: c.id, kind, detail });
  const setState = async (patch: Partial<Conv>, ok: string, kind: string) => { if (await run(db.from("conversations").update(patch).eq("id", c.id).eq("version", c.version).select(), ok)) { await event(kind, JSON.stringify(patch)); refresh(); } };
  const takeOver = () => setState({ control_mode: "human", status: "HUMAN_ACTIVE" }, "Tomaste el control: la IA queda en pausa", "toma_control");
  const toAI = () => setState({ control_mode: "ai", status: "AI_ACTIVE" }, "La IA vuelve a atender", "ia_reanudada");
  const sendOut = async (body: string, sender: "humano" | "ia") => {
    const key = crypto.randomUUID();
    const out = await run<Out[]>(db.from("outbound_messages").insert({ conversation_id: c.id, body, sender, idempotency_key: key, conversation_version: sender === "ia" ? c.version : null }).select());
    if (!out?.[0] || ["CANCELLED", "SUPPRESSED", "FAILED"].includes(out[0].status)) { toast.error(out?.[0]?.error ?? "No se registró el envío"); return false; }
    await run(db.from("conversation_messages").insert({ conversation_id: c.id, direction: "out", sender, body, idempotency_key: "msg-" + key }));
    return true;
  };
  const sendHuman = async () => {
    if (!text.trim()) return;
    if (c.control_mode !== "human") { toast.error("Primero toma el control de la conversación"); return; }
    if (await sendOut(text.trim(), "humano")) { setText(""); refresh(); }
  };
  /** Synthetic inbound message (design/shadow mode): classify, propose a safe reply, hand off when needed. */
  const simulate = async () => {
    const body = sim.trim(); if (!body) return;
    const cl = classify(body, pets.filter((p) => !c.verified || p.ownerId === c.owner_id).map((p) => p.name));
    const inserted = await run<Msg[]>(db.from("conversation_messages").insert({ conversation_id: c.id, direction: "in", sender: "cliente", body, intents: cl.intents }).select());
    if (!inserted) return; setSim("");
    if (cl.intents.includes("GRIEF_OR_SENSITIVE_SITUATION")) await db.from("conversations").update({ sensitive: true }).eq("id", c.id);
    if (c.control_mode === "ai") {
      const r = proposeReply(cl, arts, { outOfHours: isOutOfHours(new Date()) });
      const fresh = (await db.from("conversations").select("version,control_mode").eq("id", c.id).single()).data as { version: number; control_mode: string } | null;
      if (fresh?.control_mode === "ai") {
        const key = crypto.randomUUID();
        const out = await run<Out[]>(db.from("outbound_messages").insert({ conversation_id: c.id, body: r.text, sender: "ia", idempotency_key: key, conversation_version: fresh.version }).select());
        if (out?.[0] && !["CANCELLED", "SUPPRESSED", "FAILED"].includes(out[0].status)) await db.from("conversation_messages").insert({ conversation_id: c.id, direction: "out", sender: "ia", body: r.text, idempotency_key: "msg-" + key });
      }
      if (r.handoff) {
        const status = cl.safety !== "none" ? "PENDING_CLINICAL_ESCALATION" : "WAITING_TEAM";
        const { error } = await db.from("conversations").update({ control_mode: "human", status, priority: cl.safety === "emergency" ? "alta" : c.priority }).eq("id", c.id);
        if (!error) { await event("traspaso_humano", cl.intents.join(",")); await db.from("conversation_messages").insert({ conversation_id: c.id, direction: "out", sender: "sistema", body: cl.safety === "emergency" ? "Posible urgencia: transferida con prioridad alta." : "Transferida a una persona del equipo." }); }
      }
    }
    refresh();
  };
  const createRequest = async () => {
    const last = [...(msgs ?? [])].reverse().find((m) => m.direction === "in"); if (!last) return;
    const pet = pets.find((p) => p.id === c.pet_id)?.name ?? "Por confirmar";
    const id = "wa-" + last.id.slice(0, 8);
    const { error } = await db.from("service_requests").insert({ id, client: c.contact_name, phone: c.contact_phone, pet, channel: "WhatsApp", message: last.body, status: "nueva", at: hhmm(new Date().toISOString()) });
    if (error) toast.error(error.code === "23505" ? "Ya existe una solicitud para este mensaje" : error.message); else { toast.success("Solicitud registrada (pendiente de validación, no es una cita confirmada)"); await event("solicitud_cita", id); refresh(); }
  };
  const createCommit = async () => {
    const t = window.prompt("Compromiso con el cliente (ej. Te llamamos mañana)"); if (!t?.trim()) return;
    if (await run(db.from("records").insert({ kind: "compromiso_conversacion", scope: "staff", ref_id: c.id, title: t.trim(), detail: c.contact_name, status: "pendiente", created_by: getVF().userId }), "Compromiso registrado")) { await event("compromiso", t.trim()); refresh(); }
  };
  const optOut = async () => { if (await run(db.from("communication_suppressions").insert({ phone: c.contact_phone, reason: "opt-out" }), "Contacto dado de baja: no se le enviarán mensajes")) await event("baja", ""); };
  const outByBody = useMemo(() => { const m = new Map<string, Out>(); outs.forEach((o) => m.set(o.body, o)); return m; }, [outs]);
  return (<div>
    <div className="mb-2 flex items-center justify-between gap-2">{back}<div className="min-w-0 flex-1"><b className="block truncate">{c.contact_name}</b><span className="text-xs text-muted-foreground">{STATUS_ES[c.status]} · {c.control_mode === "human" ? "Atiende una persona (IA en pausa)" : "Atiende el asistente virtual"}</span></div>
      <button onClick={() => setCtx((x) => !x)} className="rounded-full bg-secondary p-2 lg:hidden" aria-label="Ver contexto"><Info className="h-5 w-5" /></button></div>
    {c.priority === "alta" && <div className="mb-2 rounded-2xl bg-amber p-3 text-sm font-bold text-amber-foreground">Prioridad alta: revisa y contacta al cliente.</div>}
    {ctx && <div className="mb-3 lg:hidden"><Context c={c} onChange={refresh} tick={n} /></div>}
    <div className="mb-2 flex flex-wrap gap-2 [&_button]:px-4 [&_button]:py-2 [&_button]:text-sm">
      {c.control_mode === "ai" ? <Btn onClick={() => void takeOver()}>Tomar control</Btn> : <Btn variant="outline" onClick={() => void toAI()}>Devolver a IA</Btn>}
      <Btn variant="outline" onClick={() => void createRequest()}>Crear solicitud de cita</Btn>
      <Btn variant="outline" onClick={() => void createCommit()}>Compromiso</Btn>
      {!["RESOLVED", "CLOSED"].includes(c.status) ? <Btn variant="outline" onClick={() => void setState({ status: "RESOLVED" }, "Conversación resuelta", "resuelta")}>Resolver</Btn> : c.status === "RESOLVED" && <Btn variant="outline" onClick={() => void setState({ status: "CLOSED" }, "Conversación cerrada", "cerrada")}>Cerrar</Btn>}
      <Btn variant="outline" onClick={() => void optOut()}>Dar de baja</Btn>
    </div>
    <div className="rounded-3xl bg-secondary/50 p-3">{!msgs ? <p className="text-muted-foreground">Cargando…</p> : msgs.length ? msgs.map((m) => <Bubble key={m.id} m={m} {...(m.direction === "out" && outByBody.get(m.body) ? { out: outByBody.get(m.body)! } : {})} />) : <Empty title="Sin mensajes" />}</div>
    <div className="mt-2 flex gap-2"><input className={input} placeholder={c.control_mode === "human" ? "Escribe tu respuesta" : "Toma el control para responder"} aria-label="Respuesta" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void sendHuman(); }} disabled={c.control_mode !== "human"} /><Btn aria-label="Enviar" onClick={() => void sendHuman()} disabled={c.control_mode !== "human" || !text.trim()}><Send className="h-4 w-4" /></Btn></div>
    <p className="mt-1 text-xs text-muted-foreground">Envío real a WhatsApp desactivado: los mensajes quedan registrados y en cola.</p>
    {!isDemo() && <Card className="mt-3"><b>Simular mensaje del cliente (prueba)</b><div className="mt-2 flex gap-2"><input className={input} aria-label="Mensaje simulado" placeholder="Ej. Hola, quiero una cita para Luna" value={sim} onChange={(e) => setSim(e.target.value)} /><Btn onClick={() => void simulate()} disabled={!sim.trim()}>Simular</Btn></div></Card>}
  </div>);
}

export function ConversationCenter({ base, id, filter = "todas" }: { base: string; id?: string; filter?: string }) {
  const { convs, reload: r0 } = useConcierge(); const [tick, setTick] = useState(0);
  const reload = () => { r0(); setTick((x) => x + 1); };
  const c = convs?.find((x) => x.id === id);
  if (!convs) return <p className="mt-6 text-muted-foreground">Cargando conversaciones…</p>;
  const back = <Link to={base as never} className="rounded-full bg-secondary p-2 lg:hidden" aria-label="Volver a la lista"><ArrowLeft className="h-5 w-5" /></Link>;
  return (<>
    {!c && <PageTitle title="Conversaciones" subtitle="WhatsApp · Asistente virtual Vet Life con control humano" />}
    <div className="grid gap-4 lg:grid-cols-[250px_1fr_260px]">
      <div className={cn(c && "hidden lg:block")}><ConversationList convs={convs} base={base} filter={filter} {...(id ? { active: id } : {})} /></div>
      <div className={cn(!c && "hidden lg:block")}>{c ? <Chat key={c.id + c.version} c={c} onChange={reload} back={back} /> : <Empty title="Elige una conversación" />}</div>
      <div className="hidden lg:block">{c && <Context c={c} onChange={reload} tick={tick} />}</div>
    </div></>);
}

export function TemplatesAdmin({ id }: { id?: string }) {
  const [rows, setRows] = useState<{ id: string; name: string; label: string; category: string; body: string; status: string }[] | null>(null); const [n, setN] = useState(0);
  useEffect(() => { void db.from("message_templates").select("*").order("label").then(({ data }: { data: typeof rows }) => setRows(data ?? [])); }, [n]);
  const t = rows?.find((r) => r.id === id);
  const upd = async (patch: Record<string, string>, ok: string) => { if (t && await run(db.from("message_templates").update(patch).eq("id", t.id), ok)) setN((x) => x + 1); };
  if (id) return !rows ? <p>Cargando…</p> : !t ? <Empty title="Plantilla no encontrada" /> : (<><PageTitle title={t.label} subtitle={`${t.name} · ${t.category} · ${t.status}`} />
    <Card className="space-y-2"><textarea className={input} rows={4} aria-label="Texto" defaultValue={t.body} onBlur={(e) => e.target.value !== t.body && void upd({ body: e.target.value, status: "DRAFT" }, "Texto guardado (vuelve a borrador)")} />
      <div className="flex flex-wrap gap-2"><Btn onClick={() => void upd({ status: "READY_FOR_REVIEW" }, "Lista para enviar a revisión de Meta")}>Marcar lista para revisión</Btn><Btn variant="outline" onClick={() => void upd({ status: "PAUSED" }, "Pausada")}>Pausar</Btn><Btn variant="outline" onClick={() => void upd({ status: "DISABLED" }, "Desactivada")}>Desactivar</Btn></div>
      <p className="text-xs text-muted-foreground">Solo Meta puede aprobar o rechazar una plantilla. Sin WhatsApp conectado, ninguna queda aprobada.</p></Card></>);
  return (<><PageTitle title="Plantillas de WhatsApp" subtitle="Estados reales: ninguna está aprobada por Meta todavía" />
    {!rows ? <p>Cargando…</p> : rows.map((r) => <Link key={r.id} to={`/admin/plantillas/${r.id}` as never} className="mb-2 block"><Card className="flex items-center justify-between gap-2"><span className="min-w-0"><b>{r.label}</b><p className="truncate text-sm text-muted-foreground">{r.body}</p></span><span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-bold">{r.status}</span></Card></Link>)}</>);
}

export function KnowledgeAdmin() {
  const [rows, setRows] = useState<{ id: string; title: string; category: string; content: string; status: string; version: number }[] | null>(null); const [n, setN] = useState(0);
  useEffect(() => { void db.from("knowledge_articles").select("*").order("category").then(({ data }: { data: typeof rows }) => setRows(data ?? [])); }, [n]);
  const upd = async (id: string, patch: Record<string, unknown>, ok: string) => { if (await run(db.from("knowledge_articles").update(patch).eq("id", id), ok)) setN((x) => x + 1); };
  return (<><PageTitle title="IA conversacional" subtitle="El asistente solo responde con artículos aprobados y vigentes" />
    <Card className="mb-3"><p className="text-sm">Modo actual: <b>DISEÑO</b> · reglas automáticas (sin IA externa) · envíos reales desactivados. La IA nunca diagnostica, receta ni confirma citas.</p></Card>
    {!rows ? <p>Cargando…</p> : rows.map((r) => <Card key={r.id} className="mb-2 space-y-2"><div className="flex justify-between"><b>{r.title}</b><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{r.status} · v{r.version}</span></div>
      <textarea className={input} rows={2} aria-label={`Contenido ${r.title}`} defaultValue={r.content} onBlur={(e) => e.target.value !== r.content && void upd(r.id, { content: e.target.value, status: "borrador", version: r.version + 1 }, "Guardado como borrador")} />
      <div className="flex gap-2">{r.status !== "aprobado" && <Btn onClick={() => void upd(r.id, { status: "aprobado", approved_by: getVF().userId, reviewed_at: new Date().toISOString() }, "Aprobado")}>Aprobar</Btn>}{r.status !== "retirado" && <Btn variant="outline" onClick={() => void upd(r.id, { status: "retirado" }, "Retirado")}>Retirar</Btn>}</div></Card>)}</>);
}

export function CommMetrics() {
  const [d, setD] = useState<{ c: Conv[]; m: Msg[]; o: Out[] } | null>(null);
  useEffect(() => { void Promise.all([db.from("conversations").select("*"), db.from("conversation_messages").select("*"), db.from("outbound_messages").select("*")]).then(([c, m, o]) => setD({ c: c.data ?? [], m: m.data ?? [], o: o.data ?? [] })); }, []);
  if (!d) return <p>Cargando…</p>;
  const tiles: [string, number | string][] = [
    ["Mensajes recibidos", d.m.filter((x) => x.direction === "in").length], ["Conversaciones abiertas", d.c.filter((x) => !["RESOLVED", "CLOSED"].includes(x.status)).length],
    ["Resueltas", d.c.filter((x) => ["RESOLVED", "CLOSED"].includes(x.status)).length], ["Transferidas a persona", d.c.filter((x) => x.control_mode === "human").length],
    ["Sin respuesta del equipo", d.c.filter((x) => x.status === "WAITING_TEAM").length], ["Mensajes en cola", d.o.filter((x) => x.status === "QUEUED").length],
    ["No enviados / bloqueados", d.o.filter((x) => ["FAILED", "SUPPRESSED", "CANCELLED"].includes(x.status)).length],
    ["Atención humana", d.m.filter((x) => x.direction === "out").length ? Math.round((100 * d.m.filter((x) => x.sender === "humano").length) / d.m.filter((x) => x.direction === "out" && x.sender !== "sistema").length || 0) + "%" : "—"],
  ];
  return (<><PageTitle title="Métricas de atención" subtitle="Datos reales registrados · entregas reales: 0 (WhatsApp sin conectar)" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles.map(([l, v]) => <Card key={l}><p className="text-2xl font-extrabold">{v}</p><p className="text-sm text-muted-foreground">{l}</p></Card>)}</div>
    <p className="mt-3 text-sm text-muted-foreground">Satisfacción, costos e ingresos no se muestran: aún no hay datos reales del proveedor.</p></>);
}

export function WhatsAppAdmin() {
  const [s, setS] = useState<{ q: number; supp: number } | null>(null);
  useEffect(() => { void Promise.all([db.from("outbound_messages").select("id").eq("status", "QUEUED"), db.from("communication_suppressions").select("id")]).then(([q, x]) => setS({ q: (q.data ?? []).length, supp: (x.data ?? []).length })); }, []);
  const rows: [string, string][] = [["Conexión con Meta", "NO CONFIGURADA · faltan cuenta de WhatsApp Business y aprobación"], ["Modo", "DISEÑO (datos de prueba, sin envíos reales)"], ["Recepción de mensajes", "Preparada en la app; se activa al conectar WhatsApp"], ["Envíos automáticos", "Desactivados (módulo «Notificaciones externas»)"], ["Plantillas aprobadas por Meta", "0"], ["Mensajes en cola", String(s?.q ?? "…")], ["Contactos dados de baja", String(s?.supp ?? "…")], ["Horario", "Lun-Sáb 7:00-19:00 (Bogotá)"]];
  return (<><PageTitle title="WhatsApp Business" subtitle="Estado real de la integración" />{rows.map(([k, v]) => <Card key={k} className="mb-2 flex justify-between gap-3"><b>{k}</b><span className="text-right text-sm">{v}</span></Card>)}
    <div className="mt-3 flex flex-wrap gap-2"><Link to={"/admin/plantillas" as never} className="rounded-full bg-accent px-5 py-3 font-bold">Plantillas</Link><Link to={"/admin/ia-conversacional" as never} className="rounded-full bg-accent px-5 py-3 font-bold">Conocimiento del asistente</Link><Link to={"/admin/metricas-comunicacion" as never} className="rounded-full bg-accent px-5 py-3 font-bold">Métricas</Link></div></>);
}

export function conciergePage(path: string): ReactNode | null {
  const p = path.replace(/\/$/, ""); const seg = p.split("/");
  if (seg[1] === "operaciones" && seg[2] === "whatsapp") {
    const x = seg[3];
    if (!x) return <ConversationCenter base="/operaciones/whatsapp" />;
    if (x === "fallos") return <FailedOutbound />;
    if (x in FILTERS) return <ConversationCenter base="/operaciones/whatsapp" filter={x} />;
    return <ConversationCenter base="/operaciones/whatsapp" id={x} />;
  }
  if (seg[1] === "direccion" && seg[2] === "whatsapp") return <ConversationCenter base="/direccion/whatsapp" {...(seg[3] ? { id: seg[3] } : {})} />;
  if (p === "/admin/plantillas" || seg[2] === "plantillas") return <TemplatesAdmin {...(seg[3] ? { id: seg[3] } : {})} />;
  if (p === "/admin/whatsapp" || p === "/admin/comunicaciones") return <WhatsAppAdmin />;
  if (p === "/admin/ia-conversacional") return <KnowledgeAdmin />;
  if (p === "/admin/metricas-comunicacion") return <CommMetrics />;
  if (p === "/admin/traspasos") return <ConversationCenter base="/operaciones/whatsapp" filter="traspasos" />;
  return null;
}

function FailedOutbound() {
  const [rows, setRows] = useState<Out[] | null>(null);
  useEffect(() => { void db.from("outbound_messages").select("*").order("created_at", { ascending: false }).then(({ data }: { data: Out[] | null }) => setRows((data ?? []).filter((o) => ["FAILED", "SUPPRESSED", "CANCELLED"].includes(o.status)))); }, []);
  return (<><PageTitle title="Envíos no realizados" subtitle="Bloqueos por baja, plantilla, ventana o control humano" />
    {!rows ? <p>Cargando…</p> : rows.length ? rows.map((o) => <Card key={o.id} className="mb-2"><div className="flex justify-between"><b>{OUT_ES[o.status] ?? o.status}</b><span className="text-xs text-muted-foreground">{hhmm(o.created_at)}</span></div><p className="text-sm">{o.body}</p><p className="text-xs text-primary">{o.error}</p></Card>) : <Empty title="Sin fallos de envío" />}</>);
}
