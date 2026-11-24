# CONVERSATION ASSIGNMENT SCHEMA & DATA DICTIONARY
## VET FREEDOM OS — Migración 026
**Motor de Base de Datos:** PostgreSQL 17.12.0 (Supabase)  
**Esquema:** `public`  
**Fecha:** 2026-11-21  

---

## 1. Columnas Agregadas a `public.conversations`

| Columna | Tipo | Restricción / Default | Propósito |
|---|---|---|---|
| `state_version` | `integer` | `NOT NULL DEFAULT 1` | Contador monotónico anti-carrera para supresión de IA |
| `assigned_team` | `text` | `DEFAULT 'RECEPCION'` | Equipo responsable (`DIRECTOR`, `VET`, `COORDINACION`, `RECEPCION`, `FINANZAS`, `SOPORTE`) |
| `assigned_role` | `text` | `DEFAULT 'RECEPTION'` | Rol requerido para atender la conversación |
| `human_takeover_at` | `timestamptz` | `NULL` | Momento en el que el operador humano tomó control efectivo |
| `handoff_priority` | `text` | `DEFAULT 'STANDARD'` | Severidad (`CRITICAL`, `HIGH`, `MEDIUM`, `STANDARD`, `LOW`) |
| `escalation_deadline_at`| `timestamptz` | `NULL` | Fecha y hora límite calculada para cumplimiento del SLA |
| `ai_generation_version` | `integer` | `DEFAULT 1` | Versión asociada a la generación en curso de la IA |

---

## 2. Nueva Tabla: `public.conversation_handoffs`

Almacena cada ciclo de transferencia humana, tiempos de atención y resolución:

```sql
CREATE TABLE public.conversation_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'PENDING_ASSIGNMENT' CHECK (status = ANY (ARRAY[
    'REQUESTED'::text, 'PENDING_ASSIGNMENT'::text, 'ASSIGNED'::text, 'ACCEPTED'::text, 
    'REJECTED'::text, 'ESCALATED'::text, 'RESOLVED'::text, 'CANCELLED'::text
  ])),
  handoff_reason text NOT NULL,
  priority text NOT NULL DEFAULT 'STANDARD' CHECK (priority = ANY (ARRAY['CRITICAL'::text, 'HIGH'::text, 'MEDIUM'::text, 'STANDARD'::text, 'LOW'::text])),
  requested_team text NOT NULL DEFAULT 'RECEPCION',
  requested_role text NOT NULL DEFAULT 'RECEPTION',
  assigned_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  summary text,
  metadata jsonb DEFAULT '{}'::jsonb,
  sla_minutes integer NOT NULL DEFAULT 30,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  first_human_response_at timestamptz,
  resolved_at timestamptz,
  state_version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 3. Nueva Tabla: `public.conversation_state_transitions`

Pista de auditoría inmutable de todas las transiciones de estado:

```sql
CREATE TABLE public.conversation_state_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  handoff_id uuid REFERENCES public.conversation_handoffs(id) ON DELETE SET NULL,
  previous_state text NOT NULL,
  new_state text NOT NULL,
  state_version integer NOT NULL,
  actor_type text NOT NULL CHECK (actor_type = ANY (ARRAY['BOT'::text, 'STAFF'::text, 'SYSTEM'::text, 'CLIENT'::text])),
  actor_id text NOT NULL,
  reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 4. Nueva Tabla: `public.conversation_internal_notes`

Notas internas de equipo, segregadas de los mensajes de cliente:

```sql
CREATE TABLE public.conversation_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```
