import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { FlaskConical, History } from "lucide-react";
import { useVF, actions, refreshVF } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { SIM_TYPES, SIM_LABEL, simulate, canTransition, type SimParams, type SimResult, type SimStatus } from "@/lib/vf/sim";
import { zones } from "@/lib/vf/data";
import { PageTitle, SectionTitle, Card, Empty, Btn, RowLink } from "../ui";
import { StatusTimeline, SIM_CYCLE, BeforeAfterPanel, ScenarioImpactCard, LoadingSkeleton, ErrorState, ConfirmationModal } from "../shared";
import { useRows } from "./useRow";
import { takeSnapshot, checkFreshness, generateAlternatives, scoreAlternatives, affectedClients, buildPlan, PROFILES, type Profile, type Snapshot } from "@/features/simulator/domain";

type Sim = { id: string; sim_type: string; title: string; params: SimParams; result: SimResult; status: SimStatus; approval_id: string | null; errors: string[]; created_at: string; executed_at: string | null };
const input = "w-full rounded-2xl bg-accent p-3";
const TONE: Record<SimStatus, string> = { simulado: "bg-secondary", propuesto: "bg-accent", aprobado: "bg-sage text-sage-foreground", ejecutado: "bg-gradient-primary text-primary-foreground", rechazado: "bg-secondary text-muted-foreground line-through" };
export const SimBadge = ({ s }: { s: SimStatus }) => <span className={`rounded-full px-3 py-1 text-xs font-bold ${TONE[s]}`}>{SIM_LABEL[s]}</span>;
const typeName = (id: string) => SIM_TYPES.find((t) => t.id === id)?.name ?? id;

function Dashboard({ base, history }: { base: string; history?: boolean }) {
  const { rows, error, reload } = useRows<Sim>("simulations");
  const list = (rows ?? []).slice().reverse().filter((s) => !history || s.status === "ejecutado" || s.status === "rechazado");
  const count = (st: SimStatus) => (rows ?? []).filter((s) => s.status === st).length;
  return (<><PageTitle title={history ? "Escenarios guardados" : "Simulador de agenda"} subtitle="Simular nunca cambia citas reales; solo se ejecuta lo aprobado por dirección" />
    {!history && <div className="mb-3 grid grid-cols-4 gap-2 text-center">{(["simulado", "propuesto", "aprobado", "ejecutado"] as SimStatus[]).map((s) => <Card key={s} className="p-3"><p className="text-2xl font-bold">{count(s)}</p><SimBadge s={s} /></Card>)}</div>}
    {!history && <div className="mb-3 flex gap-2"><Link to={`${base}/nueva` as never} className="flex-1"><Btn className="w-full"><FlaskConical className="h-5 w-5" />Crear escenario</Btn></Link><Link to={`${base}/historial` as never}><Btn variant="soft"><History className="h-5 w-5" />Historial</Btn></Link></div>}
    {error ? <ErrorState message={error} onRetry={() => void reload()} /> : !rows ? <LoadingSkeleton /> : list.length ? list.map((s) => <Link key={s.id} to={`${base}/${s.id}` as never} className="mb-2 block"><Card className="flex items-center justify-between gap-2"><div><p className="text-xs text-muted-foreground">{s.sim_type} · {typeName(s.sim_type)}</p><b>{s.title}</b><p className="text-sm text-muted-foreground">{s.result?.summary}</p></div><SimBadge s={s.status} /></Card></Link>) : <Empty title={history ? "Sin escenarios cerrados" : "Sin escenarios todavía"} hint="Crea uno para ver el impacto antes de decidir." />}</>);
}

