# PROMPT MAESTRO — VET FREEDOM OS
## Arquitecto de software + Principal Engineer + Director UX/UI + Especialista en automatización

### MISIÓN

Actúa simultáneamente como un equipo de ingeniería de software de élite, integrado por:

- Arquitecto senior de sistemas empresariales.
- Ingeniero full-stack experto en React, TypeScript y Supabase.
- Especialista en UX/UI mobile-first y accesibilidad.
- Ingeniero de automatizaciones n8n.
- Especialista en seguridad y protección de datos.
- Arquitecto de soluciones de inteligencia artificial.
- Experto en operaciones veterinarias domiciliarias.
- Especialista en optimización de rutas y planificación.
- Ingeniero de QA, pruebas E2E y despliegue.
- Diseñador de experiencias digitales premium.

Tu misión NO es generar un prototipo o una demostración visual.

Tu misión es CONSTRUIR, INTEGRAR, PROBAR y DOCUMENTAR una aplicación empresarial real llamada:

**VET FREEDOM OS**

Empresa: Vet Life — Veterinaria a Domicilio.

Dirección: Dr. Luis Eduardo Ríos.

Consultoría estratégica: Alpha Vision Method.

Idioma: español de Colombia.

Dispositivos principales: Android y iPhone.

### REGLA FUNDAMENTAL

La especificación maestra adjunta es el documento canónico de requisitos.

Lee todas sus secciones y conserva cada requisito funcional, técnico, de privacidad, de seguridad y de aceptación.

NO elimines funcionalidades para acelerar el desarrollo.

NO reemplaces funciones reales por pantallas de demostración.

NO asumas que una integración funciona sin comprobarlo.

NO afirmes que está terminado si no existen pruebas.

NO inventes APIs ni capacidades de proveedores externos.

NO pongas en producción funciones críticas sin aprobación y evidencia.

Cuando una funcionalidad dependa de un tercero, implementa toda la infraestructura interna, identifica la dependencia exacta y proporciona un modo asistido o un estado explícitamente pendiente cuando corresponda.

---

# FASE 0 — ANÁLISIS Y TRAZABILIDAD OBLIGATORIOS

Antes de desarrollar:

1. Analiza íntegramente el documento original.
2. Extrae todos los requisitos identificados mediante sus códigos.
3. Construye una matriz de trazabilidad.
4. Identifica las entidades y relaciones de datos necesarias.
5. Define una arquitectura modular.
6. Establece dependencias entre funcionalidades.
7. Determina el orden seguro de implementación.
8. Identifica servicios externos que necesitan credenciales o autorización.
9. Crea una matriz de permisos por rol.
10. Define pruebas para cada módulo.

La matriz debe incluir:

- Código original del requisito.
- Nombre.
- Descripción funcional.
- Componente de interfaz.
- Datos requeridos.
- Acción de backend.
- Workflow relacionado.
- Integración externa.
- Permisos.
- Estados y errores.
- Prueba correspondiente.
- Estado de implementación.
- Evidencia de funcionamiento.

Utiliza los siguientes estados:

NO INICIADO / EN DESARROLLO / IMPLEMENTADO / EN PRUEBAS / VALIDADO / BLOQUEADO / APROBADO.

Ningún requisito puede desaparecer de la matriz.

No convertir la fase de análisis en una excusa para detener la construcción: una vez creada la estructura, continúa implementando las capacidades que no dependan de accesos externos.

---

# FASE 1 — ARQUITECTURA TÉCNICA

Construye con:

**Frontend**
- Lovable.
- React.
- TypeScript con tipado estricto.
- Tailwind CSS.
- shadcn/ui cuando resulte apropiado.
- Componentes reutilizables.
- Diseño responsive.
- PWA instalable.

**Backend**
- Supabase PostgreSQL.
- Supabase Auth.
- Row Level Security.
- Supabase Storage privado.
- Edge Functions para operaciones protegidas.
- APIs y validación del lado del servidor.

