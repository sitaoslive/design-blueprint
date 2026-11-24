# CONTRATOS DE INTEGRACIÓN DE TELEMETRÍA Y SALUD — VET FREEDOM OS
**Versión del Contrato:** `VET-HEALTH-v1.0`  
**Módulos Interconectados:** `VET-CORE-20`, `VET-CORE-19`, `VET-CORE-01`, Supabase y Lovable  

---

## 1. Esquema del Contrato Universal de Monitoreo (`VET-HEALTH-v1.0`)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Universal Health Monitoring Contract",
  "type": "object",
  "required": [
    "contract_version",
    "cycle_id",
    "organization_id",
    "environment",
    "resolution_path",
    "overall_status",
    "is_healthy",
    "highest_severity",
    "assigned_role",
    "executive_headline_es",
    "issues_count",
    "issues_detected",
    "services_summary",
    "probes_evaluated_count",
    "forward_to_core19_retry",
    "p0_immediate_escalate",
    "heartbeat_emitted",
    "monitored_at"
  ],
  "properties": {
    "contract_version": { "type": "string", "const": "VET-HEALTH-v1.0" },
    "cycle_id": { "type": "string" },
    "organization_id": { "type": "string", "format": "uuid" },
    "environment": { "type": "string", "enum": ["DEVELOPMENT", "STAGING", "PRODUCTION"] },
    "resolution_path": { "type": "string", "enum": ["ALL_HEALTHY", "DEGRADED_OPERATIONAL", "CRITICAL_INCIDENT", "MAINTENANCE_OR_UNKNOWN"] },
    "overall_status": { "type": "string", "enum": ["HEALTHY", "DEGRADED", "UNHEALTHY", "UNKNOWN", "NOT_CONFIGURED", "PAUSED", "MAINTENANCE", "CRITICAL"] },
    "is_healthy": { "type": "boolean" },
    "highest_severity": { "type": "string", "enum": ["P0", "P1", "P2", "P3"] },
    "assigned_role": { "type": "string", "enum": ["DIRECTOR", "COORDINATOR", "TECH_SUPPORT", "FINANCE", "VETERINARIAN"] },
    "executive_headline_es": { "type": "string" },
    "issues_count": { "type": "integer", "minimum": 0 },
    "issues_detected": { "type": "array", "items": { "type": "string" } },
    "services_summary": {
      "type": "object",
      "required": ["n8n_engine", "supabase_db", "event_queues", "whatsapp_gateway", "google_calendar", "ai_assistant", "okvet_bridge", "cx_memory", "finances", "security"]
    },
    "probes_evaluated_count": { "type": "integer", "minimum": 1 },
    "forward_to_core19_retry": { "type": "boolean" },
    "p0_immediate_escalate": { "type": "boolean" },
    "heartbeat_emitted": { "type": "boolean" },
    "monitored_at": { "type": "string", "format": "date-time" }
  }
}
```

---

## 2. Contrato de la API RPC para la Interfaz Móvil Lovable

**Función PostgreSQL:** `public.get_system_health_summary(p_organization_id UUID)`

### Respuesta JSON:
```json
{
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "query_timestamp": "2026-11-20T23:05:13.744Z",
  "overall_status": "HEALTHY",
  "executive_headline_es": "Todos los sistemas de Vet Life — Veterinaria a Domicilio operan con normalidad y estabilidad.",
  "operational_metrics": {
    "open_critical_p0": 0,
    "open_major_p1": 0,
    "total_open_incidents": 0,
    "dead_letter_events": 0,
    "pending_outbox_queue": 0,
    "stale_in_flight_events": 0,
    "reconciliation_backlog": 0
  },
  "services_status": {
    "n8n_engine": "HEALTHY",
    "supabase_db": "HEALTHY",
    "whatsapp_gateway": "HEALTHY",
    "google_calendar": "HEALTHY",
    "ai_assistant": "HEALTHY",
    "event_broker": "HEALTHY",
    "okvet_bridge": "HEALTHY"
  },
  "last_monitored_at": "2026-11-20T23:05:13.744Z",
  "last_healthy_at": "2026-11-20T23:05:13.744Z"
}
```
