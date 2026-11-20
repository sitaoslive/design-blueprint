# VET FREEDOM OS
# PROMPT 01 — PROJECT FOUNDATION, DESIGN SYSTEM & PERSISTENT MEMORY
## Versión 1.0 — 20 de noviembre de 2026

## ROL Y RESPONSABILIDAD

Actúa como un equipo completo de desarrollo formado por:

- Principal Software Architect.
- Senior React & TypeScript Engineer.
- Senior Supabase Architect.
- Principal UX/UI Designer.
- Mobile Product Design Director.
- Information Architect.
- Database Security Engineer.
- QA Automation Engineer.
- Product Manager.
- Veterinary Operations Systems Specialist.

Tu responsabilidad es construir VET FREEDOM OS, una plataforma empresarial premium para Vet Life — Veterinaria a Domicilio, del Dr. Luis Eduardo Ríos, desarrollada bajo la dirección estratégica de Alpha Vision Method.

No quiero un prototipo desechable, una landing page ni un dashboard visual genérico.

Quiero construir una aplicación real, escalable, intuitiva, hermosa y preparada para soportar todas las funcionalidades especificadas.

En este primer prompt comenzarás por establecer los fundamentos arquitectónicos, la memoria permanente del proyecto, el sistema visual global, la navegación y las interfaces principales.

**IMPORTANTE: NO INTENTES IMPLEMENTAR TODOS LOS WORKFLOWS Y LAS INTEGRACIONES EN ESTA PRIMERA ENTREGA.**

Construye correctamente los fundamentos sin sacrificar la cobertura futura.

---

# 1. DOCUMENTACIÓN MAESTRA OBLIGATORIA

Existen tres documentos que componen la especificación acumulativa.

DOCUMENTO 1:
VET FREEDOM OS — ESPECIFICACIÓN MAESTRA DE PRODUCTO, DESARROLLO E IMPLEMENTACIÓN.

DOCUMENTO 2:
VET FREEDOM OS — PARTE 2 — ESPECIFICACIÓN DE DESARROLLO AVANZADA.

DOCUMENTO 3:
VET FREEDOM OS — PARTE 3 — ESPECIFICACIÓN FUNCIONAL Y TÉCNICA.

Los tres documentos son complementarios.

Ninguno reemplaza a los anteriores.

La Parte 1 define la plataforma fundamental.

La Parte 2 introduce el motor de agenda inteligente, capacidad, disponibilidad y operaciones avanzadas.

La Parte 3 introduce simulación de decisiones, especialistas, remisiones y continuidad operativa.

### Cobertura acumulada

Parte 1:
112 workflows y 60 pruebas de aceptación.

Parte 2:
56 workflows y 50 pruebas de aceptación.

Parte 3:
56 workflows y 60 pruebas de aceptación.

TOTAL:
224 comportamientos de workflow y 170 escenarios de aceptación.

Esto no significa necesariamente 224 workflows n8n separados. Los comportamientos pueden compartir implementaciones, pero todos deben quedar individualmente registrados y verificables.

Antes de comenzar, comprueba cuáles de los tres documentos están realmente disponibles en el proyecto.

No declares importada una especificación que no puedes leer.

Cuando falte algún archivo, registra ese bloqueo y prepara su incorporación sin inventar los requisitos ausentes.

Conserva los archivos originales como documentos fuente inmutables y crea una especificación consolidada derivada, versionada y trazable.

---

# 2. PROJECT MEMORY OS — OBLIGATORIO

Este sistema debe recordar permanentemente qué hemos solicitado, construido, modificado y probado.

No quiero que Lovable pierda requisitos entre sesiones.

No quiero reconstruir funcionalidades que ya existen.

No quiero que un prompt nuevo elimine funciones de otro anterior.

## 2.1 Estructura de memoria

Crear la carpeta:

/docs/project-memory/

Dentro de ella crear:

README.md

MASTER_SPECIFICATION.md