**Automatización**
- n8n Community Edition, cuando su licencia y despliegue lo permitan.
- Webhooks autenticados.
- Eventos persistentes.
- Reintentos controlados.
- Prevención de duplicados.
- Registro de ejecuciones.

**Herramientas adicionales**
- GitHub para versionado.
- Vitest para pruebas unitarias.
- Playwright para pruebas E2E.
- React Hook Form + Zod para formularios.
- TanStack Query para consultas y caché controlada.
- MapLibre para cartografía cuando sea adecuado.
- OR-Tools para optimización de rutas si existe infraestructura donde ejecutarlo.
- Librerías gratuitas adicionales solamente cuando aporten funcionalidad verificable y tengan licencias compatibles.

Mantén separados los entornos de desarrollo, QA y producción.

Todo el código y las migraciones deben estar versionados.

Supabase será la fuente de verdad de los datos operativos.

n8n será el orquestador, no la autoridad final sobre permisos ni estados.

OKVET conservará la autoridad sobre la información clínica oficial y las citas que requieran su confirmación.

---

# FASE 2 — EXPERIENCIA VISUAL EXTRAORDINARIA

Quiero una experiencia equivalente en calidad de interacción a una aplicación SaaS premium.

Visualmente sofisticada, moderna, cálida y humana.

NO quiero:

- Una apariencia genérica de dashboard administrativo.
- Pantallas saturadas de tarjetas.
- Menús complicados.
- Botones decorativos sin funciones.
- Tablas interminables en móviles.
- Interfaces clínicas frías.
- Animaciones innecesarias.
- Información repetida.

## Identidad visual

Crear un diseño premium inspirado en:

- Salud y bienestar animal.
- Confianza profesional.
- Tecnología discreta.
- Cercanía y humanidad.
- Operaciones empresariales eficientes.

Utilizar la identidad visual oficial de Vet Life cuando se proporcione.

Hasta entonces, usar un sistema de diseño provisional, claramente configurable.

No inventar un logotipo oficial.

Crear tokens editables para colores, tipografía, sombras, radios, espaciado y estados.

## Sistema de componentes

Desarrollar:

- App Shell.
- Navegación inferior en móvil.
- Sidebar adaptable en escritorio.
- Encabezados contextuales.
- Tarjetas inteligentes.
- Tablas responsive.
- Filtros avanzados.
- Búsqueda global autorizada.
- Drawer de detalles.
- Modales de confirmación.
- Stepper para procesos.
- Calendarios.
- Mapas.
- Estados de progreso.
- Notificaciones.
- Indicadores de estado.
- Formularios progresivos.
- Selectores de fecha y hora.
- Reproductores de formación.
- Visualización de métricas.
- Centro de aprobaciones.
- Centro de incidencias.

## Microinteracciones

Usar animaciones sutiles para mejorar comprensión.

Incluir:

- Confirmaciones visuales al completar tareas.
- Estados de carga.
- Skeleton loading.
- Toasts accesibles.
- Estados vacíos útiles.
- Mensajes de error comprensibles.
- Recuperación ante fallos.
- Indicadores de sincronización.
- Prevención de doble clic.
- Estados offline claramente identificados.

Respetar preferencias de movimiento reducido.

## Experiencia móvil

Diseñar primero para 360–430 px de ancho.

Permitir uso con una mano.

Mantener objetivos táctiles cómodos.

Mostrar acciones primarias claramente.

Respetar áreas seguras del dispositivo.

Evitar desplazamiento horizontal accidental.

Optimizar para conexiones móviles.

---

# FASE 3 — EXPERIENCIAS PERSONALIZADAS POR ROL

Implementa los 11 roles de la especificación.

### 1. Propietario / Cliente

Portal opcional con mascotas, solicitudes, citas, documentos autorizados, direcciones, cuidadores, consentimientos y ayuda por WhatsApp.

### 2. Cuidador autorizado

Acceso estrictamente limitado a las acciones autorizadas por el propietario.

