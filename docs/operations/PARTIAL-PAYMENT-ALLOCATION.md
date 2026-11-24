# VET FREEDOM OS — PARTIAL PAYMENT ALLOCATION RUNBOOK
## Procedimiento de Asignación de Pagos Parciales, Saldos a Favor y Aritmética Exacta
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Tratamiento Contable de Pagos Parciales

En tratamientos veterinarios prolongados o procedimientos de alto costo, los tutores pueden realizar abonos parciales:
- **Ejemplo Típico:** Cirugía cotizada en COP 500.000.
  - Abono 1: COP 200.000 vía transferencia Nequi conciliada.
  - Estado de la Solicitud: Pasa a `PARTIALLY_PAID`.
  - Saldo Pendiente: COP 300.000.
  - Abono 2: COP 300.000 vía enlace Wompi PSE.
  - Estado de la Solicitud: Pasa a `PAID_VERIFIED`. Saldo Pendiente: COP 0.

---

## 2. Invariantes de Aritmética y Redondeo

1. **Precisión Numérica:** Todas las columnas de dinero utilizan `NUMERIC(14,2)`. Queda terminantemente prohibido utilizar tipos de punto flotante (`FLOAT`, `REAL`) para montos monetarios.
2. **Prohibición de Sobreasignación:** El procedimiento `reconcile_and_allocate_payment` valida que:
   $$\sum \text{allocated\_amount} \le \text{payment\_request.amount\_due}$$
3. **Manejo de Pagos Excedentes (Overpayment):**
   - Si un tutor paga COP 350.000 sobre una obligación de COP 300.000, el sistema asigna COP 300.000 a la solicitud (quedando `PAID_VERIFIED`) y los COP 50.000 restantes se acreditan en `financial_customer_balances.credit_balance` como saldo a favor del tutor para futuros servicios.
