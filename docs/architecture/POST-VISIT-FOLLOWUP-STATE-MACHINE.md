# VET FREEDOM OS — MÁQUINA DE ESTADOS: SEGUIMIENTO POSVISITA

## 1. Ciclo de Vida del Seguimiento Posvisita
El seguimiento posvisita se gestiona a través de la tabla `customer_experience_followups` y sus procedimientos asociados.

```mermaid
stateDiagram-v2
    [*] --> PENDING_ELIGIBILITY: Cita en estado COMPLETED
    PENDING_ELIGIBILITY --> SCHEDULED: Elegibilidad verificada (Sin duelo, consentimientos activos)
    PENDING_ELIGIBILITY --> SUPPRESSED: Paciente fallecido / Protocolo duelo / Caso sensible
    SCHEDULED --> ATTEMPTED: Despacho en ventana de tiempo (24h - 48h)
    ATTEMPTED --> COMPLETED: Respuesta recibida del tutor
    ATTEMPTED --> EXPIRED: Ventana de 72h sin respuesta (Cierre silencioso sin insistencia)
    COMPLETED --> [*]
    SUPPRESSED --> [*]
    EXPIRED --> [*]
```

## 2. Invariantes Operativas
- **Ventana de Maduración:** No se contacta al tutor antes de 24 horas posteriores al término de la atención para permitir que el paciente descanse y se observe la respuesta clínica inicial.
- **No Duplicidad:** Máximo un seguimiento por cita médica completada.
- **Cierre Silencioso:** Si el tutor no responde a la invitación de feedback, no se realizan llamadas de insistencia ni mensajes de spam.
