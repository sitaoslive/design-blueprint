# VET FREEDOM OS — MATRIZ DE SEGURIDAD ROW LEVEL SECURITY (RLS)
**Proyecto:** Vet Life — Veterinaria a Domicilio  
**Backend:** Supabase PostgreSQL 17 (`sznvahhocgnhsqhksygq`)  
**Cobertura:** 86 Tablas Protegidas con RLS Activo  
**Fecha:** 2026-11-20  

---

## 1. PRINCIPIO GENERAL DE AUTORIZACIÓN

El acceso a los datos en Supabase está gobernado por Row Level Security (RLS) evaluado directamente por el motor PostgreSQL. Ninguna consulta desde el cliente frontend (Lovable), APIs públicas o usuarios autenticados puede eludir estas políticas.

### ROLES EVALUADOS (11 ROLES):
1. `OWNER_CLIENT`: Propietario / Cliente
2. `CAREGIVER`: Cuidador autorizado
3. `VETERINARIAN`: Médico Veterinario
4. `VET_ASSISTANT`: Auxiliar Veterinario
5. `COORDINATOR`: Coordinador de Agenda y Operaciones
6. `RECEPTION`: Recepción y Triaje Telefónico
7. `FINANCE`: Finanzas y Conciliación
8. `ADMINISTRATOR`: Administrador de Organización
9. `DIRECTOR`: Luis / Dirección Médica General
10. `TECH_SUPPORT`: Soporte Técnico e Infraestructura
11. `ALPHA_CONSULTANT`: Consultor Estratégico Alpha Vision

---

## 2. MATRIZ DE PERMISOS POR GRUPO DE ENTIDADES

| Grupo de Tablas | Rol Propietario (`OWNER_CLIENT`) | Cuidador (`CAREGIVER`) | Veterinario (`VETERINARIAN`) | Coordinador / Recepción | Finanzas (`FINANCE`) | Administrador / Director | Soporte Técnico (`TECH_SUPPORT`) |
|-----------------|----------------------------------|------------------------|------------------------------|-------------------------|----------------------|--------------------------|----------------------------------|
| **Catálogos Públicos** (`services`, `tariffs`, `operating_hours`, `branches`) | SELECT (activos) | SELECT (activos) | SELECT | SELECT | SELECT | ALL (crear, editar, borrar) | SELECT |
| **Perfiles y Membresías** (`user_profiles`, `organization_memberships`) | SELECT/UPDATE (su perfil) | SELECT/UPDATE (su perfil) | SELECT perfiles / UPDATE suyo | SELECT perfiles / UPDATE suyo | SELECT perfiles / UPDATE suyo | ALL (gestión de roles y miembros) | SELECT |
| **Clientes y Direcciones** (`owners`, `addresses`) | SELECT/UPDATE (sus registros) | SELECT (autorizados) | SELECT (de sus pacientes) | SELECT/INSERT/UPDATE | SELECT (facturación) | ALL | SELECT (auditado) |
| **Pacientes y Relaciones** (`pets`, `pet_owner_relations`) | SELECT/UPDATE (sus mascotas) | SELECT (autorizados) | SELECT/UPDATE | SELECT/INSERT/UPDATE | SELECT | ALL | SELECT |
| **Customer Experience Memory** (`customer_experience_memory`) | **DENEGADO (Privado)** | **DENEGADO** | SELECT / INSERT | SELECT / INSERT | SELECT | ALL | SELECT (auditado) |
| **Duelo y Supresión** (`bereavement_records`) | SELECT (su mascota) | SELECT | SELECT / INSERT | SELECT / INSERT | SELECT | ALL | SELECT |
| **Conversaciones y Mensajes** (`conversations`, `messages`) | SELECT (su canal) | SELECT (su canal) | SELECT / INSERT | ALL (atención omnicanal) | SELECT | ALL | SELECT |
| **Solicitudes de Citas** (`appointment_requests`) | SELECT / INSERT (sus citas) | SELECT / INSERT | SELECT | ALL (aprobar, rechazar) | SELECT | ALL | SELECT |
| **Citas y Visitas** (`appointments`, `visits`) | SELECT (sus citas) | SELECT (sus citas) | SELECT (asignadas) / UPDATE (visita) | ALL (agendamiento) | SELECT | ALL | SELECT |
| **Calendario y Turnos** (`staff_shifts`, `staff_absences`, `external_events`) | DENEGADO | DENEGADO | SELECT/UPDATE (su turno/agenda) | ALL (coordinación) | SELECT turnos | ALL | SELECT |
| **Planes y Prevención** (`preventive_due_dates`, `recurring_treatment_plans`) | SELECT (sus mascotas) | SELECT (sus mascotas) | ALL (prescribir, registrar) | SELECT / coordinar | SELECT | ALL | SELECT |
| **Rutas y Paradas** (`routes`, `route_stops`, `route_alerts`) | DENEGADO | DENEGADO | SELECT (su ruta) / UPDATE (paradas) | ALL (optimización) | DENEGADO | ALL | SELECT |
| **Insumos y Botiquín Móvil** (`supplies`, `vehicle_inventory_allocations`) | DENEGADO | DENEGADO | SELECT (su botiquín) / registrar consumo | ALL | SELECT costos | ALL | SELECT |
| **Finanzas y Recaudos** (`payment_collections`, `payment_verifications`) | SELECT (sus cobros) / INSERT comprobante | SELECT | SELECT (cobro en campo) | SELECT / registrar | ALL (conciliar, verificar) | ALL | SELECT |
| **Simulador Inteligente** (`schedule_simulations`, `simulation_scenarios`) | DENEGADO | DENEGADO | DENEGADO | SELECT escenarios | DENEGADO | ALL (simular, aprobar) | SELECT |
| **Especialistas y Remisiones** (`patient_referrals`, `referral_approvals`) | SELECT (su remisión) | SELECT | ALL (remitir, revisar) | Coordinar turnos | SELECT comisiones | ALL (aprobación médica) | SELECT |
| **Compromisos y Encuestas** (`post_visit_commitments`, `feedback_surveys`) | SELECT compromisos / INSERT encuesta | SELECT | ALL (crear compromisos) | Monitoreo | SELECT | ALL | SELECT |
| **Outbox, Integraciones y Logs** (`transactional_outbox`, `audit_logs`, `system_event_logs`) | DENEGADO | DENEGADO | DENEGADO | DENEGADO | DENEGADO | SELECT / auditar | ALL (monitoreo técnico) |

---

## 3. REGLAS CRÍTICAS DE SEGURIDAD

1. **Privacidad CEM:** Los registros de `customer_experience_memory` contienen anotaciones internas de manejo y empatía hacia el cliente; jamás son visibles para el rol `anon` ni para el cliente en el frontend.
2. **Supresión por Duelo:** La presencia de un registro en `bereavement_records` bloquea el envío de recordatorios y comunicaciones promocionales a través de la vista de despacho de n8n.
3. **Inmutabilidad de Auditoría:** Las tablas `audit_logs`, `appointment_status_history` y `processed_events` son de tipo append-only (solo `INSERT` y `SELECT`), no permiten `UPDATE` o `DELETE` bajo ningún rol regular.
4. **Validación de Identidad en Modificaciones:** Los usuarios únicamente pueden modificar registros donde `user_id = (SELECT auth.uid())` salvo que pertenezcan formalmente al equipo staff de la organización respectiva.