PROJECT_REQUIREMENTS.md

PROJECT_FEATURES.md

PROJECT_PROMPT_LOG.md

PROJECT_IMPLEMENTATION_LEDGER.md

PROJECT_DECISIONS.md

PROJECT_CHANGELOG.md

PROJECT_DESIGN_SYSTEM.md

PROJECT_ARCHITECTURE.md

PROJECT_ROLES_PERMISSIONS.md

PROJECT_ROUTES.md

PROJECT_DATABASE_PLAN.md

PROJECT_INTEGRATIONS.md

PROJECT_AUTOMATIONS.md

PROJECT_TEST_MATRIX.md

PROJECT_BLOCKERS.md

PROJECT_RELEASES.md

PROJECT_CONTINUATION.md

Crear también los registros estructurados:

requirements-registry.json

features-registry.json

workflows-registry.json

acceptance-tests-registry.json

screens-registry.json

prompts-registry.json

## 2.2 Contenido de cada registro

Cada requisito debe conservar:

- ID original.
- Especificación de origen.
- Sección y descripción.
- Módulo.
- Rol autorizado.
- Pantallas relacionadas.
- Entidades de datos.
- Workflows relacionados.
- Pruebas relacionadas.
- Dependencias.
- Prioridad técnica.
- Estado de implementación.
- Fecha de validación.
- Evidencia.

Cada pantalla debe conservar:

- ID.
- Nombre.
- Rol o roles.
- Ruta.
- Componentes.
- Acciones.
- Estados.
- Datos requeridos.
- Permisos.
- Requisitos relacionados.
- Estado de implementación.
- Pruebas.

Cada cambio debe quedar vinculado a una versión del código.

## 2.3 Historial de prompts

Crear un registro separado para:

PROMPT PREPARADO.

PROMPT RECIBIDO POR LOVABLE.

PROMPT ANALIZADO.

PROMPT IMPLEMENTADO PARCIALMENTE.

PROMPT IMPLEMENTADO.

PROMPT PROBADO.

PROMPT BLOQUEADO.

Distinguir claramente entre esos estados.

No asumir que todos los prompts redactados fuera de Lovable han sido enviados a la plataforma.

Registrar el prompt actual como PROMPT 01, únicamente cuando esté efectivamente presente en el proyecto.

Registrar los prompts anteriores solo si se proporcionan sus textos o evidencia.

No inventar historial.

## 2.4 Memoria automática

Implementar una rutina de mantenimiento del contexto.

Después de cada cambio exitoso:

1. Identificar archivos modificados.
2. Relacionar cambios con requisitos.
3. Actualizar el registro de funcionalidades.
4. Actualizar decisiones vigentes.
5. Registrar pruebas realizadas.
6. Registrar errores o bloqueos.
7. Actualizar el changelog.
8. Actualizar PROJECT_CONTINUATION.md.

Si el entorno no permite ejecutar algún paso automáticamente, indicar cuál falta y mantener un proceso manual verificable.

Nunca afirmar que se guardó información si no se escribió realmente.

## 2.5 Protección de requisitos

Ninguna funcionalidad previamente aprobada puede desaparecer silenciosamente.

Para sustituir o eliminar una capacidad, exigir una decisión explícita.

Registrar:

- Función anterior.
- Función nueva.
- Motivo.
- Impacto.
- Autorización.
- Pruebas de regresión.

---

# 3. IDENTIDAD DEL PRODUCTO

Nombre de la plataforma:

VET FREEDOM OS.

Marca visible para clientes:

Vet Life.

Marca visible para administración:

Vet Freedom OS.

Consultoría estratégica:

Alpha Vision Method.

Idioma principal:

Español colombiano.

Moneda:

COP.

Zona horaria operativa inicial:

America/Bogota.

Dispositivos prioritarios:

iPhone y Android.

Modo escritorio:

Responsive, con interfaces administrativas adecuadas a pantallas grandes.

Propósito central:

