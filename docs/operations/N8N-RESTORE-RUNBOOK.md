# MANUAL DE RESTAURACIÓN Y RECUPERACIÓN DE N8N (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Destinatarios:** Ingeniero de Automatización n8n, DevOps y Director Médico  

---

## 1. Escenario de Falla Total de la Instancia n8n
Si la instancia de n8n Cloud se torna inaccesible, se corrompe o requiere reconstrucción en una nueva cuenta o entorno self-hosted:

### Procedimiento de Reconstrucción:
1. **Aprovisionamiento de la Nueva Instancia:**
   - Desplegar nueva instancia n8n (Cloud o Docker self-hosted v1.3.0+).
   - Si es self-hosted, inyectar la variable de entorno `N8N_ENCRYPTION_KEY` custodiada de forma segura.
2. **Re-creación de Credenciales Base:**
   - Crear credencial de Supabase (`supabaseApi` con publishable key y secret key de contingencia).
   - Crear credencial de WhatsApp Business Cloud API (`whatsappApi` con token de sistema y Phone Number ID).
   - Crear credencial de Google Calendar OAuth.
3. **Importación Masiva de Workflows:**
   - Utilizar la API REST de n8n (`POST /api/v1/workflows`) o el MCP oficial para importar los 22 archivos JSON desde `automation/n8n/workflows/`.
4. **Garantía de Modo Seguro Post-Restauración:**
   - Comprobar que todos los workflows importados permanezcan en estado **`active: false`**.
   - Ningún trigger programado (`Schedule Trigger`) ni webhook debe activarse antes de la validación.
5. **Ejecución de Smoke Tests de Validación:**
   - Ejecutar `VET-QA-001 | AI Connection Smoke Test` (ID: `8FxcpmC7HV0zdRQJ`).
   - Ejecutar `tests/audit_workflows_wiring.js` para comprobar que todos los 22 workflows mantengan sus conexiones de nodos intactas.
6. **Autorización y Pase a Producción:**
   - El Dr. Luis Eduardo Ríos emite la orden formal de activación de webhooks y triggers una vez confirmada la estabilidad de la nueva instancia.
