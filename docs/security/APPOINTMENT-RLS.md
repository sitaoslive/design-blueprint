# VET FREEDOM OS — POLÍTICAS DE SEGURIDAD Y RLS EN CITAS
**Módulo:** VET-CORE-05 | Appointment Notification Service  
**Motor:** Supabase PostgreSQL 17  
**Estado:** 100% RLS ACTIVO (6 de 6 tablas verificadas con `relrowsecurity = true`)

---

## 1. Verificación de RLS en Tablas de Citas (Migración 028)

| Nombre de Tabla | RLS Habilitado | Política Aplicada | Roles Autorizados |
| :--- | :---: | :--- | :--- |
| `appointment_notification_plans` | `true` | `p_apt_plans_member` | `authenticated`, `service_role` |
| `appointment_notification_jobs` | `true` | `p_apt_jobs_member` | `authenticated`, `service_role` |
| `appointment_reschedule_proposals` | `true` | `p_apt_reschedule_member` | `authenticated`, `service_role` |
| `appointment_waitlist_entries` | `true` | `p_apt_waitlist_member` | `authenticated`, `service_role` |
| `appointment_waitlist_offers` | `true` | `p_apt_offers_member` | `authenticated`, `service_role` |
| `appointment_recovery_tasks` | `true` | `p_apt_recovery_member` | `authenticated`, `service_role` |

---

## 2. Aislamiento Multi-Tenant por Organización

Cada política evalúa la pertenencia a la organización mediante la función de seguridad:
```sql
CREATE POLICY p_apt_jobs_member ON public.appointment_notification_jobs
  FOR ALL TO authenticated
  USING (public.is_org_member(organization_id));
```
Esto garantiza que usuarios de una organización jamás puedan visualizar, modificar ni cancelar citas, trabajos de notificación o listas de espera pertenecientes a otra entidad clínica.

---

## 3. Endurecimiento de Procedimientos Almacenados (RPCs)

Para cumplir con las recomendaciones de seguridad de Supabase y eliminar vulnerabilidades de inyección y escalamiento de privilegios:
1. **`search_path = public` estricto:** Todas las funciones (`verify_and_confirm_appointment_okvet`, `generate_appointment_notification_plan`, `process_due_appointment_notification_jobs`, `propose_appointment_reschedule`, `confirm_appointment_reschedule_okvet`, `cancel_appointment_authorized`, `record_appointment_no_show_or_uncompleted`) tienen `SET search_path = public` fijado en su definición.
2. **Revocación de Permisos Anónimos (`anon` y `PUBLIC`):**
   ```sql
   REVOKE EXECUTE ON FUNCTION public.verify_and_confirm_appointment_okvet FROM PUBLIC, anon;
   GRANT EXECUTE ON FUNCTION public.verify_and_confirm_appointment_okvet TO authenticated, service_role;
   ```
   Ningún endpoint público ni cliente no autenticado puede invocar directamente los gates de confirmación, cancelación ni despacho.
3. **Bloqueo Pesimista en Transacciones Críticas:** El uso de `FOR UPDATE` en `appointments` impide que dos peticiones HTTP simultáneas modifiquen la misma cita o generen versiones desfasadas.