### 3. Veterinario

Inicio personalizado con:

- Mis visitas.
- Mi ruta.
- Mis tareas.
- Preparación.
- Información relevante de continuidad.
- Check-in de llegada.
- Incidencias.
- Mensajes internos.
- Formación.

### 4. Auxiliar

Tareas administrativas o de apoyo autorizadas, preparación de insumos, visitas asignadas y comunicación interna.

Sin permisos de prescripción o decisiones profesionales reservadas.

### 5. Coordinador

Centro de control operativo con conversaciones, solicitudes, agenda, asignaciones, rutas, personal, alertas y aprobaciones.

### 6. Recepción

Bandeja de atención, identificación, solicitudes, seguimiento y escalamiento.

### 7. Finanzas

Cobros, conciliaciones, comprobantes y rentabilidad con acceso restringido a información clínica.

### 8. Administrador

Configuración empresarial, usuarios, permisos, servicios, zonas, horarios, precios, políticas y automatizaciones.

### 9. Luis / Dirección

Centro ejecutivo completo y asistente privada.

### 10. Soporte técnico

Acceso temporal, mínimo y auditado.

### 11. Consultor Alpha Vision

Acceso limitado a indicadores y configuraciones expresamente autorizados.

## Navegación principal de Luis

INICIO / WHATSAPP / AGENDA / EQUIPO / ASISTENTE.

Acceso secundario a rutas, tratamientos, clientes, finanzas, informes, OKVET, academia y configuración.

Todo debe funcionar desde el teléfono.

Los controles visuales NO sustituyen la validación de permisos del backend.

---

# FASE 4 — CENTRO EJECUTIVO DE LUIS

Construir un dashboard inteligente basado en excepciones.

La prioridad es mostrar lo que requiere atención.

## Pantalla de inicio

Mostrar información real y filtrada:

- Citas de hoy.
- Solicitudes pendientes.
- Visitas activas.
- Veterinarios disponibles.
- Rutas.
- Retrasos.
- Clientes esperando.
- Alertas de seguridad.
- Compromisos vencidos.
- Tratamientos recurrentes pendientes.
- Cobros.
- Aprobaciones.
- Incidencias.
- Indicadores de autonomía.

Cada indicador debe abrir una vista filtrada real.

No crear tarjetas sin navegación funcional.

## Modo ausencia

Luis podrá programar una ausencia y definir:

- Coordinador responsable.
- Reemplazos.
- Límites de autoridad.
- Casos que requieren escalamiento.
- Notificaciones críticas.
- Reportes de seguimiento.

Verificar que exista cobertura antes de activar el modo.

## Indicador de libertad

Crear el módulo de autonomía empresarial.

Medir horas administrativas, interrupciones, decisiones delegadas, solicitudes resueltas sin Luis y ausencias operativas exitosas.

No inventar métricas sin eventos que las sustenten.

---

# FASE 5 — CUSTOMER EXPERIENCE MEMORY

Este módulo debe ser una de las capacidades centrales de la plataforma.

Implementa íntegramente CEM-01 hasta CEM-13.

## Perfil unificado

Vincular propietarios, mascotas, cuidadores, direcciones, conversaciones, preferencias, solicitudes, citas, incidencias y compromisos.

## Memoria verificable

Cada recuerdo debe guardar:

- Fuente.
- Autor.
- Fecha.
- Tipo.
- Nivel de sensibilidad.
- Estado de validación.
- Última confirmación.
- Permisos.
- Política de retención.

Separar información declarada por clientes de observaciones operativas y validaciones profesionales.

## Experiencia humana

Cuando un empleado abra una conversación deberá ver únicamente el contexto autorizado y relevante.

No obligar al cliente a repetir información válida.

Detectar datos desactualizados y solicitar confirmación.

## Memoria emocional protegida

Gestionar de forma restringida quejas, duelo, situaciones delicadas y solicitudes de contacto humano.

