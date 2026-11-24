# VET FREEDOM OS — FINANCIAL INCIDENT RECOVERY RUNBOOK
## Plan de Contingencia y Recuperación ante Fallos en Pasarelas, Webhooks o DIAN
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Escenarios de Incidencia Financiera y Protocolo de Actuación

### Escenario A: Caída de la Pasarela de Pagos (Wompi / Bold / PSE Fuera de Línea)
- **Detección:** Timeouts consecutivos (> 10s) en llamadas a API de checkout o errores HTTP 502/503.
- **Acción Inmediata:**
  1. Conmutación automática en frontend/WhatsApp al medio de contingencia alternativo (ej. Botón Bancolombia directo o código QR de cuenta empresarial).
  2. Suspensión temporal de reintentos agresivos para evitar bloqueos por rate limiting.
  3. Notificación informativa al tutor ofreciendo opciones de pago por transferencia o datáfono en visita.

### Escenario B: Webhook No Recibido tras Pago Exitoso (Webhook Drop)
- **Detección:** Tutor reporta débito en su banco pero la solicitud en Vet Freedom OS permanece en `PENDING`.
- **Acción Inmediata:**
  1. El personal financiero ejecuta consulta manual (`polling por excepción`) al API del proveedor usando el `payment_request_id` o referencia externa.
  2. Si el proveedor confirma `APPROVED`, se invoca `register_provider_payment_event` para reconciliar el estado.

### Escenario C: Indisponibilidad de los Servicios Web de la DIAN
- **Detección:** El proveedor de facturación reporta timeout con los servidores de validación previa de la DIAN.
- **Acción Inmediata:**
  1. La factura se emite bajo modalidad de contingencia (Factura por Talonario o de Contingencia DIAN).
  2. Los servicios clínicos continúan con normalidad; el documento provisional se entrega al cliente.
  3. Al restablecerse el enlace con la DIAN, se transmiten los XMLs de contingencia dentro del plazo legal de 48 horas.
