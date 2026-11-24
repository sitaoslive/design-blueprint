# VET FREEDOM OS — DOCUMENT ACCESS AUDIT & FORENSICS
## Procedimiento de Monitoreo Forense, Auditoría de Accesos y Detección de Fugas de Información

**Proyecto:** VET FREEDOM OS  
**Módulo:** `VET-CORE-13`  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Estándar de Seguridad:** Trazabilidad Integral e Inmutabilidad de Logs

---

## 1. Alcance de la Auditoría Documental

La tabla `document_access_events` y la tabla `document_audit` constituyen el núcleo de seguridad defensiva y forense del sistema documental de Vet Freedom OS. Cualquier interacción con un documento —desde su generación preliminar hasta la visualización en el teléfono móvil de un cliente— deja una huella inmutable.

---

## 2. Parámetros Capturados por Evento de Acceso

Cada petición HTTP procesada por la función `validate_document_access` en el Gateway de Supabase extrae y registra de forma atómica:

```json
{
  "event_id": "evt_acc_78a129ef-410a-4a2e-8a21-99238129012a",
  "grant_id": "dag_991823bb-1122-3344-5566-778899aabbcc",
  "document_id": "doc_550e8400-e29b-41d4-a716-446655440000",
  "version_id": "dvr_661f9511-f30c-42e5-b827-557766551111",
  "recipient_id": "rec_usr_owner_001",
  "event_type": "DOWNLOAD",
  "client_ip": "186.84.92.14",
  "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
  "referrer": "https://api.whatsapp.com/",
  "occurred_at": "2026-11-21T15:35:10.123Z",
  "response_status": "SUCCESS_SERVED",
  "bytes_transferred": 1048576
}
```

---

## 3. Tipología de Eventos Auditados

| Código de Evento | Descripción Operativa | Nivel de Riesgo |
| :--- | :--- | :---: |
| `VIEW` | Previsualización en el navegador mediante PDF viewer embebido | Informativo |
| `DOWNLOAD` | Descarga completa del binario a disco local | Informativo |
| `TOKEN_EXPIRED` | Intento de apertura tras vencer el periodo de 24 horas | Bajo |
| `DOWNLOAD_LIMIT_REACHED` | Solicitud excede el tope permitido (ej. > 10 descargas) | Medio |
| `REVOCATION_BLOCKED` | Acceso intentado sobre un enlace revocado administrativamente | Alto |
| `CAREGIVER_REVOKED_BLOCKED` | Acceso intentado por un cuidador previamente desautorizado | Alto |
| `BEREAVEMENT_SUPPRESSED` | Intento de entrega automática frenado por protocolo de duelo | Informativo |
| `IP_GEO_ANOMALY` | Accesos sucesivos desde países dispares en intervalos cortos | Crítico |

---

## 4. Alertas Automáticas y Detección de Anomalías

`VET-CORE-13` en conexión con `VET-CORE-20` (Health Monitoring) ejecuta reglas heurísticas de detección de fuga:
1. **Detección de Reenvío Masivo:** Si un mismo token emitido a un tutor es consumido desde más de 3 direcciones IP o redes celulares distintas en menos de 10 minutos, el token se pausa y se genera una notificación al Dr. Luis Ríos.
2. **Descargas Agotadas Prematuramente:** Si un cuidador agota sus 10 descargas en segundos, se clasifica como scraping o descarga automatizada no autorizada.
3. **Auditoría para Tutores en Lovable:** Los tutores pueden ver en su panel quién y cuándo ha descargado las historias de sus mascotas, fomentando la transparencia total del servicio.
