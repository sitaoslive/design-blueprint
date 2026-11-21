# Auditoría financiera, control, importador y despacho

## Comprobaciones ejecutadas
- 472 pruebas automatizadas, 29 archivos, `bunx vitest run`. Nuevas: permissions-preparation-p13 (20), live-dispatch-p15a (35), duration-scheduler-p15a (2).
- Chromium en localhost con sesión temporal real, roles asignados desde Cloud (no desde almacenamiento). Administración, Finanzas, Veterinario, Auxiliar, Cliente y combinación de ocho roles no administrativos; mismos ID de prueba para acceso propio, nunca identidades reales impersonadas.
- Administración: CSV sintético, nueve pasos; guardado en revisión, lectura desde centro OKVET tras recarga; archivo y consentimiento descartados. Guarda huella, mapeo, conteo, revisión declarada; no guarda filas. Aplicar oficial deshabilitado. Reintento idéntico conserva un solo registro.
- Dirección puede leer cargos; Finanzas lee cargos y no preparaciones/costos reservados. Veterinario/Auxiliar/Cliente/roles combinados ven únicamente el cargo del que son propietarios, no el ajeno; centro/importador/configuración y finanzas globales rechazados. Rol múltiple no amplía Administración.
- Intentos directos (no solo botones): marcar/create cargo pagado rechazados; status original pendiente conservado; preparación APPLIED rechazada; INSERT de auditoría inventada rechazado; edición de outbox devuelve cero filas; bypass finance_cost_entry scope staff rechazado; preparaciones RPC desde perfiles no directores devuelve FORBIDDEN; ajustes seguridad/respaldos no visibles.
- Propuesta de duración: guardada y releída, publicación bloqueada. Cita rápida: duración personalizada recalcula y deshabilita creación; ambos formularios usan mismo motor. Unit test aumenta 30→120, rechaza solapamiento, no altera cita confirmada.
- Veterinario vinculado a profesional temporal: desplazamiento, llegada e inicio de atención sobre visita PENDIENTE sintética; marcas IN_SERVICE guardadas en visit_executions; temporizador reconstruido tras recarga. No se confirmó visita externamente. Duración aplicada ausente se muestra desconocida, no se usa 45 min del catálogo como hecho.
- Cliente: propia visita de seguimiento visible, v1 ajena ausente por RLS y UI, ninguna acción de atención, dirección ni ruta ajena; GPS/ETA y entrega desconocidos.
- Seis rutas autenticadas /admin, /admin/okvet, /admin/okvet/importar, /admin/citas/duraciones, /operaciones/despacho, /direccion/finanzas/cobros en 360/390/430/768/1366 px; sin desbordamiento. Cero pageerror en flujo administrador. Capturas adicionales con fuentes cargadas para Finanzas, tiempo Veterinario y familia; captura inicial prematura de móvil descartada como evidencia visual.
- Demos: acceso sin login, guardar real deshabilitado, doce perfiles intactos.

## Correcciones
- payments: quitar acceso global de Coordinación y creación financiera arbitraria por clínicos; insert solo pendiente, transición a pagado bloqueada, cargos históricos pagados/vencidos no modificables desde cliente.
- records: restricciones por kind/scope evitan disfrazar costos/preparaciones como staff; drafts financieros/importación inmutables; cobros de campo no se exponen a clínicos no autores por la política staff genérica.
- org_settings: ajustes seguridad/comunicaciones/respaldos reservados a Dirección; catálogo operativo mínimo sigue visible al equipo.
- audit_log/outbox: solo mecanismos protegidos escriben evidencias; no puede un botón certificar salud/entrega.
- visit_billing_terms/field_billing_balance: autorización limitada a responsable/participante o Finanzas/ops/Dirección; importe y saldo desconocidos permanecen null.
- fuentes de presentación invalidan datos al cambiar UID o roles; ControlCenter no monta consultas antes de la verificación visual.

## Límites
Declaración de revisión ≠ autorización backend para importar. Las preparaciones no permiten publicar, aplicar, fusionar ni confirmar expedientes. No autoridad Antigravity de importaciones/duración aplicada/GPS/ETA/avisos; no facturación bancaria/conciliación, no mapas/seguimiento permanente ni notificaciones externas. P15A parcial según matriz dedicada. No pruebas en dispositivos físicos ni tracking de producción. Históricos y demos no se usan como QA ni se eliminan.

## Reproducibilidad
Scripts conservados en docs/qa/scripts/permissions-dispatch/ (roles requieren provisioning controlado de fixture temporal; la sesión se lee de caché de auth, nunca se registra). Fixtures QA-PERM identificados exclusivamente para este lote; eliminados al finalizar después de revisar IDs. No credenciales incluidas.