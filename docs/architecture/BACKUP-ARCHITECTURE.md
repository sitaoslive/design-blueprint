# ARQUITECTURA INTEGRAL DE RESPALDOS Y CONTINUIDAD (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-21 | Backups & Maintenance Coordination`  
**ID en n8n Cloud:** `fjVxzNJqrYkFIcWg`  
**Base de Datos:** Supabase PostgreSQL 17 (`sznvahhocgnhsqhksygq`)  
**Zona Horaria:** `America/Bogota` (UTC-5)  
**Estado:** `VERIFIED`

---

## 1. Misión y Filosofía Arquitectónica
Vet Freedom OS está diseñado para que la operación veterinaria de Vet Life **nunca dependa de una sola computadora, una sola instancia, una sola persona o un único proveedor de nube**.

### Los 5 Niveles de Validación Obligatoria:
1. **Nivel 1 — Existencia:** El archivo o snapshot existe físicamente en el medio de almacenamiento designado.
2. **Nivel 2 — Integridad Técnica:** El archivo cuenta con checksum SHA-256 verificado, encabezados válidos y sin truncamiento.
3. **Nivel 3 — Contenido Esperado:** El respaldo contiene la totalidad de las 98 tablas de negocio, secuencias, funciones y políticas RLS.
4. **Nivel 4 — Restaurabilidad Comprobada:** El respaldo se restaura exitosamente en una base de datos aislada sin errores de sintaxis DDL ni violaciones de claves foráneas (`fk_violations = 0`).
5. **Nivel 5 — Recuperación Funcional:** La aplicación Lovable y los contratos de automatización reanudan su consistencia operativa (citas, pacientes, tutores) sin duplicación de efectos externos.

---

## 2. Los Tres Niveles de Respaldo

```
+---------------------------------------------------------------------------------+
| NIVEL A: RESPALDOS DEL PROVEEDOR                                                |
| - Supabase Continuous WAL Archiving y PITR (cuando aplique según plan).        |
| - Snapshots de infraestructura administrada por Supabase en AWS us-east-1.      |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| NIVEL B: RESPALDOS LÓGICOS INDEPENDIENTES                                       |
| - Exportaciones estructuradas pg_dump/CLI cifradas con AES-256.                |
| - Almacenamiento fuera del servidor principal (bucket system-backups-metadata). |
| - Respaldo desacoplado de objetos de Supabase Storage.                          |
+---------------------------------------------------------------------------------+
                                      |
                                      v
+---------------------------------------------------------------------------------+
| NIVEL C: VERSIONADO DECLARATIVO EN GIT                                          |
| - 25 migraciones DDL secuenciales en supabase/migrations/.                      |
| - 22 workflows de n8n Cloud exportados sin secretos en automation/n8n/.         |
| - Código de interfaz Lovable, contratos JSON Schema y runbooks operativos.       |
+---------------------------------------------------------------------------------+
```

---

## 3. Sub-Workflows Reutilizables de Continuidad (BKP-01 a BKP-15)

| Código | Responsabilidad Técnica | Integración / Salida |
|---|---|---|
| **BKP-01** | Supabase DB Backup Check | Comprueba estado de snapshot y tamaño de base de datos. |
| **BKP-02** | Supabase Storage Backup Check | Audita buckets `medical-records` y `referral-documents`. |
| **BKP-03** | n8n Instance Backup Check | Audita disponibilidad de API y conectividad de n8n Cloud. |
| **BKP-04** | Workflow Export Check | Verifica versionado de los 22 workflows en Git sin credenciales. |
| **BKP-05** | Secret Recovery Metadata Check | Comprueba inventario de credenciales sin exponer secretos. |
| **BKP-06** | Git Repository Health | Verifica estado limpio del repositorio y ramas sincronizadas. |
| **BKP-07** | Backup Manifest Validation | Valida archivo `.manifest.json` con conteo de tablas y checksums. |
| **BKP-08** | Backup Age Assessment | Detecta respaldos vencidos (> 7 días sin ejecución nominal). |
| **BKP-09** | Backup Integrity Validation | Comprueba coincidencia exacta de hash SHA-256 de 64 hex. |
| **BKP-10** | Restore Test Request | Despacha orden de prueba de restauración a entorno sandbox. |
| **BKP-11** | Restore Test Result Validation | Comprueba que `verify_backup_restorability()` retorne 0 violaciones. |
| **BKP-12** | Maintenance Window Check | Evalúa si existe ventana activa para suprimir alertas no-P0 en CORE-20. |
| **BKP-13** | Pre-Deployment Backup Gate | Bloquea migraciones DDL si no existe un backup íntegro < 2 horas. |
| **BKP-14** | Post-Deployment Verification | Ejecuta suite de regresión y smoke tests post-cambio. |
| **BKP-15** | Disaster Recovery Incident | Dispara escalación P0 al Director médico ante fallo no recuperable. |
