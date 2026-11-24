# VET FREEDOM OS — RUNBOOK OPERATIVO DE REPROGRAMACIONES DE CITAS
**Módulo:** VET-CORE-05 | Appointment Notification Service & Scheduling Gate  
**Procedimiento Operativo Estándar:** SOP-APPT-02  
**Responsable:** Coordinación Clínica / Dr. Luis Eduardo Ríos

---

## 1. Escenarios de Reprogramación

1. **Reprogramación Solicitada por el Tutor:**
   - Imprevisto laboral o familiar.
   - Paciente no disponible o tutor ausente del domicilio.
   - Solicitud de cambio de franja horaria.
2. **Reprogramación Solicitada por Vet Life (Clínica / Médica):**
   - Emergencia médica veterinaria en curso (atención de paciente crítico previo).
   - Bloqueo vial absoluto o derrumbe en ruta de acceso.
   - Condiciones meteorológicas extremas que comprometen la bioseguridad del traslado.

---

## 2. Procedimiento Paso a Paso

### Paso 1: Creación de la Propuesta de Reprogramación
* En la interfaz de Lovable o mediante invocación de `propose_appointment_reschedule`:
  ```sql
  SELECT public.propose_appointment_reschedule(
    p_appointment_id := 'uuid-de-cita',
    p_proposed_start := '2026-11-26 14:00:00-05',
    p_proposed_end   := '2026-11-26 15:00:00-05',
    p_proposed_vet_id:= 'uuid-del-medico',
    p_reason         := 'Ajuste solicitado por tutor',
    p_requested_by   := 'uuid-usuario',
    p_actor_type     := 'CLIENT' -- o 'VETERINARIAN'
  );
  ```
* **Acción Inmediata del Sistema:**
  - La cita pasa a estado `RESCHEDULE_PROPOSED`.
  - **Todos los jobs de recordatorio pendientes de la versión anterior se marcan como `SUPERSEDED`** (se cancela el 24h y 2h previos).
  - Se genera un registro en `appointment_reschedule_proposals` con expiración a las 24 horas.
  - Se despacha la notificación de propuesta al WhatsApp del tutor.

### Paso 2: Decisión del Tutor
* **Si el Tutor Acepta:**
  - Responde favorablemente en WhatsApp o Web.
  - La propuesta cambia a `ACCEPTED_BY_CLIENT` y la cita pasa a `RESCHEDULE_PENDING_OKVET`.
* **Si el Tutor Rechaza:**
  - La propuesta cambia a `REJECTED_BY_CLIENT`.
  - Se dispara automáticamente `VET-CORE-04` (Conversation Escalation) para que un coordinador humano contacte telefónicamente al tutor y acuerde una nueva franja.

### Paso 3: Confirmación en OKVET y Activación del Nuevo Plan
* El coordinador clínico ingresa a **OKVET**, modifica la cita en el sistema oficial y anota el nuevo radicado o actualización.
* El coordinador ejecuta la función oficial:
  ```sql
  SELECT public.confirm_appointment_reschedule_okvet(
    p_proposal_id    := 'uuid-de-propuesta',
    p_okvet_reference:= 'OKVET-RESCHED-0091',
    p_verified_by    := 'uuid-coordinador'
  );
  ```
* **Efectos Atómicos en Supabase:**
  - La cita regresa a `CONFIRMED_OFFICIAL`.
  - Su versión se incrementa (`version = version + 1`).
  - Se actualizan las nuevas coordenadas temporales (`start_time`, `end_time`) y médico asignado.
  - Se invoca `generate_appointment_notification_plan` generando un nuevo plan durable y jobs recalculados para la nueva fecha.
  - Se emite el evento outbox `appointment.rescheduled` y se encola la plantilla `vet_appointment_rescheduled`.
