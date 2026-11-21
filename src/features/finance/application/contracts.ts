import { z } from "zod";
import { PeriodSchema } from "../domain";
export const FinanceCommandSchema = z.object({
  organizationId: z.string().min(1),
  entityId: z.string().min(1),
  expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(1),
  currency: z.literal("COP"),
  period: PeriodSchema,
  sourceReference: z.string().min(1),
});
export type FinanceCommand = z.infer<typeof FinanceCommandSchema>;
export const FinanceResponseSchema = z.object({
  id: z.string().min(1),
  status: z.string(),
  version: z.number().int().nonnegative(),
  source: z.string().min(1),
  updatedAt: z.string().datetime(),
});
export const FinanceErrorSchema = z.object({
  code: z.enum([
    "FORBIDDEN",
    "CONFLICT",
    "INTEGRATION_UNAVAILABLE",
    "VERIFICATION_REQUIRED",
    "COST_DATA_INCOMPLETE",
    "PRICE_NOT_APPROVED",
    "DUPLICATE_REFERENCE",
  ]),
  message: z.string(),
});
export interface FinanceGateway {
  verifyPayment(command: FinanceCommand): Promise<z.infer<typeof FinanceResponseSchema>>;
  reconcile(command: FinanceCommand): Promise<z.infer<typeof FinanceResponseSchema>>;
  issueInvoice(command: FinanceCommand): Promise<z.infer<typeof FinanceResponseSchema>>;
  receivePurchase(command: FinanceCommand): Promise<z.infer<typeof FinanceResponseSchema>>;
}
const unavailable = async () => {
  throw new Error("INTEGRATION_UNAVAILABLE: requiere operación autorizada del servidor");
};
export const unavailableFinanceGateway: FinanceGateway = {
  verifyPayment: unavailable,
  reconcile: unavailable,
  issueInvoice: unavailable,
  receivePurchase: unavailable,
};
export const FINANCE_CONTRACTS = [
  "getFinancialOverview",
  "getServicePricing",
  "getPriceVersion",
  "prepareQuote",
  "getUnbilledServices",
  "getChargeDetails",
  "prepareBillingRequest",
  "getPaymentReports",
  "submitPaymentReport",
  "getPaymentVerificationStatus",
  "getOpenReceivables",
  "getReconciliationCandidates",
  "requestReconciliation",
  "getVisitCostData",
  "getRouteCostData",
  "getServiceProfitability",
  "getZoneProfitability",
  "getInventoryValuation",
  "getInventoryMovements",
  "prepareInventoryAdjustment",
  "getPurchaseRequests",
  "submitPurchaseRequest",
  "getSuppliers",
  "getCustomerValueMetrics",
  "getFinancialReports",
  "requestAuthorizedExport",
] as const;