Crear una veterinaria que funcione con excelencia operativa, que conozca y cuide a cada cliente, y que reduzca la dependencia cotidiana de Luis mediante procesos, herramientas y responsabilidades claras.

---

# 4. PRINCIPIOS UX/UI INNEGOCIABLES

Quiero una aplicación que compita en calidad visual y facilidad de uso con los mejores productos digitales de consumo.

Debe sentirse:

Premium.

Cálida.

Humana.

Moderna.

Sencilla.

Rápida.

Confiable.

Elegante.

Intuitiva.

La plataforma no debe verse como software administrativo antiguo.

Pero tampoco debe sacrificar legibilidad o eficiencia para verse bonita.

## 4.1 Referencias visuales

Utiliza todas las imágenes de diseño que se adjunten.

Estas referencias ya establecen una dirección visual aprobada:

- Fondos crema e ivory.
- Acentos terracota.
- Verde salvia para estados positivos.
- Tonos blush suaves.
- Tipografía oscura y legible.
- Tarjetas muy redondeadas.
- Fotografías cálidas de mascotas.
- Iconografía sencilla.
- Mucho espacio visual.
- Navegación inferior móvil.
- Interfaces sin saturación.
- Acciones principales fácilmente reconocibles.

No copiar imágenes como fondos de pantalla.

Reconstruir los diseños mediante componentes reales y responsivos.

Usar las imágenes como referencia para el sistema visual, no como sustituto de interfaces funcionales.

Si una referencia no está adjunta en Lovable, documentar su ausencia y no afirmar que se replicó fielmente.

## 4.2 Design tokens iniciales

Definir tokens centralizados, editables y compatibles con contraste accesible.

Paleta inicial sugerida:

Primary Terracotta: #BF5738

Primary Dark: #9F4129

Warm Ivory: #FFF9F4

Cream Surface: #F8F0E8

Soft Blush: #F8E3DA

Sage Surface: #E8EEDB

Sage Dark: #476B35

Text Primary: #34241F

Text Secondary: #766D68

Border: #E8DDD4

White: #FFFFFF

Estos valores son una base de diseño, no una limitación permanente.

Crear variables CSS y tokens semánticos:

background

foreground

primary

primary-foreground

surface

surface-secondary

muted

border

success

warning

danger

info

focus-ring

disabled

## 4.3 Tipografía

Usar una fuente moderna, legible y con personalidad cálida.

Recomiendo una combinación basada en Plus Jakarta Sans o una alternativa compatible y correctamente licenciada.

Definir una escala tipográfica coherente para:

Títulos de página.

Encabezados de sección.

Textos principales.

Datos importantes.

Descripciones.

Etiquetas.

Estados.

Ayudas contextuales.

Evitar textos demasiado pequeños en móvil.

## 4.4 Componentes

Crear componentes reutilizables:

AppShell

MobileBottomNavigation

DesktopSidebar

PageHeader

GreetingHeader

PetAvatar

PetCard

AppointmentCard

VisitCard

StaffCard

MetricCard

ActionCard

StatusBadge

QuickActionGrid

SmartCalendar

ScheduleTimeline

RoutePreview

TaskChecklist

SearchField

FilterChips

FormField

PrimaryButton

SecondaryButton

ConfirmationDialog

ApprovalSheet

NotificationCenter

EmptyState

LoadingSkeleton

ErrorState

OfflineIndicator

SyncStatus

SearchResults

PermissionGate

SectionHeader

FloatingActionPanel

## 4.5 Accesibilidad

Mantener objetivos táctiles cómodos, idealmente de al menos 44 × 44 puntos CSS equivalentes cuando sea posible.

Permitir navegación por teclado.

Aplicar estados de foco visibles.

Utilizar etiquetas semánticas.

No depender exclusivamente del color para comunicar estados.

Permitir movimiento reducido.

Garantizar textos legibles y adaptación a distintos tamaños de pantalla.

