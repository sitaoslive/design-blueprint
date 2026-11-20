import type { VisitStatus } from "./data";

/** Allowed appointment transitions; mirrored by the visits_state_guard trigger in the database. */
export const VISIT_TRANSITIONS: Record<VisitStatus, VisitStatus[]> = {
  pendiente: ["revision", "pendiente_okvet", "confirmada", "cancelada"],
  revision: ["pendiente", "pendiente_okvet", "confirmada", "cancelada"],
  pendiente_okvet: ["pendiente", "revision", "confirmada", "cancelada"],
  confirmada: ["pendiente", "revision", "pendiente_okvet", "por_iniciar", "en_curso", "cancelada"],
  por_iniciar: ["pendiente", "en_curso", "cancelada"],
  en_curso: ["finalizada"],
  finalizada: [],
  cancelada: [],
};

export function canTransition(from: VisitStatus, to: VisitStatus): boolean {
  return from === to || VISIT_TRANSITIONS[from].includes(to);
}

/** A visit can only become confirmed with the official OKVET reference. */
export function checkTransition(from: VisitStatus, to: VisitStatus, okvetRef?: string | null): string | null {
  if (!canTransition(from, to)) return `Cambio de estado no permitido: ${from} → ${to}`;
  if (to === "confirmada" && from !== "confirmada" && !okvetRef?.trim()) return "No se puede confirmar sin la referencia oficial de OKVET";
  return null;
}
