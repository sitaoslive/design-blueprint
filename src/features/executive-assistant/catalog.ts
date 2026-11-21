export const EXECUTIVE_SCREENS = [
  ["/direccion/asistente", "Asistente de Dirección"],
  ["/direccion/propuestas", "Propuestas de Dirección"],
  ["/direccion/aprobaciones", "Aprobaciones de Dirección"],
  ["/direccion/delegaciones", "Delegaciones y seguimiento"],
  ["/direccion/decisiones", "Centro de decisiones"],
  ["/direccion/excepciones", "Excepciones operativas"],
  ["/direccion/reportes/apertura", "Informe de apertura"],
  ["/direccion/reportes/cierre", "Informe de cierre"],
  ["/direccion/reportes/semanal", "Informe semanal"],
  ["/direccion/reportes", "Reportes ejecutivos"],
  ["/direccion/memoria-decisiones", "Memoria empresarial"],
  ["/direccion/modo-ausencia", "Modo ausencia"],
  ["/direccion/autonomia", "Autonomía operativa"],
  ["/direccion/asistente/auditoria", "Auditoría de la asistente"],
  ["/direccion/asistente/resultados", "Resultados y recuperación"],
  ["/admin/ia-direccion", "Uso de IA de Dirección"],
] as const;
export function executiveScreen(path: string) {
  return EXECUTIVE_SCREENS.find(([p]) => p === path.replace(/\/$/, ""));
}
