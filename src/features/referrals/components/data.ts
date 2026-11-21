import { useEffect, useState } from "react";
import { db } from "@/lib/vf/db";
import { useVF } from "@/lib/vf/store";
import type { RefCase, RefState } from "../domain";
export type CaseRow = RefCase & { referral_id: string; updated_at: string };
export function useReferralRows<T>(table: string, column?: string, value?: string) {
  const uid = useVF((s) => s.userId);
  const [rows, setRows] = useState<T[] | null>(null);
  const [error, setError] = useState("");
  const reload = async () => {
    try {
      let q = db.from(table).select("*");
      if (column && value) q = q.eq(column, value);
      const result = await q;
      if (result.error) throw new Error(result.error.message);
      setRows(result.data ?? []);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar");
    }
  };
  useEffect(() => {
    let active = true;
    const fn = () => {
      if (active) void reload();
    };
    fn();
    addEventListener("vf-referral-change", fn);
    const timer = setInterval(fn, 15000);
    return () => {
      active = false;
      removeEventListener("vf-referral-change", fn);
      clearInterval(timer);
    };
  }, [table, column, value, uid]); // eslint-disable-line react-hooks/exhaustive-deps
  return { rows, error, reload };
}
export const stateOf = (row: CaseRow | undefined): RefState => row?.state ?? "PROPOSED";
