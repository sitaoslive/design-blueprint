import { ReplacementPlanner } from "@/features/scheduling/components/SchedulerPages";
/* PROMPT 01C screens: pages, sub-screens and states that 01B left undefined. Real data via store tables + `records`. */
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2, Circle, ShieldCheck, CalendarDays, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVF, actions, getVF, refreshVF } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { formatCOP } from "@/lib/vf/format";
import { SCREENS } from "@/lib/vf/screens";
import { useMyStaff } from "@/lib/vf/me";
import { PageTitle, SectionTitle, Card, Empty, Btn, StatusBadge, RowLink, MetricTile } from "../ui";
import { LoadingSkeleton, PermissionDenied, DesignModeIndicator } from "../shared";
import { useClientSettings, useRows } from "./useRow";
import { Commitments } from "./other";
import { RecordBook, RecordView, useRecords, input, type Rec } from "./records";

const has = (roles: string[], list: string[]) => roles.some((r) => list.includes(r));
const useRoles = () => useVF((s) => s.roles as string[]);
const DIR = ["luis", "administrador"]; const OPS = ["coordinador", "recepcion", ...DIR]; const CLIN = ["veterinario", ...DIR];

/* ---------- Shared 01C components ---------- */
export function OnboardingStepper({ steps }: { steps: { label: string; done: boolean; to?: string; hint?: string }[] }) {
  const done = steps.filter((s) => s.done).length;
  return (<><div className="mb-3 h-3 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-primary" style={{ width: `${(done / steps.length) * 100}%` }} /></div>
    <p className="mb-2 text-sm text-muted-foreground">{done} de {steps.length} pasos completos</p>
    <ol className="space-y-2">{steps.map((s, i) => { const body = <Card className="flex items-center gap-3">{s.done ? <CheckCircle2 className="h-6 w-6 text-primary" /> : <Circle className="h-6 w-6 text-muted-foreground" />}<div className="flex-1"><b>{i + 1}. {s.label}</b>{s.hint && <p className="text-sm text-muted-foreground">{s.hint}</p>}</div>{s.to && <span className="text-sm font-bold text-primary">{s.done ? "Revisar" : "Completar"} →</span>}</Card>;
      return <li key={s.label}>{s.to ? <Link to={s.to as never}>{body}</Link> : body}</li>; })}</ol></>);
}

/** End-of-visit review. Shows pending items; never closes clinical decisions on its own. */
export function VisitCompletionChecklist({ visitId, base = "/equipo" }: { visitId: string; base?: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === visitId)); const pet = useVF((s) => s.pets.find((p) => p.id === v?.petId));
  const refs = useVF((s) => s.referrals.filter((r) => (r as { pet_id?: string }).pet_id === v?.petId && r.status !== "cerrada"));
  const pays = useVF((s) => s.payments.filter((p) => p.client === pet?.owner && p.status !== "pagado"));
  const { rows } = useRecords(["compromiso_visita", "insumo_visita"], visitId);
  if (!v) return null;
  const commits = (rows ?? []).filter((r) => r.kind === "compromiso_visita"); const supplies = (rows ?? []).filter((r) => r.kind === "insumo_visita");
  const items: [string, string, boolean, string][] = [
    ["Compromisos pendientes", `${commits.filter((c) => c.status !== "cerrado").length} abiertos`, commits.every((c) => c.status === "cerrado"), `${base}/visitas/${visitId}/compromisos/nuevo`],
    ["Remisiones por gestionar", `${refs.length} activas`, refs.length === 0, `${base}/remisiones`],
    ["Documentación faltante", v.prep.length >= 2 ? "Preparación registrada" : "Falta checklist de preparación", v.prep.length >= 2, `${base}/visitas/${visitId}/preparacion`],
    ["Insumos consumidos", `${supplies.length} registrados`, supplies.length > 0, `${base}/visitas/${visitId}/continuidad`],
    ["Cobros pendientes", pays.length ? formatCOP(pays.reduce((a, p) => a + p.amount, 0)) : "Sin pendientes", pays.length === 0, `${base}/visitas/${visitId}/cobro`],
    ["Próximas acciones autorizadas", "Requieren aprobación profesional", false, `${base}/visitas/${visitId}/continuidad`],
  ];
  return (<Card className="mt-3"><SectionTitle>Revisión al terminar la visita</SectionTitle>
    {items.map(([l, d, ok, to]) => <Link key={l} to={to as never} className="flex items-center gap-3 border-b border-border py-2 last:border-0">{ok ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}<span className="flex-1"><b className="block text-sm">{l}</b><span className="text-xs text-muted-foreground">{d}</span></span></Link>)}
    <p className="mt-2 text-xs text-muted-foreground">Esta revisión no cierra decisiones clínicas: las indicaciones y tratamientos los aprueba el profesional.</p></Card>);
}

/* ---------- Auth ---------- */
function MFASetupPanel() {
  const [qr, setQr] = useState<{ id: string; svg: string; secret: string } | null>(null); const [code, setCode] = useState(""); const [factors, setFactors] = useState<{ id: string; status: string; friendly_name?: string }[]>([]);
  const load = async () => { const { data } = await supabase.auth.mfa.listFactors(); setFactors((data?.all ?? []) as never); };
  useEffect(() => { void load(); return undefined; }, []);
  const enroll = async () => { const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Vet Freedom ${Date.now().toString(36)}` }); if (error) { toast.error(error.message); return; } setQr({ id: data.id, svg: data.totp.qr_code, secret: data.totp.secret }); };
  const verify = async () => { if (!qr) return; const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: qr.id, code }); if (error) { toast.error("Código incorrecto: " + error.message); return; } toast.success("Verificación adicional activada"); setQr(null); setCode(""); void load(); };
  const remove = async (id: string) => { const { error } = await supabase.auth.mfa.unenroll({ factorId: id }); if (error) toast.error(error.message); else { toast.success("Factor retirado"); void load(); } };
  return (<><PageTitle title="Activar verificación adicional" subtitle="Código de 6 dígitos desde una app autenticadora" />
    {factors.filter((f) => f.status === "verified").map((f) => <Card key={f.id} className="mb-2 flex items-center justify-between"><span className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" />{f.friendly_name ?? "Autenticador"} · activo</span><Btn variant="soft" onClick={() => void remove(f.id)}>Retirar</Btn></Card>)}
    {!qr ? <Btn className="w-full" onClick={() => void enroll()}>Configurar autenticador</Btn> : <Card className="space-y-3">
      <p>Escanea este código con Google Authenticator, Authy u otra app.</p><img alt="Código QR" className="mx-auto h-48 w-48 rounded-2xl bg-card p-2" src={qr.svg} />
      <p className="break-all text-xs text-muted-foreground">Clave manual: {qr.secret}</p>
      <input className={input} inputMode="numeric" maxLength={6} aria-label="Código" placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
      <Btn className="w-full" disabled={code.length !== 6} onClick={() => void verify()}>Verificar y activar</Btn></Card>}</>);
}
function MFAValidate() {
  const nav = useNavigate(); const [code, setCode] = useState(""); const [fid, setFid] = useState<string | null>(null);
  useEffect(() => { void supabase.auth.mfa.listFactors().then(({ data }) => setFid(data?.totp?.[0]?.id ?? "")); return undefined; }, []);
  const go = async () => { if (!fid) return; const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: fid, code }); if (error) toast.error("Código incorrecto"); else { toast.success("Identidad verificada"); void nav({ to: "/" }); } };
  return (<><PageTitle title="Validar segundo factor" subtitle="Ingresa el código de tu app autenticadora" />
    {fid === null ? <LoadingSkeleton /> : !fid ? <Empty title="No tienes verificación adicional activa" hint="Actívala desde Seguridad de tu cuenta." /> : <Card className="space-y-2">
      <input className={input} inputMode="numeric" maxLength={6} aria-label="Código" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} /><Btn className="w-full" disabled={code.length !== 6} onClick={() => void go()}>Validar</Btn></Card>}</>);
}
function ExpiredInvite() {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  const send = async () => { const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` }); if (error) toast.error(error.message); else setSent(true); };
  return (<><PageTitle title="Invitación expirada" subtitle="Recupera el acceso a tu cuenta" />
    {sent ? <Card><p>Si el correo está registrado, te enviamos un enlace nuevo para crear tu contraseña.</p></Card> : <Card className="space-y-2"><p className="text-sm text-muted-foreground">El enlace que recibiste venció. Escribe tu correo y te enviamos uno nuevo.</p>
      <input type="email" className={input} aria-label="Correo" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} /><Btn className="w-full" disabled={!email.includes("@")} onClick={() => void send()}>Enviar enlace nuevo</Btn></Card>}</>);
}

