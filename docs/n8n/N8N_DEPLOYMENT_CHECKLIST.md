# CHECKLIST DE DESPLIEGUE EN PRODUCCIÓN (GO-LIVE) — VET FREEDOM OS
## Procedimiento de Activación Gradual y Puertas de Aprobación

**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección:** Dr. Luis Eduardo Ríos  
**Entorno Actual:** DEVELOPMENT / QA  
**Modo de Seguridad:** `send_enabled: false` (Estricto)  

---

## FASE 1: AUDITORÍA DE SEGURIDAD Y PRE-REQUISITOS (100% CUMPLIDA)
- [x] **Base de Datos:** 43 migraciones aplicadas en Supabase (`sznvahhocgnhsqhksygq`).
- [x] **Seguridad de Datos:** 100% de tablas con RLS forzado. Ejecución revocada a rol `anon`.
- [x] **Workflows n8n:** 22 workflows implementados y validados en la carpeta `Vet Freedom OS`.
- [x] **Pruebas Automatizadas:** 2,526 / 2,526 pruebas superadas (100% de éxito).
- [x] **Inmutabilidad de Agenda:** CERO modificaciones automáticas a citas oficiales en Supabase.
- [x] **Privacidad de Tracking:** Coordenadas GPS enmascaradas (`null`) salvo durante el estado `EN_ROUTE`.

---

## FASE 2: GATES DE APROBACIÓN TÉCNICA Y MÉDICA
- [ ] **GATE 1 — Aprobación Médica Formal:**
  - El Dr. Luis Eduardo Ríos firma el acta de aceptación de la arquitectura y el puente asistido OKVET.
- [ ] **GATE 2 — Aprovisionamiento de Credenciales Seguras:**
  - Meta WhatsApp Business API: Token permanente, Phone Number ID, Webhook Secret Token.
  - Google Routes API Key: Cuota asignada para cálculo de tráfico en vivo en Bogotá.
  - Google Calendar OAuth: Permisos `calendar.readonly` y `calendar.events` configurados.
- [ ] **GATE 3 — Verificación de Plantillas de WhatsApp:**
  - `vet_live_delay_notice` aprobada en el Business Manager de Meta.
  - `vet_appointment_confirmation` aprobada.
  - `vet_preventive_reminder` aprobada.

---

## FASE 3: ACTIVACIÓN GRADUAL EN PRODUCCIÓN (RAMP-UP)
1. **Paso 3.1 — Activar Modo Auditoría / Sombra (Shadow Mode):**
   - Activar workflows con `active: true` manteniendo `send_enabled: false`.
   - Monitorear durante 24 horas la correcta ingesta de telemetría y el cálculo de cascada.
2. **Paso 3.2 — Activar Despachos Internos de Coordinación:**
   - Activar alertas hacia el Dashboard de Coordinación y Lovable.
3. **Paso 3.3 — Activar Notificaciones al Cliente (Canal Piloto):**
   - Cambiar `send_enabled: true` exclusivamente para citas del Dr. Luis Ríos con clientes piloto informados.
4. **Paso 3.4 — Despliegue General:**
   - Habilitar operación plena para todo el personal veterinario y de apoyo.
