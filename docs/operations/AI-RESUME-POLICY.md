# AI RESUME POLICY & PROTOCOL
## VET FREEDOM OS — Política de Retorno Seguro a Inteligencia Artificial
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Condiciones Previas Obligatorias para Reactivar la IA
La IA no puede reanudarse de forma automática o implícita; **requiere siempre autorización humana explícita**:

1. **Inexistencia de Emergencias Vitales Abiertas:** Si el caso ingresó con severidad `CRITICAL` (dificultad respiratoria, convulsiones, trauma mayor), la función `authorize_ai_resume()` **bloquea la reactivación** a menos que el caso haya sido marcado previamente como `RESOLVED`.
2. **Confirmación del Operador:** El operador humano debe hacer clic en "Finalizar Atención y Reactivar Asistente" en la interfaz.
3. **Paz y Salvo Operativo:** No deben existir dudas clínicas pendientes de responder ni desacuerdos graves con el tutor.

---

## 2. Ejecución Técnica del Retorno
Cuando el operador ejecuta la reanudación:
- Se invoca la función RPC en PostgreSQL 17:
  ```sql
  SELECT public.authorize_ai_resume(
    p_conversation_id := 'c4444444-4444-4444-4444-444444444444',
    p_authorizing_user_id := auth.uid(),
    p_reason := 'Atención humana concluida satisfactoriamente'
  );
  ```
- **Efectos:**
  - `conversations.is_bot_locked := false`
  - `conversations.status := 'AI_ACTIVE'`
  - `conversations.state_version := state_version + 1`
  - `conversation_handoffs.status := 'RESOLVED'`
  - Emisión de `conversation.ai_resumed` al outbox transaccional.

---

## 3. Mensaje de Bienvenida de la IA
Una vez que la IA vuelve a tener control, ante el siguiente mensaje del usuario o como saludo de confirmación, la IA debe presentarse con tono amigable pero sin interrumpir bruscamente:
- *"¡Hola de nuevo, Carolina! Aquí sigo atenta por si necesitas algo más para Toby. ¡Que tengas un excelente día!"*
