# VET FREEDOM OS — LOVABLE & SUPABASE INTEGRATION CONTRACTS
## Especificación de Contratos de Interfaz entre Lovable SPA y Supabase
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Frontend:** Lovable SPA (React / TypeScript / Tailwind / Vite)  
**Backend:** Supabase PostgreSQL / Storage / Auth  
**Fecha:** 2026-11-21  

---

## 1. ARQUITECTURA DE INTEGRACIÓN FRONTEND-BACKEND

La interfaz de usuario en Lovable interactúa con Supabase mediante el SDK oficial `@supabase/supabase-js`, aprovechando tipado estricto autogenerado en `types/supabase.ts`.

```
[Lovable SPA Components / React Hooks]
                 |
                 v
   [@supabase/supabase-js Client]
                 |
        +--------+--------+
        |                 |
  (PostgREST API)   (Supabase Auth & Storage)
        |                 |
        v                 v
   [PostgreSQL]     [Private S3 Buckets]
   (RLS Forzado)    (URLs Firmadas 900s)
```

---

## 2. CONTRATOS CLAVE DE OPERACIÓN Y FLUJOS

### 2.1 Flujo de Agendamiento en Lovable
1. **Consulta de Disponibilidad:**
   - La vista de agendamiento ejecuta consultas a `public.staff_availability` y filtra franjas ocupadas.
2. **Creación de Reserva Temporal (Hold):**
   - El componente invoca el RPC:
     ```typescript
     const { data, error } = await supabase.rpc('create_appointment_hold', {
       p_organization_id: currentOrgId,
       p_staff_profile_id: selectedVetId,
       p_start_time: selectedSlot.start,
       p_end_time: selectedSlot.end,
       p_hold_duration_minutes: 15,
       p_hold_session_token: sessionToken
     });
     ```
   - Si `data.success === false`, la UI muestra alerta inmediata: "Franja ocupada recientemente, por favor selecciona otro horario".
3. **Registro de Cita en Estado `REQUESTED`:**
   - Inserción estándar en `public.appointments` vinculada al `hold_id`.

### 2.2 Formulario de Confirmación Asistida OKVET (Mesa de Soporte / Médico)
- En el portal de operaciones, los usuarios con rol autorizado acceden al formulario de conciliación clínica:
  ```typescript
  const { data, error } = await supabase.rpc('submit_okvet_human_confirmation', {
    p_appointment_id: appointment.id,
    p_okvet_appointment_id: okvetRefInput,
    p_confirmation_notes: notesInput,
    p_evidence_attachment_id: uploadedDocId || null,
    p_performed_by: user.id
  });
  ```
- Tras la respuesta positiva, la tarjeta de la cita transiciona visualmente a estado `CONFIRMED` en tiempo real.

### 2.3 Carga Segura de Documentos Clínicos y Comprobantes
1. El usuario selecciona el archivo (PDF, JPEG, PNG).
2. Se valida el límite en cliente ($< 25\text{ MB}$).
3. Se sube al bucket privado:
   ```typescript
   const { data: uploadData, error: uploadError } = await supabase.storage
     .from('medical-records')
     .upload(`${orgId}/${petId}/${Date.now()}_${file.name}`, file);
   ```
4. Se registra la fila en `public.medical_documents`.
5. Para visualización, se solicita una URL firmada con expiración de 15 minutos (`createSignedUrl(path, 900)`).

---

## 3. SINCRONIZACIÓN EN TIEMPO REAL (SUPABASE REALTIME)

Lovable utiliza canales de Realtime para actualizar las vistas de campo sin recargar la página. La migración 044 ha habilitado `REPLICA IDENTITY FULL` en las 10 tablas críticas:

1. `appointments` & `appointment_requests`: Agenda del día y solicitudes entrantes.
2. `delay_incidents` & `eta_predictions`: Semáforo de incidencias de ruta y tiempos de llegada.
3. `operational_tasks`: Bandeja de tareas pendientes y compromisos.
4. `conversations` & `messages`: Mensajería de soporte y atención.
5. `visit_timing_records` & `tracking_sessions`: Telemetría y eventos de campo.
6. `integration_incidents`: Monitor de salud de integraciones.

---

## 4. CONTRATOS DE LIVE DISPATCH & TRACKING PARA LOVABLE

Consulte los contratos detallados de telemetría y despacho en vivo en [`LOVABLE-DISPATCH-CONTRACTS.md`](file:///c:/Users/Freud/N8NVET/docs/contracts/LOVABLE-DISPATCH-CONTRACTS.md) y la guía paso a paso en [`LOVABLE-CONNECTION-GUIDE.md`](file:///c:/Users/Freud/N8NVET/docs/integrations/LOVABLE-CONNECTION-GUIDE.md).
