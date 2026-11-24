# AI TOOLS CONTRACT & FUNCTION CALLING SPECIFICATIONS
## VET FREEDOM OS — Herramientas Autorizadas para Asistente IA
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Total de Herramientas Autorizadas:** 11 Schemas Estrictos  
**Seguridad:** Ejecución con privilegios de solo lectura / pre-solicitud (sin mutación clínica directa)

---

## 1. INVENTARIO DE HERRAMIENTAS AUTORIZADAS

### 1. `getApprovedServices`
- **Propósito:** Retorna la lista oficial de servicios médicos veterinarios a domicilio disponibles en Vet Life.
- **Parámetros:**
  - `category` (string, opcional): `'CONSULTATION'`, `'VACCINATION'`, `'DEWORMING'`, `'GERIATRIC'`, `'EUTHANASIA'`.
- **Salida:** Array de objetos `{ service_id, name, description, duration_minutes, is_home_service }`.

### 2. `getVerifiedPrices`
- **Propósito:** Retorna la tarifa oficial autorizada en COP para un servicio determinado.
- **Parámetros:**
  - `service_id` (uuid, requerido): Identificador del servicio.
  - `zone_code` (string, opcional): Código de zona para evaluar recargos de desplazamiento.
- **Salida:** `{ service_id, base_price_cop, travel_fee_cop, total_cop, currency: 'COP', is_verified: true }`.

### 3. `checkCoverage`
- **Propósito:** Verifica si una dirección o barrio se encuentra dentro de la cobertura domiciliaria oficial.
- **Parámetros:**
  - `address` (string, requerido): Dirección residencial o barrio en Bogotá / Sabana.
- **Salida:** `{ is_covered: boolean, zone_name: string, coverage_status: 'STANDARD' | 'EXTENDED' | 'OUT_OF_RANGE', travel_surcharge_cop: number }`.

### 4. `getAuthorizedCustomerContext`
- **Propósito:** Recupera el perfil del tutor, sus mascotas activas y sus preferencias registradas.
- **Parámetros:**
  - `conversation_id` (uuid, requerido): ID de la conversación activa.
- **Salida:** `{ owner: { id, name, phone }, pets: [{ id, name, species, breed }], preferences: { preferred_vet, preferred_time } }`.

### 5. `checkDoctorAvailability`
- **Propósito:** Consulta los bloques de tiempo tentativamente disponibles para agendamiento.
- **Parámetros:**
  - `date` (string, YYYY-MM-DD): Fecha solicitada.
  - `service_id` (uuid): Tipo de servicio para considerar duración estimada.
- **Salida:** `{ available_slots: ['09:00', '11:30', '15:00'], timezone: 'America/Bogota' }`.

### 6. `requestAppointmentHold`
- **Propósito:** Registra una pre-reserva de cita en estado borrador pendiente de confirmación veterinaria.
- **Parámetros:**
  - `owner_id` (uuid): ID del propietario.
  - `pet_id` (uuid): ID de la mascota.
  - `requested_datetime` (string ISO): Fecha y hora solicitada.
  - `service_id` (uuid): Servicio a prestar.
  - `address` (string): Dirección del domicilio.
- **Salida:** `{ hold_id: uuid, status: 'HOLD_CREATED', expires_in_minutes: 30 }`.

### 7. `requestHumanHandoff`
- **Propósito:** Escala la conversación a un operador humano y activa el bloqueo preventivo del bot.
- **Parámetros:**
  - `conversation_id` (uuid): ID de la conversación.
  - `reason` (string): `'EMERGENCY'`, `'COMPLAINT'`, `'CLIENT_REQUEST'`, `'CLINICAL_QUERY'`, `'MODIFICATION'`.
  - `summary` (string): Resumen sintético del contexto para el operador receptor.
- **Salida:** `{ handoff_id: uuid, queue_name: string, status: 'WAITING_HUMAN', bot_locked: true }`.

### 8. `recordCustomerPreference`
- **Propósito:** Guarda o actualiza una preferencia operativa informada por el cliente.
- **Parámetros:**
  - `owner_id` (uuid): ID del tutor.
  - `preference_key` (string): `'PREFERRED_HOURS'`, `'PREFERRED_VET'`, `'COMMUNICATION_CHANNEL'`.
  - `preference_value` (string): Valor indicado por el usuario.
- **Salida:** `{ status: 'PREFERENCE_RECORDED' }`.

### 9. `getPreventiveProtocols`
- **Propósito:** Retorna información educativa general sobre calendarios vacunales y desparasitación según especie y edad.
- **Parámetros:**
  - `species` (string): `'CANINE'` | `'FELINE'`.
  - `age_stage` (string): `'PUPPY'`, `'ADULT'`, `'SENIOR'`.
- **Salida:** `{ recommended_protocols: [...], disclaimer_es: 'Sujeto a criterio médico presencial' }`.

### 10. `registerBereavementNotice`
- **Propósito:** Activa el protocolo de duelo, silenciando comunicaciones comerciales y notificando a la Dirección.
- **Parámetros:**
  - `pet_id` (uuid): ID de la mascota fallecida.
  - `owner_id` (uuid): ID del propietario.
  - `notes` (string): Detalles compartidos por el tutor.
- **Salida:** `{ status: 'BEREAVEMENT_PROTOCOL_ACTIVE', marketing_suppressed: true }`.

### 11. `recordHabeasDataOptOut`
- **Propósito:** Registra la solicitud de revocación de consentimiento de mensajería promocional.
- **Parámetros:**
  - `phone` (string E.164): Número a dar de baja.
  - `reason` (string): Motivo expresado por el titular.
- **Salida:** `{ status: 'OPT_OUT_RECORDED', communications_restricted: true }`.
