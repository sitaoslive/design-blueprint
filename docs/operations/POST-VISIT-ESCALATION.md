# VET FREEDOM OS — POST-VISIT ESCALATION PROTOCOL
## Matriz y Procedimientos de Escalamiento Operativo y Clínico Post-Atención
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS & CONTINUITY HUB  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tabla de Registro:** `public.post_visit_commitment_escalations`  

---

## 1. Justificación y Objetivos

El sistema de escalamiento garantiza que ningún compromiso derivado de una visita quede estancado o desatendido por falta de respuesta, retrasos de terceros o sobrecarga del personal. Todo compromiso vencido, bloqueado o aplazado reiteradamente activa rutas claras de intervención.

---

## 2. Disparadores de Escalamiento

Se consideran disparadores automáticos de escalamiento:

1. **Vencimiento de Fecha Límite (`due_date` superada):** El compromiso no ha sido completado y han transcurrido más de 60 minutos desde su vencimiento.
2. **Estado Bloqueado (`BLOCKED`):** El responsable reporta imposibilidad de avanzar (ej. laboratorio no contesta, tutor no responde mensajes de seguimiento, farmacia sin stock).
3. **Agotamiento de Aplazamientos (Límite de 3 Snoozes - WF3-042):** Se intentó o alcanzó el tercer aplazamiento sin resolución definitiva.
4. **Checklist Incompleto:** La visita cerró presencialmente con ítems médicos sin firmar.
5. **Alerta Clínica en Seguimiento Post-Visita:** El tutor reporta vómito, decaimiento agudo, hemorragia o dolor en la llamada o mensaje de seguimiento.

---

## 3. Matriz de Niveles de Escalamiento

| Nivel | Tiempo / Condición | Destinatario | Canal de Alerta | Acción Requerida |
|---|---|---|---|---|
| **Nivel 1: Recordatorio Activo** | Due Date + 1 hora | Responsable Asignado | Notificación en Lovable / Push | Reanudar gestión o solicitar reasignación justificada. |
| **Nivel 2: Alerta Operativa** | Due Date + 3 horas o Estado `BLOCKED` | Coordinación de Operaciones | Alerta en Dashboard + Mensaje Interno | Intervenir con el proveedor externo o reasignar tarea. |
| **Nivel 3: Alerta de Dirección** | Due Date + 6 horas, Snooze x3 o Riesgo Clínico | Dr. Luis Eduardo Ríos (Director Médico) | WhatsApp Directo + Alerta Roja Lovable | Revisión médica inmediata, contacto directo o exoneración formal. |

---

## 4. Procedimiento de Resolución y Cierre de Incidentes

1. **Reasignación Asistida:** Si el responsable está sobrecargado o fuera de turno, la Dirección Médica reasigna el compromiso mediante `assign_or_delegate_commitment`.
2. **Intervención Externa:** Para bloqueos con especialistas o laboratorios aliados, la Dirección activa canales prioritarios de contacto clínico directo.
3. **Exoneración Médica Formal (`EXONERATED_BY_VET`):** Si un compromiso clínico deja de ser pertinente (ej. el tutor decidió no realizar el examen complementario y firmó desistimiento), únicamente un veterinario con tarjeta profesional COMVEZCOL puede exonerar la tarea, indicando la causa médica en auditoría.
