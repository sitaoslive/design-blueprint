# Contratos
- PROMPT-010: `src/features/customer-experience/application/contracts.ts`, 29 contratos propuestos de calidad, quejas, encuestas, consentimientos, seguimiento, reseñas, referidos, educación, causas, mejoras e indicadores. Cada entrada exige autenticación, autorización del servidor, versión, idempotencia, correlación, vigencia y auditoría. RequestSchema/ResponseSchema/ErrorSchema; endpoint null, INTEGRATION_UNAVAILABLE hasta conciliar transporte/esquemas con Antigravity. Ningún envío ni éxito ficticio.
- `aiTriage({ items: {key, kind, text}[] }) → { results: {key, priority: alta|media|baja, reason, summary}[] }` — servidor, requiere sesión y rol ops/dirección. Solo sugiere.
- `consultant_metrics()` — RPC agregado para Alpha Vision.
- Eventos hacia n8n: ver `src/services/events/contracts.ts` (versionados, sin datos clínicos). No hay webhooks activos.
