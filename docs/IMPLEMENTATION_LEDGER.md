# Implementation Ledger — Vet Freedom OS (Entrega 1: frontend + demo)

## P13 lote B — 2026-11-21
- CSV local autorizado, nueve pasos, mapeo/validación/detección de duplicados, comparación inequívoca por IDs/referencias y calidad de visits; reutiliza módulos y fuente existente. No importación/aplicación oficial.
- 415 pruebas aprobadas / 26 archivos; QA autenticada, rechazo no-admin, demo móvil, seis rutas/cuatro tamaños, snapshot de visitas intacto y cero escrituras en el flujo. Evidencia qa/P13_IMPORT_2026-11-21.md; matrices individuales actualizadas; demos conservados.

## P12 continuación / P13 inicial · 2026-11-21
- Contexto aislado por conversación, filtros profesional/cita/fecha, consultas financieras específicas, archivo/restauración, borrador desde chat con referencias y CSV ejecutivo autorizado. Autoridad oficial continúa bloqueada.
- P13 adjunto conservado íntegro, centro de control reutilizado, dependencias y preparación de lanzamiento; salud externa desconocida sin prueba reciente. No certificar otros lotes P13.
- 385 pruebas/25 archivos; sesión temporal Dirección y Finanzas, persistencia/recarga/CSV y denegación a Finanzas; siete rutas/cuatro viewports y demos sin login. QA qa/P12_CONTINUATION_2026-11-21.md; matrices P12/P13 actualizadas. Limpieza solo fixtures sintéticos identificados; demos conservados.

## Prompt 12 — entrega inicial avanzada · 2026-11-21
- Asistente compartida privada, herramientas de lectura sobre fuentes existentes, historial de sesión y borradores reservados, 16 superficies ejecutivas, voz segura preparada, políticas de riesgo/versiones/dependencias y contratos oficiales fail-closed.
- 359 pruebas totales, 60 específicas P12; consultas/borradores probados con sesión real y recarga, 15 rutas en cinco viewports, demo y denegación auxiliar/micrófono comprobados. Evidencia: qa/P12_2026-11-21.md.
- Sin migraciones ni IA/voz externa/envíos/confirmaciones/ejecuciones oficiales. Prompt 12 sigue parcial; contratos, contexto/planner/reportes completos y aceptación original registrados en qa/P12_TRACEABILITY.md. Demos conservados.

## Prompt 09 — lote A de aplicación · 2026-11-21
- Reutiliza FinancePages, payments, records, knowledge_articles y COP exacto; lista/detalle de propuestas de tarifa/proveedor y cargo, fuentes de cobro separadas, periodos Bogotá, filtros y exportación consistente.
- Sesión real temporal: propuesta de proveedor/tarifa y reporte de pago persistidos y releídos después de recarga; dos cargos sintéticos prueban inclusión/exclusión de periodo. 49 pruebas financieras, cinco viewports sin desbordamiento ni errores. Evidencia: qa/P09_LOT_A_2026-11-21.md.
- Sin migraciones, conciliación, verificación bancaria ni integraciones nuevas. Limpieza limitada a los registros QA del lote; demos y datos históricos conservados.

## Estado vigente · calidad interna y diseño · 2026-11-21
- Autoridad interna de quejas, encuestas, consentimientos, educación, mejoras y estándares implementada mediante funciones protegidas y migraciones administradas; las notas antiguas de borradores/contratos pendientes son históricas y no describen este lote.
- Pruebas de cinco perfiles autenticados, ciclos con recarga, versiones, idempotencia, privacidad familiar y revisión clínica. 284 pruebas en 21 archivos aprobadas. Evidencia: qa/P10_INTERNAL_2026-11-21.md.
- Diseño compartido azul/verde refinado, Manrope y fotografía original de animales; navegación y perfiles demo conservados. 360/384/768/1280 px sin desbordamiento.
- Prompt Maestro guardado y conciliado en qa/MASTER_RECONCILIATION_2026-11-21.md. Prompt 09 reenviado revisado; preparación en NEXT_STEP_INTERNAL_FINANCE.md, sin nueva infraestructura financiera ni acciones externas. No declarar totalidad P01–11 completa.

