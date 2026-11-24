# VET FREEDOM OS — FINANCIAL SOURCE OF TRUTH
## Jerarquía de Autoridad y Fuente de Verdad para las Operaciones Financieras
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Plataforma Central:** PostgreSQL 17 (Supabase)

---

## 1. Definición de la Fuente de Verdad

En el modelo de Vet Freedom OS, **Supabase PostgreSQL es la única fuente de verdad contable y operativa**. Ni las pasarelas externas (Wompi, Bold, PSE, Mercado Pago), ni las plataformas de mensajería (WhatsApp), ni los motores de automatización (n8n), ni la interfaz de usuario (Lovable) tienen potestad para determinar de forma autónoma el estado de una deuda, un pago verificado o una emisión fiscal.

### Niveles de Autoridad Financiera:

```
[ Nivel 1: Máxima Autoridad ]
       PostgreSQL 17 (Tablas Auditadas + RPCs con Bloqueos de Fila)
                     ▲
                     │ (Valida, Persiste, Asigna)
[ Nivel 2: Proveedores Contables y Fiscales Autorizados ]
       DIAN (Validación Previa CUFE) / Extractos Bancarios Reales
                     ▲
                     │ (Notifican transacciones / Webhooks firmados)
[ Nivel 3: Pasarelas de Pago y Medios Externos ]
       Wompi / Bold / PSE / Mercado Pago / Comprobantes Nequi
                     ▲
                     │ (Orquesta y Encola sin mutar directamente)
[ Nivel 4: Automatización y Canales de Comunicación ]
       n8n Cloud (VET-CORE-14) / CORE-03 (WhatsApp) / Lovable UI
```

---

## 2. Reglas de Conflicto y Resolución de Estados

1. **Webhook vs. Extracto Bancario en Discrepancia:**
   - Si una pasarela notifica un pago pero el estado interno reporta anomalía (por ejemplo, reversión bancaria o sospecha de fraude), el estado se congela en `UNDER_INVESTIGATION` hasta que la Dirección Financiera emita resolución.
2. **Comprobante de WhatsApp vs. Saldo en Cuenta:**
   - La captura de pantalla enviada por un tutor es meramente un **reporte informativo de intención de pago**. El saldo permanece como pendiente de verificación (`PENDING_VERIFICATION`) hasta que un cajero o administrador coteje el movimiento contra el portal bancario oficial.
3. **Cotización Aceptada vs. Servicios Prestados:**
   - Si durante una visita domiciliaria el médico veterinario debe realizar procedimientos adicionales no contemplados en la cotización inicial, se genera una nueva versión formal (`v2`) o una cotización complementaria debidamente aprobada. Ningún cobro puede basarse en acuerdos verbales no registrados.
4. **Factura Electrónica Emitida vs. Pago:**
   - La emisión de la factura electrónica ante la DIAN (`ISSUED`) no implica automáticamente que la obligación esté saldada (`PAID_VERIFIED`). El estado de la factura y el estado del recaudo son dimensiones separadas que convergen en la tabla `financial_payment_allocations`.

---

## 3. Invariantes de Integridad Contable

- **Aritmética Exacta:** Todas las operaciones de cálculo se realizan en centavos o tipos `NUMERIC(14,2)` para garantizar que no existan errores de redondeo o punto flotante (`0.1 + 0.2 != 0.30`).
- **Saldo del Cliente No Negativo:** Un cliente puede tener saldo a favor (`credit_balance >= 0`), pero sus obligaciones pendientes se calculan de manera determinista restando las asignaciones confirmadas del monto total autorizado.
- **Inmutabilidad de Transacciones:** Una vez que un registro en `financial_payment_transactions` alcanza el estado `SUCCEEDED`, su fila queda congelada y solo puede alterarse mediante una contrapartida formal (como un reembolso en `financial_refund_requests` o una nota crédito en `financial_credit_notes`).
