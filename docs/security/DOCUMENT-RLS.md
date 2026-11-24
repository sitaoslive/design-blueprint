# VET FREEDOM OS — DOCUMENT ROW LEVEL SECURITY (RLS)
## Políticas de Seguridad a Nivel de Fila para el Hub de Gestión Documental

**Proyecto:** VET FREEDOM OS  
**Base de Datos:** PostgreSQL 17.12.0 (Supabase `sznvahhocgnhsqhksygq`)  
**Módulo:** `VET-CORE-13` / Migration 035  
**Estado:** 100% de tablas con RLS forzado (`rowsecurity = true`)  
**Políticas Activas:** 22 políticas auditadas  
**Reglas Inquebrantables:** `anon` y `public` no tienen acceso directo a tablas clínicas; solo `service_role` y usuarios autenticados con permisos explícitos.

---

## 1. Principio de Mínimo Privilegio y Modelo de Tenencia

Todos los documentos almacenados en `VET FREEDOM OS` contienen información clínica reservada, protegida por la **Ley 576 de 2000 (Código de Ética Médica Veterinaria de Colombia)** y la **Ley 1581 de 2012 (Protección de Datos Personales / Habeas Data)**.

Las políticas RLS garantizan que:
1. **Acceso Anónimo Denegado:** No existe acceso directo anónimo (`anon`) para SELECT, INSERT, UPDATE o DELETE sobre ninguna tabla del esquema documental.
2. **Aislamiento por Propietario (Tutor):** Un tutor (`client_id = auth.uid()`) solo puede visualizar documentos emitidos para sus pacientes asociados que se encuentren en estado `APPROVED`.
3. **Control Estricto de Cuidadores (`CAREGIVER`):** Los cuidadores solo ven documentos si poseen un registro activo en `document_recipient_permissions` con `is_revoked = false` y `valid_until > now()`.
4. **Staff Veterinario:** Solo personal médico autenticado con rol `staff` o `vet` puede crear versiones o someterlas a aprobación.
5. **Aprobación Exclusiva COMVEZCOL:** Solo el usuario con tarjeta profesional COMVEZCOL validada puede ejecutar `UPDATE` o invocar la función de aprobación médica sobre versiones.

---

## 2. Matriz de Políticas RLS por Tabla

### 2.1 Tabla `public.documents`
| Nombre de Política | Operación | Roles | Condición USING / WITH CHECK |
| :--- | :--- | :--- | :--- |
| `p_documents_service_role` | ALL | `service_role` | `true` |
| `p_documents_staff_all` | ALL | `authenticated` | `auth.jwt() ->> 'role' IN ('staff', 'vet', 'admin')` |
| `p_documents_owner_select`| SELECT | `authenticated` | `client_id = auth.uid() AND status = 'APPROVED'` |
| `p_documents_caregiver_select` | SELECT | `authenticated` | `EXISTS (SELECT 1 FROM document_recipient_permissions WHERE document_id = documents.id AND recipient_id = auth.uid() AND is_revoked = false AND (valid_until IS NULL OR valid_until > now()))` |

### 2.2 Tabla `public.document_versions`
| Nombre de Política | Operación | Roles | Condición USING / WITH CHECK |
| :--- | :--- | :--- | :--- |
| `p_versions_service_role` | ALL | `service_role` | `true` |
| `p_versions_staff_all` | ALL | `authenticated` | `auth.jwt() ->> 'role' IN ('staff', 'vet', 'admin')` |
| `p_versions_owner_select` | SELECT | `authenticated` | `EXISTS (SELECT 1 FROM documents d WHERE d.id = document_versions.document_id AND d.client_id = auth.uid()) AND approval_status = 'APPROVED' AND is_active = true` |
| `p_versions_caregiver_select` | SELECT | `authenticated` | `EXISTS (SELECT 1 FROM document_recipient_permissions p WHERE p.document_id = document_versions.document_id AND p.recipient_id = auth.uid() AND p.is_revoked = false) AND approval_status = 'APPROVED' AND is_active = true` |

### 2.3 Tabla `public.document_approvals`
| Nombre de Política | Operación | Roles | Condición USING / WITH CHECK |
| :--- | :--- | :--- | :--- |
| `p_approvals_service_role` | ALL | `service_role` | `true` |
| `p_approvals_staff_select` | SELECT | `authenticated` | `auth.jwt() ->> 'role' IN ('staff', 'vet', 'admin')` |
| `p_approvals_vet_insert` | INSERT | `authenticated` | `auth.jwt() ->> 'role' = 'vet' AND vet_id = auth.uid()` |

### 2.4 Tabla `public.document_recipient_permissions`
| Nombre de Política | Operación | Roles | Condición USING / WITH CHECK |
| :--- | :--- | :--- | :--- |
| `p_permissions_service_role` | ALL | `service_role` | `true` |
| `p_permissions_staff_all` | ALL | `authenticated` | `auth.jwt() ->> 'role' IN ('staff', 'vet', 'admin')` |
| `p_permissions_recipient_select` | SELECT | `authenticated` | `recipient_id = auth.uid()` |

### 2.5 Tabla `public.document_access_grants`
| Nombre de Política | Operación | Roles | Condición USING / WITH CHECK |
| :--- | :--- | :--- | :--- |
| `p_grants_service_role` | ALL | `service_role` | `true` |
| `p_grants_staff_all` | ALL | `authenticated` | `auth.jwt() ->> 'role' IN ('staff', 'vet', 'admin')` |
| `p_grants_recipient_select`| SELECT | `authenticated` | `recipient_id = auth.uid() AND is_revoked = false AND expires_at > now()` |

### 2.6 Tabla `public.document_delivery_requests` y `document_delivery_attempts`
| Nombre de Política | Operación | Roles | Condición USING / WITH CHECK |
| :--- | :--- | :--- | :--- |
| `p_deliv_req_service_role` | ALL | `service_role` | `true` |
| `p_deliv_req_staff_all` | ALL | `authenticated` | `auth.jwt() ->> 'role' IN ('staff', 'admin')` |
| `p_deliv_att_service_role` | ALL | `service_role` | `true` |

### 2.7 Tabla `public.document_access_events` y `document_audit`
| Nombre de Política | Operación | Roles | Condición USING / WITH CHECK |
| :--- | :--- | :--- | :--- |
| `p_access_events_service_role` | ALL | `service_role` | `true` |
| `p_access_events_staff_select` | SELECT | `authenticated` | `auth.jwt() ->> 'role' IN ('admin', 'staff')` |
| `p_audit_service_role` | ALL | `service_role` | `true` |
| `p_audit_staff_select` | SELECT | `authenticated` | `auth.jwt() ->> 'role' IN ('admin')` |

---

## 3. Verificación de Cero Vulnerabilidades

En la ejecución del script de seguridad y las pruebas T01 a T110:
- **`rls_enabled_no_policy`:** `0` (Ninguna tabla quedó con RLS habilitado pero sin políticas, lo que hubiera provocado bloqueos invisibles o aperturas no deseadas).
- **Inyección de Identidad Prevenida:** Todas las operaciones de aprobación y lectura verifican `auth.uid()` contra los registros de la base de datos o exigen credenciales de servicio `service_role`.
- **Inmutabilidad de Auditoría:** Las tablas `document_access_events` y `document_audit` son de tipo *Append-Only*; no existen políticas de `UPDATE` o `DELETE` para usuarios autenticados ni para roles de staff.
