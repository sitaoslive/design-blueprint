# WHATSAPP N8N-SUPABASE CONTRACT
## VET FREEDOM OS — Interfaz de Persistencia y Procedimientos Almacenados
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Módulo:** VET-CORE-02 | Inbound Gateway <-> Supabase PostgreSQL 17  
**Contrato:** `VET-WHATSAPP-INBOUND-v1.0`

---

## 1. DESCRIPCIÓN GENERAL
Define el contrato de llamada y estructuras de datos entre los nodos de n8n Cloud y las funciones RPC en Supabase desplegadas en la Migración 025 (`025_whatsapp_inbound_and_conversations.sql`).

---

## 2. RPC: `public.ingest_whatsapp_inbound_message(p_payload jsonb)`

### Parámetros de Entrada (`p_payload`)
```json
{
  "provider_message_id": "wamid.TEST_MSG_12345",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "sender_phone": "+573105550199",
  "sender_name": "Carolina Restrepo",
  "message_type": "TEXT",
  "content_text": "Hola, necesito consulta a domicilio para Toby",
  "media_url": null,
  "location": null,
  "interactive": null
}
```

### Respuestas Retornadas
#### Caso Nominal (Nuevo Mensaje Ingerido)
```json
{
  "status": "INGESTED",
  "message_id": "8d3c1b35-7729-45e0-94e8-8b9a1e05a81e",
  "conversation_id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "owner_id": "owner-uuid-carolina-001",
  "pets_count": 1,
  "primary_pet_id": "pet-uuid-toby-001",
  "is_emergency": false,
  "is_bot_locked": false,
  "priority": "MEDIUM",
  "outbox_event_id": "outbox-uuid-998877",
  "created_at": "2026-11-21T06:30:00Z"
}
```

#### Caso Duplicado (Deduplicación Automática)
```json
{
  "status": "DUPLICATE_IGNORED",
  "is_duplicate": true,
  "message_id": "8d3c1b35-7729-45e0-94e8-8b9a1e05a81e",
  "conversation_id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "note_es": "Mensaje wamid ya registrado en public.messages"
}
```

#### Caso Emergencia Médica (Triage P0 y Bloqueo de Bot)
```json
{
  "status": "INGESTED",
  "message_id": "msg-emerg-001",
  "conversation_id": "conv-emerg-001",
  "is_emergency": true,
  "is_bot_locked": true,
  "priority": "CRITICAL",
  "triage_level": "EMERGENCY_IMMEDIATE",
  "assigned_role": "DIRECTOR",
  "outbox_event_id": "outbox-emerg-alert-001"
}
```

---

## 3. RPC: `public.set_conversation_bot_lock(p_conversation_id uuid, p_locked boolean, p_reason text)`

Permite bloquear o liberar el control de IA sobre una conversación activa.

### Parámetros
- `p_conversation_id`: UUID de la conversación.
- `p_locked`: `true` para pasar a control humano; `false` para reactivar la IA.
- `p_reason`: Motivo administrativo o clínico del cambio de estado.

### Respuesta
```json
{
  "status": "UPDATED",
  "conversation_id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "is_bot_locked": true,
  "previous_status": "OPEN",
  "current_status": "WAITING_HUMAN",
  "locked_at": "2026-11-21T06:31:00Z"
}
```

---

## 4. RPC: `public.get_conversation_context(p_conversation_id uuid)`

Recupera el contexto consolidado de 360 grados necesario para el asistente de IA o el operador humano:
- Datos del propietario (`first_name`, `last_name`, `phone`, `address`).
- Mascotas activas asociadas (`name`, `species`, `breed`, `birth_date`).
- Últimos 10 mensajes del historial ordenados cronológicamente.
- Estado actual de `is_bot_locked` y tags clínicos.
