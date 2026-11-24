# VET FREEDOM OS — CHANGELOG (HISTORIAL OFICIAL DE CAMBIOS)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

Todos los cambios notables en este proyecto serán documentados en este archivo siguiendo los lineamientos de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y versionamiento semántico.

---

## [1.0.0] — 2026-11-20

### Añadido
- **Capa de Persistencia y Seguridad (Supabase PostgreSQL 17):**
  - Implementación de **86 tablas relacionales** cubriendo los Módulos A al V.
  - Habilitación del **100% de Row Level Security (RLS)** (`rowsecurity = true` en las 86 tablas).
  - Políticas de seguridad explícitas para 11 roles del sistema (`app_role_type`).
  - Creación de 3 vistas con `security_invoker = true` (`v_daily_schedule`, `v_patient_360`, `v_n8n_outbox_queue`).
  - Despliegue de 20 migraciones SQL oficiales y auditadas.
  - Generación de definiciones TypeScript completas en [`types/supabase.ts`](file:///c:/Users/Freud/N8NVET/types/supabase.ts) (178 KB).
  - Limpieza total del linter de Supabase: 0 advertencias de seguridad (`rls_enabled_no_policy: 0`, `function_search_path_mutable: 0`, `anon_security_definer_function_executable: 0`).

- **Capa de Automatización e Integración (n8n Cloud):**
  - Creación y despliegue de **22 workflows oficiales** en n8n Cloud bajo la carpeta `Vet Freedom OS` (`ID: EWfSa40jLDxPUOKX`).
  - Validación sintáctica mediante `@n8n/workflow-sdk` y prueba empírica auditable con 49 ejecuciones registradas.
  - Respaldo idéntico del 100% de los workflows en formato JSON estándar en `automation/n8n/workflows/`.
  - Configuración de modo seguro estricto (`send_enabled: false`, `active: false`) para proteger a pacientes reales.

- **Cerebro Operativo Central (VET Operational Intelligence Core):**
  - Servicio de Estado del Negocio (`Business State Service`) mediante la función RPC `get_business_snapshot`.
  - Motor de Reglas y Orquestador de Acciones (`Action Orchestrator`) con función de clasificación de riesgo server-side `evaluate_action_risk`.
  - Motor de Aprobaciones (`Approval Engine`) con funciones transaccionales `request_action_proposal`, `approve_action_proposal` y `execute_approved_action`.
  - Motor de Simulación Avanzada (`Vet Schedule Simulator`) con función RPC `create_schedule_simulation`, garantizando snapshots inmutables sin alterar la agenda real de producción.

- **Asistente Ejecutiva Privada:**
  - Contratos tipados de 38 herramientas de gestión veterinaria en `src/core/tools/contracts.ts`.
  - Directrices del sistema y blindaje contra inyección de prompts en `src/core/assistant/executive-assistant-prompt.ts`.
  - Soporte mobile-first para que el Dr. Luis Eduardo Ríos administre la operación desde su teléfono móvil.

- **Documentación Persistente y Gobernanza:**
  - Creación de los 11 documentos de control técnico y operativo en `docs/`:
    - `IMPLEMENTATION_LEDGER.md`
    - `ARCHITECTURE.md`
    - `FEATURE_INVENTORY.md`
    - `WORKFLOW_REGISTRY.md`
    - `INTEGRATION_REGISTRY.md`
    - `TEST_MATRIX.md`
    - `SECURITY_MODEL.md`
    - `EXTERNAL_DEPENDENCIES.md`
    - `DECISIONS.md`
    - `RUNBOOK.md`
    - `CHANGELOG.md`

### Seguridad
- Prohibición estricta de ejecución de comandos SQL o código arbitrario desde interfaces de IA.
- Cumplimiento de la Ley 1581 de 2012 de Colombia (Habeas Data) con validación obligatoria de consentimiento y opt-out en mensajería.
- Preservación de la autoridad de OKVET como único repositorio legal del expediente clínico veterinario en Colombia.
