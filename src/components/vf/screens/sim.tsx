import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { FlaskConical, History } from "lucide-react";
import { useVF, actions, refreshVF } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { ALL_SIM_TYPES as ALL_TYPES0, SIM_TYPES, SIM_LABEL, simulate, canTransition, type SimParams, type SimResult, type SimStatus } from "@/lib/vf/sim";
import { zones } from "@/lib/vf/data";
import { PageTitle, SectionTitle, Card, Empty, Btn, RowLink } from "../ui";
import { StatusTimeline, SIM_CYCLE, BeforeAfterPanel, ScenarioImpactCard, LoadingSkeleton, ErrorState, ConfirmationModal } from "../shared";
import { useRows } from "./useRow";
import { ADV_TYPES, type AParams } from "@/lib/vf/simAdvanced";
import { takeSnapshot, checkFreshness, generateAlternatives, scoreAlternatives, affectedClients, buildPlan, PROFILES, type Profile, type Snapshot } from "@/features/simulator/domain";

type Sim = { id: string; sim_type: string; title: string; params: SimParams; result: SimResult; status: SimStatus; approval_id: string | null; errors: string[]; created_at: string; executed_at: string | null };
const input = "w-full rounded-2xl bg-accent p-3";
const TONE: Record<SimStatus, string> = { simulado: "bg-secondary", propuesto: "bg-accent", aprobado: "bg-sage text-sage-foreground", ejecutado: "bg-gradient-primary text-primary-foreground", rechazado: "bg-secondary text-muted-foreground line-through" };
export const SimBadge = ({ s }: { s: SimStatus }) => <span className={`rounded-full px-3 py-1 text-xs font-bold ${TONE[s]}`}>{SIM_LABEL[s]}</span>;
const ALL_TYPES = [...ADV_TYPES, ...SIM_TYPES.map((x) => ({ ...x, params: x.params as string[] }))]; void ALL_TYPES0;
const typeName = (id: string) => ALL_TYPES.find((t) => t.id === id)?.name ?? id;

function Dashboard({ base, history }: { base: string; history?: boolean }) {
  const { rows, error, reload } = useRows<Sim>("simulations");
  const list = (rows ?? []).slice().reverse().filter((s) => !history || s.status === "ejecutado" || s.status === "rechazado");
  const count = (st: SimStatus) => (rows ?? []).filter((s) => s.status === st).length;
  return (<><PageTitle title={history ? "Escenarios guardados" : "Simulador de agenda"} subtitle="Simular nunca cambia citas reales; solo se ejecuta lo aprobado por dirección" />
    {!history && <div className="mb-3 grid grid-cols-4 gap-2 text-center">{(["simulado", "propuesto", "aprobado", "ejecutado"] as SimStatus[]).map((s) => <Card key={s} className="p-3"><p className="text-2xl font-bold">{count(s)}</p><SimBadge s={s} /></Card>)}</div>}
    {!history && <div className="mb-3 flex gap-2"><Link to={`${base}/nueva` as never} className="flex-1"><Btn className="w-full"><FlaskConical className="h-5 w-5" />Crear escenario</Btn></Link><Link to={`${base}/historial` as never}><Btn variant="soft"><History className="h-5 w-5" />Historial</Btn></Link></div>}
    {error ? <ErrorState message={error} onRetry={() => void reload()} /> : !rows ? <LoadingSkeleton /> : list.length ? list.map((s) => <Link key={s.id} to={`${base}/${s.id}` as never} className="mb-2 block"><Card className="flex items-center justify-between gap-2"><div><p className="text-xs text-muted-foreground">{s.sim_type} · {typeName(s.sim_type)}</p><b>{s.title}</b><p className="text-sm text-muted-foreground">{s.result?.summary}</p></div><SimBadge s={s.status} /></Card></Link>) : <Empty title={history ? "Sin escenarios cerrados" : "Sin escenarios todavía"} hint="Crea uno para ver el impacto antes de decidir." />}</>);
}

