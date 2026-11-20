import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Wifi, WifiOff } from "lucide-react";
import { db } from "@/lib/vf/db";
import { useVF, actions, getVF } from "@/lib/vf/store";
import { useMyStaff } from "@/lib/vf/me";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { useRecords, type Rec } from "@/components/vf/screens/records";
import { SERVICES, toMin } from "@/features/scheduling/domain";
import { applyExecEvent, nextEvents, stateFromStep, stepOf, EXEC_LABEL, EVENT_LABEL, calculateAvailableStock, evaluateBatchExpiration, evaluateReorderNeed, validateInventoryMovement, evaluateDayClose, prepareHandover, acceptHandover, handoverKey, evaluateWorkload, type Actor, type ExecEvent, type ExecState, type Handover, type Pending } from "../domain";

const inp = "w-full rounded-2xl bg-accent p-3";
const todayISO = () => new Date().toISOString().slice(0, 10);
function useActor(): Actor {
  const roles = useVF((s) => s.roles); const { me } = useMyStaff();
  if (roles.some((r) => r === "luis" || r === "administrador")) return "director";
  if (roles.includes("coordinador")) return "coordinador";
  return me?.role === "Auxiliar" ? "Auxiliar" : "Veterinario";
}

/** §7 Ejecución de visita: state + version stored in records(kind=visit_exec); write only succeeds if the version is unchanged. */
export function VisitExecution({ id }: { id: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id)); const pet = useVF((s) => s.pets.find((p) => p.id === v?.petId));
  const actor = useActor(); const { rows, reload } = useRecords("visit_exec", id); const [reason, setReason] = useState(""); const [busy, setBusy] = useState(false);
  if (!v) return <Empty title="Visita no encontrada" />;
  const rec = rows?.[0]; const state = (rec?.status as ExecState | undefined) ?? stateFromStep(v.step); const version = Number(rec?.data?.["version"] ?? 0);
  const prepDone = v.prep.length === 0 || (Array.isArray(rec?.data?.["prepChecked"]) && (rec!.data["prepChecked"] as string[]).length >= v.prep.length);
  const [checked, setChecked] = [(rec?.data?.["prepChecked"] as string[] | undefined) ?? [], null];
  const run = async (e: ExecEvent, extra: Record<string, unknown> = {}) => {
    const r = applyExecEvent({ state, version, expectedVersion: version, actor, prepDone, reason }, e);
    if (!r.ok) { toast.error(r.error); return; }
    setBusy(true);
    const data = { ...(rec?.data ?? {}), ...extra, version: r.version, [`at_${r.to}`]: new Date().toISOString(), ...(reason ? { reason } : {}) };
    const res = rec
      ? await db.from("records").update({ status: r.to, data, updated_at: new Date().toISOString() }).eq("id", rec.id).eq("status", state).select("id")
      : await db.from("records").insert({ kind: "visit_exec", scope: "staff", ref_id: id, title: `Ejecución ${v.service}`, detail: "", status: r.to, data, created_by: getVF().userId }).select("id");
    setBusy(false);
    if (res.error || (rec && !res.data?.length)) { toast.error(res.error ? "No se pudo guardar: " + res.error.message : "Otra persona cambió la visita. Recargando."); await reload(); return; }
    const step = stepOf(r.to); if (step && step !== v.step) actions.advanceStep(id, step);
    if (e === "INCIDENT_CREATED") actions.addIncident(`Incidencia en visita ${pet?.name ?? ""}`, reason);
    setReason(""); toast.success(EXEC_LABEL[r.to]); await reload();
  };
  const toggle = async (item: string) => {
    const next = checked.includes(item) ? checked.filter((x) => x !== item) : [...checked, item];
    if (rec) await db.from("records").update({ data: { ...rec.data, prepChecked: next } }).eq("id", rec.id);
    else await db.from("records").insert({ kind: "visit_exec", scope: "staff", ref_id: id, title: `Ejecución ${v.service}`, detail: "", status: "PREPARING", data: { version: 1, prepChecked: next }, created_by: getVF().userId });
    await reload();
  };
  const evs = nextEvents(state, actor);
  return (<><PageTitle title={`${pet?.name ?? "Visita"} · ${v.service}`} subtitle={`${v.date} · ${v.time} · ${v.zone}`} />
    <Card className="mb-3"><p className="text-sm text-muted-foreground">Estado de la visita en campo</p><b className="text-2xl">{EXEC_LABEL[state]}</b><p className="mt-1 text-xs text-muted-foreground">La cita sigue «{v.status.replace("_", " ")}»; el pago se registra aparte.</p></Card>
    {v.prep.length > 0 && <><SectionTitle>Preparación</SectionTitle>{v.prep.map((p) => <label key={p} className="mb-2 flex items-center gap-3 rounded-2xl bg-secondary p-3"><input type="checkbox" checked={checked.includes(p)} onChange={() => void toggle(p)} className="h-5 w-5" /> {p}</label>)}</>}
    <SectionTitle>Siguiente paso</SectionTitle>
    {evs.some((e) => e === "INCIDENT_CREATED" || e === "NOT_PERFORMED") && <textarea className={`${inp} mb-2`} placeholder="Motivo (para incidencia o no realizada)" value={reason} onChange={(e) => setReason(e.target.value)} />}
    {evs.length ? <div className="grid gap-2">{evs.map((e) => <Btn key={e} disabled={busy} variant={e === "INCIDENT_CREATED" || e === "NOT_PERFORMED" ? "outline" : "primary"} onClick={() => void run(e)}>{EVENT_LABEL[e]}</Btn>)}</div> : <Empty title={actor === "Auxiliar" && state === "ARRIVED" ? "El veterinario inicia la atención" : "No hay pasos disponibles para ti"} />}
    <Link to={"/equipo/ayuda" as never} className="mt-4 block text-center font-bold text-primary">Solicitar ayuda</Link></>);
}

