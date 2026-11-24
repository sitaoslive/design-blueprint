# VET FREEDOM OS — AISLAMIENTO MULTI-ORGANIZACIÓN Y PROTECCIÓN TENANT
## Separación Criptográfica y Lógica entre Vet Life y Alpha Vision Method

---

### 1. Principio de Aislamiento Absoluto

**VET FREEDOM OS** opera bajo un modelo multi-inquilino (*multi-tenant*) donde coexisten:
- **Vet Life — Veterinaria a Domicilio**: Empresa operativa médica y asistencial orientada a la atención de mascotas en Bogotá y municipios aledaños. Posee historias clínicas, datos de clientes, teléfonos, direcciones residenciales y facturación.
- **Alpha Vision Method**: Entidad consultora estratégica y tecnológica que proporciona la metodología de escalamiento y automatización. Posee plantillas, métricas agregadas despersonalizadas y configuraciones de plataforma.

**Regla de Seguridad Suprema**:
> **BAJO NINGUNA CIRCUNSTANCIA LOS DATOS DE PACIENTES, HISTORIAS CLÍNICAS, NOMBRES DE TUTORES, DIRECCIONES RESIDENCIALES O INFORMACIÓN FINANCIERA DE VET LIFE PUEDEN SER VISIBLES, COPIADOS O EXPUESTOS A ALPHA VISION NI A OTRAS EMPRESAS.**

---

### 2. Mecanismos de Aislamiento Implementados

1. **Discriminador Obligatorio `organization_id`**:
   Cada fila de las tablas de conciliación, auditoría, citas, pacientes y mensajes incluye una columna `organization_id NOT NULL REFERENCES organizations(id)`.
2. **Filtrado en el Motor de Base de Datos (RLS)**:
   El filtrado de datos no depende del código de la aplicación cliente ni del backend de n8n. Es aplicado directamente por el kernel de PostgreSQL a través de Row Level Security. Si una consulta omite el `organization_id` o intenta acceder al ID de otra organización, PostgreSQL retorna un conjunto vacío (0 filas).
3. **Aislamiento en Supabase Storage**:
   Los buckets de almacenamiento privado (`clinical_documents_private`) utilizan prefijos de ruta basados en UUID de organización:
   `/clinical_documents_private/{organization_id}/{patient_id}/{document_id}.pdf`
   Las políticas de Storage validan que el token JWT del usuario contenga pertenencia activa en dicho `organization_id` antes de emitir cualquier enlace de descarga efímero.
4. **Anonimización en Reportes Ejecutivos Agregados**:
   Los módulos de reporte semanal y mensual (VET-CORE-17 y VET-CORE-21) que comparten métricas de rendimiento con la capa estratégica operan exclusivamente con datos agregados estadísticos (ej. porcentaje de efectividad de citas, ticket promedio) sin transferir datos personales ni información médica identificable (PII / PHI).
