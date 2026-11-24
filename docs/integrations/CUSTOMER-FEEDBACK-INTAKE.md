# VET FREEDOM OS — INGESTA MULTICANAL DE FEEDBACK

## 1. Canales Soportados
1. **WhatsApp Conversacional (CORE-03):** Encuesta interactiva mediante mensajes estructurados y botones de respuesta rápida (Escala 1 a 10).
2. **Web / Portal Lovable:** Formulario web responsive protegido con enlace firmado y token de expiración de 72 horas.
3. **Recepción Telefónica / Manual:** Registro por parte de soporte o recepción en caso de llamada directa del tutor.

## 2. Idempotencia y Normalización
- Los números telefónicos se procesan obligatoriamente en formato internacional **E.164** (ej. `+573145556677`).
- Los puntajes numéricos son validados estrictamente en el rango entero [0..10].
- Los textos son sanitizados para evitar inyecciones SQL o scripts en el portal administrativo.
