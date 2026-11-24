# ERROR RECOVERY ARCHITECTURE — VET FREEDOM OS
## Arquitectura de Resiliencia, Clasificación de Errores y Recuperación Tripartita
**Proyecto:** Vet Freedom OS  
**Módulo:** `VET-CORE-19 | Error & Retry Handler`  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-20  
**Zona Horaria:** `America/Bogota` (UTC-5)  

---

## 1. Visión General de la Arquitectura Tripartita

Para garantizar que ningún fallo operativo o técnico se desvanezca silenciosamente o genere bucles infinitos de reintento, Vet Freedom OS implementa una arquitectura de resiliencia estructurada en tres capas complementarias:

```
  +---------------------------------------------------------------------------------+
  |                          CAPA A: ERRORES TÉCNICOS N8N                           |
  |  Errores no controlados en tiempo de ejecución (Unhandled JS Exceptions)        |
  |  Capturados automáticamente vía: Error Trigger Node (n8n-nodes-base.errorTrigger)|
  +---------------------------------------------------------------------------------+
                                         |
                                         v
  +---------------------------------------------------------------------------------+
  |                    CAPA B: ERRORES EMPRESARIALES Y DE INTEGRACIÓN               |
  |  Errores capturados por nodos y procesados como datos (429, 401, 503, Timeouts)  |
  |  Canalizados vía Webhook a VET-CORE-19 y registrados en integration_incidents   |
  +---------------------------------------------------------------------------------+
                                         |
                                         v
  +---------------------------------------------------------------------------------+
  |                       CAPA C: RESILIENCIA DE INFRAESTRUCTURA                    |
  |  Persistencia durable en Supabase Outbox (FOR UPDATE SKIP LOCKED)               |
  |  Supervisión externa continua vía VET-CORE-20 (Heartbeats y Dead-Letter Queue)  |
  +---------------------------------------------------------------------------------+
```

---

## 2. Flujo de Ejecución y Topología en VET-CORE-19

```
[ Error Trigger ] ---> ( Normalize Error Context ) <--- [ Webhook: /errors/handle ]
                                |                               ^
                                v                               |
                     [ Classify Error & Policy ]         [ Manual Mock ]
                                |
                                v
                   [ Switch Recovery Decision ]
        +--------------+--------+--------+--------------+--------------+
        |              |        |        |              |              |
    (Output 0)     (Output 1) (Output 2)(Output 3)  (Output 4)     (Output 5)
    SAFE_RETRY     RECONCILE    MANUAL    DEAD_LETTER SECURITY      NO_ACTION
        |              |        |        |              |              |
        v              v        v        v              v              v
    [Schedule]     [Create]  [Escalate] [Escalate DLQ] [Security]     [Ignore]
     Retry Plan     Reconcil   Manual                   Alert
        |              |        |        |              |              |
        +--------------+--------+--------+--------------+--------------+
                                |
                                v
                 [ Consolidate Incident Contract ]
```

---

## 3. Matriz de Clasificación Canónica (12 Categorías)

| Categoría | Código | Severidad Típica | Elegible para Reintento | Rol Asignado | Política de Acción |
|---|---|---|---|---|---|
| **A. Red Transitoria** | `TRANSIENT_NETWORK` | P2 | Sí | `TECH_SUPPORT` | Backoff exponencial (60s, 120s, 240s, 480s, 960s) |
| **B. Límite de Tasa** | `RATE_LIMIT` | P2 | Sí | `TECH_SUPPORT` | Espera de 120s o cabecera `Retry-After` del proveedor |
| **C. Indisponibilidad** | `SERVICE_UNAVAILABLE` | P1 | Sí | `TECH_SUPPORT` | Reintentos con alerta ante persistencia |
| **D. Fallo Autenticación** | `AUTHENTICATION_FAILURE` | P1 | No | `TECH_SUPPORT` | Reintento bloqueado; alerta de reconexión de token |
| **E. Fallo Autorización** | `AUTHORIZATION_FAILURE` | P1 | No | `TECH_SUPPORT` | Reintento bloqueado; validación de permisos |
| **F. Payload Inválido** | `INVALID_PAYLOAD` | P3 | No | `TECH_SUPPORT` | Enrutamiento a Dead-Letter; corrección en origen |
| **G. Conflicto de Negocio** | `BUSINESS_CONFLICT` | P2 | No | `COORDINATOR` | Revalidación de versión y revisión por coordinación |
| **H. Evento Duplicado** | `DUPLICATE_EVENT` | P3 | No | `TECH_SUPPORT` | Descarte idempotente; sin segundo efecto |
| **I. Resultado Incierto** | `UNKNOWN_EXTERNAL_RESULT` | P1 | No | `COORDINATOR` | Reconciliación primero; prohibido reenvío ciego |
| **J. Incidente de Seguridad** | `SECURITY_INCIDENT` | P0 | No | `DIRECTOR` | Bloqueo inmediato; escalamiento al Dr. Luis |
| **K. Seguridad Clínica** | `CLINICAL_OR_OPERATIONAL_SAFETY` | P0 | No | `VETERINARIAN` | Escalamiento al profesional veterinario responsable |
| **L. Error Interno** | `INTERNAL_SYSTEM_ERROR` | P1..P3 | Según intentos | `TECH_SUPPORT` | Máximo 5 intentos; escalamiento a Dead-Letter |

---

## 4. Prevención Estricta de Errores Recursivos

Para garantizar que un fallo en el propio manejador de errores nunca desencadene una tormenta de ejecuciones infinitas:
1. **Detección de Origen:** El nodo `Normalize Error Context` inspecciona `source_workflow_id`. Si coincide con el ID de `VET-CORE-19` (`uWO95CQ8twQDL9Gk`), se marca `is_internal_loop = true`.
2. **Corte Inmediato:** El clasificador detecta `is_internal_loop` y fija `recovery_decision = 'NO_ACTION_REQUIRED'`, derivando a la rama de descarte seguro.
3. **Persistencia Desacoplada:** El registro en Supabase se realiza mediante funciones atómicas (`register_or_update_incident`) con manejo interno de excepciones.
