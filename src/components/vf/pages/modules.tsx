import { usePets } from "@/lib/vf/store";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { MessageCircle, Phone, Globe, MapPin, Navigation, AlertTriangle, CheckCircle2, XCircle, Plus, Minus, Route as RouteIcon, Wallet, Users, FileText, Database, GraduationCap, Settings, Pill, Package, Shuffle, ShieldCheck, Activity, Stethoscope, BarChart3, ClipboardList, Bell, Inbox, CalendarClock } from "lucide-react";
import { useVF, actions } from "@/lib/vf/store";
import { formatCOP } from "@/lib/vf/format";
import { validateAbsence } from "@/lib/vf/rules";
import { PageTitle, SectionTitle, StatusBadge, Btn, Card, RowLink, Empty, Chips } from "../ui";
import { KitInventory } from "@/features/field-operations/components/FieldExtras";

const chIcon = { WhatsApp: MessageCircle, Llamada: Phone, Portal: Globe };

export function RequestsInbox({ base }: { base: string }) {
  const [f, setF] = useState<"nueva" | "en_gestion" | "resuelta">("nueva");
  const reqs = useVF((s) => s.requests.filter((r) => r.status === f));
  return (<>
    <PageTitle title="Solicitudes" subtitle="Bandeja unificada de canales" />
    <Chips value={f} onChange={setF} options={[{ value: "nueva", label: "Nuevas" }, { value: "en_gestion", label: "En gestión" }, { value: "resuelta", label: "Resueltas" }]} />
    <div className="mt-4 space-y-3">
      {reqs.length === 0 && <Empty title="Bandeja al día" />}
      {reqs.map((r) => { const I = chIcon[r.channel]; return (
        <Card key={r.id}>
          <div className="flex items-start gap-3"><I className="mt-1 h-6 w-6 text-primary" /><div className="flex-1"><b className="text-lg">{r.client}</b> · {r.pet}<p className="text-muted-foreground">{r.message}</p><p className="text-sm text-muted-foreground">{r.channel} · {r.at} · {r.phone}</p></div><StatusBadge status={r.status} /></div>
          <div className="mt-3 flex gap-2">
            {r.status === "nueva" && <Btn variant="soft" onClick={() => actions.setRequestStatus(r.id, "en_gestion")}>Tomar</Btn>}
            <Link to={`${base}/nueva-cita` as never} className="rounded-full bg-sage px-5 py-3 font-bold">Agendar</Link>
            {r.status !== "resuelta" && <Btn variant="outline" onClick={() => { actions.setRequestStatus(r.id, "resuelta"); toast.success("Solicitud resuelta"); }}>Resolver</Btn>}
          </div>
        </Card>); })}
    </div>
  </>);
}

export function RoutesPage() {
  const pets = usePets();
  const visits = useVF((s) => s.visits); const staff = useVF((s) => s.staff);
  const routes = staff.filter((s) => s.status !== "ausente").map((s) => ({ s, stops: visits.filter((v) => v.staffId === s.id && v.date.startsWith("Mar")) }));
  return (<>
    <PageTitle title="Rutas de hoy" subtitle="Orden sugerido por zona y hora" />
    {routes.map(({ s, stops }) => (
      <Card key={s.id} className="mb-3">
        <div className="mb-2 flex items-center justify-between"><b className="text-lg">Ruta {s.zone.replace("Zona ", "")} · {s.name}</b><StatusBadge status={s.status === "en_ruta" ? "en_curso" : "por_iniciar"} /></div>
        {stops.length === 0 ? <p className="text-muted-foreground">Sin paradas</p> : stops.sort((a, b) => a.time.localeCompare(b.time)).map((v, i) => (
          <div key={v.id} className="flex items-center gap-3 border-t border-border py-2"><span className="grid h-8 w-8 place-items-center rounded-full bg-accent font-bold text-primary">{i + 1}</span><span className="flex-1">{v.time} · {pets.find((p) => p.id === v.petId)?.name} · {v.address}</span></div>
        ))}
        <Btn variant="sage" className="mt-2" onClick={() => toast.success("Ruta publicada al profesional")}><RouteIcon className="h-5 w-5" />Publicar ruta</Btn>
      </Card>
    ))}
    <p className="text-sm text-muted-foreground">Optimización automática con mapas: pendiente de integración (registrada).</p>
  </>);
}

