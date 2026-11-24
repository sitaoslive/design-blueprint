# VET FREEDOM OS — N8N & SUPABASE INTEGRATION CONTRACTS
## Especificación de Contratos de Interfaz entre n8n (21 COREs) y Supabase
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Plataformas:** n8n Orchestrator + Supabase PostgreSQL  
**Fecha:** 2026-11-21  

---

## 1. PRINCIPIO DE COMUNICACIÓN Y AUTORIZACIÓN

1. **Credencial Segura de Servicio:** n8n se comunica con Supabase utilizando el rol `service_role` o usuarios de API dedicados con alcances restringidos.
2. **Consumo por Outbox:** n8n no sondea tablas de negocio directamente mediante `SELECT *` arbitrarios; procesa eventos despachados atómicamente a través de `public.transactional_outbox`.
3. **Escritura Idempotente en Inbox:** Cuando n8n recibe webhooks externos (Meta WhatsApp, pasarelas de pago, Google Calendar), escribe en `public.event_inbox` con su clave de idempotencia antes de mutar el modelo de datos.
4. **Respeto a Feature Flags:** Antes de ejecutar cualquier llamada a APIs de terceros, todo workflow consulta `public.feature_flags`. Si la bandera correspondiente (`send_enabled`, `allow_real_payments`) está en `false`, opera en modo simulación/QA seguro.

---

## 2. MATRIZ DE CONTRATOS POR FLUJO VET-CORE (21 AUTOMATIZACIONES)

| Flujo | Nombre del CORE | Evento Desencadenante (Outbox / Webhook) | Tablas Consultadas en Supabase | Tablas Mutadas en Supabase |
|-------|-----------------|------------------------------------------|--------------------------------|----------------------------|
| **CORE-01** | Assistant Onboarding | Webhook mensaje inicial de WhatsApp | `profiles`, `clients`, `app_settings` | `clients`, `conversation_sessions`, `event_inbox` |
| **CORE-02** | Smart Scheduler | `APPOINTMENT_REQUESTED` / Hold UI | `staff_availability`, `appointment_holds`, `clusters` | `appointment_holds`, `appointments` |
| **CORE-03** | Immediate Confirmation | `APPOINTMENT_CONFIRMED_OKVET_HUMAN` | `appointments`, `clients`, `patients` | `communication_logs`, `transactional_outbox` |
| **CORE-04** | Route Logistics | Cron 06:00 COT / Cambio de tráfico | `appointments`, `operational_zones`, `clusters` | `route_locations`, `daily_itineraries` |
| **CORE-05** | Pre-Visit Reminder | Cron $T-24\text{h}$ y $T-2\text{h}$ | `appointments`, `clients`, `patients` | `appointment_reminders`, `communication_logs` |
| **CORE-06** | Google Calendar Sync | `APPOINTMENT_CONFIRMED_OKVET_HUMAN` / Reschedule | `appointments`, `okvet_manual_confirmations` | `calendar_sync_logs`, `external_calendar_mappings` |
| **CORE-07** | Visit Checklist | Cambio de cita a `EN_ROUTE` | `appointments`, `backpack_checklists`, `cold_chain_logs` | `backpack_checklists`, `checklist_audit_logs` |
| **CORE-08** | In-Route Location | Ping de geolocalización de móvil | `staff_profiles`, `appointments` | `route_locations`, `eta_estimates` |
| **CORE-09** | Post-Visit Commitments | Transición de cita a `COMPLETED` | `appointments`, `post_visit_commitments` | `commitment_tasks`, `task_assignments` |
| **CORE-10** | Document Delivery | Documento médico aprobado en Lovable | `medical_documents`, `signed_consent_records` | `document_deliveries`, `communication_logs` |
| **CORE-11** | Treatment Adherence | Prescripción médica registrada | `patient_treatments`, `treatment_administrations` | `treatment_reminders`, `adherence_logs` |
| **CORE-12** | Preventive Health | Cron semanal de vacunación | `preventive_plans`, `vaccination_schedules` | `preventive_reminders`, `outreach_campaigns` |
| **CORE-13** | Specialist Referral | Solicitud de interconsulta creada | `external_specialists`, `specialist_rates` | `referral_appointments`, `specialist_offers` |
| **CORE-14** | Financial Notifications | Factura emitida / Cobro pendiente | `invoices`, `financial_transactions`, `clients` | `payment_links`, `financial_notifications` |
| **CORE-15** | Customer Experience | 48h posteriores a cita `COMPLETED` | `appointments`, `clients`, `grief_support_cases` | `customer_satisfaction_surveys`, `service_ratings` |
| **CORE-16** | Daily Executive Report | Cron diario 21:00 COT | Todas las tablas de operaciones del día | `daily_executive_snapshots`, `operational_kpis` |
| **CORE-17** | Weekly Executive Report | Cron domingos 22:00 COT | Snapshots diarios, transacciones, finanzas | `weekly_profitability_reports`, `founder_autonomy_kpis` |
| **CORE-18** | Integration Reconciliation | Cron diario 23:00 COT | `appointments`, `okvet_confirmations`, bancos | `reconciliation_runs`, `discrepancies` |
| **CORE-19** | Grief Support | Activación manual de duelo familiar | `patients`, `clients`, `grief_support_cases` | `grief_support_cases`, `suppression_rules` |
| **CORE-20** | System Backup | Cron diario 02:00 COT | Metadatos de esquemas y volcados | `system_backups`, `system_health_logs` |
| **CORE-21** | SOP & Knowledge | Actualización de POE en catálogo | `clinical_sop_library`, `sop_version_history` | `sop_embeddings`, `knowledge_indexes` |

---

## 3. PAYLOAD CANÓNICO DEL TRANSACTIONAL OUTBOX HACIA N8N

```json
{
  "eventId": "d3b07384-d113-4632-a5e3-46e30018579c",
  "organizationId": "11111111-1111-1111-1111-111111111111",
  "eventType": "APPOINTMENT_CONFIRMED_OKVET_HUMAN",
  "aggregateType": "APPOINTMENT",
  "aggregateId": "a5c78f11-4567-489a-bc01-89abcdef0123",
  "timestamp": "2026-11-21T14:30:00Z",
  "data": {
    "appointmentId": "a5c78f11-4567-489a-bc01-89abcdef0123",
    "okvetAppointmentId": "OK-2026-8849",
    "clientId": "c1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
    "patientId": "p9a8b7c6-d5e4-3f2a-1b0c-9d8e7f6a5b4c",
    "assignedVeterinarianId": "v1e2t3e4-r5i6-4n7a-8r9i-0a1n2v3e4t5s",
    "startTime": "2026-11-22T09:00:00-05:00",
    "endTime": "2026-11-22T10:00:00-05:00",
    "cluster": "Bogotá - Suba / Cedritos",
    "status": "CONFIRMED",
    "confirmedBy": "u1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c"
  }
}
```
