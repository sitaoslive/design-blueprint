# RETRY POLICIES BY ACTION TYPE — VET FREEDOM OS
## Política y Matriz de Reintentos por Tipo de Operación
**Módulo:** `VET-CORE-19 | Error & Retry Handler`  
**Entorno:** n8n Cloud + Supabase PostgreSQL 17  
**Zona Horaria:** `America/Bogota` (UTC-5)  

---

## 1. Principios Universales de Reintento

1. **Identificación Previa:** Nunca reintentar sin identificar la operación original y su `idempotency_key`.
2. **Reconciliación Obligatoria:** Toda acción externa con resultado incierto debe reconciliarse antes de cualquier reintento.
3. **Límites Estrictos:** Máximo 5 reintentos para cualquier operación automática.
4. **Backoff Exponencial con Jitter:** Intervalos mínimos calculados: `delay = base_delay * (2 ^ (attempt - 1)) + jitter`.
5. **Revalidación de Estado:** El reintento consulta el estado actual de la entidad en Supabase antes de ejecutar.
6. **No Duplicidad Financiera ni Clínica:** Pagos, prescripciones y confirmaciones médicas oficiales tienen reintentos automáticos estrictamente prohibidos sin validación humana.

---

## 2. Matriz Detallada por Tipo de Operación

| Canal / Tipo de Acción | Política de Reintento | Espera Inicial | Límite Máximo | Regla Específica de Seguridad |
|---|---|---|---|---|
| **WhatsApp — Notificaciones** | Reintentable con reconciliación previa | 120 seg (si es 429) o 60 seg | 3 intentos | Si el mensaje ya figura como `sent` o `delivered` en Meta, el reintento se aborta sin enviar duplicado. |
| **WhatsApp — Conversación Activa** | Reintentable solo si fallo de red | 30 seg | 2 intentos | Si el cliente ya respondió en otro hilo, no sobreescribir contexto. |
| **Citas — Confirmaciones** | NO reintentable ciegamente | N/A | 1 intento | n8n nunca confirma autónomamente una cita. Requiere estado `CONFIRMED_OFFICIAL` en Supabase / OKVET. |
| **Citas — Recordatorios** | Reintentable si cita sigue activa | 300 seg | 3 intentos | Si la cita fue cancelada o reprogramada, el recordatorio se cancela. |
| **Pagos y Cobros** | ESTRICTAMENTE NO REINTENTABLE | N/A | 0 reintentos | Nunca reintentar un débito o cobro. Pasa inmediatamente a conciliación con Finanzas. |
| **Google Calendar** | Reintentable si fallo transitorio | 60 seg | 4 intentos | Modo `BUSY_ONLY`. Si el token expiró, no reintentar; alertar a Soporte. |
| **Google Maps / Rutas** | Reintentable con fallback | 30 seg | 3 intentos | Si la API no responde, utilizar matriz de distancias en caché sintética. |
| **Especialistas e Interconsultas** | Requiere aprobación humana | N/A | 1 intento | Prohibido enviar múltiples solicitudes contradictorias al especialista. |
| **Documentos Médicos** | Reintentable previa validación | 60 seg | 2 intentos | Validar que el permiso de acceso no haya sido revocado antes del reenvío. |
| **Tratamientos Recurrentes** | Alerta a Coordinación | N/A | 1 intento | No modificar posología ni fechas clínicas sin visto bueno veterinario. |
| **Simulaciones de Agenda** | NO reintentable sobre plan parcial | N/A | 0 reintentos | Si una simulación falló a mitad de camino, requiere nueva corrida completa y aprobación. |

---

## 3. Escalamiento a Dead-Letter Queue (DLQ)

Cuando una operación agota sus reintentos máximos o experimenta un fallo permanente:
1. El incidente transiciona a status `DEAD_LETTER`.
2. Se inserta un registro en `public.dead_letter_queue` con el payload completo, traza de error y metadata.
3. Se notifica al rol responsable a través del Centro de Incidentes de Lovable / Supabase.
4. Un operador autorizado puede seleccionar `REPLAY` (reintentar con datos corregidos) o `DISCARD` (descartar justificadamente con auditoría).
