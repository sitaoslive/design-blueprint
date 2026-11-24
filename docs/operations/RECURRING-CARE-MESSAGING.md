# VET FREEDOM OS — RECURRING CARE MESSAGING
## Gobernanza de Comunicaciones Seguras y Plantillas WhatsApp
**Módulo:** VET-CORE-09  
**Interacción:** n8n Workflow `iY1wZT6twRq77eZZ` $\rightarrow$ VET-CORE-03 (WhatsApp Outbound)  

---

## 1. Plantillas Homologadas de WhatsApp Business Platform

Todas las comunicaciones hacia los tutores utilizan exclusivamente plantillas preaprobadas por Meta:

### 1. `vet_recurring_plan_welcome`
> *"Estimado(a) {{client_name}}, le damos la bienvenida al plan de cuidado recurrente de Vet Life para {{pet_name}}. El Dr. Luis Ríos ha estructurado un protocolo de {{total_sessions}} sesiones para garantizar su bienestar y estabilidad clínica."*

### 2. `vet_recurring_session_reminder` (48h y 24h)
> *"Hola {{client_name}}, te recordamos que la sesión #{{session_number}} de {{pet_name}} está programada para el {{session_date}} en la franja acordada. Por favor, asegúrate de mantener a {{pet_name}} en un espacio tranquilo y cómodo."*

### 3. `vet_recurring_substitute_notice`
> *"Estimado(a) {{client_name}}, le informamos que la próxima sesión de {{pet_name}} será atendida por el/la {{backup_vet_name}}, profesional médico habilitado(a) del equipo de Vet Life, continuando estrictamente el protocolo clínico establecido."*

---

## 2. Política de Safe Mode en Desarrollo

En consonancia con las directrices irrenunciables del proyecto:
- El campo `send_enabled` se fija invariablemente en `false` en todas las ejecuciones.
- Cero mensajes de prueba o simulación se transmiten a líneas telefónicas de tutores reales.
- Los despachos se encolan con clave de idempotencia (`idempotency_key`) para evitar duplicaciones por reconexión.
