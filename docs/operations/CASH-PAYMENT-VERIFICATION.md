# VET FREEDOM OS — CASH PAYMENT VERIFICATION RUNBOOK
## Procedimiento de Recaudo en Efectivo Domiciliario, Custodia y Arqueo Central
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Contexto Operativo del Recaudo en Efectivo

Durante la atención domiciliaria en Bogotá y municipios aledaños, una fracción de tutores prefiere pagar en efectivo directamente al médico veterinario al concluir la visita.

---

## 2. Protocolo de Recaudo y Custodia

1. **Emisión de Recibo Provisional:**
   - El veterinario registra el valor recibido en la aplicación Lovable.
   - Se crea el registro `financial_cash_receipts` en estado `RECEIVED_BY_STAFF`.
   - Se envía un mensaje automático al tutor por WhatsApp con el número único de recibo provisional.
2. **Custodia Durante la Ruta:**
   - El profesional mantiene el efectivo en el sobre o estuche de seguridad asignado en su maletín clínico.
3. **Entrega y Arqueo Central:**
   - Al terminar el turno o la ruta de visitas, el profesional se presenta en la sede administrativa de Vet Life o efectúa consignación en cajero inteligente.
   - El cajero verifica billetes, monto y firma de entrega física.
   - Se ejecuta `reconcile_and_allocate_payment` con tipo `CASH`, pasando el recibo a `VERIFIED_DEPOSITED`.
4. **Tratamiento de Descuadres:**
   - Cualquier diferencia superior a COP 1.000 activa una alerta inmediata a la Dirección Operativa para investigación conjunta.
