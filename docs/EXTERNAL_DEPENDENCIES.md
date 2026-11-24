# VET FREEDOM OS — EXTERNAL DEPENDENCIES (DEPENDENCIAS EXTERNAS Y CONECTORES)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-20  

---

## 1. INVENTARIO DE DEPENDENCIAS Y SERVICIOS EXTERNOS

| Proveedor / Servicio | Protocolo / Interfaz | Entorno Actual | Credenciales Requeridas | Modo de Operación en Desarrollo |
|---|---|---|---|---|
| **Supabase Cloud** | PostgreSQL 17 / PostgREST | `OPERATIONAL` | Conectado vía MCP (`sznvahhocgnhsqhksygq`) | En vivo (Base de datos de desarrollo y QA) |
| **n8n Cloud** | Cloud Orchestrator / MCP | `OPERATIONAL` | Conectado vía MCP (`alphavision.app.n8n.cloud`) | En vivo (22 Workflows en carpeta Vet Freedom OS) |
| **Meta Cloud API (WhatsApp)** | HTTPS REST / Webhook | `BLOCKED_WAITING_PROD_CREDS` | WABA ID, Phone Number ID, Permanent System User Token | `send_enabled: false` (Simulación de salida en outbox) |
| **Google Calendar** | Google Cloud OAuth 2.0 | `BLOCKED_WAITING_PROD_CREDS` | Client ID, Client Secret, Refresh Token | Sincronización registrada en base de datos local |
| **Google Maps Platform** | Geocoding & Distance Matrix | `BLOCKED_WAITING_PROD_CREDS` | Google Maps API Key con facturación activa | Cálculo euclidiano estimado y rutas tabuladas |
| **OKVET** | Sistema Clínico Oficial | `MANUAL_ASSISTED` | No aplica (Conciliación asistida por personal médico) | Registro de ID oficial en tabla `okvet_references` |
| **Pasarelas de Pago (Wompi/PSE)** | Webhook de Eventos / API REST | `BLOCKED_WAITING_PROD_CREDS` | Public Key, Private Key, Integrity Secret | Registro de comprobantes en `payment_collections` |
| **Google Gemini (AI Models)** | Generative AI via Antigravity | `OPERATIONAL` | Integrada en el entorno Google Antigravity | En vivo (Inferencia de Asistente Ejecutiva y Triaje) |

---

## 2. GUÍA DE CONFIGURACIÓN DE CREDENCIALES CUANDO ESTÉN DISPONIBLES

### 2.1 Meta Cloud API (WhatsApp Business)
- **Dónde configurar:** Bóveda de credenciales de n8n (`Header Auth` o credencial nativa `WhatsApp Business Cloud`).
- **Parámetros:**
  - `Access Token`: Token de usuario del sistema permanente generado en Meta Business Manager.
  - `Phone Number ID`: Identificador numérico del teléfono de atención de Vet Life.
  - `App Secret`: Secreto de aplicación para validar firma HMAC SHA-256 en webhooks de entrada.
- **Webhook URL:** `https://alphavision.app.n8n.cloud/webhook/whatsapp/inbound`

### 2.2 Google Calendar OAuth 2.0
- **Dónde configurar:** n8n Credentials Vault (`Google Calendar OAuth2 API`).
- **Permisos requeridos (Scopes):** `https://www.googleapis.com/auth/calendar` y `https://www.googleapis.com/auth/calendar.events`.
- **Configuración de Calendarios:** IDs de calendarios de veterinarios en la tabla `staff_calendar_connections`.

### 2.3 Google Maps Platform
- **Dónde configurar:** Variable de entorno en Supabase Edge Functions o n8n.
- **APIs Habilitadas:**
  - Geocoding API (para normalizar direcciones en Bogotá).
  - Distance Matrix API (para estimar tiempos reales de traslado en vehículo según tráfico).

---

## 3. ESTRATEGIA DE RESILIENCIA Y CONTINGENCIA ANTE CAÍDAS EXTERNAS

1. **Caída de WhatsApp / Meta:**
   - Si la API de Meta responde con error o latencia alta, n8n reintenta hasta 3 veces con retroceso exponencial.
   - Si persiste, el mensaje se transfiere a la tabla `dead_letter_queue` y el personal de recepción recibe alerta para contacto telefónico directo.
2. **Caída de Google Calendar:**
   - La cita permanece confirmada en Supabase (fuente soberana). La discrepancia se marca en `calendar_sync_state` con `sync_status = 'ERROR'` para reintento automático por `VET-CORE-18`.
3. **Falta de Conectividad Móvil del Veterinario:**
   - La aplicación Lovable permite modo offline para registro de visita domiciliaria; los datos se sincronizan al recuperar señal.
