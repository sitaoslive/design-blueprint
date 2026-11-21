export type SupportSignal = {
  id: string;
  status: "ok" | "blocked" | "unknown";
  label: string;
  detail: string;
};
export function diagnoseSupport(input: {
  online: boolean;
  demo: boolean;
  signedIn: boolean;
  ownRead: "ok" | "denied" | "unknown";
  queueCount: number;
}): SupportSignal[] {
  return [
    {
      id: "network",
      status: input.online ? "ok" : "blocked",
      label: "Conexión del dispositivo",
      detail: input.online
        ? "El dispositivo declara conexión; no certifica proveedores."
        : "Sin conexión. Los borradores permanecen pendientes.",
    },
    {
      id: "session",
      status: input.demo ? "unknown" : input.signedIn ? "ok" : "blocked",
      label: "Sesión",
      detail: input.demo
        ? "Demo: no verifica cuentas reales."
        : input.signedIn
          ? "Sesión disponible."
          : "Necesitas entrar de nuevo; no se cambian permisos.",
    },
    {
      id: "access",
      status:
        input.demo || input.ownRead === "unknown"
          ? "unknown"
          : input.ownRead === "ok"
            ? "ok"
            : "blocked",
      label: "Lectura de tu cuenta",
      detail:
        input.ownRead === "ok" && !input.demo
          ? "Lectura propia comprobada, sin consultar datos de otras personas."
          : "Lectura sin verificar; no se conceden accesos automáticamente.",
    },
    {
      id: "drafts",
      status: input.queueCount ? "unknown" : "ok",
      label: "Borradores sin enviar",
      detail: input.queueCount
        ? `${input.queueCount} pendientes. No equivalen a acciones oficiales.`
        : "No hay borradores pendientes en este dispositivo.",
    },
    {
      id: "providers",
      status: "unknown",
      label: "Servicios externos",
      detail: "No certificados. Este diagnóstico no envía mensajes ni activa conexiones.",
    },
  ];
}
