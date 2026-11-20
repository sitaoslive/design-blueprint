import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Users, Wallet, Package, Pill, GraduationCap, AlertTriangle, Settings, ShieldCheck, FileText, Activity, Plus, Minus } from "lucide-react";
import { useVF, actions } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { formatCOP } from "@/lib/vf/format";
import { ROLES } from "@/lib/vf/roles";
import { PageTitle, SectionTitle, Card, Empty, Btn, StatusBadge, RowLink, MetricTile } from "../ui";
import { UsersPage, IntegrationsPage } from "../pages/admin";
import { useOrgSetting } from "./useRow";

const input = "w-full rounded-2xl bg-accent p-3";
const INTEG: Record<string, string> = { supabase: "cloud", n8n: "n8n", whatsapp: "whatsapp", "google-calendar": "gcal", mapas: "gmaps", okvet: "okvet", ia: "ai", pagos: "pagos", notificaciones: "email" };
const STATES = ["NO CONFIGURADA", "PREPARADA", "CONECTADA", "EN PRUEBAS", "VERIFICADA", "ERROR"];
const useCanEdit = () => useVF((s) => s.roles.includes("luis") || s.roles.includes("administrador"));

function Home() {
  const s = useVF((x) => x);
  const pend = s.payments.filter((p) => p.status !== "pagado").reduce((a, p) => a + p.amount, 0);
  return (<><PageTitle title="Administración central" subtitle="Configuración y control de Vet Life" />
    <div className="grid grid-cols-2 gap-3">
      <MetricTile icon={Wallet} label="Por cobrar" value={formatCOP(pend)} to="/admin/finanzas" />
      <MetricTile icon={Package} label="Stock bajo" value={s.items.filter((i) => i.stock < i.min).length} tone="sage" to="/admin/inventario/alertas" />
      <MetricTile icon={AlertTriangle} label="Quejas abiertas" value={s.incidents.filter((i) => i.status !== "cerrada").length} to="/admin/quejas" />
      <MetricTile icon={Settings} label="Integraciones listas" value={`${s.integrations.filter((i) => ["CONECTADA", "VERIFICADA"].includes(i.status)).length}/${s.integrations.length}`} tone="sage" to="/admin/integraciones" />
    </div>
    <SectionTitle>Módulos</SectionTitle>
    {[["/admin/organizacion", "Organización", Settings], ["/admin/usuarios", "Usuarios", Users], ["/admin/roles", "Roles y permisos", ShieldCheck], ["/admin/auditoria", "Auditoría", FileText], ["/admin/finanzas", "Finanzas", Wallet], ["/admin/inventario", "Inventario", Package], ["/admin/tratamientos", "Tratamientos", Pill], ["/admin/academia", "Academia", GraduationCap], ["/admin/sistema/salud", "Salud del sistema", Activity], ["/admin/project-memory", "Project Memory OS", FileText]].map(([to, l, I]) => <RowLink key={to as string} icon={I as typeof Users} to={to as string} label={l as string} />)}</>);
}

