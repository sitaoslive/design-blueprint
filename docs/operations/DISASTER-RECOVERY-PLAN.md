# PLAN DE RECUPERACIÓN ANTE DESASTRES (DRP) — VET FREEDOM OS
**Proyecto:** Vet Life — Veterinaria a Domicilio  
**Responsable Máximo:** Dr. Luis Eduardo Ríos  
**Infraestructura:** Supabase PostgreSQL 17 + n8n Cloud + Lovable Mobile UI  
**Versión:** 1.0 (Noviembre 2026)  

---

## 1. Objetivos de Tiempo y Punto de Recuperación (RTO / RPO)

| Métrica | Objetivo Comprometido | Mecanismo de Garantía |
|---|---|---|
| **RPO (Recovery Point Objective)** | **<= 5 minutos** | Supabase Continuous WAL Archiving y PITR (Point-in-Time Recovery). |
| **RTO (Recovery Time Objective)** | **<= 15 minutos** | Restauración automatizada a proyecto secundario / snapshot inmediato. |

---

## 2. Escenarios de Desastre y Respuestas Operativas

### Escenario A: Corrupción de Base de Datos o Eliminación Accidental
1. **Identificación:** Alerta P0 emitida por `VET-CORE-21` o `VET-CORE-20`.
2. **Acción Inmediata:**
   - Detener tráfico de escritura hacia la base de datos (congelar triggers de entrada).
   - Localizar el último timestamp consistente a través de `integration_backup_records`.
   - Iniciar Point-in-Time Recovery (PITR) al minuto previo al incidente en Supabase Dashboard o CLI.
   - Ejecutar `SELECT public.verify_backup_restorability(...)` para comprobar las 98 tablas y claves foráneas.
   - Reanudar el tráfico y validar acceso móvil en Lovable.

### Escenario B: Caída Total de la Región Cloud / Supabase
1. **Acción Inmediata:**
   - Activar proyecto secundario de contingencia pre-aprovisionado.
   - Aplicar migraciones ordenadas (001 a 024) desde el repositorio oficial.
   - Restaurar el último dump lógico diario con datos.
   - Actualizar las variables de entorno de conexión en n8n Cloud y Lovable.
   - Probar la autenticación y consultar la agenda médica del día.

### Escenario C: Caída de n8n Cloud
1. **Acción Inmediata:**
   - Los webhooks externos de WhatsApp y pasarelas acumulan reintentos en su origen.
   - Las transacciones clínicas directas en Supabase continúan funcionando a través de Lovable UI.
   - Iniciar instancia n8n auto-hospedada o alternativa e importar los 22 workflows respaldados desde `automation/n8n/workflows/`.
   - Re-apuntar DNS del subdominio de webhooks.
   - Ejecutar suite de pruebas de cableado (`tests/audit_workflows_wiring.js`).

---

## 3. Preservación del Estado Médico y Citas
Bajo ninguna circunstancia de recuperación se autoriza la sobreescritura destructiva de citas ya confirmadas con clientes o historias clínicas ya registradas. Si existe discrepancia temporal:
- El registro en Supabase manda como fuente de verdad única.
- Toda cita en conflicto se etiqueta con `requiere_confirmacion_humana = true` para verificación telefónica manual por el equipo del Dr. Luis.
