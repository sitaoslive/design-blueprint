# VET FREEDOM OS — PREVENTION EVENT CONTRACT
## Contrato de Eventos y Payloads entre n8n Cloud y Supabase
**Módulo:** VET-CORE-10 | Workflow ID: `T2KxP7OvRZuFYVTF`  
**Endpoint Webhook:** `POST /webhook/prevention/notify`  

---

## 1. Catálogo de Tipos de Evento

| Evento | Descripción | Destino Primario | Plantilla Homologada |
| :--- | :--- | :--- | :--- |
| `prevention.plan_approved` | Plan preventivo aprobado por el médico veterinario | VET-CORE-03 | `vet_preventive_plan_welcome` |
| `prevention.due_item_verified` | Refuerzo o control verificado próximo a vencer | VET-CORE-03 | `vet_preventive_due_date_reminder` |
| `prevention.reminder_eligible` | Recordatorio de fecha de vencimiento preventiva | VET-CORE-03 | `vet_preventive_due_date_reminder` |
| `prevention.appointment_requested` | Solicitud de cita preventiva recibida | VET-CORE-05 | `vet_preventive_request_received` |
| `prevention.application_verified` | Aplicación clínica certificada con lote oficial | VET-CORE-03 | `vet_preventive_application_confirmed` |
| `prevention.record_conflict_detected` | Conflicto detectado en datos históricos | Coordinación | Alerta Interna de Auditoría |
| `prevention.lot_expired` | Lote vencido detectado en inventario | Farmacia / Vet | Bloqueo Inmediato de Lote |
| `prevention.cold_chain_review_required` | Quiebre o falta de evidencia de cadena de frío | Farmacia / Vet | Incidente Clínico Abierto |

---

## 2. Payload Inbound JSON de Prueba

```json
{
  "event_type": "prevention.reminder_eligible",
  "plan_id": "prev-plan-001",
  "plan_status": "APPROVED",
  "due_date_id": "prev-due-001",
  "prevention_type": "VACUNA_TRIPLE_FELINA",
  "due_date": "2026-11-28",
  "client_name": "Valeria Osorio",
  "client_phone": "+573132223344",
  "pet_name": "Mimi",
  "has_consent": true,
  "is_bereaved": false,
  "is_stale": false
}
```

---

## 3. Payload Outbound Seguro hacia VET-CORE-03

```json
{
  "action": "ENQUEUE_OUTBOUND_DISPATCH",
  "target_workflow": "VET-CORE-03",
  "alert_summary": "Recordatorio preventivo: Próximo control de VACUNA_TRIPLE_FELINA para Mimi (Vence: 2026-11-28).",
  "recipient_target": "+573132223344",
  "template_code": "vet_preventive_due_date_reminder",
  "send_enabled": false,
  "evaluated_at": "2026-11-21T14:45:00.000Z"
}
```
