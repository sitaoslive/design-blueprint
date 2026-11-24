# INCIDENT RUNBOOK — VET FREEDOM OS
## Guía Operativa para Gestión, Escalamiento y Resolución de Incidentes
**Audiencia:** Equipo Técnico, Coordinadores, Finanzas, Veterinarios y Dirección  
**Responsable Médico:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-20  

---

## 1. Niveles de Severidad y Tiempos de Respuesta (SLA)

| Nivel | Descripción | Ejemplos | SLA de Respuesta | Responsable Primario | Escalamiento |
|---|---|---|---|---|---|
| **P0 — Crítico** | Compromiso de seguridad, fuga de datos o emergencia clínica con riesgo vital. | Intento de firma adulterada, alerta médica vital, brecha de acceso. | < 15 minutos | `DIRECTOR` / `VETERINARIAN` | Notificación inmediata a Luis. |
| **P1 — Alto** | Caída de proveedor crítico o fallo operativo mayor que detiene la operación. | Meta WhatsApp desconectado, Supabase inaccesible, fallo en recaudo masivo. | < 1 hora | `TECH_SUPPORT` / `COORDINATOR` | Escalamiento a Director a los 90 min. |
| **P2 — Medio** | Degradación transitoria o conflicto de negocio recuperable. | HTTP 429 de Meta, conflicto de horario de cita, retraso en ruta. | < 4 horas | `COORDINATOR` / `TECH_SUPPORT` | Reintento automático o revisión manual. |
| **P3 — Bajo** | Advertencias menores, datos mal formateados o errores sin impacto directo. | Payload inválido en formulario no crítico, evento duplicado descartado. | < 24 horas | `TECH_SUPPORT` | Análisis en reporte diario consolidado. |

---

## 2. Protocolos de Acción por Tipo de Incidente

### Protocolo 1: Falla de WhatsApp (HTTP 429 / Rate Limit)
1. El clasificador asigna automáticamente la categoría `RATE_LIMIT` y aplica una pausa de 120 segundos.
2. VET-CORE-19 programa el reintento respetando la ventana de rate limit.
3. Si tras 3 intentos persiste el error, se notifica a Soporte Técnico para evaluar ampliación de nivel de cuenta comercial en Meta Business Manager.

### Protocolo 2: Resultado Externo Incierto (Timeout en Escritura)
1. Nunca se realiza un reenvío ciego.
2. El incidente pasa al estado `WAITING_RECONCILIATION`.
3. Se crea una tarea en `integration_reconciliation_tasks`.
4. El coordinador consulta el estado en el portal del proveedor (o mediante API de consulta `GET /status`) antes de autorizar cualquier reintento.

### Protocolo 3: Conflicto de Disponibilidad o Cita Modificada
1. Si un reintento se despierta pero la cita ya fue modificada o cancelada en Supabase, el sistema cancela el reintento (`CANCELLED_PRE_DISPATCH`).
2. Se registra la evidencia en `integration_incidents`.
3. No se contacta al cliente con información obsoleta.

### Protocolo 4: Incidente de Seguridad (P0)
1. Todo intento de acceso cross-tenant o payload con HMAC inválido bloquea de inmediato la ejecución.
2. Se genera registro en `public.security_incidents`.
3. Se alerta al Director con los detalles de IP, token y tenant emisor.

---

## 3. Modo Ausencia del Dr. Luis Eduardo Ríos

Si el Dr. Luis activa el modo ausencia:
- Las alertas P2 y P3 son atendidas íntegramente por el Coordinador y Soporte Técnico.
- Las consultas operativas de agenda son gestionadas por el Coordinador autorizado.
- Únicamente las alertas P0 que involucren riesgo clínico vital o seguridad de infraestructura generan interrupción directa al canal de contingencia del Director.