function NewScenario({ base }: { base: string }) {
  const visits = useVF((s) => s.visits); const staff = useVF((s) => s.staff); const pets = useVF((s) => s.pets); const nav = useNavigate();
  const [type, setType] = useState("SIM-01"); const [p, setP] = useState<SimParams>({ staff: staff[0]?.id, zone: zones[0], visit: visits[0]?.id, minutes: 30, count: 5 });
  const t = SIM_TYPES.find((x) => x.id === type)!; const res = simulate(type, p, visits, staff);
  const save = async () => {
    const { data, error } = await db.from("simulations").insert({ params: { ...p, snapshot: takeSnapshot(visits, staff) } as never, sim_type: type, title: `${t.name}${p.staff && t.params.includes("staff") ? " · " + (staff.find((s) => s.id === p.staff)?.name ?? "") : ""}${p.zone && t.params.includes("zone") ? " · " + p.zone : ""}`, result: res }).select("id").single();
    if (error) { toast.error("No se pudo guardar: " + error.message); return; }
    toast.success("Escenario guardado como SIMULADO"); void nav({ to: `${base}/${data.id}` as never });
  };
  return (<><PageTitle title="Crear escenario" subtitle="Elige el tipo y ajusta los datos; nada cambia en la agenda real" />
    <Card className="mb-3 space-y-2"><label className="block text-sm font-bold">Tipo de simulación<select className={input} aria-label="Tipo de simulación" value={type} onChange={(e) => setType(e.target.value)}>{SIM_TYPES.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.name}</option>)}</select></label>
      <p className="text-sm text-muted-foreground">{t.desc}</p>
      {t.params.includes("staff") && <label className="block text-sm font-bold">Profesional<select className={input} aria-label="Profesional" value={p.staff} onChange={(e) => setP({ ...p, staff: e.target.value })}>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
      {t.params.includes("zone") && <label className="block text-sm font-bold">Zona<select className={input} aria-label="Zona" value={p.zone} onChange={(e) => setP({ ...p, zone: e.target.value })}>{zones.map((z) => <option key={z}>{z}</option>)}</select></label>}
      {t.params.includes("visit") && <label className="block text-sm font-bold">Cita<select className={input} aria-label="Cita" value={p.visit} onChange={(e) => setP({ ...p, visit: e.target.value })}>{visits.map((v) => <option key={v.id} value={v.id}>{v.date} {v.time} · {pets.find((x) => x.id === v.petId)?.name} · {v.service}</option>)}</select></label>}
      {t.params.includes("minutes") && <label className="block text-sm font-bold">Minutos<input type="number" className={input} aria-label="Minutos" value={p.minutes} onChange={(e) => setP({ ...p, minutes: Number(e.target.value) })} /></label>}
      {t.params.includes("count") && <label className="block text-sm font-bold">Solicitudes adicionales<input type="number" className={input} aria-label="Solicitudes adicionales" value={p.count} onChange={(e) => setP({ ...p, count: Number(e.target.value) })} /></label>}</Card>
    <SectionTitle>Vista previa</SectionTitle><Card className="mb-3"><b>{res.summary}</b>{res.changes.map((c) => <p key={c.visitId + c.field} className="text-sm text-muted-foreground">{c.label}</p>)}{res.warnings.map((w) => <p key={w} className="text-sm font-bold text-primary">⚠ {w}</p>)}</Card>
    <Btn className="w-full" onClick={() => void save()}>Guardar escenario</Btn></>);
}

