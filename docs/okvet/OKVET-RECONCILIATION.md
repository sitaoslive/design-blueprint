# VET FREEDOM OS — OKVET RECONCILIATION ENGINE SPECIFICATION
## Motor de Detección de Discrepancias y Reconciliación con OKVET
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Módulo:** VET-CORE-18 (Integration Reconciliation) / MOD25  
**Fecha:** 2026-11-21  

---

## 1. PROPÓSITO DEL MOTOR DE CONCILIACIÓN

Detectar de forma continua o periódica cualquier asimetría o divergencia entre el estado registrado en OKVET Cloud (a través de lotes de importación o verificación puntual) y la base de datos de Supabase, alertando oportunamente al equipo operativo y guiando la reparación asistida sin sobrescritura ciega.

---

## 2. TAXONOMÍA DE DISCREPANCIAS Y MATRIZ DE ACCIÓN

| Código | Descripción de la Discrepancia | Severidad | Acción del Motor | Criterio de Resolución Humana |
|--------|--------------------------------|-----------|------------------|-------------------------------|
| `DISCR_OK01` | Cita `CONFIRMED` en Supabase sin `okvet_appointment_id` | Crítica | Marca cita como `AUDIT_FLAGGED`; bloquea despacho de VET-CORE-05 | Operador debe ingresar ID oficial o degradar a `PENDING` |
| `DISCR_OK02` | `okvet_appointment_id` duplicado en múltiples citas | Crítica | Bloquea transacciones financieras vinculadas | Director Médico asigna la cita legalmente válida |
| `DISCR_OK03` | Discrepancia de horario ($> 15\text{ min}$) entre OKVET y Supabase | Media | Genera propuesta de ajuste en `discrepancies` | Soporte valida con el cliente y ajusta la hora oficial |
| `DISCR_OK04` | Cancelada en OKVET pero activa en Supabase | Alta | Detiene ruta logística y suspende notificaciones | Se transiciona cita a `CANCELLED` con motivo auditado |
| `DISCR_OK05` | Mascota con diferente nombre o especie para el mismo ID | Media | Deriva a staging de resolución de identidad | Veterinario tratante confirma la ficha clínica en OKVET |

---

## 3. ESQUEMA DE PERSISTENCIA DE DISCREPANCIAS

```sql
CREATE TABLE IF NOT EXISTS public.discrepancies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    domain_name TEXT NOT NULL,
    discrepancy_code TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    entity_name TEXT NOT NULL,
    entity_id UUID NOT NULL,
    external_reference TEXT,
    system_data JSONB NOT NULL,
    external_data JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES public.profiles(id),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_discrepancies_open ON public.discrepancies(organization_id, status)
WHERE status = 'OPEN';
```

---

## 4. CICLO DE EJECUCIÓN DE CONCILIACIÓN (VET-CORE-18)

1. **Corte Diario (23:00 COT):** n8n ejecuta el workflow de conciliación contra los datos consolidados del día.
2. **Evaluación de Invariantes:** Ejecuta consultas analíticas cruzando `appointments`, `okvet_manual_confirmations` y `financial_transactions`.
3. **Generación de Reporte:** Inserta fila en `reconciliation_runs`. Si existen discrepancias abiertas, notifica en el Reporte Ejecutivo Diario (VET-CORE-16) para atención a primera hora del día siguiente.
