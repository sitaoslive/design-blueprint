import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, Lightbulb, Inbox, CalendarPlus, Users, PawPrint, Wallet, AlertTriangle, Activity, FileText } from "lucide-react";
import { useVF } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { PageTitle, SectionTitle, Card, Empty, MetricTile, RowLink } from "../ui";
import { PetCard, LoadingSkeleton, ErrorState, PermissionDenied } from "../shared";
import { opsPage } from "./ops";
import { adminPage } from "./admin";
import { Profile, Commitments } from "./other";

/* ---------- Recepción: reuses coordination screens with reception scope ---------- */
function ReceptionHome() {
  const reqs = useVF((s) => s.requests.filter((r) => r.status === "nueva").length); const unconf = useVF((s) => s.visits.filter((v) => v.status === "pendiente").length); const tasks = useVF((s) => s.tasks.filter((t) => !t.done).length);
  return (<><PageTitle title="Recepción" subtitle="Atención, identificación y escalamiento" />
    <div className="mb-3 grid grid-cols-2 gap-3"><MetricTile icon={Inbox} label="Solicitudes nuevas" value={reqs} to="/recepcion/bandeja" /><MetricTile icon={CalendarPlus} label="Por confirmar" value={unconf} tone="sage" to="/recepcion/confirmaciones" /></div>
    <RowLink icon={CalendarPlus} to="/recepcion/cita-rapida" label="Nueva cita rápida" /><RowLink icon={Users} to="/recepcion/clientes" label="Clientes" /><RowLink icon={PawPrint} to="/recepcion/mascotas" label="Mascotas" /><RowLink icon={FileText} to="/recepcion/tareas" label={`Tareas (${tasks})`} /></>);
}
function Pets() { const pets = useVF((s) => s.pets); return (<><PageTitle title="Mascotas" subtitle={`${pets.length} registradas`} />{pets.length ? pets.map((p) => <PetCard key={p.id} name={p.name} detail={`${p.species} · ${p.breed} · ${p.owner}`} photo={p.photo} to={`/operaciones/mascotas/${p.id}`} />) : <Empty title="Sin mascotas" />}</>); }
function reception(a: string, b?: string): ReactNode {
  switch (a) {
    case "inicio": return <ReceptionHome />;
    case "bandeja": case "solicitudes": return opsPage(`/operaciones/${a}${b ? "/" + b : ""}`);
    case "clientes": return opsPage(`/operaciones/clientes${b ? "/" + b : ""}`) ?? <Empty title="Cliente no encontrado" />;
    case "mascotas": return <Pets />;
    case "cita-rapida": case "confirmaciones": return opsPage(`/operaciones/${a}`);
    case "tareas": return <Commitments base="/recepcion/tareas" id={b} />;
    case "perfil": return <Profile />;
  }
  return null;
}

/* ---------- Finanzas: reuses admin finance views ---------- */
function finance(a: string): ReactNode {
  if (a === "perfil") return <Profile />;
  if (a === "inicio") return adminPage("/admin/finanzas");
  if (["cobros", "facturas", "conciliacion", "comprobantes", "costos", "reportes"].includes(a)) return adminPage(`/admin/finanzas/${a}`);
  return null;
}

