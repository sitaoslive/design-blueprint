import { VisitCompletionChecklist } from "./c01";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Inbox, CalendarDays, Users, AlertTriangle, Wallet, Stethoscope, Route as RouteIcon, Database, CheckCircle2, Activity, MessageCircle, Package, Pill } from "lucide-react";
import { useVF, actions, refreshVF, getVF } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { services, zones, type VisitStatus, type VisitStep } from "@/lib/vf/data";
import { formatCOP } from "@/lib/vf/format";
import { PageTitle, SectionTitle, Card, Empty, Btn, StatusBadge, RowLink, MetricTile, Chips } from "../ui";
import { RequestsInbox, RoutesPage, SimulatorPage, ReferralsPage, SpecialistsPage, IncidentsPage, ApprovalsPage, NotificationsPage, OkvetPage, FinancePage, ClientsPage, ReportsPage, TreatmentsPage, InventoryPage, AbsencePage } from "../pages/modules";
import { IntegrationsPage } from "../pages/admin";
import { useRows } from "./useRow";
import { simPage } from "./sim";
void 0;

const input = "w-full rounded-2xl bg-accent p-3";
const Loading = () => <p className="text-muted-foreground" role="status">Cargando…</p>;
const save = async (p: PromiseLike<{ error: { message: string } | null }>, ok: string) => { const { error } = await p; if (error) { toast.error("No se pudo guardar: " + error.message); return false; } toast.success(ok); await refreshVF(); return true; };
const Sub = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => <><PageTitle title={title} subtitle={subtitle ?? ""} /><div className="[&>h1]:hidden">{children}</div></>;

/* ---------- dashboards ---------- */
function OpsHome({ base }: { base: string }) {
  const s = useVF((x) => x);
  const newReq = s.requests.filter((r) => r.status === "nueva").length;
  const pend = s.visits.filter((v) => v.status === "pendiente" || v.status === "pendiente_okvet").length;
  return (<><PageTitle title={base === "/direccion" ? "Dirección" : "Centro de coordinación"} subtitle="Estado real de la operación" />
    <div className="grid grid-cols-2 gap-3">
      <MetricTile icon={Inbox} label="Solicitudes nuevas" value={newReq} to={`${base === "/direccion" ? "/direccion/whatsapp" : "/operaciones/bandeja"}`} />
      <MetricTile icon={CalendarDays} label="Por confirmar" value={pend} tone="sage" to="/operaciones/confirmaciones" />
      <MetricTile icon={Users} label="Equipo disponible" value={s.staff.filter((m) => m.status === "disponible").length} to={`${base}/equipo`} />
      <MetricTile icon={AlertTriangle} label="Incidencias abiertas" value={s.incidents.filter((i) => i.status !== "cerrada").length} tone="sage" to="/operaciones/incidencias" />
      {base === "/direccion" && <MetricTile icon={CheckCircle2} label="Aprobaciones" value={s.approvals.filter((a) => a.status === "pendiente").length} to="/direccion/aprobaciones" />}
      {base === "/direccion" && <MetricTile icon={Wallet} label="Cobrado" value={formatCOP(s.payments.filter((p) => p.status === "pagado").reduce((a, p) => a + p.amount, 0))} tone="sage" to="/direccion/finanzas" />}
    </div>
    <SectionTitle>Requiere atención</SectionTitle>
    {s.incidents.filter((i) => i.status === "abierta").slice(0, 4).map((i) => <RowLink key={i.id} icon={AlertTriangle} to={`/operaciones/incidencias/${i.id}`} label={i.title} />)}
    {s.approvals.filter((a) => a.status === "pendiente").slice(0, 4).map((a) => <RowLink key={a.id} icon={CheckCircle2} to={`${base === "/direccion" ? "/direccion" : "/operaciones"}/${base === "/direccion" ? "aprobaciones" : "aprobaciones-clinicas"}`} label={a.title} tone="sage" />)}</>);
}

/* ---------- requests ---------- */
function RequestDetail({ id }: { id: string }) {
  const r = useVF((s) => s.requests.find((x) => x.id === id));
  if (!r) return <Empty title="Solicitud no encontrada" />;
  return (<><PageTitle title={r.client} subtitle={`${r.channel} · ${r.at}${r.pet ? " · " + r.pet : ""}`}><StatusBadge status={r.status} /></PageTitle>
    <Card><p className="whitespace-pre-line">{r.message}</p>{r.phone && <p className="mt-2 text-sm text-muted-foreground">{r.phone}</p>}</Card>
    <div className="mt-3 flex flex-wrap gap-2">
      {r.status !== "en_gestion" && <Btn variant="soft" onClick={() => actions.setRequestStatus(id, "en_gestion")}>Tomar</Btn>}
      {r.status !== "resuelta" && <Btn onClick={() => actions.setRequestStatus(id, "resuelta")}>Marcar resuelta</Btn>}
      <Link to={"/operaciones/cita-rapida" as never} className="rounded-full bg-sage px-5 py-3 font-bold">Agendar cita</Link>
    </div>
    {r.channel === "WhatsApp" && <p className="mt-3 text-sm text-muted-foreground">Responder desde aquí llega cuando WhatsApp esté conectado.</p>}</>);
}
function RequestList({ base, channel }: { base: string; channel?: string }) {
  const reqs = useVF((s) => s.requests.filter((r) => !channel || r.channel === channel)); const [st, setSt] = useState<"todas" | "nueva" | "en_gestion" | "resuelta">("todas");
  const list = reqs.filter((r) => st === "todas" || r.status === st);
  return (<><PageTitle title={channel ? "Bandeja de WhatsApp" : "Bandeja"} subtitle={`${reqs.filter((r) => r.status === "nueva").length} nuevas`} />
    <div className="mb-3"><Chips value={st} onChange={setSt} options={[{ value: "todas", label: "Todas" }, { value: "nueva", label: "Nuevas" }, { value: "en_gestion", label: "En gestión" }, { value: "resuelta", label: "Resueltas" }]} /></div>
    {list.length ? list.map((r) => <Link key={r.id} to={`${base}/${r.id}` as never} className="mb-2 block"><Card><div className="flex justify-between gap-2"><b>{r.client}</b><StatusBadge status={r.status} /></div><p className="line-clamp-2 text-muted-foreground">{r.message}</p><p className="text-xs text-muted-foreground">{r.channel} · {r.at}</p></Card></Link>) : <Empty title="Sin solicitudes" />}</>);
}

