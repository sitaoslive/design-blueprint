# VET FREEDOM OS — PROMPT 14
# MASTER APPLICATION AUDIT, REPAIR, INTEGRATION & PRODUCTION READINESS
## Auditoría integral, reparación automática controlada, integración entre módulos y preparación final de Lovable
### Full-Stack Application Engineering — Frontend + Domain Logic + Application Services + Contracts + Automated QA
### VERSIÓN 14.0

**PROYECTO:** VET FREEDOM OS  
**EMPRESA:** Vet Life — Veterinaria a Domicilio  
**DIRECTOR:** Dr. Luis Eduardo Ríos  
**DIRECCIÓN ESTRATÉGICA:** Alpha Vision Method  
**APLICACIÓN:** Lovable  
**INFRAESTRUCTURA:** Antigravity + Supabase + n8n  
**IDIOMA PRINCIPAL:** Español colombiano  
**MERCADO INICIAL:** Colombia  
**MONEDA:** COP  
**ZONA HORARIA:** America/Bogota  
**PRIORIDAD DE DISPOSITIVOS:** Android, iPhone y escritorio  
**ESPECIFICACIONES AUTORITATIVAS:** Partes 1, 2 y 3 del 20 de noviembre de 2026  
**PROMPTS ACUMULADOS:** 01–13  
**TIPO DE TRABAJO:** Auditoría de código + implementación de correcciones + pruebas + preparación de integración  
**OBJETIVO:** Una aplicación unificada, funcional, segura, verificable y preparada para conectarse plenamente al backend existente.

---

# 0. INSTRUCCIÓN EJECUTIVA PRINCIPAL

Actúa como un equipo senior de ingeniería de software y calidad integrado por:

- Principal Software Architect.
- Senior Full-Stack Engineer.
- Senior React Engineer.
- TypeScript Domain Architect.
- Enterprise Integration Architect.
- Application Security Engineer.
- QA Automation Lead.
- Test Automation Engineer.
- UX/UI Quality Director.
- Accessibility Engineer.
- Performance Engineer.
- Site Reliability Engineer.
- Veterinary Operations Specialist.
- Product Engineering Manager.

Tu misión no es volver a diseñar Vet Freedom OS desde cero.

Tu misión es:

**INSPECCIONAR → COMPARAR → REPARAR → INTEGRAR → PROBAR → DOCUMENTAR → PREPARAR DESPLIEGUE.**

Tienes que trabajar sobre el proyecto real actualmente existente en Lovable.

No quiero únicamente un reporte con problemas.

No quiero una lista interminable de recomendaciones.

No quiero que reconstruyas pantallas que ya están correctamente desarrolladas.

No quiero componentes visuales que aparenten funcionar.

No quiero conexiones ficticias.

Quiero que detectes las deficiencias y **corrijas directamente todas las que sean implementables dentro de Lovable**.

Cuando una corrección dependa de Antigravity, prepara el contrato técnico completo, deja un estado visible y registra exactamente qué falta.

El resultado deberá ser una sola aplicación integrada.

---

# 1. PRINCIPIO FUNDAMENTAL: NO DUPLICAR INFRAESTRUCTURA

El sistema ya tiene responsabilidades distribuidas.

## LOVABLE

Construye y mantiene:

- Aplicación React.
- TypeScript.
- Tailwind.
- Sistema de diseño.
- Navegación.
- Pantallas.
- Componentes.
- Formularios.
- Interacciones.
- Estado de UI.
- Lógica de dominio.
- Servicios de aplicación.
- Adaptadores.
- Validaciones.
- Contratos de integración.
- Algoritmos reutilizables.
- Pruebas unitarias.
- Pruebas de componentes.
- Pruebas E2E frontend.
- Experiencia responsive.
- Estados de errores.
- Documentación de aplicación.

## ANTIGRAVITY

Construye y administra:

- Supabase.
- Migraciones.
- PostgreSQL.
- Auth y RLS.
- Operaciones autoritativas.
- APIs protegidas.
- Funciones de servidor.
- Almacenamiento privado.
- Secretos.
- n8n.
- Webhooks.
- Automatizaciones.
- Proveedores externos.
- Persistencia transaccional.
- Integraciones oficiales.

## PROHIBICIONES ABSOLUTAS

NO crear otro Supabase.

NO crear tablas adicionales desde Lovable por iniciativa propia.

NO generar migraciones.

NO crear otra instancia de n8n.

NO construir workflows n8n.

NO crear un segundo backend de producción.

NO introducir credenciales privadas en React.

NO reemplazar servicios de Antigravity con mocks permanentes.

NO implementar una fuente paralela de verdad.

NO usar localStorage como almacenamiento empresarial definitivo.

NO autorizar operaciones protegidas mediante validaciones únicamente del navegador.

NO duplicar catálogos de clientes, mascotas, servicios, citas o empleados.

NO activar mensajes reales sin autorización.

NO ejecutar cobros o cambios de agenda reales durante pruebas no autorizadas.

NO sobrescribir configuraciones de producción.

---

# 2. PRINCIPIO DE EVIDENCIA

Antes de comenzar, adopta esta regla:

**Un prompt entregado no es una función implementada.**

**Una función implementada no es una función probada.**

**Una prueba frontend no garantiza una integración backend.**

**Un contrato preparado no significa que el endpoint existe.**

**Una pantalla visualmente completa no significa que el proceso es operativo.**

No asumas que todos los Prompts 01–13 fueron implementados.

Debes inspeccionar el código real.

## Estados oficiales de seguimiento

NOT_STARTED.

SPECIFIED.

PARTIALLY_IMPLEMENTED.

FRONTEND_READY.

DOMAIN_LOGIC_READY.

CONTRACT_READY.

BACKEND_PENDING.

BACKEND_CONNECTED.

INTEGRATION_TESTED.

END_TO_END_VERIFIED.

BLOCKED.

DEPRECATED.

## Regla

No asignar END_TO_END_VERIFIED sin evidencia reproducible.

---

# 3. LEER LAS ESPECIFICACIONES ORIGINALES

Utiliza como fuente autoritativa los documentos originales si están disponibles en el proyecto:

**PARTE 1**

Especificación maestra.

112 comportamientos WF-001 a WF-112.

60 pruebas AT-001 a AT-060.

**PARTE 2**

Agenda unificada inteligente.

56 comportamientos WF2-001 a WF2-056.

50 pruebas AT2-001 a AT2-050.

**PARTE 3**

Simulador, especialistas y continuidad.

56 comportamientos WF3-001 a WF3-056.

60 pruebas AT3-001 a AT3-060.

## Totales

224 comportamientos definidos.

170 pruebas originales de aceptación.

## Regla

No inventar el contenido de un ID.

Si un documento original no está disponible en Lovable:

Registrar SOURCE_NOT_AVAILABLE.

Conservar los requisitos trazables existentes.

Solicitar el contenido original para completar su verificación.

No declarar cobertura exhaustiva sin leer las tres fuentes.

Los Prompts 01–13 amplían el alcance, pero no deben reemplazar silenciosamente las especificaciones originales.

---

# 4. RECONSTRUIR EL ESTADO REAL DEL PROYECTO

Inspeccionar:

package.json.

Configuración de TypeScript.

Configuración de Vite u otra herramienta existente.

Dependencias.

Rutas.

Layouts.

Providers.

Stores.

Contexts.

Hooks.

Components.

Pages.

Feature modules.

Services.

Adapters.

Schemas.

Tests.

Assets.

Variables de entorno públicas.

Contratos.

Documentación.

## Detectar

Archivos duplicados.

Componentes sin uso.

Rutas inexistentes.

Imports rotos.

Dependencias no utilizadas.

Componentes incompletos.

Funciones vacías.

Mocks.

Datos hardcodeados.

Estados fingidos.

Botones sin acción.

Formularios sin persistencia.

Endpoints inventados.

Errores TypeScript.

Problemas responsive.

## Entregable interno

**APPLICATION_REALITY_INVENTORY**

Debe contener solamente evidencia observada.

No escribir que algo está implementado basándose en el nombre de un archivo.

---

# 5. AUDITAR LA ESTRUCTURA FRONTEND

Revisar si la aplicación conserva una organización modular coherente.

## Módulos esperados

auth.

organization.

customers.

pets.

caregivers.

customer-memory.

consent.

whatsapp.

conversations.

appointments.

availability.

calendar.

quick-booking.

workforce.

shifts.

absences.

assignments.

routes.

schedule-simulator.

visits.

recurring-care.

inventory.

finance.

quality.

loyalty.

academy.

specialist-referrals.

commitments.

executive-assistant.

integrations.

automation-monitor.

system-health.

system-administration.

project-memory.

## Reparar

Importaciones circulares.

Responsabilidades mezcladas.

Tipos duplicados.

Servicios duplicados.

Dependencias entre módulos inestables.

## Regla