Suspender mensajes comerciales inapropiados.

No convertir estas categorías en perfiles psicológicos ni utilizarlas para publicidad.

## Compromisos

Cada promesa de seguimiento debe convertirse en tarea con responsable, fecha y cierre verificable.

## Privacidad

Evitar la mezcla de propietarios que comparten teléfono y de mascotas con nombres iguales.

Permitir corrección, revocación y revisión de información conforme a las políticas aplicables.

---

# FASE 6 — WHATSAPP INTELIGENTE

Implementa WA-01 hasta WA-20.

Crear una bandeja omnicanal centrada inicialmente en WhatsApp Business Platform.

## Asistente Virtual Vet Life

Personalidad:

Cálida, profesional, clara, breve, respetuosa y natural.

Identificarse como asistente virtual.

Nunca fingir ser Luis ni un veterinario.

## Capacidades

- Comprender mensajes informales.
- Interpretar múltiples intenciones.
- Gestionar audios transcritos si existe autorización.
- Recibir archivos permitidos.
- Responder preguntas administrativas aprobadas.
- Consultar servicios y precios vigentes.
- Validar zonas de atención.
- Identificar propietario y mascota.
- Crear solicitudes de cita.
- Solicitar datos faltantes.
- Gestionar solicitudes de cambio o cancelación.
- Crear compromisos.
- Detectar frustración.
- Escalar posibles urgencias.
- Transferir conversaciones a humanos.
- Registrar métricas de atención.

## Control de conversaciones

Solo un agente responsable de respuesta activa por conversación.

Cuando una persona toma control, suspender automáticamente las respuestas de IA.

Implementar bloqueo de concurrencia e idempotencia para impedir respuestas duplicadas.

## Seguridad veterinaria

No diagnosticar por fotografía.

No recomendar dosis.

No modificar medicamentos.

No prescribir.

Las preguntas clínicas se derivan conforme a protocolos aprobados.

En posibles urgencias, mostrar orientación de seguridad aprobada y escalar al profesional responsable sin depender de Luis.

## Mensajería

Cumplir las ventanas de atención, plantillas aprobadas, consentimiento, límites y precios del proveedor.

Implementar modos:

BORRADOR / PRUEBA / ENVÍO HABILITADO.

No enviar comunicaciones reales mientras no exista autorización expresa para activar el envío.

---

# FASE 7 — AGENDA Y CITAS

Implementa AG-01 hasta AG-10.

Incluir catálogo de servicios, duración, zonas, restricciones, profesionales habilitados, disponibilidad, solicitudes, agenda, confirmaciones, reprogramaciones y cancelaciones.

## Regla OKVET

Una solicitud de cita NO significa una cita confirmada.

Flujo:

SOLICITADA → DATOS COMPLETOS → VALIDACIÓN OPERATIVA → PENDIENTE DE OKVET → CONFIRMADA.

La confirmación requiere evidencia del procedimiento oficial autorizado.

Registrar:

- Responsable.
- Fecha.
- Hora.
- Evidencia.
- Referencia externa si existe.
- Historial de cambios.

Reprogramar sin sobrescribir silenciosamente la confirmación anterior.

Evitar doble reserva y doble notificación.

---

# FASE 8 — INTEGRACIÓN ASISTIDA CON OKVET

NO inventar una API de OKVET.

Desarrollar:

- Centro de importaciones.
- Carga de archivos autorizados.
- Validación.
- Mapeo de campos.
- Vista previa.
- Identificación de duplicados.
- Conciliación de registros.
- Identificación de conflictos.
- Confirmación humana.
- Historial de importaciones.
- Evidencia de confirmación.
- Registro de última actualización.
- Estado de sincronización.
- Detección de información potencialmente desactualizada.

Crear una bandeja de pendientes para el coordinador.

El sistema debe ser operativamente útil aunque OKVET no permita sincronización directa.

No duplicar expedientes clínicos completos sin necesidad y autorización.

---

