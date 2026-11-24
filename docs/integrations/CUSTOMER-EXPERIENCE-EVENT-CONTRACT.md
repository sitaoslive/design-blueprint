# VET FREEDOM OS — CONTRATO DE EVENTOS: EXPERIENCIA DEL CLIENTE

## 1. Eventos Inbound
### `appointment.completed` (CORE-01 -> CORE-15)
Disparado cuando una cita veterinaria cambia a estado `COMPLETED`.
```json
{
  "event_type": "APPOINTMENT_COMPLETED",
  "appointment_id": "apt-2026-0042",
  "owner_id": "usr-019382",
  "pet_id": "pet-091823",
  "completed_at": "2026-11-21T10:30:00-05:00",
  "veterinarian_id": "vet-luis-rios"
}
```

### `customer.feedback_received` (Webhook Inbound -> CORE-15)
Recibido a través de WhatsApp Webhook o formulario Lovable.
```json
{
  "event_type": "FEEDBACK_RECEIVED",
  "survey_id": "surv-2026-001",
  "owner_id": "usr-019382",
  "pet_id": "pet-091823",
  "nps_score": 9,
  "comment": "Excelente atención y puntualidad.",
  "channel": "WHATSAPP"
}
```

## 2. Eventos Outbound
### `clinical.concern_escalated` (CORE-15 -> CORE-04)
```json
{
  "action": "CLINICAL_HANDOFF_CORE04",
  "target_module": "VET-CORE-04",
  "priority": "HIGH_CLINICAL",
  "reason": "Mención de vómito o empeoramiento posvisita",
  "comment": "El perro vomitó después del medicamento",
  "send_enabled": false
}
```

### `service_recovery.case_created` (CORE-15 -> CORE-07)
```json
{
  "action": "TRIGGER_SERVICE_RECOVERY_PROTOCOL",
  "target_module": "VET-CORE-07",
  "priority": "HIGH_OPS",
  "case_id": "rec-2026-0012",
  "complaint_summary": "Retraso injustificado de 45 min",
  "send_enabled": false
}
```
