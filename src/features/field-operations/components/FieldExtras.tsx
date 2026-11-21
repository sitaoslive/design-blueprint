import { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { useVF, actions, getVF, refreshVF } from "@/lib/vf/store";
import { useMyStaff } from "@/lib/vf/me";
import { formatCOP } from "@/lib/vf/format";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { useRecords } from "@/components/vf/screens/records";
import { evaluateBatchExpiration, evaluateReorderNeed, validateInventoryMovement, validateFieldCollection, collectionKey, FIELD_METHODS, syncLabel, evaluateWorkload } from "../domain";
import { useOfflineQueue, flushQueue } from "./offlineQueue";
import { KitTracking } from "./AdvancedPages";
import { fieldWrite, uploadFieldEvidence, openFieldEvidence } from "./advancedData";

const inp = "w-full rounded-2xl bg-accent p-3";
const isDemo = () => !!getVF().userId?.startsWith("demo-");
type Res = { id: string; item_id: string; visit_id: string | null; qty: number; status: string; created_at: string };

/** §17–18 Kit: reservations go through reserve_supply/settle_reservation (atomic, idempotent, server-side). */
export function KitInventory() {
  const items = useVF((s) => s.items); const visits = useVF((s) => s.visits); const { mineVisit } = useMyStaff(); const canAdjust = useVF((s) => !s.roles.includes("auxiliar") || s.roles.some((r) => ["veterinario", "luis", "administrador", "coordinador"].includes(r)));
  const [res, setRes] = useState<Res[]>([]); const [f, setF] = useState({ item: "", visit: "", qty: 1 }); const [mv, setMv] = useState({ item: "", qty: -1, why: "" }); const [busy, setBusy] = useState(false);
  const [totals, setTotals] = useState<{ item_id: string; reserved: number }[]>([]);
  const load = async () => { const [reservations, availability] = await Promise.all([db.from("inventory_reservations").select("*").order("created_at", { ascending: false }), db.rpc("inventory_availability")]); if (reservations.error || availability.error) toast.error("No se pudieron cargar los insumos apartados"); setRes((reservations.data as Res[] | null) ?? []); setTotals((availability.data as { item_id: string; reserved: number }[] | null) ?? []); };
  useEffect(() => { void load(); }, []);
  const reserved = (id: string) => Number(totals.find((r) => r.item_id === id)?.reserved ?? res.filter((r) => r.item_id === id && r.status === "reservado").reduce((n, r) => n + r.qty, 0));
  const myVisits = visits.filter((v) => mineVisit(v) && v.status !== "cancelada" && v.status !== "finalizada");
  const now = new Date(); const E = { vencido: "Vencido", por_vencer: "Por vencer", vigente: "Vigente", sin_fecha: "Sin fecha" };
  const reserve = async () => {
    if (!f.item || !f.visit || f.qty < 1) { toast.error("Elige insumo, visita y cantidad"); return; }
    if (!navigator.onLine) { toast.error("Requiere conexión para apartar insumos"); return; }
    if (isDemo()) { toast.success("Insumo apartado (demo, no se guarda)"); return; }
    setBusy(true); const { error } = await db.rpc("reserve_supply", { _item: f.item, _visit: f.visit, _qty: f.qty, _key: `res:${f.visit}:${f.item}:${f.qty}` }); setBusy(false);
    if (error) toast.error(error.message); else { toast.success("Insumo apartado"); await load(); }
  };
  const settle = async (r: Res, consume: boolean) => {
    if (isDemo()) { toast.success("Hecho (demo)"); return; }
    const { error } = await db.rpc("settle_reservation", { _id: r.id, _consume: consume });
    if (error) toast.error(error.message); else { toast.success(consume ? "Consumo registrado" : "Reserva liberada"); await load(); await refreshVF(); }
  };
  const move = async () => { const i = items.find((x) => x.id === mv.item); if (!i) { toast.error("Elige un insumo"); return; } const err = validateInventoryMovement({ ...i, reserved: reserved(i.id) }, mv.qty, mv.why); if (err) { toast.error(err); return; } if (!await actions.moveStock(i.id, mv.qty)) return; toast.success("Movimiento registrado"); setMv({ ...mv, why: "" }); };
  return (<><PageTitle title="Kit e insumos" subtitle="Físico, apartado y disponible; apartar se valida en el servidor" />
    {items.length ? items.map((i) => { const r = reserved(i.id); const av = Math.max(0, i.stock - r); const ex = evaluateBatchExpiration(i, now);
      return <Card key={i.id} className="mb-2 flex justify-between gap-2"><span><b>{i.name}</b><span className="block text-xs text-muted-foreground">Lote {i.lot} · {E[ex]}</span></span><span className="text-right text-xs">Físico {i.stock} · apartado {r}<b className="block text-base">{av} disponibles</b>{evaluateReorderNeed({ ...i, reserved: r }) && <span className="font-bold text-primary">Reponer</span>}</span></Card>; }) : <Empty title="Sin insumos registrados" />}
    <Card className="mt-3 space-y-2"><b>Apartar para una visita</b>
      <select className={inp} aria-label="Insumo a apartar" value={f.item} onChange={(e) => setF({ ...f, item: e.target.value })}><option value="">Insumo</option>{items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
      <select className={inp} aria-label="Visita" value={f.visit} onChange={(e) => setF({ ...f, visit: e.target.value })}><option value="">Visita</option>{myVisits.map((v) => <option key={v.id} value={v.id}>{v.date} {v.time} · {v.service}</option>)}</select>
      <input type="number" min={1} className={inp} aria-label="Cantidad a apartar" value={f.qty} onChange={(e) => setF({ ...f, qty: Number(e.target.value) })} /><Btn disabled={busy} onClick={() => void reserve()}>Apartar</Btn></Card>
    {res.filter((r) => r.status === "reservado").length > 0 && <><SectionTitle>Apartados</SectionTitle>{res.filter((r) => r.status === "reservado").map((r) => <Card key={r.id} className="mb-2"><b>{items.find((i) => i.id === r.item_id)?.name} × {r.qty}</b><p className="text-xs text-muted-foreground">Visita {visits.find((v) => v.id === r.visit_id)?.service ?? r.visit_id}</p><div className="mt-2 grid grid-cols-2 gap-2"><Btn className="py-2 text-sm" onClick={() => void settle(r, true)}>Usado</Btn><Btn variant="outline" className="py-2 text-sm" onClick={() => void settle(r, false)}>Liberar</Btn></div></Card>)}</>}
    {canAdjust && <Card className="mt-3 space-y-2"><b>Ajuste manual</b>
      <select className={inp} aria-label="Insumo" value={mv.item} onChange={(e) => setMv({ ...mv, item: e.target.value })}><option value="">Insumo</option>{items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
      <input type="number" className={inp} aria-label="Cantidad" value={mv.qty} onChange={(e) => setMv({ ...mv, qty: Number(e.target.value) })} />
      <input className={inp} placeholder="Motivo (reposición, conteo…)" value={mv.why} onChange={(e) => setMv({ ...mv, why: e.target.value })} /><Btn variant="outline" onClick={move}>Registrar ajuste</Btn></Card>}<KitTracking /></>);
}

/** §34 Pendientes de enviar. */
export function OfflineQueuePage() {
  const q = useOfflineQueue();
  return (<><PageTitle title="Pendientes de enviar" subtitle="Notas y listas guardadas sin conexión; se borran del celular a las 24 h" />
    {q.length ? q.map((a) => <Card key={a.key} className="mb-2 flex justify-between gap-2"><span><b>{String(a.payload["title"] ?? a.kind)}</b><span className="block text-xs text-muted-foreground">Capturado {new Date(a.capturedAt).toLocaleString("es-CO")}{a.acceptedAt ? ` · recibido ${new Date(a.acceptedAt).toLocaleTimeString("es-CO")}` : ""}</span></span><span className="text-xs font-bold">{syncLabel(a.state)}</span></Card>) : <Empty title="Nada pendiente" />}
    <Btn className="mt-2 w-full" onClick={() => void flushQueue()}>Reintentar envío</Btn>
    <p className="mt-2 text-xs text-muted-foreground">Llegadas, servicios, insumos, cobros y cambios de estado no se guardan sin internet.</p></>);
}

/** §21 Cobros informados en campo → Finanzas verifica. */
export function FieldCollections({ finance, visitId }: { finance?: boolean; visitId?: string }) {
  const visits = useVF((s) => s.visits); const pets = useVF((s) => s.pets); const { mineVisit } = useMyStaff(); const { rows, create, update } = useRecords("cobro_campo");
  const [f, setF] = useState({ visitId: visitId ?? "", amount: 120000, method: FIELD_METHODS[0] as string, reference: "" });
  const [balance, setBalance] = useState<{ authorized: number | null; verified: number; reported: number; balance: number; availableToReport: number } | null>(null);
  const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false); const fileInput = useRef<HTMLInputElement>(null);
  const mine = visits.filter(mineVisit);
  const name = (id: string | null) => { const v = visits.find((x) => x.id === id); return v ? `${pets.find((p) => p.id === v.petId)?.name ?? ""} · ${v.date} ${v.time}` : id; };
  useEffect(() => { if (!f.visitId) { setBalance(null); return; } void db.rpc("field_billing_balance", { _visit: f.visitId }).then(({ data, error }: { data: typeof balance; error: unknown }) => { if (!error) setBalance(data); }); }, [f.visitId, rows]);
  const submit = async () => {
    const err = validateFieldCollection(f); if (err) { toast.error(err); return; }
    if (!navigator.onLine) { toast.error("Requiere conexión para informar un cobro"); return; }
    const key = collectionKey(f); if ((rows ?? []).some((r) => r.data["key"] === key)) { toast.error("Ese cobro ya fue informado"); return; }
    setBusy(true);
    try {
      const path = file ? await uploadFieldEvidence(file, { visitId: f.visitId }) : null;
      if (await create({ title: `Cobro ${formatCOP(f.amount)}`, ref_id: f.visitId, detail: f.method, status: "informado", data: { key, amount: f.amount, method: f.method, reference: f.reference, ...(path ? { evidencePath: path } : {}) } })) { setF({ ...f, reference: "" }); setFile(null); if (fileInput.current) fileInput.current.value = ""; }
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo adjuntar el comprobante"); }
    finally { setBusy(false); }
  };
  return (<><PageTitle title={finance ? "Cobros informados en campo" : "Informar cobro"} subtitle="Verificación y saldo separados del servicio" />
    {!finance && <div className="mb-5 space-y-3">
      <select className={inp} aria-label="Visita" value={f.visitId} onChange={(e) => setF({ ...f, visitId: e.target.value })}><option value="">Visita</option>{mine.map((v) => <option key={v.id} value={v.id}>{name(v.id)}</option>)}</select>
      {balance && <div className="grid grid-cols-2 gap-3 text-sm"><p>Autorizado<b className="block">{balance.authorized === null ? "Pendiente" : formatCOP(balance.authorized)}</b></p><p>Verificado<b className="block">{formatCOP(balance.verified)}</b></p><p>Informado sin verificar<b className="block">{formatCOP(balance.reported)}</b></p><p>Saldo<b className="block">{formatCOP(balance.balance)}</b></p></div>}
      <label className="block text-sm font-bold">Valor recibido<input type="number" className={inp} aria-label="Monto en pesos" value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} /></label>
      <select className={inp} aria-label="Forma de pago" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>{FIELD_METHODS.map((m) => <option key={m}>{m}</option>)}</select>
      {f.method !== "Efectivo" && <input className={inp} aria-label="Referencia de pago" placeholder="Referencia" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} />}
      <input ref={fileInput} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" aria-label="Comprobante de pago" className="w-full text-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <Btn disabled={busy || !f.visitId || (!isDemo() && (balance?.authorized == null || f.amount > (balance?.availableToReport ?? 0)))} onClick={() => void submit()}>Informar cobro</Btn></div>}
    {rows === null ? <p className="text-muted-foreground">Cargando…</p> : rows.length ? rows.map((r) => <Card key={r.id} className="mb-2"><div className="flex flex-wrap justify-between gap-2"><b>{formatCOP(Number(r.data["amount"] ?? 0))}</b><span className="text-xs font-bold">{r.status === "verificado" ? "Verificado" : r.status === "rechazado" ? "Rechazado" : "Informado"}</span></div><p className="text-sm text-muted-foreground">{name(r.ref_id)} · {r.detail}{r.data["reference"] ? ` · ref ${String(r.data["reference"])}` : ""}</p>
      {Boolean(r.data["evidencePath"]) && <Btn variant="outline" className="mt-2" onClick={() => void openFieldEvidence(String(r.data["evidencePath"]))}>Ver comprobante</Btn>}
      {finance && r.status === "informado" && <div className="mt-2 grid grid-cols-2 gap-2"><Btn className="py-2 text-sm" onClick={() => void update(r.id, { status: "verificado" })}>Verificar</Btn><Btn variant="outline" className="py-2 text-sm" onClick={() => void update(r.id, { status: "rechazado" })}>Rechazar</Btn></div>}</Card>) : <Empty title="Sin cobros informados" />}</>);
}

type Msg = { id: string; from_user: string; from_name: string; to_staff: string | null; visit_id: string | null; task_id?: string | null; attachment_path?: string | null; body: string; urgent: boolean; read_at: string | null; created_at: string };
/** §24 Comunicación interna. */
export function StaffMessages() {
  const staff = useVF((s) => s.staff); const name = useVF((s) => s.displayName); const { me } = useMyStaff();
  const [list, setList] = useState<Msg[] | null>(null); const [f, setF] = useState({ to: "", body: "", urgent: false, visit: "", task: "" });
  const visits = useVF((s) => s.visits); const tasks = useVF((s) => s.tasks); const { mineVisit } = useMyStaff(); const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false); const fileInput = useRef<HTMLInputElement>(null); const [thread, setThread] = useState("");
  const load = async () => { const { data } = await db.from("staff_messages").select("*").order("created_at", { ascending: false }).limit(100); setList((data as Msg[] | null) ?? []); };
  useEffect(() => { void load(); const t = setInterval(() => void load(), 20000); return () => clearInterval(t); }, []);
  const sendMsg = async () => {
    if (!f.body.trim()) return; if (!navigator.onLine) { toast.error("Requiere conexión"); return; }
    if (isDemo()) { setList([{ id: "x" + Date.now(), from_user: "yo", from_name: name, to_staff: f.to || null, visit_id: null, body: f.body, urgent: f.urgent, read_at: null, created_at: new Date().toISOString() }, ...(list ?? [])]); setF({ ...f, body: "" }); return; }
    setBusy(true);
    try {
      const path = file ? await uploadFieldEvidence(file, { ...(f.visit ? { visitId: f.visit } : {}), ...(f.task ? { taskId: f.task } : {}), ...(f.to ? { toStaff: f.to } : {}) }) : null;
      if (await fieldWrite(db.from("staff_messages").insert({ from_name: name, to_staff: f.to || null, body: f.body.trim(), urgent: f.urgent, visit_id: f.visit || null, task_id: f.task || null, attachment_path: path }))) { setF({ ...f, body: "" }); setFile(null); if (fileInput.current) fileInput.current.value = ""; await load(); }
    } catch (error) { toast.error(error instanceof Error ? error.message : "No se pudo adjuntar el archivo"); }
    finally { setBusy(false); }
  };
  const markRead = async (m: Msg) => {
    if (!isDemo()) {
      const { data, error } = await db.from("staff_messages").update({ read_at: new Date().toISOString() }).eq("id", m.id).select("id");
      if (error || !data?.length) { toast.error("No se pudo marcar el mensaje como leído"); return; }
    }
    await load();
  };
  return (<><PageTitle title="Mensajes del equipo" subtitle="Comunicación interna; no compartas datos clínicos sensibles" />
    <Card className="mb-3 space-y-2">
      <select className={inp} aria-label="Para" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })}><option value="">Todo el equipo</option>{staff.filter((m) => m.id !== me?.id).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
      <select className={inp} aria-label="Contexto de visita" value={f.visit} onChange={(e) => setF({ ...f, visit: e.target.value })}><option value="">Sin visita vinculada</option>{visits.filter(mineVisit).map((v) => <option key={v.id} value={v.id}>{v.date} · {v.service}</option>)}</select>
      <select className={inp} aria-label="Contexto de tarea" value={f.task} onChange={(e) => setF({ ...f, task: e.target.value })}><option value="">Sin tarea vinculada</option>{tasks.filter((t) => t.staffId === me?.id).map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
      <input ref={fileInput} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" aria-label="Adjunto del mensaje" className="w-full text-sm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <textarea className={inp} placeholder="Mensaje" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.urgent} onChange={(e) => setF({ ...f, urgent: e.target.checked })} /> Urgente</label>
      <Btn disabled={busy || !f.body.trim()} onClick={() => void sendMsg()}>Enviar</Btn></Card>
    <select className={`${inp} mb-3`} aria-label="Filtrar conversación" value={thread} onChange={(e) => setThread(e.target.value)}><option value="">Todos los mensajes</option>{visits.filter(mineVisit).map((v) => <option key={v.id} value={v.id}>{v.service} · {v.date}</option>)}</select>
    {list === null ? <p className="text-muted-foreground">Cargando…</p> : list.length ? list.filter((m) => !thread || m.visit_id === thread).map((m) => <Card key={m.id} className="mb-2"><div className="flex justify-between gap-2"><b>{m.from_name || "Equipo"} → {m.to_staff ? staff.find((s) => s.id === m.to_staff)?.name : "Todos"}</b>{m.urgent && <span className="rounded-full bg-blush px-2 text-xs font-bold">Urgente</span>}</div><p>{m.body}</p>{m.visit_id && <p className="text-sm">Visita: {visits.find((v) => v.id === m.visit_id)?.service}</p>}{m.task_id && <p className="text-sm">Tarea: {tasks.find((t) => t.id === m.task_id)?.title}</p>}{m.attachment_path && <Btn variant="outline" className="mt-2" onClick={() => void openFieldEvidence(m.attachment_path ?? "")}>Abrir adjunto</Btn>}<p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("es-CO")}</p>
      {me && m.to_staff === me.id && !m.read_at && <Btn variant="outline" className="mt-2 px-3 py-1 text-sm" onClick={() => void markRead(m)}>Marcar leído</Btn>}</Card>) : <Empty title="Sin mensajes" />}</>);
}

