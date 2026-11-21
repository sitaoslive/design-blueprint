VET FREEDOM OS — PROMPT 13

VET FREEDOM ADMIN, INTEGRATIONS & SYSTEM CONTROL CENTER

Advanced Business Configuration, Permissions, OKVET Reconciliation, Integration Monitoring, System Health, Incident Management, Governance & Deployment Readiness

Implementación completa para Lovable

Frontend + Backend Application Logic + Domain Services + Validation + Contracts + Automated QA

VERSIÓN 13.0

PROYECTO: VET FREEDOM OS
EMPRESA: Vet Life — Veterinaria a Domicilio
DIRECTOR: Dr. Luis Eduardo Ríos
DIRECCIÓN ESTRATÉGICA: Alpha Vision Method
PLATAFORMA: Lovable
BACKEND E INFRAESTRUCTURA: Antigravity + Supabase + n8n
IDIOMA: Español colombiano
ZONA HORARIA: America/Bogota
MONEDA PRINCIPAL: COP
DOCUMENTOS: Especificaciones maestras Partes 1, 2 y 3
CONTINUIDAD: Prompts 01 a 12

---

0. MISIÓN PRINCIPAL

Actúa como un equipo de ingeniería de sistemas empresariales conformado por:

- Principal Software Architect.
- Senior Full-Stack Engineer.
- Enterprise Administration Systems Architect.
- Integration Engineering Specialist.
- Site Reliability Engineer.
- Security & Access Control Architect.
- Business Operations Systems Engineer.
- Data Governance Specialist.
- QA Automation Engineer.
- DevOps Readiness Specialist.
- React & TypeScript Architect.
- Senior UX/UI Designer.
- Technical Product Manager.

Tu misión es construir:

VET FREEDOM CONTROL CENTER

El centro desde el cual Vet Life podrá administrar, configurar, supervisar y controlar su plataforma.

No queremos un panel administrativo genérico lleno de configuraciones técnicas que nadie entiende.

Queremos un centro de control empresarial avanzado, con una experiencia sencilla, que permita modificar reglas operativas autorizadas, entender la salud del sistema, supervisar integraciones y prevenir errores antes de que afecten a los clientes.

Debe responder preguntas como:

"¿Está funcionando WhatsApp?"

"¿Cuándo fue la última sincronización de Google Calendar?"

"¿Qué está pendiente de verificar en OKVET?"

"¿Qué servicios tenemos activos?"

"¿En qué zonas estamos atendiendo?"

"¿Quién puede aprobar una reprogramación?"

"¿Quién tiene acceso a los datos financieros?"

"¿Qué configuraciones se modificaron hoy?"

"¿Hay workflows con errores?"

"¿Cuáles integraciones están desconectadas?"

"¿Tenemos mensajes pendientes que no se enviaron?"

"¿Hay citas que aparecen diferentes en dos sistemas?"

"¿Estamos listos para lanzar la plataforma?"

"Si un servicio deja de funcionar, ¿cómo continúa operando Vet Life?"

El resultado debe permitir que Luis mantenga el control sin convertirse en administrador técnico de todos los sistemas.

---

1. ARQUITECTURA DEFINITIVA

Existen dos entornos de desarrollo.

LOVABLE — RESPONSABILIDAD DE ESTE PROMPT

Implementar:

- Todas las pantallas de administración.
- Dashboards.
- Formularios.
- Configuraciones visuales.
- Validaciones.
- Máquinas de estados.
- Reglas de negocio.
- Lógica de dominio TypeScript.
- Servicios de aplicación.
- Interfaces de integración.
- Contratos tipados.
- Monitoreo visual.
- Historial de cambios.
- Gestión visual de incidentes.
- Diagnósticos administrativos.
- Simulación de cambios.
- Previsualización de políticas.
- Gestión visual de permisos.
- Auditoría consultable.
- Centro de conciliación.
- Centro de importaciones.
- Panel de errores.
- Panel de costos.
- Configuración de preferencias.
- Controles de preparación de despliegue.
- Pruebas unitarias.
- Pruebas frontend.
- Pruebas de integración cuando existan contratos reales.
- Project Memory.

ANTIGRAVITY — RESPONSABILIDAD EXTERNA

Continúa encargado de:

- Supabase.
- Tablas y migraciones.
- RLS.
- Autenticación autoritativa.
- Permisos de servidor.
- Persistencia transaccional.
- Edge Functions.
- Almacenamiento privado.
- Integraciones externas.
- Tokens.
- Webhooks.
- n8n.
- Backups de infraestructura.
- Restauración técnica.
- Procesamiento de eventos.
- Seguridad del servidor.
- Ejecución real de cambios protegidos.

REGLA PRINCIPAL

Lovable administra la experiencia y prepara los cambios. Antigravity los aplica de forma segura donde exista autoridad de servidor.

PROHIBICIONES

NO crear otro Supabase.

NO generar migraciones.

NO desplegar Edge Functions.

NO instalar n8n.

NO construir workflows n8n.

NO crear un segundo backend de producción.

NO crear otro sistema de permisos.

NO almacenar tokens en el frontend.

NO mostrar secretos completos.

NO implementar operaciones privilegiadas directamente desde React.

NO declarar integraciones conectadas porque existe una pantalla.

NO crear confirmaciones falsas.

NO implementar un sistema de respaldo local como sustituto de los backups reales.

NO inventar una API de OKVET.

NO realizar scraping de OKVET como sustituto de una integración sin verificar autorización y viabilidad.

NO activar envíos reales sin aprobación explícita.

NO reconstruir módulos de los Prompts 01–12.

---

2. INSPECCIÓN DEL PROYECTO

Antes de construir:

1. Inspecciona todas las rutas.
2. Inspecciona layouts.
3. Inspecciona componentes compartidos.
4. Inspecciona el sistema de autenticación disponible.
5. Inspecciona roles.
6. Inspecciona permisos.
7. Inspecciona perfiles de empleados.
8. Inspecciona configuración de organización.
9. Inspecciona catálogo de servicios.
10. Inspecciona tarifas.
11. Inspecciona zonas.
12. Inspecciona horarios.
13. Inspecciona Smart Scheduler.
14. Inspecciona WhatsApp.
15. Inspecciona el asistente de Luis.
16. Inspecciona OKVET.
17. Inspecciona las integraciones.
18. Inspecciona los contratos Antigravity.
19. Inspecciona registros de errores existentes.
20. Inspecciona alertas.
21. Inspecciona el estado de pruebas.
22. Inspecciona Project Memory.
23. Inspecciona las tres especificaciones originales.

Documentos

PROJECT_CONTINUATION.md

PROJECT_IMPLEMENTATION_LEDGER.md

PROJECT_REQUIREMENTS.md

PROJECT_FEATURES.md

PROJECT_ROUTES.md

PROJECT_ROLES_PERMISSIONS.md

PROJECT_INTEGRATIONS.md

PROJECT_ARCHITECTURE.md

BACKEND_MODULE_REGISTRY.md

API_CONTRACT_REGISTRY.md

PROJECT_TEST_MATRIX.md

SCREEN_COVERAGE_MATRIX.md

Regla

No reconstruir lo que ya existe.

No duplicar administración de un módulo específico.

Si el tarifario del Prompt 09 está completo, conectar su editor existente.

Si las plantillas de WhatsApp del Prompt 04 existen, reutilizarlas.

Este centro debe centralizar navegación, configuraciones y supervisión.

---

3. COBERTURA OBLIGATORIA

Implementar las capacidades de administración transversal.

Requisitos originales

AD-01 a AD-14, especialmente AD-13 y las funciones de dirección y acceso móvil.

AI-05, AI-06, AI-11 y AI-12, en relación con aprobaciones, ejecución y auditoría.

Integración y mantenimiento

WF-097 — Importación de datos.

WF-098 — Mapeo de campos.

WF-099 — Conciliación de identificadores.

WF-100 — Gestión de conflictos.

WF-101 — Importación fallida.

WF-102 — Webhook fallido.

WF-103 — Mensajería fallida.

WF-104 — IA indisponible.

WF-105 — Control de costos.

WF-106 — Auditoría de permisos.

WF-107 — Verificación de copias de seguridad.

WF-108 — Restauración de prueba.

WF-109 — Vigilancia de vencimiento de credenciales.

WF-110 — Salud del sistema.

WF-111 — Retención de datos.

WF-112 — Incidente crítico.

Cobertura complementaria

Controles administrativos de las Partes 2 y 3:

Calendarios.

Disponibilidad.

Turnos.

Rutas.

Simulaciones.

Remisiones.

Especialistas.

Finanzas.

Customer Experience Memory.

Consumos y costos.

Comunicación.

Formación.

Calidad.

Importante

Estos identificadores representan comportamientos requeridos.

No crear workflows n8n en Lovable.

Registrar qué componente visual y servicio corresponde a cada comportamiento.

