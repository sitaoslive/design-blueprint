# CONTROL DE COSTOS Y GESTIÓN DE PLANTILLAS META (COST CONTROLS)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-03 | WhatsApp Cost & Tier Management`  
**Moneda Oficial:** Pesos Colombianos (COP) / USD Meta Pricing  
**Zona Horaria:** `America/Bogota` (UTC-5)

---

## 1. Modelo de Precios de Meta WhatsApp Cloud API (Conversaciones por Categoría)
Desde el esquema de tarifas por conversación de Meta para Colombia:
- **Conversaciones de Servicio (Customer Service Window de 24 horas):** Gratuitas cuando el tutor inicia la conversación y la clínica responde dentro de la ventana de 24 horas. (Existen hasta 1.000 conversaciones de servicio gratuitas mensuales por WABA).
- **Conversaciones de Utilidad (`UTILITY`):** Costo por conversación iniciada con plantilla de utilidad (aprox. $0.0080 USD / ~32 COP). Aplican para confirmaciones, recordatorios, avisos de ruta y seguimiento médico.
- **Conversaciones de Marketing (`MARKETING`):** Tarifa más elevada (aprox. $0.0125 USD / ~50 COP). Aplican para campañas promocionales y solicitudes de reseñas en Google (`TPL-17`).
- **Conversaciones de Autenticación (`AUTHENTICATION`):** Códigos OTP (aprox. $0.0040 USD / ~16 COP).

---

## 2. Estrategias de Optimización y Ahorro en Vet Freedom OS

### Regla 1: Agrupación en Ventana Abierta de 24 Horas
- Cuando el tutor envía cualquier mensaje, el procedimiento `update_whatsapp_conversation_window` marca la ventana como abierta por 24 horas exactas.
- Durante estas 24 horas, **TODAS las respuestas operativas, consultas de seguimiento o aclaraciones se envían en texto libre sin costo adicional de plantilla Meta**.
- El despachador `VET-CORE-03` prioriza automáticamente el texto libre mientras la ventana esté vigente.

### Regla 2: Supresión de Mensajes Redundantes
- Se prohíbe el envío múltiple de recordatorios. Solo se programa **un único recordatorio 24 horas antes** (`TPL-03`).
- Si el tutor ya confirmó o interactuó dentro de las últimas 12 horas, el recordatorio es suprimido automáticamente por la lógica de negocio para ahorrar costos y evitar spam.

### Regla 3: Monitoreo de Presupuesto Mensual
- Presupuesto mensual asignado para Meta WhatsApp Cloud API: **$100.000 COP / mes (~$25 USD)**.
- Umbral de alerta en `VET-CORE-20`: Si el gasto acumulado del mes alcanza el 80% ($80.000 COP), se emite una alerta preventiva al Dr. Luis Eduardo Ríos.
- Si se alcanza el 100%, se restringen los envíos no críticos de marketing y solo se autorizan confirmaciones vitales de citas agendadas y avisos de urgencia.
