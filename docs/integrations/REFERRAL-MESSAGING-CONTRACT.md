# VET FREEDOM OS — REFERRAL MESSAGING CONTRACT
## Especificación de Mensajería WhatsApp para Coordinación de Remisiones Externas
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Canal de Despacho:** VET-CORE-03 (WhatsApp Outbound)  
**Proveedor:** Meta WhatsApp Business API Oficial  
**Entorno:** DEVELOPMENT / QA (Safe Mode: `send_enabled: false` garantizado)

---

## 1. Plantillas Homologadas y Aprobadas por Meta

Toda comunicación hacia tutores relacionada con citas de especialistas se ejecuta exclusivamente mediante plantillas oficiales preaprobadas:

### 1.1 Oferta de Horarios con Especialista (`vet_specialist_slot_offer_v1`)
- **Categoría:** UTILITY
- **Estructura del Cuerpo:**
  > "Hola {{1}}, desde Vet Life hemos coordinado opciones con el especialista en {{2}} para {{3}}. Por favor selecciona tu horario preferido ingresando aquí: {{4}} (Válido por 24 horas)."
- **Botón:** URL dinámica autenticada con token opaco seguro.

### 1.2 Confirmación de Cita Externa Verificada (`vet_specialist_appointment_confirmed_v1`)
- **Categoría:** UTILITY
- **Estructura del Cuerpo:**
  > "Hola {{1}}, confirmamos la cita de {{2}} con el Dr./Dra. {{3}} ({{4}}) para el {{5}} a las {{6}} en {{7}}. Código de reserva: {{8}}. Recuerda llegar 10 minutos antes y llevar el resumen clínico adjunto."
- **Condición de Disparo:** Superación obligatoria del Gate de Evidencia Externa (`EXTERNALLY_CONFIRMED`).

### 1.3 Recordatorio Previo a la Cita (`vet_specialist_appointment_reminder_v1`)
- **Categoría:** UTILITY
- **Disparo:** 24 horas y 2 horas antes de la cita confirmada.
- **Supresión:** Si la cita fue cancelada, si el tutor está revocado o si existe protocolo de duelo activo.

---

## 2. Payload de Despacho hacia VET-CORE-03

```json
{
  "target_workflow": "VET-CORE-03",
  "action": "SPECIALIST_SLOT_OFFER",
  "referral_id": "ref-cardio-9921",
  "recipient": {
    "owner_id": "own-bogota-001",
    "phone": "+573001234567",
    "name": "Carlos Mendoza",
    "has_whatsapp_consent": true
  },
  "template": {
    "name": "vet_specialist_slot_offer_v1",
    "language": "es_CO",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Carlos" },
          { "type": "text", "text": "Cardiología" },
          { "type": "text", "text": "Rocky" },
          { "type": "text", "text": "https://vetlife.app/remision/tok-88129" }
        ]
      }
    ]
  },
  "security": {
    "send_enabled": false,
    "idempotency_key": "msg-idem-offer-ref-cardio-9921-v1",
    "bereavement_check_passed": true
  }
}
```

---

## 3. Matriz de Supresión de Mensajería

| Condición del Tutor / Paciente | Resultado de Evaluación | Acción de VET-CORE-11 |
|---|---|---|
| Paciente en Duelo (`bereavement_protocol_active = true`) | **SUPRESIÓN TOTAL** | Se cancelan todos los mensajes y recordatorios. |
| Cuidador Revocado (`is_revoked = true`) | **SUPRESIÓN TOTAL** | Prohibido enviar detalles médicos a terceros. |
| Cita en `CANCELLATION_REQUESTED` o `CANCELLED` | **SUPRESIÓN DE RECORDATORIO** | Se descarta el recordatorio de las 24h/2h. |
| Oferta con `expires_at < NOW()` | **SUPRESIÓN DE OFERTA** | Se prohíbe entregar enlaces caducados. |
| Entorno de Desarrollo / QA | **SAFE MODE ACTIVO** | `send_enabled = false`, mensaje registrado en log de auditoría. |
