# VET FREEDOM OS — RUNBOOK: REPLAY DE EVENTOS Y RECUPERACIÓN ANTE DESASTRES
## Re-procesamiento Idempotente, Recuperación de Inbox/Outbox y Backoff

---

### 1. Cuándo Ejecutar un Replay de Eventos

El procedimiento de replay de eventos se activa únicamente bajo las siguientes contingencias:
1. Caída o reinicio inesperado de la instancia de n8n Cloud durante el procesamiento de un lote crítico de webhooks entrantes.
2. Interrupción temporal de conectividad con Supabase PostgreSQL que provocó fallas de inserción en el Transactional Inbox.
3. Actualización de lógica de negocio o despliegue de nueva versión de workflows que exige re-evaluar eventos almacenados en el Inbox.

---

### 2. Protocolo de Replay Seguro Paso a Paso

1. **Paso 1: Pausar Ingesta en Vivo**:
   Si es necesario, poner el conector en modo `MAINTENANCE` o retener temporalmente los disparadores para evitar condiciones de carrera.
2. **Paso 2: Filtrar Lote en `integration_event_receipts`**:
   Seleccionar los eventos afectados por rango de fecha y estado `FAILED` o `PENDING`:
   ```sql
   SELECT id, connector_id, event_type, idempotency_key, created_at
   FROM integration_event_receipts
   WHERE status = 'FAILED'
     AND created_at >= '2026-11-21 00:00:00-05'
   ORDER BY created_at ASC;
   ```
3. **Paso 3: Validar Invariantes de No Duplicación**:
   - Verificar que ningún evento de tipo cobro (`payment.charge`) o mensaje saliente (`whatsapp.send_message`) sea re-ejecutado ciegamente hacia APIs externas.
   - Forzar el flag de contexto `is_replay: true`.
4. **Paso 4: Ejecutar Reprocesamiento en Lotes Pequeños**:
   Procesar en bloques de máximo 25 eventos con un retardo de 500 ms entre cada lote para no saturar los límites de concurrencia de la base de datos.
5. **Paso 5: Auditar Resultados**:
   Comprobar que todos los eventos seleccionados transicionen a `PROCESSED` o `DUPLICATE_IGNORED` y registrar el resultado global en `integration_reconciliation_audit`.
