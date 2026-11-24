# VET FREEDOM OS — REFERRAL EVENT CONTRACT
## Especificación de Eventos Intermódulos para Remisiones y Coordinación de Especialistas
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Bus Central:** VET-CORE-01 (Event Dispatcher)  

---

## 1. Catálogo Canónico de Eventos de Remisión

| Código de Evento | Emisor | Receptor | Propósito y Payload Principal |
|---|---|---|---|
| `SPECIALIST_REFERRAL_CREATED` | Lovable / UI | CORE-11, CORE-01 | Alta de remisión en estado `DRAFT`. |
| `SPECIALIST_REFERRAL_APPROVED` | Médico Veterinario | CORE-11, CORE-01 | Aprobación clínica. Habilita búsqueda de especialista. |
| `SPECIALIST_AVAILABILITY_DISPATCHED` | CORE-11 | CORE-03 | Solicitud de horarios despachada a clínica externa. |
| `SPECIALIST_OPTIONS_PREPARED` | CORE-11 | CORE-03, CORE-07 | Opciones listas para ofertar al tutor del paciente. |
| `SPECIALIST_SLOT_SELECTED` | CORE-02 / Webhook | CORE-11 | Tutor seleccionó una franja horaria preferida. |
| `SPECIALIST_EXTERNAL_BOOKING_CONFIRMED` | Coordinación / API | CORE-11, CORE-03 | Cita confirmada con evidencia externa. |
| `SPECIALIST_ATTENDANCE_VERIFIED` | Coordinación / CRM | CORE-11, CORE-07 | Paciente asistió a la cita; inicia espera de informe. |
| `SPECIALIST_REPORT_RECEIVED` | Portal Seguro / Webhook | CORE-11 | Informe clínico y paraclínicos cargados. |
| `SPECIALIST_REPORT_REVIEWED` | Médico Veterinario | CORE-11, CORE-12 | Dictamen profesional emitido y compromisos fijados. |
| `SPECIALIST_REFERRAL_CLOSED` | CORE-11 | CORE-01, Audit | Remisión formalmente cerrada sin pendientes. |

---

## 2. Esquema Estándar de Payload de Evento

Todos los eventos que transitan por `VET-CORE-01` hacia `VET-CORE-11` cumplen la siguiente estructura:

```json
{
  "event_id": "evt-c11-99201",
  "event_type": "SPECIALIST_SLOT_SELECTED",
  "occurred_at": "2026-11-21T11:45:00-05:00",
  "source_workflow": "VET-CORE-02",
  "tenant_id": "org-vet-life-principal",
  "data": {
    "referral_id": "ref-cardio-9921",
    "offer_id": "offer-88219",
    "selected_item_id": "item-offer-88219-1",
    "selected_by_phone": "+573001234567",
    "channel": "WHATSAPP_BUTTON"
  },
  "metadata": {
    "idempotency_key": "idem-sel-offer-88219-1",
    "environment": "development",
    "trace_id": "tr-20261121-00192"
  }
}
```

---

## 3. Garantías de Entrega e Idempotencia

- **Almacenamiento Concurrente:** Todo evento entrante se registra en la tabla `event_queue` antes de su procesamiento.
- **Deduplicación:** La clave `idempotency_key` previene el procesamiento repetido de webhooks por reintentos de red de Meta o sistemas externos.
- **Supresión por Contexto:** Si el paciente entra en protocolo de luto (`bereavement_protocol_active = true`), CORE-11 intercepta el evento e inhibe la emisión de recordatorios o seguimientos comerciales.
