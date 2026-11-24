# Operaciones de Citas Preventivas (VET-CORE-10)

## 1. Distinción Vital: Cita vs Aplicación Certificada
- Una cita agendada (`APPOINTMENT_BOOKED`) o confirmada en calendario **NO CONSTITUYE** ni certifica la aplicación de una vacuna o desparasitación.
- La aplicación solo puede ser registrada y certificada **DURANTE O TRAS LA VISITA CLÍNICA REAL** por el médico veterinario actuante (`record_preventive_application`).
- Queda prohibido adelantar el estado a `APPLIED` de manera automática por el mero paso del tiempo o por reporte verbal no corroborado.

## 2. Flujo Operativo de Agendamiento
1. **Detección de Necesidad Preventiva:** El evento preventivo alcanza ventana de agendamiento (D-15 o D-7).
2. **Coordinación con Tutor:** Se acuerda franja de visita a domicilio con el Dr. Luis Eduardo Ríos o el equipo veterinario.
3. **Bloqueo en Agenda:** Se crea la cita en Supabase (`appointments`) y se enlaza al evento preventivo (`schedule_preventive_appointment`).
4. **Estado del Evento:** Pasa a `APPOINTMENT_BOOKED` con el `appointment_id` asignado.

## 3. Preparación de Visita y Asignación de Insumos
- 24 horas antes de la visita:
  - Verificación del lote asignado en `preventive_product_lots`.
  - Comprobación de que el lote esté en estado `RELEASED` y no presente fecha de caducidad vencida ni alertas de cuarentena.
  - Aseguramiento de la hielera de transporte con acumuladores térmicos calibrados (2°C a 8°C).

## 4. Reprogramación y Cancelación
- Si la cita es reprogramada, el evento preventivo actualiza su `target_date` manteniendo la trazabilidad histórica de cambios.
- Si la cita es cancelada por el cliente, el evento retorna a estado `SCHEDULED` y se activa protocolo de seguimiento no invasivo.
