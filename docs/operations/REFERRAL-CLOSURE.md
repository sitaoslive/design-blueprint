# VET FREEDOM OS — REFERRAL CLOSURE OPERATIONS SOP
## Procedimiento Operativo: Protocolo de Cierre Verificado de Remisiones Veterinarias
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Función RPC:** `close_specialist_referral_verified`  

---

## 1. El Mandato de Cierre Verificado

Una remisión representa un acto de alta responsabilidad médica. Su cierre en Vet Freedom OS (`CLOSED`) no es una acción administrativa arbitraria, sino un **acto de fe pública asistencial** que certifica que el paciente completó la atención especializada y cuenta con continuidad garantizada.

---

## 2. Checklist Obligatorio para Cierre

Antes de invocar el cierre mediante `close_specialist_referral_verified`, se deben verificar los siguientes 5 puntos:

1. [ ] **Cita Cumplida o Inasistencia Asumida:** El paciente asistió (`ATTENDED`) o se gestionó formalmente el plan de inasistencia (`NO_SHOW`).
2. [ ] **Informe Médico Dictaminado:** El especialista emitió el informe y el veterinario tratante de Vet Life lo revisó y aprobó con notas claras.
3. [ ] **Cero Compromisos Clínicos Pendientes:** La consulta `SELECT count(*) FROM specialist_referral_commitments WHERE referral_id = ... AND commitment_status IN ('PENDING', 'IN_PROGRESS', 'OVERDUE')` debe retornar estrictamente `0`.
4. [ ] **Tutor Informado:** Se comunicaron al tutor las conclusiones del especialista y las recomendaciones domiciliarias.
5. [ ] **Identidad del Autorizador:** El cierre debe ejecutarse con el ID del veterinario responsable.

---

## 3. Estado Final y Conservación de Historia Clínica

Una vez que la remisión transita a `CLOSED`:
- Queda protegida como registro inmutable para fines médico-legales.
- Los tokens de acceso documental temporal quedan permanentemente revocados.
- Se archiva en el historial unificado del paciente en Supabase y queda disponible para sincronización con OKVET mediante el procedimiento autorizado.
