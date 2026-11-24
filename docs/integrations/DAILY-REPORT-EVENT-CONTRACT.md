# Contrato de Eventos de Reporte Diario (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Evento de Entrada: Solicitud de Generación Matutina

### Disparador Programado (Cron):
- **Expresión Cron:** `0 6 * * *`
- **Zona Horaria:** `America/Bogota`
- **Payload Inicial:** Automático (sin parámetros de entrada requeridos).

### Disparador Webhook (/reports/daily):
Utilizado para regeneraciones bajo demanda, revisiones tardías o ejecuciones QA.

```json
{
  "event_type": "EXECUTIVE_DAILY_REPORT_REQUESTED",
  "organization_id": "org-vet-life",
  "report_date": "2026-11-21",
  "requested_by": "vet-luis-rios",
  "trigger_reason": "ON_DEMAND_AUDIT",
  "forced_refresh": false,
  "options": {
    "include_drafts": false,
    "bypass_cache": true
  }
}
```

---

## 2. Evento de Salida: Resumen Ejecutivo Compilado

Emitido por el nodo Code `Compile Daily Executive Brief` en n8n:

```json
{
  "event_type": "EXECUTIVE_DAILY_REPORT_COMPILED",
  "organization_id": "org-vet-life",
  "report_date": "2026-11-21",
  "timezone": "America/Bogota",
  "traffic_light": "VERDE",
  "alert_level": "INFORMATIONAL",
  "requires_attention": false,
  "summary_60s": "VET FREEDOM OS — VISIÓN EJECUTIVA (60 SEGUNDOS)...",
  "alerts": [],
  "decisions_for_luis": [],
  "delegated_actions": [
    {
      "assignee": "Coordinación Operativa",
      "action": "Monitoreo de salida puntual en rutas Bogotá Norte y Sur (08:00 AM)"
    }
  ],
  "priorities_tomorrow": [
    "Garantizar cobertura y kit de insumos para las visitas programadas"
  ],
  "metrics": {
    "appointments": { "scheduled": 10, "pending_triage": 0 },
    "visits": { "completed": 9, "in_progress": 1 },
    "staff": { "vets_on_duty": 4, "active_absences": 0, "uncovered_shifts": 0 },
    "routes": { "active_routes": 2, "delays_documented": 0 },
    "finances": {
      "verified_revenue_cop": 2850000,
      "unverified_revenue_cop": 150000,
      "source_status": "AVAILABLE",
      "quality_state": "VERIFIED"
    }
  },
  "safe_mode": {
    "send_enabled": false,
    "active": false,
    "environment": "DEVELOPMENT/QA"
  },
  "generated_at": "2026-11-21T06:00:03.125Z"
}
```

---

## 3. Códigos de Error e Idempotencia

| Código de Error | Descripción | Acción Correctiva |
| :--- | :--- | :--- |
| `ERR_GENERATION_IN_PROGRESS` | Ya existe un worker generando el snapshot para la misma fecha (Advisory Lock activo). | Abortar de forma limpia, no duplicar. |
| `ERR_INVALID_REPORT_DATE` | La fecha suministrada no corresponde a formato `YYYY-MM-DD` válido. | Rechazar con HTTP 400. |
| `ERR_UNAUTHORIZED_TRIGGER` | Solicitud recibida sin firma de autenticación válida o fuera de tenant. | Bloquear con HTTP 403. |
