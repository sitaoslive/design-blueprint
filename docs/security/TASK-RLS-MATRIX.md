# VET FREEDOM OS — MATRIZ DE SEGURIDAD Y RLS DE TAREAS OPERATIVAS
**Módulo:** VET-CORE-07 | Security & Row Level Security (RLS)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Políticas de Seguridad Globales (PostgreSQL 17)

Todas las tablas creadas en la migración `029` tienen Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`) activado sin excepciones:
1. `operational_tasks`
2. `operational_task_evidence`
3. `operational_task_assignment_history`
4. `operational_task_reminder_jobs`
5. `operational_commitments`
6. `founder_absence_delegations`
7. `operational_shift_handoffs`

---

## 2. Matriz de Permisos por Rol

| Tabla | Rol / Contexto | SELECT | INSERT | UPDATE | DELETE | Condición RLS |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `operational_tasks` | `service_role` | ✅ | ✅ | ✅ | ✅ | Acceso irrestricto de infraestructura n8n y RPCs internos. |
| `operational_tasks` | `authenticated` (Admin / Fundador) | ✅ | ✅ | ✅ | ❌ | `organization_id = auth.jwt()->>'organization_id'` |
| `operational_tasks` | `authenticated` (Colaborador) | ✅ | ❌ | ✅ | ❌ | `assigned_user_id = auth.uid() OR backup_assigned_user_id = auth.uid()` |
| `operational_tasks` | `anon` | ❌ | ❌ | ❌ | ❌ | **DENEGADO TOTALMENTE (0 acceso público)** |
| `operational_task_evidence` | `authenticated` (Auditor / Vet) | ✅ | ✅ | ✅ | ❌ | `is_clinical = true` para verificación clínica. |
| `operational_task_evidence` | `authenticated` (Operativo) | ✅ | ✅ | ❌ | ❌ | Puede adjuntar su comprobante pero no auditarlo. |
| `operational_task_reminder_jobs` | `service_role` | ✅ | ✅ | ✅ | ✅ | Gestionado por orquestador n8n. |
| `operational_task_reminder_jobs` | `authenticated` | ✅ | ❌ | ❌ | ❌ | Solo lectura de sus propios recordatorios programados. |
| `founder_absence_delegations` | `authenticated` (Dr. Luis) | ✅ | ✅ | ✅ | ✅ | Solo el fundador puede crear o revocar delegaciones. |
| `founder_absence_delegations` | `authenticated` (Delegado) | ✅ | ❌ | ❌ | ❌ | Solo lectura de facultades vigentes. |

---

## 3. Barreras Inquebrantables de Integridad Médica

1. **Veto a Decisiones Médicas por IA:** Las inferencias de IA nunca pueden actualizar el estado de una tarea clínica a `VERIFIED`. Las funciones RPC validan explícitamente el contexto de ejecución.
2. **Revocación Inmediata de Acceso a Cuidadores Cesados:** Si un colaborador o cuidador cesa su vinculación laboral, su usuario es marcado inactivo en Supabase Auth, lo que revoca inmediatamente sus tokens JWT y el RLS bloquea cualquier consulta a tareas clínicas o datos de pacientes.
3. **Ofuscación de Datos Médicos en Mensajería Externa:** Los recordatorios emitidos por WhatsApp no contienen diagnósticos, patologías ni datos clínicos reservados; únicamente contienen el código de tarea y el llamado a la acción operativo.
