# VET LIFE — AUTOMATION CATALOG (CATÁLOGO MAESTRO DE WORKFLOWS N8N)
**Plataforma:** VET FREEDOM OS  
**Instancia Oficial:** n8n Cloud (`https://alphavision.app.n8n.cloud`)  
**Fecha de Publicación:** 2026-11-23  

---

## 1. Principio de Desacoplamiento Duradero
Vet Freedom OS utiliza el patrón **Transactional Outbox**:
1. Toda mutación en Supabase emite un evento inmutable a `transactional_outbox`.
2. n8n reclama eventos de forma atómica mediante la RPC `claim_outbox_events` con `FOR UPDATE SKIP LOCKED`.
3. Una falla de red o caída de n8n no destruye el evento: se reintenta con retroceso exponencial (`MOD-19`).
4. Al procesarse con éxito, n8n confirma con `complete_outbox_event`.

---

## 2. Inventario Consolidado de los 21 Workflows VET-CORE

| ID Workflow | Archivo JSON Local | Propósito de Negocio | Disparador (Trigger) | Servicios Externos | Política de Reintento |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VET-CORE-01** | `VET-CORE-01.json` | Despacho Transaccional y Bus de Eventos | Cron cada 60s / Webhook Outbox | Supabase Postgres | 5 reintentos -> DLQ |
| **VET-CORE-02** | `VET-CORE-02.json` | Ingestión y Normalización Inbound WhatsApp | Webhook Meta Cloud API | WhatsApp API, Supabase | Idempotencia por `wamid` |
| **VET-CORE-03** | `VET-CORE-03.json` | Despacho Outbound WhatsApp y Gestión de Ventana 24h | Evento `whatsapp.outbound.queued` | Meta Cloud API | 3 reintentos inmediatos |
| **VET-CORE-04** | `VET-CORE-04.json` | Escalamiento Handoff a Humanos y Supresión de Bot | Evento `conversation.escalated` | Slack / Webhook Staff | Notificación urgente |
| **VET-CORE-05** | `VET-CORE-05.json` | Ciclo de Vida de Citas y Puerta de Enlace OKVET | Evento `appointment.requested` | OKVET Bridge, WhatsApp | Gate de confirmación humana |
| **VET-CORE-06** | `VET-CORE-06.json` | Sincronización Google Calendar (Privacidad BUSY_ONLY)| Webhook Google Push / Cron | Google Calendar API | Detección de 410 Gone |
| **VET-CORE-07** | `VET-CORE-07.json` | Tareas Operativas, Modo Ausencia y Handoff de Turno | Evento `operational.task.created` | Supabase RPCs | Escalamiento por SLA |
| **VET-CORE-08** | `VET-CORE-08.json` | Logística de Rutas Domiciliarias y Telemetría Waze | Evento `route.dispatch.requested` | Waze Deeplink / Google Maps | Recálculo de retrasos |
| **VET-CORE-09** | `VET-CORE-09.json` | Planes de Cuidados Recurrentes y Prevención Abandono| Cron Diario 06:00 COT | Supabase, WhatsApp | Ventanas clínicas protegidas|
| **VET-CORE-10** | `VET-CORE-10.json` | Planes Preventivos, Cadena de Frío y Lotes | Evento `preventive.plan.due` | Supabase, WhatsApp | Validación térmica 2-8°C |
| **VET-CORE-11** | `VET-CORE-11.json` | Coordinación de Especialistas y Gate de Evidencia | Evento `referral.initiated` | Correo / WhatsApp Especialista | Cierre verificado |
| **VET-CORE-12** | `VET-CORE-12.json` | Compromisos Post-Visita y Continuidad Clínica | Evento `visit.completed` | Supabase, WhatsApp | Máquina de 20 estados |
| **VET-CORE-13** | `VET-CORE-13.json` | Entrega Segura de Documentos y Token Efímero 24h | Evento `document.approved` | Supabase Storage, Meta API | SHA-256 verificado |
| **VET-CORE-14** | `VET-CORE-14.json` | Operaciones Financieras, Facturación y Gate Duelo | Evento `invoice.generated` | DIAN Gateway, WhatsApp | Supresión compasiva |
| **VET-CORE-15** | `VET-CORE-15.json` | Seguimiento CX, Service Recovery y Reseñas | Evento `visit.post_48h` | WhatsApp Template | Anti-review-gating |
| **VET-CORE-16** | `VET-CORE-16.json` | Inteligencia Ejecutiva Diaria Dr. Luis | Cron Diario 20:00 COT | Supabase RPCs, Telegram/WA | Snapshot inmutable v1 |
| **VET-CORE-17** | `VET-CORE-17.json` | Reporte Semanal y Autonomía del Fundador | Cron Domingo 19:00 COT | Supabase RPCs, PDF Builder | Métricas de rentabilidad |
| **VET-CORE-18** | `VET-CORE-18.json` | Conciliación de Drift e Integraciones Cruzadas | Cron Diario 02:00 COT | Supabase, OKVET Snapshot | 30 categorías de drift |
| **VET-CORE-19** | `VET-CORE-19.json` | Resiliencia, Reintentos y Dead Letter Queue | Evento `integration.incident.created` | Slack Alertas, Supabase | Exponencial backoff |
| **VET-CORE-20** | `VET-CORE-20.json` | Monitoreo de Salud Técnica (Watchdog 7 Servicios) | Cron cada 5 minutos | Sondas HTTP, Supabase, n8n | Snapshot de salud |
| **VET-CORE-21** | `VET-CORE-21.json` | Coordinación de Respaldos y Mantenimiento | Cron Semanal 01:00 COT | Supabase Storage Backup | Test de restaurabilidad |

---

## 3. Aislamiento y Seguridad en n8n
- **Aislamiento Multi-Tenant:** Cada payload JSON inyecta el `organization_id`. n8n nunca ejecuta operaciones cruzadas sin validar el tenant emisor.
- **Modo Seguro (Safe Mode):** La bandera global `send_enabled = false` previene el envío accidental de mensajes reales a clientes durante pruebas.
- **Cero Credenciales en Texto Plano:** Todas las claves de API residen en el gestor de credenciales encriptado de n8n Cloud y variables de entorno seguras.
