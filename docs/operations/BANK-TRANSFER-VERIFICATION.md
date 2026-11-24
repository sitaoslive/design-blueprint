# VET FREEDOM OS — BANK TRANSFER VERIFICATION RUNBOOK
## Protocolo Anti-Fraude de Cotejo de Comprobantes Bancarios y Validación en Extracto
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. La Amenaza de Comprobantes Alterados (Screenshots Fraudulentos)

En Colombia es común la adulteración de capturas de pantalla de Nequi, Daviplata o Bancolombia usando aplicaciones de edición digital ("pantallazos falsos").
**Mandato Estricto de Vet Freedom OS:** Un comprobante recibido por WhatsApp o cargado en la app es exclusivamente **noticia preliminar**. Jamás actualiza la deuda a saldada.

---

## 2. Procedimiento de Verificación en 4 Pasos

1. **Recepción del Archivo:**
   - Se almacena la imagen en el bucket privado.
   - Se crea el registro en `financial_bank_transfer_reports` con estado `PENDING_VERIFICATION`.
   - Se envía respuesta empática al tutor indicando que el comprobante está en revisión.
2. **Cotejo con Portal Bancario:**
   - El analista financiero ingresa al portal bancario oficial de la empresa (Bancolombia Sucursal Virtual / Portal Nequi Negocios).
   - Busca el crédito real por fecha, hora, monto exacto y número de aprobación/movimiento.
3. **Ejecución del Procedimiento de Conciliación (`reconcile_and_allocate_payment`):**
   - **Caso Coincidente:** Ingresa el `bank_movement_id` real del extracto. El sistema vincula la transferencia, actualiza la solicitud a `PAID_VERIFIED` (o `PARTIALLY_PAID` si el monto es inferior), y emite el recibo oficial.
   - **Caso No Coincidente / Falso:** Marca el reporte como `REJECTED_DISCREPANCY` y notifica a Dirección y Recepción para aclaración con el cliente.
4. **Auditoría:** Queda registrado el ID del usuario administrativo que certificó el cotejo bancario.
