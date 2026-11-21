import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { getVF, refreshVF } from "@/lib/vf/store";

export const fieldDemo = () => !!getVF().userId?.startsWith("demo-");
export function announceFieldChange() { window.dispatchEvent(new Event("vf-field-change")); const channel = new BroadcastChannel("vf-field-change"); channel.postMessage("refresh"); channel.close(); }
export function useFieldRows<T>(table: string) {
  const [rows, setRows] = useState<T[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const load = async () => { const { data, error: e } = await db.from(table).select("*"); if (e) setError(e.message); else { setError(""); setRows(data ?? []); } setLoading(false); };
  useEffect(() => {
    void load(); const change = () => void load(); const channel = new BroadcastChannel("vf-field-change"); channel.onmessage = change;
    addEventListener("vf-field-change", change); addEventListener("focus", change); const timer = setInterval(change, 15000);
    return () => { channel.close(); removeEventListener("vf-field-change", change); removeEventListener("focus", change); clearInterval(timer); };
  }, [table]); // eslint-disable-line react-hooks/exhaustive-deps
  return { rows, setRows, load, loading, error };
}
export async function fieldWrite(query: PromiseLike<{ data?: unknown; error: { message: string } | null }>) {
  if (!navigator.onLine) { toast.error("Requiere conexión para guardar este cambio"); return false; }
  try { const { data, error } = await query; if (error || (Array.isArray(data) && !data.length)) { toast.error(error?.message ?? "El registro cambió o no tienes acceso; recarga"); return false; } await refreshVF(); announceFieldChange(); return true; }
  catch { toast.error("No se pudo guardar; conserva tus datos e inténtalo de nuevo"); return false; }
}
export async function uploadFieldEvidence(file: File, context: { visitId?: string; taskId?: string; toStaff?: string }) {
  if (!navigator.onLine || fieldDemo()) throw new Error("Los archivos privados requieren una sesión real y conexión");
  const owner = getVF().userId; if (!owner) throw new Error("Inicia sesión");
  if (!file.size || file.size > 10485760 || !["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Adjunta un PDF o una imagen de hasta 10 MB");
  const path = `${owner}/${crypto.randomUUID()}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error } = await db.storage.from("field-evidence").upload(path, file, { contentType: file.type }); if (error) throw new Error(error.message);
  const { error: metaError } = await db.from("field_files").insert({ path, user_id: owner, visit_id: context.visitId ?? null, task_id: context.taskId ?? null, to_staff: context.toStaff ?? null, name: file.name, mime: file.type, size_bytes: file.size });
  if (metaError) { await db.storage.from("field-evidence").remove([path]); throw new Error(metaError.message); } return path;
}
export async function openFieldEvidence(path: string) {
  const { data, error } = await db.storage.from("field-evidence").createSignedUrl(path, 300);
  if (error || !data?.signedUrl) { toast.error("No se pudo abrir el archivo"); return; }
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}