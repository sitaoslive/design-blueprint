import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { ROLES } from "@/lib/vf/roles";
import { useVF, actions } from "@/lib/vf/store";
import { PageTitle, Card, Empty } from "../ui";

type Row = { id: string; display_name: string; roles: string[] };

export function UsersPage() {
  const me = useVF((s) => s.userId);
  const [rows, setRows] = useState<Row[] | null>(null);
  const load = async () => {
    const [{ data: p }, { data: r }] = await Promise.all([db.from("profiles").select("id, display_name").order("created_at"), db.from("user_roles").select("user_id, role")]);
    const roles = (r ?? []) as { user_id: string; role: string }[];
    setRows(((p ?? []) as { id: string; display_name: string }[]).map((x) => ({ ...x, roles: roles.filter((y) => y.user_id === x.id).map((y) => y.role) })));
  };
  useEffect(() => { void load(); }, []);
  const toggle = async (u: Row, role: string) => {
    const has = u.roles.includes(role);
    const { error } = has ? await db.from("user_roles").delete().eq("user_id", u.id).eq("role", role) : await db.from("user_roles").insert({ user_id: u.id, role });
    if (error) { toast.error(error.message); return; }
    toast.success(has ? "Rol retirado" : "Rol asignado"); void load();
  };
  return (<><PageTitle title="Usuarios y permisos" subtitle="Asigna los perfiles de cada persona" />
    {rows === null ? <p className="text-muted-foreground">Cargando…</p> : rows.length === 0 ? <Empty title="Sin usuarios" /> :
      <div className="space-y-3">{rows.map((u) => (
        <Card key={u.id}><b className="text-lg">{u.display_name || "Sin nombre"}</b>{u.id === me && <span className="ml-2 text-sm text-muted-foreground">(tú)</span>}
          <div className="mt-2 flex flex-wrap gap-2">{ROLES.map((r) => {
            const on = u.roles.includes(r.id); const locked = u.id === me && on;
            return <button key={r.id} disabled={locked} onClick={() => void toggle(u, r.id)} aria-pressed={on} className={`rounded-full px-3 py-1.5 text-sm font-semibold disabled:opacity-60 ${on ? "bg-gradient-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>{r.label}</button>;
          })}</div></Card>))}</div>}
    <p className="mt-4 text-sm text-muted-foreground">Las personas nuevas entran como Cliente. No puedes quitarte tus propios roles.</p></>);
}

const STATES = ["NO CONFIGURADA", "PREPARADA", "CONECTADA", "EN PRUEBAS", "VERIFICADA", "ERROR"];
export function IntegrationsPage() {
  const list = useVF((s) => s.integrations);
  const roles = useVF((s) => s.roles);
  const canEdit = roles.includes("luis") || roles.includes("administrador");
  return (<><PageTitle title="Integraciones" subtitle="Estado real de cada conexión" />
    <div className="space-y-2">{list.map((i) => (
      <Card key={i.id}><div className="flex items-start justify-between gap-2"><div><b>{i.name}</b><p className="text-muted-foreground">{i.purpose}</p>{i.note && <p className="text-sm text-muted-foreground">{i.note}</p>}</div>
        {canEdit ? <select aria-label={`Estado de ${i.name}`} value={i.status} onChange={(e) => actions.setIntegration(i.id, e.target.value)} className="rounded-full bg-accent px-3 py-1.5 text-sm font-bold">{STATES.map((s) => <option key={s}>{s}</option>)}</select>
          : <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-bold">{i.status}</span>}</div></Card>))}</div>
    <p className="mt-3 text-sm text-muted-foreground">Marca CONECTADA o VERIFICADA solo con evidencia real.</p></>);
}
