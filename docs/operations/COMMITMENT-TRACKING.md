# VET FREEDOM OS — PROTOCOLO DE SEGUIMIENTO DE COMPROMISOS (COMMITMENT TRACKING)
**Módulo:** VET-CORE-07 | Commitment Tracking & Promise Keeper (WFX-009)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Filosofía de Cumplimiento de Promesas

En la atención veterinaria domiciliaria, la confianza del tutor se construye a través de la puntualidad y el cumplimiento estricto de las promesas ("Le enviamos la fórmula antes de las 4 PM", "Mañana a primera hora le avisamos del resultado de laboratorio", "El Dr. Luis le confirma el slot del cardiólogo en la tarde").

El subsistema de compromisos (`public.operational_commitments`) convierte cada promesa explícita en un objeto rastreable y medible.

---

## 2. Reglas de Ingesta y Detección de Brechas

1. **Fecha Límite Obligatoria:** Cada compromiso debe contar con un `promised_deadline`. Si la promesa del colaborador o IA contiene un término vago ("luego te aviso", "pronto"), el motor asigna por defecto una ventana prudencial máxima de 24 horas laborables.
2. **Detección Determinística de `BREACHED`:** Si `now() > promised_deadline` y la tarea asociada no ha reportado cumplimiento, el registro se marca atómicamente como `is_breached = true` y detona un ticket de alerta prioritaria al Coordinador de Servicio al Cliente.
3. **Bloqueo por Terceros:** Si el retraso se debe a un especialista externo o laboratorio, el colaborador puede marcar la tarea como `BLOCKED` con motivo `WAITING_EXTERNAL`, lo cual suspende la penalización de SLA interno pero mantiene informada a la coordinación.