function Settings_({ k, title, subtitle, focus }: { k: string; title: string; subtitle: string; focus?: string }) {
  const { value, save } = useOrgSetting(k); const edit = useCanEdit();
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [nk, setNk] = useState(""); const [nv, setNv] = useState("");
  if (!value) return <p className="text-muted-foreground">Cargando…</p>;
  const cur = draft ?? value;
  const entries = Object.entries(cur).filter(([key]) => !focus || key === focus);
  return (<><PageTitle title={focus ?? title} subtitle={subtitle} />
    <Card className="space-y-3">{entries.length === 0 && <p className="text-muted-foreground">Sin datos.</p>}
      {entries.map(([key, v]) => <label key={key} className="block"><span className="text-sm font-bold">{key}</span>
        <input className={input} aria-label={key} disabled={!edit} value={v} onChange={(e) => setDraft({ ...cur, [key]: e.target.value })} /></label>)}
      {edit && !focus && <div className="grid grid-cols-2 gap-2"><input className={input} placeholder="Nuevo campo" aria-label="Nuevo campo" value={nk} onChange={(e) => setNk(e.target.value)} /><input className={input} placeholder="Valor" aria-label="Valor" value={nv} onChange={(e) => setNv(e.target.value)} />
        <Btn variant="soft" className="col-span-2" disabled={!nk.trim()} onClick={() => { setDraft({ ...cur, [nk.trim()]: nv }); setNk(""); setNv(""); }}><Plus className="h-4 w-4" />Agregar</Btn></div>}
      {edit && <Btn className="w-full" disabled={!draft} onClick={() => { void save(cur); setDraft(null); }}>Guardar</Btn>}
    </Card>
    {!edit && <p className="mt-3 text-sm text-muted-foreground">Solo Dirección y Administración pueden editar.</p>}
    {k === "servicios" && !focus && <div className="mt-3">{Object.keys(value).map((s) => <RowLink key={s} icon={Settings} to={`/admin/servicios/${encodeURIComponent(s)}`} label={s} />)}</div>}</>);
}
function NewService() {
  const { value, save } = useOrgSetting("servicios"); const [n, setN] = useState(""); const [d, setD] = useState("45 min");
  return (<><PageTitle title="Nuevo servicio" />
    <Card className="space-y-3"><input className={input} placeholder="Nombre del servicio" aria-label="Nombre del servicio" value={n} onChange={(e) => setN(e.target.value)} />
      <input className={input} placeholder="Duración" aria-label="Duración" value={d} onChange={(e) => setD(e.target.value)} />
      <Btn className="w-full" disabled={!n.trim() || !value} onClick={() => { void save({ ...(value ?? {}), [n.trim()]: d }); setN(""); }}>Crear servicio</Btn></Card></>);
}

function Roles({ perms }: { perms?: boolean }) {
  return (<><PageTitle title={perms ? "Permisos" : "Roles"} subtitle="Qué puede hacer cada perfil" />
    {ROLES.map((r) => <Card key={r.id} className="mb-2"><b>{r.label}</b><p className="text-sm text-muted-foreground">{r.desc}</p>
      {perms && <><p className="mt-2 text-sm"><b>Puede:</b> {r.permissions.join(" · ")}</p><p className="text-sm"><b>No puede:</b> {r.denied.join(" · ") || "—"}</p></>}</Card>)}
    <div className="mt-2"><Link to={"/admin/usuarios" as never} className="font-bold text-primary">Asignar roles a personas →</Link></div></>);
}
function Invite() {
  const url = typeof window !== "undefined" ? `${window.location.origin}/auth` : "/auth";
  return (<><PageTitle title="Invitar usuario" subtitle="Comparte el enlace de registro" />
    <Card><p className="break-all font-mono text-sm">{url}</p><Btn className="mt-3" onClick={() => { void navigator.clipboard.writeText(url); toast.success("Enlace copiado"); }}>Copiar enlace</Btn>
      <p className="mt-3 text-sm text-muted-foreground">La persona se registra como Cliente; luego asígnale su rol en Usuarios.</p></Card></>);
}
function Audit({ filter, title }: { filter?: string; title?: string }) {
  const audit = useVF((s) => s.audit); const [q, setQ] = useState(filter ?? "");
  const list = audit.filter((a) => a.action.toLowerCase().includes(q.toLowerCase()));
  return (<><PageTitle title={title ?? "Auditoría"} subtitle={`${audit.length} acciones registradas`} />
    <input className={`${input} mb-3`} placeholder="Buscar acción" aria-label="Buscar acción" value={q} onChange={(e) => setQ(e.target.value)} />
    {list.length ? <div className="space-y-2">{list.map((a) => <Card key={a.id}><b>{a.action}</b><p className="text-sm text-muted-foreground">{a.at}</p></Card>)}</div> : <Empty title="Sin registros" />}</>);
}

