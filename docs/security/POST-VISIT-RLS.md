# VET FREEDOM OS — POST-VISIT ROW LEVEL SECURITY (RLS)
## Políticas de Seguridad a Nivel de Fila (RLS) y Control de Acceso en PostgreSQL 17
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS & CONTINUITY HUB  
**Migración:** [034_post_visit_commitments_and_continuity_hub.sql](file:///c:/Users/Freud/N8NVET/supabase/migrations/034_post_visit_commitments_and_continuity_hub.sql)  
**Base de Datos:** PostgreSQL 17.12.0 (Supabase Managed - `sznvahhocgnhsqhksygq`)  

---

## 1. Estado de Blindaje de Tablas

En estricto cumplimiento de la arquitectura de seguridad de Vet Freedom OS, las 14 tablas del subsistema de compromisos y continuidad post-visita cuentan con `ROW LEVEL SECURITY` habilitado (`rowsecurity = true`) y políticas explícitas:

```sql
ALTER TABLE public.post_visit_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitment_snooze_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_commitment_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_pending_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_pending_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_customer_promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_continuity_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_closure_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_audit ENABLE ROW LEVEL SECURITY;
```

---

## 2. Matriz de Permisos por Rol

| Entidad / Tabla | Rol `anon` | Rol `authenticated` (Staff Operativo) | Rol `veterinarian` (Médico Verificado) | Rol `service_role` (n8n Engine) |
|---|---|---|---|---|
| `post_visit_cases` | Denegado | SELECT / UPDATE (Estado operativo) | ALL (Cierre clínico y continuidad) | ALL |
| `post_visit_checklists` | Denegado | SELECT | ALL (Llenado y firma de checklist) | ALL |
| `post_visit_checklist_items` | Denegado | SELECT | ALL | ALL |
| `post_visit_commitments` | Denegado | SELECT / UPDATE (Asignados/Delegados) | ALL | ALL |
| `post_visit_commitment_versions` | Denegado | SELECT (Solo lectura) | SELECT (Solo lectura) | INSERT / SELECT |
| `post_visit_commitment_assignments` | Denegado | SELECT / INSERT (Reclamar o delegar) | ALL | ALL |
| `post_visit_commitment_snooze_records`| Denegado | SELECT / INSERT (Hasta 3 veces) | ALL | ALL |
| `post_visit_commitment_escalations` | Denegado | SELECT (Solo lectura de incidentes) | ALL (Resolución de bloqueos) | ALL |
| `post_visit_pending_documents` | Denegado | SELECT / UPDATE (Envío administrativo) | ALL (Aprobación documental previa) | ALL |
| `post_visit_pending_reports` | Denegado | SELECT (Estado de recepción) | ALL (Revisión médica obligatoria) | ALL |
| `post_visit_customer_promises` | Denegado | Denegado (Contención IA) | ALL (Validación humana requerida) | ALL |
| `post_visit_continuity_handoffs` | Denegado | SELECT (Recepción de guardia) | ALL (Emisión y recepción clínica) | ALL |
| `post_visit_closure_checks` | Denegado | SELECT | ALL (Auditoría de compuerta) | ALL |
| `post_visit_audit` | Denegado | SELECT (Auditoría interna) | SELECT (Auditoría clínica) | INSERT / SELECT |

---

## 3. Revocación Total de Ejecución de RPCs a `anon`

Para mitigar riesgos de inyección y prevenir alteraciones externas del ciclo post-visita, se ha revocado de manera total la ejecución de las 9 funciones RPC al rol `anon`:

```sql
REVOKE EXECUTE ON FUNCTION public.create_or_init_post_visit_case FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_post_visit_checklist FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_post_visit_operational_close FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_post_visit_commitment FROM anon;
REVOKE EXECUTE ON FUNCTION public.assign_or_delegate_commitment FROM anon;
REVOKE EXECUTE ON FUNCTION public.accept_commitment_assignment FROM anon;
REVOKE EXECUTE ON FUNCTION public.snooze_post_visit_commitment FROM anon;
REVOKE EXECUTE ON FUNCTION public.report_and_verify_commitment FROM anon;
REVOKE EXECUTE ON FUNCTION public.close_post_visit_continuity_verified FROM anon;
```

---

## 4. Políticas de Aislamiento Multi-Tenant

Cada consulta y actualización en las tablas de post-visita aplica filtrado estricto por `tenant_id`:

```sql
CREATE POLICY "post_visit_cases_tenant_isolation" ON public.post_visit_cases
    AS RESTRICTIVE
    FOR ALL
    TO authenticated
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

CREATE POLICY "post_visit_commitments_tenant_isolation" ON public.post_visit_commitments
    AS RESTRICTIVE
    FOR ALL
    TO authenticated
    USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid)
    WITH CHECK (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
```

---

## 5. Salvaguardas Específicas de Integridad y Verificación

1. **Inmutabilidad de Auditoría (`post_visit_audit`):** Ningún rol (`authenticated`, `veterinarian`, ni administradores de interfaz) cuenta con privilegios de `UPDATE` o `DELETE` sobre el ledger de auditoría post-visita.
2. **Validación de Tarjeta Profesional Veterinaria:** La función de cierre de continuidad (`close_post_visit_continuity_verified`) exige que el usuario ejecutor cuente con registro activo en `public.staff_profiles` y número de tarjeta profesional COMVEZCOL vigente. Si un auxiliar o coordinador administrativo intenta forzar el cierre, la función aborta con código de excepción `P0001: Unauthorized veterinary role`.
3. **Compuerta Estricta de Informes:** No es posible marcar `close_post_visit_continuity_verified` si existen filas en `post_visit_pending_reports` con estado distinto a `REVIEWED_BY_VET` o `EXONERATED_BY_VET`.
