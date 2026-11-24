# Arquitectura del Sistema de Reporte Ejecutivo Semanal (VET-CORE-17)

**Módulo:** `VET-CORE-17 | WEEKLY REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Entorno:** DEVELOPMENT / QA  
**Fecha:** 2026-11-21  

---

## 1. Misión y Propósito Ejecutivo

El sistema de Reporte Ejecutivo Semanal (`VET-CORE-17`) constituye el centro avanzado de inteligencia estratégica, rentabilidad verificada, capacidad operativa, autonomía del fundador y mejora continua de Vet Life.

### Distinción Vital entre Reporte Diario (CORE-16) y Semanal (CORE-17):
- **CORE-16 (Diario):** Pregunta *"¿Qué ocurrió hoy y qué requiere resolución inmediata en los próximos 60 segundos?"* Se enfoca en urgencias, bloqueos puntuales del día, excepciones y prioridades tácticas para la mañana siguiente.
- **CORE-17 (Semanal):** Pregunta *"¿Qué está cambiando estructuralmente, qué está funcionando, dónde se acumulan cuellos de botella y cómo mejoramos de forma sistemática?"* Evalúa tendencias reales sobre semanas completas, cohortes de conversión, márgenes de contribución calculables, utilización de capacidad médica y liberación efectiva de tiempo del Dr. Luis.

---

## 2. Diagrama de Arquitectura Global

```mermaid
flowchart TD
    subgraph Triggers ["Mecanismos de Disparo Semanal"]
        ST[Cron Schedule Trigger: Lunes 07:00 AM America/Bogota]
        WH[Webhook de Revisión Ejecutiva: /reports/weekly]
        MT[Manual QA Trigger]
    end

    subgraph LockEngine ["Control de Concurrencia y Período"]
        AL[PostgreSQL Advisory Lock / RPC claim_weekly_report_generation]
        RP[RPC resolve_weekly_period: Lunes 00:00 a Domingo 23:59:59.999]
    end

    subgraph Extraction ["Extracción Multi-Dominio Semanal (Supabase sznvahhocgnhsqhksygq)"]
        D1[RPC get_weekly_operation_metrics: Citas, Visitas, Cohortes]
        D2[RPC get_weekly_capacity_metrics: Horas, Rutas, Sobrecarga]
        D3[RPC get_weekly_financial_metrics: Facturado, Cobrado, Costos Directos]
        D4[Dominio Continuidad: CORE-09 Recurrencias, CORE-10 Vacunas, CORE-11 Remisiones]
        D5[Dominio Experiencia: CORE-15 CSAT/NPS, Quejas Abiertas/Cerradas]
        D6[Dominio Autonomía: Tareas Reservadas Luis vs Delegables vs Automatizadas]
    end

    subgraph IntelligenceEngine ["Motor de Inteligencia & Calidad (n8n Code Node)"]
        MTX[Taxonomía de Agregación: Aditivas, COUNT DISTINCT, Tasas, Ponderados, Stock]
        DQ[Axioma de Calidad: null != 0 | SOURCE_UNAVAILABLE != 0]
        CMP[Comparabilidad de Semanas Completas & Validación de Tendencias]
        PRF[Cálculo de Margen de Contribución & Guardrail de Lucro Cesante]
        AUT[Tasa de Autonomía de Luis WF-075 & Cuellos de Botella]
        WBR[Generador de Resumen 1 Página: Weekly Business Review]
        GR[Guardrails de IA & Fallback Determinista]
    end

    subgraph Persistence ["Persistencia Versionada de Snapshots"]
        REP[(executive_weekly_reports)]
        SNAP[(executive_weekly_snapshots v1..vn)]
        METR[(executive_weekly_metric_results)]
        CAP[(executive_capacity_analyses)]
        FND[(executive_founder_dependency_analyses)]
        PRF_TAB[(executive_profitability_analyses)]
        CLUST[(executive_recurring_problem_clusters)]
        AUD[(executive_weekly_audit)]
    end

    subgraph Dispatcher ["Despacho Seguro (Safe Mode Invariant)"]
        SEC{send_enabled == true?}
        BLOCKED[Safe Mode Activo: Log Local en executive_weekly_report_deliveries]
        DISP[Despacho Cifrado a Asistente Privada de Luis / Lovable Hub]
    end

    ST --> AL
    WH --> AL
    MT --> AL
    AL --> RP
    RP --> Extraction
    Extraction --> IntelligenceEngine
    IntelligenceEngine --> Persistence
    Persistence --> SEC
    SEC -- No (QA) --> BLOCKED
    SEC -- Sí (Producción Aprobada) --> DISP
```

---

## 3. Dimensiones Clave de Análisis Semanal

1. **Actividad Operativa y Conversión:**
   - Solicitudes únicas recibidas (`COUNT(DISTINCT tutor_id)`).
   - Conversión por cohorte: tutores que solicitaron servicio en la semana y lograron cita completada.
   - Visitas completadas presencialmente con check-out y cierre clínico oficial en OKVET.
2. **Capacidad del Equipo y Productividad:**
   - Turnos disponibles según programación semanal.
   - Capacidad utilizable neta deduciendo desplazamientos vehiculares y descansos protegidos.
   - Índice de sobrecarga (profesionales que superen el límite seguro de 6 visitas/día).
3. **Continuidad Veterinaria y Compromisos:**
   - Planes de cuidado recurrente activos (CORE-09).
   - Cobertura preventiva y recordatorios de vacunas/desparasitaciones (CORE-10).
   - Remisiones a especialistas y retorno de informes clínicos (CORE-11).
   - Compromisos post-visita cerrados vs vencidos (CORE-12).
   - Documentos privados firmados y entregados (CORE-13).
4. **Finanzas y Rentabilidad Verificada:**
   - Monto total facturado vs Cobrado verificado vs Saldo pendiente por conciliar.
   - Costos directos documentados (insumos médicos consumidos, combustible verificado, honorarios de especialistas).
   - Margen de contribución real. Si los costos indirectos no están configurados, el sistema emite `INSUFFICIENT_DATA` para utilidad neta en vez de inventar ganancias.
5. **Autonomía del Fundador y Dependencia de Luis (`WF-075`):**
   - Tareas reservadas por ley o política médica (firmas COMVEZCOL, devoluciones mayores).
   - Tareas delegables resueltas autónomamente por el equipo.
   - Procesos automatizados exitosamente por n8n y Supabase.
   - Tasa de autonomía y cuellos de botella generados por ausencia de Luis.
6. **Experiencia, Problemas Repetidos y Mejora Continua:**
   - CSAT ponderado y quejas acumuladas vs resueltas.
   - Detección de patrones y clusters temáticos (ej. retrasos en franja vespertina).
   - Propuestas estructuradas de mejora canalizadas hacia CORE-07.

---

## 4. Invariantes de Seguridad y Calidad

- **Invariante Safe Mode:** `send_enabled: false`, `active: false`. En QA no se envían correos, mensajes de WhatsApp ni notificaciones a tutores ni personal.
- **Invariante Clínico:** Cero diagnósticos por IA, cero modificaciones en citas de producción o historias clínicas de OKVET.
- **Axioma Matemático:** No sumar promedios ni porcentajes; calcular tasas globales por numerador y denominador de la semana. Conteos de clientes y pacientes siempre por `COUNT(DISTINCT ...)`.
