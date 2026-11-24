# VET FREEDOM OS — OKVET IMPORT PIPELINE SPECIFICATION
## Pipeline de Importación Estructurada de Datos desde OKVET (CSV / XLSX)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Fecha:** 2026-11-21  

---

## 1. OBJETIVO DEL PIPELINE

Proveer un mecanismo seguro, auditable y desacoplado para importar censos de pacientes, tutores e históricos de citas exportados desde OKVET Cloud mediante hojas de cálculo (CSV o Excel), evitando la alteración no supervisada de la base de datos de producción y garantizando resolución humana de ambigüedades.

---

## 2. ARQUITECTURA DEL PIPELINE EN STAGING

```
[Archivo CSV / XLSX exportado de OKVET]
                 |
                 v
   [Cálculo de SHA-256 Checksum]
   [Detección de Archivo Duplicado]
                 |
                 v
    +-------------------------------------------------------------+
    |                    ZONA DE STAGING POSTGRES                 |
    |                                                             |
    |  1. okvet_import_batches (Lote registrado en estado UPLOADED)
    |  2. okvet_import_column_mappings (Homologación de columnas) |
    |  3. okvet_import_row_staging (Filas crudas encoladas)       |
    |  4. Motor de Validación y Detección de Conflictos           |
    |     - Detección de Homónimos (misma mascota, distinto dueño)|
    |     - Detección de Registros Antiguos / Desactualizados    |
    |  5. okvet_import_conflicts (Bandeja de Discrepancias)       |
    +------------------------------+------------------------------+
                                   |
                                   v
             [Revisión por Operador Humano en Lovable]
                 |
                 +---> Resolver conflicto (Fusionar, Crear Nuevo, Omitir)
                 |
                 v
    +-------------------------------------------------------------+
    |           APLICACIÓN CONTROLADA A TABLAS DE PRODUCCIÓN      |
    |                                                             |
    |  - Creación / Actualización de clients y patients           |
    |  - okvet_import_application_results (Registro Inmutable)    |
    |  - SOBERANÍA CLÍNICA: Prohibido modificar recetas/diagnósticos
    +-------------------------------------------------------------+
```

---

## 3. TABLAS DE SOPORTE DEL PIPELINE EN SUPABASE

### 3.1 `okvet_import_batches`
- Registra cada lote de archivo cargado: `file_name`, `file_format` (`CSV`/`XLSX`), `file_hash_sha256`, `uploaded_by`, `status` (`UPLOADED`, `STAGED`, `VALIDATING`, `CONFLICTS_PENDING`, `COMPLETED`, `REJECTED`), `total_rows`, `valid_rows`, `conflict_rows`.

### 3.2 `okvet_import_row_staging`
- Almacena cada fila cruda en JSONB: `batch_id`, `row_number`, `raw_data`, `validation_status` (`PENDING`, `VALID`, `CONFLICT`, `APPLIED`, `DISCARDED`), `validation_errors`.

### 3.3 `okvet_import_column_mappings`
- Diccionario dinámico para mapear nombres de columnas de OKVET a columnas canónicas de Supabase (ej. `Nombre Propietario` $\to$ `clients.full_name`, `Identificación` $\to$ `clients.document_id`, `Nombre Paciente` $\to$ `patients.name`, `Especie` $\to$ `patients.species`).

### 3.4 `okvet_import_conflicts`
- Registra colisiones lógicas que requieren criterio humano:
  - `HOMONYM_PET`: Mascota con el mismo nombre y raza pero diferente teléfono o identificación del tutor.
  - `OUTDATED_RECORD`: Registro con fecha de modificación más antigua que el dato existente en Supabase.
  - `AMBIGUOUS_CLIENT`: Múltiples clientes con el mismo correo o número de WhatsApp.

### 3.5 `okvet_import_application_results`
- Bitácora inmutable de resultados tras la aplicación parcial o total: `batch_id`, `applied_at`, `applied_by`, `rows_inserted`, `rows_updated`, `rows_skipped`.

---

## 4. GARANTÍA DE SOBERANÍA CLÍNICA

El pipeline de importación tiene restricciones a nivel de código y base de datos:
- **Solo Datos Demográficos y de Agenda:** Solo se procesan entidades de clientes, datos demográficos de pacientes y calendarios de citas históricas.
- **Inviolabilidad Médica:** Ningún archivo de importación puede insertar o alterar registros en `medical_records`, `patient_allergies` o tratamientos médicos sin la firma digital individual del Dr. Luis Eduardo Ríos.
