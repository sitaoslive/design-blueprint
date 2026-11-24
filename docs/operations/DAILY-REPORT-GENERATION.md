# Procedimiento Operativo Estándar: Generación del Reporte Diario (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Código SOP:** `SOP-OPS-016`  
**Fecha:** 2026-11-21  

---

## 1. Cronograma y Secuencia Diaria

```mermaid
sequenceDiagram
    autonumber
    participant CRON as Scheduler n8n (06:00 AM)
    participant LOCK as PostgreSQL Advisory Lock
    participant DB as Supabase Transaccional
    participant ENGINE as Motor VET-CORE-16
    participant AUDIT as executive_report_audit
    participant LUIS as Dr. Luis Eduardo Ríos

    CRON->>LOCK: claim_daily_report_generation(org, date)
    alt Lock Adquirido Exitosamente
        LOCK-->>ENGINE: Lock concedido
        ENGINE->>DB: Invocar RPCs de extracción (Citas, Visitas, Rutas, Finanzas...)
        DB-->>ENGINE: Retornar métricas por dominio
        ENGINE->>ENGINE: Evaluar Calidad (null != 0), Excepciones y Semáforo
        ENGINE->>ENGINE: Compilar "Visión de 60 Segundos"
        ENGINE->>DB: persist_daily_snapshot(v1, is_current=true)
        ENGINE->>AUDIT: record_daily_report_audit(GENERATION_SUCCESS)
        ENGINE-->>LUIS: Despachar Brief Matutino (Safe Mode en QA)
    else Lock en Conflicto (Worker ya ejecutando)
        LOCK-->>ENGINE: Reintento rechazado
        ENGINE->>AUDIT: Log WARNING_DUPLICATE_TRIGGER
    end
```

---

## 2. Parámetros de Ejecución del Job Programado

- **Hora de Ejecución:** `06:00:00 AM` (America/Bogota, UTC-5).
- **Timeout Máximo:** 45 segundos para la agregación total.
- **Reintentos Automáticos:** Hasta 2 reintentos con backoff exponencial (10s, 30s) en caso de caída transitoria de red.
- **Notificación de Falla:** Si tras 2 reintentos el reporte no se compila, se emite una alerta técnica inmediata a la Coordinación Operativa.
