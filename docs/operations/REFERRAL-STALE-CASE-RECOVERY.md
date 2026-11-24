# VET FREEDOM OS — REFERRAL STALE CASE RECOVERY SOP
## Procedimiento Operativo: Detección, Escalamiento y Recuperación de Remisiones Estancadas
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Supervisión:** VET-CORE-20 y VET-CORE-07  
**Tabla:** `specialist_referral_escalations`  

---

## 1. Umbrales de Estancamiento Operativo

El monitor periódico de VET-CORE-11 y VET-CORE-20 inspecciona cada 5 minutos la tabla `specialist_referrals` buscando casos que excedan los tiempos máximos permitidos en cada etapa:

| Estado Actual | Tiempo Máximo Permitido | Acción Automática de Recuperación |
|---|---|---|
| `DRAFT` o `PENDING_CLINICAL_APPROVAL` | > 24 horas | Recordatorio a médico veterinario tratante. |
| `AVAILABILITY_REQUESTED` | > 24 horas | Transición a `AVAILABILITY_EXPIRED` y propuesta de especialista backup. |
| `OFFER_DISPATCHED_TO_CLIENT` | > 24 horas | Transición a `OFFER_EXPIRED` y mensaje de seguimiento al tutor. |
| `EXTERNAL_BOOKING_PENDING` | > 4 horas | Encolar tarea urgente a coordinación para llamada directa a la clínica. |
| `ATTENDANCE_PENDING_VERIFICATION` | > 24 horas post-cita | Solicitud de confirmación de asistencia por WhatsApp al tutor. |
| `REPORT_PENDING` | > 5 días hábiles | Requerimiento formal de informe a la clínica especialista. |
| `REPORT_RECEIVED` | > 48 horas | Alerta a veterinario de Vet Life para emitir dictamen y compromisos. |

---

## 2. Niveles de Escalamiento (`escalation_level`)

- `LEVEL_1_STAFF_REMINDER`: Notificación interna al auxiliar de coordinación asignado.
- `LEVEL_2_SENIOR_COORDINATOR`: Alerta al coordinador general por retraso en respuesta externa.
- `LEVEL_3_MEDICAL_DIRECTOR`: Escalamiento directo a la dirección médica (Dr. Luis Eduardo Ríos) por riesgo de continuidad en casos prioritarios (`HIGH` o `EMERGENCY_STABILIZED`).
