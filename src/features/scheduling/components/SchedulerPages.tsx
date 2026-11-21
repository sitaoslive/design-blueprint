import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { useVF } from "@/lib/vf/store";
import { zones } from "@/lib/vf/data";
import { PageTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { SERVICES, WEEKDAYS, MONTHS, toHHMM, weekdayOf, parseDayLabel, dayLabelOf, monthGrid, searchAvailability, evaluateSlot, OFFERABLE, analyzeCapacity, recommendReplacements, SlotRequestSchema, type AvailabilityResult } from "../domain";
import { durationPreviewContext } from "@/features/live-dispatch/domain/scheduling";
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

/** Real options for one concrete date: only that date's visits count as busy. Shared by cita rápida. */
export function useSlotOptions(f: { service: string; zone: string; dateLabel: string; pro?: string | undefined; from?: number; to?: number; previewDuration?: number }) {
  const { ctx } = useSchedulingContext(); const visits = useVF((s) => s.visits);
  return useMemo(() => {
    if (!ctx || !f.dateLabel) return null;
    const ids = new Set(visits.filter((v) => v.date === f.dateLabel && v.status !== "cancelada").map((v) => v.id));
    if (f.previewDuration !== undefined && (!Number.isInteger(f.previewDuration) || f.previewDuration <= 0 || f.previewDuration > 480)) return null;
    const previewCtx = f.previewDuration === undefined ? ctx : durationPreviewContext(ctx, f.service, f.previewDuration);
    const dayCtx = { ...previewCtx, bookings: ctx.bookings.filter((b) => ids.has(b.id)) };
    const req = SlotRequestSchema.safeParse({ service: f.service, zone: f.zone, day: weekdayOf(f.dateLabel), from: f.from ?? 7 * 60, to: f.to ?? 18 * 60, step: 30, ...(f.pro ? { professionalId: f.pro } : {}) });
    if (!req.success) return null;
    const res = searchAvailability(dayCtx, req.data);
    return { ...res, recheck: (r: AvailabilityResult) => OFFERABLE.includes(evaluateSlot(dayCtx, r.professionalId, { service: f.service, zone: f.zone, day: req.data.day, start: r.startAt }).status) };
  }, [ctx, visits, f.service, f.zone, f.dateLabel, f.pro, f.from, f.to, f.previewDuration]);
}

/** Selectable list of engine options (top 6) with reasons for excluded professionals. */
export function SlotPicker({ data, picked, onPick }: { data: ReturnType<typeof useSlotOptions>; picked: AvailabilityResult | null; onPick: (r: AvailabilityResult) => void }) {
  const staff = useVF((s) => s.staff);
  if (!data) return <p className="text-muted-foreground">Elige servicio, zona y fecha para ver opciones.</p>;
  const top = data.options.slice(0, 6);
  return (<>
    {top.length ? top.map((r) => { const on = picked?.professionalId === r.professionalId && picked.startAt === r.startAt; const m = staff.find((x) => x.id === r.professionalId); const st = ST[r.status] ?? { l: r.status, c: "bg-secondary" };
      return <button key={r.professionalId + r.startAt} onClick={() => onPick(r)} aria-pressed={on} className={`mb-2 flex w-full items-center gap-3 rounded-3xl p-3 text-left ${on ? "bg-sage ring-2 ring-sage-foreground" : "bg-secondary"}`}>
        <b className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent text-lg">{toHHMM(r.startAt)}</b>
        <span className="flex-1 text-sm text-muted-foreground"><b className="block text-base text-foreground">{m?.name ?? r.professionalId}</b>{m?.zone} · viaje {r.travelBefore} min · hasta {toHHMM(r.endAt)}{r.warnings[0] && <span className="block font-semibold text-primary-dark">⚠ {r.warnings[0]}</span>}</span>
        <span className={`rounded-full px-2 py-1 text-xs font-bold ${st.c}`}>{st.l}</span></button>; })
      : <Empty title="Sin opciones viables ese día" hint="Prueba otra fecha, zona o profesional." />}
    {data.options.length > top.length && <p className="mb-2 text-sm text-muted-foreground">{data.options.length - top.length} horarios más disponibles.</p>}
    {!top.length && data.blocked.filter((b) => b.reasons.length).slice(0, 4).map((b) => <p key={b.staffId} className="text-sm text-muted-foreground">· {staff.find((m) => m.id === b.staffId)?.name}: {b.reasons[0]}</p>)}
    <p className="mt-1 text-xs text-muted-foreground">Ninguna opción es una cita confirmada: requiere referencia de OKVET.</p>
  </>);
}

/** Calendario mensual: citas por día con detalle del día elegido. */
export function MonthCalendar({ base = "/operaciones" }: { base?: string }) {
  const visits = useVF((s) => s.visits); const pets = useVF((s) => s.pets); const staff = useVF((s) => s.staff);
  const v0 = visits.find((v) => parseDayLabel(v.date)); const first = v0 ? parseDayLabel(v0.date) : null;
  const now = new Date();
  // Labels carry no year: pick the nearby year whose weekday matches the label.
  const y0 = first ? [0, -1, 1, -2, 2].map((d) => now.getFullYear() + d).find((y) => dayLabelOf(new Date(y, first.month, first.day)) === v0!.date) ?? now.getFullYear() : now.getFullYear();
  const [ym, setYm] = useState({ y: y0, m: first?.month ?? now.getMonth() });
  const [sel, setSel] = useState<number | null>(null);
  const byDay = useMemo(() => { const m: Record<number, typeof visits> = {};
    for (const v of visits) { const p = parseDayLabel(v.date); if (p && p.month === ym.m) (m[p.day] ??= []).push(v); } return m; }, [visits, ym.m]);
  const grid = monthGrid(ym.y, ym.m); const move = (d: number) => { const t = new Date(ym.y, ym.m + d, 1); setYm({ y: t.getFullYear(), m: t.getMonth() }); setSel(null); };
  const list = sel ? [...(byDay[sel] ?? [])].sort((a, b) => a.time.localeCompare(b.time)) : [];
  const total = Object.values(byDay).reduce((n, v) => n + v.length, 0);
  return (<><PageTitle title="Calendario mensual" subtitle={`${total} citas en ${MONTHS[ym.m]}`}><Link to={`${base}/cita-rapida` as never} className="font-bold text-primary">Agendar</Link></PageTitle>
    <Card className="mb-3">
      <div className="mb-2 flex items-center justify-between"><Btn variant="outline" className="px-3 py-1" onClick={() => move(-1)} aria-label="Mes anterior">‹</Btn><b className="capitalize">{MONTHS[ym.m]} {ym.y}</b><Btn variant="outline" className="px-3 py-1" onClick={() => move(1)} aria-label="Mes siguiente">›</Btn></div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground">{["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <span key={i}>{d}</span>)}</div>
      {grid.map((w, i) => <div key={i} className="mt-1 grid grid-cols-7 gap-1">{w.map((d, j) => { const n = d ? byDay[d]?.length ?? 0 : 0; const pend = d ? (byDay[d] ?? []).some((v) => v.status === "pendiente" || v.status === "pendiente_okvet") : false;
        return d ? <button key={j} onClick={() => setSel(d)} aria-label={`${d} de ${MONTHS[ym.m]}: ${n} citas`} aria-pressed={sel === d} className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm ${sel === d ? "bg-gradient-primary text-primary-foreground" : n ? "bg-blush" : "bg-secondary"}`}><span className="font-bold">{d}</span>{n > 0 && <span className="text-[10px] font-bold">{n}{pend ? "•" : ""}</span>}</button> : <span key={j} />; })}</div>)}
      <p className="mt-2 text-xs text-muted-foreground">El número indica citas del día; • = pendientes de OKVET.</p>
    </Card>
    {sel && <><b className="mb-2 block">{dayLabelOf(new Date(ym.y, ym.m, sel))}</b>
      {list.length ? list.map((v) => <Link key={v.id} to={`/operaciones/citas/${v.id}` as never} className="mb-2 block"><Card className="flex items-center gap-3"><b className="w-14">{v.time}</b><div className="flex-1"><b>{pets.find((p) => p.id === v.petId)?.name} · {v.service}</b><p className="text-sm text-muted-foreground">{staff.find((m) => m.id === v.staffId)?.name ?? "Sin asignar"} · {v.zone}</p></div><span className="text-xs font-bold">{v.status.replace("_", " ")}</span></Card></Link>) : <Empty title="Sin citas este día" />}</>}
  </>);
}
