# VET FREEDOM OS — CONTRATOS DE EVENTOS DE RUTAS Y PARADAS
**Módulo:** VET-CORE-08 | Route Event Contract  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Eventos Transaccionales Outbox

El sistema de logística y rutas emite eventos a la tabla `public.outbox_events` que son consumidos por VET-CORE-01 (Event Dispatcher) y orquestados por VET-CORE-08:

| Tipo de Evento | Aggregate Type | Detonante | Destino Principal |
| :--- | :--- | :--- | :--- |
| `route.published` | `route` | `publish_authorized_route` | Notificación interna al veterinario en Lovable. |
| `route.stop_en_route` | `route_stop` | `record_vet_en_route` | Notificación ETA formal al tutor vía VET-CORE-03. |
| `route.stop_arrived` | `route_stop` | `record_vet_arrival` | Registro de llegada y aviso interno de presencia. |
| `route.delay_detected` | `route_delay` | `report_and_evaluate_route_delay` | Alerta de retraso >= 15 min al tutor vía VET-CORE-03. |
| `route.reoptimized` | `route` | `propose_and_apply_route_reoptimization` | Actualización de paradas y aviso de reordenamiento. |

---

## 2. Esquemas de Payload JSON

### 2.1 Payload: `route.stop_en_route`
```json
{
  "event_id": "evt_route_8912739182",
  "event_type": "route.stop_en_route",
  "aggregate_type": "route_stop",
  "aggregate_id": "stp-a1b2c3d4-e5f6",
  "occurred_at": "2026-11-21T14:15:00Z",
  "payload": {
    "stop_id": "stp-a1b2c3d4-e5f6",
    "route_id": "rt-bog-20261121-01",
    "appointment_id": "apt-001",
    "vet_name": "Dr. Luis Eduardo Ríos",
    "client_name": "Andrés Echeverry",
    "client_phone": "+573114445566",
    "pet_name": "Max",
    "estimated_arrival": "2026-11-21T09:30:00-05:00",
    "departure_at": "2026-11-21T14:15:00Z"
  }
}
```

### 2.2 Payload: `route.delay_detected`
```json
{
  "event_id": "evt_delay_102938475",
  "event_type": "route.delay_detected",
  "aggregate_type": "route_delay",
  "aggregate_id": "del-89127391823",
  "occurred_at": "2026-11-21T14:45:00Z",
  "payload": {
    "route_id": "rt-bog-20261121-01",
    "stop_id": "stp-a1b2c3d4-e5f6",
    "appointment_id": "apt-001",
    "delay_minutes": 25,
    "delay_reason": "Congestión vehicular severa en Av. Suba",
    "client_name": "Andrés Echeverry",
    "client_phone": "+573114445566",
    "template_code": "vet_route_delay_notice"
  }
}
```
