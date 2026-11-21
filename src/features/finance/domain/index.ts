import { z } from "zod";
/** COP in hundredths. Decimal inputs are parsed, never multiplied as binary floats. */
export function money(value: string | number | bigint): bigint {
  if (typeof value === "bigint") return value;
  const text = String(value).trim();
  const m = text.match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/);
  if (!m) throw new Error("Importe inválido: usa hasta dos decimales");
  return (
    (m[1] === "-" ? -1n : 1n) * (BigInt(m[2] ?? "0") * 100n + BigInt((m[3] ?? "").padEnd(2, "0")))
  );
}
export const amountText = (value: bigint) =>
  `${value < 0n ? "-" : ""}${(value < 0n ? -value : value) / 100n}.${String((value < 0n ? -value : value) % 100n).padStart(2, "0")}`;
export function moneyLabel(value: bigint | null) {
  if (value === null) return "No calculable";
  const negative = value < 0n;
  const n = negative ? -value : value;
  return `${negative ? "- " : ""}$ ${(n / 100n).toLocaleString("es-CO")}${n % 100n ? "," + String(n % 100n).padStart(2, "0") : ""} COP`;
}
export function roundedRatio(n: bigint, d: bigint): bigint {
  if (d <= 0n) throw new Error("Denominador inválido");
  const negative = n < 0n;
  const a = negative ? -n : n;
  const result = (a + d / 2n) / d;
  return negative ? -result : result;
}
export interface PriceVersion {
  id: string;
  service: string;
  base: string;
  currency: "COP";
  validFrom: string;
  validTo: string;
  state: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE";
  version: number;
  source: string;
}
export function quote(
  price: PriceVersion,
  quantity: number,
  date: string,
  extras: { amount: string; approved: boolean }[] = [],
  discount: { amount: string; approved: boolean } = { amount: "0", approved: true },
  taxes: { basisPoints: number; approved: boolean }[] = [],
) {
  if (
    price.state !== "ACTIVE" ||
    date < price.validFrom ||
    date > price.validTo ||
    !price.source.trim()
  )
    throw new Error("Tarifa no aprobada o fuera de vigencia");
  if (!Number.isSafeInteger(quantity) || quantity < 1) throw new Error("Cantidad inválida");
  const base = money(price.base) * BigInt(quantity);
  if (base < 0n) throw new Error("Precio negativo");
  if (extras.some((x) => !x.approved || money(x.amount) < 0n))
    throw new Error("Adicional no autorizado");
  if (!discount.approved && money(discount.amount) !== 0n)
    throw new Error("Descuento no autorizado");
  const additional = extras.reduce((a, x) => a + money(x.amount), 0n);
  const reduction = money(discount.amount);
  if (reduction < 0n || reduction > base + additional) throw new Error("Descuento inválido");
  const subtotal = base + additional - reduction;
  if (taxes.some((x) => !x.approved || !Number.isSafeInteger(x.basisPoints) || x.basisPoints < 0))
    throw new Error("Impuesto sin configuración aprobada");
  const tax = taxes.reduce(
    (a, x) => a + roundedRatio(subtotal * BigInt(x.basisPoints), 10000n),
    0n,
  );
  return {
    base,
    additional,
    discount: reduction,
    tax,
    total: subtotal + tax,
    currency: "COP" as const,
    priceVersion: price.version,
  };
}
export type PaymentState = "REPORTED" | "VERIFIED" | "RECONCILED" | "REJECTED";
export interface PaymentReport {
  id: string;
  chargeId: string | null;
  amount: string;
  currency: "COP";
  state: PaymentState;
  reference: string;
  date: string;
  clientId: string;
}
export function outstanding(original: string, payments: PaymentReport[]) {
  return (
    money(original) -
    payments
      .filter((p) => p.state === "VERIFIED" || p.state === "RECONCILED")
      .reduce((a, p) => a + money(p.amount), 0n)
  );
}
export function reconciliationCandidate(
  p: PaymentReport,
  c: { id: string; amount: string; reference: string; currency: string; clientId: string },
  payments: PaymentReport[],
) {
  if (payments.some((x) => x.id !== p.id && x.reference && x.reference === p.reference))
    return "DUPLICATE_CANDIDATE";
  if (
    p.currency !== c.currency ||
    p.clientId !== c.clientId ||
    !p.reference ||
    p.reference !== c.reference
  )
    return "UNMATCHED";
  if (p.state === "REPORTED") return "REQUIRES_REVIEW";
  return money(p.amount) === money(c.amount) ? "EXACT_MATCH" : "AMOUNT_MISMATCH";
}
export function allocatePayment(amount: string, charges: { id: string; balance: string }[]) {
  let remaining = money(amount);
  if (remaining <= 0n) throw new Error("Importe debe ser positivo");
  const seen = new Set<string>();
  return {
    allocations: charges.map((c) => {
      if (seen.has(c.id)) throw new Error("Cargo duplicado");
      seen.add(c.id);
      const balance = money(c.balance);
      if (balance < 0n) throw new Error("Saldo inválido");
      const applied = remaining < balance ? remaining : balance;
      remaining -= applied;
      return { chargeId: c.id, amount: applied };
    }),
    get remaining() {
      return remaining;
    },
  };
}
export interface CostPart {
  id: string;
  component: "professional" | "travel" | "supplies" | "other";
  amount: string;
  source: string;
  estimated: boolean;
  version: string;
}
export function visitCost(parts: CostPart[]) {
  const unique = new Map(parts.map((x) => [x.id, x]));
  if (unique.size !== parts.length) throw new Error("Costo duplicado");
  const missing = ["professional", "travel", "supplies", "other"].filter(
    (c) => !parts.some((p) => p.component === c && p.source.trim() && p.version),
  );
  if (parts.some((p) => money(p.amount) < 0n)) throw new Error("Costo negativo");
  return {
    status: missing.length
      ? ("INCOMPLETE" as const)
      : parts.some((p) => p.estimated)
        ? ("ESTIMATED" as const)
        : ("RECORDED" as const),
    missing,
    registered: parts.reduce((a, p) => a + money(p.amount), 0n),
    total: missing.length ? null : parts.reduce((a, p) => a + money(p.amount), 0n),
  };
}
export const timeCost = (minutes: number, hourly: string) => {
  if (!Number.isSafeInteger(minutes) || minutes < 0) throw new Error("Tiempo inválido");
  return roundedRatio(money(hourly) * BigInt(minutes), 60n);
};
export const supplyCost = (units: number, unitCost: string) => {
  if (!Number.isSafeInteger(units) || units < 0) throw new Error("Cantidad inválida");
  return money(unitCost) * BigInt(units);
};
export function contribution(revenue: string | null, cost: bigint | null) {
  if (revenue === null || cost === null) return { margin: null, percentage: null };
  const income = money(revenue);
  return {
    margin: income - cost,
    percentage: income === 0n ? null : Number(roundedRatio((income - cost) * 10000n, income)) / 100,
  };
}
export function stockValue(stock: number, unitCost: string | null, method: string | null) {
  return unitCost === null || !method ? null : supplyCost(stock, unitCost);
}
export function replenish(stock: number, reserved: number, minimum: number, futureDemand = 0) {
  const available = Math.max(0, stock - reserved);
  return {
    available,
    suggested: Math.max(0, minimum + futureDemand - available),
    reason:
      available < minimum ? "Disponible por debajo del mínimo" : "Sin faltante frente al mínimo",
  };
}
export function batchState(expires: string, day: string, blocked = false, stock = 1) {
  if (blocked) return "QUARANTINED";
  if (stock === 0) return "DEPLETED";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expires)) return "UNKNOWN";
  if (expires < day) return "EXPIRED";
  const days = (Date.parse(expires) - Date.parse(day)) / 86400000;
  return days <= 30 ? "NEAR_EXPIRY" : "ACTIVE";
}
export function customerValue(
  charges: { id: string; amount: string; clientId: string }[],
  payments: PaymentReport[],
  clientId: string,
  visits: number,
  pets: number,
) {
  const mine = [
    ...new Map(charges.filter((c) => c.clientId === clientId).map((c) => [c.id, c])).values(),
  ];
  const revenue = mine.reduce((a, c) => a + money(c.amount), 0n);
  const collections = payments
    .filter((p) => p.clientId === clientId && (p.state === "VERIFIED" || p.state === "RECONCILED"))
    .reduce((a, p) => a + money(p.amount), 0n);
  return {
    revenue,
    collections,
    balance: revenue - collections,
    averageTicket: mine.length ? roundedRatio(revenue, BigInt(mine.length)) : null,
    visits,
    pets,
    segment: visits > 1 ? "recurrente" : visits === 1 ? "una_visita" : "sin_visitas",
  };
}
export function scenario(
  revenue: string,
  cost: string,
  priceBasisPoints: number,
  costBasisPoints: number,
) {
  if (!Number.isSafeInteger(priceBasisPoints) || !Number.isSafeInteger(costBasisPoints))
    throw new Error("Variación inválida");
  const projectedRevenue =
    money(revenue) + roundedRatio(money(revenue) * BigInt(priceBasisPoints), 10000n);
  const projectedCost = money(cost) + roundedRatio(money(cost) * BigInt(costBasisPoints), 10000n);
  return {
    projectedRevenue,
    projectedCost,
    margin: projectedRevenue - projectedCost,
    hypothetical: true,
  };
}
export const FinancialDraftSchema = z.object({
  kind: z.enum([
    "billing_request",
    "payment_report",
    "refund_request",
    "purchase_request",
    "supplier",
    "cost_entry",
    "expense",
    "price_proposal",
    "cold_chain_review",
  ]),
  title: z.string().trim().min(1),
  reference: z.string().trim().min(1),
  amount: z.string().refine((v) => {
    try {
      return money(v) >= 0n;
    } catch {
      return false;
    }
  }, "Importe no válido"),
  entityId: z.string(),
  detail: z.string(),
});
export type FinancialDraft = z.infer<typeof FinancialDraftSchema>;
export const PeriodSchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((p) => p.from <= p.to, "Periodo inválido");
export function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
