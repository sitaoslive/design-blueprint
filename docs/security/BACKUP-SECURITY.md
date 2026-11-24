# SEGURIDAD Y PRIVACIDAD EN RESPALDOS Y MANTENIMIENTO (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Cumplimiento Normativo:** Ley 1581 de 2012 (Habeas Data Colombia)  

---

## 1. Políticas de Cifrado y Confidencialidad
1. **Cifrado en Reposo (At-Rest):** Todos los snapshots de base de datos y respaldos en almacenamiento persistente están cifrados mediante AES-256 gestionado por Supabase.
2. **Cifrado en Tránsito (In-Transit):** Todas las transferencias de metadatos y disparos de webhook operan exclusivamente a través de TLS 1.3 con certificados válidos.
3. **Checksums Criptográficos Inmutables:** Cada respaldo calcula y almacena un hash SHA-256 de 64 caracteres hexadecimales para verificar que el contenido no ha sido alterado, truncado o corrompido.

---

## 2. Sanitización de Workflows y Secretos
- Las copias de seguridad de flujos de n8n exportadas al repositorio local o remoto (`automation/n8n/workflows/`) **NUNCA** incluyen credenciales crudas, contraseñas de base de datos, API keys de WhatsApp ni tokens de acceso a Supabase.
- n8n exporta exclusivamente la estructura de nodos y parámetros lógicos; las referencias a credenciales utilizan IDs opacos desacoplados.

---

## 3. Seguridad a Nivel de Filas (Row Level Security - RLS)
- Las tres tablas creadas por la migración 024 tienen RLS habilitado y forzado:
  - `integration_backup_records`: Acceso exclusivo para el rol de servicio (`service_role`) y lectura autorizada para el Director médico.
  - `integration_maintenance_windows`: Acceso administrativo restringido para gestión de ventanas.
  - `integration_restore_tests`: Registro inmutable donde solo el sistema automatizado de pruebas tiene privilegios de inserción.

---

## 4. Auditoría de Modo Seguro
- El workflow `fjVxzNJqrYkFIcWg` permanece en modo `active: false` durante la fase de desarrollo e integración.
- `send_enabled: false` garantiza que durante ninguna prueba de respaldo o mantenimiento se disparen mensajes de WhatsApp, SMS o correos electrónicos a clientes reales o pacientes.
