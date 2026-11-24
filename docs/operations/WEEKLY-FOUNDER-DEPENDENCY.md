# Protocolo de Gestión de la Dependencia del Fundador (WF-075)

**Módulo:** `VET-CORE-17 | WEEKLY REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Entorno:** DEVELOPMENT / QA  
**Fecha:** 2026-11-21  

---

## 1. Detección y Medición de Cuellos de Botella de Luis

Para que Vet Life opere con autonomía y libertad, el sistema audita semanalmente los puntos de contacto donde los procesos se detuvieron a la espera de la intervención del Dr. Luis.

```mermaid
flowchart TD
    subgraph Detection ["Detección Automática de Bloqueos"]
        T1[Cita sin confirmar > 2 horas por falta de excepción de zona]
        T2[Descuento comercial pendiente de visto bueno]
        T3[Documento no médico retenido en bandeja]
    end

    subgraph Analysis ["Análisis de Causa Raíz"]
        CAT{¿Es una tarea legalmente reservada por COMVEZCOL?}
        OK_RES[Tarea Reservada por Ley: NO penaliza autonomía]
        DEL_BOT[Cuello de Botella Evitable: Penaliza autonomía]
    end

    subgraph Remedy ["Acciones de Desacoplamiento (Alpha Vision)"]
        POL[Creación de Regla de Negocio / Política Clara]
        PERM[Ampliación de Permiso en RBAC hacia Coordinación]
        AUTO[Automatización en n8n con Guardrails Estrictos]
    end

    T1 & T2 & T3 --> CAT
    CAT -- Sí --> OK_RES
    CAT -- No --> DEL_BOT
    DEL_BOT --> POL
    DEL_BOT --> PERM
    DEL_BOT --> AUTO
```

---

## 2. Plan de Acción Ante Dependencia Elevada

Si en una semana la Tasa de Autonomía cae por debajo del umbral mínimo del **80%**:
1. **Alerta Ejecutiva:** El WBR incluye un recuadro de advertencia rojo: `FOUNDER_BOTTLENECK_ALERT`.
2. **Desglose de Tareas Bloqueadas:** Se genera un listado en `executive_weekly_action_plans` detallando:
   - Tipo de decisión requerida.
   - Tiempo promedio que estuvo detenida la operación.
   - Impacto económico o en satisfacción del tutor.
3. **Propuesta de Delegación Estructurada:** El sistema sugiere una delegación formal hacia el Coordinador Operativo o la activación de una regla automática en Supabase (ej. *"Permitir reagendamientos sin costo si la cancelación se hizo con más de 4 horas de antelación sin consultar al Dr. Luis"*).
