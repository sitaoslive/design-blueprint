# Matriz de permisos (RLS)
Funciones: is_staff (vet, aux, coord, recepción, finanzas, admin, luis) · is_ops (coord, recepción, admin, luis) · is_director (admin, luis) · is_clinical (vet, admin, luis).
Soporte y Alpha Vision (consultor) NO son staff: soporte solo lee incidencias, integraciones y auditoría; consultor solo `consultant_metrics()` agregado.

| Tabla | Leer | Escribir |
|---|---|---|
| pets | staff, dueño, cuidador autorizado | staff, dueño |
| visits | staff (auxiliar: solo asignadas), dueño, cuidador | staff; cliente solo crea pendiente sin profesional |
| service_requests | ops, creador | ops; cliente crea propias |
| client_settings | dueño, ops | solo dueño |
| payments | finanzas, dirección, coordinación, cliente propio | finanzas/dirección; veterinario solo informa (pendiente); cliente NO puede marcar pagado |
| records (client) | dueño, staff | dueño crea; ops crea para el dueño; staff cambia estado |
| records (staff) | staff | staff |
| records (director) | dirección | dirección |
| treatments | staff | clínicos |
| referrals | staff, dueño, especialista asignado | can_refer; especialista actualiza las suyas |
| user_roles | propio, dirección | dirección (no puede quitarse a sí misma) |
| simulations | ops | ops; ejecutar solo tras aprobación de dirección (trigger) |

## Revisión 2026-11-20 (corregido)
1. Ajustes/direcciones de clientes eran legibles y borrables por cualquier staff → solo dueño y ops leen; solo dueño escribe.
2. Solicitudes (teléfonos, mensajes) visibles a finanzas/auxiliares → solo ops.
3. Un cliente podía marcar su cobro como pagado → ahora informa el pago y Finanzas verifica.
