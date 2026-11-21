export type HealthEvidence = { status: string; checkedAt: string | null; reference: string | null };
export function integrationHealth(evidence: HealthEvidence, now: Date) {
  if (!evidence.reference || !evidence.checkedAt || !Number.isFinite(Date.parse(evidence.checkedAt))) return "UNKNOWN";
  if (Date.parse(evidence.checkedAt) > now.getTime() || now.getTime() - Date.parse(evidence.checkedAt) > 120000) return "UNKNOWN";
  return evidence.status === "VERIFIED" ? "VERIFIED" : evidence.status === "ERROR" ? "DEGRADED" : "UNKNOWN";
}
export const deploymentGates = ["Frontend", "Dominio", "Autenticación", "Autorización", "Privacidad", "Agenda", "OKVET", "Comunicaciones", "Operación", "Finanzas", "Remisiones", "IA", "Integraciones", "Monitoreo", "Recuperación", "Pruebas E2E", "Aprobación"] as const;
export function deploymentReady(gates: { name: string; verified: boolean; evidence: string; version: string }[]) {
  const version = gates[0]?.version.trim();
  if (!version) return false;
  return deploymentGates.every((name) => {
    const matching = gates.filter((g) => g.name === name);
    const gate = matching[0];
    return matching.length === 1 && gate?.verified === true && Boolean(gate.evidence.trim()) && gate.version.trim() === version;
  });
}