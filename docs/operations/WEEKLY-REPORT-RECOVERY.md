# Plan de Continuidad y Recuperación ante Desastres del Reporte Semanal (VET-CORE-17)

**Módulo:** `VET-CORE-17 | WEEKLY REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Entorno:** DEVELOPMENT / QA  
**Fecha:** 2026-11-21  

---

## 1. Escenarios de Falla y Mecanismos de Recuperación

| Escenario de Fallo | Impacto en el Sistema | Protocolo de Mitigación y Recuperación |
| :--- | :--- | :--- |
| **Caída de n8n Cloud al Momento del Cron** | El reporte de las 07:00 AM no se dispara. | Al restablecerse n8n, el Schedule Trigger o un webhook manual ejecuta el job. El advisory lock evita duplicados. Los snapshots históricos residen en Supabase y no sufren pérdida alguna. |
| **Indisponibilidad Temporal de Supabase** | Error al consultar RPCs o persistir snapshot. | n8n aplica política de reintento exponencial (3 intentos con backoff de 30s, 60s, 120s). Si persiste el fallo, el evento se enruta al DLQ de incidentes en `VET-CORE-19`. |
| **Pasarela de Pagos Caída durante la Extracción** | Las métricas de recaudo no pueden ser consultadas. | El sistema asigna `SOURCE_UNAVAILABLE` al dominio financiero, pero continúa exitosamente con la extracción de citas, visitas, horas y compromisos clínicos. No aborta en cascada. |
| **Timeout o Error 500 en Modelo de IA** | El resumen narrativo de IA no se genera. | Se activa de forma determinista el generador de texto WBR estático basado en plantillas con los números consolidados de Supabase. Cero caída del servicio. |
| **Disparo Concurrente de Dos Workers** | Riesgo de colisión o doble cómputo. | El primer worker adquiere el Advisory Lock en PostgreSQL. El segundo worker detecta `claimed = false` y aborta de forma limpia y transparente sin registrar error. |

---

## 2. Resiliencia de Datos y Backups

- Todos los snapshots semanales se persisten en la base de datos relacional de Supabase con réplica activa y respaldos diarios automatizados gestionados en `VET-CORE-21`.
- Si un reporte semanal debe ser reconstruido desde cero meses después, la función `resolve_weekly_period` y las tablas de eventos en bruto permiten recalcular con exactitud matemática el snapshot correspondiente.
