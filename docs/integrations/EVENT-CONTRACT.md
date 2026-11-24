# Contrato de evento Supabase → n8n (propuesto, pendiente de contraste con backend real)

## Propiedad y seguridad
- Supabase registra una transacción de negocio y su evento en un outbox durable.
- Un despachador autorizado entrega o permite reclamar el evento.
- n8n **no confía** en un JSON sin validación de firma/credencial/gateway.
- Reclamo atómico en Supabase: clave de idempotencia única, estado, versión, lock/lease y reintentos.
- n8n solicita datos mínimos por endpoints seguros y registra el resultado de proveedor.
- Entrega al menos una vez + deduplicación; jamás prometer exactly-once a proveedores externos.

## Campos propuestos (verificar antes de desplegar)
`event_id`, `event_type`, `schema_version`, `organization_id`, `entity_type`, `entity_id`, `actor_id`, `occurred_at`, `correlation_id`, `causation_id`, `idempotency_key`, `source_system`, `status`, `payload autorizado`, `retry_count`.

## Respuesta propuesta de n8n
`event_id`, `execution_id`, `provider_reference`, `status`, `attempt_count`, `completed_at`, `error_code`, `error_summary`.

## Test obligatorio
Eventos válidos, inválidos, duplicados, simultáneos, fuera de orden, proveedor caído, cancelación posterior y operación humana no autorizada.

## Prohibiciones
- No exponer service_role de Supabase al navegador ni dar acceso directo general a n8n.
- No responder a Meta/Google/terceros sin comprobar firma, vigencia, permisos y consentimiento cuando apliquen.
- No registrar historias clínicas completas en ejecuciones n8n.
- No inferir que `send_enabled=true` en el payload otorgue permiso de envío.
