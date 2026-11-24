# VET FREEDOM OS — MENSAJERÍA DE EXPERIENCIA DEL CLIENTE

## 1. Plantillas de Comunicación en Español Colombiano
- **Invitación a Seguimiento Posvisita (WhatsApp):**
  > "Hola {{client_name}}, te saluda el equipo de Vet Life. Esperamos que {{pet_name}} se encuentre muy bien tras la consulta de ayer con el Dr. Luis Eduardo Ríos. ¿Cómo calificarías tu experiencia con nuestro servicio a domicilio del 1 al 10?"
- **Respuesta ante Preocupación Médica (Inmediata y Segura):**
  > "Entendido, {{client_name}}. Hemos informado de inmediato al Dr. Luis Eduardo Ríos sobre los síntomas de {{pet_name}} para que revise el caso a la mayor brevedad. Si se trata de una urgencia vital, por favor acude de inmediato a un centro de urgencias 24h."
- **Invitación Neutral a Reseña Pública Google (Sin Review Gating):**
  > "Hola {{client_name}}, en Vet Life valoramos la transparencia y la opinión sincera de nuestros tutores. Si deseas compartir tu experiencia sobre nuestro servicio veterinario a domicilio en Google, puedes hacerlo en este enlace: https://g.page/r/vet-life-domicilio/review. ¡Muchas gracias!"

## 2. Invariante Safe Mode
Durante pruebas y QA, ningún mensaje es despachado a la red de telefonía o WhatsApp. Todos los eventos se registran como `QUEUED_SAFE_MODE` con `send_enabled: false`.