No reorganizar masivamente archivos solo por estética.

Cambiar estructura únicamente cuando mejore calidad, mantenimiento o integración.

---

# 6. VERIFICAR UNA SOLA FUENTE DE VERDAD

Para cada entidad identificar su autoridad.

## Ejemplos

Propietarios y contactos administrativos:

Backend operativo autorizado.

Mascotas y relaciones:

Backend operativo autorizado y referencias clínicas verificadas cuando correspondan.

Citas operativas:

Vet Freedom OS.

Confirmación oficial:

OKVET según procedimiento autorizado.

Historia clínica:

OKVET.

Disponibilidad:

Smart Scheduler, usando fuentes verificadas.

Mensajes:

Proveedor oficial y backend de conversaciones.

Pagos:

Sistema financiero y fuentes de verificación autorizadas.

Inventario:

Backend transaccional.

Formación:

Academy y backend autorizado.

Aprobaciones:

Servicio protegido de aprobaciones.

## Corregir

Entidades duplicadas.

Estados contradictorios.

Actualizaciones sin reconciliación.

Conversiones de estado falsas.

Registros temporales que se presentan como definitivos.

---

# 7. AUDITORÍA DE NAVEGACIÓN

Inspeccionar todas las rutas efectivamente registradas.

## Verificar

Ruta existente.

Componente asociado.

Layout correcto.

Permisos visuales.

Estado de carga.

Estado de error.

Estado vacío.

Navegación de retorno.

Links internos.

Comportamiento móvil.

## Detectar

Rutas 404.

Pantallas sin acceso desde navegación.

Enlaces que llevan a otra función.

Páginas vacías.

Rutas duplicadas.

Pantallas de otro rol.

Parámetros no validados.

## Acción

Corregir todas las rutas y enlaces dentro del alcance del proyecto.

No crear páginas duplicadas solo por cambiar el nombre de la ruta.

---

# 8. NAVEGACIÓN DE LUIS

El menú principal debe conservar exactamente:

INICIO.

WHATSAPP.

AGENDA.

EQUIPO.

ASISTENTE.

## Auditar

Acceso rápido.

Estado activo.

Botones.

Submenús.

Navegación móvil.

Retorno desde detalles.

Accesos a decisiones.

Accesos a informes.

Finanzas.

Remisiones.

Calidad.

Academy.

Configuración.

## Regla

No agregar nuevas pestañas principales.

Los módulos adicionales deben ser accesibles desde navegación secundaria y acciones contextuales.

---

# 9. NAVEGACIÓN POR ROL

Comprobar las experiencias de:

Propietario.

Cuidador autorizado.

Veterinario.

Auxiliar.

Coordinador.

Recepción.

Finanzas.

Administrador.

Luis.

Soporte temporal.

Consultor Alpha Vision.

Especialista externo.

## Para cada rol

Verificar:

Inicio.

Navegación.

Pantallas visibles.

Acciones permitidas.

Información restringida.

Estados de sesión.

Mensajes de error.

## Regla

Ocultar botones no sustituye la autorización del servidor.

Registrar pruebas backend pendientes cuando se necesite RLS o validación protegida.

---

# 10. CONSISTENCIA DEL DISEÑO PREMIUM

Conservar el diseño aprobado de Vet Life.

## Identidad

Cálida.

Premium.

Minimalista.

Profesional.

Humana.

Móvil-first.

## Paleta de referencia

Ivory: #FFF9F4.

Terracota: #BF5738.

Salvia: #E8EEDB.

Marrón oscuro: #34241F.

Usar los tokens ya implementados cuando existan.

## Revisar

Tipografía.

Espaciado.

Tarjetas.

Botones.

Iconos.

Colores.

Bordes.

Sombras.

Jerarquía.

Modales.

Bottom sheets.

Tablas.

Listas.

Formularios.

## Corregir

Estilos inconsistentes.

Componentes de diferentes sistemas de diseño.

Contraste insuficiente.

Textos ilegibles.

Pantallas sobrecargadas.

Botones pequeños.

---

# 11. AUDITORÍA MOBILE-FIRST

Verificar toda la aplicación en:

360 px.

390 px.

430 px.

Tablet.

Desktop.

## Probar

Scroll horizontal inesperado.

Menús.

Calendarios.

Tablas.

Modales.

Selectores.

Formularios.

Mapas.

Chats.

Dashboards.

Botones de acción.

Elementos fijos.

Teclado virtual.

## Reglas

No comprimir una tabla desktop hasta volverla ilegible.

Usar tarjetas, listas o drawers en móvil.

Evitar acciones fuera de pantalla.

Mantener los botones críticos accesibles.

Validar teléfonos Android e iPhone mediante entornos de prueba disponibles.

No declarar pruebas sobre dispositivos físicos si únicamente se utilizaron emuladores.

---

# 12. AUDITAR TODOS LOS BOTONES

Crear un inventario de controles interactivos.

## Categorías

Navegación.

Crear.

Editar.

Guardar.

Enviar.

Confirmar.

Cancelar.

Asignar.

Delegar.

Aprobar.

Rechazar.

Consultar.

Filtrar.

Buscar.

Descargar.

Exportar.

Subir.

Reintentar.

Actualizar.

## Para cada botón

Verificar:

Tiene acción real.

La acción corresponde al texto.

Tiene permisos.

Valida entradas.

Maneja loading.

Maneja éxito.

Maneja error.

Evita dobles envíos.

No produce efectos secundarios no autorizados.

## Corregir

Botones sin onClick.

Acciones que solo abren un toast de éxito ficticio.

Botones que actualizan solo React state y aparentan persistencia.

Botones con enlaces rotos.

Controles deshabilitados sin explicación.

## Regla

Si una acción necesita backend no disponible:

Mostrar estado pendiente.

No fingir éxito.

---

# 13. AUDITORÍA DE FORMULARIOS

Inspeccionar todos los formularios.

## Verificar

Campos requeridos.

Validación.

Tipos correctos.

Mensajes de error.

Campos condicionales.

Fecha y hora.

Zona horaria.

Importes.

Archivos.

Consentimientos.

Confirmación.

Guardado.

Cancelación.

## Casos

Datos incompletos.

Datos incorrectos.

Doble envío.

Sesión vencida.

Error de red.

Backend rechazó solicitud.

Versión desactualizada.

## Regla

No borrar automáticamente un formulario cuando el servidor devuelve error recuperable.

Conservar borradores apropiados sin almacenar datos sensibles indebidamente.

---

# 14. ESTANDARIZAR ESTADOS DE OPERACIONES

Crear o reutilizar un modelo común de resultados de aplicación.

## Estados

IDLE.

VALIDATING.

LOADING.

READY.

SUBMITTING.

PENDING_BACKEND.

PENDING_APPROVAL.

PENDING_EXTERNAL_CONFIRMATION.

SUCCESS_VERIFIED.

PARTIAL_SUCCESS.

FAILED.

CONFLICT.

STALE.

OFFLINE.

UNKNOWN.

## Reglas

No mostrar SUCCESS_VERIFIED cuando solo existe un request aceptado.

No confundir operación pendiente con operación completada.

No ocultar resultados parciales.

No utilizar SUCCESS para indicar que un mock fue ejecutado.

---

# 15. AUDITORÍA DE MODELOS TYPESCRIPT

Inspeccionar modelos de:

Customer.

Pet.

Appointment.

Staff.

Route.

Visit.

Treatment.

Inventory.

Charge.

Payment.

Referral.

Complaint.

Training.

Approval.

Conversation.

Simulation.

Integration.

## Detectar

Distintos nombres para el mismo campo.

Enums contradictorios.

Fechas sin timezone.

Importes sin moneda.

Estados incompatibles.

IDs mezclados.

Datos opcionales tratados como obligatorios.

## Reparar

Consolidar modelos compartidos.

Introducir validación con Zod o herramienta equivalente.

No modificar contratos reales de Antigravity unilateralmente.

Registrar propuestas de cambio de contrato.

---

# 16. AUDITORÍA DE LÓGICA DE DOMINIO

Revisar si los motores prometidos tienen implementaciones reales.

## Motores esenciales

SchedulingEngine.

AssignmentRecommendationEngine.

RouteConstraintEvaluator.

RecurrencePlanningEngine.

InventoryDomainService.

VisitCostingEngine.

ProfitabilityEngine.

ScenarioGenerationEngine.

SimulationConstraintEngine.

SpecialistBookingConfirmationService.

CommunicationEligibilityEngine.

ComplaintStateMachine.

AssessmentScoringEngine.

ExecutiveActionRiskEngine.

ExecutiveActionPlanner.

ConfigurationValidationEngine.

## Detectar

Funciones que siempre devuelven true.

Funciones que siempre devuelven [].

Valores hardcodeados.

Algoritmos descritos pero inexistentes.

Falta de manejo de datos incompletos.

Comparaciones inseguras de fechas.