---

4. ARQUITECTURA DEL MÓDULO

Crear o extender:

src/features/system-administration/

Organización sugerida

components/

pages/

domain/

application/

schemas/

types/

hooks/

services/

adapters/

organization-settings/

service-settings/

coverage-settings/

scheduling-policies/

staff-administration/

roles-permissions/

approval-policies/

integration-monitor/

okvet-reconciliation/

data-import/

data-quality/

workflow-monitor/

system-health/

incident-management/

audit-center/

security-center/

cost-controls/

configuration-history/

feature-flags/

deployment-readiness/

support-tools/

tests/

Reutilizar

src/features/scheduling/

src/features/finance/

src/features/whatsapp/

src/features/customer-memory/

src/features/executive-assistant/

src/features/field-operations/

src/features/academy/

src/features/specialist-referrals/

Regla

No crear otra fuente de verdad.

No crear servicios vacíos.

Mantener lógica independiente de React.

---

5. EXPERIENCIA VISUAL DEL CONTROL CENTER

Crear un panel premium, intuitivo y muy ordenado.

Ruta principal:

/admin

Título:

Centro de Control Vet Freedom

Resumen superior

Estado general.

Integraciones conectadas.

Integraciones que requieren atención.

Errores pendientes.

Cambios de configuración.

Aprobaciones administrativas.

Salud de datos.

Secciones principales

CONFIGURACIÓN.

PERSONAL Y PERMISOS.

SERVICIOS Y COBERTURA.

INTEGRACIONES.

OKVET.

AUTOMATIZACIONES.

SEGURIDAD.

AUDITORÍA.

SALUD DEL SISTEMA.

DESPLIEGUE.

Diseño

Crema.

Ivory.

Terracota.

Verde salvia.

Texto oscuro.

Tarjetas suaves.

Indicadores claramente identificados.

Navegación lateral para escritorio.

Menús simples para móvil.

Regla

No mezclar errores técnicos con acciones administrativas sin explicación.

Cada alerta debe indicar:

Qué ocurre.

Qué afecta.

Quién puede resolverlo.

Qué acción corresponde.

---

6. HOME ADMINISTRATIVO

Ruta:

/admin/inicio

Mostrar

Estado de plataforma.

Servicios activos.

Profesionales habilitados.

Zonas atendidas.

Integraciones.

Errores.

Datos pendientes de conciliación.

Aprobaciones.

Cambios recientes.

Tarjetas

PLATAFORMA.

OPERACIÓN.

MENSAJERÍA.

AGENDA.

OKVET.

SEGURIDAD.

Acciones rápidas

CONFIGURAR SERVICIOS.

EDITAR ZONAS.

GESTIONAR PERMISOS.

VER INTEGRACIONES.

REVISAR ERRORES.

VER AUDITORÍA.

VER PRUEBAS.

Reglas

No presentar estado OK si no existe una comprobación reciente.

Si el sistema no puede consultar un servicio, mostrar:

Estado desconocido

No mostrar automáticamente:

Funcionando correctamente.

---

7. CONFIGURACIÓN GENERAL DE VET LIFE

Ruta:

/admin/configuracion/general

Campos

Nombre comercial.

Razón social cuando corresponda.

Logo.

Datos de contacto.

Teléfono administrativo.

WhatsApp asociado.

Correo.

Zona horaria.

Moneda.

Dirección administrativa.

Información pública autorizada.

Idioma.

Preferencias de formato.

Funciones

Editar.

Previsualizar.

Validar.

Guardar borrador.

Solicitar aplicación de cambios.

Consultar historial.

Reglas

No permitir introducir secretos.

No modificar la identidad de la organización sin permiso.

No utilizar estos datos para reemplazar registros financieros o legales históricos.

---

8. CATÁLOGO DE SERVICIOS

Reutilizar las pantallas del catálogo de servicios.

Rutas:

/admin/servicios

/admin/servicios/:id

Configurar

Nombre.

Categoría.

Descripción aprobada.

Duración.

Tarifa vinculada.

Zona.

Tipo de profesional requerido.

Competencias.

Recursos.

Preparación.

Disponibilidad.

Estado.

Estados

DRAFT.

ACTIVE.

INACTIVE.

RETIRED.

PENDING_REVIEW.

Validaciones

Duración válida.

Profesional habilitado.

Tarifa vigente.

Zona configurada.

Restricciones completas.

Reglas

No activar servicios clínicos nuevos sin aprobación correspondiente.

No modificar servicios históricos al editar el catálogo actual.

No duplicar el editor del Prompt 09.

---

9. ZONAS Y COBERTURA

Ruta:

/admin/zonas

/admin/zonas/:id

Interfaz

Mapa.

Lista de zonas.

Sectores.

Municipios.

Cobertura.

Restricciones.

Tarifas de desplazamiento cuando estén aprobadas.

Profesionales disponibles por zona.

Funciones

Crear borrador.

Editar límites administrativos.

Consultar cobertura.

Validar solapamientos.

Previsualizar impacto.

Solicitar activación.

Reglas

No inventar límites geográficos.

No activar una zona sin comprobar capacidad operativa.

No asumir que una dirección pertenece a una zona por coincidencia de texto únicamente.

No utilizar mapas como fuente de autoridad si existen restricciones administrativas más específicas.

---

10. SIMULACIÓN DE CAMBIO DE COBERTURA

Antes de agregar o quitar una zona:

Mostrar:

Clientes potencialmente afectados.

Citas futuras en el sector.

Personal habilitado.

Capacidad.

Rutas.

Tarifas.

Condiciones.

Motor

CoverageChangeImpactEvaluator.

Salida

ChangeImpact.

Warnings.

AffectedAppointments.

AffectedStaff.

ApprovalRequirements.

Regla

Guardar una propuesta no cambia la cobertura real.

Los cambios requieren operación autorizada.

---

11. HORARIOS DE OPERACIÓN

Ruta:

/admin/horarios

Configurar separadamente

Horario administrativo.

Horario de recepción.

Horario de servicios domiciliarios.

Disponibilidad del equipo.

Horarios por zona cuando existan.

Atención fuera de horario.

Días no operativos.

Excepciones.

Regla

No confundir horario de atención administrativa con disponibilidad veterinaria real.

No declarar atención de urgencias 24/7 sin cobertura verificada.

No permitir que un horario general anule descansos o ausencias del personal.

---

12. CONFIGURACIÓN DE AGENDA

Ruta:

/admin/agenda/configuracion

Parámetros

Duraciones por servicio.

Buffers.

Ventanas de reserva.

Anticipación mínima.

Reservas provisionales.

Expiraciones.

Restricciones.

Reglas de asignación.

Criterios de continuidad.

Prioridades administrativas.

Interfaz

Formulario por secciones.

Previsualización.

Advertencias.

Impacto de cambios.

Integración

Reutilizar Smart Scheduler.

Reglas

No cambiar citas ya confirmadas al modificar parámetros generales.

No alterar restricciones profesionales protegidas.

No aplicar una política nueva retroactivamente sin procedimiento autorizado.

---

13. CONFIGURACIÓN DE RUTAS

Ruta:

/admin/rutas/configuracion

Parámetros

Buffers de desplazamiento.

Método de estimación.

Zonas.

Criterios de asignación.

Ventanas horarias.

Restricciones de vehículo cuando apliquen.

Políticas de publicación.

Reglas

No inventar tiempos de viaje.

No activar geolocalización permanente por defecto.

No publicar rutas nuevas por cambiar un parámetro.

No desplazar visitas protegidas sin aprobación.

---

14. CENTRO DE REGLAS OPERATIVAS

Ruta:

/admin/politicas-operativas

Objetivo

Permitir modificar reglas autorizadas sin editar código directamente.

Categorías

Agenda.

Reservas.

Asignaciones.

Cobertura.

Turnos.

Descansos.

Comunicación.

Seguimiento.

Compromisos.

Rutas.

Inventario.

Calidad.

Modelo

Policy ID.

Version.

Scope.

Description.

Parameters.

Status.

EffectiveAt.

ApprovedBy.

Estados

DRAFT.

PENDING_REVIEW.

APPROVED.

SCHEDULED.

ACTIVE.

SUPERSEDED.

DISABLED.

Reglas

No permitir políticas contradictorias.

No permitir que una política comercial ignore una restricción clínica.

No activar reglas sin validar su impacto.

---

15. MOTOR DE VALIDACIÓN DE CONFIGURACIONES

Implementar:

ConfigurationValidationEngine

Funciones

validateConfigurationSchema()

detectPolicyConflict()

evaluateConfigurationDependencies()

validateEffectiveDate()

detectUnsafeChange()

buildConfigurationDiff()

Ejemplos

Reserva provisional con duración inválida.

Servicio activo sin profesional habilitado.

Zona activa sin cobertura.

Horario incompatible.

