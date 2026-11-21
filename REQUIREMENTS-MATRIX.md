# Matrices de requisitos
P13 lote B: secciones 25–30 / WF-097..101 ampliadas y probadas como revisión local sin importación oficial; docs/qa/P13_IMPORT_2026-11-21.md.
Continuación P12/P13: evidencia y límites en docs/qa/P12_CONTINUATION_2026-11-21.md; Prompt 13 íntegro y matriz individual en docs/qa/P13_TRACEABILITY.md. No certificar autoridad, integraciones ni lanzamiento.
P12: AI-01..12, AD-01..14, WF-087..096 y 142 casos originales registrados en docs/qa/P12_TRACEABILITY.md. Entrega inicial parcial con fuentes/borradores reales; autoridad y proveedor pendientes. No confundir interfaz con ejecución.
Índice canónico: docs/qa/MASTER_RECONCILIATION_2026-11-21.md; detalle en docs/qa/P08_TRACEABILITY.md, P09_TRACEABILITY.md y P10_TRACEABILITY.md. Pantalla creada no implica autoridad verificada. Requisitos históricos sin fuente completa permanecen no certificados.

| Lote | Requisito | Estado | Evidencia |
|---|---|---|---|
| P12 continuación | Contexto privado, filtros, borrador desde chat y exportación | Implementado/probado en alcance de reglas | P12_CONTINUATION_2026-11-21.md |
| P12 autoridad | Aprobación, ejecución, memoria oficial, delegación, ausencia e IA/voz | Bloqueado por contratos/proveedor | P12_TRACEABILITY.md |
| P13 inicial | Centro de control, dependencias, salud desconocida y gates bloqueados | Lectura/presentación; no autoridad oficial | P13_TRACEABILITY.md |
| P13 B | CSV, mapeo/validación, duplicados/conflictos y calidad de visitas | Implementado/probado como lectura y preview; autoridad pendiente | P13_IMPORT_2026-11-21.md / system-import-p13.test.ts |
| P09 A | Listas/detalles de tarifas y proveedores reutilizando propuestas | Implementado; no aprobación transaccional | docs/qa/P09_LOT_A_2026-11-21.md |
| P09 A | Periodos Bogotá, filtros y exportación coherente | Implementado y probado | finance-lot-a.test.ts / QA del lote |
| P09 A | Reportado/verificado/conciliado separados, detalle de cargo, errores | Implementado; conciliación no disponible explícita | QA del lote |
| P09 B/C | Precio oficial, conciliación, facturación, recepción protegida | Bloqueado: contratos/proveedor/política | docs/NEXT_STEP_INTERNAL_FINANCE.md |