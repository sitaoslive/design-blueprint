# Catálogo y Diccionario Oficial de Métricas Semanales (VET-CORE-17)

**Módulo:** `VET-CORE-17 | WEEKLY REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Entorno:** DEVELOPMENT / QA  
**Fecha:** 2026-11-21  

---

## 1. Diccionario Unificado de Métricas

Todas las métricas calculadas en el reporte semanal poseen una definición rigurosa, una tipología matemática asignada y un comportamiento explícito ante ausencia de datos:

| Código de Métrica | Nombre Canónico | Tipología Matemática | Unidad | Comportamiento si Denominador == 0 o Falta Fuente |
| :--- | :--- | :--- | :--- | :--- |
| `OP_REQ_UNIQUE_CLIENTS` | Clientes Únicos Solicitantes | Tipo 2 (COUNT DISTINCT) | Tutores | Retorna 0 si no hay solicitudes registradas. |
| `OP_TREATED_UNIQUE_PETS` | Mascotas Únicas Atendidas | Tipo 2 (COUNT DISTINCT) | Pacientes | Retorna 0 si no hubo visitas completadas. |
| `OP_APPOINTMENTS_REQUESTED` | Citas Solicitadas en Ventana | Tipo 1 (Aditiva) | Citas | Retorna 0 si no hay actividad en la semana. |
| `OP_APPOINTMENTS_CONFIRMED` | Citas Confirmadas por Tutor | Tipo 1 (Aditiva) | Citas | Retorna 0. |
| `OP_VISITS_COMPLETED` | Visitas Realizadas con Check-out | Tipo 1 (Aditiva) | Visitas | Retorna 0. Citas canceladas no suman aquí. |
| `OP_COHORT_CONVERSION_RATE` | Conversión de Cohorte Semanal | Tipo 3 (Tasa Global) | Porcentaje (%) | Si solicitudes == 0, retorna `null` (`NOT_APPLICABLE`). Jamás 100% ni NaN. |
| `CAP_AVAILABLE_SHIFTS_HOURS` | Horas Brutas de Turno | Tipo 1 (Aditiva) | Horas | Retorna 0 si el equipo estuvo de licencia. |
| `CAP_PROTECTED_BREAKS_HOURS` | Pausas de Bioseguridad y Almuerzo | Tipo 1 (Aditiva) | Horas | No se computan como tiempo clínico disponible. |
| `CAP_TRAVEL_TRANSIT_HOURS` | Tiempo en Desplazamiento Domiciliario | Tipo 1 (Aditiva) | Horas | Obtenido de bitácoras GPS validadas. |
| `CAP_NET_USABLE_HOURS` | Capacidad Clínica Neta | Tipo 1 (Aditiva) | Horas | `Horas Brutas - Pausas - Traslados`. |
| `CAP_TEAM_UTILIZATION_RATE` | Tasa de Utilización Clínica | Tipo 3 (Tasa Global) | Porcentaje (%) | `(Horas en Consulta Presencial / Capacidad Neta) * 100`. |
| `FIN_GROSS_INVOICED_COP` | Total Facturado Bruto | Tipo 7 (Financiera) | COP | Emisión formal de facturas o cuentas. |
| `FIN_VERIFIED_COLLECTED_COP` | Total Cobrado Verificado | Tipo 7 (Financiera) | COP | Conciliado con extracto bancario o pasarela HMAC. |
| `FIN_CONTRIBUTION_MARGIN_COP` | Margen de Contribución | Tipo 7 (Financiera) | COP | `Cobrado Verificado - Costos Directos Documentados`. |
| `FIN_NET_PROFIT_COP` | Utilidad Neta Real | Tipo 7 (Financiera) | COP | Si faltan costos indirectos, retorna `null` con flag `INSUFFICIENT_DATA`. |
| `FND_TASKS_RESERVED_LUIS` | Tareas Reservadas a Luis por Ley | Tipo 6 (Flujo) | Tareas | COMVEZCOL y reembolsos mayores. No es cuello de botella. |
| `FND_TASKS_DELEGABLE` | Tareas Delegables Generadas | Tipo 6 (Flujo) | Tareas | Reagendamientos, dudas, confirmaciones. |
| `FND_TASKS_RESOLVED_TEAM` | Tareas Resueltas por el Equipo | Tipo 6 (Flujo) | Tareas | Sin intervención directa de Luis. |
| `FND_TASKS_AUTOMATED` | Tareas Automatizadas con Éxito | Tipo 6 (Flujo) | Tareas | Resueltas por workflows de n8n o bots autorizados. |
| `FND_AUTONOMY_RATE` | Tasa de Autonomía Operativa (`WF-075`) | Tipo 3 (Tasa Global) | Porcentaje (%) | `((Equipo + Automatizadas) / Delegables) * 100`. |
| `CX_CSAT_WEIGHTED_AVG` | CSAT Ponderado Semanal | Tipo 4 (Promedio Pond.) | Escala 1.0 a 5.0 | Si respuestas < 5, añade flag `LOW_SAMPLE_SIZE_WARNING`. |
| `CX_OPEN_COMPLAINTS_CUTOFF` | Quejas Abiertas al Corte | Tipo 5 (Stock al Corte) | Quejas | Evaluado exactamente al domingo 23:59:59. |
