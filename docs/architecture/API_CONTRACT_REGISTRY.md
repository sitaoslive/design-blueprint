# Contratos
- PROMPT-010: 29 operaciones en `customer-experience/application/contracts.ts`; 13 conectadas al transporte interno protegido de calidad para comandos/lecturas concretos. `official.functions.ts` y `quality_checked_command` validan rol, propietario, versión, motivo, idempotencia y evidencia; familias leen casos saneados. Las demás operaciones siguen INTEGRATION_UNAVAILABLE; publicación significa solo portal, no envío externo. QA: docs/qa/P10_INTERNAL_2026-11-21.md.
- PROMPT-009: 26 nombres propuestos en finance/application/contracts.ts; verifyPayment/reconcile/issueInvoice/receivePurchase siguen no disponibles. No se inventó endpoint ni verificación bancaria. Siguiente lote y aceptación: docs/NEXT_STEP_INTERNAL_FINANCE.md.
- `aiTriage({ items: {key, kind, text}[] }) → { results: {key, priority: alta|media|baja, reason, summary}[] }` — servidor, requiere sesión y rol ops/dirección. Solo sugiere.
- `consultant_metrics()` — RPC agregado para Alpha Vision.
- Eventos hacia n8n: ver `src/services/events/contracts.ts` (versionados, sin datos clínicos). No hay webhooks activos.
