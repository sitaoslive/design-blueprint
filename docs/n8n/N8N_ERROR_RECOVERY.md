# PROCEDIMIENTO DE RECUPERACIÓN DE ERRORES Y RESILIENCIA (N8N_ERROR_RECOVERY)
## Runbook de Mitigación, Reintentos, Circuit Breakers y Dead-Letter Queue

**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección:** Dr. Luis Eduardo Ríos  
**Manejador Central:** `VET-CORE-19 (Error & Retry Handler)` (ID: `uWO95CQ8twQDL9Gk`)  

---

## 1. TIPOLOGÍA DE FALLOS Y ESTRATEGIA DE MITIGACIÓN

| Incidente | Causa Frecuente | Mitigación Inmediata | Acción de Recuperación |
| :--- | :--- | :--- | :--- |
| **GPS Stale (> 300s)** | Pérdida de señal celular o GPS apagado en el vehículo. | Nodo n8n marca `warning = 'STALE_GPS_LOCATION'` y `confidence = 'LOW'`. Coordenadas no se extrapolan falsamente. | Solicitar al médico en campo que verifique la app móvil. El cálculo de ETA pasa a estimación administrativa. |
| **Fallo en Google Routes API (429 / Cuota)** | Agotamiento de cuota o indisponibilidad temporal. | `VetEtaEngine` conmuta automáticamente a `OsrmRoutingProvider` o cálculo geodésico nominal. | El sistema opera sin tráfico en tiempo real marcando `hasLiveTraffic = false`. Alerta interna a DevOps. |
| **Desconexión de WhatsApp (Meta API 5xx)** | Interrupción en la API de Meta. | `VET-CORE-03` retiene el mensaje en cola `outbox_dispatch_requests` con estado `PENDING_RETRY`. | Backoff exponencial (1m, 5m, 15m, 30m). Si supera 3 reintentos, escala a `VET-CORE-19`. |
| **Caída Temporal de Supabase (PostgreSQL Connection Error)** | Mantenimiento de red o saturación transitoria. | n8n reintenta el nodo hasta 3 veces con intervalo de 5 segundos. | Los eventos entrantes en Webhooks quedan retenidos en el buffer de n8n. No hay pérdida de datos. |
| **Webhooks Duplicados (Redelivery de Meta)** | Reenvío de confirmación de entrega con el mismo `wamid`. | Nodo de reconciliación comprueba la existencia de la clave de idempotencia o `wamid`. | Si ya está en estado terminal (`DELIVERED`, `READ`), el evento se descarta silenciosamente. |
| **Webhooks Fuera de Orden** | `DELIVERED` llega antes que `SENT` debido a latencias asíncronas. | Lógica de estado no regresivo en PostgreSQL. | Si el estado ya es `DELIVERED`, un evento tardío `SENT` no degrada el registro. |

---

## 2. PROCEDIMIENTO DEAD-LETTER QUEUE (DLQ)

1. **Captura:** Todo error fatal no recuperable en cualquiera de los workflows se enruta automáticamente hacia `VET-CORE-19`.
2. **Registro:** Se inserta un registro inmutable en `integration_incidents` con severidad, payload original y stack trace.
3. **Notificación:** Alerta instantánea al canal de coordinación técnica.
4. **Reprocesamiento Seguro:** Una vez resuelta la causa raíz, el incidente puede ser reinyectado mediante el endpoint `/vet-events/replay` con su `idempotency_key` original para garantizar unicidad.
