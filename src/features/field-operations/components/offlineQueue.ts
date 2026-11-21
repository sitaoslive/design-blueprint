import { useEffect, useState } from "react";
import { db } from "@/lib/vf/db";
import { getVF, useVF } from "@/lib/vf/store";
import { enqueue, markResult, purgeExpired, offlineStorageKey, type QueuedAction, type ActionKind } from "../domain";
const read = (owner: string): QueuedAction[] => {
  localStorage.removeItem("vf-offline-queue"); // Legacy drafts had no owner; never replay them as another user.
  const key = offlineStorageKey(owner);
  try { const q = purgeExpired(JSON.parse(localStorage.getItem(key) ?? "[]"), Date.now()); localStorage.setItem(key, JSON.stringify(q)); return q; }
  catch { localStorage.removeItem(key); return []; }
};
const write = (owner: string, q: QueuedAction[]) => { localStorage.setItem(offlineStorageKey(owner), JSON.stringify(purgeExpired(q, Date.now()))); dispatchEvent(new Event("vf-queue")); };
/** Sends one queued action. Only offline-allowed kinds are ever queued; they become records rows. */
async function send(a: QueuedAction, owner: string): Promise<boolean> {
  if (getVF().userId !== owner) return false;
  if (getVF().userId?.startsWith("demo-")) return true;
  const { data: prior } = await db.from("records").select("id").contains("data", { idempotencyKey: a.key }).limit(1);
  if (prior?.length) return true;
  if (getVF().userId !== owner) return false;
  const { error } = await db.from("records").insert({ kind: a.kind === "nota_administrativa" ? "nota_campo" : a.kind, scope: "staff", ref_id: (a.payload["visitId"] as string) ?? null, title: String(a.payload["title"] ?? "Nota de campo"), detail: String(a.payload["text"] ?? ""), status: "recibido", data: { idempotencyKey: a.key, capturedAt: new Date(a.capturedAt).toISOString() }, created_by: owner });
  if (!error) return true;
  if (/duplicate/i.test(error.message)) {
    const { data } = await db.from("records").select("id").contains("data", { idempotencyKey: a.key }).limit(1);
    return !!data?.length;
  }
  return false;
}
let flushing: Promise<void> | null = null;
/** Single in-flight flush: concurrent triggers (online event, new action, page mount) share it. */
export function flushQueue(): Promise<void> { if (!flushing) flushing = doFlush().finally(() => { flushing = null; }); return flushing; }
async function doFlush() {
  if (!navigator.onLine) return;
  const owner = getVF().userId; if (!owner) return;
  let q = read(owner);
  for (const a of q.filter((x) => x.state !== "SYNC_CONFIRMED")) {
    if (getVF().userId !== owner) break;
    q = markResult(q, a.key, await send(a, owner), Date.now());
  }
  const results = new Map(q.map((a) => [a.key, a]));
  write(owner, read(owner).map((a) => results.get(a.key) ?? a));
  if (navigator.onLine && getVF().userId === owner && read(owner).some((a) => a.state !== "SYNC_CONFIRMED" && !results.has(a.key))) await doFlush();
}
export function queueAction(kind: ActionKind, key: string, payload: Record<string, unknown>): string | null {
  const owner = getVF().userId; if (!owner) return "Inicia sesión antes de guardar una nota";
  const r = enqueue(read(owner), { key: `${owner}:${key}`, kind, payload, capturedAt: Date.now() }, navigator.onLine);
  if (r.error) return r.error; write(owner, r.queue); void flushQueue(); return null;
}
export function useOfflineQueue() {
  const owner = useVF((s) => s.userId);
  const [q, setQ] = useState<QueuedAction[]>([]);
  useEffect(() => { const up = () => { const owner = getVF().userId; setQ(owner ? read(owner) : []); }; up(); const on = () => void flushQueue(); addEventListener("vf-queue", up); addEventListener("online", on); void flushQueue(); return () => { removeEventListener("vf-queue", up); removeEventListener("online", on); }; }, [owner]);
  return q;
}
