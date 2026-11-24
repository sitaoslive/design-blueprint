# VET FREEDOM OS — ESQUEMA RELACIONAL DE TAREAS Y SEGUIMIENTO
**Módulo:** VET-CORE-07 | Database Schema & Data Dictionary  
**Migración:** `029_operational_tasks_commitments_and_reminders.sql`  
**Base de Datos:** PostgreSQL 17.12.0 (Supabase `sznvahhocgnhsqhksygq`)  

---

## 1. Inventario de Tablas (7 Tablas Nuevas)

### 1.1 `public.operational_tasks`
Tabla maestra de tareas operativas y clínicas del negocio.
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`): Identificador único.
* `organization_id` (`UUID NOT NULL`): Aislamiento multi-tenant.
* `task_code` (`TEXT NOT NULL UNIQUE`): Código humano (ej. `TSK-20261121-0001`).
* `category` (`TEXT NOT NULL`): Una de las 14 categorías normalizadas.
* `title` (`TEXT NOT NULL`): Título conciso del requerimiento.
* `description` (`TEXT`): Contexto y detalles operacionales.
* `priority` (`TEXT DEFAULT 'NORMAL'`): `P0_CRITICAL`, `URGENT`, `HIGH`, `NORMAL`, `LOW`.
* `status` (`TEXT DEFAULT 'CREATED'`): Uno de los 18 estados del ciclo de vida.
* `assigned_user_id` (`UUID`): Responsable directo de la tarea.
* `backup_assigned_user_id` (`UUID`): Responsable de relevo o contingencia.
* `created_by_user_id` (`UUID`): Creador de la tarea.
* `due_at` (`TIMESTAMPTZ NOT NULL`): Plazo de vencimiento.
* `sla_minutes` (`INTEGER`): Ventana de SLA de atención.
* `is_clinically_sensitive` (`BOOLEAN DEFAULT FALSE`): Si exige supervisión veterinaria.
* `evidence_required` (`BOOLEAN DEFAULT FALSE`): Si exige comprobante formal para cierre.
* `snooze_count` (`INTEGER DEFAULT 0`): Contador de posposiciones.
* `max_snooze_limit` (`INTEGER DEFAULT 3`): Límite anti-abuso.
* `escalation_level` (`INTEGER DEFAULT 0`): Nivel actual de escalamiento (0..3).
* `version` (`INTEGER DEFAULT 1`): Control de concurrencia optimista.
* `idempotency_key` (`TEXT UNIQUE`): Prevención de duplicados.

### 1.2 `public.operational_task_evidence`
Evidencias registradas para sustentar la ejecución de tareas.
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`): Identificador.
* `task_id` (`UUID REFERENCES operational_tasks(id)`): Tarea asociada.
* `evidence_type` (`TEXT NOT NULL`): `OKVET_REFERENCE`, `DOCUMENT_UPLOAD`, `CALL_LOG`, `PHYSICAL_CHECKLIST`, `CLIENT_CONFIRMATION`, `PHOTO_PROOF`.
* `evidence_data` (`JSONB NOT NULL`): Datos estructurados (ej. `{ "okvet_record_id": "OKV-9921", "verified": true }`).
* `verified_by_user_id` (`UUID`): Usuario profesional que validó la evidencia.
* `verified_at` (`TIMESTAMPTZ`): Timestamp de auditoría.

### 1.3 `public.operational_task_assignment_history`
Registro inmutable de asignaciones, aceptaciones, delegaciones y reasignaciones.
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `task_id` (`UUID REFERENCES operational_tasks(id)`)
* `previous_user_id` (`UUID`), `new_user_id` (`UUID`)
* `assignment_type` (`TEXT`): `INITIAL`, `AUTO_ROUTED`, `MANUAL`, `DELEGATION`, `ESCALATION`, `SHIFT_HANDOFF`.
* `reason` (`TEXT`), `assigned_by_user_id` (`UUID`), `created_at` (`TIMESTAMPTZ`)