Canal de mensajería desactivado para una comunicación obligatoria.

Regla de seguimiento sin responsable.

Resultado

VALID.

VALID_WITH_WARNINGS.

REQUIRES_APPROVAL.

INVALID.

Reglas

La validación local no sustituye la validación de servidor.

No aplicar configuraciones inválidas.

---

16. VERSIONADO DE CONFIGURACIONES

Crear:

ConfigurationChangeManager

Funciones

Borrador.

Comparación.

Previsualización.

Evaluación de impacto.

Aprobación.

Solicitud de publicación.

Historial.

Solicitud de reversión.

Vista

ANTES.

DESPUÉS.

Regla

No sobrescribir silenciosamente la configuración anterior.

Una reversión debe ser un cambio controlado y auditado.

No prometer rollback automático de cambios externos irreversibles.

---

17. USUARIOS Y PERSONAL

Rutas:

/admin/usuarios

/admin/usuarios/:id

/admin/equipo

Funciones

Consultar usuarios.

Filtrar por rol.

Consultar estado.

Consultar último acceso cuando exista.

Consultar formación.

Consultar permisos.

Solicitar activación.

Solicitar suspensión.

Solicitar cambio de rol.

Estados

INVITED.

PENDING_VERIFICATION.

ACTIVE.

SUSPENDED.

DEACTIVATED.

Reglas

No crear usuarios reales únicamente en estado local.

No mostrar datos privados innecesarios.

No asignar derechos profesionales solo porque un usuario tiene un correo corporativo.

---

18. MATRIZ DE ROLES

Ruta:

/admin/permisos

Crear una matriz visual completa.

Roles

Luis / dirección.

Administrador.

Coordinación.

Recepción.

Veterinario.

Auxiliar.

Finanzas.

Calidad.

Responsable de Academy.

Especialista externo.

Consultor Alpha Vision.

Soporte técnico temporal.

Cliente.

Cuidador autorizado.

Permisos

Consultar.

Crear.

Editar.

Solicitar.

Aprobar.

Rechazar.

Ejecutar.

Exportar.

Compartir.

Administrar.

Dominios

Clientes.

Mascotas.

Citas.

Agenda.

Rutas.

Equipo.

Inventario.

Finanzas.

Documentos.

Remisiones.

Calidad.

Academy.

Configuraciones.

Integraciones.

Auditoría.

Seguridad

No usar únicamente controles de interfaz.

La autorización real debe ocurrir en Antigravity.

---

19. MOTOR DE EVALUACIÓN DE PERMISOS

Crear:

PermissionPreviewEngine

Objetivo

Ayudar a los administradores a comprender los efectos de un cambio.

Ejemplo

Si asignamos el rol de coordinador:

¿Qué podrá consultar?

¿Qué podrá modificar?

¿Qué aprobaciones tendrá?

¿Qué información privada seguirá restringida?

Resultado

PermissionChangePreview.

Reglas

La vista previa no concede permisos.

Los permisos del servidor deben ser aplicados mediante operación autorizada.

No permitir autoelevación.

No permitir que un usuario apruebe su propio aumento de privilegios cuando la política exige segregación.

---

20. CENTRO DE APROBACIONES ADMINISTRATIVAS

Ruta:

/admin/aprobaciones

Reutilizar el sistema del Prompt 12.

Tipos

Cambio de rol.

Cambio de tarifa.

Nueva zona.

Activación de servicio.

Cambio de política.

Cambio de proveedor.

Importación relevante.

Ajuste de retención.

Exportación sensible.

Mostrar

Solicitante.

Cambio.

Impacto.

Fecha.

Permisos.

Riesgos.

Aprobadores.

Estado.

Reglas

No duplicar Approval Service.

No permitir aprobar una propuesta modificada después de la revisión sin revalidación.

No permitir aprobaciones clínicas por personal administrativo.

---

21. CENTRO DE INTEGRACIONES

Ruta:

/admin/integraciones

Este será uno de los paneles más importantes de la plataforma.

Crear tarjetas para

Supabase.

n8n.

WhatsApp Business Platform.

Google Calendar.

Google Maps o proveedor autorizado.

Waze.

OKVET.

Proveedor de IA.

Servicio de voz/transcripción.

Correo.

Notificaciones.

Pasarela de pagos, si existe.

Proveedor de facturación, si existe.

Cada tarjeta debe mostrar

Nombre.

Propósito.

Estado real.

Última comprobación.

Último evento procesado.

Último error.

Impacto.

Responsable técnico.

Estados

NOT_CONFIGURED.

CONFIGURED_UNVERIFIED.

CONNECTED.

DEGRADED.

DISCONNECTED.

AUTH_EXPIRED.

ERROR.

UNKNOWN.

Regla

No mostrar CONNECTED si el único hecho conocido es que alguien escribió una credencial.

---

22. DETALLE DE CADA INTEGRACIÓN

Ruta:

/admin/integraciones/:provider

Pestañas

RESUMEN.

ESTADO.

EVENTOS.

ERRORES.

CONFIGURACIÓN VISIBLE.

DEPENDENCIAS.

PRUEBAS.

HISTORIAL.

Funciones

Consultar estado.

Ver contrato.

Ver última respuesta.

Ver errores sanitizados.

Solicitar prueba autorizada.

Consultar responsable.

Abrir documentación.

Regla

Lovable no debe gestionar secretos directamente.

Si existe una acción de reconexión, debe dirigir a un flujo seguro del backend o a una pantalla autorizada del proveedor.

No inventar un botón que aparenta reconectar sin ejecutar nada.

---

23. PANEL DE WHATSAPP

Reutilizar el Prompt 04.

Mostrar

Estado del canal.

Número asociado.

Plantillas aprobadas.

Mensajes pendientes.

Mensajes fallidos.

Mensajes entregados.

Último webhook válido.

Último error.

Estado de IA.

Modo humano.

Acciones

ABRIR BANDEJA.

VER PLANTILLAS.

VER FALLOS.

VER DIAGNÓSTICO.

SOLICITAR PRUEBA AUTORIZADA.

Reglas

No activar mensajes reales automáticamente.

No revelar access tokens.

No marcar enviado como entregado.

---

24. PANEL DE GOOGLE CALENDAR

Reutilizar Smart Scheduler.

Mostrar

Profesionales conectados.

Calendarios autorizados.

Última sincronización.

Estado de conexión.

Eventos pendientes.

Conflictos.

Errores.

Acciones

VER CALENDARIOS.

VER CONFLICTOS.

SOLICITAR RECONCILIACIÓN.

CONSULTAR SINCRONIZACIÓN.

Privacidad

No exponer los detalles de eventos personales privados.

Mostrar ocupación cuando corresponda.

No publicar permisos OAuth ni refresh tokens.

---

25. CENTRO DE OKVET

Ruta:

/admin/okvet

Crear:

OKVET Reconciliation & Verification Center

Contexto obligatorio

OKVET conserva las referencias clínicas y de confirmación oficial correspondientes.

Vet Freedom OS administra solicitudes, coordinación, agenda operativa y estados relacionados.

No asumir que existe una API pública disponible.

Modalidades soportadas

Registro manual verificado.

Importación de archivos autorizados.

Referencia a registro externo.

Conciliación administrativa.

Integración adicional, solamente si existe autorización y contrato viable.

Reglas

No inventar endpoints.

No crear sincronización bidireccional ficticia.

No realizar scraping de credenciales o sesiones sin autorización.

No modificar expedientes clínicos desde interfaces administrativas no habilitadas.

---

26. IMPORTACIÓN DE DATOS OKVET

Ruta:

/admin/okvet/importar

Crear un wizard completo.

Paso 1 — Origen

Seleccionar archivo autorizado.

Paso 2 — Tipo

Identificar clase de exportación.

Paso 3 — Vista previa

Mostrar datos interpretados.

Paso 4 — Mapeo

Relacionar campos.

Paso 5 — Validación

Identificar errores.

Paso 6 — Duplicados

Mostrar posibles coincidencias.

Paso 7 — Conflictos

Solicitar revisión.

Paso 8 — Confirmación

Preparar importación.

Paso 9 — Resultado

Consultar resultado real del backend.

Regla

La previsualización en Lovable no debe modificar datos oficiales.

El procesamiento persistente ocurre en Antigravity.

---

27. MOTOR DE MAPEO

Crear:

ImportMappingEngine

Funciones

normalizeColumnHeaders()

suggestFieldMapping()

validateRequiredColumns()

evaluateDataTypes()

detectMissingIdentifiers()

buildImportPreview()

Importante

Las sugerencias de mapeo no son verificaciones oficiales.

El usuario debe poder revisar correspondencias ambiguas.

Datos

Campo de origen.

Campo de destino.

Transformación permitida.

Tipo.

Obligatoriedad.

Estado.

Reglas

No interpretar nombres similares como registros idénticos.

