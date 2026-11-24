# VET FREEDOM OS — DICCIONARIO DE DATOS Y CONVENCIONES DE ESQUEMA
**Proyecto:** Vet Life — Veterinaria a Domicilio  
**Base de Datos:** PostgreSQL 17 en Supabase (`sznvahhocgnhsqhksygq`)  
**Fecha:** 2026-11-20  

---

## 1. CONVENCIONES GLOBALES

- **Identificadores Primarios:** Tipo `UUID` generado automáticamente con `gen_random_uuid()` (nativo en PostgreSQL).
- **Marcas Temporales:** Siempre `TIMESTAMPTZ` con valor por defecto `now()`. Todas las tablas principales cuentan con trigger automático `trg_*_updated_at` que actualiza `updated_at`.
- **Valores Monetarios:** Moneda base `COP` (Pesos Colombianos). Almacenados como `NUMERIC(14,2)` con restricción `CHECK (valor >= 0)`.
- **Aislamiento Multi-Organización:** Columna obligatoria `organization_id UUID NOT NULL REFERENCES public.organizations(id)`.
- **Integridad Referencial:** Claves foráneas explícitas con políticas de eliminación (`ON DELETE RESTRICT` para entidades críticas, `ON DELETE CASCADE` para hijos dependientes).

---

## 2. DICCIONARIO DE TABLAS PRINCIPALES

### TABLA: `public.organizations`
- `id` (UUID, PK): Identificador único de la empresa o inquilino.
- `name` (TEXT, NOT NULL): Nombre comercial (e.g. 'Vet Life — Veterinaria a Domicilio').
- `legal_name` (TEXT): Razón social registrada ante Cámara de Comercio.
- `tax_id` (TEXT): NIT / Identificación tributaria (DIAN).
- `slug` (TEXT, UNIQUE, NOT NULL): Identificador de URL seguro (e.g. 'vet-life-bogota').
- `timezone` (TEXT, NOT NULL, DEFAULT 'America/Bogota'): Zona horaria oficial para agendamiento.
- `default_currency` (TEXT, NOT NULL, DEFAULT 'COP'): Moneda transaccional.

### TABLA: `public.user_profiles`
- `id` (UUID, PK, FK -> `auth.users.id` ON DELETE CASCADE): Vinculación 1:1 con la autenticación de Supabase.
- `email` (TEXT, NOT NULL): Correo electrónico del usuario.
- `full_name` (TEXT, NOT NULL): Nombre completo o razón social.
- `document_type` (TEXT, CHECK): CC, CE, NIT, PASSPORT, OTHER.
- `document_number` (TEXT): Número de cédula o documento de identidad.
- `preferred_language` (TEXT, DEFAULT 'es-CO'): Idioma preferido.

### TABLA: `public.organization_memberships`
- `id` (UUID, PK): Registro de membresía.
- `organization_id` (UUID, FK -> `organizations.id`): Organización a la que pertenece.
- `user_id` (UUID, FK -> `auth.users.id`): Usuario asignado.
- `role` (public.app_role_type, NOT NULL): Uno de los 11 roles del sistema (`OWNER_CLIENT`, `VETERINARIAN`, `DIRECTOR`, etc.).
- `is_primary` (BOOLEAN, DEFAULT false): Organización predeterminada del usuario.

### TABLA: `public.owners`
- `id` (UUID, PK): Identificador del cliente.
- `organization_id` (UUID, FK -> `organizations.id`): Empresa prestadora del servicio.
- `user_id` (UUID, FK -> `auth.users.id`, NULLABLE): Usuario autenticado en Lovable (null si es prospecto pre-registrado por teléfono).
- `first_name` / `last_name` (TEXT, NOT NULL): Nombres y apellidos.
- `primary_phone` (TEXT, NOT NULL): Teléfono en formato internacional para contacto WhatsApp.
- `is_vip` (BOOLEAN, DEFAULT false): Cliente preferencial o con atención prioritaria.
- `status` (TEXT, CHECK): `ACTIVE`, `INACTIVE`, `BLOCKED`, `DECEASED_CLIENT`.

