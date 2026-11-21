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

export function useFinanceRows<T>(table: string) {
  const uid = useVF((s) => s.userId);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{
    owner: string | null;
    rows: T[] | null;
    error: string;
    loadedAt: string | null;
  }>({ owner: null, rows: null, error: "", loadedAt: null });
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await db.from(table).select("*");
        if (response.error) throw new Error(response.error.message);
        if (active)
          setResult({
            owner: uid,
            rows: response.data ?? [],
            error: "",
            loadedAt: new Date().toISOString(),
          });
      } catch (error) {
        if (active)
          setResult({
            owner: uid,
            rows: null,
            error: error instanceof Error ? error.message : "No se pudieron consultar las fuentes",
            loadedAt: null,
          });
      }
    };
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [uid, table, revision]);
  const visible = result.owner === uid ? result : { rows: null, error: "", loadedAt: null };
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
