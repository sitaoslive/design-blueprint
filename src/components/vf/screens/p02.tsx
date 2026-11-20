import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { useVF } from "@/lib/vf/store";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, SectionTitle, Card, Empty, Btn, StatusBadge } from "../ui";

const input = "w-full rounded-2xl bg-accent p-3";
type Row = Record<string, unknown>;

function useRows(table: string, order: string, filter?: (q: any) => any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const [rows, setRows] = useState<Row[] | null>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    let q = db.from(table).select("*").order(order, { ascending: false }).limit(200);
    if (filter) q = filter(q);
    q.then(({ data, error }: { data: Row[] | null; error: { message: string } | null }) => { if (error) toast.error(error.message); setRows(data ?? []); });
  }, [table, order, n]); // eslint-disable-line react-hooks/exhaustive-deps
  return [rows, () => setN((x) => x + 1)] as const;
}
const Loading = () => <p className="text-muted-foreground">Cargando…</p>;

export function FeatureFlags() {
  const [rows, reload] = useRows("feature_flags", "key");
  const toggle = async (r: Row) => {
    const { error } = await db.from("feature_flags").update({ enabled: !r["enabled"] }).eq("key", r["key"]);
    if (error) toast.error(error.message); else { toast.success("Módulo actualizado"); reload(); }
  };
  return (<><PageTitle title="Módulos activos" subtitle="Los que dependen de integraciones externas permanecen en modo seguro" />
    {!rows ? <Loading /> : rows.map((r) => <Card key={String(r["key"])} className="mb-2 flex items-center justify-between gap-3">
      <span><b>{String(r["label"])}</b><p className="text-xs text-muted-foreground">{String(r["key"])}{r["requires_integration"] ? " · requiere integración verificada" : ""}</p></span>
      <Btn variant={r["enabled"] ? "primary" : "outline"} disabled={Boolean(r["requires_integration"]) && !r["enabled"]} onClick={() => void toggle(r)}>{r["enabled"] ? "Activo" : "Inactivo"}</Btn></Card>)}</>);
}

export function EventOutbox() {
  const [rows, reload] = useRows("event_outbox", "occurred_at");
  return (<><PageTitle title="Eventos del sistema" subtitle="Preparados para n8n · aún no se envían a sistemas externos" />
    <Btn variant="outline" className="mb-3" onClick={reload}>Actualizar</Btn>
    {!rows ? <Loading /> : rows.length ? rows.map((r) => <Card key={String(r["event_id"])} className="mb-2">
      <div className="flex justify-between"><b>{String(r["event_type"])}</b><StatusBadge status="pendiente" /></div>
      <p className="text-xs text-muted-foreground">{new Date(String(r["occurred_at"])).toLocaleString("es-CO")} · {String(r["entity_id"] ?? "")} · intentos {String(r["attempt_count"])}</p></Card>) : <Empty title="Sin eventos aún" />}</>);
}

const KINDS = ["preferencia", "acceso_hogar", "comportamiento", "compromiso", "comunicacion"];
export function MemoryList({ clientId, staff }: { clientId?: string; staff: boolean }) {
  const [rows, reload] = useRows("customer_memory", "created_at", clientId ? (q) => q.eq("client_id", clientId) : undefined);
  const [f, setF] = useState({ kind: "preferencia", content: "", sensitivity: "normal" });
  const add = async () => {
    if (!clientId || !f.content.trim()) return;
    const { error } = await db.from("customer_memory").insert({ client_id: clientId, kind: f.kind, content: f.content.trim(), sensitivity: f.sensitivity, source: staff ? "equipo" : "cliente" });
    if (error) toast.error(error.message); else { setF({ ...f, content: "" }); toast.success("Guardado"); reload(); }
  };
  const upd = async (id: unknown, patch: Row, msg: string) => { const { error } = await db.from("customer_memory").update(patch).eq("id", id); if (error) toast.error(error.message); else { toast.success(msg); reload(); } };
  const del = async (id: unknown) => { const { error } = await db.from("customer_memory").delete().eq("id", id); if (error) toast.error(error.message); else reload(); };
  return (<>
    {clientId && <Card className="mb-3 space-y-2"><select className={input} aria-label="Tipo" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
      <textarea className={input} aria-label="Dato a recordar" placeholder="Ej. Prefiere visitas en la mañana" value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} />
      <select className={input} aria-label="Sensibilidad" value={f.sensitivity} onChange={(e) => setF({ ...f, sensitivity: e.target.value })}><option value="normal">Normal</option><option value="sensible">Sensible (solo coordinación)</option></select>
      <Btn onClick={() => void add()} disabled={!f.content.trim()}>Guardar</Btn></Card>}
    {!rows ? <Loading /> : rows.length ? rows.map((r) => <Card key={String(r["id"])} className="mb-2">
      <div className="flex justify-between gap-2"><b>{String(r["kind"])}</b><StatusBadge status={r["validation"] === "validada" ? "confirmada" : "pendiente"} /></div>
      <p>{String(r["content"])}</p>
      <p className="text-xs text-muted-foreground">Fuente: {String(r["source"])} · {String(r["sensitivity"])} · {r["validation"] === "validada" ? "validada" : "sin validar (no es un dato clínico)"}</p>
      <div className="mt-2 flex gap-2">{staff && r["validation"] !== "validada" && <Btn onClick={() => void upd(r["id"], { validation: "validada" }, "Memoria validada")}>Validar</Btn>}
        <Btn variant="outline" onClick={() => { const c = window.prompt("Corregir", String(r["content"])); if (c?.trim()) void upd(r["id"], { content: c.trim(), validation: "sin_validar" }, "Corregida"); }}>Corregir</Btn>
        {!staff && <Btn variant="outline" onClick={() => void del(r["id"])}>Eliminar</Btn>}</div></Card>) : <Empty title="Sin memorias registradas" />}
  </>);
}

