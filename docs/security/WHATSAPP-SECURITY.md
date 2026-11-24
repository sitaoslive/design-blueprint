# SEGURIDAD Y PRIVACIDAD EN WHATSAPP INBOUND (VET-CORE-02)
## VET FREEDOM OS — Vet Life — Veterinaria a Domicilio
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Cumplimiento Normativo:** Ley 1581 de 2012 (Habeas Data Colombia) & Decreto 1377 de 2013  
**Estado:** AUDITADO Y VERIFICADO AL 100%

---

## 1. VERIFICACIÓN DE ORIGEN Y FIRMAS CRIPTOGRÁFICAS
1. **Firma HMAC SHA-256 de Meta:** Todos los webhooks entrantes en producción validan el encabezado `x-hub-signature-256` utilizando el secreto de la aplicación Meta (`META_APP_SECRET`). Si la firma difiere o el payload fue alterado en tránsito, el evento se rechaza con código HTTP 401 Unauthorized en tiempo constante (`timingSafeEqual`) para prevenir ataques de temporización.
2. **Handshake de Verificación (`hub.challenge`):** Solo las solicitudes GET que presenten el token de verificación preconfigurado (`hub.verify_token`) son aceptadas; las demás se rechazan con código HTTP 403 Forbidden.
3. **Protección DoS por Tamaño:** Cargas superiores a 5MB se descartan con HTTP 413.

---

## 2. PROTECCIÓN DE DATOS PERSONALES Y CLÍNICOS (PII)
- Los números de teléfono se normalizan estrictamente al estándar internacional E.164 (`+57...`).
- La correspondencia entre teléfono y tutor (`public.owners`) se realiza bajo aislamiento multi-tenant por `organization_id`.
- Los datos de tutores y mascotas no se exponen en logs ni en prompts externos de IA.
- **Protección de Cuidadores Revocados:** Si un cuidador pierde autorización, el sistema invalida inmediatamente su acceso a historias clínicas y citas, bloqueando la IA y derivando a revisión humana.
- **Protocolo de Habeas Data (Opt-Out):** Toda solicitud de exclusión de listas promocionales es persistida de inmediato marcando `opt_out = true`, suprimiendo de inmediato envíos de marketing.

---

## 3. DEFENSAS CONTRA PROMPT INJECTION Y ABUSO DE IA
- Los mensajes entrantes pasan por un filtro de sanitización y detección de patrones de manipulación adversarial (ej. *"ignora tus instrucciones previas"*, *"system prompt"*, *"developer mode"*).
- La IA ejecuta exclusivamente funciones de solo lectura o solicitudes de pre-reserva definidas en el `AI-TOOLS-CONTRACT`.
- No existe ninguna herramienta expuesta al LLM que permita alterar tratamientos clínicos, recetar medicamentos o publicar diagnósticos médicos.

---

## 4. ROW LEVEL SECURITY (RLS) Y PROTECCIÓN DE ARCHIVOS
- El 100% de las tablas (`public.conversations`, `public.messages`, `public.owners`, `public.pets`) cuentan con RLS activo.
- Las funciones atómicas `ingest_whatsapp_inbound_message`, `set_conversation_bot_lock` y `get_conversation_context` se ejecutan bajo `SECURITY DEFINER` con `search_path = public` estricto para evitar ataques de inyección o escalada de privilegios.
- **Storage Buckets Privados:** Los buckets `medical-records`, `referral-documents` y `system-backups-metadata` tienen acceso público desactivado (`public: false`). Los archivos multimedia solo se acceden mediante URLs firmadas con tiempo de vida limitado.

---

## 5. POLÍTICA DE MODO SEGURO
- El workflow `aE0sFsDFsQiAXfNy` permanece con `active: false` durante desarrollo e integración.
- Se mantiene `send_enabled: false` garantizando que no se emitan mensajes de WhatsApp salientes reales a usuarios finales sin confirmación explícita.
