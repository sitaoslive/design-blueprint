# POLÍTICA DE EXCLUSIÓN Y CONSENTIMIENTO (OPT-OUT POLICY)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-03 | WhatsApp Compliance`  
**Legislación:** Ley 1581 de 2012 (Habeas Data Colombia) y Decreto 1377 de 2013

---

## 1. Captura de Consentimiento (Opt-In)
- **Canal Presencial:** Durante la consulta domiciliaria, el tutor firma la autorización de tratamiento de datos en la hoja de consentimiento digital.
- **Canal Digital:** Al iniciar conversación vía WhatsApp o agendar por el portal web, se presenta la política de privacidad y se solicita aceptación expresa.
- **Registro en BD:** El consentimiento se almacena con marca de tiempo precisa en `public.owners.has_whatsapp_consent = true` y `public.owners.consent_timestamp`.

---

## 2. Mecanismo de Revocación (Opt-Out)
El tutor puede revocar su consentimiento en cualquier momento mediante las siguientes vías:
1. **Palabras Clave en WhatsApp:** Si el tutor envía términos como `NO MAS`, `BAJA`, `STOP`, `CANCELAR MENSAJES`, el motor de recepción `VET-CORE-02` inserta automáticamente un registro en `public.whatsapp_contact_suppressions` con motivo `OPT_OUT_MARKETING` y emite el evento `contact.marketing_opt_out`.
2. **Solicitud Verbal o Escrita:** El tutor puede solicitar la exclusión al Dr. Luis Eduardo Ríos o a coordinación médica, quienes registran la baja desde el panel de control de Lovable.

---

## 3. Matriz de Exclusión por Categoría de Mensaje

| Categoría de Mensaje | Ejemplo | Efecto ante Opt-Out Activo | Justificación Legal |
| :--- | :--- | :---: | :--- |
| `MARKETING` | Recordatorio de promociones de baños, campañas de desparasitación estacional o solicitud de reseñas en Google (`TPL-17`). | **BLOQUEADO INMEDIATAMENTE** | Mensajes de carácter comercial requieren consentimiento vigente e inequívoco. |
| `UTILITY` | Confirmación de cita médica domiciliaria agendada por el tutor (`TPL-02`), aviso de veterinario en camino (`TPL-07`), o fórmula médica emitida tras consulta (`TPL-14`). | **PERMITIDO** | Mensajes de ejecución contractual y necesidad operativa requeridos para la adecuada prestación del servicio de salud animal. |
| `AUTHENTICATION` | Código de verificación de inicio de sesión en el portal de tutores de Vet Life. | **PERMITIDO** | Solicitado expresamente por el usuario para acceso seguro. |
| `BEREAVEMENT` | Notificaciones automáticas de cualquier tipo cuando la mascota ha fallecido. | **BLOQUEADO AL 100%** | Respeto a la dignidad y sensibilidad del tutor en duelo. Solo se permite comunicación humana personalizada y solidaria. |
