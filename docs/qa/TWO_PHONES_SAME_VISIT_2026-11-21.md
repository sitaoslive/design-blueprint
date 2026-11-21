# Misma visita en dos teléfonos — 2026-11-21

Cuenta temporal Auxiliar abierta a la vez en dos teléfonos (A y B, 390×844) sobre la misma visita real asignada. Datos temporales borrados al final.

## Antes de corregir
| Paso | Resultado |
|---|---|
| Ambos pulsan «Iniciar preparación» a la vez | B avanza; A mostraba el error técnico «duplicate key value violates unique constraint…» y se quedaba en «Asignada» |
| Casillas de preparación | se guardaba la lista completa del teléfono: una casilla marcada en uno podía borrar la del otro |

## Corregido
- El primer paso tolera que el otro teléfono ya haya creado el registro; si el estado ya cambió, avisa «Otra persona ya registró «…». Ya ves lo último.» y recarga.
- Los choques muestran «Otra persona actualizó la visita al mismo tiempo. Ya ves lo último.» en vez del error técnico.
- Cada casilla se guarda sobre la lista actual del servidor y solo si nadie la cambió entretanto (reintenta hasta 3 veces).

## Después de corregir
| Paso | A | B |
|---|---|---|
| Ambos «Iniciar preparación» | En preparación | aviso de choque, muestra En preparación |
| A marca «Vacuna» y B «Jeringa» a la vez | tras recargar: ambas marcadas | — |
| A «Preparación lista»; B pulsa lo mismo sin recargar | Lista para salir | aviso «Otra persona ya registró «Lista para salir»», muestra lo último |

El servidor sigue rechazando versiones viejas en los cambios de paso (sin cambios en el servidor).

## Revisión del resto de la app (misma regla: un cambio simultáneo nunca se pierde ni se da por guardado, y se muestra lo último)
- Pasos y casillas de la visita: corregido (arriba).
- Apoyo del auxiliar, kits, entregas y demás guardados de campo: ya rechazaban versiones viejas; ahora muestran «Otra persona actualizó este registro…» y recargan en vez de pedir recargar.
- Remisiones: ya rechazaban versiones viejas; el aviso técnico de duplicado ahora es claro.
- Conversaciones: **fallo** — si otra persona cambió la conversación, salía «guardado» y se registraba el evento sin haber guardado nada. Ahora avisa y recarga.
- Tareas, insumos y cursos: confirman la fila guardada antes de cambiar la pantalla (regla existente, leída en código, no probada aquí).
