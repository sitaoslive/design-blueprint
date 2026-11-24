# VET FREEDOM OS — DOCUMENT EVENT CONTRACT
## Contratos de Eventos Transaccionales (Outbox Pattern) para el Subsistema Documental
**Módulo:** VET-CORE-13 | APPROVED DOCUMENT DELIVERY  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Integración:** Supabase Outbox -> CORE-01 (Event Dispatcher) -> CORE-13  

---

## 1. Principios del Bus de Eventos Documental

1. **Desacoplamiento Asincrónico:** Todas las transacciones documentales emiten eventos inmutables a la tabla `public.transactional_outbox`.
2. **Cero Binarios en Carga Útil:** Los payloads de eventos contienen exclusivamente identificadores unívocos, metadatos estructurados y referencias de almacenamiento; queda terminantemente prohibido incluir bytes o base64 del archivo en los eventos.
3. **Idempotencia Garantizada:** Cada evento dispone de un `idempotency_key` y un `correlation_id` para evitar procesamientos duplicados ante reintentos de red.

---

## 2. Catálogo Oficial de Eventos

| Tipo de Evento | Momento de Emisión | Consumidor Principal |
|---|---|---|
| `document.upload_completed` | Archivo cargado en storage privado con hash SHA-256 verificado. | CORE-13 / Lovable UI |
| `document.validation_failed` | Archivo corrupto o no coincidente con firma MIME. | CORE-19 (Error Handler) |
| `document.approval_requested` | Archivo listo para dictamen veterinario con COMVEZCOL. | Lovable Document Center |
| `document.approved` | Médico veterinario colegiado ratificó la versión. | CORE-13 (Preparar entrega) |
| `document.rejected` | Dictamen médico desfavorable emitido. | CORE-07 (Tarea de corrección) |
| `document.superseded` | Versión anterior v1 marcada como obsoleta tras aprobar v2. | CORE-18 (Reconciliación) |
| `document.delivery_requested` | Solicitud formal de entrega generada. | CORE-13 (Motor de entrega) |
| `document.delivery_authorized`| Concesión de acceso emitida con token seguro. | CORE-03 (WhatsApp Dispatcher) |
| `document.content_served` | Descarga observable servida por el gateway. | CORE-12 / Lovable UI |
| `document.access_revoked` | Permiso de cuidador o especialista revocado. | Gateway de Descarga |

---

## 3. Estructura Canónica del Payload JSON

```json
{
  "event_id": "evt-77000000-0000-0000-0000-000000000001",
  "event_type": "document.delivery_authorized",
  "schema_version": "1.0",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "document_id": "doc-core13-00000000-0001",
  "document_version_id": "ver-core13-00000000-0001",
  "recipient_id": "own-core13-00000000-0001",
  "recipient_type": "OWNER",
  "delivery_channel": "WHATSAPP_SANDBOX",
  "access_grant_id": "grant-core13-00000000-0001",
  "expires_at": "2026-11-22T15:30:00Z",
  "source_system": "VET_LIFE_INTERNAL",
  "occurred_at": "2026-11-21T15:30:00Z",
  "correlation_id": "corr-doc-deliv-001",
  "causation_id": "vis-1000000-0000-0000-0000-000000000001",
  "idempotency_key": "idemp-deliv-001"
}
```
