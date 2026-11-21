import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { getVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn, StatusBadge } from "../ui";
import { LoadingSkeleton, ErrorState } from "../shared";

export type Rec = { id: string; kind: string; scope: string; ref_id: string | null; owner_id: string | null; title: string; detail: string; status: string; data: Record<string, unknown>; created_at: string; updated_at: string };
export const input = "w-full rounded-2xl bg-accent p-3";

/** Rows of the generic `records` table for one kind (and optional reference). RLS decides visibility. */
export function useRecords(kind: string | string[], refId?: string) {
  const [rows, setRows] = useState<Rec[] | null>(null); const [error, setError] = useState<string | null>(null);
  const kinds = Array.isArray(kind) ? kind : [kind]; const key = kinds.join(",") + "|" + (refId ?? "");
  const reload = async () => {
    let q = db.from("records").select("*").in("kind", kinds).order("created_at", { ascending: false });
    if (refId) q = q.eq("ref_id", refId);
    const { data, error: e } = await q; if (e) setError(e.message); else { setError(null); setRows(data ?? []); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void reload(); const fn = () => void reload(); addEventListener("vf-field-change", fn); const timer = setInterval(fn, 15000); return () => { removeEventListener("vf-field-change", fn); clearInterval(timer); }; }, [key]);
  const create = async (r: Partial<Rec> & { title: string }) => {
    const { error: e } = await db.from("records").insert({ kind: kinds[0], scope: "staff", ref_id: refId ?? null, ...r, created_by: getVF().userId });
    if (e) { toast.error("No se pudo guardar: " + e.message); return false; } toast.success("Guardado"); await reload(); return true;
  };
  const update = async (id: string, patch: Partial<Rec>) => {
    const { data, error: e } = await db.from("records").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id).select("id");
    if (e || !data?.length) { toast.error("No se pudo actualizar: " + (e?.message ?? "No tienes acceso o el registro cambió")); return false; } toast.success("Actualizado"); await reload(); return true;
  };
  return { rows, error, reload, create, update };
}

export function useRecord(id: string) {
  const [row, setRow] = useState<Rec | null | undefined>(undefined);
  const reload = async () => { const { data } = await db.from("records").select("*").eq("id", id).maybeSingle(); setRow(data ?? null); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void reload(); }, [id]);
  const update = async (patch: Partial<Rec>) => { const { error } = await db.from("records").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id); if (error) toast.error(error.message); else { toast.success("Actualizado"); await reload(); } };
  return { row, update, reload };
}

