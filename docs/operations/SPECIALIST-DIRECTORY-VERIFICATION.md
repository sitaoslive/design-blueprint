# VET FREEDOM OS — SPECIALIST DIRECTORY VERIFICATION SOP
## Procedimiento Operativo Estándar: Verificación, Homologación y Auditoría del Directorio de Especialistas
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tabla Maestra:** `specialist_profiles`  

---

## 1. Criterios de Homologación de Especialistas Externos

Para que un médico especialista o centro de diagnóstico sea activado en el sistema (`verification_status = 'VERIFIED_ACTIVE'`), el equipo de coordinación debe certificar:

1. **Tarjeta Profesional Vigente:** Verificación en el registro oficial de COMVEZCOL del médico especialista titular.
2. **Sede Física Verificada:** Dirección comprobada dentro de la cobertura metropolitana de Bogotá o municipios aledaños.
3. **Canal de Contacto Empresarial Oficial:** Número de teléfono verificado atendido por recepción o asistente médico.
4. **Tarifario Homologado:** Definición explícita de tarifa estándar (`standard_tariff`), vigencia de precios y acuerdos de atención preferencial.
5. **Modo de Disponibilidad Definido:** Definición de si opera por calendario compartido (`SHARED_CALENDAR`) o mensajería asíncrona (`MESSAGING`).

---

## 2. Estados de Verificación en `specialist_profiles`

- `PENDING_VERIFICATION`: Registro nuevo en proceso de recolección de documentos. Bloqueado para asignación automática.
- `VERIFIED_ACTIVE`: Profesional completamente habilitado para recibir remisiones y consultas de agenda.
- `INACTIVE`: Profesional que no presta servicios temporal o definitivamente. Bloqueado.
- `SUSPENDED_REVIEW`: Perfil en revisión por inconsistencias en reportes clínicos o quejas de clientes.

---

## 3. Asignación de Especialistas de Respaldo (`is_backup`)

Cada especialidad clínica de alta demanda (Cardiología, Neurología, Dermatología, Oncología, Oftalmología) debe contar con al menos un perfil marcado con `is_backup = true`.  
En caso de que el especialista titular no responda en la ventana límite de 24 horas (`AVAILABILITY_EXPIRED`), el sistema propone al especialista de respaldo de forma inmediata.