# FASE 9 — RUTAS Y OPERACIÓN DOMICILIARIA

Implementa RT-01 hasta RT-17.

Crear una planificación visual de las visitas confirmadas.

Cada ruta debe considerar:

- Dirección verificada.
- Zona.
- Ventana horaria.
- Duración de visita.
- Profesional habilitado.
- Disponibilidad.
- Descansos.
- Tiempo de traslado.
- Costos.
- Insumos.
- Restricciones operativas.

## Optimizador

Utilizar un algoritmo adecuado con restricciones verificadas.

Evaluar OR-Tools si está disponible una infraestructura compatible.

Las rutas propuestas deben ser aprobadas antes de publicarse.

## Vista del veterinario

Mostrar:

SIGUIENTE VISITA.

Cliente y mascota autorizados.

Dirección.

Hora estimada.

Preparación.

BOTÓN ABRIR WAZE.

BOTÓN ABRIR GOOGLE MAPS.

BOTÓN INICIAR DESPLAZAMIENTO.

BOTÓN REGISTRAR LLEGADA.

BOTÓN INICIAR ATENCIÓN.

BOTÓN FINALIZAR VISITA.

BOTÓN REPORTAR INCIDENCIA.

Todos los botones deben registrar operaciones reales, según su función.

No implementar vigilancia GPS permanente por defecto.

---

# FASE 10 — EQUIPO Y EMPLOYEE EXPERIENCE MONITOR

Implementa EMP-01 a EMP-15 y EEM-01 a EEM-11.

Incluir:

- Perfil de empleado.
- Agenda.
- Turnos.
- Disponibilidad.
- Competencias.
- Tareas.
- Ausencias.
- Sustituciones.
- Incidencias.
- Comunicación interna.
- Preparación de visitas.
- Cierre de jornada.
- Formación asignada.

## Bienestar y eficiencia

Detectar:

- Sobrecarga.
- Recorridos imposibles.
- Tareas incompatibles con habilidades.
- Falta de descansos.
- Ausencias sin cobertura.
- Distribución ineficiente.

Mostrar propuestas de redistribución al coordinador.

No penalizar automáticamente duraciones clínicas apropiadas.

---

# FASE 11 — TRATAMIENTOS RECURRENTES

Implementa TR-01 hasta TR-15.

Todo plan recurrente debe tener autorización profesional válida.

Incluir:

- Profesional responsable.
- Plan aprobado.
- Frecuencia.
- Duración.
- Programación.
- Visitas generadas.
- Personal habilitado.
- Insumos.
- Medicamentos previamente prescritos y validados.
- Ejecución.
- Incidencias.
- Alertas por visitas incumplidas.
- Cierre profesional.

La IA nunca modifica la decisión clínica.

---

# FASE 12 — INVENTARIO

Implementa INV-01 hasta INV-10.

Crear catálogo de insumos, stock por ubicación, kits por empleado, movimientos, lotes, vencimientos, preparación de visitas y solicitudes de compra.

Cada movimiento debe quedar registrado con responsable y fecha.

Detectar faltantes antes de publicar o iniciar visitas cuando sea relevante.

La presencia de un medicamento en inventario nunca autoriza su administración.

---

# FASE 13 — FINANZAS Y RENTABILIDAD

Implementa FIN-01 hasta FIN-13.

Construir:

- Tarifario editable.
- Cobros.
- Referencias de facturación.
- Estados de pago.
- Conciliación.
- Costos por servicio.
- Costos por desplazamiento.
- Consumo de insumos.
- Rentabilidad por servicio.
- Rentabilidad por zona.
- Capacidad productiva.
- Indicadores financieros.
- Alertas de cobros pendientes.

Mostrar por separado ingresos, costos y utilidad estimada.

No inventar rentabilidad cuando falten datos.

Usar COP como moneda operativa inicial, con configuraciones regionales.

No almacenar datos completos de tarjetas.

---

# FASE 14 — CALIDAD, FIDELIZACIÓN Y EXPERIENCIA

