import { Link } from "@tanstack/react-router";
export function ExecutiveNav() {
  return (
    <nav
      aria-label="Secciones de Dirección"
      className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-primary"
    >
      {[
        ["asistente", "Asistente"],
        ["decisiones", "Decisiones"],
        ["propuestas", "Propuestas"],
        ["aprobaciones", "Aprobaciones"],
        ["delegaciones", "Delegaciones"],
        ["reportes", "Reportes"],
        ["modo-ausencia", "Ausencia"],
        ["autonomia", "Autonomía"],
        ["memoria-decisiones", "Memoria"],
        ["asistente/resultados", "Resultados"],
        ["asistente/auditoria", "Auditoría"],
      ].map(([path, label]) => (
        <Link key={path} to={`/direccion/${path}` as never}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
