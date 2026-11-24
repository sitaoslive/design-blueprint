# VET FREEDOM OS — POST-VISIT COMMITMENT CONTRACT
## Contrato de Datos de Compromisos Post-Visita y Reglas de Negocio
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  

---

## 1. Catálogo de Tipos de Compromisos (`commitment_type`)

1. `SPECIALIST_REFERRAL`: Coordinación de interconsulta con especialista externo.
2. `SPECIALIST_AVAILABILITY`: Indagación de franjas horarias con clínica aliada.
3. `EXTERNAL_BOOKING_CONFIRMATION`: Verificación de cita definitiva con radicado oficial.
4. `SPECIALIST_REPORT`: Requerimiento de informe clínico paraclínico a centro externo.
5. `LAB_RESULT_PENDING`: Espera y revisión de exámenes de laboratorio (sangre, orina, heces).
6. `APPROVED_DOCUMENT_DELIVERY`: Entrega segura de resúmenes, órdenes o certificados aprobados.
7. `CLINICAL_REVIEW_REQUIRED`: Dictamen obligatorio por médico veterinario colegiado.
8. `OKVET_RECORD_PENDING`: Radicación de historia clínica en software oficial OKVET.
9. `ADMINISTRATIVE_FOLLOWUP`: Llamada o trámite de soporte operativo no clínico.
10. `CUSTOMER_CALLBACK`: Respuesta prometida al tutor por solicitud específica.
11. `FUTURE_APPOINTMENT_REQUEST`: Coordinación de próxima visita domiciliaria programada.
12. `RECURRING_CARE_CONTINUITY`: Seguimiento a plan de tratamiento recurrente (VET-CORE-09).
13. `PREVENTIVE_CARE_REVIEW`: Seguimiento a vacuna o desparasitación (VET-CORE-10).
14. `PAYMENT_CLARIFICATION`: Aclaración de tarifa, abono o factura.
15. `COMPLAINT_RESOLUTION`: Atención a inconformidad del tutor con supervisión médica.
16. `MISSING_INFORMATION`: Solicitud de datos administrativos faltantes del paciente.
17. `OTHER_AUTHORIZED_COMMITMENT`: Compromiso extraordinario aprobado por Luis.

---

## 2. Matriz de Prioridad y Plazos Máximos

| Prioridad (`priority`) | Plazo de Atención (`due_at`) | Procedimiento de Escalamiento |
|---|---|---|
| `CRITICAL_P0` | Máximo 2 horas | Escalamiento inmediato a Director Médico (Dr. Luis Ríos). |
| `URGENT_CLINICAL` | Máximo 6 horas | Escalamiento a Médico Veterinario de Guardia. |
| `HIGH` | Máximo 24 horas | Escalamiento a Coordinador de Operaciones. |
| `NORMAL` | Máximo 48 horas | Recordatorio estándar a responsable. |
| `LOW` | Máximo 7 días | Notificación en informe semanal. |
