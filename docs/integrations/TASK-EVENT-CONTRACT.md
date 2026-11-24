# VET FREEDOM OS — CONTRATOS DE EVENTOS DE TAREAS OPERATIVAS
**Módulo:** VET-CORE-07 | Integration Contracts & Event Schemas  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Integración con VET-CORE-01 (Event Dispatcher)

El sistema de tareas operativas se comunica bidireccionalmente con el despachador de eventos a través de la tabla `public.outbox_events`:

### 1.1 Eventos Consumidos (Inbound a VET-CORE-07)
| Tipo de Evento | Origen | Acción en VET-CORE-07 |
| :--- | :--- | :--- |
| `appointment.confirmed` | VET-CORE-05 | Crea tarea logística de preparación de ruta y móvil (WF3-051). |
| `appointment.cancelled` | VET-CORE-05 | Cancela tareas operativas asociadas a la cita y purga recordatorios. |
| `customer.commitment_detected` | VET-CORE-02 | Ingesta compromiso en `operational_commitments` y crea tarea de seguimiento. |
| `conversation.escalated` | VET-CORE-04 | Crea tarea de atención preferencial para el asesor asignado. |
| `staff.absence_reported` | Lovable UI | Activa redistribución de tareas y evaluación de delegación. |
| `lab.result_received` | Sistema Externo | Crea tarea clínica de análisis de informe patológico y contacto a tutor. |

### 1.2 Eventos Emitidos (Outbound desde VET-CORE-07)
| Tipo de Evento | Destino | Payload Principal |
| :--- | :--- | :--- |
| `task.created` | VET-CORE-01 | `{ task_id, task_code, title, category, priority, assigned_to, due_at }` |
| `task.assigned` | VET-CORE-03 | `{ task_id, assigned_to, title, due_at, requires_acceptance: true }` |
| `task.overdue` | VET-CORE-04 / 20 | `{ task_id, task_code, escalation_level, current_owner, delay_minutes }` |
| `task.reminder_due` | VET-CORE-03 | `{ task_id, recipient_phone, message_type: "OPERATIONAL_REMINDER" }` |
| `task.verified` | VET-CORE-01 | `{ task_id, task_code, verified_by, completed_at, okvet_synced }` |

---

## 2. Esquema JSON de Eventos

### 2.1 Payload: `task.created`
```json
{
  "event_id": "evt_task_891273918237",
  "event_type": "task.created",
  "aggregate_type": "operational_task",
  "aggregate_id": "a98b7c6d-5e4f-3a2b-1c0d-e9f8a7b6c5d4",
  "occurred_at": "2026-11-21T14:30:00Z",
  "organization_id": "org_vet_life_colombia",
  "payload": {
    "task_code": "TSK-20261121-0042",
    "category": "MEDICATION_CONFIRMATION",
    "title": "Verificar tolerancia a tratamiento para Max (Canino)",
    "priority": "HIGH",
    "assigned_user_id": "usr_vet_valeria_01",
    "backup_assigned_user_id": "usr_coord_laura_02",
    "due_at": "2026-11-22T10:00:00Z",
    "is_clinically_sensitive": true,
    "evidence_required": true,
    "patient_id": "pat_max_retriever_77"
  }
}
```

### 2.2 Payload: `task.reminder_due`
```json
{
  "event_id": "evt_rem_918237192837",
  "event_type": "task.reminder_due",
  "aggregate_type": "operational_task_reminder_job",
  "aggregate_id": "job_1029384756",
  "occurred_at": "2026-11-21T15:00:00Z",
  "payload": {
    "job_id": "job_1029384756",
    "task_id": "a98b7c6d-5e4f-3a2b-1c0d-e9f8a7b6c5d4",
    "task_code": "TSK-20261121-0042",
    "reminder_type": "UPCOMING_DUE",
    "target_channel": "WHATSAPP",
    "recipient_id": "usr_vet_valeria_01",
    "recipient_phone": "+573001234567",
    "planned_for": "2026-11-21T15:00:00Z",
    "safe_mode": true
  }
}
```

---

## 3. Integración con Lovable UI
Lovable interactúa exclusivamente a través de Supabase RPCs (`SECURITY DEFINER`) y vistas con filtros RLS:
- `rpc/create_operational_task`: Creación estructurada desde modal administrativo.
- `rpc/accept_operational_task`: Aceptación en un clic desde la lista de "Mis Tareas".
- `rpc/report_task_completion`: Envío de reporte de cumplimiento adjuntando referencias de imagen o número OKVET.
- `rpc/verify_and_close_task`: Cierre supervisado con firma digital del veterinario o director.
