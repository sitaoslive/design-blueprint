# MANUAL OPERATIVO DE RESPALDOS Y MANTENIMIENTO (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Destinatarios:** Equipo de Soporte Técnico, Ingeniero DevOps, Dr. Luis Eduardo Ríos  
**Zona Horaria:** `America/Bogota` (UTC-5)  

---

## 1. Operación Rutinaria Dominical (Automática)
- **Horario:** Todos los domingos a las 02:00 COT.
- **Acción:** El nodo `Schedule Trigger` inicia la auditoría de respaldo.
- **Validaciones Automáticas:**
  1. Snapshot de PostgreSQL 17 verificado.
  2. Integridad de claves foráneas = 0 violaciones.
  3. Cobertura de RLS = 100% (98 tablas).
  4. Prueba sintética de restauración = `PASSED`.
  5. Purga de eventos procesados con más de 30 días de antigüedad.
- **Si todo es exitoso:** Estado `SUCCESS`. Ninguna alerta irrumpe el descanso del Dr. Luis.

---

## 2. Apertura y Coordinación de una Ventana de Mantenimiento
Cuando se requiera aplicar migraciones DDL estructurales o mantenimiento mayor:

1. **Programar la ventana:**
   ```sql
   SELECT public.schedule_maintenance_window('{
     "organization_id": "11111111-1111-1111-1111-111111111111",
     "scheduled_start": "2026-11-25T03:00:00-05:00",
     "scheduled_end": "2026-11-25T04:30:00-05:00",
     "reason": "Optimización de índices clínicos y migración de esquemas",
     "requested_by": "Dr. Luis Eduardo Ríos"
   }'::jsonb);
   ```
2. **Activar la ventana:**
   - La ventana activa pasa su estado a `ACTIVE`.
   - `VET-CORE-21` detecta la ventana y marca `suppress_core20_alerts = true`.
   - `VET-CORE-20` silencia alertas informativas y degradaciones temporales P1-P3.
3. **Cerrar la ventana:**
   ```sql
   SELECT public.close_maintenance_window('<WINDOW_UUID>', 'COMPLETED');
   ```
   - Las alertas de monitoreo retornan de inmediato a su sensibilidad estricta nominal.

---

## 3. Protocolo ante Falla Crítica (P0)
Si el respaldo o la prueba de restauración fallan (`status = CRITICAL`):
1. El nodo `Escalate Backup Failure` activa `p0_director_alert = true`.
2. Se asigna el incidente a `DIRECTOR`.
3. El Dr. Luis recibe notificación prioritaria con el desglose exacto de anomalías detectadas.
4. El equipo técnico debe revisar la bitácora en `integration_restore_tests` para determinar si existió corrupción de disco, fallo en la API de Supabase o bloqueo por concurrencia.
