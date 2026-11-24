# CONTRATO DE SINCRONIZACIÓN DE CALENDARIOS — VET-CORE-06
## Especificación de Payloads, Esquemas JSON, Validaciones y Eventos

**Proyecto:** VET FREEDOM OS  
**Módulo:** `VET-CORE-06 | GOOGLE CALENDAR SYNC`  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Estado:** QA / STAGING (Safe Mode: `send_enabled: false`)

---

## 1. Contrato del Webhook de Ingesta (`/calendar/sync`)

### 1.1 Esquema JSON de Entrada (Request Payload)
```json
{
  "event_type": "EXTERNAL_BUSY",
  "external_event_id": "gcal_evt_99882233",
  "staff_profile_id": "s1000000-0000-0000-0000-000000000001",
  "raw_summary": "Consulta externa privada",
  "start_time": "2026-11-21T10:00:00-05:00",
  "end_time": "2026-11-21T11:30:00-05:00",
  "has_scheduled_vet_visit": true,
  "conflicting_appointment_id": "a1000000-0000-0000-0000-000000000001",
  "is_internal_echo": false,
  "is_410_gone": false
}
```

### 1.2 Reglas de Validación de Entrada
1. `staff_profile_id`: Obligatorio, formato UUID v4 existente en `staff_profiles`.
2. `start_time` y `end_time`: Obligatorios, formato ISO 8601 con zona horaria explícita.
3. Invariante temporal: `end_time > start_time`.
4. `is_410_gone`: Booleano; si es `true`, conmuta directamente al flujo de recuperación de cursor.
5. `is_internal_echo`: Booleano; si es `true` o `source_origin == 'VET_FREEDOM_OS_OUTBOUND'`, activa la regla anti-bucle y suprime el reenvío.

---

## 2. Contrato de Salida y Triage de n8n

El nodo `Evaluate Calendar Sync & Triage` clasifica y estructura la respuesta determinista:

```json
{
  "branch": "CONFLICT_DETECTED",
  "action": "RAISE_CALENDAR_CONFLICT",
  "alert_message": "Schedule conflict detected with appointment: a1000000-0000-0000-0000-000000000001",
  "external_event_id": "gcal_evt_99882233",
  "staff_profile_id": "s1000000-0000-0000-0000-000000000001",
  "sanitized_summary": "OCUPADO / NO DISPONIBLE (BUSY_ONLY)",
  "start_time": "2026-11-21T10:00:00-05:00",
  "end_time": "2026-11-21T11:30:00-05:00",
  "sync_mode": "BUSY_ONLY",
  "privacy_mode": "BUSY_ONLY",
  "is_conflict_detected": true,
  "conflicting_appointment_id": "a1000000-0000-0000-0000-000000000001",
  "is_internal_echo": false,
  "is_410_gone": false,
  "sync_hash": "hash_gcal_evt_99882233_2026-11-21T10:00:00-05:00",
  "safe_mode": {
    "send_enabled": false,
    "active": false,
    "write_to_personal_prohibited": true,
    "real_cancel_clinical_prohibited": true
  },
  "synchronized_at": "2026-11-21T18:13:14.011Z"
}
```

---

## 3. Matriz de Clasificación de Ramas de Ejecución

| Rama (`branch`) | Condición de Activación | Nodo Destino | Acción Resultante |
| :--- | :--- | :--- | :--- |
| `CONFLICT_DETECTED` | `has_scheduled_vet_visit == true` y no es eco ni 410 | `Escalate Calendar Conflict Alert` | Inserta en `calendar_conflicts` (HIGH_OPS), notifica a `VET-CORE-07` |
| `HTTP_410_RECOVERY` | `is_410_gone == true` o error `syncTokenInvalid` | `Handle Sync Token 410 Recovery` | Invalida cursor, estado STALE, agenda Full Mirror |
| `ANTI_LOOP_SUPPRESSION` | `is_internal_echo == true` o coincidencia de hash | `Prevent Sync Loop & Acknowledge` | Suprime retransmisión, confirma invariante anti-bucle |
| `CLEAN_BUSY_SLOT` | Evento ocupado no conflictivo (caso normal) | `Update Sync State & Audit` | Inserta en `calendar_blocked_times` con `BUSY_ONLY` |
