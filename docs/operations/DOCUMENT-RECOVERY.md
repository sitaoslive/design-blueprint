# VET FREEDOM OS — DOCUMENT DISASTER RECOVERY & RESILIENCE
## Protocolo de Resiliencia ante Indisponibilidad de Storage, Recuperación de Objetos y Reintentos Seguros

**Proyecto:** VET FREEDOM OS  
**Módulos:** `VET-CORE-13` (Document Hub) & `VET-CORE-19` (Error Handling and Dead-Letter Queue)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**RPO (Recovery Point Objective):** 0 segundos (Cero pérdida de documentos aprobados)  
**RTO (Recovery Time Objective):** < 15 minutos

---

## 1. Modos de Falla y Mitigaciones Arquitectónicas

Los fallos en la infraestructura documental pueden ocurrir en tres niveles distintos:

| Nivel de Falla | Causa Raíz | Mitigación Implementada |
| :--- | :--- | :--- |
| **Falla en Carga (Upload)** | Caída temporal de Supabase Storage / Timeout HTTP | Buffer local en n8n + Cola de reintentos exponenciales con jitter |
| **Corrupción de Archivo** | Truncamiento en la red durante la subida | Comparación estricta de hash SHA-256 antes de aprobar |
| **Indisponibilidad de Storage en Entrega** | Error 503 / 504 al generar Signed URL | Reintento automático (3 intentos) + Notificación a DLQ de CORE-19 |
| **Pérdida de Token por el Usuario** | El tutor borró el chat o el enlace expiró | Regeneración de nuevo token de 24h desde Lovable UI mediante RPC |

---

## 2. Diagrama de Reintento y Dead-Letter Queue (DLQ)

```mermaid
graph TD
    DOC_REQ[Solicitud de Entrega en n8n] --> TRY_GEN{Generar Grant / URL en Supabase}
    TRY_GEN -->|Éxito| DISPATCH[Encolar Notificación WhatsApp CORE-03]
    
    TRY_GEN -->|Falla 5xx / Timeout| RETRY_EVAL{¿Intentos < 3?}
    RETRY_EVAL -->|Sí| WAIT[Backoff Exponencial: 30s, 2m, 10m]
    WAIT --> TRY_GEN
    
    RETRY_EVAL -->|No (3 Fallos)| DLQ[Encolar en CORE-19 Dead Letter Queue]
    DLQ --> ALERT[Alerta Prioritaria al Dr. Luis Ríos en Telegram/Dashboard]
    ALERT --> MANUAL[Reingesta Manual o Despacho Alternativo Asistido]
```

---

## 3. Respaldo y Duplicación Geográfica de Historias Clínicas

1. **Backups Diarios de Base de Datos (Supabase WAL):** Los metadatos, versiones, hashes criptográficos y registros de auditoría se respaldan mediante Write-Ahead Logging continuo y snapshots diarios (`VET-CORE-21`).
2. **Replicación de Buckets Privados:** Los objetos almacenados en `medical-records` y `referral-documents` cuentan con redundancia multi-zona provista por la infraestructura subyacente de Supabase/AWS S3.
3. **Procedimiento de Reconstrucción de Integridad:** Si se sospecha daño en un archivo:
   - Se ejecuta una rutina de verificación que lee el archivo del bucket y calcula su hash SHA-256.
   - Si el hash coincide con `document_versions.sha256_hash`, se confirma la integridad física del documento.
   - Si no coincide, se restaura la versión archivada desde el snapshot del backup diario más reciente.

---

## 4. Garantía de Cero Duplicidad en Reintentos

Gracias a la restricción `UNIQUE (commitment_id, document_version_id, recipient_id)` en la tabla `document_delivery_requests`, ningún reintento automático por parte de n8n o del usuario generará múltiples órdenes de entrega repetidas ni saturará el teléfono del tutor con mensajes idénticos.