/* ---------- Client ---------- */
function Welcome() {
  const name = useVF((s) => s.displayName); const pets = useVF((s) => s.pets.filter((p) => p.ownerId === s.userId));
  return (<><PageTitle title={`Bienvenido, ${name.split(" ")[0] || ""}`} subtitle="Vet Life te atiende en casa" />
    <Card className="mb-3"><p>Puedes pedir una visita ahora mismo: no necesitas completar tu perfil primero.</p></Card>
    <RowLink icon={CalendarDays} to="/cliente/nueva-solicitud" label="Solicitar una visita" />
    <RowLink icon={CheckCircle2} to="/app/onboarding" label={pets.length ? "Completar mi información" : "Registrar mi primera mascota"} /></>);
}
function ClientOnboarding() {
  const s = useVF((x) => x); const { row } = useClientSettings();
  if (!row) return <LoadingSkeleton />;
  const mine = s.pets.filter((p) => p.ownerId === s.userId);
  const steps = [
    { label: "Datos esenciales", done: !!s.displayName, to: "/cliente/perfil", hint: s.displayName || "Nombre y teléfono" },
    { label: "Mascotas", done: mine.length > 0, to: mine.length ? "/cliente/mascotas" : "/app/mascotas/nueva", hint: `${mine.length} registradas` },
    { label: "Direcciones", done: row.addresses.length > 0, to: "/app/direcciones", hint: `${row.addresses.length} guardadas` },
    { label: "Preferencias", done: Object.values(row.preferences).some(Boolean), to: "/app/preferencias" },
    { label: "Consentimientos", done: Object.values(row.consents).some(Boolean), to: "/app/consentimientos" },
    { label: "Confirmación de información", done: !!row.preferences["onboarding_confirmado"], hint: "Revisa y confirma" },
  ];
  const { save } = useClientSettings();
  return (<><PageTitle title="Tu incorporación" subtitle="Avanza a tu ritmo; puedes pedir visitas mientras tanto" /><OnboardingStepper steps={steps} />
    {!row.preferences["onboarding_confirmado"] && <Btn className="mt-3 w-full" disabled={steps.slice(0, 5).some((x) => !x.done)} onClick={() => void save({ preferences: { ...row.preferences, onboarding_confirmado: true } })}>Confirmar mi información</Btn>}</>);
}
function PetPrefs({ id }: { id: string }) {
  const pet = useVF((s) => s.pets.find((p) => p.id === id)); const uid = useVF((s) => s.userId);
  if (!pet) return <Empty title="Mascota no encontrada" />;
  return <RecordBook kind="pref_mascota" scope="client" refId={id} ownerId={pet.ownerId ?? uid} title={`Preferencias de ${pet.name}`} subtitle="Cómo prefiere ser atendida" placeholder="Preferencia (ej. le asustan los ruidos)" fields={["Momento del día"]} statuses={["activa", "inactiva"]} canEdit={false} createLabel="Guardar preferencia" />;
}
function PostVisit({ id }: { id: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id)); const pet = useVF((s) => s.pets.find((p) => p.id === v?.petId)); const staff = useVF((s) => s.staff.find((m) => m.id === v?.staffId));
  const { rows } = useRecords("compromiso_visita", id);
  if (!v) return <Empty title="Visita no encontrada" />;
  return (<><PageTitle title={`Después de la visita · ${pet?.name ?? ""}`} subtitle={`${v.service} · ${v.date} ${v.time}`}><StatusBadge status={v.status} /></PageTitle>
    <Card className="mb-3"><p><b>Profesional:</b> {staff?.name ?? "Por asignar"}</p><p><b>Dirección:</b> {v.address || v.zone}</p><p className="mt-2 text-xs text-muted-foreground">Resumen administrativo. El detalle clínico lo entrega tu veterinario.</p></Card>
    <SectionTitle>Compromisos y seguimiento</SectionTitle>{rows === null ? <LoadingSkeleton /> : rows.length ? rows.map((r) => <Card key={r.id} className="mb-2 flex justify-between"><span><b>{r.title}</b><p className="text-sm text-muted-foreground">{r.detail}</p></span><StatusBadge status={r.status} /></Card>) : <Empty title="Sin compromisos pendientes" />}</>);
}
function ClientRefDocs({ id, prep }: { id: string; prep?: boolean }) {
  const r = useVF((s) => s.referrals.find((x) => x.id === id));
  const { rows } = useRecords(prep ? "prep_remision" : "doc_remision", id);
  if (!r) return <Empty title="Remisión no encontrada" />;
  const list = (rows ?? []).filter((x) => x.status === "aprobado" || x.status === "compartido");
  return (<><PageTitle title={prep ? "Preparación para el especialista" : "Documentos de la remisión"} subtitle={`${r.pet} · ${r.specialty}`} />
    {rows === null ? <LoadingSkeleton /> : list.length ? list.map((d) => <Card key={d.id} className="mb-2"><b>{d.title}</b><p className="text-sm">{d.detail}</p></Card>) : <Empty title={prep ? "Aún no hay indicaciones aprobadas" : "Aún no hay documentos autorizados"} hint="Solo se muestran los aprobados por el equipo." />}</>);
}
function FollowUp({ id }: { id: string }) {
  const t = useVF((s) => s.tasks.find((x) => x.id === id));
  if (t) return (<><PageTitle title={t.title} subtitle="Seguimiento" ><StatusBadge status={t.done ? "confirmada" : "pendiente"} /></PageTitle><Card><p>{t.done ? "Este seguimiento ya se cumplió." : "El equipo de Vet Life te contactará para completarlo."}</p></Card></>);
  return <RecordView id={id} title="Seguimiento" canEdit={false} />;
}
function NotifPrefs() {
  const { row, save } = useClientSettings(); if (!row) return <LoadingSkeleton />;
  const items: [string, string][] = [["op_whatsapp", "Mensajes operativos por WhatsApp"], ["op_email", "Mensajes operativos por correo"], ["recordatorios", "Recordatorios de salud"], ["comerciales", "Mensajes comerciales y promociones"], ["encuestas", "Encuestas de satisfacción"]];
  const p = row.preferences as Record<string, boolean>;
  return (<><PageTitle title="Preferencias de notificaciones" subtitle="Operativos y comerciales por separado" />
    {items.map(([k, l]) => <button key={k} aria-pressed={!!p[`notif_${k}`]} onClick={() => void save({ preferences: { ...p, [`notif_${k}`]: !p[`notif_${k}`] } })} className={`mb-2 flex w-full items-center gap-3 rounded-2xl p-4 text-left ${p[`notif_${k}`] ? "bg-sage font-bold" : "bg-secondary"}`}><CheckCircle2 className="h-5 w-5" />{l}</button>)}
    <p className="text-sm text-muted-foreground">Los mensajes comerciales solo se envían con tu autorización.</p></>);
}

/* ---------- Caregiver ---------- */
type PC = { id: string; pet_id: string; caregiver_id: string; caregiver_name: string; tasks: string; created_at: string };
function CaregiverAuths({ id }: { id?: string | undefined }) {
  const { rows } = useRows<PC>("pet_caregivers"); const uid = useVF((s) => s.userId); const pets = useVF((s) => s.pets);
  if (!rows) return <LoadingSkeleton />;
  const mine = rows.filter((r) => r.caregiver_id === uid);
  if (id) { const a = mine.find((r) => r.id === id); if (!a) return <><PageTitle title="Autorización" /><PermissionDenied hint="Esta autorización no existe o ya no está vigente." /></>;
    const pet = pets.find((p) => p.id === a.pet_id);
    return (<><PageTitle title={`Autorización · ${pet?.name ?? a.pet_id}`} subtitle={`Vigente desde ${new Date(a.created_at).toLocaleDateString("es-CO")}`} />
      <Card className="space-y-1"><p><b>Acciones autorizadas:</b> {a.tasks || "Acompañar visitas"}</p><p><b>Vigencia:</b> hasta que el propietario la retire</p><p className="text-sm text-muted-foreground">No incluye documentos clínicos, pagos ni datos del propietario.</p></Card></>); }
  return (<><PageTitle title="Mis autorizaciones" subtitle={`${mine.length} mascotas`} />{mine.length ? mine.map((a) => <RowLink key={a.id} icon={ShieldCheck} to={`/cuidador/autorizaciones/${a.id}`} label={`${pets.find((p) => p.id === a.pet_id)?.name ?? a.pet_id} · ${a.tasks || "Acompañar visitas"}`} />) : <Empty title="No tienes autorizaciones vigentes" />}</>);
}
const Revoked = () => (<><PageTitle title="Acceso finalizado" /><Card className="flex items-center gap-3"><Lock className="h-6 w-6 text-primary" /><p>El propietario retiró tu autorización. Ya no puedes ver información de esta mascota.</p></Card></>);

