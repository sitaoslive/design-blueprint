import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, ListChecks, Package, CheckCircle2, AlertTriangle, MessageCircle, Clock, GraduationCap, User, ClipboardList, Briefcase } from "lucide-react";
import { useVF, actions, getVF, refreshVF } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { toast } from "sonner";
import { PageTitle, SectionTitle, Card, Empty, Btn, MetricTile, RowLink, StatusBadge } from "../ui";
import { StaffDay, IncidentList, KIT } from "./ops";
import { VisitExecution } from "@/features/field-operations/components/FieldPages";
import { Shifts, Profile } from "./other";
import { InventoryPage, NotificationsPage, AcademyPage } from "../pages/modules";

const B = "/auxiliar";
function useMe() { const uid = useVF((s) => s.userId); return useVF((s) => s.staff.find((m) => (m as { userId?: string }).userId === uid)); }
const AUX_ONLY = (roles: string[]) => roles.includes("auxiliar") && !roles.some((r) => r !== "auxiliar" && r !== "cliente");
/** Linked assistant: own items; unlinked assistant: nothing; directors without a link: everything. */
function useMine() { const me = useMe(); const auxOnly = useVF((s) => AUX_ONLY(s.roles)); return (staffId: string | null | undefined) => (me ? staffId === me.id : !auxOnly); }
function useMyVisits() { const mine = useMine(); const all = useVF((s) => s.visits); return all.filter((v) => mine(v.staffId) && v.status !== "finalizada" && v.status !== "cancelada"); }
function Unlinked() { const me = useMe(); const auxOnly = useVF((s) => AUX_ONLY(s.roles)); return !me && auxOnly ? <Card className="mb-3"><b>Tu cuenta aún no está vinculada a un miembro del equipo.</b><p className="text-sm text-muted-foreground">Coordinación debe vincularla para que veas tus visitas asignadas.</p></Card> : null; }
function usePreparations() {
  const [rows, setRows] = useState<{ visit_id: string; prep_checked: string[] }[]>([]);
  useEffect(() => { void db.from("visit_executions").select("visit_id,prep_checked").then(({ data }: { data: typeof rows | null }) => setRows(data ?? [])); }, []);
  return (visit: { id: string; prep: string[] }) => {
    const checked = rows.find((r) => r.visit_id === visit.id)?.prep_checked ?? [];
    return visit.prep.filter((item) => checked.includes(item)).length;
  };
}

