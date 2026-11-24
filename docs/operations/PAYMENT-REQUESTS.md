# VET FREEDOM OS — PAYMENT REQUESTS RUNBOOK
## Procedimiento Operativo para Solicitudes de Cobro, Generación de Links y Expiración
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Emisión de Solicitudes de Cobro

Toda solicitud de pago formal (`financial_payment_requests`) se emite vinculada a una cotización aceptada o una consulta registrada:
- **Parámetros Obligatorios:** `quote_id`, `amount_due`, `currency (COP)`, `expires_at`, `idempotency_key`.
- **Tiempo de Expiración:** Por defecto 72 horas para servicios programados, o 24 horas para servicios de urgencia o disponibilidad inmediata.
- **Idempotencia:** Si la llamada se repite con el mismo `idempotency_key`, el procedimiento retorna el identificador existente sin duplicar el monto exigible.

---

## 2. Generación de Enlaces Efímeros

1. Se invoca el endpoint de integración con Wompi o Bold.
2. Se obtiene la URL del checkout seguro.
3. Se registra en `financial_payment_links` con estado `ACTIVE`.
4. El enlace se transmite al tutor mediante CORE-03 en formato botón interactivo o mensaje de texto formateado.
5. Si el tutor intenta pagar tras la fecha `expires_at`, la pasarela o el frontend bloquean la transacción con el mensaje *"Esta solicitud de pago ha expirado. Por favor solicita un nuevo enlace actualizado a Vet Life"*.