export function ClientDocuments() {
  const uid = useVF((s) => s.userId);
  const [files, setFiles] = useState<{ name: string }[] | null>(null);
  const [busy, setBusy] = useState(false);
  const bucket = supabase.storage.from("documentos");
  const load = async () => { if (!uid) return; const { data, error } = await bucket.list(uid); if (error) toast.error(error.message); setFiles((data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder")); };
  useEffect(() => { void load(); }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps
  const upload = async (f: File) => {
    if (f.size > 10 * 1024 * 1024) { toast.error("Máximo 10 MB"); return; }
    if (!/^(application\/pdf|image\/)/.test(f.type)) { toast.error("Solo PDF o imágenes"); return; }
    setBusy(true);
    const safe = f.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const { error } = await bucket.upload(`${uid}/${Date.now()}-${safe}`, f);
    setBusy(false); if (error) toast.error(error.message); else { toast.success("Documento guardado"); void load(); }
  };
  const open = async (name: string) => { const { data, error } = await bucket.createSignedUrl(`${uid}/${name}`, 300); if (error) toast.error(error.message); else window.open(data.signedUrl, "_blank"); };
  const remove = async (name: string) => { const { error } = await bucket.remove([`${uid}/${name}`]); if (error) toast.error(error.message); else void load(); };
  return (<><PageTitle title="Mis documentos" subtitle="Privados · solo tú y el equipo de Vet Life" />
    <Card className="mb-3"><label className="block font-bold">Subir PDF o imagen (máx. 10 MB)<input type="file" accept="application/pdf,image/*" disabled={busy || !uid} className="mt-2 block" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} /></label></Card>
    {!files ? <Loading /> : files.length ? files.map((f) => <Card key={f.name} className="mb-2 flex items-center justify-between gap-2"><span className="truncate">{f.name.replace(/^\d+-/, "")}</span>
      <span className="flex gap-2"><Btn variant="outline" onClick={() => void open(f.name)}>Ver</Btn><Btn variant="outline" onClick={() => void remove(f.name)}>Eliminar</Btn></span></Card>) : <Empty title="Aún no tienes documentos" />}</>);
}

/** Team view of private client documents (director/ops/clinical per storage policy). */
export function StaffDocuments() {
  const [folders, setFolders] = useState<string[] | null>(null);
  const [files, setFiles] = useState<Record<string, string[]>>({});
  const bucket = supabase.storage.from("documentos");
  const pets = useVF((s) => s.pets);
  useEffect(() => { void bucket.list("", { limit: 200 }).then(({ data, error }) => { if (error) toast.error(error.message); setFolders((data ?? []).map((f) => f.name)); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const open = async (folder: string) => { const { data, error } = await bucket.list(folder); if (error) toast.error(error.message); setFiles((m) => ({ ...m, [folder]: (data ?? []).map((f) => f.name).filter((n) => n !== ".emptyFolderPlaceholder") })); };
  const view = async (path: string) => { const { data, error } = await bucket.createSignedUrl(path, 300); if (error) toast.error(error.message); else window.open(data.signedUrl, "_blank"); };
  const owner = (id: string) => pets.find((p) => p.ownerId === id)?.owner ?? "Cliente " + id.slice(0, 8);
  return (<><PageTitle title="Documentos de clientes" subtitle="Acceso solo para coordinación, clínica y dirección · enlaces válidos 5 minutos" />
    {!folders ? <Loading /> : folders.length ? folders.map((f) => <Card key={f} className="mb-2"><div className="flex items-center justify-between"><b>{owner(f)}</b><Btn variant="outline" onClick={() => void open(f)}>Ver archivos</Btn></div>
      {files[f]?.map((n) => <div key={n} className="mt-2 flex items-center justify-between gap-2"><span className="truncate text-sm">{n.replace(/^\d+-/, "")}</span><Btn variant="outline" onClick={() => void view(`${f}/${n}`)}>Abrir</Btn></div>)}
      {files[f] && !files[f]!.length && <p className="mt-2 text-sm text-muted-foreground">Sin archivos</p>}</Card>) : <Empty title="Ningún cliente ha subido documentos" />}</>);
}

function ClientMemory() {
  const uid = useVF((s) => s.userId);
  return (<><PageTitle title="Lo que Vet Life recuerda de ti" subtitle="Puedes corregir o eliminar cualquier dato" />{uid ? <MemoryList clientId={uid} staff={false} /> : <Loading />}</>);
}
function StaffMemory() {
  return (<><PageTitle title="Memoria de clientes" subtitle="Valida o corrige lo que los clientes y el equipo registran" /><SectionTitle>Registros recientes</SectionTitle><MemoryList staff /></>);
}

export function p02Page(path: string): ReactNode | null {
  const p = path.replace(/\/$/, "");
  if (p === "/admin/feature-flags" || p === "/admin/sistema/modulos") return <FeatureFlags />;
  if (p === "/admin/integraciones/eventos" || p === "/admin/automatizaciones/eventos") return <EventOutbox />;
  if (p === "/admin/customer-memory" || p === "/admin/customer-memory/registros" || p === "/admin/customer-memory/verificacion" || p === "/admin/customer-memory/correcciones") return <StaffMemory />;
  if (p === "/admin/documentos-clientes" || p === "/operaciones/documentos") return <StaffDocuments />;
  if (p === "/app/memoria") return <ClientMemory />;
  if (p === "/app/documentos") return <ClientDocuments />;
  return null;
}
