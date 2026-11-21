export const qualityScreens = [
  ["/operaciones/calidad", "Centro de Calidad y Experiencia", "QA-01"],
  ["/operaciones/calidad/pendientes", "Pendientes de calidad", "QA-06"],
  ["/operaciones/calidad/conversaciones", "Conversaciones por revisar", "QA-02"],
  ["/admin/calidad/ia", "Revisión del asistente", "QA-03"],
  ["/operaciones/quejas", "Quejas y resolución", "QA-04"],
  ["/operaciones/quejas/nueva", "Registrar inconveniente", "QA-04"],
  ["/operaciones/quejas/:id", "Seguimiento de queja", "QA-06"],
  ["/operaciones/calidad/escalamientos", "Escalamientos", "QA-05"],
  ["/operaciones/calidad/duelo", "Protección de contexto sensible", "QA-08"],
  ["/operaciones/calidad/causas", "Análisis de causas", "QA-09"],
  ["/operaciones/calidad/patrones", "Problemas recurrentes", "QA-09"],
  ["/operaciones/calidad/mejoras", "Mejora continua", "QA-10"],
  ["/admin/calidad/procedimientos-correctivos", "Procedimientos correctivos", "QA-10"],
  ["/direccion/calidad", "Calidad de Vet Life", "QA-01"],
  ["/admin/encuestas", "Encuestas y resultados", "QA-07"],
  ["/admin/encuestas/nueva", "Constructor de encuesta", "QA-07"],
  ["/admin/encuestas/:id", "Resultados de encuesta", "QA-07"],
  ["/app/encuestas/:id", "Tu experiencia con Vet Life", "QA-07"],
  ["/operaciones/clientes/:id/experiencia", "Experiencia de la familia", "CRM-01"],
  ["/operaciones/fidelizacion", "Relación y continuidad", "CRM-01"],
  ["/operaciones/fidelizacion/recordatorios", "Controles profesionales", "CRM-02"],
  ["/admin/contenido-educativo", "Contenido educativo", "CRM-03"],
  ["/admin/contenido-educativo/nuevo", "Nuevo contenido educativo", "CRM-03"],
  ["/admin/contenido-educativo/:id", "Revisión de contenido educativo", "CRM-03"],
  ["/app/recursos", "Biblioteca de Vet Life", "CRM-03"],
  ["/operaciones/fidelizacion/resenas", "Reseñas voluntarias", "CRM-04"],
  ["/operaciones/fidelizacion/testimonios", "Autorización de testimonios", "CRM-04"],
  ["/operaciones/fidelizacion/referidos", "Referidos voluntarios", "CRM-05"],
  ["/operaciones/fidelizacion/recuperacion", "Recuperación administrativa", "CRM-06"],
  ["/operaciones/fidelizacion/consentimientos", "Permisos por finalidad", "CRM-07"],
  ["/operaciones/fidelizacion/frecuencia", "Elegibilidad y frecuencia", "CRM-08"],
  ["/operaciones/fidelizacion/instagram", "Origen de solicitudes", "CRM-09"],
  ["/operaciones/fidelizacion/marca", "Estándares de experiencia", "CRM-10"],
  ["/app/ayuda", "Ayuda y contacto humano", "QA-04"],
] as const;
export function qualityScreen(path: string) {
  return qualityScreens.find(([pattern]) => {
    const a = pattern.split("/"),
      b = path.replace(/\/$/, "").split("/");
    return a.length === b.length && a.every((v, i) => v.startsWith(":") || v === b[i]);
  });
}
