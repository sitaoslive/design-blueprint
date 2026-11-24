# VET FREEDOM OS — BACKUP AND DISASTER RECOVERY PLAN
## Procedimientos de Respaldo, Restauración y Continuidad de Negocio
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Infraestructura:** Supabase Cloud (AWS us-east-1)  
**Fecha:** 2026-11-21  

---

## 1. OBJETIVOS DE CONTINUIDAD (RPO Y RTO)

- **Recovery Point Objective (RPO):** $< 1\text{ hora}$. Máxima pérdida de datos admisible en el peor de los casos ante catástrofe en la región de AWS.
- **Recovery Time Objective (RTO):** $< 4\text{ horas}$. Tiempo máximo permitido para restablecer completamente las operaciones y la base de datos tras una interrupción grave.

---

## 2. CAPAS DE RESPALDO Y PROTECCIÓN

### 2.1 Recuperación Punto en el Tiempo (PITR - Supabase Native)
- Supabase Pro/Team mantiene respaldos físicos continuos con registros de transacciones Write-Ahead Logging (WAL).
- Permite restaurar el estado de la base de datos a cualquier segundo específico dentro de los últimos 7 días.
- Protege contra errores humanos críticos (ej. actualizaciones accidentales masivas) sin pérdida del trabajo previo o posterior al incidente.

### 2.2 Respaldos Lógicos Diarios Cifrados
- Tarea programada en `pg_cron` o worker n8n (VET-CORE-20) que ejecuta un volcado lógico de esquemas críticos (`pg_dump` excluyendo datos sensibles no auditados).
- Cifrado simétrico AES-256 antes de la persistencia.
- Metadatos del respaldo (hash SHA-256, recuento de tablas, tamaño en bytes, fecha UTC) registrados en la tabla `public.system_backups` y persistidos en el bucket privado `system-backups-metadata`.

---

## 3. PROCEDIMIENTO PASO A PASO DE RESTAURACIÓN

### 3.1 Restauración ante Falla Lógica o Corrupción de Datos
1. **Identificación del Incidente:** El Director Técnico o el DBA identifica la hora exacta $T_{\text{falla}}$ de la corrupción.
2. **Activación de Modo de Mantenimiento:** Activar el feature flag en la aplicación Lovable (`system_maintenance_mode = true`) para pausar transacciones entrantes.
3. **Inicio de Restauración PITR:** En el panel de Supabase Cloud, seleccionar la instancia de proyecto `sznvahhocgnhsqhksygq` y definir el punto de corte en $T_{\text{falla}} - 1\text{ minuto}$.
4. **Validación de Integridad:**
   - Verificar la cantidad de registros en `appointments`, `clients`, `patients` y `financial_transactions`.
   - Ejecutar la suite sintética: `node tests/test_supabase_master_backend_e2e.js`.
5. **Reapertura de Operaciones:** Desactivar modo de mantenimiento y reactivar n8n.

### 3.2 Simulacro Periódico de Restauración (Dry-Run Restore)
- Cada 90 días se ejecuta un simulacro obligatorio en un proyecto de prueba aislado para verificar que los volcados no presenten corrupciones silenciosas y que las credenciales de descifrado sigan operativas.
