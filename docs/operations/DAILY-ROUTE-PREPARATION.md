# VET FREEDOM OS — PROCEDIMIENTO OPERATIVO DE PREPARACIÓN DE RUTAS DIARIAS
**Módulo:** VET-CORE-08 | Daily Route Preparation Runbook (WF-037 / RTE-01)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Horario y Roles Responsables

- **Responsable:** Coordinador(a) de Operaciones (Laura Gómez) con supervisión de Dirección Médica (Dr. Luis Eduardo Ríos).
- **Ventana de Ejecución:** Todos los días a las 18:00 (D-1) para preparar la jornada del día siguiente, con revalidación a las 06:30 AM en la mañana del servicio.

---

## 2. Paso a Paso del Procedimiento

1. **Revisión de Citas Confirmadas:**
   - Acceder al panel de Lovable -> Consola de Coordinación.
   - Verificar que todas las citas del día siguiente tengan radicado clínico oficial en OKVET. Si una cita carece de radicado, se mantiene en cola de confirmación y no se incluye en la ruta publicada.
2. **Chequeo de Disponibilidad y Turnos:**
   - Cruzar la disponibilidad consolidada de VET-CORE-06 (Google Calendar Sync).
   - Validar que el veterinario asignado no figure con incapacidad, vacaciones o bloqueo de agenda.
3. **Generación de Propuesta Heurística:**
   - Ejecutar `prepare_daily_route_proposal`.
   - El sistema agrupa paradas geográficamente (ej. Zona Usaquén / Cedritos por la mañana, Chía / Cota por la tarde), asegurando que ninguna jornada exceda 6 visitas ni 8 horas laborales.
4. **Inspección de Restricciones Clínicas Protegidas:**
   - Comprobar que visitas con sedación, ayuno o procedimientos quirúrgicos domiciliarios estén ancladas a sus horas exactas (`is_clinically_protected = true`).
5. **Aprobación y Publicación:**
   - La coordinación pulsa "Aprobar y Publicar".
   - Supabase genera la versión oficial (v1), activa la primera parada en `READY` y emite el evento outbox `route.published`.
   - El veterinario recibe su itinerario en la aplicación móvil Lovable.