function Finance({ view }: { view: string }) {
  const pays = useVF((s) => s.payments);
  const sum = (f: (p: (typeof pays)[number]) => boolean) => pays.filter(f).reduce((a, p) => a + p.amount, 0);
  const group = (key: "client" | "concept") => Object.entries(pays.reduce<Record<string, number>>((m, p) => ({ ...m, [p[key]]: (m[p[key]] ?? 0) + p.amount }), {})).sort((a, b) => b[1] - a[1]);
  const T: Record<string, string> = { "": "Finanzas", cobros: "Cobros", facturas: "Facturas", comprobantes: "Comprobantes", conciliacion: "Conciliación", costos: "Costos", "rentabilidad-servicio": "Rentabilidad por servicio", "rentabilidad-zona": "Rentabilidad por zona", clientes: "Finanzas por cliente", reportes: "Reportes financieros" };
  const list = view === "facturas" || view === "comprobantes" ? pays.filter((p) => p.status === "pagado") : pays;
  return (<><PageTitle title={T[view] ?? "Finanzas"} subtitle="Montos en pesos colombianos" />
    <div className="grid grid-cols-3 gap-2 text-center">{[["Cobrado", sum((p) => p.status === "pagado")], ["Pendiente", sum((p) => p.status === "pendiente")], ["Vencido", sum((p) => p.status === "vencido")]].map(([l, v]) => <Card key={l as string}><p className="text-xs text-muted-foreground">{l}</p><b className="text-sm">{formatCOP(v as number)}</b></Card>)}</div>
    {["clientes", "rentabilidad-servicio", "reportes", "costos", "rentabilidad-zona"].includes(view) ? (<>
      <SectionTitle>{view === "clientes" ? "Por cliente" : "Por concepto"}</SectionTitle>
      {group(view === "clientes" ? "client" : "concept").map(([k, v]) => <Card key={k} className="mb-2 flex justify-between"><b>{k}</b><span>{formatCOP(v)}</span></Card>)}
      {(view === "costos" || view === "rentabilidad-zona") && <p className="mt-2 text-sm text-muted-foreground">Los costos por zona y servicio requieren registrar gastos; se habilita con la integración contable.</p>}
    </>) : (<>
      <SectionTitle>{view === "conciliacion" ? "Movimientos por conciliar" : "Movimientos"}</SectionTitle>
      {(view === "conciliacion" ? pays.filter((p) => p.status !== "pagado") : list).map((p) => <Card key={p.id} className="mb-2"><div className="flex items-center justify-between gap-2"><div><b>{p.client}</b><p className="text-sm text-muted-foreground">{p.concept} · {p.date}</p></div><div className="text-right"><b>{formatCOP(p.amount)}</b><div><StatusBadge status={p.status} /></div></div></div>
        {p.status !== "pagado" && <Btn variant="soft" className="mt-2" onClick={() => actions.markPaid(p.id)}>Marcar pagado</Btn>}</Card>)}
    </>)}</>);
}

function Inventory({ view, id }: { view: string; id?: string | undefined }) {
  const items = useVF((s) => s.items);
  if (view === "productos" && id) {
    const i = items.find((x) => x.id === id); if (!i) return <Empty title="Producto no encontrado" />;
    return (<><PageTitle title={i.name} subtitle={`Lote ${i.lot} · vence ${i.expires}`} />
      <Card><p className="text-4xl font-bold">{i.stock}</p><p className="text-muted-foreground">Mínimo {i.min}</p>
        <div className="mt-3 flex gap-2"><Btn variant="soft" onClick={() => actions.moveStock(i.id, -1)}><Minus className="h-4 w-4" />Salida</Btn><Btn onClick={() => actions.moveStock(i.id, 1)}><Plus className="h-4 w-4" />Entrada</Btn></div></Card></>);
  }
  if (view === "movimientos") return <Audit filter="Inventario" title="Movimientos de inventario" />;
  const list = view === "alertas" || view === "compras" ? items.filter((i) => i.stock < i.min) : items;
  const T: Record<string, string> = { "": "Inventario", productos: "Productos", lotes: "Lotes y vencimientos", alertas: "Alertas de stock", compras: "Compras sugeridas", ubicaciones: "Ubicaciones", kits: "Kits de visita" };
  return (<><PageTitle title={T[view] ?? "Inventario"} subtitle={`${items.length} productos`} />
    {list.length ? list.map((i) => <Link key={i.id} to={`/admin/inventario/productos/${i.id}` as never} className="mb-2 block"><Card><div className="flex justify-between"><b>{i.name}</b><span className={i.stock < i.min ? "font-bold text-primary" : ""}>{i.stock} / mín {i.min}</span></div>
      <p className="text-sm text-muted-foreground">{view === "compras" ? `Comprar ${i.min * 2 - i.stock} unidades` : `Lote ${i.lot} · vence ${i.expires}`}</p></Card></Link>) : <Empty title="Todo en orden" />}</>);
}

