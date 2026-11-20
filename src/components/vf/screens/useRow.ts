import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { getVF } from "@/lib/vf/store";

type Json = Record<string, unknown>;
/** Own client_settings row (preferences, consents, addresses), created on first save. */
export function useClientSettings() {
  const [row, setRow] = useState<{ preferences: Json; consents: Json; addresses: { label: string; address: string; zone: string }[] } | null>(null);
  useEffect(() => {
    const uid = getVF().userId; if (!uid) { setRow({ preferences: {}, consents: {}, addresses: [] }); return; }
    void db.from("client_settings").select("*").eq("user_id", uid).maybeSingle().then(({ data }: { data: typeof row }) => setRow(data ?? { preferences: {}, consents: {}, addresses: [] }));
  }, []);
  const save = async (patch: Partial<NonNullable<typeof row>>) => {
    const next = { ...(row ?? { preferences: {}, consents: {}, addresses: [] }), ...patch };
    setRow(next);
    const { error } = await db.from("client_settings").upsert({ user_id: getVF().userId, ...next, updated_at: new Date().toISOString() });
    if (error) toast.error("No se pudo guardar: " + error.message); else toast.success("Guardado");
  };
  return { row, save };
}

/** Organization setting stored as key → { label: value } in org_settings. */
export function useOrgSetting(key: string) {
  const [value, setValue] = useState<Record<string, string> | null>(null);
  useEffect(() => { void db.from("org_settings").select("value").eq("key", key).maybeSingle().then(({ data }: { data: { value: Record<string, string> } | null }) => setValue(data?.value ?? {})); }, [key]);
  const save = async (v: Record<string, string>) => {
    setValue(v);
    const { error } = await db.from("org_settings").upsert({ key, value: v, updated_by: getVF().userId, updated_at: new Date().toISOString() });
    if (error) toast.error("No se pudo guardar: " + error.message); else toast.success("Configuración guardada");
  };
  return { value, save };
}

/** Live rows of one table (RLS applies), with reload. */
export function useRows<T = Record<string, unknown>>(table: string, order = "created_at") {
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = async () => {
    const { data, error: e } = await db.from(table).select("*").order(order);
    if (e) setError(e.message); else setRows((data ?? []) as T[]);
  };
  useEffect(() => { void reload(); }, [table]);
  const run = async (p: PromiseLike<{ error: { message: string } | null }>, ok: string) => {
    const { error: e } = await p; if (e) toast.error("No se pudo guardar: " + e.message); else { toast.success(ok); await reload(); }
  };
  return { rows, error, reload, run };
}
