import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";
import { db } from "@/lib/vf/db";
import { getVF, useVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import {
  money,
  moneyLabel,
  amountText,
  visitCost,
  contribution,
  replenish,
  batchState,
  scenario,
  csvCell,
  FinancialDraftSchema,
  type FinancialDraft,
  type CostPart,
} from "../domain";
import { checkedWrite } from "@/features/referrals/application/gateway";
import { useReferralRows } from "@/features/referrals/components/data";
import { operationalDay } from "@/features/field-operations/domain/advanced";
import { useFinanceData, label } from "../application/sources";
import { FinanceDirectory } from "./FinanceDirectory";
import { FinancePeriod, FinanceSourceState, financeInput } from "./FinanceControls";
import { canReadFinance } from "@/features/system-administration/domain/access";
import {
  bogotaDate,
  validPeriod,
  inFinancePeriod,
  knownMoney,
  knownTotal,
  collectionState,
  duplicateReferences,
} from "../domain/presentation";
const input = financeInput;
function financeBase(roles: string[]) {
  return roles.some((r) => r === "luis" || r === "administrador")
    ? "/direccion/finanzas"
    : "/finanzas";
}
const pages = [
  ["", "Resumen"],
  ["cobros", "Cobros"],
  ["tarifas", "Tarifas"],
  ["proveedores", "Proveedores"],
  ["servicios", "Servicios"],
  ["facturacion", "Facturación"],
  ["conciliacion", "Conciliación"],
  ["costos", "Costos"],
  ["rentabilidad/servicios", "Márgenes"],
  ["clientes", "Familias"],
  ["reportes", "Reportes"],
  ["simulador", "Escenarios"],
] as const;
function FinanceNav() {
  const roles = useVF((s) => s.roles);
  const base = financeBase(roles);
  return (
    <nav className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-primary">
      {pages.map(([p, l]) => (
        <Link key={l} to={`${base}${p ? "/" + p : ""}` as never}>
          {l}
        </Link>
      ))}
    </nav>
  );
}
function Metric({ name, value, note }: { name: string; value: bigint | null; note: string }) {
  return (
    <div className="border-b border-border py-3">
      <p className="text-sm">{name}</p>
      <b className="block break-words text-xl">{moneyLabel(value)}</b>
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
}
function useFinancialPeriod() {
  const day = operationalDay();
  return useState({ from: day.slice(0, 8) + "01", to: day });
}
export function FinanceDashboard() {
  const data = useFinanceData();
  const [period, setPeriod] = useFinancialPeriod();
  const roles = useVF((s) => s.roles);
  const base = financeBase(roles);
  const [client, setClient] = useState("");
  const [concept, setConcept] = useState("");
  const charges = (data.payments.rows ?? []).filter(
    (x) =>
      inFinancePeriod(x.date, period) &&
      (!client || x.client === client) &&
      (!concept || x.concept === concept),
  );
  const collections = (data.records.rows ?? []).filter(
    (r) =>
      ["cobro_campo", "finance_payment_report"].includes(r.kind) &&
      inFinancePeriod(r.created_at, period),
  );
  const unknown = (data.payments.rows ?? []).filter((x) => bogotaDate(x.date) === null).length;
  const invalidAmounts = charges.filter((x) => knownMoney(x.amount) === null).length;
  const sum = (xs: typeof charges) => knownTotal(xs.map((c) => c.amount));
  const receiptTotal = (state: "REPORTED" | "VERIFIED") =>
    client || concept
      ? null
      : knownTotal(
          collections
            .filter((r) => collectionState(r.kind, r.status) === state)
            .map((r) => r.data["amount"]),
        );
  return (
    <>
      <PageTitle title="Finanzas de Vet Life" subtitle="Control de cobros y fuentes registradas" />
      <FinanceNav />
      <FinancePeriod period={period} onChange={setPeriod} />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label>
          Familia
          <select
            className={input}
            aria-label="Filtrar familia"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          >
            <option value="">Todas</option>
            {[...new Set((data.payments.rows ?? []).map((p) => p.client))].sort().map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Concepto
          <select
            className={input}
            aria-label="Filtrar concepto"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
          >
            <option value="">Todos</option>
            {[...new Set((data.payments.rows ?? []).map((p) => p.concept))].sort().map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <FinanceSourceState sources={[data.payments, data.records]}>
        {validPeriod(period) && (
          <>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Metric
                name="Cargos administrativos del periodo"
                value={sum(charges)}
                note="Registros de cobro; no equivalen a facturas electrónicas."
              />
              <Metric
                name="Registrados como pagados"
                value={sum(charges.filter((c) => c.status === "pagado"))}
                note="Estado histórico del cargo; no implica conciliación bancaria."
              />
              <Metric
                name="Cobros informados"
                value={receiptTotal("REPORTED")}
                note={
                  client || concept
                    ? "Sin vínculo autorizado que permita atribuir cada recepción a estos filtros."
                    : "Reportes de campo y borradores administrativos; no reducen el saldo verificado."
                }
              />
              <Metric
                name="Cobros de campo verificados"
                value={receiptTotal("VERIFIED")}
                note={
                  client || concept
                    ? "Sin vínculo autorizado por familia/concepto."
                    : "Procedimiento interno; no implica conciliación bancaria ni asignación a cargos."
                }
              />
              <Metric
                name="Saldo registrado en cargos"
                value={sum(charges.filter((c) => c.status !== "pagado"))}
                note="Sin aplicar cobros de campo: falta asignación protegida entre pagos y cargos."
              />
              <Metric
                name="Facturación oficial y conciliación"
                value={null}
                note="Sin proveedor oficial ni referencia financiera conciliada."
              />
              <Metric
                name="Margen neto"
                value={null}
                note="Faltan costos completos, política de reconocimiento y gastos asignados."
              />
            </div>
            {unknown > 0 && (
              <p className="mt-4 text-sm font-bold">
                {unknown} cargos sin fecha interpretable: excluidos del periodo.
              </p>
            )}
            {invalidAmounts > 0 && (
              <p role="alert">
                {invalidAmounts} importes incompletos: totales afectados no calculables.
              </p>
            )}
            {!charges.length && <Empty title="Sin cargos en el periodo y filtros elegidos" />}
          </>
        )}
      </FinanceSourceState>
      <SectionTitle>Pendientes de atención</SectionTitle>
      <Link className="mb-3 block font-bold text-primary" to={`${base}/servicios` as never}>
        Servicios realizados y referencias de facturación
      </Link>
      <Link
        className="mb-3 block font-bold text-primary"
        to="/finanzas/$"
        params={{ _splat: "cobros-campo" }}
      >
        Revisión interna de cobros de campo
      </Link>
      <Link
        className="font-bold text-primary"
        to="/admin/$"
        params={{ _splat: "inventario/compras" }}
      >
        Revisar reposición e inventario
      </Link>
    </>
  );
}
export function FinanceCharges({
  onlyOpen = false,
  chargeId,
}: {
  onlyOpen?: boolean;
  chargeId?: string;
}) {
  const data = useFinanceData();
  const roles = useVF((s) => s.roles);
  const base = financeBase(roles);
  const [q, setQ] = useState("");
  const [period, setPeriod] = useFinancialPeriod();
  const [stage, setStage] = useState("charges");
  const list = (data.payments.rows ?? []).filter((p) =>
    chargeId
      ? p.id === chargeId
      : (!onlyOpen || p.status !== "pagado") &&
        `${p.client} ${p.concept}`.toLowerCase().includes(q.toLowerCase()) &&
        inFinancePeriod(p.date, period),
  );
  const collections = (data.records.rows ?? []).filter((r) =>
    ["cobro_campo", "finance_payment_report"].includes(r.kind),
  );
  const duplicates = duplicateReferences(collections);
  const shownCollections = collections.filter(
    (r) =>
      inFinancePeriod(r.created_at, period) &&
      `${r.title} ${r.detail} ${label(r.data["reference"])}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      collectionState(r.kind, r.status) === (stage === "verified" ? "VERIFIED" : "REPORTED"),
  );
  return (
    <>
      <PageTitle
        title={chargeId ? "Detalle de cargo" : onlyOpen ? "Cuentas por cobrar" : "Cargos y cobros"}
      />
      <FinanceNav />
      {!chargeId && (
        <>
          <FinancePeriod period={period} onChange={setPeriod} />
          <input
            className={`${input} mb-4`}
            aria-label="Buscar cargo"
            placeholder="Cliente, concepto o referencia"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {!onlyOpen && (
            <div
              className="mb-4 flex flex-wrap gap-2"
              role="tablist"
              aria-label="Fuente financiera"
            >
              {[
                ["charges", "Cargos"],
                ["reported", "Reportados"],
                ["verified", "Verificados"],
                ["reconciled", "Conciliados"],
              ].map(([value, title]) => (
                <Btn
                  key={value}
                  role="tab"
                  aria-selected={stage === value}
                  variant={stage === value ? "primary" : "outline"}
                  onClick={() => setStage(value ?? "charges")}
                >
                  {title}
                </Btn>
              ))}
            </div>
          )}
        </>
      )}
      <FinanceSourceState sources={[data.payments, data.records]}>
        {(chargeId || validPeriod(period)) && (
          <>
            {stage === "charges" && (
              <>
                {list.map((p) => (
                  <Card key={p.id} className="mb-3 break-words">
                    <Link
                      className="font-bold text-primary"
                      to={`${base}/cobros/${encodeURIComponent(p.id)}` as never}
                    >
                      {p.client}
                    </Link>
                    <p>
                      {p.concept} · {bogotaDate(p.date) ?? "Fecha incompleta"}
                    </p>
                    <p className="text-xl font-bold">{moneyLabel(knownMoney(p.amount))}</p>
                    <p className="text-sm">
                      {p.status === "pagado"
                        ? "Registrado como pagado"
                        : p.status === "vencido"
                          ? "Vencido"
                          : "Pendiente"}
                    </p>
                    {chargeId && (
                      <>
                        <p className="mt-3 text-sm">Fuente: cargo administrativo {p.id} · COP</p>
                        <p className="text-sm">
                          Factura oficial, versión de tarifa aplicada y asignaciones de pago: no
                          disponibles en esta fuente.
                        </p>
                        <p className="text-sm">
                          Saldo verificado: no calculable sin asignaciones protegidas. El estado
                          histórico no certifica recepción bancaria.
                        </p>
                        {collections
                          .filter((r) => r.kind === "finance_payment_report" && r.ref_id === p.id)
                          .map((r) => (
                            <p className="mt-2 text-sm" key={r.id}>
                              Borrador relacionado: {r.title} ·{" "}
                              {moneyLabel(knownMoney(r.data["amount"]))} · Reportado, sin asignación
                              oficial.
                            </p>
                          ))}
                      </>
                    )}
                    <Link
                      className="mt-3 block font-bold text-primary"
                      to={`${base}/pagos/nuevo?cargo=${encodeURIComponent(p.id)}` as never}
                    >
                      Reportar pago o solicitar revisión
                    </Link>
                  </Card>
                ))}
                {!list.length && (
                  <Empty
                    title={
                      chargeId
                        ? "Cargo no encontrado entre las fuentes autorizadas"
                        : "Sin cargos que coincidan"
                    }
                  />
                )}
              </>
            )}
            {["reported", "verified"].includes(stage) && (
              <>
                {shownCollections.map((r) => (
                  <Card key={r.id} className="mb-3 break-words">
                    <b>{r.title}</b>
                    <p className="font-bold">{moneyLabel(knownMoney(r.data["amount"]))}</p>
                    <p>
                      {r.kind === "cobro_campo" ? "Recepción de campo" : "Borrador administrativo"}{" "}
                      · {bogotaDate(r.created_at) ?? "Fecha incompleta"}
                    </p>
                    <p className="text-sm">
                      {r.detail} · Referencia: {label(r.data["reference"]) || "No registrada"}
                    </p>
                    <p className="text-sm">
                      {stage === "verified"
                        ? "Verificado internamente; no conciliado ni asignado a cargos"
                        : "Reportado; no verificado"}{" "}
                      · Origen relacionado: {r.ref_id || "No registrado"}
                    </p>
                    {duplicates.has(r.id) && (
                      <p className="text-sm font-bold">
                        Referencia repetida: requiere revisión, no se elimina ni concilia
                        automáticamente.
                      </p>
                    )}
                  </Card>
                ))}
                {!shownCollections.length && <Empty title="Sin cobros en este estado y periodo" />}
              </>
            )}
            {stage === "reconciled" && (
              <Empty
                title="Conciliación no disponible"
                hint="No hay movimientos bancarios ni asignaciones autorizadas para confirmar conciliaciones."
              />
            )}
          </>
        )}
      </FinanceSourceState>
      <Link className="font-bold text-primary" to={`${base}/ajustes/nuevo` as never}>
        Preparar ajuste con referencia original
      </Link>
    </>
  );
}
export function FinanceDraftForm({
  kind,
  entityId = "",
}: {
  kind: FinancialDraft["kind"];
  entityId?: string;
}) {
  const data = useFinanceData();
  const [f, setF] = useState<FinancialDraft>({
    kind,
    title: "",
    reference: "",
    amount: "0",
    entityId,
    detail: "",
  });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const cargo = q.get("cargo");
    if (cargo) setF((x) => ({ ...x, entityId: cargo }));
  }, []);
  const names: Record<FinancialDraft["kind"], string> = {
    billing_request: "Solicitud de facturación",
    payment_report: "Reporte de pago",
    refund_request: "Solicitud de ajuste o devolución",
    purchase_request: "Solicitud de compra",
    supplier: "Ficha de proveedor",
    cost_entry: "Registro de costo directo",
    expense: "Gasto operativo",
    price_proposal: "Propuesta de tarifa",
    cold_chain_review: "Solicitud de revisión de cadena de frío",
  };
  const save = async () => {
    const parsed = FinancialDraftSchema.safeParse(f);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Revisa los campos");
      return;
    }
    if (!data.director) {
      toast.error("El registro reservado requiere Dirección; no se modificó ningún dato oficial");
      return;
    }
    setBusy(true);
    try {
      if (getVF().userId?.startsWith("demo-")) {
        toast.success("Borrador de demostración; sin efectos reales");
        return;
      }
      await checkedWrite(
        db
          .from("records")
          .insert({
            kind: `finance_${kind}`,
            scope: "director",
            ref_id: f.entityId || null,
            title: f.title,
            detail: f.detail,
            status: "requested",
            data: {
              amount: amountText(money(f.amount)),
              reference: f.reference,
              currency: "COP",
              module: "finance-p09",
            },
            created_by: getVF().userId,
          })
          .select("id"),
      );
      await data.records.reload();
      toast.success("Solicitud guardada; no se verificó un pago ni se modificó inventario");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  const rows = (data.records.rows ?? []).filter((r) => r.kind === `finance_${kind}`);
  return (
    <>
      <PageTitle title={names[kind]} />
      <FinanceNav />
      {!data.director ? (
        <p className="mb-4 font-bold">
          La persistencia protegida para el perfil Finanzas requiere el contrato autorizado;
          Dirección puede preparar el registro reservado.
        </p>
      ) : (
        <div className="space-y-3">
          {(
            [
              ["title", "Concepto"],
              ["reference", "Fuente o documento de referencia"],
              ["amount", "Importe COP"],
              ["entityId", "Visita, cargo o producto relacionado"],
              ["detail", "Motivo y condiciones"],
            ] as const
          ).map(([key, name]) => (
            <label key={key} className="block">
              {name}
              <input
                className={input}
                aria-label={name}
                value={f[key]}
                onChange={(e) => setF({ ...f, [key]: e.target.value })}
              />
            </label>
          ))}
          <Btn disabled={busy} onClick={() => void save()}>
            <Plus className="h-4 w-4" />
            Guardar solicitud
          </Btn>
        </div>
      )}
      <p className="mt-3 text-sm">
        Borrador administrativo. No es factura oficial, pago verificado, autorización de compra ni
        entrada física de inventario.
      </p>
      <SectionTitle>Registros preparados</SectionTitle>
      {rows.map((r) => (
        <Card className="mb-3" key={r.id}>
          <b>{r.title}</b>
          <p>{r.detail}</p>
          <p>{moneyLabel(money(label(r.data["amount"]) || "0"))}</p>
          <p className="text-sm">Fuente: {label(r.data["reference"])} · Pendiente de revisión</p>
        </Card>
      ))}
      {!rows.length && <Empty title="Sin solicitudes registradas" />}
    </>
  );
}
export function UnbilledServices() {
  const visits = useVF((s) => s.visits);
  const pets = useVF((s) => s.pets);
  const execs = useReferralRows<{ visit_id: string; state: string }>("visit_executions");
  const data = useFinanceData();
  const performed = visits.filter(
    (v) =>
      v.status === "finalizada" ||
      execs.rows?.some(
        (e) =>
          e.visit_id === v.id &&
          ["SERVICE_FINISHED", "ADMINISTRATIVE_REVIEW", "ADMINISTRATIVELY_COMPLETED"].includes(
            e.state,
          ),
      ),
  );
  return (
    <>
      <PageTitle title="Servicios prestados y revisión de facturación" />
      <FinanceNav />
      {performed.map((v) => {
        const drafts =
          data.records.rows?.filter(
            (r) => r.kind === "finance_billing_request" && r.ref_id === v.id,
          ) ?? [];
        return (
          <Card key={v.id} className="mb-3">
            <b>
              {pets.find((p) => p.id === v.petId)?.name ?? "Paciente"} · {v.service}
            </b>
            <p>
              {v.date} {v.time} · {v.zone}
            </p>
            <p className="text-sm">
              {drafts.length
                ? "Solicitud administrativa preparada"
                : "Sin referencia de facturación vinculada"}
            </p>
            <Link
              className="mt-2 block font-bold text-primary"
              to={`/direccion/finanzas/facturacion/nueva?cargo=${v.id}` as never}
            >
              Preparar solicitud
            </Link>
          </Card>
        );
      })}
      {!performed.length && <Empty title="Sin servicios realizados en los registros visibles" />}
      <p className="mt-4 text-sm">
        Ausencia de referencia no demuestra ausencia de una factura externa. No se emitió ningún
        documento oficial.
      </p>
    </>
  );
}
export function FinanceReconciliation() {
  const data = useFinanceData();
  const [reference, setReference] = useState("");
  const list = (data.payments.rows ?? []).filter((p) => !reference || p.id.includes(reference));
  return (
    <>
      <PageTitle title="Conciliación y diferencias" />
      <FinanceNav />
      <input
        className={`${input} mb-3`}
        aria-label="Referencia a buscar"
        placeholder="Referencia administrativa"
        value={reference}
        onChange={(e) => setReference(e.target.value)}
      />
      {list.map((p) => (
        <Card key={p.id} className="mb-3">
          <b>
            {p.client} · {p.id}
          </b>
          <p>{moneyLabel(money(p.amount))}</p>
          <p className="text-sm">Sin movimiento bancario autorizado para comparar</p>
          <Btn className="mt-2" variant="outline" disabled>
            Solicitar conciliación protegida
          </Btn>
        </Card>
      ))}
      <p className="text-sm font-bold">
        Una coincidencia propuesta no verifica recepción. La conciliación requiere referencias del
        proveedor financiero.
      </p>
    </>
  );
}
export function FinanceCosts({ profit = false }: { profit?: boolean }) {
  const visits = useVF((s) => s.visits);
  const data = useFinanceData();
  const [selected, setSelected] = useState("");
  const [f, setF] = useState({
    component: "professional",
    amount: "",
    source: "",
    version: "",
    estimated: false,
  });
  const [busy, setBusy] = useState(false);
  const components = {
    professional: "Tiempo profesional",
    travel: "Desplazamiento",
    supplies: "Insumos",
    other: "Otros costos directos",
  };
  const rows = (data.records.rows ?? []).filter(
    (r) => r.kind === "finance_visit_cost" && r.ref_id === selected,
  );
  const parts: CostPart[] = rows.flatMap((r) => {
    const component = label(r.data["component"]);
    if (!["professional", "travel", "supplies", "other"].includes(component)) return [];
    return [
      {
        id: r.id,
        component: component as CostPart["component"],
        amount: label(r.data["amount"]),
        source: label(r.data["source"]),
        estimated: r.data["estimated"] === true,
        version: label(r.data["version"]),
      },
    ];
  });
  const cost = visitCost(parts);
  const save = async () => {
    if (!selected || !f.source.trim() || !f.version.trim() || !f.amount) {
      toast.error("Indica visita, importe, fuente y versión de costo");
      return;
    }
    try {
      if (money(f.amount) < 0n) throw new Error("Costo negativo");
      setBusy(true);
      if (getVF().userId?.startsWith("demo-")) {
        toast.success("Costo hipotético de demostración");
        return;
      }
      await checkedWrite(
        db
          .from("records")
          .insert({
            kind: "finance_visit_cost",
            scope: "director",
            ref_id: selected,
            title: components[f.component as keyof typeof components],
            detail: f.source,
            status: f.estimated ? "estimated" : "recorded",
            data: { ...f, amount: amountText(money(f.amount)) },
            created_by: getVF().userId,
          })
          .select("id"),
      );
      await data.records.reload();
      toast.success("Costo registrado con fuente y versión; históricos conservados");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title={profit ? "Rentabilidad y datos faltantes" : "Costos directos por visita"} />
      <FinanceNav />
      {!data.director ? (
        <p>
          Costos profesionales reservados; falta el contrato financiero protegido para este perfil.
        </p>
      ) : (
        <>
          <select
            className={`${input} mb-3`}
            aria-label="Visita para costos"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Seleccionar visita</option>
            {visits.map((v) => (
              <option key={v.id} value={v.id}>
                {v.date} {v.time} · {v.service} · {v.zone}
              </option>
            ))}
          </select>
          {selected && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  Componente
                  <select
                    className={input}
                    aria-label="Componente de costo"
                    value={f.component}
                    onChange={(e) => setF({ ...f, component: e.target.value })}
                  >
                    {Object.entries(components).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                {(
                  [
                    ["amount", "Costo COP"],
                    ["source", "Fuente del costo"],
                    ["version", "Versión de costo"],
                  ] as const
                ).map(([key, name]) => (
                  <label key={key}>
                    {name}
                    <input
                      className={input}
                      aria-label={name}
                      value={f[key]}
                      onChange={(e) => setF({ ...f, [key]: e.target.value })}
                    />
                  </label>
                ))}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={f.estimated}
                    onChange={(e) => setF({ ...f, estimated: e.target.checked })}
                  />
                  Estimado
                </label>
                <Btn disabled={busy} onClick={() => void save()}>
                  Registrar costo con fuente
                </Btn>
              </div>
              <SectionTitle>Costos registrados</SectionTitle>
              {parts.map((p) => (
                <Card key={p.id} className="mb-2">
                  <b>{components[p.component]}</b>
                  <p>
                    {moneyLabel(money(p.amount))} · {p.estimated ? "Estimado" : "Registrado"}
                  </p>
                  <p className="text-sm">
                    {p.source} · versión {p.version}
                  </p>
                </Card>
              ))}
              <Metric
                name="Costo directo completo"
                value={cost.total}
                note={
                  cost.missing.length
                    ? `Falta registrar: ${cost.missing.map((c) => components[c as keyof typeof components]).join(", ")}`
                    : cost.status === "ESTIMATED"
                      ? "Incluye estimaciones"
                      : "Componentes registrados con fuente"
                }
              />
              <Metric
                name="Margen de contribución"
                value={null}
                note="Falta vincular ingreso y política de reconocimiento a la visita. No se inventó utilidad neta."
              />
            </>
          )}
        </>
      )}
    </>
  );
}
export function InventoryFinance({ mode = "central" }: { mode?: string }) {
  const items = useVF((s) => s.items);
  const [reserved, setReserved] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const day = operationalDay();
  useEffect(() => {
    void db
      .rpc("inventory_availability")
      .then(
        (r: {
          data: { item_id: string; reserved: number }[] | null;
          error: { message: string } | null;
        }) => {
          if (r.error) setError(r.error.message);
          else
            setReserved(
              Object.fromEntries((r.data ?? []).map((x) => [x.item_id, Number(x.reserved)])),
            );
        },
      );
  }, []);
  return (
    <>
      <PageTitle
        title={
          mode === "lotes"
            ? "Lotes y vencimientos"
            : mode === "compras"
              ? "Reposición y compras"
              : "Inventario financiero"
        }
      />
      <nav className="mb-4 flex flex-wrap gap-3 font-bold text-primary">
        {[
          ["", "Central"],
          ["lotes", "Lotes"],
          ["compras", "Reposición"],
          ["compras/nueva", "Nueva solicitud"],
          ["cadena-frio", "Cadena de frío"],
        ].map(([p, l]) => (
          <Link key={l} to={`/admin/inventario${p ? "/" + p : ""}` as never}>
            {l}
          </Link>
        ))}
      </nav>
      {error && <p role="alert">{error}</p>}
      {items.map((i) => {
        const r = replenish(i.stock, reserved[i.id] ?? 0, i.min);
        const state = batchState(i.expires, day, false, i.stock);
        return (
          <Card key={i.id} className="mb-3">
            <b>{i.name}</b>
            <p>
              Lote {i.lot} · {i.expires || "Sin vencimiento informado"}
            </p>
            <p className="text-sm">
              Registrado {i.stock} · Reservado {reserved[i.id] ?? 0} · Disponible {r.available}
            </p>
            <p className="text-sm font-bold">
              {
                {
                  EXPIRED: "Vencido: no utilizar",
                  NEAR_EXPIRY: "Vencimiento próximo (30 días)",
                  ACTIVE: "Vigente",
                  UNKNOWN: "Fecha no interpretable",
                  QUARANTINED: "En revisión",
                  DEPLETED: "Agotado",
                }[state]
              }
            </p>
            <p className="text-sm">
              Valor del inventario: no calculable sin costo unitario y método aprobado
            </p>
            {mode === "compras" && (
              <p className="text-sm font-bold">
                Sugerencia: {r.suggested} unidades · {r.reason}. No es una orden de compra.
              </p>
            )}
          </Card>
        );
      })}
    </>
  );
}
export function CustomerFinance() {
  const data = useFinanceData();
  const pets = useVF((s) => s.pets);
  const visits = useVF((s) => s.visits);
  const [sort, setSort] = useState("charges");
  const groups = [...new Set((data.payments.rows ?? []).map((p) => p.client))]
    .map((name) => {
      const charges = (data.payments.rows ?? []).filter((p) => p.client === name);
      const ps = pets.filter((p) => p.owner === name);
      const n = visits.filter((v) => ps.some((p) => p.id === v.petId)).length;
      return {
        name,
        total: charges.reduce((a, c) => a + money(c.amount), 0n),
        registeredPaid: charges
          .filter((p) => p.status === "pagado")
          .reduce((a, c) => a + money(c.amount), 0n),
        pets: ps.length,
        visits: n,
      };
    })
    .sort((a, b) =>
      sort === "visits" ? b.visits - a.visits : a.total > b.total ? -1 : a.total < b.total ? 1 : 0,
    );
  return (
    <>
      <PageTitle title="Valor y recurrencia de familias" />
      <FinanceNav />
      <select
        className={`${input} mb-4`}
        aria-label="Ordenar familias"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="charges">Cargos administrativos</option>
        <option value="visits">Número de visitas</option>
      </select>
      {groups.map((g) => (
        <Card key={g.name} className="mb-3">
          <b>{g.name}</b>
          <p>Cargos: {moneyLabel(g.total)}</p>
          <p>Registrado como pagado: {moneyLabel(g.registeredPaid)}</p>
          <p>
            {g.visits} visitas · {g.pets} mascotas
          </p>
          <p className="text-xs text-muted-foreground">
            Margen no calculable. No se usa este valor para priorizar atención clínica.
          </p>
        </Card>
      ))}
      {!groups.length && <Empty title="Sin cargos de familias visibles" />}
    </>
  );
}
export function FinancialScenario() {
  const [f, setF] = useState({ income: "", cost: "", price: "0", change: "0" });
  let result: ReturnType<typeof scenario> | null = null;
  try {
    if (f.income && f.cost)
      result = scenario(f.income, f.cost, Number(f.price) * 100, Number(f.change) * 100);
  } catch {}
  return (
    <>
      <PageTitle title="Escenario financiero hipotético" />
      <FinanceNav />
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["income", "Ingreso de referencia COP"],
            ["cost", "Costo de referencia COP"],
            ["price", "Variación de tarifa %"],
            ["change", "Variación de costo %"],
          ] as const
        ).map(([key, name]) => (
          <label key={key}>
            {name}
            <input
              className={input}
              aria-label={name}
              value={f[key]}
              onChange={(e) => setF({ ...f, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {result && (
        <>
          <Metric
            name="Ingreso proyectado"
            value={result.projectedRevenue}
            note="Hipótesis, no ingreso realizado"
          />
          <Metric
            name="Costo proyectado"
            value={result.projectedCost}
            note="Hipótesis, no gasto registrado"
          />
          <Metric
            name="Margen del escenario"
            value={result.margin}
            note="No es utilidad neta ni modifica tarifas, compras o visitas"
          />
        </>
      )}
      <Link
        className="mt-4 block font-bold text-primary"
        to="/operaciones/$"
        params={{ _splat: "simulador" }}
      >
        Simulador operativo de agenda
      </Link>
    </>
  );
}
export function FinanceReports() {
  const data = useFinanceData();
  const [period, setPeriod] = useFinancialPeriod();
  const rows = (data.payments.rows ?? []).filter((p) => inFinancePeriod(p.date, period));
  const incomplete = rows.some((p) => knownMoney(p.amount) === null);
  const download = () => {
    if (!validPeriod(period) || data.payments.error || !data.payments.rows || incomplete) return;
    const content = [
      ["Referencia", "Cliente", "Concepto", "Importe COP", "Estado registrado", "Fecha Bogotá"],
      ...rows.map((p) => [
        p.id,
        p.client,
        p.concept,
        amountText(money(p.amount)),
        p.status,
        bogotaDate(p.date) ?? "",
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `vet-life-cargos-${period.from}-${period.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <PageTitle title="Reportes financieros autorizados" />
      <FinanceNav />
      <FinancePeriod period={period} onChange={setPeriod} />
      <FinanceSourceState sources={[data.payments]}>
        {validPeriod(period) && (
          <>
            <Btn disabled={!rows.length || incomplete} onClick={download}>
              <Download className="h-4 w-4" />
              Exportar cargos CSV
            </Btn>
            <p className="mt-3">
              Cargos visibles para tu cuenta, sin información clínica. No constituye reporte
              tributario oficial.
            </p>
            {incomplete && <p role="alert">Hay importes incompletos: exportación no disponible.</p>}
            <SectionTitle>Vista previa</SectionTitle>
            {rows.map((p) => (
              <Card key={p.id} className="mb-2">
                <b>{p.concept}</b>
                <p>
                  {p.client} · {moneyLabel(knownMoney(p.amount))} · {p.status} ·{" "}
                  {bogotaDate(p.date)}
                </p>
              </Card>
            ))}
            {!rows.length && <Empty title="Sin cargos en el periodo elegido" />}
          </>
        )}
      </FinanceSourceState>
    </>
  );
}
function FinanceAllowed({ children }: { children: ReactNode }) {
  const roles = useVF((s) => s.roles);
  const uid = useVF((s) => s.userId);
  return canReadFinance(roles, uid) ? (
    <>{children}</>
  ) : (
    <Empty title="Acceso financiero no autorizado" />
  );
}
export function financePage(path: string): ReactNode | null {
  const normalized = path.replace(/\/$/, "");
  const p = normalized.replace(/^\/admin\/tarifas(?=\/|$)/, "/admin/finanzas/tarifas");
  if (p.startsWith("/admin/inventario")) {
    const part = p.slice("/admin/inventario".length).replace(/^\//, "");
    if (part === "compras/nueva")
      return (
        <FinanceAllowed>
          <FinanceDraftForm kind="purchase_request" />
        </FinanceAllowed>
      );
    if (part === "cadena-frio")
      return (
        <FinanceAllowed>
          <FinanceDraftForm kind="cold_chain_review" />
        </FinanceAllowed>
      );
    if (["", "lotes", "compras"].includes(part))
      return (
        <FinanceAllowed>
          <InventoryFinance mode={part || "central"} />
        </FinanceAllowed>
      );
    return null;
  }
  if (/^\/admin\/proveedores(?:\/[^/]+)?$/.test(p)) {
    const detail = p.split("/")[3];
    return (
      <FinanceAllowed>
        <FinanceDirectory
          kind="supplier"
          base="/admin/proveedores"
          {...(detail ? { detail } : {})}
          form={<FinanceDraftForm kind="supplier" />}
        />
      </FinanceAllowed>
    );
  }
  if (p === "/direccion/oportunidades")
    return (
      <FinanceAllowed>
        <FinanceDashboard />
      </FinanceAllowed>
    );
  const m = p.match(/^\/(?:finanzas|direccion\/finanzas|admin\/finanzas)(?:\/(.*))?$/);
  if (!m) return null;
  const [view = "", detail] = (m[1] ?? "").split("/");
  let page: ReactNode;
  switch (view) {
    case "":
    case "inicio":
      page = <FinanceDashboard />;
      break;
    case "cobros":
    case "cuentas-por-cobrar":
      page = (
        <FinanceCharges
          onlyOpen={view === "cuentas-por-cobrar"}
          {...(detail ? { chargeId: decodeURIComponent(detail) } : {})}
        />
      );
      break;
    case "pagos":
      page = <FinanceDraftForm kind="payment_report" />;
      break;
    case "ajustes":
    case "devoluciones":
      page = <FinanceDraftForm kind="refund_request" />;
      break;
    case "facturacion":
    case "facturas":
      page =
        detail === "nueva" ? <FinanceDraftForm kind="billing_request" /> : <UnbilledServices />;
      break;
    case "servicios":
    case "servicios-pendientes":
      page = <UnbilledServices />;
      break;
    case "conciliacion":
      page = <FinanceReconciliation />;
      break;
    case "costos":
      page = <FinanceCosts />;
      break;
    case "rentabilidad":
    case "rentabilidad-servicio":
    case "rentabilidad-zona":
      page = <FinanceCosts profit />;
      break;
    case "clientes":
      page = <CustomerFinance />;
      break;
    case "reportes":
      page = <FinanceReports />;
      break;
    case "simulador":
      page = <FinancialScenario />;
      break;
    case "precios":
    case "tarifas":
      page = (
        <FinanceDirectory
          kind="price_proposal"
          base={`${p
            .split("/")
            .slice(0, p.startsWith("/direccion/") || p.startsWith("/admin/") ? 3 : 2)
            .join("/")}/tarifas`}
          {...(detail ? { detail: decodeURIComponent(detail) } : {})}
          form={<FinanceDraftForm kind="price_proposal" />}
        />
      );
      break;
    case "proveedores":
      page = (
        <FinanceDirectory
          kind="supplier"
          base={`${p
            .split("/")
            .slice(0, p.startsWith("/direccion/") || p.startsWith("/admin/") ? 3 : 2)
            .join("/")}/proveedores`}
          {...(detail ? { detail: decodeURIComponent(detail) } : {})}
          form={<FinanceDraftForm kind="supplier" />}
        />
      );
      break;
    case "gastos":
      page = <FinanceDraftForm kind="expense" />;
      break;
    default:
      return null;
  }
  return <FinanceAllowed>{page}</FinanceAllowed>;
}
