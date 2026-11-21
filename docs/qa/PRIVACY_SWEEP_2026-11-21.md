# Barrido de privacidad del servidor y recorridos por rol — 2026-11-21

Veredicto: VERIFIED_WITHIN_SCOPE. Datos demo no modificados; filas QA eliminadas.

## Método
- Cuenta temporal real (sin mascotas ni citas) consultando las 55 tablas públicas como Cliente, Especialista, Auxiliar sin vínculo y Administrador (`scripts/privacy-sweep/table_sweep.py`).
- 31 intentos de escritura/consulta no autorizados como Cliente (`scripts/privacy-sweep/write_probe.py`).
- Recorrido de 53 enlaces de menú en demos Cliente/Administración/Luis/Auxiliar (`scripts/privacy-sweep/crawl_roles.py`).

## Brechas encontradas y corregidas
| # | Brecha | Corrección (migración) | Verificación real |
|---|--------|------------------------|-------------------|
| 1 | Cualquier cuenta podía crear «informes de especialista» que el equipo lee | 0042: requiere rol clínico, o especialista y remisión asignada (o sin remisión) | Cliente 403; especialista 201 sin remisión; especialista con remisión ajena 403 |
| 2 | Cualquier cuenta podía publicar horarios de especialista | 0042: requiere especialista o equipo | Cliente 403; especialista 201 |
| 3 | `offer_is_live` permitía sondear remisiones ajenas | 0042: solo dueño o equipo | Cliente false |
| 4 | Tres funciones internas de pasos de campo invocables | 0042: EXECUTE revocado (siguen funcionando como disparadores) | No invocables por API |
| 5 | Auxiliar leía aprobaciones con cobros/montos de familias | 0043: lectura solo equipo no auxiliar | Auxiliar 0 filas; Administrador 4 |
| 6 | Auxiliar leía y cambiaba todas las incidencias | 0043: `created_by`; auxiliar ve/actualiza propias o asignadas y puede reportar | Auxiliar reporta (201), ve 1 propia, no actualiza ajenas; Administrador 3 |

## Sin hallazgos
- Cliente nuevo: 0 filas en 53 tablas (solo su perfil y su rol).
- Escrituras rechazadas: roles propios, mascotas/visitas/cuidadores ajenos, notificaciones, registros reservados, pagos verificados, memoria ajena, mensajes internos, auditoría, conocimiento, conversaciones, simulaciones, perfiles/flags/configuración ajenos.
- RPC de jornada, cobros de campo, insumos, tareas y perfiles rechazan al cliente.
- 53 pantallas de menú: sin errores de ejecución, pantallas de estructura ni redirecciones a login.

## Pruebas automáticas
`src/test/privacy-sweep.test.ts` (6) falla si una migración posterior relaja estas reglas.

## Límites
Auxiliar vinculado a visitas reales, Luis real (correo sin confirmar) y concurrencia multidispositivo no repetidos en este barrido.
