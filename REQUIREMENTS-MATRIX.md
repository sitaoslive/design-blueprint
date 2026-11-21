# Matrices de requisitos
P12: AI-01..12, AD-01..14, WF-087..096 y 142 casos originales registrados en docs/qa/P12_TRACEABILITY.md. Entrega inicial parcial con fuentes/borradores reales; autoridad y proveedor pendientes. No confundir interfaz con ejecución.
Índice canónico: docs/qa/MASTER_RECONCILIATION_2026-11-21.md; detalle en docs/qa/P08_TRACEABILITY.md, P09_TRACEABILITY.md y P10_TRACEABILITY.md. Pantalla creada no implica autoridad verificada. Requisitos históricos sin fuente completa permanecen no certificados.

| Lote | Requisito | Estado | Evidencia |
|---|---|---|---|
| P09 A | Listas/detalles de tarifas y proveedores reutilizando propuestas | Implementado; no aprobación transaccional | docs/qa/P09_LOT_A_2026-11-21.md |
| P09 A | Periodos Bogotá, filtros y exportación coherente | Implementado y probado | finance-lot-a.test.ts / QA del lote |
| P09 A | Reportado/verificado/conciliado separados, detalle de cargo, errores | Implementado; conciliación no disponible explícita | QA del lote |
| P09 B/C | Precio oficial, conciliación, facturación, recepción protegida | Bloqueado: contratos/proveedor/política | docs/NEXT_STEP_INTERNAL_FINANCE.md |