# VET FREEDOM OS — DOCUMENT DELIVERY CONTRACT
## Contrato de Integración entre CORE-13 y CORE-03 (WhatsApp Outbound)
**Módulo:** VET-CORE-13 | APPROVED DOCUMENT DELIVERY  
**Módulo Receptor:** VET-CORE-03 | WHATSAPP OUTBOUND & RECONCILIATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Estado:** SAFE MODE ACTIVO (`send_enabled: false`)  

---

## 1. Principios de Entrega por Mensajería

1. **Prohibición de Adjuntos Crudos:** Los documentos clínicos sensibles jamás se adjuntan directamente como archivos multimedia en crudo en WhatsApp para evitar la pérdida total de gobernanza y la imposibilidad de revocación.
2. **Aviso Estructurado con Enlace Temporal:** CORE-03 despacha una plantilla autorizada de WhatsApp Business Platform que contiene un enlace tokenizado temporal (24 horas) hacia el gateway seguro de Vet Life.
3. **Validación Previa al Despacho en CORE-03:**
   - Verificación de la ventana de servicio de 24 horas.
   - Verificación del protocolo de duelo (WFX-013).
   - Verificación de no-revocación del cuidador (WFX-012).
   - Inclusión obligatoria de `send_enabled: false` durante la fase de QA.

---

## 2. Contrato de Solicitud de Despacho (CORE-13 -> CORE-03)

```json
{
  "delivery_request_id": "deliv-core13-00000000-0001",
  "document_id": "doc-core13-00000000-0001",
  "document_type": "CLINICAL_REPORT_APPROVED",
  "recipient_id": "own-core13-00000000-0001",
  "recipient_type": "OWNER",
  "target_phone": "+573009988776",
  "template_name": "vet_life_approved_document_notice",
  "template_language": "es_CO",
  "template_components": [
    {
      "type": "body",
      "parameters": [
        { "type": "text", "text": "Carolina Restrepo" },
        { "type": "text", "text": "Simba" },
        { "type": "text", "text": "Informe de Consulta Domiciliaria" },
        { "type": "text", "text": "Dr. Luis Eduardo Ríos" }
      ]
    },
    {
      "type": "button",
      "sub_type": "url",
      "index": 0,
      "parameters": [
        { "type": "text", "text": "token=doc_tok_8f9a2b3c4d5e6f7a" }
      ]
    }
  ],
  "signed_download_url": "https://sznvahhocgnhsqhksygq.supabase.co/storage/v1/object/sign/medical-records/docs/doc-core13-00000000-0001/v1_report.pdf?token=doc_tok_8f9a2b3c4d5e6f7a",
  "expires_at": "2026-11-22T15:30:00Z",
  "idempotency_key": "idemp-deliv-001",
  "send_enabled": false
}
```

---

## 3. Contrato de Respuesta y Reconciliación (CORE-03 -> CORE-13)

```json
{
  "delivery_request_id": "deliv-core13-00000000-0001",
  "provider_status": "ACCEPTED",
  "provider_message_id": "wamid.simulated_test_delivery_001",
  "delivery_status": "MESSAGE_SENT",
  "attempted_at": "2026-11-21T15:30:01Z",
  "error_code": null,
  "error_message": null
}
```
