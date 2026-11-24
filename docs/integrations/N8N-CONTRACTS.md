# VET FREEDOM OS — CONTRATOS DE INTEGRACIÓN N8N (21 CAPACIDADES CORE)
**Proyecto:** Vet Life — Veterinaria a Domicilio  
**Orquestador:** n8n Cloud (`https://alphavision.app.n8n.cloud`)  
**Proyecto n8n:** `DoPm60I3EipMm6rG` | **Smoke Test ID:** `8FxcpmC7HV0zdRQJ`  
**Backend:** Supabase PostgreSQL 17 (`sznvahhocgnhsqhksygq`)  
**Fecha:** 2026-11-20  

---

## 1. MECANISMO DE INTEGRACIÓN Y CONTRATO OUTBOX

Todas las automatizaciones asíncronas entre Supabase y n8n operan mediante el patrón **Transactional Outbox**:
1. **Despacho Atómico:** Supabase registra el evento en `public.transactional_outbox` con una clave criptográfica `idempotency_key = sha256(aggregate_id + event_type + timestamp)`.
2. **Reclamación por n8n:** n8n consulta la vista `public.v_n8n_outbox_queue` o un webhook seguro para reclamar eventos con `status = 'PENDING'`.
3. **Idempotencia en n8n:** Antes de ejecutar cualquier llamada a WhatsApp o proveedores, n8n verifica si la clave existe en `public.processed_events`. Si ya existe, descarta la ejecución duplicada.
4. **Cierre de Ciclo:** Al finalizar con éxito, n8n actualiza `transactional_outbox.status = 'PROCESSED'` y registra `public.processed_events`.

---

## 2. CATÁLOGO DE CONTRATOS: LAS 21 CAPACIDADES CORE

### VET-CORE-01 — AI Connection Smoke Test
- **ID en n8n Cloud:** `8FxcpmC7HV0zdRQJ`
- **Estado:** `VALIDADO` (En pruebas QA completadas con ramas positiva y negativa).
- **Evento Iniciador:** Manual Trigger / Webhook de diagnóstico.
- **Payload:** `{ project: "VET_FREEDOM_OS", environment: "TEST", test_enabled: true, event_id: "vet-qa-001" }`
- **Respuesta:** `{ status: "accepted", message: "Smoke test passed" }`

### VET-CORE-02 — WhatsApp Triage & Conversation Router
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Webhook de Meta Cloud API (`messages`).
- **Endpoint n8n:** `POST /webhook/vet-whatsapp-inbound`
- **Autenticación:** Verificación HMAC SHA-256 (`X-Hub-Signature-256`).
- **Acción:** Inserta en `public.conversations` y `public.messages`. Si `is_bot_locked = false`, evalúa intención con modelo IA o enruta a agente humano (`conversation_transfers`).

### VET-CORE-03 — Appointment Request Processing
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Outbox `APPOINTMENT_REQUESTED` desde Lovable o WhatsApp.
- **Acción:** Valida cobertura geográfica en `public.branches.coverage_zones` y emite propuesta de horario en `public.appointment_holds`.

### VET-CORE-04 — Multi-Vet Smart Calendar Sync
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Poller programado (cada 15 min) o Webhook Google Calendar Push.
- **Acción:** Sincroniza `public.external_calendar_events` en modo `BUSY_ONLY`. Si detecta solapamiento con citas, registra `public.calendar_conflicts`.

### VET-CORE-05 — OKVET Clinical Record Validation & Sync
- **Estado:** `CONFIGURADO EN BASE DE DATOS` (Modalidad `MANUAL ASSISTED`)
- **Evento Iniciador:** Outbox `APPOINTMENT_PENDING_OKVET` o carga de lote.
- **Acción:** Valida que exista `public.okvet_references` antes de permitir la transición a `CONFIRMED_OFFICIAL`.

### VET-CORE-06 — Domiciliary Route Optimization
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Cron diario (6:00 AM) o evento `ROUTE_REOPTIMIZATION_REQUESTED`.
- **Acción:** Ordena paradas en `public.route_stops` calculando tiempos de traslado en Bogotá y emite alertas en `public.route_alerts`.

