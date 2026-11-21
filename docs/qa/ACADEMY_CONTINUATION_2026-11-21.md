# Privacidad y Academy — continuación, 21 noviembre 2026

## Resultado y límites
**VERIFIED_WITHIN_SCOPE / ACADEMY_PARTIAL.** Sin nuevas migraciones, proveedores, publicación, asignación oficial, notas, credenciales ni cambios clínicos. No se certifican las 515 entradas. Demos y cuenta real de Luis intactos.

## Tres consultas privadas
Las correcciones ya estaban aplicadas en 0040; se inspeccionaron sus definiciones y permisos en la base real, sin duplicarlas. `is_clinical`, `is_aux_only` y `can_refer` permiten consultas propias, Dirección autorizada o servicio; no ejecución anónima/PUBLIC.

Nueva prueba reproducible `scripts/privacy-academy/check_role_disclosure.py`: **45 assertions reales**, 15 por perfil Cliente/Administrador/Auxiliar. Por cada función prueba objetivo real positivo, cuenta propia, UUID inexistente, llamada anónima y objetivo nulo. Administrador consulta los objetivos positivos (true); Cliente/Auxiliar reciben false para esos mismos terceros. Auxiliar propio es true para `is_aux_only`; Administrador propio es true para `can_refer`. Estos controles impiden que una función siempre-false pase la prueba.

## Academy implementado en este lote
| Capacidad | Comprobación | Límite |
|---|---|---|
| Incorporación/ruta ordenada | Reordenar dos cursos, persona vinculada, fecha propuesta, guardar y releer tras recarga | Metadatos reservados; no asigna ni notifica al empleado |
| Progreso de equipo | Denominador filtrado por roles verificados del miembro; no suma lecturas ajenas | Lectura no acredita competencia |
| Paso anterior pendiente | Evaluación pura con orden y casos de curso ausente/vacío/incompatible | Indicativo de plan; no autorización oficial |
| Revisiones trazables | v2 enlaza padre v1, conserva ambos; servidor rechaza salto a v4 con motivo específico | Versiones de preparación, no protocolo vigente |
| Personas previstas | Servidor rechaza UUID sin miembro vinculado con motivo específico | No asignación oficial ni permisos nuevos |
| Evaluaciones | Crear/releer preparación; selección única y reflexión; revisar 2/2 respuestas, reiniciar, recargar | Ensayo local sin claves, score, aprobación ni historial de intentos |
| Procedimiento | Guardar y releer borrador; publicación deshabilitada | No aprobación ni publicación clínica |
| Auxiliar | Lectura propia persistida; volver al catálogo; API sin equipo/borradores reservados; escritura rechazada por handler | No cambios de roles/competencias |

Correcciones: el panel de equipo utilizaba todas las lecciones como pendientes para cada persona; ahora usa únicamente audiencia correspondiente a sus roles de cuenta. Revisiones antes copiaban un número sin enlace verificable; ahora el servidor valida padre, tipo y secuencia. La previsualización de reflexión carecía de respuesta editable; ahora permite ensayo local y reinicio explícito.

## Cobertura de usuario nueva
- Cuenta temporal confirmada, cambiada secuencialmente a Cliente, Administrador y Auxiliar. **No** se usaron cuentas personales de terceros ni un modo demo para verificar persistencia. No representa aislamiento concurrente entre tres sesiones diferentes; sí tres permisos distintos aplicados en servidor.
- **37 assertions Administración** (incluyen 22 observaciones de 11 rutas a 360×844 y 1366×1091) y **9 Auxiliar**. Cero errores de ejecución/desbordamientos en las rutas comprobadas.
- Rutas: `/admin/academia/{rutas,evaluaciones,procedimientos,empleados,competencias,onboarding,versiones,lecciones}`, `/admin/citas/{reglas-retrasos,notificaciones}`, `/admin/operaciones/mapa-en-vivo`.
- Las últimas tres rutas solo se comprobaron como lectura/navegación autorizada: no GPS, ETA, avisos o políticas oficiales. Competencias y lecciones vacías tampoco se certifican como comandos completos.
- Cliente en este lote: solo privacidad real. No se reejecutaron reserva/pago/documentos de clientes, atención de Luis ni todos los demás recorridos.
- Tres assertions adicionales de demo Auxiliar: entra sin login, conserva curso para Todos y no muestra el curso exclusivo de Veterinario. Se aplicó el mismo filtro de audiencia en demo y lectura real; no se eliminó ningún perfil.
- Una primera prueba de Auxiliar no encontró lecciones disponibles: se añadió un curso/lección explícitamente sintéticos y se repitió lectura/persistencia; no se inventó contenido aprobado. Fixtures retirados al finalizar.

## Evidencia reproducible
Carpeta `evidence/academy-continuation/`: `privacy-client.json`, `privacy-admin.json`, `privacy-auxiliary.json`, `admin-results.json`, `auxiliary-results.json`, `demo-academy.json`, capturas de plan/ensayo/lección móvil. Limpieza releída en base real: cero preparaciones/lecciones/cursos/lecturas del fixture permanecen.

Scripts `scripts/privacy-academy/check_academy_continuation.py` y `check_auxiliary_academy.py`: reciben `ACADEMY_QA_SESSION_FILE` apuntando a una sesión temporal fuera del repositorio y `ACADEMY_QA_OUTPUT` (por defecto `/tmp/browser/academy-continuation`). Requieren un usuario temporal con perfil correspondiente, dos cursos autorizados, un miembro vinculado para el plan y una lección sintética para Auxiliar. El script de Administración crea borradores QA; retirar solo sus IDs/autor al concluir, nunca demos. Los JSON de resultados contienen assertions, no sesiones, tokens ni cookies.

Permisos:
```text
python3 docs/qa/scripts/privacy-academy/check_role_disclosure.py --session <archivo-temporal> --profile <cliente|administrador|auxiliar> --clinical-target <id-clínico-autorizado> --auxiliary-target <id-auxiliar-autorizado> --output /tmp/browser/permissions.json
```
Regresión: `bunx vitest run` → **533 pruebas / 37 archivos**, Academy **20 pruebas** (7 nuevas). ESLint dirigido sin errores; preview **build OK**. No builds/typechecks manuales.

## Matriz y siguiente dependencia
`P11_CASE_COVERAGE.json` conserva **116 casos originales** de secciones 55–62, con estado individual y evidencia. Los ensayos/preparaciones se marcan parciales, nunca como exámenes/asignaciones oficiales.

Faltan publicación/revisión clínica versionada, materiales privados/video, calificación e intentos protegidos, asignaciones oficiales, evidencia práctica, certificados, tutor con fuentes aprobadas y aceptación en los demás tamaños/perfiles. Requieren contratos/autorizaciones Antigravity y material/políticas aprobados; Prompt 11 prohíbe nueva infraestructura o migraciones Academy. No habilitados en este lote.