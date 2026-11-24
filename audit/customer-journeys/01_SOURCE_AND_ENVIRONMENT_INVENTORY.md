# ALPHA VISION METHOD — INVENTARIO DE FUENTES Y ENTORNO TÉCNICO
**DOCUMENTO AUDIT-01 — CUSTOMER JOURNEY AUDIT**

---

## 1. METADATA DEL PROYECTO Y REPOSITORIOS

| Parámetro | Detalle Verificado | Evidencia en Código | Estado de Verificación |
|---|---|---|---|
| **Empresa Matriz** | Alpha Vision Method (`alphavisionm.com`) | `src/features/system-administration/` | `PRODUCTION VERIFIED` |
| **Repositorio Frontend** | `sitaoslive/luis-rios-vet-100.git` | Rama `main` (HEAD commit `bf6c378`) | `PRODUCTION VERIFIED` |
| **Directorio Local** | `C:\Users\Freud\Luisvet\design-blueprint` | `package.json` | `DEVELOPMENT VERIFIED` |
| **Framework & Versión** | React 18.3.1 + Vite 8.1.5 + TanStack Router | `package.json` | `DEVELOPMENT VERIFIED` |
| **Lenguaje & Tipado** | TypeScript 5.8.3 (`strict: true`) | `tsconfig.json` (0 errores en `tsc`) | `DEVELOPMENT VERIFIED` |
| **Servidor de Dev** | Vite Dev Server en `http://127.0.0.1:3000` | Task 2114 activo | `DEVELOPMENT VERIFIED` |

---

## 2. INFRAESTRUCTURA BACKEND (SUPABASE POSTGRESQL 17)

| Parámetro | Detalle Verificado | Evidencia | Estado |
|---|---|---|---|
| **Proyecto Supabase** | `sznvahhocgnhsqhksygq` (`us-east-1`) | `supabase/config.toml`, `.env` | `PRODUCTION VERIFIED` |
| **Versión PostgreSQL** | PostgreSQL 17.12.0 | Migraciones aplicadas | `PRODUCTION VERIFIED` |
| **Migraciones DDL** | 54 migraciones oficiales (`001` a `054`) | `supabase/migrations/` | `PRODUCTION VERIFIED` |
| **Entidades de Control Plane** | 14 tablas maestras (`platform_*`) | Migración `053` y `054` | `PRODUCTION VERIFIED` |
| **RPCs Fundacionales** | `resolve_feature_entitlement`, `reserve_ai_quota`, `reconcile_ai_usage_event`, `provision_platform_tenant`, `resolve_tenant_by_hostname` | Migraciones `053` y `054` | `PRODUCTION VERIFIED` |
| **Seguridad Multi-Tenant** | Row Level Security (RLS) habilitado en 100% de tablas | Migraciones 014, 016, 047..054 | `PRODUCTION VERIFIED` |

---

## 3. DOMINIOS Y ENRUTAMIENTO MULTI-TENANT

| Hostname | Propósito | Enrutamiento Target | Estado DNS / Certificado |
|---|---|---|---|
| `alphavisionm.com` | Portal Matriz B2B | `/` (Dual App Landing) | `PRODUCTION VERIFIED` |
| `admin.alphavisionm.com` | Super Admin 2.0 | `/admin` (Owner Command Center) | `PRODUCTION VERIFIED` |
| `luis.alphavisionm.com` | Tenant Ancla Dr. Luis Eduardo Ríos | `/luis` (Vet Life Clinical Engine) | `PRODUCTION VERIFIED` |
| `*.alphavisionm.com` | Subdominios dinámicos de inquilinos | Tenant Routing Resolver | `STAGING VERIFIED` |

---

## 4. AUTOMATIZACIÓN (N8N CLOUD)

| Flujo / Carpeta | ID de Despliegue | Nodos | Rol en la Jornada | Estado |
|---|---|---|---|---|
| **VET-CORE-01 a 21** | `automation/n8n/core/` | 21 flujos | Agendamiento, SOAP, WABA, DIAN, OKVET | `STAGING VERIFIED` |
| **VET-LIVE-DISPATCH** | `DLavOFOmFP8MSW2D` | 19 nodos | Despacho y Smart ETA con privacidad GPS | `PRODUCTION VERIFIED` |
| **WA-PATIENT-05D** | `IRnxi32jnYdWxsjj` | 22 nodos | Ingesta WABA y reconciliación OKVET | `PRODUCTION VERIFIED` |
| **AVP-MASTER-CONTROL-PLANE** | `AVP-MASTER-001` | 19 nodos | Aprovisionamiento de tenants y GHL sync | `DEVELOPMENT VERIFIED` |
| **AVP-FEATURE-GOVERNANCE-MASTER** | `AVP-FG-MASTER-001` | 15 nodos | Flujos FG-001 a FG-020 (Límites IA y Overrides) | `DEVELOPMENT VERIFIED` |

---

## 5. CRM (GOHIGHLEVEL)

| Integración | Pipeline Asignado | Etapas Mapeadas | Estado |
|---|---|---|---|
| **SaaS Sales Matriz (Vet Life)** | `pipe_alpha_vet_sales_v1` | Lead Entrante → Demo → Trial → Cliente Activo | `DEVELOPMENT VERIFIED` |
| **SaaS Sales Matriz (Contractor OS)** | `pipe_alpha_contractor_sales_v1` | Lead Entrante → Demo → Trial → Cliente Activo | `DEVELOPMENT VERIFIED` |
| **CRM Operativo de Inquilinos** | Por Tenant (segregado) | Oportunidades y contactos independientes | `PARTIAL` (Requiere OAuth por Tenant) |

---

## 6. INTELIGENCIA ARTIFICIAL & GATEWAY

| Capacidad | Proveedor / Modelo | Tarifa por 1M Tokens (In / Out / Cache) | Estado |
|---|---|---|---|
| **Asistente Clínico & SOAP** | Claude 3.5 Sonnet (`20241022`) | \$3.00 / \$15.00 / \$3.75 write / \$0.30 read | `PRODUCTION VERIFIED` |
| **Triaje Rápido & Recepción** | Claude 3.5 Haiku (`20241022`) | \$0.80 / \$4.00 / \$1.00 write / \$0.08 read | `PRODUCTION VERIFIED` |
| **Prompt Caching** | Nativo Anthropic | 90% ahorro en tokens cacheados | `PRODUCTION VERIFIED` |
| **Presupuesto y Metering** | Alpha AI Gateway | Reserva atómica, Soft limit 80%, Hard limit 100% | `PRODUCTION VERIFIED` |

---

## 7. PASARELAS DE PAGO

| Producto | Pasarela Integrada | Moneda | Entorno | Estado |
|---|---|---|---|---|
| **Vet Life** | Wompi (Bancolombia) | COP | Modo Sandbox verificado | `STAGING VERIFIED` |
| **Contractor OS** | Stripe / Apple Pay / ACH / Nequi | USD / CAD / COP | Modo Sandbox verificado | `STAGING VERIFIED` |
| **SaaS Subscriptions** | Wompi & Stripe Billing | COP & USD | Mapeado en Migration 048 / 054 | `DEVELOPMENT VERIFIED` |
