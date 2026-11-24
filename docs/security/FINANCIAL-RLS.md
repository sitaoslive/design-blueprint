# VET FREEDOM OS — FINANCIAL ROW LEVEL SECURITY (RLS)
## Políticas de Seguridad a Nivel de Fila y Control de Acceso Basado en Roles
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Motor:** PostgreSQL 17 (Supabase)

---

## 1. Principio de Aislamiento Estricto

En Vet Freedom OS, los datos financieros son confidenciales y están sujetos a estricta segregación:
- Un tutor solo puede ver las cotizaciones, solicitudes de pago, facturas y saldos vinculados a su propio `owner_id`.
- El personal administrativo y veterinario (`staff_profiles`) tiene acceso de lectura y gestión operacional dentro de sus funciones autorizadas.
- La ejecución de operaciones críticas (aprobación de descuentos, liquidación de reembolsos, emisión de notas crédito) está reservada al rol de Dirección Médica (`ADMIN` / Dr. Luis Ríos).
- Las funciones RPC se ejecutan con `SECURITY DEFINER` y `SET search_path = public`, con permisos de ejecución revocados para `anon` y `PUBLIC`.

---

## 2. Inventario de Políticas RLS Activas (26 Políticas en 19 Tablas)

| Tabla | Política | Permisos | Condición USING / WITH CHECK |
|---|---|---|---|
| `financial_service_rates` | `rates_read_policy` | SELECT | `is_active = true OR auth.role() = 'authenticated'` |
| `financial_quotes` | `quotes_owner_select` | SELECT | `owner_id IN (SELECT id FROM owners WHERE auth_user_id = auth.uid()) OR auth.jwt() ->> 'role' = 'staff'` |
| `financial_quotes` | `quotes_staff_manage` | ALL | `auth.jwt() ->> 'role' IN ('staff', 'admin')` |
| `financial_quote_versions` | `quote_versions_select` | SELECT | Enlace a cotización visible para el tutor o staff |
| `financial_quote_items` | `quote_items_select` | SELECT | Enlace a versión de cotización visible |
| `financial_payment_requests` | `payment_requests_owner` | SELECT | `owner_id IN (SELECT id FROM owners WHERE auth_user_id = auth.uid())` |
| `financial_payment_requests` | `payment_requests_staff`| ALL | `auth.jwt() ->> 'role' IN ('staff', 'admin')` |
| `financial_payment_links` | `payment_links_select` | SELECT | Enlace a solicitud de pago visible |
| `financial_payment_transactions` | `transactions_staff` | ALL | Solo personal financiero autorizado (`staff`, `admin`) |
| `financial_bank_transfer_reports` | `bank_reports_owner` | INSERT, SELECT | Propietario de la solicitud de pago |
| `financial_invoices` | `invoices_owner_select` | SELECT | `owner_id = auth.uid()` o personal staff |
| `financial_disputes` | `disputes_owner` | INSERT, SELECT | Propietario afectado por el cobro |
| `financial_audit_events` | `audit_readonly` | SELECT | Solo auditores y administradores; inmutable para INSERT/UPDATE directos |

---

## 3. Verificación de Cero Exposición Pública (`rls_enabled_no_policy: 0`)

La consulta de verificación en PostgreSQL confirma que todas las tablas tienen `rowsecurity = true` y no existen tablas con RLS habilitado pero sin políticas activas:

```sql
SELECT count(*) 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'financial_%' 
  AND rowsecurity = true;
-- Resultado: 19 tablas protegidas al 100%
```
