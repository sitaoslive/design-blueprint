import { confirmWithOkvet } from "@/lib/vf/okvet";
import { usePets } from "@/lib/vf/store";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Calendar, Layers, ClipboardCheck, PawPrint, RefreshCw, MapPin, CalendarPlus, CalendarRange, PlusSquare, Car, PauseCircle, CheckCircle2, Search, Stethoscope, UserRound, ChevronDown } from "lucide-react";
import { useVF, actions } from "@/lib/vf/store";
import { zones, IMG } from "@/lib/vf/data";
import { SERVICES, toHHMM, dayLabelOf, type AvailabilityResult } from "@/features/scheduling/domain";
import { useSlotOptions, SlotPicker } from "@/features/scheduling/components/SchedulerPages";
import { DurationPreview } from "@/features/live-dispatch/components/DurationPreview";
import { PageTitle, SectionTitle, StatusBadge, QuickAction, Chips, Btn, Card, RowLink, Empty } from "../ui";
import { cn } from "@/lib/utils";

const DAYS = ["Lunes 27", "Martes 28", "Miércoles 29", "Jueves 30", "Viernes 31"];
const DAY_DATES = ["Lun, 27 de enero", "Mar, 28 de enero", "Mié, 29 de enero", "Jue, 30 de enero", "Vie, 31 de enero"];

/** COORD-003 Agenda inteligente */
export function SmartAgenda({ base }: { base: string }) {
  const pets = usePets();
  const [d, setD] = useState(1);
  const visits = useVF((s) => s.visits);
  const staff = useVF((s) => s.staff);
  const reqs = useVF((s) => s.requests.filter((r) => r.status === "nueva").length);
  const day = visits.filter((v) => v.date === DAY_DATES[d]).sort((a, b) => a.time.localeCompare(b.time));
  const okvet = visits.filter((v) => v.status === "pendiente" || v.status === "pendiente_okvet").length;
  const avail = staff.filter((s) => s.status !== "ausente").length + 5;
  const icon = (st: string) => (st === "confirmada" ? PawPrint : st === "revision" ? RefreshCw : Calendar);
  return (
    <>
      <PageTitle title="Agenda inteligente" />
      <Link to="/operaciones/$" params={{ _splat: "despacho" }} className="mb-4 inline-flex items-center gap-2 font-bold text-primary"><MapPin className="h-4 w-4" />Despacho y tiempos</Link>
      <div className="mb-5 flex items-center gap-2">
        <button aria-label="Día anterior" onClick={() => setD((x) => Math.max(0, x - 1))} className="grid h-12 w-12 place-items-center rounded-full bg-secondary"><ChevronLeft /></button>
        <button onClick={() => setD(1)} className="rounded-full bg-accent px-6 py-3 text-lg">Hoy</button>
        <span className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-3 text-xl font-bold"><Calendar className="h-6 w-6 text-primary" />{DAYS[d]}</span>
        <button aria-label="Día siguiente" onClick={() => setD((x) => Math.min(4, x + 1))} className="grid h-12 w-12 place-items-center rounded-full bg-secondary"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Link to={`${base}/solicitudes` as never} className="rounded-3xl bg-accent p-4"><Layers className="h-7 w-7 text-primary" /><b className="block text-3xl">{reqs}</b>solicitudes</Link>
        <Link to={`${base}/okvet` as never} className="rounded-3xl bg-secondary p-4"><ClipboardCheck className="h-7 w-7 text-amber-foreground" /><b className="block text-3xl">{okvet}</b>pendientes OKVET</Link>
        <Link to={`${base}/equipo` as never} className="rounded-3xl bg-sage p-4"><Calendar className="h-7 w-7 text-sage-foreground" /><b className="block text-3xl">{avail}</b>disponibles</Link>
      </div>
      <div className="mt-5 space-y-2">
        {day.length === 0 && <Empty title="Sin visitas este día" hint="Usa Agendar para crear una." />}
        {day.map((v) => {
          const I = icon(v.status); const st = staff.find((s) => s.id === v.staffId); const p = pets.find((x) => x.id === v.petId);
          return (
            <Link key={v.id} to={`${base}/cita/$id` as never} params={{ id: v.id } as never} className="flex items-center gap-3 rounded-3xl bg-secondary p-3">
              <span className={cn("grid h-12 w-12 place-items-center rounded-2xl", v.status === "pendiente" ? "bg-accent text-primary" : "bg-sage text-sage-foreground")}><I className="h-6 w-6" /></span>
              <span className="flex-1 border-l border-border pl-3 text-lg"><b>{v.time}</b> · {st ? `${st.short} · ${p?.name}` : v.service}</span>
              <StatusBadge status={v.status} />
            </Link>
          );
        })}
      </div>
      <SectionTitle>Acciones rápidas</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        <QuickAction vertical icon={CalendarRange} label="Ver disponibilidad" to={`${base}/equipo`} />
        <QuickAction vertical icon={MapPin} label="Crear ruta" tone="sage" to={`${base}/rutas`} />
        <QuickAction vertical icon={CalendarPlus} label="Agendar" to={`${base}/nueva-cita`} />
      </div>
    </>
  );
}