Cálculos monetarios imprecisos.

## Reparar

Implementar lógica real con entradas, salidas y tests.

Si falta un servicio backend indispensable, preparar el contrato y mantener claramente esa dependencia.

---

# 17. SEPARACIÓN DE CAPAS

Verificar que exista una separación clara.

## PRESENTATION

React.

Componentes.

Hooks.

Layouts.

## APPLICATION

Casos de uso.

Orquestación.

Comandos.

Consultas.

## DOMAIN

Entidades.

Reglas.

Validaciones.

Algoritmos puros.

## INFRASTRUCTURE ADAPTERS

Backend autorizado.

Servicios externos mediante backend.

Mappers.

Caché permitida.

## Regla

No poner reglas empresariales críticas solamente dentro de componentes.

No permitir que el frontend sea autoridad para reservar horarios, verificar pagos o aprobar decisiones clínicas.

---

# 18. CONTRATOS DE INTEGRACIÓN

Auditar todos los servicios que dependen de Antigravity.

## Para cada uno registrar

Módulo.

Operación.

Nombre lógico.

Método real, si existe.

Endpoint real, si existe.

Esquema de entrada.

Esquema de salida.

Autenticación.

Autorización.

Errores.

Paginación.

Idempotencia.

Versión.

Auditoría.

Estado.

## Corregir

Contratos duplicados.

Modelos inconsistentes.

URLs inventadas.

Adaptadores sin validación.

Respuestas mal interpretadas.

Falta de manejo de 401.

Falta de manejo de 403.

Falta de manejo de 409.

Falta de manejo de 429.

Falta de manejo de 5xx.

## Regla

No inventar endpoints para declarar integración completa.

---

# 19. CREAR EL PAQUETE TÉCNICO PARA ANTIGRAVITY

Generar o actualizar:

docs/integrations/ANTIGRAVITY_HANDOFF.md

docs/integrations/API_CONTRACT_REGISTRY.md

docs/integrations/FRONTEND_DEPENDENCIES.md

docs/integrations/DATA_CONTRACTS.md

docs/integrations/EVENT_CONTRACTS.md

docs/integrations/INTEGRATION_TEST_PLAN.md

## Cada contrato incluirá

Operation ID.

Purpose.

Calling feature.

Expected request.

Expected response.

Required permissions.

Validation.

Error codes.

Expected version.

Idempotency.

Side effects.

Test cases.

Example payload con datos sintéticos.

Current implementation status.

## Importante

No incluir tokens.

No incluir contraseñas.

No incluir datos clínicos reales.

No incluir información privada de clientes.

No fabricar ejemplos como registros de producción.

---

# 20. ADAPTADORES FRONTEND

Auditar y consolidar:

SchedulingGateway.

CustomerGateway.

ConversationGateway.

WorkforceGateway.

VisitGateway.

InventoryGateway.

FinanceGateway.

ReferralGateway.

QualityGateway.

AcademyGateway.

ExecutiveAssistantGateway.

AdminGateway.

## Tipos de adaptadores

Demo.

Real.

## Reglas

DEMO debe estar claramente identificado.

REAL debe validar contratos.

Nunca seleccionar Demo automáticamente en producción ante error de backend.

Nunca devolver éxito ficticio para ocultar un error.

Evitar adaptadores duplicados que accedan al mismo recurso con reglas diferentes.

---

# 21. MODO DEMO Y PRODUCCIÓN

Crear una separación explícita.

## DEMO

Fixtures sintéticos.

Ningún envío externo.

Ninguna reserva real.

Ningún pago real.

Ninguna modificación clínica.

## STAGING

Servicios de prueba autorizados.

Datos sintéticos.

Pruebas controladas.

## PRODUCCIÓN

Servicios reales conectados.

Permisos efectivos.

Trazabilidad.

Operaciones protegidas.

## Regla

Un usuario nunca debe confundir una pantalla DEMO con una pantalla productiva.

Las rutas productivas no deben regresar silenciosamente a datos de demostración.

---

# 22. AUDITORÍA DE AUTENTICACIÓN

Revisar:

Inicio de sesión.

Cierre de sesión.

Sesión vencida.

Cambio de rol.

Recuperación.

Redirecciones.

Rutas protegidas.

Carga de perfil.

## Probar

Usuario anónimo.

Usuario autenticado.

Usuario sin permiso.

Sesión caducada.

Cuenta suspendida.

## Regla

No construir autenticación paralela.

No simular sesión productiva.

La validación definitiva corresponde al sistema de autenticación de Antigravity.

---

# 23. AUDITORÍA DE PRIVACIDAD

Revisar todos los módulos que exponen:

Propietarios.

Mascotas.

Direcciones.

Contactos.

Conversaciones.

Datos clínicos referenciados.

Finanzas.

Credenciales.

Documentos.

Información de empleados.

## Reparar

Datos sensibles en consola.

Datos sensibles en URLs.

Archivos con enlaces públicos.

Fixtures con datos reales.

Acceso entre organizaciones.

Visualización indebida de campos.

## Regla

Las pruebas de autorización del servidor y RLS deben ejecutarse también en Antigravity.

No declarar seguridad completa únicamente por ocultar la interfaz.

---

# 24. AUDITORÍA DE CUSTOMER EXPERIENCE MEMORY

Revisar Prompt 03.

## Verificar

Una sola ficha familiar.

Una sola ficha de mascota.

Preferencias.

Contactos.

Cuidadores autorizados.

Compromisos.

Historial permitido.

Correcciones.

Fuentes.

Vigencia.

Consentimientos.

Protección de duelo.

## Integraciones

WhatsApp.

Citas.

Visitas.

Remisiones.

Calidad.

Finanzas, solo en el alcance permitido.

## Corregir

Memorias duplicadas.

Preferencias contradictorias.

Información inventada.

Datos sin procedencia.

Datos sensibles visibles a usuarios incorrectos.

---

# 25. AUDITORÍA DE WHATSAPP

Revisar Prompt 04.

## Verificar

Bandeja.

Chat.

Mensajes.

Estados de entrega.

Asignaciones.

Control humano.

Control IA.

Contexto del cliente.

Plantillas.

Respuestas rápidas.

Errores.

Escalamientos.

## Casos importantes

Dos agentes intentan responder.

Mensaje fallido.

Conversación sin responsable.

Cliente solicita cita.

Cliente cancela.

Cliente pregunta por una remisión.

Cliente reporta urgencia.

## Regla

No enviar mensajes de prueba reales sin autorización.

No mostrar DELIVERED cuando solamente hay solicitud de envío.

No duplicar bandejas.

---

# 26. AUDITORÍA DE SMART SCHEDULER

Revisar Prompt 05.

## Verificar

Calendario maestro.

Calendarios individuales.

Disponibilidad.

Turnos.

Ausencias.

Quick Booking.

Bloqueos.

Asignación.

Recurrencias.

Rutas.

Lista de espera.

Conflictos.

## Pruebas fundamentales

No doble reserva.

No asignación a profesional no habilitado.

No ignorar desplazamientos.

No ignorar descansos.

No desplazar visita protegida.

No crear confirmación oficial falsa.

No duplicar una solicitud por doble toque.

## Regla

La reserva real debe ser atómica en backend.

La lógica del navegador no constituye bloqueo definitivo.

---

# 27. AUDITORÍA DE FIELD OPERATIONS

Revisar Prompt 06.

## Verificar

Dashboard veterinario.

Dashboard auxiliar.

Mis visitas.

Preparación.

Kit.

Ruta.

Desplazamiento.

Llegada.

Inicio de atención.

Finalización.

Registro operativo.

Insumos.

Incidencias.

Solicitud de ayuda.

Compromisos.

Cierre de jornada.

## Casos

Sin conexión.

Cambio de ruta.

Profesional reemplazado.

Insumo faltante.

Visita no realizada.

## Regla

No transformar un evento local pendiente en registro oficial sin confirmación backend.

---

# 28. AUDITORÍA DE SCHEDULE SIMULATOR

Revisar Prompt 07.

## Verificar

Snapshot.

Restricciones.

Diez escenarios SIM.

Alternativas.

Impacto.

Comparador.

Antes/después.

Aprobaciones.

Revalidación.

Plan de ejecución.

Errores parciales.

## Prueba crítica

Crear una simulación.

Modificar parámetros.

Comparar alternativas.

Descartar.

## Resultado esperado

La agenda real no cambia.

## Otra prueba crítica

Intentar ejecutar un escenario antiguo.

## Resultado esperado

Debe requerir revalidación autoritativa.

---

# 29. AUDITORÍA DE SPECIALIST REFERRAL HUB

Revisar Prompt 08.

## Verificar

Directorio.

Verificaciones.

Especialidades.

Remisiones.

Disponibilidad informada.

Ofertas.

Selección del cliente.

Confirmación externa.

Documentos.

Informes.

Seguimiento.

## Casos

Horario expirado.

