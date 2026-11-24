# SEGURIDAD Y PRIVACIDAD EN MENSAJERÍA SALIENTE WHATSAPP (VET-CORE-03)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-03 | WhatsApp Outbound Security`  
**Cumplimiento Normativo:** Ley Estatutaria 1581 de 2012 (Habeas Data Colombia) + Meta Business Messaging Policy

---

## 1. Controles Obligatorios de Privacidad y Consentimiento

### A. Verificación Previa de Consentimiento (Opt-In Obligatorio)
- Todo mensaje saliente exige que el tutor posea un registro de consentimiento explícito (`has_consent = true`).
- En ausencia de consentimiento comprobable, la función `claim_authorized_outbound_message` aborta la operación y marca el mensaje como `REJECTED` con código de error `CONSENT_MISSING`.

### B. Protocolo de Duelo y Protección de Sensibilidad (Bereavement Shield)
- Si una mascota fallece o el tutor se encuentra en proceso de duelo, la relación se marca con supresión activa `BEREAVEMENT`.
- Los mensajes automáticos dirigidos a dicho tutor quedan estrictamente cancelados (`CANCELLED_BEREAVEMENT`).
- Esto evita el envío traumático de recordatorios de vacunación o mensajes promocionales a tutores en duelo.

### C. Exclusión de Mensajes Comerciales (Opt-Out de Marketing)
- El tutor puede revocar su consentimiento para mensajes comerciales enviando palabras clave (`NO MAS`, `BAJA`, `STOP`).
- Cuando se registra `OPT_OUT_MARKETING`, cualquier mensaje de categoría `MARKETING` es suprimido de inmediato (`CANCELLED_OPT_OUT`).
- Los mensajes transaccionales/operativos (`UTILITY`), tales como confirmaciones de citas agendadas por el tutor o enlaces de pago solicitados, permanecen autorizados por necesidad de servicio.

---

## 2. Prevención de Stale AI Drafts y Anti-Colisión con Asesores Humanos
- Si un veterinario o asesor de soporte toma el control manual del chat (`is_bot_locked = true`), cualquier borrador de mensaje pendiente generado por un agente de IA es cancelado automáticamente (`AI_SUPPRESSED_HUMAN_CONTROL_ACTIVE`).
- Si el estado de la conversación avanzó de versión entre la generación del borrador y el momento del despacho (`draft_state_version != current_state_version`), el mensaje se descarta por incompatibilidad de contexto (`AI_DRAFT_STATE_MISMATCH`).

---

## 3. Seguridad de Datos Clínicos y Financieros
- **Cero Datos de Tarjeta en Tránsito:** Vet Life nunca solicita números de tarjeta de crédito, fechas de vencimiento ni códigos de seguridad CVV a través de WhatsApp. Los cobros se realizan exclusivamente mediante enlaces de pago oficiales de PSE integrados (`TPL-18`).
- **Enmascaramiento de Logs:** En todas las herramientas de observabilidad y registros de auditoría de n8n, los números de teléfono se anonimizan (`+57310***0199`) y los datos médicos específicos se aíslan del texto libre de la traza.
- **Protección de Credenciales Meta:** El token de acceso a Meta Graph API (`META_WABA_TOKEN`) se almacena en variables de entorno cifradas de n8n Cloud y nunca se expone en código fuente ni repositorios de GitHub.

---

## 4. Modo Seguro (Safe Mode)
- **Regla Irrenunciable:** En los entornos de desarrollo y pruebas, el parámetro `send_enabled` se mantiene forzosamente en `false`.
- El flujo desvía toda solicitud aprobada hacia el nodo de simulación sintética `Simulate Safe Provider Dispatch`, previniendo de manera infalible el despacho de mensajes de prueba a tutores reales o números de teléfono de producción.