/** §28 Cierre de jornada with critical items needing an accepted handover. */
export function DayCloseField() {
  const { me } = useMyStaff(); const staff = useVF((s) => s.staff);
  const visits = useVF((s) => s.visits.filter((v) => v.staffId === me?.id)); const tasks = useVF((s) => s.tasks.filter((t) => t.staffId === me?.id)); const incidents = useVF((s) => s.incidents);
  const closes = useRecords("cierre_jornada"); const ho = useRecords("handover");
  const [to, setTo] = useState(""); const [notes, setNotes] = useState("");
  if (!me) return <Empty title="Tu cuenta no está vinculada a un miembro del equipo" hint="Pide a Administración que la vincule." />;
  const day = todayISO(); const closed = (closes.rows ?? []).find((r) => r.ref_id === `${me.id}-${day}`);
  const mineHo = (ho.rows ?? []).filter((r) => (r.data["from"] as string) === me.id && r.created_at.slice(0, 10) === day);
  const acceptedIds = new Set(mineHo.filter((r) => r.status === "ACEPTADO").flatMap((r) => ((r.data["items"] as { id: string }[]) ?? []).map((i) => i.id)));
  const pending: Pending[] = [
    ...visits.filter((v) => v.status !== "finalizada" && v.status !== "cancelada").map((v) => ({ id: v.id, kind: "visita" as const, title: `${v.time} · ${v.service}`, critical: true })),
    ...tasks.filter((t) => !t.done).map((t) => ({ id: t.id, kind: "tarea" as const, title: t.title, critical: false })),
    ...incidents.filter((i) => i.status !== "cerrada" && i.owner === me.name).map((i) => ({ id: i.id, kind: "incidencia" as const, title: i.title, critical: i.severity === "alta" })),
  ].map((p) => ({ ...p, transferredTo: acceptedIds.has(p.id) ? "aceptado" : null }));
  const ev = evaluateDayClose(pending);
  const send = async () => {
    const h = prepareHandover(me.id, to, [...ev.blocking, ...ev.transferable].map((p) => ({ id: p.id, title: p.title, critical: p.critical })), notes);
    if (typeof h === "string") { toast.error(h); return; }
    if (mineHo.some((r) => r.ref_id === handoverKey(me.id, to, day) && r.status === "PENDIENTE_ACEPTACION")) { toast.error("Ya enviaste esta entrega; espera la respuesta."); return; }
    if (await ho.create({ title: `Entrega de ${me.name}`, ref_id: handoverKey(me.id, to, day), detail: notes, status: h.status, data: { ...h } })) setNotes("");
  };
  return (<><PageTitle title="Cierre de jornada" subtitle={me.name} />
    <div className="mb-3 grid grid-cols-3 gap-2 text-center"><Card><b className="text-2xl">{visits.filter((v) => v.status === "finalizada").length}</b><p className="text-xs">Visitas hechas</p></Card><Card><b className="text-2xl">{ev.blocking.length}</b><p className="text-xs">Críticos sin entregar</p></Card><Card><b className="text-2xl">{ev.transferable.length}</b><p className="text-xs">Menores</p></Card></div>
    <SectionTitle>Pendientes</SectionTitle>
    {pending.length ? pending.map((p) => <Card key={p.kind + p.id} className="mb-2 flex justify-between gap-2"><span><b>{p.title}</b><span className="block text-xs text-muted-foreground">{p.kind}{p.critical ? " · crítico" : ""}</span></span><span className="text-xs font-bold">{p.transferredTo ? "Entregado" : p.critical ? "Requiere responsable" : "Puede pasar"}</span></Card>) : <Empty title="Todo cerrado" />}
    {(ev.blocking.length > 0 || ev.transferable.length > 0) && <Card className="mt-3 space-y-2"><b>Entregar pendientes a otra persona</b>
      <select className={inp} aria-label="Recibe" value={to} onChange={(e) => setTo(e.target.value)}><option value="">¿Quién recibe?</option>{staff.filter((m) => m.id !== me.id).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
      <textarea className={inp} placeholder="Notas para quien recibe" value={notes} onChange={(e) => setNotes(e.target.value)} /><Btn onClick={() => void send()}>Enviar entrega</Btn></Card>}
    {mineHo.map((r) => <p key={r.id} className="mt-2 text-sm">Entrega a {staff.find((m) => m.id === r.data["to"])?.name}: <b>{r.status === "ACEPTADO" ? "aceptada" : r.status === "RECHAZADO" ? "rechazada" : "esperando aceptación"}</b></p>)}
    {closed ? <Card className="mt-3"><b>Jornada cerrada</b><p className="text-sm text-muted-foreground">{new Date(closed.created_at).toLocaleString("es-CO")}</p></Card>
      : <Btn className="mt-3 w-full" disabled={!ev.canClose} onClick={() => void closes.create({ title: `Cierre ${me.name} ${day}`, ref_id: `${me.id}-${day}`, detail: `${ev.transferable.length} menores pendientes, ${ev.transferred.length} entregados`, status: "solicitado" })}>{ev.canClose ? "Solicitar cierre" : "Entrega los pendientes críticos para cerrar"}</Btn>}</>);
}

/** §29 Entregas recibidas: only the incoming person accepts. */
export function HandoverInbox({ coordinator }: { coordinator?: boolean }) {
  const { me } = useMyStaff(); const staff = useVF((s) => s.staff); const { rows, update } = useRecords("handover"); const closes = useRecords("cierre_jornada");
  const name = (id: unknown) => staff.find((m) => m.id === id)?.name ?? String(id);
  const list = (rows ?? []).filter((r) => coordinator || r.data["to"] === me?.id);
  const answer = async (r: Rec, ok: boolean) => { const h = acceptHandover(r.data as unknown as Handover, me?.id ?? "", ok); if (typeof h === "string") { toast.error(h); return; } await update(r.id, { status: h.status, data: { ...r.data, ...h, answeredAt: new Date().toISOString() } }); };
  return (<><PageTitle title={coordinator ? "Cierre de turno" : "Entregas de turno"} subtitle={coordinator ? "Cierres solicitados y entregas entre profesionales" : "Pendientes que te entregaron"} />
    {coordinator && <><SectionTitle>Cierres de jornada</SectionTitle>{(closes.rows ?? []).length ? closes.rows!.slice(0, 10).map((r) => <Card key={r.id} className="mb-2"><b>{r.title}</b><p className="text-sm text-muted-foreground">{r.detail}</p>{r.status === "solicitado" && <Btn className="mt-2 px-4 py-2 text-sm" onClick={() => void closes.update(r.id, { status: "verificado" })}>Verificar cierre</Btn>}{r.status === "verificado" && <p className="text-sm font-bold">Verificado</p>}</Card>) : <Empty title="Sin cierres solicitados" />}<SectionTitle>Entregas</SectionTitle></>}
    {rows === null ? <p className="text-muted-foreground">Cargando…</p> : list.length ? list.map((r) => <Card key={r.id} className="mb-2"><b>{name(r.data["from"])} → {name(r.data["to"])}</b>
      {((r.data["items"] as { id: string; title: string; critical: boolean }[]) ?? []).map((i) => <p key={i.id} className="text-sm">· {i.title}{i.critical ? " (crítico)" : ""}</p>)}
      {r.detail && <p className="mt-1 text-sm text-muted-foreground">{r.detail}</p>}
      {r.status === "PENDIENTE_ACEPTACION" && !coordinator ? <div className="mt-2 grid grid-cols-2 gap-2"><Btn onClick={() => void answer(r, true)}>Aceptar</Btn><Btn variant="outline" onClick={() => void answer(r, false)}>Rechazar</Btn></div> : <p className="mt-1 text-sm font-bold">{r.status === "ACEPTADO" ? "Aceptada" : r.status === "RECHAZADO" ? "Rechazada" : "Esperando aceptación"}</p>}</Card>) : <Empty title="Sin entregas" />}</>);
}

/** §30 Employee experience monitor: operational signals only. */
export function WellbeingMonitor() {
  const staff = useVF((s) => s.staff); const visits = useVF((s) => s.visits); const help = useRecords("solicitud_ayuda");
  const [rows, setRows] = useState<{ staff_id: string | null; start_time: string; end_time: string; kind: string }[] | null>(null);
  useEffect(() => { void db.from("shifts").select("staff_id,start_time,end_time,kind").then(({ data }: { data: unknown }) => setRows((data as never) ?? [])); }, []);
  const evals = useMemo(() => staff.map((m) => {
    const sh = (rows ?? []).filter((r) => r.staff_id === m.id && r.kind !== "ausencia"); const shiftMinutes = sh.length ? Math.max(...sh.map((r) => toMin(r.end_time) - toMin(r.start_time))) : 0;
    const mv = visits.filter((v) => v.staffId === m.id && v.status !== "cancelada"); const serviceMinutes = mv.reduce((n, v) => n + (SERVICES.find((s) => s.name === v.service)?.duration ?? 45), 0);
    return { m, e: evaluateWorkload({ staffId: m.id, shiftMinutes, serviceMinutes, travelMinutes: mv.length * 25, visits: mv.length, hasBreak: shiftMinutes >= 360, helpRequests: (help.rows ?? []).filter((r) => r.data["staffId"] === m.id).length, reassignments: 0, absent: m.status === "ausente" }) };
  }), [staff, visits, rows, help.rows]);
  const L = { sin_turno: "Sin turno registrado", ausente: "Ausente", normal: "Carga normal", alta: "Carga alta", sobrecarga: "Sobrecarga" };
  return (<><PageTitle title="Bienestar y carga del equipo" subtitle="Solo datos de agenda y turnos; no se evalúa salud ni estado personal" />
    {rows === null ? <p className="text-muted-foreground">Calculando…</p> : evals.map(({ m, e }) => <Card key={m.id} className="mb-2"><div className="flex justify-between"><b>{m.name}</b><span className={e.level === "sobrecarga" ? "font-bold text-primary" : "text-sm"}>{L[e.level]}{e.level !== "sin_turno" && e.level !== "ausente" ? ` · ${e.loadPct}%` : ""}</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-card"><div className={`h-full ${e.level === "sobrecarga" ? "bg-destructive" : "bg-gradient-primary"}`} style={{ width: `${Math.min(100, e.loadPct)}%` }} /></div>
      {e.signals.map((s) => <p key={s} className="mt-1 text-sm text-muted-foreground">· {s}</p>)}</Card>)}
    <p className="mt-2 text-xs text-muted-foreground">Desplazamiento estimado: 25 min por visita. Estas cifras sirven para repartir carga, no para acortar el tiempo clínico.</p></>);
}

/** §17–18 Kit e inventario: available = physical − reserved; movements need a reason. */
export function KitInventory() {
  const items = useVF((s) => s.items); const [sel, setSel] = useState(""); const [qty, setQty] = useState(-1); const [why, setWhy] = useState("");
  const now = new Date(); const E = { vencido: "Vencido", por_vencer: "Por vencer", vigente: "Vigente", sin_fecha: "Sin fecha" };
  const move = () => { const i = items.find((x) => x.id === sel); if (!i) { toast.error("Elige un insumo"); return; } const err = validateInventoryMovement(i, qty, why); if (err) { toast.error(err); return; } actions.moveStock(i.id, qty); toast.success("Movimiento registrado"); setWhy(""); };
  return (<><PageTitle title="Kit e insumos" subtitle="Existencias registradas, vencimientos y reposición" />
    {items.length ? items.map((i) => { const ex = evaluateBatchExpiration(i, now); return <Card key={i.id} className="mb-2 flex justify-between gap-2"><span><b>{i.name}</b><span className="block text-xs text-muted-foreground">Lote {i.lot} · {E[ex]}</span></span><span className="text-right text-sm"><b>{calculateAvailableStock(i)}</b> disp.{evaluateReorderNeed(i) && <span className="block text-xs font-bold text-primary">Reponer</span>}</span></Card>; }) : <Empty title="Sin insumos registrados" />}
    <Card className="mt-3 space-y-2"><b>Registrar movimiento</b>
      <select className={inp} aria-label="Insumo" value={sel} onChange={(e) => setSel(e.target.value)}><option value="">Insumo</option>{items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
      <input type="number" className={inp} aria-label="Cantidad" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
      <input className={inp} placeholder="Motivo (uso en visita, reposición…)" value={why} onChange={(e) => setWhy(e.target.value)} /><Btn onClick={move}>Registrar</Btn></Card></>);
}

/** §34 Connection banner. */
export function ConnectionBanner() {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(navigator.onLine); const a = () => setOn(true); const b = () => setOn(false); addEventListener("online", a); addEventListener("offline", b); return () => { removeEventListener("online", a); removeEventListener("offline", b); }; }, []);
  if (on) return null;
  return <div role="status" className="sticky top-0 z-50 flex items-center gap-2 bg-amber px-4 py-2 text-sm font-bold text-amber-foreground"><WifiOff className="h-4 w-4" /> Sin conexión: llegadas, servicios, inventario y pagos se bloquean hasta volver a estar en línea.</div>;
}
void Wifi;

export function fieldPage(path: string): ReactNode | null {
  const p = path.replace(/\/$/, "");
  let m = p.match(/^\/(equipo|auxiliar)\/visitas\/([^/]+)\/ejecucion$/); if (m) return <VisitExecution id={m[2]!} />;
  if (p === "/equipo/cierre-jornada" || p === "/auxiliar/cierre-jornada") return <DayCloseField />;
  if (p === "/equipo/traspasos" || p === "/auxiliar/traspasos") return <HandoverInbox />;
  if (p === "/operaciones/cierre-turno" || p === "/operaciones/traspasos") return <HandoverInbox coordinator />;
  if (p === "/operaciones/bienestar") return <WellbeingMonitor />;
  if (p === "/equipo/kit" || p === "/equipo/inventario") return <KitInventory />;
  return null;
}