/* ---------- Soporte: technical scope only, no business admin ---------- */
function SupportHome() {
  const inc = useVF((s) => s.incidents.filter((i) => i.status !== "cerrada").length); const integ = useVF((s) => s.integrations.length);
  return (<><PageTitle title="Soporte técnico" subtitle="Acceso mínimo y auditado: diagnóstico, sin configuración empresarial" />
    <div className="mb-3 grid grid-cols-2 gap-3"><MetricTile icon={AlertTriangle} label="Incidencias abiertas" value={inc} to="/soporte/incidencias" /><MetricTile icon={Activity} label="Integraciones" value={integ} tone="sage" to="/soporte/integraciones" /></div>
    {([["ejecuciones", "Ejecuciones"], ["errores", "Errores"], ["salud", "Salud del sistema"], ["auditoria", "Auditoría"]] as const).map(([k, l]) => <RowLink key={k} icon={FileText} to={`/soporte/${k}`} label={l} />)}</>);
}
function SupportIntegrations() {
  const integ = useVF((s) => s.integrations);
  return (<><PageTitle title="Integraciones" subtitle="Solo lectura para soporte" />{integ.length ? integ.map((i) => <Card key={i.id} className="mb-2 flex justify-between"><div><b>{i.name}</b><p className="text-sm text-muted-foreground">{i.purpose}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">{i.status}</span></Card>) : <Empty title="Sin integraciones visibles" />}</>);
}
function support(a: string): ReactNode {
  switch (a) {
    case "inicio": return <SupportHome />;
    case "incidencias": return opsPage("/operaciones/incidencias");
    case "integraciones": return <SupportIntegrations />;
    case "ejecuciones": return adminPage("/admin/auditoria");
    case "errores": return adminPage("/admin/sistema/errores");
    case "salud": return adminPage("/admin/sistema/salud");
    case "auditoria": return adminPage("/admin/auditoria");
    case "perfil": return <Profile />;
  }
  return null;
}

/* ---------- Consultor Alpha Vision: aggregated, anonymous indicators only ---------- */
type M = Record<string, number> & { por_zona?: Record<string, number> };
function useMetrics() {
  const [m, setM] = useState<M | null | undefined>(undefined); const [e, setE] = useState<string | null>(null);
  useEffect(() => { void db.rpc("consultant_metrics").then(({ data, error }: { data: M | null; error: { message: string } | null }) => { if (error) setE(error.message); else setM(data); }); }, []);
  return { m, e };
}
const pct = (a = 0, b = 0) => (b ? Math.round((a / b) * 100) : 0);
export function improvements(m: M) {
  const out: string[] = [];
  if (pct(m["visitas_pendientes"], m["visitas"]) > 30) out.push("Más del 30% de las visitas siguen sin confirmar: reforzar confirmaciones el día anterior.");
  if ((m["carga_promedio"] ?? 0) > 75) out.push("La carga promedio del equipo supera el 75%: evaluar capacidad o redistribuir zonas.");
  if ((m["incidencias_abiertas"] ?? 0) > 2) out.push("Hay varias incidencias abiertas: revisar tiempos de cierre.");
  if ((m["aprobaciones_pendientes"] ?? 0) > 2) out.push("Muchas decisiones esperan a dirección: ampliar la delegación.");
  return out.length ? out : ["Indicadores dentro de rangos sanos."];
}
function Consultant({ view }: { view: string }) {
  const { m, e } = useMetrics();
  if (e) return <ErrorState message={e} />; if (m === undefined) return <LoadingSkeleton />; if (m === null) return <PermissionDenied />;
  const title = { inicio: "Alpha Vision", indicadores: "Indicadores", operaciones: "Operaciones", mejoras: "Mejoras sugeridas", reportes: "Reporte" }[view] ?? "Alpha Vision";
  return (<><PageTitle title={title} subtitle="Datos agregados y anónimos; sin información de clientes" />
    {(view === "inicio" || view === "indicadores" || view === "reportes") && <div className="mb-3 grid grid-cols-2 gap-3">
      <MetricTile icon={BarChart3} label="Visitas finalizadas" value={`${pct(m["visitas_finalizadas"], m["visitas"])}%`} to="/consultor/operaciones" />
      <MetricTile icon={Inbox} label="Solicitudes nuevas" value={m["solicitudes_nuevas"] ?? 0} tone="sage" to="/consultor/operaciones" />
      <MetricTile icon={AlertTriangle} label="Incidencias abiertas" value={m["incidencias_abiertas"] ?? 0} to="/consultor/indicadores" />
      <MetricTile icon={Users} label="Carga promedio" value={`${m["carga_promedio"] ?? 0}%`} tone="sage" to="/consultor/indicadores" /></div>}
    {(view === "operaciones" || view === "reportes") && <><SectionTitle>Visitas por zona</SectionTitle>{Object.entries(m.por_zona ?? {}).map(([z, n]) => <Card key={z} className="mb-2 flex justify-between"><b>{z}</b><span>{n}</span></Card>)}
      <Card className="mb-2 flex justify-between"><b>Remisiones abiertas</b><span>{m["remisiones_abiertas"] ?? 0}</span></Card><Card className="mb-2 flex justify-between"><b>Aprobaciones pendientes</b><span>{m["aprobaciones_pendientes"] ?? 0} de {m["aprobaciones_total"] ?? 0}</span></Card></>}
    {(view === "inicio" || view === "mejoras" || view === "reportes") && <><SectionTitle>Mejoras sugeridas</SectionTitle>{improvements(m).map((t) => <Card key={t} className="mb-2 flex gap-2"><Lightbulb className="h-5 w-5 shrink-0 text-primary" /><p>{t}</p></Card>)}</>}</>);
}

export function rolePage(path: string): ReactNode | null {
  const [area, a = "", b] = path.replace(/\/$/, "").split("/").slice(1);
  if (area === "recepcion") return reception(a, b);
  if (area === "finanzas") return finance(a);
  if (area === "soporte") return support(a);
  if (area === "consultor") return a === "perfil" ? <Profile /> : ["inicio", "indicadores", "operaciones", "mejoras", "reportes"].includes(a) ? <Consultant view={a} /> : null;
  return null;
}
void Wallet;
