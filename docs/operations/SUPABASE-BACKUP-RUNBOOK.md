# MANUAL OPERATIVO DE RESPALDOS SUPABASE POSTGRESQL (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Base de Datos:** PostgreSQL 17 (`sznvahhocgnhsqhksygq`)  
**Destinatarios:** Ingeniero SRE, DBA PostgreSQL, Dr. Luis Eduardo Ríos  
**Zona Horaria:** `America/Bogota` (UTC-5)  

---

## 1. Estrategia de Respaldo Lógico de Base de Datos

### 1.1. Respaldo Lógico Automatizado
Dado que el proyecto opera en la capa administrada de Supabase, los respaldos lógicos independientes se generan semanalmente y antes de cada migración mayor.

Comando oficial de exportación sanitizada (sin contraseñas en historial):
```bash
# Exportar únicamente el esquema DDL y funciones
supabase db dump --project-ref sznvahhocgnhsqhksygq -f supabase/dumps/vet_freedom_schema_$(date +%Y%m%d).sql

# Exportar datos consistentes de negocio
supabase db dump --project-ref sznvahhocgnhsqhksygq --data-only -f supabase/dumps/vet_freedom_data_$(date +%Y%m%d).sql
```

### 1.2. Cálculo Criptográfico y Manifiesto
Inmediatamente tras la exportación:
1. Calcular hash SHA-256:
   ```bash
   sha256sum vet_freedom_schema_*.sql > vet_freedom_schema.sha256
   ```
2. Generar manifiesto JSON con tamaño en bytes, conteo de tablas (98) y timestamp ISO-8601.
3. Registrar en Supabase mediante RPC:
   ```sql
   SELECT public.record_backup_execution('{
     "organization_id": "11111111-1111-1111-1111-111111111111",
     "backup_type": "FULL",
     "backup_size_bytes": 18450000,
     "checksum_sha256": "<HASH_SHA256>",
     "tables_count": 98,
     "storage_location": "system-backups-metadata",
     "environment": "DEVELOPMENT"
   }'::jsonb);
   ```

---

## 2. Procedimiento de Verificación de Restaurabilidad
Todo respaldo debe validarse mediante una prueba sintética en un esquema aislado:
```sql
SELECT public.verify_backup_restorability('{
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "backup_id": "<BACKUP_UUID>",
  "target_schema": "sandbox_restore_test"
}'::jsonb);
```
El resultado debe confirmar:
- `tables_checked`: 98
- `fk_violations`: 0
- `rls_unprotected`: 0
- `status`: `'PASSED'`
