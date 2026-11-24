# VET FREEDOM OS — MODELO DE FUENTES DE VERDAD Y PROPIEDAD DE DATOS (DATA OWNERSHIP)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Sección Normativa:** 03 del Prompt Maestro de Implementación  

---

## 1. Principio Rector
Para garantizar la seguridad del paciente, la validez médico-legal y la integridad operativa, ningún sistema asume autoridad sobre datos ajenos a su competencia técnica y jurídica. La propiedad de los datos se rige por la siguiente separación estricta:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          OKVET (EXPEDIENTE OFICIAL)                    │
│   • Historias clínicas oficiales       • Indicaciones profesionales    │
│   • Diagnósticos y tratamientos        • Confirmaciones oficiales citas│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Conciliación Asistida
┌───────────────────────────────────▼────────────────────────────────────┐
│                       SUPABASE (CEREBRO OPERATIVO)                     │
│   • Solicitudes y agenda operativa     • Rutas, tiempos y traslados    │
│   • Conversaciones y CRM (CEM)         • Aprobaciones y simulaciones   │
│   • Usuarios, roles y permisos RLS     • Bus de eventos e idempotencia │
└───────────────────────┬────────────────────────────┬───────────────────┘
                        │ Reconciliación             │ Conciliación
┌───────────────────────▼────────────┐      ┌────────▼───────────────────┐
│           GOOGLE CALENDAR          │      │           FINANZAS         │
│   • Bloques externos de médicos    │      │   • Facturación legal DIAN │
│   • Disponibilidad personal        │      │   • Conciliación bancaria  │
│   • Modo estricto BUSY_ONLY        │      │   • Nequi / Bre-B en COP   │
└────────────────────────────────────┘      └────────────────────────────┘
```

---

## 2. Definición Detallada de Fuentes de Verdad

### 2.1 OKVET — Autoridad Clínica Oficial
OKVET es la única fuente de verdad autorizada para:
1. **Expedientes Clínicos:** Historias médicas oficiales, notas de evolución, antecedentes patológicos y registros vacunales.
2. **Prescripciones y Fórmulas:** Dosis, posología y medicamentos autorizados por un médico veterinario matriculado.
3. **Confirmaciones Clínicas:** Toda cita que requiera validación clínica o procedimiento quirúrgico/especializado exige confirmación asistida en OKVET antes de considerarse en firme.

> [!CAUTION]
> Vet Freedom OS, Antigravity, n8n y Lovable tienen **terminantemente prohibido** diagnosticar, formular medicamentos o alterar historias clínicas oficiales mediante IA o webhooks autónomos.

### 2.2 Supabase — Fuente Operativa Empresarial
Supabase (PostgreSQL 17) es la fuente de verdad para la operación domiciliaria:
1. **Solicitudes de Citas:** Ingesta inicial vía WhatsApp, web o teléfono con estados de transición operativa.
2. **Conversaciones y Triage:** Historial de mensajería, detección de intenciones y bloqueo de bots (`bot_lock`).
3. **Gestión de Personal:** Perfiles, turnos, ausencias, zonas geográficas asignadas y competencias profesionales.
4. **Rutas y Desplazamientos:** Secuencia de paradas, tiempos de viaje estimados, alertas de tráfico en Bogotá.
5. **Centro de Decisiones y Simulaciones:** Propuestas administrativas, impacto económico estimado, versiones de agenda y bitácora de aprobaciones del Dr. Luis Ríos.
6. **Customer Experience Memory (CEM):** Preferencias del tutor, datos de cuidadores autorizados, protocolos de mascotas nerviosas y protocolos de duelo.
7. **Bus de Eventos Transaccional:** `transactional_outbox` con claves de idempotencia únicas y retención auditable.

### 2.3 Google Calendar — Disponibilidad Externa
1. **Sincronización Unidireccional Filtrada:** Conexión mediante OAuth individual por profesional.
2. **Modo Estricto BUSY_ONLY:** Los eventos personales del calendario externo se importan exclusivamente como *"OCUPADO / NO DISPONIBLE"*. Jamás se copian detalles personales a la base de datos de Vet Life.
3. **Regla de Protección de Citas:** Una eliminación o modificación accidental en Google Calendar **NUNCA** cancela de forma autónoma una cita confirmada en Supabase u OKVET. Se registra una alerta de discrepancia para revisión humana.

### 2.4 Finanzas — Conciliación de Recaudos
1. **Valores Oficiales:** Todo valor monetario se almacena y calcula en Pesos Colombianos (`COP`).
2. **Estados de Recaudo:**
   - `INVOICED`: Facturado operativamente.
   - `PENDING_VERIFICATION`: Comprobante de transferencia (Nequi, Daviplata, Bre-B) cargado por el tutor o veterinario.
   - `VERIFIED`: Comprobante validado administrativamente contra extracto bancario.
   - `RECONCILED`: Saldo cruzado en el cierre contable del negocio.
3. **Regla Financiera:** Ningún pago registrado manualmente o mediante captura de pantalla se considera automáticamente conciliado hasta su verificación formal.

---

## 3. Servicio de Control y Reconciliación de Contradicciones

El servicio `ContradictionReconciliationService` (`src/core/services/contradiction-reconciliation-service.ts`) audita periódicamente las discrepancias entre fuentes:

1. **Cita en Discrepancia:** Confirmada en Supabase pero en estado pendiente en OKVET $\rightarrow$ Alerta y asignación de confirmación asistida a Coordinación.
2. **Desfase Horario:** Cita con horario diferente entre la agenda operativa y el evento externo $\rightarrow$ Solicitud de confirmación telefónica.
3. **Doble Asignación:** Dos citas en la misma ventana horaria para el mismo veterinario $\rightarrow$ Alerta crítica para reprogramación inmediata.
4. **Profesional Ausente con Visitas:** Cita confirmada asignada a un veterinario con ausencia registrada $\rightarrow$ Disparo automático de simulación de reemplazo en el Centro de Aprobaciones.
5. **Remisión sin Respaldo:** Remisión de especialista marcada como confirmada sin número de radicado o confirmación formal $\rightarrow$ Tarea para validar con el centro de remisión.
6. **Abandono Terapéutico:** Tratamiento recurrente aprobado con más de 2 días de atraso $\rightarrow$ Alerta clínica para recontacto del paciente.
