# VET FREEDOM OS — SPECIALIST OFFERS OPERATIONS SOP
## Procedimiento Operativo: Generación, Despacho y Recepción de Selecciones de Ofertas de Especialistas
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tablas:** `specialist_option_offers`, `specialist_option_offer_items`, `specialist_offer_selections`  

---

## 1. Composición de una Oferta al Tutor

Cada oferta de consulta con especialista debe presentarse de manera clara y transparente al tutor, conteniendo:

- **Identificación del Profesional y Clínica:** Nombre completo, título y dirección exacta.
- **2 a 3 Franjas Horarias Discretas:** Opciones claramente diferenciadas (ej. Opción A: Viernes 10:00 AM; Opción B: Sábado 3:00 PM).
- **Tarifa Oficial:** Valor confirmado de la consulta especializada.
- **Fecha y Hora de Expiración:** Lapso de validez de la oferta (máximo 24 horas).
- **Enlace Tokenizado:** Botón o URL protegida con token opaco para selección en un clic.

---

## 2. Flujo de Selección y Control de Exclusión Mutua

1. **Recepción de Selección:** El tutor hace clic en un botón interactivo o en el portal seguro seleccionando una de las opciones.
2. **Validación de Vigencia:** El sistema verifica si `NOW() < expires_at`. Si ha expirado, rechaza amablemente la selección y ofrece revalidar horarios.
3. **Exclusión Mutua Concurrente:** Si dos cuidadores abren la oferta simultáneamente, el Stored Procedure `record_client_slot_selection` aplica un bloqueo `FOR UPDATE` sobre la oferta, asegurando que solo la primera selección sea aceptada.
4. **Tránsito a Gestión Externa:** La selección marca la remisión como `CLIENT_SELECTION_RECEIVED` y activa la tarea de reserva externa (hold o agendamiento definitivo).
