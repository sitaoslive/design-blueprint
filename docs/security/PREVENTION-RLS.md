# Políticas de Seguridad a Nivel de Fila (RLS) - VET-CORE-10

## 1. Declaración de Principios de Seguridad
Los datos de salud preventiva, lotes de biológicos y registros de aplicación son información clínica confidencial. El 100% de las tablas introducidas en la migración `032_prevention_care_plans_and_traceability.sql` operan con `ENABLE ROW LEVEL SECURITY`.

## 2. Revocación de Privilegios Públicos
Por defecto, todo acceso `anon` y `public` es revocado:
```sql
REVOKE ALL ON preventive_care_plans FROM anon, public;
REVOKE ALL ON preventive_care_plan_versions FROM anon, public;
REVOKE ALL ON preventive_care_source_records FROM anon, public;
REVOKE ALL ON preventive_care_events FROM anon, public;
REVOKE ALL ON preventive_product_lots FROM anon, public;
REVOKE ALL ON preventive_cold_chain_checks FROM anon, public;
REVOKE ALL ON preventive_care_application_records FROM anon, public;
REVOKE ALL ON preventive_care_incidents FROM anon, public;
REVOKE ALL ON preventive_care_audit FROM anon, public;
```

## 3. Matriz de Acceso por Roles

| Tabla | Rol `service_role` | Rol `authenticated` (Veterinario/Staff) | Rol `authenticated` (Tutor / Cliente) |
| :--- | :--- | :--- | :--- |
| `preventive_care_plans` | Control Total | Lectura y Modificación (con matrícula) | Solo lectura de planes propios activos |
| `preventive_care_plan_versions` | Control Total | Creación y Lectura | Solo lectura de versiones vigentes |
| `preventive_care_source_records` | Control Total | Creación, Reconciliación, Auditoría | Solo lectura de antecedentes propios |
| `preventive_care_events` | Control Total | Programación y Gestión | Lectura de eventos programados propios |
| `preventive_product_lots` | Control Total | Gestión de Lotes y Cuarentena | Sin acceso |
| `preventive_cold_chain_checks` | Control Total | Registro y Auditoría Térmica | Sin acceso |
| `preventive_care_application_records`| Control Total | Registro de Aplicaciones Oficiales | Lectura de certificados propios |
| `preventive_care_incidents` | Control Total | Registro y Resolución de Alertas | Sin acceso |
| `preventive_care_audit` | Control Total | Solo Lectura Auditada | Sin acceso |

## 4. Políticas RLS Específicas

### 4.1 Protección de Acceso para Tutores (Propietarios)
Los tutores solo pueden consultar planes y aplicaciones pertenecientes a sus mascotas verificadas:
```sql
CREATE POLICY "Tutor puede ver planes de sus mascotas"
ON preventive_care_plans FOR SELECT
TO authenticated
USING (
  patient_id IN (
    SELECT id FROM patients WHERE owner_id = auth.uid()
  )
);
```

### 4.2 Restricción Estricta de Certificación y Lotes
Los tutores tienen vetado el acceso directo a `preventive_product_lots` y `preventive_cold_chain_checks` para evitar manipulación de inventario o datos operativos de farmacia veterinaria.

## 5. Endurecimiento de Procedimientos Almacenados
Todas las funciones RPC operan con:
- `SECURITY DEFINER`: Para garantizar ejecución con permisos controlados sin exponer tablas subyacentes.
- `SET search_path = public`: Mitigación absoluta contra ataques de secuestro de ruta de búsqueda (`schema hijacking`).
