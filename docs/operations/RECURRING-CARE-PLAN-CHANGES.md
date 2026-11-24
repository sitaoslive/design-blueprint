# VET FREEDOM OS — RECURRING CARE PLAN CHANGES
## Versionado y Modificación de Planes Clínicos (v1 -> v2)
**Módulo:** VET-CORE-09  
**Procedimiento Almacenado:** `update_plan_version()`  

---

## 1. Motivos Clínicos para Cambios de Versión

A lo largo de un tratamiento crónico, la evolución del paciente puede requerir:
- **Ajuste de Frecuencia:** Espaciamiento de sesiones por remisión o mejoría clínica (ej. de semanal a quincenal).
- **Intensificación Terapéutica:** Aumento de frecuencia ante crisis o recaída.
- **Ampliación de Sesiones:** Prescripción de un segundo ciclo de rehabilitación motora o fluidoterapia.
- **Sustitución Farmacológica:** Cambio de medicamento por tolerancia o resistencia.

---

## 2. Reglas de Inmutabilidad y Versionado Monotónico

1. **Incremento Monotónico:** Toda alteración a los parámetros sustantivos del plan genera una nueva versión incrementada (`plan_version = prev_version + 1`).
2. **Snapshot Inmutable:** La versión anterior y sus ocurrencias se archivan de forma inalterable en `recurring_care_plan_versions`.
3. **Preservación de Auditoría:** Las ocurrencias completadas en versiones previas nunca se modifican ni se eliminan; sirven como evidencia histórica de la atención brindada.
4. **Regeneración de Ocurrencias Futuras:** Solo las sesiones futuras no ejecutadas se recalculan bajo los nuevos parámetros de la versión vigente.
