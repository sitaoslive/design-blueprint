# Catálogo de 21 capacidades n8n (de la especificación original)

| ID | Módulo | Objetivo | Evento de entrada | Resultado esperado | Estado |
|---|---|---|---|---|---|
| CORE-01 | Event Dispatcher | Recepción, validación, deduplicación y distribución de eventos internos. | Supabase outbox/dispatcher autenticado | Evento entregado a flujo autorizado / estado persistente | NO_VERIFICADO |
| CORE-02 | WhatsApp Inbound | Recepción de mensajes oficiales, normalización y contexto autorizado. | Webhook Meta verificado por gateway | Evento de conversación sin duplicados | NO_VERIFICADO |
| CORE-03 | WhatsApp Outbound | Entrega oficial de mensajes autorizados y acuses. | Solicitud de envío aprobada | ID del proveedor / estado registrado | NO_VERIFICADO |
| CORE-04 | Conversation Escalation | Transferencia humana y suspensión de la IA. | Escalamiento / solicitud humana | Responsable y control de conversación actualizados | NO_VERIFICADO |
| CORE-05 | Appointment Notification Service | Confirmaciones, recordatorios, cambios y cancelaciones. | Evento validado de cita | Notificación verificada o pendiente | NO_VERIFICADO |
| CORE-06 | Calendar Sync | OAuth, cambios, privacidad, reconciliación de calendarios. | Conexión/autorización/calendario externo | Disponibilidad y conflictos revisados | NO_VERIFICADO |
| CORE-07 | Operational Reminders | Tareas pendientes, compromisos e incidencias. | Vencimiento aprobado/estado operativo | Alerta / tarea registrada | NO_VERIFICADO |
| CORE-08 | Route Notifications | Avisos de rutas aprobadas y retrasos. | Ruta publicada / evento de retraso | Avisos autorizados | NO_VERIFICADO |
| CORE-09 | Recurring Care Communications | Comunicaciones de visitas recurrentes aprobadas. | Plan profesional aprobado | Seguimiento, avisos o excepciones | NO_VERIFICADO |
| CORE-10 | Prevention Communications | Recordatorios preventivos basados en protocolos aprobados. | Fecha preventiva validada | Comunicación permitida o suprimida | NO_VERIFICADO |
| CORE-11 | Specialist Coordination | Disponibilidad, ofertas, aceptación y verificación con especialistas. | Remisión/gestión autorizada | Estado de coordinación y evidencia externa | NO_VERIFICADO |
| CORE-12 | Post-Visit Commitments | Seguimiento de compromisos tras visitas. | Visita cerrada / compromiso pendiente | Recordatorio, delegación o escalamiento | NO_VERIFICADO |
| CORE-13 | Approved Document Delivery | Entrega protegida de documentación autorizada. | Documento aprobado y petición válida | Acceso seguro y evidencia de entrega | NO_VERIFICADO |
| CORE-14 | Financial Notifications | Avisos de cobros, conciliación y pendientes. | Estado financiero validado | Alerta / comprobante autorizado | NO_VERIFICADO |
| CORE-15 | Customer Experience Follow-up | Encuestas, quejas, seguimiento y supresiones. | Evento de experiencia/consentimiento | Borrador, seguimiento o aviso | NO_VERIFICADO |
| CORE-16 | Daily Executive Reporting | Resumen diario operativo para Luis y coordinación. | Schedule + datos autorizados | Resumen factual con excepciones | NO_VERIFICADO |
| CORE-17 | Weekly Reporting | Indicadores semanales y continuidad. | Schedule + indicadores autorizados | Informe semanal verificable | NO_VERIFICADO |
| CORE-18 | Integration Reconciliation | Reconciliación entre estados internos y proveedores. | Schedule / discrepancia | Incidencias y correcciones autorizadas | NO_VERIFICADO |
| CORE-19 | Error & Retry Handler | Errores, backoff y recuperación segura. | Error Trigger / errores internos | Reintentos limitados o escalamiento | NO_VERIFICADO |
| CORE-20 | Integration Health Monitoring | Salud de integraciones, colas y credenciales. | Schedule/telemetría | Alertas de salud y evidencia | NO_VERIFICADO |
| CORE-21 | Backups & Maintenance Coordination | Validación de respaldos, mantenimiento y restauración. | Schedule / resultados de backup | Alertas y pruebas de restauración | NO_VERIFICADO |

Los 21 módulos son **agrupaciones técnicas iniciales**, no necesariamente exactamente 21 workflows independientes; no se deben duplicar componentes si conviene reutilizar un sub-workflow. **La fuente de verdad funcional son las especificaciones adjuntas.**
