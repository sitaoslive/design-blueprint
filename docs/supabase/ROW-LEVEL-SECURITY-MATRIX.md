# VET FREEDOM OS — ROW LEVEL SECURITY MATRIX
## Matriz Maestra de Seguridad a Nivel de Fila (RLS) y Control de Acceso
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Base de Datos:** PostgreSQL 17.12.0 (Supabase `sznvahhocgnhsqhksygq`)  
**Fecha:** 2026-11-21  

---

## 1. PRINCIPIOS DE AUTORIZACIÓN Y DEFENSA EN PROFUNDIDAD

1. **RLS Forzado al 100%:** Todas las 272 tablas del esquema `public` tienen activado `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` y `FORCE ROW LEVEL SECURITY`.
2. **Denegación por Defecto:** En ausencia de una política explícita que evalúe a `TRUE`, cualquier consulta `SELECT`, `INSERT`, `UPDATE` o `DELETE` retorna 0 filas o genera un error de acceso.
3. **Revocación de Permisos al Rol `anon`:** Todas las funciones y RPCs protegidas tienen revocado el permiso `EXECUTE` para el rol anónimo (`REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;`).
4. **Validación Multi-Inquilino Obligatoria:** Todas las políticas RLS exigen que `organization_id` coincida con la organización del usuario autenticado (`auth.uid()`).
5. **Separación de Funciones Médicas y Financieras:** Personal de Finanzas no puede consultar historias clínicas confidenciales ni recetas, mientras que veterinarios no pueden alterar conciliaciones bancarias.

---

## 2. MATRIZ DE PERMISOS POR ROL INSTITUCIONAL (11 ROLES)

| Código | Rol Institucional | Alcance en Clientes/Mascotas | Alcance en Citas y Agenda | Alcance Clínico y SOPs | Alcance Financiero | Alcance Auditoría y Config |
|--------|-------------------|------------------------------|---------------------------|------------------------|--------------------|----------------------------|
| **ROL-01** | Director General (Dr. Luis) | Total (Lectura/Escritura) | Total (Supervisión) | Total (Aprobación) | Total (Estratégico) | Total (Acceso Ejecutivo) |
| **ROL-02** | Veterinario Clínico Asignado | Solo asignados o en guardia | Citas asignadas | Lectura/Escritura en citas asignadas | Solo consulta de ítems de servicio | Solo sus propios logs |
| **ROL-03** | Veterinario de Reemplazo | Pacientes del turno relevado | Citas del relevo activo | Lectura/Escritura durante reemplazo | Solo consulta de ítems de servicio | Registro auditado de sustitución |
| **ROL-04** | Soporte / Mesa de Entrada | Datos de contacto y mascotas | Creación y agendamiento preliminar | Solo lectura de alertas/condiciones | Registro de pagos reportados | Acceso a gestión de citas |
| **ROL-05** | Rutas y Logística | Direcciones, barrios y clusters | Itinerarios y estados de ruta | Ninguno (Bloqueado) | Ninguno (Bloqueado) | Logs de posicionamiento móvil |
| **ROL-06** | Calidad y Experiencia | Clientes con visitas concluidas | Citas concluidas para seguimiento | Solo observaciones de satisfacción | Ninguno (Bloqueado) | Métricas NPS/CSAT y Duelo |
| **ROL-07** | Finanzas y Conciliación | Datos de facturación del cliente | Estado de servicio y liquidación | Ninguno (Bloqueado por secreto médico) | Total (Conciliación, Recibos, Bancos) | Trazabilidad contable |
| **ROL-08** | Administrador Técnico | Diagnóstico de sincronización | Diagnóstico y outbox/inbox | Soporte de catálogo sin acceso clínico | Configuración de pasarelas | Total (Monitoreo técnico) |
| **ROL-09** | Especialista Externo | Paciente referido exclusivamente | Citas de interconsulta asignadas | Solo informe de interconsulta propio | Arancel acordado por interconsulta | Solo logs de su interacción |
| **ROL-10** | Tutor / Dueño de Mascota | Sus propias mascotas registradas | Sus citas solicitadas o activas | Historial de sus mascotas | Sus facturas y comprobantes | Ninguno |
| **ROL-11** | Cuidador Delegado | Mascotas delegadas con permiso | Solo si `can_schedule_appointments` | Solo si `can_view_records` | Solo pagos autorizados | Registro de su propia sesión |

---

## 3. ESTRUCTURA DE POLÍTICAS RLS EN TABLAS CRÍTICAS

### 3.1 `public.appointments`
- **SELECT:**
  - `admin`, `director`: Todo el registro de la organización.
  - `assigned_veterinarian`: Filas donde `assigned_veterinarian_id = auth.uid()` o donde exista un `shift_replacement` activo.
  - `client`: Filas donde `client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid())`.
  - `caretaker`: Filas de mascotas delegadas con permiso activo.
- **INSERT:**
  - `authenticated` con rol `support`, `admin`, `director` o `client` (este último en estado `REQUESTED` únicamente).
- **UPDATE:**
  - `director`, `admin`: Cualquier actualización no bloqueada por máquina de estados.
  - `staff_veterinarian`: Actualizaciones operativas de campo (`EN_ROUTE`, `IN_PROGRESS`, `COMPLETED`).
  - La transición a `CONFIRMED` está blindada a través del RPC `submit_okvet_human_confirmation()`.

### 3.2 `public.appointment_holds`
- **SELECT / INSERT:**
  - Solo usuarios autenticados con rol de agenda o el cliente durante su flujo de reserva activa con `hold_session_token`.
- **DELETE / EXPIRE:**
  - Exclusivo para el backend vía `expire_stale_appointment_holds()` o el titular del token de sesión.

### 3.3 `public.medical_documents` & Storage Buckets
- **SELECT:**
  - `director`, veterinario asignado, o cliente titular de la mascota asociada.
  - El rol Finanzas y el rol Rutas tienen **denegación absoluta** por política RLS.
- **Storage Buckets (`medical-records`, `referral-documents`, `system-backups-metadata`):**
  - Acceso mediante URLs firmadas de corta duración (TTL 900s). Descarga directa denegada a usuarios no autenticados.

### 3.4 `public.okvet_manual_confirmations`
- **SELECT:** `director`, `admin`, `support`.
- **INSERT:** Usuarios con rol `support`, `admin` o `director` mediante validación de evidencia y notas obligatorias.
- **UPDATE / DELETE:** **Prohibido.** Tabla append-only inmutable.