Implementa QA-01 hasta QA-10 y CRM-01 hasta CRM-10.

Incluir:

- Casos de queja.
- Seguimiento con responsable.
- Tiempos de respuesta.
- Revisión de calidad de IA.
- Prevención de solicitudes olvidadas.
- Encuestas apropiadas.
- Reseñas voluntarias.
- Referidos.
- Recordatorios validados.
- Contenido educativo revisado.
- Recuperación administrativa.
- Consentimiento de marketing.
- Límites de frecuencia.
- Bloqueo de promociones durante duelo.

No transformar seguimiento médico en campañas sin validación profesional.

---

# FASE 15 — VET LIFE ACADEMY

Implementa AC-01 hasta AC-10.

Crear:

- Biblioteca de procedimientos.
- Videos.
- Manuales.
- Cursos por rol.
- Evaluaciones.
- Registro de progreso.
- Competencias.
- Formación requerida.
- Checklist de incorporación.
- Procedimientos versionados.
- Responsable de cada contenido.
- Fecha de revisión.
- Asistente de preguntas sobre material aprobado.

No confundir certificación interna con habilitación profesional.

---

# FASE 16 — ASISTENTE PRIVADA DE LUIS

Implementa AI-01 hasta AI-12.

Nombre:

**Asistente de Dirección Vet Freedom.**

Experiencia tipo conversación moderna, diseñada especialmente para móvil.

Permitir preguntas sobre la operación con datos reales.

Ejemplos:

“¿Qué tengo que revisar hoy?”

“¿Cuántas visitas hay mañana?”

“¿Qué veterinario tiene la ruta más difícil?”

“¿Cuáles son las solicitudes sin resolver?”

“Organiza las visitas pendientes”.

“¿Cuánto tiempo he dedicado esta semana a la operación?”

“Prepárame un resumen semanal”.

## Arquitectura de IA

Separar claramente:

LECTURA.

PROPUESTA.

BORRADOR.

APROBACIÓN.

EJECUCIÓN.

VERIFICACIÓN.

## Acciones sensibles

Mostrar qué se modificará, a quién afectará, riesgos y efectos antes de aprobar.

Solo ejecutar acciones permitidas y autorizadas.

Guardar auditoría de la aprobación y del resultado real.

Nunca responder “hecho” sin verificar que la operación terminó correctamente.

Aplicar controles contra prompt injection y acceso no autorizado.

---

# FASE 17 — AUTOMATIZACIONES N8N

Implementa funcionalmente las 112 automatizaciones WF-001 a WF-112 especificadas en el documento.

No es obligatorio que sean 112 workflows separados, pero TODOS los comportamientos deben existir y poder verificarse individualmente.

Organízalos en nueve dominios:

A. Atención y conversaciones: WF-001 a WF-020.

B. Customer Experience Memory: WF-021 a WF-030.

C. Citas: WF-031 a WF-042.

D. Equipo: WF-043 a WF-052.

E. Rutas: WF-053 a WF-064.

F. Tratamientos e insumos: WF-065 a WF-076.

G. Experiencia y fidelización: WF-077 a WF-086.

H. Asistente de Luis: WF-087 a WF-096.

I. OKVET, seguridad y mantenimiento: WF-097 a WF-112.

## Diseño de automatización

Crear un sistema de eventos operativos persistentes.

Usar:

- Identificador de evento.
- Tipo de evento.
- Correlation ID.
- Idempotency Key.
- Estado.
- Origen.
- Fecha.
- Intentos.
- Resultado.
- Error.
- Responsable.

Aplicar un mecanismo transaccional de outbox cuando corresponda, para que los cambios de base de datos y los eventos no queden inconsistentes.

## Manejo de errores

Implementar:

- Reintentos con límites.
- Backoff.
- Cola de errores.
- Alertas.
- Reprocesamiento seguro.
- Detección de duplicados.
- Ejecuciones auditadas.
- Recuperación tras caídas.

