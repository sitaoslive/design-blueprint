# REGISTRO OFICIAL DE PLANTILLAS META WHATSAPP (TPL-01 A TPL-20)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-03 | Message Templates Registry`  
**Idioma Oficial:** Español de Colombia (`es_CO`)  
**Base de Datos:** `public.message_templates`  
**Total de Plantillas:** 20 oficiales registradas y verificadas

---

## Catálogo Maestro de Plantillas

| Código | Nombre Técnico de Plantilla | Categoría Meta | Propósito Clínico / Operativo | Parámetros Dinámicos Esperados |
| :---: | :--- | :---: | :--- | :--- |
| **TPL-01** | `vet_appointment_request_received` | `UTILITY` | Confirmar que la solicitud de cita del tutor fue recibida y está en evaluación médica. | `{{1}}`: Tutor, `{{2}}`: Mascota |
| **TPL-02** | `vet_appointment_confirmed` | `UTILITY` | Confirmar formalmente la fecha, franja horaria y profesional asignado. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Fecha, `{{4}}`: Franja, `{{5}}`: Veterinario |
| **TPL-03** | `vet_appointment_reminder_24h` | `UTILITY` | Recordatorio automático 24 horas antes de la visita domiciliaria. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Fecha, `{{4}}`: Franja horaria |
| **TPL-04** | `vet_reschedule_proposed` | `UTILITY` | Notificar necesidad de reagendamiento por emergencia quirúrgica o ruta. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Nueva Fecha, `{{4}}`: Nueva Franja |
| **TPL-05** | `vet_reschedule_confirmed` | `UTILITY` | Confirmar la reprogramación acordada de la cita médica. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Nueva Fecha, `{{4}}`: Nueva Franja |
| **TPL-06** | `vet_appointment_cancelled` | `UTILITY` | Notificación de cancelación de servicio médico domiciliario. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Motivo de cancelación |
| **TPL-07** | `vet_veterinarian_on_the_way` | `UTILITY` | Notificar que el veterinario va en desplazamiento hacia el domicilio. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Minutos estimados de llegada, `{{4}}`: Veterinario |
| **TPL-08** | `vet_delay_notice` | `UTILITY` | Avisar con honestidad sobre retrasos imprevistos de tráfico en Medellín/AMVA. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Minutos adicionales de retraso |
| **TPL-09** | `vet_pending_appointment_followup` | `UTILITY` | Seguimiento cordial a solicitudes que quedaron pendientes por datos. | `{{1}}`: Tutor, `{{2}}`: Mascota |
| **TPL-10** | `vet_recurring_visit_reminder` | `UTILITY` | Recordatorio de control periódico para pacientes geriátricos o crónicos. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Tipo de control sugerido |
| **TPL-11** | `vet_preventive_care_due` | `UTILITY` | Aviso de fecha cumplida para plan de vacunación o antiparasitario. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Tratamiento preventivo vencido |
| **TPL-12** | `vet_specialist_referral_options` | `UTILITY` | Entrega de opciones verificadas de especialistas médicos remitidos. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Especialidad, `{{4}}`: Opciones |
| **TPL-13** | `vet_specialist_confirmed` | `UTILITY` | Confirmación de coordinación de consulta con especialista. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Especialista, `{{4}}`: Fecha/Hora |
| **TPL-14** | `vet_clinical_document_available` | `UTILITY` | Notificar disponibilidad de fórmula médica, resultados de laboratorio o epicrisis. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Tipo de documento, `{{4}}`: Enlace portal |
| **TPL-15** | `vet_post_visit_followup` | `UTILITY` | Seguimiento evolutivo del paciente 24-48 horas después de la visita médica. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Veterinario tratante |
| **TPL-16** | `vet_experience_survey` | `UTILITY` | Encuesta de satisfacción de servicio y atención prestada. | `{{1}}`: Tutor, `{{2}}`: Mascota, `{{3}}`: Enlace encuesta breve |
| **TPL-17** | `vet_review_request` | `MARKETING` | Invitación cordial a compartir reseña pública en Google Maps / Reviews. | `{{1}}`: Tutor, `{{2}}`: Enlace seguro de reseña Google |
| **TPL-18** | `vet_payment_pse_link` | `UTILITY` | Envío de enlace seguro para pago en línea vía PSE / tarjeta de crédito. | `{{1}}`: Tutor, `{{2}}`: Monto COP, `{{3}}`: Enlace seguro PSE |
| **TPL-19** | `vet_human_agent_handoff_response` | `UTILITY` | Notificación al tutor de transferencia de la conversación a un asesor humano. | `{{1}}`: Tutor, `{{2}}`: Nombre de operador, `{{3}}`: Área / Rol |
| **TPL-20** | `vet_administrative_notice` | `UTILITY` | Comunicación formal de horarios de festivos o novedades operativas. | `{{1}}`: Tutor, `{{2}}`: Comunicado oficial resumido |
