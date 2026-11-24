# Modelo de Datos de Cuidados Preventivos y Trazabilidad (VET-CORE-10)

## 1. Resumen de Migración
- **Archivo de Migración:** `supabase/migrations/032_prevention_care_plans_and_traceability.sql`
- **Ámbito:** Gestión de planes preventivos aprobados, versionamiento inmutable, procedencia de datos, control de lotes de biológicos, verificación de cadena de frío, registro de aplicaciones clínicas e incidentes.
- **Seguridad:** 100% de tablas protegidas con RLS (`Row Level Security`) activo y `SECURITY DEFINER` en procedimientos almacenados.

## 2. Entidades Principales

### 2.1 `preventive_care_plans`
Almacena el plan marco individualizado para un paciente canino o felino específico.
- `id` (UUID, PK)
- `patient_id` (UUID, FK -> `patients.id`)
- `created_by_vet_id` (UUID, FK -> `auth.users.id`)
- `status` (VARCHAR: `DRAFT`, `APPROVED`, `SUSPENDED`, `COMPLETED`, `ARCHIVED`)
- `is_approved_by_vet` (BOOLEAN, default `false`)
- `rejection_reason` (TEXT, opcional)
- `clinical_notes` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2.2 `preventive_care_plan_versions`
Garantiza el versionamiento inmutable de cada protocolo preventivo.
- `id` (UUID, PK)
- `plan_id` (UUID, FK -> `preventive_care_plans.id`)
- `version_number` (INTEGER, autoincremental por plan)
- `protocol_spec` (JSONB: contiene antígenos, frecuencias de desparasitación, revisiones)
- `approved_by` (UUID, FK -> `auth.users.id`)
- `approved_at` (TIMESTAMPTZ)
- `change_reason` (TEXT)
- `is_active` (BOOLEAN)

### 2.3 `preventive_care_source_records`
Rastrea la procedencia y frescura del dato histórico previo.
- `id` (UUID, PK)
- `patient_id` (UUID, FK -> `patients.id`)
- `source_system` (VARCHAR: `OKVET`, `VET_CLINICAL_ORDER`, `IMPORT_CSV`, `CLIENT_REPORTED`)
- `event_type` (VARCHAR: `VACCINATION`, `INTERNAL_DEWORMING`, `EXTERNAL_DEWORMING`, `PREVENTIVE_CHECKUP`)
- `antigen_or_product` (VARCHAR)
- `reported_date` (DATE)
- `verification_status` (VARCHAR: `VERIFIED`, `UNVERIFIED_HISTORY`, `CONFLICT_DETECTED`, `STALE_REVALIDATION_REQUIRED`)
- `vet_notes` (TEXT)

### 2.4 `preventive_care_events`
Instancias programadas derivadas exclusivamente de un plan aprobado.
- `id` (UUID, PK)
- `plan_id` (UUID, FK -> `preventive_care_plans.id`)
- `patient_id` (UUID, FK -> `patients.id`)
- `version_id` (UUID, FK -> `preventive_care_plan_versions.id`)
- `event_type` (VARCHAR)
- `target_date` (DATE)
- `status` (VARCHAR: `SCHEDULED`, `REMINDER_SENT`, `APPOINTMENT_BOOKED`, `APPLIED`, `SKIPPED`, `CANCELLED_BEREAVEMENT`)
- `appointment_id` (UUID, FK -> `appointments.id`, opcional)
- `metadata` (JSONB)

### 2.5 `preventive_product_lots`
Control estricto de lote, caducidad y estado de biológicos y fármacos preventivos.
- `id` (UUID, PK)
- `product_name` (VARCHAR)
- `lot_number` (VARCHAR, UNIQUE)
- `manufacturer` (VARCHAR)
- `expiration_date` (DATE)
- `requires_cold_chain` (BOOLEAN, default `true`)
- `quarantine_status` (VARCHAR: `RELEASED`, `QUARANTINE_EXPIRED`, `QUARANTINE_COLD_CHAIN_BREACH`, `DEPLETED`)

### 2.6 `preventive_cold_chain_checks`
Registro continuo y trazable de la temperatura de la hielera o refrigerador.
- `id` (UUID, PK)
- `lot_id` (UUID, FK -> `preventive_product_lots.id`)
- `recorded_temperature_celsius` (NUMERIC)
- `min_allowed_temp` (NUMERIC, default 2.0)
- `max_allowed_temp` (NUMERIC, default 8.0)
- `is_within_range` (BOOLEAN)
- `checker_vet_id` (UUID)
- `recorded_at` (TIMESTAMPTZ)

### 2.7 `preventive_care_application_records`
Certificación clínica formal de que un biológico o tratamiento fue suministrado por un médico veterinario.
- `id` (UUID, PK)
- `event_id` (UUID, FK -> `preventive_care_events.id`)
- `patient_id` (UUID, FK -> `patients.id`)
- `lot_id` (UUID, FK -> `preventive_product_lots.id`)
- `vet_id` (UUID, FK -> `auth.users.id`)
- `application_timestamp` (TIMESTAMPTZ)
- `application_site` (VARCHAR)
- `adverse_reaction_observed` (BOOLEAN, default `false`)
- `certification_hash` (TEXT)

### 2.8 `preventive_care_incidents`
Registro de alertas de seguridad clínica, rupturas térmicas o reacciones adversas.
- `id` (UUID, PK)
- `patient_id` (UUID, FK -> `patients.id`, opcional)
- `lot_id` (UUID, FK -> `preventive_product_lots.id`, opcional)
- `incident_type` (VARCHAR: `COLD_CHAIN_BREACH`, `EXPIRED_LOT_ATTEMPT`, `ADVERSE_REACTION`, `UNAUTHORIZED_DISPENSATION`)
- `severity` (VARCHAR: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `incident_details` (JSONB)
- `status` (VARCHAR: `OPEN`, `UNDER_INVESTIGATION`, `RESOLVED`)

### 2.9 `preventive_care_audit`
Pista inmutable de auditoría para toda modificación de estado preventivo.

## 3. Funciones y Procedimientos Almacenados (RPCs)
1. `create_approved_preventive_plan(p_patient_id, p_vet_id, p_protocol_spec, p_notes)`
2. `generate_preventive_event(p_plan_id, p_event_type, p_target_date, p_version_id)`
3. `reconcile_preventive_source_record(p_patient_id, p_source_system, p_event_type, p_product, p_date, p_vet_notes)`
4. `schedule_preventive_appointment(p_event_id, p_appointment_id)`
5. `verify_product_lot_and_cold_chain(p_lot_id, p_current_temp)`
6. `record_preventive_application(p_event_id, p_patient_id, p_lot_id, p_vet_id, p_site, p_adverse)`
7. `update_preventive_plan_version(p_plan_id, p_vet_id, p_new_protocol_spec, p_change_reason)`