### VET-CORE-07 — Visit Check-in & Real-time ETA Dispatch
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Outbox `VET_EN_ROUTE` o `VISIT_CHECKIN`.
- **Acción:** Calcula tiempo estimado de llegada y despacha mensaje WhatsApp al cliente (`outbound_dispatch_requests`).

### VET-CORE-08 — Post-Visit Clinical Commitments Follow-up
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Outbox `VISIT_COMPLETED`.
- **Acción:** Genera compromisos en `public.post_visit_commitments` y programa recordatorios en `public.post_visit_reminders`.

### VET-CORE-09 — Payment Verification & Cash Reconciliation (COP)
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Webhook de pasarela (Wompi/PSE) o comprobante subido en `public.payment_collections`.
- **Acción:** Notifica al rol Finanzas para revisión en `public.payment_verifications` o actualiza a `VERIFIED_FINANCE`.

### VET-CORE-10 — Preventive Due Dates & Vaccine Reminders
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Cron diario (8:00 AM).
- **Acción:** Consulta `public.preventive_due_dates` con `status = 'PENDING'` y `due_date <= CURRENT_DATE + 7 días`. Valida que el paciente no esté en `bereavement_records` y despacha recordatorio.

### VET-CORE-11 — Recurring Care Adherence Monitor
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Cron semanal.
- **Acción:** Verifica cumplimiento de sesiones en `public.recurring_treatment_plans` y alerta en caso de abandono terapéutico.

### VET-CORE-12 — Bereavement Protocol & Marketing Suppression
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Outbox `PET_DECEASED`.
- **Acción:** Registra en `public.bereavement_records`, cancela de inmediato citas futuras en `public.appointments`, desactiva recordatorios y bloquea marketing por 365 días.

### VET-CORE-13 — NPS & Customer Satisfaction Survey Dispatch
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Outbox `VISIT_COMPLETED` (después de 3 horas).
- **Acción:** Envía encuesta breve de 1 a 10. Las respuestas se almacenan en `public.feedback_surveys`. Si NPS <= 6, alerta al Coordinador.

### VET-CORE-14 — Emergency Triage & Real-time Reallocation
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Solicitud con `triage_level = 'EMERGENCY_IMMEDIATE'`.
- **Acción:** Localiza al médico veterinario más cercano con disponibilidad y genera `route_reoptimization_requests`.

### VET-CORE-15 — Cold-Chain Inventory & Vehicle Kit Alerts
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Salida de biológicos en `public.supply_movements`.
- **Acción:** Monitorea existencias en `public.vehicle_inventory_allocations` y alerta si el stock baja del umbral mínimo.

### VET-CORE-16 — Specialist Referral & Booking Coordination
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Outbox `REFERRAL_APPROVED_BY_DIRECTOR`.
- **Acción:** Notifica al especialista aliado y genera `specialist_slot_holds` provisionales para ofrecer al cliente.

### VET-CORE-17 — Schedule Simulator Engine Runner
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Solicitud en `public.schedule_simulations`.
- **Acción:** Genera snapshot inmutable en `public.simulation_snapshots`, ejecuta heurística de asignación y guarda propuestas en `public.simulation_scenarios`.

### VET-CORE-18 — Executive Daily Briefing (Dr. Luis)
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Cron diario (7:00 AM).
- **Acción:** Compila citas del día, médicos en ruta, urgencias pendientes y métricas financieras de recaudo para el Dr. Luis.

### VET-CORE-19 — Dead Letter Queue & Failure Handler
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Evento en outbox que alcanza `retry_count >= 5`.
- **Acción:** Mueve registro a `public.dead_letter_queue` y envía alerta de alta prioridad al canal de soporte técnico.

### VET-CORE-20 — Integration Health & Uptime Monitoring
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Cron cada hora.
- **Acción:** Verifica conexión con Supabase, API de WhatsApp y estado de tokens OAuth, registrando en `public.system_event_logs`.

### VET-CORE-21 — Database Backup & Integrity Verification
- **Estado:** `CONFIGURADO EN BASE DE DATOS`
- **Evento Iniciador:** Cron dominical (1:00 AM).
- **Acción:** Comprueba snapshots de Supabase y valida consistencia de claves foráneas y RLS.
