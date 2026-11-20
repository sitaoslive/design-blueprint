import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { useVF } from "@/lib/vf/store";
import { zones } from "@/lib/vf/data";
import { PageTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { SERVICES, WEEKDAYS, toHHMM, searchAvailability, analyzeCapacity, recommendReplacements, SlotRequestSchema, type AvailabilityResult } from "../domain";
import { useSchedulingContext } from "../adapters/useSchedulingContext";

const input = "w-full rounded-2xl border border-border bg-card px-4 py-3";
const ST: Record<string, { l: string; c: string }> = {
  AVAILABLE: { l: "Disponible", c: "bg-sage" }, POSSIBLE: { l: "Posible con advertencias", c: "bg-amber text-amber-foreground" },
  COORDINATION_REQUIRED: { l: "Requiere coordinación", c: "bg-accent" }, STALE_DATA: { l: "Datos desactualizados", c: "bg-accent" },
};
const today = () => WEEKDAYS[(new Date().getDay() + 6) % 7]!;

function OptionCard({ r, onPick }: { r: AvailabilityResult; onPick?: (() => void) | undefined }) {
  const m = useVF((s) => s.staff.find((x) => x.id === r.professionalId));
  const st = ST[r.status] ?? { l: r.status, c: "bg-secondary" };
  return (<Card className="mb-2">
    <div className="flex items-start justify-between gap-2"><div><b className="text-lg">{toHHMM(r.startAt)}–{toHHMM(r.endAt)}</b><p className="text-sm">{m?.name ?? r.professionalId} · {m?.zone}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${st.c}`}>{st.l}</span></div>
    <p className="mt-1 text-xs text-muted-foreground">Servicio {r.serviceDuration} min · viaje antes {r.travelBefore} min · después {r.travelAfter} min · margen {r.bufferBefore} min · confianza {r.confidence}</p>
    {r.warnings.map((w) => <p key={w} className="text-xs font-semibold text-primary-dark">⚠ {w}</p>)}
    <p className="mt-1 text-xs text-muted-foreground">No es una cita confirmada: requiere referencia de OKVET{r.requiresApproval ? " y aprobación por sobrecarga" : ""}.</p>
    {onPick && <Btn className="mt-2 px-4 py-2 text-sm" onClick={onPick}>Usar esta opción</Btn>}
  </Card>);
}

/** Buscador de disponibilidad (CAL/ASG): ranked, explained options from the scheduling engine. */
export function AvailabilityFinder() {
  const { ctx } = useSchedulingContext(); const staff = useVF((s) => s.staff);
  const [f, setF] = useState({ service: SERVICES[0]!.name, zone: zones[0]!, day: today(), from: "08:00", to: "17:00", pro: "" });
  const req = SlotRequestSchema.safeParse({ service: f.service, zone: f.zone, day: f.day, from: Number(f.from.slice(0, 2)) * 60 + Number(f.from.slice(3)), to: Number(f.to.slice(0, 2)) * 60 + Number(f.to.slice(3)), ...(f.pro ? { professionalId: f.pro } : {}), step: 30 });
  const res = useMemo(() => (ctx && req.success ? searchAvailability(ctx, req.data) : null), [ctx, JSON.stringify(f)]);
  const best = res?.options.filter((o, i, a) => a.findIndex((x) => x.professionalId === o.professionalId) === i) ?? [];
  return (<><PageTitle title="Buscador de disponibilidad" subtitle="Opciones reales según turnos, ausencias, descansos, citas y desplazamientos" />
    <Card className="mb-3 grid gap-2 sm:grid-cols-2">
      <select className={input} aria-label="Servicio" value={f.service} onChange={(e) => setF({ ...f, service: e.target.value })}>{SERVICES.map((s) => <option key={s.name}>{s.name}</option>)}</select>
      <select className={input} aria-label="Zona" value={f.zone} onChange={(e) => setF({ ...f, zone: e.target.value })}>{zones.map((z) => <option key={z}>{z}</option>)}</select>
      <select className={input} aria-label="Día" value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })}>{WEEKDAYS.map((d) => <option key={d}>{d}</option>)}</select>
      <select className={input} aria-label="Profesional" value={f.pro} onChange={(e) => setF({ ...f, pro: e.target.value })}><option value="">Asignación inteligente</option>{staff.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
      <div className="flex gap-2"><input type="time" className={input} aria-label="Desde" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /><input type="time" className={input} aria-label="Hasta" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
    </Card>
    {!req.success && <p className="mb-2 font-bold text-primary">{req.error.issues[0]?.message}</p>}
    {!res ? <p className="text-muted-foreground">Calculando…</p> : <>
      <b className="mb-2 block">Mejor opción por profesional ({best.length})</b>
      {best.length ? best.map((r) => <OptionCard key={r.professionalId + r.startAt} r={r} />) : <Empty title="Sin opciones viables" hint="Revisa los motivos abajo o amplía la franja." />}
      {res.options.length > best.length && <p className="mb-3 text-sm text-muted-foreground">{res.options.length - best.length} horarios alternativos más en la franja.</p>}
      <b className="mb-2 mt-4 block">Por qué no aparecen otros</b>
      {res.blocked.filter((b) => b.reasons.length && !best.some((o) => o.professionalId === b.staffId)).map((b) => <Card key={b.staffId} className="mb-2"><b>{staff.find((m) => m.id === b.staffId)?.name}</b>{b.reasons.slice(0, 3).map((r) => <p key={r} className="text-sm text-muted-foreground">· {r}</p>)}</Card>)}
      <Link to={"/operaciones/turnos" as never} className="font-bold text-primary">Registrar turnos</Link>
    </>}</>);
}

/** Capacidad del equipo (CapacityAnalysisEngine). */
export function CapacityPanel() {
  const { ctx } = useSchedulingContext(); const staff = useVF((s) => s.staff); const [day, setDay] = useState(today());
  const cap = useMemo(() => (ctx ? analyzeCapacity(ctx, day) : null), [ctx, day]);
  return (<><PageTitle title="Capacidad del equipo" subtitle="Turnos, citas y descansos del día; las proyecciones son estimaciones" />
    <select className={`${input} mb-3`} aria-label="Día" value={day} onChange={(e) => setDay(e.target.value)}>{WEEKDAYS.map((d) => <option key={d}>{d}</option>)}</select>
    {!cap ? <p className="text-muted-foreground">Calculando…</p> : <>
      <div className="mb-3 grid grid-cols-2 gap-2"><Card><p className="text-sm">Horas libres estimadas</p><b className="text-2xl">{Math.round(cap.freeMinutes / 6) / 10} h</b></Card><Card><p className="text-sm">Visitas adicionales posibles</p><b className="text-2xl">≈ {cap.extraVisits}</b></Card><Card><p className="text-sm">Sin profesional</p><b className="text-2xl">{cap.unassigned}</b></Card><Card><p className="text-sm">Zonas sin cobertura</p><b className="text-2xl">{cap.gaps.length}</b></Card></div>
      {cap.rows.map((r) => { const m = staff.find((x) => x.id === r.staffId); const pct = r.shiftMinutes ? Math.min(100, (r.committed / r.shiftMinutes) * 100) : 0;
        return <Card key={r.staffId} className="mb-2"><div className="flex justify-between"><b>{m?.name}</b><span className="text-sm">{r.knownShift ? `${Math.round(r.committed / 6) / 10} / ${Math.round(r.shiftMinutes / 6) / 10} h` : "Sin turno registrado"}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-card"><div className={`h-full ${r.overloaded ? "bg-destructive" : "bg-gradient-primary"}`} style={{ width: `${r.knownShift ? pct : 0}%` }} /></div>{r.overloaded && <p className="mt-1 text-sm font-bold text-primary">Sobrecarga</p>}</Card>; })}
      <b className="mb-2 mt-4 block">Por zona</b>{Object.entries(cap.byZone).map(([z, v]) => <p key={z} className="text-sm">{z}: {v.visits} visitas · {v.staff} con turno</p>)}
      <b className="mb-2 mt-4 block">Recomendaciones (a evaluar)</b>{cap.recommendations.length ? cap.recommendations.map((t) => <Card key={t} className="mb-2 text-sm">{t}</Card>) : <p className="text-sm text-muted-foreground">Sin alertas para este día.</p>}
    </>}</>);
}

/** Motor de reemplazos: before → proposed after; saved only as an approval request. */
export function ReplacementPlanner({ id }: { id?: string | undefined }) {
  const { ctx } = useSchedulingContext(); const staff = useVF((s) => s.staff); const pets = useVF((s) => s.pets); const visits = useVF((s) => s.visits);
  const [who, setWho] = useState(id ?? ""); const [day, setDay] = useState("Martes"); const [sent, setSent] = useState(false);
  const plan = useMemo(() => (ctx && who ? recommendReplacements(ctx, who, day) : null), [ctx, who, day]);
  const name = (sid: string) => staff.find((m) => m.id === sid)?.name ?? "—";
  const save = async () => {
    if (!plan) return;
    const detail = plan.affected.map((o) => `${toHHMM(o.visit.start)} ${o.visit.label}: ${o.candidates[0] ? `→ ${name(o.candidates[0].professionalId)}` : "requiere cambio de horario"}`).join(" · ");
    const { error } = await db.from("approvals").insert({ id: `rep-${who}-${day}-${Date.now()}`, title: `Reemplazo de ${name(who)} · ${day}`, detail, kind: "reemplazo", status: "pendiente" });
    if (error) toast.error("No se pudo guardar: " + error.message); else { toast.success("Propuesta enviada a aprobación. No se movió ninguna cita."); setSent(true); }
  };
  return (<><PageTitle title="Reemplazos" subtitle="Propuestas para cubrir una ausencia; nada se mueve sin aprobación" />
    <Card className="mb-3 grid gap-2 sm:grid-cols-2"><select className={input} aria-label="Profesional ausente" value={who} onChange={(e) => { setWho(e.target.value); setSent(false); }}><option value="">¿Quién se ausenta?</option>{staff.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
      <select className={input} aria-label="Día" value={day} onChange={(e) => { setDay(e.target.value); setSent(false); }}>{WEEKDAYS.map((d) => <option key={d}>{d}</option>)}</select></Card>
    {!who ? <Empty title="Elige a la persona ausente" /> : !plan ? <p>Calculando…</p> : !plan.affected.length ? <Empty title="No tiene visitas ese día" /> : <>
      <p className="mb-2 text-sm"><b>{plan.kept}</b> visitas se pueden cubrir · <b>{plan.needChange}</b> requieren cambio de horario</p>
      {plan.affected.map((o) => <Card key={o.visit.id} className="mb-2"><b>{toHHMM(o.visit.start)} · {o.visit.label} · {pets.find((p) => p.id === visits.find((v) => v.id === o.visit.id)?.petId)?.name ?? o.visit.zone}</b>
        <p className="text-sm text-muted-foreground">Antes: {name(who)} · {o.visit.zone}</p>
        <p className="text-sm font-bold">{o.candidates[0] ? `Propuesto: ${name(o.candidates[0].professionalId)}${o.candidates[0].travelBefore ? ` (${o.candidates[0].travelBefore} min de viaje)` : " (primera visita del día)"}` : "Propuesto: reprogramar con el cliente — nadie habilitado está libre"}</p>
        {o.candidates.slice(1, 3).map((c) => <p key={c.professionalId} className="text-xs text-muted-foreground">Alternativa: {name(c.professionalId)}</p>)}
        {o.candidates[0]?.warnings.map((w) => <p key={w} className="text-xs text-primary-dark">⚠ {w}</p>)}</Card>)}
      <Btn className="mt-2 w-full" disabled={sent} onClick={() => void save()}>{sent ? "Propuesta enviada" : "Solicitar aprobación"}</Btn>
    </>}</>);
}
