# VET FREEDOM OS — RECURRING CARE STAFF ABSENCE
## Protocolo de Traspaso Seguro (Handover) y Suplencia Médica
**Módulo:** VET-CORE-09  
**Procedimiento Almacenado:** `handle_staff_absence_for_plan()`  

---

## 1. Principios de la Suplencia Médica Domiciliaria

La relación médico-paciente es el eje de la confianza en Vet Life. Sin embargo, ante vacaciones, licencias o incapacidad médica del veterinario titular:
1. **Verificación de Idoneidad Profesional:** El suplente debe ser un veterinario graduado, matriculado (`is_clinical = true`) y activo en el sistema (`is_active = true`).
2. **Preservación Inviolable de Ventanas:** La ausencia del veterinario titular no autoriza a correr o suspender arbitrariamente las fechas de las sesiones de los pacientes críticos.
3. **Comunicación Transparente al Tutor:** El tutor recibe una notificación oportuna informando la asignación del médico suplente con su nombre y credenciales.
4. **Inmutabilidad del Historial:** Las sesiones ya completadas por el titular conservan intacta la autoría original (`assigned_veterinarian_id`). Las sesiones futuras pendientes se reasignan con `backup_veterinarian_id`.

```mermaid
sequenceDiagram
    participant Coord as Coordinación Operativa
    participant DB as Supabase Database
    participant Plan as recurring_treatment_plans
    participant Tutor as Tutor de la Mascota

    Coord->>DB: handle_staff_absence_for_plan(plan_id, backup_vet_id)
    DB->>DB: Valida credenciales clínicas del suplente
    DB->>Plan: Actualiza backup_vet_id y ocurrencias futuras
    DB->>Tutor: Notificación WhatsApp (plantilla vet_recurring_substitute_notice)
    Note over DB,Tutor: Ventanas clínicas permanecen 100% inalteradas
```
