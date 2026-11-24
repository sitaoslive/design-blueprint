# VET FREEDOM OS — FINANCIAL REMINDERS RUNBOOK
## Protocolo de Recordatorios de Pago, Cadencia, Escalado y Supresiones Humanitarias
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Cadencia Estándar de Recordatorios de Pago

Los recordatorios de pago para obligaciones pendientes siguen un cronograma respetuoso y no invasivo:
1. **Día 0 (Emisión):** Notificación de solicitud de pago generada con enlace seguro y fecha límite.
2. **Día +2 (Recordatorio Preventivo):** Recordatorio cordial por WhatsApp recordando el vencimiento próximo.
3. **Día de Vencimiento (Día +3):** Mensaje informativo de vencimiento de enlace y opción de renovar el link o coordinar otro medio de pago.
4. **Día +7 (Escalamiento a Recepción Humana):** Se suspenden los recordatorios automáticos y se encola una llamada telefónica o contacto manual por la recepcionista.

---

## 2. Compuertas de Supresión Obligatorias (`Gate of Empathy`)

Antes de enviar cualquier recordatorio, el workflow `VET-CORE-14` evalúa `evaluate_financial_reminder_eligibility`:

| Causa de Supresión | Condición Detectada | Acción Inmediata |
|---|---|---|
| **Protocolo de Duelo (WFX-013)** | `is_bereaved = true` (fallecimiento del paciente) | **Supresión incondicional.** Bloqueo permanente de cobranza automática. Tratamiento empático por Dirección Médica. |
| **Disputa Abierta** | `has_open_dispute = true` en `financial_disputes` | **Supresión temporal.** Se congela el cobro hasta resolución del reclamo. |
| **Cuidador Revocado** | `caregiver_revoked = true` en `owners_caregivers` | **Descarte de destinatario.** No se envía información financiera a personas no autorizadas. |
| **Pago Ya Verificado** | `status = 'PAID_VERIFIED'` | **Cancelación inmediata.** Se descarta el recordatorio. |
| **Comprobante en Revisión** | `bank_report_status = 'PENDING_VERIFICATION'` | **Pausa preventiva.** No se insiste en cobro mientras se verifica el extracto. |
