# Contrato de Métricas de Reporte Diario (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Especificación Formal de los 12 Dominios Operativos

A continuación se detalla la definición matemática, origen y validación de cada una de las métricas clave agregadas diariamente:

### Dominio 1: Citas & Agendamiento (Appointments)
- **`appointments_scheduled`**: Conteo de citas agendadas con fecha calendario igual a `report_date`.
- **`appointments_confirmed`**: Conteo de citas con `status = 'CONFIRMED'`.
- **`appointments_cancelled`**: Conteo de citas con `status = 'CANCELLED'`.
- **`appointments_rescheduled`**: Conteo de citas que sufrieron cambio de slot.
- **`appointments_conversion_rate`**: `(confirmed / scheduled) * 100`.

### Dominio 2: Visitas Operativas & Cierre Clínico (Visits)
- **`visits_completed`**: Conteo de visitas con `check_out_at IS NOT NULL`.
- **`visits_in_progress`**: Visitas con `check_in_at IS NOT NULL` y `check_out_at IS NULL`.
- **`visits_clinical_closure_pending`**: Visitas con `check_out_at IS NOT NULL` y `okvet_clinical_record_id IS NULL`.
- **`visits_signed_records`**: Visitas con registro clínico cerrado y firmado en OKVET.

### Dominio 3: Personal & Ausencias (Staff)
- **`staff_vets_on_duty`**: Médicos veterinarios con turno asignado y activo en el día.
- **`staff_active_absences`**: Conteo de ausencias reportadas en `staff_absences`.
- **`staff_uncovered_shifts`**: Ausencias donde `is_covered = false`. (Dispara Semáforo Rojo si > 0).

### Dominio 4: Rutas, Desplazamientos & Retrasos (Routes)
- **`routes_active`**: Vehículos / rutas despachadas.
- **`routes_stops_completed`**: Domicilios visitados según tracking de ruta.
- **`routes_delays_documented`**: Paradas con retraso superior a 15 minutos documentadas en bitácora.

### Dominio 5: Cuidado Recurrente (Recurring Care)
- **`recurring_visits_due`**: Visitas programadas por planes de tratamiento o crónicos (CORE-09).
- **`recurring_renewals_pending`**: Planes próximos a vencer pendientes de autorización del tutor.

### Dominio 6: Prevención & Bienestar (Prevention)
- **`preventive_vaccines_due`**: Dosis de vacunas agendadas para el día (CORE-10).
- **`preventive_deworming_due`**: Desparasitaciones programadas.

### Dominio 7: Coordinación con Especialistas (Specialists)
- **`specialists_pending_referrals`**: Pacientes con orden de remisión externa pendiente de agendar (CORE-11).
- **`specialists_reports_pending`**: Visitas con especialista realizadas pendientes de recibir contra-remisión.

### Dominio 8: Compromisos Post-Visita (Post-Visit Commitments)
- **`post_visit_commitments_open`**: Compromisos adquiridos en domicilio pendientes de entrega (CORE-12).
- **`post_visit_commitments_overdue`**: Compromisos con `due_at < now()` no cerrados.

### Dominio 9: Documentos Aprobados (Approved Documents)
- **`approved_docs_generated`**: Historias clínicas y fórmulas generadas (CORE-13).
- **`approved_docs_delivered`**: Documentos entregados exitosamente mediante enlace privado.

### Dominio 10: Finanzas & Recaudo (Finances)
- **`revenue_verified_cop`**: Suma en pesos colombianos (COP) de transacciones `PAID_VERIFIED` (CORE-14).
- **`revenue_unverified_cop`**: Suma en COP de pagos reportados pendientes de conciliación bancaria.
- **`unverified_payments_count`**: Número de comprobantes de transferencia pendientes de validar.

### Dominio 11: Experiencia del Cliente (Customer Experience)
- **`cx_csat_average`**: Puntuación media de satisfacción (escala 1 a 5).
- **`cx_open_complaints`**: Reclamaciones o disputas no resueltas.
- **`cx_bereavement_protections`**: Familias en protocolo de duelo activas (CORE-15).

### Dominio 12: Salud de Integraciones Técnicas (Technical Health)
- **`supabase_health_status`**: Estado de conexión a la base de datos principal (`HEALTHY`).
- **`okvet_sync_status`**: Estado del conector clínico (`SYNCED`, `DEGRADED`, `DOWN`).
- **`whatsapp_api_status`**: Estado del canal de mensajería empresarial (`HEALTHY`, `PAUSED_SAFE_MODE`).
