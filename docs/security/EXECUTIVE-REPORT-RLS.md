# Políticas de Seguridad a Nivel de Fila (RLS) en Reportes Ejecutivos (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Base de Datos:** Supabase PostgreSQL 17.12.0  
**Fecha:** 2026-11-21  

---

## 1. Principio de Aislamiento Multi-Tenant y Mínimo Privilegio

Los reportes ejecutivos contienen la información más sensible de Vet Life: cifras exactas de facturación, reclamaciones de clientes, evaluaciones de desempeño del personal y diagnósticos clínicos agregados.

Por tanto:
- Las **17 tablas** de la migración 037 tienen `ROW LEVEL SECURITY (RLS)` habilitado obligatoriamente (`ENABLE ROW LEVEL SECURITY;`).
- Ninguna fila puede ser consultada por usuarios anónimos (`anon`) o usuarios sin sesión autenticada.
- Los clientes (tutores de mascotas) NO tienen visibilidad sobre estas tablas bajo ninguna condición.

---

## 2. Matriz de Políticas RLS Implementadas

| Tabla | Operación | Política / Expresión SQL | Rol Autorizado |
| :--- | :--- | :--- | :--- |
| `executive_daily_snapshots` | SELECT | `organization_id IN (SELECT organization_id FROM staff_profiles WHERE user_id = auth.uid())` | Staff autenticado de la organización |
| `executive_daily_snapshots` | ALL | `organization_id IN (SELECT organization_id FROM staff_profiles WHERE user_id = auth.uid() AND role IN ('DIRECTOR', 'COORDINATION'))` | Dirección y Coordinación |
| `executive_metric_results` | SELECT / ALL | `organization_id IN (SELECT organization_id FROM staff_profiles WHERE user_id = auth.uid())` | Staff autenticado de la organización |
| `executive_decision_requests`| ALL | `organization_id IN (SELECT organization_id FROM staff_profiles WHERE user_id = auth.uid() AND role = 'DIRECTOR')` | Exclusivo Dr. Luis Eduardo Ríos |
| `executive_report_audit` | SELECT | `organization_id IN (SELECT organization_id FROM staff_profiles WHERE user_id = auth.uid() AND role = 'DIRECTOR')` | Exclusivo Dr. Luis Eduardo Ríos |
| `executive_report_audit` | INSERT | Permitido a través de Stored Procedures `SECURITY DEFINER` | Motor n8n / Auditoría |

---

## 3. Endurecimiento de Stored Procedures

Todos los 14 Stored Procedures creados en la migración 037 fueron asegurados con:
```sql
SECURITY DEFINER
SET search_path = public;

REVOKE EXECUTE ON FUNCTION claim_daily_report_generation FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION claim_daily_report_generation TO authenticated, service_role;
```
Esto previene ataques de inyección de rutas de búsqueda (`search_path hijacking`) y garantiza que solo llamadas autenticadas desde n8n o la aplicación web puedan invocar la agregación.
