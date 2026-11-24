# VET FREEDOM OS — SPECIALIST CANCELLATION OPERATIONS SOP
## Procedimiento Operativo: Cancelación de Citas con Especialistas y Mitigación de Falsos Estados
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tabla:** `specialist_appointment_cancellations`  

---

## 1. Protocolo de Cancelación Segura

Para evitar que un tutor asuma erróneamente que una cita fue anulada cuando la clínica sigue esperando al paciente (o viceversa):

1. **Solicitud de Cancelación:** Se registra en `specialist_appointment_cancellations` en estado `PENDING_EXTERNAL_CANCELLATION`.
2. **Conciliación con la Clínica:** El coordinador contacta a la clínica para liberar el cupo y obtiene el código de cancelación oficial (`external_cancellation_code`).
3. **Confirmación Externa:** El registro transita a `EXTERNALLY_CONFIRMED`.
4. **Revocación de Accesos Documentales:** Todos los tokens de acceso activo para esa cita se marcan como revocados (`is_revoked = true`).
5. **Aviso al Tutor:** Se emite mensaje de confirmación de anulación solo tras contar con la confirmación de la clínica.
6. **Supresión de Recordatorios:** Cualquier recordatorio encolado en VET-CORE-03 o VET-CORE-07 queda inmediatamente cancelado.
