# Matriz de Trazabilidad de Requisitos — VET FREEDOM OS
**Fecha de consolidación:** 2026-11-20  
**Fuente:** Especificaciones maestras (Partes 1, 2 y 3)  
**Total de Requisitos Auditados:** 224 comportamientos funcionales  

---

## 1. Distribución por Propietario Técnico

| Propietario Técnico | Cantidad | Descripción Arquitectónica |
|---|:---:|---|
| **CORE** (Supabase / Lovable) | **75** | Frontend en Lovable, modelos de datos en Supabase, autenticación, permisos RBAC, catálogo de tarifas, motor relacional y lógica de negocio pura. |
| **HYBRID** (Supabase + n8n) | **83** | Orquestación coordinada: Supabase gestiona la persistencia de estados y tabla outbox; n8n procesa eventos, realiza deduplicación y ejecuta integraciones externas. |
| **EXTERNAL** (n8n) | **42** | Envíos a proveedores externos (Meta WhatsApp Cloud API), crons programados de recordatorios, reportes ejecutivos diarios/semanales, alertas operativas y monitoreo de integraciones. |
| **MANUAL ASSISTED** (Médico / Humano) | **24** | Procesos clínicos o regulatorios indelegables: aprobación de planes terapéuticos, triaje de urgencias, firma de alta médica, aprobación de rutas por el coordinador y visto bueno de escenarios de simulación. |
| **BLOCKED** | **0** | Ningún requisito bloqueado formalmente. Las dependencias con OKVET se gestionan bajo el patrón MANUAL ASSISTED (validación humana). |
| **TOTAL** | **224** | 100% de los requisitos originales identificados y clasificados. |

---

## 2. Cobertura por Especificación Fuente

1. **Parte 1 — Especificación Maestra (`WF-001` a `WF-112`, 112 requisitos):**
   - Dominio A: Atención y WhatsApp (`WF-001..020`): 2 CORE, 15 HYBRID, 3 EXTERNAL.
   - Dominio B: Customer Experience Memory (`WF-021..030`): 8 CORE, 2 HYBRID.
   - Dominio C: Agenda y Citas (`WF-031..042`): 5 CORE, 4 HYBRID, 2 EXTERNAL, 1 MANUAL ASSISTED.
   - Dominio D: Equipo y Personal (`WF-043..052`): 4 CORE, 6 HYBRID.
   - Dominio E: Rutas y Movilidad (`WF-053..064`): 2 CORE, 7 HYBRID, 2 EXTERNAL, 1 MANUAL ASSISTED.
   - Dominio F: Tratamientos e Inventario (`WF-065..076`): 3 CORE, 5 HYBRID, 1 EXTERNAL, 3 MANUAL ASSISTED.
   - Dominio G: Experiencia y Fidelización (`WF-077..086`): 2 CORE, 1 HYBRID, 6 EXTERNAL, 1 MANUAL ASSISTED.
   - Dominio H: Asistente Privada de Luis (`WF-087..096`): 1 CORE, 5 HYBRID, 3 EXTERNAL, 1 MANUAL ASSISTED.
   - Dominio I: OKVET, Seguridad y Mantenimiento (`WF-097..112`): 3 CORE, 6 HYBRID, 4 EXTERNAL, 3 MANUAL ASSISTED.

2. **Parte 2 — Agenda Inteligente y Capacidad (`WF2-001` a `WF2-056`, 56 requisitos):**
   - Conectores Google Calendar OAuth y reconciliación (`WF2-001..008`): 8 HYBRID (`VET-CORE-06`).
   - Disponibilidad operativa, turnos y Quick Booking (`WF2-009..032`): 13 CORE, 7 HYBRID, 7 EXTERNAL, 5 MANUAL ASSISTED.
   - Urgencias, ejecución, cobro y fidelización (`WF2-033..056`): 2 CORE, 10 HYBRID, 6 EXTERNAL, 2 MANUAL ASSISTED.

3. **Parte 3 — Simulador y Especialistas (`WF3-001` a `WF3-056`, 56 requisitos):**
   - Simulador de agenda en sandbox (`WF3-001..020`): 14 CORE, 4 HYBRID, 1 EXTERNAL, 1 MANUAL ASSISTED.
   - Red de especialistas externos (`WF3-021..037`): 4 CORE, 3 HYBRID, 5 EXTERNAL, 5 MANUAL ASSISTED.
   - Continuidad operativa y analítica ejecutiva (`WF3-038..056`): 5 CORE, 1 HYBRID, 11 EXTERNAL, 2 MANUAL ASSISTED.

---

## 3. Archivo Detallado de Trabajo
El inventario granular campo por campo se encuentra en [`REQUIREMENTS-MATRIX.csv`](./REQUIREMENTS-MATRIX.csv), actualizado con:
- `technical_owner_preliminary` → Clasificación confirmada.
- `n8n_module_id_to_verify` → Mapeo al módulo n8n responsable (`VET-CORE-01` a `VET-CORE-21` o `N/A`).
- `implementation_status` → Estado de desarrollo (`DISENADO`).
- `notes` → Justificación técnica de la asignación.
