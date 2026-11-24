# CONTRATOS DE INTEGRACIÓN DE WHATSAPP INBOUND (VET-CORE-02)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Versión de Contrato:** `VET-WHATSAPP-INBOUND-v1.0`  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Esquema del Contrato Universal de Salida

Todo mensaje procesado por `VET-CORE-02` emite un payload determinista bajo el contrato `VET-WHATSAPP-INBOUND-v1.0`:

```json
{
  "contract_version": "VET-WHATSAPP-INBOUND-v1.0",
  "provider_message_id": "wamid.HBgLMzg3MDU1NDk5MDYVAgASGBQzQjE2RDE0NDk2OTg5QTBBREQ5NAA=",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "sender_phone": "+573105550199",
  "sender_name": "Carolina Restrepo",
  "message_type": "TEXT",
  "content_text": "Hola, necesito agendar una cita a domicilio para mi perro Toby.",
  "media_url": null,
  "location_data": null,
  "interactive_data": null,
  "detected_intent": "APPOINTMENT_REQUEST",
  "triage_level": "SCHEDULE_REQUEST",
  "priority": "HIGH",
  "routing_target": "AI_ASSISTANT_PIPELINE",
  "resolution_path": "ROUTED_AI_ASSISTANT",
  "is_bot_locked": false,
  "is_emergency": false,
  "p0_emergency_alert": false,
  "assigned_role": "AI_ASSISTANT",
  "coordination_log": "Mensaje rutinario clasificado para asistencia administrativa y gestión de citas con IA.",
  "escalation_reason": null,
  "ingested_at": "2026-11-21T11:24:53.000Z"
}
```

---

## 2. Matriz de Rutas de Resolución

| `routing_target` | `resolution_path` | `priority` | `assigned_role` | Acción Operativa |
|---|---|---|---|---|
| `CLINICAL_EMERGENCY_QUEUE` | `ROUTED_CLINICAL_EMERGENCY` | `CRITICAL` | `DIRECTOR` | Alerta P0 inmediata al Dr. Luis Eduardo Ríos. Bloqueo preventivo de bot. |
| `HUMAN_SUPPORT_QUEUE` | `ROUTED_HUMAN_SUPPORT` | `HIGH` / `MEDIUM` | `RECEPTION` | Entrada a buzón del personal (bot bloqueado o cancelación/modificación). |
| `AI_ASSISTANT_PIPELINE` | `ROUTED_AI_ASSISTANT` | `HIGH` / `MEDIUM` | `AI_ASSISTANT` | Procesamiento administrativo para agendamiento o información general. |
| `STATUS_RECEIPT` | `STATUS_RECEIPT_PROCESSED` | `LOW` | `SYSTEM` | Actualización de estado de entrega (delivered/read) en bitácora. |

---

## 3. Formato de Invocación RPC en Supabase

```sql
SELECT public.ingest_whatsapp_inbound_message('{
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "provider_message_id": "wamid.HBgL...",
  "sender_phone": "+573105550199",
  "sender_name": "Carolina Restrepo",
  "message_type": "TEXT",
  "content_text": "Hola, necesito agendar una cita",
  "correlation_id": "22222222-2222-2222-2222-222222222222"
}'::jsonb);
```
