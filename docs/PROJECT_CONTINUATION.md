# Continuación
1. Activar Lovable Cloud y migrar `src/lib/vf/data.ts` a tablas (estructura ya tipada).
2. Login por rol y permisos según `src/lib/vf/roles.ts`.
3. Conectar OKVET y WhatsApp cuando existan credenciales.
4. Implementar workflows n8n por dominio (A–I) del Prompt Maestro.

## 2026-11-20
- Portales: auxiliar, recepción, finanzas, soporte, consultor.
- Simulador SIM-01..10 con estados SIMULADO/PROPUESTO/APROBADO/EJECUTADO.
- Biblioteca de componentes compartidos (spec 16).

## Prompt 06 — Field Operations (estado)
Hecho: máquina de ejecución de visita (/equipo/visitas/:id/ejecucion), cierre de jornada con pendientes críticos y entrega aceptada (/equipo/cierre-jornada, /equipo/traspasos), cierre de turno de coordinación (/operaciones/cierre-turno), monitor de carga (/operaciones/bienestar), kit e insumos (/equipo/kit), aviso sin conexión. Dominio + 17 pruebas.
Pendiente: reserva/descuento atómico de inventario en servidor, cola offline persistente, trigger de servidor para estados de ejecución, cobros administrativos en campo, comunicación interna, dashboard de Luis con estos indicadores, pruebas E2E.
Actualización: validación en servidor de pasos (visit_executions), reservas atómicas de insumos, cola sin conexión (/equipo/pendientes-envio), cobros informados (/equipo/cobros → /finanzas/cobros-campo), mensajes (/equipo/mensajes) y panel /luis/campo. Pendiente: pruebas E2E con cuentas reales, comunicación en tiempo real.

## Prompt 07 (lote 1)
Vigencia del escenario (foto al guardar), comparador por 5 perfiles, restricciones duras, clientes afectados, plan de ejecución bloqueado si STALE. Pendiente: wizard paso a paso, SIM-03..10 avanzados, auditoría detallada, conciliación persistente.
## Prompt 08 (lote 1)
Máquina de 22 estados de remisión, ofertas de horario con vencimiento, elección del cliente, confirmación externa con evidencia, remisiones estancadas. Pendiente: directorio/verificación profesional, presupuestos, documentos y aprobación profesional, especialistas de respaldo, simulador de cobertura, portal del especialista ampliado, dashboards. Sin trigger de servidor (Prompt 08 prohíbe migraciones).
## Prompt 07 (lote 2)
Wizard de 6 pasos en /operaciones/simulador/nueva y escenarios avanzados ADV-01..10 (`src/lib/vf/simAdvanced.ts`) según §7–16; los SIM-01..10 originales siguen para escenarios guardados. Pendiente: respaldos verificados (ADV-05 sin datos), coordenadas reales (ADV-06 estimación), reglas de flexibilidad (ADV-02).
