# Contratos
- `aiTriage({ items: {key, kind, text}[] }) → { results: {key, priority: alta|media|baja, reason, summary}[] }` — servidor, requiere sesión y rol ops/dirección. Solo sugiere.
- `consultant_metrics()` — RPC agregado para Alpha Vision.
- Eventos hacia n8n: ver `src/services/events/contracts.ts` (versionados, sin datos clínicos). No hay webhooks activos.
