export type HealthEvidence = { status: string; checkedAt: string | null; reference: string | null };
export function integrationHealth(evidence: HealthEvidence, now: Date) {
  if (!evidence.reference || !evidence.checkedAt || !Number.isFinite(Date.parse(evidence.checkedAt))) return "UNKNOWN";
  if (Date.parse(evidence.checkedAt) > now.getTime() || now.getTime() - Date.parse(evidence.checkedAt) > 120000) return "UNKNOWN";
  return evidence.status === "VERIFIED" ? "VERIFIED" : evidence.status === "ERROR" ? "DEGRADED" : "UNKNOWN";
}
export const deploymentGates = ["Frontend", "Seguridad", "Agenda", "Comunicaciones", "Operación", "Finanzas", "Integraciones", "Recuperación", "Aprobación"] as const;
export function deploymentReady(gates: { name: string; verified: boolean; evidence: string; version: string }[]) {
  return deploymentGates.every((name) => gates.some((g) => g.name === name && g.verified && g.evidence.trim() && g.version.trim()));
}