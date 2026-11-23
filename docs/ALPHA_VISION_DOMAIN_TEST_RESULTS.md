# ALPHA VISION — DOMAIN & SUBDOMAIN RESOLUTION AUDIT (PART 16 REVISED)
**Fecha:** 2026-11-23  
**Dominio Base:** `alphavisionm.com`  
**Registrador:** Hostinger  
**Servidores de Nombres Autoritativos:** Cloudflare (`justin.ns.cloudflare.com`, `nina.ns.cloudflare.com`)  
**Estado:** `READY FOR CNAME MAPPING`

---

## 1. Verificación de Resolución DNS Global en Vivo

Ejecutamos consultas en vivo sobre los registros de internet:

### Servidores de Nombres Autoritativos (NS)
```powershell
Resolve-DnsName -Name alphavisionm.com -Type NS
```
**Resultado:**
- `justin.ns.cloudflare.com` (TTL: 86400)
- `nina.ns.cloudflare.com` (TTL: 86400)

**Conclusión:** La gestión de DNS está 100% activa en **Cloudflare** para la cuenta `Alphavisionmethod@gmail.com`.

### Registro Raíz (A)
```powershell
Resolve-DnsName -Name alphavisionm.com -Type A
```
**Resultado:**
- `185.158.133.1` (Servidor web / Landing de Hostinger)

---

## 2. Tabla de Registros CNAME para Aplicar en Cloudflare

Para activar los subdominios con el certificado **SSL Universal Wildcard** de Cloudflare y conectarlos a la aplicación en Lovable:

| Registro | Tipo | Nombre (Host) | Destino (Target) | Proxy Status | TTL | Propósito |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Dr. Luis** | `CNAME` | `luis` | `cname.lovable.dev` | **DNS Only (Gris)** | Auto | Portal privado exclusivo de Vet Life y Dr. Luis |
| **Vet SaaS** | `CNAME` | `vet` | `cname.lovable.dev` | **DNS Only (Gris)** | Auto | Portal comercial SaaS, demos y registro de 30 días |
| **Wildcard** | `CNAME` | `*` | `cname.lovable.dev` | **DNS Only (Gris)** | Auto | Subdominios instantáneos para nuevas veterinarias (`sanroque.alphavisionm.com`, etc.) |
| **Contractors** | `CNAME` | `contractors` | `cname.lovable.dev` | **DNS Only (Gris)** | Auto | Portal de Contractor OS para contratistas |

> [!TIP]
> **¿Por qué DNS Only (Nube Gris) al inicio?**  
> Lovable utiliza Let's Encrypt para generar el certificado SSL multi-tenant de tu frontend. La nube gris permite que el robot de validación de Lovable resuelva directamente el CNAME y emita el certificado al instante. Luego de que Lovable confirme el dominio en verde, puedes activar el proxy de Cloudflare (Nube Naranja) si deseas protección DDoS y aceleración de borde.

---

## 3. Ticket OP-05: Activación de `GEMINI_API_KEY`

El código de **Vet Life** y **Alpha Vision Copilot** ya cuenta con el adaptador tipado y listo para recibir la clave de Google Gemini sin necesidad de reescribir componentes.

### Pasos para Activar:
1. **En Lovable Cloud:**
   - Ve a **Project Settings > Environment Variables** (o Variables de Entorno).
   - Añade una nueva variable:
     - **Key:** `VITE_GEMINI_API_KEY` (o `GEMINI_API_KEY`)
     - **Value:** `AIzaSy...` (tu token de Google AI Studio)
   - Haz clic en **Save** y despliega.
2. **En n8n Cloud:**
   - Abre tu instancia de n8n Cloud (`https://*.app.n8n.cloud`).
   - Ve a **Credentials > New Credential > Google Gemini API**.
   - Pega tu `GEMINI_API_KEY`.
   - Asigna la credencial al nodo del agente de IA en los flujos de mensajería.
