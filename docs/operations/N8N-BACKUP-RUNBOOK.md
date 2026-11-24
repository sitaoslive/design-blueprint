# MANUAL OPERATIVO DE RESPALDOS DE N8N (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Instancia:** n8n Cloud (`https://alphavision.app.n8n.cloud`)  
**ID de Carpeta:** `EWfSa40jLDxPUOKX`  
**Destinatarios:** Ingeniero de Automatización n8n y DevOps  

---

## 1. Naturaleza de la Instancia n8n
La instancia de orquestación de Vet Freedom OS se hospeda en la nube oficial de **n8n Cloud**. Por consiguiente:
- No existe acceso directo al sistema operativo subyacente, volumen físico de Docker ni base de datos SQLite/Postgres de n8n.
- La estrategia de respaldo de n8n se ejecuta a través de la **API oficial / MCP de n8n**, extrayendo la definición semántica y topológica de todos los workflows.

---

## 2. Procedimiento de Exportación Versionada de Workflows

### 2.1. Exportación Sanitizada (Sin Secretos)
Todos los 22 workflows de Vet Freedom OS se exportan a los directorios del repositorio:
- `automation/n8n/workflows/`
- `automation/n8n/core/`

Regla de Seguridad Irrenunciable:
- n8n exporta exclusivamente nodos, conexiones, parámetros lógicos y expresiones.
- Las referencias a credenciales utilizan IDs opacos (e.g. `credentialId: "..."`), **nunca las llaves privadas, tokens de WhatsApp ni secretos OAuth**.

### 2.2. Verificación de Integridad de Workflows
Tras cada ciclo de exportación:
1. Comprobar que los 22 archivos JSON sean sintácticamente válidos (`JSON.parse`).
2. Verificar que cada workflow conserve su propiedad `timezone = "America/Bogota"`.
3. Verificar que la configuración mantenga `active = false` durante desarrollo/QA.