No fusionar mascotas o propietarios automáticamente por coincidencia de texto.

---

28. CONCILIACIÓN DE IDENTIFICADORES

Ruta:

/admin/okvet/conciliacion

Crear:

ExternalRecordReconciliationEngine

Entidades

Propietario.

Mascota.

Cita.

Visita.

Servicio.

Profesional.

Referencia externa.

Estados

MATCHED.

POSSIBLE_MATCH.

UNMATCHED.

CONFLICT.

REQUIRES_REVIEW.

VERIFIED.

Interfaz

REGISTRO VET FREEDOM.

REGISTRO OKVET.

Comparación.

Diferencias.

Acción propuesta.

Reglas

No fusionar registros clínicos automáticamente.

No sobrescribir estados oficiales cuando hay conflicto.

Registrar evidencia de revisión.

---

29. CENTRO DE CONFLICTOS OKVET

Ruta:

/admin/okvet/conflictos

Casos

Cita en Vet Freedom pendiente, OKVET confirmado.

Cita operativa confirmada pero referencia oficial faltante.

Fecha diferente.

Profesional diferente.

Mascota no identificada inequívocamente.

Referencia externa duplicada.

Registro cancelado.

Acciones

REVISAR.

VINCULAR CON EVIDENCIA.

SOLICITAR VERIFICACIÓN.

ASIGNAR RESPONSABLE.

CERRAR CON EVIDENCIA.

Regla

No cambiar automáticamente el estado clínico oficial.

No marcar la cita como confirmada sin la validación requerida.

---

30. CALIDAD DE DATOS

Ruta:

/admin/datos/calidad

Monitorear

Propietarios potencialmente duplicados.

Mascotas potencialmente duplicadas.

Direcciones incompletas.

Contactos sin verificación.

Citas sin referencia.

Servicios inconsistentes.

Referencias externas faltantes.

Compromisos sin responsable.

Registros desactualizados.

Motor

DataQualityEvaluator

Salida

DataQualityFinding.

Reglas

Diferenciar dato faltante de dato incorrecto.

No modificar registros sin autorización.

No unificar clientes únicamente por similitud.

---

31. CENTRO DE AUTOMATIZACIONES

Ruta:

/admin/automatizaciones

Crear:

Automation Operations Monitor

Este módulo supervisa las automatizaciones desarrolladas en Antigravity y n8n.

No las reconstruye.

Mostrar

Nombre.

Identificador lógico.

Propósito.

Estado.

Última ejecución.

Último resultado.

Errores.

Responsable.

Eventos relacionados.

Grupos

Atención.

Memoria.

Citas.

Equipo.

Rutas.

Tratamientos.

Fidelización.

Asistente.

Mantenimiento.

Simulaciones.

Especialistas.

Reglas

No asumir que cada requisito WF corresponde a un workflow n8n independiente.

Permitir relacionar varios comportamientos con un workflow compartido.

---

32. DETALLE DE AUTOMATIZACIÓN

Ruta:

/admin/automatizaciones/:id

Mostrar

Nombre.

Descripción.

Eventos de activación.

Condiciones.

Dependencias.

Estado actual.

Última ejecución.

Duración.

Resultado.

Fallos.

Acciones

VER EJECUCIONES.

VER ERRORES.

ABRIR DOCUMENTACIÓN.

SOLICITAR DIAGNÓSTICO.

SOLICITAR REINTENTO AUTORIZADO.

Regla

No crear interruptores decorativos de "activar" o "desactivar".

Las acciones deben estar conectadas a contratos reales y pasar por autorización.

---

33. MONITOR DE EVENTOS

Ruta:

/admin/eventos

Objetivo

Consultar eventos operativos y de integración sin necesitar abrir n8n.

Mostrar

Evento.

Tipo.

Origen.

Fecha.

Entidad relacionada.

Estado.

Intentos.

Correlation ID.

Resultado.

Estados

RECEIVED.

VALIDATED.

QUEUED.

PROCESSING.

PROCESSED.

FAILED.

RETRY_SCHEDULED.

DEAD_LETTER.

CANCELLED.

Reglas

No mostrar payloads sensibles completos.

Los estados deben reflejar datos reales.

Un evento recibido no equivale a evento procesado.

---

34. ERRORES Y RECUPERACIÓN

Ruta:

/admin/errores

Categorías

Error de webhook.

Error de autenticación.

Error de mensajería.

Error de calendario.

Error de OKVET.

Error de pagos.

Error de IA.

Error de almacenamiento.

Error de permisos.

Error de sincronización.

Error de lógica de aplicación.

Cada error debe mostrar

Servicio.

Tipo.

Fecha.

Impacto.

Estado.

Número de intentos.

Responsable.

Acción disponible.

Acciones

VER DETALLE.

ASIGNAR.

SOLICITAR REINTENTO.

ESCALAR.

REGISTRAR RESOLUCIÓN.

Regla

No permitir reintentos arbitrarios de operaciones financieras o reservas.

El backend debe comprobar idempotencia y seguridad antes de ejecutar de nuevo.

---

35. DEAD LETTER & RETRY MONITOR

Crear:

FailedEventRecoveryPanel

Mostrar

Eventos que agotaron reintentos.

Eventos bloqueados.

Eventos rechazados.

Dependencias.

Historial.

Estados

PENDING_REVIEW.

RETRY_ELIGIBLE.

RETRY_REQUESTED.

REPROCESSING.

RECOVERED.

NON_RETRYABLE.

CLOSED_WITH_REASON.

Reglas

No permitir replay directo desde el navegador.

No perder el historial original.

No duplicar mensajes.

No duplicar cobros.

No duplicar citas.

No reabrir compromisos ya resueltos.

---

36. SALUD DEL SISTEMA — WF-110

Ruta:

/admin/salud

Crear:

System Health Command Center

Componentes

ApplicationHealthCard.

SupabaseHealthCard.

N8nHealthCard.

WhatsAppHealthCard.

CalendarHealthCard.

OKVETStatusCard.

AIServiceHealthCard.

StorageHealthCard.

QueueHealthCard.

ErrorRateCard.

Estados

HEALTHY.

DEGRADED.

OUTAGE.

UNKNOWN.

MAINTENANCE.

Datos

Último chequeo.

Latencia reportada cuando exista.

Tasa de errores.

Último éxito.

Último fallo.

Dependencias.

Reglas

No confundir que la página cargue con que las operaciones funcionen.

No declarar HEALTHY sin comprobación.

No crear métricas inventadas.

---

37. OBSERVABILIDAD Y DIAGNÓSTICO

Crear una interfaz que permita seguir procesos entre sistemas.

Ejemplo

Solicitud de cita.

Registro en Vet Freedom.

Verificación de datos.

Consulta de disponibilidad.

Validación OKVET.

Confirmación.

Notificación al cliente.

Asignación de ruta.

Mostrar

Correlation ID.

Estado de cada etapa.

Último evento.

Error.

Dependencia.

Responsable.

Regla

La aplicación debe permitir identificar dónde se detuvo el proceso.

No exponer datos clínicos innecesarios en trazas.

---

38. CENTRO DE INCIDENTES

Ruta:

/admin/incidentes-sistema

/admin/incidentes-sistema/:id

Categorías

Incidente menor.

Degradación.

Caída de integración.

Falla crítica.

Incidente de seguridad.

Problema de datos.

Estados

OPEN.

ACKNOWLEDGED.

INVESTIGATING.

MITIGATING.

MONITORING.

RESOLVED.

POSTMORTEM_PENDING.

CLOSED.

Formulario

Título.

Servicio.

Impacto.

Usuarios afectados.

Fecha.

Responsable.

Estado.

Acciones.

Evidencia.

Reglas

No ocultar incidentes abiertos.

No declarar un incidente resuelto por cerrar un ticket.

No divulgar detalles de seguridad a roles no autorizados.

---

39. CENTRO DE CONTINGENCIAS

Ruta:

/admin/contingencias

Crear:

Business Continuity Center

Escenarios

WhatsApp no disponible.

Google Calendar desconectado.

OKVET inaccesible.

IA indisponible.

Mapas no disponibles.

Error de sincronización.

Aplicación parcialmente disponible.

Falla crítica.

Para cada escenario

Impacto.

Procedimiento manual aprobado.

Responsable.

Contacto alternativo.

Información disponible.

Información no verificada.

Registro de recuperación.

Regla

Nunca prometer continuidad automática de un servicio que depende de una integración caída.

Mantener protocolos profesionales para situaciones urgentes.

No permitir cambios oficiales sin registro posterior y conciliación.

---

40. SEGURIDAD OPERACIONAL

Ruta:

/admin/seguridad

Mostrar

Usuarios activos.

Cambios de rol.

Accesos temporales.

Solicitudes de permisos.

Incidentes de acceso.

Alertas.

Revisiones pendientes.

Reglas

