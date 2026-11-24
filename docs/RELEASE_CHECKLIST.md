# VET FREEDOM OS — LISTA DE VERIFICACIÓN PARA PUESTA EN PRODUCCIÓN (RELEASE CHECKLIST)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Sección Normativa:** 23 del Prompt Maestro de Implementación  

---

## 1. Puertas de Seguridad y Validación Pre-Producción (Go-Live Gates)

Para autorizar la conmutación de modo seguro (`active: false`, `send_enabled: false`) a producción en vivo, el equipo de ingeniería debe certificar el 100% de los siguientes puntos:

### Gate 1: Seguridad y Base de Datos (Supabase)
- [x] **RLS Activo:** 86 de 86 tablas en `public` con políticas RLS activas (auditado con `supabase_mcp` execute_sql).
- [x] **Permisos Anónimos Revocados:** 0 funciones con search_path mutable, 0 ejecuciones anónimas en RPCs sensibles (`npm test` $\rightarrow$ 12/12 pasadas).
- [x] **Triggers de Outbox Operativos:** 4 disparadores DDL emitiendo eventos consistentes a `transactional_outbox`.
- [ ] **Backup y Restauración Probada:** Snapshot de respaldo verificado en el panel de Supabase y script de prueba de restauración ejecutado.

### Gate 2: Automatización y Orquestación (n8n Cloud)
- [x] **22 Workflows Implementados:** Todos en el proyecto `DoPm60I3EipMm6rG` bajo la carpeta `EWfSa40jLDxPUOKX`.
- [x] **Topología Verificada:** 0 nodos huérfanos, 0 conexiones rotas (verificado mediante BFS en `tests/audit_workflows_wiring.js`).
- [x] **Doble Trigger Configurado:** Webhook oficial + Manual Trigger con extractor dual de cuerpo POST.
- [x] **Zona Horaria Oficial:** `America/Bogota` en la configuración de los 22 workflows.
- [x] **Pruebas Empíricas en la Nube:** Ejecuciones 75 a 97 ejecutadas con código 200 OK y estado `success`.
- [ ] **Bóveda de Credenciales Poblada:** Meta Cloud API y Google Calendar OAuth configurados con tokens permanentes.
- [ ] **Asignación de Error Workflow:** Asignar `uWO95CQ8twQDL9Gk` (VET-CORE-19) como manejador global al momento de publicar.

### Gate 3: Cerebro Operativo y Herramientas (TypeScript Core)
- [x] **Compilación Limpia:** Directorio `dist/` generado al 100% con cero errores de TypeScript (`npm run build`).
- [x] **28 Herramientas Tipadas:** Catálogo oficial con validación de roles, riesgos e idempotencia.
- [x] **Motor de Decisiones:** Centro de Aprobaciones con versionado concurrente (rechazo de propuestas desactualizadas verificado en `E2E-11`).
- [x] **Suites de Pruebas Superadas:** 
  - `npm test`: 12/12 pruebas de políticas de seguridad.
  - `npm run test:all`: 108/108 pruebas de integridad relacional, documental y tipada.
  - `npm run test:e2e`: 12/12 pruebas de extremo a extremo completadas.

### Gate 4: Integración Frontend (Lovable)
- [ ] **Variables de Entorno Configuradas en Lovable:**
  - `VITE_SUPABASE_URL`: `https://sznvahhocgnhsqhksygq.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `sb_publishable_caToaYTxjdravNvXvDuVLg_htNwLZzI`
- [ ] **Tipos Estáticos Supabase Vinculados:** Utilizar `types/supabase.ts` en los servicios de datos de la interfaz.
- [ ] **Vistas Móviles Verificadas:** Probar en resoluciones de iPhone y Android la vista de Inicio, Agenda, Asistente y Aprobaciones del Dr. Luis.

---

## 2. Protocolo de Activación en Producción (Switch-Over)

Una vez obtenida la firma formal del Dr. Luis Eduardo Ríos:

1. **Paso 1:** Configurar tokens en n8n Credentials Vault.
2. **Paso 2:** Publicar los 22 workflows mediante `publish_workflow` en n8n.
3. **Paso 3:** Establecer `errorWorkflow: "uWO95CQ8twQDL9Gk"` en los workflows publicados.
4. **Paso 4:** Conmutar `send_enabled: true` en los despachadores de mensajería saliente de WhatsApp.
5. **Paso 5:** Realizar la primera prueba de humo en vivo con el número de prueba del Dr. Luis.
6. **Paso 6:** Activar el webhook de producción de Meta hacia `https://alphavision.app.n8n.cloud/webhook/whatsapp/inbound`.
