# VET FREEDOM OS — CONTRATO DE EVENTOS DE CONCILIACIÓN
## Esquemas de Eventos, Estructura de Payloads y Verificación Criptográfica

---

### 1. Estructura General del Sobre de Conciliación (`ReconciliationEnvelope`)

Todo evento procesado o emitido por el motor **VET-CORE-18** se rige por un esquema JSON inmutable:

```json
{
  "$schema": "https://vetfreedom.vetlife.com.co/schemas/reconciliation-event-v1.json",
  "event_id": "01934e8f-7c2a-7d12-9c3f-4e5a6b7c8d9e",
  "organization_id": "00000000-0000-0000-0000-000000000001",
  "correlation_id": "corr_20261121_0200_run176",
  "causation_id": "evt_trigger_schedule_0200",
  "source_connector": "google_calendar",
  "event_type": "integration.reconciliation.discrepancy_detected",
  "timestamp": "2026-11-21T02:00:15.123-05:00",
  "idempotency_key": "rec_disc_gc_apt_456_202611210200",
  "payload": {
    "discrepancy_code": "APPOINTMENT_MISSING_IN_CALENDAR",
    "discrepancy_type": "CALENDAR_SYNC_DRIFT",
    "severity": "MEDIUM",
    "entity_type": "appointment",
    "entity_id": "11111111-2222-3333-4444-555555555555",
    "external_system": "google_calendar",
    "external_id": "gc_evt_mock_apt_456",
    "local_state": {
      "status": "confirmed",
      "scheduled_time": "2026-11-21T10:00:00-05:00",
      "patient_name": "Toby",
      "veterinarian": "Dr. Luis Eduardo Ríos"
    },
    "external_state": null,
    "confidence": "EXACT_VERIFIED_MATCH",
    "suggested_action": "SAFE_REPAIR_PROPOSED",
    "repair_strategy": "RECREATE_CALENDAR_BLOCK"
  },
  "security": {
    "signature_algorithm": "HMAC-SHA256",
    "signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "signed_at": "2026-11-21T02:00:15.125-05:00"
  }
}
```

---

### 2. Tipos de Eventos de Conciliación

| Event Type | Emisor | Receptor | Descripción |
| :--- | :--- | :--- | :--- |
| `integration.connector.healthcheck` | VET-CORE-20 | VET-CORE-18 | Reporte de conectividad e inspección de credenciales. |
| `integration.sync.checkpoint_updated` | VET-CORE-18 | Supabase | Actualización de cursor de eventos procesados. |
| `integration.reconciliation.discrepancy_detected`| VET-CORE-18 | Audit Hub / Lovable | Detección de desviación entre sistemas. |
| `integration.repair.proposed` | VET-CORE-18 | Lovable Control Center | Propuesta formal de auto-reparación o escalado. |
| `integration.repair.authorized` | Dr. Ríos / Coord | VET-CORE-18 | Aprobación humana para proceder con la reparación. |
| `integration.repair.executed` | VET-CORE-18 | Audit Hub | Confirmación de reparación segura completada. |
| `integration.manual_task.created` | VET-CORE-18 | `integration_manual_confirmation_tasks` | Creación de tarea humana obligatoria. |

---

### 3. Validación de Firmas Criptográficas y Dead Letter Queue (DLQ)

Para prevenir ataques de inyección, adulteración de payloads o webhooks no autenticados:
1. Todo webhook externo entrante es verificado contra la clave secreta compartida del proveedor (`X-Hub-Signature-256` en Meta, HMAC en Wompi).
2. Si la firma es inválida, se devuelve HTTP 403, se aborta el procesamiento y se persiste el payload crudo en `integration_event_receipts` con estado `REJECTED_HMAC_INVALID` y severidad `SECURITY_ALERT`.
3. Todo evento que falle más de 3 reintentos por errores de lógica o schema mismatch se traslada a la tabla de Dead Letter Queue para revisión por ingeniería de sistemas.