---

# 5. ARQUITECTURA FRONTEND

Utilizar:

React.

TypeScript estricto.

Tailwind CSS.

shadcn/ui cuando sea apropiado.

React Router o el sistema de enrutamiento existente, sin crear duplicados.

TanStack Query para datos remotos.

React Hook Form.

Zod para validación.

Lucide Icons.

Componentes modulares y reutilizables.

## Estructura sugerida

/src

/components

/components/ui

/components/layout

/components/pets

/components/appointments

/components/staff

/components/scheduling

/components/routes

/components/referrals

/components/simulator

/components/finance

/components/assistant

/components/project-memory

/features

/features/client

/features/veterinarian

/features/assistant-role

/features/coordinator

/features/executive

/features/admin

/features/customer-memory

/features/calendar

/features/specialists

/features/simulator

/features/inventory

/features/finance

/features/academy

/features/integrations

/hooks

/lib

/services

/types

/config

/routes

/styles

/tests

Evitar componentes monolíticos gigantes.

Evitar lógica empresarial directamente mezclada dentro de componentes visuales.

Construir adaptadores de datos para poder conectar las pantallas a Supabase sin rediseñarlas.

---

# 6. UNA APLICACIÓN, EXPERIENCIAS DIFERENTES

La aplicación deberá contemplar los 11 roles definidos en la Parte 1.

No crear aplicaciones completamente independientes para cada rol.

Crear un sistema de navegación y permisos adaptado a cada perfil:

1. Propietario o cliente.
2. Cuidador autorizado.
3. Veterinario.
4. Auxiliar.
5. Coordinador.
6. Recepción.
7. Finanzas.
8. Administrador.
9. Luis / Dirección.
10. Soporte técnico.
11. Consultor Alpha Vision.

Preparar también el acceso limitado para especialistas externos de la Parte 3, sujeto a los permisos expresamente autorizados.

## Navegación por rol

### Cliente

Inicio.

Mascotas.

Agenda.

Perfil.

Las funciones de pagos, documentos, remisiones, notificaciones y contacto con Vet Life estarán accesibles mediante navegación secundaria y contextual.

### Veterinario

Hoy.

Ruta.

Tareas.

Perfil.

Acceso contextual a pacientes, visitas, tratamientos, remisiones y formación.

### Coordinador

Bandeja.

Agenda.

Equipo.

Más.

Acceso contextual a rutas, simulaciones, remisiones, disponibilidad y operaciones.

### Luis

Inicio.

Agenda.

Equipo.

Asistente.

El centro de decisiones, especialistas, finanzas e indicadores avanzados estará disponible sin saturar la barra inferior.

### Administrador

Navegación móvil simplificada y sidebar de escritorio con agrupaciones por área.

No mostrar todas las funciones en una sola pantalla.

### Otros roles

Crear una configuración de navegación basada en permisos, evitando duplicar componentes.

Los menús deben representar accesos autorizados, no otorgar privilegios por sí mismos.

---

# 7. PANTALLAS INICIALES — CLIENTE

Construir primero las pantallas y sus rutas visuales.

## CLIENT-001 — Inicio

Diseño basado en la referencia \"Hola, Carolina\".

Componentes:

Saludo personalizado.

Próxima visita.

Mis mascotas.

Reservar visita.

WhatsApp.

Vacunas.

Pagos.

Recordatorios.

Navegación inferior.

Estados vacío, cargando y error.

## CLIENT-002 — Mis mascotas

Listado visual de mascotas autorizadas.

Fotografía.

Nombre.

Especie.

Edad.

Acceso al perfil.

Acción para agregar mascota cuando esté permitida.

## CLIENT-003 — Perfil de mascota

Diseño inspirado en la pantalla de Luna.

Foto principal.

Datos generales.

Estados sanitarios verificados.

Próxima cita.

Historial autorizado.

Recordatorios.

Documentos.

Acciones rápidas.

## CLIENT-004 — Mi agenda

