# VET FREEDOM OS — CATÁLOGO DE ACCIONES Y HERRAMIENTAS (ACTION CATALOG)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Sección Normativa:** 04 del Prompt Maestro de Implementación  

---

## 1. Niveles de Riesgo y Gobernanza Operativa

Toda acción ejecutable por la Asistente Ejecutiva o el Cerebro Operativo se clasifica bajo una política de control estricto de riesgos:

| Nivel de Riesgo | Descripción | Autorización Requerida | Ejemplo |
| :--- | :--- | :---: | :--- |
| `READ_ONLY` | Consultas no mutativas de métricas, citas o estado general. | Rol autorizado | `get_business_snapshot`, `get_daily_visits` |
| `DRAFT` | Creación de borradores o propuestas sin impacto operativo inmediato. | Rol operativo | `create_appointment_request`, `create_followup` |
| `SIMULATION` | Cálculo de escenarios alternativos y rutas sin modificar la base de datos real. | Coordinación / Director | `simulate_schedule_changes`, `simulate_route_changes` |
| `LOW_RISK_WRITE` | Tareas administrativas de bajo impacto (ej. notas internas o recordatorios). | Coordinación | `create_followup_task` |
| `APPROVAL_REQUIRED` | Modificaciones de agenda, turnos, cancelaciones o reasignaciones de ruta. | **Aprobación de Dirección** | `prepare_staff_assignment`, `execute_approved_change` |
| `CLINICAL_APPROVAL_REQUIRED`| Procedimientos vinculados al cuidado del paciente o remisiones a especialistas. | **Médico Veterinario / Director** | `create_specialist_referral` |
| `EXTERNAL_CONFIRMATION_REQUIRED` | Cambios que requieren aceptación expresa del cliente o validación externa. | **Tutor / OKVET** | Confirmación definitiva de reprogramación |
| `PROHIBITED` | Ejecución de SQL arbitrario, alteración de código o formulación autónoma por IA. | **TERMINANTEMENTE PROHIBIDO** | `execute_sql`, `prescribe_medication` |

---

## 2. Catálogo Oficial de Herramientas Estructuradas

### Herramientas de Consulta y Observabilidad
1. **`get_business_snapshot`**  
   - *Objetivo:* Obtiene el estado consolidado de la veterinaria (citas, rutas, incidencias, cobros en COP).  
   - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `ADMINISTRATOR`, `COORDINATOR`, `ALPHA_CONSULTANT`.  
   - *Parámetros:* `date` (string YYYY-MM-DD), `filters` (objeto opcional).

2. **`get_daily_visits`**  
   - *Objetivo:* Lista las visitas a domicilio programadas con estado, profesional asignado y ventana horaria.  
   - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`, `VETERINARIAN`.  
   - *Parámetros:* `date` (string YYYY-MM-DD), `veterinarian_id` (UUID opcional).

3. **`get_team_availability`**  
   - *Objetivo:* Consulta turnos, capacidad, descansos y ausencias del equipo veterinario.  
   - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`, `ADMINISTRATOR`.  
   - *Parámetros:* `date` (string YYYY-MM-DD).

4. **`get_appointments`**  
   - *Objetivo:* Búsqueda y filtrado de citas operativas por estado, cliente o paciente.  
   - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`, `RECEPTION`.  
   - *Parámetros:* `status` (string), `client_id` (UUID opcional).

5. **`get_route_status`**  
   - *Objetivo:* Monitoreo en tiempo real de la ruta domiciliaria, paradas cumplidas y retrasos de tráfico.  
   - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`, `VETERINARIAN`.  
   - *Parámetros:* `route_id` (UUID o string).

6. **`get_pending_treatments`**  
   - *Objetivo:* Lista los planes de tratamiento recurrente aprobados y su adherencia de sesiones.  
   - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`, `VETERINARIAN`.  
   - *Parámetros:* `patient_id` (UUID opcional).

7. **`get_pending_referrals`**  
   - *Objetivo:* Consulta remisiones de pacientes a interconsultas con especialistas externos.  
   - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`.  
   - *Parámetros:* `specialty` (string opcional).

8. **`get_customer_context`**  
   - *Objetivo:* Extrae la memoria del cliente (CEM): cuidadores, datos sensibles de mascotas, protocolo de duelo.  
   - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`, `VETERINARIAN`.  
   - *Parámetros:* `client_id` (UUID o string).

9. **`get_financial_summary`**  
   - *Objetivo:* Consulta balances financieros en COP (facturado, recaudado, pendiente de verificar Nequi).  
   - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `ADMINISTRATOR`, `FINANCE`.  
   - *Parámetros:* `period` (string: today, yesterday, week, month).

10. **`get_open_tasks`**  
    - *Objetivo:* Lista las tareas y compromisos administrativos pendientes de ejecución.  
    - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`, `ADMINISTRATOR`.  
    - *Parámetros:* `assignee_role` (string opcional).

