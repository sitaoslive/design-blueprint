import { money, PeriodSchema } from "./index";

export function bogotaDate(value: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
      ? value
      : null;
  }
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (name: string) => parts.find((p) => p.type === name)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function validPeriod(period: { from: string; to: string }) {
  return (
    PeriodSchema.safeParse(period).success &&
    bogotaDate(period.from) !== null &&
    bogotaDate(period.to) !== null
  );
}
export function inFinancePeriod(value: string, period: { from: string; to: string }) {
  const day = bogotaDate(value);
  return validPeriod(period) && day !== null && day >= period.from && day <= period.to;
}
export function knownMoney(value: unknown): bigint | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  try {
    const amount = money(value);
    return amount >= 0n ? amount : null;
  } catch {
    return null;
  }
}
export function knownTotal(values: unknown[]): bigint | null {
  let total = 0n;
  for (const value of values) {
    const amount = knownMoney(value);
    if (amount === null) return null;
    total += amount;
  }
  return total;
}
export function collectionState(
  kind: string,
  status: string,
): "REPORTED" | "VERIFIED" | "REJECTED" | "UNKNOWN" {
  // A requested administrative draft is never evidence of receipt or reconciliation.
  if (kind === "finance_payment_report") return "REPORTED";
  if (kind !== "cobro_campo") return "UNKNOWN";
  return status === "informado"
    ? "REPORTED"
    : status === "verificado"
      ? "VERIFIED"
      : status === "rechazado"
        ? "REJECTED"
        : "UNKNOWN";
}
export function duplicateReferences(rows: { id: string; data: Record<string, unknown> }[]) {
  const groups = new Map<string, string[]>();
  for (const row of rows) {
    const reference = typeof row.data["reference"] === "string" ? row.data["reference"].trim() : "";
    if (reference) groups.set(reference, [...(groups.get(reference) ?? []), row.id]);
  }
  return new Set([...groups.values()].filter((ids) => ids.length > 1).flat());
}
