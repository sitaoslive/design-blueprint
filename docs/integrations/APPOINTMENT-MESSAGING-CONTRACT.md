# VET FREEDOM OS — CONTRATO DE MENSAJERÍA Y PLANTILLAS DE CITAS
**Módulo:** VET-CORE-05 | Appointment Notification Service  
**Canal Oficial:** WhatsApp Business Platform (Meta Cloud API)  
**Idioma:** Español de Colombia (`es_CO`)  
**Categoría Meta:** `UTILITY` (Permite envío transaccional fuera de la ventana de 24 horas)

---

## 1. Plantillas Oficiales de Meta para el Ciclo de Vida de Citas

Todas las comunicaciones generadas por `VET-CORE-05` se traducen a registros en `public.outbound_dispatch_requests` con una de las siguientes plantillas pre-aprobadas:

### 1. `vet_appointment_confirmed` (Confirmación Oficial)
* **Categoría:** `UTILITY`
* **Cuerpo Aprobado:**
  > "Hola {{1}}, confirmamos oficialmente la visita médica domiciliaria para {{2}} con el {{3}} el día {{4}} en la franja de las {{5}}. Radicado oficial OKVET: {{6}}. Para preparar la visita, agradecemos disponer de un espacio tranquilo y con buena iluminación. ¡Estamos para cuidar a tu mascota!"
* **Parámetros:**
  - `{{1}}`: Nombre del tutor.
  - `{{2}}`: Nombre del paciente.
  - `{{3}}`: Nombre del médico (Dr. Luis Eduardo Ríos).
  - `{{4}}`: Fecha (`YYYY-MM-DD`).
  - `{{5}}`: Franja horaria (`HH:MM AM/PM`).
  - `{{6}}`: Referencia verificada de OKVET.

---

### 2. `vet_appointment_reminder_24h` (Recordatorio 24 Horas Antes)
* **Categoría:** `UTILITY`
* **Cuerpo Aprobado:**
  > "Hola {{1}}, te recordamos la visita veterinaria domiciliaria de {{2}} programada para mañana {{3}} a las {{4}}. Dirección registrada: {{5}}. Por favor asegúrate de que {{2}} esté en casa y mantén su carné de vacunas a la mano. Si requieres ajustar la hora, respóndenos a este mensaje."
* **Parámetros:**
  - `{{1}}`: Tutor.
  - `{{2}}`: Mascota.
  - `{{3}}`: Fecha.
  - `{{4}}`: Hora estimada.
  - `{{5}}`: Dirección de visita.

---

### 3. `vet_veterinarian_on_the_way` (Recordatorio 2 Horas / En Camino)
* **Categoría:** `UTILITY`
* **Cuerpo Aprobado:**
  > "Hola {{1}}, el {{2}} ya se encuentra en ruta para la atención domiciliaria de {{3}}. Hora estimada de llegada: {{4}}. Si hay alguna indicación especial para el ingreso al conjunto o edificio, por favor compártenosla por aquí."
* **Parámetros:**
  - `{{1}}`: Tutor.
  - `{{2}}`: Veterinario.
  - `{{3}}`: Mascota.
  - `{{4}}`: Hora de llegada aproximada.

---

### 4. `vet_appointment_rescheduled` (Reprogramación Confirmada)
* **Categoría:** `UTILITY`
* **Cuerpo Aprobado:**
  > "Hola {{1}}, la cita de {{2}} ha sido reprogramada exitosamente. La nueva fecha oficial es el {{3}} a las {{4}} con el {{5}}. Radicado de actualización OKVET: {{6}}."

---

### 5. `vet_appointment_cancelled` (Cancelación Registrada)
* **Categoría:** `UTILITY`
* **Cuerpo Aprobado:**
  > "Hola {{1}}, confirmamos que la cita médica de {{2}} programada para el {{3}} ha sido cancelada (Motivo: {{4}}). Cuando desees retomar la atención para {{2}}, con gusto te asistiremos."

---

### 6. `vet_appointment_no_show_followup` (Seguimiento Empático No-Show)
* **Categoría:** `UTILITY`
* **Cuerpo Aprobado:**
  > "Hola {{1}}, el equipo de Vet Life estuvo en tu domicilio hoy para la cita de {{2}}, pero no logramos contactarte. Esperamos que todo se encuentre bien contigo y tu mascota. Por favor escríbenos a este chat o llámanos para verificar el estado de salud de {{2}} y reagendar su atención."

---

### 7. `vet_waitlist_offer` (Oferta de Lista de Espera)
* **Categoría:** `UTILITY`
* **Cuerpo Aprobado:**
  > "¡Buenas noticias {{1}}! Se ha liberado una franja para la atención de {{2}} el día {{3}} a las {{4}}. Dado que estás en nuestra lista de espera preferencial, tienes reservado este cupo durante los próximos {{5}} minutos. Responde 'SÍ' para confirmar tu cita o 'NO' para conservarte en lista."

---

## 2. Contrato de Salida hacia VET-CORE-03 (`outbound_dispatch_requests`)

Cada trabajo ejecutado inserta una fila con el siguiente contrato estricto:
```json
{
  "organization_id": "00000000-0000-0000-0000-000000000001",
  "recipient_phone": "+573105550199",
  "recipient_name": "Camila Torres",
  "message_category": "UTILITY",
  "message_purpose": "CONFIRMATION_OFFICIAL",
  "business_entity_type": "APPOINTMENT",
  "business_entity_id": "a1000000-0000-0000-0000-000000000001",
  "business_entity_version": 2,
  "template_code": "vet_appointment_confirmed",
  "template_parameters": {
    "owner_name": "Camila Torres",
    "pet_name": "Luna",
    "date": "2026-11-25",
    "time_window": "10:00 AM",
    "veterinarian_name": "Dr. Luis Eduardo Ríos",
    "okvet_reference": "OKVET-2026-11-0089"
  },
  "has_consent": true,
  "is_bereaved": false,
  "idempotency_key": "disp-apt-job-00000000-0000-0000-0000-000000000001-a1000000-0000-0000-0000-000000000001-v2-CONF",
  "status": "QUEUED",
  "send_enabled": false
}
```
