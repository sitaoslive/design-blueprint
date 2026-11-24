# VET FREEDOM OS — SEGURIDAD Y POLÍTICAS RLS (VET-CORE-15)

## 1. Tenant Isolation Multi-Inquilino
Todas las 26 tablas tienen habilitada la seguridad a nivel de fila (`ROW LEVEL SECURITY`) forzada mediante:
```sql
ALTER TABLE customer_experience_* ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_* FORCE ROW LEVEL SECURITY;
```

## 2. Políticas Basadas en Membresía
El aislamiento de datos se garantiza evaluando la pertenencia del usuario autenticado a la organización en `organization_memberships`:
```sql
CREATE POLICY "tenant_isolation_policy" ON customer_experience_*
FOR ALL TO authenticated
USING (organization_id IN (
  SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()
))
WITH CHECK (organization_id IN (
  SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()
));
```

## 3. Protección de Funciones
Las 19 funciones del módulo están bloqueadas para `anon` y `PUBLIC` mediante:
```sql
REVOKE ALL ON FUNCTION public.* FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.* TO authenticated, service_role;
```
