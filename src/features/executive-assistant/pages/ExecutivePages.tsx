import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Btn, Card, Empty, PageTitle, SectionTitle } from "@/components/vf/ui";
import { operationalDay } from "@/features/field-operations/domain/advanced";
import { FinancePeriod, financeInput } from "@/features/finance/components/FinanceControls";
import { moneyLabel } from "@/features/finance/domain";
import { validPeriod } from "@/features/finance/domain/presentation";
import { useExecutiveSources, queryExecutiveTool, executiveSnapshot } from "../application/queries";
import { saveExecutiveDraft, useExecutiveWorkspace } from "../application/workspace";
import {
  DraftSchema,
  buildActionProposal,
  prepareDelegation,
  detectOperationalBottlenecks,
  evaluateAbsenceCoverage,
  calculateAutonomyMetrics,
  escalationCategory,
  type ExecutiveDraft,
} from "../domain";
import {
  EXECUTIVE_CONTRACTS,
  unavailableExecutiveGateway,
  ExecutiveReceiptSchema,
} from "../application/contracts";
import { TOOL_REGISTRY } from "../application/registry";
import { ExecutiveNav } from "../components/ExecutiveNav";

export function ExecutiveDraftCenter({ kind }: { kind: ExecutiveDraft["kind"] }) {
  const sources = useExecutiveSources();
  const { workspace, update } = useExecutiveWorkspace();
  const [f, setF] = useState({
    title: "",
    objective: "",
    responsible: "",
    deadline: operationalDay(),
  });
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");
  const [key, setKey] = useState(() => crypto.randomUUID());
  const title =
    kind === "proposal"
      ? "Propuestas de Dirección"
      : kind === "delegation"
        ? "Delegaciones y seguimiento"
        : "Memoria empresarial";
  const realDrafts = (sources.records.rows ?? [])
    .filter((r) => r.kind === `executive_${kind}_draft`)
    .flatMap((r) => {
      const parsed = DraftSchema.safeParse(r.data["draft"]);
      return parsed.success
        ? [
            {
              ...parsed.data,
              id: r.id,
              status: "DRAFT" as const,
              source: "Lovable Cloud · borrador reservado",
            },
          ]
        : [];
    });
  const drafts = [...realDrafts, ...(sources.demo ? (workspace?.drafts ?? []) : [])].filter(
    (d) =>
      d.kind === kind && `${d.title} ${d.objective}`.toLowerCase().includes(filter.toLowerCase()),
  );
  const proposal = f.objective
    ? (() => {
        try {
          return buildActionProposal(f.objective, []);
        } catch {
          return null;
        }
      })()
    : null;
  const save = async () => {
    const responsible = sources.staff.rows?.find((s) => s.id === f.responsible);
    if (kind === "delegation") {
      const reason = prepareDelegation(
        responsible
          ? {
              id: responsible.id,
              role: responsible.role,
              linked: Boolean(responsible.user_id) || sources.demo,
            }
          : undefined,
        /clin|dosis|tratamiento/i.test(f.objective),
        f.deadline,
      );
      if (reason) {
        toast.error(`No se puede preparar la delegación: ${reason}`);
        return;
      }
    }
    if (!proposal) {
      toast.error("La acción está prohibida o falta el objetivo");
      return;
    }
    const parsed = DraftSchema.safeParse({
      ...f,
      kind,
      sourceIds: [],
      expectedVersion: 0,
      idempotencyKey: key,
      correlationId: key,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los datos");
      return;
    }
    setBusy(true);
    try {
      const saved = await saveExecutiveDraft(parsed.data);
      if (sources.demo)
        update((w) => ({
          ...w,
          drafts: w.drafts.some((d) => d.id === saved.id)
            ? w.drafts
            : [
                ...w.drafts,
                { ...parsed.data, id: saved.id, status: "DRAFT", source: saved.source },
              ],
        }));
      await sources.records.reload();
      toast.success("Borrador guardado; no aprobado, asignado ni ejecutado");
      setKey(crypto.randomUUID());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title={title} />
      <ExecutiveNav />
      <p className="mb-3 text-sm text-muted-foreground">
        Borradores reservados; la aprobación, asignación y versión oficiales requieren contrato
        protegido.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          Título
          <input
            className={financeInput}
            aria-label="Título del borrador"
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
        </label>
        <label>
          Fecha límite
          <input
            className={financeInput}
            type="date"
            aria-label="Fecha límite del borrador"
            value={f.deadline}
            onChange={(e) => setF({ ...f, deadline: e.target.value })}
          />
        </label>
        <label className="sm:col-span-2">
          Objetivo y evidencia
          <textarea
            className={financeInput}
            aria-label="Objetivo del borrador"
            value={f.objective}
            onChange={(e) => setF({ ...f, objective: e.target.value })}
          />
        </label>
        <label>
          Responsable propuesto
          <select
            className={financeInput}
            aria-label="Responsable propuesto"
            value={f.responsible}
            onChange={(e) => setF({ ...f, responsible: e.target.value })}
          >
            <option value="">Seleccionar</option>
            {sources.staff.rows?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.role}
                {!s.user_id && !sources.demo ? " · Sin cuenta vinculada" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>
      {proposal && (
        <div className="mt-3 border-y border-border py-3">
          <p className="text-sm font-bold">
            Riesgo {proposal.risk} · Borrador · Impacto no confirmado
          </p>
          <ol className="mt-2 list-inside list-decimal text-sm">
            {proposal.steps.map((step) => (
              <li key={step.id}>{step.title}</li>
            ))}
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">
            Cada paso depende de la evidencia del anterior. No cambia permisos ni agenda.
          </p>
        </div>
      )}
      <Btn className="mt-3" disabled={busy} onClick={() => void save()}>
        Guardar borrador
      </Btn>
      <SectionTitle>
        {kind === "memory" ? "Propuestas de memoria" : "Borradores y seguimiento"}
      </SectionTitle>
      <input
        className={`${financeInput} mb-3`}
        aria-label="Buscar borradores"
        placeholder="Buscar"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {sources.records.error && <p role="alert">{sources.records.error}</p>}
      {drafts.map((d) => (
        <Card className="mb-3" key={d.id}>
          <b>{d.title}</b>
          <p className="whitespace-pre-wrap break-words">{d.objective}</p>
          <p className="mt-2 text-sm">
            Responsable propuesto:{" "}
            {sources.staff.rows?.find((s) => s.id === d.responsible)?.name ?? d.responsible} ·{" "}
            {d.deadline}
          </p>
          <p className="text-xs text-muted-foreground">
            {d.source} · Borrador · Aceptación y ejecución: no confirmadas
          </p>
          {kind === "memory" && (
            <p className="text-xs text-muted-foreground">
              Política no aprobada, sin vigencia oficial; no concede permisos ni reemplaza
              documentos normativos.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Btn variant="outline" disabled>
              Solicitar aprobación protegida
            </Btn>
            <Link
              className="font-bold text-primary"
              to="/operaciones/$"
              params={{ _splat: "simulador" }}
            >
              Comparar en simulador
            </Link>
          </div>
        </Card>
      ))}
      {!drafts.length && <Empty title="Sin borradores visibles" />}
      {kind === "delegation" && (
        <>
          <SectionTitle>Tareas reales del equipo</SectionTitle>
          {sources.tasks.rows
            ?.filter((t) => !t.done)
            .map((t) => (
              <Card key={t.id} className="mb-3">
                <b>{t.title}</b>
                <p className="text-sm">
                  Responsable:{" "}
                  {sources.staff.rows?.find((s) => s.id === t.staff_id)?.name ??
                    "Sin responsable identificado"}{" "}
                  · Pendiente registrada
                </p>
                <p className="text-xs text-muted-foreground">
                  Aceptación, vencimiento y cierre con evidencia dependen del flujo de tareas de
                  origen.
                </p>
              </Card>
            ))}
        </>
      )}
    </>
  );
}
export function ExecutiveDecisionCenter({
  mode,
}: {
  mode: "approvals" | "decisions" | "exceptions";
}) {
  const sources = useExecutiveSources();
  const [selected, setSelected] = useState("");
  const rows = sources.approvals.rows ?? [];
  const active = rows.find((r) => r.id === selected);
  const findings = detectOperationalBottlenecks(rows, sources.tasks.rows ?? []);
  return (
    <>
      <PageTitle
        title={
          mode === "approvals"
            ? "Aprobaciones de Dirección"
            : mode === "exceptions"
              ? "Excepciones operativas"
              : "Centro de decisiones"
        }
      />
      <ExecutiveNav />
      <p className="mb-3 text-sm text-muted-foreground">
        Fuentes registradas. Revisar no significa aprobar ni ejecutar.
      </p>
      {sources.approvals.error && <p role="alert">{sources.approvals.error}</p>}
      {mode !== "exceptions" &&
        rows.map((a) => (
          <Card className="mb-3" key={a.id}>
            <b>{a.title}</b>
            <p className="whitespace-pre-wrap break-words">{a.detail}</p>
            <p className="text-sm">
              {a.kind} · Estado registrado: {a.status}
            </p>
            <Btn className="mt-2" variant="outline" onClick={() => setSelected(a.id)}>
              Revisar impacto
            </Btn>
          </Card>
        ))}
      {active && (
        <section className="my-4 border-y border-border py-4">
          <h2 className="text-lg font-bold">Revisión: {active.title}</h2>
          <p>{active.detail}</p>
          <dl className="my-3 text-sm">
            <dt className="font-bold">Versión, vencimiento y solicitante autorizado</dt>
            <dd>No disponibles en el registro histórico.</dd>
            <dt className="mt-2 font-bold">Dependencias, clientes afectados y reversión</dt>
            <dd>Requieren evaluación de la propuesta en el módulo de origen.</dd>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Btn disabled>Aprobar por contrato protegido</Btn>
            <Btn variant="outline" disabled>
              Rechazar por contrato protegido
            </Btn>
            <Link
              to="/direccion/$"
              params={{ _splat: "propuestas" }}
              className="font-bold text-primary"
            >
              Preparar cambios
            </Link>
            <Link
              to="/operaciones/$"
              params={{ _splat: "simulador" }}
              className="font-bold text-primary"
            >
              Simular
            </Link>
          </div>
          <p className="mt-2 text-sm">No se interpretó una instrucción de chat como aprobación.</p>
        </section>
      )}
      <SectionTitle>Lo que necesita atención</SectionTitle>
      {findings.map((f) => (
        <Card className="mb-3" key={f.id}>
          <b>{f.observation}</b>
          <p className="text-sm">
            Registro {f.id} · {f.hypothesis}
          </p>
          <Link
            to="/direccion/$"
            params={{ _splat: "delegaciones" }}
            className="font-bold text-primary"
          >
            {f.action}
          </Link>
        </Card>
      ))}
      {sources.incidents.rows
        ?.filter((i) => i.status !== "cerrada")
        .sort((a, b) => Number(b.severity === "alta") - Number(a.severity === "alta"))
        .map((i) => (
          <Card className="mb-3" key={i.id}>
            <b>{i.title}</b>
            <p>
              Severidad registrada: {i.severity} · {i.status}
            </p>
            <Link
              to="/luis/$modulo"
              params={{ modulo: "incidencias" }}
              className="font-bold text-primary"
            >
              Ver incidencia
            </Link>
          </Card>
        ))}
      {!rows.length && !findings.length && (
        <Empty title="Sin decisiones pendientes en las fuentes consultadas" />
      )}
      <SectionTitle>Mejoras propuestas</SectionTitle>
      <p className="text-sm">
        Las observaciones anteriores pueden motivar revisión de procedimiento o formación. Causas,
        costo y ahorro: no calculables sin evidencia.
      </p>
      <Link
        to="/direccion/$"
        params={{ _splat: "propuestas" }}
        className="mt-2 block font-bold text-primary"
      >
        Preparar una mejora con evidencia
      </Link>
    </>
  );
}
export function ExecutiveReports({ kind = "builder" }: { kind?: string }) {
  const sources = useExecutiveSources();
  const day = operationalDay();
  const [period, setPeriod] = useState({
    from:
      kind === "semanal"
        ? new Date(Date.parse(`${day}T12:00:00Z`) - 6 * 86400000).toISOString().slice(0, 10)
        : day,
    to: day,
  });
  const [area, setArea] = useState("apertura");
  const snapshot = executiveSnapshot(sources, period);
  const tools =
    kind === "cierre"
      ? ["getTodayAppointments", "getStaffTasks", "getReportedCollections", "getOpenReferrals"]
      : kind === "semanal"
        ? [
            "getTodayAppointments",
            "getOperationalIncidents",
            "getReportedCollections",
            "getOpenReferrals",
            "getServiceQualityCases",
          ]
        : area === "finanzas"
          ? ["getReportedCollections", "getOutstandingReceivables"]
          : area === "equipo"
            ? ["getTeamAvailability", "getStaffTasks"]
            : [
                "getTodayAppointments",
                "getPendingBookingRequests",
                "getApprovalQueue",
                "getOpenReferrals",
                "getPendingCustomerCommitments",
              ];
  return (
    <>
      <PageTitle
        title={
          kind === "apertura"
            ? "Informe de apertura"
            : kind === "cierre"
              ? "Informe de cierre"
              : kind === "semanal"
                ? "Informe semanal"
                : "Reportes ejecutivos"
        }
      />
      <ExecutiveNav />
      <div className="mb-4 flex flex-wrap gap-3 font-bold text-primary">
        {["apertura", "cierre", "semanal"].map((p) => (
          <Link to={`/direccion/reportes/${p}` as never} key={p}>
            {p}
          </Link>
        ))}
      </div>
      <FinancePeriod period={period} onChange={setPeriod} />
      {kind === "builder" && (
        <label>
          Área
          <select
            className={`${financeInput} mb-3`}
            aria-label="Área del reporte"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            <option value="apertura">Resumen operativo</option>
            <option value="finanzas">Finanzas</option>
            <option value="equipo">Equipo</option>
          </select>
        </label>
      )}
      {validPeriod(period) && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Visitas programadas", snapshot.scheduled],
              ["Visitas registradas finalizadas", snapshot.performed],
              ["Solicitudes pendientes actuales", snapshot.pendingRequests],
              ["Aprobaciones pendientes actuales", snapshot.pendingApprovals],
              ["Cobros reportados", moneyLabel(snapshot.reported)],
              ["Cobros verificados internamente", moneyLabel(snapshot.verified)],
            ].map(([name, value]) => (
              <div className="border-b border-border py-3" key={String(name)}>
                <p className="text-sm">{name}</p>
                <b className="text-xl">{value === null ? "No calculable" : value}</b>
              </div>
            ))}
          </div>
          <p className="my-3 text-xs text-muted-foreground">
            Bogotá · COP · {sources.demo ? "DEMO sintético" : "Lovable Cloud"}. Pendientes actuales
            sin historial no se atribuyen al periodo. Facturación oficial, utilidad, puntualidad,
            comparación histórica y horas recuperadas: fuentes insuficientes. No se infiere
            causalidad.
          </p>
          {tools.map((t) => {
            const r = queryExecutiveTool(t, sources, period);
            return (
              <section className="my-4 border-t border-border py-3" key={t}>
                <h2 className="font-bold">{t}</h2>
                <p className="text-xs text-muted-foreground">
                  {r.source} · {r.status} · {r.sourceTimestamp ?? "Fecha no disponible"}
                </p>
                {r.error && <p role="alert">{r.error}</p>}
                {r.data.map((d) => (
                  <div className="border-b border-border py-2" key={d.id}>
                    <Link to={d.href as never} className="font-bold text-primary">
                      {d.title}
                    </Link>
                    <p className="text-sm">{d.detail}</p>
                  </div>
                ))}
                {r.warnings.map((w) => (
                  <p className="mt-2 text-xs text-muted-foreground" key={w}>
                    {w}
                  </p>
                ))}
              </section>
            );
          })}
        </>
      )}
      <Link
        className="font-bold text-primary"
        to="/direccion/$"
        params={{ _splat: "finanzas/reportes" }}
      >
        Exportación financiera autorizada
      </Link>
      <p className="mt-3 text-xs text-muted-foreground">
        Programación y distribución de informes: no activadas. Guardado oficial de configuración y
        exportación ejecutiva: contrato pendiente.
      </p>
    </>
  );
}
export function ExecutiveAbsence() {
  const sources = useExecutiveSources();
  const [period, setPeriod] = useState({ from: operationalDay(), to: operationalDay() });
  const [primary, setPrimary] = useState("");
  const [secondary, setSecondary] = useState("");
  const [limits, setLimits] = useState("");
  const relevant = (sources.visits.rows ?? []).filter(
    (v) => v.staff_id === "luis" && v.status !== "finalizada",
  );
  const selected = sources.staff.rows?.find((s) => s.id === primary);
  const assignments = [
    {
      responsibility: "Coordinación operativa",
      substituteId: primary,
      enabled: false,
      available: selected?.status === "disponible",
    },
    {
      responsibility: "Respaldo y escalamiento",
      substituteId: secondary,
      enabled: false,
      available: sources.staff.rows?.find((s) => s.id === secondary)?.status === "disponible",
    },
  ];
  const critical =
    (sources.approvals.rows ?? []).filter((a) => a.status === "pendiente").length + relevant.length;
  const coverage = evaluateAbsenceCoverage(period, assignments, critical);
  return (
    <>
      <PageTitle title="Modo ausencia" />
      <ExecutiveNav />
      <FinancePeriod period={period} onChange={setPeriod} />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["principal", primary, setPrimary],
          ["secundario", secondary, setSecondary],
        ].map(([label, value, setter]) => (
          <label key={String(label)}>
            Responsable {String(label)}
            <select
              className={financeInput}
              aria-label={`Responsable ${String(label)}`}
              value={String(value)}
              onChange={(e) => {
                if (typeof setter === "function") setter(e.target.value);
              }}
            >
              <option value="">Seleccionar</option>
              {sources.staff.rows?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} · {s.status}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <label className="mt-3 block">
        Límites de decisión propuestos
        <textarea
          className={financeInput}
          aria-label="Límites de ausencia"
          value={limits}
          onChange={(e) => setLimits(e.target.value)}
        />
      </label>
      <SectionTitle>Plan de cobertura</SectionTitle>
      {assignments.map((a) => (
        <div className="border-b border-border py-3" key={a.responsibility}>
          <b>{a.responsibility}</b>
          <p className="text-sm">
            {a.substituteId || "Sin sustituto"} ·{" "}
            {a.enabled && a.available
              ? "Estado actual registrado; vigencia futura por revalidar"
              : "Permisos/disponibilidad insuficientes"}
          </p>
        </div>
      ))}
      <p className="mt-3 font-bold">
        {coverage.criticalPending} dependencias de visitas/aprobaciones pendientes de revisión.
      </p>
      <p className="text-sm">
        {coverage.gaps.length
          ? `Cobertura incompleta: ${coverage.gaps.join(", ")}`
          : "Sustitutos propuestos; la cobertura futura requiere el motor de disponibilidad y autoridad de servidor."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn disabled>Activar ausencia por contrato protegido</Btn>
        <Link
          className="font-bold text-primary"
          to="/operaciones/$"
          params={{ _splat: "disponibilidad" }}
        >
          Revalidar disponibilidad
        </Link>
        <Link
          className="font-bold text-primary"
          to="/direccion/$"
          params={{ _splat: "propuestas" }}
        >
          Preparar plan para revisión
        </Link>
      </div>
      <SectionTitle>Escalamientos</SectionTitle>
      {["rutina", "vencido", "aprobacion", "clinica", "sistema"].map((k) => (
        <p className="mb-2 text-sm" key={k}>
          {k}: {escalationCategory(k)} · responsable autorizado por confirmar
        </p>
      ))}
      <p className="text-xs text-muted-foreground">
        El plan no concede permisos, no suprime seguridad clínica y no activa notificaciones.
        Ausencia activa/terminada, días cubiertos y resultados: sin recibo protegido.
      </p>
    </>
  );
}
export function ExecutiveAutonomy() {
  const sources = useExecutiveSources();
  const score = calculateAutonomyMetrics({
    resolvedByTeam: null,
    total: null,
    coverage: null,
    approvedPolicy: false,
  });
  const findings = detectOperationalBottlenecks(
    sources.approvals.rows ?? [],
    sources.tasks.rows ?? [],
  );
  return (
    <>
      <PageTitle title="Autonomía operativa" />
      <ExecutiveNav />
      <div className="border-y border-border py-5">
        <h2 className="text-xl font-bold">Owner Freedom Score</h2>
        <p className="mt-2 font-bold">
          {score.status === "INSUFFICIENT_DATA" ? "Datos insuficientes" : score.score}
        </p>
        <p className="text-sm">
          Faltan eventos con actor, tiempos, cobertura y una política aprobada de ponderación. Horas
          recuperadas: no calculables.
        </p>
      </div>
      <SectionTitle>Factores por verificar</SectionTitle>
      {[
        "Decisiones resueltas por el equipo",
        "Dependencia de aprobaciones",
        "Cobertura de responsables",
        "Delegaciones aceptadas y cerradas",
        "Continuidad de atención",
      ].map((f) => (
        <div className="border-b border-border py-3" key={f}>
          <b>{f}</b>
          <p className="text-sm text-muted-foreground">
            Sin serie histórica suficiente ni metodología aprobada.
          </p>
        </div>
      ))}
      <SectionTitle>Observaciones actuales</SectionTitle>
      {findings.map((f) => (
        <Card key={f.id} className="mb-3">
          <b>{f.observation}</b>
          <p>{f.hypothesis}</p>
          <Link
            className="font-bold text-primary"
            to="/direccion/$"
            params={{ _splat: "decisiones" }}
          >
            Revisar fuente {f.id}
          </Link>
        </Card>
      ))}
    </>
  );
}
export function ExecutiveResults({ audit = false }: { audit?: boolean }) {
  const { workspace } = useExecutiveWorkspace();
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  return (
    <>
      <PageTitle title={audit ? "Auditoría de la asistente" : "Resultados y recuperación"} />
      <ExecutiveNav />
      <p className="mb-3">
        No hay recibos oficiales de ejecución conectados. Una propuesta o una aprobación no
        demuestra un cambio realizado.
      </p>
      {audit ? (
        <>
          <p className="text-sm text-muted-foreground">
            Actividad de sesión, no auditoría oficial. La auditoría protegida e inmutable requiere
            Antigravity.
          </p>
          {workspace?.conversations
            .flatMap((c) => c.messages.filter((m) => m.role === "assistant"))
            .map((m) => (
              <div className="border-b border-border py-3" key={m.id}>
                <p>
                  {m.createdAt} · {m.status}
                </p>
                <p className="text-sm">
                  Consultas:{" "}
                  {m.results.map((r) => `${r.source} (${r.status})`).join(", ") ||
                    "Sin herramienta ejecutada"}
                </p>
                <p className="text-xs">
                  Correlaciones: {m.results.map((r) => r.correlationId).join(", ")}
                </p>
              </div>
            ))}
        </>
      ) : (
        <>
          <Empty title="Sin ejecución confirmada" />
          <label className="mt-4 block">
            Referencia de recibo
            <textarea
              className={financeInput}
              aria-label="Recibo de ejecución"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </label>
          <Btn
            className="mt-2"
            variant="outline"
            onClick={() => {
              try {
                const parsed = ExecutiveReceiptSchema.safeParse(JSON.parse(reference));
                setError(
                  parsed.success
                    ? "Formato válido; falta lectura y verificación protegida del servidor. No es un recibo oficial."
                    : "Recibo incompleto; no acredita ejecución",
                );
              } catch {
                setError("Recibo no interpretable; no acredita ejecución");
              }
            }}
          >
            Revisar formato
          </Btn>
          {error && (
            <p className="mt-2" role="status">
              {error}
            </p>
          )}
          <SectionTitle>Recuperación segura</SectionTitle>
          <p className="text-sm">
            Revalidar fuente/versión, revisar permiso y consultar estado antes de repetir la misma
            clave. No se reintenta un envío externo ni se deshace una acción irreversible.
          </p>
          <Link
            to="/direccion/$"
            params={{ _splat: "propuestas" }}
            className="mt-3 block font-bold text-primary"
          >
            Preparar solicitud de revisión
          </Link>
        </>
      )}
    </>
  );
}
export function ExecutiveUsage() {
  return (
    <>
      <PageTitle title="Uso de IA de Dirección" />
      <ExecutiveNav />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Proveedor ejecutivo", "No conectado"],
          ["Voz / transcripción", "Proveedor pendiente; captura explícita local"],
          ["Solicitudes, tokens y costos", "No calculables sin fuente de proveedor"],
          ["Latencia reportada", "Sin métricas autorizadas"],
          ["Acciones oficiales", "No disponibles sin contrato protegido"],
          ["Modo actual", "Consultas y borradores por reglas"],
        ].map(([name, value]) => (
          <div className="border-b border-border py-3" key={name}>
            <b>{name}</b>
            <p>{value}</p>
          </div>
        ))}
      </div>
      <SectionTitle>Herramientas preparadas</SectionTitle>
      {TOOL_REGISTRY.map((t) => (
        <div className="border-b border-border py-2 break-words" key={t.toolId}>
          <b className="text-sm">{t.name}</b>
          <p className="text-xs">
            {t.available
              ? "Adaptador de lectura de fuentes existentes"
              : "Contrato/fuente completa pendiente"}{" "}
            · Riesgo {t.riskLevel} · Dirección/Administración · Solo lectura
          </p>
        </div>
      ))}
      <SectionTitle>Contratos de autoridad</SectionTitle>
      <p className="text-sm">
        {EXECUTIVE_CONTRACTS.length} contratos preparados. Sin endpoints inventados. Límites y
        credenciales no se cambian desde esta pantalla.
      </p>
      <Btn className="mt-3" variant="outline" disabled>
        Guardar política oficial
      </Btn>
    </>
  );
}
