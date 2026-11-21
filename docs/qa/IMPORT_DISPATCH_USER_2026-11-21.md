# QA de usuario — importación, despacho y duración

Fecha: 21 de noviembre de 2026, 17:44–17:57 UTC. Chromium contra localhost, sesiones auténticas de un usuario temporal, datos exclusivamente sintéticos identificados `QA-MOBILE-*` / `QA-MOB-DISPATCH-*`. No se usaron ni modificaron cuentas demo, pacientes históricos ni la cuenta de Luis.

## Alcance y evidencia

| ID | Flujo probado | Resultado verificable |
|---|---|---|
| IMP-U01 | Administración: consentimiento, selección y nueve pasos en 360×800 y 1366×1091 | PASSED; permiso previo requerido, mapeo y conflictos visibles, ninguna página desborda horizontalmente |
| IMP-U02 | Nombre >200 caracteres / encabezado >100 / encabezados duplicados | PASSED; error antes de avanzar; límites existentes del contrato, sin ampliar autoridad |
| IMP-U03 | Quitar mapeo obligatorio / referencia repetida, 390×844 | PASSED; preparación y resultado bloqueados hasta corregir errores; coincidencias posibles no se resuelven automáticamente |
| IMP-U04 | Revisar y guardar preparación; actualizar fuentes | PASSED; recibo de servidor, una preparación por solicitud y botón guardado deshabilitado; sin reenvío incompatible tras refrescar `comparedAt` |
| IMP-U05 | Recarga y lectura en centro OKVET | PASSED; archivo/consentimiento descartados, preparación releída desde Cloud; solo metadatos, no CSV ni filas |
| IMP-U06 | Solicitud de importación oficial | PASSED bloqueo; `BACKEND_UNAVAILABLE`, sin aplicar importaciones. Botón de aplicación de la preparación deshabilitado |
| IMP-U07 | Comparar visitas antes/después y observar solicitudes | PASSED; snapshot completo ordenado de visitas idéntico; cero escrituras directas a `/rest/v1/visits` durante el flujo de importación |
| DSP-U01 | Despacho: fecha/profesional y abrir tiempo, móvil | PASSED; filtro excluye la visita sintética del día siguiente; enlace abre la cita seleccionada |
| DSP-U02 | Veterinario sin Administración, vinculado a profesional temporal | PASSED; muestra su itinerario, sin selector global; importador redirige a `/sin-acceso` |
| DSP-U03 | Desplazamiento → llegada → iniciar atención | PASSED; marcas creadas por servidor; temporizador aparece sin recargar, también en segunda pestaña del mismo navegador |
| DSP-U04 | Finalizar atención / recarga | PASSED; `SERVICE_FINISHED`, marcas `IN_SERVICE` y `SERVICE_FINISHED` releídas; reloj detenido (salto de reloj de navegador de 61 s en prueba adicional); duración aplicada/restante siguen desconocidos |
| DSP-U05 | Resumen de visita frente a estado oficial | PASSED; `step=finalizada`, `status=pendiente`, `okvet_ref=null`; ninguna confirmación o cierre oficial implícito |
| DUR-U01 | Introducir 31 min con mínimo 15/incremento 5 | PASSED; error comprensible y guardado deshabilitado; corregir a 30 permite guardar borrador |
| DUR-U02 | Guardar/releer propuesta administrativa | PASSED; propuesta de 30 min releída; publicar configuración deshabilitado y sin cambios de política/citas |
| MOB-U01 | Despacho y tiempo en 360, 390 y 430 px | PASSED; fuentes cargadas, sin desbordamiento ni errores de ejecución; capturas finales sin animaciones |
| DEM-U01 | Selector de demos y entrada Veterinaria | PASSED; doce perfiles, entrada al panel sin login; nada eliminado |

Las pruebas administrativas se hicieron con Administración (y, al probar atención, Veterinario). La comprobación clínica aislada retiró Administración únicamente del usuario temporal; roles obtenidos desde Cloud, no simulados en almacenamiento.

## Errores reproducidos y corregidos

