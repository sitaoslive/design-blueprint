# VET FREEDOM OS — MAPEO Y RESOLUCIÓN DE IDENTIDADES EXTERNAS
## Vinculación Canónica de Entidades, Grados de Confianza y Prevención de Colisiones

---

### 1. Desafío de Identidad en Sistemas Descentralizados

En la operación domiciliaria de Vet Life, una misma entidad de la vida real (un tutor, un perro, una cita, un comprobante) interactúa con múltiples sistemas bajo diferentes identificadores:
- En **WhatsApp**: Número de teléfono internacional E.164 (ej. `+573001234567`) y nombre de perfil de WhatsApp.
- En **Google Calendar**: Event ID alfanumérico (ej. `_60o30c1g60o30c1g60o30c1g60o30c1g`).
- En **OKVET**: Número de Historia Clínica clínica oficial y cédula de ciudadanía del propietario.
- En **Wompi**: `transaction_id` y `reference` bancaria.
- En **Supabase**: UUID canónico (`clients.id`, `patients.id`, `appointments.id`).

Para garantizar la integridad y evitar errores médicos o de facturación, la tabla `integration_external_identity_map` mantiene el vínculo formal entre el identificador canónico local y los identificadores foráneos.

---

### 2. Grados de Confianza de Emparejamiento (`match_confidence`)

Toda resolución de identidad se etiqueta con un grado de confianza auditable:

1. **`EXACT_VERIFIED_MATCH`**:
   - Vínculo 1:1 indiscutible.
   - Verificado mediante documento oficial de identidad (Cédula de Ciudadanía / NIT), microchip canino/felino, o ID foráneo ya confirmado previamente por el Dr. Ríos o coordinación.
   - Permite operaciones automatizadas seguras.
2. **`STRONG_CANDIDATE_REQUIRES_REVIEW`**:
   - Coincidencia en múltiples factores (ej. mismo número de teléfono y nombre de tutor idéntico, o misma mascota en la misma dirección).
   - Sin embargo, no existe validación documental previa.
   - Requiere validación pasiva o confirmación visual del operador.
3. **`AMBIGUOUS_MANUAL_RESOLUTION`**:
   - Múltiples entidades locales coinciden con el mismo dato externo (ej. dos clientes distintos comparten un teléfono fijo o corporativo, o dos pacientes se llaman "Luna").
   - **Bloqueo total**: Ningún dato se asigna automáticamente. Se emite inmediatamente una tarea humana a `integration_manual_confirmation_tasks`.
4. **`CONFLICT_DETECTED`**:
   - Contradicción directa (ej. un mismo ID de evento en Google Calendar intenta vincularse a dos citas diferentes en Supabase).
   - Genera una alerta crítica de integridad y congela el flujo hasta intervención humana.

---

### 3. Casos Críticos de Colisión y Reglas de Negocio

#### A. Dos Mascotas con el Mismo Nombre ("Luna")
- **Problema**: El tutor solicita cita para "Luna", pero en su ficha tiene dos mascotas llamadas Luna (ej. Luna perra y Luna gata, o madre e hija).
- **Regla**: VET FREEDOM OS prohíbe asociar la historia clínica basándose en el nombre de pila. El sistema exige validar especie, raza, edad o número de microchip antes de adjuntar cualquier procedimiento médico.

#### B. Teléfono Compartido entre Tutores
- **Problema**: Esposos o familiares atienden las mascotas del hogar desde un mismo teléfono celular.
- **Regla**: Se permite compartir el canal de comunicación (número de WhatsApp en `integration_external_identity_map`), pero **las identidades de los clientes y sus mascotas se mantienen estrictamente separadas e independientes en Supabase**. Nunca se fusionan sus historiales financieros ni consentimientos informados.

#### C. Prohibición Absoluta de Auto-Merge por IA
- **Regla Inquebrantable**: Ningún modelo de lenguaje (LLM), agente autónomo o automatización tiene permitido fusionar expedientes de pacientes (`patients`) ni fichas de clientes (`clients`). La fusión de entidades clínicas es potestad exclusiva del Dr. Luis Eduardo Ríos.

#### D. Tutores / Cuidadores Revocados
- Si un tutor revoca la autorización a un cuidador o paseador, dicha revocación queda registrada con timestamp y firma en Supabase.
- El motor de conciliación verifica que ningún evento externo secundario (ej. un mensaje de WhatsApp entrante del cuidador revocado) restaure privilegios de consulta documental ni recepción de informes médicos.
