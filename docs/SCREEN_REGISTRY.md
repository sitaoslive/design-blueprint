# Registro de pantallas (PROMPT 01B)

Generado desde `src/lib/vf/screens.ts`. Funcional = pantalla con datos reales; Estructura = ruta creada, contenido en próximo lote.

| ID | Ruta | Nombre | Rol | Frontend | Abre |
|---|---|---|---|---|---|
| PUBLIC-001 | `/` | Página de entrada | publico | funcional | / |
| PUBLIC-002 | `/servicios` | Servicios | publico | estructura | — |
| PUBLIC-003 | `/servicios/:slug` | Detalle de servicio | publico | estructura | — |
| PUBLIC-004 | `/zonas` | Zonas de atención | publico | estructura | — |
| PUBLIC-005 | `/como-funciona` | Cómo funciona | publico | estructura | — |
| PUBLIC-006 | `/nosotros` | Nosotros | publico | estructura | — |
| PUBLIC-007 | `/preguntas` | Preguntas frecuentes | publico | estructura | — |
| PUBLIC-008 | `/contacto` | Contacto | publico | estructura | — |
| PUBLIC-009 | `/privacidad` | Privacidad | publico | estructura | — |
| PUBLIC-010 | `/terminos` | Términos | publico | estructura | — |
| AUTH-001 | `/auth/login` | Inicio de sesión | publico | funcional | /auth |
| AUTH-002 | `/auth/invitacion` | Aceptar invitación | publico | estructura | — |
| AUTH-003 | `/auth/recuperar` | Recuperar acceso | publico | estructura | — |
| AUTH-004 | `/auth/restablecer` | Restablecer contraseña | publico | funcional | /reset-password |
| AUTH-005 | `/auth/verificar` | Verificación de identidad o cuenta | publico | estructura | — |
| AUTH-006 | `/auth/sesion-expirada` | Sesión expirada | publico | estructura | — |
| AUTH-007 | `/auth/acceso-denegado` | Sin permisos | publico | funcional | /sin-acceso |
| AUTH-008 | `/auth/seguridad` | Configuración de seguridad | publico | estructura | — |
| CLIENT-001 | `/app/inicio` | Inicio | cliente | funcional | /cliente |
| CLIENT-002 | `/app/mascotas` | Mis mascotas | cliente | funcional | /cliente/mascotas |
| CLIENT-003 | `/app/mascotas/nueva` | Agregar mascota | cliente | estructura | — |
| CLIENT-004 | `/app/mascotas/:id` | Perfil de mascota | cliente | funcional | /cliente/mascotas/:id |
| CLIENT-005 | `/app/mascotas/:id/editar` | Editar mascota | cliente | estructura | — |
| CLIENT-006 | `/app/mascotas/:id/salud` | Salud y controles | cliente | estructura | — |
| CLIENT-007 | `/app/mascotas/:id/documentos` | Documentos de mascota | cliente | estructura | — |
| CLIENT-008 | `/app/agenda` | Mi agenda | cliente | funcional | /cliente/agenda |
| CLIENT-009 | `/app/agenda/:id` | Detalle de cita | cliente | estructura | — |
| CLIENT-010 | `/app/reservar` | Reservar visita | cliente | funcional | /cliente/reservar |
| CLIENT-011 | `/app/solicitudes` | Mis solicitudes | cliente | estructura | — |
| CLIENT-012 | `/app/solicitudes/:id` | Detalle de solicitud | cliente | estructura | — |
| CLIENT-013 | `/app/solicitudes/:id/reprogramar` | Solicitar reprogramación | cliente | estructura | — |
| CLIENT-014 | `/app/solicitudes/:id/cancelar` | Solicitar cancelación | cliente | estructura | — |
| CLIENT-015 | `/app/visitas/:id/preparacion` | Preparación de visita | cliente | estructura | — |
| CLIENT-016 | `/app/visitas/:id/estado` | Estado de visita | cliente | estructura | — |
| CLIENT-017 | `/app/historial` | Historial de atención | cliente | estructura | — |
| CLIENT-018 | `/app/remisiones` | Remisiones y especialistas | cliente | funcional | /cliente/remisiones |
| CLIENT-019 | `/app/remisiones/:id` | Detalle de remisión | cliente | estructura | — |
| CLIENT-020 | `/app/remisiones/:id/seleccionar` | Selección de horario externo | cliente | estructura | — |
| CLIENT-021 | `/app/seguimientos` | Seguimientos | cliente | estructura | — |
| CLIENT-022 | `/app/pagos` | Mis pagos | cliente | funcional | /cliente/pagos |
| CLIENT-023 | `/app/pagos/:id` | Detalle de pago | cliente | estructura | — |
| CLIENT-024 | `/app/comprobantes` | Comprobantes | cliente | funcional | /cliente/documentos |
| CLIENT-025 | `/app/direcciones` | Direcciones | cliente | estructura | — |
| CLIENT-026 | `/app/direcciones/:id` | Editar dirección | cliente | estructura | — |
| CLIENT-027 | `/app/cuidadores` | Cuidadores | cliente | funcional | /cliente/cuidadores |
| CLIENT-028 | `/app/cuidadores/:id` | Autorización de cuidador | cliente | estructura | — |
| CLIENT-029 | `/app/preferencias` | Preferencias | cliente | estructura | — |
| CLIENT-030 | `/app/consentimientos` | Consentimientos | cliente | estructura | — |
| CLIENT-031 | `/app/notificaciones` | Notificaciones | cliente | funcional | /cliente/notificaciones |
| CLIENT-032 | `/app/ayuda` | Ayuda | cliente | funcional | /cliente/ayuda |
| CLIENT-033 | `/app/ayuda/solicitudes` | Quejas y solicitudes | cliente | estructura | — |
| CLIENT-034 | `/app/perfil` | Perfil | cliente | funcional | /cliente/perfil |
| CLIENT-035 | `/app/perfil/seguridad` | Seguridad y privacidad | cliente | estructura | — |
| CARE-001 | `/cuidador/inicio` | Resumen autorizado | cuidador | estructura | — |
| CARE-002 | `/cuidador/mascotas` | Mascotas asignadas | cuidador | estructura | — |
| CARE-003 | `/cuidador/mascotas/:id` | Perfil limitado | cuidador | estructura | — |
| CARE-004 | `/cuidador/visitas` | Visitas autorizadas | cuidador | estructura | — |
| CARE-005 | `/cuidador/visitas/:id` | Detalle | cuidador | estructura | — |
| CARE-006 | `/cuidador/tareas` | Responsabilidades | cuidador | estructura | — |
| CARE-007 | `/cuidador/mensajes` | Comunicaciones autorizadas | cuidador | estructura | — |
| CARE-008 | `/cuidador/perfil` | Datos personales | cuidador | estructura | — |
| STAFF-001 | `/equipo/hoy` | Mi jornada | veterinario | estructura | — |
| STAFF-002 | `/equipo/agenda` | Mi agenda | veterinario | estructura | — |
| STAFF-003 | `/equipo/ruta` | Mi ruta | veterinario | funcional | /equipo/ruta |
| STAFF-004 | `/equipo/rutas/:id` | Detalle de ruta | veterinario | estructura | — |
| STAFF-005 | `/equipo/visitas/:id` | Detalle de visita | veterinario | funcional | /equipo/visita/:id |
| STAFF-006 | `/equipo/visitas/:id/preparacion` | Preparación de visita | veterinario | estructura | — |
| STAFF-007 | `/equipo/visitas/:id/llegada` | Check-in y llegada | veterinario | estructura | — |
| STAFF-008 | `/equipo/visitas/:id/registro` | Registro de atención operativa | veterinario | estructura | — |
| STAFF-009 | `/equipo/visitas/:id/cierre` | Finalizar visita | veterinario | estructura | — |
| STAFF-010 | `/equipo/servicios` | Servicios realizados | veterinario | estructura | — |
| STAFF-011 | `/equipo/cobros` | Registro de cobros permitidos | veterinario | estructura | — |
| STAFF-012 | `/equipo/tareas` | Mis tareas | veterinario | funcional | /equipo/tareas |
| STAFF-013 | `/equipo/tareas/:id` | Detalle de tarea | veterinario | estructura | — |
| STAFF-014 | `/equipo/compromisos` | Compromisos posteriores | veterinario | estructura | — |
| STAFF-015 | `/equipo/compromisos/:id` | Detalle de compromiso | veterinario | estructura | — |
| STAFF-016 | `/equipo/remisiones` | Mis remisiones | veterinario | funcional | /equipo/remisiones |
| STAFF-017 | `/equipo/remisiones/nueva` | Nueva remisión | veterinario | estructura | — |
| STAFF-018 | `/equipo/remisiones/:id` | Detalle de remisión | veterinario | estructura | — |
| STAFF-019 | `/equipo/tratamientos` | Tratamientos recurrentes | veterinario | funcional | /equipo/tratamientos |
| STAFF-020 | `/equipo/tratamientos/:id` | Detalle de tratamiento | veterinario | estructura | — |
| STAFF-021 | `/equipo/insumos` | Insumos asignados | veterinario | funcional | /equipo/inventario |
| STAFF-022 | `/equipo/kit` | Mi kit | veterinario | estructura | — |
| STAFF-023 | `/equipo/incidencias` | Incidencias | veterinario | funcional | /equipo/incidencias |
| STAFF-024 | `/equipo/incidencias/nueva` | Reportar incidencia | veterinario | estructura | — |
| STAFF-025 | `/equipo/mensajes` | Mensajes internos | veterinario | estructura | — |
| STAFF-026 | `/equipo/turnos` | Turnos | veterinario | estructura | — |
| STAFF-027 | `/equipo/ausencias` | Ausencias | veterinario | estructura | — |
| STAFF-028 | `/equipo/academia` | Vet Life Academy | veterinario | funcional | /equipo/academia |
| STAFF-029 | `/equipo/academia/:id` | Lección | veterinario | estructura | — |
| STAFF-030 | `/equipo/evaluaciones` | Evaluaciones | veterinario | estructura | — |
| STAFF-031 | `/equipo/perfil` | Mi perfil | veterinario | estructura | — |
| STAFF-032 | `/equipo/ayuda` | Solicitar ayuda | veterinario | estructura | — |
| COORD-001 | `/operaciones/inicio` | Centro operativo | coordinador | funcional | /coordinacion |
| COORD-002 | `/operaciones/bandeja` | Solicitudes entrantes | coordinador | funcional | /coordinacion |
| COORD-003 | `/operaciones/bandeja/:id` | Detalle de caso | coordinador | funcional | /coordinacion |
| COORD-004 | `/operaciones/whatsapp` | Bandeja de WhatsApp | coordinador | estructura | — |
| COORD-005 | `/operaciones/whatsapp/:id` | Conversación | coordinador | estructura | — |
| COORD-006 | `/operaciones/contactos` | Contactos | coordinador | estructura | — |
| COORD-007 | `/operaciones/clientes` | Propietarios | coordinador | estructura | — |
| COORD-008 | `/operaciones/clientes/:id` | Ficha familiar | coordinador | estructura | — |
| COORD-009 | `/operaciones/mascotas/:id` | Mascota | coordinador | estructura | — |
| COORD-010 | `/operaciones/memoria/:id` | Customer Experience Memory | coordinador | estructura | — |
| COORD-011 | `/operaciones/compromisos` | Promesas y tareas pendientes | coordinador | estructura | — |
| COORD-012 | `/operaciones/agenda` | Agenda maestra | coordinador | funcional | /coordinacion/agenda |
| COORD-013 | `/operaciones/agenda/semana` | Vista semanal | coordinador | funcional | /coordinacion/agenda |
| COORD-014 | `/operaciones/agenda/profesionales` | Calendarios individuales | coordinador | funcional | /coordinacion/agenda |
| COORD-015 | `/operaciones/disponibilidad` | Motor de disponibilidad | coordinador | estructura | — |
| COORD-016 | `/operaciones/cita-rapida` | Quick Booking | coordinador | estructura | — |
| COORD-017 | `/operaciones/solicitudes` | Solicitudes | coordinador | funcional | /coordinacion/solicitudes |
| COORD-018 | `/operaciones/solicitudes/:id` | Detalle de solicitud | coordinador | funcional | /coordinacion/solicitudes |
| COORD-019 | `/operaciones/citas/:id` | Ficha de cita | coordinador | estructura | — |
| COORD-020 | `/operaciones/confirmaciones` | Confirmaciones pendientes | coordinador | estructura | — |
| COORD-021 | `/operaciones/reprogramaciones` | Cambios de cita | coordinador | estructura | — |
| COORD-022 | `/operaciones/lista-espera` | Lista de espera | coordinador | estructura | — |
| COORD-023 | `/operaciones/equipo` | Directorio del equipo | coordinador | funcional | /coordinacion/equipo |
| COORD-024 | `/operaciones/equipo/:id` | Perfil operativo | coordinador | funcional | /coordinacion/equipo |
| COORD-025 | `/operaciones/turnos` | Planificación de turnos | coordinador | estructura | — |
| COORD-026 | `/operaciones/ausencias` | Ausencias | coordinador | estructura | — |
| COORD-027 | `/operaciones/reemplazos` | Coberturas | coordinador | estructura | — |
| COORD-028 | `/operaciones/capacidad` | Capacidad actual | coordinador | estructura | — |
| COORD-029 | `/operaciones/capacidad/proyecciones` | Demanda futura | coordinador | estructura | — |
| COORD-030 | `/operaciones/bienestar` | Employee Experience Monitor | coordinador | estructura | — |
| COORD-031 | `/operaciones/competencias` | Capacidades profesionales | coordinador | estructura | — |
| COORD-032 | `/operaciones/rutas` | Vista general | coordinador | funcional | /coordinacion/rutas |
| COORD-033 | `/operaciones/rutas/:id` | Ruta individual | coordinador | funcional | /coordinacion/rutas |
| COORD-034 | `/operaciones/rutas/planificar` | Planificador | coordinador | funcional | /coordinacion/rutas |
| COORD-035 | `/operaciones/rutas/optimizar` | Propuestas de optimización | coordinador | funcional | /coordinacion/rutas |
| COORD-036 | `/operaciones/retrasos` | Retrasos | coordinador | estructura | — |
| COORD-037 | `/operaciones/urgencias` | Coordinación prioritaria | coordinador | estructura | — |
| COORD-038 | `/operaciones/contingencias` | Continuidad ante incidencias | coordinador | estructura | — |
| COORD-039 | `/operaciones/simulador` | Dashboard | coordinador | funcional | /coordinacion/simulador |
| COORD-040 | `/operaciones/simulador/nueva` | Crear escenario | coordinador | funcional | /coordinacion/simulador |
| COORD-041 | `/operaciones/simulador/:id` | Alternativas | coordinador | funcional | /coordinacion/simulador |
| COORD-042 | `/operaciones/simulador/:id/comparar` | Comparador | coordinador | funcional | /coordinacion/simulador |
| COORD-043 | `/operaciones/simulador/:id/impacto` | Impacto | coordinador | funcional | /coordinacion/simulador |
| COORD-044 | `/operaciones/simulador/:id/antes-despues` | Diferencias | coordinador | funcional | /coordinacion/simulador |
| COORD-045 | `/operaciones/simulador/:id/aprobaciones` | Aprobaciones | coordinador | funcional | /coordinacion/simulador |
| COORD-046 | `/operaciones/simulador/:id/ejecucion` | Plan de ejecución | coordinador | funcional | /coordinacion/simulador |
| COORD-047 | `/operaciones/simulador/:id/incidencias` | Errores parciales | coordinador | funcional | /coordinacion/simulador |
| COORD-048 | `/operaciones/simulador/historial` | Escenarios guardados | coordinador | funcional | /coordinacion/simulador |
| COORD-049 | `/operaciones/especialistas` | Directorio | coordinador | funcional | /coordinacion/especialistas |
| COORD-050 | `/operaciones/especialistas/:id` | Ficha de especialista | coordinador | funcional | /coordinacion/especialistas |
| COORD-051 | `/operaciones/especialistas/:id/disponibilidad` | Horarios | coordinador | funcional | /coordinacion/especialistas |
| COORD-052 | `/operaciones/especialistas/convenios` | Acuerdos | coordinador | funcional | /coordinacion/especialistas |
| COORD-053 | `/operaciones/remisiones` | Remisiones por resolver | coordinador | funcional | /coordinacion/remisiones |
| COORD-054 | `/operaciones/remisiones/nueva` | Crear remisión | coordinador | funcional | /coordinacion/remisiones |
| COORD-055 | `/operaciones/remisiones/:id` | Detalle | coordinador | funcional | /coordinacion/remisiones |
| COORD-056 | `/operaciones/remisiones/:id/horarios` | Horarios recibidos | coordinador | funcional | /coordinacion/remisiones |
| COORD-057 | `/operaciones/remisiones/:id/opciones` | Ofertas al cliente | coordinador | funcional | /coordinacion/remisiones |
| COORD-058 | `/operaciones/remisiones/:id/confirmacion` | Confirmación externa | coordinador | funcional | /coordinacion/remisiones |
| COORD-059 | `/operaciones/remisiones/:id/documentos` | Documentos | coordinador | funcional | /coordinacion/remisiones |
| COORD-060 | `/operaciones/remisiones/:id/seguimiento` | Continuidad | coordinador | funcional | /coordinacion/remisiones |
| COORD-061 | `/operaciones/resultados-pendientes` | Informes pendientes | coordinador | estructura | — |
| COORD-062 | `/operaciones/aprobaciones-clinicas` | Aprobaciones | coordinador | estructura | — |
| COORD-063 | `/operaciones/remisiones/estancadas` | Casos pendientes excesivamente | coordinador | funcional | /coordinacion/remisiones |
| COORD-064 | `/operaciones/okvet` | Centro de conciliación | coordinador | funcional | /coordinacion/okvet |
| COORD-065 | `/operaciones/okvet/importar` | Importación autorizada | coordinador | funcional | /coordinacion/okvet |
| COORD-066 | `/operaciones/okvet/mapeo` | Correspondencia de campos | coordinador | funcional | /coordinacion/okvet |
| COORD-067 | `/operaciones/okvet/vista-previa` | Revisión | coordinador | funcional | /coordinacion/okvet |
| COORD-068 | `/operaciones/okvet/conciliar` | Conciliación | coordinador | funcional | /coordinacion/okvet |
| COORD-069 | `/operaciones/okvet/conflictos` | Conflictos | coordinador | funcional | /coordinacion/okvet |
| COORD-070 | `/operaciones/okvet/historial` | Importaciones | coordinador | funcional | /coordinacion/okvet |
| COORD-071 | `/operaciones/incidencias` | Casos abiertos | coordinador | funcional | /coordinacion/incidencias |
| COORD-072 | `/operaciones/incidencias/:id` | Detalle | coordinador | funcional | /coordinacion/incidencias |
| COORD-073 | `/operaciones/quejas` | Quejas | coordinador | estructura | — |
| COORD-074 | `/operaciones/seguimientos` | Seguimientos | coordinador | estructura | — |
| COORD-075 | `/operaciones/calidad` | Calidad del servicio | coordinador | estructura | — |
| COORD-076 | `/operaciones/cierre-turno` | Resumen final de jornada | coordinador | estructura | — |
| EXEC-001 | `/direccion/inicio` | Dashboard ejecutivo | luis | funcional | /luis |
| EXEC-002 | `/direccion/excepciones` | Requiere tu atención | luis | estructura | — |
| EXEC-003 | `/direccion/aprobaciones` | Centro de aprobaciones | luis | funcional | /luis/aprobaciones |
| EXEC-004 | `/direccion/decisiones` | Decisiones y especialistas | luis | estructura | — |
| EXEC-005 | `/direccion/agenda` | Agenda | luis | funcional | /luis/agenda |
| EXEC-006 | `/direccion/equipo` | Equipo | luis | funcional | /luis/equipo |
| EXEC-007 | `/direccion/rutas` | Rutas | luis | estructura | — |
| EXEC-008 | `/direccion/whatsapp` | Centro de conversaciones | luis | estructura | — |
| EXEC-009 | `/direccion/clientes` | Clientes | luis | estructura | — |
| EXEC-010 | `/direccion/remisiones` | Remisiones | luis | estructura | — |
| EXEC-011 | `/direccion/especialistas` | Especialistas | luis | estructura | — |
| EXEC-012 | `/direccion/simulaciones` | Escenarios | luis | estructura | — |
| EXEC-013 | `/direccion/simulaciones/:id` | Comparación | luis | estructura | — |
| EXEC-014 | `/direccion/compromisos` | Compromisos | luis | estructura | — |
| EXEC-015 | `/direccion/informes-pendientes` | Resultados pendientes | luis | estructura | — |
| EXEC-016 | `/direccion/finanzas` | Resumen financiero | luis | funcional | /luis/finanzas |
| EXEC-017 | `/direccion/rentabilidad` | Rentabilidad | luis | estructura | — |
| EXEC-018 | `/direccion/capacidad` | Capacidad | luis | estructura | — |
| EXEC-019 | `/direccion/reportes/diario` | Informe diario | luis | estructura | — |
| EXEC-020 | `/direccion/reportes/semanal` | Informe semanal | luis | estructura | — |
| EXEC-021 | `/direccion/autonomia` | Índice de autonomía | luis | estructura | — |
| EXEC-022 | `/direccion/dependencia` | Dependencia operativa de Luis | luis | estructura | — |
| EXEC-023 | `/direccion/modo-ausencia` | Delegación | luis | funcional | /luis/ausencia |
| EXEC-024 | `/direccion/asistente` | Asistente IA | luis | funcional | /luis/asistente |
| EXEC-025 | `/direccion/asistente/historial` | Historial de conversaciones | luis | funcional | /luis/asistente |
| EXEC-026 | `/direccion/asistente/aprobaciones` | Acciones propuestas | luis | funcional | /luis/asistente |
| EXEC-027 | `/direccion/configuracion` | Preferencias de dirección | luis | estructura | — |
| ADMIN-001 | `/admin/inicio` | Panel administrativo | administrador | estructura | — |
| ADMIN-002 | `/admin/organizacion` | Datos de Vet Life | administrador | estructura | — |
| ADMIN-003 | `/admin/identidad` | Marca y diseño | administrador | estructura | — |
| ADMIN-004 | `/admin/zonas` | Zonas de servicio | administrador | estructura | — |
| ADMIN-005 | `/admin/horarios` | Horarios generales | administrador | estructura | — |
| ADMIN-006 | `/admin/servicios` | Catálogo | administrador | estructura | — |
| ADMIN-007 | `/admin/servicios/nuevo` | Crear servicio | administrador | estructura | — |
| ADMIN-008 | `/admin/servicios/:id` | Editar servicio | administrador | estructura | — |
| ADMIN-009 | `/admin/tarifas` | Tarifario | administrador | estructura | — |
| ADMIN-010 | `/admin/politicas` | Reglas empresariales | administrador | estructura | — |
| ADMIN-011 | `/admin/usuarios` | Usuarios | administrador | funcional | /luis/usuarios |
| ADMIN-012 | `/admin/usuarios/invitar` | Invitaciones | administrador | estructura | — |
| ADMIN-013 | `/admin/usuarios/:id` | Perfil | administrador | estructura | — |
| ADMIN-014 | `/admin/roles` | Roles | administrador | estructura | — |
| ADMIN-015 | `/admin/permisos` | Matriz de permisos | administrador | estructura | — |
| ADMIN-016 | `/admin/sesiones` | Sesiones | administrador | estructura | — |
| ADMIN-017 | `/admin/accesos` | Solicitudes de acceso | administrador | estructura | — |
| ADMIN-018 | `/admin/seguridad` | Políticas | administrador | estructura | — |
| ADMIN-019 | `/admin/auditoria` | Auditoría | administrador | estructura | — |
| ADMIN-020 | `/admin/privacidad` | Privacidad y retención | administrador | estructura | — |
| ADMIN-021 | `/admin/consentimientos` | Consentimientos | administrador | estructura | — |
| ADMIN-022 | `/admin/documentos-privados` | Administración de archivos autorizados | administrador | estructura | — |
| ADMIN-023 | `/admin/customer-memory` | Resumen | administrador | estructura | — |
| ADMIN-024 | `/admin/customer-memory/registros` | Memorias | administrador | estructura | — |
| ADMIN-025 | `/admin/customer-memory/verificacion` | Validaciones | administrador | estructura | — |
| ADMIN-026 | `/admin/customer-memory/correcciones` | Correcciones | administrador | estructura | — |
| ADMIN-027 | `/admin/customer-memory/compromisos` | Compromisos | administrador | estructura | — |
| ADMIN-028 | `/admin/customer-memory/sensibilidad` | Reglas de acceso | administrador | estructura | — |
| ADMIN-029 | `/admin/customer-memory/retencion` | Retención | administrador | estructura | — |
| ADMIN-030 | `/admin/comunicaciones` | Centro de comunicaciones | administrador | estructura | — |
| ADMIN-031 | `/admin/whatsapp` | Configuración de WhatsApp | administrador | estructura | — |
| ADMIN-032 | `/admin/plantillas` | Plantillas | administrador | estructura | — |
| ADMIN-033 | `/admin/plantillas/:id` | Editor de plantilla | administrador | estructura | — |
| ADMIN-034 | `/admin/ia-conversacional` | Configuración del asistente | administrador | estructura | — |
| ADMIN-035 | `/admin/traspasos` | Escalamiento humano | administrador | estructura | — |
| ADMIN-036 | `/admin/consentimiento-mensajes` | Permisos de contacto | administrador | estructura | — |
| ADMIN-037 | `/admin/campanas` | Campañas permitidas | administrador | estructura | — |
| ADMIN-038 | `/admin/metricas-comunicacion` | Métricas | administrador | estructura | — |
| ADMIN-039 | `/admin/finanzas` | Panel financiero | administrador | estructura | — |
| ADMIN-040 | `/admin/finanzas/cobros` | Cobros | administrador | estructura | — |
| ADMIN-041 | `/admin/finanzas/facturas` | Registros de facturación | administrador | estructura | — |
| ADMIN-042 | `/admin/finanzas/comprobantes` | Comprobantes | administrador | estructura | — |
| ADMIN-043 | `/admin/finanzas/conciliacion` | Conciliaciones | administrador | estructura | — |
| ADMIN-044 | `/admin/finanzas/costos` | Costos | administrador | estructura | — |
| ADMIN-045 | `/admin/finanzas/rentabilidad-servicio` | Por servicio | administrador | estructura | — |
| ADMIN-046 | `/admin/finanzas/rentabilidad-zona` | Por zona | administrador | estructura | — |
| ADMIN-047 | `/admin/finanzas/clientes` | Indicadores comerciales por cliente | administrador | estructura | — |
| ADMIN-048 | `/admin/finanzas/reportes` | Informes | administrador | estructura | — |
| ADMIN-049 | `/admin/inventario` | Resumen | administrador | estructura | — |
| ADMIN-050 | `/admin/inventario/productos` | Catálogo | administrador | estructura | — |
| ADMIN-051 | `/admin/inventario/productos/:id` | Ficha | administrador | estructura | — |
| ADMIN-052 | `/admin/inventario/ubicaciones` | Ubicaciones | administrador | estructura | — |
| ADMIN-053 | `/admin/inventario/kits` | Kits del equipo | administrador | estructura | — |
| ADMIN-054 | `/admin/inventario/movimientos` | Movimientos | administrador | estructura | — |
| ADMIN-055 | `/admin/inventario/lotes` | Lotes y vencimientos | administrador | estructura | — |
| ADMIN-056 | `/admin/inventario/alertas` | Faltantes | administrador | estructura | — |
| ADMIN-057 | `/admin/inventario/compras` | Solicitudes de compra | administrador | estructura | — |
| ADMIN-058 | `/admin/tratamientos` | Planes recurrentes | administrador | estructura | — |
| ADMIN-059 | `/admin/tratamientos/:id` | Detalle | administrador | estructura | — |
| ADMIN-060 | `/admin/tratamientos/calendario` | Programación | administrador | estructura | — |
| ADMIN-061 | `/admin/tratamientos/incumplimientos` | Alertas | administrador | estructura | — |
| ADMIN-062 | `/admin/prevencion` | Programas | administrador | estructura | — |
| ADMIN-063 | `/admin/prevencion/vacunacion` | Vacunación | administrador | estructura | — |
| ADMIN-064 | `/admin/prevencion/desparasitacion` | Desparasitación | administrador | estructura | — |
| ADMIN-065 | `/admin/prevencion/protocolos` | Protocolos aprobados | administrador | estructura | — |
| ADMIN-066 | `/admin/prevencion/recordatorios` | Recordatorios | administrador | estructura | — |
| ADMIN-067 | `/admin/calidad` | Panel de calidad | administrador | estructura | — |
| ADMIN-068 | `/admin/quejas` | Casos | administrador | estructura | — |
| ADMIN-069 | `/admin/encuestas` | Encuestas | administrador | estructura | — |
| ADMIN-070 | `/admin/resenas` | Reseñas | administrador | estructura | — |
| ADMIN-071 | `/admin/referidos` | Referidos | administrador | estructura | — |
| ADMIN-072 | `/admin/fidelizacion` | Fidelización | administrador | estructura | — |
| ADMIN-073 | `/admin/experiencia` | Experiencia del cliente | administrador | estructura | — |
| ADMIN-074 | `/admin/contenido` | Biblioteca de contenido autorizado | administrador | estructura | — |
| ADMIN-075 | `/admin/recuperacion-clientes` | Seguimientos administrativos | administrador | estructura | — |
| ADMIN-076 | `/admin/academia` | Panel | administrador | estructura | — |
| ADMIN-077 | `/admin/academia/cursos` | Cursos | administrador | estructura | — |
| ADMIN-078 | `/admin/academia/cursos/nuevo` | Crear curso | administrador | estructura | — |
| ADMIN-079 | `/admin/academia/cursos/:id` | Editar curso | administrador | estructura | — |
| ADMIN-080 | `/admin/academia/lecciones` | Lecciones | administrador | estructura | — |
| ADMIN-081 | `/admin/academia/evaluaciones` | Evaluaciones | administrador | estructura | — |
| ADMIN-082 | `/admin/academia/empleados` | Progreso | administrador | estructura | — |
| ADMIN-083 | `/admin/academia/competencias` | Habilidades | administrador | estructura | — |
| ADMIN-084 | `/admin/academia/onboarding` | Incorporación | administrador | estructura | — |
| ADMIN-085 | `/admin/academia/procedimientos` | Biblioteca de procedimientos | administrador | estructura | — |
| ADMIN-086 | `/admin/integraciones` | Estado general | administrador | funcional | /luis/configuracion |
| ADMIN-087 | `/admin/integraciones/supabase` | Backend | administrador | estructura | — |
| ADMIN-088 | `/admin/integraciones/n8n` | Automatizaciones | administrador | estructura | — |
| ADMIN-089 | `/admin/integraciones/whatsapp` | Mensajería | administrador | estructura | — |
| ADMIN-090 | `/admin/integraciones/google-calendar` | Calendarios | administrador | estructura | — |
| ADMIN-091 | `/admin/integraciones/mapas` | Cartografía | administrador | estructura | — |
| ADMIN-092 | `/admin/integraciones/okvet` | Conciliación oficial | administrador | estructura | — |
| ADMIN-093 | `/admin/integraciones/ia` | Proveedores de IA | administrador | estructura | — |
| ADMIN-094 | `/admin/integraciones/pagos` | Pagos | administrador | estructura | — |
| ADMIN-095 | `/admin/integraciones/notificaciones` | Notificaciones | administrador | estructura | — |
| ADMIN-096 | `/admin/automatizaciones` | Catálogo | administrador | estructura | — |
| ADMIN-097 | `/admin/automatizaciones/:id` | Detalle | administrador | estructura | — |
| ADMIN-098 | `/admin/automatizaciones/ejecuciones` | Historial | administrador | estructura | — |
| ADMIN-099 | `/admin/automatizaciones/eventos` | Eventos | administrador | estructura | — |
| ADMIN-100 | `/admin/automatizaciones/errores` | Fallos | administrador | estructura | — |
| ADMIN-101 | `/admin/automatizaciones/reintentos` | Recuperación | administrador | estructura | — |
| ADMIN-102 | `/admin/automatizaciones/alertas` | Alertas | administrador | estructura | — |
| ADMIN-103 | `/admin/automatizaciones/contratos` | Contratos de eventos | administrador | estructura | — |
| ADMIN-104 | `/admin/sistema/salud` | Estado general | administrador | estructura | — |
| ADMIN-105 | `/admin/sistema/errores` | Registro | administrador | estructura | — |
| ADMIN-106 | `/admin/sistema/monitoreo` | Servicios | administrador | estructura | — |
| ADMIN-107 | `/admin/sistema/respaldos` | Backups | administrador | estructura | — |
| ADMIN-108 | `/admin/sistema/restauracion` | Procedimientos | administrador | estructura | — |
| ADMIN-109 | `/admin/sistema/versiones` | Releases | administrador | estructura | — |
| ADMIN-110 | `/admin/sistema/costos` | Consumos | administrador | estructura | — |
| ADMIN-111 | `/admin/sistema/pruebas` | QA | administrador | estructura | — |
| ADMIN-112 | `/admin/sistema/mantenimiento` | Tareas técnicas | administrador | estructura | — |
| SPEC-001 | `/especialista/inicio` | Casos autorizados | especialista | estructura | — |
| SPEC-002 | `/especialista/solicitudes` | Solicitudes | especialista | estructura | — |
| SPEC-003 | `/especialista/solicitudes/:id` | Detalle | especialista | estructura | — |
| SPEC-004 | `/especialista/disponibilidad` | Horarios ofrecidos | especialista | estructura | — |
| SPEC-005 | `/especialista/citas` | Citas | especialista | estructura | — |
| SPEC-006 | `/especialista/citas/:id` | Detalle | especialista | estructura | — |
| SPEC-007 | `/especialista/documentos` | Documentos permitidos | especialista | estructura | — |
| SPEC-008 | `/especialista/informes` | Informes | especialista | estructura | — |
| SPEC-009 | `/especialista/informes/nuevo` | Subida autorizada | especialista | estructura | — |
| SPEC-010 | `/especialista/perfil` | Perfil | especialista | estructura | — |
| SPEC-011 | `/especialista/accesos` | Accesos concedidos | especialista | estructura | — |
| PMOS-001 | `/admin/project-memory` | Dashboard | administrador | estructura | — |
| PMOS-002 | `/admin/project-memory/prompts` | Historial de prompts | administrador | estructura | — |
| PMOS-003 | `/admin/project-memory/prompts/:id` | Detalle de prompt | administrador | estructura | — |
| PMOS-004 | `/admin/project-memory/requisitos` | Requisitos | administrador | estructura | — |
| PMOS-005 | `/admin/project-memory/requisitos/:id` | Detalle | administrador | estructura | — |
| PMOS-006 | `/admin/project-memory/pantallas` | Inventario de páginas | administrador | estructura | — |
| PMOS-007 | `/admin/project-memory/pantallas/:id` | Ficha de pantalla | administrador | estructura | — |
| PMOS-008 | `/admin/project-memory/funcionalidades` | Feature Registry | administrador | estructura | — |
| PMOS-009 | `/admin/project-memory/workflows` | Los 224 comportamientos | administrador | estructura | — |
| PMOS-010 | `/admin/project-memory/pruebas` | Las 170 pruebas | administrador | estructura | — |
| PMOS-011 | `/admin/project-memory/decisiones` | Decisiones | administrador | estructura | — |
| PMOS-012 | `/admin/project-memory/cambios` | Changelog | administrador | estructura | — |
| PMOS-013 | `/admin/project-memory/bloqueos` | Bloqueos | administrador | estructura | — |
| PMOS-014 | `/admin/project-memory/integraciones` | Estado de conexiones | administrador | funcional | /luis/configuracion |
| PMOS-015 | `/admin/project-memory/versiones` | Versiones | administrador | estructura | — |
| PMOS-016 | `/admin/project-memory/continuacion` | Resumen para nuevas sesiones | administrador | estructura | — |