No mostrar contraseñas.

No mostrar tokens.

No mostrar claves secretas.

No registrar credenciales en logs.

Las acciones sobre sesiones, permisos y revocaciones deben realizarse en servidor.

---

41. ACCESO TEMPORAL DE SOPORTE

Crear un flujo para soporte técnico autorizado.

Campos

Usuario.

Propósito.

Alcance.

Duración.

Aprobación.

Fecha de expiración.

Estado.

Reglas

Permisos mínimos.

Expiración real en backend.

Auditoría.

Sin acceso automático a historias clínicas.

Sin acceso a finanzas sensibles salvo autorización estrictamente necesaria.

No crear usuarios técnicos permanentes como atajo operativo.

---

42. AUDITORÍA GENERAL — WF-106

Ruta:

/admin/auditoria

Mostrar

Quién.

Qué hizo.

Cuándo.

Qué entidad.

Estado anterior.

Estado posterior.

Origen.

Resultado.

Aprobación.

Filtros

Usuario.

Módulo.

Fecha.

Tipo de acción.

Entidad.

Estado.

Reglas

No permitir editar auditorías.

No registrar secretos.

No presentar logs del frontend como sustituto de auditoría autoritativa.

No exponer detalles clínicos innecesarios.

---

43. CENTRO DE PRIVACIDAD Y RETENCIÓN

Ruta:

/admin/privacidad

Políticas

Mensajes.

Contactos.

Preferencias.

Consentimientos.

Documentos.

Memoria familiar.

Registros clínicos referenciados.

Auditoría.

Archivos temporales.

Funciones

Consultar política.

Ver vigencia.

Preparar modificación.

Consultar aprobación.

Consultar estado de aplicación.

Reglas

No ejecutar borrados masivos desde React.

No eliminar registros sujetos a conservación legal aplicable.

No prometer eliminación completa sin ejecución real y confirmación del backend.

La configuración debe respetar la legislación aplicable y las políticas verificadas.

---

44. COSTOS DE INFRAESTRUCTURA — WF-105

Ruta:

/admin/costos-sistema

Mostrar cuando existan datos

Consumo de IA.

Mensajería.

Mapas.

Almacenamiento.

Servicios externos.

Errores que generan reintentos.

Costos reportados.

Presupuestos.

Estados

REPORTED.

ESTIMATED.

UNKNOWN.

Alertas

Presupuesto cercano.

Consumo inusual.

Errores repetitivos.

Servicio costoso.

Reglas

No inventar precios.

No presentar costos estimados como facturas del proveedor.

No confundir costos de infraestructura con costos operativos de visitas.

---

45. ESTADO DE CREDENCIALES — WF-109

Ruta:

/admin/integraciones/credenciales

Mostrar

Proveedor.

Configuración presente.

Estado.

Última verificación.

Expiración conocida cuando corresponda.

Responsable.

Prohibiciones

No mostrar secreto completo.

No copiar tokens al navegador.

No permitir descargarlos mediante la interfaz.

No guardar secretos en almacenamiento local.

Acciones

SOLICITAR REVISIÓN.

VER PROCEDIMIENTO.

INICIAR RECONEXIÓN SEGURA, solamente cuando exista contrato autorizado.

---

46. BACKUPS Y RESTAURACIÓN

Ruta:

/admin/respaldo

Mostrar

Política de respaldo reportada.

Último respaldo confirmado.

Estado.

Última verificación.

Última prueba de restauración.

Responsable.

Advertencias.

Reglas

Lovable no debe implementar backups de Supabase por su cuenta.

No simular restauraciones.

No marcar backups como verificados porque la interfaz muestra una fecha.

Las operaciones reales pertenecen a Antigravity y los proveedores de infraestructura.

Acciones

VER ESTADO.

SOLICITAR VERIFICACIÓN.

CONSULTAR DOCUMENTACIÓN.

SOLICITAR PRUEBA AUTORIZADA.

---

47. ADMINISTRACIÓN DE FEATURE FLAGS

Ruta:

/admin/funcionalidades

Objetivo

Controlar progresivamente qué módulos se muestran y cuáles están habilitados.

Ejemplos

WhatsApp.

IA automática.

Quick Booking.

Specialist Portal.

Customer Portal.

Payment Experience.

Simulador.

Modo ausencia.

Academy.

Estados

DISABLED.

DEMO_ONLY.

INTERNAL_TESTING.

PILOT.

ENABLED.

Regla

Ocultar un botón no representa una medida de seguridad.

El backend debe aplicar las restricciones reales.

La activación de una función externa requiere condiciones y permisos verificados.

---

48. CONFIGURACIÓN POR ENTORNO

Crear vistas para:

DEVELOPMENT.

STAGING.

PRODUCTION.

Mostrar

Entorno activo.

Versión de aplicación.

Estado backend.

Proveedores conectados.

Funciones habilitadas.

Pruebas.

Restricciones de envío.

Reglas

No mezclar datos sintéticos con producción.

No utilizar credenciales de producción en demos.

No ejecutar pruebas destructivas en producción.

No permitir que una pantalla de pruebas active automáticamente envíos reales.

---

49. DEPLOYMENT READINESS CENTER

Ruta:

/admin/despliegue

Crear:

Vet Freedom Launch Readiness

Categorías

Frontend.

Backend.

Autenticación.

Permisos.

Base de datos.

Integraciones.

Mensajería.

Agenda.

OKVET.

Documentos.

Finanzas.

Seguridad.

Pruebas.

Operación.

Contingencias.

Estados

NOT_STARTED.

IN_PROGRESS.

READY_FOR_TEST.

TESTED.

VERIFIED.

BLOCKED.

Indicadores

Pruebas aprobadas.

Pruebas fallidas.

Bloqueos.

Integraciones pendientes.

Incidencias críticas.

Aprobaciones de lanzamiento.

Regla

No declarar READY FOR PRODUCTION porque todas las pantallas se ven completas.

---

50. GATES DE DESPLIEGUE

Definir requisitos de lanzamiento.

Gate 1 — Frontend

Rutas funcionales.

Responsive.

Accesibilidad.

Errores controlados.

Gate 2 — Seguridad

Roles.

Autorización de servidor.

Separación de clientes.

Archivos privados.

Gate 3 — Agenda

No doble reserva.

No confirmación falsa.

Compatibilidad OKVET.

Gate 4 — Comunicaciones

Consentimiento.

No mensajes duplicados.

Control humano.

Pruebas de envío autorizadas.

Gate 5 — Operación

Visitas.

Equipo.

Incidencias.

Continuidad.

Gate 6 — Finanzas

No cobros duplicados.

No pagos falsamente verificados.

Gate 7 — Integraciones

Contratos.

Reintentos.

Errores.

Conciliación.

Gate 8 — Recuperación

Contingencias.

Backups reportados.

Procedimientos de restauración verificados por responsables.

Gate 9 — Aprobación

Aprobador autorizado.

Fecha.

Versión.

Evidencias.

Regla

Los gates deben reflejar pruebas reales.

No permitir aprobar desde Lovable una condición técnica que no fue comprobada.

---

51. PANEL DE ESTADO DE LOS 224 COMPORTAMIENTOS

Crear:

Requirements & Workflow Coverage Matrix

Grupos

WF-001 a WF-112.

WF2-001 a WF2-056.

WF3-001 a WF3-056.

Mostrar por ID

Requisito.

Módulo.

Responsable.

Componente Lovable.

Contrato.

Workflow n8n asociado si existe.

Prueba.

Estado.

Bloqueo.

Regla

224 comportamientos no implican necesariamente 224 workflows n8n independientes.

Permitir asociar varios requisitos a una automatización compartida.

No marcar completado un comportamiento solamente porque existe una pantalla.

---

52. PANEL DE LAS 170 PRUEBAS ORIGINALES

Crear:

Master Acceptance Test Matrix

Incorporar

AT-001 a AT-060.

AT2-001 a AT2-050.

AT3-001 a AT3-060.

Mostrar

ID.

Descripción original.

Módulo.

Tipo.

Dependencias.

Resultado.

Evidencia.

Fecha.

Responsable.

Estados

NOT_RUN.

PASSED.

FAILED.

BLOCKED.

REQUIRES_BACKEND.

REQUIRES_EXTERNAL_PROVIDER.

Regla

No sustituir los criterios originales por casos inventados.

Mantenerlos junto a las pruebas adicionales creadas por los prompts.

No declarar aprobadas pruebas que no se ejecutaron.

---

53. REGISTRO DE DEPENDENCIAS CON ANTIGRAVITY

Crear:

Backend Contract Dependency Board

Ruta:

/admin/desarrollo/dependencias

Mostrar

Nombre del contrato.

Módulo.

Propósito.

Responsable.

Estado.

Versión.

Esquema.

Pruebas.

Bloqueos.

Estados

PROPOSED.

