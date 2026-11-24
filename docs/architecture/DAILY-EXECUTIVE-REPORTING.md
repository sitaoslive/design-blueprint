# Arquitectura del Sistema de Reporte Ejecutivo Diario (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Entorno:** DEVELOPMENT / QA  
**Fecha:** 2026-11-21  

---

## 1. Misión y Propósito Ejecutivo

El sistema de Reporte Ejecutivo Diario constituye el centro neurálgico de inteligencia, supervisión y soporte a decisiones de Vet Life. Su misión es condensar la totalidad de la operación diaria (citas, visitas, rutas, finanzas, personal, experiencia, especialistas, compromisos y salud técnica) en un brief accionable de **60 segundos** para el Dr. Luis Eduardo Ríos.

### Principios Rectores:
1. **La Verdad en los Datos (No Fabricación):** Los reportes se basan en métricas verificables y registradas en Supabase (`sznvahhocgnhsqhksygq`). Si un dato no existe o la fuente está caída, se marca explícitamente como `SOURCE_UNAVAILABLE` o advertencia; jamás se inventan ceros ni visitas ficticias.
2. **Inmutabilidad y Versionado Histórico:** Cada corte diario genera un Snapshot formal versionado (`v1..vn`). Los datos tardíos no sobreescriben la versión matutina, sino que crean una nueva versión trazable con auditoría de diferencias.
3. **Decisiones vs. Delegación:** Distingue con precisión milimétrica las decisiones reservadas para el criterio de la Dirección Médica (Dr. Luis) de las tareas operativas delegables a la Coordinación, Veterinarios de Ruta o Facturación.
4. **Resguardo de Privacidad y Safe Mode:** En fase QA, todos los despachos externos están deshabilitados (`send_enabled: false`, `active: false`), garantizando cero impacto en clientes o personal sin autorización previa.

---

## 2. Diagrama de Arquitectura Global

```mermaid
flowchart TD
    subgraph Triggers ["Mecanismos de Disparo"]
        ST[Cron Schedule Trigger: 06:00 America/Bogota]
        WH[Webhook de Revisión: /reports/daily]
        MT[Manual QA Trigger]
    end

    subgraph LockEngine ["Control de Concurrencia"]
        AL[PostgreSQL Advisory Lock / Claim RPC]
    end

    subgraph DataCollection ["Extracción Multi-Dominio (Supabase RPCs)"]
        D1[RPC Citas: get_daily_appointment_metrics]
        D2[RPC Visitas: get_daily_visit_metrics]
        D3[RPC Personal: get_daily_staff_metrics]
        D4[RPC Rutas: get_daily_route_metrics]
        D5[RPC Finanzas: get_daily_financial_metrics]
        D6[RPC Continuidad: get_daily_continuity_metrics]
        D7[RPC Experiencia: get_daily_experience_metrics]
        D8[RPC Integraciones: get_daily_integration_metrics]
    end

    subgraph IntelligenceEngine ["Motor de Inteligencia & Calidad (n8n Code Node)"]
        DQ[Motor de Calidad de Datos: null != 0]
        EX[Detector de Excepciones & Semáforo]
        DD[Separador: Decisiones Luis vs Delegación]
        PT[Generador de Prioridades de Mañana]
        GR[Guardrails de IA & Fallback Determinista]
    end

    subgraph Snapshots ["Persistencia de Snapshots"]
        SN1[(executive_daily_snapshots v1)]
        SN2[(executive_daily_report_versions v2..vn)]
        AU[(executive_report_audit)]
    end

    subgraph Dispatcher ["Despacho Seguro (Safe Mode)"]
        IF{Requiere Atención Urgente?}
        URG[Dispatch Urgent Brief: Canal Prioritario]
        STD[Dispatch Standard Brief: Digest Matutino]
    end

    ST --> AL
    WH --> AL
    MT --> AL
    AL --> DataCollection
    DataCollection --> IntelligenceEngine
    IntelligenceEngine --> Snapshots
    IntelligenceEngine --> IF
    IF -- Sí (Rojo/Amarillo) --> URG
    IF -- No (Verde) --> STD
```

---

## 3. Componentes del Ecosistema

### 3.1. Orquestador n8n (`VET-CORE-16`)
- **Cloud ID:** `LHYUw9Pe93pDXaTw`
- **Zona Horaria:** `America/Bogota` (UTC-5)
- **Disparador:** Diario a las 06:00 AM (Schedule Trigger) y bajo demanda vía Webhook autenticado.
- **Modo Seguro:** Salidas Set formateadas con `send_enabled: false`, `active: false`.

### 3.2. Capa de Base de Datos (Supabase PostgreSQL 17.12)
- **Migración 037:** 17 tablas relacionales dedicadas al reporting ejecutivo y auditoría.
- **14 Stored Procedures (`SECURITY DEFINER`):** Encapsulan la agregación atómica de métricas, claim de generación, registro de excepciones y auditoría inmutable.
- **Seguridad RLS:** Restricción estricta por `organization_id` con acceso restringido a roles `DIRECTOR` y `COORDINATION`.

### 3.3. Motor de Guardrails de IA y Fallback
- Si se activa asistencia de lenguaje natural (LLM) para generar la narrativa matutina, sus afirmaciones numéricas se contrastan contra las métricas deterministas de Supabase.
- En caso de alucinación (discrepancia en visitas, recaudo inventado ante corte de pasarela, etc.), el sistema aborta la narrativa sintética y emite el **Resumen Ejecutivo Determinista** predefinido.

---

## 4. Enlaces de Referencia

- [Migración Supabase 037](file:///c:/Users/Freud/N8NVET/supabase/migrations/037_daily_executive_reporting_and_decision_intelligence_hub.sql)
- [Workflow n8n VET-CORE-16](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-16.json)
- [Suite de Pruebas Automatizadas](file:///c:/Users/Freud/N8NVET/tests/test_core_16_t01_to_t110.js)
