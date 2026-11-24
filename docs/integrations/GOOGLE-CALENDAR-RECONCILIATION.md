# VET FREEDOM OS — CONCILIACIÓN CON GOOGLE CALENDAR
## Sincronización de Bloques Médicos, Detección de Desvíos y Manejo de Zonas Horarias

---

### 1. Modelo de Interacción con Google Calendar

Google Calendar actúa como el calendario visual y personal del Dr. Luis Eduardo Ríos. Refleja los bloques de visitas domiciliarias programadas por Vet Life y los compromisos personales del médico.

- **Conector**: `google_calendar`
- **Modo**: `BIDIRECTIONAL_AUTHORIZED`
- **Zona Horaria Canónica**: `America/Bogota` (UTC-5 sin horario de verano)
- **Modo QA**: Sandbox mockeado, cero modificaciones a la agenda real del Dr. Ríos.

---

### 2. Categorías de Discrepancias de Calendario

1. **`APPOINTMENT_MISSING_IN_CALENDAR`**:
   - Cita confirmada en Supabase que no posee un evento asociado en Google Calendar.
   - *Causa*: Fallo en webhook saliente durante la creación de la cita o evento borrado en Calendar.
   - *Estrategia de Reparación*: Recrear el bloque de agenda en Google Calendar preservando horario y dirección domiciliaria.
2. **`CALENDAR_EVENT_WITHOUT_APPOINTMENT`**:
   - Evento existente en Google Calendar que no corresponde a ninguna cita en Supabase.
   - *Clasificación*:
     - Si está marcado como `[PERSONAL]` o carece de prefijo Vet Life -> Bloqueo personal del médico (respetado, no se toca).
     - Si tiene prefijo `[VET-LIFE]` pero no existe en Supabase -> "Drift" de agenda. Se genera tarea humana para verificar si fue una cita telefónica agendada fuera del sistema.
3. **`SCHEDULE_TIME_MISMATCH`**:
   - El evento en Google Calendar y la cita en Supabase tienen horarios distintos.
   - *Regla*: Supabase es la fuente de verdad. Se evalúa si el cambio en Google Calendar fue realizado por el Dr. Ríos. No se sobrescribe automáticamente; se emite propuesta de re-agendamiento para confirmación del coordinador.
4. **`CALENDAR_EVENT_CANCELLED_EXTERNALLY`**:
   - Evento eliminado o cancelado en Google Calendar mientras la cita sigue como `confirmed` en Supabase.
   - *Acción*: No se cancela la cita en Supabase automáticamente. Se notifica al coordinador y al médico para confirmar si el cliente canceló o si fue un error de manipulación en el teléfono.

---

### 3. Sincronización Incremental mediante `syncToken` y Manejo de Errores 410 Gone

Google Calendar API utiliza tokens de sincronización (`syncToken`) para lecturas delta:
- Si el `syncToken` es válido: Google retorna únicamente los eventos modificados desde la última corrida.
- Si el `syncToken` expira o se corrompe: Google responde con código HTTP `410 Gone`.
- **Estrategia de Auto-Recuperación**:
  1. Detectar HTTP 410.
  2. Purgar el cursor corrupto en `integration_sync_cursors`.
  3. Ejecutar una sincronización completa controlada (*full sync*) de los próximos 30 días en bloques de 50 eventos.
  4. Generar nuevo `syncToken` y registrar checkpoint auditado.
