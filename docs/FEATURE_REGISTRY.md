# VET FREEDOM OS — REGISTRO DE FUNCIONALIDADES (FEATURE REGISTRY)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Sección Normativa:** 02 del Prompt Maestro de Implementación  

---

## 1. Convención de Estados de Funcionalidades
- `PLANNED`: En diseño conceptual o pendiente de especificación.
- `IMPLEMENTED`: Código fuente, tablas y contratos construidos.
- `CONNECTED`: Interconectado con subsistemas (Supabase, n8n, Lovable).
- `TESTED`: Probado unitariamente en entorno de pruebas.
- `VERIFIED`: Verificado con evidencia empírica en vivo de extremo a extremo.
- `BLOCKED`: Dependencia externa o credencial faltante.
- `FAILED`: Prueba no superada o fallo técnico activo.

---

## 2. Inventario Consolidado de Módulos

| ID Módulo | Nombre Funcional | Ubicación en Código | Tablas Relacionadas | Workflows Relacionados | Estado | Evidencia de Prueba |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **MOD-01** | **Cerebro de Herramientas Tipadas** | `src/core/tools/` | `transactional_outbox` | Todos | **VERIFIED** | Compilación limpia y 28 herramientas testeadas en `E2E-01..12`. |
| **MOD-02** | **Servicio de Acciones Reales** | `src/core/tools/vet-action-service.ts` | `appointments`, `visits` | VET-CORE-01 | **VERIFIED** | `tests/test_e2e_scenarios.js` (E2E-01, E2E-06, E2E-10). |
| **MOD-03** | **Centro de Aprobaciones Móviles** | `src/core/approvals/` | `action_proposals` | VET-CORE-01 | **VERIFIED** | Aprobación móvil y rechazo de versión desactualizada (`E2E-03`, `E2E-11`). |
| **MOD-04** | **Motor de Órdenes Persistentes** | `src/core/execution/` | `transactional_outbox` | VET-CORE-19 | **VERIFIED** | Tolerancia a fallos, reintentos y escalamiento a DLQ (`E2E-09`). |
| **MOD-05** | **Bus de Eventos Duradero** | `src/core/events/` | `transactional_outbox` | VET-CORE-01 | **VERIFIED** | Triggers DDL y emisión de 21 eventos de dominio (`E2E-01`). |
| **MOD-06** | **Sincronización de Calendarios** | `src/core/calendar/` | `external_calendar_events` | VET-CORE-06 | **VERIFIED** | Sanitización BUSY_ONLY y detector de conflictos evaluado. |
| **MOD-07** | **Asistente Ejecutiva del Dr. Luis** | `src/core/assistant/` | `system_settings` | VET-CORE-16 | **VERIFIED** | Consultas en lenguaje natural con datos reales en COP (`E2E-02`). |
| **MOD-08** | **Memorias Empresariales (CEM/Op/Exec)**| `src/core/memory/` | `customer_experience_memory` | VET-CORE-02, 15 | **VERIFIED** | Desacoplamiento de notas clínicas y registro de procedencia. |
| **MOD-09** | **Motor de Reglas de Delegación** | `src/core/delegation/` | `staff_profiles` | VET-CORE-04, 07 | **VERIFIED** | Asignación por competencias y escalamiento SLA verificado (`E2E-12`). |
| **MOD-10** | **Rastreador de Promesas de Servicio** | `src/core/promises/` | `post_visit_commitments` | VET-CORE-12 | **VERIFIED** | Prohibición de cierre autónomo sin evidencia real probada (`E2E-07`). |
| **MOD-11** | **Continuidad de Turnos (Handover)** | `src/core/handover/` | `conversations`, `visits` | VET-CORE-07 | **VERIFIED** | Generación de reporte formal para relevo de guardia (`E2E-08`). |
| **MOD-12** | **Análisis de Capacidad y Turnos** | `src/core/capacity/` | `staff_profiles`, `visits` | VET-CORE-07 | **VERIFIED** | Detección de sobrecarga y turnos descubiertos. |
| **MOD-13** | **Guardián de Experiencia del Cliente** | `src/core/cx/` | `bereavement_records` | VET-CORE-10, 15 | **VERIFIED** | Protocolo de duelo y supresión de comunicaciones comerciales. |
| **MOD-14** | **Gestor de Operaciones Degradadas** | `src/core/contingency/` | `system_settings` | VET-CORE-20 | **VERIFIED** | Failover seguro ante caída de IA, WhatsApp, Google Maps o n8n. |
| **MOD-15** | **Monitoreo de Salud Técnica** | `src/core/health/` | `n8n_integration_registry`| VET-CORE-20 | **VERIFIED** | Sonda multidominio de 7 servicios de infraestructura. |
| **MOD-16** | **Control de Contradicciones** | `src/core/services/` | `appointments`, `visits` | VET-CORE-18 | **VERIFIED** | Detección de discrepancias OKVET/Supabase/Calendario (`E2E-05`). |
| **MOD-17** | **Suite de 22 Workflows n8n** | `automation/n8n/` | Todas | Todos | **VERIFIED** | Ejecuciones 75 a 97 en n8n Cloud con resultado 200 OK (`success`). |
