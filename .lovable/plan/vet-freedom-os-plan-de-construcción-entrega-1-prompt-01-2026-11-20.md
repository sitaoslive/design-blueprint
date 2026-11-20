# Vet Freedom OS — Plan de construcción (Entrega 1: Prompt 01)

Los documentos indican que esta primera entrega es la **base**: sistema de diseño, navegación por rol, todas las pantallas principales y la memoria del proyecto. Los 112 workflows n8n, OKVET, WhatsApp e IA real quedan registrados y preparados, pero **no** se implementan aún (lo exige el propio documento). Datos de demostración claramente marcados como "Demo".

## 1. Sistema de diseño (fiel a las 7 imágenes)
- Tokens: Terracota #BF5738, Terracota oscuro #9F4129, Marfil #FFF9F4, Crema #F8F0E8, Blush #F8E3DA, Salvia #E8EEDB, Salvia oscuro #476B35, Texto #34241F / #766D68, Borde #E8DDD4, más ámbar (pendiente) y rojo suave (ausente/alerta).
- Tipografía redondeada y legible (estilo de las imágenes), tarjetas muy redondeadas, huellas decorativas de fondo, campana con punto de notificación, logo provisional de huella (no oficial).
- Componentes: App Shell, barra inferior móvil, sidebar en escritorio, encabezado con título grande, tarjeta de métrica, fila "Requiere atención", botón de acción rápida, chips de filtro, insignias de estado (Confirmada / Pendiente / En curso / Por iniciar / Disponible / En ruta / Ausente / Revisión / Posible / Pendiente OKVET), tarjeta de mascota, tarjeta de veterinario, anillo de autonomía, burbujas de chat, selector desplegable, estados vacío/carga/error/offline, toasts, modales de confirmación.
- Fotos cálidas de mascotas y veterinarios generadas para la app (no se usan las capturas como fondo).

## 2. Selector de rol (demo)
Pantalla inicial para elegir perfil entre los 11 roles; cada rol ve su propia navegación.

## 3. Pantallas por rol
**Luis / Dirección** (Inicio · Agenda · Equipo · Asistente + Más)
- EXEC-001 Dashboard "Hola, Luis": visitas hoy, solicitudes, alertas, índice de autonomía 82%, "Requiere tu revisión", acciones rápidas, "Cobrado hoy" en COP. Cada tarjeta abre una vista filtrada.
- EXEC-002 Asistente: resumen del día, chat, atajos, campo de instrucción; flujo Lectura → Propuesta → Aprobación visible.
- EXEC-003 Decisiones, EXEC-004 Indicadores, EXEC-005 Modo ausencia (con verificación de cobertura).

**Coordinación** (Bandeja · Agenda · Equipo · Más)
- COORD-001 Centro de coordinación (imagen 1), COORD-002 Bandeja de solicitudes, COORD-003 Agenda inteligente (imagen 5, navegación de días), COORD-004 Nueva cita rápida (imagen 4: búsqueda, mascota, servicio, zona, fecha, veterinario, opciones, "Crear solicitud" / "Reservar provisional"), COORD-005 Equipo (imagen 6 con filtros y cobertura), COORD-006 Rutas, COORD-007 Simulador, COORD-008 Remisiones, COORD-009 Especialistas, COORD-010 Incidencias.

**Cliente** (Inicio · Mascotas · Agenda · Perfil)
- CLIENT-001 a CLIENT-010: Inicio, Mis mascotas, Perfil de mascota, Mi agenda (imagen 2: Hoy/Semana/Todas, próximas visitas, reprogramar, historial), Reservar visita, Pagos, Perfil familiar, Remisiones, Notificaciones, Ayuda (WhatsApp).

**Veterinario / Equipo**
- STAFF-001 a STAFF-009: Mi jornada, Ruta (Siguiente visita, Waze, Google Maps, iniciar desplazamiento, llegada, iniciar/finalizar atención, reportar incidencia), Detalle de visita, Tareas, Tratamientos recurrentes, Inventario y kits, Remisiones, Formación, Perfil laboral.

**Otros roles** (Cuidador, Auxiliar, Recepción, Finanzas, Administrador, Soporte, Consultor Alpha Vision): estructura de navegación y pantalla inicial propia, con permisos limitados descritos.

Módulos secundarios con pantalla base: Clientes, Finanzas, Informes, OKVET, Academia, Configuración, Notificaciones.

## 4. Interacciones
Los botones cambian estados reales en la app (confirmar, reprogramar, asignar, check-in, etc.) con confirmación visual y toast; prevención de doble clic; respeto a movimiento reducido; diseño 360–430 px primero y escritorio adaptado.

## 5. Memoria y trazabilidad del proyecto (archivos reales en /docs)
Registro de requisitos importados, registro de pantallas, registro de los comportamientos WF-001…WF-112, registro de pruebas de aceptación, matriz de permisos por rol, inventario de integraciones (OKVET, WhatsApp, n8n, mapas, IA) con su estado, historial de prompts, Implementation Ledger y Project Continuation.

## 6. Pruebas
Pruebas de navegación por rol y de reglas clave (ej. modo ausencia no se activa sin cobertura; formato COP), ejecutadas y registradas.

## Fuera de esta entrega (siguientes prompts)
Base de datos y login reales (Lovable Cloud), integración OKVET/WhatsApp, 112 automatizaciones n8n, asistente con IA real, optimizador de rutas, PWA instalable.

## Detalles técnicos
- TanStack Start, rutas separadas por rol (`/luis/*`, `/coordinacion/*`, `/cliente/*`, `/equipo/*`, `/rol/$rol`), estado demo en un store cliente con capa de datos tipada lista para migrar a Cloud.
- Tokens oklch en `src/styles.css`, fuente vía `<link>` en root, `head()` por ruta.
- Imágenes generadas como assets; Vitest para pruebas.
