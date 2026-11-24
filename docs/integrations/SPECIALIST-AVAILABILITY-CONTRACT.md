# VET FREEDOM OS — SPECIALIST AVAILABILITY CONTRACT
## Contrato de Datos e Interfaz de Consulta de Disponibilidad de Especialistas Externos
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Zona Horaria Oficial:** America/Bogota  

---

## 1. Modos de Adquisición de Disponibilidad

El sistema admite dos modalidades operativas para la recolección de agendas de especialistas:

- **Modo A (Calendario Compartido / API):** Consulta síncrona o lectura de calendarios autorizados (Google Calendar / CalDAV / API del centro).
- **Modo B (Mensajería / Asíncrono):** Solicitud formal despachada a la recepción del especialista vía WhatsApp Business o correo oficial, y asentada mediante webhook o interfaz de coordinación.

---

## 2. Esquema de Solicitud de Disponibilidad (`specialist_availability_requests`)

```json
{
  "request_id": "req-spec-8839210",
  "referral_id": "ref-cardio-9921",
  "specialist_id": "spec-cardio-001",
  "patient_summary": {
    "species": "CANINE",
    "breed": "Bulldog Francés",
    "age_years": 4,
    "urgency": "NORMAL",
    "clinical_indication": "Ecocardiograma doppler color por soplo grado III/VI"
  },
  "channel": "WHATSAPP_BUSINESS",
  "requested_at": "2026-11-21T10:00:00-05:00",
  "response_deadline": "2026-11-22T10:00:00-05:00"
}
```

---

## 3. Esquema de Respuesta y Franjas Discretas (`specialist_availability_responses`)

```json
{
  "response_id": "resp-cardio-5512",
  "request_id": "req-spec-8839210",
  "referral_id": "ref-cardio-9921",
  "specialist_id": "spec-cardio-001",
  "channel": "WHATSAPP_BUSINESS",
  "received_at": "2026-11-21T11:15:00-05:00",
  "is_ambiguous": false,
  "options": [
    {
      "slot_start": "2026-11-23T10:00:00-05:00",
      "slot_end": "2026-11-23T11:00:00-05:00",
      "location_address": "Cra 15 # 104-20, Consultorio 301, Bogotá",
      "tariff_amount": 220000,
      "valid_until": "2026-11-22T11:15:00-05:00"
    },
    {
      "slot_start": "2026-11-24T15:00:00-05:00",
      "slot_end": "2026-11-24T16:00:00-05:00",
      "location_address": "Cra 15 # 104-20, Consultorio 301, Bogotá",
      "tariff_amount": 220000,
      "valid_until": "2026-11-22T11:15:00-05:00"
    }
  ]
}
```

---

## 4. Invariantes y Manejo de Ambigüedad

1. **Zona Horaria Estricta:** Todas las marcas temporales se normalizan en la base de datos a UTC con preservación del huso `America/Bogota` para visualización y despacho.
2. **Detección de Ambigüedad:** Si el especialista responde mensajes ambiguos como *"atiendo el martes por la tarde"* sin franja fija:
   - Se marca `is_ambiguous = true`.
   - La respuesta se bloquea para generación automática de ofertas.
   - Se crea una tarea de clarificación inmediata para el equipo de coordinación humana.
3. **Control de Vencimiento:** Cada opción posee una marca `valid_until` (típicamente 24 horas). Pasado este lapso, su estado se actualiza a `EXPIRED` y no puede ser ofertada al tutor sin revalidación.
