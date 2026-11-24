# VET FREEDOM OS — RUNBOOK OPERATIVO DE CANCELACIÓN DE CITAS
**Módulo:** VET-CORE-05 | Appointment Notification Service & Scheduling Gate  
**Procedimiento Operativo Estándar:** SOP-APPT-03  
**Responsable:** Coordinación Clínica / Personal de Admisiones

---

## 1. Política Ética de Cancelación

En Vet Life, la relación con el tutor se basa en la empatía y la protección del paciente:
- Las cancelaciones informadas con antelación no conllevan penalizaciones monetarias automáticas.
- Ante cancelaciones por urgencia clínica (remisión inmediata a hospital veterinario o UCI presencial), el equipo brinda orientación para el traslado seguro de la mascota.

---

## 2. Ejecución Atómica de Cancelación

Para garantizar que **cero notificaciones huérfanas** sean enviadas a un tutor tras cancelar su cita, la cancelación debe realizarse exclusivamente mediante la RPC autorizada:

```sql
SELECT public.cancel_appointment_authorized(
  p_appointment_id := 'uuid-de-cita',
  p_reason         := 'Motivo detallado de la cancelación',
  p_cancelled_by   := 'uuid-usuario-o-staff',
  p_actor_role     := 'STAFF' -- o 'CLIENT'
);
```

### Acciones Atómicas Ejecutadas por el Procedimiento:
1. **Bloqueo Pesimista:** `SELECT * FROM appointments WHERE id = p_appointment_id FOR UPDATE;`.
2. **Chequeo de Idempotencia:** Si la cita ya está cancelada, responde `ALREADY_CANCELLED` sin duplicar eventos.
3. **Incremento de Versión:** `version = version + 1`.
4. **Actualización de Estado:** `status = 'CANCELLED'`, guardando motivo y responsable.
5. **Purga Inmediata de Notificaciones:**
   - `UPDATE appointment_notification_plans SET status = 'CANCELLED' WHERE appointment_id = p_appointment_id;`
   - `UPDATE appointment_notification_jobs SET status = 'CANCELLED', suppression_reason = 'APPOINTMENT_CANCELLED' WHERE appointment_id = p_appointment_id AND status = 'PENDING';`
6. **Emisión de Evento Outbox:** `appointment.cancelled` para liberar agenda en `VET-CORE-06` (Google Calendar) y notificar al médico en ruta.
7. **Liberación de Franja y Activación de Lista de Espera:** La franja horaria queda disponible para ofertarse a tutores en espera (`appointment_waitlist_entries`).
