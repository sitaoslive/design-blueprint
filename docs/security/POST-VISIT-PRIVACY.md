# VET FREEDOM OS — POST-VISIT DATA PRIVACY & COMPLIANCE
## Privacidad de Datos, Tratamiento de Información Sensible y Protección en Continuidad
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS & CONTINUITY HUB  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Marco Legal:** Ley 1581 de 2012, Decreto 1377 de 2013 (Habeas Data Colombia), Ley 576 de 2000 (Código de Ética Médico Veterinaria y Zootecnia)  

---

## 1. Principios Rectores en la Atención Post-Visita

1. **Confidencialidad de la Historia Clínica:** Los registros de compromisos post-visita, diagnósticos preliminares, remisiones a especialistas y reportes de laboratorio constituyen información reservada y protegida por el secreto profesional médico veterinario (Ley 576 de 2000).
2. **Minimización de Datos:** Las notificaciones al tutor vía WhatsApp u otros canales contienen únicamente la información necesaria para el cumplimiento del compromiso (fecha, hora, tipo de requerimiento e instrucciones de preparación), omitiendo terminología diagnóstica alarmista o datos clínicos innecesarios en canales no cifrados de extremo a extremo con el equipo.
3. **Consentimiento Informado del Tutor:** Cualquier interacción posterior con terceros (laboratorios, centros de imagenología o especialistas) requiere consentimiento expreso del tutor registrado en la visita.

---

## 2. Salvaguarda de Duelo y Contención Compasiva (WFX-013)

La pérdida de un paciente veterinario activa de manera prioritaria el protocolo de duelo, gobernado por las siguientes reglas estrictas:

1. **Detección Atómica:** Si en el checklist de la visita, en el registro clínico o en la interacción se marca `is_bereaved = true` o se identifica el deceso del paciente:
   - Se suprimen y cancelan inmediatamente todos los compromisos pendientes de carácter operativo, preventivo o comercial.
   - Se desactivan las alertas de recordatorios de citas, desparasitaciones, vacunas o revisiones posteriores.
   - El caso post-visita transiciona al estado `CLOSED_BEREAVEMENT`.
2. **Auditoría y Notificación Interna:** Se genera un aviso interno de alta prioridad para que el Dr. Luis Eduardo Ríos o el equipo veterinario emita una comunicación compasiva personalizada y libre de automatizaciones frías o plantillas transaccionales.

---

## 3. Control de Tutores y Cuidadores Revocados

1. **Validación de Identidad Previa a Notificación:** Antes de despachar cualquier recordatorio o información sobre compromisos pendientes, el sistema consulta `clients` y `pet_caregivers` para verificar que el destinatario sea el tutor principal vigente o un cuidador formalmente autorizado.
2. **Manejo de Revocación (`caregiver_revoked = true`):**
   - Si un tutor revoca la autorización a un tercero (ej. cuidador temporal o paseador), cualquier compromiso asignado a dicho número telefónico es revocado instantáneamente.
   - Se redespacha la notificación exclusivamente al tutor titular.

---

## 4. Privacidad en Extracción Asistida por IA (IA Guard)

1. **Aislamiento de Prompts:** Los modelos de lenguaje utilizados para sugerir compromisos a partir de notas de voz o transcripciones de visita operan bajo políticas empresariales de cero retención de datos para entrenamiento.
2. **Ofuscación de Datos Personales Identificables (PII):** Antes de enviar transcripciones al LLM, se ofuscan números de identificación, direcciones físicas exactas y datos de contacto directo.
3. **Prohibición de Emisión Directa:** Ninguna promesa extraída por IA puede ser enviada o confirmada al cliente sin la revisión y firma explícita del médico veterinario asignado.
