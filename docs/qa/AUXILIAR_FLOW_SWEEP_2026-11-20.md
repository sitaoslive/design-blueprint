# Revisión transversal de los fallos del auxiliar

## Regla
El auxiliar debe encontrar los mismos pasos permitidos en cualquier acceso a una visita, sin controles clínicos. Tareas, insumos, progreso y resúmenes de la visita no deben parecer guardados cuando la escritura falla. Una nota pendiente no debe anunciarse como enviada.

## Inventario de lugares revisados ahora
«Código» significa lectura del código actual, no una prueba con una cuenta real. «Navegador demo» no significa que se probó persistencia real en esta revisión.

| Lugar | Evidencia y resultado |
| --- | --- |
| `/equipo/visita/$id`, desde jornada/rutas | Código: tenía botones directos de atención y cierre; sustituido por `VisitExecution`. Navegador demo móvil comprobado en `/equipo/visita/v2`, sin botón clínico para auxiliar |
| `/equipo/visitas/$id` y pestañas preparación/llegada/registro/cierre | Código de `StaffVisit`: flujo antiguo todavía se usaba para otros roles; todos los accesos ahora comparten la ejecución validada. Navegador demo en `/equipo/visitas/v2/registro` |
| `/auxiliar/visitas/$id` y pestañas | Código del resolver auxiliar: ya usaba `VisitExecution`. Navegador demo en preparación |
| Luis: paciente/cita y ejecución integrada | Código leído en la revisión previa y función compartida revisada ahora: conserva selección de actores Dueño/Veterinario y no cambia sus roles. Su cuenta real sigue sin poder comprobarse hasta confirmar el correo |
| `VisitExecution`, casillas, pasos y notas | Código actual: cambios oficiales esperaban fila confirmada; el resumen de cita aún no esperaba su segunda escritura. Ahora espera resultado y avisa si solo se guardó el paso de campo. La nota pasa a «pendiente de enviar», sin anunciar envío prematuro |
| Tareas: `/auxiliar/tareas` | Código actual: ya esperaba resultado y no cambiaba visualmente si fallaba. Navegador demo comprobado |
| Tareas: `/equipo/tareas`, detalle en `ops.tsx`, compromisos en `other.tsx` | Código actual: todos llamaban al mismo `actions.toggleTask` optimista. El cambio compartido ahora espera escritura con fila y valor anterior. Navegador demo en `/equipo/tareas`; pruebas automatizadas de rechazo, cero filas, espera y falta de conexión |
| Insumos: `/auxiliar/insumos`, `/auxiliar/kits` | Código: las rutas dedicadas usan reservas y consumo confirmados. El fallback genérico podía mostrar controles directos; ahora usa el kit autorizado también desde el inventario genérico |
| Insumos: `/equipo/inventario` y catálogo genérico | Código: mostraba sumar/restar a auxiliares aunque Cloud rechazaba el ajuste. Ahora les muestra reservas, sin ajustes. Navegador demo en `/equipo/inventario` y `/auxiliar/insumos` |
| Ajustes: producto administrativo, movimiento/conteo de `c01.tsx`, ajuste manual de `FieldExtras.tsx` | Código leído: todos usan `moveStock`. Ahora la acción no modifica existencias si falla; formularios de campo/conteo esperan su resultado antes de anunciar éxito o crear constancia |
| Academia genérica, lección de equipo, evaluaciones, formación obligatoria y curso administrativo | Código leído: llaman a `progressCourse`. Ahora no aumenta el porcentaje cuando Cloud rechaza la escritura. El modelo sigue siendo por curso, no una matrícula individual: esa brecha funcional anterior no se declara corregida |
| Tratamientos: listado genérico, detalle de equipo y vista administrativa | Código leído: el listado es de lectura; el detalle solo ofrece dosis con rol clínico/director. Sin cambios de permisos ni de tratamientos |
| Incidencias, mensajes, cobros, entregas y cierre de jornada | Código leído en `ops.tsx`, `FieldExtras.tsx` y `FieldPages.tsx`; sus brechas funcionales siguen registradas en la auditoría anterior. No se reabrieron ni cambiaron registros ya enviados/verificados/cerrados |
| Cola offline, reintento, evento `online` y arranque de la vista | Código leído: una única implementación, clave por cuenta, envío con propietario, lectura previa e idempotencia. La confirmación sigue dependiendo de la escritura real, no de guardar el borrador. Sin nuevas pruebas autenticadas de concurrencia en esta revisión |
| Cloud: guardas de visita/ejecución, registros, mensajes, reservas y consumo | SQL leído en migraciones 0017 y 0020; coincide con restricción clínica y alcance del auxiliar. No se modificaron estas funciones, permisos ni configuraciones en esta revisión |
| Trabajos automáticos del alcance | Búsqueda de llamadas a ejecución, reservas y notas: no apareció otro trabajo automático que avance pasos del auxiliar; envío offline usa el mismo flujo anterior. No se probaron integraciones externas |

## Verificación
- 7 accesos alternativos en navegador demo móvil 384 × 681, sin desbordamiento horizontal ni controles clínicos del auxiliar.
- 6 nuevas pruebas de cambios confirmados: escritura rechazada, cero filas, espera de respuesta, stock rechazado, curso rechazado y tarea sin conexión.
- No se alteraron cuentas, datos de ejemplo, registros históricos, permisos ni configuraciones. No se repitieron en esta revisión los flujos autenticados completos de la auditoría anterior.
- **Bloqueo conservado:** el acceso real de Luis después de confirmar sigue pendiente; Cloud lo mostraba aún sin confirmar. No se certifica cumplimiento 100% de todos los prompts.