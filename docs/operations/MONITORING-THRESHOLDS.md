# UMBRALES DETERMINISTAS Y FRECUENCIAS DE MONITOREO — VET FREEDOM OS
**Zona Horaria:** `America/Bogota`  
**Moneda:** `COP`  

---

## 1. Frecuencias de Supervisión por Tipo de Métrica

| Intervalo | Componentes Evaluados | Criterio de Riesgo |
|---|---|---|
| **Cada 5 Minutos** | Heartbeats de n8n, latencia de base de datos Supabase, eventos pendientes en outbox (> 100), eventos en vuelo estancados (> 5m), incidentes P0 en dead letter queue. | Crítico para evitar parálisis en el despacho de citas. |
| **Cada 15 Minutos** | Webhook de WhatsApp, cuota de API de Meta, estado de sincronización de Google Calendar, latencia de modelos de IA. | Operatividad de canales de comunicación y agenda. |
| **Cada 60 Minutos** | Tareas de reconciliación pendientes, solicitudes de citas sin asignar, bloqueos provisionales de agenda por expirar. | Coordinación del equipo veterinario. |
| **Diariamente (06:00 COT)** | Remisiones estancadas (> 3 días), compromisos de seguimiento clínico vencidos, consumo presupuestal diario (COP). | Resumen ejecutivo para el Dr. Luis y Coordinación. |
| **Semanalmente (Domingo 20:00 COT)** | Integraciones frágiles, tendencias de error, auditoría de permisos y vencimiento de credenciales OAuth a 30 días. | Resumen semanal y prevención proactiva. |

---

## 2. Umbrales de Alarma Numéricos

- **Transactional Outbox Backlog:**
  - `> 100 eventos`: `DEGRADED` (Alerta a Soporte).
  - `> 500 eventos`: `CRITICAL` (Alerta P0 a Dirección).
- **Dead Letter Queue:**
  - `> 0 eventos`: `DEGRADED` (Requiere revisión en `VET-CORE-19`).
- **In-Flight Claimed Events:**
  - Edad `> 5 minutos`: `STALE_EVENT` (Requiere re-claim atómico).
- **Latido de n8n (Heartbeat Staleness):**
  - `> 300 segundos`: `N8N_HEARTBEAT_EXPIRED` (Dispara Watchdog P0).
- **Consumo Presupuestal de IA y Mapas:**
  - `> 90% del presupuesto mensual`: `DEGRADED` (Alerta presupuestal).
