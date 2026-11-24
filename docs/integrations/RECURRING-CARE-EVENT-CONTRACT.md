# VET FREEDOM OS — RECURRING CARE EVENT CONTRACT
## Contrato de Eventos y Payloads entre n8n Cloud y Supabase
**Módulo:** VET-CORE-09 | Workflow ID: `iY1wZT6twRq77eZZ`  
**Endpoint Webhook:** `POST /webhook/recurring-care/notify`  

---

## 1. Catálogo de Tipos de Evento

| Evento | Descripción | Destino Primario | Plantilla Homologada |
| :--- | :--- | :--- | :--- |
| `recurring.plan_approved` | Notificación de plan prescrito y aprobado por el médico | VET-CORE-03 | `vet_recurring_plan_welcome` |
| `recurring.occurrence_scheduled` | Confirmación de cita agendada dentro de ventana clínica | VET-CORE-03 | `vet_recurring_session_reminder` |
| `recurring.reminder_48h` | Recordatorio anticipado con instrucciones de preparación | VET-CORE-03 | `vet_recurring_session_reminder` |
| `recurring.reminder_24h` | Recordatorio previo con franja horaria y confirmación | VET-CORE-03 | `vet_recurring_session_reminder` |
| `recurring.occurrence_missed` | Sesión no realizada / inasistencia detectada | Coordinación | Alerta Clínica Interna |
| `recurring.adherence_risk_detected` | Retraso $\ge 2$ días en plan activo no confirmado | Coordinación | Alerta Abandono Terapéutico |
| `recurring.backup_vet_assigned` | Notificación de médico suplente habilitado | VET-CORE-03 | `vet_recurring_substitute_notice` |

---

## 2. Estructura JSON del Evento Inbound

```json
{
  "event_type": "recurring.reminder_24h",
  "plan_id": "rec-plan-001",
  "plan_status": "ACTIVE_APPROVED",
  "treatment_name": "Plan Manejo Enfermedad Renal Crónica",
  "session_number": 4,
  "total_sessions": 8,
  "client_name": "Lucía Benítez",
  "client_phone": "+573128887766",
  "pet_name": "Bruno",
  "is_attendance_confirmed": true,
  "overdue_days": 0
}
```

---

## 3. Estructura de Salida para Despacho Seguro (Safe Mode)

```json
{
  "action": "ENQUEUE_OUTBOUND_DISPATCH",
  "target_workflow": "VET-CORE-03",
  "alert_summary": "Recordatorio de sesión 4/8 para Bruno (Plan Manejo Enfermedad Renal Crónica).",
  "recipient_target": "+573128887766",
  "template_code": "vet_recurring_session_reminder",
  "send_enabled": false,
  "processed_at": "2026-11-21T14:35:00.000Z"
}
```
