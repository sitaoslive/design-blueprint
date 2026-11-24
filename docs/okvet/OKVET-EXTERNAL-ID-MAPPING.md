# VET FREEDOM OS — OKVET EXTERNAL ID MAPPING SPECIFICATION
## Mapeo e Interoperabilidad de Identificadores Externos con OKVET
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Fecha:** 2026-11-21  

---

## 1. PRINCIPIO DE IDENTIDAD DUAL

Para operar de forma consistente sin una API en tiempo real, Vet Freedom OS mantiene una estrategia de **Identidad Dual**:
1. **Identificador Canónico Interno:** UUID v4 generado en Supabase (`gen_random_uuid()`), inmutable y utilizado en todas las relaciones de clave foránea.
2. **Identificador Clínico Externo:** Cadena alfanumérica provista por OKVET Cloud (ej. `CLI-10293`, `PAC-44821`, `OK-2026-8849`), almacenada en columnas especializadas indexadas con restricción de unicidad.

---

## 2. TABLA DE CORRESPONDENCIA DE IDENTIFICADORES

| Entidad de Negocio | Clave Primaria Supabase | Columna de Mapeo OKVET | Tipo de Dato | Restricción de Integridad |
|--------------------|-------------------------|------------------------|--------------|---------------------------|
| Tutores / Clientes | `clients.id` (UUID) | `clients.okvet_client_id` | `TEXT NULL` | `UNIQUE (organization_id, okvet_client_id)` |
| Mascotas / Pacientes| `patients.id` (UUID) | `patients.okvet_patient_id` | `TEXT NULL` | `UNIQUE (organization_id, okvet_patient_id)` |
| Citas Médicas | `appointments.id` (UUID)| `appointments.okvet_appointment_id` | `TEXT NULL` | `UNIQUE (organization_id, okvet_appointment_id)` |
| Confirmaciones | `okvet_manual_confirmations.id` (UUID) | `okvet_manual_confirmations.okvet_appointment_id` | `TEXT NOT NULL` | `UNIQUE (okvet_appointment_id)` |
| Facturas y Cobros | `invoices.id` (UUID) | `invoices.okvet_invoice_id` | `TEXT NULL` | `UNIQUE (organization_id, okvet_invoice_id)` |

---

## 3. REGLAS DE RESOLUCIÓN Y VALIDACIÓN

1. **Unicidad Estricta:** Dos clientes o pacientes distintos en Supabase no pueden poseer el mismo identificador de OKVET.
2. **Tratamiento de Nulos:** En citas recién solicitadas por el cliente (`REQUESTED`), el campo `okvet_appointment_id` permanece en `NULL`. Solo adquiere valor tras la ejecución exitosa de `submit_okvet_human_confirmation()`.
3. **Inmutabilidad Post-Confirmación:** Una vez asignado y verificado un `okvet_appointment_id`, no puede ser modificado mediante consultas estándar de frontend; cualquier rectificación exige autorización del Director Médico y genera un registro en `audit_logs`.
4. **Búsqueda Indexada:** Se disponen índices B-Tree sobre todas las columnas `okvet_*_id` para garantizar tiempos de respuesta $< 5\text{ ms}$ durante el cotejo en la interfaz de soporte.
