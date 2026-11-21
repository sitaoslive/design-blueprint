# Prompt 15A — cobertura parcial verificable
Especificación: docs/prompts/PROMPT_15A.txt. Nombre visible: Veterinaria Dr. Luis Ríos.

| Secciones | Estado | Evidencia / bloqueos |
|---|---|---|
| 0–2 misión/reutilización/rutas | FRONTEND_PARTIAL | catálogo adicional, visitas/ejecución/scheduler reutilizados, cinco pestañas Luis conservadas; despacho desde Agenda/Equipo |
| 3–4 tipos/duraciones | FRONTEND_PARTIAL + BACKEND_DRAFT_CONNECTED | editor validado, historial de propuestas director, guardado/relectura; catálogo oficial, competencias, insumos, versiones/aprobación no conectados |
| 5–7 duración al reservar/clasificación | DOMAIN_PARTIAL + PREVIEW_CONNECTED | dos cita-rápida recalculan opciones y bloquean custom sin autoridad; no registro de duración aplicada ni clasificación completa |
| 8–11 jornada/timer/estimación | BACKEND_TIMESTAMPS_CONNECTED + PARTIAL | tiempos de visit_executions, inicio/reload real; duración aplicada desconocida; extensiones no conectadas |
| 12–16 tracking/cliente/mapa/ubicación | FRONTEND_PARTIAL; LOCATION_BLOCKED | lista operativa/seguimiento propio probado, ubicación ausente; sin mapa, captura GPS, consentimiento tracking o datos fabricados |
| 17–19 ETA/cascada | DOMAIN_LOGIC_READY; ETA_BLOCKED | freshness y cascada puras probadas; sin ruta/ETA verificado ni cascada autoritativa UI |
| 20–25 avisos/políticas/historial/intervención | BLOCKED + FALLBACK | sin políticas vigentes, historial ni entrega; mensaje preview mínimo y enlace a simulador existente; no envío |
| 26 Luis | REGISTRY_BASE_READY | siete herramientas unavailable, no respuesta de backend inventada |
| 27–30 componentes/modelos/servicios | PARTIAL | timer/editor/despacho/privacy, esquemas de política y funciones puras; no catálogo completo de modelos ni servicios |
| 31 contratos | CONTRACT_BASE_READY | 20 operaciones con esquema común y fail-closed; faltan DTOs específicos por operación y transporte/autoridad verificables |
| 32 seguridad | PARTIAL_VERIFIED | propietario ajeno rechazado UI/RLS, staff asignado, permisos configuración/finanzas; tokens/expiración reales no conectados, política pura probada |
| 33–35 pruebas | PARTIAL_VERIFIED | 37 tests nuevos P15A; QA real temporizador/privacidad/editor; casos GPS/ETA/entrega/versiones no certificados |
| 36 responsive | PARTIAL_VERIFIED | cinco tamaños para lote; familia/timer en móvil; dispositivos físicos pendientes |
| 37–39 documentación/aceptación | PARTIAL | matrices actualizadas, no totalidad ni BACKEND/ETA/NOTIFICATIONS_VERIFIED |

## IDs con pruebas concretas
DUR15-T05/T06/T07/T08/T09/T15, VIS15-T02/T03/T04/T06/T07/T08, ETA15-T02/T05/T06/T12/T13/T18/T20: evidencia de dominio o UI específica en tests y QA; no equivalen a aceptación oficial completa. Crear/editar/versionar/publicar tipo oficial, duración aplicada persistente, recalculo de ruta real, extensiones, ubicación/GPS/ETA y avisos entregados: BLOCKED por autoridad/proveedor/datos. Exigir contratos con rol, expectedVersion, auditoría, idempotencia y fuente/frescura antes de activar; no crear segunda agenda ni inventar URLs.