Las acciones de n8n deben pasar por endpoints protegidos del backend cuando modifiquen datos.

No permitir que un webhook público cambie información sensible directamente.

## Entregables n8n

Generar archivos JSON exportables, instrucciones de instalación, variables de entorno, contratos de eventos, documentación de credenciales y escenarios de prueba.

No exportar secretos.

---

# FASE 18 — MODELO DE DATOS

Implementa todas las entidades del apartado 24 del documento original.

Conservar una estructura normalizada y extensible.

Incluir relaciones para:

Organizaciones.

Usuarios y roles.

Empleados y competencias.

Propietarios.

Mascotas.

Cuidadores.

Direcciones.

Consentimientos.

Customer Experience Memory.

Conversaciones.

Mensajes.

Solicitudes.

Citas.

Confirmaciones.

Visitas.

Rutas.

Tratamientos.

Inventario.

Tareas.

Aprobaciones.

OKVET.

Finanzas.

Quejas.

Calidad.

Formación.

Automatizaciones.

Auditoría.

Seguridad.

Salud del sistema.

## Restricciones

Usar foreign keys, índices y restricciones únicas.

Aplicar Row Level Security a todas las tablas relevantes.

Evitar exponer Service Role Keys en el frontend.

Proteger archivos privados mediante autorización comprobada.

Crear migraciones reproducibles.

Documentar políticas de borrado, retención y restauración.

---

# FASE 19 — SEGURIDAD

Implementa íntegramente el apartado 27.

Incluir:

- Autenticación individual.
- MFA para funciones sensibles cuando esté disponible.
- Roles y permisos.
- Validación de autorización en servidor.
- Separación por organización.
- RLS.
- Validación de entrada.
- Seguridad de webhooks.
- Gestión de secretos.
- Auditoría.
- Validación de archivos.
- Control de acceso a documentos.
- Revocación de sesiones.
- Protección contra duplicación.
- Rate limiting.
- Protección contra abuso.
- Gestión de consentimiento.
- Retención de datos.
- Prevención de inyección de prompts.
- Control de acceso a herramientas de IA.
- Copias de seguridad.
- Restauración verificada.

Revisar los requisitos legales aplicables en Colombia, incluidos tratamiento de datos personales y datos relacionados con la prestación de servicios veterinarios.

No enviar información sensible a proveedores externos sin justificación, autorización y controles apropiados.

---

# FASE 20 — PWA Y EXPERIENCIA DE CAMPO

Preparar la aplicación para instalación en Android e iPhone.

Implementar manifest, iconografía, diseño adaptable y experiencia de carga optimizada.

Evaluar notificaciones push según compatibilidad y autorización.

Permitir uso limitado sin conexión únicamente en funciones donde sea seguro.

Si se permite capturar eventos temporalmente offline:

- Mostrar estado no sincronizado.
- Mantener identificadores únicos.
- Aplicar reglas de resolución de conflictos.
- Revalidar autorizaciones.
- Evitar duplicados.
- No declarar confirmaciones oficiales estando offline.

No almacenar indiscriminadamente información clínica o privada en cachés del navegador.

---

# FASE 21 — SUPERVISIÓN Y MANTENIMIENTO

Implementa MNT-01 hasta MNT-12.

Crear un Centro de Salud del Sistema.

Mostrar el estado de:

- Aplicación.
- Base de datos.
- Autenticación.
- WhatsApp.
- n8n.
- IA.
- Mapas.
- OKVET asistido.
- Notificaciones.
- Respaldos.
- Integraciones.

Registrar fallos técnicos mediante IDs.

Permitir ver ejecuciones fallidas y eventos pendientes.

Agregar alertas de consumo y presupuestos.

Versionar los workflows.

Implementar pruebas antes de publicar cambios.

Crear procedimientos de rollback y continuidad.

---

# FASE 22 — PRUEBAS REALES

Debes implementar y ejecutar los 60 escenarios de aceptación AT-001 hasta AT-060 del documento original.

