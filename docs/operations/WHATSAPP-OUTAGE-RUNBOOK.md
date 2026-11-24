# WHATSAPP OUTAGE & CONTINGENCY RUNBOOK
## VET FREEDOM OS — Procedimiento ante Caída del Canal de Mensajería
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Módulos:** `VET-CORE-02`, `VET-CORE-19`, `VET-CORE-20`  
**Escenario:** Interrupción de Meta Cloud API, caída de webhook o degradación de red

---

## 1. NIVELES DE CONTINGENCIA

### Nivel 1: Caída de la API de Meta (WhatsApp Global Down)
- **Síntomas:** No se reciben webhooks, o las peticiones de envío saliente retornan HTTP 5xx o timeout persistente.
- **Acción Inmediata:**
  1. `VET-CORE-20` detecta el incremento de tasa de fallos de integración y dispara alerta `SEV-2` al canal de monitoreo.
  2. La aplicación web (Lovable) activa banner informativo para clientes: *"Canal de WhatsApp temporalmente no disponible por mantenimiento de Meta. Para solicitudes urgentes comuníquese a nuestra línea telefónica directa"*.
  3. No se descartan mensajes salientes: Se mantienen encolados en `public.transactional_outbox` con reintento exponencial coordinado por `VET-CORE-19`.

### Nivel 2: Degradación de n8n Webhook Listener
- **Síntomas:** Meta reporta fallos de entrega HTTP 502/504 en el webhook.
- **Acción Inmediata:**
  1. Meta activa su política de reintento automático durante 24 a 48 horas.
  2. Si n8n se recupera, los eventos reintentados por Meta son deduplicados por `idx_messages_external_id_unique` y procesados en orden sin duplicar notificaciones a clientes.

### Nivel 3: Atención Fuera de Horario Laboral
- **Horario Oficial de Operación:** Lunes a Sábado de 07:00 a 19:00 (America/Bogota).
- **Protocolo Nocturno / Festivo:**
  1. Las solicitudes de citas generales reciben confirmación de recepción diferida: *"Hemos recibido tu solicitud. Nuestro equipo coordinará tu visita domiciliaria a primera hora hábil"*.
  2. Ante cualquier término de emergencia clínica detectado fuera de horario, el sistema responde inmediatamente con el listado de clínicas veterinarias físicas de urgencias 24h autorizadas en Bogotá y genera una alerta de notificación a Dirección Médica.
