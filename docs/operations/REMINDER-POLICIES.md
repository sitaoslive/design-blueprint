# VET FREEDOM OS — POLÍTICAS DE RECORDATORIOS OPERATIVOS
**Módulo:** VET-CORE-07 | Operational Reminder Policies & Cadence  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Cadencia y Temporización de Recordatorios

Los recordatorios operacionales evitan la pérdida de contexto y el vencimiento de compromisos clínicos. La cadencia estándar por nivel de prioridad es:

| Prioridad | Recordatorio de Aceptación | Recordatorio Preventivo | Al Vencimiento (`due_at`) | Escalamiento por Mora |
| :--- | :--- | :--- | :--- | :--- |
| `P0_CRITICAL` | A los 5 min de asignado | 30 min antes | Inmediato | 15 min de retraso |
| `URGENT` | A los 15 min | 1 hora antes | Inmediato | 30 min de retraso |
| `HIGH` | A los 30 min | 2 horas antes | Inmediato | 60 min de retraso |
| `NORMAL` | A las 2 horas | 4 horas antes | Inmediato | 2 horas de retraso |
| `LOW` | No aplica | 1 día antes | Inmediato | 24 horas de retraso |

---

## 2. Prevención de Fatiga de Alertas (Alert Fatigue)

Para evitar saturar al personal médico y de coordinación en ruta:
1. **Consolidación en Digest:** Los recordatorios de baja y normal prioridad se consolidan en un único resumen matutino (07:30 AM) o vespertino (01:30 PM).
2. **Supresión en Turno de Descanso:** No se envían notificaciones push o de WhatsApp a personal cuyo turno ha concluido, excepto emergencias P0 que se redirigen al backup en guardia.
3. **Deduplicación por Clave de Idempotencia:** El worker n8n garantiza que no existan alertas repetidas para un mismo evento y destinatario dentro de un período de 60 minutos.