/* ---------- Team ---------- */
function DayClose() {
  const { me } = useMyStaff(); const visits = useVF((s) => s.visits.filter((v) => v.staffId === me?.id)); const tasks = useVF((s) => s.tasks.filter((t) => t.staffId === me?.id));
  const { rows, create } = useRecords("cierre_jornada");
  const today = new Date().toISOString().slice(0, 10); const closed = (rows ?? []).find((r) => r.ref_id === `${me?.id}-${today}`);
  if (!me) return <Empty title="Tu cuenta no está vinculada a un miembro del equipo" hint="Pide a Administración que la vincule." />;
  const open = visits.filter((v) => v.status !== "finalizada"); const pend = tasks.filter((t) => !t.done);
  return (<><PageTitle title="Cierre de jornada" subtitle={me.name} />
    <div className="grid grid-cols-3 gap-2"><MetricTile icon={CalendarDays} label="Visitas abiertas" value={open.length} to="/equipo/agenda" /><MetricTile icon={CheckCircle2} label="Tareas" value={pend.length} tone="sage" to="/equipo/tareas" /><MetricTile icon={CheckCircle2} label="Finalizadas" value={visits.length - open.length} to="/equipo/agenda" /></div>
    <SectionTitle>Pendiente</SectionTitle>{open.map((v) => <RowLink key={v.id} icon={CalendarDays} to={`/equipo/visitas/${v.id}/cierre`} label={`${v.time} · ${v.service} (${v.status})`} />)}{pend.map((t) => <RowLink key={t.id} icon={Circle} to={`/equipo/tareas/${t.id}`} label={t.title} />)}
    {!open.length && !pend.length && <Empty title="Todo cerrado" />}
    {closed ? <Card className="mt-3"><b>Jornada cerrada</b><p className="text-sm text-muted-foreground">{new Date(closed.created_at).toLocaleString("es-CO")}</p></Card>
      : <Btn className="mt-3 w-full" onClick={() => void create({ title: `Cierre ${me.name} ${today}`, ref_id: `${me.id}-${today}`, detail: `${open.length} visitas abiertas, ${pend.length} tareas pendientes`, status: "cerrado" })}>Cerrar jornada</Btn>}</>);
}
function NewCommitment({ id }: { id: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id)); const { me } = useMyStaff(); const nav = useNavigate(); const [f, setF] = useState({ t: "", d: "", due: "" });
  const { create } = useRecords("compromiso_visita", id);
  if (!v) return <Empty title="Visita no encontrada" />;
  return (<><PageTitle title="Nuevo compromiso" subtitle={`${v.service} · ${v.date}`} /><Card className="space-y-2">
    <input className={input} aria-label="Compromiso" placeholder="Ej. llamar en 3 días para control" value={f.t} onChange={(e) => setF({ ...f, t: e.target.value })} />
    <input type="date" className={input} aria-label="Fecha límite" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} />
    <textarea className={input} aria-label="Detalle" placeholder="Detalle (sin indicaciones clínicas)" value={f.d} onChange={(e) => setF({ ...f, d: e.target.value })} />
    <Btn className="w-full" disabled={!f.t.trim()} onClick={async () => {
      if (await create({ title: f.t.trim(), detail: f.d, data: { vence: f.due, responsable: me?.name ?? "" }, status: "abierto" })) {
        await db.from("tasks").insert({ title: `${f.t.trim()}${f.due ? ` (vence ${f.due})` : ""}`, staff_id: me?.id ?? v.staffId }); void refreshVF(); void nav({ to: `/equipo/visitas/${id}/cierre` as never }); } }}>Crear compromiso</Btn></Card></>);
}
function VisitCharge({ id }: { id: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id)); const pet = useVF((s) => s.pets.find((p) => p.id === v?.petId)); const roles = useRoles(); const [amt, setAmt] = useState(""); const [concept, setConcept] = useState(v?.service ?? "");
  if (!v) return <Empty title="Visita no encontrada" />;
  if (!has(roles, [...CLIN, "finanzas"])) return <><PageTitle title="Cobro de la visita" /><PermissionDenied hint="Solo el veterinario o Finanzas registran valores cobrados." /></>;
  return (<><PageTitle title="Cobro de la visita" subtitle={`${pet?.name ?? ""} · ${pet?.owner ?? ""}`} /><Card className="space-y-2">
    <input className={input} aria-label="Concepto" value={concept} onChange={(e) => setConcept(e.target.value)} />
    <input className={input} inputMode="numeric" aria-label="Valor en COP" placeholder="Valor en COP" value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} />
    {amt && <p className="text-sm">{formatCOP(Number(amt))}</p>}
    <Btn className="w-full" disabled={!amt || !pet} onClick={async () => { const { error } = await db.from("payments").insert({ client: pet!.owner, client_id: pet!.ownerId ?? null, concept: concept || v.service, amount: Number(amt), status: "pendiente" }); if (error) toast.error(error.message); else { toast.success("Valor informado a Finanzas"); setAmt(""); void refreshVF(); } }}>Informar valor</Btn></Card>
    <p className="mt-2 text-sm text-muted-foreground">Queda pendiente hasta que Finanzas lo verifique.</p></>);
}
function RefDocs({ id, share }: { id: string; share?: boolean }) {
  const r = useVF((s) => s.referrals.find((x) => x.id === id)); const pets = useVF((s) => s.pets); const roles = useRoles();
  if (!r) return <Empty title="Remisión no encontrada" />;
  const owner = pets.find((p) => p.id === (r as { pet_id?: string }).pet_id)?.ownerId ?? null;
  return <RecordBook kind="doc_remision" scope={has(roles, OPS) ? "client" : "staff"} ownerId={has(roles, OPS) ? owner : null} refId={id} title={share ? "Compartir documentos" : "Documentos de la remisión"} subtitle={`${r.pet} · ${r.specialty}`} placeholder="Documento (ej. Resumen de historia)" fields={["Destinatario"]} statuses={["borrador", "aprobado", "compartido", "retirado"]} canEdit={has(roles, [...CLIN, ...OPS])}>
    <p className="mb-2 text-sm text-muted-foreground">Solo los documentos en estado «aprobado» o «compartido» los ve el propietario. Los archivos reales se adjuntan desde OKVET (pendiente de conexión).</p></RecordBook>;
}
function RefProgress({ id }: { id: string }) {
  const r = useVF((s) => s.referrals.find((x) => x.id === id));
  const { rows } = useRecords(["rem_aprobacion", "rem_autorizaciones", "rem_presupuesto", "rem_aceptacion", "rem_cita_externa", "doc_remision", "rem_informe", "rem_revision", "rem_continuidad"], id);
  if (!r) return <Empty title="Remisión no encontrada" />;
  const STEPS = ["por_resolver", "agendada", "en_curso", "cerrada"]; const at = STEPS.indexOf(r.status);
  return (<><PageTitle title="Seguimiento de la remisión" subtitle={`${r.pet} · ${r.specialty} · ${r.specialist ?? "Sin especialista"}`} />
    <Card className="mb-3">{STEPS.map((s, i) => <p key={s} className="flex items-center gap-2">{i <= at ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}{s.replace("_", " ")}</p>)}</Card>
    <SectionTitle>Eventos</SectionTitle>{rows === null ? <LoadingSkeleton /> : rows.length ? rows.map((x) => <Card key={x.id} className="mb-2 flex justify-between"><span><b>{x.title}</b><p className="text-xs text-muted-foreground">{x.kind.replace(/_/g, " ")} · {new Date(x.created_at).toLocaleString("es-CO")}</p></span><StatusBadge status={x.status} /></Card>) : <Empty title="Sin eventos registrados" />}</>);
}
function Shift({ id }: { id: string }) {
  const { rows } = useRows<{ id: string; staff_id: string; day: string; start_time: string; end_time: string; kind: string }>("shifts"); const staff = useVF((s) => s.staff);
  if (!rows) return <LoadingSkeleton />; const x = rows.find((r) => r.id === id); if (!x) return <Empty title="Turno no encontrado" />;
  return (<><PageTitle title={`${x.kind === "turno" ? "Turno" : "Ausencia"} · ${x.day}`} subtitle={staff.find((m) => m.id === x.staff_id)?.name ?? ""} /><Card><p>{x.start_time} – {x.end_time}</p></Card>
    <RowLink icon={CalendarDays} to="/equipo/turnos/solicitar" label="Solicitar cambio de este turno" /></>);
}
function IncidentView({ id }: { id: string }) {
  const i = useVF((s) => s.incidents.find((x) => x.id === id)); const roles = useRoles();
  if (!i) return <Empty title="Incidencia no encontrada" />;
  return (<><PageTitle title={i.title} subtitle={`Responsable: ${i.owner}`}><StatusBadge status={i.status} /></PageTitle><Card className="mb-3"><p>{i.detail}</p><p className="text-sm">Severidad: {i.severity}</p></Card>
    {has(roles, OPS) && <div className="flex gap-2">{(["abierta", "en_gestion", "cerrada"] as const).map((s) => <Btn key={s} variant={i.status === s ? "primary" : "soft"} onClick={() => actions.setIncidentStatus(i.id, s)}>{s.replace("_", " ")}</Btn>)}</div>}
    <RecordBook kind="nota_incidencia" refId={id} title="Seguimiento" placeholder="Nota de seguimiento" statuses={["registrada"]} canEdit={false} createLabel="Agregar nota" /></>);
}
function PendingTraining() {
  const { me } = useMyStaff(); const courses = useVF((s) => s.courses.filter((c) => c.required && c.progress < 100 && (!me || c.role === "Todos" || me.role.toLowerCase().includes(c.role.toLowerCase().slice(0, 5)))));
  return (<><PageTitle title="Formación obligatoria pendiente" subtitle={`${courses.length} cursos`} />{courses.length ? courses.map((c) => <Card key={c.id} className="mb-2"><b>{c.title}</b><div className="my-2 h-2 rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-primary" style={{ width: `${c.progress}%` }} /></div><Btn variant="soft" onClick={() => actions.progressCourse(c.id)}>Continuar ({c.progress}%)</Btn></Card>) : <Empty title="Sin formación pendiente" />}</>);
}
function Continuity({ id }: { id: string }) {
  const v = useVF((s) => s.visits.find((x) => x.id === id)); const pet = useVF((s) => s.pets.find((p) => p.id === v?.petId)); const tr = useVF((s) => s.treatments.filter((t) => t.pet === pet?.name));
  if (!v) return <Empty title="Visita no encontrada" />;
  return (<><PageTitle title="Continuidad de la atención" subtitle={`${pet?.name ?? ""} · ${v.service}`} />
    <Card className="mb-3 space-y-1"><p><b>Alergias:</b> {pet?.allergies || "Ninguna registrada"}</p><p><b>Dirección:</b> {v.address || v.zone}</p><p><b>Preparación:</b> {v.prep.join(", ") || "—"}</p>{tr.map((t) => <p key={t.id}><b>Tratamiento:</b> {t.plan} · {t.done}/{t.total} · {t.responsible}</p>)}</Card>
    <RecordBook kind="insumo_visita" refId={id} title="Insumos consumidos" placeholder="Insumo (ej. jeringa 3 ml)" fields={["Cantidad"]} statuses={["registrado"]} canEdit={false} createLabel="Registrar insumo" />
    <RecordBook kind="continuidad" refId={id} title="Notas para quien continúe" placeholder="Qué debe saber el siguiente profesional" statuses={["vigente", "atendida"]} createLabel="Guardar nota" /></>);
}
function StaffOnboarding() {
  const { me } = useMyStaff(); const uid = useVF((s) => s.userId); const { rows, create, update } = useRecords("onboarding_empleado", uid ?? undefined);
  if (rows === null) return <LoadingSkeleton />;
  const r = rows[0]; const d = (r?.data ?? {}) as Record<string, boolean>;
  const LIST: [string, string, string?][] = [["datos", "Datos básicos", "/equipo/perfil"], ["rol", "Rol asignado"], ["competencias", "Competencias registradas"], ["disponibilidad", "Disponibilidad", "/equipo/disponibilidad"], ["documentos", "Documentación entregada"], ["formacion", "Formación inicial", "/equipo/formacion/pendientes"], ["politicas", "Aceptación de políticas"]];
  const auto: Record<string, boolean> = { rol: !!me, competencias: !!me?.skills?.length };
  const toggle = async (k: string) => { if (!r) await create({ title: `Onboarding ${me?.name ?? ""}`, data: { [k]: true }, status: "en_curso" }); else void update(r.id, { data: { ...d, [k]: !d[k] } }); };
  return (<><PageTitle title="Incorporación al equipo" subtitle={me?.name ?? "Cuenta sin vincular"} />
    <OnboardingStepper steps={LIST.map(([k, l, to]) => ({ label: l, done: auto[k] ?? !!d[k], ...(to ? { to } : {}) }))} />
    <SectionTitle>Marcar como completado</SectionTitle><div className="flex flex-wrap gap-2">{LIST.filter(([k]) => !(k in auto)).map(([k, l]) => <Btn key={k} variant={d[k] ? "primary" : "soft"} onClick={() => void toggle(k)}>{l}</Btn>)}</div></>);
}

