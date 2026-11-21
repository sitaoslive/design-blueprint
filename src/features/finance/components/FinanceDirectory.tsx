import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Card, Empty, PageTitle, Btn } from "@/components/vf/ui";
import { useFinanceRows, label, type RecordRow, type ArticleRow } from "../application/sources";
import { knownMoney, bogotaDate } from "../domain/presentation";
import { moneyLabel } from "../domain";
import { FinanceSourceState, financeInput } from "./FinanceControls";

export function FinanceDirectory({
  kind,
  base,
  detail,
  form,
}: {
  kind: "supplier" | "price_proposal";
  base: string;
  detail?: string;
  form: ReactNode;
}) {
  const rows = useFinanceRows<RecordRow>("records");
  const articles = useFinanceRows<ArticleRow>("knowledge_articles");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(detail === "nuevo" || detail === "nueva");
  const list = (rows.rows ?? []).filter(
    (r) =>
      r.kind === `finance_${kind}` &&
      `${r.title} ${r.detail} ${label(r.data["reference"])}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const selected =
    detail && !["nuevo", "nueva"].includes(detail) ? list.find((r) => r.id === detail) : undefined;
  const title = kind === "supplier" ? "Proveedores de Vet Life" : "Tarifas y versiones";
  const sources = kind === "supplier" ? [rows] : [rows, articles];
  return (
    <>
      <PageTitle title={title} />
      <div className="mb-4 flex flex-wrap gap-3">
        <Link className="font-bold text-primary" to={base as never}>
          Lista
        </Link>
        <Btn variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cerrar propuesta" : "Preparar propuesta"}
        </Btn>
      </div>
      {showForm && form}
      <input
        className={`${financeInput} mb-4`}
        aria-label={kind === "supplier" ? "Buscar proveedor" : "Buscar tarifa"}
        placeholder="Nombre o referencia"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <FinanceSourceState sources={sources}>
        {kind === "price_proposal" && (
          <section className="mb-5">
            <h2 className="mb-3 text-lg font-bold">Información aprobada</h2>
            {(articles.rows ?? [])
              .filter((a) => a.category === "tarifas" && a.status === "aprobado")
              .map((a) => (
                <Card key={a.id} className="mb-3">
                  <b>
                    {a.title} · Versión {a.version}
                  </b>
                  <p className="whitespace-pre-wrap break-words">{a.content}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Fuente: {a.id} · Revisión:{" "}
                    {a.reviewed_at
                      ? (bogotaDate(a.reviewed_at) ?? "Fecha incompleta")
                      : "No registrada"}{" "}
                    · Vigencia: {a.valid_until ?? "No indicada"}
                  </p>
                  <p className="text-sm">
                    Información comercial aprobada; no es una lista transaccional de precios ni
                    cambia cargos anteriores.
                  </p>
                </Card>
              ))}
            {!(articles.rows ?? []).some(
              (a) => a.category === "tarifas" && a.status === "aprobado",
            ) && <Empty title="Sin información de tarifas aprobada en las fuentes visibles" />}
          </section>
        )}
        <h2 className="mb-3 text-lg font-bold">
          {kind === "supplier" ? "Fichas propuestas" : "Propuestas reservadas"}
        </h2>
        {detail && !["nuevo", "nueva"].includes(detail) && !selected ? (
          <Empty title="Registro no encontrado entre las fuentes autorizadas" />
        ) : (
          (selected ? [selected] : list).map((r) => (
            <Card key={r.id} className="mb-3 break-words">
              <Link
                className="font-bold text-primary"
                to={`${base}/${encodeURIComponent(r.id)}` as never}
              >
                {r.title}
              </Link>
              <p className="whitespace-pre-wrap">{r.detail || "Sin condiciones registradas"}</p>
              <p className="mt-2 text-sm">
                Referencia: {label(r.data["reference"]) || "No registrada"}
              </p>
              <p className="text-sm">
                Estado de propuesta: {r.status} · Fecha:{" "}
                {bogotaDate(r.created_at) ?? "No interpretable"}
              </p>
              {kind === "price_proposal" ? (
                <>
                  <p className="font-bold">{moneyLabel(knownMoney(r.data["amount"]))}</p>
                  <p className="text-sm">
                    Versión aprobada y vigencia: no disponibles. Precio aplicado a cargos
                    históricos: no modificado.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm">
                    Identificación: {label(r.data["taxId"]) || "No registrada"} · Contacto:{" "}
                    {label(r.data["contact"]) || "No registrado"}
                  </p>
                  <p className="text-sm">
                    Verificación y documentos autorizados: pendientes; una ficha no certifica al
                    proveedor.
                  </p>
                </>
              )}
            </Card>
          ))
        )}
        {!list.length && !detail && (
          <Empty
            title={
              kind === "supplier"
                ? "Sin propuestas de proveedores visibles"
                : "Sin propuestas de tarifas visibles"
            }
          />
        )}
      </FinanceSourceState>
    </>
  );
}
