# Privacidad, Academy y recorridos — 21 noviembre 2026

## Veredicto
**PARTIALLY_IMPLEMENTED / VERIFIED_WITHIN_SCOPE.** No certifica todas las pantallas, producción, servicios externos ni acreditaciones oficiales. Demos y datos históricos preservados.

## Privacidad y perfiles
- `is_clinical`, `can_refer`, `is_aux_only` aceptan consultas propias o de Dirección autorizada; Cliente/Auxiliar no descubren roles de terceros; llamadas anónimas rechazadas. Verificaciones reales: `privacy-client.json`, `authenticated-admin.json`, `authenticated-aux.json`.
- Cuatro perfiles asignables: Cliente, Administrador, Luis (luis+administrador+veterinario), Auxiliar. Operación indivisible, roles históricos conservados. Solo Luis modifica su perfil; cambios propios y nuevas asignaciones legacy rechazados. Un Administrador asignó un Auxiliar desde Usuarios y se verificó la lectura posterior. Luis-equivalente creó/restauró el perfil combinado de la cuenta QA.
- Administrador no obtiene permiso clínico por el rol ni una etiqueta `staff_members.role`; no muestra modo Veterinario ni permite dosis directas. Luis-equivalente abrió paciente, seleccionó visita y recorrió preparación→desplazamiento→llegada→atención en UI; estado oficial siguió `pendiente`.
- Seguridad aplicada y leída de vuelta: migraciones 0040/0041, funciones y triggers presentes. Cambios autorizados por esta solicitud; no migraciones Academy ni financieras.

## Academy — P11, fuentes originales inspeccionadas
Fuente: `/mnt/user-uploads/VET_FREEDOM_OS_-_PROMPT_11_pasted.md` (en la sesión de trabajo); prohíbe infraestructura/migraciones Academy duplicadas y calificación oficial del navegador.

| Capacidad | Resultado comprobado | Límite |
|---|---|---|
| Catálogo y lector | reutiliza courses/course_lessons; búsqueda, curso y lecciones | no certifica contenido/versiones clínicas vigentes |
| Progreso personal | lectura por user_id/lesson_id, registrada y releída como Administrador y Auxiliar | lectura ≠ competencia; sin avance global +20% real |
| Editor curso/procedimiento/ruta | preparación reservada, vínculos a cursos, propósito/perfil/estructura | no asignación ni publicación oficial |
| Evaluaciones | crear/reordenar/eliminar preguntas, selección/reflexión, preview y preparación guardada | claves no presentes, no score/aprobación oficial |
| Versiones | nueva revisión no sobrescribe anterior | no versión oficial de protocolo vigente |
| Equipo | progreso de lecturas individual para Dirección; cuentas sin vínculo desconocidas | sin competencias inventadas |
| Competencias/onboarding | estados explícitos y rutas preparadas | autoridad práctica/asignación/certificado pendientes |
| Permisos | Auxiliar no ve/prepara borradores de Dirección ni escribe lecciones/lecturas ajenas | no ampliar RLS legacy para simular capacidades |

Pantallas reutilizadas mediante `features/academy/catalog.ts` y resolver previo a legacy; sin editar catálogo generado. Persistencia `records` reservados solo como `DRAFT_ONLY`; esquemas estrictos rechazan claves y campos de autoridad.

## Diseño y recorridos
- Fotografía existente perro/gato con nombre completo y contraste cinematográfico, azul/verde semánticos, menú lateral sobrio, cifras reordenadas para caber en móvil; motion respeta preferencia reducida.
- Cuatro demos destacados; ocho históricos dentro de desplegable, no eliminados. Registro de cliente abre el modo de creación directamente.
- `demo-results.json`: **58** observaciones de 29 destinos en 360×844 y 1366×1091, Cliente/Administrador/Luis/Auxiliar; cero overflow/imagen rota/excepción/pantalla scaffold en el lote.
- `authenticated-admin.json`: **18** observaciones de nueve destinos a ambos tamaños; preparaciones/lectura/perfil guardados y releídos, publicación deshabilitada.
- `authenticated-aux.json`: visita compartida, preparación persistida, lectura personal, aceptación de tarea y mensaje interno enviados y releídos; área Admin rechazada. El primer script recargó antes de finalizar el envío y perdió el mensaje sin confirmar: repetido esperando la confirmación y lectura del contenido antes de recargar, PASS. No se fingió persistencia.
- `authenticated-luis.json`: sesión temporal con permisos equivalentes, paciente/cita y atención real sobre fixture; no se accedió a la cuenta personal de Luis. Cuenta real aún requiere comprobación de su acceso.
- Los clientes fueron probados en privacidad con cuenta real y recorridos visuales demo; reserva/pago/documentos de cliente reales completos **no se reejecutaron** en este lote.

## Soporte
Diagnóstico automático del dispositivo, sesión y lectura **propia**; escucha offline/online y refresca lecturas autorizadas al reconectar. No auto-envía borradores ni cambia roles/pagos/visitas. Proveedores quedan desconocidos. Reparación remota 100% autónoma bloqueada por observabilidad y contratos autorizados; no se declara implementada.

## Evidencia y reproducción
- 526 pruebas Vitest / 37 archivos, incluida separación clínica, progresos aislados, preparación validada y diagnósticos sin falsos positivos.
- 79 checks de sesión/servidor: 16 Cliente/Anónimo + 39 Administrador + 18 Auxiliar + 6 Luis-equivalente. Scripts y JSON en `scripts/privacy-academy/` y `evidence/privacy-academy/`; capturas seleccionadas junto a JSON.
- ESLint dirigido: cero errores, una advertencia histórica por exportar NAV con AppShell. Harness: build OK; no builds/typechecks manuales. `git diff --check` limpio.
- Scripts leen sesiones temporales desde `/tmp/browser/journey-security`; **no se copian sesiones, cookies ni tokens al repositorio**. Recrear cuentas/fixtures autorizados para repetir; no usar cuentas reales de terceros.
- Limpieza solo filas QA identificadas, manteniendo auditoría de pruebas y perfiles históricos. No cambios externos ni envíos WhatsApp/OKVET/pagos.

## Próximo lote bloqueado
Academy: publicación versionada y validación de fuentes clínicas, exámenes protegidos e intentos, asignaciones/recordatorios, evidencia práctica, competencias/certificados, asistente con conocimiento aprobado. Soporte: evidencia de observabilidad/proveedores y contratos seguros de reparación. Cobertura: comandos/detalles restantes de las 515 entradas y originales A–L; etiquetas históricas no certifican totalidad.