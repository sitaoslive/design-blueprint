# POLÍTICA DE SEGURIDAD Y PRIVACIDAD EN RESPALDOS (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Normativa Aplicable:** Ley 1581 de 2012 (Habeas Data Colombia)  

---

## 1. Principios de Seguridad en Respaldos
1. **Cifrado Fuerte de Extremo a Extremo:**
   - **En Tránsito:** TLS 1.3 mandatorio para toda conexión hacia Supabase, n8n Cloud y webhooks.
   - **En Reposo:** Cifrado transparente AES-256 en almacenamiento administrado y backups lógicos secundarios.
2. **Custodia Desacoplada de Claves:**
   - La clave para descifrar respaldos **NUNCA** debe residir en el mismo servidor o base de datos que se pretende recuperar.
   - Prohibición expresa de incluir claves privadas en repositorios Git, variables públicas de Lovable o bitácoras de ejecución.
3. **Control de Acceso Basado en Roles (RLS):**
   - Tablas `integration_backup_records`, `integration_maintenance_windows` e `integration_restore_tests` restringidas exclusivamente al rol de servicio (`service_role`) y lectura autorizada para el Director médico.
   - Cero acceso a respaldos para roles de clientes (`OWNER_CLIENT`) y cuidadores (`CAREGIVER`).
4. **Sanitización de Datos en Entornos de Prueba:**
   - Queda terminantemente prohibido exportar bases de datos con información real a equipos personales o entornos locales sin anonimización previa y aprobación explícita.
5. **Modo Seguro Mandatorio:**
   - Durante toda prueba o restauración, el flag `send_enabled = false` garantiza que no se envíen mensajes de WhatsApp ni correos a pacientes o tutores reales.
