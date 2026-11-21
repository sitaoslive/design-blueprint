import { useRecords } from "./records";
import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, Clock, MapPin, Stethoscope, FileText, Pill, Wallet, Inbox, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVF, actions, getVF } from "@/lib/vf/store";
const getVFName = () => getVF().displayName;
import { formatCOP } from "@/lib/vf/format";
import { PageTitle, SectionTitle, Card, Empty, Btn, StatusBadge, RowLink } from "../ui";
import { useClientSettings } from "./useRow";

const L = (to: string, c: ReactNode, cls = "text-primary font-bold") => <Link to={to as never} className={cls}>{c}</Link>;
const input = "w-full rounded-2xl bg-accent p-3";
const requestTime = (value: string) => /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" }) : value;
const STEPS = ["programada", "en_desplazamiento", "llegada", "en_atencion", "finalizada"] as const;
const STEP_LABEL: Record<string, string> = { programada: "Programada", en_desplazamiento: "En camino", llegada: "Llegó a tu casa", en_atencion: "En atención", finalizada: "Finalizada" };
const PREP = ["Mascota en ayunas si aplica", "Carné de vacunas a mano", "Espacio tranquilo e iluminado", "Mascota con collar o transportadora"];

function useVisit(id: string) {
  const v = useVF((s) => s.visits.find((x) => x.id === id));
  const pet = useVF((s) => s.pets.find((p) => p.id === v?.petId));
  const vet = useVF((s) => s.staff.find((m) => m.id === v?.staffId));
  return { v, pet, vet };
}
function PetForm({ init, onSave, label }: { init: { name: string; species: "Perro" | "Gato"; breed: string; age: string; allergies: string }; onSave: (f: typeof init) => void; label: string }) {
  const [f, setF] = useState(init);
  return (<Card className="space-y-3">
    <input className={input} placeholder="Nombre" aria-label="Nombre" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
    <select className={input} aria-label="Especie" value={f.species} onChange={(e) => setF({ ...f, species: e.target.value as "Perro" })}><option>Perro</option><option>Gato</option></select>
    <input className={input} placeholder="Raza" aria-label="Raza" value={f.breed} onChange={(e) => setF({ ...f, breed: e.target.value })} />
    <input className={input} placeholder="Edad (ej. 3 años)" aria-label="Edad" value={f.age} onChange={(e) => setF({ ...f, age: e.target.value })} />
    <input className={input} placeholder="Alergias" aria-label="Alergias" value={f.allergies} onChange={(e) => setF({ ...f, allergies: e.target.value })} />
    <Btn className="w-full" disabled={!f.name.trim()} onClick={() => onSave({ ...f, name: f.name.trim(), allergies: f.allergies || "Ninguna registrada" })}>{label}</Btn>
  </Card>);
}

