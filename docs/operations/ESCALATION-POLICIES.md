# VET FREEDOM OS — POLÍTICAS DE ESCALAMIENTO OPERATIVO
**Módulo:** VET-CORE-07 | Operational Escalation Protocol  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Niveles de Escalamiento

Cuando una tarea no es atendida dentro de su SLA o no es aceptada formalmente, el sistema incrementa de forma determinística su nivel de escalamiento (`escalation_level`):

| Nivel | Condición Detonante | Destinatario Notificado | Acción del Sistema |
| :---: | :--- | :--- | :--- |
| **L0** | Creación normal dentro de SLA. | Responsable asignado. | Recordatorio preventivo estándar. |
| **L1** | Falta de aceptación formal tras SLA (15-60 min) o vencimiento inicial. | Responsable + Supervisor inmediato. | Notificación de urgencia y advertencia de reasignación. |
| **L2** | Vencimiento persistente (>1 hora en P0 / >4 horas en P1). | Responsable de Respaldo (`backup_assigned_user_id`). | Reasignación automática de ejecución para no comprometer al paciente. |
| **L3** | Falta de respuesta de titular y respaldo; o conflicto crítico. | Dr. Luis Eduardo Ríos (o Delegado General si está en Modo Ausencia). | Alerta directiva prioritaria en panel Lovable. |

---

## 2. Detección de Ausencias en Calendario

Antes de emitir un escalamiento a un responsable o backup:
1. El motor consulta `public.user_calendar_status` y `public.operational_shifts`.
2. Si el colaborador figura como `OFF_DUTY`, `SICK_LEAVE` o `ON_VACATION`, el escalamiento salta inmediatamente al siguiente nivel superior o al coordinador de guardia.

---

## 3. Prevención de Bucles de Escalamiento

- Las tareas en estado `VERIFIED` o `CANCELLED` son inmunes al escalamiento.
- El nivel máximo de escalamiento es L3; una vez alcanzado, el cron `escalate_overdue_tasks` no genera nuevas alertas en bucle sino que mantiene el indicador crítico visible en el dashboard directivo.