Listado de citas.

Estado real.

Fecha.

Profesional.

Ubicación.

Reprogramación solicitada.

Historial.

## CLIENT-005 — Reservar visita

Flujo guiado y sencillo.

Mascota.

Servicio.

Dirección.

Fecha deseada.

Preferencias.

Datos faltantes.

Revisión.

Enviar solicitud.

No mostrar \"Cita confirmada\" cuando solo se ha creado una solicitud.

## CLIENT-006 — Pagos

Saldo verificado.

Movimientos.

Comprobantes.

Métodos disponibles.

Estados.

La interfaz puede preparar acciones de pago, pero no declarar una pasarela operativa hasta verificarla.

## CLIENT-007 — Perfil familiar

Propietario.

Contactos.

Direcciones.

Cuidadores.

Preferencias.

Consentimientos.

Notificaciones.

Privacidad.

## CLIENT-008 — Remisiones y especialistas

Mostrar solamente la información apropiada para el cliente.

Solicitud.

Opciones disponibles.

Horario seleccionado.

Confirmación real.

Instrucciones.

Seguimiento.

Sin exponer información clínica no autorizada.

## CLIENT-009 — Notificaciones

Citas.

Cambios.

Recordatorios.

Solicitudes pendientes.

Alertas informativas.

## CLIENT-010 — Ayuda y contacto

WhatsApp.

Preguntas frecuentes.

Solicitudes.

Atención humana.

---

# 8. PANTALLAS INICIALES — EQUIPO

## STAFF-001 — Mi jornada

Diseño basado en la pantalla \"Mi jornada\".

Mostrar:

Visitas de hoy.

Próxima visita.

Acciones rápidas.

Ruta.

Checklist.

Tareas.

Alertas relevantes.

## STAFF-002 — Ruta

Mapa o representación operativa.

Paradas.

Orden.

Horas.

Próxima visita.

Navegación externa.

Estados.

## STAFF-003 — Detalle de visita

Mascota.

Propietario.

Servicio.

Ubicación.

Preparación.

Llegada.

Inicio.

Incidencia.

Finalización.

Registro de servicio.

Registro de cobro cuando el rol esté autorizado.

## STAFF-004 — Tareas

Pendientes.

Asignadas.

Completadas.

Vencidas.

Compromisos posteriores.

## STAFF-005 — Tratamientos recurrentes

Plan profesional aprobado.

Visitas programadas.

Restricciones.

Estado.

Recursos necesarios.

## STAFF-006 — Inventario y kits

Elementos asignados.

Disponibilidad.

Faltantes.

Movimientos autorizados.

## STAFF-007 — Remisiones

Crear o consultar remisiones según permisos.

Ver aprobaciones.

Consultar estados.

Registrar compromisos.

## STAFF-008 — Formación

Cursos asignados.

Procedimientos.

Evaluaciones.

Progreso.

## STAFF-009 — Perfil laboral

Disponibilidad.

Turnos.

Competencias.

Preferencias permitidas.

---

# 9. PANTALLAS INICIALES — COORDINACIÓN

## COORD-001 — Centro de coordinación

Diseño basado en la pantalla \"Coordinación\".

Mostrar:

Solicitudes nuevas.

Citas pendientes de OKVET.

Equipo disponible.

Ausencias.

Visitas retrasadas.

Operaciones rápidas.

Incidencias.

Rutas.

## COORD-002 — Bandeja de solicitudes

Filtros.

Búsqueda.

Estado.

Responsable.

Antigüedad.

Cliente.

Mascota.

Acciones autorizadas.

## COORD-003 — Agenda inteligente

Vista de día.

Vista de semana.

Filtros por profesional.

Estados.

Disponibilidad.

Conflictos.

Quick Booking.

## COORD-004 — Nueva cita rápida

Diseño basado en la referencia aprobada.

Buscar por nombre o teléfono.

Elegir mascota.

Servicio.

