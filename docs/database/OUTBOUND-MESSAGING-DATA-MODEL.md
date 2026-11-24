# MODELO DE DATOS DE MENSAJERÍA SALIENTE Y ENTREGAS (VET-CORE-03)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-03 | WhatsApp Outbound`  
**Base de Datos:** Supabase PostgreSQL 17 (`sznvahhocgnhsqhksygq`)  
**Migración Base:** `027_whatsapp_outbound_and_delivery_management.sql`  
**Seguridad:** 100% RLS Activo en todas las tablas

---

## 1. Tablas Principales

### A. `public.outbound_dispatch_requests`
Almacena cada intento de comunicación saliente con su ciclo de vida y políticas de cumplimiento:
- `id` (uuid, PK)
- `organization_id` (uuid, FK a `organizations`)
- `conversation_id` (uuid, FK a `conversations`)
- `recipient_phone` (text, not null)
- `recipient_name` (text)
- `sender_phone_number_id` (text, not null)
- `message_category` (text, not null: `UTILITY`, `AUTHENTICATION`, `MARKETING`)
- `message_purpose` (text, not null)
- `template_id` (uuid, FK a `message_templates`)
- `template_parameters` (jsonb)
- `freeform_text` (text)
- `business_entity_type` (text: `APPOINTMENT`, `REFERRAL`, `PAYMENT`, `SURVEY`)
- `business_entity_id` (uuid)
- `draft_state_version` (integer)
- `status` (text, 19 estados controlados por CHECK)
- `dispatch_attempts` (integer, default 0)
- `idempotency_key` (text, not null, UNIQUE)
- `correlation_id` (text)
- `provider_message_id` (text)
- `http_status` (integer)
- `raw_provider_response` (jsonb)
- `claimed_by` (text)
- `claimed_at` (timestamptz)
- `completed_at` (timestamptz)
- `expires_at` (timestamptz)
- `created_at` (timestamptz)

### B. `public.whatsapp_conversation_windows`
Registra la ventana de atención al cliente de 24 horas de Meta:
- `id` (uuid, PK)
- `organization_id` (uuid, FK a `organizations`)
- `recipient_phone` (text, not null)
- `last_incoming_at` (timestamptz, not null)
- `window_expires_at` (timestamptz, not null)
- `last_message_id` (uuid, FK a `messages`)
- Unique: `(organization_id, recipient_phone)`

### C. `public.whatsapp_contact_suppressions`
Lista de exclusión y supresión para protección de tutores y pacientes:
- `id` (uuid, PK)
- `organization_id` (uuid, FK a `organizations`)
- `phone_number` (text, not null)
- `suppression_reason` (text: `BEREAVEMENT`, `OPT_OUT_MARKETING`, `OPEN_COMPLAINT`, `CAREGIVER_REVOKED`, `ADMINISTRATIVE_BLOCK`)
- `active` (boolean, default true)
- `expires_at` (timestamptz)
- `metadata` (jsonb)
- Unique: `(organization_id, phone_number, suppression_reason)`

### D. `public.whatsapp_delivery_events`
Almacena el historial inmutable de recibos de entrega recibidos de Meta:
- `id` (uuid, PK)
- `organization_id` (uuid, FK a `organizations`)
- `provider_message_id` (text, not null)
- `event_type` (text: `sent`, `delivered`, `read`, `failed`)
- `recipient_id` (text)
- `provider_timestamp` (timestamptz)
- `error_code` (integer)
- `raw_payload` (jsonb)
- Unique: `(provider_message_id, event_type)`

### E. `public.message_templates`
Catálogo oficial de plantillas aprobadas por Meta para Vet Life:
- `id` (uuid, PK)
- `organization_id` (uuid, FK a `organizations`)
- `template_name` (text, not null)
- `template_code` (text, not null)
- `category` (text: `UTILITY`, `AUTHENTICATION`, `MARKETING`)
- `language` (text, default `'es_CO'`)
- `status` (text: `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `PAUSED`)
- `body_text` (text, not null)
- `parameters_schema` (jsonb)
- Unique: `(organization_id, template_name, language)`

---

## 2. Procedimientos Almacenados (RPCs)
1. `public.update_whatsapp_conversation_window(p_org_id, p_phone, p_msg_id, p_timestamp)`: Actualiza o inserta la ventana de 24 horas.
2. `public.claim_authorized_outbound_message(p_request_id, p_worker_id)`: Reclamo atómico con bloqueo exclusivo de fila (`FOR UPDATE`), evaluación integral de políticas (consentimiento, duelo, ventana, exclusión de marketing, colisión con toma de control humano).
3. `public.record_provider_send_result(p_request_id, p_http_status, p_provider_msg_id, p_raw_resp)`: Mapea HTTP 200 a `PROVIDER_ACCEPTED` o fallos de red a `RECONCILIATION_REQUIRED`. Inserta el registro en `public.messages`.
4. `public.process_whatsapp_delivery_status(p_provider_msg_id, p_status, p_timestamp, p_recipient_id, p_error_code, p_raw_payload)`: Ingesta recibos webhook, previene duplicados y actualiza el mensaje garantizando jerarquía de no-degradación.
5. `public.cancel_obsolete_outbound_request(p_request_id, p_reason)`: Cancela mensajes aún no despachados cuando una cita es reagendada o revocada.