function Treatments({ view, id }: { view: string; id?: string | undefined }) {
  const tr = useVF((s) => s.treatments);
  if (id && view !== "calendario" && view !== "incumplimientos") {
    const t = tr.find((x) => x.id === id); if (!t) return <Empty title="Tratamiento no encontrado" />;
    return (<><PageTitle title={`${t.pet} · ${t.plan}`} subtitle={`${t.frequency} · ${t.responsible}`} /><Card><p className="text-3xl font-bold">{t.done}/{t.total}</p><p className="text-muted-foreground">dosis aplicadas</p></Card></>);
  }
  const list = view === "incumplimientos" ? tr.filter((t) => t.done / t.total < 0.5) : tr;
  return (<><PageTitle title={view === "incumplimientos" ? "Incumplimientos" : view === "calendario" ? "Calendario de tratamientos" : "Tratamientos"} subtitle={`${tr.length} planes activos`} />
    {list.length ? list.map((t) => <Link key={t.id} to={`/admin/tratamientos/${t.id}` as never} className="mb-2 block"><Card><b>{t.pet} · {t.plan}</b><p className="text-sm text-muted-foreground">{t.frequency} · {t.done}/{t.total}</p></Card></Link>) : <Empty title="Sin incumplimientos" />}</>);
}
function Prevention({ view }: { view: string }) {
  const visits = useVF((s) => s.visits); const pets = useVF((s) => s.pets);
  const kw = view === "vacunacion" ? "Vacun" : view === "desparasitacion" ? "Desparasit" : "";
  const list = visits.filter((v) => (kw ? v.service.includes(kw) : /Vacun|preventivo|Desparasit/.test(v.service)));
  return (<><PageTitle title={{ "": "Prevención", vacunacion: "Vacunación", desparasitacion: "Desparasitación", protocolos: "Protocolos preventivos", recordatorios: "Recordatorios" }[view] ?? "Prevención"} subtitle="Basado en la agenda real" />
    {list.length ? list.map((v) => <Card key={v.id} className="mb-2 flex justify-between"><div><b>{pets.find((p) => p.id === v.petId)?.name} · {v.service}</b><p className="text-sm text-muted-foreground">{v.date} {v.time}</p></div><StatusBadge status={v.status} /></Card>) : <Empty title="Sin registros" />}
    {view === "recordatorios" && <p className="mt-2 text-sm text-muted-foreground">El envío automático llega con WhatsApp y n8n.</p>}</>);
}
function Quality() {
  const inc = useVF((s) => s.incidents); const [t, setT] = useState(""); const [d, setD] = useState("");
  return (<><PageTitle title="Quejas y calidad" subtitle={`${inc.filter((i) => i.status !== "cerrada").length} abiertas`} />
    <Card className="mb-3 space-y-2"><input className={input} placeholder="Título" aria-label="Título" value={t} onChange={(e) => setT(e.target.value)} /><input className={input} placeholder="Detalle" aria-label="Detalle" value={d} onChange={(e) => setD(e.target.value)} />
      <Btn className="w-full" disabled={!t.trim()} onClick={() => { actions.addIncident(t.trim(), d); setT(""); setD(""); toast.success("Registrada"); }}>Registrar</Btn></Card>
    {inc.map((i) => <Card key={i.id} className="mb-2"><div className="flex justify-between"><b>{i.title}</b><StatusBadge status={i.status} /></div><p className="text-sm text-muted-foreground">{i.detail}</p>
      {i.status !== "cerrada" && <Btn variant="soft" className="mt-2" onClick={() => actions.setIncidentStatus(i.id, i.status === "abierta" ? "en_gestion" : "cerrada")}>{i.status === "abierta" ? "Gestionar" : "Cerrar"}</Btn>}</Card>)}</>);
}
function Academy({ view, id }: { view: string; id?: string | undefined }) {
  const courses = useVF((s) => s.courses); const [n, setN] = useState(""); const [role, setRole] = useState("Todos");
  if (view === "cursos" && id === "nuevo") return (<><PageTitle title="Nuevo curso" />
    <Card className="space-y-3"><input className={input} placeholder="Título" aria-label="Título" value={n} onChange={(e) => setN(e.target.value)} /><input className={input} placeholder="Rol" aria-label="Rol" value={role} onChange={(e) => setRole(e.target.value)} />
      <Btn className="w-full" disabled={!n.trim()} onClick={async () => { const { error } = await db.from("courses").insert({ title: n.trim(), role }); if (error) toast.error(error.message); else { toast.success("Curso creado; recarga para verlo"); setN(""); } }}>Crear curso</Btn></Card></>);
  if (view === "cursos" && id) {
    const c = courses.find((x) => x.id === id); if (!c) return <Empty title="Curso no encontrado" />;
    return (<><PageTitle title={c.title} subtitle={c.role} /><Card><p className="text-3xl font-bold">{c.progress}%</p><Btn className="mt-3" onClick={() => actions.progressCourse(c.id)}>Registrar avance</Btn></Card></>);
  }
  return (<><PageTitle title="Academia" subtitle={`${courses.length} cursos`}><Link to={"/admin/academia/cursos/nuevo" as never} className="font-bold text-primary">Nuevo</Link></PageTitle>
    {courses.map((c) => <Link key={c.id} to={`/admin/academia/cursos/${c.id}` as never} className="mb-2 block"><Card><div className="flex justify-between"><b>{c.title}</b><span>{c.progress}%</span></div><p className="text-sm text-muted-foreground">{c.role}{c.required ? " · Obligatorio" : ""}</p></Card></Link>)}</>);
}
function Integration({ slug }: { slug: string }) {
  const i = useVF((s) => s.integrations.find((x) => x.id === INTEG[slug])); const edit = useCanEdit();
  if (!i) return <Empty title="Integración no registrada" />;
  return (<><PageTitle title={i.name} subtitle={i.purpose} />
    <Card>{edit ? <select aria-label="Estado" className={input} value={i.status} onChange={(e) => actions.setIntegration(i.id, e.target.value)}>{STATES.map((s) => <option key={s}>{s}</option>)}</select> : <b>{i.status}</b>}
      {i.note && <p className="mt-2 text-sm text-muted-foreground">{i.note}</p>}</Card>
    <p className="mt-3 text-sm text-muted-foreground">Registrada en esta entrega; la conexión real se implementa en una fase posterior.</p></>);
}
function Automations() {
  const n8n = useVF((s) => s.integrations.find((x) => x.id === "n8n"));
  return (<><PageTitle title="Automatizaciones" subtitle="Flujos n8n WF-001…WF-112" />
    <Card><b>Estado de n8n</b><p>{n8n?.status ?? "—"}</p><p className="mt-2 text-sm text-muted-foreground">Los 112 flujos están registrados, no ejecutándose. Las ejecuciones, errores y reintentos aparecerán aquí al conectar n8n.</p></Card></>);
}
function Health() {
  const s = useVF((x) => x);
  const rows: [string, number][] = [["Mascotas", s.pets.length], ["Visitas", s.visits.length], ["Equipo", s.staff.length], ["Solicitudes", s.requests.length], ["Cobros", s.payments.length], ["Inventario", s.items.length], ["Acciones auditadas", s.audit.length]];
  return (<><PageTitle title="Salud del sistema" subtitle={s.loaded ? "Conectado a la base de datos" : "Sin conexión"} />
    <Card><StatusBadge status={s.loaded ? "confirmada" : "pendiente"} /></Card>
    <SectionTitle>Registros visibles</SectionTitle>{rows.map(([l, n]) => <Card key={l} className="mb-2 flex justify-between"><b>{l}</b><span>{n}</span></Card>)}</>);
}

