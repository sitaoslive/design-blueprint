# VET FREEDOM OS — STORAGE POLICIES SPECIFICATION
## Políticas de Seguridad de Almacenamiento de Archivos (Supabase Storage)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Fecha:** 2026-11-21  

---

## 1. INVENTARIO DE BUCKETS Y CONFIGURACIÓN BASE

Todos los buckets de Supabase Storage en Vet Freedom OS están configurados con `public = false`. No existe acceso anónimo ni público a ningún recurso binario.

| Nombre del Bucket | Visibilidad | Límite de Tamaño | Tipos MIME Permitidos | Propósito Primario |
|-------------------|-------------|------------------|-----------------------|--------------------|
| `medical-records` | Privado | 25 MB | `application/pdf`, `image/jpeg`, `image/png`, `image/webp` | Historias clínicas, fórmulas médicas, consentimientos informados |
| `referral-documents` | Privado | 50 MB | `application/pdf`, `image/jpeg`, `image/png`, `application/dicom` | Órdenes de interconsulta, ecografías, radiografías, informes de especialistas |
| `system-backups-metadata` | Privado | 10 MB | `application/json`, `text/plain` | Manifiestos de respaldo, checksums y metadatos de integridad de datos |

---

## 2. POLÍTICAS RLS EN `storage.objects`

El acceso a los objetos binarios está controlado por políticas RLS en la tabla `storage.objects`:

### 2.1 Políticas para `medical-records`
- **SELECT (Descarga / Lectura):**
  - Permitido si el usuario autenticado tiene rol `director` o `system_admin`.
  - Permitido si el usuario es el veterinario asignado a la cita (`assigned_veterinarian_id = auth.uid()`).
  - Permitido si el usuario es el tutor de la mascota vinculada al documento.
  - **DENEGADO:** Rol `finance_reconciliation`, rol `logistics_routes` y usuarios anónimos.
- **INSERT (Carga de Archivo):**
  - Exclusivo para personal médico autorizado (`director`, `assigned_veterinarian`, `support`).
  - El nombre del archivo debe seguir la convención estructurada: `org_{org_id}/pet_{pet_id}/{timestamp}_{hash}.{ext}`.
- **UPDATE / DELETE:**
  - Prohibido para usuarios estándar. La alteración o eliminación de documentos médicos solo puede ser autorizada por el Director Médico (`director`) bajo justificación registrada en auditoría.

### 2.2 Políticas para `referral-documents`
- **SELECT:**
  - Permitido para el especialista externo asignado a la interconsulta (`external_specialists.profile_id = auth.uid()`).
  - Permitido para el médico tratante de Vet Life y el Director General.
- **INSERT:**
  - Especialistas externos pueden cargar su informe médico y anexos asociados exclusivamente a la remisión asignada.

### 2.3 Políticas para `system-backups-metadata`
- **SELECT / INSERT / UPDATE / DELETE:**
  - Restringido exclusivamente al rol `service_role` (automatizaciones de respaldo n8n / Supabase Cron) y al Director General con MFA verificado.

---

## 3. URLs FIRMADAS (SIGNED URLS) Y TIEMPO DE EXPIRACIÓN

1. **Vigencia Máxima:** Toda URL generada para descarga o visualización en la interfaz Lovable tiene una vigencia máxima de **900 segundos (15 minutos)**.
2. **Generación Programática:** Se utiliza el método oficial de Supabase Client:
   ```typescript
   const { data, error } = await supabase.storage
     .from('medical-records')
     .createSignedUrl(filePath, 900);
   ```
3. **No Indexación:** Las respuestas HTTP de URLs firmadas incluyen los encabezados:
   - `X-Robots-Tag: noindex, nofollow, noarchive`
   - `Cache-Control: private, max-age=900`
