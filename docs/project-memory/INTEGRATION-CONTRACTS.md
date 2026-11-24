# INTEGRATION CONTRACTS — VET FREEDOM OS
## Contratos de Ingesta, Despacho y Comunicación Inter-Workflow
**Módulo:** `VET-CORE-01 | Event Dispatcher`  
**Versión de Esquema:** `1.0.0` (schema_version = 1)  
**Zona Horaria Oficial:** `America/Bogota` (UTC-5)  
**Moneda:** `COP`  

---

## 1. Endpoint y Seguridad de Entrada

### Webhook Oficial n8n
- **URL Producción:** `https://alphavision.app.n8n.cloud/webhook/vet-events/dispatch`
- **URL Pruebas:** `https://alphavision.app.n8n.cloud/webhook-test/vet-events/dispatch`
- **Método HTTP:** `POST`
- **Autenticación:** Header `Authorization: Bearer <INTERNAL_DISPATCH_SECRET>`
- **Content-Type:** `application/json`

---

## 2. Contrato de Ingesta de Evento de Dominio (Schema Version 1)

### Esquema JSON

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "VetFreedomDomainEvent",
  "type": "object",
  "required": [
    "event_id",
    "organization_id",
    "event_type",
    "schema_version",
    "entity_type",
    "entity_id",
    "occurred_at",
    "idempotency_key",
    "source_system",
    "payload"
  ],
  "properties": {
    "event_id": {
      "type": "string",
      "description": "Identificador único global del evento (UUID v4 o prefijo evt-)"
    },
    "organization_id": {
      "type": "string",
      "format": "uuid",
      "description": "UUID de la organización inquilina (Multi-tenant isolation)"
    },
    "event_type": {
      "type": "string",
      "pattern": "^[a-z0-9_]+\\.[a-z0-9_]+$",
      "description": "Nombre canónico del evento en formato dominio.accion (ej: appointment.confirmed)"
    },
    "schema_version": {
      "type": "integer",
      "const": 1,
      "description": "Versión del contrato soportada por el consumidor (actualmente 1)"
    },
    "entity_type": {
      "type": "string",
      "enum": [
        "appointment",
        "patient",
        "client",
        "staff",
        "route",
        "treatment",
        "referral",
        "payment",
        "message",
        "approval",
        "system"
      ]
    },
    "entity_id": {
      "type": "string",
      "description": "Identificador principal del agregado de negocio afectado"
    },
    "occurred_at": {
      "type": "string",
      "format": "date-time",
      "description": "Marca de tiempo ISO 8601 con zona horaria en que se originó el evento"
    },
    "correlation_id": {
      "type": "string",
      "description": "UUID que vincula todas las operaciones derivadas de un mismo flujo raíz"
    },
    "causation_id": {
      "type": ["string", "null"],
      "description": "UUID del evento previo inmediato que causó este evento (trazabilidad causal)"
    },
    "idempotency_key": {
      "type": "string",
      "description": "Clave única para prevención de procesamiento duplicado"
    },
    "source_system": {
      "type": "string",
      "enum": ["SUPABASE_CORE", "LOVABLE_APP", "OKVET_SYNC", "WHATSAPP_GATEWAY", "SYSTEM_HEALTH"]
    },
    "payload": {
      "type": "object",
      "description": "Cuerpo de datos del evento; no debe incluir notas clínicas confidenciales ni datos bancarios"
    }
  }
}
```

### Ejemplo de Payload Válido

```json
{
  "event_id": "3e9fbd05-e60d-4aa8-b635-b19479dde03d",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "event_type": "appointment.confirmed",
  "schema_version": 1,
  "entity_type": "appointment",
  "entity_id": "550e8400-e29b-41d4-a716-446655440000",
  "occurred_at": "2026-11-20T21:58:46.000-05:00",
  "correlation_id": "c0a80101-0000-0000-0000-000000000001",
  "causation_id": null,
  "idempotency_key": "idemp-appt-20261120-001",
  "source_system": "SUPABASE_CORE",
  "payload": {
    "appointment_id": "550e8400-e29b-41d4-a716-446655440000",
    "client_phone": "+573001234567",
    "patient_name": "Firulais",
    "scheduled_date": "2026-11-21T09:00:00-05:00",
    "service_code": "CONSULTA_GENERAL_DOMICILIO"
  }
}
```

---

## 3. Matriz de Enrutamiento de Dominios en VET-CORE-01

| Dominio | Prefijo de `event_type` | Módulo Destino Principal | Responsabilidad |
|---|---|---|---|
| **appointment** | `appointment.*` | `VET-CORE-05` | Gestión de agenda, citas, confirmaciones y reprogramaciones |
| **message** | `message.*` | `VET-CORE-02` / `VET-CORE-03` | Ingesta de WhatsApp, transcripción y respuestas asistidas |
| **route** | `route.*` | `VET-CORE-06` | Optimización de desplazamientos domiciliarios |
| **treatment** | `treatment.*` | `VET-CORE-07` | Adherencia a tratamientos crónicos y recordatorios clínicos |
| **referral** | `referral.*` | `VET-CORE-08` | Coordinación de interconsultas con especialistas |
| **payment** | `payment.*` | `VET-CORE-10` | Registro de recaudo, comprobantes y conciliación financiera |
| **staff** | `staff.*` | `VET-CORE-13` | Cambios de turno, ausencias y asignaciones del equipo |
| **approval** | `approval.*` | `VET-CORE-14` | Bandeja de decisiones y aprobaciones del Dr. Luis |
| **health** | `integration.*`, `system.*` | `VET-CORE-20` | Monitoreo de salud técnica e integraciones |

---

## 4. Contrato de Salida hacia Sub-Workflows

Cada sub-workflow especializado recibe una estructura normalizada generada por el nodo de preparación de despacho:

```json
{
  "event_id": "3e9fbd05-e60d-4aa8-b635-b19479dde03d",
  "correlation_id": "c0a80101-0000-0000-0000-000000000001",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "event_type": "appointment.confirmed",
  "schema_version": 1,
  "domain": "appointment",
  "target_core_module": "VET-CORE-05",
  "aggregate_type": "appointment",
  "aggregate_id": "550e8400-e29b-41d4-a716-446655440000",
  "idempotency_key": "idemp-appt-20261120-001",
  "payload": { ... },
  "processed_at": "2026-11-20T21:58:48.258Z",
  "status": "dispatched"
}
```

---

## 5. Contrato de Respuesta hacia Supabase (Outbox Result)

Al concluir el procesamiento, el consumidor registra el resultado invocando la función RPC:
`SELECT public.complete_outbox_event(p_event_id, p_result);`

### Estructura de `p_result`:

```json
{
  "dispatched_to": "VET-CORE-05",
  "status": "SUCCESS",
  "execution_id": "75",
  "timestamp": "2026-11-20T21:58:48.279Z",
  "actions_triggered": 1,
  "external_calls": 0
}
```