### 1.4 `public.operational_task_reminder_jobs`
Cola de notificaciones durables programadas.
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `task_id` (`UUID REFERENCES operational_tasks(id)`)
* `reminder_type` (`TEXT`): `ACCEPTANCE_ALERT`, `UPCOMING_DUE`, `DUE_NOW`, `OVERDUE_ALERT`, `ESCALATION_DIGEST`.
* `target_channel` (`TEXT`): `WHATSAPP`, `INTERNAL_DASHBOARD`, `SMS`, `EMAIL`.
* `recipient_user_id` (`UUID`), `recipient_phone` (`TEXT`)
* `planned_for` (`TIMESTAMPTZ NOT NULL`)
* `status` (`TEXT DEFAULT 'SCHEDULED'`): `SCHEDULED`, `PROCESSING`, `SENT`, `FAILED`, `CANCELLED`, `SUPERCEDED`.
* `idempotency_key` (`TEXT UNIQUE`)

### 1.5 `public.operational_commitments`
Compromisos extraídos de conversaciones y mensajes con clientes o proveedores.
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `task_id` (`UUID REFERENCES operational_tasks(id)`)
* `conversation_id` (`UUID`), `customer_id` (`UUID`), `patient_id` (`UUID`)
* `commitment_text` (`TEXT NOT NULL`)
* `promised_deadline` (`TIMESTAMPTZ NOT NULL`)
* `is_breached` (`BOOLEAN DEFAULT FALSE`)
* `breached_at` (`TIMESTAMPTZ`)

### 1.6 `public.founder_absence_delegations`
Reglas activas durante la ausencia del Dr. Luis Eduardo Ríos.
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `founder_user_id` (`UUID NOT NULL`)
* `delegate_user_id` (`UUID NOT NULL`)
* `delegation_scope` (`TEXT NOT NULL`): `ADMINISTRATIVE_ONLY`, `COORDINATION`, `LOGISTICS`.
* `allows_clinical_actions` (`BOOLEAN DEFAULT FALSE`): Forzado a `false` para delegados no médicos.
* `financial_spending_limit` (`NUMERIC DEFAULT 0.00`): Límite de autorización en COP.
* `starts_at` (`TIMESTAMPTZ NOT NULL`), `expires_at` (`TIMESTAMPTZ NOT NULL`)
* `is_active` (`BOOLEAN DEFAULT TRUE`)

### 1.7 `public.operational_shift_handoffs`
Actas de relevo y entrega de guardia entre colaboradores.
* `id` (`UUID PRIMARY KEY DEFAULT gen_random_uuid()`)
* `outgoing_user_id` (`UUID NOT NULL`), `incoming_user_id` (`UUID NOT NULL`)
* `shift_date` (`DATE NOT NULL`), `shift_type` (`TEXT NOT NULL`)
* `pending_tasks_count` (`INTEGER DEFAULT 0`), `critical_tasks_summary` (`JSONB`)
* `accepted_by_incoming` (`BOOLEAN DEFAULT FALSE`), `accepted_at` (`TIMESTAMPTZ`)
* `escalated_to_supervisor` (`BOOLEAN DEFAULT FALSE`)

---

## 2. Procedimientos Almacenados Atómicos

| Procedimiento | Seguridad | Descripción |
| :--- | :---: | :--- |
| `create_operational_task` | `SECURITY DEFINER` | Ingesta transaccional con idempotencia y creación de jobs preventivos. |
| `accept_operational_task` | `SECURITY DEFINER` | Aceptación formal por el colaborador con verificación de versión. |
| `reassign_or_delegate_task` | `SECURITY DEFINER` | Reasignación auditada, cancelando recordatorios al titular saliente. |
| `snooze_operational_task` | `SECURITY DEFINER` | Posposición controlada con validación de límite anti-abuso. |
| `report_task_completion` | `SECURITY DEFINER` | Reporte de cierre con validación de roles y evidencia requerida. |
| `verify_and_close_task` | `SECURITY DEFINER` | Cierre definitivo por auditor/veterinario verificando evidencia. |
| `escalate_overdue_tasks` | `SECURITY DEFINER` | Batch cron de escalamiento automático para tareas vencidas. |
