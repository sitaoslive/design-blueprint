# VET FREEDOM OS — LÍMITES DE CONCILIACIÓN FINANCIERA
## Cobros Verificados, Facturación Fiscal DIAN y Protección ante Alteraciones de Saldos

---

### 1. El Ecosistema Financiero de Vet Life (VET-CORE-14)

El módulo financiero gestiona presupuestos, anticipos de citas domiciliarias, dispersión de pagos mediante Wompi (Bancolombia, PSE, Tarjetas de Crédito), emisión de comprobantes contables y facturación electrónica oficial ante la DIAN.

- **Moneda Base**: Peso Colombiano (COP), sin redondeos ciegos.
- **Autoridad de Pago**: Pasarela Wompi / Banco emisor.
- **Autoridad Fiscal**: Dirección de Impuestos y Aduanas Nacionales (DIAN).
- **Invariante en QA**: Cobros, pagos y devoluciones reales **DESHABILITADOS**.

---

### 2. Discrepancias Financieras y Criterios de Resolución

1. **`FINANCIAL_UNCONFIRMED_PAYMENT`**:
   - Un tutor o cliente envía un comprobante gráfico o afirma por chat haber cancelado el servicio, pero el webhook de Wompi o el extracto bancario no registran la transacción en estado `APPROVED`.
   - *Regla*: La cita NO se marca como pagada. La discrepancia se clasifica como `FINANCIAL_UNCONFIRMED_PAYMENT`. Se genera una tarea de revisión humana para que tesorería verifique con el banco.
2. **`FINANCIAL_AMOUNT_MISMATCH`**:
   - El monto recaudado por Wompi difiere de la tarifa cotizada en el presupuesto de la cita en Supabase (ej. pago parcial de anticipo o deducción bancaria no contemplada).
   - *Acción*: Prohibición absoluta de auto-conciliación. Se crea propuesta de ajuste que requiere aprobación explícita del responsable financiero.
3. **`INVOICE_ORPHAN_WITHOUT_DIAN_CUFE`**:
   - Factura registrada como emitida en Supabase que no cuenta con el Código Único de Facturación Electrónica (CUFE) expedido y validado por la DIAN.
   - *Acción*: La factura se mantiene como borrador contable (`DRAFT_PENDING_DIAN`). No se envía como factura tributaria al cliente hasta obtener la firma digital y validación previa de la DIAN.
4. **`DUPLICATE_PAYMENT_CHARGE_PREVENTION`**:
   - Detección de múltiples transacciones aprobadas para una misma cita o factura.
   - *Severidad*: `HIGH_FINANCIAL`. Se congela el saldo a favor y se abre un caso prioritario de devolución controlada para autorizar el reembolso al tutor.
