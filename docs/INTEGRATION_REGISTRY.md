# VET FREEDOM OS — INTEGRATION REGISTRY (REGISTRO OFICIAL DE INTEGRACIONES)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-20  

---

## 1. RESUMEN DE INTEGRACIONES EXTERNAS

| Integración | Tipo / Rol | Protocolo / Auth | Estado Técnico | Dependencia de Credenciales |
|---|---|---|---|---|
| **Supabase (PostgreSQL 17)** | Backend Sovereign / DB | MCP / API Rest / PostgREST | `VERIFIED` | Conectado (`sznvahhocgnhsqhksygq`) |
| **n8n Cloud** | Orquestador de Eventos | MCP Oficial / API Key | `VERIFIED` | Conectado (`alphavision.app.n8n.cloud`) |
| **Lovable** | Frontend Web & Móvil | Supabase Client SDK / Publishable Key | `INTEGRATED` | Clave moderna lista para vincular |
| **OKVET** | Expediente Clínico Oficial | Conciliación Asistida / Manual | `OPERATIONAL_ASSISTED` | Sin API pública directa (según diseño clínico) |
| **WhatsApp (Meta Cloud API)** | Mensajería con Propietarios | Webhook + Bearer Token | `BLOCKED_WAITING_PROD_CREDS` | Pendiente WABA ID y Token de producción |
| **Google Calendar** | Agendas de Veterinarios | OAuth 2.0 Client ID + Secret | `BLOCKED_WAITING_PROD_CREDS` | Pendiente Consent Screen & Token |
| **Google Maps / Waze** | Rutas y Geocodificación | API Key (Directions & Distance Matrix) | `BLOCKED_WAITING_PROD_CREDS` | Pendiente API Key habilitada en GCP |
| **Pasarelas de Pago (PSE/Wompi)**| Recaudo en Línea (COP) | Webhook / API Key | `BLOCKED_WAITING_PROD_CREDS` | Pendiente comercio aprobado en Colombia |
| **Google Gemini (AI Models)** | Asistente Ejecutiva y Triaje | Google Antigravity SDK | `VERIFIED` | Activo vía Antigravity Platform |

---

## 2. DETALLE TÉCNICO POR INTEGRACIÓN

### 2.1 Supabase
- **URL Base:** `https://sznvahhocgnhsqhksygq.supabase.co`
- **Modern Publishable Key:** `sb_publishable_caToaYTxjdravNvXvDuVLg_htNwLZzI`
- **Base de Datos:** PostgreSQL 17.12.0 (`us-east-1`).
- **Capacidades Activas:** 86 tablas relacionales, 100% RLS habilitado, 20 migraciones SQL registradas, Vistas invoker (`v_daily_schedule`, `v_patient_360`, `v_n8n_outbox_queue`), RPCs de Inteligencia Operativa (`get_business_snapshot`, `request_action_proposal`, etc.).
- **Políticas de Seguridad:** Acceso anónimo denegado en RPCs administrativas; control estricto de roles vía `organization_memberships`.

### 2.2 n8n Cloud
- **URL Base:** `https://alphavision.app.n8n.cloud`
- **Proyecto:** `DoPm60I3EipMm6rG`
- **Carpeta:** `EWfSa40jLDxPUOKX` ("Vet Freedom OS")
- **Workflows Activos:** 22 flujos creados y testeados empíricamente.
- **Modo Seguro:** Operando con `send_enabled: false` y `active: false` hasta aprobación explícita de pase a producción.
- **Manejo de Errores:** Sub-workflow `VET-CORE-19` captura fallas de ejecución y registra en la tabla `dead_letter_queue` de Supabase.

### 2.3 Lovable (Interfaz Web/Mobile-First)
- **Contrato:** [`docs/integrations/LOVABLE-CONTRACT.md`](file:///c:/Users/Freud/N8NVET/docs/integrations/LOVABLE-CONTRACT.md).
- **Tipado Estricto:** Tipos TypeScript autogenerados en [`types/supabase.ts`](file:///c:/Users/Freud/N8NVET/types/supabase.ts).
- **Configuración Requerida:** Inyectar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el proyecto Lovable.

### 2.4 OKVET (Expediente Clínico Oficial)
- **Regla Fundamental:** OKVET es la única autoridad clínica legal en Colombia para Vet Life.
- **Mecanismo:** El sistema registra referencias en la tabla `okvet_references` y mantiene el estado `okvet_sync_status = 'PENDING'` en las citas hasta que el médico veterinario confirma la conciliación del número de historia clínica.
- **Workflow Relacionado:** `VET-CORE-18` escanea discrepancias diariamente a las 02:00 AM.

### 2.5 WhatsApp Business Platform (Meta Cloud API)
- **Workflows:** `VET-CORE-02` (Inbound) y `VET-CORE-03` (Outbound Safe Sender).
- **Seguridad:** Verificación obligatoria de firma HMAC SHA-256 (`X-Hub-Signature-256`) sobre el cuerpo original del webhook.
- **Opt-out y Consentimiento:** Comprobación automática de consentimiento en la tabla `consents` antes de despachar mensajes salientes. Bloqueo instantáneo ante palabras clave de baja ("CANCELAR", "NO MAS", "STOP").

### 2.6 Google Calendar
- **Workflow:** `VET-CORE-06` (Calendar Sync Engine).
- **Sincronización:** Eventos de citas domiciliarias con bloqueos de tiempo de traslado previo y posterior.
- **Detección de Conflictos:** Registro en `calendar_conflicts` cuando un evento manual colisiona con una cita asignada.

---

## 3. PROCEDIMIENTO PARA ACTIVACIÓN DE CREDENCIALES BLOQUEADAS
Cuando el Dr. Luis Eduardo Ríos y Alpha Vision Method autoricen el paso a producción:
1. Configurar credenciales OAuth de Google Calendar en n8n Credentials Vault.
2. Ingresar WABA ID, Phone Number ID y Permanent Access Token de Meta en n8n Credentials Vault.
3. Habilitar `send_enabled: true` en las variables de entorno de n8n.
4. Conmutar los 22 workflows de `active: false` a `active: true`.
