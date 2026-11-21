# Auxiliar con visita real asignada — 2026-11-21

Cuenta temporal Auxiliar vinculada a un miembro temporal del equipo con una visita real (`qa-v1`, Bruno · Vacunación). Móvil 390×844. Datos temporales borrados al final; datos demo intactos.

## Pantallas (navegador)
| Pantalla | Resultado |
|---|---|
| Inicio | 1 visita asignada, próxima 17:00 |
| Asignaciones / Preparación | solo su visita |
| Visita propia | estado, alergias, Waze/Maps, pasos |
| Visita ajena (v7) | «Visita no encontrada» |
| Tareas, Mensajes, Insumos, Incidencias, Cierre de jornada | cargan, sin errores ni desbordes |

## Pasos de la visita (navegador)
Iniciar preparación → Preparación lista → Iniciar desplazamiento → Registrar llegada: todos aceptados por el servidor; la cita sigue «confirmada». Tras la llegada, el auxiliar no ve «Iniciar atención» (lo hace el veterinario).

## Servidor (API con la sesión del auxiliar)
| Intento | Resultado |
|---|---|
| Saltar a «en atención» | 400 «Solo un veterinario puede realizar este paso» |
| Ver visitas | solo `qa-v1` |
| Registrar pasos en visita ajena | 403 |
| Cambiar cita ajena | 0 filas |
| Cerrar su propia cita | 400 «Un auxiliar no puede confirmar ni cerrar una cita» |
| Incidencia propia | 201 |
| Mensaje sobre su visita / visita ajena | 201 / 400 «Sin acceso a esa visita» |
| Pagos | 0 filas |
| Apartar insumo para su visita, repetido | mismo apartado (sin duplicar) |
| Apartar insumo para visita ajena | 400 |

## Corregido
1. El historial de pasos salía desordenado (Llegada antes que Asignada): ahora en orden cronológico.
2. Tras la llegada no se explicaba por qué no había más pasos: ahora indica que el veterinario inicia la atención y que puede reportar una incidencia.

No probado: visita compartida con veterinario real en dos dispositivos a la vez.
Scripts: `docs/qa/scripts/aux-real/` (requieren crear antes la cuenta, el miembro y la visita temporales).
