# VET FREEDOM OS — POLÍTICAS DE ROW LEVEL SECURITY (RLS)
## Seguridad en Reposo, Aislamiento por Organización y Políticas RLS en Tablas de Conciliación

---

### 1. Estado de Row Level Security en la Base de Datos

En PostgreSQL 17 (`vet-freedom-os-dev`), todas las tablas creadas por la migración `039_integration_reconciliation_and_cross_system_audit_hub.sql` tienen RLS activado y forzado:

```sql
ALTER TABLE integration_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connectors FORCE ROW LEVEL SECURITY;
-- (Aplicado idénticamente a las 17 tablas del hub de conciliación)
```

Tras la verificación con el linter de seguridad de Supabase, el número de tablas con `rls_enabled_no_policy` es exactamente **0** en todo el esquema público.

---

### 2. Estructura de Políticas RLS por Tabla

#### A. Tablas Directas con `organization_id`
Tablas como `integration_connectors`, `integration_reconciliation_runs` e `integration_reconciliation_audit` implementan políticas directas:

```sql
CREATE POLICY rls_integration_connectors_tenant_isolation ON integration_connectors
FOR ALL TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_organization_memberships
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM user_organization_memberships
    WHERE user_id = auth.uid()
  )
);
```

#### B. Sub-Tablas con Relación Jerárquica
Las tablas hijas (ej. `integration_repair_proposals`, `integration_repair_approvals`, `integration_discrepancy_evidence`) no duplican innecesariamente la columna `organization_id`; protegen su acceso mediante subconsultas `EXISTS`:

```sql
CREATE POLICY rls_integration_repair_proposals_isolation ON integration_repair_proposals
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM integration_reconciliation_discrepancies d
    JOIN integration_reconciliation_runs r ON r.id = d.run_id
    JOIN user_organization_memberships m ON m.organization_id = r.organization_id
    WHERE d.id = integration_repair_proposals.discrepancy_id
      AND m.user_id = auth.uid()
  )
);
```

---

### 3. Acceso del Servicio Automatizado (`service_role`)

Los workers de n8n y los cron jobs internos de Supabase que ejecutan las conciliaciones a las 02:00 AM se autentican con el rol privilegiado `service_role`. Este rol cuenta con políticas explícitas de bypass seguro para registrar auditorías y transicionar estados de conectores sin comprometer la barrera de seguridad de los usuarios autenticados ordinarios.
