# VET FREEDOM OS — PREVENTIVE CARE STATE MACHINE
## Ciclo de Vida de Planes, Registros y Aplicaciones Preventivas
**Módulo:** VET-CORE-10  
**Dirección Médica:** Dr. Luis Eduardo Ríos  

---

## 1. Máquina de Estados del Plan Preventivo (`preventive_care_plans`)

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Registro / Propuesta
    DRAFT --> PENDING_PROFESSIONAL_REVIEW: Solicitud administrativa
    PENDING_PROFESSIONAL_REVIEW --> APPROVED: Firma por Veterinario Habilitado
    DRAFT --> APPROVED: Creado por Veterinario Activo
    APPROVED --> ACTIVE: Inicio de vigencia
    ACTIVE --> STALE_REQUIRES_REVALIDATION: Registro antiguo (> 365d)
    STALE_REQUIRES_REVALIDATION --> ACTIVE: Revalidado por Veterinario
    ACTIVE --> CHANGE_PENDING_APPROVAL: Ajuste propuesto
    CHANGE_PENDING_APPROVAL --> APPROVED: Nueva versión v2
    ACTIVE --> SUSPENDED_BY_VETERINARIAN: Suspensión médica
    SUSPENDED_BY_VETERINARIAN --> ACTIVE: Reactivación médica
    ACTIVE --> COMPLETED: Vigencia cumplida
    ACTIVE --> CANCELLED_BY_AUTHORIZED_PROFESSIONAL: Cancelación médica
```

---

## 2. Máquina de Estados de la Información y Fuentes (`confidence_status` / `conflict_status`)

- **CONFIRMED / VERIFIED_HIGH:** Registro respaldado por documento clínico oficial en OKVET.
- **PENDING_VERIFICATION / UNVERIFIED:** Información reportada por el tutor o entrada manual pendiente de contraste.
- **STALE:** Registro con más de 365 días de antigüedad sin actualización que requiere revalidación humana obligatoria.
- **CONFLICTING:** Datos contradictorios entre fuentes históricas que bloquean afirmaciones categóricas hacia el cliente.

---

## 3. Máquina de Estados de la Aplicación Clínica (`preventive_care_application_records`)

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Cita agendada dentro de ventana
    SCHEDULED --> APPOINTMENT_CONFIRMED: Confirmada por tutor y OKVET
    APPOINTMENT_CONFIRMED --> APPLICATION_REPORTED: Tutor o auxiliar reporta atención
    APPLICATION_REPORTED --> VERIFIED_APPLIED: Certificación por Médico Veterinario con Lote
    SCHEDULED --> NOT_APPLIED: Cancelación o inasistencia en domicilio
    APPLICATION_REPORTED --> RECORD_CONFLICT: Inconsistencia detectada en producto/lote
```
