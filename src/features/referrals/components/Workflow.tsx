import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Save, CalendarPlus } from "lucide-react";
import { db } from "@/lib/vf/db";
import { useVF, getVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import {
  DraftSchema,
  validateConfirmation,
  confirmationNote,
  parseConfirmation,
  pendingActions,
  type BookingConfirmation,
  type ReferralDraft,
} from "../domain/advanced";
import { applyRef, type RefCase } from "../domain";
import { checkedWrite, createReferralDraft, announceReferralChange } from "../application/gateway";
import { referralBase } from "./Directory";
import { useReferralRows, type CaseRow } from "./data";
const input = "w-full min-w-0 rounded-2xl border border-border bg-card p-3";
const steps = [
  "Paciente",
  "Especialidad",
  "Indicación profesional",
  "Tipo de atención",
  "Preferencias",
  "Documentos",
  "Coordinación",
  "Revisión",
];
export function ReferralWizard() {
  const pets = useVF((s) => s.pets);
  const visits = useVF((s) => s.visits);
  const specs = useVF((s) => s.specialists);
  const roles = useVF((s) => s.roles);
  const staff = useVF((s) => s.staff);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState("");
  const [f, setF] = useState<ReferralDraft>({
    petId: "",
    visitId: "",
    specialty: "",
    okvetRef: "",
    modality: "Externo",
    preferredSpecialist: "",
    preferences: "",
    documents: "",
    assignee: "",
    dueAt: "",
    nextAction: "Solicitar aprobación clínica",
  });
  const uid = useVF((s) => s.userId);
  const [draftReady, setDraftReady] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const key = `vf-referral-wizard:${uid}:${q.get("visita") ?? q.get("paciente") ?? "new"}`;
    const visit = visits.find((v) => v.id === q.get("visita"));
    let restored = false;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const value = JSON.parse(raw);
        if (
          value.savedAt > Date.now() - 86400000 &&
          typeof value.step === "number" &&
          value.step >= 0 &&
          value.step <= 7
        ) {
          setF((s) => ({ ...s, ...value.fields }));
          setStep(value.step);
          restored = true;
        }
      }
    } catch {}
    if (!restored)
      setF((s) => ({
        ...s,
        petId: visit?.petId ?? q.get("paciente") ?? "",
        visitId: visit?.id ?? "",
        preferredSpecialist: q.get("especialista") ?? "",
      }));
    setDraftReady(true);
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!draftReady) return;
    const q = new URLSearchParams(window.location.search);
    const key = `vf-referral-wizard:${uid}:${q.get("visita") ?? q.get("paciente") ?? "new"}`;
    if (created) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify({ fields: f, step, savedAt: Date.now() }));
  }, [uid, draftReady, f, step, created]);
  const selected = pets.find((p) => p.id === f.petId);
  const base = referralBase(roles);
  const field = (key: keyof ReferralDraft, label: string, type = "text") => (
    <label className="block text-sm">
      {label}
      <input
        className={input}
        type={type}
        aria-label={label}
        value={key === "dueAt" ? f.dueAt.slice(0, 16) : f[key]}
        onChange={(e) =>
          setF({
            ...f,
            [key]:
              key === "dueAt" && e.target.value ? `${e.target.value}:00-05:00` : e.target.value,
          })
        }
      />
    </label>
  );
  const submit = async () => {
    const parsed = DraftSchema.safeParse(f);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Completa la remisión");
      return;
    }
    if (Date.parse(f.dueAt) <= Date.now()) {
      toast.error("La fecha objetivo debe estar en el futuro");
      return;
    }
    setBusy(true);
    try {
      const result = await createReferralDraft(f);
      if (result.demo) {
        toast.success("Borrador de demostración; no se guardan datos reales");
      } else {
        setCreated(result.id);
        toast.success("Remisión guardada como propuesta, sin confirmar cita");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  if (created)
    return (
      <>
        <PageTitle title="Remisión creada" subtitle={`${selected?.name ?? ""} · ${f.specialty}`} />
        <Link
          className="font-bold text-primary"
          to={`${base}/remisiones/${created}/gestion` as never}
        >
          Abrir remisión
        </Link>
      </>
    );
  return (
    <>
      <PageTitle title="Nueva remisión" subtitle={`Paso ${step + 1} de 8 · ${steps[step]}`} />
      <progress className="mb-5 w-full accent-primary" value={step + 1} max={8} />
      <div className="space-y-4">
        {step === 0 && (
          <>
            <label className="block">
              Paciente
              <select
                className={input}
                aria-label="Paciente"
                value={f.petId}
                onChange={(e) => setF({ ...f, petId: e.target.value, visitId: "" })}
              >
                <option value="">Selecciona una mascota</option>
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.owner}
                  </option>
                ))}
              </select>
            </label>
            {selected && <p>Propietario: {selected.owner}</p>}
            <label className="block">
              Visita de origen
              <select
                className={input}
                aria-label="Visita de origen"
                value={f.visitId}
                onChange={(e) => setF({ ...f, visitId: e.target.value })}
              >
                <option value="">Sin visita de origen</option>
                {visits
                  .filter((v) => v.petId === f.petId)
                  .map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.date} {v.time} ·{" "}
                      {staff.find((s) => s.id === v.staffId)?.name ?? "Sin profesional"}
                    </option>
                  ))}
              </select>
            </label>
          </>
        )}
        {step === 1 && field("specialty", "Especialidad")}
        {step === 2 && (
          <>
            <p className="font-bold">Propuesta pendiente de aprobación clínica</p>
            {field("okvetRef", "Referencia autorizada de OKVET (opcional)")}
          </>
        )}
        {step === 3 && (
          <label className="block">
            Tipo de atención
            <select
              className={input}
              aria-label="Tipo de atención"
              value={f.modality}
              onChange={(e) => {
                const modality = DraftSchema.shape.modality.safeParse(e.target.value);
                if (modality.success) setF({ ...f, modality: modality.data });
              }}
            >
              {["Externo", "Interno", "Clínica", "Centro de diagnóstico"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        )}
        {step === 4 && (
          <>
            <label className="block">
              Especialista preferido
              <select
                className={input}
                aria-label="Especialista preferido"
                value={f.preferredSpecialist}
                onChange={(e) => setF({ ...f, preferredSpecialist: e.target.value })}
              >
                <option value="">Por definir</option>
                {specs.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} · {s.specialty}
                  </option>
                ))}
              </select>
            </label>
            {field("preferences", "Preferencias de zona y horario")}
          </>
        )}
        {step === 5 && field("documents", "Requisitos y referencias documentales autorizadas")}
        {step === 6 && (
          <>
            {field("assignee", "Responsable de coordinación")}
            {field("dueAt", "Fecha objetivo", "datetime-local")}
            {field("nextAction", "Siguiente acción")}
          </>
        )}
        {step === 7 && (
          <>
            <h2 className="text-xl font-bold">
              {selected?.name ?? "Sin paciente"} · {f.specialty}
            </h2>
            <p>{selected?.owner}</p>
            <p>
              {f.modality} · {f.preferredSpecialist || "Especialista por definir"}
            </p>
            <p>Responsable: {f.assignee || "Sin asignar"}</p>
            <p>{f.nextAction}</p>
            <p className="font-bold">
              Se guarda una propuesta. No se aprueba la indicación ni se confirma una cita.
            </p>
            <Btn disabled={busy} onClick={() => void submit()}>
              <Save className="h-4 w-4" />
              Guardar propuesta
            </Btn>
          </>
        )}
      </div>
      <div className="mt-6 flex justify-between gap-3">
        <Btn
          variant="outline"
          disabled={step === 0 || busy}
          aria-label="Paso anterior"
          onClick={() => setStep(step - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Btn>
        {step < 7 && (
          <Btn
            disabled={busy || (step === 0 && !f.petId) || (step === 1 && !f.specialty.trim())}
            onClick={() => setStep(step + 1)}
          >
            Continuar
            <ChevronRight className="h-4 w-4" />
          </Btn>
        )}
      </div>
    </>
  );
}
export function VisitReferralPanel({ visitId }: { visitId: string }) {
  const visit = useVF((s) => s.visits.find((v) => v.id === visitId));
  const pet = useVF((s) => s.pets.find((p) => p.id === visit?.petId));
  const refs = useVF((s) => s.referrals.filter((r) => r.pet === pet?.name));
  const roles = useVF((s) => s.roles);
  const metadata = useReferralRows<{ ref_id: string; data: { visitId?: string; petId?: string } }>(
    "records",
    "kind",
    "referral_draft",
  );
  if (
    !pet ||
    !roles.some((r) =>
      ["veterinario", "luis", "administrador", "coordinador", "recepcion"].includes(r),
    )
  )
    return null;
  const base = referralBase(roles);
  const linked = refs.filter((r) =>
    metadata.rows?.some((m) => m.ref_id === r.id && m.data.visitId === visitId),
  );
  return (
    <>
      <SectionTitle>Atención complementaria</SectionTitle>
      <Link
        className="inline-flex items-center gap-2 font-bold text-primary"
        to={`${base}/remisiones/nueva?visita=${encodeURIComponent(visitId)}` as never}
      >
        <CalendarPlus className="h-5 w-5" />
        Crear remisión para {pet.name}
      </Link>
      {linked.map((r) => (
        <div key={r.id} className="mt-3">
          <Link
            className="font-bold text-primary"
            to={`${base}/remisiones/${r.id}/continuidad` as never}
          >
            {r.specialty} · Coordinar, delegar o recordar después
          </Link>
        </div>
      ))}
    </>
  );
}
type Reminder = {
  id: string;
  referral_id: string | null;
  pet_id: string | null;
  title: string;
  due_at: string;
  assignee: string;
  status: string;
};
export function ReferralContinuity({ id }: { id: string }) {
  const r = useVF((s) => s.referrals.find((x) => x.id === id));
  const roles = useVF((s) => s.roles);
  const refs = useReferralRows<CaseRow>("referral_cases", "referral_id", id);
  const reminders = useReferralRows<Reminder>("referral_reminders", "referral_id", id);
  const [f, setF] = useState({ title: "", due: "", assignee: "" });
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const can = roles.some((x) =>
    ["veterinario", "coordinador", "recepcion", "luis", "administrador"].includes(x),
  );
  if (!r) return <Empty title="Remisión no encontrada" />;
  const state = refs.rows?.[0]?.state ?? "PROPOSED";
  const write = async (
    operation: PromiseLike<{ data: unknown; error: { message: string } | null }>,
  ) => {
    setBusy(true);
    try {
      if (getVF().userId?.startsWith("demo-")) {
        toast.success("Cambio de demostración; no se guarda");
        return;
      }
      await checkedWrite(operation);
      await reminders.reload();
      toast.success("Compromiso guardado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  const add = async () => {
    if (!f.title.trim() || !f.due || !f.assignee.trim()) {
      toast.error("Indica compromiso, fecha y responsable");
      return;
    }
    const due = new Date(`${f.due}-05:00`);
    if (!Number.isFinite(+due) || +due <= Date.now()) {
      toast.error("La fecha debe estar en el futuro");
      return;
    }
    if (
      (reminders.rows ?? []).some(
        (x) =>
          x.status === "pendiente" &&
          x.title === f.title.trim() &&
          x.due_at === due.toISOString() &&
          x.assignee === f.assignee.trim(),
      )
    ) {
      toast.error("Ya existe ese compromiso");
      return;
    }
    if (getVF().userId?.startsWith("demo-")) {
      toast.success("Recordatorio de demostración; no se guarda");
      return;
    }
    await write(
      db
        .from("referral_reminders")
        .insert({
          referral_id: id,
          title: f.title.trim(),
          due_at: due.toISOString(),
          assignee: f.assignee.trim(),
          created_by: getVF().userId,
        })
        .select("id"),
    );
  };
  return (
    <>
      <PageTitle title="Continuidad y compromisos" subtitle={`${r.pet} · ${r.specialty}`} />
      <p className="mb-4 font-bold">{pendingActions(state)}</p>
      {can && (
        <div className="mb-5 space-y-3">
          <label className="block">
            Compromiso
            <input
              className={input}
              aria-label="Compromiso"
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
            />
          </label>
          <label className="block">
            Recordarme después
            <input
              className={input}
              type="datetime-local"
              aria-label="Recordarme después"
              value={f.due}
              onChange={(e) => setF({ ...f, due: e.target.value })}
            />
          </label>
          <label className="block">
            Responsable
            <input
              className={input}
              aria-label="Responsable del compromiso"
              value={f.assignee}
              onChange={(e) => setF({ ...f, assignee: e.target.value })}
            />
          </label>
          <Btn disabled={busy} onClick={() => void add()}>
            Crear compromiso
          </Btn>
        </div>
      )}
      {reminders.error && <p role="alert">{reminders.error}</p>}
      {(reminders.rows ?? []).map((x) => (
        <Card key={x.id} className="mb-3">
          <b>{x.title}</b>
          <p>
            {x.assignee} ·{" "}
            {new Date(x.due_at).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
          </p>
          <p className="text-sm">
            {x.status === "pendiente" && Date.parse(x.due_at) < Date.now()
              ? "Vencido"
              : x.status === "hecho"
                ? "Completado"
                : x.status}
          </p>
          {x.status === "pendiente" && can && (
            <>
              <label className="mt-2 block text-sm">
                Delegar a
                <input
                  className={input}
                  aria-label={`Delegar ${x.title}`}
                  defaultValue={x.assignee}
                  onBlur={(e) => {
                    if (e.target.value.trim() && e.target.value.trim() !== x.assignee)
                      void write(
                        db
                          .from("referral_reminders")
                          .update({ assignee: e.target.value.trim() })
                          .eq("id", x.id)
                          .eq("assignee", x.assignee)
                          .select("id"),
                      );
                  }}
                />
              </label>
              <input
                className={`${input} mt-2`}
                aria-label={`Resultado de ${x.title}`}
                placeholder="Resultado del compromiso"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Btn
                className="mt-2"
                variant="outline"
                disabled={busy || !reason.trim()}
                onClick={() =>
                  void write(
                    db
                      .from("referral_reminders")
                      .update({
                        status: "hecho",
                        title: `${x.title} · Resultado: ${reason.trim()}`,
                      })
                      .eq("id", x.id)
                      .eq("status", "pendiente")
                      .select("id"),
                  )
                }
              >
                Registrar cumplimiento
              </Btn>
            </>
          )}
        </Card>
      ))}
      {reminders.rows?.length === 0 && <Empty title="Sin compromisos de continuidad" />}
      <Link
        className="mt-3 block font-bold text-primary"
        to={`${referralBase(roles)}/remisiones/${id}/gestion` as never}
      >
        Abrir gestión e historial
      </Link>
    </>
  );
}
export function ExternalAppointment({ id }: { id: string }) {
  const ref = useVF((s) => s.referrals.find((r) => r.id === id));
  const specs = useVF((s) => s.specialists);
  const cases = useReferralRows<CaseRow>("referral_cases");
  const rec = cases.rows?.find((r) => r.referral_id === id);
  const roles = useVF((s) => s.roles);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<BookingConfirmation>({
    specialistId: "",
    date: "",
    time: "",
    location: "",
    duration: 30,
    fee: null,
    confirmedBy: "",
    channel: "",
    confirmedAt: "",
    reference: "",
    evidence: "",
    instructions: "",
    assignee: "",
    timezone: "America/Bogota",
  });
  useEffect(() => {
    const spec = specs.find((s) => s.name === ref?.specialist);
    const choice = rec?.offers.find((o) => o.id === rec.choice);
    setF((x) => ({
      ...x,
      specialistId: spec?.id ?? x.specialistId,
      date: choice?.date ?? x.date,
      time: choice?.time ?? x.time,
      location: choice?.location ?? x.location,
    }));
  }, [ref?.specialist, rec?.choice, specs]);
  if (!ref) return <Empty title="Remisión no encontrada" />;
  const saved =
    rec?.history.flatMap((h) => {
      const c = parseConfirmation(h.note);
      return c ? [c] : [];
    }) ?? [];
  const submit = async () => {
    const error = validateConfirmation(
      f,
      rec?.state ?? "PROPOSED",
      new Date(),
      (cases.rows ?? []).flatMap((c) =>
        c.history.flatMap((h) => {
          const p = parseConfirmation(h.note);
          return p ? [p] : [];
        }),
      ),
    );
    if (error) {
      toast.error(error);
      return;
    }
    if (!rec) {
      toast.error("No se encontró la remisión");
      return;
    }
    const selected = rec.offers.find((o) => o.id === rec.choice);
    if (!selected || selected.date !== f.date || selected.time !== f.time) {
      toast.error("La confirmación debe corresponder al horario elegido");
      return;
    }
    const next = applyRef(rec, "confirmar_externa", "coordinacion", getVF().displayName, {
      expectedVersion: rec.version,
      now: new Date(),
      evidence: confirmationNote(f),
    });
    if (typeof next === "string") {
      toast.error(next);
      return;
    }
    setBusy(true);
    try {
      if (getVF().userId?.startsWith("demo-")) {
        toast.success("Confirmación sintética; no se registra una cita real");
        return;
      }
      await checkedWrite(
        db
          .from("referral_cases")
          .update({
            state: next.state,
            version: next.version,
            offers: next.offers,
            choice: next.choice,
            history: next.history,
          })
          .eq("referral_id", id)
          .eq("version", rec.version)
          .select("referral_id"),
      );
      await cases.reload();
      announceReferralChange();
      toast.success("Evidencia manual registrada; no se envió ningún mensaje");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  const can = roles.some((r) => ["coordinador", "recepcion", "luis", "administrador"].includes(r));
  return (
    <>
      <PageTitle title="Cita externa y evidencia" subtitle={`${ref.pet} · ${ref.specialty}`} />
      {saved.map((c, i) => (
        <Card className="mb-3" key={i}>
          <b>
            {c.date} {c.time} · {c.location}
          </b>
          <p>
            Confirmó: {c.confirmedBy} · {c.channel}
          </p>
          <p>Referencia: {c.reference}</p>
          <p className="text-sm">{c.evidence}</p>
          <p className="text-sm">Seguimiento: {c.assignee}</p>
        </Card>
      ))}
      {can && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Especialista
              <select
                className={input}
                aria-label="Especialista confirmado"
                value={f.specialistId}
                onChange={(e) => setF({ ...f, specialistId: e.target.value })}
              >
                <option value="">Seleccionar</option>
                {specs
                  .filter((s) => s.name === ref.specialist)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </label>
            {(
              [
                ["date", "Fecha de cita", "date"],
                ["time", "Hora de cita", "time"],
                ["location", "Dirección de la cita", "text"],
                ["confirmedBy", "Persona que confirmó", "text"],
                ["channel", "Canal de confirmación", "text"],
                ["confirmedAt", "Fecha de confirmación", "datetime-local"],
                ["reference", "Referencia externa", "text"],
                ["evidence", "Evidencia verificable", "text"],
                ["instructions", "Instrucciones autorizadas", "text"],
                ["assignee", "Responsable de seguimiento", "text"],
              ] as const
            ).map(([key, label, type]) => (
              <label key={key} className="text-sm">
                {label}
                <input
                  className={input}
                  type={type}
                  aria-label={label}
                  value={key === "confirmedAt" ? f.confirmedAt.slice(0, 16) : f[key]}
                  onChange={(e) =>
                    setF({
                      ...f,
                      [key]:
                        key === "confirmedAt" && e.target.value
                          ? `${e.target.value}:00-05:00`
                          : e.target.value,
                    })
                  }
                />
              </label>
            ))}
          </div>
          <p className="mt-3 text-sm">
            {rec?.state === "PENDING_EXTERNAL_CONFIRMATION"
              ? "Registra la evidencia obtenida del especialista."
              : "Primero completa la selección del propietario y solicita confirmación externa."}
          </p>
          <Btn
            className="mt-4"
            disabled={busy || rec?.state !== "PENDING_EXTERNAL_CONFIRMATION"}
            onClick={() => void submit()}
          >
            Registrar confirmación con evidencia
          </Btn>
        </>
      )}
      <Link
        className="mt-4 block font-bold text-primary"
        to={`${referralBase(roles)}/remisiones/${id}/gestion` as never}
      >
        Volver a gestión
      </Link>
    </>
  );
}