### TABLA: `public.pets`
- `id` (UUID, PK): Identificador del paciente.
- `organization_id` (UUID, FK -> `organizations.id`): Organización.
- `primary_owner_id` (UUID, FK -> `owners.id`): Propietario principal del paciente.
- `name` (TEXT, NOT NULL): Nombre del animal.
- `species` (TEXT, CHECK): `CANINE`, `FELINE`, `OTHER`.
- `breed` (TEXT): Raza.
- `sex` (TEXT, CHECK): `MALE`, `FEMALE`, `UNKNOWN`.
- `is_neutered` (BOOLEAN, DEFAULT false): Castrado / Esterilizado.
- `birth_date` (DATE): Fecha de nacimiento.
- `temperament` (TEXT, CHECK): `FRIENDLY`, `NERVOUS`, `AGGRESSIVE`, `REQUIRES_MUZZLE`, `FEARFUL`.
- `is_temperament_warning` (BOOLEAN, DEFAULT false): Alerta visual preventiva para el veterinario en campo.
- `okvet_patient_id` (TEXT): Identificador externo si está sincronizado con OKVET.

### TABLA: `public.appointments`
- `id` (UUID, PK): Identificador de la cita canónica.
- `organization_id` (UUID, FK -> `organizations.id`): Organización.
- `owner_id` (UUID, FK -> `owners.id`): Propietario solicitante.
- `pet_id` (UUID, FK -> `pets.id`): Mascota a atender.
- `service_id` (UUID, FK -> `services.id`): Servicio principal contratado.
- `address_id` (UUID, FK -> `addresses.id`): Domicilio donde se efectuará la visita.
- `assigned_veterinarian_id` (UUID, FK -> `staff_profiles.id`): Médico veterinario responsable.
- `start_time` / `end_time` (TIMESTAMPTZ, NOT NULL): Ventana horaria de la cita (`start_time < end_time`).
- `status` (TEXT, CHECK):
  - `PROVISIONAL`: Bloqueo temporal.
  - `SCHEDULED`: Agendada internamente.
  - `PENDING_OKVET`: Esperando confirmación oficial en OKVET.
  - `CONFIRMED_OFFICIAL`: Confirmada con soporte oficial de OKVET.
  - `EN_ROUTE`: Veterinario en desplazamiento.
  - `ARRIVED`: En domicilio (check-in realizado).
  - `IN_PROGRESS`: Procedimiento o consulta en ejecución.
  - `COMPLETED`: Atención finalizada y cerrada.
  - `CANCELLED_CLIENT`: Cancelada por solicitud del cliente.
  - `CANCELLED_CLINICAL`: Cancelada por indicación médica.
  - `RESCHEDULED`: Reprogramada a nueva fecha/hora.
  - `NO_SHOW`: Cliente o paciente ausente en el domicilio.
- `okvet_appointment_id` (TEXT): ID de la cita en OKVET.
- `okvet_sync_status` (TEXT, CHECK): `PENDING`, `SYNCED_MANUAL`, `SYNCED_API`, `CONFLICT`, `NOT_REQUIRED`.

### TABLA: `public.transactional_outbox`
- `id` (UUID, PK): Registro único de evento outbox.
- `organization_id` (UUID, FK -> `organizations.id`): Organización del evento.
- `aggregate_type` (TEXT, NOT NULL): Tipo de entidad (`APPOINTMENT`, `PAYMENT`, `REFERRAL`, etc.).
- `aggregate_id` (UUID, NOT NULL): ID de la entidad relacionada.
- `event_type` (TEXT, NOT NULL): Nombre del evento (`APPOINTMENT_REQUESTED`, `VISIT_COMPLETED`, etc.).
- `payload` (JSONB, NOT NULL): Carga útil del evento con los datos requeridos por n8n.
- `idempotency_key` (TEXT, UNIQUE, NOT NULL): Clave de deduplicación generada criptográficamente.
- `status` (TEXT, CHECK): `PENDING`, `CLAIMED`, `PROCESSED`, `FAILED`, `DEAD_LETTER`.
- `retry_count` (INTEGER, DEFAULT 0): Contador de reintentos realizados.
- `max_retries` (INTEGER, DEFAULT 5): Límite máximo antes de derivar a Dead Letter Queue.

---

## 3. TIPOS ENUMERADOS (ENUMS)

- `public.app_role_type`:
  - `OWNER_CLIENT`
  - `CAREGIVER`
  - `VETERINARIAN`
  - `VET_ASSISTANT`
  - `COORDINATOR`
  - `RECEPTION`
  - `FINANCE`
  - `ADMINISTRATOR`
  - `DIRECTOR`
  - `TECH_SUPPORT`
  - `ALPHA_CONSULTANT`
