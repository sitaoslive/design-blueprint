# VET FREEDOM OS — PREVENTION MESSAGING CONTRACT
## Plantillas de WhatsApp, Supresiones y Gobernanza de Contacto
**Módulo:** VET-CORE-10  
**Interacción:** n8n Workflow `T2KxP7OvRZuFYVTF` $\rightarrow$ VET-CORE-03 (WhatsApp Outbound)  

---

## 1. Plantillas Homologadas de WhatsApp Business Platform

Todas las comunicaciones preventivas hacia los tutores se basan estrictamente en plantillas preaprobadas por Meta:

### 1. `vet_preventive_plan_welcome`
> *"Hola {{client_name}}, el Dr. Luis Ríos ha estructurado el plan de salud preventivo individualizado para {{pet_name}}. Puedes consultar las fechas y próximos controles en cualquier momento."*

### 2. `vet_preventive_due_date_reminder`
> *"Hola {{client_name}}, te recordamos que según el plan preventivo de {{pet_name}}, su próximo control de {{prevention_type}} vence el {{due_date}}. ¿Deseas que coordinemos una visita domiciliaria?"*

### 3. `vet_preventive_application_confirmed`
> *"Estimado(a) {{client_name}}, confirmamos que la aplicación de {{prevention_type}} para {{pet_name}} ha sido realizada y certificada exitosamente por el médico veterinario con registro oficial en OKVET."*

---

## 2. Reglas de Supresión Innegociables

Antes de enviar cualquier mensaje, el sistema evalúa de forma determinística:
1. **Protocolo de Duelo (`is_bereaved = true`):** Supresión total de campañas comerciales o preventivas ante la pérdida reciente de una mascota.
2. **Consentimiento Expreso (`has_consent = false`):** Respeto estricto a las políticas de privacidad y opt-out del tutor.
3. **Cuidadores Revocados (`caregiver_revoked = true`):** Bloqueo inmediato de envíos a terceras personas desautorizadas.
4. **Límite de Frecuencia (`frequency_cap_exceeded = true`):** Protección contra saturación de mensajería (máximo 1 recordatorio preventivo por semana para la misma mascota).
