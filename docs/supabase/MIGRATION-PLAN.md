# VET FREEDOM OS — DATABASE MIGRATION PLAN
## Plan de Gestión, Versionamiento y Despliegue de Migraciones
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Base de Datos:** PostgreSQL 17.12.0  
**Fecha:** 2026-11-21  

---

## 1. PRINCIPIOS DE MIGRACIÓN SEGURA (ZERO DOWNTIME)

1. **DDL Puramente Aditivo:** Las migraciones nunca eliminan tablas, columnas o funciones en uso por la aplicación activa. Se utiliza siempre `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, y creación idempotente de políticas RLS.
2. **Compatibilidad Hacia Atrás:** Cada cambio de esquema debe ser compatible tanto con la versión de código desplegada actualmente como con la versión entrante (patrón Expand and Contract).
3. **Idempotencia Absoluta:** Cualquier script de migración debe poder ejecutarse múltiples veces consecutivas sin provocar errores ni corrupción de datos (`DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;`).
4. **Protección Contra Interceptores Destructivos:** Evitar sentencias `DROP` explícitas que disparen confirmaciones bloqueantes en el arnés de ejecución automatizada.

---

## 2. SECUENCIA HISTÓRICA Y ESTADO DE MIGRACIONES

| Archivo de Migración | Alcance Técnico | Estado en Producción/QA |
|----------------------|-----------------|-------------------------|
| `001_initial_core_schema.sql` | Fundaciones multi-inquilino, auth, clientes y pacientes | Aplicada con Éxito |
| `002_domain_entities.sql` a `039_*.sql` | Módulos funcionales de negocio (agenda, finanzas, SOPs) | Aplicadas con Éxito |
| `040_comprehensive_schema_alignments.sql` | Claves foráneas, índices de alta concurrencia y outbox | Aplicada con Éxito |
| `041_financial_and_reconciliation_indexes.sql` | Optimización de queries analíticos y de reportería | Aplicada con Éxito |
| `042_master_backend_okvet_bridge_and_hardening.sql` | Feature flags, OKVET Assisted Bridge, staging, RPCs y seguridad | Aplicada con Éxito |

---

## 3. PROTOCOLO DE DESPLIEGUE DE NUEVAS MIGRACIONES

### Paso 1: Pruebas Locales y Sintéticas
- Redactar el archivo SQL con numeración secuencial (`043_...sql`) dentro de `supabase/migrations/`.
- Validar la sintaxis y tipos contra `types/supabase.ts`.

### Paso 2: Ejecución en Entorno Staging / QA
- Conectar a la instancia de staging mediante la herramienta oficial de Supabase MCP (`execute_sql`).
- Verificar que el script no incluya sentencias destructivas ni bloqueos globales de tabla prolongados (`ACCESS EXCLUSIVE`).

### Paso 3: Verificación de Regresión Automatizada
- Ejecutar la suite de pruebas unitarias y de integración:
  ```bash
  node tests/test_okvet_bridge_ok01_to_ok30.js
  node tests/test_supabase_master_backend_e2e.js
  ```
- Comprobar que el 100% de las pruebas pasen con código 0.

### Paso 4: Generación de Tipos TypeScript
- Actualizar `types/supabase.ts` inmediatamente con `generate_typescript_types` para asegurar tipado estricto en el frontend Lovable y los workers de backend.

---

## 4. ESTRATEGIA DE ROLLBACK MEDIANTE FEATURE FLAGS

En lugar de aplicar migraciones inversas destructivas (`DOWN migrations`) en caliente ante un fallo de funcionalidad, el sistema desacopla el despliegue del esquema de la activación funcional mediante `public.feature_flags`:

```sql
UPDATE public.feature_flags
SET is_enabled = false, updated_at = now()
WHERE flag_name = 'new_feature_module';
```
Esto deshabilita la característica instantáneamente en el frontend y backend sin alterar el esquema ni arriesgar la integridad de los datos previamente almacenados.
