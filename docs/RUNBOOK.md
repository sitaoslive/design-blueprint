# VET FREEDOM OS — MANUAL DE OPERACIÓN Y RECUPERACIÓN (RUNBOOK)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Sección Normativa:** Sección 16 y 17 del Prompt Maestro de Implementación  

---

## 1. Procedimientos Operativos Estándar (SOP)

### SOP-01: Verificación Matutina de Rutas y Citas
1. **Hora:** 07:00 America/Bogota.
2. **Workflow:** `VET-CORE-16 | Daily Executive Reporting` se dispara automáticamente.
3. **Acción de Coordinación:**
   - Revisar en el dashboard de Vet Freedom OS las visitas programadas para el día.
   - Confirmar que todos los médicos veterinarios en turno reporten disponibilidad y vehículo en condiciones.
   - Verificar que no existan alertas críticas de solapamiento en `v_n8n_outbox_queue`.

### SOP-02: Recepción de Solicitud de Cita por WhatsApp
1. **Workflow:** `VET-CORE-02 | WhatsApp Inbound` clasifica la intención y nivel de triage.
2. **Acción:**
   - Si es **Urgencia Vital:** El bot se bloquea (`bot_lock: true`), se asigna a Coordinación de inmediato y se entrega instrucción clara al tutor de acudir a una clínica de urgencias 24h más cercana.
   - Si es **Consulta a Domicilio:** Se genera la solicitud en Supabase con estado `REQUEST_RECEIVED`.
   - Coordinación verifica viabilidad geográfica y horario.
   - Se realiza la confirmación asistida en OKVET.
   - Se despacha notificación formal de confirmación oficial (`VET-CORE-05`).

---

## 2. Procedimientos de Contingencia y Operación Degradada (Sección 16)

### CONT-01: Falla o Caída del Proveedor de Inteligencia Artificial
- **Comportamiento Automático:** El sistema conmuta a `DEGRADED_FALLBACK`.
- **Procedimiento:**
  1. La recepción técnica de mensajes sigue activa.
  2. Cada mensaje genera un ticket directo en la bandeja de Coordinación.
  3. Queda prohibida cualquier respuesta clínica automatizada.
  4. Los operadores humanos atienden directamente las solicitudes desde la consola de WhatsApp.

### CONT-02: Falla o Desconexión de WhatsApp Cloud API
- **Comportamiento Automático:** Modo `MANUAL_ONLY` en el despachador saliente.
- **Procedimiento:**
  1. Los mensajes salientes quedan encolados en `outbound_dispatch_requests` con estado `STAGED`.
  2. Coordinación recibe alerta de interrupción.
  3. Para citas de las próximas 2 horas, el equipo contacta telefónicamente a los propietarios.
  4. Una vez restablecida la API de Meta, se reanuda el despacho verificando no duplicar mensajes.

### CONT-03: Falla en Sincronización con Google Calendar
- **Comportamiento Automático:** Se muestra la última hora de sincronización exitosa.
- **Procedimiento:**
  1. No se asume disponibilidad vacía de los veterinarios.
  2. Toda nueva asignación requiere llamada o confirmación verbal con el profesional.
  3. Ninguna cita confirmada en Supabase se cancela por ausencia de evento en Google Calendar.

### CONT-04: Falla o Reinicio del Cluster de n8n
- **Comportamiento Automático:** Retención en `transactional_outbox`.
- **Procedimiento:**
  1. Los triggers de PostgreSQL en Supabase continúan capturando eventos en la tabla `transactional_outbox`.
  2. Al restablecerse n8n, `VET-CORE-01` consume los eventos pendientes acumulados en orden cronológico e idempotente.
  3. Cero pérdida de datos o eventos.

### CONT-05: Falla de Disponibilidad en OKVET
- **Comportamiento Automático:** Activación de planilla de contingencia.
- **Procedimiento:**
  1. Las citas atendidas se registran en planilla física o digital de contingencia de Vet Life.
  2. Las nuevas citas quedan marcadas con bandera `okvet_validated: false`.
  3. Una vez restablecido OKVET, el personal administrativo transcribe los hallazgos clínicos oficiales.

---

## 3. Protocolo de Recuperación ante Errores y Dead Letter Queue (DLQ)

1. Cuando un evento supera sus 5 reintentos automáticos, `VET-CORE-19` lo mueve a la tabla de Dead Letter Queue.
2. El Coordinador de turno recibe una alerta con el `idempotency_key`, el error técnico y el payload original.
3. Tras corregir la causa raíz (ej. teléfono corregido o factura aprobada), se ejecuta la RPC `retry_dead_letter_event(event_id)` para reinsertar el evento en el flujo normal sin duplicación.
