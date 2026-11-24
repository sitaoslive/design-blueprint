# MANUAL OPERATIVO DE TRIAGE Y RECEPCIÓN WHATSAPP (VET-CORE-02)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Destinatarios:** Dr. Luis Eduardo Ríos, Equipo de Recepción y Asistentes Veterinarios  
**Canal:** WhatsApp Business Cloud API  
**Zona Horaria:** `America/Bogota` (UTC-5)  

---

## 1. Clasificación Automática de Triage

| Nivel de Triage | Palabras Clave / Síntomas | Enrutamiento | Prioridad | Acción Inmediata |
|---|---|---|---|---|
| **EMERGENCY_IMMEDIATE** | Convulsión, intoxicado, envenenado, hemorragia, atropellado, asfixia, no respira, inconsciente. | `CLINICAL_EMERGENCY_QUEUE` | `CRITICAL` (P0) | Notificación push/llamada prioritaria al Dr. Luis. Bot bloqueado de inmediato. |
| **SCHEDULE_REQUEST** | Cita, agendar, consulta, visita, domicilio, disponibilidad, programar. | `AI_ASSISTANT_PIPELINE` | `HIGH` | Asistente de IA evalúa disponibilidad de agenda y zona geográfica. |
| **MODIFICATION_REQUEST** | Cancelar, reprogramar, aplazar, cambiar fecha, cambiar hora. | `HUMAN_SUPPORT_QUEUE` | `HIGH` | Notificación al personal de recepción para confirmar cambio con el cliente. |
| **BILLING** | Precio, costo, tarifa, pago, Nequi, Daviplata, transferencia. | `AI_ASSISTANT_PIPELINE` | `MEDIUM` | Asistente de IA provee tarifas vigentes según zona y tipo de servicio. |
| **CLINICAL_FOLLOWUP** | Vacuna, desparasitación, control, seguimiento postoperatorio. | `AI_ASSISTANT_PIPELINE` | `MEDIUM` | Asistente de IA consulta historial de vacunas en `public.pets`. |

---

## 2. Protocolo de Bloqueo de Bot (Bot-Lock)

### ¿Cuándo entra en efecto el Bot-Lock?
1. **Automáticamente por Emergencia:** Si el mensaje contiene síntomas de riesgo vital.
2. **Manualmente por el Personal:** Cuando un asesor o el Dr. Luis decide atender la conversación directamente desde Lovable o la bandeja de soporte.

### ¿Cómo liberar el Bot-Lock?
Una vez concluida la interacción humana, el asesor libera la conversación desde la interfaz o ejecutando:
```sql
SELECT public.set_conversation_bot_lock('<CONVERSATION_UUID>', false, 'ATENCIÓN_HUMANA_CONCLUIDA');
```
A partir de ese instante, la conversación retorna al modo `AI_HANDLING` para futuras consultas rutinarias.

---

## 3. Ventana de 24 Horas de WhatsApp
Meta exige responder dentro de una ventana de 24 horas contadas a partir del último mensaje recibido del usuario (`conversations.window_expires_at`).
- `VET-CORE-02` actualiza automáticamente `window_expires_at = now() + interval '24 hours'` tras cada mensaje entrante.
- Si la ventana expira, solo se permite el envío de plantillas pre-aprobadas (`HSM / Message Templates`).
