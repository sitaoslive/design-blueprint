# Catálogo de Definiciones de Métricas Ejecutivas (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Catálogo Base Poblado en la Migración 037

La tabla `executive_metric_definitions` contiene los metadatos que rigen el cálculo y control de calidad de cada métrica:

| Código de Métrica | Dominio | Tipo de Valor | Umbral Crítico | Tolerancia Faltante |
| :--- | :--- | :--- | :--- | :--- |
| `visits_completed` | VISITS | INTEGER | < 70% de programadas | 0 (Obligatorio) |
| `appointments_confirmed` | APPOINTMENTS | INTEGER | < 80% del cupo diario | 0 (Obligatorio) |
| `uncovered_shifts` | STAFF | INTEGER | > 0 (Semáforo Rojo) | 0 (Crítico) |
| `delays_documented` | ROUTES | INTEGER | > 2 retrasos mayores a 15m | 1 retraso |
| `overdue_commitments` | POST_VISIT | INTEGER | > 0 compromisos vencidos | 0 (Compromiso cliente) |
| `pending_referrals` | SPECIALISTS | INTEGER | > 2 sin agendar en 48h | 1 pendiente |
| `verified_revenue_cop` | FINANCES | NUMERIC(14,2) | Indisponibilidad de pasarela | Prohibido asumir 0 |
| `unverified_revenue_cop` | FINANCES | NUMERIC(14,2) | > $500.000 COP sin conciliar | Conciliación diaria |
| `open_complaints` | EXPERIENCE | INTEGER | > 0 (Alerta Alta) | 0 (Tolerancia cero) |
| `unresolved_technical_incidents` | HEALTH | INTEGER | > 0 incidentes P0/P1 | 0 (Impacto operativo) |

---

## 2. Reglas de Validación de Integridad

1. **Unicidad:** Cada métrica posee un `metric_code` único a nivel global.
2. **Asociación de Fuentes:** Cada métrica debe estar vinculada al menos a una fuente registrada en `executive_metric_sources`.
3. **Persistencia Histórica:** Si una definición de métrica se depreca, se marca con `is_active = false`; jamás se eliminan los registros históricos asociados en `executive_metric_results`.
