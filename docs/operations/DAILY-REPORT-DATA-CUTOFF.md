# Política de Corte de Datos y Delimitación Temporal (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Definición del Corte Diario

Para efectos del reporte ejecutivo diario de Vet Life:
1. **Límites Oficiales:**  
   El día contable y operativo inicia a las `00:00:00` y concluye a las `23:59:59` de la zona horaria oficial `America/Bogota` (UTC-5).
2. **Corte Matutino de Generación:**  
   El corte matutino se ejecuta a las `06:00:00 AM` del día en curso.
   - Evalúa el consolidado final del **día anterior** (cierre de visitas, facturación real, quejas, rutas concluidas).
   - Evalúa el plan operativo del **día en curso** (citas confirmadas, médicos de turno, ausencias activas, rutas preparadas).
   - Proyecta las **prioridades de mañana** basadas en compromisos confirmados.

---

## 2. Diferenciación Estricta entre Fecha de Reporte y Fecha de Ejecución

- **`report_date`:** La fecha de negocio a la que corresponden los hechos descritos (ej. `2026-11-21`).
- **`execution_timestamp`:** El instante exacto UTC en que el job corrió (ej. `2026-11-21T11:00:02.124Z`).
- Esta separación garantiza que reprocesamientos posteriores o consultas históricas reflejen la verdad de la fecha de reporte sin contaminarse con el momento en que se leyó la base de datos.
