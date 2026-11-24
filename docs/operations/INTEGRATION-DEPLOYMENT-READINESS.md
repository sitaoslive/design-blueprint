# VET FREEDOM OS — RUNBOOK: PREPARACIÓN PARA DESPLIEGUE A PRODUCCIÓN
## Checklist de Pre-Lanzamiento, Invariantes Safe Mode y Procedimiento de Activación

---

### 1. Checklist Obligatorio de Activación de Producción

Antes de autorizar la activación (`active: true`) de cualquiera de los 21 workflows VET-CORE o habilitar el envío real de mensajes (`send_enabled: true`), deben cumplirse rigurosamente los siguientes 10 puntos de control:

- [ ] **1. Migraciones de Base de Datos al Día**: Las 39 migraciones en Supabase aplicadas y verificadas con 0 errores de RLS.
- [ ] **2. Suite Completa de Tests Pasada al 100%**: Ejecución de las pruebas unitarias y de integración (2.026 pruebas totales acumuladas) con 0 fallos.
- [ ] **3. Credenciales Reales Seguras**: API Keys de Meta WhatsApp, Service Account de Google Calendar y llaves de Wompi almacenadas en secrets cifrados de n8n / Supabase Vault (nunca en texto plano ni en Git).
- [ ] **4. Webhooks de Producción Homologados**: URLs de webhooks con HTTPS y certificados SSL válidos, con validación estricta de firmas HMAC.
- [ ] **5. Autorización Médica Firmada**: Acta de validación y consentimiento de uso del sistema firmada por el Dr. Luis Eduardo Ríos.
- [ ] **6. Capacidad de Concurrencia Validada**: Verificación de conexiones de base de datos (`pgBouncer`) y advisory locks operativos.
- [ ] **7. Storage Buckets Privados**: Verificación de permisos privados y caducidad de firmas efímeras a 24 horas.
- [ ] **8. Políticas de Opt-Out WhatsApp**: Plantillas aprobadas por Meta con botón de cancelación o exclusión para el cliente.
- [ ] **9. Procedimiento de Soporte Telefónico Activo**: Línea de voz de respaldo para emergencias o fallas de entrega de mensajes.
- [ ] **10. Backups Automáticos Programados**: Snapshots diarios de PostgreSQL y almacenamiento con retención de 30 días.

---

### 2. Procedimiento de Pase a Producción (Go-Live)

1. **Aprobación de la Dirección**: El Dr. Luis Eduardo Ríos emite la orden formal de despliegue.
2. **Activación de Workflows en n8n Cloud**:
   - Activar secuencialmente desde VET-CORE-01 hasta VET-CORE-21.
   - Verificar recepción del primer ping de salud en VET-CORE-20.
3. **Cambio de Modo en Supabase**:
   - Actualizar el parámetro global en `system_configurations`:
     `UPDATE system_configurations SET setting_value = '{"safe_mode": false, "environment": "production"}' WHERE config_key = 'GLOBAL_ENVIRONMENT';`
4. **Monitoreo Intensivo (Primeras 48 Horas)**:
   - Supervisión en tiempo real de `integration_reconciliation_runs` cada 4 horas.
   - Verificación de 0 excepciones en la Dead Letter Queue.
