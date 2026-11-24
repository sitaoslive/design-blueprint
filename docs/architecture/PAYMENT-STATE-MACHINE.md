# VET FREEDOM OS — PAYMENT STATE MACHINE
## Máquinas de Estado de Cotizaciones, Solicitudes de Cobro y Transacciones
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Plataforma:** Supabase PostgreSQL 17

---

## 1. Ciclo de Vida de Cotizaciones (`financial_quotes`)

```mermaid
stateDiagram-v2
    [*] --> DRAFT : create_or_version_quote()
    DRAFT --> PENDING_APPROVAL : Descuento > 0% aplicado
    DRAFT --> ISSUED : Descuento 0% o Aprobado automáticamente
    PENDING_APPROVAL --> ISSUED : approve_quote_discount(Director)
    PENDING_APPROVAL --> REJECTED : Director rechaza descuento
    ISSUED --> ACCEPTED : accept_quote(Tutor)
    ISSUED --> EXPIRED : Supera expires_at (72h)
    ISSUED --> SUPERSEDED : Se emite nueva versión (v2)
    ACCEPTED --> [*]
    REJECTED --> [*]
    EXPIRED --> [*]
    SUPERSEDED --> [*]
```

### Transiciones y Reglas de Negocio:
- **DRAFT -> PENDING_APPROVAL:** Todo presupuesto que otorgue un descuento sobre la tarifa de lista oficial debe pasar por el gate de aprobación de la Dirección Médica (Dr. Luis Ríos).
- **ISSUED -> ACCEPTED:** Solo el tutor legítimo del paciente (con parentesco activo no revocado) puede aceptar la cotización. Al aceptarse, el snapshot de ítems y precios queda inmutable.
- **ISSUED -> SUPERSEDED:** Si se crea una nueva versión de la cotización (`v2`), la versión previa pasa a `SUPERSEDED` y no puede ser aceptada posteriormente.

---

## 2. Ciclo de Vida de Solicitudes de Cobro (`financial_payment_requests`)

```mermaid
stateDiagram-v2
    [*] --> CREATED : create_payment_request()
    CREATED --> PENDING : Se genera enlace de pago / QR
    PENDING --> PARTIALLY_PAID : Pago parcial registrado
    PARTIALLY_PAID --> PARTIALLY_PAID : Pago parcial sucesivo
    PENDING --> PAID_VERIFIED : Pago total verificado
    PARTIALLY_PAID --> PAID_VERIFIED : Pago final completa saldo
    PENDING --> EXPIRED : Supera fecha de vigencia
    PENDING --> CANCELLED : Cancelado por Dirección o anulación
    PENDING --> UNDER_DISPUTE : Tutor o banco abre disputa
    UNDER_DISPUTE --> PENDING : Disputa resuelta a favor de Vet Life
    UNDER_DISPUTE --> CANCELLED : Disputa resuelta a favor del cliente
    PAID_VERIFIED --> REFUNDED : Reembolso total formalizado
    PAID_VERIFIED --> [*]
```

### Reglas Críticas:
- **`PARTIALLY_PAID` vs. `PAID_VERIFIED`:** Una solicitud NUNCA pasa a `PAID_VERIFIED` mientras exista saldo pendiente (`amount_due - amount_paid > 0`).
- **Bloqueo en `UNDER_DISPUTE`:** Cuando una solicitud entra en disputa, se suprimen automáticamente todos los cobros, reintentos y recordatorios automáticos.

---

## 3. Ciclo de Vida de Transacciones de Pasarelas (`financial_payment_transactions`)

```mermaid
stateDiagram-v2
    [*] --> PENDING : Webhook recibido / Enlace abierto
    PENDING --> AUTHORIZED : Pasarela pre-autoriza fondos
    AUTHORIZED --> SUCCEEDED : Captura confirmada
    PENDING --> SUCCEEDED : Pago inmediato confirmado (PSE/Wompi)
    PENDING --> FAILED : Fondos insuficientes / Rechazo bancario
    PENDING --> CANCELLED : Tutor cancela en pasarela
    SUCCEEDED --> REFUNDED : Reembolso total aprobado y procesado
    SUCCEEDED --> PARTIALLY_REFUNDED : Reembolso parcial
```

- Cada cambio de estado de transacción registra el hash SHA-256 de la carga del webhook y valida la firma HMAC del proveedor antes de permitir mutaciones.