Cliente seleccionó pero especialista no confirmó.

Especialista canceló.

Informe recibido sin revisión.

Remisión delegada.

Compromiso vencido.

## Regla

No presentar una selección como reserva confirmada.

No compartir documentos clínicos indiscriminadamente.

---

# 30. AUDITORÍA DE FINANZAS

Revisar Prompt 09.

## Verificar

Tarifas.

Cargos.

Facturas administrativas.

Pagos reportados.

Pagos verificados.

Conciliación.

Saldos.

Costos.

Margen.

Inventario valorizado.

Compras.

Rentabilidad.

## Pruebas críticas

Pago reportado no equivale a pago verificado.

Pago verificado no equivale a conciliación.

Facturación no equivale a dinero recibido.

Margen directo no equivale a utilidad neta.

## Reparar

Cálculos con valores ficticios.

Doble conteo.

Estados financieros mezclados.

Costos sin fuente.

Redondeo inseguro.

---

# 31. AUDITORÍA DE QUALITY & LOYALTY

Revisar Prompt 10.

## Verificar

Quejas.

Seguimiento.

Compromisos.

Encuestas.

Satisfacción.

Reseñas.

Referidos.

Consentimientos.

Preferencias.

Protección de duelo.

Acciones correctivas.

## Casos

Queja abierta.

Compromiso incumplido.

Cliente sin consentimiento comercial.

Solicitud de reseña.

Seguimiento posterior.

## Reglas

No hacer review gating.

No contactar clientes sin elegibilidad.

No cerrar una queja por enviar disculpas.

---

# 32. AUDITORÍA DE ACADEMY

Revisar Prompt 11.

## Verificar

Cursos.

Lecciones.

Procedimientos.

Versiones.

Asignaciones.

Evaluaciones.

Competencias.

Certificaciones internas.

Onboarding.

Tutor IA.

## Casos

Curso no aprobado.

Procedimiento retirado.

Empleado cambia de rol.

Evaluación reprobada.

Certificación expirada.

Documento restringido.

## Reglas

No confundir formación interna con habilitación profesional.

No exponer respuestas protegidas de evaluaciones.

---

# 33. AUDITORÍA DEL ASISTENTE DE LUIS

Revisar Prompt 12.

## Verificar

Chat.

Voz.

Contexto.

Herramientas.

Datos.

Propuestas.

Aprobaciones.

Delegaciones.

Reportes.

Modo ausencia.

Autonomía.

Memoria empresarial.

## Casos críticos

Consulta solo lectura.

Propuesta de reorganización.

Aprobación.

Acción prohibida.

Herramienta no disponible.

Resultado parcial.

Prompt injection.

Confirmación oficial pendiente.

## Regla

La IA nunca responde "ya lo hice" si solamente preparó una acción.

No ejecutar acciones restringidas desde React.

---

# 34. AUDITORÍA DEL CENTRO ADMINISTRATIVO

Revisar Prompt 13.

## Verificar

Configuración.

Servicios.

Zonas.

Horarios.

Políticas.

Roles.

Permisos.

Integraciones.

OKVET.

Monitoreo.

Errores.

Auditoría.

Seguridad.

Backups.

Despliegue.

## Regla

Los estados de salud deben provenir de comprobaciones reales.

No mostrar CONNECTED únicamente por existir una configuración.

---

# 35. REPARAR LOS FLUJOS ENTRE MÓDULOS

Esta sección es fundamental.

No basta con verificar módulos aislados.

Probar que los procesos completos atraviesan correctamente la aplicación.

## Flujo A

WhatsApp → Cliente → Mascota → Solicitud → Quick Booking → Confirmación → Agenda → Ruta.

## Flujo B

Llamada → Quick Booking → Cliente → Servicio → Profesional → Solicitud → OKVET → Confirmación.

## Flujo C

Cita confirmada → Preparación → Insumos → Ruta → Visita → Registro → Cobro → Seguimiento.

## Flujo D

Plan profesional aprobado → Recurrencias → Agenda → Asignación → Insumos → Ejecución → Cierre.

## Flujo E

Ausencia → Citas afectadas → Simulación → Alternativas → Aprobación → Reprogramación → Comunicación.

## Flujo F

Visita → Remisión → Especialista → Opciones → Elección del cliente → Confirmación → Informe → Continuidad.

## Flujo G

Pago reportado → Verificación → Conciliación → Saldo → Dashboard de Luis.

## Flujo H

Incidencia → Queja → Responsable → Resolución → Seguimiento → Mejora.

## Flujo I

Nuevo empleado → Onboarding → Academy → Evaluación → Competencia → Asignaciones permitidas.

## Flujo J

Luis pregunta → Asistente → Herramienta → Resultado → Propuesta → Aprobación → Ejecución verificada.

## Flujo K

Luis prepara ausencia → Cobertura → Delegaciones → Escalamiento → Seguimiento → Informe final.

## Flujo L

Error externo → Monitor → Incidente → Recuperación → Conciliación → Resultado.

## Obligación

Probar cada flujo completo.

Corregir desconexiones que sean responsabilidad de Lovable.

Registrar dependencias cuando el siguiente paso pertenezca a Antigravity.

---

# 36. CONTRATO ÚNICO DE IDENTIDAD ENTRE MÓDULOS

Verificar que todos los módulos utilizan identificadores estables.

## Entidades

Organization ID.

User ID.

Owner ID.

Pet ID.

Staff ID.

Appointment ID.

Visit ID.

Route ID.

Referral ID.

Payment ID.

Task ID.

Simulation ID.

Conversation ID.

## Regla

No identificar registros únicamente por nombre.

No confundir ID interno con ID de OKVET.

Mantener referencias externas separadas.

No permitir que dos fichas de mascotas con el mismo nombre se fusionen incorrectamente.

---

# 37. COHERENCIA DE ESTADOS

Crear una matriz de estados por entidad.

## Ejemplo: cita

REQUESTED.

INCOMPLETE.

VALIDATING.

PENDING_OKVET.

CONFIRMED.

CANCELLED.

NOT_PERFORMED.

## Ejemplo: visita

ASSIGNED.

EN_ROUTE.

ARRIVED.

IN_SERVICE.

SERVICE_FINISHED.

ADMINISTRATIVELY_COMPLETED.

## Ejemplo: pago

REPORTED.

VERIFICATION_PENDING.

VERIFIED.

RECONCILED.

## Ejemplo: remisión

PROPOSED.

APPROVED.

PENDING_EXTERNAL_CONFIRMATION.

CONFIRMED.

REPORT_PENDING.

REVIEW_PENDING.

CLOSED.

## Obligación

Detectar transiciones incorrectas.

Unificar tipos entre UI y servicios.

No fusionar estados que representan hechos distintos.

---

# 38. REGLAS DE CONCURRENCIA E IDEMPOTENCIA

Identificar operaciones que requieren protección:

Reservar cita.

Confirmar cita.

Cancelar.

Reprogramar.

Registrar pago.

Conciliar.

Consumir inventario.

Asignar profesional.

Publicar ruta.

Aprobar.

Enviar comunicación.

Crear remisión.

## En Lovable

Preparar:

Idempotency key.

ExpectedVersion.

Correlation ID.

Estado de petición.

Tratamiento de conflicto.

Interfaz de reintento.

## En Antigravity

La ejecución autoritativa y el bloqueo transaccional.

## Regla

No afirmar prevención real de carreras solo porque se deshabilitó un botón mientras carga.

---

# 39. AUDITORÍA DE FECHAS, HORAS Y MONEDA

Verificar:

America/Bogota.

UTC para intercambio apropiado.

Fecha local.

Instante absoluto.

Duraciones.

Turnos cruzando medianoche.

Caducidad de reservas.

Recurrencias.

Horario de especialistas externos.

Moneda COP.

Precisión de importes.

## Reparar

Comparaciones de fecha como strings cuando sean incorrectas.

Horarios ambiguos.

Pérdida de zona horaria.

Cálculos financieros con precisión insegura.

## Regla

No asumir que todos los proveedores usan la misma zona horaria.

---

# 40. AUDITORÍA DE ERRORES

Toda pantalla relevante debe manejar:

Sin datos.

Sin permisos.

Sesión expirada.

Sin conexión.

Timeout.

Error de validación.

Error de proveedor.

Conflicto.

Datos desactualizados.

Operación parcial.

## Reparar

Pantallas blancas.

Errores silenciosos.

Toasts de éxito falsos.

Reintentos infinitos.

Perdida de borradores.

## Regla

Un error recuperable debe ofrecer una acción útil y segura.

---

# 41. EXPERIENCIA OFFLINE

Auditar los módulos de campo.

## Verificar

Identificación de conexión.

Borradores permitidos.

Cola local solo si está autorizada y protegida.

Reintentos idempotentes.

Sincronización.

Conflictos.

## Prohibiciones

