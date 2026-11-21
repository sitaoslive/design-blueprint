import { z } from "zod";
import { deploymentGates, deploymentReady } from "./index";

/** Transport validation is not authentication. Only a verified backend adapter may supply these proofs. */
export const GateProofSchema = z
  .object({
    name: z.enum(deploymentGates),
    version: z.string().trim().min(1).max(100),
    reference: z.string().trim().min(1).max(200),
    checkedAt: z.string().datetime({ offset: true }),
    expiresAt: z.string().datetime({ offset: true }),
    status: z.enum(["VERIFIED", "BLOCKED", "FAILED"]),
  })
  .strict();
export type GateProof = z.infer<typeof GateProofSchema>;
export function productionAssessment(
  raw: unknown,
  version: string,
  now: Date,
  authenticatedSource: boolean,
) {
  const parsed = z.array(GateProofSchema).safeParse(raw);
  const verifiedSource =
    authenticatedSource &&
    parsed.success &&
    Number.isFinite(now.getTime()) &&
    Boolean(version.trim());
  const proofs = verifiedSource && parsed.success ? parsed.data : [];
  const gates = deploymentGates.map((name) => {
    const matches = proofs.filter((p) => p.name === name);
    const proof = matches[0];
    const verified =
      matches.length === 1 &&
      proof?.status === "VERIFIED" &&
      proof.version === version &&
      Date.parse(proof.checkedAt) <= now.getTime() &&
      Date.parse(proof.expiresAt) > now.getTime();
    return {
      name,
      verified,
      evidence: verified && proof ? proof.reference : "",
      version: verified ? version : "",
      status: verified ? "VERIFIED" : "BLOCKED",
    };
  });
  return { ready: verifiedSource && deploymentReady(gates), gates };
}

export const criticalFlows = [
  {
    id: "A",
    title: "Conversación → cita → ruta",
    dependency: "Envío autorizado, reserva atómica y confirmación OKVET",
    status: "BLOCKED_EXTERNAL_PROVIDER",
  },
  {
    id: "B",
    title: "Llamada → cita rápida → agenda",
    dependency: "Reserva atómica y confirmación OKVET",
    status: "BLOCKED_BACKEND",
  },
  {
    id: "C",
    title: "Visita → atención → cobro → seguimiento",
    dependency: "Verificación de cobro y entrega externa",
    status: "BLOCKED_BACKEND",
  },
  {
    id: "D",
    title: "Plan recurrente → agenda → cierre",
    dependency: "Plan aprobado y reserva atómica",
    status: "BLOCKED_BACKEND",
  },
  {
    id: "E",
    title: "Ausencia → simulación → comunicación",
    dependency: "Revalidación y ejecución aprobada",
    status: "BLOCKED_BACKEND",
  },
  {
    id: "F",
    title: "Remisión → especialista → continuidad",
    dependency: "Confirmación externa y documentos compartidos autorizados",
    status: "BLOCKED_EXTERNAL_PROVIDER",
  },
  {
    id: "G",
    title: "Pago reportado → conciliación → saldo",
    dependency: "Verificación bancaria y conciliación",
    status: "BLOCKED_BACKEND",
  },
  {
    id: "H",
    title: "Queja → resolución → mejora",
    dependency: "Aceptación transversal completa aún no ejecutada",
    status: "NOT_RUN",
  },
  {
    id: "I",
    title: "Formación → evaluación → asignación",
    dependency: "Autoridad de competencia y procedimiento vigente",
    status: "BLOCKED_BACKEND",
  },
  {
    id: "J",
    title: "Consulta de Luis → acción verificada",
    dependency: "Aprobación, ejecución y recibo auditado",
    status: "BLOCKED_BACKEND",
  },
  {
    id: "K",
    title: "Ausencia de Luis → cobertura → informe",
    dependency: "Delegación y activación autorizadas",
    status: "BLOCKED_BACKEND",
  },
  {
    id: "L",
    title: "Error externo → recuperación → conciliación",
    dependency: "Monitoreo, respaldo y recuperación verificados",
    status: "BLOCKED_EXTERNAL_PROVIDER",
  },
] as const;