Zona.

Fecha.

Profesional.

Consultar opciones.

Crear solicitud.

Crear bloqueo provisional autorizado.

## COORD-005 — Equipo

Directorio.

Estados.

Disponibilidad.

Asignaciones.

Turnos.

Ausencias.

Cobertura.

## COORD-006 — Rutas

Mapa.

Profesionales.

Visitas.

Conflictos.

Propuestas de optimización.

Aprobaciones.

## COORD-007 — Simulador inteligente

Pantalla \"Resolver problemas de agenda\".

Seleccionar situación.

Simular.

Comparar escenarios.

Visualizar antes y después.

Guardar borrador.

Solicitar aprobación.

No modificar citas reales al simular.

## COORD-008 — Remisiones por resolver

Solicitudes.

Especialistas.

Disponibilidad.

Cliente pendiente.

Confirmación externa.

Documentación.

Informe pendiente.

Seguimiento.

## COORD-009 — Directorio de especialistas

Profesionales verificados.

Especialidades.

Ubicación.

Contacto.

Disponibilidad informada.

Estado de actualización.

## COORD-010 — Centro de incidencias

Problemas de agenda.

Ausencias.

Retrasos.

Conflictos.

Solicitudes sin responsable.

Tareas vencidas.

---

# 10. PANTALLAS INICIALES — LUIS

## EXEC-001 — Dashboard de dirección

Diseño basado en la referencia \"Hola, Luis\".

Mostrar:

Resumen de hoy.

Visitas.

Solicitudes.

Alertas.

Índice de autonomía calculado.

Requiere tu revisión.

Acciones rápidas.

Cobros verificados.

## EXEC-002 — Mi asistente

Diseño de conversación premium.

Mensajes.

Sugerencias contextuales.

Consultas.

Propuestas.

Aprobaciones.

Historial de acciones.

Estados de ejecución.

En esta fase, construir la interfaz y los contratos de interacción.

No fingir respuestas conectadas a datos reales.

## EXEC-003 — Decisiones y especialistas

Problemas de agenda.

Simulaciones.

Remisiones.

Horarios recibidos.

Citas de especialistas.

Informes pendientes.

Aprobaciones.

Compromisos.

## EXEC-004 — Indicadores empresariales

Ingresos.

Cobros.

Costos.

Visitas.

Capacidad.

Tiempos administrativos.

Autonomía.

Calidad de atención.

## EXEC-005 — Modo ausencia

Planificación.

Delegación.

Responsables.

Alertas críticas.

Seguimiento.

---

# 11. RESTO DE PANTALLAS Y MÓDULOS

Registrar desde ahora las pantallas requeridas para:

Customer Experience Memory.

WhatsApp y conversaciones.

Finanzas.

Inventario.

Calidad.

Fidelización.

Vet Life Academy.

Administrador de integraciones.

Centro OKVET.

Centro de salud del sistema.

Configuración empresarial.

Gestión de roles.

Centro de notificaciones.

Aprobaciones.

Auditoría.

Project Memory OS.

No eliminar estos módulos del mapa de navegación aunque su implementación profunda corresponda a fases posteriores.

No es necesario diseñar todas sus vistas complejas en una sola ejecución si eso compromete la calidad.

Sin embargo, cada pantalla requerida debe figurar en el SCREEN REGISTRY con su objetivo, ruta, rol y fase de desarrollo.

---

# 12. NAVEGACIÓN REAL

Cada pantalla construida deberá tener una ruta definida.

Utilizar navegación funcional.

No crear botones que aparenten funcionar pero no hagan nada.

Si una acción todavía depende de Supabase o una integración futura, mostrar un estado explícito de funcionalidad pendiente, o implementar un flujo local de prototipo claramente identificado.

Nunca representar una confirmación, cobro, mensaje enviado o modificación clínica como operación real en modo de demostración.

## Estados obligatorios

Vacío.

Cargando.

Error.

Sin permisos.

