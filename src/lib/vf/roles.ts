export type RoleId = "cliente" | "cuidador" | "veterinario" | "auxiliar" | "coordinador" | "recepcion" | "finanzas" | "administrador" | "luis" | "soporte" | "consultor" | "especialista";
export interface RoleDef { id: RoleId; label: string; desc: string; home: string; permissions: string[]; denied: string[]; }

export const ROLES: RoleDef[] = [
  { id: "luis", label: "Luis / Dirección", desc: "Centro ejecutivo y asistente privada", home: "/luis", permissions: ["Ver toda la operación", "Aprobar acciones sensibles", "Modo ausencia", "Asistente de Dirección"], denied: [] },
  { id: "coordinador", label: "Coordinador", desc: "Bandeja, agenda, equipo y rutas", home: "/coordinacion", permissions: ["Gestionar solicitudes", "Agendar y reasignar", "Rutas", "Incidencias"], denied: ["Decisiones clínicas", "Configuración empresarial"] },
  { id: "veterinario", label: "Veterinario", desc: "Mi jornada, ruta y visitas", home: "/equipo", permissions: ["Mis visitas", "Check-in", "Incidencias", "Formación"], denied: ["Finanzas globales", "Configuración"] },
  { id: "cliente", label: "Propietario / Cliente", desc: "Mascotas, citas y pagos", home: "/cliente", permissions: ["Mis mascotas", "Mis citas", "Pagos", "Ayuda por WhatsApp"], denied: ["Información de otros clientes"] },
  { id: "cuidador", label: "Cuidador autorizado", desc: "Acceso limitado por el propietario", home: "/cuidador/inicio", permissions: ["Ver citas autorizadas", "Recibir indicaciones autorizadas"], denied: ["Pagos", "Documentos clínicos no autorizados", "Modificar datos del propietario"] },
  { id: "auxiliar", label: "Auxiliar", desc: "Apoyo, insumos y visitas asignadas", home: "/rol/auxiliar", permissions: ["Preparar insumos", "Visitas asignadas", "Comunicación interna"], denied: ["Prescripción", "Decisiones profesionales reservadas"] },
  { id: "recepcion", label: "Recepción", desc: "Bandeja de atención y escalamiento", home: "/rol/recepcion", permissions: ["Identificar clientes", "Registrar solicitudes", "Escalar casos"], denied: ["Información clínica detallada", "Finanzas"] },
  { id: "finanzas", label: "Finanzas", desc: "Cobros, conciliación y rentabilidad", home: "/rol/finanzas", permissions: ["Cobros", "Conciliaciones", "Comprobantes", "Rentabilidad"], denied: ["Información clínica"] },
  { id: "administrador", label: "Administrador", desc: "Usuarios, permisos y configuración", home: "/admin", permissions: ["Usuarios y permisos", "Servicios, zonas, horarios", "Precios y políticas", "Automatizaciones"], denied: ["Decisiones clínicas"] },
  { id: "soporte", label: "Soporte técnico", desc: "Acceso temporal, mínimo y auditado", home: "/rol/soporte", permissions: ["Diagnóstico técnico temporal", "Ver registros de errores"], denied: ["Datos clínicos", "Datos personales sin autorización"] },
  { id: "consultor", label: "Consultor Alpha Vision", desc: "Indicadores autorizados", home: "/rol/consultor", permissions: ["Indicadores autorizados", "Configuraciones expresamente permitidas"], denied: ["Datos de clientes", "Información clínica"] },
  { id: "especialista", label: "Especialista externo", desc: "Solo remisiones autorizadas", home: "/especialista/inicio", permissions: ["Ver remisiones asignadas", "Publicar horarios", "Subir informes"], denied: ["Pagos", "Otros clientes", "Configuración"] },
];
export const roleById = (id: string) => ROLES.find((r) => r.id === id);
