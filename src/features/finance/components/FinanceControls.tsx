import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { Btn } from "@/components/vf/ui";
import { validPeriod } from "../domain/presentation";

export const financeInput = "w-full min-w-0 rounded-lg border border-border bg-card p-3";
export function FinancePeriod({
  period,
  onChange,
}: {
  period: { from: string; to: string };
  onChange: (period: { from: string; to: string }) => void;
}) {
  return (
    <>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {(["from", "to"] as const).map((key) => (
          <label key={key}>
            {key === "from" ? "Desde" : "Hasta"}
            <input
              className={financeInput}
              type="date"
              aria-label={key === "from" ? "Desde" : "Hasta"}
              value={period[key]}
              onChange={(e) => onChange({ ...period, [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      {!validPeriod(period) && <p role="alert">Periodo inválido</p>}
    </>
  );
}
export function FinanceSourceState({
  sources,
  children,
}: {
  sources: {
    rows: unknown[] | null;
    error: string;
    loadedAt: string | null;
    reload: () => Promise<void>;
  }[];
  children: ReactNode;
}) {
  const error = sources.find((s) => s.error)?.error;
  const loading = sources.some((s) => s.rows === null);
  const oldest = sources
    .map((s) => s.loadedAt)
    .filter((v): v is string => v !== null)
    .sort()[0];
  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {oldest
            ? `Fuentes consultadas: ${new Date(oldest).toLocaleString("es-CO", { timeZone: "America/Bogota" })} · Bogotá · COP`
            : "Consulta de fuentes pendiente"}
        </p>
        <Btn
          variant="outline"
          aria-label="Actualizar fuentes"
          onClick={() => void Promise.all(sources.map((s) => s.reload()))}
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Btn>
      </div>
      {error ? (
        <p role="alert">No se pudo completar la consulta: {error}</p>
      ) : loading ? (
        <p role="status">Cargando fuentes…</p>
      ) : (
        children
      )}
    </>
  );
}
