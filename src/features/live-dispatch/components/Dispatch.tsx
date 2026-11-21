import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Clock, MapPin, Save } from "lucide-react";
import { Btn, Card, Empty, PageTitle, SectionTitle } from "@/components/vf/ui";
import { useVF } from "@/lib/vf/store";
import { useFinanceRows } from "@/features/finance/application/sources";
import { FinanceSourceState, financeInput } from "@/features/finance/components/FinanceControls";
import { canAdminister } from "@/features/system-administration/domain/access";
import { useMyStaff } from "@/lib/vf/me";
import { VisitExecution } from "@/features/field-operations/components/FieldPages";
import { dispatchAccess, visitTimer, DurationPolicySchema, type DurationPolicy } from "../domain";
import { saveDurationProposal } from "../application/policy.functions";
import { dispatchScreen } from "../catalog";
type VisitRow = { id: string; pet_id: string; staff_id: string | null; service: string; operational_on: string | null; date: string; time: string; status: string };
type ExecutionRow = { visit_id: string; state: string; stamps: Record<string, string>; updated_at: string };
export function DispatchPage({ path }: { path: string }) {
  const uid = useVF((s) => s.userId); const roles = useVF((s) => s.roles);
  const access = dispatchAccess(roles, uid);
  if (path.startsWith("/admin/citas/")) return canAdminister(roles, uid) ? <DurationManager key={uid} path={path} /> : <Empty title="Configuración no autorizada" />;
  const family = path.startsWith("/app/");
  if (access === "NONE" || (family ? access !== "OWN_VISIT" : access === "OWN_VISIT")) return <Empty title="Despacho: acceso no autorizado" />;
  return <DispatchWorkspace key={`${uid}:${roles.join(",")}:${path}`} path={path} access={access} />;
}
function Timer({ row }: { row: ExecutionRow | undefined }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(interval); }, []);
  const elapsed = visitTimer({ actualStartAt: row?.stamps["IN_SERVICE"] ?? null, actualEndAt: row?.stamps["SERVICE_FINISHED"] ?? null, plannedMinutes: null }, now);
  return <div className="mt-3 border-t border-border pt-3"><p className="flex items-center gap-2 font-bold"><Clock className="h-4 w-4" />{elapsed.elapsed === null ? "Tiempo de atención no disponible" : `${elapsed.elapsed} min de atención registrada`}</p><p className="text-sm">Duración aplicada: no disponible · Tiempo restante no disponible</p><p className="text-xs text-muted-foreground">{row ? `Última actualización: ${row.updated_at}` : "Sin marcas de tiempo autorizadas disponibles"}</p></div>;
}
function DispatchWorkspace({ path, access }: { path: string; access: string }) {
  const visits = useFinanceRows<VisitRow>("visits"); const executions = useFinanceRows<ExecutionRow>("visit_executions");
  const pets = useVF((s) => s.pets); const staff = useVF((s) => s.staff); const uid = useVF((s) => s.userId);
  const roles = useVF((s) => s.roles);
  const participants = useVF((s) => s.participants); const { me } = useMyStaff();
  const [day, setDay] = useState(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date()));
  const [professional, setProfessional] = useState("");
  const family = path.startsWith("/app/");
  const visitId = family || path.endsWith("/tiempo") ? path.split("/")[3] : null;
  const staffDetail = path.match(/^\/operaciones\/despacho\/([^/]+)$/)?.[1];
  const filtered = (visits.rows ?? []).filter((v) => {
    if (access === "OWN_ASSIGNMENTS" && (!me || !(v.staff_id === me.id || participants.some((p) => p.visitId === v.id && p.staffId === me.id && p.active)))) return false;
    if (visitId) return v.id === visitId;
    if (staffDetail && v.staff_id !== staffDetail) return false;
    return (uid?.startsWith("demo-") || v.operational_on === day) && (!professional || v.staff_id === professional);
  }).sort((a, b) => a.time.localeCompare(b.time));
  return <>
    <PageTitle title={dispatchScreen(path) ?? "Despacho"} />
    <p className="mb-3 text-sm text-muted-foreground">{uid?.startsWith("demo-") ? "DEMO · datos sintéticos" : "Visitas autorizadas de Lovable Cloud"} · GPS y ETA de carretera no disponibles.</p>
    {!family && !visitId && <div className="mb-4 grid gap-3 sm:grid-cols-2"><label>Fecha<input className={financeInput} type="date" aria-label="Fecha de despacho" value={day} onChange={(e) => setDay(e.target.value)} /></label>{access === "OPERATIONS" && <label>Profesional<select className={financeInput} aria-label="Profesional de despacho" value={professional} onChange={(e) => setProfessional(e.target.value)}><option value="">Todos</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}</div>}
    <div className="mb-4 flex items-center gap-2 border-y border-border py-4"><MapPin className="h-5 w-5 shrink-0 text-primary" /><div><b>Ubicación no disponible</b><p className="text-sm">Sin seguimiento activo ni ETA confirmado. No se recopila ubicación.</p></div></div>
    <FinanceSourceState sources={[visits, executions]}>
      {filtered.map((v, index) => {
        const pet = pets.find((p) => p.id === v.pet_id); const member = staff.find((s) => s.id === v.staff_id); const exec = executions.rows?.find((e) => e.visit_id === v.id);
        const next = v.staff_id ? filtered.slice(index + 1).find((n) => n.staff_id === v.staff_id) : undefined;
        return <Card key={v.id} className="mb-3"><div className="flex gap-3">{pet?.photo && <img src={pet.photo} alt={pet.name} className="h-16 w-16 shrink-0 rounded-lg object-cover" />}<div className="min-w-0"><b className="text-lg">{pet?.name ?? "Mascota"} · {v.service}</b><p>{v.operational_on ?? v.date} · {v.time}</p><p className="text-sm">{member?.name ?? "Asignación pendiente"} · {v.status}</p></div></div>
          <Timer row={exec} />
          {!family && <><p className="mt-2 text-sm">{next ? `Siguiente visita: ${next.time} · ${next.service}` : "Sin siguiente visita en esta selección"}</p><Link className="mt-3 inline-block font-bold text-primary" to={`${access === "OWN_ASSIGNMENTS" && isAux(roles) ? "/auxiliar" : "/equipo"}/visitas/${v.id}/tiempo` as never}>Abrir tiempo y atención</Link></>}
          {family && <p className="mt-3 text-sm">Estado de aviso al propietario: no disponible; no se ha confirmado entrega.</p>}
        </Card>;
      })}
      {!filtered.length && <Empty title={visitId ? "Visita no encontrada entre tus datos autorizados" : "Sin visitas visibles para esta selección"} />}
      {visitId && !family && filtered.length === 1 && <VisitExecution id={filtered[0]?.id ?? ""} embedded />}
    </FinanceSourceState>
    {access === "OPERATIONS" && <Link to="/operaciones/$" params={{ _splat: "simulador" }} className="font-bold text-primary">Revisar alternativas en el simulador</Link>}
  </>;
}
// Roles only select presentation links; authority stays in field-operation guards.
const isAux = (roles: readonly string[]) => roles.includes("auxiliar") && !roles.some((r) => ["veterinario", "administrador", "luis"].includes(r));
function DurationManager({ path }: { path: string }) {
  const uid = useVF((s) => s.userId); const save = useServerFn(saveDurationProposal);
  const rows = useFinanceRows<{ id: string; title: string; data: DurationPolicy; created_at: string }>("records", "dispatch_duration_proposal");
  const [form, setForm] = useState<DurationPolicy>({ name: "", category: "CONTROL", duration: 30, minimum: 15, maximum: 120, increment: 5, preparation: 0, administration: 0, reason: "" });
  const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  const valid = DurationPolicySchema.safeParse(form);
  return <><PageTitle title={dispatchScreen(path) ?? "Duraciones"} />
    <nav className="mb-4 flex flex-wrap gap-3 font-bold text-primary">{["tipos", "duraciones", "reglas-retrasos", "notificaciones"].map((p) => <Link key={p} to="/admin/$" params={{ _splat: `citas/${p}` }}>{p.replaceAll("-", " ")}</Link>)}</nav>
    {path.endsWith("reglas-retrasos") ? <Empty title="Política de retrasos no conectada" hint="Sin tolerancias productivas verificadas ni activación automática." /> : path.endsWith("notificaciones") ? <><SectionTitle>Previsualización de aviso</SectionTitle><p>Estamos verificando la hora estimada de llegada de tu profesional de Veterinaria Dr. Luis Ríos.</p><p className="my-3">Sin solicitud de envío ni entrega confirmada.</p><Btn disabled>Solicitar envío autorizado</Btn></> : <>
      <p className="mb-4 text-sm">Propuesta de configuración. Los valores iniciales no son duraciones clínicas aprobadas; no cambian citas ni disponibilidad oficial.</p>
      <div className="grid gap-3 sm:grid-cols-2"><label>Nombre<input className={financeInput} aria-label="Nombre del tipo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Categoría<select className={financeInput} value={form.category} onChange={(e) => setForm({ ...form, category: DurationPolicySchema.innerType().shape.category.parse(e.target.value) })}>{DurationPolicySchema.innerType().shape.category.options.map((c) => <option key={c}>{c}</option>)}</select></label>
        {([["duration", "Duración de servicio"], ["minimum", "Mínimo"], ["maximum", "Máximo"], ["increment", "Incremento"], ["preparation", "Preparación"], ["administration", "Registro administrativo"]] as const).map(([key, text]) => <label key={key}>{text} (min)<input className={financeInput} type="number" aria-label={text} value={form[key]} onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })} /></label>)}
      </div><label className="mt-3 block">Motivo y responsable<textarea className={financeInput} aria-label="Motivo de duración" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></label>
      <p className="my-3">Ocupación propuesta: {form.duration + form.preparation + form.administration} min · No incluye viaje.</p>
      <Btn disabled={!valid.success || busy || Boolean(uid?.startsWith("demo-"))} onClick={async () => { if (!valid.success) return; setBusy(true); try { await save({ data: valid.data }); await rows.reload(); setMessage("Propuesta guardada; sin política publicada ni cambios en citas"); } catch (error) { setMessage(error instanceof Error ? error.message : "Error al guardar"); } finally { setBusy(false); } }}><Save className="h-4 w-4" />Guardar borrador</Btn><Btn variant="outline" className="ml-2" disabled>Publicar configuración</Btn>
      {message && <p role="status" className="my-3">{message}</p>}
      <SectionTitle>Historial de propuestas</SectionTitle><FinanceSourceState sources={[rows]}>{rows.rows?.filter((r) => DurationPolicySchema.safeParse(r.data).success).map((r) => <Card key={r.id} className="mb-3"><b>{r.title}</b><p>{r.data.duration} min de servicio · {r.data.preparation} min preparación · {r.data.administration} min registro</p><p className="text-xs">{r.created_at} · Borrador no vigente</p></Card>)}</FinanceSourceState>
    </>}</>;
}