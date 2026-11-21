export const ACADEMY_SCREENS = [
  ["/admin/academia", "Academy · Centro de formación"],
  ["/admin/academia/rutas", "Academy · Rutas de aprendizaje"],
  ["/admin/academia/evaluaciones", "Academy · Evaluaciones"],
  ["/admin/academia/procedimientos", "Academy · Procedimientos"],
  ["/admin/academia/competencias", "Academy · Competencias"],
  ["/admin/academia/onboarding", "Academy · Incorporación"],
  ["/admin/academia/versiones", "Academy · Historial de preparaciones"],
  ["/admin/academia/empleados", "Academy · Formación del equipo"],
  ["/equipo/academia", "Academy · Mi formación"],
  ["/auxiliar/academia", "Academy · Formación auxiliar"],
] as const;
export function academyScreen(path: string) {
  const clean = path.replace(/\/$/, "");
  const exact = ACADEMY_SCREENS.find(([url]) => url === clean);
  if (exact) return exact[1];
  if (/^\/(admin|equipo|auxiliar)\/academia\//.test(clean))
    return `Academy · ${clean.split("/").slice(3).join(" · ")}`;
  return null;
}