No almacenar expedientes clínicos completos indefinidamente en dispositivos.

No confirmar pagos offline.

No confirmar citas oficiales offline.

No realizar descuentos definitivos de inventario sin servidor.

No mostrar una operación pendiente como realizada.

---

# 42. RENDIMIENTO

Medir y mejorar:

Carga inicial.

Cambios de página.

Calendarios.

Bandeja de mensajes.

Listados largos.

Dashboards.

Mapas.

Renderizado.

Consultas repetidas.

Tamaño del bundle.

## Técnicas

Lazy loading.

Code splitting.

Memoización cuando beneficie.

Virtualización para listas grandes.

Paginación.

Caché con invalidación.

Optimización de imágenes.

Evitar múltiples llamadas duplicadas.

## Regla

No mejorar rendimiento ocultando datos críticos o retrasando indefinidamente el estado real.

---

# 43. ACCESIBILIDAD

Revisar:

Navegación por teclado.

Foco.

Lectores de pantalla.

Etiquetas.

Contraste.

Tamaño de controles.

Mensajes de error.

Validaciones.

Tablas.

Diálogos.

## Objetivo

Alinear con WCAG 2.2 AA donde sea aplicable y verificable.

## Regla

No declarar cumplimiento completo únicamente por pasar una herramienta automática.

Complementar con pruebas manuales.

---

# 44. CALIDAD DEL CÓDIGO

Ejecutar, según las herramientas disponibles:

TypeScript typecheck.

ESLint.

Build.

Pruebas unitarias.

Pruebas de componentes.

Pruebas E2E.

## Detectar

Imports rotos.

Funciones sin retorno.

Errores de tipos.

Hooks incorrectos.

Condiciones inconsistentes.

Código duplicado.

Dependencias no utilizadas.

Warnings relevantes.

## Reparar

Los fallos que estén dentro del alcance de Lovable.

No silenciar errores usando `any` o `@ts-ignore` como solución indiscriminada.

---

# 45. MATRIZ MAESTRA DE PRUEBAS

Importar y conservar:

AT-001 a AT-060.

AT2-001 a AT2-050.

AT3-001 a AT3-060.

## Total

170 casos originales.

## Cada prueba debe contener

ID.

Texto original.

Módulo.

Precondiciones.

Pasos.

Resultado esperado.

Tipo.

Entorno.

Estado.

Evidencia.

Responsable.

Fecha.

Bloqueo.

## Tipos

UNIT.

COMPONENT.

INTEGRATION.

END_TO_END.

SECURITY.

ACCESSIBILITY.

PERFORMANCE.

MANUAL.

EXTERNAL_PROVIDER.

## Regla

No reescribir los criterios originales para hacerlos más fáciles de aprobar.

---

# 46. MATRIZ DE LOS 224 COMPORTAMIENTOS

Registrar:

WF-001 a WF-112.

WF2-001 a WF2-056.

WF3-001 a WF3-056.

## Cada comportamiento

ID.

Descripción original.

Módulo.

Pantalla.

Componente.

Servicio.

Contrato.

Workflow n8n asociado cuando exista.

Prueba.

Estado.

Evidencia.

## Importante

224 comportamientos no significan 224 workflows n8n separados.

No crear automatizaciones adicionales en Lovable.

No declarar completados comportamientos que siguen dependiendo de ejecución externa.

---

# 47. PRUEBAS DE SEGURIDAD TRANSVERSALES

Probar:

Usuario anónimo.

Cliente accediendo a datos de otra familia.

Cuidador sin autorización.

Auxiliar intentando aprobar decisión clínica.

Recepción intentando modificar historia clínica.

Veterinario intentando abrir datos financieros restringidos.

Soporte intentando acceder a documentos privados.

Consultor intentando acceder a información no autorizada.

Empleado intentando elevar privilegios.

Especialista externo consultando otras remisiones.

## Resultados

La UI debe comportarse correctamente.

El backend debe bloquear realmente los accesos prohibidos cuando esté conectado.

Registrar las pruebas que solo Antigravity puede validar.

---

# 48. PRUEBAS DE RESISTENCIA A IA INSEGURA

Revisar el asistente de Luis y WhatsApp.

## Casos

Prompt injection.

Información contradictoria.

Cliente que intenta dar instrucciones al sistema.

Documento que incluye instrucciones maliciosas.

Solicitud de exportación de datos.

Acción clínica prohibida.

Confirmación ficticia.

Herramienta no disponible.

Datos desactualizados.

## Reglas

La IA no puede saltarse permisos.

No puede inventar confirmaciones.

No puede ejecutar herramientas no autorizadas.

No puede modificar políticas desde una conversación.

---

# 49. PRUEBAS E2E CON DATOS SINTÉTICOS

Preparar un conjunto consistente de datos sintéticos.

## Entidades

Una organización DEMO.

Varios profesionales con competencias distintas.

Un profesional ausente.

Un auxiliar.

Un coordinador.

Un administrador.

Luis DEMO.

Varias familias ficticias.

Mascotas ficticias.

Citas confirmadas simuladas.

Solicitudes pendientes.

Tratamiento recurrente aprobado sintético.

Remisión externa.

Factura ficticia.

Pago reportado ficticio.

Incidencia.

Queja.

Compromiso vencido.

Curso.

Evaluación.

## Reglas

DEMO debe identificarse claramente.

No utilizar datos reales sin necesidad.

No confundir un resultado sintético con evidencia de integración.

---

# 50. PRUEBAS DE ESTADOS ANORMALES

Probar:

Dos empleados abren la misma cita.

Cliente y coordinador solicitan cambio simultáneo.

Reserva expira.

Calendario externo cambia.

OKVET no está disponible.

WhatsApp no responde.

Un mensaje falla.

Un profesional queda incapacitado.

Un pago está reportado pero no verificado.

Un insumo está agotado.

Un especialista cancela.

Un informe nunca llega.

Luis activa modo ausencia.

La asistente de IA está desconectada.

## Resultado

La aplicación debe mantener estados coherentes, mostrar bloqueos y ofrecer recuperación segura.

---

# 51. AUDITORÍA DEL MOTOR DE APROBACIONES

Verificar un único sistema de aprobaciones reutilizable.

## Aplica a

Reprogramaciones.

Cambios de turno.

Políticas.

Tarifas.

Pagos sensibles.

Accesos.

Remisiones profesionales.

Publicación de procedimientos.

Simulaciones.

Cambios de configuración.

## Regla

No crear centros de aprobación independientes con políticas contradictorias.

Las aprobaciones deben tener:

Solicitante.

Aprobador.

Entidad.

Versión.

Estado.

Fecha.

Evidencia.

Auditoría.

---

# 52. REVISAR LA EXPERIENCIA DE LUIS

Realizar una prueba completa como si Luis utilizara la aplicación desde su celular.

## Objetivos

Consultar agenda en segundos.

Ver pendientes.

Consultar el equipo.

Abrir WhatsApp.

Crear solicitud rápida.

Consultar disponibilidad.

Preparar una simulación.

Revisar alternativas.

Aprobar una decisión autorizada.

Delegar tarea.

Consultar finanzas.

Consultar remisiones.

Revisar excepciones.

Activar una propuesta de modo ausencia.

## Detectar

Demasiados pasos.

Pantallas confusas.

Información duplicada.

Texto técnico innecesario.

Acciones escondidas.

## Reparar

Reducir fricción sin eliminar controles de seguridad.

---

# 53. REVISAR LA EXPERIENCIA DEL COORDINADOR

Simular una jornada completa:

Llegan solicitudes.

Se identifican clientes.

Se crean citas.

Se verifican restricciones.

Se asignan profesionales.

Se preparan rutas.

Aparece ausencia.

Se prepara reemplazo.

Se comunica un cambio autorizado.

Se resuelve una incidencia.

Se registran pendientes.

## Objetivo

Que coordinación pueda ejecutar su trabajo sin depender constantemente de Luis.

---

# 54. REVISAR LA EXPERIENCIA DEL VETERINARIO

Simular:

Inicio de jornada.

Consulta de ruta.

Preparación.

Salida.

Llegada.

Atención.

Registro operativo.

Insumos.

Compromisos.

Remisiones.

Cierre.

## Objetivo

Reducir acciones administrativas.

Mantener información útil.

Evitar navegación innecesaria.

No interferir con decisiones clínicas.

---

# 55. REVISAR LA EXPERIENCIA DEL AUXILIAR

Simular:

Inicio.

Tareas.

Preparación de kit.

Asignaciones.

Registro de faltantes.

Ayuda.

Incidencias.

Entrega de insumos.

Cierre de tareas.

## Objetivo

Responsabilidades claras.

Permisos correctos.

Experiencia móvil sencilla.

---

# 56. REVISAR LA EXPERIENCIA DEL CLIENTE

Simular:

Primer contacto.

Identificación.

Solicitud.

Elección de horario.

Confirmación.

Preparación.

