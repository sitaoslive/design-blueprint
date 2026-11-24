# VET FREEDOM OS — REFUND APPROVAL RUNBOOK
## Procedimiento Operativo para Solicitud, Doble Aprobación y Liquidación de Reembolsos
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Principio de Doble Aprobación de Reembolsos

El dinero de devoluciones por servicios no prestados, pagos duplicados o cancelaciones oportunas no puede ser transferido sin un proceso de doble control:
1. **Paso 1: Solicitud Formal (`REQUESTED`):**
   - El personal de recepción o soporte registra la solicitud en `financial_refund_requests` adjuntando la causa (ej. cancelación oportuna con más de 12 horas, pago doble por error del banco).
2. **Paso 2: Aprobación por Dirección (`APPROVED`):**
   - Únicamente el Dr. Luis Eduardo Ríos o el Administrador Financiero autorizado puede aprobar la solicitud mediante `request_and_approve_refund`.
3. **Paso 3: Ejecución en Pasarela o Transferencia (`EXECUTED`):**
   - Se invoca el API de refund de Wompi / Mercado Pago, o se emite la transferencia bancaria correspondiente.
   - Se registra el comprobante externo y se genera la nota crédito contable.

---

## 2. Invariantes de Seguridad contra Fraude en Reembolsos

- **Mismo Medio de Pago de Origen:** El reembolso debe dirigirse prioritariamente a la misma tarjeta o cuenta bancaria desde donde se originó el recaudo, previniendo esquemas de lavado de activos o transferencias no autorizadas a terceros.
- **Prohibición de Reembolso Superior al Cobrado:** El monto acumulado de reembolsos nunca puede superar el valor total de la transacción original (`amount_refunded <= original_transaction.amount`).
