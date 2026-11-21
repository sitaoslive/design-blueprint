# Ubicación en vivo, avisos para Luis y visita compartida — 2026-11-21

Cuentas temporales reales (Auxiliar, Luis/Administración/Veterinario, Cliente), móvil 390×844, dos y tres dispositivos a la vez. Datos temporales borrados al final; datos demo intactos.

## Ubicación en vivo («tipo Uber»)
- El auxiliar o veterinario ve «Compartir mi ubicación» solo cuando va en camino; se comparte al pulsar y se apaga sola al registrar la llegada (o con «Dejar de compartir»).
- Coordinación, Recepción, Administración y Luis la ven en el mapa de Despacho; el cliente solo la ve para la visita de su propia mascota.
- Posiciones con más de 15 minutos se ocultan (prueba `src/test/live-location.test.ts`).

| Prueba | Resultado |
|---|---|
| Auxiliar en camino comparte | «Dejar de compartir» visible |
| Luis abre Despacho | 1 marcador «QM», «QA Auxiliar Mapa en camino a Bruno» |
| Auxiliar registra llegada | 0 marcadores; registro de ubicación borrado |
| Cliente: inicio | aviso «El equipo va en camino a tu casa» |
| Cliente: Ver en el mapa | `/app/visitas/…/seguimiento`, 1 marcador |

## Solicitudes para Luis
Cada solicitud nueva crea un aviso para Luis y Administración. Notificaciones muestra arriba «Solicitudes nuevas» con botón para atenderlas; la campana muestra el número y el inicio de Luis un aviso destacado. Probado: solicitud creada → «7 solicitudes nuevas» en inicio y en notificaciones, incluida la nueva.

## Visita compartida veterinario + auxiliar (dos teléfonos)
| Paso (a la vez) | Auxiliar | Veterinario |
|---|---|---|
| Iniciar preparación | Mi apoyo: Preparando | En preparación |
| Marcar «Termómetro» cada uno | Preparación lista disponible | sin conflicto |
| Preparación lista / salir | En camino + ubicación compartida | En camino |
| Mapa de Luis | 1 marcador | — |
| Llegada | Llegada | Llegada → Iniciar atención → En atención |
Sin errores de ejecución; el avance del auxiliar no altera el del veterinario.
