export const CONTROL_SCREENS = [
  ["/admin/inicio", "Centro de Control Vet Freedom"],
  ["/admin/sistema/salud", "Salud del sistema"],
  ["/admin/desarrollo/dependencias", "Dependencias y contratos"],
  ["/admin/despliegue", "Preparación de lanzamiento"],
] as const;
export const controlScreen = (path: string) => CONTROL_SCREENS.find(([p]) => p === path.replace(/\/$/, ""));