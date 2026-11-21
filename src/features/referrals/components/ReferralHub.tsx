import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { useVF, getVF } from "@/lib/vf/store";
import { canProvideClinicalCare } from "@/lib/vf/roles";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import {
  applyRef,
  refActions,
  buildOffer,
  validOffers,
  offerText,
  stalled,
  REF_LABEL,
  REF_TRANSITIONS,
  type RefCase,
  type RefActor,
  type RefState,
  type Offer,
} from "../domain";
import { pendingActions, parseConfirmation, credentialStatus } from "../domain/advanced";
import { checkedWrite } from "../application/gateway";
import {
  SpecialistDirectory,
  SpecialistProfilePage,
  referralBase,
  useDirectoryData,
} from "./Directory";
import { ReferralWizard, ReferralContinuity, ExternalAppointment } from "./Workflow";
import { ReferralDocuments, ReferralBudget } from "./SupportingPages";
import { useReferralRows, type CaseRow } from "./data";
const input = "w-full min-w-0 rounded-2xl border border-border bg-card p-3";
function useActors(): RefActor[] {
  const roles = useVF((s) => s.roles);
  const a: RefActor[] = [];
  if (canProvideClinicalCare(roles)) a.push("clinico");
  if (roles.some((r) => ["coordinador", "recepcion", "luis", "administrador"].includes(r)))
    a.push("coordinacion");
  return a;
}
const caseOf = (r?: RefCase): RefCase =>
  r ?? { state: "PROPOSED", version: 0, offers: [], history: [] };
