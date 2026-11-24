# VET FREEDOM OS — GESTIÓN DE LISTA DE ESPERA DE CITAS
**Módulo:** VET-CORE-05 | Appointment Notification Service & Scheduling Gate  
**Procedimiento Operativo Estándar:** SOP-APPT-05  
**Dirección Médica:** Dr. Luis Eduardo Ríos

---

## 1. Funcionamiento de la Lista de Espera Inteligente

Cuando la agenda médica está completa en una fecha o cuadrante específico, los tutores pueden inscribirse en la lista de espera indicando:
* Rango de fechas deseadas (`preferred_date_start` a `preferred_date_end`).
* Franja preferida (`MORNING` o `AFTERNOON`).
* Prioridad clínica:
  - `STANDARD`: Control general, vacuna anual, profilaxis preventiva.
  - `HIGH`: Paciente geriátrico, tratamiento dermatológico agudizado.
  - `CLINICAL_URGENT`: Sospecha de cuadro infeccioso o dolor moderado (evaluado previamente por triaje médico).

---

## 2. Detección y Liberación Automática de Cupos

Cuando una cita es cancelada (`cancel_appointment_authorized`) o reprogramada a otra fecha:
1. El motor de disponibilidad detecta una ventana vacía de al menos 60 minutos.
2. Consulta `public.appointment_waitlist_entries` buscando entradas activas (`status = 'ACTIVE'`) que coincidan con la fecha, cuadrante y prioridad.
3. Se selecciona el candidato de mayor prioridad y antigüedad de solicitud.
4. Se crea un registro en `public.appointment_waitlist_offers` con:
   - `offered_start_time` y `offered_end_time`.
   - `expires_at`: Momento actual + 60 minutos (temporizador estricto).
   - Estado: `PENDING`.
   - La entrada en lista de espera pasa a `status = 'OFFER_EXTENDED'`.
5. Se envía la notificación transaccional `vet_waitlist_offer` al WhatsApp del tutor.

---

## 3. Resolución de Ofertas

* **Aceptación por el Tutor:**
  - El tutor responde "SÍ" o confirma en la app dentro de los 60 minutos.
  - La oferta pasa a `ACCEPTED`.
  - Se genera automáticamente la cita en estado `HOLD_ACTIVE` y luego `PENDING_OKVET`.
  - La entrada en lista de espera se cierra con `status = 'BOOKED'`.
* **Expiración o Rechazo Voluntario:**
  - Si el tutor no responde en 60 minutos, la oferta expira (`status = 'EXPIRED'`).
  - Si el tutor responde "NO", la oferta se marca como `DECLINED`, pero la entrada en lista permanece `ACTIVE` para futuras oportunidades.
  - El sistema oferta inmediatamente el cupo al siguiente tutor elegible en la lista.
