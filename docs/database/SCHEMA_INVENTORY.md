# Inventario de entidades (Partes 1, 2 y 3)
Fuente de verdad: Lovable Cloud. Migraciones en `drizzle/migrations/` (0000–0009). Tabla genérica `records` (kind) cubre entidades operativas sin tabla propia.

| Entidad (spec) | Dónde vive | Estado |
|---|---|---|
| Usuarios / Roles / Permisos | auth.users, profiles, user_roles (app_role) | Real |
| Propietarios / Mascotas | profiles, pets | Real |
| Cuidadores | pet_caregivers | Real |
| Direcciones / Preferencias / Consentimientos | client_settings (jsonb) | Real |
| Memorias / validaciones / correcciones | records: memoria_validacion, memoria_correccion | Real |
| Conversaciones / Mensajes WhatsApp | service_requests (canal) + records wa_* | Sin WhatsApp real |
| Solicitudes | service_requests | Real |
| Citas / Visitas | visits | Real |
| Rutas / aprobación / incidencias | visits por profesional + records ruta_aprobacion, incidencia_ruta | Real |
| Tratamientos / ejecuciones | treatments + records ejecucion_tratamiento | Real |
| Inventario / lotes / movimientos / compras / conteos | inventory_items + records movimiento, compra, conteo | Real |
| Tareas / compromisos | tasks + records compromiso_visita | Real |
| Aprobaciones | approvals | Real |
| Finanzas / verificación de pagos | payments + records pago_informado, nota_cobro, conciliacion | Real (sin pasarela) |
| Calidad / quejas / correctivos / encuestas / supresiones | incidents + records | Real |
| Academia / lecciones / evaluaciones / versiones | courses + records leccion, evaluacion, version_procedimiento | Real |
| Auditoría / eventos de seguridad | audit_log + records seguridad (director) | Real |
| Conexiones de calendario / sincronización | integrations(gcal) + records sync_calendario | Sin Google Calendar real |
| Turnos / Ausencias / solicitudes | shifts + records solicitud_turno, solicitud_ausencia | Real |
| Reemplazos | visits.staff_id (reasignación confirmada) | Real |
| Bloqueos provisionales / protegidas | records bloqueo, protegida | Real |
| Recurrencias | records recurrencia | Real |
| Lista de espera / ofertas | waitlist + records oferta_horario | Real |
| Simulaciones / snapshots / plan / auditoría | simulations + records sim_* | Real |
| Especialistas / credenciales / disponibilidad | specialists, specialist_slots + records credencial | Real |
| Remisiones / documentos / informes / cita externa / continuidad | referrals, specialist_reports + records rem_*, doc_remision | Real (archivos vía OKVET pendiente) |
| Privacidad / exportaciones / accesos temporales | records privacidad (cliente), exportacion, acceso_temporal (director) | Real |
| OKVET | integrations(okvet) | No conectado |
