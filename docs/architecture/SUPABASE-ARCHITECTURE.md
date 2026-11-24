# VET FREEDOM OS — ARQUITECTURA EMPRESARIAL SUPABASE
**Proyecto:** Vet Life — Veterinaria a Domicilio (Dr. Luis Eduardo Ríos)  
**Dirección Estratégica:** Alpha Vision Method  
**Ambiente:** Desarrollo (`vet-freedom-os-dev`)  
**Project Ref:** `sznvahhocgnhsqhksygq`  
**Region:** `us-east-1` | **Engine:** PostgreSQL 17.12.0  
**Fecha de Publicación:** 2026-11-20  

---

## 1. PRINCIPIOS DE ARQUITECTURA

VET FREEDOM OS adopta una arquitectura desacoplada y orientada a eventos donde cada componente opera bajo un principio estricto de responsabilidad única:

```mermaid
graph TD
    UserApp["Lovable Web UI (App Principal)"] -->|HTTPS REST / PostgREST (sb_publishable_...)| Supabase["Supabase PostgreSQL 17 (Fuente de Verdad)"]
    WhatsAppClient["Cliente WhatsApp"] -->|Webhook / Meta Cloud API| n8n["n8n Orchestrator (alphavision.app.n8n.cloud)"]
    n8n -->|Poller Outbox / Webhook Seguro| Supabase
    Supabase -->|Transactional Outbox (idempotente)| n8n
    StaffApp["Asistente Veterinario"] -->|Auth RLS / Invoker Views| Supabase
    n8n -->|Manual Assisted / Import Verificado| OKVET["OKVET (Expediente Clínico Oficial)"]
```

1. **Lovable es la interfaz de usuario principal:** Consume la API REST y Realtime de Supabase utilizando exclusivamente la clave publicable moderna (`sb_publishable_caToaYTxjdravNvXvDuVLg_htNwLZzI`). Nunca expone la clave `service_role`.
2. **Supabase es la fuente de verdad y autorización empresarial:** Centraliza identidades, perfiles, citas, rutas, finanzas, inventarios y políticas RLS para los 11 roles.
3. **OKVET conserva la autoridad del expediente clínico oficial:** Las citas y diagnósticos no se consideran confirmados oficialmente hasta que se cuente con la referencia y confirmación verificable (`MANUAL ASSISTED` / `okvet_references`).
4. **n8n orquesta comunicaciones y eventos externos:** Se integra mediante el patrón *Transactional Outbox* para garantizar despacho durable, deduplicación e idempotencia sin acoplar la base de datos a fallos de red de terceros.

---

## 2. AISLAMIENTO MULTI-ORGANIZACIÓN (TENANT ISOLATION)

Todas las tablas operativas y transaccionales poseen la columna `organization_id UUID NOT NULL REFERENCES public.organizations(id)`.
- El aislamiento a nivel de base de datos se garantiza mediante Row Level Security (RLS).
- Funciones auxiliares protegidas (`is_org_member`, `is_org_staff`, `is_org_admin`) validan la pertenencia del usuario mediante `public.organization_memberships`.
- Se prohíbe el acceso cruzado entre diferentes organizaciones o sedes no autorizadas.

---

## 3. MODELO DE AUTORIZACIÓN: LOS 11 ROLES

El sistema implementa de forma nativa los 11 roles operativos y de supervisión definidos en la especificación:

| # | Código de Rol | Tipo de Usuario | Alcance de Acceso |
|---|---------------|-----------------|-------------------|
| 1 | `OWNER_CLIENT` | Cliente / Propietario | Solo sus propias mascotas, citas, direcciones y pagos. |
| 2 | `CAREGIVER` | Cuidador autorizado | Delegación revocable con nivel configurado (`ROUTINE_ONLY`, `EMERGENCY_ONLY`, etc.). |
| 3 | `VETERINARIAN` | Médico Veterinario | Agenda asignada, fichas de pacientes en consulta, check-in, botiquín móvil. |
| 4 | `VET_ASSISTANT` | Auxiliar Veterinario | Apoyo en ruta, inventario de insumos, preparación de material. |
| 5 | `COORDINATOR` | Coordinador de Agenda | Gestión de solicitudes, balanceo de rutas, resolución de conflictos. |
| 6 | `RECEPTION` | Recepción | Triaje inicial, pre-registro telefónico, información general de servicios. |
| 7 | `FINANCE` | Finanzas | Verificación de recaudos (Bre-B, Nequi, etc.), conciliación, cartera. |
| 8 | `ADMINISTRATOR` | Administrador | Gestión completa de la organización, miembros, tarifas y catálogo. |
| 9 | `DIRECTOR` | Luis / Dirección Médica | Aprobación de remisiones complejas, simulación estratégica, gobernanza IA. |
| 10 | `TECH_SUPPORT` | Soporte Técnico | Monitoreo de integraciones, eventos fallidos, outbox dead-letter. |
| 11 | `ALPHA_CONSULTANT` | Consultor Alpha Vision | Auditoría de métricas, optimización de flujos y arquitectura. |

---

## 4. PATRÓN TRANSACTIONAL OUTBOX PARA N8N

Para evitar inconsistencias en caso de caídas de red o reinicios de microservicios, el sistema no invoca webhooks HTTP de manera sincrónica dentro de transacciones de base de datos.
1. La aplicación o trigger inserta un registro en `public.transactional_outbox` en la misma transacción ACID de la operación empresarial.
2. n8n ejecuta un poller seguro o webhook de reclamación atómica (`status = 'PENDING' -> 'CLAIMED'`).
3. Tras la ejecución exitosa en n8n, el evento se registra en `public.processed_events` con su `idempotency_key` y el outbox pasa a `PROCESSED`.
4. Si ocurren fallos reiterados tras 5 reintentos con backoff exponencial, el evento se deriva a `public.dead_letter_queue` para auditoría y reejecución manual.

---

## 5. SEGURIDAD DE CLIENTE Y LOVABLE

- **Vistas con Security Invoker:** Las vistas `v_daily_schedule`, `v_patient_360` y `v_n8n_outbox_queue` utilizan `WITH (security_invoker = true)` (Postgres 17). Esto garantiza que la consulta respeta la identidad y políticas RLS del usuario que llama desde Lovable.
- **Protección de Datos Sensibles:** La tabla `customer_experience_memory` (CEM) y los campos clínicos no se exponen al rol `anon`. La información de duelo (`bereavement_records`) activa de forma obligatoria la supresión de marketing y recordatorios automáticos.
- **Tipado TypeScript Automático:** Se genera el archivo `types/supabase.ts` desde el esquema en vivo de PostgreSQL para proveer tipado estático seguro al frontend en Lovable.