function Scenario({ id, tab, base }: { id: string; tab?: string | undefined; base: string }) {
  const { rows, reload } = useRows<Sim>("simulations"); const approvals = useVF((s) => s.approvals); const isDir = useVF((s) => s.roles.includes("luis") || s.roles.includes("administrador"));
  const visits = useVF((s) => s.visits); const staffAll = useVF((st) => st.staff); const pets = useVF((st) => st.pets); const [confirm, setConfirm] = useState(false); const [busy, setBusy] = useState(false);
  const s = rows?.find((x) => x.id === id);
  if (!rows) return <LoadingSkeleton />; if (!s) return <Empty title="Escenario no encontrado" />;
  const ap = approvals.find((a) => a.id === s.approval_id);
  const upd = async (patch: Partial<Sim>, ok: string) => { const { error } = await db.from("simulations").update(patch).eq("id", id); if (error) { toast.error(error.message); return false; } toast.success(ok); await reload(); return true; };
  const propose = async () => {
    const aid = `sim-${id.slice(0, 8)}`; const { error } = await db.from("approvals").insert({ id: aid, title: `Escenario ${s.sim_type}: ${s.title}`, detail: s.result.summary, kind: "reorganizacion" });
    if (error && !/duplicate/i.test(error.message)) { toast.error(error.message); return; }
    await upd({ status: "propuesto", approval_id: aid }, "Enviado a dirección como PROPUESTO"); await refreshVF();
  };
  const decide = async (ok: boolean) => { if (s.approval_id) actions.decideApproval(s.approval_id, ok ? "aprobada" : "rechazada"); await upd({ status: ok ? "aprobado" : "rechazado" }, ok ? "Escenario APROBADO" : "Escenario rechazado"); };
  const syncApproved = () => upd({ status: ap?.status === "aprobada" ? "aprobado" : "rechazado" }, "Estado actualizado desde aprobaciones");
  const execute = async () => {
    if (!canTransition(s.status, "ejecutado")) return;
    if (fresh.status === "STALE") { toast.error("La agenda cambió desde la simulación. Revisa la pestaña Vigencia."); return; }
    setBusy(true); const errs: string[] = [];
    for (const c of s.result.changes) {
      const v = visits.find((x) => x.id === c.visitId); if (!v) { errs.push(`Cita ${c.visitId} ya no existe`); continue; }
      const cur = c.field === "staffId" ? v.staffId : c.field === "time" ? v.time : v.status;
      if ((cur ?? null) !== c.before) { errs.push(`${c.label}: la cita cambió desde la simulación, no se aplicó`); continue; }
      const col = c.field === "staffId" ? "staff_id" : c.field; const { error } = await db.from("visits").update({ [col]: c.after }).eq("id", c.visitId);
      if (error) errs.push(`${c.label}: ${error.message}`);
    }
    await upd({ status: "ejecutado", errors: errs, executed_at: new Date().toISOString() }, errs.length ? `Ejecutado con ${errs.length} errores parciales` : "Escenario EJECUTADO"); await refreshVF(); setBusy(false);
  };
  const fresh = checkFreshness((s.params as SimParams & { snapshot?: Snapshot }).snapshot, visits, staffAll, s.result.changes.map((c) => c.visitId));
  const tabs = [["", "Alternativas"], ["comparar", "Comparar"], ["clientes-afectados", "Clientes"], ["revalidacion", "Vigencia"], ["impacto", "Impacto"], ["antes-despues", "Antes/después"], ["aprobaciones", "Aprobación"], ["ejecucion", "Ejecución"], ["incidencias", "Errores"]];
  const step = { simulado: 0, propuesto: 1, aprobado: 2, ejecutado: 3, rechazado: 1 }[s.status];
  return (<><PageTitle title={s.title} subtitle={`${s.sim_type} · ${typeName(s.sim_type)}`}><SimBadge s={s.status} /></PageTitle>
    <div className="mb-3"><StatusTimeline steps={SIM_CYCLE} current={step} failed={s.status === "rechazado"} /></div>
    <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1">{tabs.map(([k, l]) => <Link key={k} to={`${base}/${id}${k ? "/" + k : ""}` as never} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${(tab ?? "") === k ? "bg-gradient-primary text-primary-foreground" : "bg-secondary"}`}>{l}</Link>)}</div>
    {!tab && <><Card className="mb-2"><b>{s.result.summary}</b>{s.result.warnings.map((w) => <p key={w} className="text-sm font-bold text-primary">⚠ {w}</p>)}</Card>{s.result.changes.length ? s.result.changes.map((c) => <Card key={c.visitId + c.field} className="mb-2"><p>{c.label}</p></Card>) : <Empty title="Este escenario no mueve citas" hint="Sirve para ver capacidad e impacto." />}</>}
    {tab === "comparar" && <Comparator s={s} />}
    {tab === "clientes-afectados" && (s.result.changes.length ? affectedClients(s.result, visits, pets).map((c) => <Card key={c.visitId} className="mb-2"><b>{c.owner} · {c.pet}</b><p className="text-sm">{c.change}</p><p className="text-xs text-muted-foreground">{c.needsContact ? "Hay que avisar al cliente antes de ejecutar" : "Cambio interno de profesional"}</p></Card>) : <Empty title="Ningún cliente afectado" />)}
    {tab === "revalidacion" && <Card><b>{fresh.status === "CURRENT" ? "Vigente: la agenda no cambió" : fresh.status === "PARTIALLY_STALE" ? "Parcialmente desactualizado" : "Desactualizado: vuelve a simular"}</b>{fresh.reasons.slice(0, 8).map((r) => <p key={r} className="text-sm text-muted-foreground">· {r}</p>)}</Card>}
    {tab === "impacto" && <div className="grid grid-cols-2 gap-2">{s.result.impact.length ? s.result.impact.map((i) => <ScenarioImpactCard key={i.label} {...i} />) : <Empty title="Sin impacto medible" />}</div>}
    {tab === "antes-despues" && <BeforeAfterPanel rows={s.result.impact.map((i) => ({ label: i.label, before: i.before, after: i.after }))} />}
    {tab === "aprobaciones" && <Card className="space-y-2">
      {s.status === "simulado" && <><p>Para cambiar la agenda real, el escenario debe pasar por dirección.</p><Btn onClick={() => void propose()}>Proponer a dirección</Btn></>}
      {s.status === "propuesto" && (ap && ap.status !== "pendiente" ? <><p>Dirección ya decidió: <b>{ap.status}</b>.</p><Btn onClick={() => void syncApproved()}>Actualizar estado</Btn></> : isDir ? <><p>¿Apruebas aplicar estos cambios a la agenda real?</p><div className="flex gap-2"><Btn onClick={() => void decide(true)}>Aprobar</Btn><Btn variant="soft" onClick={() => void decide(false)}>Rechazar</Btn></div></> : <p>Esperando la decisión de dirección.</p>)}
      {(s.status === "aprobado" || s.status === "ejecutado" || s.status === "rechazado") && <p>Estado: <SimBadge s={s.status} /></p>}</Card>}
    {tab === "ejecucion" && <Card className="space-y-2">{s.status === "aprobado" ? <><p>Se aplicarán {s.result.changes.length} cambios a citas reales. Si una cita cambió desde la simulación, no se toca y queda como error parcial.</p><p className="text-sm font-bold">Vigencia: {fresh.status === "CURRENT" ? "vigente" : fresh.status === "PARTIALLY_STALE" ? "parcial (se puede ejecutar)" : "desactualizado (bloqueado)"}</p>{buildPlan(s.id, s.result).map((st, i) => <p key={st.key} className="text-sm">{i + 1}. {st.label}</p>)}<Btn disabled={busy || !s.result.changes.length || fresh.status === "STALE"} onClick={() => setConfirm(true)}>Ejecutar plan</Btn></> : s.status === "ejecutado" ? <p>Ejecutado el {s.executed_at ? new Date(s.executed_at).toLocaleString("es-CO") : ""}.</p> : <p>Solo se ejecuta un escenario APROBADO. Estado actual: <SimBadge s={s.status} /></p>}</Card>}
    {tab === "incidencias" && (s.errors?.length ? s.errors.map((e) => <Card key={e} className="mb-2"><p>{e}</p></Card>) : <Empty title="Sin errores" />)}
    <ConfirmationModal open={confirm} title="Ejecutar escenario" body="Esto cambia citas reales de la agenda." confirmLabel="Ejecutar" onConfirm={() => void execute()} onClose={() => setConfirm(false)} /></>);
}

