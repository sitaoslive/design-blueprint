# POLÍTICA OFICIAL DE MANTENIMIENTO PREVENTIVO (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Principios de Mantenimiento Preventivo
1. **Cero Actualizaciones Automáticas No Autorizadas:** Ninguna librería, imagen de Docker, extensión de PostgreSQL ni community node se actualiza de forma automática en producción.
2. **Ventana de Mantenimiento Obligatoria (`MAINTENANCE_WINDOW`):** Todo cambio que implique aplicación de migraciones DDL, optimización de índices o reinicio de microservicios debe ejecutarse dentro de una ventana de mantenimiento programada y autorizada.
3. **Supresión Coordinada de Alertas:** Durante la ventana activa en Supabase (`status = 'ACTIVE'`), `VET-CORE-21` activa el flag `suppress_core20_alerts = true` para evitar saturación de falsos positivos en el monitoreo.
4. **Inmunidad de Incidentes P0:** Las alertas catastróficas (corrupción de datos, fallos de seguridad o inaccesibilidad absoluta) nunca se suprimen y siempre escalan al Director.

---

## 2. Horarios y Ventanas Operativas Recomendadas
Para no interferir con las rutas veterinarias ni la atención domiciliaria de Vet Life:
- **Ventana de Mantenimiento Semanal:** Domingos de 02:00 a 04:00 COT.
- **Ventana de Mantenimiento de Emergencia:** Convocada bajo aprobación explícita del Dr. Luis Eduardo Ríos con al menos 30 minutos de preaviso operativo.

---

## 3. Matriz de Componentes Sujetos a Mantenimiento

| Componente | Frecuencia de Revisión | Acciones de Mantenimiento | Responsable |
|---|---|---|---|
| **PostgreSQL 17** | Semanal | VACUUM ANALYZE, verificación de índices, purga de eventos > 30 días. | DBA Supabase |
| **Storage Buckets** | Quincenal | Conciliación de archivos huérfanos y revisión de cuotas en COP. | DevOps |
| **n8n Cloud** | Mensual | Revisión de versiones estables, depuración de logs antiguos. | Automation Engineer |
| **Credenciales & Tokens** | Quincenal | Auditoría de fechas de expiración en `integration_credentials_metadata`. | Security Lead |
| **Pruebas de Restauración** | Mensual | Ejecución de prueba sintética de restauración en entorno aislado. | QA Engineer |