1. Un CSV con nombre de más de 200 caracteres avanzaba hasta guardar y mostraba el error técnico del validador. Se rechaza en selección; también se comprueban encabezados compatibles con el contrato y el esquema completo antes de guardar.
2. Guardar otra vez tras actualizar fuentes reutilizaba el ID inmutable con otro `comparedAt` y devolvía `CONFLICT`. El recibo exitoso bloquea el reenvío de esa preparación; no se muta una preparación existente.
3. El temporizador conservaba la consulta anterior al iniciar atención. Se reutiliza `vf-field-change`/BroadcastChannel para releer visitas/ejecuciones tras una escritura confirmada; mantiene sondeo como respaldo y permisos de cada cuenta.
4. El resumen de campo intentaba pasar una cita pendiente a `en_curso`, rechazado por la autoridad de estados. El paso de compatibilidad ahora guarda solo `step`, conservando el estado oficial; no se relajan reglas de servidor.
5. Una duración inválida deshabilitaba guardar sin explicar por qué. Ahora muestra el error de rango/incremento/motivo. Botones se distribuyen en filas con espacio en móvil.
6. Horas de campo dependían de la zona del navegador. Vista de tiempo y marcas de atención muestran explícitamente Bogotá.

## Automatización

- `bunx vitest run`: **479 pruebas, 30 archivos, todas aprobadas** (17:53 UTC).
- Pruebas dirigidas: 102 en seis archivos antes de la repetición completa. Nuevas regresiones en `dispatch-source-refresh.test.tsx`, `store-confirmation.test.ts` y `permissions-preparation-p13.test.ts`.
- Se corrigió una expectativa histórica en `vf-rules.test.ts`: finalizar el paso de campo no debe finalizar una cita oficial.
- Cero `pageerror` en los flujos de importación/atención. Preview: `build OK`; `git diff --check` limpio.

## Evidencia conservada

En `docs/qa/evidence/import-dispatch/`:
- `import-mobile-saved.png`, `import-desktop-saved.png`: guardado y estado de revisión.
- `import-metadata.png`: preparación releída, aplicación bloqueada.
- `dispatch-360.png`, `dispatch-390.png`, `dispatch-430.png`: fuentes sintéticas cargadas.
- `timer-mobile.png`, `timer-card.png`: temporizador y campos desconocidos, hora Bogotá.
- `duration-proposal.png`, `duration-error.png`: borrador releído y validación.
- `vitest.log`: salida de la ejecución completa.

Se descartaron capturas prematuras tomadas durante la animación de entrada; las imágenes finales se revisaron visualmente. La captura de error se centró para evitar el menú fijo inferior.

## Repetición controlada

Scripts: `docs/qa/scripts/import-dispatch/`. Ejecutarlos con Python/Playwright desde una copia en `/tmp/browser/import-dispatch/`; salidas y capturas quedan en `/tmp`, no contienen sesiones ni credenciales.

1. Crear una cuenta temporal con `lovable auth-session --json --create-test-user` y asignar Administración mediante la herramienta de datos. Nunca elegir cuentas demo ni históricas como fixtures.
2. `check_import.py` y `check_import_edges.py` recorren el importador con CSV sintéticos locales; requieren fuente de visitas accesible y autorización para guardar metadatos de prueba. Una repetición usa una cuenta temporal nueva o nombres de evidencia únicos para evitar ambigüedad con pruebas anteriores.
3. Para `check_veterinarian.py`: vincular al usuario temporal el profesional `QA-MOB-DISPATCH-staff`, mascota `QA-MOB-DISPATCH-pet` y visitas `QA-MOB-DISPATCH-next` (21/11, 16:00), `QA-MOB-DISPATCH-retest` (21/11, 13:00), `QA-MOB-DISPATCH-otherday` (22/11). Visitas pendientes, sin referencia, preparación vacía. Retirar Administración solo de la cuenta temporal y dejar Veterinario. Usar fixtures nuevos antes de repetir transiciones; nunca reabrir una visita real.
4. El script verifica marcas releídas y estado oficial conservado. Las pruebas unitarias se repiten independientemente con `bunx vitest run`.
5. Retirar exclusivamente fixtures identificados del lote; conservar demos e históricos. Los registros de auditoría/eventos append-only derivados de pruebas no se alteran ni se usan como certificación productiva.

Limpieza comprobada mediante lectura de Cloud a las 17:58 UTC: cero preparaciones/propuestas del usuario temporal y cero visitas, profesional o mascota con los IDs del lote. Solo se retiraron ocho borradores y los fixtures exactos; los perfiles demo e históricos no fueron objetivos de ninguna operación.

## Límites

No migraciones ni nueva autoridad, integraciones, ubicación, GPS/ETA, envíos, aplicación oficial, publicación de políticas o confirmación externa. P13/P15A siguen parciales donde requieren autoridad/proveedores. Dos pestañas del mismo navegador no certifican concurrencia entre dispositivos físicos. El adjunto P15C.1 trata alertas/verificación manual de pagos: no se implementó ni certificó en este pedido de QA de importación/despacho.