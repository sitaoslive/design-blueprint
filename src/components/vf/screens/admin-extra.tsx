import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useVF, refreshVF } from "@/lib/vf/store";
import { db } from "@/lib/vf/db";
import { triageRequest, triageReferral, type Priority } from "@/lib/vf/triage";
import { PageTitle, SectionTitle, Card, Empty, Btn, StatusBadge } from "../ui";

const input = "w-full rounded-2xl bg-accent p-3";
type Spec = { id: string; name: string; specialty: string; city: string; user_id?: string | null };
const save = async (p: PromiseLike<{ error: { message: string } | null }>, ok: string) => {
  const { error } = await p; if (error) { toast.error("No se pudo guardar: " + error.message); return false; }
  toast.success(ok); await refreshVF(); return true;
};

/* Link each external specialist account with its profile and assigned referrals. */
export function SpecialistLinks() {
  const specs = useVF((s) => s.specialists as Spec[]);
  const refs = useVF((s) => s.referrals);
  const [profiles, setProfiles] = useState<{ id: string; display_name: string }[]>([]);
  useEffect(() => { void db.from("profiles").select("id, display_name").order("display_name").then(({ data }: { data: typeof profiles | null }) => setProfiles(data ?? [])); }, []);
  const link = async (s: Spec, uid: string) => {
    if (uid) { const { error } = await db.from("user_roles").insert({ user_id: uid, role: "especialista" }); if (error && !/duplicate/i.test(error.message)) { toast.error(error.message); return; } }
    await save(db.from("specialists").update({ user_id: uid || null }).eq("id", s.id), uid ? `Cuenta vinculada a ${s.name}` : "Vínculo retirado");
  };
  const assign = (refId: string, name: string) => save(db.from("referrals").update({ specialist: name || null, status: name ? "agendada" : "por_resolver" }).eq("id", refId), name ? `Remisión asignada a ${name}` : "Remisión sin asignar");
  const unassigned = refs.filter((r) => !r.specialist && r.status !== "cerrada");
  return (<><PageTitle title="Cuentas de especialistas" subtitle="Vincula cada cuenta externa con su perfil y sus remisiones" />
    {!specs.length && <Empty title="Sin especialistas registrados" />}
    {specs.map((s) => { const mine = refs.filter((r) => r.specialist === s.name); return (
      <Card key={s.id} className="mb-3"><b>{s.name}</b><p className="text-sm text-muted-foreground">{s.specialty} · {s.city}</p>
        <label className="mt-2 block text-sm font-bold">Cuenta en el portal
          <select className={input} aria-label={`Cuenta de ${s.name}`} value={s.user_id ?? ""} onChange={(e) => void link(s, e.target.value)}>
            <option value="">Sin vincular</option>{profiles.map((p) => <option key={p.id} value={p.id}>{p.display_name || p.id.slice(0, 8)}</option>)}</select></label>
        <p className="mt-2 text-sm font-bold">Remisiones asignadas ({mine.length})</p>
        {mine.length ? mine.map((r) => <div key={r.id} className="mt-1 flex items-center justify-between gap-2 text-sm"><span>{r.pet} · {r.specialty}</span><span className="flex items-center gap-2"><StatusBadge status={r.status} />{r.status !== "cerrada" && <Btn variant="soft" onClick={() => void assign(r.id, "")}>Quitar</Btn>}</span></div>) : <p className="text-sm text-muted-foreground">Ninguna</p>}
      </Card>); })}
    <SectionTitle>Remisiones sin especialista</SectionTitle>
    {unassigned.length ? unassigned.map((r) => <Card key={r.id} className="mb-2"><b>{r.pet} · {r.specialty}</b>
      <select className={`${input} mt-2`} aria-label={`Asignar remisión de ${r.pet}`} value="" onChange={(e) => void assign(r.id, e.target.value)}><option value="">Asignar a…</option>{specs.map((s) => <option key={s.id} value={s.name}>{s.name} · {s.specialty}</option>)}</select></Card>) : <Empty title="Todas las remisiones tienen especialista" />}
  </>);
}

const TONE: Record<Priority, string> = { alta: "bg-primary text-primary-foreground", media: "bg-accent text-foreground", baja: "bg-sage text-sage-foreground" };

/* Priority of each new request/referral with reason; a human confirms before anything changes. */
export function PriorityReview() {
  const reqs = useVF((s) => s.requests.filter((r) => r.status === "nueva"));
  const refs = useVF((s) => s.referrals.filter((r) => r.status === "por_resolver"));
  const decided = useVF((s) => new Set(s.approvals.filter((a) => a.id.startsWith("prio-")).map((a) => a.id)));
  const items = [
    ...reqs.map((r) => ({ key: `prio-req-${r.id}`, kind: "Solicitud", title: `${r.client} · ${r.pet}`, detail: r.message, t: triageRequest(r.message, r.channel), act: () => db.from("service_requests").update({ status: "en_gestion" }).eq("id", r.id), actLabel: "pasa a En gestión" })),
    ...refs.map((r) => ({ key: `prio-ref-${r.id}`, kind: "Remisión", title: `${r.pet} · ${r.specialty}`, detail: r.specialist ? `Con ${r.specialist}` : "Sin especialista", t: triageReferral(r.specialty, !!r.specialist), act: null, actLabel: "queda priorizada" })),
  ].filter((i) => !decided.has(i.key)).sort((a, b) => ["alta", "media", "baja"].indexOf(a.t.priority) - ["alta", "media", "baja"].indexOf(b.t.priority));
  const decide = async (i: (typeof items)[number], ok: boolean) => {
    if (ok && i.act) { const { error } = await i.act(); if (error) { toast.error(error.message); return; } }
    await save(db.from("approvals").insert({ id: i.key, title: `Prioridad ${i.t.priority}: ${i.title}`, detail: i.t.reason, kind: "prioridad", status: ok ? "aprobada" : "rechazada" }), ok ? `Confirmado: ${i.kind.toLowerCase()} ${i.actLabel}` : "Sugerencia descartada");
  };
  return (<><PageTitle title="Prioridades sugeridas" subtitle="Análisis automático por reglas · confirma antes de actuar" />
    {items.length ? items.map((i) => <Card key={i.key} className="mb-2">
      <div className="flex items-start justify-between gap-2"><div><p className="text-xs text-muted-foreground">{i.kind}</p><b>{i.title}</b><p className="text-sm text-muted-foreground">{i.detail}</p></div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${TONE[i.t.priority]}`}>{i.t.priority.toUpperCase()}</span></div>
      <p className="mt-2 text-sm"><b>Motivo:</b> {i.t.reason}</p>
      <div className="mt-2 flex gap-2"><Btn onClick={() => void decide(i, true)}>Confirmar</Btn><Btn variant="soft" onClick={() => void decide(i, false)}>Descartar</Btn></div></Card>)
      : <Empty title="Sin solicitudes ni remisiones nuevas por revisar" />}
    <p className="mt-3 text-sm text-muted-foreground">Cada decisión queda registrada en Aprobaciones. El análisis con IA se activará más adelante.</p></>);
}