NEEDS_SPECIFICATION.

AGREED.

IMPLEMENTED_BACKEND.

INTEGRATED_FRONTEND.

TESTED.

VERIFIED.

BLOCKED.

Objetivo

Facilitar la coordinación entre Lovable y Antigravity.

Regla

No duplicar implementaciones.

No dar por implementado un contrato por definir su interfaz TypeScript.

---

54. CENTRO DE SOPORTE INTERNO

Ruta:

/admin/soporte

Funciones

Consultar incidentes.

Buscar ayuda.

Ver procedimientos.

Consultar estado.

Crear solicitud interna.

Abrir documentación.

Escalar a responsable.

Integración

Reutilizar Academy.

Reutilizar Task Management.

Reutilizar System Health.

Regla

No crear un segundo sistema de tickets si el módulo de tareas ya cubre ese flujo.

---

55. SISTEMA DE NOTIFICACIONES ADMINISTRATIVAS

Crear:

AdminNotificationCenter

Eventos

Integración desconectada.

Error crítico.

Importación fallida.

Aprobación pendiente.

Credencial próxima a vencer.

Procedimiento de respaldo pendiente de verificar.

Configuración incompatible.

Acceso temporal próximo a expirar.

Mostrar

Notificación.

Prioridad.

Origen.

Responsable.

Fecha.

Estado.

Acciones

VER.

ASIGNAR.

MARCAR COMO REVISADA.

ABRIR INCIDENCIA.

Reglas

No utilizar notificaciones frontend como único sistema de alerta crítica.

Los avisos externos y recurrentes dependen de Antigravity.

No enviar mensajes reales sin autorización.

---

56. CENTRO DE CAMBIOS

Ruta:

/admin/cambios

Objetivo

Tener visibilidad de todas las modificaciones administrativas importantes.

Mostrar

Cambio solicitado.

Configuración anterior.

Configuración propuesta.

Impacto.

Aprobación.

Resultado.

Versión.

Ejemplos

Cambio de zona.

Cambio de horario.

Cambio de tarifa.

Cambio de permisos.

Cambio de reglas de asignación.

Cambio de canal.

Reglas

Mantener historial.

No borrar cambios fallidos.

No permitir que un cambio aprobado siga vigente si fue invalidado por otro cambio incompatible.

---

57. MODELOS TYPESCRIPT

Crear o ampliar:

OrganizationSettings.

BusinessConfiguration.

ServiceConfiguration.

CoverageConfiguration.

OperatingHoursPolicy.

SchedulingPolicy.

RoutePolicy.

ConfigurationVersion.

ConfigurationChangeRequest.

ConfigurationDiff.

ConfigurationValidationResult.

RoleDefinition.

PermissionDefinition.

RolePermissionPreview.

AccessChangeRequest.

TemporarySupportAccess.

IntegrationDescriptor.

IntegrationHealth.

IntegrationEvent.

IntegrationFailure.

AutomationDefinitionView.

AutomationExecutionView.

FailedEvent.

RecoveryRequest.

SystemHealthSnapshot.

SystemIncident.

IncidentResponse.

AuditEntry.

SecurityFinding.

RetentionPolicyView.

BackupStatus.

RestoreTestStatus.

CredentialStatus.

InfrastructureCostMetric.

FeatureFlag.

EnvironmentStatus.

DeploymentGate.

DeploymentReadiness.

WorkflowCoverageEntry.

AcceptanceTestEntry.

BackendContractDependency.

OkvetImportPreview.

OkvetFieldMapping.

ExternalRecordMatch.

ReconciliationConflict.

DataQualityFinding.

Campos transversales

id.

organizationId.

source.

sourceVersion.

status.

createdAt.

updatedAt.

actorId.

approvedBy.

verifiedAt.

expectedVersion.

correlationId.

idempotencyKey.

Reglas

TypeScript estricto.

Esquemas Zod o equivalentes.

No duplicar modelos de otros módulos.

No incluir secretos en modelos serializables para el navegador.

---

58. SERVICIOS DE DOMINIO

Implementar lógica real y testeable.

ConfigurationDomainService

validateConfiguration()

compareConfigurations()

evaluateChangeImpact()

detectConflicts()

ServiceConfigurationDomain

validateServiceRequirements()

evaluateServiceActivation()

CoveragePolicyEngine

evaluateCoverageChange()

detectCoverageOverlap()

SchedulingPolicyEngine

validateSchedulingSettings()

evaluateBookingRuleImpact()

PermissionPreviewEngine

evaluateRolePermissions()

comparePermissionSets()

detectPrivilegeEscalationRisk()

IntegrationHealthEvaluator

normalizeProviderStatus()

evaluateFreshness()

classifyIntegrationProblem()

ImportMappingEngine

suggestFieldMapping()

validateImportPreview()

detectMissingColumns()

ExternalRecordReconciliationEngine

detectPotentialMatches()

evaluateConflicts()

buildReconciliationProposal()

AutomationStatusEvaluator

evaluateExecutionState()

classifyRetryEligibility()

IncidentPolicyEngine

evaluateIncidentPriority()

validateIncidentTransition()

DeploymentReadinessEngine

evaluateGate()

aggregateReadiness()

identifyLaunchBlockers()

Reglas

No crear funciones vacías.

No inventar estado de proveedores.

No ejecutar modificaciones reales desde funciones puras.

---

59. SERVICIOS DE APLICACIÓN

Crear o extender:

AdminDashboardService.

OrganizationSettingsService.

ServiceConfigurationService.

CoverageConfigurationService.

SchedulingConfigurationService.

RoleAdministrationService.

PermissionAdministrationService.

ApprovalAdministrationService.

IntegrationMonitoringService.

OkvetReconciliationService.

DataImportApplicationService.

DataQualityApplicationService.

AutomationMonitoringService.

ErrorRecoveryApplicationService.

SystemHealthService.

SystemIncidentService.

AuditApplicationService.

SecurityAdministrationService.

RetentionAdministrationService.

InfrastructureCostService.

FeatureFlagService.

DeploymentReadinessService.

BackendDependencyService.

Responsabilidades

Coordinar casos de uso.

Validar formularios.

Consultar contratos.

Preparar comandos.

Mostrar resultados.

Manejar errores.

Registrar estados de interfaz.

Actualizar datos.

Evitar duplicados.

Regla

Las operaciones protegidas pertenecen al servidor autorizado.

---

60. CONTRATOS CON ANTIGRAVITY

Definir interfaces tipadas para:

getAdminOverview().

getOrganizationSettings().

requestOrganizationSettingsChange().

getServiceConfigurations().

requestServiceConfigurationChange().

getCoverageZones().

evaluateCoverageChange().

getOperatingHours().

requestOperatingHoursChange().

getSchedulingPolicies().

requestSchedulingPolicyChange().

getRoleMatrix().

getUserPermissions().

requestPermissionChange().

getApprovalRequests().

submitAdministrativeApproval().

getIntegrationStatuses().

getIntegrationEvents().

getIntegrationFailures().

requestIntegrationHealthCheck().

getOkvetImportPreview().

submitImportMapping().

requestOkvetImport().

getOkvetReconciliationCases().

submitReconciliationDecision().

getDataQualityFindings().

getAutomationDefinitions().

getAutomationExecutions().

getFailedEvents().

requestSafeEventRetry().

getSystemHealth().

getSystemIncidents().

createSystemIncident().

getSecurityFindings().

getAuditHistory().

getRetentionPolicies().

requestRetentionPolicyChange().

getBackupStatus().

getRestoreTestStatus().

getCredentialStatuses().

getInfrastructureCosts().

getFeatureFlags().

requestFeatureFlagChange().

getDeploymentReadiness().

getAcceptanceTestResults().

getBackendContractStatus().

Cada contrato debe definir

RequestSchema.

ResponseSchema.

ErrorSchema.

Authentication.

Authorization.

ExpectedVersion.

IdempotencyKey.

CorrelationId.

AuditRequirements.

DataSensitivity.

RetryPolicy.

TimeoutPolicy.

Advertencia

Estos nombres son propuestas de contratos.

No asumir que existen URLs o endpoints con esos nombres.

Adaptar al backend real de Antigravity.

No crear una API duplicada.

---

61. ADAPTADORES

Crear:

AdminSettingsGateway.

PermissionGateway.

IntegrationGateway.

OkvetGateway.

AutomationMonitorGateway.

SystemHealthGateway.

IncidentGateway.

AuditGateway.

SecurityGateway.

DeploymentGateway.

Implementaciones

DemoGateway.

RealGateway.

Reglas

DEMO utiliza únicamente datos sintéticos.

REAL utiliza contratos verificados.

No mezclar ambientes.

No representar una operación DEMO como cambio real.

No exponer credenciales.

No esconder errores.

---

62. PRUEBAS DE CONFIGURACIÓN

ADMIN13-T01 — Abrir panel.

