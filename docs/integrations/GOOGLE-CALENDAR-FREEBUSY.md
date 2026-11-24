# INTEGRACIÓN GOOGLE CALENDAR FREE/BUSY API — VET-CORE-06
## Protocolo de Consulta de Disponibilidad Ocupado/Libre con Sanitización Inviolable

**Proyecto:** VET FREEDOM OS  
**Módulo:** `VET-CORE-06 | GOOGLE CALENDAR SYNC`  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Estado:** QA / STAGING (Safe Mode: `send_enabled: false`)

---

## 1. Justificación y Propósito

El endpoint `freeBusy.query` de la Google Calendar API permite consultar los intervalos de tiempo en los que un calendario está ocupado sin revelar el contenido, naturaleza o participantes de los eventos.

Esta integración constituye el pilar de la política de privacidad de Vet Freedom OS para los calendarios personales del Dr. Luis Eduardo Ríos, de los médicos veterinarios del staff y de los asistentes operativos.

---

## 2. Especificación de la Petición `freeBusy.query`

- **Endpoint HTTP:** `POST https://www.googleapis.com/calendar/v3/freeBusy`
- **Cabeceras:**
  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json
  Accept: application/json
  ```
- **Cuerpo de la Petición (Payload):**
  ```json
  {
    "timeMin": "2026-11-21T00:00:00-05:00",
    "timeMax": "2026-11-28T23:59:59-05:00",
    "timeZone": "America/Bogota",
    "items": [
      { "id": "luis.personal@gmail.com" }
    ]
  }
  ```

---

## 3. Especificación de la Respuesta y Sanitización

Google Calendar retorna exclusivamente pares de marcas de tiempo `start` y `end`:

```json
{
  "kind": "calendar#freeBusy",
  "timeMin": "2026-11-21T00:00:00.000-05:00",
  "timeMax": "2026-11-28T23:59:59.000-05:00",
  "calendars": {
    "luis.personal@gmail.com": {
      "busy": [
        {
          "start": "2026-11-21T10:00:00-05:00",
          "end": "2026-11-21T11:30:00-05:00"
        },
        {
          "start": "2026-11-21T14:00:00-05:00",
          "end": "2026-11-21T15:30:00-05:00"
        }
      ]
    }
  }
}
```

### Invariante de Transformación en Vet Freedom OS:
Cada intervalo `busy` se transforma e ingesta a través de `ingest_calendar_busy_slot` en PostgreSQL:
- `start_at`: `busy.start` normalizado a timestamp with time zone (America/Bogota).
- `end_at`: `busy.end` normalizado a timestamp with time zone.
- `block_type`: `'EXTERNAL_BUSY'`
- `privacy_mode`: `'BUSY_ONLY'`
- `sanitized_summary`: `'OCUPADO / NO DISPONIBLE (BUSY_ONLY)'`

De este modo, se garantiza formalmente que ningún dato personal o clínico privado ingrese al ecosistema de Vet Freedom OS ni sea visualizado en Lovable.
