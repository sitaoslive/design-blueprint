# VET FREEDOM OS — QUOTE APPROVAL RUNBOOK
## Procedimiento Operativo Estándar para Emisión, Versionado y Aprobación de Presupuestos
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Flujo de Emisión de Cotizaciones

1. **Selección de Tarifas Vigentes:** El médico veterinario o recepcionista selecciona los servicios e insumos desde el catálogo `financial_service_rates`.
2. **Generación de Borrador (`create_or_version_quote`):** El sistema calcula subtotal, IVA aplicable y total.
3. **Control de Descuentos (Gate de Aprobación):**
   - **Descuento = 0%:** La cotización pasa automáticamente a estado `ISSUED`.
   - **Descuento > 0%:** La cotización queda en `PENDING_APPROVAL`. Se genera una tarea en Lovable / Telegram para el Dr. Luis Eduardo Ríos.
4. **Decisión del Director Médico (`approve_quote_discount`):**
   - **Aprobado:** Pasa a `ISSUED` y se notifica al tutor vía CORE-03 (WhatsApp).
   - **Rechazado:** Pasa a `REJECTED`. El veterinario debe corregir el presupuesto.

---

## 2. Versionado Monótono (`v1..vn`)

- Si las condiciones clínicas del paciente exigen procedimientos adicionales antes o durante la visita domiciliaria, **nunca se sobrescribe la versión anterior**.
- Se invoca `create_or_version_quote` indicando el `quote_id` existente. La versión previa pasa a `SUPERSEDED` y se crea la nueva versión con número incremental correlativo.
- El tutor solo puede aceptar la última versión activa emitida.
