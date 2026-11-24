# CONTRATO DE INTEGRACIÓN DE ENVÍO WHATSAPP (VET-WHATSAPP-OUTBOUND-v1.0)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-03 | WhatsApp Outbound`  
**Endpoint n8n:** `POST /webhook/whatsapp/outbound`  
**Versión de Contrato:** `VET-WHATSAPP-OUTBOUND-v1.0`  
**Zona Horaria:** `America/Bogota` (UTC-5)  
**Modo Seguro:** `send_enabled = false`

---

## 1. Esquema del Payload de Solicitud (Inbound al Webhook Outbound)

```json
{
  "dispatch_request_id": "req-outbound-uuid-001",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "conversation_id": "c4444444-4444-4444-4444-444444444444",
  "recipient_phone": "+573105550199",
  "recipient_name": "Carolina Restrepo",
  "sender_phone_number_id": "109876543210987",
  "message_category": "UTILITY",
  "message_purpose": "APPOINTMENT_CONFIRMED",
  "has_consent": true,
  "is_bereaved": false,
  "is_bot_locked": false,
  "draft_state_version": 4,
  "current_conv_state_version": 4,
  "is_within_24h_window": true,
  "template_code": "vet_appointment_confirmed",
  "template_parameters": {
    "tutor_name": "Carolina",
    "pet_name": "Toby",
    "appointment_date": "2026-11-22",
    "appointment_time": "3:30 PM",
    "veterinarian_name": "Dr. Luis Eduardo Ríos"
  },
  "freeform_text": "Hola Carolina, confirmamos la cita médica de Toby para mañana a las 3:30 PM.",
  "idempotency_key": "idemp-req-001-v4",
  "correlation_id": "corr-outbound-abc123",
  "send_enabled": false
}
```

### Definición de Campos Clave:
| Campo | Tipo | Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `dispatch_request_id` | String / UUID | Sí | Identificador transaccional de la solicitud en `public.outbound_dispatch_requests`. |
| `recipient_phone` | String (E.164) | Sí | Teléfono en formato internacional estándar (+57 para Colombia). |
| `has_consent` | Boolean | Sí | Confirmación de autorización de comunicación WhatsApp según política de privacidad. |
| `is_bereaved` | Boolean | Sí | Indicador del protocolo de duelo. Si es `true`, la solicitud es rechazada inmediatamente. |
| `is_bot_locked` | Boolean | Sí | Bandera de control humano. Si es `true` y el remitente es IA, se bloquea el despacho. |
| `draft_state_version` | Integer | Sí | Versión de estado de la conversación con la que la IA redactó el borrador. |
| `is_within_24h_window` | Boolean | Sí | Indica si la ventana de servicio al cliente de Meta está activa. Si es `false`, se exige plantilla aprobada. |
| `template_code` | String | Opcional* | Nombre de la plantilla registrada en Meta. Obligatoria si `is_within_24h_window` es `false`. |
| `send_enabled` | Boolean | Sí | Bandera de seguridad. En desarrollo debe ser `false` para forzar la simulación segura. |

---

## 2. Esquema de Salida Consolidada (Éxito / Safe Simulation)

```json
{
  "contract_version": "VET-WHATSAPP-OUTBOUND-v1.0",
  "dispatch_request_id": "req-outbound-uuid-001",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "conversation_id": "c4444444-4444-4444-4444-444444444444",
  "recipient_phone": "+573105550199",
  "sender_phone_number_id": "109876543210987",
  "message_category": "UTILITY",
  "message_purpose": "APPOINTMENT_CONFIRMED",
  "provider_status": "PROVIDER_ACCEPTED",
  "is_uncertain": false,
  "http_status": 200,
  "provider_message_id": "wamid.simulated.req-outbound-uuid-001",
  "idempotency_key": "idemp-req-001-v4",
  "correlation_id": "corr-outbound-abc123",
  "processed_at": "2026-11-21T12:26:40.000Z"
}
```

---

## 3. Esquema de Salida Bloqueada por Cumplimiento (Compliance Rejection)

```json
{
  "contract_version": "VET-WHATSAPP-OUTBOUND-v1.0",
  "dispatch_request_id": "req-outbound-uuid-002",
  "dispatch_status": "CANCELLED_OR_BLOCKED",
  "error_code": "BEREAVEMENT_SUPPRESSION",
  "violations": [
    "Client/Pet in bereavement protocol. Automated outbound suppressed."
  ],
  "is_permitted": false,
  "processed_at": "2026-11-21T12:29:31.000Z"
}
```
