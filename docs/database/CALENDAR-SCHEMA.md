# ESQUEMA DE BASE DE DATOS DE CALENDARIOS — VET-CORE-06
## Diccionario de Datos, Tablas Relacionales, Índices, RLS y Stored Procedures

**Proyecto:** VET FREEDOM OS  
**Módulo:** `VET-CORE-06 | GOOGLE CALENDAR SYNC`  
**Migración:** `041_google_calendar_sync_and_connected_calendars_hub.sql`  
**Motor:** PostgreSQL 17.12.0 (Supabase)  
**Estado:** APLICADO Y VERIFICADO (100% RLS Habilitado y Forzado)

---

## 1. Inventario de Tablas (13 Tablas del Hub de Calendarios)

| Tabla | Tipo | Descripción | Política RLS |
| :--- | :--- | :--- | :--- |
| `staff_calendar_connections` | Enriquecida | Conexiones OAuth de Google Calendar por miembro del staff | Forzada (Membresía Org) |
| `calendar_sync_state` | Enriquecida | Estado de sincronización, cursor `next_sync_token`, generación | Forzada (Membresía Org) |
| `external_calendar_events` | Enriquecida | Eventos externos crudos recibidos | Forzada (Membresía Org) |
| `calendar_conflicts` | Enriquecida | Conflictos detectados con citas clínicas (`HIGH_OPS`) | Forzada (Membresía Org) |
| `calendar_blocked_times` | **Nueva** | Intervalos ocupados anonimizados (`BUSY_ONLY`) | Forzada (Membresía Org) |
| `calendar_change_events` | **Nueva** | Registro de cambios entrantes de push y polling | Forzada (Membresía Org) |
| `calendar_event_mappings` | **Nueva** | Mapeo biunívoco Citas <-> Google con hash anti-bucle | Forzada (Membresía Org) |
| `calendar_watch_channels` | **Nueva** | Canales push activos suscritos en Google Calendar | Forzada (Membresía Org) |
| `calendar_sync_runs` | **Nueva** | Historial auditable de corridas de sincronización | Forzada (Membresía Org) |
| `calendar_availability_snapshots` | **Nueva** | Snapshots diarios de disponibilidad consolidada | Forzada (Membresía Org) |
| `calendar_sync_leases` | **Nueva** | Exclusión mutua pesimista para workers concurrentes | Forzada (Membresía Org) |
| `calendar_reconciliation_tasks` | **Nueva** | Tareas de discrepancia de agenda para panel Lovable | Forzada (Membresía Org) |
| `calendar_sync_audit` | **Nueva** | Bitácora inmutable de auditoría forense | Forzada (Membresía Org) |

---

## 2. Detalle de Tablas Críticas

### 2.1 `calendar_blocked_times`
Almacena exclusivamente franjas de tiempo ocupadas sin revelar detalles personales:
- `id` (uuid, PK)
- `organization_id` (uuid, FK `organizations.id`)
- `staff_profile_id` (uuid, FK `staff_profiles.id`)
- `connection_id` (uuid, FK `staff_calendar_connections.id`)
- `start_at` (timestamp with time zone, NOT NULL)
- `end_at` (timestamp with time zone, NOT NULL, CHECK `end_at > start_at`)
- `block_type` (text, CHECK in `'EXTERNAL_BUSY'`, `'PERSONAL_LEAVE'`, `'ADMINISTRATIVE'`, `'BREAK'`)
- `privacy_mode` (text, default `'BUSY_ONLY'`)
- `sanitized_summary` (text, default `'OCUPADO / NO DISPONIBLE (BUSY_ONLY)'`)

### 2.2 `calendar_event_mappings`
Garantiza el mapeo biunívoco y el invariante anti-bucle:
- `id` (uuid, PK)
- `appointment_id` (uuid, FK `appointments.id`)
- `connection_id` (uuid, FK `staff_calendar_connections.id`)
- `google_calendar_id` (text, NOT NULL)
- `google_event_id` (text, NOT NULL)
- `current_sync_generation` (integer, default 1)
- `last_published_hash` (text, NOT NULL)
- `last_direction` (text, CHECK in `'OUTBOUND_TO_GOOGLE'`, `'INBOUND_FROM_GOOGLE'`)
- `status` (text, CHECK in `'SYNCED'`, `'PENDING_UPDATE'`, `'FAILED'`, `'DELETED_EXTERNALLY'`)
- Restricción Única: `UNIQUE (appointment_id, connection_id)`

---

## 3. Stored Procedures Seguros (SECURITY DEFINER)

Los 10 procedimientos operan con `search_path = public` y permisos restringidos a `authenticated` y `service_role`:

1. `register_calendar_connection(org_id, staff_id, provider, cal_id, mode, name, email)`: Registra conexión y crea estado inicial.
2. `acquire_calendar_sync_lease(conn_id, org_id, holder, duration_sec)`: Adquiere exclusión mutua pesimista.
3. `release_calendar_sync_lease(conn_id, holder)`: Libera exclusión mutua de forma limpia.
4. `update_calendar_sync_state(conn_id, status, token, events_count, error)`: Actualiza salud y cursores.
5. `handle_calendar_410_invalidation(conn_id, org_id)`: Invalida cursor ante 410 Gone y agenda full mirror.
6. `ingest_calendar_busy_slot(org_id, staff_id, conn_id, start, end, type)`: Ingesta con sanitización BUSY_ONLY.
7. `detect_calendar_conflicts(org_id, staff_id, conn_id, start, end)`: Detecta solapamientos con citas clínicas.
8. `publish_operational_calendar_event(org_id, apt_id, conn_id, cal_id, evt_id, hash)`: Publica con verificación anti-bucle y prohíbe escritura en calendarios personales.
9. `disconnect_calendar_connection(conn_id, org_id, reason)`: Desconecta, revoca canales y purga slots cacheados.
10. `record_calendar_audit(org_id, conn_id, action, details, actor)`: Inserta auditoría forense inmutable.
