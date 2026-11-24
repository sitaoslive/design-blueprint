# VET FREEDOM OS — SPECIALIST RESCHEDULE OPERATIONS SOP
## Procedimiento Operativo: Reprogramación de Citas Externas con Especialistas
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tabla:** `specialist_appointment_changes`  

---

## 1. Principio de Continuidad en la Reprogramación

> **REGLA DE ORO:**  
> Una solicitud de reprogramación **NO** invalida ni cancela la cita confirmada previa ante el centro externo hasta que la nueva fecha esté verificada y confirmada con evidencia (`CONFIRMED_EXTERNALLY`).

---

## 2. Flujo Operativo de Reprogramación

1. **Recepción del Requerimiento:** Notificación de cambio proveniente del tutor o de la clínica del especialista.
2. **Registro de la Solicitud:** Se asienta el registro en `specialist_appointment_changes` en estado `PENDING_EXTERNAL_RESCHEDULE`.
3. **Gestión con el Centro:** El coordinador o el webhook solicita la nueva franja al centro médico.
4. **Confirmación con Evidencia:** Una vez que la clínica asigna el nuevo cupo, se ingresa la nueva referencia (`new_external_reference`).
5. **Transición y Notificación:** El estado transita a `EXTERNALLY_CONFIRMED`. Se actualiza la fecha en `specialist_referrals` y se emite la notificación homologada al tutor vía VET-CORE-03.