## PROMPT-010 · v10.0 · 2026-11-21
- Revisión móvil posterior: doce perfiles demo y cuenta temporal con cinco perfiles reales; corregidos enlaces restringidos, borrado de plan/evidencia, presentación del responsable, campos de fecha y botones. 67 pruebas dirigidas aprobadas; evidencia y límites en `qa/P10_MOBILE_2026-11-21.md`. Sin ampliar permisos ni habilitar decisiones oficiales.
- Añadido módulo de calidad/experiencia/fidelización: dashboard, fuentes operativas, quejas y evidencia, escalamiento, encuestas, causas/mejoras, recorrido familiar, recuperación, recordatorios, educación, consentimientos, elegibilidad, reseñas/referidos y origen de solicitudes.
- Reutiliza visitas, solicitudes, conversaciones, compromisos, memoria, remisiones/recordatorios y finanzas. No agrega migraciones, infraestructura ni envíos externos.
- Nuevos registros reales son **borradores reservados de Dirección**, no quejas oficiales, publicaciones, consentimientos legales ni resoluciones ejecutadas. Las decisiones oficiales usan contratos fail-closed pendientes de Antigravity.
- Fuente, rutas, QA-01..10, CRM-01..10, workflows y brechas individuales: `qa/P10_TRACEABILITY.md`. Evidencias: `qa/P10_2026-11-21.md`. No declarar Prompt 10 completo ni inferir aceptación total de pruebas unitarias/demos.

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

## PROMPT 04 — Concierge y WhatsApp (2026-11-20) · modo DISEÑO
- Backend implementado y probado: conversaciones, mensajes, eventos, conocimiento aprobado, 25 plantillas (DRAFT), cola de salida, bajas. Pruebas: IA bloqueada tras toma de control (WA-T035/T038), doble envío rechazado (WA-T053), dos agentes con versión (WA-T037), baja → SUPPRESSED (WA-T046/47), plantilla no aprobada (WA-T048), ventana 24 h (WA-T049), app no puede aprobar plantillas.
- Reglas probadas (src/test/concierge.test.ts): varias intenciones, urgencia, dosis, conocimiento aprobado, humano, mascotas ambiguas, fuera de horario.
- Frontend: /operaciones/whatsapp (+pendientes, traspasos, fallos, seguimientos, :id), /direccion/whatsapp, /admin/whatsapp, /admin/plantillas(/:id), /admin/ia-conversacional, /admin/metricas-comunicacion, /admin/traspasos. Móvil lista→chat→contexto.
- BLOQUEADO: conexión con Meta (sin cuenta/credenciales), webhook real, envío real, aprobación de plantillas, IA generativa (pendiente de decisión), n8n, audios/transcripción. Mensajes de clientes en la bandeja son simulados.
- Tarifa ($ 120.000 COP por visita) y formas de pago (efectivo, transferencia/Nequi, link de pago) aprobadas en conocimiento del asistente. Inicio y /demo: 12 perfiles entran directo sin login.

## PROMPT 05 — Vet Smart Scheduler (lote 1–4, 9–12 parcial)
- Hecho: motor de disponibilidad con explicación (turno, ausencia, descanso 12:30–13:00, competencias, zona, viajes entre zonas + margen 10 min, visitas protegidas, reservas provisionales, datos desactualizados, sobrecarga → aprobación); asignación inteligente ordenada; reemplazos ANTES/PROPUESTO enviados a aprobación sin mover citas; capacidad por día/zona; recurrencias solo de planes aprobados; lista de espera sin doble asignación; reservas con reloj del servidor. 29 pruebas.
- Pantallas: /operaciones/disponibilidad, /operaciones/capacidad (y /direccion/capacidad), /operaciones/reemplazos(/:id).
- Pendiente: reservas provisionales atómicas en el servidor (el prompt prohíbe migraciones en esta fase),  reoptimización de rutas con tráfico real, conciliación de escenarios y cobertura avanzada pendiente de datos verificables. Calendario mensual, cita rápida y monitor operativo ya implementados.