Visita.

Seguimiento.

Remisión.

Selección de especialista.

Consulta de documentos.

Queja.

Preferencias.

## Objetivo

Experiencia humana.

Información comprensible.

Sin confirmaciones falsas.

Sin documentos ajenos.

Sin mensajes innecesarios.

---

# 57. REVISAR EXPERIENCIA DEL ESPECIALISTA

Simular:

Acceso autorizado.

Consulta de remisión.

Horarios.

Respuesta.

Confirmación.

Documentación.

Informe.

Seguimiento.

## Reglas

Acceso limitado.

Sin acceso a otras familias.

Sin posibilidad de consultar datos clínicos no compartidos.

---

# 58. CONTRATOS DE EVENTOS

Preparar o consolidar el catálogo de eventos empresariales.

## Ejemplos

appointment.requested.

appointment.hold_created.

appointment.confirmed.

appointment.reschedule_requested.

appointment.cancel_requested.

visit.assigned.

visit.arrived.

visit.completed.

staff.absence_reported.

route.change_requested.

referral.created.

referral.external_confirmed.

payment.reported.

payment.verified.

commitment.created.

commitment.completed.

conversation.human_takeover.

complaint.created.

training.completed.

approval.requested.

approval.decided.

integration.failed.

## Cada evento

Event type.

Version.

Organization ID.

Entity ID.

Correlation ID.

Idempotency Key.

Occurred At.

Source.

Payload schema.

Sensitive fields policy.

## Regla

Estos son contratos de integración.

No construir workflows n8n dentro de Lovable.

---

# 59. OBSERVABILIDAD DE APLICACIÓN

Comprobar que los errores del frontend puedan asociarse a procesos.

## Identificadores

Correlation ID.

Operation ID.

User-facing request reference.

Module.

Timestamp.

## No registrar

Tokens.

Contraseñas.

Historias clínicas completas.

Documentos privados completos.

Datos financieros innecesarios.

## Objetivo

Permitir al administrador seguir una operación entre frontend y backend mediante las interfaces de monitoreo existentes.

---

# 60. PRUEBAS DE INTEGRACIÓN CON ANTIGRAVITY

Cuando existan contratos operativos:

## Verificar

Autenticación.

Permisos.

Lecturas.

Escrituras.

Validación.

Idempotencia.

Concurrencia.

Estados.

Errores.

Auditoría.

Reintentos.

## Regla

No probar escrituras reales sobre datos de producción sin autorización.

Utilizar staging y datos sintéticos.

Si el contrato no está disponible, registrar BLOCKED_BY_BACKEND.

No fabricar respuestas para aprobar la prueba.

---

# 61. CONTROL DE INTEGRACIONES EXTERNAS

Preparar matriz para:

Supabase.

n8n.

WhatsApp Business Platform.

Google Calendar.

Mapas.

Waze.

OKVET.

Proveedor de IA.

Transcripción.

Correo.

Almacenamiento.

Pagos.

Facturación.

## Estados

NOT_CONFIGURED.

CONFIGURED_UNVERIFIED.

CONNECTED.

DEGRADED.

DISCONNECTED.

UNKNOWN.

BLOCKED.

## Regla

Una configuración no demuestra conexión.

Un webhook recibido no demuestra procesamiento.

Una cita operativa no demuestra confirmación OKVET.

---

# 62. DEPLOYMENT READINESS

Reutilizar el Centro de Despliegue del Prompt 13.

## Gates

FRONTEND.

DOMAIN_LOGIC.

AUTHENTICATION.

AUTHORIZATION.

DATA_PRIVACY.

SCHEDULING.

OKVET.

COMMUNICATIONS.

FIELD_OPERATIONS.

FINANCE.

REFERRALS.

AI.

INTEGRATIONS.

MONITORING.

BACKUP_AND_RECOVERY.

END_TO_END_TESTS.

BUSINESS_APPROVAL.

## Estados

NOT_READY.

IN_PROGRESS.

READY_FOR_TEST.

TESTED.

VERIFIED.

BLOCKED.

## Regla

No declarar producción lista si un gate obligatorio sigue bloqueado.

No bloquear el desarrollo independiente por integraciones pendientes.

---

# 63. SEPARAR LISTO EN LOVABLE DE LISTO PARA PRODUCCIÓN

Crear dos indicadores diferentes.

## LOVABLE APPLICATION READINESS

Evalúa:

Pantallas.

Navegación.

Componentes.

Dominio.

Servicios.

Contratos.

UX.

Pruebas frontend.

## PRODUCTION READINESS

Evalúa además:

Backend.

Autenticación.

RLS.

Operaciones atómicas.

Proveedores externos.

OKVET.

WhatsApp.

Seguridad.

Datos reales autorizados.

Pruebas E2E.

Continuidad operativa.

## Regla

No utilizar una única barra de progreso que mezcle ambos estados.

---

# 64. REPARACIÓN AUTOMÁTICA CONTROLADA

Cuando identifiques un error dentro de Lovable:

1. Reproducirlo.
2. Identificar causa.
3. Localizar archivo.
4. Evaluar dependencias.
5. Aplicar corrección.
6. Ejecutar prueba.
7. Comprobar regresiones.
8. Registrar evidencia.
9. Actualizar estado.

## No hacer

No reemplazar una función por un stub.

No eliminar una pantalla difícil de reparar.

No desactivar permisos para lograr que el test pase.

No convertir errores en éxitos simulados.

No ocultar excepciones mediante bloques catch vacíos.

No eliminar tests que fallen.

---

# 65. POLÍTICA DE NO REGRESIÓN

Toda reparación debe preservar funciones existentes.

## Antes de cambiar

Identificar módulos afectados.

## Después de cambiar

Ejecutar pruebas relacionadas.

## Casos críticos

Cambiar una entidad Customer no debe romper WhatsApp.

Cambiar Appointment no debe romper rutas.

Cambiar Staff no debe romper Academy.

Cambiar Referral no debe romper compromisos.

Cambiar Payment no debe romper finanzas.

Cambiar Permission no debe otorgar accesos nuevos.

## Regla

No considerar terminado un arreglo que rompe otra funcionalidad.

---

# 66. PRUEBAS DE CALIDAD DEL REPOSITORIO

Implementar o ajustar scripts compatibles con el proyecto para:

Typecheck.

Lint.

Unit tests.

Component tests.

Build.

E2E tests.

## Si existe CI

Integrar los comandos.

## Si no existe CI

Preparar configuración de pruebas que pueda ejecutarse en el entorno correspondiente.

## Importante

No inventar resultados de pipeline.

No marcar CI verde si no se ejecutó.

No instalar dependencias de gran tamaño sin necesidad.

---

# 67. DOCUMENTACIÓN DE RESULTADOS

No quiero un informe de auditoría como única entrega.

Quiero código reparado.

La documentación debe ser consecuencia del trabajo.

## Archivos

PROJECT_IMPLEMENTATION_LEDGER.md.

PROJECT_CONTINUATION.md.

PROJECT_REQUIREMENTS.md.

PROJECT_ROUTES.md.

SCREEN_COVERAGE_MATRIX.md.

API_CONTRACT_REGISTRY.md.

BACKEND_MODULE_REGISTRY.md.

PROJECT_TEST_MATRIX.md.

ANTIGRAVITY_HANDOFF.md.

LOVABLE_READINESS.md.

PRODUCTION_BLOCKERS.md.

RELEASE_CHECKLIST.md.

## Cada entrada debe indicar

Qué se revisó.

Qué se encontró.

Qué se corrigió.

Qué prueba se ejecutó.

Qué resultado obtuvo.

Qué falta.

Qué depende de Antigravity.

---

# 68. MATRIZ DE REPARACIONES

Crear:

**APPLICATION_REPAIR_LEDGER**

## Campos

Issue ID.

Module.

Severity.

Description.

Evidence.

Root cause.

Files affected.

Fix applied.

Test.

Test result.

Status.

Dependency.

## Severidad

P0 — Seguridad o integridad crítica.

P1 — Función esencial no operativa.

P2 — Problema importante de UX o integración.

P3 — Mejora no bloqueante.

## Regla

Priorizar integridad, seguridad y procesos esenciales antes de mejoras cosméticas.

---

# 69. PRIORIZACIÓN DE CORRECCIONES

## PRIORIDAD 0

Exposición de datos.

Permisos vulnerados.

Confirmaciones falsas.

Cobros duplicados.

Reservas incompatibles.

Acciones clínicas no autorizadas.

Pérdida de información.

## PRIORIDAD 1

Citas que no pueden crearse.

Agenda inconsistente.

Rutas rotas.

Visitas sin registro.

Compromisos perdidos.

Remisiones sin continuidad.

## PRIORIDAD 2

Dashboards incompletos.

Filtros defectuosos.

Errores de navegación.

Formularios poco claros.

## PRIORIDAD 3

Animaciones.