11. **`get_system_health`**  
    - *Objetivo:* Diagnóstico del estado técnico de Supabase, n8n, WhatsApp API y colas de eventos.  
    - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `TECH_SUPPORT`, `ALPHA_CONSULTANT`.  
    - *Parámetros:* Ninguno.

12. **`search_client`**  
    - *Objetivo:* Búsqueda rápida de clientes por nombre, teléfono colombiano o cédula.  
    - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`, `RECEPTION`.  
    - *Parámetros:* `query` (string).

13. **`search_pet`**  
    - *Objetivo:* Búsqueda de pacientes por nombre o tutor responsable.  
    - *Nivel de Riesgo:* `READ_ONLY` | *Roles:* `DIRECTOR`, `COORDINATOR`, `VETERINARIAN`.  
    - *Parámetros:* `name` (string), `owner_id` (UUID opcional).

---

### Herramientas Operativas y de Simulación
14. **`create_appointment_request`**  
    - *Objetivo:* Ingesta inicial de solicitud de cita. No afirma confirmación oficial de OKVET.  
    - *Nivel de Riesgo:* `DRAFT` | *Idempotencia:* Requerida.

15. **`create_staff_absence`**  
    - *Objetivo:* Registro formal de incapacidad, permiso o ausencia imprevista de un empleado.  
    - *Nivel de Riesgo:* `APPROVAL_REQUIRED` | *Idempotencia:* Requerida.

16. **`prepare_staff_assignment`**  
    - *Objetivo:* Prepara la propuesta de asignación de una visita a un médico veterinario.  
    - *Nivel de Riesgo:* `APPROVAL_REQUIRED` | *Idempotencia:* Requerida.

17. **`simulate_schedule_changes`**  
    - *Objetivo:* Simulación de contingencias en la agenda, evaluando desplazamientos y disponibilidad.  
    - *Nivel de Riesgo:* `SIMULATION` | *Idempotencia:* No requerida (cálculo en memoria).

18. **`simulate_route_changes`**  
    - *Objetivo:* Simulación y optimización de secuencias de paradas domiciliarias ante retrasos de tráfico.  
    - *Nivel de Riesgo:* `SIMULATION` | *Idempotencia:* No requerida.

19. **`prepare_shift_coverage`**  
    - *Objetivo:* Propuesta de cobertura de turnos descubiertos mediante personal de respaldo.  
    - *Nivel de Riesgo:* `APPROVAL_REQUIRED` | *Idempotencia:* Requerida.

20. **`create_followup`**  
    - *Objetivo:* Creación de tarea de seguimiento clínico o administrativo con fecha límite SLA.  
    - *Nivel de Riesgo:* `LOW_RISK_WRITE` | *Idempotencia:* Requerida.

21. **`create_specialist_referral`**  
    - *Objetivo:* Generación de remisión a especialista con validación clínica del Director.  
    - *Nivel de Riesgo:* `CLINICAL_APPROVAL_REQUIRED` | *Idempotencia:* Requerida.

22. **`register_specialist_availability`**  
    - *Objetivo:* Registro de ventanas horarias ofrecidas por especialistas externos.  
    - *Nivel de Riesgo:* `LOW_RISK_WRITE` | *Idempotencia:* Requerida.

23. **`prepare_customer_notification`**  
    - *Objetivo:* Preparación de mensaje saliente validando consentimientos y supresión de duelo.  
    - *Nivel de Riesgo:* `LOW_RISK_WRITE` | *Idempotencia:* Requerida.

24. **`request_approval`**  
    - *Objetivo:* Publicación de una propuesta en el Centro de Decisiones del Dr. Luis.  
    - *Nivel de Riesgo:* `APPROVAL_REQUIRED` | *Idempotencia:* Requerida.

25. **`execute_approved_change`**  
    - *Objetivo:* Ejecución de cambios operacionales previamente aprobados por el Director.  
    - *Nivel de Riesgo:* `APPROVAL_REQUIRED` | *Idempotencia:* Requerida (valida versión del ecosistema).

26. **`register_visit_completion`**  
    - *Objetivo:* Cierre operativo de la visita domiciliaria y recordatorio de registro en OKVET.  
    - *Nivel de Riesgo:* `LOW_RISK_WRITE` | *Idempotencia:* Requerida.

27. **`register_payment_received`**  
    - *Objetivo:* Registro de cobro en COP (efectivo, Nequi, Bre-B) con estado pendiente de conciliación.  
    - *Nivel de Riesgo:* `LOW_RISK_WRITE` | *Idempotencia:* Requerida.

28. **`prepare_owner_absence`**  
    - *Objetivo:* Registro de ausencia de cliente y reasignación de citas concertada.  
    - *Nivel de Riesgo:* `APPROVAL_REQUIRED` | *Idempotencia:* Requerida.
