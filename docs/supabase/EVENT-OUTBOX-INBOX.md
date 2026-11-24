# VET FREEDOM OS — TRANSACTIONAL OUTBOX & INBOX ARCHITECTURE
## Arquitectura de Desacoplamiento de Eventos, Entrega Confiable e Idempotencia
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Base de Datos:** PostgreSQL 17.12.0  
**Fecha:** 2026-11-21  

---

## 1. PRINCIPIO DE CONSISTENCIA TRANSACCIONAL

En arquitecturas distribuidas donde coexisten una base de datos relacional (Supabase) y un motor de automatización (n8n), escribir en la base de datos y despachar inmediatamente una llamada HTTP síncrona en la misma transacción genera fallas de doble escritura (Dual-Write Problem).

Para garantizar consistencia atómica y tolerancia a fallos:
1. Las modificaciones del modelo de negocio y la creación del evento de negocio ocurren en la **misma transacción atómica de PostgreSQL**.
2. Los eventos salientes se persisten en `public.transactional_outbox`.
3. Un proceso despachador (worker / cron) consume la bandeja de salida y la envía a n8n.
4. Las llamadas entrantes desde webhooks externos (Meta, pasarelas de pago) son recibidas primero en `public.event_inbox` para deduplicación idempotente.

```
[Usuario / SPA] ---> [Transacción Postgres]
                           |
                           +---> Actualiza Entidad (ej. appointments)
                           +---> Inserta en transactional_outbox
                                         |
                                         v (Worker asíncrono)
                                  [n8n Webhook]
```

---

## 2. ESPECIFICACIÓN DE `public.transactional_outbox`

### Estructura de la Tabla
```sql
CREATE TABLE IF NOT EXISTS public.transactional_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED')),
    retry_count INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 5,
    last_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending ON public.transactional_outbox(created_at)
WHERE status = 'PENDING';
```

### Catálogo de Eventos Principales Emitidos
- `APPOINTMENT_REQUESTED`: Solicitud inicial de agendamiento.
- `APPOINTMENT_CONFIRMED_OKVET_HUMAN`: Confirmación manual en OKVET registrada por operador.
- `APPOINTMENT_RESCHEDULED`: Cambio de horario formalmente aceptado.
- `APPOINTMENT_CANCELLED`: Cancelación justificada de cita.
- `SPECIALIST_REFERRAL_OFFERED`: Oferta de interconsulta remitida al especialista externo.
- `PAYMENT_PROOF_UPLOADED`: Comprobante de pago subido por el cliente.
- `PAYMENT_RECONCILED`: Validación contable aprobada por Finanzas.
- `GRIEF_SUPPORT_INITIATED`: Protocolo de duelo activado para supresión de comunicaciones.

---

## 3. ESPECIFICACIÓN DE `public.event_inbox`

### Estructura de la Tabla
```sql
CREATE TABLE IF NOT EXISTS public.event_inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    idempotency_key TEXT NOT NULL,
    source TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PROCESSED' CHECK (status IN ('RECEIVED', 'PROCESSING', 'PROCESSED', 'IGNORED_DUPLICATE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    UNIQUE (organization_id, idempotency_key)
);
```

### Reglas de Deduplicación
1. La clave única compuesta `(organization_id, idempotency_key)` previene inserciones repetidas por reintentos de red de proveedores externos.
2. Si un webhook entrante intenta insertar una clave ya existente, la base de datos responde de inmediato informando que el mensaje ya fue registrado, previniendo doble ejecución de lógica de negocio o envíos duplicados al cliente.

---

## 4. POLÍTICA DE REINTENTOS Y COLA DE ERRORES (DEAD LETTER QUEUE)

1. **Backoff Exponencial:** En caso de falla transitoria en el consumidor n8n, el worker reintenta a intervalos crecientes: $2^n \times 30\text{ s}$ (30s, 60s, 120s, 240s, 480s).
2. **Dead Letter Queue (DLQ):** Al alcanzar `retry_count = max_retries` (5 intentos), el evento transiciona a `status = 'FAILED'`.
3. **Alerta Ejecutiva:** Un evento en `FAILED` genera una alerta inmediata en el panel de soporte para diagnóstico técnico sin pérdida del payload original.
