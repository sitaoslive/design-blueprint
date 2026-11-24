# VET FREEDOM OS — CONTRATO DE EVENTOS DE CITAS
**Módulo:** VET-CORE-05 | Appointment Notification Service  
**Canal de Integración:** PostgreSQL Transactional Outbox / Webhook  
**Formato de Serialización:** JSON  
**Zona Horaria de Eventos:** ISO 8601 con offset `America/Bogota` (`-05:00`)

---

## 1. Esquema del Payload de Eventos en Transactional Outbox

Todos los eventos del ciclo de vida de citas se persisten atómicamente en `public.transactional_outbox` bajo `aggregate_type = 'APPOINTMENT'`.

```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "aggregate_type": "APPOINTMENT",
  "aggregate_id": "uuid (appointment_id)",
  "event_type": "appointment.confirmed",
  "payload": {
    "appointment_id": "a1000000-0000-0000-0000-000000000001",
    "organization_id": "00000000-0000-0000-0000-000000000001",
    "owner_id": "own-001",
    "pet_id": "pet-001",
    "service_id": "srv-001",
    "assigned_veterinarian_id": "staff-001",
    "start_time": "2026-11-25T10:00:00-05:00",
    "end_time": "2026-11-25T11:00:00-05:00",
    "okvet_reference": "OKVET-2026-11-0089",
    "version": 2,
    "verified_at": "2026-11-21T08:30:00-05:00"
  },
  "idempotency_key": "apt-conf-a1000000-0000-0000-0000-000000000001-v2",
  "correlation_id": "corr-apt-99887766",
  "source_system": "OKVET_GATE",
  "created_at": "2026-11-21T08:30:00-05:00"
}
```

---

## 2. Catálogo de Eventos Soportados

| Event Type | Origen | Descripción | Consumidores Principales |
| :--- | :--- | :--- | :--- |
| `appointment.requested` | Lovable / Inbound | Nueva solicitud recibida de tutor. | VET-CORE-05, Coordinación |
| `appointment.confirmed` | OKVET Gate RPC | Cita validada con radicado OKVET. | VET-CORE-03, VET-CORE-06 (Cal) |
| `appointment.reschedule_proposed` | Motor de Citas | Propuesta de cambio de horario emitida. | VET-CORE-03, Lovable |
| `appointment.rescheduled` | OKVET Gate RPC | Reagendamiento confirmado oficialmente. | VET-CORE-03, VET-CORE-06 |
| `appointment.cancelled` | RPC Cancelación | Cita cancelada con motivo auditado. | VET-CORE-03, VET-CORE-06 |
| `appointment.en_route` | App Médico | Veterinario salió hacia el domicilio. | VET-CORE-03 (Aviso 2h/camino) |
| `appointment.arrived` | App Médico | Veterinario arribó a la dirección. | VET-CORE-03 |
| `appointment.completed` | App Médico | Visita clínica finalizada con éxito. | Facturación, Encuestas |
| `appointment.no_show_recorded` | App Médico | Tutor ausente tras tiempo de espera. | VET-CORE-05 (Recuperación) |
| `appointment.visit_not_completed` | App Médico / Vial | Visita abortada por fuerza mayor. | Coordinación, VET-CORE-04 |

---

## 3. Contrato de Entrada del Webhook de n8n (`/appointments/notify`)

El nodo Webhook de `VET-CORE-05` acepta payloads estructurados para simulación o integración HTTP:

```json
{
  "appointment_id": "uuid",
  "organization_id": "uuid (opcional, defaults to default org)",
  "notification_type": "CONFIRMED_OFFICIAL | REMINDER_24H | REMINDER_2H | RESCHEDULE_PROPOSAL | RESCHEDULE_CONFIRMED | CANCELLED | NO_SHOW_FOLLOWUP | WAITLIST_OFFER",
  "version": 1,
  "owner_phone": "+573105550199",
  "owner_name": "Camila Torres",
  "pet_name": "Luna",
  "vet_name": "Dr. Luis Eduardo Ríos",
  "scheduled_time": "2026-11-25T10:00:00-05:00",
  "address_summary": "Cra 15 # 93-45, Bogotá",
  "okvet_validated": true,
  "okvet_reference": "OKVET-2026-11-0089",
  "reason": "Opcional (para reprogramación o cancelación)"
}
```