ADMIN13-T02 — Consultar configuración general.

ADMIN13-T03 — Editar borrador.

ADMIN13-T04 — Validar campos.

ADMIN13-T05 — Detectar configuración incompatible.

ADMIN13-T06 — Comparar versiones.

ADMIN13-T07 — Solicitar aprobación.

ADMIN13-T08 — Rechazar cambio sin permiso.

ADMIN13-T09 — No cambiar datos oficiales solo con estado local.

ADMIN13-T10 — Historial preservado.

ADMIN13-T11 — Zona sin capacidad.

ADMIN13-T12 — Servicio sin profesional habilitado.

ADMIN13-T13 — Horario incompatible.

ADMIN13-T14 — Cambio de tarifa con versión.

ADMIN13-T15 — No alterar registros históricos.

---

63. PRUEBAS DE PERMISOS

PERM13-T01 — Administrador autorizado.

PERM13-T02 — Empleado no autorizado.

PERM13-T03 — Cliente intenta acceder a administración.

PERM13-T04 — Especialista externo intenta abrir datos ajenos.

PERM13-T05 — Cambio de rol en borrador.

PERM13-T06 — Vista previa de permisos.

PERM13-T07 — Intento de autoelevación.

PERM13-T08 — Aprobación independiente.

PERM13-T09 — Acceso temporal.

PERM13-T10 — Expiración.

PERM13-T11 — Revocación.

PERM13-T12 — Privacidad financiera.

PERM13-T13 — Privacidad clínica.

PERM13-T14 — Separación de organizaciones.

PERM13-T15 — Backend rechaza acción no autorizada, cuando esté conectado.

---

64. PRUEBAS DE INTEGRACIONES

INT13-T01 — Proveedor conectado con evidencia.

INT13-T02 — Credenciales configuradas pero no verificadas.

INT13-T03 — Proveedor desconectado.

INT13-T04 — Última sincronización.

INT13-T05 — Error de calendario.

INT13-T06 — Error de WhatsApp.

INT13-T07 — Error de IA.

INT13-T08 — Estado de OKVET.

INT13-T09 — Token vencido.

INT13-T10 — No exponer secreto.

INT13-T11 — Diagnóstico solicitado.

INT13-T12 — Servicio no responde.

INT13-T13 — Estado desconocido.

INT13-T14 — Error no ocultado.

INT13-T15 — No marcar CONNECTED por simple configuración visual.

---

65. PRUEBAS OKVET Y DATOS

OKV13-T01 — Importación autorizada.

OKV13-T02 — Archivo válido.

OKV13-T03 — Archivo no permitido.

OKV13-T04 — Mapeo de campos.

OKV13-T05 — Campo obligatorio faltante.

OKV13-T06 — Mascotas con mismo nombre.

OKV13-T07 — Propietarios similares.

OKV13-T08 — Referencia duplicada.

OKV13-T09 — Conflicto de fecha.

OKV13-T10 — Conflicto de profesional.

OKV13-T11 — Cita pendiente de verificación.

OKV13-T12 — Coincidencia validada.

OKV13-T13 — No sobrescritura automática.

OKV13-T14 — Importación fallida.

OKV13-T15 — Revisión humana.

OKV13-T16 — No inventar API.

OKV13-T17 — No confirmar citas sin evidencia.

OKV13-T18 — Auditoría de conciliación.

---

66. PRUEBAS DE AUTOMATIZACIONES Y ERRORES

AUTO13-T01 — Listar workflows reales.

AUTO13-T02 — Estado de ejecución.

AUTO13-T03 — Evento recibido.

AUTO13-T04 — Evento procesado.

AUTO13-T05 — Evento fallido.

AUTO13-T06 — Reintento pendiente.

AUTO13-T07 — Dead letter.

AUTO13-T08 — Solicitud de reintento seguro.

AUTO13-T09 — Evento duplicado.

AUTO13-T10 — No doble envío.

AUTO13-T11 — No doble cobro.

AUTO13-T12 — No doble reserva.

AUTO13-T13 — Error de proveedor.

AUTO13-T14 — Recuperación.

AUTO13-T15 — Historial completo.

---

67. PRUEBAS DE SEGURIDAD Y SALUD

SYS13-T01 — Estado real de plataforma.

SYS13-T02 — Estado desconocido.

SYS13-T03 — Integración degradada.

SYS13-T04 — Incidente abierto.

SYS13-T05 — Escalamiento.

SYS13-T06 — Incidente resuelto con evidencia.

SYS13-T07 — Contingencia de WhatsApp.

SYS13-T08 — Contingencia de IA.

SYS13-T09 — Contingencia de calendario.

SYS13-T10 — Estado de backup reportado.

SYS13-T11 — Restauración no inventada.

SYS13-T12 — Política de retención.

SYS13-T13 — Acceso temporal.

SYS13-T14 — Credenciales no visibles.

SYS13-T15 — Auditoría no editable.

SYS13-T16 — Error técnico sanitizado.

SYS13-T17 — No información clínica en logs.

SYS13-T18 — Acceso no autorizado bloqueado por backend.

---

68. PRUEBAS DE DESPLIEGUE

DEP13-T01 — Checklist frontend.

DEP13-T02 — Checklist de seguridad.

DEP13-T03 — Checklist de agenda.

DEP13-T04 — Checklist WhatsApp.

DEP13-T05 — Checklist OKVET.

DEP13-T06 — Checklist de finanzas.

DEP13-T07 — Checklist de integraciones.

DEP13-T08 — Checklist de recuperación.

DEP13-T09 — Prueba bloqueada.

DEP13-T10 — Prueba fallida.

DEP13-T11 — Evidencia faltante.

DEP13-T12 — Gate no aprobable.

DEP13-T13 — Dependencia de Antigravity.

DEP13-T14 — Aprobación autorizada.

DEP13-T15 — Versión de lanzamiento.

DEP13-T16 — No declarar producción lista con datos DEMO.

---

69. PRUEBAS FRONTEND

Validar:

Inicio administrador.

Configuraciones.

Servicios.

Zonas.

Horarios.

Reglas.

Usuarios.

Permisos.

Integraciones.

WhatsApp.

Google Calendar.

OKVET.

Automatizaciones.

Eventos.

Errores.

Salud.

Seguridad.

Auditoría.

Backups.

Costos.

Deployment Readiness.

Responsive

360 px.

390 px.

430 px.

Tablet.

Desktop.

Accesibilidad

Controles táctiles.

Contraste.

Etiquetas.

Estados.

Formularios.

Tablas.

Modales.

Errores.

Navegación.

Regla

No considerar una prueba visual como prueba de una integración real.

---

70. MAPEO DE WORKFLOWS

Registrar individualmente:

WF-097 — Importar datos.

WF-098 — Mapear campos.

WF-099 — Conciliar IDs.

WF-100 — Gestionar conflictos.

WF-101 — Importación fallida.

WF-102 — Webhook fallido.

WF-103 — Mensajería fallida.

WF-104 — IA indisponible.

WF-105 — Control de costos.

WF-106 — Auditoría de permisos.

WF-107 — Copias de seguridad.

WF-108 — Restauración de prueba.

WF-109 — Credenciales.

WF-110 — Salud del sistema.

WF-111 — Retención.

WF-112 — Incidente crítico.

Por cada uno registrar

ID.

Descripción.

Página.

Componente.

Servicio.

Contrato.

Dependencia.

Prueba.

Estado.

Regla

No crear los workflows n8n.

No declarar implementado el proceso externo por mostrarlo en pantalla.

---

71. PROJECT MEMORY OS

Registrar:

PROMPT-013.

Nombre:

VET FREEDOM ADMIN, INTEGRATIONS & SYSTEM CONTROL CENTER.

Versión:

13.0.

Actualizar

PROJECT_PROMPT_LOG.md.

PROJECT_IMPLEMENTATION_LEDGER.md.

PROJECT_FEATURES.md.

PROJECT_REQUIREMENTS.md.

PROJECT_ROUTES.md.

SCREEN_COVERAGE_MATRIX.md.

BACKEND_MODULE_REGISTRY.md.

API_CONTRACT_REGISTRY.md.

PROJECT_INTEGRATIONS.md.

PROJECT_TEST_MATRIX.md.

PROJECT_CONTINUATION.md.

Estados

NOT STARTED.

FRONTEND READY.

DOMAIN LOGIC READY.

BACKEND CONTRACT READY.

SERVER AUTHORITY PENDING.

INTEGRATION CONNECTED.

INTEGRATION TESTED.

DEPLOYMENT GATE PASSED.

END-TO-END VERIFIED.

BLOCKED.

Evidencias

Archivo.

Componente.

Servicio.

Contrato.

Prueba.

Resultado.

Dependencia.

Fecha.

No declarar verificada una conexión sin resultado real.

---

72. CRITERIOS DE ACEPTACIÓN