const OBJECTIVES: [Profile, string][] = [["cliente", "Conservar más citas y reducir clientes afectados"], ["rutas", "Minimizar desplazamientos"], ["equipo", "Equilibrar el equipo"], ["costo", "Reducir costos"], ["continuidad", "Máxima continuidad del paciente"]];
/** §6 Wizard: problema → fecha y alcance → restricciones → objetivo → revisión → generación. */
function NewScenario({ base }: { base: string }) {
  const visits = useVF((s) => s.visits); const staff = useVF((s) => s.staff); const pets = useVF((s) => s.pets); const nav = useNavigate();
  const shifts = useRows<{ staff_id: string | null; day: string }>("shifts").rows ?? [];
  const [step, setStep] = useState(1); const [type, setType] = useState("ADV-01"); const [busy, setBusy] = useState(false);
  const days = [...new Set(visits.map((v) => v.date))].sort();
  const [p, setP] = useState<AParams>({ staff: staff[0]?.id, zone: zones[0], visit: visits[0]?.id, minutes: 30, count: 5, day: days[0], hours: 2, staffList: [], priority: false, objective: "cliente" } as AParams);
  const t = ALL_TYPES.find((x) => x.id === type)!; const has = (k: string) => (t.params as string[]).includes(k);
  const full = { ...p, shifts } as AParams; const res = step >= 5 ? simulate(type, full, visits, staff) : null;
  const save = async () => {
    setBusy(true);
    const { data, error } = await db.from("simulations").insert({ params: { ...p, snapshot: takeSnapshot(visits, staff), version: 1 } as never, sim_type: type, title: `${t.name}${p.staff && has("staff") ? " · " + (staff.find((s) => s.id === p.staff)?.name ?? "") : ""}${p.zone && has("zone") ? " · " + p.zone : ""}${p.day && has("day") ? " · " + p.day : ""}`, result: simulate(type, full, visits, staff) }).select("id").single();
    setBusy(false);
    if (error) { toast.error("No se pudo guardar: " + error.message); return; }
    toast.success("Escenario guardado como SIMULADO"); void nav({ to: `${base}/${data.id}` as never });
  };
  const sel = (label: string, k: keyof AParams, opts: [string, string][]) => <label className="block text-sm font-bold">{label}<select className={input} aria-label={label} value={String(p[k] ?? "")} onChange={(e) => setP({ ...p, [k]: e.target.value })}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>;
  const STEPS = ["Problema", "Fecha y alcance", "Restricciones", "Objetivo", "Revisión", "Generación"];
  return (<><PageTitle title="Nueva simulación" subtitle={`Paso ${step} de 6 · ${STEPS[step - 1]}`} />
    <div className="mb-3 grid grid-cols-6 gap-1" aria-hidden>{STEPS.map((x, i) => <span key={x} className={`h-1.5 rounded-full ${i < step ? "bg-primary" : "bg-secondary"}`} />)}</div>
    <Card className="mb-3 space-y-2">
      {step === 1 && <>{ALL_TYPES.map((x) => <label key={x.id} className={`flex cursor-pointer gap-2 rounded-2xl p-2 ${type === x.id ? "bg-accent" : ""}`}><input type="radio" name="tipo" checked={type === x.id} onChange={() => setType(x.id)} /><span><b>{x.name}</b><span className="block text-xs text-muted-foreground">{x.id} · {x.desc}</span></span></label>)}</>}
      {step === 2 && <>{has("day") && sel("Fecha", "day", days.map((d) => [d, d]))}
        {has("staff") && sel("Profesional", "staff", staff.map((s) => [s.id, s.name]))}
        {has("staffList") && <fieldset><legend className="text-sm font-bold">Profesionales ausentes</legend>{staff.map((s) => <label key={s.id} className="flex gap-2 text-sm"><input type="checkbox" checked={p.staffList?.includes(s.id) ?? false} onChange={(e) => setP({ ...p, staffList: e.target.checked ? [...(p.staffList ?? []), s.id] : (p.staffList ?? []).filter((x) => x !== s.id) })} />{s.name}</label>)}</fieldset>}
        {has("zone") && sel("Zona", "zone", zones.map((z) => [z, z]))}
        {has("visit") && sel("Cita", "visit", visits.map((v) => [v.id, `${v.date} ${v.time} · ${pets.find((x) => x.id === v.petId)?.name} · ${v.service}`]))}
        {has("minutes") && <label className="block text-sm font-bold">Minutos<input type="number" className={input} value={p.minutes} onChange={(e) => setP({ ...p, minutes: Number(e.target.value) })} /></label>}
        {has("hours") && <label className="block text-sm font-bold">Horas<input type="number" min={1} max={6} className={input} aria-label="Horas" value={p.hours} onChange={(e) => setP({ ...p, hours: Number(e.target.value) })} /></label>}
        {has("count") && <label className="block text-sm font-bold">Visitas adicionales por día<input type="number" className={input} aria-label="Visitas adicionales" value={p.count} onChange={(e) => setP({ ...p, count: Number(e.target.value) })} /></label>}
        {!t.params.length && <p className="text-sm">Este escenario usa toda la agenda.</p>}</>}
      {step === 3 && <><b>Restricciones que siempre se respetan</b>{["Solo profesionales habilitados para el servicio", `Turnos registrados (${shifts.length} en el sistema)`, "Máximo 6 visitas por persona al día", "Sin dos citas a la misma hora", "No se cambian dosis, frecuencia ni indicaciones", "Nada se mueve sin aprobación de Dirección"].map((r) => <p key={r} className="text-sm">· {r}</p>)}
        {has("priority") && <label className="flex gap-2 text-sm font-bold"><input type="checkbox" checked={!!p.priority} onChange={(e) => setP({ ...p, priority: e.target.checked })} />Un profesional autorizado ya definió la prioridad de esta urgencia</label>}</>}
      {step === 4 && <>{OBJECTIVES.map(([k, l]) => <label key={k} className="flex gap-2 text-sm"><input type="radio" name="obj" checked={p.objective === k} onChange={() => setP({ ...p, objective: k })} />{l}</label>)}</>}
      {step === 5 && res && <><b>{t.name}</b><p className="text-sm">Fecha: {has("day") ? p.day : "toda la agenda"} · Objetivo: {OBJECTIVES.find(([k]) => k === p.objective)?.[1]}</p>
        <p className="text-sm text-muted-foreground">Fuente: agenda actual ({visits.length} citas, {staff.length} profesionales, {shifts.length} turnos) · datos de {new Date().toLocaleString("es-CO")}</p>
        {res.warnings.map((w) => <p key={w} className="text-sm font-bold text-primary">⚠ {w}</p>)}</>}
      {step === 6 && res && <><b>{res.summary}</b>{res.changes.map((c) => <p key={c.visitId + c.field} className="text-sm text-muted-foreground">{c.label}</p>)}{res.impact.map((m) => <p key={m.label} className="text-sm">{m.label}: {m.before} → {m.after}</p>)}{res.warnings.map((w) => <p key={w} className="text-sm font-bold text-primary">⚠ {w}</p>)}</>}
    </Card>
    <div className="flex gap-2">{step > 1 && <Btn variant="outline" onClick={() => setStep(step - 1)}>Atrás</Btn>}
      {step < 6 ? <Btn className="flex-1" disabled={step === 2 && has("staffList") && (p.staffList?.length ?? 0) < 2} onClick={() => setStep(step + 1)}>{step === 5 ? "Generar" : "Siguiente"}</Btn> : <Btn className="flex-1" disabled={busy} onClick={() => void save()}>{busy ? "Guardando…" : "Guardar escenario"}</Btn>}</div></>);
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
