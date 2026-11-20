import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { useVF, getVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { useRecords, type Rec } from "@/components/vf/screens/records";
import { applyRef, refActions, buildOffer, validOffers, offerText, stalled, REF_LABEL, REF_TRANSITIONS, type RefCase, type RefActor, type RefState, type Offer } from "../domain";

const inp = "w-full rounded-2xl bg-accent p-3";
const isDemo = () => !!getVF().userId?.startsWith("demo-");
function useActors(): RefActor[] {
  const roles = useVF((s) => s.roles); const a: RefActor[] = [];
  if (roles.some((r) => ["veterinario", "luis", "administrador"].includes(r))) a.push("clinico");
  if (roles.some((r) => ["coordinador", "recepcion", "luis", "administrador"].includes(r))) a.push("coordinacion");
  if (roles.includes("especialista")) a.push("especialista");
  return a;
}
const caseOf = (r?: Rec): RefCase => (r ? { state: r.status as RefState, version: Number(r.data["version"] ?? 1), offers: (r.data["offers"] as Offer[]) ?? [], choice: (r.data["choice"] as string | null) ?? null, history: (r.data["history"] as RefCase["history"]) ?? [] } : { state: "PROPOSED", version: 0, offers: [], history: [] });

/** Gestión de una remisión: one state machine; updates are guarded by the previous status. */
export function ReferralCase({ id }: { id: string }) {
  const ref = useVF((s) => s.referrals.find((r) => r.id === id)); const pets = useVF((s) => s.pets); const specialists = useVF((s) => (s as unknown as { specialists?: { name: string }[] }).specialists ?? []);
  const actors = useActors(); const { rows, reload } = useRecords("referral_case", id); const choices = useRecords("referral_choice", id);
  const [ev, setEv] = useState(""); const [o, setO] = useState({ date: "", time: "", location: "", fee: "", expiresAt: "" }); const [busy, setBusy] = useState(false);
  if (!ref) return <Empty title="Remisión no encontrada" />;
  const rec = rows?.[0]; const c = caseOf(rec); const now = new Date();
  const pet = pets.find((p) => p.name === ref.pet); const ownerId = (pet as { ownerId?: string | null } | undefined)?.ownerId ?? null;
  const lastChoice = (choices.rows ?? []).find((r) => r.owner_id === ownerId)?.data["offerId"] as string | undefined;
  const save = async (next: RefCase, extra?: () => Promise<void>) => {
    if (isDemo()) { toast.success(`${REF_LABEL[next.state]} (demo, no se guarda)`); return; }
    setBusy(true);
    const data = { version: next.version, offers: next.offers, choice: next.choice ?? null, history: next.history };
    const res = rec ? await db.from("records").update({ status: next.state, data, updated_at: new Date().toISOString() }).eq("id", rec.id).eq("status", c.state).select("id")
      : await db.from("records").insert({ kind: "referral_case", scope: "staff", ref_id: id, title: `Remisión ${ref.pet} · ${ref.specialty}`, detail: "", status: next.state, data, created_by: getVF().userId }).select("id");
    if (res.error || !res.data?.length) toast.error(res.error ? res.error.message : "Otra persona cambió la remisión. Recargando.");
    else { await extra?.(); toast.success(REF_LABEL[next.state]); setEv(""); }
    setBusy(false); await reload();
  };
  const act = (k: string) => {
    const actor = actors.find((a) => REF_TRANSITIONS[k]!.actors.includes(a)) ?? actors[0] ?? "cliente";
    const r = applyRef(c, k, actor, getVF().displayName, { evidence: ev, reason: ev, choice: lastChoice ?? null, expectedVersion: c.version, now });
    if (typeof r === "string") { toast.error(r); return; }
    void save(r, k === "enviar_opciones" && ownerId ? async () => { await db.from("records").insert({ kind: "referral_offer", scope: "client", owner_id: ownerId, ref_id: id, title: `Horarios para ${ref.pet} · ${ref.specialty}`, detail: "Sujeto a confirmación del especialista", status: "enviada", data: { offers: validOffers(c.offers, now) }, created_by: getVF().userId }); } : undefined);
  };
  const addOffer = () => {
    const off = buildOffer({ date: o.date, time: o.time, location: o.location || "Por definir", ...(o.fee ? { fee: Number(o.fee) } : {}), expiresAt: o.expiresAt, subjectToConfirmation: true }, now, true);
    if (typeof off === "string") { toast.error(off); return; }
    if (c.offers.some((x) => x.id === off.id)) { toast.error("Ese horario ya está"); return; }
    const next = { ...c, offers: [...c.offers, off] };
    if (c.state === "OPTIONS_PREPARED" || c.state === "AVAILABILITY_RECEIVED") void save(c.state === "AVAILABILITY_RECEIVED" ? (applyRef(next, "preparar_opciones", "coordinacion", getVF().displayName, { expectedVersion: c.version, now }) as RefCase) : { ...next, version: c.version + 1 });
  };
  const keys = [...new Set(actors.flatMap((a) => refActions(c.state, a)))];
  void specialists;
  return (<><PageTitle title={`${ref.pet} · ${ref.specialty}`} subtitle={ref.specialist ?? "Sin especialista asignado"} />
    <Card className="mb-3"><p className="text-sm text-muted-foreground">Estado de la remisión</p><b className="text-2xl">{rows === null ? "Cargando…" : REF_LABEL[c.state]}</b>
      {c.state === "SLOT_SELECTED" || c.state === "PENDING_EXTERNAL_CONFIRMATION" ? <p className="mt-1 text-sm font-bold">Todavía no es una cita: falta la confirmación del especialista.</p> : null}</Card>
    {(c.state === "AVAILABILITY_RECEIVED" || c.state === "OPTIONS_PREPARED") && actors.includes("coordinacion") && <Card className="mb-3 space-y-2"><b>Agregar horario ofrecido</b>
      <div className="grid grid-cols-2 gap-2"><input type="date" className={inp} aria-label="Fecha" value={o.date} onChange={(e) => setO({ ...o, date: e.target.value })} /><input type="time" className={inp} aria-label="Hora" value={o.time} onChange={(e) => setO({ ...o, time: e.target.value })} /></div>
      <input className={inp} placeholder="Lugar" value={o.location} onChange={(e) => setO({ ...o, location: e.target.value })} /><input type="number" className={inp} placeholder="Tarifa informada (COP, opcional)" value={o.fee} onChange={(e) => setO({ ...o, fee: e.target.value })} />
      <label className="block text-sm">La oferta vence<input type="datetime-local" className={inp} aria-label="Vence" value={o.expiresAt} onChange={(e) => setO({ ...o, expiresAt: e.target.value })} /></label><Btn variant="outline" disabled={busy} onClick={addOffer}>Agregar horario</Btn></Card>}
    {c.offers.length > 0 && <><SectionTitle>Horarios ofrecidos</SectionTitle>{c.offers.map((x) => { const live = validOffers([x], now).length > 0; return <Card key={x.id} className={`mb-2 ${c.choice === x.id || lastChoice === x.id ? "ring-2 ring-sage-foreground" : ""}`}><p className="text-sm">{offerText(x)}</p><p className="text-xs text-muted-foreground">{live ? `Vence ${new Date(x.expiresAt).toLocaleString("es-CO")}` : "Vencida"}{lastChoice === x.id ? " · elegida por el cliente" : ""}</p></Card>; })}</>}
    {c.state === "AWAITING_CUSTOMER_SELECTION" && <p className="mb-2 text-sm">{lastChoice ? "El cliente ya eligió un horario." : "Esperando que el cliente elija en su portal."}</p>}
    <SectionTitle>Siguiente paso</SectionTitle>
    {keys.some((k) => REF_TRANSITIONS[k]!.needs === "evidence" || REF_TRANSITIONS[k]!.needs === "reason") && <textarea className={`${inp} mb-2`} placeholder="Evidencia o motivo (referencia del especialista, quién confirmó, nota de revisión…)" value={ev} onChange={(e) => setEv(e.target.value)} />}
    {keys.length ? <div className="grid gap-2">{keys.filter((k) => k !== "preparar_opciones").map((k) => <Btn key={k} disabled={busy || rows === null} variant={k === "cancelar" ? "outline" : "primary"} onClick={() => act(k)}>{REF_TRANSITIONS[k]!.label}</Btn>)}</div> : <Empty title="No hay pasos disponibles para tu rol" />}
    {c.history.length > 0 && <><SectionTitle>Historial</SectionTitle>{[...c.history].reverse().map((h, i) => <p key={i} className="text-sm">· {new Date(h.at).toLocaleString("es-CO")} — {REF_LABEL[h.to]} ({h.by}){h.note ? `: ${h.note}` : ""}</p>)}</>}</>);
}

/** Centro de remisiones: every referral with its hub state; stalled ones flagged, never auto-closed. */
export function ReferralHubList({ onlyStalled }: { onlyStalled?: boolean }) {
  const refs = useVF((s) => s.referrals); const { rows } = useRecords("referral_case"); const now = new Date();
  const list = refs.map((r) => { const rec = (rows ?? []).find((x) => x.ref_id === r.id); const state = (rec?.status as RefState | undefined) ?? "PROPOSED"; const st = stalled(state, new Date(rec?.updated_at ?? now), now); return { r, state, st }; }).filter((x) => !onlyStalled || x.st.stalled);
  return (<><PageTitle title={onlyStalled ? "Remisiones estancadas" : "Gestión de remisiones"} subtitle={onlyStalled ? "Casos esperando más de lo permitido; se gestionan, no se cierran solos" : "Estado de cada remisión de punta a punta"}>{!onlyStalled && <Link to={"/operaciones/remisiones/estancadas" as never} className="font-bold text-primary">Estancadas</Link>}</PageTitle>
    {rows === null ? <p className="text-muted-foreground">Cargando…</p> : list.length ? list.map(({ r, state, st }) => <Link key={r.id} to={`/operaciones/remisiones/${r.id}/gestion` as never} className="mb-2 block"><Card><div className="flex justify-between gap-2"><b>{r.pet} · {r.specialty}</b>{st.stalled && <span className="rounded-full bg-blush px-2 text-xs font-bold">Estancada</span>}</div><p className="text-sm">{REF_LABEL[state]}</p><p className="text-xs text-muted-foreground">{r.specialist ?? "Sin especialista"}{st.stalled ? ` · ${st.reason}` : ""}</p></Card></Link>) : <Empty title={onlyStalled ? "Ninguna remisión estancada" : "Sin remisiones"} />}</>);
}

/** Cliente: elige uno de los horarios ofrecidos (queda como respuesta; no es una cita confirmada). */
export function ClientReferralOffers() {
  const { rows } = useRecords("referral_offer"); const choices = useRecords("referral_choice"); const uid = useVF((s) => s.userId); const now = new Date();
  const pick = async (r: Rec, o: Offer) => {
    if (isDemo()) { toast.success("Elección registrada (demo)"); return; }
    const { error } = await db.from("records").insert({ kind: "referral_choice", scope: "client", owner_id: uid, ref_id: r.ref_id, title: "Horario elegido", detail: offerText(o), status: "elegido", data: { offerId: o.id }, created_by: uid });
    if (error) toast.error(error.message); else { toast.success("Elección enviada. Te avisaremos cuando el especialista confirme."); await choices.reload(); }
  };
  return (<><PageTitle title="Horarios con especialistas" subtitle="Elige uno; la cita queda confirmada solo cuando el especialista la confirma" />
    {rows === null ? <p className="text-muted-foreground">Cargando…</p> : rows.length ? rows.map((r) => { const chosen = (choices.rows ?? []).find((c) => c.ref_id === r.ref_id); const offers = validOffers((r.data["offers"] as Offer[]) ?? [], now);
      return <Card key={r.id} className="mb-3"><b>{r.title}</b>{chosen ? <p className="mt-1 text-sm">Elegiste: {chosen.detail}. <b>Pendiente de confirmación del especialista.</b></p> : offers.length ? offers.map((o) => <Btn key={o.id} variant="outline" className="mt-2 w-full justify-start text-left text-sm" onClick={() => void pick(r, o)}>{offerText(o)}</Btn>) : <p className="mt-1 text-sm text-muted-foreground">Las opciones vencieron. Coordinación te enviará nuevas.</p>}</Card>; }) : <Empty title="No tienes horarios por elegir" />}</>);
}

export function referralPage(path: string): ReactNode | null {
  const p = path.replace(/\/$/, "");
  if (p === "/operaciones/remisiones/gestion") return <ReferralHubList />;
  if (p === "/operaciones/remisiones/estancadas") return <ReferralHubList onlyStalled />;
  const m = p.match(/^\/operaciones\/remisiones\/([^/]+)\/gestion$/); if (m) return <ReferralCase id={m[1]!} />;
  if (p === "/app/remisiones/horarios" || p === "/cliente/remisiones/horarios") return <ClientReferralOffers />;
  return null;
}
