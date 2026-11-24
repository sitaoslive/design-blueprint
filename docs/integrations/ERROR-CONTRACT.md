# UNIVERSAL INCIDENT CONTRACT — VET FREEDOM OS
## Contrato de Datos para Notificación, Registro y Reconciliación de Incidentes
**Módulo:** `VET-CORE-19 | Error & Retry Handler`  
**Versión de Esquema:** `1.0.0`  
**Base de Datos:** PostgreSQL 17 (`public.integration_incidents`)  
**Zona Horaria:** `America/Bogota` (UTC-5)  

---

## 1. Esquema JSON del Contrato de Incidente

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "UniversalIntegrationIncident",
  "type": "object",
  "required": [
    "organization_id",
    "error_message",
    "error_category",
    "severity",
    "idempotency_key"
  ],
  "properties": {
    "incident_id": {
      "type": "string",
      "format": "uuid",
      "description": "Identificador único asignado al incidente en Supabase"
    },
    "organization_id": {
      "type": "string",
      "format": "uuid",
      "description": "Identificador de la organización inquilina (Multi-tenant)"
    },
    "environment": {
      "type": "string",
      "enum": ["DEVELOPMENT", "STAGING", "PRODUCTION"],
      "default": "DEVELOPMENT"
    },
    "source_system": {
      "type": "string",
      "enum": ["N8N", "SUPABASE_TRIGGER", "LOVABLE_APP", "OKVET_SYNC", "WHATSAPP_GATEWAY"],
      "default": "N8N"
    },
    "source_workflow_id": {
      "type": "string",
      "description": "ID del workflow emisor en n8n Cloud (ej: aE0sFsDFsQiAXfNy)"
    },
    "source_workflow_name": {
      "type": "string",
      "description": "Nombre legible del workflow emisor"
    },
    "source_execution_id": {
      "type": "string",
      "description": "ID real de ejecución en n8n que experimentó la falla"
    },
    "source_node": {
      "type": "string",
      "description": "Nombre del nodo específico donde ocurrió el error"
    },
    "event_id": {
      "type": "string",
      "description": "ID del evento outbox original asociado"
    },
    "correlation_id": {
      "type": "string",
      "format": "uuid"
    },
    "causation_id": {
      "type": "string",
      "format": "uuid"
    },
    "idempotency_key": {
      "type": "string",
      "description": "Clave única para deduplicar incidentes repetidos"
    },
    "entity_type": {
      "type": "string",
      "enum": ["appointment", "patient", "client", "staff", "route", "payment", "referral", "system"]
    },
    "entity_id": {
      "type": "string"
    },
    "error_category": {
      "type": "string",
      "enum": [
        "TRANSIENT_NETWORK",
        "RATE_LIMIT",
        "SERVICE_UNAVAILABLE",
        "AUTHENTICATION_FAILURE",
        "AUTHORIZATION_FAILURE",
        "INVALID_PAYLOAD",
        "BUSINESS_CONFLICT",
        "DUPLICATE_EVENT",
        "UNKNOWN_EXTERNAL_RESULT",
        "SECURITY_INCIDENT",
        "CLINICAL_OR_OPERATIONAL_SAFETY",
        "INTERNAL_SYSTEM_ERROR"
      ]
    },
    "error_code": {
      "type": "string"
    },
    "error_message": {
      "type": "string",
      "description": "Mensaje técnico descriptivo (sanitizado de PII y secretos)"
    },
    "http_status": {
      "type": "integer"
    },
    "severity": {
      "type": "string",
      "enum": ["P0", "P1", "P2", "P3"],
      "default": "P3"
    },
    "retry_eligibility": {
      "type": "boolean"
    },
    "external_effect_status": {
      "type": "string",
      "enum": ["NOT_APPLIED", "CONFIRMED_FAILED", "UNCERTAIN", "PARTIALLY_APPLIED", "APPLIED"],
      "default": "NOT_APPLIED"
    },
    "attempt_number": {
      "type": "integer",
      "minimum": 1
    },
    "max_attempts": {
      "type": "integer",
      "default": 5
    },
    "status": {
      "type": "string",
      "enum": [
        "DETECTED",
        "CLASSIFIED",
        "WAITING_RETRY",
        "RETRYING",
        "WAITING_RECONCILIATION",
        "REQUIRES_HUMAN",
        "RESOLVED",
        "PERMANENT_FAILURE",
        "DEAD_LETTER",
        "CANCELLED"
      ]
    },
    "recovery_decision": {
      "type": "string",
      "enum": [
        "SAFE_RETRY",
        "RECONCILE_FIRST",
        "MANUAL_REVIEW",
        "PERMANENT_FAILURE",
        "SECURITY_ESCALATION",
        "NO_ACTION_REQUIRED"
      ]
    },
    "assigned_role": {
      "type": "string",
      "enum": ["TECH_SUPPORT", "COORDINATOR", "VETERINARIAN", "FINANCE", "DIRECTOR"]
    }
  }
}
```

---

## 2. Invocación desde Otros Workflows de n8n

Para que cualquier workflow de negocio reporte un fallo a `VET-CORE-19`:
1. **Ruta HTTP Webhook:**
   - URL: `https://alphavision.app.n8n.cloud/webhook/errors/handle`
   - Método: `POST`
   - Headers: `Content-Type: application/json`
2. **Ruta Sub-Workflow (Execute Sub-workflow Node):**
   - Workflow ID: `uWO95CQ8twQDL9Gk`
   - Parámetros: Payload del contrato anterior.
