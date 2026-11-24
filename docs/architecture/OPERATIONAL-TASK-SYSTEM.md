# VET FREEDOM OS — ARQUITECTURA DEL SISTEMA DE TAREAS Y SEGUIMIENTO OPERATIVO
**Módulo:** VET-CORE-07 | Operational Reminders, Task Lifecycle & Commitment Engine  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Visión y Principios Fundamentales

El sistema de tareas operativas de Vet Freedom OS resuelve el problema de la pérdida de continuidad operativa en servicios veterinarios móviles a domicilio. A diferencia de un gestor de tareas genérico, este motor se rige por axiomas operacionales estrictos:

1. **"Una notificación enviada no significa tarea completada."**  
   Enviar un recordatorio por WhatsApp o push no altera el estado de la tarea; requiere confirmación o reporte explícito de ejecución.
2. **"Una tarea asignada no significa tarea aceptada."**  
   Existe una distinción formal entre `ASSIGNED` y `ACCEPTED`. El colaborador debe acusar recibo y asumir la responsabilidad.
3. **"Una tarea marcada como hecha no significa resultado verificado."**  
   Las tareas críticas o clínicas transitan a `PENDING_VERIFICATION` hasta que el supervisor o veterinario a cargo valida la evidencia (`OKVET_REFERENCE`, comprobante, firma o reporte).
4. **"Una instrucción generada por IA no equivale a una acción ejecutada."**  
   Cualquier extracción realizada por LLMs o agentes conversacionales se registra como propuesta o borrador que requiere validación o ejecución por el motor relacional de Supabase.

---

## 2. Diagrama de Arquitectura Global

```mermaid
flowchart TD
    subgraph Fuentes de Ingesta
        EV[VET-CORE-01: Outbox Events] --> Ingest[Pipeline de Ingesta]
        DASH[Lovable UI: Dashboard Operativo] --> Ingest
        AI[VET-CORE-02: IA Inbound & Extracción] --> Ingest
    end

    subgraph Base de Datos Supabase (PostgreSQL 17)
        Ingest --> RPC_Create[create_operational_task]
        RPC_Create --> Tasks[(public.operational_tasks)]
        Tasks --> Hist[(public.operational_task_assignment_history)]
        Tasks --> Jobs[(public.operational_task_reminder_jobs)]
        Tasks --> Evidence[(public.operational_task_evidence)]
        Tasks --> Commitments[(public.operational_commitments)]
        Tasks --> Absences[(public.founder_absence_delegations)]
        Tasks --> Handoffs[(public.operational_shift_handoffs)]
    end

    subgraph Orquestador n8n (VET-CORE-07)
        Cron[Schedule Trigger: cada 5 min] --> ScanJobs[Scan Pending Reminder Jobs]
        WebH[Webhook Trigger: /reminders/trigger] --> EvalRouter[Evaluate Operational Urgency]
        EvalRouter --> CheckUrgent{¿Reemplazo o Urgencia Inmediata?}
        CheckUrgent -->|Sí| AlertUrgent[Escalate Urgent Shift Reallocation]
        CheckUrgent -->|No| RoutineQueue[Enqueue Routine Operational Reminder]
    end

    subgraph Conexión Saliente y Supervisión
        RoutineQueue --> CORE03[VET-CORE-03: WhatsApp Outbound]
        AlertUrgent --> CORE04[VET-CORE-04: Conversation Escalation]
        RoutineQueue -.-> CORE19[VET-CORE-19: Error Handler & Dead Letter]
        EvalRouter -.-> CORE20[VET-CORE-20: Health Monitor]
    end
```

---

## 3. Componentes Principales

### 3.1 Pipeline de Ingesta y Deduplicación
- **Idempotencia Estricta:** Cada tarea posee un campo `idempotency_key` con restricción `UNIQUE`. Cualquier inserción repetida por reintentos de red o reejecuciones devuelve la tarea existente sin duplicarla.
- **Categorías Operativas:** Soporta 14 categorías normalizadas (`APPOINTMENT_FOLLOWUP`, `CLINICAL_CHECK`, `MEDICATION_CONFIRMATION`, `LAB_SAMPLE_PICKUP`, `LAB_RESULT_FOLLOWUP`, `LOGISTICS_DISPATCH`, `SUPPLY_RESTOCK`, `SHIFT_HANDOFF`, `COMPLAINT_RESOLUTION`, `OKVET_AUDIT`, `INVOICE_COLLECTION`, `FOUNDER_APPROVAL`, `EMERGENCY_COVERAGE`, `GENERAL_ADMIN`).

### 3.2 Motor de Asignación y Roles
- Las tareas verifican el rol del usuario asignado mediante `required_role`.
- Si el usuario asignado se encuentra en descanso, fuera de turno o con ausencia médica registrada, el sistema enruta automáticamente la tarea hacia el `backup_assigned_user_id` o aplica las reglas de delegación vigentes en `founder_absence_delegations`.

### 3.3 Planificador de Recordatorios Durables
- Las notificaciones programadas no residen en la memoria volátil de n8n; se persisten en `public.operational_task_reminder_jobs`.
- Los workers leen lotes mediante transacciones `SELECT ... FOR UPDATE SKIP LOCKED` para evitar colisiones entre workers distribuidos.
- Si una tarea se completa o cancela, sus recordatorios pendientes son marcados como `CANCELLED` inmediatamente.

### 3.4 Centro de Verificación y Cierre
- Las tareas clínicas (`is_clinically_sensitive = true`) exigen evidencia obligatoria (`evidence_required = true`) y sólo pueden ser verificadas y cerradas por un profesional con atribución médica (`is_clinical = true`).