El alcance de Lovable estará completo cuando:

1. Exista Centro de Control.
2. Exista dashboard administrativo.
3. Exista configuración general.
4. Exista catálogo de servicios vinculado.
5. Exista configuración de zonas.
6. Exista validación de cobertura.
7. Existan horarios separados.
8. Exista configuración de agenda.
9. Exista configuración de rutas.
10. Existan políticas operativas.
11. Exista validación de configuraciones.
12. Exista versionado de cambios.
13. Exista gestión visual de usuarios.
14. Exista matriz de roles.
15. Exista previsualización de permisos.
16. Exista centro de aprobaciones.
17. Exista centro de integraciones.
18. Existan detalles por proveedor.
19. Exista estado de WhatsApp.
20. Exista estado de calendarios.
21. Exista centro OKVET.
22. Exista wizard de importación.
23. Exista motor de mapeo.
24. Exista conciliación de identificadores.
25. Exista centro de conflictos.
26. Exista evaluación de calidad de datos.
27. Exista monitor de automatizaciones.
28. Exista detalle de ejecuciones.
29. Exista monitor de eventos.
30. Exista centro de errores.
31. Exista gestión visual de recuperación.
32. Exista monitor de salud.
33. Exista trazabilidad entre procesos.
34. Exista centro de incidentes.
35. Existan procedimientos de contingencia.
36. Exista centro de seguridad.
37. Exista acceso temporal controlado.
38. Exista auditoría.
39. Existan políticas de retención.
40. Exista control de costos.
41. Existan estados de credenciales.
42. Exista panel de backups.
43. Existan feature flags.
44. Existan configuraciones por entorno.
45. Exista Deployment Readiness.
46. Existan gates de despliegue.
47. Exista matriz de 224 comportamientos.
48. Exista matriz de 170 pruebas originales.
49. Exista tablero de dependencias con Antigravity.
50. Exista soporte interno.
51. Existan notificaciones administrativas.
52. Exista centro de cambios.
53. Existan modelos TypeScript.
54. Existan validadores.
55. Existan motores de dominio.
56. Existan servicios de aplicación.
57. Existan contratos.
58. Existan adaptadores.
59. Existan pruebas unitarias.
60. Existan pruebas frontend.
61. Existan pruebas de permisos.
62. Existan pruebas de integraciones cuando estén disponibles.
63. Existan pruebas de errores.
64. Existan pruebas de despliegue.
65. Se conserve la arquitectura de los prompts anteriores.
66. No exista infraestructura duplicada.
67. Se registren WF-097 a WF-112.
68. Se preserven las reglas de seguridad clínica.
69. Se preserve la privacidad.
70. Project Memory esté actualizado.

DIFERENCIACIÓN OBLIGATORIA

PANTALLA LISTA no significa INTEGRACIÓN CONECTADA.

CONFIGURACIÓN GUARDADA no significa CONFIGURACIÓN APLICADA.

CREDENCIAL PRESENTE no significa CREDENCIAL VÁLIDA.

EVENTO RECIBIDO no significa EVENTO PROCESADO.

BACKUP REPORTADO no significa RESTAURACIÓN VERIFICADA.

OKVET REFERENCIADO no significa OKVET SINCRONIZADO.

TEST FRONTEND APROBADO no significa TEST E2E APROBADO.

DEPLOYMENT CHECKLIST COMPLETO no significa DESPLIEGUE AUTORIZADO.

---

73. ORDEN DE IMPLEMENTACIÓN

Implementar en lotes.

LOTE 1 — Inspección general.

LOTE 2 — Arquitectura y modelos.

LOTE 3 — Dashboard administrativo.

LOTE 4 — Configuración general.

LOTE 5 — Servicios.

LOTE 6 — Zonas.

LOTE 7 — Simulación de cobertura.

LOTE 8 — Horarios.

LOTE 9 — Configuración de agenda.

LOTE 10 — Configuración de rutas.

LOTE 11 — Políticas operativas.

LOTE 12 — Validaciones.

LOTE 13 — Versionado.

LOTE 14 — Usuarios.

LOTE 15 — Roles.

LOTE 16 — Permisos.

LOTE 17 — Aprobaciones.

LOTE 18 — Centro de integraciones.

LOTE 19 — Detalle de proveedores.

LOTE 20 — WhatsApp.

LOTE 21 — Google Calendar.

LOTE 22 — OKVET.

LOTE 23 — Importaciones.

LOTE 24 — Mapeo.

LOTE 25 — Conciliación.

LOTE 26 — Conflictos.

LOTE 27 — Calidad de datos.

LOTE 28 — Monitor de automatizaciones.

LOTE 29 — Ejecuciones.

LOTE 30 — Eventos.

LOTE 31 — Errores.

LOTE 32 — Recuperación.

LOTE 33 — Salud del sistema.

LOTE 34 — Observabilidad.

LOTE 35 — Incidentes.

LOTE 36 — Contingencias.

LOTE 37 — Seguridad.

LOTE 38 — Acceso temporal.

LOTE 39 — Auditoría.

LOTE 40 — Retención.

LOTE 41 — Costos.

LOTE 42 — Credenciales.

LOTE 43 — Backups.

LOTE 44 — Feature flags.

LOTE 45 — Entornos.

LOTE 46 — Deployment Readiness.

LOTE 47 — Gates.

LOTE 48 — Matriz de workflows.

LOTE 49 — Matriz de pruebas.

LOTE 50 — Dependencias Antigravity.

LOTE 51 — Soporte.

LOTE 52 — Notificaciones.

LOTE 53 — Cambios.

LOTE 54 — Servicios de dominio.

LOTE 55 — Servicios de aplicación.

LOTE 56 — Contratos.

LOTE 57 — Adaptadores.

LOTE 58 — Pruebas unitarias.

LOTE 59 — Pruebas frontend.

LOTE 60 — Pruebas de permisos.

LOTE 61 — Pruebas de integración disponibles.

LOTE 62 — Pruebas de despliegue.

LOTE 63 — Project Memory.

Regla

Cada lote debe conservar evidencia de implementación.

No rehacer trabajo existente.

No declarar bloques pendientes de Antigravity como verificados.

Continuar con tareas independientes.

---

74. RESULTADO FINAL ESPERADO

Quiero que Vet Freedom OS tenga un centro de administración extraordinariamente completo pero sencillo de utilizar.

Quiero que Luis pueda consultar cómo funciona su empresa sin entrar a diez plataformas distintas.

Que pueda ver qué integraciones están conectadas.

Qué servicios están funcionando.

Qué errores existen.

Qué datos necesitan revisión.

Qué configuraciones se modificaron.

Qué usuarios tienen acceso.

Qué procesos requieren aprobación.

Qué información está pendiente de conciliar con OKVET.

Qué automatizaciones tuvieron fallos.

Qué credenciales requieren atención.

Qué incidentes siguen abiertos.

Qué procedimientos manuales deben seguirse si un sistema se desconecta.

Quiero que cada cambio importante tenga versión, responsable y evidencia.

Quiero que los permisos se controlen correctamente.

Que los datos privados permanezcan protegidos.

Que ningún usuario pueda elevar sus propios privilegios.

Que una importación no mezcle mascotas incorrectas.

Que un fallo de WhatsApp no confirme una cita inexistente.

Que un evento duplicado no genere otro cobro.

Que un cambio de horario no altere silenciosamente visitas confirmadas.

Que los errores sean visibles.

Que las recuperaciones sean seguras.

Que las pruebas tengan resultados reales.

Que sea posible saber exactamente qué está listo para producción.

Y que los responsables técnicos puedan trabajar en Antigravity sin que Lovable duplique su infraestructura.

Queremos una plataforma hermosa, organizada, segura, verificable y lista para crecer.

---

INSTRUCCIÓN FINAL

Inspecciona todo el proyecto.

Reutiliza los módulos anteriores.

Construye Vet Freedom Control Center.

Implementa las interfaces.

Implementa lógica de dominio real.

Construye validadores.

Construye centros de integración y monitoreo.

Implementa conciliación visual OKVET.

Implementa gestión administrativa de permisos.

Implementa versiones de configuraciones.

Implementa salud del sistema.

Implementa auditoría consultable.

Implementa preparación para despliegue.

Crea contratos tipados.

No configures Supabase.

No crees migraciones SQL.

No implementes n8n.

No crees backend de producción paralelo.

No almacenes secretos en React.

No inventes estados ni resultados de pruebas.

No ejecutes cambios oficiales sin backend autorizado.

Ejecuta las pruebas posibles.

Actualiza Project Memory.

Conserva el diseño premium Vet Life.

VET FREEDOM OS — PROMPT 13

Vet Life — Veterinaria a Domicilio
Dr. Luis Eduardo Ríos
Alpha Vision Method

Una operación bajo control, sin necesidad de controlarlo todo personalmente.