function NewPet() {
  const nav = useNavigate();
  return (<><PageTitle title="Agregar mascota" subtitle="Registra a tu compañero" />
    <PetForm label="Guardar mascota" init={{ name: "", species: "Perro", breed: "", age: "", allergies: "" }} onSave={(f) => { const id = actions.addPet(f); toast.success("Mascota registrada"); void nav({ to: `/app/mascotas/${id}` as never }); }} /></>);
}
function EditPet({ id }: { id: string }) {
  const pet = useVF((s) => s.pets.find((p) => p.id === id)); const nav = useNavigate();
  if (!pet) return <Empty title="Mascota no encontrada" />;
  return (<><PageTitle title={`Editar ${pet.name}`} />
    <PetForm label="Guardar cambios" init={{ name: pet.name, species: pet.species, breed: pet.breed, age: pet.age, allergies: pet.allergies }} onSave={({ species: _s, ...f }) => { actions.updatePet(id, f); toast.success("Cambios guardados"); void nav({ to: `/app/mascotas/${id}` as never }); }} /></>);
}
function PetHealth({ id }: { id: string }) {
  const pet = useVF((s) => s.pets.find((p) => p.id === id));
  const visits = useVF((s) => s.visits.filter((v) => v.petId === id));
  const tr = useVF((s) => s.treatments.filter((t) => t.pet === pet?.name));
  if (!pet) return <Empty title="Mascota no encontrada" />;
  return (<><PageTitle title={`Salud de ${pet.name}`} subtitle={`${pet.species} · ${pet.breed} · ${pet.age}`} />
    <Card><b>Alergias</b><p className="text-muted-foreground">{pet.allergies}</p></Card>
    <SectionTitle>Tratamientos activos</SectionTitle>
    {tr.length ? tr.map((t) => <Card key={t.id} className="mb-2"><b>{t.plan}</b><p className="text-sm text-muted-foreground">{t.frequency} · {t.done}/{t.total} dosis</p></Card>) : <Empty title="Sin tratamientos activos" />}
    <SectionTitle>Visitas registradas</SectionTitle>
    {visits.length ? visits.map((v) => <RowLink key={v.id} icon={Stethoscope} to={`/app/agenda/${v.id}`} label={`${v.service} · ${v.date} ${v.time}`} />) : <Empty title="Sin visitas" />}</>);
}
function PetDocs({ id }: { id: string }) {
  const pet = useVF((s) => s.pets.find((p) => p.id === id));
  const done = useVF((s) => s.visits.filter((v) => v.petId === id && v.status === "finalizada"));
  return (<><PageTitle title={`Documentos de ${pet?.name ?? ""}`} subtitle="Resúmenes de atención" />
    {done.length ? done.map((v) => <RowLink key={v.id} icon={FileText} to={`/app/agenda/${v.id}`} label={`Resumen · ${v.service} · ${v.date}`} />) : <Empty title="Aún no hay documentos" hint="Aparecen al finalizar cada visita." />}
    <p className="mt-3 text-sm text-muted-foreground">La historia clínica completa llegará cuando OKVET esté conectado.</p></>);
}
function VisitDetail({ id }: { id: string }) {
  const { v, pet, vet } = useVisit(id);
  if (!v) return <Empty title="Visita no encontrada" />;
  const open = v.status !== "finalizada" && v.status !== "cancelada";
  return (<><PageTitle title={v.service} subtitle={pet?.name ?? ""} />
    <Card className="space-y-2">
      <p className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />{v.date} · {v.time}</p>
      <p className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" />{vet?.name ?? "Por asignar"}</p>
      <p className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />{v.address || v.zone}</p>
      <StatusBadge status={v.status} />
    </Card>
    <div className="mt-4 grid gap-2">
      <RowLink icon={Clock} to={`/app/visitas/${id}/estado`} label="Estado en tiempo real" />
      <RowLink icon={Check} to={`/app/visitas/${id}/preparacion`} label="Preparación de la visita" tone="sage" />
      {open && <RowLink icon={CalendarDays} to={`/app/solicitudes/${id}/reprogramar`} label="Reprogramar" />}
      {open && <RowLink icon={Inbox} to={`/app/solicitudes/${id}/cancelar`} label="Cancelar visita" />}
    </div></>);
}
function MyRequests() {
  const visits = useVF((s) => s.visits.filter((v) => v.status !== "finalizada"));
  const reqs = useVF((s) => s.requests);
  const pets = useVF((s) => s.pets);
  return (<><PageTitle title="Mis solicitudes" subtitle="Citas y mensajes en gestión">{L("/cliente/reservar", "Nueva")}</PageTitle>
    <SectionTitle>Citas solicitadas</SectionTitle>
    {visits.length ? visits.map((v) => <Card key={v.id} className="mb-2"><div className="flex items-center justify-between gap-2"><div><b>{v.service} · {pets.find((p) => p.id === v.petId)?.name}</b><p className="text-sm text-muted-foreground">{v.date} {v.time}</p></div><StatusBadge status={v.status} /></div><div className="mt-2">{L(`/app/solicitudes/${v.id}`, "Ver detalle")}</div></Card>) : <Empty title="Sin citas en gestión" />}
    <SectionTitle>Mensajes enviados</SectionTitle>
    {reqs.length ? reqs.map((r) => <Card key={r.id} className="mb-2"><div className="flex justify-between"><b>{r.pet || "General"}</b><StatusBadge status={r.status} /></div><p className="text-muted-foreground">{r.message}</p></Card>) : <Empty title="Sin mensajes" hint="Escríbenos desde Ayuda." />}</>);
}
function Reschedule({ id }: { id: string }) {
  const { v } = useVisit(id); const nav = useNavigate();
  const [d, setD] = useState(v?.date ?? ""); const [t, setT] = useState(v?.time ?? "10:00");
  if (!v) return <Empty title="Visita no encontrada" />;
  return (<><PageTitle title="Reprogramar visita" subtitle={`${v.service} · actual ${v.date} ${v.time}`} />
    <Card className="space-y-3"><input className={input} aria-label="Nueva fecha" placeholder="Fecha (ej. Vie 31 enero)" value={d} onChange={(e) => setD(e.target.value)} />
      <input className={input} type="time" aria-label="Nueva hora" value={t} onChange={(e) => setT(e.target.value)} />
      <Btn className="w-full" disabled={!d || !t} onClick={() => { actions.rescheduleVisit(id, d, t); toast.success("Solicitud de cambio enviada"); void nav({ to: `/app/agenda/${id}` as never }); }}>Solicitar cambio</Btn></Card>
    <p className="mt-3 text-sm text-muted-foreground">Coordinación confirmará el nuevo horario.</p></>);
}
function Cancel({ id }: { id: string }) {
  const { v } = useVisit(id); const nav = useNavigate();
  if (!v) return <Empty title="Visita no encontrada" />;
  return (<><PageTitle title="Cancelar visita" subtitle={`${v.service} · ${v.date} ${v.time}`} />
    <Card><p>Sin costo hasta 12 horas antes de la visita.</p><Btn className="mt-3 w-full" onClick={() => { actions.setVisitStatus(id, "cancelada"); toast.success("Visita cancelada"); void nav({ to: "/app/solicitudes" as never }); }}>Confirmar cancelación</Btn></Card></>);
}
function Prep({ id }: { id: string }) {
  const { v } = useVisit(id);
  if (!v) return <Empty title="Visita no encontrada" />;
  return (<><PageTitle title="Preparación" subtitle={`${v.service} · ${v.date} ${v.time}`} />
    <div className="space-y-2">{PREP.map((p) => { const on = v.prep.includes(p); return <button key={p} aria-pressed={on} onClick={() => actions.togglePrep(id, p)} className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left ${on ? "bg-sage" : "bg-secondary"}`}><Check className={`h-5 w-5 ${on ? "text-primary" : "text-muted-foreground"}`} />{p}</button>; })}</div></>);
}
function LiveStatus({ id }: { id: string }) {
  const { v, vet } = useVisit(id);
  if (!v) return <Empty title="Visita no encontrada" />;
  const idx = STEPS.indexOf(v.step as never);
  return (<><PageTitle title="Estado de la visita" subtitle={`${v.service} · ${vet?.name ?? "Por asignar"}`} />
    <ol className="space-y-2">{STEPS.map((s, i) => <li key={s} className={`flex items-center gap-3 rounded-2xl p-4 ${i <= idx ? "bg-sage font-bold" : "bg-secondary text-muted-foreground"}`}><span className="grid h-7 w-7 place-items-center rounded-full bg-card">{i + 1}</span>{STEP_LABEL[s]}</li>)}</ol></>);
}
function History() {
  const done = useVF((s) => s.visits.filter((v) => v.status === "finalizada" || v.status === "cancelada"));
  const pets = useVF((s) => s.pets);
  return (<><PageTitle title="Historial" subtitle="Visitas anteriores" />
    {done.length ? done.map((v) => <RowLink key={v.id} icon={Stethoscope} to={`/app/agenda/${v.id}`} label={`${v.service} · ${pets.find((p) => p.id === v.petId)?.name ?? ""} · ${v.date}`} />) : <Empty title="Sin historial todavía" />}</>);
}
function ReferralDetail({ id, select }: { id: string; select?: boolean }) {
  const r = useVF((s) => s.referrals.find((x) => x.id === id));
  const specs = useVF((s) => s.specialists.filter((x) => x.specialty === r?.specialty));
  if (!r) return <Empty title="Remisión no encontrada" />;
  return (<><PageTitle title={`Remisión · ${r.specialty}`} subtitle={r.pet}><StatusBadge status={r.status} /></PageTitle>
    {r.specialist && <Card><b>Especialista asignado</b><p>{r.specialist}</p></Card>}
    <SectionTitle>{select ? "Elige tu especialista" : "Especialistas disponibles"}</SectionTitle>
    {specs.length ? specs.map((s) => <Card key={s.id} className="mb-2 flex items-center justify-between"><div><b>{s.name}</b><p className="text-sm text-muted-foreground">{s.city}</p></div>
      {select && <Btn variant="soft" onClick={() => { actions.createRequest({ client: getName(), phone: "", pet: r.pet, channel: "Portal", message: `Prefiero ${s.name} para la remisión de ${r.specialty}` }); toast.success("Preferencia enviada a coordinación"); }}>Elegir</Btn>}</Card>) : <Empty title="Sin especialistas registrados" />}
    {!select && r.status === "por_resolver" && <div className="mt-3">{L(`/app/remisiones/${id}/seleccionar`, "Elegir especialista →")}</div>}</>);
}
let nameRef = "";
const getName = () => nameRef;
function FollowUps() {
  const tr = useVF((s) => s.treatments);
  const names = useVF((s) => s.pets.map((p) => p.name));
  const mine = tr.filter((t) => names.includes(t.pet));
  return (<><PageTitle title="Seguimientos" subtitle="Tratamientos y controles" />
    {mine.length ? mine.map((t) => <Card key={t.id} className="mb-2"><b className="flex items-center gap-2"><Pill className="h-5 w-5 text-primary" />{t.pet} · {t.plan}</b><p className="text-sm text-muted-foreground">{t.frequency} · responsable {t.responsible}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-card"><div className="h-full bg-gradient-primary" style={{ width: `${(t.done / t.total) * 100}%` }} /></div></Card>) : <Empty title="Sin seguimientos activos" />}</>);
}
function InformPayment({ id }: { id: string }) {
  const { rows, create } = useRecords("pago_informado", id); const [ref, setRef] = useState("");
  if (rows === null) return null;
  const open = rows.find((r) => r.status === "abierto");
  if (open) return <p className="mt-3 rounded-2xl bg-sage p-3 text-sm">Informaste este pago. Finanzas lo está verificando.</p>;
  return (<div className="mt-3 space-y-2"><input className="w-full rounded-2xl bg-accent p-3" aria-label="Referencia del pago" placeholder="Referencia o medio (ej. Nequi 123)" value={ref} onChange={(e) => setRef(e.target.value)} />
    <Btn className="w-full" disabled={!ref.trim()} onClick={() => void create({ title: "Pago informado por el cliente", detail: ref.trim(), scope: "client", owner_id: getVF().userId })}><Wallet className="h-5 w-5" />Informar pago</Btn></div>);
}
function PaymentDetail({ id }: { id: string }) {
  const p = useVF((s) => s.payments.find((x) => x.id === id));
  if (!p) return <Empty title="Pago no encontrado" />;
  return (<><PageTitle title={p.concept} subtitle={p.date}><StatusBadge status={p.status} /></PageTitle>
    <Card><p className="text-3xl font-bold">{formatCOP(p.amount)}</p><p className="text-muted-foreground">{p.client}</p>
      {p.status !== "pagado" && <InformPayment id={id} />}</Card>
    <p className="mt-3 text-sm text-muted-foreground">La pasarela de pago real se conectará en una próxima entrega.</p></>);
}
function Addresses({ idx }: { idx?: number | undefined }) {
  const { row, save } = useClientSettings();
  const [f, setF] = useState({ label: "", address: "", zone: "Zona Norte" });
  if (!row) return <p className="text-muted-foreground">Cargando…</p>;
  const list = row.addresses ?? [];
  if (idx !== undefined) {
    const a = list[idx]; if (!a) return <Empty title="Dirección no encontrada" />;
    return (<><PageTitle title={a.label} subtitle={a.zone} /><Card><p>{a.address}</p><Btn variant="outline" className="mt-3" onClick={() => void save({ addresses: list.filter((_, i) => i !== idx) })}>Eliminar dirección</Btn></Card></>);
  }
  return (<><PageTitle title="Mis direcciones" subtitle="Dónde atendemos a tus mascotas" />
    {list.map((a, i) => <RowLink key={i} icon={MapPin} to={`/app/direcciones/${i}`} label={`${a.label} · ${a.address}`} />)}
    <SectionTitle>Agregar dirección</SectionTitle>
    <Card className="space-y-3"><input className={input} placeholder="Nombre (Casa, Oficina)" aria-label="Nombre de la dirección" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
      <input className={input} placeholder="Dirección" aria-label="Dirección" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
      <select className={input} aria-label="Zona" value={f.zone} onChange={(e) => setF({ ...f, zone: e.target.value })}><option>Zona Norte</option><option>Zona Centro</option><option>Zona Sur</option></select>
      <Btn className="w-full" disabled={!f.label || !f.address} onClick={() => { void save({ addresses: [...list, f] }); setF({ label: "", address: "", zone: "Zona Norte" }); }}>Guardar dirección</Btn></Card></>);
}
function Toggles({ title, subtitle, field, items }: { title: string; subtitle: string; field: "preferences" | "consents"; items: string[] }) {
  const { row, save } = useClientSettings();
  if (!row) return <p className="text-muted-foreground">Cargando…</p>;
  const cur = (row[field] ?? {}) as Record<string, boolean>;
  return (<><PageTitle title={title} subtitle={subtitle} />
    <div className="space-y-2">{items.map((k) => <label key={k} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary p-4"><span>{k}</span><input type="checkbox" className="h-6 w-6 accent-primary" checked={!!cur[k]} onChange={(e) => void save({ [field]: { ...cur, [k]: e.target.checked } })} /></label>)}</div></>);
}
function CaregiverDetail({ id }: { id: string }) {
  const m = useVF((s) => s.staff.find((x) => x.id === id));
  if (!m) return <Empty title="Persona no encontrada" />;
  return (<><PageTitle title={m.name} subtitle={`${m.role} · ${m.zone}`} />
    <Card className="flex items-center gap-3"><img src={m.photo} alt={m.name} className="h-16 w-16 rounded-full object-cover" /><div><StatusBadge status={m.status} /><p className="mt-1 text-sm text-muted-foreground">{m.skills.join(" · ")}</p></div></Card></>);
}
function HelpRequests() {
  const reqs = useVF((s) => s.requests); const name = useVF((s) => s.displayName); const pets = useVF((s) => s.pets);
  const [msg, setMsg] = useState(""); const [pet, setPet] = useState("");
  return (<><PageTitle title="Mis solicitudes de ayuda" />
    <Card className="space-y-3"><select className={input} aria-label="Mascota" value={pet} onChange={(e) => setPet(e.target.value)}><option value="">General</option>{pets.map((p) => <option key={p.id}>{p.name}</option>)}</select>
      <textarea className={input} rows={3} placeholder="¿En qué te ayudamos?" aria-label="Mensaje" value={msg} onChange={(e) => setMsg(e.target.value)} />
      <Btn className="w-full" disabled={!msg.trim()} onClick={() => { actions.createRequest({ client: name, phone: "", pet, channel: "Portal", message: msg.trim() }); setMsg(""); toast.success("Mensaje enviado"); }}>Enviar</Btn></Card>
    <SectionTitle>Enviadas</SectionTitle>
    {reqs.length ? reqs.map((r) => <Card key={r.id} className="mb-2"><div className="flex justify-between gap-2"><b className="min-w-0 break-words">{r.pet || "General"} · {requestTime(r.at)}</b><StatusBadge status={r.status} /></div><p className="text-muted-foreground">{r.message}</p></Card>) : <Empty title="Sin solicitudes" />}</>);
}
function Security() {
  const [pw, setPw] = useState(""); const [busy, setBusy] = useState(false);
  return (<><PageTitle title="Seguridad" subtitle="Cambia tu contraseña" />
    <Card className="space-y-3"><input type="password" className={input} placeholder="Nueva contraseña (mínimo 8)" aria-label="Nueva contraseña" value={pw} onChange={(e) => setPw(e.target.value)} />
      <Btn className="w-full" disabled={pw.length < 8 || busy} onClick={async () => { setBusy(true); const { error } = await supabase.auth.updateUser({ password: pw }); setBusy(false); if (error) toast.error(error.message); else { toast.success("Contraseña actualizada"); setPw(""); } }}>Actualizar contraseña</Btn></Card>
    <Btn variant="outline" className="mt-4 w-full" onClick={() => void supabase.auth.signOut()}>Cerrar sesión</Btn></>);
}

/** Pattern → page for client portal screens (/app/*). */
export function clientPage(path: string): ReactNode | null {
  const s = path.replace(/\/$/, "").split("/").slice(2); // after /app
  const [a, id, c] = s;
  nameRef = getVFName();
  switch (a) {
    case "mascotas": if (id === "nueva") return <NewPet />; if (id && c === "editar") return <EditPet id={id} />; if (id && c === "salud") return <PetHealth id={id} />; if (id && c === "documentos") return <PetDocs id={id} />; return null;
    case "agenda": return id ? <VisitDetail id={id} /> : null;
    case "solicitudes": if (!id) return <MyRequests />; if (c === "reprogramar") return <Reschedule id={id} />; if (c === "cancelar") return <Cancel id={id} />; return <VisitDetail id={id} />;
    case "visitas": if (id && c === "preparacion") return <Prep id={id} />; if (id && c === "estado") return <LiveStatus id={id} />; return null;
    case "historial": return <History />;
    case "remisiones": return id ? <ReferralDetail id={id} select={c === "seleccionar"} /> : null;
    case "seguimientos": return <FollowUps />;
    case "pagos": return id ? <PaymentDetail id={id} /> : null;
    case "direcciones": return <Addresses idx={id !== undefined ? Number(id) : undefined} />;
    case "cuidadores": return id ? <CaregiverDetail id={id} /> : null;
    case "preferencias": return <Toggles title="Preferencias" subtitle="Cómo quieres que te contactemos" field="preferences" items={["Recordatorios por WhatsApp", "Recordatorios por correo", "Llamada antes de la visita", "Prefiero visitas en la mañana", "Prefiero visitas en la tarde"]} />;
    case "consentimientos": return <Toggles title="Consentimientos" subtitle="Autorizaciones registradas en tu cuenta" field="consents" items={["Tratamiento de datos personales (Ley 1581)", "Uso de fotos de mi mascota", "Envío de recordatorios de salud", "Compartir historia con especialistas remitidos"]} />;
    case "ayuda": return id === "solicitudes" ? <HelpRequests /> : null;
    case "perfil": return id === "seguridad" ? <Security /> : null;
  }
  return null;
}
