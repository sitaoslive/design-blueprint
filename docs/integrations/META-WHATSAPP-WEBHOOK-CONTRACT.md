# META WHATSAPP WEBHOOK CONTRACT
## VET FREEDOM OS — Vet Life — Veterinaria a Domicilio
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** VET-CORE-02 | WhatsApp Inbound Gateway  
**Entorno:** Google Antigravity + n8n Cloud + Meta Cloud API  
**Estado:** VERIFICADO EN QA / SANDBOX SEGURO (active: false, send_enabled: false)

---

## 1. DESCRIPCIÓN GENERAL
Este documento especifica el contrato de interfaz entre la Meta Cloud API (WhatsApp Business Platform) y el gateway de entrada de VET FREEDOM OS orquestado en n8n Cloud (`/webhook/whatsapp/inbound`).

Define los protocolos de:
1. Verificación inicial de suscripción (GET Handshake).
2. Autenticación y verificación criptográfica de firma (POST HMAC SHA-256).
3. Estructura de payloads multiformato (Texto, Audio, Imagen, Documento, Ubicación GPS, Botones y Listas interactivas).
4. Manejo de recibos de estado de entrega (`sent`, `delivered`, `read`).

---

## 2. VERIFICACIÓN DE SUSCRIPCIÓN (GET HANDSHAKE)

Meta envía una solicitud HTTP GET periódica o inicial para validar el endpoint:

### Parámetros de Query
- `hub.mode`: Debe ser estrictamente `'subscribe'`.
- `hub.verify_token`: Token secreto configurado en el Meta App Dashboard (`vet_freedom_os_meta_token_secret`).
- `hub.challenge`: Cadena alfanumérica aleatoria generada por Meta.

### Comportamiento del Gateway
- Si `hub.verify_token` coincide con la credencial autorizada: Retorna HTTP 200 con el cuerpo plano que contiene exactamente el valor de `hub.challenge`.
- Si `hub.verify_token` no coincide: Retorna HTTP 403 Forbidden inmediatamente.

---

## 3. AUTENTICACIÓN CRIPTOGRÁFICA (POST HMAC SHA-256)

Cada evento POST entrante emitido por Meta incluye una cabecera HTTP de firma digital:

```http
X-Hub-Signature-256: sha256=<hex_digest>
```

### Protocolo de Validación
1. n8n toma el cuerpo de la solicitud en crudo (`rawBody`).
2. Se computa el HMAC utilizando el algoritmo `SHA-256` y la clave secreta `META_APP_SECRET`.
3. Se compara en tiempo constante (`crypto.timingSafeEqual`) la firma calculada con la provista en la cabecera.
4. Si hay discrepancia, el mensaje se rechaza con HTTP 401 Unauthorized y se registra en `VET-CORE-19` como intento de intrusión o payload corrupto.

---

## 4. ESTRUCTURA DE PAYLOADS DE ENTRADA (META CLOUD API)

### 4.1. Mensaje de Texto Plano
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID_001",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "573105550199",
          "phone_number_id": "PHONE_NUMBER_ID_001"
        },
        "contacts": [{
          "profile": { "name": "Carolina Restrepo" },
          "wa_id": "573105550199"
        }],
        "messages": [{
          "from": "573105550199",
          "id": "wamid.HBgLNTczMTA1NTUwMTk5FQIAERgSRjgyRDcxNkFFNjQ1NDQzN0U1AA==",
          "timestamp": "1774180000",
          "type": "text",
          "text": { "body": "Hola, necesito agendar una cita para Toby mañana en la mañana" }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### 4.2. Mensaje de Audio (Nota de Voz)
```json
{
  "messages": [{
    "from": "573105550199",
    "id": "wamid.AUDIO_SAMPLE_001",
    "timestamp": "1774180005",
    "type": "audio",
    "audio": {
      "id": "media_audio_id_12345",
      "mime_type": "audio/ogg; codecs=opus"
    }
  }]
}
```

### 4.3. Ubicación GPS
```json
{
  "messages": [{
    "from": "573105550199",
    "id": "wamid.LOCATION_SAMPLE_001",
    "timestamp": "1774180010",
    "type": "location",
    "location": {
      "latitude": 4.698712,
      "longitude": -74.041134,
      "name": "Residencia Dr. Luis",
      "address": "Calle 140 # 11-20, Bogotá"
    }
  }]
}
```

### 4.4. Estado de Entrega (Delivery Receipt)
```json
{
  "statuses": [{
    "id": "wamid.OUTBOUND_MSG_99",
    "status": "delivered",
    "timestamp": "1774180015",
    "recipient_id": "573105550199",
    "conversation": {
      "id": "meta_conv_id_01",
      "origin": { "type": "user_initiated" }
    }
  }]
}
```

---

## 5. DEDUPLICACIÓN Y RESILENCIA
- **Identificador de Deduplicación:** `wamid` (`entry[0].changes[0].value.messages[0].id`).
- **Garantía:** Índice único parcial `idx_messages_external_id_unique` en `public.messages(external_message_id)`.
- Si Meta reintenta la entrega por latencia de red, la base de datos ignora la inserción duplicada y responde con estado idempotente `DUPLICATE_IGNORED`.