function Home() {
  const me = useMe(); const visits = useMyVisits(); const items = useVF((s) => s.items); const allTasks = useVF((s) => s.tasks);
  const prepared = usePreparations();
  const mine = useMine(); const tasks = allTasks.filter((t) => !t.done && mine(t.staffId));
  const prepPending = visits.filter((v) => prepared(v) < v.prep.length).length; const low = items.filter((i) => i.stock <= i.min).length;
  return (<><PageTitle title={`Hola${me ? ", " + (me.name.split(" ").find((w) => !/^(Dr|Dra)\.?$/.test(w)) ?? me.name) : ""}`} subtitle="Apoyo, insumos y visitas asignadas" /><Unlinked />
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
  const prepared = usePreparations();
  const low = items.filter((i) => i.stock <= i.min);
  return (<><PageTitle title={kits ? "Kits" : "Preparación"} subtitle={kits ? "Contenido estándar y reposición" : "Kit listo antes de cada visita"} />
    {kits && <><Card className="mb-3"><b>Kit estándar</b><ul className="mt-2 list-disc pl-5 text-sm">{KIT.map((k) => <li key={k}>{k}</li>)}</ul></Card>
      <SectionTitle>Reponer</SectionTitle>{low.length ? low.map((i) => <Card key={i.id} className="mb-2 flex justify-between"><div><b>{i.name}</b><p className="text-sm text-muted-foreground">Lote {i.lot} · vence {i.expires}</p></div><b className="text-primary">{i.stock}/{i.min}</b></Card>) : <Empty title="Todo el inventario está sobre el mínimo" />}<SectionTitle>Kits por visita</SectionTitle></>}
    {visits.length ? visits.map((v) => { const n = prepared(v); return <Link key={v.id} to={`${B}/visitas/${v.id}/preparacion` as never} className="mb-2 block"><Card className="flex items-center justify-between"><div><b>{pets.find((p) => p.id === v.petId)?.name} · {v.service}</b><p className="text-sm text-muted-foreground">{v.date} {v.time} · {v.zone}</p></div><span className={`rounded-full px-3 py-1 text-sm font-bold ${n >= v.prep.length ? "bg-sage text-sage-foreground" : "bg-accent"}`}>{n}/{v.prep.length}</span></Card></Link>; }) : <Empty title="Sin visitas por preparar" />}</>);
}
function Tasks() {
  const mine = useMine(); const all = useVF((s) => s.tasks); const tasks = all.filter((t) => mine(t.staffId));
  const [busy, setBusy] = useState(false);
  const toggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id); if (!task || busy) return;
    if (getVF().userId?.startsWith("demo-")) { actions.toggleTask(id); return; }
    if (!navigator.onLine) { toast.error("Requiere conexión para actualizar la tarea"); return; }
    setBusy(true);
    const { data, error } = await db.from("tasks").update({ done: !task.done }).eq("id", id).select("id");
    if (error || !data?.length) toast.error("No se pudo actualizar la tarea"); else await refreshVF();
    setBusy(false);
  };
  return (<><PageTitle title="Tareas" subtitle={`${tasks.filter((t) => !t.done).length} pendientes`} />
    {tasks.length ? tasks.map((t) => <Btn key={t.id} disabled={busy} variant="soft" onClick={() => void toggle(t.id)} aria-pressed={t.done} className="mb-2 flex w-full items-center justify-start gap-3 p-4 text-left"><CheckCircle2 className={`h-6 w-6 ${t.done ? "text-sage-foreground" : "text-muted-foreground"}`} /><span className={t.done ? "line-through text-muted-foreground" : ""}>{t.title}</span></Btn>) : <Empty title="Sin tareas asignadas" />}</>);
}
function More() {
  return (<><PageTitle title="Más" />{([["agenda", "Agenda", CalendarDays], ["insumos", "Insumos", Package], ["kits", "Kits", Briefcase], ["tareas", "Tareas", ListChecks], ["incidencias", "Incidencias", AlertTriangle], ["mensajes", "Mensajes", MessageCircle], ["cobros", "Informar cobro", ClipboardList], ["pendientes-envio", "Pendientes de enviar", Clock], ["traspasos", "Entregas recibidas", Briefcase], ["cierre-jornada", "Cierre de jornada", CheckCircle2], ["turnos", "Turnos", Clock], ["academia", "Academia", GraduationCap], ["perfil", "Perfil", User]] as const).map(([k, l, I]) => <RowLink key={k} icon={I} to={`${B}/${k}`} label={l} />)}
    <Card className="mt-3"><p className="text-sm text-muted-foreground">Tu perfil no incluye prescripción, aprobación clínica ni cambios de tratamiento; eso lo hace el veterinario.</p></Card></>);
}
function Visit({ id }: { id: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id));
  return (<>{v && <div className="mb-2"><StatusBadge status={v.status} /></div>}<VisitExecution id={id} /></>);
}

export function auxPage(path: string): ReactNode | null {
  const [, a = "", b] = path.replace(/\/$/, "").split("/").slice(1);
  switch (a) {
    case "inicio": return <Home />;
    case "asignaciones": return <><Unlinked /><StaffDay base={B} /></>;
    case "agenda": return <><Unlinked /><StaffDay agenda base={B} /></>;
    case "visitas": return b ? <Visit id={b} /> : <StaffDay base={B} />;
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
