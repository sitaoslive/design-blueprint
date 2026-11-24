# VET FREEDOM OS — EXTERNAL BOOKING VERIFICATION SOP
## Procedimiento Operativo: Verificación de Citas Externas, Registro de Evidencia y Superación del Gate
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tabla:** `specialist_external_confirmations`  

---

## 1. Obligaciones del Coordinador de Remisiones

El personal de coordinación de Vet Freedom OS es el guardián humano del **Gate de Evidencia Externa**. Antes de ejecutar `confirm_external_specialist_booking`, el coordinador debe:

1. **Obtener el Código o Radicado Oficial:** Solicitar a la clínica receptora el identificador único de la cita en su sistema o software médico.
2. **Confirmar Datos del Paciente:** Verificar que la clínica haya agendado a nombre del tutor y con la especie/raza correcta.
3. **Validar Preparación Especial:** Registrar si el paciente requiere ayuno (ecografía/anestesia), vejiga llena o suspensión temporal de medicamentos.
4. **Asentar la Evidencia:** Ingresar en el sistema el número de radicado, nombre de la persona que confirmó y notas pertinentes.

---

## 2. Checklist para Superación del Gate

- [ ] ¿El código de reserva externa es legítimo y no ha sido utilizado previamente?
- [ ] ¿La fecha y hora en el sistema externo coincide exactamente con la seleccionada por el cliente?
- [ ] ¿La remisión se encuentra en estado `EXTERNAL_BOOKING_PENDING` o `EXTERNAL_HOLD_CONFIRMED`?
- [ ] ¿El perfil del especialista asignado está en estado `VERIFIED_ACTIVE`?
- [ ] ¿Se cuenta con el resumen clínico debidamente aprobado para adjuntar a la confirmación?
