# VET FREEDOM OS — POLÍTICAS DE DELEGACIÓN Y REASIGNACIÓN DE TAREAS
**Módulo:** VET-CORE-07 | Task Delegation & Reassignment  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Reglas de Delegación

La delegación de tareas permite la continuidad del servicio cuando un profesional se encuentra atendiendo una cirugía, en traslado prolongado o en reposo:

1. **Autoridad para Delegar:** Sólo el usuario asignado, su supervisor directo o el Administrador General pueden reasignar o delegar una tarea.
2. **Compatibilidad de Rol:** Las tareas clínicas sólo pueden ser delegadas a profesionales que cumplan con la habilitación requerida (`is_clinical = true`). Una tarea de aplicación de tratamiento no puede ser delegada al personal administrativo.
3. **Auditoría Permanente:** Cada delegación crea una entrada inmutable en `public.operational_task_assignment_history` con motivo, timestamp y usuario autorizador.
4. **Traspaso de Recordatorios:** Al completarse la delegación, todos los recordatorios activos dirigidos al usuario anterior pasan a estado `SUPERCEDED` y se generan los nuevos recordatorios dirigidos al nuevo titular.

---

## 2. Aceptación de Delegación

El delegado recibe la tarea en estado `WAITING_ACCEPTANCE`. Debe acusar recibo dentro de la ventana de SLA asignada. En caso de no aceptar, el sistema devuelve la tarea a supervisión o activa al responsable de respaldo (`backup_assigned_user_id`).