/* ---------- agenda / booking ---------- */
function Agenda({ view }: { view: "dia" | "semana" | "profesionales" }) {
  const visits = useVF((s) => s.visits); const pets = useVF((s) => s.pets); const staff = useVF((s) => s.staff);
  const byDate = visits.reduce<Record<string, typeof visits>>((m, v) => ({ ...m, [v.date]: [...(m[v.date] ?? []), v] }), {});
  const row = (v: (typeof visits)[number]) => <Link key={v.id} to={`/operaciones/citas/${v.id}` as never} className="mb-2 block"><Card className="flex items-center gap-3"><b className="w-14">{v.time}</b><div className="flex-1"><b>{pets.find((p) => p.id === v.petId)?.name} · {v.service}</b><p className="text-sm text-muted-foreground">{staff.find((m) => m.id === v.staffId)?.name ?? "Sin asignar"} · {v.zone}</p></div><StatusBadge status={v.status} /></Card></Link>;
  return (<><PageTitle title={view === "semana" ? "Agenda semanal" : view === "profesionales" ? "Agenda por profesional" : "Agenda"} subtitle={`${visits.length} citas`}><Link to={"/operaciones/cita-rapida" as never} className="font-bold text-primary">Agendar</Link></PageTitle>
    <div className="mb-3 flex gap-2">{(["dia", "semana", "profesionales"] as const).map((k) => <Link key={k} to={(k === "dia" ? "/operaciones/agenda" : `/operaciones/agenda/${k}`) as never} className={`rounded-full px-4 py-2 font-bold ${k === view ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>{k === "dia" ? "Día" : k === "semana" ? "Semana" : "Profesionales"}</Link>)}</div>
    {view === "profesionales" ? staff.map((m) => <div key={m.id}><SectionTitle>{m.name}</SectionTitle>{visits.filter((v) => v.staffId === m.id).map(row)}</div>)
      : view === "semana" ? Object.entries(byDate).map(([d, vs]) => <div key={d}><SectionTitle>{d}</SectionTitle>{vs.map(row)}</div>) : [...visits].sort((a, b) => a.time.localeCompare(b.time)).map(row)}</>);
}
export function QuickBooking() {
  const pets = useVF((s) => s.pets); const staff = useVF((s) => s.staff); const nav = useNavigate();
  const [f, setF] = useState({ q: "", petId: "", service: services[0]!, zone: zones[0]!, date: "", time: "10:00", staffId: "" });
  const found = pets.filter((p) => f.q && (p.name + p.owner).toLowerCase().includes(f.q.toLowerCase()));
  const options = staff.filter((m) => m.status !== "ausente" && (!f.zone || m.zone === f.zone));
  const ok = f.petId && f.date && f.time;
  return (<><PageTitle title="Cita rápida" subtitle="Busca, elige y agenda" />
    <Card className="space-y-3">
      <input className={input} placeholder="Teléfono o nombre" aria-label="Buscar cliente o mascota" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
      {found.length > 0 && <div className="flex flex-wrap gap-2">{found.map((p) => <button key={p.id} onClick={() => setF({ ...f, petId: p.id, q: p.name })} className={`rounded-full px-3 py-1.5 text-sm font-bold ${f.petId === p.id ? "bg-gradient-primary text-primary-foreground" : "bg-accent"}`}>{p.name} · {p.owner}</button>)}</div>}
      <select className={input} aria-label="Mascota" value={f.petId} onChange={(e) => setF({ ...f, petId: e.target.value })}><option value="">Mascota</option>{pets.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.owner}</option>)}</select>
      <select className={input} aria-label="Servicio" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })}>{services.map((s) => <option key={s}>{s}</option>)}</select>
      <select className={input} aria-label="Zona" value={f.zone} onChange={(e) => setF({ ...f, zone: e.target.value })}>{zones.map((z) => <option key={z}>{z}</option>)}</select>
      <div className="grid grid-cols-2 gap-2"><input className={input} aria-label="Fecha" placeholder="Fecha (ej. Mar 28 enero)" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /><input type="time" className={input} aria-label="Hora" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
    </Card>
    <SectionTitle>Opciones disponibles</SectionTitle>
    {options.length ? options.map((m) => <button key={m.id} onClick={() => setF({ ...f, staffId: m.id })} className={`mb-2 flex w-full items-center gap-3 rounded-2xl p-3 text-left ${f.staffId === m.id ? "bg-sage" : "bg-secondary"}`}><img src={m.photo} alt="" className="h-10 w-10 rounded-full object-cover" /><span className="flex-1"><b>{m.name}</b><span className="block text-sm text-muted-foreground">{m.zone} · carga {m.load}%</span></span><StatusBadge status={m.status} /></button>) : <Empty title="Sin profesionales en esta zona" />}
    <div className="mt-3 grid grid-cols-2 gap-2">
      <Btn disabled={!ok} onClick={() => { const id = actions.createVisit({ petId: f.petId, staffId: f.staffId || null, service: f.service, date: f.date, time: f.time, status: f.staffId ? "confirmada" : "pendiente", zone: f.zone, address: "" }); toast.success("Cita creada"); void nav({ to: `/operaciones/citas/${id}` as never }); }}>Crear cita</Btn>
      <Btn variant="outline" disabled={!ok} onClick={() => { actions.createVisit({ petId: f.petId, staffId: f.staffId || null, service: f.service, date: f.date, time: f.time, status: "pendiente_okvet", zone: f.zone, address: "" }); toast.success("Reserva provisional creada"); }}>Reservar provisional</Btn>
    </div></>);
}
const STATUSES: VisitStatus[] = ["pendiente", "confirmada", "pendiente_okvet", "por_iniciar", "en_curso", "revision", "finalizada", "cancelada"];
function VisitOps({ id }: { id: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id)); const pet = useVF((s) => s.pets.find((p) => p.id === v?.petId)); const staff = useVF((s) => s.staff);
  const [d, setD] = useState(v?.date ?? ""); const [t, setT] = useState(v?.time ?? "");
  if (!v) return <Empty title="Cita no encontrada" />;
  return (<><PageTitle title={`${pet?.name ?? ""} · ${v.service}`} subtitle={`${v.date} ${v.time} · ${v.zone}`}><StatusBadge status={v.status} /></PageTitle>
    <Card className="space-y-3"><label className="block"><span className="text-sm font-bold">Profesional</span><select className={input} aria-label="Profesional" value={v.staffId ?? ""} onChange={(e) => e.target.value && actions.assignVisit(id, e.target.value)}><option value="">Sin asignar</option>{staff.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.status}</option>)}</select></label>
      <label className="block"><span className="text-sm font-bold">Estado</span><select className={input} aria-label="Estado" value={v.status} onChange={(e) => actions.setVisitStatus(id, e.target.value as VisitStatus)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label></Card>
    <SectionTitle>Reprogramar</SectionTitle>
    <Card className="grid grid-cols-2 gap-2"><input className={input} aria-label="Nueva fecha" value={d} onChange={(e) => setD(e.target.value)} /><input type="time" className={input} aria-label="Nueva hora" value={t} onChange={(e) => setT(e.target.value)} /><Btn className="col-span-2" disabled={!d || !t} onClick={() => { actions.rescheduleVisit(id, d, t); toast.success("Cita reprogramada"); }}>Guardar cambio</Btn></Card>
    {pet && <div className="mt-3"><Link to={`/operaciones/mascotas/${pet.id}` as never} className="font-bold text-primary">Ver mascota →</Link></div>}</>);
}
function Confirmations({ resched }: { resched?: boolean }) {
  const list = useVF((s) => s.visits.filter((v) => (resched ? v.status === "pendiente" && v.staffId : v.status === "pendiente" || v.status === "pendiente_okvet"))); const pets = useVF((s) => s.pets);
  return (<><PageTitle title={resched ? "Cambios de cita" : "Confirmaciones pendientes"} subtitle={`${list.length} citas`} />
    {list.length ? list.map((v) => <Card key={v.id} className="mb-2"><div className="flex justify-between"><b>{pets.find((p) => p.id === v.petId)?.name} · {v.service}</b><StatusBadge status={v.status} /></div><p className="text-sm text-muted-foreground">{v.date} {v.time} · {v.zone}</p>
      <div className="mt-2 flex gap-2"><Btn onClick={() => actions.setVisitStatus(v.id, "confirmada")}>Confirmar</Btn><Link to={`/operaciones/citas/${v.id}` as never} className="rounded-full bg-accent px-5 py-3 font-bold">Abrir</Link></div></Card>) : <Empty title="Nada pendiente" />}</>);
}

/* ---------- team ---------- */
function TeamList({ base }: { base: string }) {
  const staff = useVF((s) => s.staff); const [f, setF] = useState<"todos" | "disponible" | "en_ruta" | "ausente">("todos");
  return (<><PageTitle title="Equipo" subtitle={`${staff.filter((m) => m.status === "disponible").length} disponibles`} />
    <div className="mb-3"><Chips value={f} onChange={setF} options={[{ value: "todos", label: "Todos" }, { value: "disponible", label: "Disponibles" }, { value: "en_ruta", label: "En ruta" }, { value: "ausente", label: "Ausentes" }]} /></div>
    {staff.filter((m) => f === "todos" || m.status === f).map((m) => <Link key={m.id} to={`${base}/${m.id}` as never} className="mb-2 block"><Card className="flex items-center gap-3"><img src={m.photo} alt="" className="h-14 w-14 rounded-full object-cover" /><div className="flex-1"><b>{m.name}</b><p className="text-sm text-muted-foreground">{m.zone} · próxima {m.nextVisit ?? "—"}</p></div><StatusBadge status={m.status} /></Card></Link>)}</>);
}
function Member({ id }: { id: string }) {
  const m = useVF((s) => s.staff.find((x) => x.id === id)); const visits = useVF((s) => s.visits.filter((v) => v.staffId === id));
  if (!m) return <Empty title="Persona no encontrada" />;
  return (<><PageTitle title={m.name} subtitle={`${m.role} · ${m.zone} · carga ${m.load}%`} />
    <Card><span className="text-sm font-bold">Estado</span><div className="mt-2 flex flex-wrap gap-2">{(["disponible", "en_ruta", "ausente"] as const).map((s) => <Btn key={s} variant={m.status === s ? "primary" : "soft"} onClick={() => actions.setStaffStatus(id, s)}>{s === "en_ruta" ? "En ruta" : s[0]!.toUpperCase() + s.slice(1)}</Btn>)}</div></Card>
    <SectionTitle>Agenda</SectionTitle>{visits.length ? visits.map((v) => <RowLink key={v.id} icon={CalendarDays} to={`/operaciones/citas/${v.id}`} label={`${v.time} · ${v.service}`} />) : <Empty title="Sin visitas asignadas" />}</>);
}
function Availability() {
  const staff = useVF((s) => s.staff); const visits = useVF((s) => s.visits);
  return (<><PageTitle title="Motor de disponibilidad" subtitle="Quién puede tomar una visita ahora" />
    {[...staff].sort((a, b) => a.load - b.load).map((m) => { const n = visits.filter((v) => v.staffId === m.id && v.status !== "finalizada").length; return <Card key={m.id} className="mb-2"><div className="flex justify-between"><b>{m.name}</b><StatusBadge status={m.status} /></div><p className="text-sm text-muted-foreground">{m.zone} · {n} visitas abiertas · carga {m.load}%</p>{m.status === "disponible" && <p className="mt-1 text-sm font-bold text-primary">{Math.max(0, 6 - n)} cupos libres hoy</p>}</Card>; })}</>);
}

/* ---------- routes ---------- */
function RoutesOps({ id, mode }: { id?: string | undefined; mode?: string | undefined }) {
  const staff = useVF((s) => s.staff); const visits = useVF((s) => s.visits); const pets = useVF((s) => s.pets);
  if (id) { const m = staff.find((x) => x.id === id); const vs = visits.filter((v) => v.staffId === id).sort((a, b) => a.time.localeCompare(b.time));
    if (!m) return <Empty title="Ruta no encontrada" />;
    return (<><PageTitle title={`Ruta ${m.zone}`} subtitle={`${m.name} · ${vs.length} paradas`} />{vs.map((v, i) => <Card key={v.id} className="mb-2 flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary font-bold text-primary-foreground">{i + 1}</span><div className="flex-1"><b>{v.time} · {pets.find((p) => p.id === v.petId)?.name}</b><p className="text-sm text-muted-foreground">{v.address || v.zone}</p></div><StatusBadge status={v.status} /></Card>)}</>); }
  if (mode === "planificar" || mode === "optimizar") {
    const unassigned = visits.filter((v) => !v.staffId && v.status !== "cancelada");
    return (<><PageTitle title={mode === "optimizar" ? "Optimizar rutas" : "Planificar rutas"} subtitle={`${unassigned.length} visitas sin profesional`} />
      {unassigned.length ? unassigned.map((v) => { const best = [...staff].filter((m) => m.zone === v.zone && m.status !== "ausente").sort((a, b) => a.load - b.load)[0]; return <Card key={v.id} className="mb-2"><b>{pets.find((p) => p.id === v.petId)?.name} · {v.zone}</b><p className="text-sm text-muted-foreground">Sugerido: {best?.name ?? "nadie disponible en la zona"}</p>{best && <Btn className="mt-2" onClick={() => actions.assignVisit(v.id, best.id)}>Asignar a {best.short || best.name}</Btn>}</Card>; }) : <Empty title="Todas las visitas tienen profesional" />}
      {mode === "optimizar" && <p className="mt-2 text-sm text-muted-foreground">El orden por tiempo de viaje real llega con Google Maps.</p>}</>);
  }
  return (<><PageTitle title="Rutas de hoy" />{staff.filter((m) => visits.some((v) => v.staffId === m.id)).map((m) => <RowLink key={m.id} icon={RouteIcon} to={`/operaciones/rutas/${m.id}`} label={`${m.zone} · ${m.name} · ${visits.filter((v) => v.staffId === m.id).length} paradas`} />)}
    <div className="mt-3 flex gap-3"><Link to={"/operaciones/rutas/planificar" as never} className="font-bold text-primary">Planificar</Link><Link to={"/operaciones/rutas/optimizar" as never} className="font-bold text-primary">Optimizar</Link></div></>);
}

/* ---------- incidents ---------- */
function IncidentDetail({ id }: { id: string }) {
  const i = useVF((s) => s.incidents.find((x) => x.id === id));
  if (!i) return <Empty title="Incidencia no encontrada" />;
  return (<><PageTitle title={i.title} subtitle={`Severidad ${i.severity} · ${i.owner}`}><StatusBadge status={i.status} /></PageTitle><Card><p>{i.detail || "Sin detalle"}</p></Card>
    <div className="mt-3 flex gap-2">{(["abierta", "en_gestion", "cerrada"] as const).map((s) => <Btn key={s} variant={i.status === s ? "primary" : "soft"} onClick={() => actions.setIncidentStatus(id, s)}>{s === "en_gestion" ? "En gestión" : s[0]!.toUpperCase() + s.slice(1)}</Btn>)}</div></>);
}
export function IncidentList({ filter, title }: { filter?: string; title: string }) {
  const inc = useVF((s) => s.incidents.filter((i) => !filter || (i.title + i.detail).toLowerCase().includes(filter) || (filter === "alta" && i.severity === "alta")));
  const [t, setT] = useState(""); const [d, setD] = useState("");
  return (<><PageTitle title={title} subtitle={`${inc.filter((i) => i.status !== "cerrada").length} abiertas`} />
    <Card className="mb-3 space-y-2"><input className={input} placeholder="Título" aria-label="Título" value={t} onChange={(e) => setT(e.target.value)} /><input className={input} placeholder="Detalle" aria-label="Detalle" value={d} onChange={(e) => setD(e.target.value)} /><Btn className="w-full" disabled={!t.trim()} onClick={() => { actions.addIncident(filter && filter !== "alta" ? `${filter[0]!.toUpperCase()}${filter.slice(1)}: ${t.trim()}` : t.trim(), d); setT(""); setD(""); toast.success("Registrada"); }}>Registrar</Btn></Card>
    {inc.length ? inc.map((i) => <Link key={i.id} to={`/operaciones/incidencias/${i.id}` as never} className="mb-2 block"><Card className="flex justify-between"><div><b>{i.title}</b><p className="text-sm text-muted-foreground">{i.severity} · {i.owner}</p></div><StatusBadge status={i.status} /></Card></Link>) : <Empty title="Sin registros" />}</>);
}

/* ---------- specialists & referrals ---------- */
type Spec = { id: string; name: string; specialty: string; city: string; user_id: string | null };
export function SpecialistAdmin() {
  const { rows, run } = useRows<Spec>("specialists", "name");
  const [profiles, setProfiles] = useState<{ id: string; display_name: string }[]>([]);
  const [f, setF] = useState({ name: "", specialty: "", city: "Bogotá" });
  useEffect(() => { void db.from("profiles").select("id, display_name").then(({ data }: { data: typeof profiles | null }) => setProfiles(data ?? [])); }, []);
  const link = async (s: Spec, uid: string) => {
    await run(db.from("specialists").update({ user_id: uid || null }).eq("id", s.id), uid ? "Cuenta vinculada" : "Vínculo retirado");
    if (uid) { const { error } = await db.from("user_roles").insert({ user_id: uid, role: "especialista" }); if (error && !error.message.includes("duplicate")) toast.error(error.message); }
    await refreshVF();
  };
  return (<><PageTitle title="Especialistas" subtitle="Red externa y acceso al portal" />
    {!rows ? <Loading /> : rows.map((s) => <Card key={s.id} className="mb-2"><Link to={`/operaciones/especialistas/${s.id}` as never} className="font-bold">{s.name}</Link><p className="text-sm text-muted-foreground">{s.specialty} · {s.city}</p>
      <label className="mt-2 block text-sm font-bold">Cuenta en el portal<select className={input} aria-label={`Cuenta de ${s.name}`} value={s.user_id ?? ""} onChange={(e) => void link(s, e.target.value)}><option value="">Sin vincular</option>{profiles.map((p) => <option key={p.id} value={p.id}>{p.display_name || p.id.slice(0, 8)}</option>)}</select></label></Card>)}
    <SectionTitle>Agregar especialista</SectionTitle>
    <Card className="space-y-2"><input className={input} placeholder="Nombre" aria-label="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /><input className={input} placeholder="Especialidad" aria-label="Especialidad" value={f.specialty} onChange={(e) => setF({ ...f, specialty: e.target.value })} /><input className={input} placeholder="Ciudad" aria-label="Ciudad" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
      <Btn className="w-full" disabled={!f.name.trim() || !f.specialty.trim()} onClick={() => { void run(db.from("specialists").insert(f), "Especialista agregado").then(() => refreshVF()); setF({ name: "", specialty: "", city: "Bogotá" }); }}>Agregar</Btn></Card>
    <p className="mt-3 text-sm text-muted-foreground">Al vincular una cuenta, la persona recibe el perfil Especialista y solo ve las remisiones asignadas a su nombre.</p></>);
}
function SpecialistDetail({ id, slots }: { id: string; slots?: boolean }) {
  const s = useVF((x) => x.specialists.find((y) => y.id === id) as Spec | undefined); const refs = useVF((x) => x.referrals.filter((r) => r.specialist === s?.name));
  const { rows } = useRows<{ id: string; day: string; time: string; user_id: string }>("specialist_slots");
  if (!s) return <Empty title="Especialista no encontrado" />;
  const mine = (rows ?? []).filter((r) => r.user_id === s.user_id);
  return (<><PageTitle title={s.name} subtitle={`${s.specialty} · ${s.city}`} />
    {!slots && <><SectionTitle>Remisiones asignadas</SectionTitle>{refs.length ? refs.map((r) => <RowLink key={r.id} icon={Stethoscope} to={`/operaciones/remisiones/${r.id}`} label={`${r.pet} · ${r.status}`} />) : <Empty title="Sin remisiones" />}</>}
    <SectionTitle>Horarios ofrecidos</SectionTitle>{!s.user_id ? <Empty title="Cuenta no vinculada" hint="Vincúlala en Especialistas." /> : !rows ? <Loading /> : mine.length ? mine.map((r) => <Card key={r.id} className="mb-2"><b>{r.day} · {r.time}</b></Card>) : <Empty title="Sin horarios publicados" />}
    {!slots && <div className="mt-3"><Link to={`/operaciones/especialistas/${id}/disponibilidad` as never} className="font-bold text-primary">Ver disponibilidad →</Link></div>}</>);
}
function Agreements() {
  const { rows } = useRows<{ key: string; value: Record<string, string> }>("org_settings", "key");
  const specs = useVF((s) => s.specialists);
  const conv = rows?.find((r) => r.key === "convenios")?.value ?? {};
  const [draft, setDraft] = useState<Record<string, string> | null>(null); const cur = draft ?? conv;
  return (<><PageTitle title="Convenios" subtitle="Condiciones con cada especialista" />
    <Card className="space-y-2">{specs.map((s) => <label key={s.id} className="block"><span className="text-sm font-bold">{s.name}</span><input className={input} aria-label={`Convenio ${s.name}`} placeholder="Ej. 15% descuento, respuesta 48 h" value={cur[s.name] ?? ""} onChange={(e) => setDraft({ ...cur, [s.name]: e.target.value })} /></label>)}
      <Btn className="w-full" disabled={!draft} onClick={() => { void save(db.from("org_settings").upsert({ key: "convenios", value: cur }), "Convenios guardados"); setDraft(null); }}>Guardar</Btn></Card></>);
}
function NewReferral({ back }: { back: string }) {
  const pets = useVF((s) => s.pets); const [f, setF] = useState({ pet: "", specialty: "" }); const nav = useNavigate();
  return (<><PageTitle title="Nueva remisión" /><Card className="space-y-3"><select className={input} aria-label="Mascota" value={f.pet} onChange={(e) => setF({ ...f, pet: e.target.value })}><option value="">Mascota</option>{pets.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.owner}</option>)}</select>
    <input className={input} placeholder="Especialidad (ej. Cardiología)" aria-label="Especialidad" value={f.specialty} onChange={(e) => setF({ ...f, specialty: e.target.value })} />
    <Btn className="w-full" disabled={!f.pet || !f.specialty.trim()} onClick={async () => { const p = pets.find((x) => x.id === f.pet)!; if (await save(db.from("referrals").insert({ pet_id: p.id, pet: p.name, specialty: f.specialty.trim() }), "Remisión creada")) void nav({ to: back as never }); }}>Crear remisión</Btn></Card></>);
}
function ReferralOps({ id, tab }: { id: string; tab?: string | undefined }) {
  const r = useVF((s) => s.referrals.find((x) => x.id === id)); const specs = useVF((s) => s.specialists.filter((x) => x.specialty === r?.specialty) as Spec[]);
  const { rows: reports } = useRows<{ id: string; title: string; body: string; referral_id: string | null }>("specialist_reports");
  if (!r) return <Empty title="Remisión no encontrada" />;
  const tabs = [["", "Resumen"], ["opciones", "Opciones"], ["horarios", "Horarios"], ["confirmacion", "Confirmación"], ["documentos", "Documentos"], ["seguimiento", "Seguimiento"]];
  return (<><PageTitle title={`${r.pet} · ${r.specialty}`} subtitle={r.specialist ?? "Sin especialista"}><StatusBadge status={r.status} /></PageTitle>
    <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1">{tabs.map(([k, l]) => <Link key={k} to={`/operaciones/remisiones/${id}${k ? "/" + k : ""}` as never} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${(tab ?? "") === k ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>{l}</Link>)}</div>
    {(!tab || tab === "opciones" || tab === "horarios") && (specs.length ? specs.map((s) => <Card key={s.id} className="mb-2 flex items-center justify-between"><div><b>{s.name}</b><p className="text-sm text-muted-foreground">{s.city}</p></div><Btn variant={r.specialist === s.name ? "primary" : "soft"} onClick={() => actions.resolveReferral(id, s.name)}>{r.specialist === s.name ? "Asignado" : "Asignar"}</Btn></Card>) : <Empty title="No hay especialistas de esta especialidad" hint="Agrégalos en Especialistas." />)}
    {tab === "confirmacion" && <Card><p>{r.specialist ? `Agendada con ${r.specialist}.` : "Asigna un especialista primero."}</p>{r.specialist && r.status !== "cerrada" && <Btn className="mt-2" onClick={() => void save(db.from("referrals").update({ status: "cerrada" }).eq("id", id), "Remisión cerrada")}>Cerrar remisión</Btn>}</Card>}
    {(tab === "documentos" || tab === "seguimiento") && (!reports ? <Loading /> : reports.filter((x) => x.referral_id === id).length ? reports.filter((x) => x.referral_id === id).map((x) => <Card key={x.id} className="mb-2"><b>{x.title}</b><p className="whitespace-pre-line text-sm">{x.body}</p></Card>) : <Empty title="Sin informes del especialista" />)}</>);
}
function StalledReferrals() {
  const refs = useVF((s) => s.referrals.filter((r) => r.status === "por_resolver"));
  return (<><PageTitle title="Remisiones estancadas" subtitle={`${refs.length} sin especialista`} />{refs.length ? refs.map((r) => <RowLink key={r.id} icon={Stethoscope} to={`/operaciones/remisiones/${r.id}/opciones`} label={`${r.pet} · ${r.specialty}`} />) : <Empty title="Ninguna estancada" />}</>);
}

/* ---------- simulator ---------- */
function SimHistory() {
  const audit = useVF((s) => s.audit.filter((a) => /Simul|asignada|ausencia/i.test(a.action)));
  return (<><PageTitle title="Historial de simulaciones" subtitle="Cambios aplicados desde escenarios" />{audit.length ? audit.map((a) => <Card key={a.id} className="mb-2"><b>{a.action}</b><p className="text-sm text-muted-foreground">{a.at}</p></Card>) : <Empty title="Sin cambios aplicados todavía" />}</>);
}
function SimScenario({ id, tab }: { id: string; tab?: string | undefined }) {
  const staff = useVF((s) => s.staff); const out = staff.find((m) => m.id === id) ?? staff[0]; const visits = useVF((s) => s.visits.filter((v) => v.staffId === out?.id && v.status !== "finalizada")); const pets = useVF((s) => s.pets);
  const alt = staff.filter((m) => m.id !== out?.id && m.status !== "ausente").sort((a, b) => a.load - b.load);
  const plan = visits.map((v, i) => ({ v, to: alt.find((m) => m.zone === v.zone) ?? alt[i % Math.max(1, alt.length)] }));
  const tabs = [["", "Escenario"], ["comparar", "Comparar"], ["impacto", "Impacto"], ["antes-despues", "Antes/después"], ["aprobaciones", "Aprobación"], ["ejecucion", "Ejecutar"], ["incidencias", "Incidencias"]];
  return (<><PageTitle title={`Si ${out?.name ?? "—"} se ausenta`} subtitle={`${visits.length} visitas afectadas`} />
    <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1">{tabs.map(([k, l]) => <Link key={k} to={`/operaciones/simulador/${id}${k ? "/" + k : ""}` as never} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${(tab ?? "") === k ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>{l}</Link>)}</div>
    {(!tab || tab === "comparar" || tab === "antes-despues") && plan.map(({ v, to }) => <Card key={v.id} className="mb-2"><b>{v.time} · {pets.find((p) => p.id === v.petId)?.name}</b><p className="text-sm text-muted-foreground">Antes: {out?.name} → Después: {to?.name ?? "sin reemplazo"}</p></Card>)}
    {tab === "impacto" && <Card><p>{alt.length} personas absorben {visits.length} visitas.</p>{alt.map((m) => <p key={m.id} className="text-sm">{m.name}: carga {m.load}% → {Math.min(100, m.load + plan.filter((p) => p.to?.id === m.id).length * 10)}%</p>)}</Card>}
    {tab === "aprobaciones" && <Btn onClick={() => void save(db.from("approvals").insert({ title: `Reorganizar visitas de ${out?.name}`, detail: `${visits.length} visitas a reasignar`, kind: "reorganizacion" }), "Enviado a aprobación de Luis")}>Solicitar aprobación</Btn>}
    {tab === "ejecucion" && <Btn disabled={!plan.length} onClick={() => { plan.forEach(({ v, to }) => to && actions.assignVisit(v.id, to.id)); if (out) actions.setStaffStatus(out.id, "ausente"); toast.success("Escenario aplicado"); }}>Aplicar reasignación</Btn>}
    {tab === "incidencias" && <IncidentList filter="simulación" title="Incidencias del escenario" />}
    {!tab && <><SectionTitle>Otro escenario</SectionTitle>{staff.map((m) => <RowLink key={m.id} icon={Users} to={`/operaciones/simulador/${m.id}`} label={m.name} />)}</>}</>);
}

/* ---------- OKVET ---------- */
function OkvetSub({ tab }: { tab: string }) {
  const pend = useVF((s) => s.visits.filter((v) => v.status === "pendiente_okvet")); const pets = useVF((s) => s.pets);
  const T: Record<string, string> = { importar: "Importar desde OKVET", mapeo: "Mapeo de campos", "vista-previa": "Vista previa", conciliar: "Conciliar citas", conflictos: "Conflictos", historial: "Historial de sincronización" };
  return (<><PageTitle title={T[tab] ?? "OKVET"} subtitle="Conector registrado · sin credenciales todavía" />
    {(tab === "conciliar" || tab === "conflictos" || tab === "vista-previa") ? (pend.length ? pend.map((v) => <Card key={v.id} className="mb-2"><b>{pets.find((p) => p.id === v.petId)?.name} · {v.service}</b><p className="text-sm text-muted-foreground">{v.date} {v.time} · pendiente de OKVET</p>{tab === "conciliar" && <Btn className="mt-2" onClick={() => actions.setVisitStatus(v.id, "confirmada")}>Marcar conciliada</Btn>}</Card>) : <Empty title="Nada pendiente con OKVET" />)
      : tab === "mapeo" ? <Card className="space-y-1 text-sm">{[["Mascota", "patient"], ["Propietario", "client"], ["Cita", "appointment"], ["Profesional", "doctor"]].map(([a, b]) => <p key={a}><b>{a}</b> → {b}</p>)}</Card>
      : <Card><p>La importación y el historial se activan cuando OKVET entregue credenciales y documentación.</p></Card>}</>);
}

/* ---------- direction extras ---------- */
function AssistantLog({ approvals }: { approvals?: boolean }) {
  const chat = useVF((s) => s.chat);
  const list = approvals ? chat.filter((m) => m.proposal) : chat;
  return (<><PageTitle title={approvals ? "Propuestas del asistente" : "Historial del asistente"} subtitle={`${list.length} mensajes`}><Link to={"/luis/asistente" as never} className="font-bold text-primary">Abrir chat</Link></PageTitle>
    {list.length ? list.map((m) => <Card key={m.id} className="mb-2"><p className="text-xs font-bold text-muted-foreground">{m.from === "user" ? "Tú" : "Asistente"}</p><p>{m.text}</p>
      {m.proposal && <div className="mt-2 rounded-2xl bg-card p-3"><b>{m.proposal.title}</b><p className="text-sm">{m.proposal.effects}</p><StatusBadge status={m.proposal.status === "propuesta" ? "pendiente" : m.proposal.status === "aprobada" ? "confirmada" : "cancelada"} />
        {m.proposal.status === "propuesta" && <div className="mt-2 flex gap-2"><Btn onClick={() => actions.setProposal(m.id, "aprobada")}>Aprobar</Btn><Btn variant="soft" onClick={() => actions.setProposal(m.id, "rechazada")}>Rechazar</Btn></div>}</div>}</Card>) : <Empty title="Sin mensajes" />}</>);
}
function DailyReport({ weekly }: { weekly?: boolean }) {
  const s = useVF((x) => x);
  const done = s.visits.filter((v) => v.status === "finalizada").length; const paid = s.payments.filter((p) => p.status === "pagado").reduce((a, p) => a + p.amount, 0);
  return (<><PageTitle title={weekly ? "Informe semanal" : "Informe diario"} subtitle="Generado con los datos actuales" />
    <div className="grid grid-cols-2 gap-2">{[["Visitas", s.visits.length], ["Finalizadas", done], ["Solicitudes", s.requests.length], ["Incidencias", s.incidents.length]].map(([l, v]) => <Card key={l as string}><p className="text-sm text-muted-foreground">{l}</p><b className="text-2xl">{v}</b></Card>)}</div>
    <Card className="mt-3"><p className="text-sm text-muted-foreground">Cobrado</p><b className="text-2xl">{formatCOP(paid)}</b></Card>
    <SectionTitle>Últimas acciones</SectionTitle>{s.audit.slice(0, weekly ? 30 : 10).map((a) => <Card key={a.id} className="mb-2"><b>{a.action}</b><p className="text-xs text-muted-foreground">{a.at}</p></Card>)}</>);
}

/* ---------- team (equipo) visit flow ---------- */
export const FLOW: Record<string, { title: string; step: VisitStep; next: string }> = {
  preparacion: { title: "Preparación", step: "programada", next: "Salir hacia la visita" }, llegada: { title: "Check-in y llegada", step: "llegada", next: "Registrar llegada" },
  registro: { title: "Registro de atención", step: "en_atencion", next: "Iniciar atención" }, cierre: { title: "Finalizar visita", step: "finalizada", next: "Finalizar visita" },
};
export const KIT = ["Termómetro", "Guantes", "Jeringas", "Vacunas según agenda", "Gasas y antiséptico"];
export function StaffVisit({ id, tab, base = "/equipo" }: { id: string; tab?: string | undefined; base?: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id)); const pet = useVF((s) => s.pets.find((p) => p.id === v?.petId)); const [note, setNote] = useState("");
  if (!v) return <Empty title="Visita no encontrada" />;
  const f = tab ? FLOW[tab] : undefined;
  const tabs = ["preparacion", "llegada", "registro", "cierre"];
  return (<><PageTitle title={`${pet?.name ?? ""} · ${v.service}`} subtitle={`${v.time} · ${v.address || v.zone}`}><StatusBadge status={v.status} /></PageTitle>
    <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1">{tabs.map((k) => <Link key={k} to={`${base}/visitas/${id}/${k}` as never} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${tab === k ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>{FLOW[k]!.title}</Link>)}</div>
    {pet && <Card className="mb-3"><b>Alergias:</b> {pet.allergies}</Card>}
    {tab === "preparacion" && <div className="space-y-2">{KIT.map((k) => { const on = v.prep.includes(k); return <button key={k} aria-pressed={on} onClick={() => actions.togglePrep(id, k)} className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left ${on ? "bg-sage font-bold" : "bg-secondary"}`}><CheckCircle2 className="h-5 w-5" />{k}</button>; })}<Btn className="w-full" onClick={() => actions.advanceStep(id, "en_desplazamiento")}>Salir hacia la visita</Btn></div>}
    {tab === "registro" && <Card className="mb-3 space-y-2"><textarea rows={4} className={input} aria-label="Notas operativas" placeholder="Notas operativas (sin diagnóstico clínico; eso va en OKVET)" value={note} onChange={(e) => setNote(e.target.value)} /><Btn variant="soft" disabled={!note.trim()} onClick={() => { actions.addIncident(`Nota de visita ${pet?.name ?? ""}`, note.trim()); setNote(""); toast.success("Nota guardada"); }}>Guardar nota</Btn></Card>}
    {f && tab !== "preparacion" && <Btn className="w-full" disabled={v.step === f.step} onClick={() => { actions.advanceStep(id, f.step); toast.success(f.title); }}>{v.step === f.step ? "Hecho" : f.next}</Btn>}
    {tab === "cierre" && <VisitCompletionChecklist visitId={id} base={base} />}
    {!tab && <Card><p>Paso actual: <b>{v.step}</b></p><Link to={`${base}/visitas/${id}/preparacion` as never} className="mt-2 inline-block font-bold text-primary">Empezar flujo →</Link></Card>}</>);
}
export function StaffDay({ agenda, base = "/equipo" }: { agenda?: boolean; base?: string }) {
  const uid = useVF((s) => s.userId); const staff = useVF((s) => s.staff); const me = staff.find((m) => (m as { userId?: string }).userId === uid);
  const visits = useVF((s) => s.visits.filter((v) => (me ? v.staffId === me.id : true) && (agenda || v.status !== "finalizada"))); const pets = useVF((s) => s.pets); const allTasks = useVF((s) => s.tasks); const tasks = allTasks.filter((t) => !t.done && (me ? t.staffId === me.id : true));
  return (<><PageTitle title={agenda ? "Mi agenda" : "Mi jornada"} subtitle={me ? me.name : "Vista general del equipo"} />
    {!agenda && <div className="mb-3 grid grid-cols-2 gap-3"><MetricTile icon={CalendarDays} label="Visitas" value={visits.length} to={`${base}/agenda`} /><MetricTile icon={CheckCircle2} label="Tareas" value={tasks.length} tone="sage" to={`${base}/tareas`} /></div>}
    {visits.length ? [...visits].sort((a, b) => a.time.localeCompare(b.time)).map((v) => <Link key={v.id} to={`${base}/visitas/${v.id}` as never} className="mb-2 block"><Card className="flex items-center gap-3"><b className="w-14">{v.time}</b><div className="flex-1"><b>{pets.find((p) => p.id === v.petId)?.name} · {v.service}</b><p className="text-sm text-muted-foreground">{v.date} · {v.address || v.zone}</p></div><StatusBadge status={v.status} /></Card></Link>) : <Empty title="Sin visitas asignadas" />}</>);
}
function StaffTask({ id }: { id: string }) {
  const t = useVF((s) => s.tasks.find((x) => x.id === id));
  if (!t) return <Empty title="Tarea no encontrada" />;
  return (<><PageTitle title={t.title} subtitle={t.done ? "Hecha" : "Pendiente"} /><Btn onClick={() => actions.toggleTask(id)}>{t.done ? "Reabrir" : "Marcar hecha"}</Btn></>);
}
function TreatmentDetail({ id }: { id: string }) {
  const t = useVF((s) => s.treatments.find((x) => x.id === id));
  const clinical = useVF((s) => s.roles.some((r) => ["veterinario", "luis", "administrador"].includes(r)));
  if (!t) return <Empty title="Tratamiento no encontrado" />;
  return (<><PageTitle title={`${t.pet} · ${t.plan}`} subtitle={`${t.frequency} · ${t.responsible}`} /><Card><p className="text-3xl font-bold">{t.done}/{t.total}</p><p className="text-muted-foreground">dosis aplicadas</p>
    {!clinical ? <p className="mt-3 text-sm text-muted-foreground">Solo el veterinario registra dosis o cambia el tratamiento.</p> : <Btn className="mt-3" disabled={t.done >= t.total} onClick={() => void save(db.from("treatments").update({ done: t.done + 1 }).eq("id", id), "Dosis registrada")}>Registrar dosis</Btn>}</Card></>);
}
function CourseLesson({ id }: { id: string }) {
  const c = useVF((s) => s.courses.find((x) => x.id === id));
  if (!c) return <Empty title="Lección no encontrada" />;
  return (<><PageTitle title={c.title} subtitle={`${c.role}${c.required ? " · Obligatorio" : ""}`} /><Card><div className="h-3 overflow-hidden rounded-full bg-card"><div className="h-full bg-gradient-primary" style={{ width: `${c.progress}%` }} /></div><p className="mt-2">{c.progress}% completado</p><Btn className="mt-3" disabled={c.progress >= 100} onClick={() => actions.progressCourse(id)}>Completar siguiente lección</Btn></Card></>);
}
function StaffReferrals({ id }: { id?: string | undefined }) {
  const refs = useVF((s) => s.referrals);
  if (id) { const r = refs.find((x) => x.id === id); if (!r) return <Empty title="Remisión no encontrada" />; return (<><PageTitle title={`${r.pet} · ${r.specialty}`} subtitle={r.specialist ?? "Sin especialista"}><StatusBadge status={r.status} /></PageTitle><Card><p>Coordinación asigna el especialista y te avisa.</p></Card></>); }
  return <ReferralsPage />;
}

