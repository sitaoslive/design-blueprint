# VET FREEDOM OS — IDEMPOTENCY STRATEGY
## Estrategia Maestra de Idempotencia y Prevención de Duplicidad
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Fecha:** 2026-11-21  

---

## 1. PRINCIPIO GENERAL

En un sistema operativo veterinario distribuido que maneja agendamiento, transacciones financieras y mensajería a clientes, una operación debe producir exactamente el mismo resultado tanto si se ejecuta una vez como si se reintenta múltiples veces debido a pérdidas de paquetes, timeouts o reintentos del usuario en la interfaz.

---

## 2. PATRONES DE IDEMPOTENCIA POR CAPA

### 2.1 Capa de Interfaz de Usuario (Lovable SPA)
- **Deshabilitación de Botones:** Todo botón de acción crítica (ej. "Confirmar Cita", "Registrar Pago", "Firmar Consentimiento") se deshabilita inmediatamente tras el primer clic (`isSubmitting = true`).
- **Client Request Token:** Cada envío genera un UUID en el cliente (`client_submission_id`) transmitido en los encabezados HTTP (`X-Idempotency-Key`).
- **Respuesta en Caché:** Si el cliente reenvía el mismo `client_submission_id` dentro de los primeros 60 segundos, el backend retorna la respuesta previamente calculada sin repetir la mutación.

### 2.2 Capa de Agendamiento y Holds
- **Token de Sesión de Hold (`hold_session_token`):** La función `create_appointment_hold()` vincula la reserva temporal al token de sesión del navegador del cliente. Si el cliente pulsa varias veces o recarga el paso de selección, el hold existente se reutiliza en lugar de generar bloqueos duplicados en el calendario del profesional.
- **Confirmación OKVET Única:** La tabla `okvet_manual_confirmations` posee una restricción `UNIQUE (appointment_id)` y `UNIQUE (okvet_appointment_id)`. Es físicamente imposible asociar un mismo identificador clínico de OKVET a dos citas diferentes o confirmar dos veces la misma cita.

### 2.3 Capa Financiera y de Pagos
- **Referencia Bancaria Única:** La tabla `financial_transactions` indexa y restringe de forma única el identificador provisto por el banco o la pasarela (`payment_reference_id`, `bank_transaction_id`).
- **Prevención de Doble Cobro:** Ante un webhook de confirmación de pago, se verifica la existencia previa de la transacción antes de alterar saldos o emitir recibos.

### 2.4 Capa de Mensajería y Notificaciones
- **Huella de Mensaje:** Antes de que cualquier flujo n8n o worker despache un mensaje de WhatsApp o correo electrónico, se computa una huella SHA-256 compuesta por:
  $$\text{MessageHash} = \text{SHA256}(\text{recipient\_id} + \text{template\_id} + \text{appointment\_id} + \text{date})$$
- Si ya existe un registro en el log de comunicaciones con dicho hash dentro de la ventana de protección (ej. 24 horas), el despacho se omite automáticamente.

---

## 3. ESQUEMA DE BASE DE DATOS DE CONTROL DE IDEMPOTENCIA

```sql
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    key TEXT NOT NULL,
    target_action TEXT NOT NULL,
    response_payload JSONB,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
    UNIQUE (organization_id, key)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_expiry ON public.idempotency_keys(expires_at);
```
