# VET FREEDOM OS — POLÍTICAS DE CONTROL DE COSTOS DE MAPAS
**Módulo:** VET-CORE-08 | Maps API Cost Control Runbook (WF-088 / RTE-18)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Presupuesto y Límites Diarios

Para evitar costos excesivos en Google Maps Platform (Routes API, Geocoding API, Distance Matrix API):
1. **Presupuesto Máximo Mensual:** Fijado en $50 USD mensuales en Google Cloud Console con alertas al 50%, 80% y 100%.
2. **Caché Persistente de Geocodificación:** Cada dirección validada se almacena en `public.route_address_verifications`. Si un paciente vuelve a solicitar cita en el mismo domicilio, el sistema reutiliza las coordenadas existentes con 0 llamadas a la API externa.
3. **Cero Polling Frecuente de Tráfico:** Las estimaciones de ruta se calculan al momento de preparar la ruta y solo se recalculan si se reporta un retraso confirmado >= 20 minutos.
4. **Auditoría Continua:** Cada llamada a una API de mapas se registra en `public.route_api_cost_logs` con endpoint, call count y costo estimado en USD y COP.
