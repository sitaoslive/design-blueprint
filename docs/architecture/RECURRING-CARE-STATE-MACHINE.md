# VET FREEDOM OS — RECURRING CARE STATE MACHINE
## Ciclo de Vida de Planes y Ocurrencias Recurrentes
**Módulo:** VET-CORE-09  
**Dirección Médica:** Dr. Luis Eduardo Ríos  

---

## 1. Máquina de Estados del Plan Maestro (`recurring_treatment_plans`)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Registro inicial
    DRAFT --> PENDING_REVIEW: Propuesta administrativa
    PENDING_REVIEW --> APPROVED: Aval por Veterinario Clínico
    DRAFT --> APPROVED: Creado por Veterinario Activo
    APPROVED --> ACTIVE: Inicio de ejecución
    ACTIVE --> ACTIVE: Sesión completada (count < total)
    ACTIVE --> COMPLETED: Última sesión completada
    ACTIVE --> HIGH_RISK_MISSED: Visita perdida detectada
    HIGH_RISK_MISSED --> ACTIVE: Retoma avalada por Vet
    ACTIVE --> DISCONTINUED_CLINICAL: Suspensión médica
    ACTIVE --> TERMINATED: Cierre anticipado
```

### Definición de Estados del Plan
- **DRAFT:** Borrador inicial en confección.
- **PENDING_REVIEW:** Plan estructurado por auxiliar o coordinación pendiente de revisión y firma médica.
- **APPROVED / ACTIVE:** Plan autorizado legalmente con ocurrencias generadas y en proceso de ejecución.
- **HIGH_RISK_MISSED:** Semáforo de riesgo activado por inasistencia o interrupción de sesiones.
- **COMPLETED:** Cumplimiento exitoso de la totalidad de sesiones prescritas.
- **DISCONTINUED_CLINICAL:** Cancelación o suspensión justificada clínicamente en historia clínica de OKVET.

---

## 2. Máquina de Estados de la Ocurrencia Individual (`recurring_visit_occurrences`)

```mermaid
stateDiagram-v2
    [*] --> PLANNED: Generación determinística
    PLANNED --> SCHEDULED: Cita agendada dentro de ventana
    SCHEDULED --> CONFIRMED: Confirmación del tutor
    CONFIRMED --> EN_ROUTE: Veterinario sale hacia domicilio
    EN_ROUTE --> IN_SERVICE: Llegada e inicio de atención
    IN_SERVICE --> COMPLETED: Atención finalizada con éxito
    
    SCHEDULED --> MISSED_REQUIRES_REVIEW: No-Show / Cancelación tardía
    CONFIRMED --> MISSED_REQUIRES_REVIEW: Tutor ausente en domicilio
    PLANNED --> MISSED_REQUIRES_REVIEW: Fecha ventana vencida sin agendar
    
    MISSED_REQUIRES_REVIEW --> RESCHEDULED: Aprobado por Veterinario
    MISSED_REQUIRES_REVIEW --> SKIPPED_CLINICAL: Exclusión autorizada por Vet
```

### Transiciones Críticas
1. **PLANNED -> SCHEDULED:** Requiere verificación estricta de ventana `[window_start_date, window_end_date]`.
2. **IN_SERVICE -> COMPLETED:** Gatilla el incremento del contador del plan (`completed_sessions_count += 1`).
3. **Cualquier estado -> MISSED_REQUIRES_REVIEW:** Detiene el flujo automático, genera incidente formal y alerta al coordinador.
