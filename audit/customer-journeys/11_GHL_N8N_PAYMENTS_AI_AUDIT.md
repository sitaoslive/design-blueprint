# ALPHA VISION METHOD — AUDITORÍA DE INTEGRACIONES: GHL, N8N, PAGOS E IA
**DOCUMENTO AUDIT-11 — THIRD-PARTY INTEGRATIONS & DURABLE SERVICES**

---

## 1. INTEGRACIÓN CON GOHIGHLEVEL (GHL CRM)

### A. CRM de Ventas SaaS de Alpha Vision Method (Nivel Matriz)
- **Pipeline Vet Life:** `pipe_alpha_vet_sales_v1`
  - *Etapas:* Lead Entrante (1) → Demostración Agendada (2) → Demo Completada (3) → Trial Activado (4) → Cliente Activo (5).
- **Pipeline Contractor OS:** `pipe_alpha_contractor_sales_v1`
  - *Etapas:* Lead Entrante (1) → Demostración Agendada (2) → Demo Completada (3) → Trial Activado (4) → Cliente Activo (5).
- **Mecanismo Anti-Bucle (Anti-Loop Guarantee):** Implementado en `platformControlPlane.ts`. Cada actualización emite un hash idempotente que previene reenvíos en cascada entre webhooks de n8n y GHL.

### B. CRM Operativo de los Inquilinos (Nivel Tenant)
- Los clientes o pacientes de cada veterinaria/contratista se gestionan de forma aislada en Supabase. Las clínicas que contratan el plan *Red / Marca Blanca* pueden conectar su propio subaccount de GHL mediante OAuth 2.0 granular.

---

## 2. ORQUESTACIÓN CON N8N CLOUD

- **Instancia:** `alphavision.app.n8n.cloud`
- **Carpeta de Proyecto:** `Vet Freedom OS` (ID: `EWfSa40jLDxPUOKX`).
- **Flujos Críticos Auditados:**
  1. `VET-LIVE-DISPATCH` (ID: `DLavOFOmFP8MSW2D`): 19 nodos activos coordinando despacho domiciliario, geocodificación y tokens temporales.
  2. `WA-PATIENT-05D` (ID: `IRnxi32jnYdWxsjj`): 22 nodos activos para descubrimiento y reconciliación de pacientes vía WhatsApp.
  3. `AVP-MASTER-CONTROL-PLANE` (ID: `AVP-MASTER-001`): Aprovisionamiento transaccional de nuevas organizaciones y subdominios.
  4. `AVP-FEATURE-GOVERNANCE-MASTER` (ID: `AVP-FG-MASTER-001`): Flujos `FG-001` a `FG-020` para gobierno de límites presupuestarios de IA.
- **Modo Seguro:** Variable `send_enabled: false` activa por defecto para pruebas no invasivas sin spam a clientes reales.

---

## 3. PASARELAS DE PAGO Y FACTURACIÓN

- **Vet Life (Wompi Bancolombia):**
  - Moneda: **COP ($)**.
  - Métodos soportados: Nequi, Botón Bancolombia, Tarjeta de Crédito, PSE.
  - Modo: Sandbox validado para tele-triaje nocturno ($35.000 COP) y consultas a domicilio ($120.000 COP).
- **Contractor OS (Stripe / Apple Pay / Nequi):**
  - Moneda: **USD / CAD / COP**.
  - Métodos soportados: Tarjeta internacional, Apple Pay, ACH, transferencias locales Nequi.
  - Modo: Sandbox validado para depósitos de anticipo y liquidación de saldos de obra.

---

## 4. INTELIGENCIA ARTIFICIAL & METERING (ANTHROPIC CLAUDE)

- **Modelos Integrados:**
  - `claude-3-5-sonnet-20241022`: Diagnóstico clínico profundo y análisis de notas SOAP.
  - `claude-3-5-haiku-20241022`: Enrutamiento de mensajes, triaje rápido y cotizaciones.
- **Prompt Caching:** Activo en ambos modelos con un **90% de descuento** en tokens de lectura cacheados (\$0.30/1M en Sonnet vs \$3.00/1M estándar).
- **Garantía de Cero Pérdida de Datos:** Si el presupuesto mensual de IA se agota (Hard Limit 100%), el sistema **jamás bloquea el acceso de los usuarios**; conmuta a modo manual de alta disponibilidad.
