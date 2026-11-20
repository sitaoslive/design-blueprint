/** InventoryDomainService (Prompt 06 §18). Local calculations never reserve stock. */
export interface StockItem { id: string; name: string; stock: number; min: number; lot: string; expires: string; reserved?: number; pendingReconcile?: number }
export interface Need { itemId: string; qty: number }
export const calculateAvailableStock = (i: StockItem) => Math.max(0, i.stock - (i.reserved ?? 0) - (i.pendingReconcile ?? 0));
export function evaluateBatchExpiration(i: StockItem, today: Date, warnDays = 30): "vencido" | "por_vencer" | "vigente" | "sin_fecha" {
  const d = new Date(i.expires); if (isNaN(+d)) return "sin_fecha";
  const days = (+d - +today) / 864e5; return days < 0 ? "vencido" : days <= warnDays ? "por_vencer" : "vigente";
}
export function detectMissingSupplies(items: StockItem[], needs: Need[], today: Date) {
  return needs.flatMap((n) => { const i = items.find((x) => x.id === n.itemId);
    if (!i) return [{ itemId: n.itemId, name: n.itemId, reason: "No está en el inventario" }];
    if (evaluateBatchExpiration(i, today) === "vencido") return [{ itemId: i.id, name: i.name, reason: `Lote ${i.lot} vencido` }];
    const a = calculateAvailableStock(i); return a < n.qty ? [{ itemId: i.id, name: i.name, reason: `Faltan ${n.qty - a} (disponibles ${a})` }] : []; });
}
export const evaluateReorderNeed = (i: StockItem) => calculateAvailableStock(i) <= i.min;
export function validateInventoryMovement(i: StockItem, delta: number, reason: string): string | null {
  if (!Number.isInteger(delta) || delta === 0) return "Cantidad inválida";
  if (!reason.trim()) return "Indica el motivo del movimiento";
  if (delta < 0 && calculateAvailableStock(i) + delta < 0) return "No hay existencias suficientes";
  return null;
}
/** Consumption is prepared, not applied: the server must discount atomically. */
export function prepareInventoryConsumption(visitId: string, items: StockItem[], used: Need[], today: Date) {
  const errors = detectMissingSupplies(items, used, today);
  return { idempotencyKey: `consume:${visitId}:${used.map((u) => `${u.itemId}x${u.qty}`).sort().join(",")}`, lines: used, errors, requiresServer: true as const };
}
