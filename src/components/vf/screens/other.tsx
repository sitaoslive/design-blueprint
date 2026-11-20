import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, PawPrint, Stethoscope, MessageCircle, User, Clock, Users, Activity, Copy, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVF, actions, getVF, refreshVF } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { formatCOP } from "@/lib/vf/format";
import { autonomyIndex } from "@/lib/vf/rules";
import { PageTitle, SectionTitle, Card, Empty, Btn, StatusBadge, RowLink, MetricTile } from "../ui";
import { useRows } from "./useRow";

const input = "w-full rounded-2xl bg-accent p-3";
const Loading = () => <p className="text-muted-foreground" role="status">Cargando…</p>;
const Err = ({ e }: { e: string }) => <Card><b>No se pudo cargar</b><p className="text-sm text-muted-foreground">{e}</p></Card>;
type PC = { id: string; pet_id: string; caregiver_id: string; caregiver_name: string; tasks: string };

/* ---------- Owner: manage authorized caregivers ---------- */
export function CaregiversManager() {
  const pets = useVF((s) => s.pets.filter((p) => p.ownerId === s.userId));
  const { rows, error, run } = useRows<PC>("pet_caregivers");
  const [f, setF] = useState({ pet: "", code: "", name: "", tasks: "" });
  const ok = f.pet && /^[0-9a-f-]{36}$/i.test(f.code.trim()) && f.name.trim();
  return (<><PageTitle title="Cuidadores autorizados" subtitle="Personas que pueden recibir a tus mascotas" />
    {error ? <Err e={error} /> : !rows ? <Loading /> : rows.length === 0 ? <Empty title="Sin cuidadores" hint="Agrega uno con su código de cuidador." /> :
      rows.map((r) => <Card key={r.id} className="mb-2 flex items-start justify-between gap-2"><div><b>{r.caregiver_name}</b><p className="text-sm text-muted-foreground">{pets.find((p) => p.id === r.pet_id)?.name ?? r.pet_id} · {r.tasks || "Sin indicaciones"}</p></div>
        <button aria-label={`Quitar a ${r.caregiver_name}`} onClick={() => void run(db.from("pet_caregivers").delete().eq("id", r.id), "Acceso retirado")}><Trash2 className="h-5 w-5 text-primary" /></button></Card>)}
    <SectionTitle>Autorizar cuidador</SectionTitle>
    <Card className="space-y-3">
      <select className={input} aria-label="Mascota" value={f.pet} onChange={(e) => setF({ ...f, pet: e.target.value })}><option value="">Elige mascota</option>{pets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      <input className={input} placeholder="Nombre del cuidador" aria-label="Nombre del cuidador" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <input className={input} placeholder="Código de cuidador (lo ve en su perfil)" aria-label="Código de cuidador" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
      <input className={input} placeholder="Indicaciones (ej. dar comida 8am)" aria-label="Indicaciones" value={f.tasks} onChange={(e) => setF({ ...f, tasks: e.target.value })} />
      <Btn className="w-full" disabled={!ok} onClick={() => { void run(db.from("pet_caregivers").insert({ pet_id: f.pet, caregiver_id: f.code.trim(), caregiver_name: f.name.trim(), tasks: f.tasks }), "Cuidador autorizado"); setF({ pet: "", code: "", name: "", tasks: "" }); }}>Autorizar</Btn>
    </Card>
    <p className="mt-3 text-sm text-muted-foreground">El cuidador solo ve la mascota autorizada y sus visitas. Nunca ve pagos ni documentos clínicos.</p></>);
}

/* ---------- Caregiver portal ---------- */
function useCareRows() { return useRows<PC>("pet_caregivers"); }
function CareHome() {
  const { rows } = useCareRows(); const uid = useVF((s) => s.userId);
  const mine = (rows ?? []).filter((r) => r.caregiver_id === uid);
  const visits = useVF((s) => s.visits.filter((v) => mine.some((m) => m.pet_id === v.petId) && v.status !== "finalizada"));
  return (<><PageTitle title="Resumen autorizado" subtitle="Lo que el propietario compartió contigo" />
    <div className="grid grid-cols-2 gap-3"><MetricTile icon={PawPrint} label="Mascotas" value={mine.length} to="/cuidador/mascotas" /><MetricTile icon={CalendarDays} label="Próximas visitas" value={visits.length} tone="sage" to="/cuidador/visitas" /></div>
    <SectionTitle>Accesos</SectionTitle>
    <RowLink icon={Clock} to="/cuidador/tareas" label="Mis responsabilidades" /><RowLink icon={MessageCircle} to="/cuidador/mensajes" label="Mensajes a coordinación" tone="sage" /><RowLink icon={User} to="/cuidador/perfil" label="Mi perfil y código" /></>);
}
function CarePets() {
  const { rows, error } = useCareRows(); const uid = useVF((s) => s.userId); const pets = useVF((s) => s.pets);
  if (error) return <Err e={error} />; if (!rows) return <Loading />;
  const mine = rows.filter((r) => r.caregiver_id === uid);
  return (<><PageTitle title="Mascotas asignadas" />{mine.length ? mine.map((r) => { const p = pets.find((x) => x.id === r.pet_id); return p ? <Link key={r.id} to={`/cuidador/mascotas/${p.id}` as never} className="mb-2 block"><Card className="flex items-center gap-3"><img src={p.photo} alt={p.name} className="h-14 w-14 rounded-2xl object-cover" /><div><b>{p.name}</b><p className="text-sm text-muted-foreground">{p.species} · {p.breed}</p></div></Card></Link> : null; }) : <Empty title="Aún no tienes mascotas asignadas" hint="Comparte tu código de cuidador con el propietario." />}</>);
}
function CarePet({ id }: { id: string }) {
  const p = useVF((s) => s.pets.find((x) => x.id === id)); const { rows } = useCareRows();
  if (!p) return <Empty title="Sin acceso a esta mascota" />;
  const r = (rows ?? []).find((x) => x.pet_id === id);
  return (<><PageTitle title={p.name} subtitle={`${p.species} · ${p.breed} · ${p.age}`} />
    <Card><b>Alergias</b><p className="text-muted-foreground">{p.allergies}</p></Card>
    <Card className="mt-3"><b>Indicaciones del propietario</b><p className="text-muted-foreground">{r?.tasks || "Sin indicaciones"}</p></Card>
    <p className="mt-3 text-sm text-muted-foreground">Perfil limitado: no incluye historia clínica ni pagos.</p></>);
}
function CareVisits() {
  const visits = useVF((s) => s.visits); const pets = useVF((s) => s.pets);
  return (<><PageTitle title="Visitas autorizadas" />{visits.length ? visits.map((v) => <Link key={v.id} to={`/cuidador/visitas/${v.id}` as never} className="mb-2 block"><Card className="flex items-center justify-between"><div><b>{pets.find((p) => p.id === v.petId)?.name} · {v.service}</b><p className="text-sm text-muted-foreground">{v.date} {v.time}</p></div><StatusBadge status={v.status} /></Card></Link>) : <Empty title="Sin visitas autorizadas" />}</>);
}
function CareVisit({ id }: { id: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id)); const pet = useVF((s) => s.pets.find((p) => p.id === v?.petId));
  if (!v) return <Empty title="Sin acceso a esta visita" />;
  return (<><PageTitle title={v.service} subtitle={pet?.name ?? ""} /><Card className="space-y-2"><p>{v.date} · {v.time}</p><p>{v.address || v.zone}</p><StatusBadge status={v.status} /></Card></>);
}
function CareTasks() {
  const { rows } = useCareRows(); const uid = useVF((s) => s.userId); const pets = useVF((s) => s.pets);
  const mine = (rows ?? []).filter((r) => r.caregiver_id === uid);
  return (<><PageTitle title="Responsabilidades" />{!rows ? <Loading /> : mine.length ? mine.map((r) => <Card key={r.id} className="mb-2"><b>{pets.find((p) => p.id === r.pet_id)?.name}</b><p>{r.tasks || "Sin indicaciones"}</p></Card>) : <Empty title="Sin responsabilidades asignadas" />}</>);
}
function Messages({ title }: { title: string }) {
  const reqs = useVF((s) => s.requests); const name = useVF((s) => s.displayName); const [m, setM] = useState("");
  return (<><PageTitle title={title} /><Card className="space-y-3"><textarea rows={3} className={input} aria-label="Mensaje" placeholder="Escribe a coordinación" value={m} onChange={(e) => setM(e.target.value)} />
    <Btn className="w-full" disabled={!m.trim()} onClick={() => { actions.createRequest({ client: name, phone: "", pet: "", channel: "Portal", message: m.trim() }); setM(""); toast.success("Mensaje enviado"); }}>Enviar</Btn></Card>
    <SectionTitle>Enviados</SectionTitle>{reqs.length ? reqs.map((r) => <Card key={r.id} className="mb-2"><div className="flex justify-between"><b>{r.at}</b><StatusBadge status={r.status} /></div><p className="text-muted-foreground">{r.message}</p></Card>) : <Empty title="Sin mensajes" />}</>);
}
export function Profile({ code }: { code?: boolean }) {
  const name = useVF((s) => s.displayName); const uid = useVF((s) => s.userId) ?? ""; const roles = useVF((s) => s.roles);
  return (<><PageTitle title="Mi perfil" /><Card><b className="text-lg">{name}</b><p className="text-sm text-muted-foreground">{roles.join(" · ")}</p></Card>
    {code && <Card className="mt-3"><b>Tu código de cuidador</b><p className="break-all font-mono text-sm">{uid}</p><Btn variant="soft" className="mt-2" onClick={() => { void navigator.clipboard.writeText(uid); toast.success("Código copiado"); }}><Copy className="h-4 w-4" />Copiar</Btn><p className="mt-2 text-sm text-muted-foreground">Compártelo con el propietario para que te autorice.</p></Card>}
    <Btn variant="outline" className="mt-4 w-full" onClick={() => void supabase.auth.signOut().then(() => location.assign("/auth"))}>Cerrar sesión</Btn></>);
}

