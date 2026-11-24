# MANUAL DE RECUPERACIÓN DE SUPABASE STORAGE (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Destinatarios:** Ingeniero de Infraestructura y Soporte Técnico  
**Ámbito:** Archivos clínicos, documentos de remisión y metadatos  

---

## 1. Inventario de Buckets Críticos

| Bucket ID | Tipo de Contenido | Nivel de Privacidad | Límite de Tamaño | Tipos MIME Permitidos |
|---|---|:---:|:---:|---|
| `medical-records` | Historias clínicas, fotos de síntomas, recetas médicas | `PRIVATE` (public: false) | 50 MB | `pdf`, `jpeg`, `png`, `webp` |
| `referral-documents` | Exámenes especializados, órdenes de remisión | `PRIVATE` (public: false) | 50 MB | `pdf`, `jpeg`, `png` |
| `system-backups-metadata` | Manifiestos de respaldo, checksums, logs DRP | `PRIVATE` (public: false) | 100 MB | `json`, `gzip` |

---

## 2. Consistencia entre Base de Datos y Storage
La pérdida o desincronización entre un registro en `public.referral_documents` y su archivo físico en Storage constituye un incidente de severidad `P2`.

### Procedimiento de Auditoría Periódica:
1. Extraer los `file_path` de `public.referral_documents` y `public.messages(media_url)`.
2. Listar los objetos reales existentes en `storage.objects` mediante API autenticada o CLI.
3. Comparar conjuntos:
   - Registros huérfanos en BD sin archivo en Storage -> Generar alerta de archivo faltante.
   - Objetos en Storage sin referencia en BD -> Cuarentena y marcación para depuración tras 90 días.

---

## 3. Procedimiento de Restauración Aislada de Storage
1. **Creación del Bucket Temporal Sandbox:**
   Crear bucket temporal `sandbox-medical-records` en modo `public: false`.
2. **Transferencia Cifrada:**
   Copiar los objetos desde el respaldo secundario hacia el bucket temporal mediante S3 API con credenciales temporales con rol de servicio.
3. **Verificación de Enlaces Firmados:**
   Comprobar que los enlaces firmados generados expiren en el tiempo estipulado (máximo 60 minutos) y que usuarios no autorizados reciban código HTTP 403 Forbidden.
4. **Validación de Checksums:**
   Verificar que los ETags de los archivos restaurados coincidan con los metadatos registrados.
