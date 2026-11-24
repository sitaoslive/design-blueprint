# VET FREEDOM OS — EDGE FUNCTIONS SPECIFICATION
## Funciones Serverless de Borde (Supabase Edge Functions / Deno)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Runtime:** Deno / TypeScript (Supabase Edge Runtime)  
**Fecha:** 2026-11-21  

---

## 1. ARQUITECTURA DE EDGE FUNCTIONS

Las Edge Functions actúan como capa de protección periférica y procesamiento ligero de eventos antes de tocar la base de datos o despachar a servicios externos. Se ejecutan en ubicaciones globales de baja latencia con acceso directo a variables de entorno de Supabase.

```
[Cliente Externo / Webhook] ---> [Supabase Edge Function] ---> [PostgreSQL / RLS]
                                          |
                                          +---> [n8n Orchestrator]
```

---

## 2. CATÁLOGO DE EDGE FUNCTIONS DE VET FREEDOM OS

### 2.1 `validate-whatsapp-webhook`
- **Ruta:** `/functions/v1/validate-whatsapp-webhook`
- **Propósito:** Recibir webhooks entrantes de Meta WhatsApp Business Cloud API.
- **Responsabilidades:**
  1. Validación del desafío de verificación inicial (`hub.mode`, `hub.verify_token`, `hub.challenge`).
  2. Validación de firma criptográfica HMAC-SHA256 (`X-Hub-Signature-256`) contra el secret configurado.
  3. Extracción de `idempotency_key` (ID de mensaje de WhatsApp).
  4. Inserción atómica en `public.event_inbox`. Si el mensaje ya fue procesado, responde con `HTTP 200 OK` inmediato para evitar reintentos de Meta.
  5. Despacho seguro al webhook correspondiente de n8n (ej. VET-CORE-02 o VET-CORE-04).

### 2.2 `process-outbox-batch`
- **Ruta:** `/functions/v1/process-outbox-batch`
- **Propósito:** Worker ligero invocado por cron (`pg_cron` o n8n trigger) para procesar eventos pendientes en `public.transactional_outbox`.
- **Mecanismo:**
  1. Selecciona eventos con `status = 'PENDING'` ordenados por `created_at ASC` con límite de 50 eventos.
  2. Adquiere lock con `FOR UPDATE SKIP LOCKED`.
  3. Realiza la llamada HTTP POST al webhook autenticado de n8n.
  4. En caso de respuesta `200 OK`, actualiza a `status = 'PROCESSED'`, `processed_at = now()`.
  5. En caso de error de red, incrementa `retry_count`, registra `last_error` y programa reintento con backoff exponencial.

### 2.3 `generate-signed-storage-url`
- **Ruta:** `/functions/v1/generate-signed-storage-url`
- **Propósito:** Generar URLs de descarga temporalmente firmadas para expedientes clínicos y comprobantes financieros.
- **Seguridad:**
  1. Valida el token JWT del usuario llamante.
  2. Comprueba mediante consulta interna si el usuario tiene permiso sobre el archivo solicitado (médico tratante, cliente titular o director).
  3. Genera una URL firmada con tiempo de expiración estricto de 900 segundos (15 minutos).
  4. No expone el nombre de archivo interno ni la ruta del bucket en registros públicos.

### 2.4 `okvet-import-parser`
- **Ruta:** `/functions/v1/okvet-import-parser`
- **Propósito:** Procesamiento en streaming de archivos CSV o XLSX exportados desde OKVET Cloud por el operador.
- **Flujo:**
  1. Recibe el archivo subido al bucket temporal.
  2. Calcula la huella digital SHA-256 del contenido binario.
  3. Verifica que no exista un lote con idéntica huella en `public.okvet_import_batches` (prevención de reprocesamiento).
  4. Parsea las filas y las inserta en `public.okvet_import_row_staging`.
  5. Dispara el análisis de conflictos para revisión por el operador.

---

## 3. VARIABLES DE ENTORNO Y SECRETOS (VAULT)

- `SUPABASE_URL`: Endpoint oficial de la instancia.
- `SUPABASE_SERVICE_ROLE_KEY`: Token de servicio con privilegios para outbox worker.
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: Token compartido con Meta.
- `WHATSAPP_APP_SECRET`: Clave secreta para cálculo de HMAC-SHA256.
- `N8N_INBOUND_WEBHOOK_URL`: Endpoint seguro del orquestador n8n.
- `N8N_WEBHOOK_BEARER_TOKEN`: Token de autenticación de llamadas hacia n8n.
