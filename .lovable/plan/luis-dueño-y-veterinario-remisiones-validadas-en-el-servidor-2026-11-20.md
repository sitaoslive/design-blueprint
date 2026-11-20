# Luis: dueño y veterinario + remisiones validadas en el servidor + cola sin conexión

## Objetivo
Luis es dueño (Dirección/Administración) y también atiende pacientes. Debe ver a todos los pacientes y tener sus herramientas clínicas sin salir de su panel.

## 1. Dos modos en el panel de Luis
- Selector arriba: **Dueño** (negocio, equipo, aprobaciones, finanzas) y **Veterinario** (mi jornada, mis citas, pacientes).
- El modo elegido se recuerda en el equipo. Los permisos no cambian: Luis siempre tiene ambos.
- Luis queda vinculado a su propia ficha de profesional del equipo, para tener citas asignadas, turnos y aparecer en la agenda y en los reemplazos.

## 2. Funciones nuevas para Luis veterinario
- **Mi jornada**: sus citas del día, con la ejecución de visita (preparación, trayecto, atención, cierre) que ya usa el equipo.
- **Todos los pacientes**: buscador de mascotas y dueños, con ficha completa: historia, tratamientos, memoria del cliente, documentos, remisiones y citas.
- **Paciente en cita ahora**: tarjeta que muestra en qué paso está cada cita en curso (de él y del equipo).
- **Recordatorios de pacientes de especialistas**: crear recordatorios sobre una remisión (por ejemplo «llamar por el informe de cardiología el viernes»), con fecha, responsable y estado. Aparecen en su inicio y en la remisión.
- **Remisiones de sus pacientes**: lista con el paso en que va cada una y acceso a la gestión.
- Atajos desde la ficha: nueva cita, nueva remisión, registrar dosis, nota clínica.

## 3. Funciones de dueño que hay que revisar y ampliar
- Inicio de dueño con: aprobaciones pendientes, remisiones estancadas, carga del equipo, cobros por verificar, incidentes y conversaciones escaladas.
- Revisar que cada pantalla de Dirección y Administración sea accesible desde el menú de Luis (hoy varias solo se llegan por enlace).

## 4. Remisiones validadas en el servidor (autorizado)
- Los pasos de cada remisión se guardan en el servidor, que revisa paso anterior, quién lo hace, versión y evidencia.
- Solo un profesional clínico aprueba la indicación o hace la revisión del informe.
- Solo con la referencia del especialista queda «Cita confirmada».
- El cliente elige horario solo entre opciones vigentes que le enviaron; su elección nunca confirma la cita.
- Los recordatorios de remisiones se guardan aparte, visibles solo para el equipo.

## 5. Repetir la prueba de la cola sin conexión
- Con una cuenta real temporal vinculada a un profesional: guardar una nota sin conexión, reconectar varias veces y abrir dos pestañas a la vez.
- Revisar en la base que quede una sola nota. Si hay duplicados, añadir una protección en el servidor (una clave única por acción) además de la de la app.
- Borrar los datos de prueba y no tocar las cuentas demo.

## 6. Demo y pruebas
- Perfil demo de Luis con los dos modos y datos de ejemplo de recordatorios y pacientes.
- Pruebas automáticas: reglas de remisión del servidor, permisos de Luis frente a un veterinario normal (que sigue viendo solo lo suyo), recordatorios.
- Revisión en celular de ambos modos.

## Detalles técnicos
- Migración: tabla `referral_cases` (referral_id, state, version, offers jsonb, choice, history) con trigger `guard_referral_case` (transiciones, rol vía `is_clinical`/`is_ops`, versión, evidencia/motivo, ofertas vigentes); `referral_choices` (insert del dueño de la mascota, solo offer ids vigentes); `referral_reminders` (referral_id, pet_id, due_at, assignee, status; solo staff). GRANT + RLS en las tres. Migrar los `records` kind `referral_case/offer/choice` existentes.
- Índice único en `records ((data->>'idempotencyKey')) where kind = 'nota_offline'` si la prueba muestra duplicados.
- Vincular `staff_members.user_id` de Luis (crear ficha si no existe); `my_staff_ids()` ya cubre sus citas.
- UI: `LuisModeSwitch` en el layout `/luis`, módulos nuevos vía `$modulo` + registry (pacientes, paciente/$id, recordatorios, mi-jornada), reutilizando ficha de mascota, `fieldPage` y `ReferralCase`.
- Actualizar `AGENTS.md`, `screens.ts`, `roadmap.md` y `/docs`.
