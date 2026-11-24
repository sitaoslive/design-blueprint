# VET FREEDOM OS — MODELO DE DATOS DE RUTAS Y LOGÍSTICA
**Módulo:** VET-CORE-08 | Database Schema & Data Dictionary  
**Migración:** `030_route_logistics_stops_and_dispatch.sql`  
**Base de Datos:** PostgreSQL 17.12.0 (Supabase `sznvahhocgnhsqhksygq`)  

---

## 1. Inventario de Tablas de Rutas

### 1.1 `public.routes` (Tabla Maestra de Rutas)
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `organization_id` (`UUID NOT NULL REFERENCES organizations(id)`)
* `veterinarian_id` (`UUID NOT NULL REFERENCES staff_profiles(id)`)
* `route_date` (`DATE NOT NULL`)
* `status` (`TEXT NOT NULL`): `DRAFT`, `PREPARING`, `SIMULATED`, `PENDING_APPROVAL`, `APPROVED`, `PUBLISHED`, `IN_PROGRESS`, `PARTIALLY_COMPLETED`, `COMPLETED`, `CHANGE_REQUESTED`, `CHANGE_PENDING_APPROVAL`, `SUPERSEDED`, `CANCELLED`, `BLOCKED`, `PLANNED`, `OPTIMIZED`, `DISRUPTED`.
* `route_code` (`TEXT`): Código legible (ej. `RT-20261121-001`).
* `route_version` (`INTEGER NOT NULL DEFAULT 1`): Control de concurrencia optimista.
* `total_distance_km` (`NUMERIC`), `estimated_duration_minutes` (`INTEGER`)
* `start_hub_address` (`TEXT NOT NULL`)
* `proposed_by` (`UUID`), `approved_by` (`UUID`), `approved_at` (`TIMESTAMPTZ`), `published_at` (`TIMESTAMPTZ`)
* `timezone` (`TEXT DEFAULT 'America/Bogota'`), `idempotency_key` (`TEXT UNIQUE`)

### 1.2 `public.route_stops` (Paradas Secuenciales)
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `route_id` (`UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE`)
* `appointment_id` (`UUID NOT NULL REFERENCES appointments(id)`)
* `stop_order` (`INTEGER NOT NULL CHECK (stop_order > 0)`)
* `estimated_arrival` (`TIMESTAMPTZ NOT NULL`), `estimated_departure` (`TIMESTAMPTZ NOT NULL`)
* `actual_arrival` (`TIMESTAMPTZ`), `actual_departure` (`TIMESTAMPTZ`)
* `actual_service_start_at` (`TIMESTAMPTZ`), `actual_service_end_at` (`TIMESTAMPTZ`)
* `travel_buffer_minutes` (`INTEGER DEFAULT 15`), `service_duration_minutes` (`INTEGER DEFAULT 45`)
* `status` (`TEXT NOT NULL`): `PLANNED`, `READY`, `EN_ROUTE`, `ARRIVED`, `SERVICE_STARTED`, `SERVICE_COMPLETED`, `NOT_COMPLETED`, `SKIPPED_WITH_APPROVAL`, `RESCHEDULE_PENDING`, `CANCELLED_OFFICIALLY`.
* `is_clinically_protected` (`BOOLEAN DEFAULT FALSE`)
* `waze_url` (`TEXT`), `google_maps_url` (`TEXT`), `destination_address` (`TEXT`)

### 1.3 `public.route_plan_versions` (Snapshots Inmutables)
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `route_id` (`UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE`)
* `route_version` (`INTEGER NOT NULL`)
* `status` (`TEXT NOT NULL`)
* `stops_snapshot` (`JSONB NOT NULL`), `snapshot_hash` (`TEXT`)
* `created_by` (`UUID`), `created_at` (`TIMESTAMPTZ NOT NULL DEFAULT now()`)

### 1.4 `public.route_stop_events` (Auditoría de Hitos Operativos)
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `stop_id` (`UUID NOT NULL REFERENCES route_stops(id) ON DELETE CASCADE`)
* `route_id` (`UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE`)
* `appointment_id` (`UUID REFERENCES appointments(id)`)
* `event_type` (`TEXT NOT NULL`): `EN_ROUTE`, `ARRIVED`, `SERVICE_STARTED`, `SERVICE_COMPLETED`, `DELAY_REPORTED`, `INCIDENT_REPORTED`, `CORRECTION`.
* `actor_id` (`UUID REFERENCES staff_profiles(id)`), `metadata` (`JSONB`), `created_at` (`TIMESTAMPTZ`)

### 1.5 `public.route_delay_events` (Registro de Retrasos)
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `route_id` (`UUID NOT NULL`), `stop_id` (`UUID`), `appointment_id` (`UUID`)
* `delay_type` (`TEXT`): `DEPARTURE_DELAY`, `TRAVEL_DELAY`, `PREVIOUS_VISIT_OVERRUN`, `ADDRESS_ISSUE`, `STAFF_UNAVAILABLE`, `ROUTE_CONFLICT`, `UNKNOWN_DELAY`.
* `delay_minutes` (`INTEGER NOT NULL`), `delay_reason` (`TEXT NOT NULL`)
* `requires_client_notification` (`BOOLEAN DEFAULT FALSE`), `notification_dispatched` (`BOOLEAN DEFAULT FALSE`)

### 1.6 `public.route_address_verifications` (Validación de Direcciones)
* `id` (`UUID PRIMARY KEY`), `organization_id` (`UUID NOT NULL`), `raw_address` (`TEXT NOT NULL`)
* `accuracy_status` (`TEXT`): `EXACT_ROOFTOP`, `RANGE_INTERPOLATED`, `GEOMETRIC_CENTER`, `APPROXIMATE`, `AMBIGUOUS`, `OUT_OF_COVERAGE`, `FAILED`.
* `is_covered` (`BOOLEAN DEFAULT TRUE`), `coverage_zone` (`TEXT`), `verified_by` (`TEXT`), `verified_at` (`TIMESTAMPTZ`)

### 1.7 `public.route_api_cost_logs` (Control de Costos de Mapas)
* `id` (`UUID PRIMARY KEY`), `provider` (`TEXT`), `endpoint` (`TEXT`), `call_count` (`INTEGER`), `cost_usd` (`NUMERIC`), `cost_cop` (`NUMERIC`), `logged_at` (`TIMESTAMPTZ`)
