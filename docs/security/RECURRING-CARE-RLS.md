# VET FREEDOM OS — RECURRING CARE ROW LEVEL SECURITY (RLS)
## Políticas de Seguridad, Multi-Tenant y Protección de Datos Clínicos
**Módulo:** VET-CORE-09  
**Motor:** PostgreSQL 17 (Supabase)  

---

## 1. Políticas de Aislamiento Multi-Tenant

El 100% de las tablas relacionales de VET-CORE-09 tienen Row Level Security habilitado:
- `recurring_treatment_plans`
- `recurring_visit_occurrences`
- `recurring_care_plan_versions`
- `recurring_care_supply_checklists`
- `recurring_care_missed_incidents`
- `recurring_care_clinical_reviews`
- `recurring_care_occurrence_events`

```sql
ALTER TABLE public.recurring_treatment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_recurring_treatment_plans ON public.recurring_treatment_plans
  FOR ALL TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.staff_profiles WHERE auth_user_id = auth.uid()
    )
  );
```

---

## 2. Revocación Total de Permisos Anónimos

Para impedir cualquier acceso público o raspado no autenticado de historiales y planes clínicos:

```sql
REVOKE ALL ON public.recurring_treatment_plans FROM anon, public;
REVOKE ALL ON public.recurring_visit_occurrences FROM anon, public;
REVOKE ALL ON public.recurring_care_missed_incidents FROM anon, public;

REVOKE ALL ON FUNCTION public.create_approved_recurring_plan FROM anon, public;
REVOKE ALL ON FUNCTION public.generate_plan_occurrences FROM anon, public;
REVOKE ALL ON FUNCTION public.report_missed_occurrence FROM anon, public;
```

Solo los roles `authenticated` y `service_role` (utilizado internamente por los workflows seguros de n8n) poseen permisos de consulta y ejecución.
