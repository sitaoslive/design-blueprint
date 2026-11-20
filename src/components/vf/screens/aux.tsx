import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, ListChecks, Package, CheckCircle2, AlertTriangle, MessageCircle, Clock, GraduationCap, User, ClipboardList, Briefcase } from "lucide-react";
import { useVF, actions } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, MetricTile, RowLink, StatusBadge } from "../ui";
import { StaffDay, StaffVisit, IncidentList, KIT } from "./ops";
import { Shifts, Profile } from "./other";
import { InventoryPage, NotificationsPage, AcademyPage } from "../pages/modules";

const B = "/auxiliar";
function useMe() { const uid = useVF((s) => s.userId); return useVF((s) => s.staff.find((m) => (m as { userId?: string }).userId === uid)); }
function useMyVisits() { const me = useMe(); const all = useVF((s) => s.visits); return all.filter((v) => (me ? v.staffId === me.id : true) && v.status !== "finalizada" && v.status !== "cancelada"); }

function Home() {
  const me = useMe(); const visits = useMyVisits(); const items = useVF((s) => s.items); const allTasks = useVF((s) => s.tasks);
  const tasks = allTasks.filter((t) => !t.done && (me ? t.staffId === me.id : true));
  const prepPending = visits.filter((v) => v.prep.length < KIT.length).length; const low = items.filter((i) => i.stock <= i.min).length;
  return (<><PageTitle title={`Hola${me ? ", " + me.name.split(" ")[0] : ""}`} subtitle="Apoyo, insumos y visitas asignadas" />
    <div className="mb-3 grid grid-cols-2 gap-3">
      <MetricTile icon={CalendarDays} label="Visitas asignadas" value={visits.length} to={`${B}/asignaciones`} />
      <MetricTile icon={ClipboardList} label="Por preparar" value={prepPending} tone="sage" to={`${B}/preparacion`} />
      <MetricTile icon={Package} label="Insumos bajos" value={low} to={`${B}/insumos`} />
      <MetricTile icon={ListChecks} label="Tareas" value={tasks.length} tone="sage" to={`${B}/tareas`} /></div>
    <SectionTitle>Próximas</SectionTitle>
    {visits.length ? [...visits].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 3).map((v) => <RowLink key={v.id} icon={CalendarDays} to={`${B}/visitas/${v.id}/preparacion`} label={`${v.time} · ${v.service} · ${v.zone}`} />) : <Empty title="Sin visitas asignadas" />}</>);
}
function Preparation({ kits }: { kits?: boolean }) {
  const visits = useMyVisits(); const pets = useVF((s) => s.pets); const items = useVF((s) => s.items);
  const low = items.filter((i) => i.stock <= i.min);
  return (<><PageTitle title={kits ? "Kits" : "Preparación"} subtitle={kits ? "Contenido estándar y reposición" : "Kit listo antes de cada visita"} />
    {kits && <><Card className="mb-3"><b>Kit estándar</b><ul className="mt-2 list-disc pl-5 text-sm">{KIT.map((k) => <li key={k}>{k}</li>)}</ul></Card>
      <SectionTitle>Reponer</SectionTitle>{low.length ? low.map((i) => <Card key={i.id} className="mb-2 flex justify-between"><div><b>{i.name}</b><p className="text-sm text-muted-foreground">Lote {i.lot} · vence {i.expires}</p></div><b className="text-primary">{i.stock}/{i.min}</b></Card>) : <Empty title="Todo el inventario está sobre el mínimo" />}<SectionTitle>Kits por visita</SectionTitle></>}
    {visits.length ? visits.map((v) => { const n = v.prep.length; return <Link key={v.id} to={`${B}/visitas/${v.id}/preparacion` as never} className="mb-2 block"><Card className="flex items-center justify-between"><div><b>{pets.find((p) => p.id === v.petId)?.name} · {v.service}</b><p className="text-sm text-muted-foreground">{v.date} {v.time} · {v.zone}</p></div><span className={`rounded-full px-3 py-1 text-sm font-bold ${n >= KIT.length ? "bg-sage text-sage-foreground" : "bg-accent"}`}>{n}/{KIT.length}</span></Card></Link>; }) : <Empty title="Sin visitas por preparar" />}</>);
}
function Tasks() {
  const me = useMe(); const all = useVF((s) => s.tasks); const tasks = all.filter((t) => (me ? t.staffId === me.id : true));
  return (<><PageTitle title="Tareas" subtitle={`${tasks.filter((t) => !t.done).length} pendientes`} />
    {tasks.length ? tasks.map((t) => <button key={t.id} onClick={() => actions.toggleTask(t.id)} aria-pressed={t.done} className="mb-2 flex w-full items-center gap-3 rounded-3xl bg-secondary p-4 text-left"><CheckCircle2 className={`h-6 w-6 ${t.done ? "text-sage-foreground" : "text-muted-foreground"}`} /><span className={t.done ? "line-through text-muted-foreground" : ""}>{t.title}</span></button>) : <Empty title="Sin tareas asignadas" />}</>);
}
function More() {
  return (<><PageTitle title="Más" />{([["agenda", "Agenda", CalendarDays], ["insumos", "Insumos", Package], ["kits", "Kits", Briefcase], ["tareas", "Tareas", ListChecks], ["incidencias", "Incidencias", AlertTriangle], ["mensajes", "Mensajes", MessageCircle], ["turnos", "Turnos", Clock], ["academia", "Academia", GraduationCap], ["perfil", "Perfil", User]] as const).map(([k, l, I]) => <RowLink key={k} icon={I} to={`${B}/${k}`} label={l} />)}
    <Card className="mt-3"><p className="text-sm text-muted-foreground">Tu perfil no incluye prescripción, aprobación clínica ni cambios de tratamiento; eso lo hace el veterinario.</p></Card></>);
}
function Visit({ id, tab }: { id: string; tab?: string | undefined }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id));
  return (<>{v && <div className="mb-2"><StatusBadge status={v.status} /></div>}<StaffVisit id={id} tab={tab} base={B} /></>);
}

export function auxPage(path: string): ReactNode | null {
  const [, a = "", b, c] = path.replace(/\/$/, "").split("/").slice(1);
  switch (a) {
    case "inicio": return <Home />;
    case "asignaciones": return <StaffDay base={B} />;
    case "agenda": return <StaffDay agenda base={B} />;
    case "visitas": return b ? <Visit id={b} tab={c} /> : <StaffDay base={B} />;
    case "preparacion": return <Preparation />;
    case "kits": return <Preparation kits />;
    case "insumos": return <InventoryPage />;
    case "tareas": return <Tasks />;
    case "incidencias": return <IncidentList title="Incidencias" />;
    case "mensajes": return <NotificationsPage />;
    case "turnos": return <Shifts kind="turno" />;
    case "academia": return <AcademyPage />;
    case "perfil": return <Profile />;
    case "mas": return <More />;
  }
  return null;
}
