# SUPERVISOR INDEPENDIENTE EXTERNO (WATCHDOG) — VET FREEDOM OS
**Capa de Arquitectura:** Capa C  
**Componente:** `scripts/independent_watchdog.js` y Stored Procedure `public.check_external_heartbeats`  

---

## 1. Principio de Aislamiento de Falla

> **Regla de Confiabilidad:** Un sistema no puede ser el único responsable de monitorear su propia supervivencia. Si n8n sufre una falla catastrófica de proceso o caída de red, sus propios workflows no podrán ejecutarse para alertar sobre la caída.

Por ello, Vet Freedom OS implementa un supervisor completamente desacoplado de la máquina de ejecución de n8n.

---

## 2. Mecanismo de Latidos y Detección en Supabase

1. **Emisión de Latidos (`integration_heartbeats`):**
   - El workflow `VET-CORE-20` (y workers distribuidos) emiten latidos periódicos hacia Supabase mediante `record_service_heartbeat()`.
2. **Supervisión Desacoplada (`check_external_heartbeats()`):**
   - Supabase evalúa de manera autónoma si el último latido registrado supera el umbral máximo de tolerancia (300 segundos).
   - Si se supera el umbral, Supabase inserta de forma inmediata un incidente `P0` en `public.integration_incidents` con código `N8N_HEARTBEAT_EXPIRED`, sin necesitar intervención de n8n.
3. **Sonda de Red Externa (`scripts/independent_watchdog.js`):**
   - Ejecuta sondeos HTTP HTTPS independientes contra el endpoint de n8n Cloud.
   - Detecta condiciones `ECONNREFUSED` y `ETIMEDOUT`.
   - Se integra con herramientas de monitoreo sintético externo (Better Uptime / Cloudflare Health Check).

---

## 3. Límite de la Solución y Concurrencia Catastrófica

- **Escenario 1 (Solo n8n cae):** Supabase continúa operativo, retiene eventos en outbox y activa alertas.
- **Escenario 2 (Solo Supabase cae):** n8n detecta `db_connection_failed`, suspende procesamiento y enruta a contingencia local.
- **Escenario 3 (Caída simultánea de n8n y Supabase):** Una caída combinada de ambos proveedores de nube requiere un ping externo (Cloudflare / Uptime Robot) hacia el endpoint público para alertar al Dr. Luis y al equipo de Alpha Vision Method por SMS/Canal fuera de banda.
