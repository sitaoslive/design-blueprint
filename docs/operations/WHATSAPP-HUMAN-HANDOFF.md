# PROTOCOLO DE HUMAN HANDOFF Y ESCALAMIENTO OPERATIVO
## VET FREEDOM OS — Vet Life — Veterinaria a Domicilio
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Módulos Relacionados:** `VET-CORE-02` (Inbound) <-> `VET-CORE-04` (Conversation Escalation)  
**Estado:** DOCUMENTADO Y VERIFICADO EN QA

---

## 1. PRINCIPIO FUNDAMENTAL: CONTROL HUMANO SOBERANO
Cuando una conversación entra en estado de transferencia humana:
1. La bandera `is_bot_locked` se establece en `true` en `public.conversations`.
2. El asistente de IA queda estrictamente inhabilitado para emitir respuestas automáticas salientes.
3. Todo mensaje entrante posterior se agrega al historial y se enruta de forma directa a la bandeja del operador asignado (`STAFF_AGENT_INBOX` o `DIRECTOR`).

---

## 2. DISPARADORES DE ESCALAMIENTO

| Disparador | Nivel de Severidad | Rol Destino | Tiempo Máximo de Respuesta (SLA) |
|---|---|---|---|
| **Emergencia Clínica / Triage P0** | CRITICAL | `DIRECTOR` (Dr. Luis Eduardo Ríos) | Inmediato (< 2 minutos) |
| **Queja Formal o Inconformidad Grave** | HIGH | `DIRECTOR` | < 15 minutos |
| **Duelo por Fallecimiento de Mascota** | HIGH | `DIRECTOR` | < 30 minutos (Atención sensible) |
| **Solicitud Explícita de Hablar con Humano** | MEDIUM | `STAFF_AGENT_INBOX` | < 5 minutos en horario hábil |
| **Cancelación o Reprogramación de Cita** | HIGH | `RECEPTION` | < 10 minutos |
| **Duda Farmacológica / Dosis Prohibida** | HIGH | `VET` | < 15 minutos |

---

## 3. RESUMEN ESTRUCTURADO DE HANDOFF (CONTEXT HANDSHAKE)
Al dispararse el handoff, `VET-CORE-02` genera un payload estructurado para `VET-CORE-04`:

```json
{
  "event": "whatsapp.handoff.requested",
  "conversation_id": "c1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "client_name": "Carolina Restrepo",
  "client_phone": "+573105550199",
  "pet_name": "Toby",
  "species": "CANINE",
  "escalation_reason": "CLINICAL_EMERGENCY_DETECTED",
  "assigned_role": "DIRECTOR",
  "priority": "CRITICAL",
  "conversation_summary": "Tutor reporta convulsiones y vómito de sangre. Se instruyó traslado a urgencias 24h y se bloqueó el bot.",
  "last_user_message": "¡Mi perro está convulsionando y botando sangre, urgente!",
  "handshake_timestamp": "2026-11-21T06:30:00Z"
}
```

---

## 4. PROCEDIMIENTO DE RETORNO AL ASISTENTE DE IA
Una vez que el operador humano concluye la gestión con el cliente:
1. El operador marca la conversación como resuelta en Lovable / n8n.
2. Se ejecuta la función RPC `public.set_conversation_bot_lock(conversation_id, false, 'OPERATOR_RELEASED')`.
3. La bandera `is_bot_locked` vuelve a `false`, permitiendo que futuras consultas de rutina sean atendidas nuevamente por la asistente ejecutiva virtual.
