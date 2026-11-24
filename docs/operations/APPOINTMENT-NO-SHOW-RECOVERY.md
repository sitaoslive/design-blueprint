# VET FREEDOM OS — PROTOCOLO DE NO-SHOW Y RECUPERACIÓN OPERATIVA
**Módulo:** VET-CORE-05 | Appointment Notification Service & Scheduling Gate  
**Procedimiento Operativo Estándar:** SOP-APPT-04  
**Dirección Médica:** Dr. Luis Eduardo Ríos

---

## 1. Definición y Protocolo de Espera en Domicilio

Dado el modelo domiciliario, un evento de ausencia del tutor o imposibilidad de atención se clasifica de la siguiente manera:
1. **Llegada y Aviso:** El veterinario arriba al domicilio y notifica vía app o llamada ("Estoy en portería").
2. **Tiempo de Espera Obligatorio:** El profesional debe aguardar un mínimo de **20 minutos** en el punto de encuentro intentando contacto telefónico y por WhatsApp.
3. **Registro de Incidente:** Tras agotarse los 20 minutos sin respuesta, el médico ejecuta desde su app móvil el registro de visita no realizada.

---

## 2. Tipología de Incidentes Soportados

| Código de Incidente | Causa | Acción Inmediata |
| :--- | :--- | :--- |
| `CLIENT_NO_SHOW` | Tutor ausente en domicilio o no atiende citófono/puerta tras 20 min. | Cita a `NO_SHOW`, tarea en `appointment_recovery_tasks`, mensaje empático. |
| `VET_UNABLE_TO_ATTEND` | Incapacidad física súbita del médico o falla mecánica del vehículo. | Cita a `VISIT_NOT_COMPLETED`, reasignación prioritaria de médico. |
| `TRAFFIC_ROUTE_ABORTED` | Bloqueo absoluto de vía (paro, manifestación, inundación en Bogotá). | Cita a `VISIT_NOT_COMPLETED`, reprogramación coordinada. |
| `ADDRESS_UNREACHABLE` | Nomenclatura inexistente, zona roja no accesible o denegación en portería. | Cita a `VISIT_NOT_COMPLETED`, contacto telefónico inmediato con tutor. |
| `CLINICAL_FORCE_MAJEURE` | Mascota agresiva inmovilizable sin sedación o tutor en emergencia médica. | Cita a `VISIT_NOT_COMPLETED`, derivación a consulta con etólogo o sedación. |

---

## 3. Filosofía del Mensaje de Seguimiento ("Non-Blaming")

> [!TIP]
> **REGLA DE COMUNICACIÓN:** Jamás culpar ni reprochar al tutor. No sabemos si el tutor tuvo una emergencia médica, un accidente de tránsito o una calamidad doméstica.

* **Mensaje Oficial (`vet_appointment_no_show_followup`):**
  > "Hola [Nombre], el equipo de Vet Life estuvo en tu domicilio hoy para la cita de [Mascota], pero no logramos contactarte. Esperamos que todo se encuentre bien contigo y tu mascota. Por favor escríbenos a este chat o llámanos para verificar el estado de salud de [Mascota] y reagendar su atención."

---

## 4. Tareas de Recuperación Operativa (`appointment_recovery_tasks`)

Cada incidente genera automáticamente un registro en `appointment_recovery_tasks` con estado `OPEN`.
- El coordinador clínico asignado revisa las notas del veterinario.
- Realiza contacto de seguimiento dentro de las 4 horas siguientes.
- Si se logra acordar una nueva fecha, la tarea se cierra con `status = 'RESCHEDULED'`.
- Si tras 48 horas y 3 intentos no hay respuesta, la tarea se archiva como `status = 'CLOSED_LOST'`.
