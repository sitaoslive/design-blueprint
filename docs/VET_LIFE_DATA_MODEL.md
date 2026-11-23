# VET LIFE — MASTER DATA MODEL & SYSTEM-OF-RECORD MATRIX
**Motor:** PostgreSQL 17.12.0 (Supabase `sznvahhocgnhsqhksygq`)  
**Esquema de Migraciones:** 47 migraciones DDL activas (`001` a `047`)  
**Fecha de Publicación:** 2026-11-23  

---

## 1. Matriz de Sistema de Registro (System of Record - SoR)

| Entidad / Categoría de Datos | Sistema Fuente Autoritativo | Almacenamiento en Vet Life | Identificador Externo | Dirección de Sync | Política de Escritura / Sobrescritura |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Organizaciones & Sedes** | Vet Freedom OS | `public.organizations`, `branches` | `slug` único | Interno | Administrador de la plataforma o dueño de clínica. |
| **Perfiles & Roles de Staff** | Vet Freedom OS / Supabase Auth | `public.staff_profiles`, `user_profiles` | `user_id` (UUID Auth) | Interno | Asignación por Dirección Médica o Administrador. |
| **Tutores / Clientes** | OKVET / Vet Freedom OS | `public.owners` | `okvet_id`, Cédula | Bidireccional asistida | Creación local permitida; conciliación por teléfono E.164. |
| **Mascotas (Pets)** | OKVET / Vet Freedom OS | `public.pets` | `okvet_id`, Microchip | Bidireccional asistida | Creación local con validación de tutor. Prohibido fusionar a ciegas. |
| **Historias Clínicas Oficiales** | **OKVET (Inmutable)** | `public.medical_records`, `documents` | `okvet_record_id` | Solo Lectura | **Estricto:** Solo el veterinario en OKVET; Vet Life no sobrescribe. |
| **Prescripciones & Fórmulas** | OKVET / Firma Dr. Luis | `public.prescriptions` | `okvet_formula_id` | Ingesta + Bóveda | Fórmulas firmadas digitalmente con tarjeta COMVEZCOL. |
| **Vacunas y Lotes** | Vet Freedom OS | `public.preventive_care_plans`, `product_lots` | Número de Lote | Local autoritativo | Verificación obligatoria de cadena de frío (2-8°C). |
| **Solicitudes de Cita** | Vet Freedom OS | `public.appointment_requests` | UUID local | Webhook outbox | Tutor solicita -> Personal confirma en OKVET -> Vet Life emite. |
| **Citas Confirmadas** | **OKVET / Agenda Dr. Luis** | `public.appointments`, `visits` | `okvet_appointment_id` | Sincronizado | Solo pasa a `CONFIRMED` con evidencia de agenda oficial. |
| **Rutas & Telemetría GPS** | Vet Freedom OS | `public.routes`, `route_stops`, `location_observations` | Waze Deeplink | Local autoritativo | Emisión en tiempo real durante estado `EN_ROUTE`. |
| **Facturas y Recibos COP** | Vet Freedom OS / DIAN | `public.financial_invoices`, `payment_collections` | Consecutivo DIAN | Local autoritativo | Aritmética exacta NUMERIC(14,2) en Pesos Colombianos (COP). |
| **Mensajería WhatsApp** | Meta Cloud API / n8n | `public.conversations`, `messages` | `wamid` único | Bidireccional | Ingesta idempotente con deduplicación por `wamid`. |

---

## 2. Niveles de Procedencia de Datos (Data Provenance)
Toda fila sensible en la base de datos cuenta con una columna `provenance_type`:
1. `VERIFIED_CLINICAL`: Emitido o firmado por un médico veterinario habilitado ante COMVEZCOL.
2. `IMPORTED_DOCUMENT`: Archivo PDF, resultado de laboratorio o examen diagnóstico importado de un tercero.
3. `OWNER_REPORTED`: Datos provistos por el tutor (peso en casa, observaciones de conducta).
4. `AI_DRAFT_PENDING_REVIEW`: Borrador generado por IA pendiente de aprobación humana explícita.

---

## 3. Seguridad a Nivel de Filas (Row-Level Security - RLS)
El 100% de las 86 tablas relacionales tiene RLS forzado (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
Políticas deterministas aplicadas:
- `org_isolation_policy`: Aislamiento por `organization_id = auth.current_org_id()`.
- `owner_self_records`: Los tutores únicamente pueden consultar filas donde `owner_id = auth.uid()`.
- `auxiliary_scope`: Los auxiliares solo ven visitas y rutas de su jornada asignada.
- `anon_lockdown`: El rol anónimo tiene `REVOKE ALL` en todas las tablas y RPCs, excepto en `/t/:token` mediante tokens hash SHA-256 efímeros.
