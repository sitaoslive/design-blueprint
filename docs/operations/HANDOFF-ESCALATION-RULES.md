# HANDOFF ESCALATION RULES & SLA MATRIX
## VET FREEDOM OS — Protocolo Operativo de Escalamiento
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Tabla Determinista de SLAs

| Nivel de Prioridad | SLA Máximo de Aceptación | Destinatario Primario | Mecanismo de Alerta | Escalamiento al Vencer SLA |
|---|---|---|---|---|
| `CRITICAL` | **5 minutos** | Dr. Luis Eduardo Ríos (`DIRECTOR`) | SMS prioritario + Modal UI Rojo + Sonido | Dr. Luis Ríos (Llamada telefónica de respaldo) |
| `HIGH` | **15 minutos** | Dra. Camila Torres (`VET`) / Andrés Salcedo (`COORDINACION`) | Notificación Push Lovable + Badge Amarillo | Escalamiento automático a `DIRECTOR` |
| `MEDIUM` | **30 minutos** | Paola Méndez (`FINANZAS`) | Bandeja de entrada Lovable Finance | Escalamiento automático a `COORDINACION` |
| `STANDARD` | **30 minutos** | Valentina Gómez (`RECEPCION`) | Bandeja General Lovable Reception | Escalamiento automático a `COORDINACION` |
| `LOW` | **60 minutos** | Equipo General | Bandeja de archivo / seguimiento | Escalamiento a Supervisor |

---

## 2. Reglas de Escalamiento Automático (SRE Watchdog)

El workflow `VET-CORE-04` ejecuta un pulso programado cada 5 minutos (`Schedule Trigger`) invocando la función PostgreSQL `expire_unaccepted_handoffs()`:

```sql
SELECT h.id, h.conversation_id, h.expires_at, h.priority
FROM public.conversation_handoffs h
WHERE h.status IN ('PENDING_ASSIGNMENT', 'ASSIGNED')
  AND h.accepted_at IS NULL
  AND h.expires_at < now();
```

Cuando un caso supera su tiempo límite:
1. `conversation_handoffs.status := 'ESCALATED'`
2. `conversation_handoffs.requested_team := 'DIRECTOR'`
3. `conversation_handoffs.priority := 'CRITICAL'`
4. `conversations.status := 'ESCALATED'`
5. `conversations.assigned_team := 'DIRECTOR'`
6. Inserción de transición con `actor_type = 'SYSTEM'`, `reason = 'SLA_TIMEOUT_EXPIRED'`.
7. Emisión al outbox del evento `conversation.handoff_escalated`.

---

## 3. Escalamiento Manual por Criterio Clínico u Operativo
Cualquier integrante del equipo puede escalar un caso manualmente a través de la interfaz de Lovable:
- **Recepcionista a Médico Veterinario:** Si un tutor describe síntomas sospechosos (letargia, vómito recurrente, diarrea sanguinolenta).
- **Médico Veterinario a Director:** Si se requiere autorización para procedimientos especiales o sedación en paciente de alto riesgo.
- **Coordinador a Director:** Si ocurre un choque de agendas o un retraso en ruta superior a 45 minutos.
- **Finanzas a Director:** Si el tutor rechaza el copago o disputa la tarifa del servicio domiciliario.