export function SimulatorPage() {
  const [vet, setVet] = useState("sofia"); const visits = useVF((s) => s.visits); const staff = useVF((s) => s.staff);
  const affected = visits.filter((v) => v.staffId === vet);
  const alt = staff.filter((s) => s.id !== vet && s.status !== "ausente");
  return (<>
    <PageTitle title="Simulador" subtitle="¿Qué pasa si…? Sin modificar la agenda real" />
    <label className="mb-4 block">Si se ausenta:
      <select value={vet} onChange={(e) => setVet(e.target.value)} className="mt-1 w-full rounded-2xl bg-accent p-3 text-lg">{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
    </label>
    <Card><p className="text-lg"><b>{affected.length}</b> visitas afectadas · <b>{alt.length}</b> profesionales pueden cubrir</p>
      {affected.map((v) => <p key={v.id} className="text-muted-foreground">{v.time} · {v.service} → {alt[0]?.name ?? "Sin cobertura"}</p>)}
    </Card>
  </>);
}

export function ReferralsPage() {
  const specialists = useVF((s) => s.specialists);
  const refs = useVF((s) => s.referrals);
  return (<>
    <PageTitle title="Remisiones" subtitle="Casos que requieren especialista" />
    <div className="space-y-3">{refs.map((r) => (
      <Card key={r.id}><div className="flex items-center justify-between"><b className="text-lg">{r.pet} · {r.specialty}</b><StatusBadge status={r.status} /></div>
        {r.specialist ? <p className="text-muted-foreground">{r.specialist}</p> : (
          <div className="mt-2 flex flex-wrap gap-2">{specialists.filter((s) => s.specialty === r.specialty).map((s) => <Btn key={s.id} variant="soft" onClick={() => { actions.resolveReferral(r.id, s.name); toast.success("Remisión agendada"); }}>Asignar {s.name}</Btn>)}</div>)}
      </Card>))}</div>
  </>);
}

export function SpecialistsPage() {
  const specialists = useVF((s) => s.specialists);
  return (<><PageTitle title="Especialistas" subtitle="Red externa de remisión" />
    <div className="space-y-2">{specialists.map((s) => <Card key={s.id} className="flex items-center gap-3"><Stethoscope className="h-7 w-7 text-primary" /><div className="flex-1"><b>{s.name}</b><p className="text-muted-foreground">{s.specialty} · {s.city}</p></div></Card>)}</div></>);
}

export function IncidentsPage() {
  const inc = useVF((s) => s.incidents); const [t, setT] = useState("");
  return (<><PageTitle title="Incidencias" />
    <div className="mb-4 flex gap-2"><input value={t} onChange={(e) => setT(e.target.value)} placeholder="Describe la incidencia" className="flex-1 rounded-full border border-border bg-card px-4 py-3" /><Btn onClick={() => { if (!t.trim()) return; actions.addIncident(t.trim(), "Registrada manualmente"); setT(""); toast.success("Incidencia registrada"); }}>Registrar</Btn></div>
    <div className="space-y-3">{inc.map((i) => (
      <Card key={i.id}><div className="flex items-center justify-between gap-2"><b className="text-lg">{i.title}</b><StatusBadge status={i.status} /></div><p className="text-muted-foreground">{i.detail}</p>
        <div className="mt-2 flex gap-2">{i.status === "abierta" && <Btn variant="soft" onClick={() => actions.setIncidentStatus(i.id, "en_gestion")}>Gestionar</Btn>}{i.status !== "cerrada" && <Btn variant="sage" onClick={() => actions.setIncidentStatus(i.id, "cerrada")}>Cerrar</Btn>}</div></Card>))}</div></>);
}

export function ApprovalsPage() {
  const ap = useVF((s) => s.approvals);
  return (<><PageTitle title="Aprobaciones" subtitle="Acciones que requieren tu decisión" />
    <div className="space-y-3">{ap.map((a) => (
      <Card key={a.id}><div className="flex items-center justify-between gap-2"><b className="text-lg">{a.title}</b>{a.status !== "pendiente" && <StatusBadge status={a.status} />}</div><p className="text-muted-foreground">{a.detail}</p>
        {a.status === "pendiente" && <div className="mt-3 grid grid-cols-2 gap-2"><Btn onClick={() => { actions.decideApproval(a.id, "aprobada"); toast.success("Aprobado"); }}><CheckCircle2 className="h-5 w-5" />Aprobar</Btn><Btn variant="outline" onClick={() => { actions.decideApproval(a.id, "rechazada"); toast("Rechazado"); }}><XCircle className="h-5 w-5" />Rechazar</Btn></div>}
      </Card>))}</div></>);
}

export function NotificationsPage() {
  const ns = useVF((s) => s.notifications);
  return (<><PageTitle title="Notificaciones" />
    <div className="space-y-2">{ns.map((n) => (
      <button key={n.id} onClick={() => actions.readNotification(n.id)} className="flex w-full items-start gap-3 rounded-3xl bg-secondary p-4 text-left"><Bell className={n.read ? "h-6 w-6 text-muted-foreground" : "h-6 w-6 text-primary"} /><span className="flex-1"><b>{n.title}</b><span className="block text-muted-foreground">{n.body}</span></span>{!n.read && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-primary" />}</button>))}</div></>);
}

export function OkvetPage() {
  const pend = useVF((s) => s.visits.filter((v) => v.status === "pendiente" || v.status === "pendiente_okvet"));
  return (<><PageTitle title="OKVET" subtitle="Sistema clínico oficial" />
    <Card className="mb-4"><div className="flex items-center gap-3"><Database className="h-7 w-7 text-primary" /><div className="flex-1"><b>Integración OKVET</b><p className="text-muted-foreground">Conector registrado · esperando credenciales y documentación técnica.</p></div><StatusBadge status="bloqueado" /></div></Card>
    <SectionTitle>Pendientes de sincronizar</SectionTitle>
    <div className="space-y-2">{pend.map((v) => <Card key={v.id} className="flex items-center justify-between"><span>{v.time} · {v.service}</span><StatusBadge status="pendiente_okvet" /></Card>)}</div></>);
}

export function FinancePage() {
  const pays = useVF((s) => s.payments);
  const paid = pays.filter((p) => p.status === "pagado").reduce((a, p) => a + p.amount, 0);
  const pend = pays.filter((p) => p.status !== "pagado").reduce((a, p) => a + p.amount, 0);
  return (<><PageTitle title="Finanzas" subtitle="Cobros y cartera" />
    <div className="grid grid-cols-2 gap-3"><Card className="bg-sage"><Wallet className="h-6 w-6 text-sage-foreground" />Cobrado hoy<b className="block text-xl">{formatCOP(paid + 3750000)}</b></Card><Card className="bg-accent"><AlertTriangle className="h-6 w-6 text-primary" />Por cobrar<b className="block text-xl">{formatCOP(pend)}</b></Card></div>
    <SectionTitle>Movimientos</SectionTitle>
    <div className="space-y-2">{pays.map((p) => (
      <Card key={p.id} className="flex items-center gap-3"><div className="flex-1"><b>{p.client}</b><p className="text-sm text-muted-foreground">{p.concept} · {p.date}</p><p className="font-bold">{formatCOP(p.amount)}</p></div>
        {p.status === "pagado" ? <StatusBadge status="pagado" /> : <Btn variant="soft" onClick={() => { actions.markPaid(p.id); toast.success("Pago registrado"); }}>Registrar pago</Btn>}</Card>))}</div></>);
}

export function ClientsPage() {
  const pets = usePets();
  return (<><PageTitle title="Clientes" subtitle="Familias y mascotas" />
    <Card><b className="text-lg">Familia Gómez</b><p className="text-muted-foreground">Andrea Gómez · 300 555 1201</p>
      <div className="mt-3 flex gap-3">{pets.map((p) => <div key={p.id} className="text-center"><img src={p.photo} alt={p.name} className="h-16 w-16 rounded-2xl object-cover" /><span className="text-sm">{p.name}</span></div>)}</div></Card></>);
}

export function ReportsPage() {
  const audit = useVF((s) => s.audit);
  return (<><PageTitle title="Informes" subtitle="Bitácora de acciones de esta sesión" />
    {audit.length === 0 ? <Empty title="Aún no hay acciones registradas" hint="Cada acción en la app queda auditada aquí." /> :
      <div className="space-y-2">{audit.map((a) => <Card key={a.id} className="flex gap-3"><ClipboardList className="h-5 w-5 text-primary" /><span className="flex-1">{a.action}</span><span className="text-sm text-muted-foreground">{a.at}</span></Card>)}</div>}</>);
}

export function AcademyPage() {
  const cs = useVF((s) => s.courses);
  return (<><PageTitle title="Academia" subtitle="Formación y certificaciones" />
    <div className="space-y-3">{cs.map((c) => (
      <Card key={c.id}><div className="flex items-center justify-between"><b>{c.title}</b>{c.required && <span className="rounded-full bg-accent px-3 py-1 text-sm text-primary">Obligatorio</span>}</div>
        <p className="text-sm text-muted-foreground">{c.role} · Revisado {c.reviewed}</p>
        <div className="my-2 h-3 overflow-hidden rounded-full bg-card"><div className="h-full rounded-full bg-gradient-primary" style={{ width: `${c.progress}%` }} /></div>
        <Btn variant={c.progress === 100 ? "sage" : "soft"} disabled={c.progress === 100} onClick={() => actions.progressCourse(c.id)}>{c.progress === 100 ? "Completado" : c.progress === 0 ? "Comenzar" : `Continuar (${c.progress}%)`}</Btn></Card>))}</div></>);
}

export function TreatmentsPage() {
  const ts = useVF((s) => s.treatments);
  return (<><PageTitle title="Tratamientos" subtitle="Planes recurrentes" />
    <div className="space-y-3">{ts.map((t) => <Card key={t.id}><b className="text-lg">{t.pet} · {t.plan}</b><p className="text-muted-foreground">{t.frequency} · {t.responsible}</p><p className="mt-1">{t.done} de {t.total} sesiones</p><div className="mt-1 h-3 overflow-hidden rounded-full bg-card"><div className="h-full bg-sage-foreground" style={{ width: `${(t.done / t.total) * 100}%` }} /></div></Card>)}</div></>);
}

export function InventoryPage() {
  const it = useVF((s) => s.items);
  const auxiliary = useVF((s) => s.roles.includes("auxiliar") && !s.roles.some((r) => ["veterinario", "luis", "administrador", "coordinador"].includes(r)));
  if (auxiliary) return <KitInventory />;
  return (<><PageTitle title="Inventario" subtitle="Insumos, lotes y vencimientos" />
    <div className="space-y-3">{it.map((i) => (
      <Card key={i.id} className="flex items-center gap-3"><Package className="h-7 w-7 text-primary" /><div className="flex-1"><b>{i.name}</b><p className="text-sm text-muted-foreground">Lote {i.lot} · vence {i.expires}</p>{i.stock < i.min && <p className="text-sm font-bold text-danger-foreground">Bajo mínimo ({i.min})</p>}</div>
        <button aria-label="Restar" onClick={() => actions.moveStock(i.id, -1)} className="grid h-10 w-10 place-items-center rounded-full bg-accent"><Minus className="h-4 w-4" /></button><b className="w-10 text-center text-xl">{i.stock}</b><button aria-label="Sumar" onClick={() => actions.moveStock(i.id, 1)} className="grid h-10 w-10 place-items-center rounded-full bg-sage"><Plus className="h-4 w-4" /></button></Card>))}</div></>);
}

const INTEGRATIONS = [
  ["OKVET", "Sistema clínico oficial", "Registrada · esperando credenciales"],
  ["WhatsApp Business", "Canal principal con clientes", "Registrada · esperando cuenta oficial"],
  ["n8n (112 workflows)", "Automatizaciones WF-001…WF-112", "Registradas · comportamiento documentado"],
  ["Mapas (Waze / Google Maps)", "Navegación del profesional", "Enlaces externos activos"],
  ["IA (asistente)", "Asistente privada de Dirección", "Respuestas de demostración"],
  ["Pagos", "Cobro en línea", "Pendiente de definición"],
];
export function ConfigPage() {
  return (<><PageTitle title="Configuración" subtitle="Integraciones y políticas" />
    <div className="space-y-2">{INTEGRATIONS.map(([n, d, s]) => <Card key={n}><b>{n}</b><p className="text-muted-foreground">{d}</p><p className="text-sm text-amber-foreground">{s}</p></Card>)}</div></>);
}

export function AbsencePage() {
  const staff = useVF((s) => s.staff); const absence = useVF((s) => s.absence);
  const [plan, setPlan] = useState({ coordinator: "", replacements: [] as string[], limits: "Aprobar cobros hasta $ 1.000.000 COP", from: "", to: "" });
  const errors = validateAbsence(plan, staff);
  if (absence?.active) return (<><PageTitle title="Modo ausencia" subtitle="Activo" /><Card className="bg-sage"><ShieldCheck className="h-8 w-8 text-sage-foreground" /><p className="text-lg">La operación sigue sin ti del <b>{absence.from}</b> al <b>{absence.to}</b>. Responsable: <b>{absence.coordinator}</b>.</p></Card><Btn variant="outline" className="mt-4 w-full" onClick={() => actions.setAbsence(null)}>Desactivar modo ausencia</Btn></>);
  return (<><PageTitle title="Modo ausencia" subtitle="Solo se activa si hay cobertura" />
    <div className="space-y-3">
      <label className="block">Coordinador responsable<select value={plan.coordinator} onChange={(e) => setPlan({ ...plan, coordinator: e.target.value })} className="mt-1 w-full rounded-2xl bg-accent p-3"><option value="">Elegir</option><option>Camila Ortiz (Coordinación)</option></select></label>
      <fieldset><legend>Reemplazos clínicos</legend>{staff.map((s) => <label key={s.id} className="mt-1 flex items-center gap-2 rounded-2xl bg-secondary p-3"><input type="checkbox" checked={plan.replacements.includes(s.id)} onChange={(e) => setPlan({ ...plan, replacements: e.target.checked ? [...plan.replacements, s.id] : plan.replacements.filter((x) => x !== s.id) })} />{s.name}<StatusBadge status={s.status} className="ml-auto" /></label>)}</fieldset>
      <div className="grid grid-cols-2 gap-2"><label>Desde<input type="date" value={plan.from} onChange={(e) => setPlan({ ...plan, from: e.target.value })} className="mt-1 w-full rounded-2xl bg-accent p-3" /></label><label>Hasta<input type="date" value={plan.to} onChange={(e) => setPlan({ ...plan, to: e.target.value })} className="mt-1 w-full rounded-2xl bg-accent p-3" /></label></div>
      <label className="block">Límites de decisión<input value={plan.limits} onChange={(e) => setPlan({ ...plan, limits: e.target.value })} className="mt-1 w-full rounded-2xl bg-accent p-3" /></label>
      {errors.length > 0 && <ul className="rounded-2xl bg-danger p-3 text-danger-foreground">{errors.map((e) => <li key={e}>• {e}</li>)}</ul>}
      <Btn className="w-full py-4" disabled={errors.length > 0} onClick={() => { actions.setAbsence({ ...plan, active: true }); toast.success("Modo ausencia activado"); }}>Activar modo ausencia</Btn>
    </div></>);
}

export function MoreMenu({ base, items }: { base: string; items: [string, string, typeof Inbox][] }) {
  return (<><PageTitle title="Más" />{items.map(([to, label, I]) => <RowLink key={to} icon={I} to={`${base}/${to}`} label={label} />)}
    <RowLink icon={Users} to="/" label="Cambiar de perfil" tone="sage" /></>);
}

export const ICONS = { Inbox, RouteIcon, Shuffle, Stethoscope, AlertTriangle, CheckCircle2, Database, Wallet, Users, FileText, GraduationCap, Settings, Pill, Package, ShieldCheck, Activity, BarChart3, MapPin, Navigation, CalendarClock, Bell };