/** §32 Panel de Luis: field operations at a glance (read-only, real data). */
export function LuisFieldPanel() {
  const visits = useVF((s) => s.visits); const staff = useVF((s) => s.staff); const incidents = useVF((s) => s.incidents);
  const [ex, setEx] = useState<{ visit_id: string; state: string }[]>([]);
  const cobros = useRecords("cobro_campo"); const ho = useRecords("handover"); const closes = useRecords("cierre_jornada");
  useEffect(() => { void db.from("visit_executions").select("visit_id,state").then(({ data }: { data: unknown }) => setEx((data as never) ?? [])); }, []);
  const by = (s: string[]) => ex.filter((e) => s.includes(e.state)).length;
  const informed = (cobros.rows ?? []).filter((r) => r.status === "informado").reduce((n, r) => n + Number(r.data["amount"] ?? 0), 0);
  const overloaded = useMemo(() => staff.filter((m) => evaluateWorkload({ staffId: m.id, shiftMinutes: 480, serviceMinutes: visits.filter((v) => v.staffId === m.id).length * 45, travelMinutes: visits.filter((v) => v.staffId === m.id).length * 25, visits: 0, hasBreak: true, helpRequests: 0, reassignments: 0, absent: m.status === "ausente" }).level === "sobrecarga").length, [staff, visits]);
  const tiles: [string, number | string, string][] = [
    ["En camino o en atención", by(["EN_ROUTE", "ARRIVED", "IN_SERVICE"]), "/operaciones/agenda"], ["Servicios finalizados", by(["SERVICE_FINISHED", "ADMINISTRATIVE_REVIEW", "ADMINISTRATIVELY_COMPLETED"]), "/operaciones/cierre-turno"],
    ["No realizadas", by(["NOT_PERFORMED"]), "/operaciones/agenda"], ["Incidencias abiertas", incidents.filter((i) => i.status !== "cerrada").length, "/operaciones/incidencias"],
    ["Cobros por verificar", formatCOP(informed), "/finanzas/cobros-campo"], ["Entregas sin aceptar", (ho.rows ?? []).filter((r) => r.status === "PENDIENTE_ACEPTACION").length, "/operaciones/cierre-turno"],
    ["Cierres por verificar", (closes.rows ?? []).filter((r) => r.status === "solicitado").length, "/operaciones/cierre-turno"], ["Personas con sobrecarga", overloaded, "/operaciones/bienestar"],
  ];
  return (<><PageTitle title="Operación de campo" subtitle={`${visits.length} visitas · ${staff.filter((m) => m.status !== "ausente").length} profesionales activos`} />
    <div className="grid grid-cols-2 gap-2">{tiles.map(([l, v, to]) => <Link key={l} to={to as never}><Card className="h-full"><b className="text-2xl">{v}</b><p className="text-sm text-muted-foreground">{l}</p></Card></Link>)}</div>
    <p className="mt-3 text-xs text-muted-foreground">Solo lectura. Las decisiones se toman en cada módulo.</p></>);
}
