# VET FREEDOM OS — DOCUMENT SOURCE OF TRUTH & BOUNDARIES
## Delimitación de Fuentes de Verdad y Fronteras del Subsistema Documental
**Módulo:** VET-CORE-13 | APPROVED DOCUMENT DELIVERY  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Arquitectura:** OKVET + Supabase + n8n + Lovable + Meta Cloud API  

---

## 1. Mapa de Fuentes de Verdad

En Vet Freedom OS cada componente del ecosistema asume una responsabilidad estricta e indelegable, evitando duplicidades de datos y colisiones de estado:

```
+-------------------------------------------------------------------------+
|                                OKVET                                    |
|   - Expediente Clínico Legal Oficial de la República de Colombia        |
|   - Historias Clínicas, Evoluciones y Fórmulas Matrices                |
|   - Autoridad Médica Legal (Ley 576 de 2000)                            |
+-------------------------------------------------------------------------+
                                    ▲
                                    │ Conciliación y Referencias
                                    ▼
+-------------------------------------------------------------------------+
|                         SUPABASE (PostgreSQL 17)                        |
|   - Fuente de Verdad de la Entrega Documental Operativa                 |
|   - Metadatos, Checksums SHA-256, Versiones Inmutables (v1..vn)         |
|   - Permisos de Destinatarios y Revocaciones de Cuidadores              |
|   - Registro de Aprobaciones con Tarjeta Profesional COMVEZCOL          |
|   - Bitácora Inmutable de Auditoría y Eventos Observables               |
+-------------------------------------------------------------------------+
                                    ▲
                                    │ Binarios Privados
                                    ▼
+-------------------------------------------------------------------------+
|                         SUPABASE STORAGE                                |
|   - Custodia Física de Archivos en Buckets Privados                     |
|   - medical-records (50MB, PDF/JPEG/PNG/WEBP)                           |
|   - referral-documents (50MB, PDF/JPEG/PNG)                             |
|   - Acceso Restringido sin Enlaces Públicos Permanentes                 |
+-------------------------------------------------------------------------+
                                    ▲
                                    │ Orquestación y Estados
                                    ▼
+-------------------------------------------------------------------------+
|                                  N8N                                    |
|   - Coordinador de Eventos y Despacho Automatizado (CORE-13)            |
|   - Validador de Reglas de Negocio, Duelo y Filtros                     |
|   - Generador de Enlaces Temporales y Encolador hacia CORE-03           |
|   - SIN retención de binarios pesados en memoria de ejecución           |
+-------------------------------------------------------------------------+
                                    ▲
                                    │ Presentación Segura
                                    ▼
+-------------------------------------------------------------------------+
|                          LOVABLE DOCUMENT CENTER                        |
|   - Portal de Visualización para Veterinarios, Tutores y Especialistas  |
|   - Gateway de Descarga Autenticada                                     |
|   - Interfaz de Firma y Dictamen en Un Clic                             |
+-------------------------------------------------------------------------+
```

---

## 2. Jerarquía de Prevalencia en Casos de Conflicto

1. **Prevalencia Clínica Legal:** Si existe contradicción entre una nota administrativa de n8n o Lovable y la historia clínica asentada en OKVET, prevalece siempre el registro clínico oficial de OKVET.
2. **Prevalencia de Permisos:** Si un mensaje saliente en n8n intentara emitirse pero Supabase registra que el cuidador fue revocado (`is_revoked = true`), la base de datos aborta la transacción y el mensaje es suprimido.
3. **Prevalencia de Integridad:** Si el archivo almacenado en Storage no coincide con el `sha256_digest` registrado en `document_versions`, el archivo se clasifica como `VALIDATION_FAILED` y se bloquea su distribución.
