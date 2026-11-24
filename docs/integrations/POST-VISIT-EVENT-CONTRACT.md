# VET FREEDOM OS — POST-VISIT EVENT CONTRACT
## Especificación de Contratos de Eventos para Continuidad Post-Visita
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS  
**Bus Central:** VET-CORE-01 (Event Dispatcher)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  

---

## 1. Catálogo Canónico de Eventos de Continuidad

| Código de Evento | Origen | Destino | Propósito y Criterio de Activación |
|---|---|---|---|
| `POST_VISIT_STARTED` | CORE-08 / Lovable | CORE-12, CORE-01 | Fin operativo presencial registrado en domicilio. |
| `POST_VISIT_CHECKLIST_COMPLETED` | Lovable / App | CORE-12 | Checklist de cierre completado con identificación de pendientes. |
| `POST_VISIT_COMMITMENT_CREATED` | CORE-12 | CORE-07, Outbox | Compromiso nuevo asentado con responsable y plazo. |
| `POST_VISIT_COMMITMENT_ASSIGNED` | CORE-12 | Staff / Push | Notificación a responsable para aceptación de tarea. |
| `POST_VISIT_COMMITMENT_ACCEPTED` | Staff / Lovable | CORE-12, CORE-07 | Responsable aceptó formalmente el compromiso. |
| `POST_VISIT_COMMITMENT_DUE` | Scheduler (5m) | CORE-07, CORE-03 | Compromiso próximo a vencer (aviso preventivo 2h antes). |
| `POST_VISIT_COMMITMENT_OVERDUE` | Scheduler (5m) | CORE-07, Escalate | Fecha límite superada sin evidencia de cumplimiento. |
| `POST_VISIT_COMMITMENT_SNOOZED` | Lovable / Staff | CORE-12, Audit | Posposición justificada autorizada (anti-snooze). |
| `POST_VISIT_COMMITMENT_DELEGATED` | Lovable / Staff | CORE-12, CORE-07 | Relevo de turno o delegación por ausencia de Luis. |
| `POST_VISIT_COMMITMENT_VERIFIED` | Veterinario | CORE-12, Case | Cumplimiento validado con evidencia y firma. |
| `POST_VISIT_CONTINUITY_CLOSED` | CORE-12 | CORE-01, Audit | Gate de Cierre Verificado completado (0 pendientes). |

---

## 2. Esquema Estándar de Payload de Evento

```json
{
  "event_id": "evt-pvc-20261121-0012",
  "event_type": "POST_VISIT_COMMITMENT_CREATED",
  "occurred_at": "2026-11-21T10:30:00-05:00",
  "source_workflow": "VET-CORE-12",
  "tenant_id": "org-vet-life",
  "data": {
    "case_id": "case-vis-dom-001",
    "commitment_id": "comm-88129",
    "visit_id": "vis-dom-001",
    "patient": {
      "pet_id": "pet-rocky-001",
      "name": "Rocky",
      "species": "CANINE"
    },
    "owner": {
      "owner_id": "own-carlos-001",
      "name": "Carlos Mendoza",
      "phone": "+573001234567"
    },
    "commitment_type": "SPECIALIST_REFERRAL",
    "description": "Coordinar ecocardiograma doppler color",
    "priority": "HIGH",
    "assigned_staff_id": "staff-vet-002",
    "due_at": "2026-11-22T10:30:00-05:00",
    "requires_professional_review": true
  },
  "metadata": {
    "idempotency_key": "idem-pvc-vis-dom-001-specialist-01",
    "environment": "development",
    "trace_id": "tr-pvc-9901"
  }
}
```
