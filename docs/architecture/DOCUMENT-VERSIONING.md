# VET FREEDOM OS — DOCUMENT VERSIONING & INTEGRITY
## Versionamiento Inmutable v1..vn, Huellas Criptográficas y Control de Reemplazos
**Módulo:** VET-CORE-13 | APPROVED DOCUMENT DELIVERY  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tabla Principal:** `public.document_versions`  

---

## 1. Principio de Inmutabilidad Absoluta

En medicina veterinaria, la alteración inadvertida o maliciosa de un documento ya emitido (ej. cambio en la dosis de un fármaco, modificación de resultados de analíticas o alteración de fechas) constituye una falta grave contra la ética profesional y la seguridad del paciente.

Por diseño, en Vet Freedom OS:
1. **Ningún archivo aprobado se sobrescribe en la misma ruta de almacenamiento.**
2. **Cualquier corrección o adición genera una nueva versión `v2`, `v3`, ..., `vn`.**
3. **La versión anterior se preserva intacta con fines de auditoría forense y respaldo pericial.**

---

## 2. Esquema de Versionamiento en PostgreSQL 17

```sql
CREATE TABLE public.document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    storage_object_key TEXT NOT NULL,
    sha256_digest TEXT NOT NULL,
    declared_mime_type TEXT NOT NULL,
    detected_file_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    upload_status TEXT NOT NULL DEFAULT 'UPLOADED',
    validation_status TEXT NOT NULL DEFAULT 'VALIDATED',
    approval_status TEXT NOT NULL DEFAULT 'APPROVAL_PENDING',
    approved_by UUID REFERENCES public.staff_profiles(id),
    approved_at TIMESTAMPTZ,
    superseded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_document_version UNIQUE (document_id, version_number)
);
```

---

## 3. Reglas de Aprobación por Versión

- **Independencia de Aprobación:** La aprobación de la versión `v1` pertenece exclusivamente a esa entidad. Si un usuario emite una corrección que genera la versión `v2`, esta nace en estado `APPROVAL_PENDING`.
- **Prohibición de Entrega Automática:** No es posible despachar la versión `v2` amparándose en la aprobación previa de `v1`. La función `request_document_delivery` evalúa `version_id` directamente y rechaza cualquier versión no aprobada.
- **Traspaso a `SUPERSEDED`:** Cuando la versión `v2` es validada y aprobada por el veterinario colegiado, la función `supersede_document_version` marca la versión `v1` como `SUPERSEDED` y actualiza el puntero `current_version_id` en la tabla `documents`.

---

## 4. Control de Integridad SHA-256

Cada binario almacenado cuenta con un hash SHA-256 computado en el momento de la finalización de subida (`finalize_document_upload`):
- Si durante una solicitud de acceso se detecta discordancia entre el binario en storage y el digest registrado, la versión se marca inmediatamente como `VALIDATION_FAILED`.
- Se genera una alerta de seguridad de nivel P0 en `public.document_audit` para investigación inmediata.
