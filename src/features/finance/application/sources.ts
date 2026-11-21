import { useEffect, useState } from "react";
import { db } from "@/lib/vf/db";
import { useVF } from "@/lib/vf/store";

export type Charge = {
  id: string;
  client_id: string | null;
  client: string;
  concept: string;
  amount: number | string;
  status: string;
  date: string;
};
export type RecordRow = {
  id: string;
  kind: string;
  ref_id: string | null;
  title: string;
  detail: string;
  scope: string;
  status: string;
  data: Record<string, unknown>;
  created_at: string;
};
export type ArticleRow = {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  version: number;
  valid_until: string | null;
  reviewed_at: string | null;
};
export const label = (value: unknown) => (typeof value === "string" ? value : "");

export function useFinanceRows<T>(table: string, kind?: string) {
  const uid = useVF((s) => s.userId);
  const roleKey = useVF((s) => s.roles.join(","));
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    owner: string;
    rows: T[] | null;
    error: string;
    loadedAt: string | null;
  }>({ owner: "", rows: null, error: "", loadedAt: null });
  const owner = `${uid ?? ""}:${roleKey}:${table}:${kind ?? ""}`;
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (!uid) return;
        let query = db.from(table).select("*");
        if (kind) query = query.eq("kind", kind);
        const response = await query;
        if (response.error) throw new Error(response.error.message);
        if (active)
          setResult({
            owner,
            rows: response.data ?? [],
            error: "",
            loadedAt: new Date().toISOString(),
          });
      } catch (error) {
        if (active)
          setResult({
            owner,
            rows: null,
            error: error instanceof Error ? error.message : "No se pudieron consultar las fuentes",
            loadedAt: null,
          });
      }
    };
    void load();
    const timer = setInterval(() => void load(), 15000);
    const fieldSource = table === "visits" || table === "visit_executions";
    const change = () => void load();
    const channel = fieldSource ? new BroadcastChannel("vf-field-change") : null;
    if (channel) channel.onmessage = change;
    if (fieldSource) addEventListener("vf-field-change", change);
    return () => {
      active = false;
      clearInterval(timer);
      channel?.close();
      if (fieldSource) removeEventListener("vf-field-change", change);
    };
  }, [uid, table, kind, owner, revision]);
  const visible = result.owner === owner ? result : { rows: null, error: "", loadedAt: null };
  return {
    ...visible,
    reload: async () => {
      setRevision((v) => v + 1);
    },
  };
}
export function useFinanceData() {
  const roles = useVF((s) => s.roles);
  const payments = useFinanceRows<Charge>("payments");
  const records = useFinanceRows<RecordRow>("records");
  return { payments, records, director: roles.some((r) => r === "luis" || r === "administrador") };
}