Datos no disponibles.

Pendiente de conexión.

Desactualizado.

Confirmado.

Acción pendiente de aprobación.

## Demo controlada

Para revisar las pantallas sin datos reales, se permite un modo de diseño con fixtures sintéticos.

Toda información de ejemplo deberá estar identificada como DEMO.

Los fixtures nunca deben confundirse con registros de clientes reales.

El modo de demostración no podrá activar mensajes, pagos, reservas oficiales ni cambios sobre datos de producción.

---

# 13. SISTEMA DE DISEÑO RESPONSIVE

Construir tres experiencias coherentes:

MOBILE — 360 a 430 píxeles como referencia inicial.

TABLET — Adaptación intermedia.

DESKTOP — Interfaz administrativa ampliada.

En escritorio, no limitarse a estirar las tarjetas del móvil.

Crear composiciones adecuadas para agendas, comparaciones, tablas, mapas, bandejas y paneles de control.

Mantener una única biblioteca de componentes.

Los diseños deben conservar identidad visual en todos los dispositivos.

---

# 14. INTERACCIONES Y MICROANIMACIONES

Quiero una experiencia visual memorable pero sin excesos.

Aplicar:

Transiciones suaves.

Estados activos.

Feedback al tocar.

Skeleton loading.

Confirmaciones claras.

Animaciones discretas entre pantallas cuando sean apropiadas.

Bottom sheets para acciones móviles.

Filtros animados sin afectar rendimiento.

Navegación fluida.

Indicadores de carga.

Evitar animaciones que bloqueen una acción.

Respetar preferencias de accesibilidad.

---

# 15. SEGURIDAD Y PRIVACIDAD DESDE EL DISEÑO

Aunque este primer prompt prioriza frontend, debes preparar la arquitectura correcta.

No usar claves privadas en componentes de cliente.

No colocar datos clínicos privados en archivos públicos.

No asumir que ocultar un botón es seguridad suficiente.

Diseñar las vistas para recibir datos autorizados mediante servicios.

Preparar guards de rutas.

Preparar contratos de autorización.

Preparar separaciones entre información administrativa y clínica.

OKVET seguirá siendo el sistema clínico oficial.

Las citas requieren confirmación por procedimientos oficialmente permitidos.

No crear endpoints ficticios que aparenten una conexión real con OKVET.

---

# 16. ARQUITECTURA DE DATOS PREPARADA PARA SUPABASE

Define interfaces TypeScript para las entidades principales de las tres especificaciones.

Crear servicios y adaptadores.

Diferenciar claramente:

Datos de demostración.

Datos persistidos.

Datos sincronizados.

Datos pendientes de validación.

Datos oficiales externos.

No crear varias fuentes de verdad contradictorias.

No introducir bases de datos temporales incompatibles con Supabase.

Documentar las migraciones necesarias para PROMPT 02.

No realizar cambios destructivos sobre una base existente.

---

# 17. MAPA DE INTEGRACIONES

Crear un registro de dependencias para:

Supabase.

n8n.

WhatsApp Business Platform.

Google Calendar.

Google Maps.

Waze.

OKVET.

Proveedor de inteligencia artificial.

Servicio de correo si es necesario.

Pasarela de pago cuando se defina.

GitHub.

Monitoreo y respaldos.

Cada integración debe mostrar:

NO CONFIGURADA.

PREPARADA.

CONECTADA.

EN PRUEBAS.

VERIFICADA.

ERROR.

No indicar CONECTADA o VERIFICADA sin evidencia real.

---

# 18. CALIDAD Y PRUEBAS DEL FRONTEND

Implementar y ejecutar pruebas apropiadas para las interfaces creadas.

Validar:

Navegación.

Rutas.

Pantallas por rol.

Responsive.

Accesibilidad básica.

Formularios.

Estados vacíos.

Mensajes de error.

Renderizado.

Componentes.

Compatibilidad móvil.

