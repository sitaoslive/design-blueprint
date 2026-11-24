# INTEGRACIÓN OAUTH2 CON GOOGLE CALENDAR API — VET-CORE-06
## Protocolo Oficial, Credenciales, Scopes de Menor Privilegio y Seguridad

**Proyecto:** VET FREEDOM OS  
**Módulo:** `VET-CORE-06 | GOOGLE CALENDAR SYNC`  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Estado:** QA / STAGING (Safe Mode: `send_enabled: false`)

---

## 1. Configuración de la Aplicación Google Cloud Platform

Para conectar calendarios en Vet Freedom OS, se utiliza la consola oficial de Google Cloud Platform bajo la organización Vet Life:

- **Tipo de Aplicación:** Web Application (OAuth 2.0 Client ID)
- **Nombre:** Vet Freedom OS Calendar Integration
- **URI de Redirección Autorizada (Redirect URI):**  
  `https://alphavision.app.n8n.cloud/rest/oauth2-credential/callback`
- **Orígenes de JavaScript Autorizados:**  
  `https://alphavision.app.n8n.cloud`

---

## 2. Política de Menor Privilegio (OAuth Scopes)

### Modo A: Calendarios Personales (Dr. Luis Ríos / Equipo Staff)
Para resguardar el secreto profesional y la privacidad del equipo médico:
- **Scope Estricto:** `https://www.googleapis.com/auth/calendar.events.freebusy`
- **Alternativa de Solo Lectura:** `https://www.googleapis.com/auth/calendar.readonly`
- **Prohibición Expresa:** Queda prohibido solicitar o aceptar el scope de escritura total `https://www.googleapis.com/auth/calendar` para calendarios personales.

### Modo B: Calendarios Operacionales Institucionales
- **Scope Autorizado:** `https://www.googleapis.com/auth/calendar.events`
- **Finalidad:** Creación y actualización de eventos de visitas veterinarias confirmadas en la ruta operativa.

---

## 3. Almacenamiento y Ciclo de Vida de Credenciales

1. **Bóveda Criptográfica en n8n Cloud:** Los tokens de acceso (`access_token`) y actualización (`refresh_token`) residen exclusivamente en la bóveda cifrada AES-256 de n8n Cloud (`credentials.googleCalendarOAuth2Api`).
2. **Cero Exposición de Secretos:** Queda formalmente prohibido almacenar `access_token` o `refresh_token` en texto claro dentro de tablas de Supabase, variables de entorno públicas, logs de ejecución, commits de git o payloads de webhooks.
3. **Refresco Automático Transparente:** n8n renueva automáticamente el `access_token` antes de su expiración (duración habitual de Google: 3600 segundos).
4. **Manejo de Revocación (`invalid_grant`):**  
   Si el usuario revoca el acceso desde su cuenta de Google o el `refresh_token` expira:
   - Google retorna `HTTP 400 invalid_grant`.
   - El sistema actualiza el estado de la conexión en Supabase a `REAUTH_REQUIRED`.
   - Se notifica al panel de Lovable para que el usuario autorice nuevamente la conexión.
   - El sistema entra en modo seguro de degradación sin afectar citas clínicas existentes.
