# VET FREEDOM OS — GITHUB ↔ LOVABLE ↔ ANTIGRAVITY MASTER HANDOFF
## Manual de Arquitectura Unificada, Sincronización y Continuidad Operacional
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Especificación:** Master Prompt 17 — Version 17.0  
**Fecha:** 2026-11-22  
**Estado:** `VERIFIED & OPERATIONAL`

---

## 1. VISIÓN GENERAL DE LA INTEGRACIÓN UNIFICADA

Este documento establece el marco definitivo de integración y coexistencia armónica entre:
1. **Lovable Application (`https://lovable.dev/projects/15c49998-094d-4d22-8c47-71a6f0c3f644`):** Entorno de construcción de interfaces, experiencia de usuario y desarrollo ágil en React 19, TypeScript y TanStack Start.
2. **Repositorio Central en GitHub (`https://github.com/sitaoslive/design-blueprint.git`):** Frontera compartida de control de versiones, revisión de código y disparador de CI/CD.
3. **Google Antigravity Engineering Workspace:** Entorno de arquitectura avanzada, desarrollo de servicios backend protegidos, orquestación de bases de datos PostgreSQL 17 y pruebas automatizadas exhaustivas.
4. **Supabase Cloud / Lovable Data Infrastructure:** Base de datos PostgreSQL autoritativa, autenticación JWT, Row Level Security al 100% y almacenamiento seguro de expedientes clínicos.
5. **n8n Automation Cloud (`https://alphavision.app.n8n.cloud`):** Motor de orquestación externa, mensajería transaccional por WhatsApp Business y sincronización con Google Calendar.

---

## 2. PARÁMETROS FORMALES DE CONEXIÓN

```env
# Repositorio Oficial
GITHUB_REPO_URL=https://github.com/sitaoslive/design-blueprint.git
GITHUB_DEFAULT_BRANCH=main
GITHUB_FEATURE_BRANCH=antigravity/integration-foundation

# Proyecto Lovable Oficial
LOVABLE_PROJECT_URL=https://lovable.dev/projects/15c49998-094d-4d22-8c47-71a6f0c3f644
LOVABLE_TEMPLATE=tanstack_start_ts_current

# Backend Supabase Oficial
SUPABASE_URL=https://sznvahhocgnhsqhksygq.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_caToaYTxjdravNvXvDuVLg_htNwLZzI
SUPABASE_ORG_ID=11111111-1111-1111-1111-111111111111

# Orquestador n8n Cloud
N8N_WEBHOOK_BASE=https://alphavision.app.n8n.cloud/webhook
```

---

## 3. PROTOCOLO DE SINCRONIZACIÓN BIDIRECCIONAL

### Dirección A: Lovable → GitHub → Antigravity
1. El usuario o diseñador realiza modificaciones en el editor visual de Lovable.
2. Lovable genera automáticamente un commit firmado por su bot en la rama `main` de GitHub.
3. Antigravity ejecuta periódicamente o antes de cada tarea:
   ```bash
   git fetch origin main
   git merge origin/main --ff-only  # o rebase limpio en rama de características
   ```
4. Antigravity inspecciona las diferencias introducidas por Lovable y adapta los servicios sin destruir pantallas, componentes ni rutas.

### Dirección B: Antigravity → GitHub → Lovable
1. Antigravity desarrolla mejoras, contratos o adaptadores en una rama de características dedicada (`antigravity/*`).
2. Se ejecutan las suites de pruebas automatizadas locales para garantizar 0 regresiones.
3. Se realiza `git push origin antigravity/<feature>`.
4. Se abre un Pull Request hacia `main`.
5. GitHub Actions ejecuta `.github/workflows/ci.yml` (Bun + Vitest en Ubuntu).
6. Tras la aprobación, se realiza el merge a `main`.
7. El webhook integrado de Lovable detecta el merge y sincroniza el nuevo commit directamente en el editor de Lovable.

---

## 4. INTEGRACIÓN DE SERVICIOS BACKEND EN COMPONENTES LOVABLE

Lovable consume las capacidades desarrolladas por Antigravity mediante adaptadores fuertemente tipados que conectan el almacén local (`src/lib/vf/store.ts`) con las funciones autoritativas de Supabase:

### 4.1 Live Dispatch & Smart ETA (Prompt 15B / VET-LIVE-DISPATCH)
- **Registro de Eventos de Campo:** Médicos veterinarios marcan `TRAVEL_STARTED`, `ARRIVED`, `FINISH_ESTIMATE_UPDATED` y `SERVICE_FINISHED` mediante la RPC `record_visit_timing_event`.
- **Portal de Seguimiento del Cliente:** La familia abre `/t/:token` consumiendo la RPC pública segura `validate_customer_tracking_view`, recibiendo el tiempo de llegada estimado (ETA) con supresión total de GPS salvo durante el trayecto hacia su domicilio.

### 4.2 Puente Asistido OKVET sin API (Ley 576 de 2000)
- Formulario de conciliación asistida en Lovable donde el equipo registra el radicado oficial en OKVET Cloud mediante la RPC atómica `submit_okvet_human_confirmation`.

### 4.3 Finanzas y Verificación de Cobros (Prompt 09 / VET-CORE-14)
- Los comprobantes de transferencias bancarias (Nequi, Daviplata, Bre-B) se registran en estado `PENDING_VERIFICATION` y únicamente transicionan a `PAID` tras cotejo con extracto bancario real por el rol `FINANCE` o el Dr. Luis Eduardo Ríos.

### 4.4 Sincronización en Tiempo Real (Realtime)
- Lovable se suscribe a los cambios reactivos en las tablas críticas (`appointments`, `delay_incidents`, `operational_tasks`, `conversations`) mediante canales de Supabase Realtime, reflejando de inmediato en UI las alertas de ruta y actualizaciones de agenda.

---

## 5. REGLAS DE SEGURIDAD E INVARIABLES DEL SISTEMA

1. **Nunca exponer la clave `service_role`:** Solo la clave publicable (`sb_publishable_...`) reside en el cliente.
2. **Soberanía Clínica de OKVET:** La IA jamás prescribe medicamentos ni emite diagnósticos médicos de forma autónoma.
3. **Modo Seguro Activo en Desarrollo:** Todos los flujos operan con `send_enabled: false` para evitar envíos de mensajes reales a clientes o cobros bancarios accidentales.
4. **Protección del Historial Git:** Prohibición estricta de `git push --force` o reescritura de commits publicados en ramas conectadas a Lovable.