/* ---------- Operations ---------- */
function CalendarConnections() {
  const staff = useVF((s) => s.staff); const gcal = useVF((s) => s.integrations.find((i) => i.id === "gcal"));
  return (<><PageTitle title="Calendarios conectados" subtitle="Por profesional" /><DesignModeIndicator label={`Google Calendar: ${gcal?.status ?? "NO CONFIGURADA"} · sin sincronización real todavía`} />
    {staff.map((m) => <Card key={m.id} className="mb-2 flex items-center justify-between"><span><b>{m.name}</b><p className="text-sm text-muted-foreground">{m.zone}</p></span><StatusBadge status="pendiente" /></Card>)}</>);
}
export function calendarConflicts(visits: { id: string; staffId: string | null; date: string; time: string }[], absent: Set<string>) {
  const out: { id: string; label: string }[] = []; const seen = new Map<string, string>();
  for (const v of visits) { if (!v.staffId) continue; const k = `${v.staffId}|${v.date}|${v.time}`; if (seen.has(k)) out.push({ id: v.id, label: `Choque de horario con ${seen.get(k)}` }); else seen.set(k, v.id); if (absent.has(v.staffId)) out.push({ id: v.id, label: "Profesional ausente con visita asignada" }); }
  return out;
}
function Conflicts() {
  const s = useVF((x) => x); const list = calendarConflicts(s.visits.filter((v) => v.status !== "finalizada" && v.status !== "cancelada"), new Set(s.staff.filter((m) => m.status === "ausente").map((m) => m.id)));
  return (<><PageTitle title="Conflictos de calendario" subtitle={`${list.length} detectados`} />{list.length ? list.map((c) => { const v = s.visits.find((x) => x.id === c.id)!; return <RowLink key={c.id + c.label} icon={CalendarDays} to={`/operaciones/agenda/${c.id}`} label={`${v.date} ${v.time} · ${s.staff.find((m) => m.id === v.staffId)?.name ?? ""} — ${c.label}`} />; }) : <Empty title="Sin conflictos" />}</>);
}
function HoldView({ id }: { id: string }) {
  return <RecordView id={id} title="Reserva provisional" statuses={["activa", "confirmada", "liberada", "vencida"]}>{(r) => { const exp = r.data["vence"] ? new Date(String(r.data["vence"])) : null; const left = exp ? Math.round((exp.getTime() - Date.now()) / 60000) : null;
    return <Card className="mb-3"><p className="font-bold">{left === null ? "Sin vencimiento" : left > 0 ? `Vence en ${left} min` : "Vencida — libera el horario"}</p></Card>; }}</RecordView>;
}
function ShiftRequests() {
  const { rows, update } = useRecords(["solicitud_turno", "solicitud_ausencia"]); const staff = useVF((s) => s.staff);
  const approve = async (r: Rec, ok: boolean) => {
    if (ok) { const d = r.data as Record<string, string>; const { error } = await db.from("shifts").insert({ staff_id: d["staff_id"], day: d["Día"] || "Por definir", start_time: d["Desde"] || "08:00", end_time: d["Hasta"] || "16:00", kind: r.kind === "solicitud_ausencia" ? "ausencia" : "turno" }); if (error) { toast.error(error.message); return; } }
    await update(r.id, { status: ok ? "aprobada" : "rechazada" });
  };
  return (<><PageTitle title="Solicitudes de turno y ausencia" subtitle="Aprobar crea el turno o la ausencia real" />{rows === null ? <LoadingSkeleton /> : rows.length ? rows.map((r) => <Card key={r.id} className="mb-2"><div className="flex justify-between"><b>{r.title}</b><StatusBadge status={r.status} /></div>
    <p className="text-sm text-muted-foreground">{staff.find((m) => m.id === r.data["staff_id"])?.name} · {String(r.data["Día"] ?? "")} {String(r.data["Desde"] ?? "")}–{String(r.data["Hasta"] ?? "")} · {r.detail}</p>
    {r.status === "abierto" && <div className="mt-2 flex gap-2"><Btn onClick={() => void approve(r, true)}>Aprobar</Btn><Btn variant="soft" onClick={() => void approve(r, false)}>Rechazar</Btn></div>}</Card>) : <Empty title="Sin solicitudes" />}</>);
}
function RequestShift({ kind }: { kind: "solicitud_turno" | "solicitud_ausencia" }) {
  const { me } = useMyStaff();
  if (!me) return <Empty title="Tu cuenta no está vinculada a un miembro del equipo" />;
  return <RecordBookWithStaff kind={kind} staffId={me.id} title={kind === "solicitud_turno" ? "Solicitar cambio de turno" : "Solicitar ausencia"} />;
}
function RecordBookWithStaff({ kind, staffId, title }: { kind: string; staffId: string; title: string }) {
  const { rows, create } = useRecords(kind); const [f, setF] = useState({ day: "", from: "08:00", to: "16:00", why: "" });
  const mine = (rows ?? []).filter((r) => r.data["staff_id"] === staffId);
  return (<><PageTitle title={title} subtitle="Coordinación la aprueba" /><Card className="mb-3 space-y-2">
    <input className={input} aria-label="Día" placeholder="Día (ej. Viernes 31)" value={f.day} onChange={(e) => setF({ ...f, day: e.target.value })} />
    <div className="grid grid-cols-2 gap-2"><input type="time" className={input} aria-label="Desde" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /><input type="time" className={input} aria-label="Hasta" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
    <input className={input} aria-label="Motivo" placeholder="Motivo" value={f.why} onChange={(e) => setF({ ...f, why: e.target.value })} />
    <Btn className="w-full" disabled={!f.day} onClick={async () => { if (await create({ title: `${title} · ${f.day}`, detail: f.why, data: { staff_id: staffId, Día: f.day, Desde: f.from, Hasta: f.to } })) setF({ ...f, day: "", why: "" }); }}>Enviar solicitud</Btn></Card>
    <SectionTitle>Mis solicitudes</SectionTitle>{mine.length ? mine.map((r) => <Card key={r.id} className="mb-2 flex justify-between"><b>{r.title}</b><StatusBadge status={r.status} /></Card>) : <Empty title="Sin solicitudes" />}</>);
}
function RouteApproval({ id, incidents }: { id: string; incidents?: boolean }) {
  const m = useVF((s) => s.staff.find((x) => x.id === id)); const visits = useVF((s) => s.visits.filter((v) => v.staffId === id && v.status !== "cancelada").sort((a, b) => a.time.localeCompare(b.time)));
  const roles = useRoles();
  if (!m) return <Empty title="Ruta no encontrada" />;
  if (incidents) return <RecordBook kind="incidencia_ruta" refId={id} title={`Incidencias de ruta · ${m.name}`} placeholder="Problema (ej. dirección incorrecta)" fields={["Corrección"]} statuses={["abierto", "corregido"]} />;
  return (<><PageTitle title={`Aprobar ruta · ${m.name}`} subtitle={`${visits.length} paradas`} />{visits.map((v, i) => <Card key={v.id} className="mb-2"><b>{i + 1}. {v.time}</b> · {v.address || v.zone}</Card>)}
    <RecordBook kind="ruta_aprobacion" refId={id} title="Decisión" placeholder="Comentario de revisión" statuses={["publicada", "devuelta"]} canCreate={has(roles, OPS)} createLabel="Publicar ruta" /></>);
}
function PendingChanges() {
  const ap = useVF((s) => s.approvals.filter((a) => a.status === "pendiente")); const vis = useVF((s) => s.visits.filter((v) => v.status === "pendiente"));
  return (<><PageTitle title="Cambios pendientes" subtitle={`${ap.length + vis.length} por decidir`} />{ap.map((a) => <Card key={a.id} className="mb-2"><b>{a.title}</b><p className="text-sm text-muted-foreground">{a.detail}</p><div className="mt-2 flex gap-2"><Btn onClick={() => actions.decideApproval(a.id, "aprobada")}>Aprobar</Btn><Btn variant="soft" onClick={() => actions.decideApproval(a.id, "rechazada")}>Rechazar</Btn></div></Card>)}
    {vis.map((v) => <RowLink key={v.id} icon={CalendarDays} to={`/operaciones/agenda/${v.id}`} label={`${v.date} ${v.time} · ${v.service} por confirmar`} />)}{!ap.length && !vis.length && <Empty title="Sin cambios pendientes" />}</>);
}
function WaitOffer({ id }: { id: string }) {
  const { rows } = useRows<{ id: string; client: string; pet: string; service: string; zone: string; note: string; status: string }>("waitlist"); if (!rows) return <LoadingSkeleton />;
  const w = rows.find((r) => r.id === id); if (!w) return <Empty title="No encontrado en lista de espera" />;
  return (<><PageTitle title={`${w.client} · ${w.pet}`} subtitle={`${w.service} · ${w.zone}`}><StatusBadge status={w.status} /></PageTitle><Card className="mb-3"><p>{w.note || "Sin nota"}</p></Card>
    <RecordBook kind="oferta_horario" refId={id} title="Ofertas de horario" placeholder="Horario ofrecido (ej. Jue 30 · 15:00)" fields={["Vence"]} statuses={["ofrecida", "aceptada", "rechazada", "vencida"]} createLabel="Ofrecer horario" /></>);
}
function WhatsAppQueue({ mode }: { mode: string }) {
  const reqs = useVF((s) => s.requests.filter((r) => r.channel === "WhatsApp"));
  const TITLE: Record<string, string> = { pendientes: "Conversaciones pendientes", traspasos: "Traspasos a una persona", fallos: "Mensajes fallidos", seguimientos: "Seguimientos por WhatsApp" };
  const list = mode === "pendientes" ? reqs.filter((r) => r.status === "nueva") : mode === "seguimientos" ? reqs.filter((r) => r.status === "en_gestion") : [];
  return (<><PageTitle title={TITLE[mode] ?? "WhatsApp"} /><DesignModeIndicator label="WhatsApp no está conectado: no se envían ni reciben mensajes reales" />
    {mode === "traspasos" || mode === "fallos" ? <RecordBook kind={`wa_${mode}`} title="Registro manual" placeholder={mode === "traspasos" ? "Conversación traspasada" : "Mensaje que falló"} fields={["Cliente"]} /> :
      list.length ? list.map((r) => <RowLink key={r.id} icon={CalendarDays} to={`/operaciones/solicitudes/${r.id}`} label={`${r.client} · ${r.message}`} />) : <Empty title="Sin conversaciones" />}</>);
}
function MemoryTab({ id, tab }: { id: string; tab: string }) {
  const name = decodeURIComponent(id);
  const T: Record<string, [string, string, string]> = { validaciones: ["memoria_validacion", "Validaciones de memoria", "Dato a validar con el cliente"], correcciones: ["memoria_correccion", "Correcciones", "Dato corregido (antes → ahora)"], historial: ["memoria_validacion", "Historial", ""] };
  const [kind, title, ph] = T[tab] ?? T["historial"]!;
  if (tab === "historial") return <MemoryHistory name={name} />;
  return <RecordBook kind={kind} refId={name} title={`${title} · ${name}`} placeholder={ph} statuses={tab === "validaciones" ? ["por_validar", "validado", "descartado"] : ["registrada"]} />;
}
function MemoryHistory({ name }: { name: string }) {
  const { rows } = useRecords(["memoria_validacion", "memoria_correccion"], name);
  return (<><PageTitle title={`Historial de memoria · ${name}`} />{rows === null ? <LoadingSkeleton /> : rows.length ? rows.map((r) => <Card key={r.id} className="mb-2"><b>{r.title}</b><p className="text-xs text-muted-foreground">{r.kind.replace(/_/g, " ")} · {r.status} · {new Date(r.created_at).toLocaleString("es-CO")}</p></Card>) : <Empty title="Sin cambios" />}</>);
}
function OverdueCommitments() {
  const tasks = useVF((s) => s.tasks.filter((t) => !t.done)); const { rows } = useRecords("compromiso_visita");
  const today = new Date().toISOString().slice(0, 10); const late = (rows ?? []).filter((r) => r.status !== "cerrado" && r.data["vence"] && String(r.data["vence"]) < today);
  return (<><PageTitle title="Compromisos vencidos" subtitle={`${late.length} vencidos · ${tasks.length} tareas abiertas`} />
    {late.map((r) => <Card key={r.id} className="mb-2"><b>{r.title}</b><p className="text-sm">Venció {String(r.data["vence"])} · {String(r.data["responsable"] ?? "")}</p></Card>)}
    {!late.length && <Empty title="Ningún compromiso vencido" />}<SectionTitle>Tareas abiertas</SectionTitle>{tasks.map((t) => <RowLink key={t.id} icon={Circle} to={`/operaciones/compromisos/${t.id}`} label={t.title} />)}</>);
}
function SpecBackup() {
  const specs = useVF((s) => s.specialists); const by = new Map<string, typeof specs>(); specs.forEach((x) => by.set(x.specialty, [...(by.get(x.specialty) ?? []), x]));
  return (<><PageTitle title="Especialistas de respaldo" subtitle="Por especialidad" />{[...by.entries()].map(([sp, l]) => <Card key={sp} className="mb-2"><b>{sp}</b><p className="text-sm">{l.map((x, i) => `${i === 0 ? "Principal" : "Respaldo"}: ${x.name} (${x.city})`).join(" · ")}</p>{l.length < 2 && <p className="text-sm text-primary">Sin respaldo registrado</p>}</Card>)}</>);
}
const REF_STEP: Record<string, [string, string, string[], string]> = {
  aprobacion: ["rem_aprobacion", "Aprobación de la remisión", ["solicitada", "aprobada", "rechazada"], "Motivo de la decisión"],
  autorizaciones: ["rem_autorizaciones", "Autorizaciones", ["pendiente", "otorgada", "negada"], "Autorización (ej. compartir historia)"],
  presupuesto: ["rem_presupuesto", "Presupuesto", ["borrador", "enviado", "aceptado", "rechazado"], "Concepto"],
  "aceptacion-cliente": ["rem_aceptacion", "Aceptación del cliente", ["pendiente", "aceptada", "rechazada"], "Qué acepta el cliente"],
  "cita-externa": ["rem_cita_externa", "Cita con el especialista", ["propuesta", "confirmada", "realizada", "cancelada"], "Fecha y lugar"],
  informes: ["rem_informe", "Informes del especialista", ["pendiente", "recibido", "revisado"], "Informe"],
  "revision-profesional": ["rem_revision", "Revisión profesional", ["pendiente", "revisado"], "Conclusión del veterinario"],
  continuidad: ["rem_continuidad", "Continuidad de la atención", ["pendiente", "en_curso", "cerrado"], "Siguiente paso"],
};
function ReferralStep({ id, step }: { id: string; step: string }) {
  const r = useVF((s) => s.referrals.find((x) => x.id === id)); const roles = useRoles();
  if (!r) return <Empty title="Remisión no encontrada" />;
  if (step === "historial") return <RefProgress id={id} />;
  if (step === "documentos") return <RefDocs id={id} share />;
  const [kind, title, sts, ph] = REF_STEP[step]!;
  const clinical = step === "revision-profesional" || step === "aprobacion";
  const can = clinical ? has(roles, CLIN) : has(roles, [...OPS, ...CLIN, "finanzas"]);
  return <RecordBook kind={kind} refId={id} title={title} subtitle={`${r.pet} · ${r.specialty} · ${r.specialist ?? "sin especialista"}`} placeholder={ph} fields={step === "presupuesto" ? ["Valor COP"] : []} statuses={sts} canCreate={can} canEdit={can}>
    {step === "informes" && <SpecReportsFor id={id} />}{!can && <p className="mb-2 text-sm text-muted-foreground">{clinical ? "Solo un veterinario o Dirección decide este paso." : "Solo lectura para tu perfil."}</p>}</RecordBook>;
}
function SpecReportsFor({ id }: { id: string }) {
  const { rows } = useRows<{ id: string; referral_id: string; title: string; body: string; created_at: string }>("specialist_reports");
  const list = (rows ?? []).filter((x) => x.referral_id === id);
  return <div className="mb-3">{list.map((x) => <Card key={x.id} className="mb-2"><b>{x.title}</b><p className="text-sm">{x.body}</p></Card>)}</div>;
}