/* ---------- Team ---------- */
function useMe() { const uid = useVF((s) => s.userId); return useVF((s) => s.staff.find((m) => (m as { userId?: string }).userId === uid) ?? s.staff[0]); }
function RouteDetail({ id }: { id: string }) {
  const m = useVF((s) => s.staff.find((x) => x.id === id)); const visits = useVF((s) => s.visits.filter((v) => v.staffId === id)); const pets = useVF((s) => s.pets);
  if (!m) return <Empty title="Ruta no encontrada" />;
  return (<><PageTitle title={`Ruta de ${m.name}`} subtitle={`${m.zone} · ${visits.length} paradas`} />{visits.map((v, i) => <Link key={v.id} to={`/equipo/visita/${v.id}` as never} className="mb-2 block"><Card className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-primary font-bold text-primary-foreground">{i + 1}</span><div className="flex-1"><b>{v.time} · {pets.find((p) => p.id === v.petId)?.name}</b><p className="text-sm text-muted-foreground">{v.address || v.zone}</p></div><StatusBadge status={v.status} /></Card></Link>)}</>);
}
function DoneServices() {
  const me = useMe(); const done = useVF((s) => s.visits.filter((v) => v.status === "finalizada" && (!me || v.staffId === me.id))); const pets = useVF((s) => s.pets);
  return (<><PageTitle title="Servicios realizados" subtitle={`${done.length} visitas finalizadas`} />{done.length ? done.map((v) => <Card key={v.id} className="mb-2"><b>{v.service} · {pets.find((p) => p.id === v.petId)?.name}</b><p className="text-sm text-muted-foreground">{v.date} {v.time}</p></Card>) : <Empty title="Aún sin servicios finalizados" />}</>);
}
function StaffPayments() {
  const pays = useVF((s) => s.payments); const [f, setF] = useState({ client: "", concept: "Consulta general", amount: "" });
  const canWrite = useVF((s) => s.roles.some((r) => ["finanzas", "administrador", "luis"].includes(r)));
  return (<><PageTitle title="Registro de cobros" subtitle="Cobros de tus visitas" />
    {canWrite && <Card className="mb-3 space-y-2"><input className={input} placeholder="Cliente" aria-label="Cliente" value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} /><input className={input} placeholder="Concepto" aria-label="Concepto" value={f.concept} onChange={(e) => setF({ ...f, concept: e.target.value })} /><input className={input} inputMode="numeric" placeholder="Monto COP" aria-label="Monto" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/\D/g, "") })} />
      <Btn className="w-full" disabled={!f.client || !f.amount} onClick={async () => { const { error } = await db.from("payments").insert({ client: f.client, concept: f.concept, amount: Number(f.amount) }); if (error) toast.error(error.message); else { toast.success("Cobro registrado"); void refreshVF(); setF({ client: "", concept: "Consulta general", amount: "" }); } }}>Registrar cobro</Btn></Card>}
    {!canWrite && <p className="mb-3 text-sm text-muted-foreground">Registrar cobros requiere perfil de Finanzas; aquí ves el estado.</p>}
    {pays.map((p) => <Card key={p.id} className="mb-2 flex justify-between"><div><b>{p.client}</b><p className="text-sm text-muted-foreground">{p.concept}</p></div><div className="text-right"><b>{formatCOP(p.amount)}</b><div><StatusBadge status={p.status} /></div></div></Card>)}</>);
}
export function Commitments({ base, id }: { base: string; id?: string | undefined }) {
  const tasks = useVF((s) => s.tasks); const [t, setT] = useState("");
  if (id) { const x = tasks.find((k) => k.id === id); if (!x) return <Empty title="Compromiso no encontrado" />; return (<><PageTitle title={x.title} subtitle={x.done ? "Cumplido" : "Pendiente"} /><Btn onClick={() => actions.toggleTask(x.id)}>{x.done ? "Reabrir" : "Marcar cumplido"}</Btn></>); }
  return (<><PageTitle title="Compromisos" subtitle={`${tasks.filter((x) => !x.done).length} pendientes`} />
    <Card className="mb-3 flex gap-2"><input className={input} placeholder="Nuevo compromiso" aria-label="Nuevo compromiso" value={t} onChange={(e) => setT(e.target.value)} /><Btn disabled={!t.trim()} onClick={async () => { const { error } = await db.from("tasks").insert({ title: t.trim(), staff_id: getVF().staff[0]?.id ?? null }); if (error) toast.error(error.message); else { toast.success("Compromiso creado"); setT(""); void refreshVF(); } }}>Agregar</Btn></Card>
    {tasks.map((x) => <Link key={x.id} to={`${base}/${x.id}` as never} className="mb-2 block"><Card className="flex justify-between"><b className={x.done ? "line-through" : ""}>{x.title}</b><StatusBadge status={x.done ? "confirmada" : "pendiente"} /></Card></Link>)}</>);
}
type Shift = { id: string; staff_id: string; day: string; start_time: string; end_time: string; kind: string };
export function Shifts({ kind }: { kind: "turno" | "ausencia" }) {
  const { rows, error, run } = useRows<Shift>("shifts"); const staff = useVF((s) => s.staff);
  const canEdit = useVF((s) => s.roles.some((r) => ["coordinador", "luis", "administrador"].includes(r)));
  const [f, setF] = useState({ staff: "", day: "", start: "08:00", end: "16:00" });
  const list = (rows ?? []).filter((r) => r.kind === kind);
  return (<><PageTitle title={kind === "turno" ? "Turnos" : "Ausencias"} subtitle={`${list.length} registros`} />
    {canEdit && <Card className="mb-3 space-y-2"><select className={input} aria-label="Persona" value={f.staff} onChange={(e) => setF({ ...f, staff: e.target.value })}><option value="">Persona</option>{staff.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
      <input className={input} placeholder="Día (ej. Martes 28)" aria-label="Día" value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} />
      <div className="grid grid-cols-2 gap-2"><input type="time" className={input} aria-label="Desde" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /><input type="time" className={input} aria-label="Hasta" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></div>
      <Btn className="w-full" disabled={!f.staff || !f.day} onClick={() => { void run(db.from("shifts").insert({ staff_id: f.staff, day: f.day, start_time: f.start, end_time: f.end, kind }), kind === "turno" ? "Turno creado" : "Ausencia registrada"); if (kind === "ausencia") actions.setStaffStatus(f.staff, "ausente"); setF({ ...f, day: "" }); }}>{kind === "turno" ? "Crear turno" : "Registrar ausencia"}</Btn></Card>}
    {error ? <Err e={error} /> : !rows ? <Loading /> : list.length ? list.map((r) => <Card key={r.id} className="mb-2 flex items-center justify-between"><div><b>{staff.find((m) => m.id === r.staff_id)?.name ?? "—"}</b><p className="text-sm text-muted-foreground">{r.day} · {r.start_time}–{r.end_time}</p></div>
      {canEdit && <button aria-label="Eliminar" onClick={() => void run(db.from("shifts").delete().eq("id", r.id), "Eliminado")}><Trash2 className="h-5 w-5 text-primary" /></button>}</Card>) : <Empty title="Sin registros" />}</>);
}
function Evaluations() {
  const courses = useVF((s) => s.courses);
  return (<><PageTitle title="Evaluaciones" subtitle="Resultado por curso" />{courses.map((c) => <Card key={c.id} className="mb-2"><div className="flex justify-between"><b>{c.title}</b><span>{c.progress >= 100 ? "Aprobado" : `${c.progress}%`}</span></div><Btn variant="soft" className="mt-2" disabled={c.progress >= 100} onClick={() => actions.progressCourse(c.id)}>Registrar avance</Btn></Card>)}</>);
}

