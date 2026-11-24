# Política y Taxonomía de Alertas Ejecutivas (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Niveles de Severidad y Canales de Notificación

| Nivel de Alerta | Emoji / Semáforo | Criterio de Disparo | Canal y Tiempo de Respuesta |
| :--- | :--- | :--- | :--- |
| **`CRITICAL_OPERATIONAL`** | 🔴 ROJO | Turno veterinario sin cobertura, riesgo de salud pública, desconexión total de Supabase/OKVET. | Despacho urgente inmediato a canal prioritario del Dr. Luis. Respuesta < 30 min. |
| **`HIGH_PRIORITY`** | 🟡 AMARILLO | Reclamación grave de cliente, pasarela de pagos caída (`SOURCE_UNAVAILABLE`), citas reprogramadas masivamente. | Resaltado en Bloque 2 del brief matutino. Respuesta < 2 horas. |
| **`OPERATIONAL_ATTENTION`**| 🟡 AMARILLO | Retrasos en rutas > 15m, compromisos post-visita vencidos, solicitudes de triage pendientes. | Delegación operativa con seguimiento en mediodía. |
| **`INFORMATIONAL`** | 🟢 VERDE | Operación nominal, cumplimiento al 100% de citas y recaudos, indicadores en rango normal. | Digest rutinario de 60 segundos a las 06:00 AM. |

---

## 2. Regla del Semáforo Global del Día

El semáforo consolidado del día refleja la peor condición activa:
- Si existe al menos 1 alerta `CRITICAL_OPERATIONAL` -> **Semáforo ROJO 🔴**.
- Si no hay críticas pero hay al menos 1 alerta `HIGH_PRIORITY` u `OPERATIONAL_ATTENTION` -> **Semáforo AMARILLO 🟡**.
- Solo si todas las alertas están vacías o son puramente informativas -> **Semáforo VERDE 🟢**.