## Revisión de auxiliares y acceso real de Luis (2026-11-20)
- Luis: correo todavía sin confirmar en Lovable Cloud; inicio de sesión real devuelve `email_not_confirmed`. Roles Dueño, Administrador y Veterinario y vínculo profesional conservados; no se alteró la confirmación ni se sustituyó su identidad para declarar la prueba realizada.
- Auxiliares: 18 pantallas revisadas con sesión real temporal en móvil de 384 × 681, sin errores de ejecución ni desbordamiento horizontal. Visitas antiguas del auxiliar, tanto en `/auxiliar` como en `/equipo`, ahora usan el flujo validado de ejecución.
- Guardado real verificado: tarea, preparación, desplazamiento, llegada, nota sin conexión (un único registro tras dos intentos), reserva y consumo de insumos, cobro informado, mensaje enviado y lectura del mensaje recibido.
- Rechazos reales verificados: inicio clínico, cambio clínico directo de la cita, ajuste directo de inventario, consumo de reserva ajena, lectura de nota ajena, verificación del propio cobro y modificación del contenido de un mensaje recibido.
- Preparación muestra casillas realmente confirmadas, no la longitud de una lista genérica. Los borradores sin conexión se separan por cuenta, se purgan físicamente a las 24 horas y no se atribuyen a otra cuenta.
- Migraciones de permisos: `0020_auxiliary_access_hardening` y `0021_handover_identity_guard`. Pruebas automatizadas: 121 aprobadas; no equivalen a completar todos los criterios de todos los prompts.
- Revisión detallada y limitaciones: `docs/qa/AUXILIAR_AUDIT_2026-11-20.md`.

## Auxiliares avanzados — 2026-11-21
- Visitas compartidas con apoyo separado del responsable clínico; preparación, cantidades, viaje, llegada y fin de apoyo no alteran la cita veterinaria.
- Tareas con aceptación, inicio, bloqueo con motivo, recuperación, finalización, vencimiento calculado y solicitud de ayuda; historial persistente y rechazo de reapertura de tareas resueltas.
- Kits físicos con asignación, recepción y devolución; cantidades requeridas bloquean salida si no están apartadas.
- Entregas aceptadas transfieren efectivamente tareas, participaciones auxiliares e incidencias; cierres verificados por otra persona, con pendientes críticos calculados en servidor por fecha de Colombia.
- Lecciones y progreso por persona, mensajes con contexto y archivos privados, tarifas autorizadas, comprobantes y saldo que distingue informado de verificado.
- Pruebas reales en móvil 384 × 681 con cuenta temporal y datos sintéticos: flujos principales guardados y releídos; rechazo clínico, rechazo de cobro verificado por auxiliar y bloqueo de cierre comprobados. 136 pruebas automatizadas aprobadas.
- Alcance y límites de comprobación: `docs/qa/AUXILIAR_ADVANCED_2026-11-21.md`; no certifica todas las pruebas de todos los prompts ni integraciones externas.

## Prompts 08 y 09 — lote avanzado, 2026-11-21
- Prompt 08: directorio con modalidades y metadatos de revisión por Dirección; ventanas manuales con fuente y vigencia; comparador sin inventar habilitación; wizard de ocho pasos desde visita; propuesta idempotente; evidencia estructurada de cita manual en historial; recordatorios, delegación y resultado; solicitudes documentales y presupuestos separados de aprobación/cobro. Todos los accesos de staff se unifican sobre referral_cases.
- Correcciones: asignar especialista no cambia la remisión a agendada; guardados requieren fila confirmada; ofertas interpretadas en America/Bogota; borrador por cuenta/visita recuperable.
- Prompt 09: cantidades monetarias enteras en centésimas COP, reglas de cotización, asignación de pagos, candidatos de conciliación, costos incompletos, contribución, reposición, valor de clientes y escenarios. Vistas de Finanzas/Dirección, costos reservados, solicitudes de compra, cadena de frío, proveedor y ajustes; CSV autorizado. No se agregaron migraciones.
- Persistencia: datos operativos existentes; nuevos costos y borradores financieros en records con scope director. El rol Finanzas NO adquiere acceso a remuneraciones o borradores reservados por controles visuales. Su contrato protegido sigue pendiente.
- Pruebas: 206 pruebas unitarias aprobadas (18 archivos). E2E con cuenta temporal autenticada: creación desde visita, elección de propietario sin confirmación, evidencia manual persistida y releída, delegación, ventana informada, cuatro costos directos por 17.500 COP, solicitud de compra, escenario exacto, exportación CSV. Viewports 360, 390, 430, tablet y escritorio. Evidencia y limitaciones en docs/qa/P08_P09_2026-11-21.md.
- No se certifican todas las pruebas originales ni todos los criterios: ver roadmap y matrices. Envíos, reservas externas, acceso documental por remisión, facturación oficial, verificación bancaria, conciliación financiera y transacciones de compras permanecen bloqueados por contratos externos/servidor.
