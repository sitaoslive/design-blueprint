# Recorrido completo por perfil — 2026-11-21

Las 404 direcciones del registro de pantallas (sin parámetros) se abrieron en móvil (390×844) con el perfil demo correspondiente:
Administración (admin), Coordinación (operaciones), Cliente (app, cliente), Veterinaria (equipo), Luis (direccion, luis), Auxiliar, Recepción, Especialista, Finanzas, Soporte, Cuidador, Consultor y páginas públicas/acceso.

Se revisó en cada una: errores de ejecución, textos de fallo («Algo salió mal», «undefined», «NaN», «no encontrada», «Estructura creada»), desborde horizontal y expulsión a inicio de sesión.

## Resultado
- 404/404 cargaron sin errores de ejecución ni desborde horizontal; ningún perfil fue expulsado de su área.
- Avisos esperados (no son fallos): páginas públicas de acceso (`/auth/*`, `/sin-acceso`), `/error` («Algo salió mal») y `/no-encontrado`.
- **Fallo corregido:** `/equipo/incidencias/nueva` mostraba «Incidencia no encontrada» porque «nueva» se leía como el código de una incidencia. Ahora abre la lista de incidencias con «Registrar».

## Límites
Recorrido con datos demo: comprueba que cada pantalla abre y se ve bien, no cada acción. Pantallas con código en la dirección (`:id`) no incluidas salvo las ya probadas en otros informes. Resultados por ruta: `evidence/full-crawl/`.
