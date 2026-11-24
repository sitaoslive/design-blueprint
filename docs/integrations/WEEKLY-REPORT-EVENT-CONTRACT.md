# Contrato de Eventos y Payloads de Integración Semanal (VET-CORE-17)

**Módulo:** `VET-CORE-17 | WEEKLY REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Entorno:** DEVELOPMENT / QA  
**Fecha:** 2026-11-21  

---

## 1. Eventos Admitidos por el Workflow VET-CORE-17

El workflow en n8n Cloud (`CM86KKfUxrbllCzz`) admite tres disparadores estándar:
1. **Cron Schedule Trigger:** Todos los lunes a las `07:00 AM America/Bogota` (`0 7 * * 1`).
2. **Webhook Trigger:** Endpoint seguro `/reports/weekly` (Método POST).
3. **Manual Trigger:** Ejecución controlada por el equipo de ingeniería en entorno QA.

---

## 2. Esquema JSON del Evento Webhook Entrante

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "WeeklyExecutiveReportTriggerEvent",
  "type": "object",
  "required": ["event_type", "triggered_at"],
  "properties": {
    "event_type": {
      "type": "string",
      "enum": ["SCHEDULED_WEEKLY_RUN", "MANUAL_REVISION_REQUEST", "SIMULATION_TEST"]
    },
    "triggered_at": {
      "type": "string",
      "format": "date-time"
    },
    "year_week": {
      "type": "string",
      "pattern": "^[0-9]{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$",
      "description": "Semana ISO-8601 a procesar. Si se omite, se calcula la semana inmediatamente cerrada."
    },
    "requested_by": {
      "type": "string",
      "description": "Identificador del usuario o sistema que solicita el reporte."
    },
    "recalculation_reason": {
      "type": "string",
      "description": "Obligatorio si se está solicitando una versión v2 o superior de una semana ya calculada."
    },
    "qa_mode": {
      "type": "boolean",
      "default": true
    }
  }
}
```

---

## 3. Esquema JSON del Payload Consolidado de Salida

Tras la ejecución del nodo de inteligencia `Process Weekly KPIs & Performance`, se genera el payload que es persistido en Supabase y distribuido internamente:

```json
{
  "report_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "organization_id": "00000000-0000-0000-0000-000000000001",
  "year_week": "2026-W47",
  "week_start_date": "2026-11-16T00:00:00.000-05:00",
  "week_end_date": "2026-11-23T00:00:00.000-05:00",
  "version_number": 1,
  "status": "COMPLETED",
  "data_quality_status": "VERIFIED",
  "is_partial_week": false,
  "metrics": {
    "operations": {
      "unique_requesting_clients": 42,
      "unique_treated_pets": 48,
      "appointments_requested": 45,
      "appointments_confirmed": 38,
      "visits_completed": 35,
      "conversion_rate_cohort": 83.33,
      "cancellations_count": 3
    },
    "capacity": {
      "available_shifts_hours": 180.0,
      "travel_transit_hours": 42.5,
      "protected_breaks_hours": 20.0,
      "net_usable_clinical_hours": 117.5,
      "team_utilization_rate": 78.4,
      "overloaded_vets_count": 0
    },
    "financials": {
      "currency": "COP",
      "gross_invoiced_cop": 14500000,
      "verified_collected_cop": 13800000,
      "unreconciled_pending_cop": 700000,
      "direct_medical_supplies_cop": 2100000,
      "direct_fuel_logistics_cop": 850000,
      "specialist_fees_cop": 1200000,
      "contribution_margin_cop": 9650000,
      "contribution_margin_pct": 69.93,
      "net_profit_cop": null,
      "net_profit_status": "INSUFFICIENT_DATA"
    },
    "founder_autonomy": {
      "tasks_reserved_to_luis_by_policy": 8,
      "tasks_delegable_generated": 24,
      "tasks_resolved_by_team": 16,
      "tasks_automated_by_system": 6,
      "bottlenecks_caused_by_luis_absence": 2,
      "founder_autonomy_rate": 91.67
    },
    "customer_experience": {
      "csat_weighted_average": 4.88,
      "total_feedback_responses": 29,
      "complaints_open_at_cutoff": 0,
      "complaints_resolved_this_week": 2
    }
  },
  "executive_summary_1_page": "WEEKLY BUSINESS REVIEW — Vet Life (Semana 2026-W47)...",
  "send_enabled": false,
  "qa_mode": true
}
```