const SETTINGS: Record<string, [string, string]> = { organizacion: ["Organización", "Datos de la empresa"], identidad: ["Identidad de marca", "Colores, logo y tono"], zonas: ["Zonas", "Cobertura de atención"], horarios: ["Horarios", "Disponibilidad de atención"], servicios: ["Servicios", "Catálogo y duración"], tarifas: ["Tarifas", "Precios en COP"], politicas: ["Políticas", "Cancelación, pagos y reprogramación"], privacidad: ["Privacidad", "Tratamiento de datos"], seguridad: ["Seguridad", "Reglas de acceso"] };

/** Pattern → page for central admin screens (/admin/*). */
export function adminPage(path: string): ReactNode | null {
  const [a = "", b, c] = path.replace(/\/$/, "").split("/").slice(2);
  if (a === "inicio") return <Home />;
  if (a === "servicios" && b === "nuevo") return <NewService />;
  if (a === "servicios" && b) return <Settings_ k="servicios" title="Servicio" subtitle="Detalle del servicio" focus={decodeURIComponent(b)} />;
  if (SETTINGS[a] && !b) return <Settings_ k={a} title={SETTINGS[a]![0]} subtitle={SETTINGS[a]![1]} />;
  if (a === "usuarios") return b === "invitar" ? <Invite /> : <UsersPage />;
  if (a === "roles") return <Roles />;
  if (a === "permisos") return <Roles perms />;
  if (a === "auditoria") return <Audit />;
  if (a === "sesiones" || a === "accesos") return <Audit filter="" title={a === "sesiones" ? "Sesiones y actividad" : "Accesos"} />;
  if (a === "finanzas") return <Finance view={b ?? ""} />;
  if (a === "inventario") return <Inventory view={b ?? ""} id={c} />;
  if (a === "tratamientos") return <Treatments view={b ?? ""} id={b} />;
  if (a === "prevencion") return <Prevention view={b ?? ""} />;
  if (a === "calidad" || a === "quejas") return <Quality />;
  if (a === "academia") return <Academy view={b ?? ""} id={c} />;
  if (a === "integraciones") return b ? <Integration slug={b} /> : <IntegrationsPage />;
  if (a === "automatizaciones") return <Automations />;
  if (a === "sistema" && b === "salud") return <Health />;
  if (a === "sistema" && b === "errores") return <Audit filter="error" title="Errores" />;
  return null;
}
export const ADMIN_BUILT = /^\/admin\/(inicio|organizacion|identidad|zonas|horarios|servicios|tarifas|politicas|privacidad|seguridad|usuarios|roles|permisos|auditoria|sesiones|accesos|finanzas|inventario|tratamientos|prevencion|calidad|quejas|academia|integraciones|automatizaciones|sistema\/salud|sistema\/errores)(\/|$)/;
export const CLIENT_BUILT = /^\/app\/(mascotas\/(nueva|:id\/(editar|salud|documentos))|agenda\/:id|solicitudes|visitas|historial|remisiones\/:id|seguimientos|pagos\/:id|direcciones|cuidadores\/:id|preferencias|consentimientos|ayuda\/solicitudes|perfil\/seguridad)/;
