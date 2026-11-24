# Gestión de Incidentes Clínicos y de Trazabilidad Preventiva (VET-CORE-10)

## 1. Tipología de Incidentes Preventivos
Los incidentes en medicina preventiva se clasifican y auditan en la tabla `preventive_care_incidents`:

| Tipo de Incidente | Nivel de Severidad | Causa Típica | Acción Operativa Inmediata |
| :--- | :--- | :--- | :--- |
| `COLD_CHAIN_BREACH` | CRITICAL | Temperatura < 2.0°C o > 8.0°C en hielera móvil | Cuarentena de lote, suspensión de dosis, reprogramación |
| `EXPIRED_LOT_ATTEMPT` | HIGH | Intento de selección de lote con fecha de caducidad pasada | Bloqueo en sistema, cambio de lote, auditoría de bodega |
| `ADVERSE_REACTION` | CRITICAL / HIGH | Reacción anafiláctica, edema facial, shock o letargo agudo | Manejo médico de urgencia, registro clínico, reporte ICA |
| `UNAUTHORIZED_DISPENSATION`| HIGH | Intento de aplicación sin plan médico aprobado por veterinario | Bloqueo por procedimiento almacenado, alerta a dirección |

## 2. Flujo de Vida del Incidente
```
[ Incidente Detectado ] ──► [ OPEN ] ──► [ UNDER_INVESTIGATION ] ──► [ RESOLVED ]
```
- **OPEN:** Generado automáticamente por disparador de base de datos o reportado por el veterinario en campo.
- **UNDER_INVESTIGATION:** En revisión por el Dr. Luis Eduardo Ríos, auditoría de lote y seguimiento al paciente.
- **RESOLVED:** Cerrado con dictamen médico, medidas correctivas documentadas y reporte a entidades sanitarias si corresponde.

## 3. Protocolo de Reacción Adversa Post-Vacunal
1. Si un paciente presenta signos de hipersensibilidad o anafilaxia:
   - Atención médica inmediata en domicilio o traslado de emergencia según criterio veterinario.
   - Registro obligatorio en `preventive_care_application_records` con `adverse_reaction_observed = true`.
   - Generación de alerta crítica en el expediente del paciente para contraindicar futuros usos del mismo lote o componente antigénico sin premedicación o titulación previa.
   - Notificación oficial al laboratorio fabricante y al ICA según protocolo de farmacovigilancia veterinaria de Colombia.
