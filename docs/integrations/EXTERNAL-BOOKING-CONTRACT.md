# VET FREEDOM OS — EXTERNAL BOOKING CONTRACT
## Especificación de Interfaces y Contratos para Agendamiento con Clínicas y Especialistas Externos
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Entorno:** DEVELOPMENT / QA (Safe Mode: CERO reservas reales en producción)

---

## 1. Alcance de la Integración Externa

Vet Freedom OS interactúa con diversas clínicas veterinarias y centros de diagnóstico especializados con distintos niveles de madurez tecnológica:

1. **Nivel 1 (Manual / Asistido por Personal):** La reserva se tramita mediante llamada telefónica o mensajería WhatsApp con la recepción del centro.
2. **Nivel 2 (Integración por Calendario Compartido):** Creación de eventos o holds en calendarios autorizados (Google Calendar / Outlook).
3. **Nivel 3 (API Directa del Proveedor):** Consumo de endpoints de agendamiento externo (donde existan convenios homologados).

---

## 2. Contrato de Confirmación Externa (`specialist_external_confirmations`)

```json
{
  "confirmation_id": "ext-conf-99120",
  "referral_id": "ref-cardio-9921",
  "specialist_id": "spec-cardio-001",
  "scheduled_slot_start": "2026-11-23T10:00:00-05:00",
  "scheduled_slot_end": "2026-11-23T11:00:00-05:00",
  "clinic_location": "Cra 15 # 104-20, Consultorio 301, Bogotá",
  "evidence_type": "OFFICIAL_PROVIDER_REFERENCE",
  "external_booking_reference": "CARDIO-BOG-2026-8812",
  "confirmed_by_staff_id": "usr-admin-coord-01",
  "confirmation_notes": "Confirmado telefónicamente con Dra. Gómez en recepción de CardioVet.",
  "status": "ACTIVE_CONFIRMED",
  "created_at": "2026-11-21T12:00:00-05:00"
}
```

---

## 3. Contrato de Reprogramación Externa (`specialist_appointment_changes`)

```json
{
  "change_id": "chg-spec-3312",
  "referral_id": "ref-cardio-9921",
  "previous_slot_start": "2026-11-23T10:00:00-05:00",
  "new_slot_start": "2026-11-25T11:00:00-05:00",
  "requested_by": "CLIENT",
  "reason": "Tutor no alcanza a llegar de viaje.",
  "new_external_reference": "CARDIO-BOG-2026-8899",
  "reschedule_status": "CONFIRMED_EXTERNALLY",
  "authorized_by_staff_id": "usr-admin-coord-01"
}
```

---

## 4. Contrato de Cancelación Externa (`specialist_appointment_cancellations`)

```json
{
  "cancellation_id": "canc-spec-1102",
  "referral_id": "ref-cardio-9921",
  "external_booking_reference": "CARDIO-BOG-2026-8899",
  "cancellation_reason": "Paciente presentó complicación previa que requiere hospitalización inmediata.",
  "external_cancellation_code": "CANC-CARDIOVET-0041",
  "cancellation_status": "EXTERNALLY_CONFIRMED",
  "client_notified": true,
  "client_notification_channel": "WHATSAPP_BUSINESS"
}
```

---

## 5. Salvaguardas de Seguridad Operativa

- **Restricción de Unicidad:** `external_booking_reference` es estrictamente único en la base de datos para impedir colisiones o reasignaciones accidentales.
- **Prohibición de Avisos Prematuros:** El cliente no recibe notificación de reprogramación o cancelación hasta que el campo `cancellation_status` o `reschedule_status` sea certificado como `EXTERNALLY_CONFIRMED`.