/** §22 Comparador: alternatives scored by profile; hard-constraint failures are never selectable. */
function Comparator({ s }: { s: Sim }) {
  const visits = useVF((st) => st.visits); const staff = useVF((st) => st.staff); const [profile, setProfile] = useState<Profile>("cliente");
  const { scored, best, note } = scoreAlternatives(generateAlternatives(s.sim_type, s.params, visits, staff).map((a) => (a.key === "base" ? { ...a, result: s.result } : a)), profile, visits, staff);
  return (<><select className={`${input} mb-2`} aria-label="Perfil de evaluación" value={profile} onChange={(e) => setProfile(e.target.value as Profile)}>{(Object.keys(PROFILES) as Profile[]).map((k) => <option key={k} value={k}>{PROFILES[k].label}</option>)}</select>
    <p className="mb-2 text-sm text-muted-foreground">{note}</p>
    <div className="grid gap-2 md:grid-cols-3">{scored.map((x) => <Card key={x.alt.key} className={best === x.alt.key ? "ring-2 ring-sage-foreground" : ""}>
      <div className="flex justify-between gap-2"><b>{x.alt.name}</b><span className="text-lg font-bold">{x.score === null ? "—" : x.score}</span></div>
      <p className="text-xs text-muted-foreground">{x.alt.goal}{best === x.alt.key ? " · recomendada" : ""}</p><p className="mt-1 text-sm">{x.alt.result.summary}</p>
      {x.explain.map((e) => <p key={e} className="text-xs text-muted-foreground">· {e}</p>)}
      {x.violations.map((v) => <p key={v} className="text-xs font-bold text-primary">✕ {v}</p>)}
      {!x.executable && <p className="mt-1 text-xs font-bold">No ejecutable</p>}</Card>)}</div>
    <p className="mt-2 text-xs text-muted-foreground">El escenario guardado es la «Propuesta principal». Para usar otra alternativa, crea un escenario nuevo con esos datos.</p></>);
}

export function simPage(base: string, b?: string, c?: string): ReactNode {
  if (!b) return <Dashboard base={base} />; if (b === "nueva") return <NewScenario base={base} />; if (b === "historial") return <Dashboard base={base} history />;
  return <Scenario id={b} tab={c} base={base} />;
}
void RowLink;