Transiciones.

Detalles visuales.

## Regla

No dedicar todo el esfuerzo a pulir la interfaz mientras existan errores P0 o P1.

---

# 70. PRUEBAS DE ACEPTACIÓN FINAL

Crear al menos una prueba ejecutable por cada flujo crítico definido en la sección 35, utilizando fixtures consistentes y contratos reales disponibles.

## Verificar explícitamente

No cita confirmada sin fuente válida.

No doble reserva.

No duplicados por reintento.

No remisión confirmada sin especialista.

No tratamiento modificado por IA.

No pago verificado ficticiamente.

No documento clínico compartido sin autorización.

No acceso entre familias.

No acción sensible ejecutada sin permiso.

No simulación que modifique agenda real.

No mensaje enviado sin autorización.

No acción completa ficticiamente.

## Estados de resultado

PASS.

FAIL.

BLOCKED_BACKEND.

BLOCKED_EXTERNAL_PROVIDER.

NOT_RUN.

## Regla

Los casos no ejecutados no pueden contarse como aprobados.

---

# 71. PAQUETE DE ENTREGA PARA ANTIGRAVITY

Al finalizar las correcciones de Lovable, producir un documento técnico consolidado.

**ANTIGRAVITY INTEGRATION HANDOFF — VERSION 14**

## Contenido

Arquitectura de frontend.

Módulos.

Rutas.

Tipos compartidos.

Contratos.

Operaciones de lectura.

Operaciones de escritura.

Autorizaciones.

Eventos.

Errores.

Integraciones.

Dependencias.

Datos necesarios.

Estados.

Pruebas.

Bloqueos.

## Para cada dependencia

Qué necesita Lovable.

Qué debe entregar Antigravity.

Qué esquema se espera.

Qué permisos aplica.

Qué resultado demuestra integración correcta.

## Prohibición

No incluir secretos, tokens o contraseñas.

---

# 72. PRUEBA DE INTEGRACIÓN COMPLETA DE CITAS

Preparar la siguiente prueba end-to-end de staging.

1. Crear propietario sintético.
2. Crear mascota sintética.
3. Buscar servicio.
4. Consultar disponibilidad.
5. Seleccionar profesional habilitado.
6. Crear solicitud.
7. Solicitar bloqueo si existe backend autoritativo.
8. Registrar procedimiento de confirmación OKVET simulado o manual controlado.
9. Verificar estado.
10. Incorporar visita a agenda.
11. Incorporar visita a ruta.
12. Registrar ejecución sintética.
13. Registrar seguimiento.
14. Verificar auditoría.

## Condición

No realizar cambios reales en OKVET durante una prueba sintética sin autorización.

Si la confirmación oficial no puede probarse, marcar el paso correspondiente como bloqueado y no simular que la integración real pasó.

---

# 73. PRUEBA COMPLETA DE AUSENCIA

1. Seleccionar profesional sintético.
2. Registrar ausencia de prueba.
3. Identificar visitas afectadas.
4. Generar simulación.
5. Comparar alternativas.
6. Verificar restricciones.
7. Seleccionar propuesta.
8. Revisar aprobaciones.
9. Preparar plan.
10. Comprobar que la agenda no cambia antes de la ejecución.
11. Intentar revalidación.
12. Verificar respuesta del backend cuando exista.
13. Revisar pendientes.
14. Consultar resumen ejecutivo.

## Condición

No modificar citas reales.

---

# 74. PRUEBA COMPLETA DE REMISIONES

1. Abrir visita sintética.
2. Crear remisión.
3. Vincular aprobación profesional de prueba.
4. Buscar especialista verificado de demostración.
5. Registrar disponibilidad informada.
6. Preparar opciones.
7. Registrar selección de cliente sintético.
8. Comprobar que sigue pendiente de confirmación externa.
9. Registrar confirmación verificada de prueba mediante mecanismo autorizado.
10. Crear seguimiento.
11. Registrar informe de prueba.
12. Solicitar revisión profesional.
13. Comprobar criterios de cierre.

---

# 75. PRUEBA COMPLETA DEL ASISTENTE DE LUIS

1. Abrir la asistente.
2. Consultar agenda de prueba.
3. Consultar profesionales.
4. Consultar pendientes.
5. Solicitar simulación.
6. Revisar alternativas.
7. Preparar delegación.
8. Solicitar aprobación.
9. Verificar restricción de ejecución.
10. Consultar resultado.
11. Probar error externo.
12. Probar prompt injection.
13. Probar datos incompletos.
14. Probar modo ausencia.
15. Consultar auditoría.

## Condición

No permitir que el modelo ejecute acciones protegidas sin autorización.

---

# 76. REVISIÓN DEL ESTADO DE OKVET

OKVET no dispone de una API directa confirmada para este proyecto.

## Debe quedar claro en la plataforma

Qué se registra en Vet Freedom OS.

Qué se confirma oficialmente en OKVET.

Qué referencias se importan.

Qué registros requieren verificación humana.

Qué información no está sincronizada.

Qué conflictos existen.

## Reglas

No inventar APIs.

No inventar sincronización instantánea.

No compartir credenciales.

No utilizar endpoints privados no autorizados.

No prometer una confirmación que no se obtuvo.

---

# 77. DOCUMENTAR GAPS NO RESOLUBLES EN LOVABLE

Cuando un problema pertenezca a Antigravity:

Registrar:

Issue ID.

Módulo.

Contrato.

Motivo.

Impacto.

Esquema requerido.

Permisos requeridos.

Prueba pendiente.

Prioridad.

## No hacer

No crear un mock productivo para ocultar el problema.

No implementar otro backend.

No bloquear innecesariamente otras reparaciones.

---

# 78. CRITERIOS DE ACEPTACIÓN DE PROMPT 14

La fase estará completa en Lovable cuando:

1. Se haya inspeccionado el código real.
2. Exista inventario de rutas.
3. Exista inventario de pantallas.
4. Exista inventario de componentes.
5. Se hayan identificado duplicados.
6. Se hayan reparado imports rotos.
7. Se hayan reparado errores TypeScript implementables.
8. Se hayan revisado todos los botones críticos.
9. Se hayan reparado acciones falsas.
10. Se hayan revisado formularios.
11. Se hayan corregido validaciones faltantes.
12. Se hayan revisado estados de carga.
13. Se hayan revisado estados de error.
14. Se hayan revisado estados vacíos.
15. Se haya verificado navegación por rol.
16. Se hayan reparado rutas rotas.
17. Se haya verificado diseño móvil.
18. Se hayan reparado problemas responsive críticos.
19. Se haya consolidado el sistema visual.
20. Se hayan revisado los modelos TypeScript.
21. Se hayan consolidado tipos duplicados.
22. Se hayan revisado servicios de dominio.
23. Se hayan implementado reglas faltantes dentro del alcance.
24. Se hayan revisado adaptadores.
25. Se hayan eliminado éxitos falsos.
26. Se hayan revisado contratos de backend.
27. Se haya preparado el handoff de Antigravity.
28. Se haya revisado Customer Experience Memory.
29. Se haya revisado WhatsApp.
30. Se haya revisado Smart Scheduler.
31. Se haya revisado Field Operations.
32. Se haya revisado Simulator.
33. Se haya revisado Specialist Referral Hub.
34. Se haya revisado Finance.
35. Se haya revisado Quality.
36. Se haya revisado Academy.
37. Se haya revisado Executive Assistant.
38. Se haya revisado Admin Control Center.
39. Se hayan comprobado los flujos transversales posibles.
40. Se hayan revisado permisos visuales.
41. Se hayan documentado pruebas de servidor pendientes.
42. Se haya revisado privacidad.
43. Se haya revisado idempotencia contractual.
44. Se hayan revisado fechas y monedas.
45. Se haya revisado rendimiento.
46. Se haya revisado accesibilidad.
47. Se haya ejecutado typecheck.
48. Se haya ejecutado build.
49. Se hayan ejecutado pruebas unitarias disponibles.
50. Se hayan ejecutado pruebas de componentes disponibles.
51. Se hayan ejecutado pruebas E2E posibles.
52. Se hayan registrado resultados reales.
53. Se haya creado matriz de 224 comportamientos basada en las fuentes originales.
54. Se haya creado matriz de 170 pruebas originales.
55. Se hayan identificado los bloqueos de Antigravity.
56. Se hayan distinguido los modos DEMO y REAL.
57. Exista Deployment Readiness.
58. Existan gates de producción.
59. Exista registro de reparaciones.
60. Exista evidencia de cada corrección importante.
61. No se haya creado infraestructura duplicada.
62. No se hayan alterado datos reales sin autorización.
63. No haya botones críticos que finjan funcionar.
64. No se hayan declarado pruebas no ejecutadas como aprobadas.
65. Project Memory esté actualizado.

## Diferencia fundamental

