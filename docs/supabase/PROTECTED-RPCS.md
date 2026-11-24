# VET FREEDOM OS — PROTECTED STORED PROCEDURES (RPCs)
## Procedimientos Almacenados y Funciones Protegidas en Supabase
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Base de Datos:** PostgreSQL 17.12.0 (Supabase `sznvahhocgnhsqhksygq`)  
**Fecha:** 2026-11-21  

---

## 1. PRINCIPIOS DE SEGURIDAD EN RPCS

1. **`SECURITY DEFINER` con Search Path Explícito:** Toda función con privilegios elevados define `SET search_path = public, pg_temp;` para evitar ataques de sustitución de objetos.
2. **Revocación Global a `anon`:** Ningún usuario no autenticado puede ejecutar funciones del esquema `public`.
3. **Locks de Fila Obligatorios:** Las funciones que actualizan estados críticos ejecutan `SELECT ... FOR UPDATE` para evitar condiciones de carrera.
4. **Trazabilidad Doble:** Toda ejecución exitosa registra un evento en `public.transactional_outbox` y un registro inmutable en `public.audit_logs`.

---

## 2. CATÁLOGO DE RPCS PRINCIPALES

### 2.1 `submit_okvet_human_confirmation()`
- **Firma SQL:**
  ```sql
  submit_okvet_human_confirmation(
      p_appointment_id UUID,
      p_okvet_appointment_id TEXT,
      p_confirmation_notes TEXT,
      p_evidence_attachment_id UUID,
      p_performed_by UUID
  ) RETURNS JSONB
  ```
- **Propósito:** Actúa como el puente asistido obligatorio para confirmar citas veterinarias tras la verificación humana en OKVET Cloud, garantizando cumplimiento estricto con la Ley 576 de 2000.
- **Validaciones Implementadas:**
  1. Verifica que la cita exista y esté en estado `PENDING_OKVET_CONFIRMATION` o `REQUESTED`.
  2. Verifica que `p_okvet_appointment_id` no esté vacío y no haya sido utilizado en otra cita confirmada (prevención de duplicidad).
  3. Verifica que `p_confirmation_notes` no esté vacío.
  4. Adquiere lock pesimista sobre la fila de la cita (`SELECT ... FOR UPDATE`).
  5. Inserta registro en `public.okvet_manual_confirmations`.
  6. Actualiza `public.appointments` con:
     - `status = 'CONFIRMED'`
     - `okvet_appointment_id = p_okvet_appointment_id`
     - `okvet_sync_status = 'CONFIRMED_HUMAN'`
     - `okvet_verified_at = now()`
     - `okvet_verified_by = p_performed_by`
  7. Inserta evento `APPOINTMENT_CONFIRMED_OKVET_HUMAN` en `public.transactional_outbox` para que n8n despache notificaciones preparatorias en modo seguro.
  8. Registra evento en `public.audit_logs`.

### 2.2 `create_appointment_hold()`
- **Firma SQL:**
  ```sql
  create_appointment_hold(
      p_organization_id UUID,
      p_staff_profile_id UUID,
      p_start_time TIMESTAMPTZ,
      p_end_time TIMESTAMPTZ,
      p_hold_duration_minutes INT,
      p_hold_session_token TEXT
  ) RETURNS JSONB
  ```
- **Propósito:** Crea un bloqueo temporal (15 minutos por defecto) para un profesional veterinario durante el proceso de agendamiento en Lovable, evitando solapamientos antes de la confirmación formal.
- **Validaciones Implementadas:**
  1. Limpia holds expirados llamando a `expire_stale_appointment_holds()`.
  2. Evalúa si existe alguna cita confirmada o hold activo en conflicto para `p_staff_profile_id` en el rango `[p_start_time, p_end_time)`.
  3. Si no hay colisión, inserta una fila en `public.appointment_holds` con `expires_at = now() + (p_hold_duration_minutes || ' minutes')::interval` y `is_released = false`.
  4. Retorna `{ success: true, hold_id, expires_at }` o `{ success: false, error: 'SLOT_UNAVAILABLE' }`.

### 2.3 `expire_stale_appointment_holds()`
- **Firma SQL:**
  ```sql
  expire_stale_appointment_holds() RETURNS INT
  ```
- **Propósito:** Función de mantenimiento atómico que localiza holds cuyo `expires_at <= now()` y `is_released = false`, actualizándolos a `is_released = true`. Retorna el número de holds liberados.

---

## 3. POLÍTICA DE PRIVILEGIOS Y ROLES DE EJECUCIÓN

| Función | Rol `anon` | Rol `authenticated` | Rol `service_role` | Auditoría |
|---------|------------|---------------------|--------------------|-----------|
| `submit_okvet_human_confirmation` | REVOKE | GRANT (Roles médicos/soporte) | GRANT | Sí (`audit_logs`) |
| `create_appointment_hold` | REVOKE | GRANT (Todos autenticados) | GRANT | Sí |
| `expire_stale_appointment_holds` | REVOKE | GRANT | GRANT | Opcional |
| `get_current_user_organization_id` | REVOKE | GRANT | GRANT | No |
| `has_role` | REVOKE | GRANT | GRANT | No |
