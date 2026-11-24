# VET FREEDOM OS — STORAGE BUCKET POLICIES
## Arquitectura de Almacenamiento Seguro de Objetos y Aislamiento de Buckets

**Proyecto:** VET FREEDOM OS  
**Infraestructura:** Supabase Storage (`sznvahhocgnhsqhksygq`)  
**Buckets Principales:** `medical-records` y `referral-documents`  
**Configuración de Acceso:** PRIVADO (`public: false`)  
**Límite Máximo por Archivo:** 50 MB (`file_size_limit = 52428800 bytes`)  
**Tipos MIME Permitidos:** `application/pdf`, `image/jpeg`, `image/png`, `application/dicom`

---

## 1. Configuración de Buckets y Principio de Privacidad Absoluta

Bajo ninguna circunstancia los documentos clínicos veterinarios deben almacenarse en buckets públicos. La historia clínica veterinaria y sus anexos son documentos privados conforme a la **Ley 576 de 2000**.

### 1.1 Parámetros de los Buckets

```sql
-- Configuración de Supabase Storage para medical-records
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'medical-records',
    'medical-records',
    false, -- ESTRICTAMENTE PRIVADO
    52428800, -- 50 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/dicom']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/dicom'];

-- Configuración para referral-documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'referral-documents',
    'referral-documents',
    false, -- ESTRICTAMENTE PRIVADO
    52428800, -- 50 MB
    ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];
```

---

## 2. Políticas RLS sobre `storage.objects`

La tabla interna de Supabase `storage.objects` tiene RLS activado. Las políticas imponen el control de acceso a nivel de objeto físico:

```sql
-- 1. Acceso total para service_role (usado por RPCs y n8n)
CREATE POLICY "service_role_storage_all"
ON storage.objects FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Staff Veterinario puede subir y leer objetos en medical-records y referral-documents
CREATE POLICY "staff_storage_manage"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id IN ('medical-records', 'referral-documents')
    AND (auth.jwt() ->> 'role') IN ('staff', 'vet', 'admin')
)
WITH CHECK (
    bucket_id IN ('medical-records', 'referral-documents')
    AND (auth.jwt() ->> 'role') IN ('staff', 'vet', 'admin')
);

-- 3. Tutores y Destinatarios NO tienen acceso directo al bucket.
-- Su acceso se canaliza exclusivamente mediante el Gateway Autenticado de CORE-13
-- o mediante Signed URLs efímeras generadas con expiración máxima de 24 horas.
```

---

## 3. Estructura de Rutas y Nomenclatura Canónica

Los objetos se almacenan siguiendo una jerarquía determinista y particionada que previene colisiones y facilita auditorías:

```text
medical-records/
└── records/
    └── {document_id}/
        ├── v1/
        │   └── {sanitized_filename}.pdf
        └── v2/
            └── {sanitized_filename}.pdf

referral-documents/
└── referrals/
    └── {referral_id}/
        └── {document_id}/
            └── v1/
                └── carta_remision_{patient_name}.pdf
```

### Reglas de Nomenclatura:
1. **Sanitización Obligatoria:** Se eliminan caracteres especiales, espacios y secuencias `../` (Directory Traversal).
2. **Versionado Físico:** Cada nueva versión física se almacena en su propio subdirectorio `v1/`, `v2/`, garantizando que la versión anterior permanezca inmutable en disco.
3. **Validación de Hash:** Al finalizar la subida, Supabase computa y compara el hash SHA-256 del binario contra el registrado en `document_versions.sha256_hash`. Si no coincide, el archivo se purga de inmediato por posible corrupción o manipulación en tránsito.
