# CONVERSATION HANDOFF INTEGRATION CONTRACT
## VET FREEDOM OS — Contract: `VET-CONVERSATION-ESCALATION-v1.0`
**Emisor:** `VET-CORE-04 | Conversation Escalation`  
**Receptores:** Lovable UI Inbox, Notification Service, PostgreSQL Outbox  
**Versión:** 1.0  
**Fecha:** 2026-11-21  

---

## 1. Esquema JSON de Entrada (Webhook / Evento Interno)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "HandoffRequestEvent",
  "type": "object",
  "required": [
    "conversation_id",
    "organization_id",
    "handoff_reason",
    "priority"
  ],
  "properties": {
    "conversation_id": {
      "type": "string",
      "format": "uuid"
    },
    "organization_id": {
      "type": "string",
      "format": "uuid"
    },
    "owner_name": {
      "type": "string"
    },
    "pet_name": {
      "type": "string"
    },
    "client_phone": {
      "type": "string",
      "pattern": "^\\+?[0-9]{10,15}$"
    },
    "handoff_reason": {
      "type": "string",
      "enum": [
        "CLIENT_REQUESTED_HUMAN",
        "CLINICAL_EMERGENCY_RESPIRATORY_DISTRESS",
        "CLINICAL_DOSAGE_QUERY",
        "BOOKING_RESCHEDULE_REQUEST",
        "PAYMENT_BILLING_DISPUTE",
        "BEREAVEMENT_PET_LOSS",
        "FORMAL_COMPLAINT",
        "SYSTEM_TECH_FAILURE"
      ]
    },
    "priority": {
      "type": "string",
      "enum": ["CRITICAL", "HIGH", "MEDIUM", "STANDARD", "LOW"]
    },
    "target_team": {
      "type": "string",
      "enum": ["DIRECTOR", "VET", "COORDINACION", "RECEPCION", "FINANZAS", "SOPORTE"]
    },
    "target_role": {
      "type": "string",
      "enum": ["DIRECTOR", "VETERINARIAN", "COORDINATOR", "RECEPTION", "FINANCE", "TECH_SUPPORT"]
    },
    "raw_summary": {
      "type": "string",
      "maxLength": 1000
    },
    "idempotency_key": {
      "type": "string"
    },
    "correlation_id": {
      "type": "string"
    }
  }
}
```

---

## 2. Esquema JSON Consolidado de Salida (`VET-CONVERSATION-ESCALATION-v1.0`)

Generado por el nodo `Consolidate Escalation Contract` de n8n:

```json
{
  "contract_version": "VET-CONVERSATION-ESCALATION-v1.0",
  "escalation_status": "HANDOFF_PENDING_ASSIGNMENT",
  "conversation_id": "c4444444-4444-4444-4444-444444444444",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "customer_name": "Carolina Restrepo",
  "patient_name": "Toby",
  "assigned_team": "COORDINACION",
  "assigned_role": "COORDINATOR",
  "assigned_agent_name": "Andrés Salcedo",
  "assigned_agent_id": "d3333333-3333-3333-3333-333333333333",
  "assigned_queue": "COORDINATION_DISPATCH_QUEUE",
  "notification_channel": "LOVABLE_COORDINATION_INBOX",
  "priority": "HIGH",
  "sla_minutes": 15,
  "escalation_deadline_at": "2026-11-21T12:20:43.177Z",
  "is_bot_locked": true,
  "bot_suppressed": true,
  "sanitized_summary": "Tutor solicita confirmación de hora exacta de llegada domiciliaria",
  "processed_at": "2026-11-21T12:05:43.177Z"
}
```

---

## 3. Códigos de Error Normalizados

| Código de Error | Descripción | Acción Requerida |
|---|---|---|
| `CONVERSATION_NOT_FOUND` | Identificador de conversación inexistente | Verificar ID y registrar anomalía |
| `HANDOFF_NOT_FOUND` | Handoff no encontrado o ya expirado | Refrescar bandeja en UI |
| `ALREADY_ASSIGNED` | Caso tomado concurrentemente por otro operador | Mostrar modal "Caso ya asignado a [Nombre]" |
| `CANNOT_RESUME_AI_DURING_CRITICAL_EMERGENCY` | Intento de reactivar IA con caso médico P0 abierto | Resolver caso médico primero |
| `AI_SUPPRESSED_HUMAN_CONTROL_ACTIVE` | Borrador de IA bloqueado por operador humano activo | Descartar borrador silenciosamente |
| `AI_DRAFT_INVALIDATED_STATE_VERSION_MISMATCH` | Versión de estado cambió durante generación de IA | Descartar borrador desactualizado |
