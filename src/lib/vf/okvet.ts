import { toast } from "sonner";
import { actions } from "./store";

/** Asks for the official OKVET reference before confirming (OKVET is assisted, not connected). */
export function confirmWithOkvet(id: string) {
  const ref = window.prompt("Referencia oficial de la cita en OKVET (obligatoria para confirmar):");
  if (!ref?.trim()) { toast.error("Sin referencia de OKVET la cita queda pendiente"); return; }
  if (actions.setVisitStatus(id, "confirmada", ref.trim())) toast.success("Cita confirmada con OKVET " + ref.trim());
}