/** Dedicated pages for operations, direction and team screens. */
export function opsPage(path: string): ReactNode | null {
  const [area, a = "", b, c] = path.replace(/\/$/, "").split("/").slice(1);
  if (area === "operaciones") {
    switch (a) {
      case "inicio": return <OpsHome base="/operaciones" />;
      case "bandeja": case "solicitudes": return b ? <RequestDetail id={b} /> : <RequestList base={`/operaciones/${a}`} />;
      case "whatsapp": return b ? <RequestDetail id={b} /> : <RequestList base="/operaciones/whatsapp" channel="WhatsApp" />;
      case "agenda": return <Agenda view={b === "semana" ? "semana" : b === "profesionales" ? "profesionales" : "dia"} />;
      case "disponibilidad": return <Availability />;
      case "cita-rapida": return <QuickBooking />;
      case "citas": return b ? <VisitOps id={b} /> : null;
      case "confirmaciones": return <Confirmations />;
      case "reprogramaciones": return <Confirmations resched />;
      case "equipo": return b ? <Member id={b} /> : <TeamList base="/operaciones/equipo" />;
      case "ausencias": return <AbsencePage />;
      case "reemplazos": case "aprobaciones-clinicas": return <ApprovalsPage />;
      case "rutas": return <RoutesOps id={b && b !== "planificar" && b !== "optimizar" ? b : undefined} mode={b} />;
      case "retrasos": return <IncidentList filter="retraso" title="Retrasos" />;
      case "urgencias": return <IncidentList filter="alta" title="Coordinación prioritaria" />;
      case "contingencias": return <IncidentList filter="contingencia" title="Contingencias" />;
      case "simulador": return simPage("/operaciones/simulador", b, c);
      case "especialistas": if (b === "convenios") return <Agreements />; return b ? <SpecialistDetail id={b} slots={c === "disponibilidad"} /> : <SpecialistAdmin />;
      case "remisiones": if (!b) return <ReferralsPage />; if (b === "nueva") return <NewReferral back="/operaciones/remisiones" />; if (b === "estancadas") return <StalledReferrals />; return <ReferralOps id={b} tab={c} />;
      case "resultados-pendientes": return <OkvetSub tab="conciliar" />;
      case "okvet": return b ? <OkvetSub tab={b} /> : <OkvetPage />;
      case "incidencias": return b ? <IncidentDetail id={b} /> : <IncidentsPage />;
      case "quejas": return <IncidentList filter="queja" title="Quejas" />;
      case "seguimientos": return <TreatmentsPage />;
      case "calidad": return <IncidentList title="Calidad del servicio" />;
      case "cierre-turno": return <DailyReport />;
      case "clientes": return b ? null : <ClientsPage />;
    }
  }
  if (area === "direccion") {
    switch (a) {
      case "inicio": return <OpsHome base="/direccion" />;
      case "excepciones": case "aprobaciones": case "decisiones": return <ApprovalsPage />;
      case "agenda": return <Agenda view="dia" />;
      case "equipo": return b ? <Member id={b} /> : <TeamList base="/direccion/equipo" />;
      case "rutas": return <RoutesPage />;
      case "whatsapp": return <RequestInboxWrap />;
      case "clientes": return <ClientsPage />;
      case "remisiones": return <ReferralsPage />;
      case "especialistas": return <SpecialistAdmin />;
      case "simulaciones": return simPage("/direccion/simulaciones", b, c);
      case "finanzas": return <FinancePage />;
      case "rentabilidad": return <FinancePage />;
      case "reportes": return <DailyReport weekly={b === "semanal"} />;
      case "modo-ausencia": return <AbsencePage />;
      case "asistente": return <AssistantLog approvals={b === "aprobaciones"} />;
      case "configuracion": return <IntegrationsPage />;
    }
  }
  if (area === "equipo") {
    switch (a) {
      case "hoy": return <StaffDay />;
      case "agenda": return <StaffDay agenda />;
      case "visitas": return b ? <StaffVisit id={b} tab={c} /> : null;
      case "tareas": return b ? <StaffTask id={b} /> : null;
      case "remisiones": if (b === "nueva" && !getVF().roles.some((r) => r !== "auxiliar")) return <Empty title="Solo veterinarios y coordinación crean remisiones" />; return b === "nueva" ? <NewReferral back="/equipo/remisiones" /> : <StaffReferrals id={b} />;
      case "tratamientos": return b ? <TreatmentDetail id={b} /> : null;
      case "insumos": case "kit": return <InventoryPage />;
      case "incidencias": return b === "nueva" ? <IncidentList title="Reportar incidencia" /> : null;
      case "mensajes": return <NotificationsPage />;
      case "academia": return b ? <CourseLesson id={b} /> : null;
    }
  }
  return null;
}
function RequestInboxWrap() { return <RequestsInbox base="/direccion/whatsapp" />; }
void ReportsPage; void SimHistory; void SimScenario; void SimulatorPage; void Sub; void MessageCircle; void Package; void Pill; void Database; void Activity;
