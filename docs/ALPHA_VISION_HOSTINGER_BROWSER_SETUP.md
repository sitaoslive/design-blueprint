# ALPHA VISION — HOSTINGER & CLOUDFLARE DOMAIN AUDIT & SETUP (PART 16 REVISED)
## Auditoría en Vivo con Antigravity Browser, Servidores de Nombres Autoritativos y Subdominios de Clientes
**Dominio Principal:** `alphavisionm.com`  
**Registrador Oficial:** Hostinger  
**Servidores de Nombres Autoritativos:** Cloudflare (`justin.ns.cloudflare.com`, `nina.ns.cloudflare.com`)  
**Fecha de Auditoría:** 2026-11-23  
**Estado:** `LIVE VERIFIED AUDIT COMPLETE`

---

## 1. HALLAZGO CRÍTICO DE LA INSPECCIÓN EN VIVO DEL NAVEGADOR

El **Browser Agent de Antigravity** navegó e inspeccionó la sesión abierta en Hostinger (`https://hpanel.hostinger.com/domains`):
- **Dominio:** `alphavisionm.com` (Activo, caducidad: 2027-10-27, autorrenovación activa).
- **Servidores de Nombres (Nameservers):**
  - `justin.ns.cloudflare.com`
  - `nina.ns.cloudflare.com`
- **Aviso Autoritativo de Hostinger:**
  > *"El DNS es administrado por otro proveedor. Tu dominio está registrado con Hostinger, pero el DNS se gestiona en otro lugar. Para gestionar los registros DNS aquí, cambia tus nameservers a Hostinger."*

### Conclusión Técnica Decisiva
Cualquier registro DNS (A, CNAME, TXT, MX) que se añadiera en el panel de Hostinger **no tendría ningún efecto en internet**, porque el tráfico mundial consulta a **Cloudflare**.  
Por lo tanto, la zona autoritativa real donde se activan los subdominios (`luis.alphavisionm.com`, `vet.alphavisionm.com`, `*.alphavisionm.com`) es la cuenta de **Cloudflare** vinculada a estos nameservers.

---

## 2. ARQUITECTURA DE SUBDOMINIOS AUTOMÁTICOS (WILDCARD) EN CLOUDFLARE

Cloudflare es la plataforma ideal para SaaS multi-tenant con subdominios automáticos:
1. **Certificado SSL Wildcard Gratuito:** Cloudflare Universal SSL cubre automáticamente `alphavisionm.com` y `*.alphavisionm.com` sin costo adicional.
2. **Subdominios Ilimitados:** Un solo registro Wildcard (`*`) permite que cualquier nueva veterinaria (`happyvet.alphavisionm.com`, `sanroque.alphavisionm.com`, etc.) quede en línea al instante sin crear registros DNS manualmente.

### Matriz de Registros DNS a Configurar en Cloudflare:

| Tipo | Nombre (Host) | Contenido / Destino | Proxy Cloudflare | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| `CNAME` | `luis` | `cname.lovable.dev` (o target de Lovable) | **DNS Only (Gris)** o Proxied | **Dr. Luis Eduardo Ríos:** Portal exclusivo privado de Vet Life. |
| `CNAME` | `vet` | `cname.lovable.dev` | Proxied (Naranja) | **Vet Freedom OS:** Portal SaaS de clínicas, demos y registro de 30 días. |
| `CNAME` | `contractors` | Host / IP de Contractor OS | Proxied (Naranja) | **Contractor OS:** Software para contratistas y servicios de campo. |
| `CNAME` | `*` (Wildcard) | `cname.lovable.dev` | **DNS Only (Gris)** | **Subdominios Automáticos:** Nuevas clínicas y contratistas suscritos. |
| `@` (Raíz) | `@` | Hostinger IP / Servidor Web | Proxied (Naranja) | **Alpha Vision Method:** Landing page principal de la empresa matriz. |

---

## 3. PLAN DE APROBACIÓN PREVIA (SAFETY FIRST)

Antes de realizar cambios en Cloudflare o Hostinger:
1. **Preservación de Correo Electrónico:** Verificar que los registros `MX`, `SPF` y `DKIM` de correo corporativo permanezcan intactos en Cloudflare para no interrumpir la recepción de correos.
2. **Prueba Gradual:**
   - *Paso 1:* Crear primero el registro `luis.alphavisionm.com`.
   - *Paso 2:* Verificar resolución DNS y certificado SSL.
   - *Paso 3:* Vincular en Lovable (*Project Settings > Domains*).
   - *Paso 4:* Crear el registro Wildcard `*` para clientes automáticos.
