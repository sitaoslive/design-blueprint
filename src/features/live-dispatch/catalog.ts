export function dispatchScreen(path: string): string | null {
  if (/^\/admin\/citas\/(tipos(?:\/[^/]+)?|duraciones|reglas-retrasos|notificaciones)$/.test(path)) return path.endsWith("notificaciones") ? "Avisos de desplazamiento" : path.endsWith("reglas-retrasos") ? "Reglas de retrasos" : "Tipos y duraciones de cita";
  if (/^\/(?:admin\/operaciones|operaciones|direccion)\/(despacho(?:\/[^/]+)?|mapa-en-vivo|retrasos(?:\/[^/]+)?)$/.test(path)) return "Despacho y tiempos de visitas";
  if (/^\/(equipo|auxiliar)\/visitas\/[^/]+\/tiempo$/.test(path)) return "Tiempo de la visita";
  if (/^\/app\/visitas\/[^/]+\/seguimiento$/.test(path)) return "Seguimiento privado de tu visita";
  if (path === "/equipo/hoy") return "Mi jornada";
  return null;
}