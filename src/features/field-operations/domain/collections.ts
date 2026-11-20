/** §21 Registro administrativo de cobros: staff only *informs*; finance verifies. Never a verified payment from the field. */
export const FIELD_METHODS = ["Efectivo", "Transferencia / Nequi", "Link de pago"] as const;
export type FieldMethod = (typeof FIELD_METHODS)[number];
export interface FieldCollection { visitId: string; amount: number; method: string; reference?: string }
export function validateFieldCollection(c: FieldCollection): string | null {
  if (!c.visitId) return "Elige la visita";
  if (!Number.isFinite(c.amount) || c.amount <= 0 || !Number.isInteger(c.amount)) return "Monto inválido (pesos enteros)";
  if (c.amount > 5_000_000) return "Monto fuera de rango: revisa con Finanzas";
  if (!(FIELD_METHODS as readonly string[]).includes(c.method)) return "Forma de pago no aceptada";
  if (c.method !== "Efectivo" && !c.reference?.trim()) return "Indica la referencia de la transferencia o del link";
  return null;
}
export const collectionKey = (c: FieldCollection) => `cobro:${c.visitId}:${c.amount}:${c.method}`;
