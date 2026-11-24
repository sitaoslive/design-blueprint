# VET FREEDOM OS — CONCILIACIÓN CON RED DE ESPECIALISTAS EXTERNOS
## Remisiones Veterinarias, Estados de Reserva Externa y Verificación de Radicados

---

### 1. El Módulo de Remisiones Especializadas (VET-CORE-11)

Cuando un caso domiciliario atendido por Vet Life requiere ecografía especializada, cardiología, cirugía ortopédica o dermatología avanzada, el paciente es derivado a la red de especialistas externos homologados.

- **Conector**: `specialist_portal`
- **Modo**: `MANUAL_CONFIRMATION`
- **Autoridad**: El especialista externo o clínica receptora tiene autoridad exclusiva sobre su agenda física, cupos de quirófano y tarifas de consulta.
- **Invariante en QA**: Cero reservas externas reales. Toda simulación opera contra contratos de prueba.

---

### 2. Detección de Discrepancias en Remisiones

1. **`SPECIALIST_SLOT_NOT_CONFIRMED`**:
   - El tutor de la mascota seleccionó un horario tentativo ofrecido por la plataforma, pero la clínica del especialista aún no ha emitido el radicado o confirmación formal de recepción.
   - *Regla*: La remisión no puede transicionar a `CONFIRMED`. Se mantiene en estado `PENDING_SPECIALIST_CONFIRMATION`.
2. **`SPECIALIST_BOOKING_CONTRADICTION`**:
   - En Supabase la remisión figura como confirmada, pero el reporte de conciliación del especialista indica que el cupo fue asignado a otro paciente o cancelado por indisponibilidad de quirófano.
   - *Acción*: Discrepancia crítica. Se alerta al coordinador para reubicar al paciente inmediatamente en otra clínica de la red de especialistas autorizada.
3. **`SPECIALIST_REPORT_OVERDUE`**:
   - Cita con especialista transcurrida hace más de 48 horas sin informe médico ni resultados de laboratorio radicados en el sistema.
   - *Acción*: Dispara recordatorio operacional automático al especialista solicitando el informe clínico para salvaguardar la continuidad de la atención de Vet Life.
