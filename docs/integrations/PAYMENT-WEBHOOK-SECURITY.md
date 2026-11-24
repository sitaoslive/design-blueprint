# VET FREEDOM OS — PAYMENT WEBHOOK SECURITY
## Especificación de Seguridad Criptográfica, Firmas HMAC y Prevención de Ataques en Webhooks
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Plataforma:** n8n Webhook Endpoint + PostgreSQL RPC

---

## 1. Modelo de Amenazas en Webhooks Financieros

El endpoint de recepción de webhooks de n8n (`/webhook/finances/notify` o `/finances/notify`) es un canal público accesible desde Internet. Está expuesto a las siguientes amenazas:
1. **Suplantación de Pasarela (Spoofing):** Un atacante envía un payload falso simulando un pago exitoso para obtener servicios clínicos sin pagar.
2. **Manipulación del Monto (Tampering):** Un atacante altera el payload pagando COP 1.000 e indicando en el cuerpo del webhook que pagó COP 500.000.
3. **Ataque de Repetición (Replay Attack):** Un atacante captura un webhook legítimo antiguo y lo vuelve a enviar semanas después.
4. **Denegación de Servicio (DoS):** Envío masivo de payloads inválidos para saturar n8n y Supabase.

---

## 2. Validación Criptográfica de Firmas (HMAC-SHA256)

Para mitigar estas amenazas, **ningún webhook se procesa sin validación criptográfica estricta**:

### Algoritmo de Verificación:
```
signature = HMAC-SHA256(secret_key, timestamp + "." + raw_payload)
```

1. **Extracción de Headers:**
   - `x-event-checksum` o `x-wompi-signature`: Firma remitida por la pasarela.
   - `x-event-timestamp`: Timestamp UNIX de emisión por la pasarela.
2. **Ventana de Tolerancia Temporal:**
   - Si `abs(current_time - event_timestamp) > 300 segundos (5 minutos)`, el evento se descarta inmediatamente como sospecha de replay attack.
3. **Cálculo de la Firma:**
   - Se utiliza el secreto compartido (`WEBHOOK_EVENTS_SECRET`) almacenado de forma segura en las variables de entorno de Supabase Vault o n8n Credentials.
   - Si la firma calculada no coincide exactamente mediante comparación de tiempo constante (`crypto.timingSafeEqual`), se responde `HTTP 401 Unauthorized` y se registra una alerta de seguridad.

---

## 3. Verificación de Monto y Moneda contra la Orden Interna

Aún con firma válida, el sistema valida que:
- `event.amount_in_cents == internal_order.amount_in_cents`
- `event.currency == internal_order.currency (COP)`

Si el monto difiere, la transacción no se aprueba automáticamente; se cataloga como `DISCREPANCY_FLAGGED` y se encola una tarea urgente para el equipo financiero.