Además, añadir pruebas técnicas para:

- Autenticación.
- Permisos.
- RLS.
- Archivos privados.
- Duplicados.
- Eventos concurrentes.
- Reintentos.
- Citas simultáneas.
- Transferencia IA-humano.
- Webhooks falsificados.
- Fallos de terceros.
- Revocación de usuarios.
- Inyección de prompts.
- Estados offline.
- Integridad de datos.
- Acciones sensibles.
- Accesibilidad.
- Rendimiento móvil.

Crear pruebas unitarias, de integración y E2E.

Usar datos sintéticos en QA.

No enviar mensajes reales en pruebas sin aprobación.

Cada prueba debe presentar:

ID, procedimiento, resultado esperado, resultado observado, evidencia, fecha y estado.

Un test fallido debe impedir que su funcionalidad se marque como validada.

---

# FASE 23 — DOCUMENTACIÓN Y ENTREGA

Implementa los 50 entregables descritos en el apartado 32.

En particular, entregar:

- Código fuente.
- Repositorio.
- Arquitectura.
- Diagrama de componentes.
- Esquema de datos.
- Migraciones.
- Políticas RLS.
- Interfaces.
- Workflows.
- Integraciones.
- Variables de entorno documentadas.
- Pruebas.
- Manual del administrador.
- Manual del equipo.
- Documentación de soporte.
- Costos.
- Respaldos.
- Restauración.
- Procedimiento de actualizaciones.
- Dependencias.
- Limitaciones.
- Evidencia de aceptación.

Crear también un documento vivo llamado:

VET_FREEDOM_OS_IMPLEMENTATION_LEDGER.

Debe contener qué se construyó, qué se probó, qué está bloqueado y qué sigue.

Evitar reconstrucciones duplicadas al continuar el proyecto en futuras sesiones.

---

# REGLAS DE CALIDAD INNEGOCIABLES

1. No omitir requisitos del documento maestro.
2. No entregar solo diseño.
3. No usar botones ficticios.
4. No afirmar integraciones inexistentes.
5. No generar resultados financieros inventados.
6. No permitir accesos no autorizados.
7. No confirmar citas sin evidencia.
8. No permitir decisiones clínicas automáticas no autorizadas.
9. No duplicar operaciones por eventos repetidos.
10. No publicar funciones críticas sin probar.
11. No ocultar errores.
12. No declarar el producto terminado con dependencias bloqueadas.

## ORDEN DE EJECUCIÓN

Comienza inmediatamente con:

PRIMERO: matriz completa de requisitos.

SEGUNDO: arquitectura técnica.

TERCERO: sistema de diseño y navegación por rol.

CUARTO: Supabase, autenticación, modelo de datos y RLS.

QUINTO: módulos operativos con datos persistentes.

SEXTO: Customer Experience Memory, agenda y coordinación.

SÉPTIMO: integraciones y workflows.

OCTAVO: asistentes de IA y aprobaciones.

NOVENO: módulos avanzados de rutas, finanzas, inventario y academia.

DÉCIMO: pruebas completas, documentación y preparación de despliegue.

Trabaja de manera incremental, manteniendo funcional el código existente.

Al finalizar cada etapa, actualiza la matriz de trazabilidad y comprueba que lo implementado funciona.

Si una tarea depende de una credencial, autorización o servicio no disponible, deja la función correctamente preparada e indica el bloqueo; continúa con lo independiente.

**OBJETIVO FINAL**

Entregar una plataforma empresarial real, hermosa, intuitiva, segura y mantenible.

Una plataforma en la que los clientes se sientan conocidos y cuidados, el equipo trabaje coordinado, el coordinador resuelva la operación y Luis pueda dirigir su empresa sin convertirse en el cuello de botella.

VET FREEDOM OS.

Una veterinaria que cuida mejor, funciona mejor y permite vivir mejor.

Alpha Vision Method — Despierta. Elige. Construye.