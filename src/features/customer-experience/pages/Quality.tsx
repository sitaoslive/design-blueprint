import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { useQualitySources } from "../adapters/sources";
import { useQualityWorkspace, saveQualityDraft } from "../application/service";
import {
  evaluateQualityFindings,
  groupOperationalFindings,
  prepareCorrectiveAction,
  prepareEscalation,
  validateImprovementTransition,
  ImprovementStates,
  bogotaDate,
  type CorrectiveAction,
} from "../domain";
import {
  QualityNav,
  SourceDate,
  inputClass,
  PendingAuthority,
  UnavailableAction,
} from "../components/shared";

export function QualityDashboard({ pending = false }: { pending?: boolean }) {
  const { sources, error } = useQualitySources();
  const { workspace, demo } = useQualityWorkspace();
  const [minutes, setMinutes] = useState("");
  const now = new Date().toISOString();
  const findings = evaluateQualityFindings(
    sources,
    now,
    minutes && Number(minutes) > 0 ? Number(minutes) : null,
  );
  const open = workspace.complaints.filter((c) => c.state !== "CLOSED");
  return (
    <>
      <PageTitle title={pending ? "Pendientes de calidad" : "Centro de Calidad y Experiencia"} />
      <QualityNav />
      {error && <p role="alert">{error}</p>}
      <div className="grid grid-cols-2 gap-x-4 border-y border-border py-3">
        {[
          ["Pendientes registrados", findings.length],
          [demo ? "Quejas de prueba" : "Borradores de queja", open.length],
          ["Borradores de mejora", workspace.improvements.length],
          ["Respuestas de encuesta", workspace.responses.length],
        ].map(([label, value]) => (
          <div key={String(label)} className="py-3">
            <p className="text-sm text-muted-foreground">{label}</p>
            <b className="text-3xl">{value}</b>
          </div>
        ))}
      </div>
      <SectionTitle>Necesitan revisión</SectionTitle>
      <label className="mb-4 block text-sm">
        Umbral de espera de conversaciones (minutos)
        <input
          type="number"
          min="1"
          className={inputClass}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
        <span className="text-xs text-muted-foreground">
          Sin umbral aprobado guardado; filtro local, no alerta oficial.
        </span>
      </label>
      {findings.map((f) => (
        <div key={f.findingId} className="mb-4 border-b border-border pb-4">
          <div className="flex flex-wrap justify-between gap-2">
            <b>{f.category}</b>
            <span className="text-xs font-bold text-primary">
              {f.severityPolicy === "COORDINATION"
                ? "Revisión de coordinación"
                : "Atención habitual"}
            </span>
          </div>
          <p className="text-sm">{f.reason}</p>
          <SourceDate source={`${f.source} / ${f.id}`} at={f.updatedAt} />
          <Link to={f.href as never} className="mt-2 block font-bold text-primary">
            Abrir origen
          </Link>
        </div>
      ))}
      {!findings.length && <Empty title="Sin hallazgos con los criterios actuales" />}
      <SectionTitle>Calidad y continuidad</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["/operaciones/calidad/escalamientos", "Escalamientos"],
          ["/operaciones/calidad/causas", "Causas y patrones"],
          ["/operaciones/calidad/mejoras", "Mejora continua"],
          ["/operaciones/fidelizacion/consentimientos", "Permisos de contacto"],
          ["/admin/calidad/ia", "Revisión del asistente"],
          ["/operaciones/calidad/duelo", "Contexto sensible"],
        ].map(([href, label]) => (
          <Link
            key={href}
            className="border-b border-border py-3 font-bold text-primary"
            to={href as never}
          >
            {label}
          </Link>
        ))}
      </div>
      <SourceDate
        source={
          demo
            ? "Datos sintéticos; excluidos de indicadores reales"
            : "Fuentes autorizadas visibles para tu perfil"
        }
        at={now}
      />
    </>
  );
}
export function QualityConversations() {
  const { conversations, error } = useQualitySources();
  const list = conversations.filter((c) =>
    [
      "NEW",
      "WAITING_TEAM",
      "PENDING_COORDINATION",
      "PENDING_CLINICAL_ESCALATION",
      "ERROR",
      "IDENTIFICATION_REQUIRED",
    ].includes(c.status),
  );
  return (
    <>
      <PageTitle title="Conversaciones por revisar" />
      <QualityNav />
      {error && <p role="alert">{error}</p>}
      {list.map((c) => (
        <Card key={c.id} className="mb-3">
          <b>{c.contact_name}</b>
          <p className="text-sm">
            {c.status === "ERROR"
              ? "Error de mensajería"
              : c.status === "PENDING_CLINICAL_ESCALATION"
                ? "Revisión profesional pendiente"
                : "Respuesta o traspaso pendiente"}
          </p>
          <SourceDate source={`conversations / ${c.id}`} at={c.last_inbound_at} />
          <Link
            to="/operaciones/$"
            params={{ _splat: `whatsapp/${c.id}` }}
            className="mt-3 block font-bold text-primary"
          >
            Abrir conversación original
          </Link>
        </Card>
      ))}
      {!list.length && <Empty title="Sin conversaciones pendientes en las fuentes disponibles" />}
    </>
  );
}
export function QualityPatterns() {
  const { sources } = useQualitySources();
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const raw = evaluateQualityFindings(sources, new Date().toISOString()).filter(
    (f) =>
      (!from && !to) ||
      (f.updatedAt &&
        (!from || (bogotaDate(f.updatedAt) ?? "") >= from) &&
        (!to || (bogotaDate(f.updatedAt) ?? "") <= to)),
  );
  const groups = groupOperationalFindings(raw).filter(
    (g) => category === "all" || g.category === category,
  );
  return (
    <>
      <PageTitle title="Causas y problemas recurrentes" />
      <QualityNav />
      <div className="grid grid-cols-2 gap-3">
        <label>
          Desde
          <input
            type="date"
            className={inputClass}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            className={inputClass}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      <label className="my-3 block">
        Categoría
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">Todas</option>
          {Array.from(new Set(raw.map((f) => f.category))).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      {groups.map((g) => (
        <div key={g.category} className="mb-3 border-b border-border py-3">
          <b>
            {g.category} · {g.count}
          </b>
          <p className="text-sm text-muted-foreground">{g.conclusion}</p>
          <Link
            to="/operaciones/$"
            params={{ _splat: "calidad/mejoras" }}
            className="mt-2 block font-bold text-primary"
          >
            Proponer análisis o mejora
          </Link>
        </div>
      ))}
      {!groups.length && <Empty title="Sin hallazgos fechados para este periodo" />}
      <p className="text-xs text-muted-foreground">
        Los registros sin fecha no se incluyen al filtrar un periodo. No se atribuyen culpas ni
        causas sin revisión humana.
      </p>
    </>
  );
}
export function Improvements() {
  const { workspace, demo, reload } = useQualityWorkspace();
  const staff = useVF((s) => s.staff);
  const uid = useVF((s) => s.userId);
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<CorrectiveAction>(() => ({
    id: crypto.randomUUID(),
    title: "",
    hypothesis: "",
    confirmedCause: "",
    evidence: "",
    assignedTo: "",
    dueAt: "",
    state: "IDEA",
    approvedBy: "",
    implementationEvidence: "",
    measuredAfter: "",
    trainingReference: "",
  }));
  const save = async () => {
    const error = prepareCorrectiveAction(a);
    if (error) {
      toast.error("Registra problema, hipótesis, evidencia, responsable y plazo");
      return;
    }
    setBusy(true);
    try {
      await saveQualityDraft("improvements", a);
      reload();
      toast.success(demo ? "Mejora sintética registrada" : "Propuesta reservada guardada");
      setA((x) => ({ ...x, id: crypto.randomUUID(), title: "", hypothesis: "", evidence: "" }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title="Mejora continua" />
      <QualityNav />
      {!demo && <PendingAuthority draft />}
      <div className="space-y-3">
        {(
          [
            ["title", "Problema"],
            ["hypothesis", "Hipótesis (no es causa confirmada)"],
            ["evidence", "Fuente y evidencia"],
            ["trainingReference", "Procedimiento o formación relacionada"],
          ] as const
        ).map(([key, label]) => (
          <label className="block" key={key}>
            {label}
            <input
              className={inputClass}
              value={a[key]}
              onChange={(e) => setA({ ...a, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="block">
          Responsable
          <select
            className={inputClass}
            value={a.assignedTo}
            onChange={(e) => setA({ ...a, assignedTo: e.target.value })}
          >
            <option value="">Selecciona</option>
            {uid && <option value={uid}>Yo (responsable propuesto)</option>}
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          Fecha objetivo
          <input
            type="datetime-local"
            className={inputClass}
            value={a.dueAt.replace("-05:00", "")}
            onChange={(e) => setA({ ...a, dueAt: e.target.value ? `${e.target.value}-05:00` : "" })}
          />
        </label>
        <Btn disabled={busy} onClick={() => void save()}>
          <Save className="h-4 w-4" />
          Guardar propuesta
        </Btn>
      </div>
      <SectionTitle>Propuestas registradas</SectionTitle>
      {workspace.improvements.map((x) => (
        <Card key={x.id} className="mb-3">
          <b>{x.title}</b>
          <p>{x.hypothesis}</p>
          <p className="text-sm">Hipótesis sin confirmar · Propuesta de mejora</p>
          <SourceDate source={x.evidence} at={x.dueAt} />
          {demo ? (
            <ImprovementDemoAction action={x} />
          ) : (
            <UnavailableAction label="Solicitar aprobación oficial" />
          )}
          <Link
            to="/luis/$modulo"
            params={{ modulo: "academia" }}
            className="mt-2 block font-bold text-primary"
          >
            Abrir formación del equipo
          </Link>
        </Card>
      ))}
      {!workspace.improvements.length && <Empty title="Sin propuestas de mejora" />}
    </>
  );
}
function ImprovementDemoAction({ action }: { action: CorrectiveAction }) {
  const [next, setNext] = useState<CorrectiveAction["state"]>("UNDER_REVIEW");
  const [evidence, setEvidence] = useState("");
  const [measurement, setMeasurement] = useState("");
  const run = async () => {
    const proposal = {
      ...action,
      state: next,
      approvedBy: ["IDEA", "UNDER_REVIEW"].includes(next)
        ? action.approvedBy
        : "demo-authorized-reviewer",
      implementationEvidence: evidence || action.implementationEvidence,
      measuredAfter: measurement || action.measuredAfter,
    };
    const error = validateImprovementTransition(action, proposal);
    if (error) {
      toast.error(error);
      return;
    }
    await saveQualityDraft("improvements", proposal);
    toast.success("Paso sintético registrado; sin modificar procedimientos oficiales");
  };
  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm">Estado de demostración: {action.state}</p>
      <label className="block">
        Siguiente paso de mejora
        <select
          className={inputClass}
          value={next}
          onChange={(e) => setNext(e.target.value as CorrectiveAction["state"])}
        >
          {ImprovementStates.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="block">
        Evidencia de implementación
        <input
          className={inputClass}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />
      </label>
      <label className="block">
        Medición posterior
        <input
          className={inputClass}
          value={measurement}
          onChange={(e) => setMeasurement(e.target.value)}
        />
      </label>
      <Btn variant="soft" onClick={() => void run()}>
        Registrar paso de mejora (demo)
      </Btn>
    </div>
  );
}
export function Escalations() {
  const { workspace } = useQualityWorkspace();
  return (
    <>
      <PageTitle title="Escalamientos y revisión" />
      <QualityNav />
      {workspace.complaints
        .filter((c) => c.state !== "CLOSED")
        .map((c) => {
          const r = prepareEscalation(c, new Date().toISOString());
          return (
            <Card key={c.id} className="mb-3">
              <b>{r.level}</b>
              <p>{r.reason}</p>
              <p className="text-sm">{c.category}</p>
              <Link
                to="/operaciones/$"
                params={{ _splat: `quejas/${c.id}` }}
                className="mt-2 block font-bold text-primary"
              >
                Revisar caso
              </Link>
            </Card>
          );
        })}
      {!workspace.complaints.length && <Empty title="Sin casos disponibles para escalar" />}
    </>
  );
}
