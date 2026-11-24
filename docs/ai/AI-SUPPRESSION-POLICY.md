# AI SUPPRESSION & SAFETY POLICY
## VET FREEDOM OS — Control Anti-Colisión y Silenciamiento Inmediato de Bot
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. El Riesgo Crítico de la "Doble Voz"
En un servicio médico veterinario a domicilio, el riesgo operacional y reputacional más peligroso es la **doble voz**: un cliente interactuando con un médico veterinario humano mientras un LLM autónomo genera respuestas automáticas paralelas o desalineadas.

```
       [ TUTOR DE PACIENTE ]
                 │
      ┌──────────┴──────────┐
      │ (WhatsApp Inbound)  │
      ▼                     ▼
[ OPERADOR HUMANO ]     [ BOT DE IA ]
(Dra. Camila Torres)   (Generando borrador tardío)
      │                     │
      │                     ▼
      │           ¿EMISIÓN PERMITIDA?
      │                     │
      │        [ verify_outbound_permission ]
      │                     │
      │            ┌────────┴────────┐
      │            │                 │
      │     is_bot_locked?    version mismatch?
      │       (SI: BLOQUEO)     (SI: BLOQUEO)
      │            │                 │
      │            └────────┬────────┘
      │                     ▼
      │           [ BORRADOR SUPRIMIDO ]
      ▼
[ RESPUESTA HUMANA ÚNICA Y VERIFICADA ]
```

---

## 2. Mecanismo de Supresión en Tres Capas

### Capa 1: Bloqueo Preventivo Inmediato (`is_bot_locked = true`)
- En el instante exacto en que se detecta la necesidad de handoff (vía `VET-CORE-02` o `VET-CORE-04`), la base de datos fija `is_bot_locked = true` y avanza a `HANDOFF_PENDING_ASSIGNMENT`.
- El bot cesa cualquier procesamiento de nuevos turnos para esa conversación.

### Capa 2: Invalidación de Borradores en Vuelo (Stale Draft Detection)
- Si la IA comenzó a inferir una respuesta con un modelo grande (que tarda 1.5 a 3 segundos) y durante ese lapso el cliente escribió "esperen quiero un humano" o un operador aceptó el caso:
  - La conversación avanzó de `state_version: 1` a `state_version: 2`.
  - Cuando el worker de IA intenta despachar su respuesta (`draft_state_version: 1`), invoca la función RPC `verify_outbound_permission(conv_id, 'BOT', 1)`.
  - La función detecta `current_version (2) != draft_version (1)` y responde:
    ```json
    {
      "allowed": false,
      "reason": "AI_SUPPRESSED_HUMAN_CONTROL_ACTIVE",
      "is_bot_locked": true,
      "current_status": "HANDOFF_PENDING_ASSIGNMENT"
    }
    ```
  - El mensaje es **destruido en memoria** y nunca llega al cliente.

### Capa 3: Guardia de Canal de Salida en `VET-CORE-03 | Safe Sender`
- Antes de invocar la API oficial de WhatsApp Cloud, el emisor valida el estado en Supabase.
- Si el mensaje tiene remitente `BOT` y la conversación está en estado humano, el envío es abortado con registro de auditoría.

---

## 3. Seguridad Clínica Irrenunciable
1. **Cero Diagnósticos por IA:** La IA nunca emite diagnósticos médicos presuntivos ni definitivos.
2. **Cero Prescripciones ni Dosificaciones:** Si el cliente pregunta "¿cuántos ml de Meloxicam le doy a mi perro?", la IA activa **inmediatamente** la transferencia a la Dra. Camila Torres (`VET`) con prioridad `HIGH` y suprime cualquier cálculo numérico de fármacos.
3. **Cero Reactivación con Emergencias Abiertas:** Si la prioridad fue `CRITICAL`, la función `authorize_ai_resume` aborta activamente si el caso no fue marcado `RESOLVED` por el personal médico.
