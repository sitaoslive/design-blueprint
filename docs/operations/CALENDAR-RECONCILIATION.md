# PROCEDIMIENTO OPERATIVO DE CONCILIACIÓN DE CALENDARIOS — VET-CORE-06
## Rutinas de Sincronización Periódica, Detección de Discrepancias y Tareas de Revisión

**Proyecto:** VET FREEDOM OS  
**Módulo:** `VET-CORE-06 | GOOGLE CALENDAR SYNC`  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Estado:** QA / STAGING (Safe Mode: `send_enabled: false`)

---

## 1. Modos de Sincronización Operativa

El sistema ejecuta tres niveles de reconciliación determinista:

1. **Sincronización en Tiempo Real (Push-Driven):**  
   Activada por Google Calendar Watch Channels ante cualquier creación, modificación o cancelación de evento.
2. **Reconciliación Periódica Programada (Schedule-Driven):**  
   Disparada cada 15 minutos en producción por el nodo `Schedule Trigger` de `VET-CORE-06`. Verifica la frescura de datos y procesa eventos delta acumulados.
3. **Reconciliación Integral Profunda (Audit Reconciliation):**  
   Coordinada con `VET-CORE-19 (Integration Reconciliation)` cada medianoche. Compara el espejo de Supabase contra la API de Google dentro de la ventana de -7 a +30 días para detectar cualquier evento omitido por fallas de red.

---

## 2. Gestión de Tareas de Reconciliación (`calendar_reconciliation_tasks`)

Cuando el sistema identifica una inconsistencia que requiere juicio humano, genera una tarea visible en el panel Lovable del coordinador de ruta:

| Tipo de Tarea (`task_type`) | Causa Raíz | Prioridad | Acción Requerida |
| :--- | :--- | :--- | :--- |
| `SCHEDULE_OVERLAP` | Solapamiento entre evento externo y cita clínica confirmada | `HIGH_OPS` | Contactar al veterinario y verificar si el evento privado puede moverse o si se reasigna la cita |
| `EXTERNAL_UNMAPPED_EVENT` | Evento detectado en calendario operacional sin cita asociada | `MEDIUM` | Determinar si es un bloqueo administrativo legítimo o un evento erróneo |
| `STALE_SYNC_RECOVERY` | Conexión sin sincronizar por más de 3 horas | `HIGH_OPS` | Validar estado de credenciales OAuth y forzar corrida manual |
| `WATCH_CHANNEL_FAILURE` | Falla repetida en renovación de canal push | `MEDIUM` | Recrear suscripción webhook en Google Calendar |

---

## 3. Procedimiento de Ejecución Manual en Casos de Emergencia

Si la coordinación detecta desfasajes durante una jornada de alta demanda:
1. Acceder al módulo de Configuración de Calendarios en la interfaz Lovable.
2. Seleccionar el perfil del profesional afectado.
3. Pulsar el botón **"Forzar Reconciliación Inmediata"**.
4. n8n ejecuta el workflow en modo manual, adquiere el lease de sincronización, barre el cursor delta y actualiza el snapshot de disponibilidad en menos de 5 segundos.