/* ---------- Operations ---------- */
function Contacts({ base }: { base: string }) {
  const pets = useVF((s) => s.pets); const reqs = useVF((s) => s.requests); const [q, setQ] = useState("");
  const owners = Array.from(new Set([...pets.map((p) => p.owner), ...reqs.map((r) => r.client)].filter(Boolean))).filter((o) => o.toLowerCase().includes(q.toLowerCase()));
  return (<><PageTitle title={base.endsWith("contactos") ? "Contactos" : "Propietarios"} subtitle={`${owners.length} personas`} />
    <input className={`${input} mb-3`} placeholder="Buscar por nombre" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
    {owners.map((o) => <RowLink key={o} icon={Users} to={`/operaciones/clientes/${encodeURIComponent(o)}`} label={`${o} · ${pets.filter((p) => p.owner === o).length} mascotas`} />)}</>);
}
function Family({ name }: { name: string }) {
  const pets = useVF((s) => s.pets.filter((p) => p.owner === name)); const reqs = useVF((s) => s.requests.filter((r) => r.client === name)); const pays = useVF((s) => s.payments.filter((p) => p.client === name));
  return (<><PageTitle title={name} subtitle="Ficha familiar" />
    <SectionTitle>Mascotas</SectionTitle>{pets.length ? pets.map((p) => <RowLink key={p.id} icon={PawPrint} to={`/operaciones/mascotas/${p.id}`} label={`${p.name} · ${p.breed}`} />) : <Empty title="Sin mascotas registradas" />}
    <SectionTitle>Solicitudes</SectionTitle>{reqs.length ? reqs.map((r) => <Card key={r.id} className="mb-2"><b>{r.channel} · {r.at}</b><p className="text-muted-foreground">{r.message}</p></Card>) : <Empty title="Sin solicitudes" />}
    <SectionTitle>Cobros</SectionTitle>{pays.map((p) => <Card key={p.id} className="mb-2 flex justify-between"><span>{p.concept}</span><b>{formatCOP(p.amount)}</b></Card>)}
    <div className="mt-3"><Link to={`/operaciones/memoria/${encodeURIComponent(name)}` as never} className="font-bold text-primary">Memoria de experiencia →</Link></div></>);
}
function OpsPet({ id }: { id: string }) {
  const p = useVF((s) => s.pets.find((x) => x.id === id)); const visits = useVF((s) => s.visits.filter((v) => v.petId === id));
  if (!p) return <Empty title="Mascota no encontrada" />;
  return (<><PageTitle title={p.name} subtitle={`${p.species} · ${p.breed} · ${p.age} · ${p.owner}`} /><Card><b>Alergias</b><p>{p.allergies}</p></Card>
    <SectionTitle>Visitas</SectionTitle>{visits.map((v) => <RowLink key={v.id} icon={Stethoscope} to={`/coordinacion/cita/${v.id}`} label={`${v.service} · ${v.date} ${v.time}`} />)}</>);
}
function Memory({ name }: { name: string }) {
  const { rows, run } = useRows<{ user_id: string; preferences: Record<string, boolean> }>("client_settings", "updated_at");
  const reqs = useVF((s) => s.requests.filter((r) => r.client === name)); const [note, setNote] = useState("");
  return (<><PageTitle title={`Memoria · ${name}`} subtitle="Preferencias y compromisos registrados" />
    <SectionTitle>Lo que nos dijo</SectionTitle>{reqs.length ? reqs.map((r) => <Card key={r.id} className="mb-2"><p>{r.message}</p><p className="text-xs text-muted-foreground">{r.channel} · {r.at}</p></Card>) : <Empty title="Sin registros todavía" />}
    <SectionTitle>Preferencias guardadas por clientes</SectionTitle><p className="text-sm text-muted-foreground">{rows ? `${rows.length} clientes con preferencias registradas` : "Cargando…"}</p>
    <SectionTitle>Agregar nota de memoria</SectionTitle><Card className="space-y-2"><input className={input} aria-label="Nota" placeholder="Ej. prefiere que llamen antes" value={note} onChange={(e) => setNote(e.target.value)} />
      <Btn className="w-full" disabled={!note.trim()} onClick={() => { void run(db.from("service_requests").insert({ client: name, message: `[Memoria] ${note.trim()}`, channel: "Portal", status: "resuelta", created_by: getVF().userId }), "Nota guardada"); setNote(""); }}>Guardar nota</Btn></Card></>);
}
type Wait = { id: string; client: string; pet: string; service: string; zone: string; note: string; status: string };
function Waitlist() {
  const { rows, error, run } = useRows<Wait>("waitlist"); const [f, setF] = useState({ client: "", pet: "", service: "Consulta general", zone: "Zona Norte", note: "" });
  return (<><PageTitle title="Lista de espera" subtitle={`${(rows ?? []).filter((r) => r.status === "esperando").length} esperando`} />
    <Card className="mb-3 space-y-2"><input className={input} placeholder="Cliente" aria-label="Cliente" value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} /><input className={input} placeholder="Mascota" aria-label="Mascota" value={f.pet} onChange={(e) => setF({ ...f, pet: e.target.value })} />
      <select className={input} aria-label="Zona" value={f.zone} onChange={(e) => setF({ ...f, zone: e.target.value })}><option>Zona Norte</option><option>Zona Centro</option><option>Zona Sur</option></select><input className={input} placeholder="Nota" aria-label="Nota" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
      <Btn className="w-full" disabled={!f.client.trim()} onClick={() => { void run(db.from("waitlist").insert(f), "Agregado a la lista"); setF({ ...f, client: "", pet: "", note: "" }); }}>Agregar</Btn></Card>
    {error ? <Err e={error} /> : !rows ? <Loading /> : rows.length ? rows.map((r) => <Card key={r.id} className="mb-2"><div className="flex justify-between"><b>{r.client} · {r.pet}</b><StatusBadge status={r.status === "esperando" ? "pendiente" : "confirmada"} /></div><p className="text-sm text-muted-foreground">{r.service} · {r.zone} · {r.note}</p>
      {r.status === "esperando" && <Btn variant="soft" className="mt-2" onClick={() => void run(db.from("waitlist").update({ status: "agendado" }).eq("id", r.id), "Marcado como agendado")}>Marcar agendado</Btn>}</Card>) : <Empty title="Lista vacía" />}</>);
}
function Capacity({ future }: { future?: boolean }) {
  const staff = useVF((s) => s.staff); const visits = useVF((s) => s.visits); const zones = ["Zona Norte", "Zona Centro", "Zona Sur"];
  return (<><PageTitle title={future ? "Demanda futura" : "Capacidad actual"} subtitle={future ? "Proyección simple: visitas pendientes por zona vs. equipo" : "Equipo disponible y carga"} />
    {zones.map((z) => { const team = staff.filter((m) => m.zone === z && m.status !== "ausente").length; const demand = visits.filter((v) => v.zone === z && (future ? v.status === "pendiente" : v.status !== "finalizada")).length; const cap = team * 6;
      return <Card key={z} className="mb-2"><div className="flex justify-between"><b>{z}</b><span>{demand}/{cap} cupos</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-card"><div className="h-full bg-gradient-primary" style={{ width: `${cap ? Math.min(100, (demand / cap) * 100) : 100}%` }} /></div><p className="mt-1 text-sm text-muted-foreground">{team} personas activas{cap && demand / cap > 0.8 ? " · capacidad alta, considera refuerzo" : ""}</p></Card>; })}</>);
}
function Wellbeing({ skills }: { skills?: boolean }) {
  const staff = useVF((s) => s.staff);
  return (<><PageTitle title={skills ? "Capacidades profesionales" : "Bienestar del equipo"} subtitle={skills ? "Habilidades por persona" : "Carga de trabajo actual"} />
    {staff.map((m) => <Card key={m.id} className="mb-2"><div className="flex justify-between"><b>{m.name}</b>{!skills && <span className={m.load > 80 ? "font-bold text-primary" : ""}>{m.load}%</span>}</div>
      <p className="text-sm text-muted-foreground">{skills ? m.skills.join(" · ") || "Sin habilidades registradas" : m.load > 80 ? "Sobrecarga: redistribuir visitas" : "Carga saludable"}</p></Card>)}</>);
}

/* ---------- Direction ---------- */
function Autonomy({ dep }: { dep?: boolean }) {
  const ap = useVF((s) => s.approvals); const reqs = useVF((s) => s.requests);
  const total = ap.length + reqs.length; const needLuis = ap.length; const idx = autonomyIndex(total - needLuis, total);
  return (<><PageTitle title={dep ? "Dependencia operativa de Luis" : "Índice de autonomía"} subtitle="Calculado con solicitudes y aprobaciones reales" />
    <Card className="text-center"><p className="text-5xl font-bold text-primary">{dep ? 100 - idx : idx}%</p><p className="text-muted-foreground">{dep ? "de las decisiones requieren a Luis" : "resuelto por el equipo sin Luis"}</p></Card>
    <SectionTitle>Requieren a Luis</SectionTitle>{ap.filter((a) => a.status === "pendiente").map((a) => <RowLink key={a.id} icon={Activity} to="/luis/aprobaciones" label={a.title} />)}</>);
}
function PendingResults() {
  const refs = useVF((s) => s.referrals.filter((r) => r.status !== "cerrada"));
  const { rows } = useRows<{ id: string; title: string; referral_id: string | null; created_at: string }>("specialist_reports");
  return (<><PageTitle title="Resultados pendientes" subtitle={`${refs.length} remisiones abiertas`} />{refs.map((r) => <Card key={r.id} className="mb-2 flex justify-between"><div><b>{r.pet} · {r.specialty}</b><p className="text-sm text-muted-foreground">{r.specialist ?? "Sin especialista"}</p></div><StatusBadge status={r.status} /></Card>)}
    <SectionTitle>Informes recibidos</SectionTitle>{!rows ? <Loading /> : rows.length ? rows.map((r) => <Card key={r.id} className="mb-2"><b>{r.title}</b></Card>) : <Empty title="Aún sin informes" />}</>);
}
export function LegacyScenario({ id }: { id: string }) {
  const staff = useVF((s) => s.staff); const out = staff.find((m) => m.id === id) ?? staff[0]; const visits = useVF((s) => s.visits.filter((v) => v.staffId === out?.id && v.status !== "finalizada"));
  const alt = staff.filter((m) => m.id !== out?.id && m.status !== "ausente");
  return (<><PageTitle title="Comparación de escenario" subtitle={`Si ${out?.name ?? "—"} se ausenta`} />
    <div className="grid grid-cols-2 gap-2"><Card><b>Hoy</b><p>{visits.length} visitas asignadas</p></Card><Card><b>Escenario</b><p>{alt.length ? `${Math.ceil(visits.length / alt.length)} visitas extra por persona` : "Sin reemplazos"}</p></Card></div>
    <SectionTitle>Probar con otra persona</SectionTitle>{staff.map((m) => <RowLink key={m.id} icon={Users} to={`/direccion/simulaciones/${m.id}`} label={m.name} />)}</>);
}

/* ---------- Specialist ---------- */
function useMySpec() { const { rows } = useRows<{ id: string; name: string; specialty: string; user_id: string | null }>("specialists", "name"); const uid = useVF((s) => s.userId); return rows?.find((s) => s.user_id === uid); }
/** Referrals the current specialist may work on: own ones if linked, all for unlinked directors. */
function useMyRefs() { const spec = useMySpec(); const isDir = useVF((s) => s.roles.includes("luis") || s.roles.includes("administrador")); const all = useVF((s) => s.referrals); return { spec, isDir, refs: all.filter((r) => (spec ? r.specialist === spec.name : isDir)) }; }
function SpecCases({ title, base }: { title: string; base: string }) {
  const { spec, isDir, refs } = useMyRefs();
  return (<><PageTitle title={title} subtitle={spec ? `${spec.name} · ${spec.specialty}` : isDir ? "Vista de dirección" : "Cuenta aún no vinculada a un especialista"} />
    {refs.length ? refs.map((r) => <Link key={r.id} to={`${base}/${r.id}` as never} className="mb-2 block"><Card className="flex justify-between"><div><b>{r.pet} · {r.specialty}</b><p className="text-sm text-muted-foreground">{r.specialist ?? "Sin asignar"}</p></div><StatusBadge status={r.status} /></Card></Link>) : <Empty title="Sin casos autorizados" hint="Dirección vincula tu cuenta en Especialistas." />}</>);
}
function SpecCase({ id }: { id: string }) {
  const { refs } = useMyRefs(); const r = refs.find((x) => x.id === id);
  if (!r) return <Empty title="Sin acceso a este caso" />;
  return (<><PageTitle title={`${r.pet} · ${r.specialty}`}><StatusBadge status={r.status} /></PageTitle><Card><p>Especialista: {r.specialist ?? "Sin asignar"}</p>
    {r.status !== "cerrada" && <Btn className="mt-3" onClick={async () => { const { error } = await db.from("referrals").update({ status: "cerrada" }).eq("id", id); if (error) toast.error(error.message); else { toast.success("Caso cerrado"); void refreshVF(); } }}>Cerrar caso</Btn>}</Card>
    <div className="mt-3"><Link to={"/especialista/informes/nuevo" as never} className="font-bold text-primary">Subir informe →</Link></div></>);
}
function SpecSlots() {
  const { rows, error, run } = useRows<{ id: string; day: string; time: string; user_id: string }>("specialist_slots"); const uid = useVF((s) => s.userId); const [d, setD] = useState(""); const [t, setT] = useState("09:00");
  const mine = (rows ?? []).filter((r) => r.user_id === uid);
  return (<><PageTitle title="Horarios ofrecidos" /><Card className="mb-3 space-y-2"><input className={input} placeholder="Día (ej. Jueves 30)" aria-label="Día" value={d} onChange={(e) => setD(e.target.value)} /><input type="time" className={input} aria-label="Hora" value={t} onChange={(e) => setT(e.target.value)} />
    <Btn className="w-full" disabled={!d} onClick={() => { void run(db.from("specialist_slots").insert({ day: d, time: t }), "Horario publicado"); setD(""); }}>Publicar horario</Btn></Card>
    {error ? <Err e={error} /> : !rows ? <Loading /> : mine.length ? mine.map((r) => <Card key={r.id} className="mb-2 flex justify-between"><b>{r.day} · {r.time}</b><button aria-label="Eliminar horario" onClick={() => void run(db.from("specialist_slots").delete().eq("id", r.id), "Eliminado")}><Trash2 className="h-5 w-5 text-primary" /></button></Card>) : <Empty title="Sin horarios publicados" />}</>);
}
function SpecReports({ form }: { form?: boolean }) {
  const { rows: all, error, run } = useRows<{ id: string; title: string; body: string; referral_id: string | null; author: string; created_at: string }>("specialist_reports"); const { spec, refs } = useMyRefs(); const uid = useVF((s) => s.userId);
  const rows = all && spec ? all.filter((r) => r.author === uid) : all;
  const [f, setF] = useState({ ref: "", title: "", body: "" });
  return (<><PageTitle title={form ? "Subir informe" : "Informes"} />
    {form && <Card className="mb-3 space-y-2"><select className={input} aria-label="Caso" value={f.ref} onChange={(e) => setF({ ...f, ref: e.target.value })}><option value="">Caso</option>{refs.map((r) => <option key={r.id} value={r.id}>{r.pet} · {r.specialty}</option>)}</select>
      <input className={input} placeholder="Título" aria-label="Título" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /><textarea rows={4} className={input} placeholder="Hallazgos y recomendaciones" aria-label="Contenido" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      <Btn className="w-full" disabled={!f.title.trim()} onClick={() => { void run(db.from("specialist_reports").insert({ referral_id: f.ref || null, title: f.title.trim(), body: f.body }), "Informe enviado"); setF({ ref: "", title: "", body: "" }); }}>Enviar informe</Btn></Card>}
    {error ? <Err e={error} /> : !rows ? <Loading /> : rows.length ? rows.map((r) => <Card key={r.id} className="mb-2"><b>{r.title}</b><p className="text-sm text-muted-foreground">{refs.find((x) => x.id === r.referral_id)?.pet ?? "General"} · {new Date(r.created_at).toLocaleDateString("es-CO")}</p><p className="mt-1 whitespace-pre-line">{r.body}</p></Card>) : <Empty title="Sin informes" />}</>);
}
function SpecAccess() {
  const spec = useMySpec(); const roles = useVF((s) => s.roles);
  return (<><PageTitle title="Accesos concedidos" /><Card><p>Perfil: {roles.join(" · ")}</p><p>Especialista vinculado: {spec?.name ?? "Ninguno"}</p><p className="mt-2 text-sm text-muted-foreground">Solo ves remisiones asignadas a tu nombre. No ves datos de pago ni otros clientes.</p></Card></>);
}

/* ---------- Auth extras ---------- */
function AuthRecover() {
  const [e, setE] = useState(""); const [sent, setSent] = useState(false);
  return (<><PageTitle title="Recuperar acceso" subtitle="Te enviamos un enlace a tu correo" /><Card className="space-y-3"><input type="email" className={input} placeholder="tu@correo.com" aria-label="Correo" value={e} onChange={(x) => setE(x.target.value)} />
    <Btn className="w-full" disabled={!e.includes("@")} onClick={async () => { const { error } = await supabase.auth.resetPasswordForEmail(e, { redirectTo: `${location.origin}/reset-password` }); if (error) toast.error(error.message); else setSent(true); }}>Enviar enlace</Btn>{sent && <p className="text-sm">Revisa tu correo para continuar.</p>}</Card></>);
}
function AuthVerify() {
  const [e, setE] = useState("");
  return (<><PageTitle title="Verificar cuenta" subtitle="¿No te llegó el correo de confirmación?" /><Card className="space-y-3"><input type="email" className={input} placeholder="tu@correo.com" aria-label="Correo" value={e} onChange={(x) => setE(x.target.value)} />
    <Btn className="w-full" disabled={!e.includes("@")} onClick={async () => { const { error } = await supabase.auth.resend({ type: "signup", email: e }); if (error) toast.error(error.message); else toast.success("Correo reenviado"); }}>Reenviar confirmación</Btn></Card></>);
}
function AuthInfo({ title, body }: { title: string; body: string }) { return (<><PageTitle title={title} /><Card><p>{body}</p></Card></>); }
function AuthSecurity() {
  const [pw, setPw] = useState("");
  return (<><PageTitle title="Seguridad de la cuenta" /><Card className="space-y-3"><input type="password" className={input} placeholder="Nueva contraseña (mínimo 8)" aria-label="Nueva contraseña" value={pw} onChange={(e) => setPw(e.target.value)} />
    <Btn className="w-full" disabled={pw.length < 8} onClick={async () => { const { error } = await supabase.auth.updateUser({ password: pw }); if (error) toast.error(error.message.includes("session") ? "Inicia sesión primero" : error.message); else { toast.success("Contraseña actualizada"); setPw(""); } }}>Actualizar</Btn></Card></>);
}

/** Pattern → page for caregiver, team, operations, direction, specialist and auth screens. */
export function otherPage(path: string): ReactNode | null {
  const [area, a = "", b] = path.replace(/\/$/, "").split("/").slice(1);
  if (area === "cuidador") {
    if (a === "inicio") return <CareHome />; if (a === "mascotas") return b ? <CarePet id={b} /> : <CarePets />;
    if (a === "visitas") return b ? <CareVisit id={b} /> : <CareVisits />; if (a === "tareas") return <CareTasks />;
    if (a === "mensajes") return <Messages title="Comunicaciones autorizadas" />; if (a === "perfil") return <Profile code />;
  }
  if (area === "equipo") {
    if (a === "rutas" && b) return <RouteDetail id={b} />; if (a === "servicios") return <DoneServices />; if (a === "cobros") return <StaffPayments />;
    if (a === "compromisos") return <Commitments base="/equipo/compromisos" id={b} />; if (a === "turnos") return <Shifts kind="turno" />; if (a === "ausencias") return <Shifts kind="ausencia" />;
    if (a === "evaluaciones") return <Evaluations />; if (a === "perfil") return <Profile />; if (a === "ayuda") return <Messages title="Solicitar ayuda" />;
  }
  if (area === "operaciones") {
    if (a === "contactos" || (a === "clientes" && !b)) return <Contacts base={path} />; if (a === "clientes" && b) return <Family name={decodeURIComponent(b)} />;
    if (a === "mascotas" && b) return <OpsPet id={b} />; if (a === "memoria" && b) return <Memory name={decodeURIComponent(b)} />;
    if (a === "compromisos") return <Commitments base="/operaciones/compromisos" id={b} />; if (a === "lista-espera") return <Waitlist />;
    if (a === "capacidad") return <Capacity future={b === "proyecciones"} />; if (a === "bienestar") return <Wellbeing />; if (a === "competencias") return <Wellbeing skills />;
  }
  if (area === "direccion") {
    if (a === "compromisos") return <Commitments base="/direccion/compromisos" id={b} />;
    if (a === "informes-pendientes") return <PendingResults />; if (a === "capacidad") return <Capacity />; if (a === "autonomia") return <Autonomy />; if (a === "dependencia") return <Autonomy dep />;
  }
  if (area === "especialista") {
    if (a === "inicio") return <SpecCases title="Casos autorizados" base="/especialista/solicitudes" />;
    if (a === "solicitudes" || a === "citas") return b ? <SpecCase id={b} /> : <SpecCases title={a === "citas" ? "Citas" : "Solicitudes"} base={`/especialista/${a}`} />;
    if (a === "disponibilidad") return <SpecSlots />; if (a === "documentos") return <SpecReports />; if (a === "informes") return <SpecReports form={b === "nuevo"} />;
    if (a === "perfil") return <Profile />; if (a === "accesos") return <SpecAccess />;
  }
  if (area === "auth") {
    if (a === "recuperar") return <AuthRecover />; if (a === "verificar") return <AuthVerify />; if (a === "seguridad") return <AuthSecurity />;
    if (a === "sesion-expirada") return <AuthInfo title="Tu sesión expiró" body="Por seguridad cerramos tu sesión. Vuelve a iniciar sesión para continuar." />;
    if (a === "invitacion") return <AuthInfo title="Aceptar invitación" body="Crea tu cuenta con el correo al que te invitaron. Dirección te asignará el perfil correspondiente (cuidador, equipo o especialista)." />;
  }
  return null;
}
