# PROCEDIMIENTO DE RECONCILIACIÓN DE MENSAJERÍA WHATSAPP (VET-CORE-03)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-03 | WhatsApp Reconciliation & Uncertainty Management`  
**Zona Horaria:** `America/Bogota` (UTC-5)

---

## 1. Principio de Incertidumbre en Mensajería Distribuida
En comunicaciones asíncronas con APIs externas (como Meta Cloud API), pueden presentarse tres estados de resultado tras una llamada HTTP POST:
1. **Éxito Confirmado (HTTP 200/201):** Meta aceptó el mensaje para encolado y entrega. Se asigna `provider_message_id = 'wamid...'` y estado `PROVIDER_ACCEPTED`. (Nota: el mensaje ha sido aceptado por los servidores de Meta, pero aún no se garantiza que haya llegado al teléfono físico del cliente).
2. **Fallo Confirmado (HTTP 4xx):** Parámetros inválidos, plantilla no aprobada o cuenta suspendida. El mensaje pasa inmediatamente a `FAILED`.
3. **Incertidumbre de Red (HTTP 504 Gateway Timeout, ECONNRESET, ETIMEDOUT):** La solicitud salió de n8n, pero la respuesta no llegó a tiempo. No se puede saber si Meta procesó el mensaje o si se perdió antes de entrar a su infraestructura.

---

## 2. Tratamiento del Estado `RECONCILIATION_REQUIRED`
Cuando un despacho experimenta un fallo de tipo 3:
- **Estado Asignado:** `RECONCILIATION_REQUIRED`.
- **Regla de Oro:** **PROHIBIDO EL REINTENTO A CIEGAS (Blind Retries Blocked).** Realizar un reintento inmediato provocaría que el tutor reciba mensajes duplicados (ejemplo: cobrar dos veces o enviar dos confirmaciones).
- **Protocolo de Reconciliación Pasiva:**
  1. Meta envía webhooks de estado (`sent`, `delivered`, `failed`) de forma asíncrona a `POST /webhook/whatsapp/delivery-status`.
  2. Si el mensaje fue procesado por Meta a pesar del timeout, llegará un evento webhook con el `provider_message_id`.
  3. El procedimiento `process_whatsapp_delivery_status` identifica el mensaje mediante correlación de clave de idempotencia o teléfono + ventana temporal y lo transiciona a `DELIVERED`.
- **Protocolo de Reconciliación Activa (Job Diario 23:00 COT):**
  Un cron job de mantenimiento busca mensajes que permanezcan en `RECONCILIATION_REQUIRED` por más de 2 horas. Si no se recibió ningún recibo webhook, se valida el registro de la conversación y se marca el mensaje como `FAILED_UNCERTAIN`, alertando al coordinador de citas.
