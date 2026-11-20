import { useEffect, useState } from "react";
import { db } from "@/lib/vf/db";
import { getVF } from "@/lib/vf/store";
import { enqueue, markResult, purgeExpired, type QueuedAction, type ActionKind } from "../domain";
const KEY = "vf-offline-queue";
const read = (): QueuedAction[] => { try { return purgeExpired(JSON.parse(localStorage.getItem(KEY) ?? "[]"), Date.now()); } catch { return []; } };
const write = (q: QueuedAction[]) => { localStorage.setItem(KEY, JSON.stringify(q)); dispatchEvent(new Event("vf-queue")); };
/** Sends one queued action. Only offline-allowed kinds are ever queued; they become records rows. */
async function send(a: QueuedAction): Promise<boolean> {
  if (getVF().userId?.startsWith("demo-")) return true;
  const { error } = await db.from("records").insert({ kind: a.kind === "nota_administrativa" ? "nota_campo" : a.kind, scope: "staff", ref_id: (a.payload["visitId"] as string) ?? null, title: String(a.payload["title"] ?? "Nota de campo"), detail: String(a.payload["text"] ?? ""), status: "recibido", data: { idempotencyKey: a.key, capturedAt: new Date(a.capturedAt).toISOString() }, created_by: getVF().userId });
  return !error || /duplicate/i.test(error.message);
}
export async function flushQueue() {
  if (!navigator.onLine) return;
  let q = read();
  for (const a of q.filter((x) => x.state !== "SYNC_CONFIRMED")) q = markResult(q, a.key, await send(a), Date.now());
  write(q);
}
export function queueAction(kind: ActionKind, key: string, payload: Record<string, unknown>): string | null {
  const r = enqueue(read(), { key, kind, payload, capturedAt: Date.now() }, navigator.onLine);
  if (r.error) return r.error; write(r.queue); void flushQueue(); return null;
}
export function useOfflineQueue() {
  const [q, setQ] = useState<QueuedAction[]>([]);
  useEffect(() => { const up = () => setQ(read()); up(); const on = () => void flushQueue(); addEventListener("vf-queue", up); addEventListener("online", on); void flushQueue(); return () => { removeEventListener("vf-queue", up); removeEventListener("online", on); }; }, []);
  return q;
}