**LOVABLE IMPLEMENTATION COMPLETE** significa que la aplicación y los componentes bajo responsabilidad de Lovable están implementados y probados.

**PRODUCTION READY** requiere además todas las conexiones, operaciones protegidas, seguridad y pruebas de integración que correspondan a Antigravity y los proveedores externos.

No confundir ambas condiciones.

---

# 79. ORDEN DE EJECUCIÓN OBLIGATORIO

## FASE 1 — DESCUBRIMIENTO

LOTE 01 — Leer documentos y Project Memory.

LOTE 02 — Inspeccionar repositorio.

LOTE 03 — Inventariar pantallas.

LOTE 04 — Inventariar componentes.

LOTE 05 — Inventariar servicios.

LOTE 06 — Inventariar contratos.

LOTE 07 — Identificar mocks y datos hardcodeados.

LOTE 08 — Identificar problemas P0 y P1.

## FASE 2 — REPARACIÓN DE FUNDAMENTOS

LOTE 09 — Reparar TypeScript.

LOTE 10 — Reparar build.

LOTE 11 — Reparar rutas.

LOTE 12 — Reparar navegación.

LOTE 13 — Reparar layouts.

LOTE 14 — Reparar formularios.

LOTE 15 — Reparar botones.

LOTE 16 — Reparar errores.

LOTE 17 — Consolidar modelos.

LOTE 18 — Consolidar servicios.

LOTE 19 — Consolidar adaptadores.

## FASE 3 — INTEGRACIÓN FUNCIONAL

LOTE 20 — Customer Experience Memory.

LOTE 21 — WhatsApp.

LOTE 22 — Smart Scheduler.

LOTE 23 — Field Operations.

LOTE 24 — Simulator.

LOTE 25 — Specialist Referral Hub.

LOTE 26 — Finance.

LOTE 27 — Quality.

LOTE 28 — Academy.

LOTE 29 — Executive Assistant.

LOTE 30 — Admin Control Center.

## FASE 4 — FLUJOS ENTRE MÓDULOS

LOTE 31 — Contacto a reserva.

LOTE 32 — Reserva a visita.

LOTE 33 — Visita a cobro.

LOTE 34 — Tratamientos recurrentes.

LOTE 35 — Ausencia a reemplazo.

LOTE 36 — Simulación a aprobación.

LOTE 37 — Remisión a continuidad.

LOTE 38 — Queja a recuperación.

LOTE 39 — Formación a competencia.

LOTE 40 — Consulta de Luis a acción autorizada.

## FASE 5 — SEGURIDAD Y UX

LOTE 41 — Roles.

LOTE 42 — Privacidad.

LOTE 43 — Idempotencia contractual.

LOTE 44 — Estados de error.

LOTE 45 — Mobile-first.

LOTE 46 — Accesibilidad.

LOTE 47 — Rendimiento.

LOTE 48 — Offline seguro.

## FASE 6 — PRUEBAS

LOTE 49 — Typecheck.

LOTE 50 — Build.

LOTE 51 — Unit tests.

LOTE 52 — Component tests.

LOTE 53 — E2E tests.

LOTE 54 — Security tests disponibles.

LOTE 55 — Regression tests.

LOTE 56 — Revisión de requisitos originales.

LOTE 57 — Revisión de criterios de aceptación.

## FASE 7 — ANTIGRAVITY

LOTE 58 — Consolidar contratos.

LOTE 59 — Mapear operaciones protegidas.

LOTE 60 — Mapear eventos.

LOTE 61 — Preparar pruebas de integración.

LOTE 62 — Registrar dependencias.

LOTE 63 — Generar Integration Handoff.

## FASE 8 — RELEASE READINESS

LOTE 64 — Evaluar gates.

LOTE 65 — Identificar bloqueos.

LOTE 66 — Verificar documentación.

LOTE 67 — Actualizar estado de módulos.

LOTE 68 — Actualizar Project Memory.

LOTE 69 — Preparar checklist de despliegue.

LOTE 70 — Entregar estado verificable final.

## REGLA DE EJECUCIÓN

No te detengas después de elaborar el inventario.

Continúa corrigiendo.

Trabaja por lotes seguros.

Ejecuta pruebas después de las reparaciones.

Si una dependencia externa no está disponible, registra el bloqueo y continúa con funciones independientes.

Si no puedes completar todos los lotes en una sola ejecución, conserva el registro exacto y continúa a partir del siguiente lote pendiente.

No rehagas lotes ya completados con evidencia.

---

# 80. PROJECT MEMORY OS

Registrar:

PROMPT-014.

Nombre:

MASTER APPLICATION AUDIT, REPAIR, INTEGRATION & PRODUCTION READINESS.

Versión:

14.0.

## Actualizar

PROJECT_PROMPT_LOG.md.

PROJECT_IMPLEMENTATION_LEDGER.md.

PROJECT_CONTINUATION.md.

PROJECT_REQUIREMENTS.md.

PROJECT_FEATURES.md.

PROJECT_ROUTES.md.

SCREEN_COVERAGE_MATRIX.md.

BACKEND_MODULE_REGISTRY.md.

API_CONTRACT_REGISTRY.md.

PROJECT_INTEGRATIONS.md.

PROJECT_TEST_MATRIX.md.

ANTIGRAVITY_HANDOFF.md.

LOVABLE_READINESS.md.

PRODUCTION_BLOCKERS.md.

RELEASE_CHECKLIST.md.

APPLICATION_REPAIR_LEDGER.md.

## Guardar

Último lote ejecutado.

Problemas reparados.

Problemas pendientes.

Tests ejecutados.

Resultados.

Contratos disponibles.

Contratos faltantes.

Próximo trabajo.

## Regla

Este registro debe conservarse para futuras sesiones de desarrollo.

No reemplazar evidencia real con afirmaciones genéricas de completitud.

---

# 81. RESULTADO FINAL QUE QUIERO

Quiero que Vet Freedom OS deje de ser una colección de módulos aislados.

Quiero una aplicación completa que se comporte como un sistema.

Que cada botón tenga un propósito.

Que cada pantalla esté conectada.

Que cada formulario valide correctamente.

Que cada rol vea lo que necesita.

Que las rutas funcionen.

Que los clientes estén vinculados a sus mascotas.

Que WhatsApp y Customer Experience Memory compartan contexto autorizado.

Que las solicitudes se conviertan correctamente en citas cuando exista confirmación oficial.

Que las citas se relacionen con las rutas.

Que las visitas se relacionen con servicios prestados.

Que los servicios se relacionen con cobros.

Que los tratamientos recurrentes mantengan sus restricciones.

Que los especialistas tengan remisiones y seguimiento.

Que las quejas no se pierdan.

Que Academy permita formar al equipo.

Que Luis pueda consultar, analizar y delegar.

Que las aprobaciones funcionen con control.

Que las simulaciones nunca alteren citas reales sin autorización.

Que los errores sean visibles.

Que la información privada esté protegida.

Que los costos y resultados sean trazables.

Que las integraciones pendientes estén claramente identificadas.

Que Lovable y Antigravity puedan trabajar como partes de una arquitectura única.

Que los 224 comportamientos y las 170 pruebas originales estén reconciliados con el proyecto.

Que todas las correcciones posibles dentro de Lovable sean implementadas realmente.

Y que tengamos una respuesta basada en evidencia sobre qué está preparado, qué funciona y qué falta para producción.

---

# INSTRUCCIÓN FINAL A LOVABLE

**NO HAGAS SOLAMENTE UNA AUDITORÍA.**

Inspecciona el proyecto.

Identifica fallos.

Corrige los fallos implementables.

Completa funciones faltantes.

Conecta módulos.

Unifica tipos.

Unifica servicios.

Repara botones.

Repara formularios.

Repara navegación.

Repara estados.

Repara experiencias móviles.

Implementa las reglas de dominio faltantes.

Prepara los contratos para Antigravity.

Ejecuta pruebas.

Corrige regresiones.

Consolida los 224 comportamientos.

Consolida las 170 pruebas originales.

Actualiza el estado real de implementación.

Genera el handoff de integración.

Evalúa los gates de despliegue.

No configures Supabase.

No implementes n8n.

No crees infraestructura paralela.

No inventes estados de proveedores.

No envíes mensajes reales.

No confirmes citas sin OKVET.

No realices cobros reales durante QA.

No ejecutes decisiones clínicas.

No expongas información privada.

No declares producción lista si existen bloqueos críticos.

Registra evidencia.

Actualiza Project Memory.

**OBJETIVO FINAL: DEJAR LOVABLE COMPLETO EN SU ALCANCE, REPARADO, PROBADO Y PREPARADO PARA SU INTEGRACIÓN SEGURA CON ANTIGRAVITY.**

**VET FREEDOM OS — PROMPT 14**

Vet Life — Veterinaria a Domicilio  
Dr. Luis Eduardo Ríos  
Alpha Vision Method

**Despierta. Elige. Construye.**