# VET FREEDOM OS — OKVET CAPABILITY REGISTRY
## Registro Oficial de Capacidades de Integración con OKVET
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Tabla de Backend:** `public.okvet_capability_registry`  
**Fecha:** 2026-11-21  

---

## 1. PROPÓSITO DEL REGISTRO

El Registro de Capacidades de OKVET delimita formalmente qué operaciones pueden automatizarse, cuáles requieren asistencia humana y cuáles están **estrictamente prohibidas** por diseño arquitectónico y normativo. Esto previene que desarrolladores o agentes de IA intenten implementar scrapers frágiles o simulen APIs inexistentes.

---

## 2. MATRIZ DE CAPACIDADES HOMOLOGADAS (9 CAPACIDADES OFICIALES)

| Código de Capacidad | Dominio | Nivel de Soporte | Método de Ejecución | Justificación Técnica y Regulatoria |
|---------------------|---------|------------------|---------------------|-------------------------------------|
| `APPOINTMENT_READ` | Citas y Agenda | Lectura Verificada | Exportación Tabular / Verificación Visual | Lectura de agendas para reconciliación asistida |
| `APPOINTMENT_WRITE` | Citas y Agenda | Prohibida API Directa | Puente Asistido Humano Obligatorio | OKVET no posee API; la reserva oficial la realiza el personal |
| `PATIENT_READ` | Pacientes | Importación Staging | Archivos CSV/XLSX estructurados | Carga por lotes con resolución de homónimos en staging |
| `PATIENT_WRITE` | Pacientes | Prohibida API Directa | Creación Manual en OKVET | Prevención de duplicación de pacientes en historia oficial |
| `CLIENT_READ` | Clientes / Tutores | Importación Staging | Archivos CSV/XLSX estructurados | Sincronización de datos de contacto verificados |
| `CLIENT_WRITE` | Clientes / Tutores | Prohibida API Directa | Creación Manual en OKVET | OKVET es la fuente de verdad del expediente de propietario |
| `MEDICAL_RECORD_READ` | Historias Clínicas | Verificación Humana | Acceso Exclusivo por Profesional | La historia clínica solo puede ser leída por médicos autorizados |
| `MEDICAL_RECORD_WRITE`| Acto Médico | Prohibido Absoluto | Exclusivo Profesional en OKVET | Ley 576/2000: IA y flujos n8n tienen prohibido prescribir/diagnosticar |
| `INVOICE_SYNC` | Finanzas y Cobros | Reconciliación Asistida | Cruce de Referencias en Staging | Cotejo de facturación oficial contra transacciones de Supabase |

---

## 3. ESQUEMA DE DATOS EN SUPABASE

```sql
CREATE TABLE IF NOT EXISTS public.okvet_capability_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capability_code TEXT NOT NULL UNIQUE,
    domain_name TEXT NOT NULL,
    support_level TEXT NOT NULL CHECK (support_level IN (
        'AUTOMATED_SUPPORTED',
        'IMPORT_STAGING_SUPPORTED',
        'HUMAN_ASSISTED_REQUIRED',
        'READ_ONLY_VERIFIED',
        'PROHIBITED_DIRECT_API',
        'PROHIBITED_CLINICAL_AUTHORITY'
    )),
    execution_method TEXT NOT NULL,
    description TEXT NOT NULL,
    regulatory_notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Cualquier intento por parte de un microservicio o función de ejecutar una mutación directa sobre OKVET consulta este registro y aborta la operación si el nivel de soporte es `PROHIBITED_*`.
