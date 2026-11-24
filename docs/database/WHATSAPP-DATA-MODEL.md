# WHATSAPP DATA MODEL & SUPABASE PERSISTENCE
## VET FREEDOM OS — Vet Life — Veterinaria a Domicilio
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Plataforma:** PostgreSQL 17 + Supabase  
**Migración:** `025_whatsapp_inbound_and_conversations.sql`  
**Estado:** DESPLEGADO Y VERIFICADO (100% RLS ACTIVO)

---

## 1. TABLAS PRINCIPALES

### 1.1. `public.conversations`
Mantiene el estado de la sesión de mensajería con el cliente dentro de la ventana de atención.
- `id` (uuid, PK): Identificador único de conversación.
- `organization_id` (uuid, FK): Aislamiento multi-tenant.
- `customer_id` / `owner_id` (uuid, FK): Propietario identificado.
- `channel` (text): `'WHATSAPP'`, `'WEB'`, etc.
- `channel_phone` (text): Teléfono E.164 (`+573105550199`).
- `status` (text): `'OPEN'`, `'WAITING_HUMAN'`, `'CLOSED'`, `'RESOLVED'`.
- `is_bot_locked` (boolean): `true` cuando un humano tiene el control o se activó triage de emergencia.
- `session_window_expires_at` (timestamptz): Ventana de 24 horas de Meta.
- `metadata` (jsonb): Preferencias de cliente, flags de duelo, historial de bloqueos.

### 1.2. `public.messages`
Registro inmutable de cada mensaje recibido o emitido.
- `id` (uuid, PK): Identificador interno.
- `conversation_id` (uuid, FK): Conversación vinculada.
- `direction` (text): `'INBOUND'` (cliente -> clínica) o `'OUTBOUND'` (clínica -> cliente).
- `sender_type` (text): `'CUSTOMER'`, `'BOT'`, `'AGENT'`, `'SYSTEM'`.
- `message_type` (text): `'TEXT'`, `'AUDIO'`, `'IMAGE'`, `'DOCUMENT'`, `'LOCATION'`, `'INTERACTIVE'`.
- `content` (text): Texto transcrito o cuerpo plano.
- `external_message_id` (text): `wamid` oficial de WhatsApp Meta Cloud API.
- `delivery_status` (text): Restricción estricta `('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED')`.
- `metadata` (jsonb): URLs de archivos en Supabase Storage, coordenadas GPS, audio duration.

### 1.3. `public.transactional_outbox`
Garantía transaccional Exactly-Once entre PostgreSQL y los orquestadores externos.
- `event_type`: `'whatsapp.message.received'`, `'clinical.emergency.detected'`, `'whatsapp.handoff.requested'`.
- `status`: `'PENDING'`, `'PROCESSING'`, `'COMPLETED'`, `'FAILED'`.

---

## 2. ÍNDICES DE RENDIMIENTO Y UNICIDAD
1. `idx_messages_external_id_unique`:
   `CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_external_id_unique ON public.messages(external_message_id) WHERE external_message_id IS NOT NULL;`
   Garantiza deduplicación determinista a nivel de motor SQL.
2. `idx_owners_primary_phone` & `idx_owners_secondary_phone`:
   Permite resolución de identidad de clientes en < 5ms sobre miles de registros.
3. `idx_conversations_channel_phone`:
   Búsqueda veloz de sesión activa dentro de ventana temporal.

---

## 3. POLÍTICA DE SEGURIDAD (RLS)
- El 100% de las tablas tiene RLS activado.
- Consultas restringidas por `organization_id` mediante `auth.uid()` y políticas multi-tenant.
- Procedimientos almacenados (`SECURITY DEFINER`) validan la pertenencia del tenant antes de cualquier mutación o lectura.
