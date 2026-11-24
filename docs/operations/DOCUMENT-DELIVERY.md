# VET FREEDOM OS — DOCUMENT DELIVERY PROTOCOL
## Procedimiento Operativo Estándar (SOP): Orquestación de Despacho, Notificación Segura y Confirmación de Recepción

**Proyecto:** VET FREEDOM OS  
**Módulos:** `VET-CORE-13` (Approved Document Delivery) & `VET-CORE-03` (WhatsApp Outbound)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Seguridad:** Safe Mode Activo (`send_enabled: false` en entorno QA/Desarrollo)

---

## 1. Reglas Innegociables de Despacho Documental

Para proteger la privacidad de los pacientes y tutores, el despacho de documentos sigue tres principios inquebrantables:
1. **Cero Adjuntos Binarios Raw por WhatsApp:** Nunca se envía el archivo PDF directamente como adjunto sin cifrar en chats convencionales. En su lugar, se envía una notificación con una plantilla autorizada de Meta y un enlace seguro al Gateway de Vet Life.
2. **Evaluación de Protocolo de Duelo Previa:** Si el paciente falleció o el tutor se encuentra en proceso de duelo (`is_bereaved = true` o `is_deceased = true`), se cancela automáticamente cualquier mensaje transaccional o publicitario estándar.
3. **Validación de Cuidadores en Tiempo Real:** Si el destinatario es un cuidador cuyos privilegios fueron revocados, el despacho se suprime de inmediato.

---

## 2. Flujo Operativo en n8n Cloud (`VET-CORE-13`)

```mermaid
graph TD
    TRIGGER[Trigger: Webhook / Schedule / Manual] --> FETCH[Mock / Obtener Solicitudes de Entrega]
    FETCH --> EVAL[Evaluate Document Delivery Eligibility]

    EVAL -->|1. Duelo Activo| SUP_BEREAVEMENT[Log Delivery Suppressed: BEREAVEMENT]
    EVAL -->|2. Cuidador Revocado| SUP_REVOKED[Log Delivery Suppressed: CAREGIVER_REVOKED]
    EVAL -->|3. No Aprobado / Sin COMVEZCOL| REJ_UNAPPROVED[Log Delivery Rejected: UNAPPROVED]
    EVAL -->|4. Corrupción de Hash| REJ_CORRUPTED[Log Delivery Rejected: CORRUPTED]
    
    EVAL -->|5. Elegible y Seguro| DISPATCH[Prepare Outbound Delivery Dispatch]
    
    DISPATCH --> SEND_CHECK{send_enabled == true?}
    SEND_CHECK -->|No (QA/Dev)| SAFE_LOG[Registrar en Outbox con send_enabled: false]
    SEND_CHECK -->|Sí (Producción Aprobada)| CORE03[Llamar a VET-CORE-03 WhatsApp Platform]

    SAFE_LOG --> UPDATE_DB[Actualizar document_delivery_attempts]
    CORE03 --> UPDATE_DB
```

---

## 3. Plantillas de Mensajería Autorizadas (Meta WhatsApp)

Las notificaciones de entrega documental utilizan plantillas pre-aprobadas que garantizan un tono profesional, claro y cálido:

### Plantilla: `vet_life_document_ready_v1`
```text
Hola {{1}}, el Dr. Luis Eduardo Ríos ha emitido el documento clínico "{{2}}" para {{3}}.

Para consultar o descargar el documento de forma privada y segura, ingresa al siguiente enlace válido por 24 horas:
{{4}}

Por seguridad de la historia clínica, este enlace es personal e intransferible. Si necesitas asistencia, contáctanos directamente.
```

- **Parámetros:**
  - `{{1}}`: Nombre del tutor / cuidador (`Carlos Rodríguez`)
  - `{{2}}`: Tipo/Título del documento (`Informe Clínico Post-Visita`)
  - `{{3}}`: Nombre del paciente (`Max`)
  - `{{4}}`: URL segura del Gateway (`https://vetlife.com.co/docs/view?token=...`)

---

## 4. Auditoría y Confirmación de Entrega

Una vez emitido el despacho:
1. Se crea un registro en `document_delivery_attempts` con el estado inicial `DISPATCHED_TO_QUEUE`.
2. Si el webhook de recepción de WhatsApp (`VET-CORE-03`) reporta entrega exitosa, el estado evoluciona a `DELIVERED_TO_HANDSET`.
3. Cuando el tutor abre el enlace en su navegador, el Gateway de `VET-CORE-13` registra el evento `VIEW` o `DOWNLOAD` en `document_access_events`.
4. El compromiso en `VET-CORE-12` se marca automáticamente como `COMPLETED` con evidencia de acceso observable.
