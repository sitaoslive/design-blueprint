import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Save } from "lucide-react";
import { useVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { AuditTimeline } from "@/components/vf/shared/timeline";
import { useQualityWorkspace, saveQualityDraft } from "../application/service";
import { canPersistDraft } from "../application/access";
import {
  ComplaintDraftSchema,
  categories,
  stateLabels,
  ComplaintStates,
  transitionComplaint,
  prepareEscalation,
  type Complaint,
  type ComplaintDraft,
  type ComplaintState,
} from "../domain";
import { inputClass, QualityNav, PendingAuthority, SourceDate, qualityError } from "../components/shared";

export function ComplaintList() {
  const { workspace, demo } = useQualityWorkspace();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("open");
  const list = workspace.complaints.filter(
    (c) =>
      (filter === "all" || c.state !== "CLOSED") &&
      `${c.description} ${c.category} ${c.customerId}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle title="Quejas y resolución" />
      <QualityNav />
      {!demo && <PendingAuthority draft />}
      <Link
        to="/operaciones/$"
        params={{ _splat: "quejas/nueva" }}
        className="mb-4 inline-flex items-center gap-2 font-bold text-primary"
      >
        <Plus className="h-5 w-5" />
        Registrar inconveniente
      </Link>
      <label className="block">
        Buscar
        <input className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      <label className="my-3 block">
        Estado
        <select className={inputClass} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="open">Abiertas</option>
          <option value="all">Todas, incluidas cerradas</option>
        </select>
      </label>
      {list.map((c) => (
        <Card key={c.id} className="mb-3">
          <p className="text-xs font-bold text-primary">
            {demo ? "Demostración" : "Borrador reservado"} · {stateLabels[c.state]}
          </p>
          <b>{c.category}</b>
          <p className="whitespace-pre-wrap break-words">{c.description}</p>
          <p className="text-sm">Responsable: {c.assignedTo || "Sin asignar"}</p>
          <SourceDate source={c.sourceReference} at={c.createdAt} />
          <Link
            className="mt-3 block font-bold text-primary"
            to="/operaciones/$"
            params={{ _splat: `quejas/${c.id}` }}
          >
            Abrir caso
          </Link>
        </Card>
      ))}
      {!list.length && <Empty title="Sin casos registrados en esta vista" />}
    </>
  );
}
export function ComplaintCreate() {
  const pets = useVF((s) => s.pets);
  const visits = useVF((s) => s.visits);
  const staff = useVF((s) => s.staff);
  const demo = useVF((s) => s.userId?.startsWith("demo-"));
  const roles = useVF((s) => s.roles);
  const writable = Boolean(demo) || canPersistDraft(roles);
  const nav = useNavigate();
  const families = Array.from(
    new Map(pets.map((p) => [p.ownerId || (demo ? "demo-family" : ""), p.owner])).entries(),
  ).filter(([id]) => id);
  const [f, setF] = useState<ComplaintDraft>({
    customerId: "",
    petId: "",
    visitId: "",
    conversationId: "",
    category: "Comunicación",
    description: "",
    assignedTo: "",
    dueAt: "",
    clinical: false,
    sourceReference: "",
  });
  const [busy, setBusy] = useState(false);
  const [id] = useState(() => crypto.randomUUID());
  const save = async () => {
    const p = ComplaintDraftSchema.safeParse(f);
    if (!p.success) {
      toast.error(p.error.issues[0]?.message ?? "Revisa los campos");
      return;
    }
    if (
      f.petId &&
      !pets.some((p) => p.id === f.petId && (p.ownerId || "demo-family") === f.customerId)
    ) {
      toast.error("La mascota no pertenece a la familia seleccionada");
      return;
    }
    if (f.visitId && !visits.some((v) => v.id === f.visitId && v.petId === f.petId)) {
      toast.error("La visita no pertenece a esta mascota");
      return;
    }
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const c: Complaint = {
        ...p.data,
        id,
        state: "NEW",
        version: 1,
        createdAt: now,
        updatedAt: now,
        events: [],
        plan: "",
        evidence: "",
        customerConfirmation: "UNKNOWN",
        professionalReviewed: false,
        solutionImplemented: false,
      };
      await saveQualityDraft("complaints", c);
      toast.success(demo ? "Caso sintético registrado" : "Borrador reservado guardado");
      await nav({ to: "/operaciones/$", params: { _splat: `quejas/${id}` } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title="Registrar inconveniente" />
      <QualityNav />
      {!demo && <PendingAuthority draft />}
      <div className="space-y-3">
        <label className="block">
          Familia
          <select
            aria-label="Familia"
            className={inputClass}
            value={f.customerId}
            onChange={(e) => setF({ ...f, customerId: e.target.value, petId: "", visitId: "" })}
          >
            <option value="">Selecciona</option>
            {families.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          Mascota (opcional)
          <select
            className={inputClass}
            aria-label="Mascota"
            value={f.petId}
            onChange={(e) => setF({ ...f, petId: e.target.value, visitId: "" })}
          >
            <option value="">No aplica</option>
            {pets
              .filter((p) => (p.ownerId || "demo-family") === f.customerId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          Visita relacionada
          <select
            className={inputClass}
            value={f.visitId}
            onChange={(e) => setF({ ...f, visitId: e.target.value })}
          >
            <option value="">No aplica</option>
            {visits
              .filter((v) => v.petId === f.petId)
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.service} · {v.date} {v.time}
                </option>
              ))}
          </select>
        </label>
        <label className="block">
          Categoría
          <select
            className={inputClass}
            value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value as ComplaintDraft["category"] })}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          Descripción
          <textarea
            aria-label="Descripción"
            className={inputClass}
            rows={4}
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
        </label>
        <label className="block">
          Responsable propuesto
          <select
            className={inputClass}
            value={f.assignedTo}
            onChange={(e) => setF({ ...f, assignedTo: e.target.value })}
          >
            <option value="">Por asignar</option>
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
            aria-label="Fecha objetivo"
            className={inputClass}
            value={f.dueAt.replace("-05:00", "")}
            onChange={(e) => setF({ ...f, dueAt: e.target.value ? `${e.target.value}-05:00` : "" })}
          />
          <span className="text-xs text-muted-foreground">Hora de Colombia</span>
        </label>
        <label className="block">
          Fuente o referencia
          <input
            aria-label="Fuente o referencia"
            className={inputClass}
            value={f.sourceReference}
            onChange={(e) => setF({ ...f, sourceReference: e.target.value })}
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={f.clinical}
            onChange={(e) => setF({ ...f, clinical: e.target.checked })}
          />
          Requiere revisión veterinaria
        </label>
        {!writable && <p role="status" className="text-sm text-muted-foreground">El guardado para este perfil está pendiente del servicio autorizado.</p>}
        <Btn onClick={() => void save()} disabled={busy || !writable}>
          <Save className="h-4 w-4" />
          Guardar {demo ? "caso de prueba" : "borrador"}
        </Btn>
      </div>
    </>
  );
}
export function ComplaintDetail({ id }: { id: string }) {
  const { workspace, demo, loading, error } = useQualityWorkspace();
  const uid = useVF((s) => s.userId);
  const staff = useVF((s) => s.staff);
  const original = workspace.complaints.find((c) => c.id === id);
  const [to, setTo] = useState<ComplaintState>("ACKNOWLEDGED");
  const [reason, setReason] = useState("");
  const [plan, setPlan] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<string | null>(null);
  const [implemented, setImplemented] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  if (loading) return <p>Cargando caso…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!original) return <Empty title="Caso no disponible para este perfil" />;
  const escalation = prepareEscalation(original, new Date().toISOString());
  const advance = async () => {
    if (!demo || !uid) {
      toast.error("La transición oficial requiere el servicio autorizado");
      return;
    }
    try {
      const next = transitionComplaint(
        { ...original, plan: plan ?? original.plan },
        {
          to,
          expectedVersion: original.version,
          actorId: uid,
          reason,
          evidence: evidence ?? original.evidence,
          solutionImplemented: implemented || original.solutionImplemented,
          professionalReviewed: reviewed || original.professionalReviewed,
          at: new Date().toISOString(),
        },
      );
      await saveQualityDraft("complaints", next);
      setReason("");
      toast.success("Transición de demostración registrada");
    } catch (e) {
      toast.error(qualityError(e instanceof Error ? e.message : "Transición inválida"));
    }
  };
  return (
    <>
      <PageTitle
        title={original.category}
        subtitle={demo ? "Caso de demostración" : "Borrador reservado"}
      />
      <QualityNav />
      <Card>
        <b>
          {stateLabels[original.state]} · Versión {original.version}
        </b>
        <p>{original.description}</p>
        <p className="mt-2 text-sm">
          Responsable propuesto: {staff.find((s) => s.id === original.assignedTo)?.name || original.assignedTo || "Sin asignar"}
        </p>
        <SourceDate source={original.sourceReference} at={original.dueAt} />
        <p className="mt-2 font-bold">{escalation.level}</p>
        <p className="text-sm">{escalation.reason}</p>
        <p className="mt-2 text-sm">
          Confirmación del cliente:{" "}
          {original.customerConfirmation === "UNKNOWN"
            ? "No registrada"
            : original.customerConfirmation}
        </p>
      </Card>
      {!demo && <PendingAuthority draft />}
      <SectionTitle>Plan y evidencia</SectionTitle>
      <label className="block">
        Acción propuesta
        <textarea
          aria-label="Acción propuesta"
          className={inputClass}
          value={plan ?? original.plan}
          onChange={(e) => setPlan(e.target.value)}
        />
      </label>
      <label className="block">
        Evidencia de implementación
        <textarea
          aria-label="Evidencia de implementación"
          className={inputClass}
          value={evidence ?? original.evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />
      </label>
      <label className="my-3 flex items-center gap-2">
        <input
          type="checkbox"
          checked={implemented}
          onChange={(e) => setImplemented(e.target.checked)}
        />
        Solución implementada y documentada
      </label>
      {original.clinical && (
        <label className="my-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={reviewed}
            onChange={(e) => setReviewed(e.target.checked)}
          />
          Revisión profesional realizada (solo demostración)
        </label>
      )}
      <label className="block">
        Siguiente estado
        <select
          aria-label="Siguiente estado"
          className={inputClass}
          value={to}
          onChange={(e) => setTo(e.target.value as ComplaintState)}
        >
          {ComplaintStates.map((s) => (
            <option key={s} value={s}>
              {stateLabels[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        Motivo
        <input
          aria-label="Motivo"
          className={inputClass}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <Btn className="mt-3" disabled={!demo} onClick={() => void advance()}>
        Registrar transición de prueba
      </Btn>
      <SectionTitle>Historial</SectionTitle>
      <AuditTimeline
        items={original.events.map((e) => ({
          id: e.id,
          at: `${e.at} · actor ${e.actorId} · versión ${e.version}`,
          action: `${stateLabels[e.from]} → ${stateLabels[e.to]} · ${e.reason} · ${e.evidence || "Sin evidencia adjunta"}`,
        }))}
      />
      {!original.events.length && (
        <p className="text-sm text-muted-foreground">Sin transiciones registradas</p>
      )}
    </>
  );
}
