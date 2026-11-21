# Fichas, citas, incidencias y botones por perfil — 2026-11-21

Perfiles demo (móvil 390×844): Administración, Coordinación, Cliente, Veterinaria, Luis, Auxiliar. Desde cada pantalla registrada se recogieron los enlaces a fichas concretas (mascotas, citas, incidencias, remisiones, pagos, tratamientos…), se abrió cada una y se pulsaron hasta 12 botones visibles (sin borrar, salir ni exportar).

## Primera pasada
156 fichas, 215 botones pulsados, sin errores de ejecución. 14 enlaces llevaban a fichas inexistentes: las listas de submódulos enlazaban a direcciones con «:id» o «demo» en lugar de un registro real (p. ej. `/admin/quejas/:id`, `/app/agenda/demo`) y mostraban «no encontrada».

## Corregido
Las listas de pantallas ya no enlazan a una ficha sin registro: muestran «Se abre desde un registro concreto (ficha, cita o caso)». Las fichas se abren desde la lista real de mascotas, citas o casos.

## Segunda pasada (Administración y Cliente)
30 fichas reales, 36 botones, 0 avisos de «no encontrada» y 0 errores.

Límites: datos demo (no se guarda nada); no se comprueba el resultado de negocio de cada botón.
