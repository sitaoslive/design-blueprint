# Implementation Ledger — Vet Freedom OS (Entrega 1: frontend + demo)

| Área | Pantallas | Estado |
|---|---|---|
| Selector de perfiles | `/` (11 roles) | Hecho |
| Luis (EXEC) | Inicio, Agenda, Equipo, Asistente (propuestas con aprobación), Aprobaciones, Modo ausencia (valida cobertura), Finanzas, Informes/bitácora, Clientes, Tratamientos, OKVET, Academia, Configuración | Hecho (demo) |
| Coordinación (COORD) | Bandeja, Agenda inteligente, Equipo, Nueva cita rápida, Detalle/reasignación, Solicitudes, Rutas, Simulador, Remisiones, Especialistas, Incidencias, Coberturas | Hecho (demo) |
| Cliente (CLIENT) | Inicio, Mascotas, Perfil de mascota, Mi agenda (reprogramar), Reservar, Pagos, Documentos, Remisiones, Ayuda/WhatsApp, Cuidadores, Notificaciones, Perfil | Hecho (demo) |
| Profesional (STAFF) | Jornada, Ruta, Visita (Waze, Google Maps, desplazamiento, llegada, atención, finalizar, incidencia), Tareas, Academia, Tratamientos, Inventario, Remisiones, Incidencias | Hecho (demo) |
| Otros roles | Cuidador, Auxiliar, Recepción, Finanzas, Administrador, Soporte, Consultor: matriz puede/no puede + accesos | Parcial |

## Pendiente (siguientes entregas)
- ~~Base de datos y login reales~~ Hecho en entrega 2 (Lovable Cloud, RLS por rol, bitácora automática).
- OKVET, WhatsApp Business, pagos: registrados, esperando credenciales.
- 112 workflows n8n (WF-001…WF-112): registrados, no implementados.
- IA real del asistente; optimizador de rutas; PWA.

## PROMPT 02 — Fundación (2026-11-20)
- Hecho y probado: eventos persistentes (`event_outbox`, 17 tipos, sin envío externo); máquina de estados de citas en base de datos + `src/lib/vf/visitState.ts`; confirmar exige referencia oficial OKVET; feature flags (los que requieren integración no se activan); memoria del cliente (cliente registra/corrige, equipo valida); documentos privados (bucket `documentos`, carpeta por usuario, URLs firmadas 5 min, PDF/imagen ≤10 MB); funciones internas sin acceso anónimo.
- Pantallas: /admin/feature-flags, /admin/integraciones/eventos, /admin/customer-memory, /app/memoria, /app/documentos.
- Pendiente/bloqueado: dispatcher n8n, WhatsApp, Google Calendar/Maps, IA conversacional, pagos (sin credenciales/decisión). Las 224 automatizaciones y 170 pruebas de aceptación no se declaran completas.
