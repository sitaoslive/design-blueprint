/** Day close (§28): minor pending items may be transferred; critical ones need an explicit owner. */
export interface Pending { id: string; kind: "visita" | "tarea" | "incidencia" | "compromiso" | "remision"; title: string; critical: boolean; transferredTo?: string | null }
export function evaluateDayClose(p: Pending[]) {
  const blocking = p.filter((x) => x.critical && !x.transferredTo);
  const transferable = p.filter((x) => !x.critical && !x.transferredTo);
  return { canClose: blocking.length === 0, blocking, transferable, transferred: p.filter((x) => x.transferredTo) };
}