/** Visit detail used by coordination & Luis */
export function VisitDetail({ id, base }: { id: string; base: string }) {
  const pets = usePets();
  const v = useVF((s) => s.visits.find((x) => x.id === id));
  const staff = useVF((s) => s.staff);
  if (!v) return <Empty title="Cita no encontrada" />;
  const p = pets.find((x) => x.id === v.petId)!; const st = staff.find((s) => s.id === v.staffId);
  return (
    <>
      <Link to={`${base}/agenda` as never} className="mt-4 inline-flex items-center gap-1 text-primary"><ChevronLeft className="h-5 w-5" />Agenda</Link>
      <PageTitle title={p.name} subtitle={`${v.service} · ${v.date} · ${v.time}`} />
      <Card className="flex items-center gap-4">
        <img src={p.photo} alt={p.name} className="h-24 w-24 rounded-3xl object-cover" />
        <div className="space-y-1"><StatusBadge status={v.status} /><p>{st?.name ?? "Sin veterinario asignado"}</p><p className="text-muted-foreground">{v.address}</p></div>
      </Card>
      <SectionTitle>Asignar veterinario</SectionTitle>
      <div className="space-y-2">
        {staff.map((s) => (
          <button key={s.id} disabled={s.status === "ausente"} onClick={() => { actions.assignVisit(v.id, s.id); toast.success(`Asignada a ${s.name}`); }}
            className={cn("flex w-full items-center gap-3 rounded-2xl p-3 text-left disabled:opacity-50", v.staffId === s.id ? "bg-sage" : "bg-secondary")}>
            <img src={s.photo} alt="" className="h-12 w-12 rounded-full object-cover" /><span className="flex-1 font-bold">{s.name}</span><StatusBadge status={s.status} />
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Btn onClick={() => { confirmWithOkvet(v.id);  }}>Confirmar</Btn>
        <Btn variant="outline" onClick={() => { actions.setVisitStatus(v.id, "cancelada"); toast("Cita cancelada"); }}>Cancelar</Btn>
      </div>
    </>
  );
}

/** COORD-005 Equipo */
export function TeamPage({ base }: { base: string }) {
  const [f, setF] = useState<"todos" | "disponible" | "en_ruta" | "ausente">("todos");
  const staff = useVF((s) => s.staff);
  const pendingVisit = useVF((s) => s.visits.find((v) => !v.staffId));
  const list = staff.filter((s) => f === "todos" || s.status === f);
  return (
    <>
      <PageTitle title="Equipo" />
      <Link to="/operaciones/$" params={{ _splat: "despacho" }} className="mb-4 inline-flex items-center gap-2 font-bold text-primary"><MapPin className="h-4 w-4" />Despacho y tiempos</Link>
      <Chips value={f} onChange={setF} options={[{ value: "todos", label: "Todos" }, { value: "disponible", label: "Disponibles", icon: CheckCircle2 }, { value: "en_ruta", label: "En ruta", icon: Car }, { value: "ausente", label: "Ausentes", icon: PauseCircle }]} />
      <div className="mt-5 space-y-3">
        {list.length === 0 && <Empty title="Nadie en este estado" />}
        {list.map((s) => (
          <div key={s.id} className="animate-pop rounded-3xl border border-border bg-card p-4 shadow-soft">
            <div className="flex gap-4">
              <img src={s.photo} alt={s.name} className="h-24 w-24 rounded-full bg-accent object-cover" />
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-xl font-extrabold">{s.name}</h3><StatusBadge status={s.status} /></div>
                <p className="mt-1 flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />{s.zone}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-primary" />{s.status === "ausente" ? "Ausencia registrada" : `Próxima visita ${s.nextVisit}`}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Btn variant="soft" disabled={s.status === "ausente" || !pendingVisit} onClick={() => { if (pendingVisit) { actions.assignVisit(pendingVisit.id, s.id); toast.success(`Visita de ${pendingVisit.time} asignada a ${s.name}`); } }}><PlusSquare className="h-5 w-5" />Asignar</Btn>
              <Link to={`${base}/agenda` as never} className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-5 py-3 font-bold"><Calendar className="h-5 w-5" />Ver agenda</Link>
            </div>
          </div>
        ))}
      </div>
      <SectionTitle>Cobertura</SectionTitle>
      <RowLink icon={Calendar} to={`${base}/aprobaciones`} label={<><b>Turno tarde</b> · {staff.some((s) => s.status === "ausente") ? "1 cobertura pendiente" : "cubierto"}</>} />
    </>
  );
}

/** COORD-004 Nueva cita rápida — options come from the scheduling engine. */
function bookingDates(visits: { date: string }[]): string[] {
  const out: string[] = []; const d = new Date();
  while (out.length < 10) { if (d.getDay() !== 0) out.push(dayLabelOf(d)); d.setDate(d.getDate() + 1); }
  return [...new Set([...out, ...visits.map((v) => v.date)])];
}
function Select({ icon: I, label, value, onChange, options, img }: { icon?: typeof Search; label: string; value: string; onChange: (v: string) => void; options: string[]; img?: string }) {
  return (
    <label className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-accent px-4 py-3.5">
      {img ? <img src={img} alt="" className="-my-3 -ml-4 h-16 w-20 object-cover" /> : I && <I className="h-6 w-6 text-primary" />}
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 appearance-none bg-transparent text-lg font-semibold text-foreground outline-none">
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none h-5 w-5 text-muted-foreground" />
    </label>
  );
}
export function QuickBooking({ base }: { base: string }) {
  const pets = usePets();
  const staff = useVF((s) => s.staff); const visits = useVF((s) => s.visits);
  const [q, setQ] = useState(""); const [pet, setPet] = useState(""); const [svc, setSvc] = useState(SERVICES[0]!.name); const [zone, setZone] = useState(zones[0]!); const [date, setDate] = useState(""); const [vet, setVet] = useState("");
  const [pick, setPick] = useState<AvailabilityResult | null>(null); const [busy, setBusy] = useState(false);
  const suggested = SERVICES.find((s) => s.name === svc)?.duration ?? 45;
  const [duration, setDuration] = useState(suggested);
  const dates = bookingDates(visits);
  const data = useSlotOptions({ service: svc, zone, dateLabel: date || dates[0]!, pro: staff.find((s) => s.name === vet)?.id, previewDuration: duration });
  const submit = (provisional: boolean) => {
    if (duration !== suggested) { toast.error("Duración personalizada sin autoridad verificada; no se creó una cita"); return; }
    if (!pet || !svc) { toast.error("Selecciona mascota y servicio."); return; }
    if (!pick || !data) { toast.error("Elige una de las opciones disponibles."); return; }
    if (!data.recheck(pick)) { toast.error("Ese horario ya no está disponible. Elige otro."); setPick(null); return; }
    setBusy(true);
    const p = pets.find((x) => x.name === pet)!;
    actions.createVisit({ petId: p.id, staffId: pick.professionalId, service: svc, date: date || dates[0]!, time: toHHMM(pick.startAt), status: provisional ? "pendiente" : "pendiente_okvet", zone, address: "Dirección del cliente" });
    toast.success(provisional ? "Reserva provisional creada" : "Solicitud creada · pendiente de OKVET");
    setTimeout(() => setBusy(false), 600);
    setPick(null);
  };
  return (
    <>
      <PageTitle title="Nueva cita rápida" subtitle="Agendamiento durante llamada" />
      <label className="mb-3 flex items-center gap-3 rounded-full border border-border bg-card px-5 py-4">
        <Search className="h-6 w-6 text-primary" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Teléfono o nombre" className="flex-1 bg-transparent text-lg outline-none" />
      </label>
      {q && <p className="-mt-1 mb-3 px-2 text-sm text-muted-foreground">{"Andrea Gómez".toLowerCase().includes(q.toLowerCase()) || "300 555 1201".includes(q) ? "Cliente encontrado: Andrea Gómez · Familia Gómez" : "Sin coincidencias · se creará cliente nuevo"}</p>}
      <div className="space-y-3">
        <Select label="Mascota" value={pet} onChange={setPet} options={pets.map((p) => p.name)} img={pets.find((p) => p.name === pet)?.photo ?? IMG.dog} />
        <Select icon={Stethoscope} label="Servicio" value={svc} onChange={(v) => { setSvc(v); setDuration(SERVICES.find((s) => s.name === v)?.duration ?? 45); setPick(null); }} options={SERVICES.map((x) => x.name)} />
        <Select icon={MapPin} label="Zona" value={zone} onChange={(v) => { setZone(v); setPick(null); }} options={zones} />
        <Select icon={Calendar} label="Fecha deseada" value={date || dates[0]!} onChange={(v) => { setDate(v); setPick(null); }} options={dates} />
        <Select icon={UserRound} label="Veterinario preferido" value={vet} onChange={(v) => { setVet(v); setPick(null); }} options={staff.map((s) => s.name)} />
      </div>
      <DurationPreview suggested={suggested} value={duration} onChange={(minutes) => { setDuration(minutes); setPick(null); }} />
      <SectionTitle>Opciones disponibles</SectionTitle>
      <SlotPicker data={data} picked={pick} onPick={setPick} />
      <div className="mt-6 space-y-3">
        <Btn disabled={busy || duration !== suggested} className="w-full py-4 text-xl" onClick={() => submit(false)}>Crear solicitud</Btn>
        <Btn disabled={busy || duration !== suggested} variant="outline" className="w-full py-4 text-xl" onClick={() => submit(true)}>Reservar provisional</Btn>
      </div>
      <Link to={`${base}/agenda` as never} className="mt-4 block text-center text-primary">Ver en agenda</Link>
    </>
  );
}