export function ReferralCase({ id }: { id: string }) {
  const ref = useVF((s) => s.referrals.find((r) => r.id === id));
  const specs = useVF((s) => s.specialists);
  const roles = useVF((s) => s.roles);
  const base = referralBase(roles);
  const actors = useActors();
  const cases = useReferralRows<CaseRow>("referral_cases", "referral_id", id);
  const choices = useReferralRows<{ offer_id: string; created_at: string }>(
    "referral_choices",
    "referral_id",
    id,
  );
  const reminders = useReferralRows<{ status: string }>("referral_reminders", "referral_id", id);
  const directory = useDirectoryData();
  const [ev, setEv] = useState("");
  const [o, setO] = useState({ date: "", time: "", location: "", fee: "", expiresAt: "" });
  const [busy, setBusy] = useState(false);
  const [demoCase, setDemoCase] = useState<RefCase | null>(null);
  if (!ref) return <Empty title="Remisión no encontrada" />;
  const rec = cases.rows?.[0];
  const c = caseOf(demoCase ?? rec);
  const now = new Date();
  const lastChoice = [...(choices.rows ?? [])].sort((a, b) =>
    b.created_at.localeCompare(a.created_at),
  )[0]?.offer_id;
  const save = async (next: RefCase) => {
    setBusy(true);
    try {
      if (getVF().userId?.startsWith("demo-")) {
        setDemoCase(next);
        toast.success(`${REF_LABEL[next.state]} · demostración`);
        return;
      }
      const body = {
        state: next.state,
        version: rec ? next.version : 1,
        offers: next.offers,
        choice: next.choice ?? null,
        history: next.history,
      };
      await checkedWrite(
        rec
          ? db
              .from("referral_cases")
              .update(body)
              .eq("referral_id", id)
              .eq("version", c.version)
              .select("referral_id")
          : db
              .from("referral_cases")
              .insert({ referral_id: id, ...body })
              .select("referral_id"),
      );
      setEv("");
      await cases.reload();
      toast.success(REF_LABEL[next.state]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
      await cases.reload();
    } finally {
      setBusy(false);
    }
  };
  const act = (key: string) => {
    const transition = REF_TRANSITIONS[key];
    if (!transition) return;
    const actor = actors.find((a) => transition.actors.includes(a));
    if (!actor) return;
    const next = applyRef(c, key, actor, getVF().displayName, {
      evidence: ev,
      reason: ev,
      choice: lastChoice ?? null,
      expectedVersion: c.version,
      now,
    });
    if (typeof next === "string") toast.error(next);
    else void save(next);
  };
  const addOffer = () => {
    const s = specs.find((x) => x.name === ref.specialist);
    if (!s) {
      toast.error("Asigna un especialista antes de ofrecer horarios");
      return;
    }
    const profile = directory.profiles[s.id];
    const status = profile ? credentialStatus(profile.credential, now) : "NOT_SUBMITTED";
    if (["SUSPENDED", "REJECTED", "EXPIRED"].includes(status)) {
      toast.error("El especialista no tiene habilitación vigente para ofrecer este horario");
      return;
    }
    const off = buildOffer(
      {
        date: o.date,
        time: o.time,
        location: o.location,
        ...(o.fee ? { fee: Number(o.fee) } : {}),
        expiresAt: o.expiresAt ? `${o.expiresAt}:00-05:00` : "",
        subjectToConfirmation: true,
      },
      now,
      true,
    );
    if (typeof off === "string") {
      toast.error(off);
      return;
    }
    if (c.offers.some((x) => x.id === off.id)) {
      toast.error("Ese horario ya existe");
      return;
    }
    const next = { ...c, offers: [...c.offers, off] };
    if (c.state === "AVAILABILITY_RECEIVED") {
      const prepared = applyRef(next, "preparar_opciones", "coordinacion", getVF().displayName, {
        expectedVersion: c.version,
        now,
      });
      if (typeof prepared === "string") toast.error(prepared);
      else void save(prepared);
    } else void save({ ...next, version: c.version + 1 });
  };
  const keys = [...new Set(actors.flatMap((a) => refActions(c.state, a)))].filter(
    (k) => k !== "preparar_opciones" && k !== "confirmar_externa",
  );
  const pending = reminders.rows?.filter((r) => r.status === "pendiente").length ?? 0;
  return (
    <>
      <PageTitle
        title={`${ref.pet} · ${ref.specialty}`}
        subtitle={ref.specialist ?? "Sin especialista asignado"}
      />
      <nav className="mb-4 flex flex-wrap gap-3 text-sm font-bold text-primary">
        {[
          ["continuidad", "Compromisos"],
          ["cita-externa", "Cita externa"],
          ["presupuesto", "Presupuesto"],
          ["documentos", "Documentos"],
        ].map(([path, label]) => (
          <Link key={path} to={`${base}/remisiones/${id}/${path}` as never}>
            {label}
          </Link>
        ))}
      </nav>
      {cases.error && <p role="alert">{cases.error}</p>}
      <p className="text-xl font-bold">{cases.rows === null ? "Cargando…" : REF_LABEL[c.state]}</p>
      <p className="mb-4 text-sm">Siguiente acción: {pendingActions(c.state)}</p>
      {actors.includes("coordinacion") && (
        <label className="mb-4 block text-sm">
          Especialista asignado
          <select
            className={input}
            aria-label="Especialista asignado"
            value={ref.specialist ?? ""}
            disabled={
              busy ||
              [
                "APPOINTMENT_CONFIRMED",
                "ATTENDANCE_RECORDED",
                "REPORT_RECEIVED",
                "REFERRAL_CLOSED",
              ].includes(c.state)
            }
            onChange={async (e) => {
              setBusy(true);
              try {
                if (getVF().userId?.startsWith("demo-")) {
                  toast.success("Asignación de demostración");
                  return;
                }
                await checkedWrite(
                  db
                    .from("referrals")
                    .update({ specialist: e.target.value || null })
                    .eq("id", id)
                    .select("id"),
                );
                const { refreshVF } = await import("@/lib/vf/store");
                await refreshVF();
                toast.success("Especialista asignado; la cita no está confirmada");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "No se pudo asignar");
              } finally {
                setBusy(false);
              }
            }}
          >
            <option value="">Sin asignar</option>
            {specs
              .filter((s) => s.specialty === ref.specialty)
              .map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
          </select>
        </label>
      )}
      {["AVAILABILITY_RECEIVED", "OPTIONS_PREPARED"].includes(c.state) &&
        actors.includes("coordinacion") && (
          <div className="mb-4 space-y-3">
            <SectionTitle>Agregar horario informado</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <input
                className={input}
                type="date"
                aria-label="Fecha"
                value={o.date}
                onChange={(e) => setO({ ...o, date: e.target.value })}
              />
              <input
                className={input}
                type="time"
                aria-label="Hora"
                value={o.time}
                onChange={(e) => setO({ ...o, time: e.target.value })}
              />
            </div>
            <input
              className={input}
              placeholder="Lugar"
              aria-label="Lugar"
              value={o.location}
              onChange={(e) => setO({ ...o, location: e.target.value })}
            />
            <input
              type="number"
              className={input}
              placeholder="Tarifa informada COP (opcional)"
              value={o.fee}
              onChange={(e) => setO({ ...o, fee: e.target.value })}
            />
            <label className="block text-sm">
              Vigencia de la oferta
              <input
                type="datetime-local"
                className={input}
                aria-label="Vence"
                value={o.expiresAt}
                onChange={(e) => setO({ ...o, expiresAt: e.target.value })}
              />
            </label>
            <Btn disabled={busy} variant="outline" onClick={addOffer}>
              Agregar horario
            </Btn>
          </div>
        )}
      {!!c.offers.length && (
        <>
          <SectionTitle>Horarios ofrecidos</SectionTitle>
          {c.offers.map((x) => (
            <Card key={x.id} className="mb-2">
              <p className="text-sm">{offerText(x)}</p>
              <p className="text-xs text-muted-foreground">
                {validOffers([x], now).length ? "Vigente" : "Vencida"}
                {lastChoice === x.id ? " · elegida por el propietario" : ""}
              </p>
            </Card>
          ))}
        </>
      )}
      <SectionTitle>Siguiente paso</SectionTitle>
      {keys.some((k) => ["evidence", "reason"].includes(REF_TRANSITIONS[k]?.needs ?? "")) && (
        <textarea
          className={`${input} mb-2`}
          aria-label="Evidencia o motivo"
          placeholder="Evidencia o motivo"
          value={ev}
          onChange={(e) => setEv(e.target.value)}
        />
      )}
      <div className="grid gap-2">
        {keys.map((k) => (
          <Btn
            key={k}
            disabled={
              busy ||
              cases.rows === null ||
              (k === "cerrar" && (reminders.rows === null || pending > 0))
            }
            variant={k === "cancelar" ? "outline" : "primary"}
            onClick={() => act(k)}
          >
            {k === "enviar_opciones" ? "Publicar opciones en el portal" : REF_TRANSITIONS[k]?.label}
          </Btn>
        ))}
      </div>
      {pending > 0 && (
        <p className="mt-2 text-sm font-bold">{pending} compromisos pendientes de continuidad</p>
      )}
      {c.state === "PENDING_EXTERNAL_CONFIRMATION" && (
        <Link
          className="mt-3 block font-bold text-primary"
          to={`${base}/remisiones/${id}/cita-externa` as never}
        >
          Registrar confirmación con evidencia
        </Link>
      )}
      {!!c.history.length && (
        <>
          <SectionTitle>Historial</SectionTitle>
          {[...c.history].reverse().map((h, i) => {
            const confirmation = parseConfirmation(h.note);
            return (
              <p key={i} className="mb-2 text-sm">
                {new Date(h.at).toLocaleString("es-CO", { timeZone: "America/Bogota" })} ·{" "}
                {REF_LABEL[h.to]} · {h.by}
                {confirmation
                  ? ` · ${confirmation.date} ${confirmation.time}, ${confirmation.location}; referencia ${confirmation.reference}`
                  : h.note
                    ? `: ${h.note}`
                    : ""}
              </p>
            );
          })}
        </>
      )}
    </>
  );
}
export function ReferralHubList({
  onlyStalled = false,
  onlyResults = false,
}: {
  onlyStalled?: boolean;
  onlyResults?: boolean;
}) {
  const refs = useVF((s) => s.referrals);
  const roles = useVF((s) => s.roles);
  const cases = useReferralRows<CaseRow>("referral_cases");
  const drafts = useReferralRows<{ ref_id: string; data: { assignee?: string } }>(
    "records",
    "kind",
    "referral_draft",
  );
  const reminders = useReferralRows<{ status: string; due_at: string }>("referral_reminders");
  const base = referralBase(roles);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("");
  const now = new Date();
  const list = refs
    .map((r) => {
      const rec = cases.rows?.find((c) => c.referral_id === r.id);
      const status = rec?.state ?? "PROPOSED";
      const st = stalled(status, new Date(rec?.updated_at ?? now), now);
      return {
        r,
        status,
        st,
        assignee: drafts.rows?.find((d) => d.ref_id === r.id)?.data.assignee,
      };
    })
    .filter(
      (x) =>
        (!onlyStalled || x.st.stalled) &&
        (!onlyResults ||
          ["REPORT_PENDING", "REPORT_RECEIVED", "PROFESSIONAL_REVIEW_PENDING"].includes(
            x.status,
          )) &&
        (!state || x.status === state) &&
        `${x.r.pet} ${x.r.specialty} ${x.r.specialist ?? ""} ${x.assignee ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => Number(b.st.stalled) - Number(a.st.stalled));
  return (
    <>
      <PageTitle
        title={
          onlyStalled
            ? "Remisiones estancadas"
            : onlyResults
              ? "Resultados y revisiones pendientes"
              : "Centro de especialistas y remisiones"
        }
      />
      <nav className="mb-4 flex flex-wrap gap-3 font-bold text-primary">
        <Link to={`${base}/remisiones/nueva` as never}>Nueva remisión</Link>
        <Link to={`${base}/especialistas` as never}>Directorio</Link>
        <Link to={`${base}/remisiones/estancadas` as never}>Estancadas</Link>
        <Link to={`${base}/resultados-pendientes` as never}>Resultados pendientes</Link>
      </nav>
      <div className="mb-4 border-y border-border py-3 text-sm">
        {refs.length} remisiones ·{" "}
        {cases.rows?.filter((c) => c.state === "PENDING_CLINICAL_APPROVAL").length ?? 0}{" "}
        aprobaciones clínicas ·{" "}
        {reminders.rows?.filter((r) => r.status === "pendiente" && Date.parse(r.due_at) < +now)
          .length ?? 0}{" "}
        compromisos vencidos
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <input
          className={input}
          aria-label="Buscar remisión"
          placeholder="Paciente, especialista o responsable"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={input}
          aria-label="Estado de remisión"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(REF_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {cases.error ? (
        <p role="alert">{cases.error}</p>
      ) : cases.rows === null ? (
        <p>Cargando…</p>
      ) : list.length ? (
        list.map(({ r, status, st, assignee }) => (
          <Link
            key={r.id}
            className="mb-3 block"
            to={`${base}/remisiones/${r.id}/gestion` as never}
          >
            <Card>
              <b>
                {r.pet} · {r.specialty}
              </b>
              <p>{REF_LABEL[status]}</p>
              <p className="text-sm">
                {r.specialist ?? "Sin especialista"} · {assignee ?? "Coordinación sin asignar"}
              </p>
              <p className="text-sm text-muted-foreground">{pendingActions(status)}</p>
              {st.stalled && <p className="text-sm font-bold text-primary">{st.reason}</p>}
            </Card>
          </Link>
        ))
      ) : (
        <Empty title="Sin remisiones que coincidan" />
      )}
    </>
  );
}
type MyOffer = {
  referral_id: string;
  pet: string;
  specialty: string;
  offers: Offer[];
  chosen: string | null;
};
export function ClientReferralOffers({ id }: { id?: string }) {
  const [rows, setRows] = useState<MyOffer[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    const result = await db.rpc("my_referral_offers");
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setRows(result.data ?? []);
  };
  // Lazy reader component keeps the protected RPC within the client area.
  return (
    <>
      <ClientOfferLoader load={load} />
      <PageTitle title="Horarios con especialistas" />
      <p className="mb-4">
        Tu elección se envía a coordinación. La cita requiere confirmación del especialista.
      </p>
      {error && <p role="alert">{error}</p>}
      {rows === null ? (
        <p>Cargando…</p>
      ) : (
        rows
          .filter((r) => !id || r.referral_id === id)
          .map((r) => (
            <Card key={r.referral_id} className="mb-3">
              <b>
                {r.pet} · {r.specialty}
              </b>
              {r.chosen ? (
                <p className="mt-2">
                  Elección registrada. Esperamos confirmación del especialista.
                </p>
              ) : (
                validOffers(r.offers, new Date()).map((o) => (
                  <Btn
                    className="mt-2 w-full whitespace-normal text-left text-sm"
                    variant="outline"
                    key={o.id}
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        if (getVF().userId?.startsWith("demo-")) {
                          setRows(
                            (old) =>
                              old?.map((x) =>
                                x.referral_id === r.referral_id ? { ...x, chosen: o.id } : x,
                              ) ?? null,
                          );
                          return;
                        }
                        await checkedWrite(
                          db
                            .from("referral_choices")
                            .insert({ referral_id: r.referral_id, offer_id: o.id })
                            .select("id"),
                        );
                        await load();
                        toast.success("Elección registrada; falta confirmar la cita");
                      } catch (e) {
                        toast.error(
                          e instanceof Error ? e.message : "Ese horario ya no está disponible",
                        );
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {offerText(o)}
                  </Btn>
                ))
              )}
              {!r.chosen && !validOffers(r.offers, new Date()).length && (
                <p>Las opciones vencieron; solicita nuevas fechas a coordinación.</p>
              )}
            </Card>
          ))
      )}
      {rows?.length === 0 && <Empty title="No tienes horarios por elegir" />}
      <Link className="font-bold text-primary" to="/app/$" params={{ _splat: "ayuda" }}>
        Solicitar ayuda u otra fecha
      </Link>
    </>
  );
}
import { useEffect } from "react";
function ClientOfferLoader({ load }: { load: () => Promise<void> }) {
  useEffect(() => {
    void load();
  }, []);
  return null;
} // eslint-disable-line react-hooks/exhaustive-deps
export function referralPage(path: string): ReactNode | null {
  const p = path.replace(/\/$/, "");
  const root = p.match(
    /^\/(operaciones|direccion|equipo|coordinacion)\/(remisiones|especialistas)(?:\/(.*))?$/,
  );
  if (root) {
    const section = root[2];
    const [id, tab, extra] = (root[3] ?? "").split("/");
    if (section === "especialistas") {
      if (!id) return <SpecialistDirectory />;
      if (["respaldo", "comparador"].includes(id)) return <SpecialistDirectory comparison />;
      if (id === "convenios") return null;
      return <SpecialistProfilePage id={id} initialTab={tab ?? "resumen"} />;
    }
    if (!id || id === "gestion") return <ReferralHubList />;
    if (id === "nueva") return <ReferralWizard />;
    if (id === "estancadas") return <ReferralHubList onlyStalled />;
    if (tab === "continuidad") return <ReferralContinuity id={id} />;
    if (tab === "presupuesto") return <ReferralBudget id={id} />;
    if (tab === "documentos" || tab === "autorizaciones")
      return <ReferralDocuments id={id} sharing={extra === "compartir"} />;
    if (tab === "cita-externa" || tab === "confirmacion") return <ExternalAppointment id={id} />;
    return <ReferralCase id={id} />;
  }
  if (/^\/(operaciones|direccion|equipo)\/resultados-pendientes$/.test(p))
    return <ReferralHubList onlyResults />;
  const customer = p.match(/^\/(app|cliente)\/remisiones\/(?:horarios|([^/]+)\/seleccionar)$/);
  if (customer)
    return customer[2] ? <ClientReferralOffers id={customer[2]} /> : <ClientReferralOffers />;
  return null;
}
