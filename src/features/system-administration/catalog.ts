export const CONTROL_SCREENS = [
  ["/admin/inicio", "Centro de Control Vet Freedom"],
  ["/admin/sistema/salud", "Salud del sistema"],
  ["/admin/desarrollo/dependencias", "Dependencias y contratos"],
  ["/admin/despliegue", "Preparación de lanzamiento"],
  ["/admin/sistema/auditoria-aplicacion", "Revisión de aplicación"],
  ["/admin/okvet", "Centro de verificación OKVET"],
  ["/admin/okvet/importar", "Revisión de archivo OKVET"],
  ["/admin/okvet/conciliacion", "Conciliación administrativa OKVET"],
  ["/admin/okvet/conflictos", "Conflictos de referencias OKVET"],
  ["/admin/datos/calidad", "Calidad de datos operativos"],
] as const;
export const controlScreen = (path: string) => CONTROL_SCREENS.find(([p]) => p === path.replace(/\/$/, ""));