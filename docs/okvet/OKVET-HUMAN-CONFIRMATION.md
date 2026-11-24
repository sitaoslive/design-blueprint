# VET FREEDOM OS — OKVET HUMAN CONFIRMATION PROTOCOL
## Protocolo Operativo y Técnico de Confirmación Humana en OKVET
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Procedimiento Operativo:** SOP-OKVET-01  
**Fecha:** 2026-11-21  

---

## 1. OBJETIVO DEL PROTOCOLO

Establecer el procedimiento estándar y auditable mediante el cual el personal autorizado (Mesa de Soporte, Médico Veterinario o Director General) valida y confirma una cita en OKVET Cloud y sincroniza de forma atómica su estado en el backend de Vet Freedom OS (Supabase).

---

## 2. FLUJO DE TRABAJO OPERATIVO PASO A PASO

```
[Cliente solicita cita en Lovable]
               |
               v
[Estado: PENDING_OKVET_CONFIRMATION] (Hold activo de 15 min)
               |
               v
[Operador Humano abre OKVET Cloud]
               |
               +---> 1. Verifica disponibilidad de agenda oficial
               +---> 2. Registra o valida paciente y tutor en OKVET
               +---> 3. Genera la cita en OKVET y obtiene el ID Oficial (ej. OK-2026-8849)
               |
               v
[Operador ingresa al Panel de Confirmación en Lovable]
               |
               +---> Digita ID Oficial de OKVET
               +---> Ingresa notas de confirmación médica/operativa
               +---> Adjunta captura o evidencia digital (opcional)
               |
               v
[Ejecución de RPC: submit_okvet_human_confirmation()]
               |
               +---> Adquiere lock de fila (FOR UPDATE)
               +---> Valida unicidad de ID de OKVET
               +---> Transiciona cita a CONFIRMED
               +---> Inserta fila inmutable en okvet_manual_confirmations
               +---> Emite evento APPOINTMENT_CONFIRMED_OKVET_HUMAN en Outbox
               |
               v
[n8n VET-CORE-05 procesa evento de preparación de visita en modo seguro]
```

---

## 3. ESPECIFICACIÓN DE LA TABLA `okvet_manual_confirmations`

```sql
CREATE TABLE IF NOT EXISTS public.okvet_manual_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    okvet_appointment_id TEXT NOT NULL,
    confirmation_notes TEXT NOT NULL,
    evidence_attachment_id UUID REFERENCES public.medical_documents(id),
    performed_by UUID NOT NULL REFERENCES public.profiles(id),
    confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (appointment_id),
    UNIQUE (okvet_appointment_id)
);
```

### Reglas de Negocio Estrictas
1. **Unicidad Bidireccional:** Una cita en Supabase solo puede confirmarse una vez, y un identificador de cita de OKVET no puede reutilizarse en ninguna otra cita del sistema.
2. **Inmutabilidad Absoluta:** Las filas de esta tabla nunca pueden ser editadas ni eliminadas (`UPDATE` y `DELETE` bloqueados a nivel de RLS y triggers). Si una cita confirmada es posteriormente cancelada o reprogramada, el registro de confirmación original permanece intacto con fines de auditoría forense y se genera un nuevo ciclo de agendamiento.
3. **Auditoría Vinculada:** Se registra automáticamente el UUID del usuario autenticado que ejecutó la confirmación (`performed_by = auth.uid()`).