/* ---------- Admin ---------- */
function UserPerms({ id }: { id: string }) {
  const roles = useRoles(); const [mine, setMine] = useState<string[] | null>(null); const [name, setName] = useState("");
  const load = async () => { const [{ data: r }, { data: p }] = await Promise.all([db.from("user_roles").select("role").eq("user_id", id), db.from("profiles").select("display_name").eq("id", id).maybeSingle()]); setMine((r ?? []).map((x: { role: string }) => x.role)); setName(p?.display_name ?? id); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [id]);
  if (!has(roles, DIR)) return <PermissionDenied />;
  if (!mine) return <LoadingSkeleton />;
  const ALL = ["cliente", "cuidador", "veterinario", "auxiliar", "coordinador", "recepcion", "finanzas", "soporte", "consultor", "especialista", "administrador", "luis"];
  const toggle = async (r: string) => { const { error } = mine.includes(r) ? await db.from("user_roles").delete().eq("user_id", id).eq("role", r) : await db.from("user_roles").insert({ user_id: id, role: r }); if (error) toast.error(error.message); else { toast.success("Permisos actualizados"); void load(); } };
  return (<><PageTitle title={`Permisos · ${name}`} subtitle="Cada perfil da acceso solo a su portal" /><div className="flex flex-wrap gap-2">{ALL.map((r) => <Btn key={r} variant={mine.includes(r) ? "primary" : "soft"} onClick={() => void toggle(r)}>{r}</Btn>)}</div>
    <p className="mt-3 text-sm text-muted-foreground">No puedes quitarte tus propios permisos de Dirección.</p></>);
}
function PrivacyExport() {
  const pets = useVF((s) => s.pets); const owners = [...new Set(pets.map((p) => p.owner))]; const [o, setO] = useState(""); const { create } = useRecords("exportacion");
  const go = async () => { const s = getVF(); const data = { cliente: o, mascotas: s.pets.filter((p) => p.owner === o), visitas: s.visits.filter((v) => s.pets.some((p) => p.id === v.petId && p.owner === o)), cobros: s.payments.filter((p) => p.client === o) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `datos-${o}.json`; a.click();
    await create({ title: `Exportación de datos · ${o}`, scope: "director", status: "entregada" }); };
  return (<><RecordBook kind="exportacion" scope="director" title="Exportaciones de datos personales" canCreate={false} statuses={["entregada"]} canEdit={false}>
    <Card className="mb-3 space-y-2"><select className={input} aria-label="Cliente" value={o} onChange={(e) => setO(e.target.value)}><option value="">Elegir cliente</option>{owners.map((x) => <option key={x}>{x}</option>)}</select><Btn className="w-full" disabled={!o} onClick={() => void go()}>Generar y descargar</Btn></Card></RecordBook></>);
}
function NewProduct() {
  const [f, setF] = useState({ name: "", stock: "", min: "", lot: "", expires: "" });
  return (<><PageTitle title="Nuevo producto" /><Card className="space-y-2">{(["name", "stock", "min", "lot", "expires"] as const).map((k) => <input key={k} className={input} aria-label={k} placeholder={{ name: "Nombre", stock: "Existencias", min: "Mínimo", lot: "Lote", expires: "Vence (AAAA-MM)" }[k]} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}
    <Btn className="w-full" disabled={!f.name || !f.stock} onClick={async () => { const { error } = await db.from("inventory_items").insert({ id: "it" + Math.random().toString(36).slice(2, 8), name: f.name, stock: Number(f.stock) || 0, min: Number(f.min) || 0, lot: f.lot, expires: f.expires }); if (error) toast.error(error.message); else { toast.success("Producto creado"); setF({ name: "", stock: "", min: "", lot: "", expires: "" }); void refreshVF(); } }}>Crear producto</Btn></Card></>);
}
function StockMovementForm({ count }: { count?: boolean }) {
  const items = useVF((s) => s.items); const [id, setId] = useState(""); const [q, setQ] = useState(""); const [why, setWhy] = useState(""); const { create } = useRecords(count ? "conteo" : "movimiento");
  const it = items.find((i) => i.id === id);
  return (<><RecordBook kind={count ? "conteo" : "movimiento"} title={count ? "Conteos físicos" : "Nuevo movimiento de inventario"} canCreate={false} canEdit={false} statuses={["registrado"]}>
    <Card className="mb-3 space-y-2"><select className={input} aria-label="Producto" value={id} onChange={(e) => setId(e.target.value)}><option value="">Producto</option>{items.map((i) => <option key={i.id} value={i.id}>{i.name} · {i.stock}</option>)}</select>
      <input className={input} inputMode="numeric" aria-label={count ? "Cantidad contada" : "Cantidad (+ entrada / − salida)"} placeholder={count ? "Cantidad contada" : "Ej. 10 o -2"} value={q} onChange={(e) => setQ(e.target.value)} />
      <input className={input} aria-label="Motivo" placeholder="Motivo" value={why} onChange={(e) => setWhy(e.target.value)} />
      <Btn className="w-full" disabled={!it || !q || isNaN(Number(q))} onClick={async () => { const delta = count ? Number(q) - it!.stock : Number(q); actions.moveStock(it!.id, delta); await create({ title: `${it!.name}: ${count ? `conteo ${q} (dif. ${delta})` : `${delta > 0 ? "+" : ""}${delta}`}`, detail: why, status: "registrado" }); setQ(""); setWhy(""); }}>{count ? "Registrar conteo" : "Registrar movimiento"}</Btn></Card></RecordBook></>);
}
function Lot({ id }: { id: string }) {
  const it = useVF((s) => s.items.find((i) => i.id === id)); if (!it) return <Empty title="Lote no encontrado" />;
  return (<><PageTitle title={it.name} subtitle={`Lote ${it.lot} · vence ${it.expires}`} /><Card><p>Existencias: <b>{it.stock}</b> (mínimo {it.min})</p>{it.stock < it.min && <p className="font-bold text-primary">Por debajo del mínimo</p>}</Card></>);
}
function PaymentAdmin({ id }: { id: string }) {
  const p = useVF((s) => s.payments.find((x) => x.id === id)); const roles = useRoles(); if (!p) return <Empty title="Cobro no encontrado" />;
  return (<><PageTitle title={p.concept} subtitle={`${p.client} · ${p.date}`}><StatusBadge status={p.status} /></PageTitle><Card><p className="text-3xl font-bold">{formatCOP(p.amount)}</p>{p.status !== "pagado" && has(roles, ["finanzas", ...DIR]) && <Btn className="mt-3 w-full" onClick={() => actions.markPaid(id)}>Marcar como pagado</Btn>}</Card>
    <RecordBook kind="nota_cobro" refId={id} title="Notas del cobro" placeholder="Nota" statuses={["registrada"]} canEdit={false} createLabel="Agregar nota" /></>);
}
export function PaymentVerification() {
  const { rows, update } = useRecords("pago_informado"); const pays = useVF((s) => s.payments);
  return (<><PageTitle title="Verificación de pagos" subtitle="Pagos informados por clientes" />{rows === null ? <LoadingSkeleton /> : rows.length ? rows.map((r) => { const p = pays.find((x) => x.id === r.ref_id); return <Card key={r.id} className="mb-2"><div className="flex justify-between"><b>{r.title}</b><StatusBadge status={r.status} /></div><p className="text-sm text-muted-foreground">{p ? `${p.client} · ${formatCOP(p.amount)}` : r.ref_id} · {r.detail}</p>
    {r.status === "abierto" && <div className="mt-2 flex gap-2"><Btn onClick={() => { if (p) actions.markPaid(p.id); void update(r.id, { status: "verificado" }); }}>Verificar</Btn><Btn variant="soft" onClick={() => void update(r.id, { status: "rechazado" })}>Rechazar</Btn></div>}</Card>; }) : <Empty title="Sin pagos por verificar" />}</>);
}
function UnbilledServices() {
  const s = useVF((x) => x); const list = s.visits.filter((v) => v.status === "finalizada").filter((v) => { const pet = s.pets.find((p) => p.id === v.petId); return !s.payments.some((p) => p.client === pet?.owner && p.concept === v.service); });
  return (<><PageTitle title="Servicios sin cobro" subtitle={`${list.length} visitas finalizadas sin cobro asociado`} />{list.length ? list.map((v) => <RowLink key={v.id} icon={CalendarDays} to={`/equipo/visitas/${v.id}/cobro`} label={`${v.date} · ${v.service} · ${s.pets.find((p) => p.id === v.petId)?.owner ?? ""}`} />) : <Empty title="Todo facturado" />}</>);
}
function TreatmentRuns({ id, inc }: { id: string; inc?: boolean }) {
  const t = useVF((s) => s.treatments.find((x) => x.id === id)); const roles = useRoles(); if (!t) return <Empty title="Tratamiento no encontrado" />;
  return <RecordBook kind={inc ? "incidencia_tratamiento" : "ejecucion_tratamiento"} refId={id} title={inc ? "Incidencias del tratamiento" : "Ejecuciones"} subtitle={`${t.pet} · ${t.plan} · ${t.done}/${t.total}`} placeholder={inc ? "Incidencia (ej. dosis no aplicada)" : "Dosis aplicada (fecha)"} statuses={inc ? ["abierto", "cerrado"] : ["registrada"]} canCreate={inc ? true : has(roles, CLIN)} canEdit={has(roles, CLIN)}>
    {!inc && !has(roles, CLIN) && <p className="mb-2 text-sm text-muted-foreground">Solo un veterinario registra dosis.</p>}</RecordBook>;
}
function PendingControls() {
  const tr = useVF((s) => s.treatments.filter((t) => t.done < t.total));
  return (<><PageTitle title="Controles pendientes" subtitle={`${tr.length} planes en curso`} />{tr.map((t) => <RowLink key={t.id} icon={CalendarDays} to={`/admin/tratamientos/${t.id}`} label={`${t.pet} · ${t.plan} · faltan ${t.total - t.done}`} />)}</>);
}
function AIQuality() {
  const ap = useVF((s) => s.approvals.filter((a) => (a.kind as string) === "prioridad"));
  const ai = ap.filter((a) => a.detail.startsWith("IA")); const ok = ai.filter((a) => a.status === "aprobada").length;
  return (<><PageTitle title="Calidad de la IA" subtitle="Sugerencias de prioridad y decisiones humanas" /><div className="grid grid-cols-3 gap-2"><MetricTile icon={CheckCircle2} label="Sugerencias IA" value={ai.length} to="/admin/prioridades" /><MetricTile icon={CheckCircle2} label="Aceptadas" value={ok} tone="sage" to="/admin/prioridades" /><MetricTile icon={Circle} label="Descartadas" value={ai.length - ok} to="/admin/prioridades" /></div>
    <SectionTitle>Decisiones</SectionTitle>{ap.length ? ap.map((a) => <Card key={a.id} className="mb-2"><div className="flex justify-between"><b>{a.title}</b><StatusBadge status={a.status} /></div><p className="text-sm text-muted-foreground">{a.detail}</p></Card>) : <Empty title="Sin decisiones todavía" />}</>);
}
function EmployeeAcademy({ id }: { id: string }) {
  const m = useVF((s) => s.staff.find((x) => x.id === id)); const courses = useVF((s) => s.courses); if (!m) return <Empty title="Empleado no encontrado" />;
  const mine = courses.filter((c) => c.role === "Todos" || m.role.toLowerCase().includes(c.role.toLowerCase().slice(0, 5)));
  return (<><PageTitle title={`Formación · ${m.name}`} subtitle={m.role} />{mine.map((c) => <Card key={c.id} className="mb-2"><div className="flex justify-between"><b>{c.title}</b><span>{c.progress}%</span></div>{c.required && <p className="text-xs text-primary">Obligatorio</p>}</Card>)}</>);
}
function IntegrationEvents({ creds }: { creds?: boolean }) {
  const integ = useVF((s) => s.integrations); const audit = useVF((s) => s.audit.filter((a) => /integraci/i.test(a.action)));
  if (creds) return (<><PageTitle title="Estado de credenciales" subtitle="Nunca se muestran valores secretos" />{integ.map((i) => <Card key={i.id} className="mb-2 flex justify-between"><span><b>{i.name}</b><p className="text-sm text-muted-foreground">{["CONECTADA", "VERIFICADA"].includes(i.status) ? "Credencial configurada" : "Sin credencial"}</p></span><StatusBadge status={i.status === "VERIFICADA" ? "confirmada" : "pendiente"} /></Card>)}</>);
  return (<><PageTitle title="Eventos de integraciones" subtitle={`${audit.length} eventos`} />{audit.length ? audit.map((a) => <Card key={a.id} className="mb-2"><p>{a.action}</p><p className="text-xs text-muted-foreground">{a.at}</p></Card>) : <Empty title="Sin eventos" />}</>);
}
function AdminOnboarding() {
  const s = useVF((x) => x); const [keys, setKeys] = useState<string[] | null>(null);
  useEffect(() => { void db.from("org_settings").select("key").then(({ data }: { data: { key: string }[] | null }) => setKeys((data ?? []).map((d) => d.key))); return undefined; }, []);
  if (!keys) return <LoadingSkeleton />;
  return (<><PageTitle title="Configuración inicial de Vet Life" /><OnboardingStepper steps={[
    { label: "Organización", done: keys.includes("organizacion"), to: "/admin/organizacion" }, { label: "Equipo", done: s.staff.length > 0, to: "/admin/equipo-cuentas", hint: `${s.staff.length} personas · ${s.staff.filter((m) => (m as { userId?: string | null }).userId).length} con cuenta` },
    { label: "Servicios", done: keys.includes("servicios"), to: "/admin/servicios" }, { label: "Zonas", done: keys.includes("zonas"), to: "/admin/zonas" }, { label: "Horarios", done: keys.includes("horarios"), to: "/admin/horarios" },
    { label: "Configuraciones básicas", done: keys.includes("tarifas") && keys.includes("politicas"), to: "/admin/tarifas" },
    { label: "Estado de integraciones", done: s.integrations.length > 0, to: "/admin/integraciones", hint: `${s.integrations.filter((i) => ["CONECTADA", "VERIFICADA"].includes(i.status)).length}/${s.integrations.length} conectadas` }]} /></>);
}
function Coverage() {
  const by = new Map<string, [number, number]>(); SCREENS.forEach((x) => { const c = by.get(x.module) ?? [0, 0]; by.set(x.module, [c[0] + 1, c[1] + (x.frontend === "funcional" ? 1 : 0)]); });
  return (<><PageTitle title="Cobertura de requisitos" subtitle={`${SCREENS.length} pantallas registradas`} />{[...by.entries()].map(([m, [t, f]]) => <Card key={m} className="mb-2"><div className="flex justify-between"><b>{m}</b><span>{f}/{t}</span></div><div className="mt-2 h-2 rounded-full bg-secondary"><div className="h-full rounded-full bg-gradient-primary" style={{ width: `${(f / t) * 100}%` }} /></div></Card>)}</>);
}

/* ---------- Resolver ---------- */
const book = (kind: string, title: string, o: Partial<Parameters<typeof RecordBook>[0]> = {}) => <RecordBook kind={kind} title={title} {...o} />;
export function c01Page(path: string): ReactNode | null {
  const p = path.replace(/\/$/, "").split("/").slice(1); const [m, a, b, c, d] = p;
  const id = b ?? "";
  switch (m) {
    case "auth": if (a === "activar-mfa") return <MFASetupPanel />; if (a === "validar-mfa") return <MFAValidate />; if (a === "invitacion-expirada") return <ExpiredInvite />; return null;
    case "app":
      if (a === "bienvenida") return <Welcome />; if (a === "onboarding") return <ClientOnboarding />;
      if (a === "mascotas" && c === "preferencias") return <PetPrefs id={id} />;
      if (a === "visitas" && c === "postvisita") return <PostVisit id={id} />;
      if (a === "remisiones" && c === "documentos") return <ClientRefDocs id={id} />; if (a === "remisiones" && c === "preparacion") return <ClientRefDocs id={id} prep />;
      if (a === "seguimientos" && b) return <FollowUp id={id} />;
      if (a === "privacidad" && b === "solicitudes") return book("privacidad", c === "nueva" ? "Nueva solicitud de privacidad" : "Mis solicitudes de privacidad", { scope: "client", canEdit: false, canCreate: c === "nueva" || true, placeholder: "Tipo: consulta, corrección o eliminación de datos", createLabel: "Enviar solicitud", statuses: ["abierto", "en_gestion", "resuelta"], subtitle: "Ley 1581 de 2012 · respuesta en máximo 15 días hábiles" });
      if (a === "notificaciones" && b === "preferencias") return <NotifPrefs />;
      return null;
    case "cuidador": if (a === "autorizaciones") return <CaregiverAuths id={b} />; if (a === "acceso-revocado") return <Revoked />; return null;
    case "equipo":
      if (a === "cierre-jornada") return <DayClose />; if (a === "onboarding") return <StaffOnboarding />;
      if (a === "visitas" && c === "compromisos" && d === "nuevo") return <NewCommitment id={id} />;
      if (a === "visitas" && c === "cobro") return <VisitCharge id={id} />; if (a === "visitas" && c === "continuidad") return <Continuity id={id} />;
      if (a === "visitas" && c === "revision") return <><PageTitle title="Revisión al terminar" /><VisitCompletionChecklist visitId={id} /></>;
      if (a === "remisiones" && c === "documentos") return <RefDocs id={id} />; if (a === "remisiones" && c === "seguimiento") return <RefProgress id={id} />;
      if (a === "ausencias" && b === "solicitar") return <RequestShift kind="solicitud_ausencia" />;
      if (a === "turnos" && b === "solicitar") return <RequestShift kind="solicitud_turno" />; if (a === "turnos" && b) return <Shift id={id} />;
      if (a === "incidencias" && b) return <IncidentView id={id} />; if (a === "formacion" && b === "pendientes") return <PendingTraining />;
      return null;
    case "operaciones": return opsC01(a, b, c, d);
    case "admin": return adminC01(a, b, c, d);
  }
  return null;
}
function opsC01(a?: string, b?: string, c?: string, d?: string): ReactNode | null {
  const id = b ?? "";
  if (a === "calendarios") return b === "conexiones" ? <CalendarConnections /> : b === "conflictos" ? <Conflicts /> : b === "sincronizacion" ? book("sync_calendario", "Sincronización de calendarios", { subtitle: "Google Calendar sin conectar: historial manual", placeholder: "Evento de sincronización", statuses: ["pendiente", "sincronizado", "error"] }) : null;
  if (a === "agenda" && b === "bloqueos") return c ? <HoldView id={c} /> : book("bloqueo", "Reservas provisionales", { base: "/operaciones/agenda/bloqueos", placeholder: "Horario bloqueado (ej. Mar 28 · 10:00 · Dra. Torres)", fields: ["vence"], statuses: ["activa", "confirmada", "liberada", "vencida"], subtitle: "Escribe «vence» como AAAA-MM-DDTHH:MM" });
  if (a === "agenda" && b === "protegidas") return book("protegida", "Visitas protegidas", { placeholder: "Visita y restricción (ej. solo Dra. Torres)", fields: ["Visita", "Restricción"], statuses: ["vigente", "levantada"] });
  if (a === "agenda" && b === "cambios-pendientes") return <PendingChanges />;
  if (a === "llamadas") return b ? <RecordView id={b} title="Resumen de llamada" /> : book("llamada", "Registro de llamadas", { base: "/operaciones/llamadas", placeholder: "Cliente y motivo", fields: ["Teléfono", "Compromisos"], statuses: ["registrada", "con_seguimiento", "cerrada"] });
  if (a === "recurrencias") return b === "conflictos" ? <RecurrenceConflicts /> : b ? <RecordView id={b} title="Programación recurrente" statuses={["activa", "pausada", "finalizada"]} /> : book("recurrencia", "Programaciones recurrentes", { base: "/operaciones/recurrencias", placeholder: "Mascota y servicio", fields: ["Frecuencia", "Profesional", "Excepciones"], statuses: ["activa", "pausada", "finalizada"] });
  if (a === "lista-espera" && b) return <WaitOffer id={id} />;
  if (a === "turnos" && b === "solicitudes") return <ShiftRequests />;
  if (a === "reemplazos") return <ReplacementPlanner id={b} />;
  if (a === "urgencias" && b) return <IncidentView id={id} />;
  if (a === "rutas" && b && (c === "aprobacion" || c === "incidencias")) return <RouteApproval id={id} incidents={c === "incidencias"} />;
  if (a === "whatsapp" && b && ["pendientes", "traspasos", "fallos", "seguimientos"].includes(b)) return <WhatsAppQueue mode={b} />;
  if (a === "memoria" && b && c && ["validaciones", "correcciones", "historial"].includes(c)) return <MemoryTab id={b} tab={c} />;
  if (a === "compromisos" && b === "vencidos") return <OverdueCommitments />;
  if (a === "compromisos" && b) return <Commitments base="/operaciones/compromisos" id={b} />;
  if (a === "simulador" && b && c && ["plan", "conciliacion", "auditoria"].includes(c)) return book(`sim_${c}`, { revalidacion: "Revalidación", "clientes-afectados": "Clientes afectados", plan: "Plan de ejecución", conciliacion: "Conciliación", auditoria: "Auditoría del escenario" }[c]!, { refId: b, placeholder: "Registro", statuses: ["pendiente", "hecho"] });
  if (a === "especialistas" && b === "respaldo") return <SpecBackup />;
  if (a === "especialistas" && b && c === "credenciales") return book("credencial", "Credenciales del especialista", { refId: b, placeholder: "Credencial (ej. Tarjeta profesional)", fields: ["Número", "Vence"], statuses: ["por_verificar", "verificada", "vencida"] });
  if (a === "remisiones" && b && c && (REF_STEP[c] || c === "historial" || (c === "documentos" && d === "compartir"))) return <ReferralStep id={id} step={c} />;
  return null;
}
function RecurrenceConflicts() {
  const { rows } = useRecords("recurrencia"); const absent = useVF((s) => s.staff.filter((m) => m.status === "ausente").map((m) => m.name));
  const list = (rows ?? []).filter((r) => r.status === "activa" && absent.some((n) => String(r.data["Profesional"] ?? "").includes(n.split(" ").slice(-1)[0] ?? "")));
  return (<><PageTitle title="Conflictos de recurrencias" subtitle="Recurrencias asignadas a profesionales ausentes" />{rows === null ? <LoadingSkeleton /> : list.length ? list.map((r) => <RowLink key={r.id} icon={CalendarDays} to={`/operaciones/recurrencias/${r.id}`} label={`${r.title} · ${String(r.data["Profesional"])}`} />) : <Empty title="Sin conflictos" />}</>);
}
function adminC01(a?: string, b?: string, c?: string, d?: string): ReactNode | null {
  void d;
  if (a === "onboarding") return <AdminOnboarding />;
  if (a === "usuarios" && b && c === "permisos") return <UserPerms id={b} />;
  if (a === "accesos" && b === "temporales") return book("acceso_temporal", "Accesos temporales", { scope: "director", placeholder: "Persona", fields: ["Alcance", "Vence"], statuses: ["vigente", "revocado", "vencido"] });
  if (a === "privacidad" && b === "solicitudes") return book("privacidad", "Solicitudes de privacidad", { canCreate: false, statuses: ["abierto", "en_gestion", "resuelta"] });
  if (a === "privacidad" && b === "exportaciones") return <PrivacyExport />;
  if (a === "seguridad" && b === "eventos") return book("seguridad", "Eventos de seguridad", { scope: "director", placeholder: "Evento", fields: ["Usuario"], statuses: ["abierto", "revisado"] });
  if (a === "inventario") { if (b === "productos" && c === "nuevo") return <NewProduct />; if (b === "movimientos" && c === "nuevo") return <StockMovementForm />; if (b === "lotes" && c) return <Lot id={c} />; if (b === "compras" && c === "nueva") return book("compra", "Nueva orden de compra", { placeholder: "Producto y cantidad", fields: ["Proveedor", "Valor COP"], statuses: ["solicitada", "aprobada", "recibida"] }); if (b === "conteos") return <StockMovementForm count />; }
  if (a === "finanzas") { if (b === "cobros" && c) return <PaymentAdmin id={c} />; if (b === "conciliacion" && c) return <RecordView id={c} title="Conciliación" statuses={["abierta", "conciliada", "diferencia"]} />; if (b === "verificacion") return <PaymentVerification />; if (b === "servicios-pendientes") return <UnbilledServices />; }
  if (a === "tratamientos" && b && (c === "ejecuciones" || c === "incidencias")) return <TreatmentRuns id={b} inc={c === "incidencias"} />;
  if (a === "prevencion") { if (b === "planes" && c) return <RecordView id={c} title="Plan preventivo" statuses={["activo", "pausado", "finalizado"]} />; if (b === "controles-pendientes") return <PendingControls />; }
  if (a === "calidad" && b === "ia") return <AIQuality />;
  if (a === "calidad" && b === "procedimientos-correctivos") return book("procedimiento_correctivo", "Procedimientos correctivos", { placeholder: "Acción correctiva", fields: ["Responsable"], statuses: ["abierto", "en_curso", "verificado"] });
  if (a === "quejas" && b) return <IncidentView id={b} />;
  if (a === "encuestas") return b === "nueva" ? book("encuesta", "Nueva encuesta", { placeholder: "Nombre de la encuesta", fields: ["Pregunta 1", "Pregunta 2", "Pregunta 3"], statuses: ["borrador", "activa", "cerrada"], base: "/admin/encuestas" }) : b ? <RecordView id={b} title="Encuesta" statuses={["borrador", "activa", "cerrada"]} /> : null;
  if (a === "fidelizacion" && b === "supresiones") return book("supresion", "Supresiones de mensajes", { placeholder: "Cliente que no quiere mensajes comerciales", fields: ["Canal"], statuses: ["vigente", "retirada"] });
  if (a === "academia") {
    const MAP: Record<string, [string, string]> = { lecciones: ["leccion", "Lecciones"], evaluaciones: ["evaluacion", "Evaluaciones"], procedimientos: ["procedimiento", "Procedimientos"] };
    if (b && MAP[b]) return c === "nueva" ? book(MAP[b]![0], `Nueva ${MAP[b]![1].toLowerCase().slice(0, -1)}`.replace("nueva procedimiento", "Nuevo procedimiento"), { placeholder: "Título", fields: ["Curso", "Contenido"], statuses: ["borrador", "publicada"], base: `/admin/academia/${b}` }) : c ? <RecordView id={c} statuses={["borrador", "publicada"]} /> : null;
    if (b === "empleados" && c) return <EmployeeAcademy id={c} />;
    if (b === "versiones") return book("version_procedimiento", "Versiones de procedimientos", { placeholder: "Procedimiento y versión", fields: ["Cambios"], statuses: ["vigente", "reemplazada"] });
  }
  if (a === "integraciones") { if (b === "eventos") return <IntegrationEvents />; if (b === "credenciales-estado") return <IntegrationEvents creds />; if (b === "webhooks") return book("webhook", "Webhooks registrados", { scope: "director", placeholder: "Nombre del webhook", fields: ["Destino", "Evento"], statuses: ["registrado", "inactivo"], subtitle: "Registro: n8n/WhatsApp no están conectados todavía" }); }
  if (a === "automatizaciones" && b === "ejecuciones" && c) return <RecordView id={c} title="Ejecución de automatización" statuses={["en_cola", "procesando", "completada", "error"]} />;
  if (a === "sistema" && b === "recuperacion") return book("respaldo", "Recuperación ante fallos", { scope: "director", placeholder: "Respaldo o punto de recuperación", fields: ["Fecha"], statuses: ["registrado", "verificado"] });
  if (a === "sistema" && b === "restauracion" && c === "pruebas") return book("prueba_restauracion", "Pruebas de restauración", { scope: "director", placeholder: "Prueba", fields: ["Resultado"], statuses: ["planeada", "exitosa", "fallida"] });
  if (a === "project-memory") { if (b === "cobertura") return <Coverage />; if (b === "importar-fuentes") return book("pm_fuente", "Fuentes importadas", { placeholder: "Documento (ej. PROMPT 01C)", fields: ["Versión"], statuses: ["importada", "analizada"] }); if (b === "analisis-impacto") return book("pm_impacto", "Análisis de impacto", { placeholder: "Cambio solicitado", fields: ["Pantallas afectadas"], statuses: ["abierto", "aprobado", "aplicado"] }); if (b === "evidencias") return book("pm_evidencia", "Evidencias", { placeholder: "Evidencia (prueba, captura, commit)", fields: ["Pantalla"], statuses: ["registrada", "validada"] }); }
  return null;
}
