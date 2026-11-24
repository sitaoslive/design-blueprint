# VET FREEDOM OS — RUNBOOK: CONFIRMACIÓN ASISTIDA EN OKVET
## Procedimiento Asistido para Médicos Veterinarios, Radicación y Cierre Clínico

---

### 1. Responsabilidad Profesional Médica

En la República de Colombia, la historia clínica veterinaria es un documento privado, obligatorio y sometido a reserva legal conforme a la Ley 576 de 2000 (Código de Ética para el Ejercicio de la Medicina Veterinaria).

- **Responsable Médico**: Dr. Luis Eduardo Ríos (Matrícula COMVET certificada).
- **Herramienta Oficial**: OKVET.
- **Prohibición**: Ningún asistente virtual, agente de software ni personal administrativo puede firmar ni cerrar una historia clínica médica en OKVET.

---

### 2. Flujo Operativo Paso a Paso para el Médico

1. **Atención Presencial de la Mascota**:
   El médico realiza la consulta domiciliaria, diligencia los datos clínicos, aplica vacunas/medicamentos y emite las recomendaciones al tutor.
2. **Ingreso de Información a OKVET**:
   Al concluir la jornada o entre visitas, el Dr. Ríos ingresa a la plataforma oficial de OKVET desde su equipo autorizado, registra el motivo de consulta, diagnóstico presuntivo/definitivo, anamnesis, constantes fisiológicas y tratamiento prescrito.
3. **Obtención del Número de Radicado Oficial**:
   OKVET genera el número de historia y radicado formal de atención (ej. `OKVET-2026-HC-88912`).
4. **Confirmación en VET FREEDOM OS (Lovable UI)**:
   El Dr. Ríos abre la tarea de confirmación correspondiente a la cita en el Centro de Control de Lovable:
   - Selecciona la cita y el paciente canónico.
   - Introduce el número de radicado oficial de OKVET.
   - Adjunta el extracto o PDF de la historia clínica exportado de OKVET (si aplica).
   - Firma digitalmente la confirmación con su PIN o contraseña de médico veterinario.
5. **Cierre y Habilitación de Entregables**:
   El sistema valida el radicado, actualiza la cita a `CLINICALLY_CONFIRMED` y desbloquea el envío de la fórmula médica y recordatorios de prevención (VET-CORE-10 y VET-CORE-13).