export interface BookProps { kind: string; title: string; subtitle?: string; scope?: "staff" | "director" | "client"; refId?: string; ownerId?: string | null; fields?: string[]; statuses?: string[]; base?: string; canCreate?: boolean; canEdit?: boolean; createLabel?: string; placeholder?: string; children?: ReactNode; empty?: string }
/** Generic list + create + status for one record kind. */
export function RecordBook({ kind, title, subtitle, scope = "staff", refId, ownerId, fields = [], statuses = ["abierto", "en_gestion", "cerrado"], base, canCreate = true, canEdit = true, createLabel = "Registrar", placeholder = "Título", children, empty = "Sin registros todavía" }: BookProps) {
  const { rows, error, reload, create, update } = useRecords(kind, refId);
  const [f, setF] = useState<Record<string, string>>({});
  const submit = async () => {
    const data = Object.fromEntries(fields.map((k) => [k, f[k] ?? ""]));
    if (await create({ title: f["__t"]!.trim(), detail: f["__d"] ?? "", scope, data, status: statuses[0]!, ...(ownerId !== undefined ? { owner_id: ownerId } : scope === "client" ? { owner_id: getVF().userId } : {}) })) setF({});
  };
  return (<><PageTitle title={title} subtitle={subtitle ?? (rows ? `${rows.length} registros` : "")} />
    {children}
    {canCreate && <Card className="mb-3 space-y-2">
      <input className={input} aria-label={placeholder} placeholder={placeholder} value={f["__t"] ?? ""} onChange={(e) => setF({ ...f, __t: e.target.value })} />
      {fields.map((k) => <input key={k} className={input} aria-label={k} placeholder={k} value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}
      <textarea rows={2} className={input} aria-label="Detalle" placeholder="Detalle" value={f["__d"] ?? ""} onChange={(e) => setF({ ...f, __d: e.target.value })} />
      <Btn className="w-full" disabled={!(f["__t"] ?? "").trim()} onClick={() => void submit()}>{createLabel}</Btn></Card>}
    {error ? <ErrorState message={error} onRetry={() => void reload()} /> : !rows ? <LoadingSkeleton /> : rows.length ? rows.map((r) => <Card key={r.id} className="mb-2">
      <div className="flex items-start justify-between gap-2"><div className="min-w-0">
        {base ? <Link to={`${base}/${r.id}` as never} className="font-bold text-primary">{r.title}</Link> : <b>{r.title}</b>}
        {r.detail && <p className="text-sm text-muted-foreground">{r.detail}</p>}
        {Object.entries(r.data ?? {}).filter(([, v]) => typeof v === "string" && v).map(([k, v]) => <p key={k} className="text-xs"><b>{k}:</b> {String(v)}</p>)}
        <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString("es-CO")}</p></div>
        <StatusBadge status={r.status} /></div>
      {canEdit && <select className={`${input} mt-2`} aria-label={`Estado de ${r.title}`} value={r.status} onChange={(e) => void update(r.id, { status: e.target.value })}>{statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select>}
    </Card>) : <Empty title={empty} />}</>);
}

/** Detail of one record with notes trail and status. */
export function RecordView({ id, title, statuses = ["abierto", "en_gestion", "cerrado"], canEdit = true, children }: { id: string; title?: string; statuses?: string[]; canEdit?: boolean; children?: (r: Rec) => ReactNode }) {
  const { row, update } = useRecord(id); const [note, setNote] = useState("");
  if (row === undefined) return <LoadingSkeleton />;
  if (!row) return <Empty title="Registro no encontrado o sin permiso" />;
  const notes = (row.data["notas"] as { at: string; text: string }[] | undefined) ?? [];
  return (<><PageTitle title={row.title} subtitle={title ?? row.kind.replace(/_/g, " ")}><StatusBadge status={row.status} /></PageTitle>
    <Card className="mb-3 space-y-1">{row.detail && <p>{row.detail}</p>}{Object.entries(row.data).filter(([, v]) => typeof v === "string" && v).map(([k, v]) => <p key={k} className="text-sm"><b>{k}:</b> {String(v)}</p>)}
      <p className="text-xs text-muted-foreground">Creado {new Date(row.created_at).toLocaleString("es-CO")} · actualizado {new Date(row.updated_at).toLocaleString("es-CO")}</p></Card>
    {children?.(row)}
    {canEdit && <Card className="mb-3 space-y-2"><select className={input} aria-label="Estado" value={row.status} onChange={(e) => void update({ status: e.target.value })}>{statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select>
      <input className={input} aria-label="Nota" placeholder="Agregar nota de seguimiento" value={note} onChange={(e) => setNote(e.target.value)} />
      <Btn variant="soft" className="w-full" disabled={!note.trim()} onClick={() => { void update({ data: { ...row.data, notas: [...notes, { at: new Date().toISOString(), text: note.trim() }] } }); setNote(""); }}>Agregar nota</Btn></Card>}
    <SectionTitle>Historial</SectionTitle>{notes.length ? notes.map((n) => <Card key={n.at} className="mb-2"><p>{n.text}</p><p className="text-xs text-muted-foreground">{new Date(n.at).toLocaleString("es-CO")}</p></Card>) : <Empty title="Sin notas" />}</>);
}
