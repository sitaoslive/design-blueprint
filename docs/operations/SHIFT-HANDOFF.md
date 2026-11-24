# VET FREEDOM OS — PROTOCOLO DE TRASPASO DE TURNO (SMART SHIFT HANDOFF)
**Módulo:** VET-CORE-07 | Operational Shift Handoff  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Procedimiento de Entrega de Turno

Al finalizar una guardia o jornada de atención a domicilio, el profesional o coordinador saliente debe formalizar la entrega de guardia mediante `public.operational_shift_handoffs`:

1. **Generación del Acta:** Se compilan todas las tareas en estado `IN_PROGRESS`, `BLOCKED`, `WAITING_EXTERNAL` o `PENDING_VERIFICATION`.
2. **Resumen de Casos Críticos:** Se genera un extracto estructurado en `critical_tasks_summary` con pacientes bajo observación, muestras biológicas pendientes de recolección y citas prioritarias de la siguiente ruta.
3. **Aceptación Formal por Turno Entrante:** El colaborador entrante debe revisar el acta y ejecutar `accepted_by_incoming = true`.
4. **Alerta por Falta de Aceptación:** Si transcurren 30 minutos sin que el turno entrante acepte el relevo, el sistema dispara automáticamente una alerta a la supervisión operativa (`escalated_to_supervisor = true`).
