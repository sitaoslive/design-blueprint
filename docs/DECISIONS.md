# VET FREEDOM OS — REGISTRO DE DECISIONES ARQUITECTÓNICAS (DECISIONS)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Última Actualización:** 2026-11-20  

---

## 1. Registro de Decisiones de Arquitectura

### DEC-001: Mantenimiento del Workspace Único
- **Fecha:** 2026-11-20  
- **Contexto:** Existían instrucciones de no crear múltiples carpetas de proyecto ni duplicar workspaces.  
- **Decisión:** Operar en el workspace único `c:\Users\Freud\N8NVET` reutilizando la conexión establecida con n8n y Supabase.  
- **Consecuencia:** Continuidad absoluta de la memoria y evitación de pérdida de configuración.

### DEC-002: Separación Estricta de Autoridad Clínica (OKVET vs Supabase)
- **Fecha:** 2026-11-20  
- **Contexto:** Riesgo de invasión de competencias médico-legales mediante IA o automatizaciones.  
- **Decisión:** OKVET conserva la exclusividad del expediente médico oficial, diagnósticos y confirmaciones clínicas. Supabase gestiona la operación, rutas y agenda. Se implementó un protocolo de confirmación asistida en dos pasos.  
- **Consecuencia:** Cero riesgo de prescripciones o diagnósticos autónomos por IA. Cumplimiento con COMVEZCOL.

### DEC-003: Política de Conexión de Workflows n8n con Doble Trigger
- **Fecha:** 2026-11-20  
- **Contexto:** Los workflows necesitaban ejecutarse tanto en pruebas interactivas en n8n como en producción vía Webhooks REST.  
- **Decisión:** Incorporar en cada workflow un nodo `Webhook` oficial para producción y un `Manual Trigger` con datos simulados, unidos a un extractor resiliente (`raw.body || raw`).  
- **Consecuencia:** 100% de los workflows son testeables unitariamente y están listos para recibir webhooks de Supabase en producción.

### DEC-004: Retraso de Asignación de Error Workflow hasta Publicación
- **Fecha:** 2026-11-20  
- **Contexto:** n8n Cloud rechaza configurar `errorWorkflow` si el workflow de error (`VET-CORE-19`) no está publicado como activo. Las reglas del proyecto prohíben publicar antes de la autorización del Director.  
- **Decisión:** Mantener `errorWorkflow` documentado y preparado para su asignación atómica al momento del pase a producción (`publish_workflow`).  
- **Consecuencia:** Cumplimiento de la restricción del motor n8n respetando el modo seguro (`active: false`).

### DEC-005: Versionado Concurrente en Propuestas Administrativas (E2E-11)
- **Fecha:** 2026-11-20  
- **Contexto:** Si Luis tarda en aprobar una reorganización de visitas desde su celular, la agenda puede haber cambiado mientras tanto.  
- **Decisión:** Toda propuesta almacena `baseStateVersion`. Al momento de aprobar, el sistema compara la versión base contra la versión actual del ecosistema. Si cambiaron las citas, se rechaza con error `Conflicto de versión` y exige recalcular.  
- **Consecuencia:** Imposibilidad matemática de sobreescribir citas modificadas concurrentemente.

### DEC-006: Persistencia de Órdenes con Resumen Granular de Resultados
- **Fecha:** 2026-11-20  
- **Contexto:** Una respuesta HTTP 200 de un webhook no significa que todos los cambios de una orden de reprogramación se hayan consolidado.  
- **Decisión:** Crear `ExecutionRecoveryEngine`, donde cada orden rastrea el estado individual de cada paso y produce un resumen granular (ej. "Dos cambios confirmados. Uno espera respuesta del cliente y otro requiere actualización en OKVET").  
- **Consecuencia:** La Asistente Ejecutiva de Luis reporta la verdad operativa real, sin asumir triunfos prematuros.


### DEC-038: Motor de Descubrimiento Autónomo de Pacientes WhatsApp y Conciliación con OKVET (WA-PATIENT-05D)
- **Fecha:** 2026-11-22  
- **Contexto:** Detección de pacientes caninos atendidos o consultados vía WhatsApp empresarial que no se encuentran regularizados en la historia clínica oficial de OKVET Cloud.
- **Decisión:** Implementar un motor autónomo con ciclo rodante de 5 días en n8n (`WA-PATIENT-05D`, ID `IRnxi32jnYdWxsjj`), respaldado por la migración 045 en Supabase (`whatsapp_patient_candidates`, `okvet_snapshot_metadata`) y un panel de decisión exclusivo para el Dr. Luis Eduardo Ríos en `/admin/pacientes/descubrimiento`.
- **Garantías de Seguridad:**
  1. No crea pacientes clínicos automáticamente; genera tareas operativas asistidas (`operational_tasks`).
  2. Snapshot con antigüedad mayor a 5 días bloquea reclamos de no registro (`OKVET_SNAPSHOT_STALE`).
  3. No fusiona homónimos caninos con teléfonos distintos.
  4. Redacta PII (cédulas colombianas, tarjetas, cuentas bancarias) antes de almacenar fragmentos de evidencia.
  5. Mantiene safe mode (`send_enabled: false`).
- **Consecuencia:** Auditoría sistemática y no intrusiva de conversaciones comerciales, asegurando el ingreso clínico y la regularización formal en OKVET sin invadir competencias médico-legales.
