export type RoleId =
  | "cliente"
  | "cuidador"
  | "veterinario"
  | "auxiliar"
  | "coordinador"
  | "recepcion"
  | "finanzas"
  | "administrador"
  | "luis"
  | "soporte"
  | "consultor"
  | "especialista";
export interface RoleDef {
  id: RoleId;
  label: string;
  desc: string;
  home: string;
  permissions: string[];
  denied: string[];
}

export const ROLES: RoleDef[] = [
  {
    id: "luis",
    label: "Luis / Dirección",
    desc: "Centro ejecutivo y asistente privada",
    home: "/luis",
    permissions: [
      "Ver toda la operación",
      "Aprobar acciones sensibles",
      "Modo ausencia",
      "Asistente de Dirección",
    ],
    denied: [],
  },
  {
    id: "coordinador",
    label: "Coordinador",
    desc: "Bandeja, agenda, equipo y rutas",
    home: "/coordinacion",
    permissions: ["Gestionar solicitudes", "Agendar y reasignar", "Rutas", "Incidencias"],
    denied: ["Decisiones clínicas", "Configuración empresarial"],
  },
  {
    id: "veterinario",
    label: "Veterinario",
    desc: "Mi jornada, ruta y visitas",
    home: "/equipo",
    permissions: ["Mis visitas", "Check-in", "Incidencias", "Formación"],
    denied: ["Finanzas globales", "Configuración"],
  },
  {
    id: "cliente",
    label: "Propietario / Cliente",
    desc: "Mascotas, citas y pagos",
    home: "/cliente",
    permissions: ["Mis mascotas", "Mis citas", "Pagos", "Ayuda por WhatsApp"],
    denied: ["Información de otros clientes"],
  },
  {
    id: "cuidador",
    label: "Cuidador autorizado",
    desc: "Acceso limitado por el propietario",
    home: "/cuidador/inicio",
    permissions: ["Ver citas autorizadas", "Recibir indicaciones autorizadas"],
    denied: ["Pagos", "Documentos clínicos no autorizados", "Modificar datos del propietario"],
  },
  {
    id: "auxiliar",
    label: "Auxiliar",
    desc: "Apoyo, insumos y visitas asignadas",
    home: "/auxiliar/inicio",
    permissions: ["Preparar insumos", "Visitas asignadas", "Comunicación interna"],
    denied: ["Prescripción", "Decisiones profesionales reservadas"],
  },
  {
    id: "recepcion",
    label: "Recepción",
    desc: "Bandeja de atención y escalamiento",
    home: "/recepcion/inicio",
    permissions: ["Identificar clientes", "Registrar solicitudes", "Escalar casos"],
    denied: ["Información clínica detallada", "Finanzas"],
  },
  {
    id: "finanzas",
    label: "Finanzas",
    desc: "Cobros, conciliación y rentabilidad",
    home: "/finanzas/inicio",
    permissions: ["Cobros", "Conciliaciones", "Comprobantes", "Rentabilidad"],
    denied: ["Información clínica"],
  },
  {
    id: "administrador",
    label: "Administrador",
    desc: "Usuarios, permisos y configuración",
    home: "/admin",
    permissions: [
      "Usuarios y permisos",
      "Servicios, zonas, horarios",
      "Precios y políticas",
      "Automatizaciones",
    ],
    denied: ["Decisiones clínicas"],
  },
  {
    id: "soporte",
    label: "Soporte técnico",
    desc: "Acceso temporal, mínimo y auditado",
    home: "/soporte/inicio",
    permissions: ["Diagnóstico técnico temporal", "Ver registros de errores"],
    denied: ["Datos clínicos", "Datos personales sin autorización"],
  },
  {
    id: "consultor",
    label: "Consultor Alpha Vision",
    desc: "Indicadores autorizados",
    home: "/consultor/inicio",
    permissions: ["Indicadores autorizados", "Configuraciones expresamente permitidas"],
    denied: ["Datos de clientes", "Información clínica"],
  },
  {
    id: "especialista",
    label: "Especialista externo",
    desc: "Solo remisiones autorizadas",
    home: "/especialista/inicio",
    permissions: ["Ver remisiones asignadas", "Publicar horarios", "Subir informes"],
    denied: ["Pagos", "Otros clientes", "Configuración"],
  },
];
export const roleById = (id: string) => ROLES.find((r) => r.id === id);

/** Active account profiles; legacy role definitions remain for historical accounts and demos. */
export const ACCOUNT_PROFILES = [
  {
    id: "cliente",
    label: "Cliente",
    desc: "Sus mascotas, citas y documentos",
    home: "/cliente",
    roles: ["cliente"],
  },
  {
    id: "administrador",
    label: "Administrador",
    desc: "Gestión y configuración, sin atención clínica",
    home: "/admin",
    roles: ["administrador"],
  },
  {
    id: "luis",
    label: "Luis · Dueño y Veterinario",
    desc: "Dirección y atención de todos los pacientes",
    home: "/luis",
    roles: ["luis", "administrador", "veterinario"],
  },
  {
    id: "auxiliar",
    label: "Auxiliar de veterinaria",
    desc: "Visitas asignadas, preparación y apoyo",
    home: "/auxiliar/inicio",
    roles: ["auxiliar"],
  },
] as const;
export type AccountProfileId = (typeof ACCOUNT_PROFILES)[number]["id"];
export const canProvideClinicalCare = (roles: readonly string[]) =>
  roles.some((role) => role === "luis" || role === "veterinario");
export function accountProfile(roles: readonly string[]): AccountProfileId | null {
  if (roles.includes("luis")) return "luis";
  if (roles.includes("administrador")) return "administrador";
  if (roles.includes("auxiliar")) return "auxiliar";
  return roles.includes("cliente") ? "cliente" : null;
}
export function visibleAccountProfiles(roles: readonly string[]) {
  if (roles.includes("luis")) return ACCOUNT_PROFILES.filter((profile) => profile.id === "luis");
  return ACCOUNT_PROFILES.filter((profile) => roles.includes(profile.id));
}
