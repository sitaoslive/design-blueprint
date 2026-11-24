# CONTRATO DE RECIBOS DE ENTREGA WHATSAPP (VET-WHATSAPP-DELIVERY-STATUS-v1.0)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-03 | WhatsApp Delivery Status Webhook`  
**Endpoint n8n:** `POST /webhook/whatsapp/delivery-status`  
**Versión de Contrato:** `VET-WHATSAPP-DELIVERY-STATUS-v1.0`  
**Zona Horaria:** `America/Bogota` (UTC-5)

---

## 1. Esquema del Payload Inbound de Meta Graph API

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "109876543210987",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "573105550100",
              "phone_number_id": "109876543210987"
            },
            "statuses": [
              {
                "id": "wamid.HBgNNTczMTA1NTUwMTk5FQIAERgSQ0ZBRDQ3OEE2NzEyMDQ3NEEA",
                "status": "delivered",
                "timestamp": "1732185000",
                "recipient_id": "573105550199",
                "conversation": {
                  "id": "conv-meta-98765",
                  "origin": {
                    "type": "utility"
                  }
                },
                "pricing": {
                  "billable": true,
                  "pricing_model": "CBP",
                  "category": "utility"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

---

## 2. Contrato Normalizado Emitido por n8n (`Consolidate Delivery Event Contract`)

```json
{
  "contract_version": "VET-WHATSAPP-DELIVERY-STATUS-v1.0",
  "reconciliation_event": "whatsapp.delivery_status_received",
  "provider_message_id": "wamid.HBgNNTczMTA1NTUwMTk5FQIAERgSQ0ZBRDQ3OEE2NzEyMDQ3NEEA",
  "status": "delivered",
  "provider_timestamp": "2024-11-21T10:30:00.000Z",
  "recipient_id": "573105550199",
  "error_details": null,
  "is_receipt": true,
  "reconciled_at": "2026-11-21T12:29:41.000Z"
}
```

---

## 3. Matriz de Mapeo de Estados y Precedencia Estricta

| Estado Recibido | Estado Normalizado | Rango Jerárquico | ¿Degrada Estado Prev? | Efecto en `public.messages` | Efecto en `public.outbound_dispatch_requests` |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `sent` | `SENT` | 1 | NUNCA | Si actual < 1, actualiza a `SENT` | Si actual = `SUBMITTING`, pasa a `PROVIDER_ACCEPTED` |
| `delivered` | `DELIVERED` | 2 | NUNCA | Si actual < 2, actualiza a `DELIVERED` | Actualiza a `DELIVERED` (si no es `READ`) |
| `read` | `READ` | 3 | NUNCA | Actualiza a `READ` | Actualiza a `READ` |
| `failed` | `FAILED` | 0 | Condicional | Actualiza a `FAILED` y almacena error | Actualiza a `FAILED` y alerta al SRE |

### Lógica de No-Degradación:
```sql
-- Jerarquía: READ (3) > DELIVERED (2) > SENT (1)
IF v_new_rank > v_current_rank THEN
    UPDATE public.messages
    SET delivery_status = v_new_status
    WHERE id = v_msg_id;
END IF;
```
