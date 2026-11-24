# Plan de Contingencia y Recuperación ante Fallos (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Código Runbook:** `RUNBOOK-REC-016`  
**Fecha:** 2026-11-21  

---

## 1. Escenarios de Falla y Mitigación Inmediata

| Falla Detectada | Causa Raíz Probable | Comportamiento del Sistema | Acción de Mitigación Operativa |
| :--- | :--- | :--- | :--- |
| **Worker Colisiona / Lock Atascado** | Caída inesperada de n8n mientras sostenía el Advisory Lock. | El nuevo trigger detecta lock activo y aborta para evitar corrupción. | Ejecutar `SELECT release_daily_report_generation(...)` tras verificar que el worker anterior está muerto. |
| **Falla en Pasarela de Pagos** | API de Wompi/Bold no responde durante la agregación. | Métricas financieras marcadas como `SOURCE_UNAVAILABLE`. No se asume $0 COP. | Generar Snapshot v1 con alerta financiera; cuando la pasarela vuelva, lanzar webhook para emitir Snapshot v2. |
| **Timeout en OKVET** | Conexión con software clínico excedió los 15 segundos. | Visitas marcadas como `PARTIALLY_VERIFIED`. | No bloquear el reporte matutino; alertar a médicos de ruta para verificar notas clínicas locales. |
| **Falla de LLM o Alucinación** | El modelo generativo devuelve cifras contradictorias con Supabase. | El Guardrail detecta la discrepancia y activa el **Fallback Determinista**. | Cero impacto: el Dr. Luis recibe la versión estructurada determinista sin retraso. |

---

## 2. Reprocesamiento Manual de Emergencia

Si por cualquier contingencia el cron de las 06:00 AM no corrió:
1. Acceder al dashboard de n8n o invocar vía curl / Postman:
   ```bash
   POST https://alphavision.app.n8n.cloud/webhook/reports/daily
   Content-Type: application/json
   
   {
     "report_date": "2026-11-21",
     "timezone": "America/Bogota",
     "trigger_reason": "MANUAL_DISASTER_RECOVERY"
   }
   ```
2. El sistema adquiere el lock, compila las métricas, persiste el snapshot en Supabase y emite la respuesta auditada.
