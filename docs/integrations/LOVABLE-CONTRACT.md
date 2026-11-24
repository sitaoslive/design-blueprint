# VET FREEDOM OS — CONTRATO DE INTEGRACIÓN FRONTEND (LOVABLE)
**Proyecto:** Vet Life — Veterinaria a Domicilio  
**Aplicación Frontend:** Lovable Web Application  
**Backend:** Supabase PostgreSQL 17 (`vet-freedom-os-dev`)  
**Fecha:** 2026-11-20  

---

## 1. PARÁMETROS DE CONEXIÓN OFICIALES

Para conectar la interfaz construida en Lovable con este backend empresarial en Supabase, configure las siguientes variables de entorno en el proyecto frontend:

```env
VITE_SUPABASE_URL=https://sznvahhocgnhsqhksygq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_caToaYTxjdravNvXvDuVLg_htNwLZzI
```

> [!IMPORTANT]
> **REGLA DE SEGURIDAD ABSOLUTA:** Nunca configure ni exponga la clave `service_role` en Lovable. Toda la lógica de autorización de datos se ejecuta a través de Row Level Security (RLS) en PostgreSQL, evaluando el token JWT del usuario conectado.

---

## 2. CLIENTE SUPABASE CON TIPADO ESTÁTICO (TYPESCRIPT)

Copie el archivo generado en [`types/supabase.ts`](file:///c:/Users/Freud/N8NVET/types/supabase.ts) a la carpeta de tipos de su repositorio Lovable (e.g. `src/integrations/supabase/types.ts`).

Inicialice el cliente oficial de Supabase con los tipos de la base de datos:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
```

---

## 3. AUTENTICACIÓN Y ROLES EN LOVABLE

Lovable utiliza Supabase Auth estándar (`supabase.auth.signUp`, `signInWithPassword`, `signInWithOtp`).
- Al iniciar sesión, el perfil del usuario se encuentra en `public.user_profiles` (`id = auth.uid()`).
- Los roles asignados se consultan en `public.organization_memberships` o mediante la función RPC:
  ```typescript
  const { data: role } = await supabase.rpc('current_user_role', { 
    p_org_id: currentOrgId 
  });
  ```
- La interfaz de Lovable debe adaptar la navegación según el rol detectado:
  - `OWNER_CLIENT`: Vista de sus mascotas, solicitud de citas, historial y pagos.
  - `VETERINARIAN`: Vista de citas asignadas del día, botón de check-in geolocalizado, resumen clínico.
  - `COORDINATOR` / `RECEPTION`: Bandeja de solicitudes entrantes, mapa de rutas y asignación.
  - `FINANCE`: Bandeja de cobros pendientes de verificación (Bre-B, Nequi, comprobantes).
  - `ADMINISTRATOR` / `DIRECTOR`: Gestión de catálogo, tarifas, personal, aprobaciones de remisión y simulador.

---

## 4. VISTAS RECOMENDADAS PARA CONSUMO EN LOVABLE

Para optimizar el rendimiento y reducir el número de peticiones HTTP en componentes complejos, consulte las vistas con `security_invoker`:

### 1. Agenda Consolidada del Día: `public.v_daily_schedule`
Retorna citas, paciente, propietario, dirección, veterinario y estado de confirmación:
```typescript
const { data: schedule, error } = await supabase
  .from('v_daily_schedule')
  .select('*')
  .order('start_time', { ascending: true });
```

### 2. Ficha 360 del Paciente: `public.v_patient_360`
Retorna datos del paciente, propietario, bandera de duelo y lista de vacunas pendientes:
```typescript
const { data: patient, error } = await supabase
  .from('v_patient_360')
  .select('*')
  .eq('pet_id', petId)
  .single();
```

---

## 5. CREACIÓN DE SOLICITUDES DE CITAS (CLIENTE / PROPIETARIO)

Para agendar una nueva consulta domiciliaria desde Lovable:
```typescript
const { data, error } = await supabase
  .from('appointment_requests')
  .insert({
    organization_id: orgId,
    owner_id: ownerId,
    pet_id: petId,
    service_id: serviceId,
    address_id: addressId,
    preferred_date: '2026-11-25',
    preferred_time_window: 'MORNING',
    reason_for_consultation: 'Control de vacunas y desparasitación',
    source_channel: 'LOVABLE_WEB'
  })
  .select()
  .single();
```
*Esto inserta la solicitud en Supabase y automáticamente crea el evento en el outbox para que n8n valide y notifique al equipo.*

---

## 6. PAGINACIÓN Y CONTROL DE ERRORES

- Aplique siempre `.range(from, to)` para listados largos (clientes, historial de citas, mensajes).
- Capture los códigos de error estándar de PostgreSQL expuestos por PostgREST:
  - `42501` / `PGRST301`: Permiso denegado por RLS (usuario intenta acceder a recursos no autorizados).
  - `23505`: Violación de restricción única (ej. código de sede duplicado, reserva duplicada).
