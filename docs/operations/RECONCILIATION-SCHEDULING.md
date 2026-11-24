# VET FREEDOM OS — RUNBOOK: PROGRAMACIÓN DE CONCILIACIONES
## Disparadores Programados, Gatilladores por Evento y Ventanas Operacionales

---

### 1. Ventana Operacional de Conciliación Diaria

Para evitar sobrecargar los servicios en horarios de alta atención clínica y visitas domiciliarias (07:00 a 20:00), el motor principal de conciliación transversal VET-CORE-18 está programado para ejecutarse diariamente en la madrugada:

- **Expresión Cron**: `0 2 * * *` (Todos los días a las 02:00 AM)
- **Zona Horaria**: `America/Bogota` (UTC-5)
- **Duración Estimada**: < 45 segundos para el análisis de discrepancias del día previo y próximos 7 días de agenda.
- **Modo en QA**: Inactivo en producción (`active: false`), ejecutado en modo manual o mediante endpoint webhook de test (`/webhook/vet-core-18-reconcile-audit`).

---

### 2. Disparadores Alternativos

Además de la corrida cron diaria, el motor responde a:

1. **Webhook de Evento Crítico**:
   - Invocado cuando un conector externo reporta una desincronización masiva o fallo de webhook (ej. HTTP 410 en Google Calendar o reconexión de Meta Cloud API).
2. **Disparo Manual desde Lovable UI**:
   - Botón *"Ejecutar Conciliación Ahora"* disponible en el Centro de Control de Integraciones para el Dr. Ríos o el Administrador de Sistemas.
   - Utiliza la función RPC `claim_reconciliation_run(p_org_id, 'MANUAL')`.

---

### 3. Procedimiento de Verificación del Scheduler

1. **Inspección en n8n**:
   Verificar que el nodo `Schedule Trigger` en el workflow `VET-CORE-18` tenga configurado:
   - Trigger Interval: `Days`
   - Time: `02:00`
   - Workflow Timezone: `America/Bogota`.
2. **Inspección en Base de Datos**:
   Ejecutar consulta en Supabase:
   ```sql
   SELECT id, run_type, status, started_at, completed_at, discrepancies_detected, repairs_executed
   FROM integration_reconciliation_runs
   ORDER BY started_at DESC LIMIT 5;
   ```
   Verificar que el estado final sea `COMPLETED` o `CLEAN` y que `completed_at` no exceda los 2 minutos posteriores al inicio.