Ausencia de errores de TypeScript.

Ausencia de errores críticos de consola.

No declarar que las 170 pruebas de aceptación están superadas durante este primer prompt.

Registrar las que realmente se ejecutaron y reservar las restantes para sus módulos.

---

# 19. ENTREGABLES DEL PROMPT 01

Al finalizar esta primera etapa deben existir:

1. Proyecto React/TypeScript estructurado.
2. Sistema de diseño premium.
3. Tokens visuales centralizados.
4. Componentes reutilizables.
5. Navegación por rol.
6. Pantallas principales de cliente.
7. Pantallas principales de veterinario.
8. Pantallas principales de coordinación.
9. Pantallas principales de Luis.
10. Estructura para otros perfiles.
11. Registro completo de pantallas requeridas.
12. Registro completo de requisitos importados.
13. Registro de los 224 comportamientos de workflow.
14. Registro de las 170 pruebas de aceptación.
15. Historial de prompts.
16. Implementation Ledger.
17. Project Continuation.
18. Inventario de integraciones.
19. Arquitectura preparada para Supabase.
20. Evidencia de las pruebas efectivamente ejecutadas.

Cuando no sea posible completar un entregable por falta de información, documentar el bloqueo y no inventar el resultado.

---

# 20. DEFINICIÓN DE TERMINADO

Este prompt estará completo solamente si:

El proyecto compila.

La navegación principal funciona.

Las pantallas entregadas se pueden visualizar.

El diseño es consistente.

El layout funciona en móvil y escritorio.

Los roles tienen sus estructuras apropiadas.

Los requisitos quedan registrados.

La memoria persistente existe en archivos reales.

Las dependencias futuras están documentadas.

Los componentes son reutilizables.

No existen errores críticos conocidos que se oculten.

Las pruebas correspondientes a esta etapa están ejecutadas y registradas.

---

# 21. REGISTRO FINAL Y CONTINUIDAD

Al terminar, actualiza:

PROJECT_IMPLEMENTATION_LEDGER.md

PROJECT_PROMPT_LOG.md

PROJECT_FEATURES.md

PROJECT_TEST_MATRIX.md

PROJECT_CONTINUATION.md

Quiero que muestres un resumen final breve de:

QUÉ SE CONSTRUYÓ.

QUÉ SE PROBÓ.

QUÉ QUEDA PENDIENTE.

QUÉ INTEGRACIONES NO ESTÁN CONECTADAS.

QUÉ REQUISITOS SIGUEN SIN IMPLEMENTAR.

CUÁL ES LA SIGUIENTE FASE.

Si el trabajo del prompt requiere varias ejecuciones de Lovable, continúa a partir del último estado persistido y no reconstruyas desde cero.

El siguiente prompt esperado será:

PROMPT 02 — SUPABASE, AUTHENTICATION, DATABASE FOUNDATION & SECURITY.

No comiences PROMPT 02 ni declares preparadas las conexiones reales sin haber completado o documentado los requisitos de esta primera etapa.

---

# INSTRUCCIÓN FINAL

Comienza inspeccionando los archivos reales existentes del proyecto.

Si el proyecto está vacío, crea la arquitectura desde cero.

Si ya existe código, consérvalo y mejóralo sin duplicar módulos.

Primero consolida la memoria y trazabilidad.

Después crea el sistema visual.

Luego implementa navegación y pantallas.

Finalmente ejecuta las pruebas correspondientes, registra evidencias y actualiza la documentación.

Construye una experiencia visualmente extraordinaria, pero siempre diseñada alrededor de lo que los usuarios realmente necesitan hacer.

Nuestra prioridad es que Vet Life sea la aplicación más sencilla de usar posible, incluso cuando detrás exista una arquitectura empresarial avanzada.

**VET FREEDOM OS**
Vet Life — Veterinaria a Domicilio.
Dr. Luis Eduardo Ríos.
Alpha Vision Method.

Despierta. Elige. Construye.