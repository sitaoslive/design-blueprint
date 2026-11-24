# VET FREEDOM OS — REGISTRO DE INTEGRACIONES DEL ECOSISTEMA (INTEGRATIONS REGISTRY)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Sección Normativa:** 01.5 y 17 del Prompt Maestro de Implementación  

---

## 1. Estado Consolidado de Integraciones

| Integración | Protocolo / Mecanismo | Entorno | Estado Real | Evidencia Verificada | Acciones Pendientes |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Supabase PostgreSQL 17** | MCP Oficial + PostgREST | Cloud (`sznvahhocgnhsqhksygq`) | **CONNECTED** | 86 tablas RLS, 4 outbox triggers, tipos exportados (175 KB). | Ninguna. |
| **n8n Automation Cloud** | MCP Oficial (`alphavision.app.n8n.cloud`)| Cloud | **CONNECTED** | 22 workflows implementados, ejecuciones 75..97 exitosas (200 OK). | Poblar bóveda de credenciales externas. |
| **WhatsApp Business Platform** | Meta Cloud API Webhooks | Cloud / Sandbox | **STAGED / SAFE MODE** | Contrato validado en VET-CORE-02/03. Despacho pausado (`send_enabled: false`). | Configurar WABA ID y token permanente. |
| **Google Calendar** | OAuth 2.0 (Individual) | Cloud | **STAGED** | VET-CORE-06 configurado en modo estricto `BUSY_ONLY`. | Conectar credencial OAuth en n8n Vault. |
| **OKVET** | Protocolo Asistido | Operativo | **MANUAL ASSISTED** | Procedimiento de reconciliación y confirmación en dos pasos activo. | Capacitar al coordinador en conciliación. |
| **Google Maps Platform** | REST Distance Matrix & Geocoding | Cloud | **STAGED** | Contrato de cálculo de ruta y retrasos en VET-CORE-08. | Añadir API Key con facturación habilitada. |
| **Proveedor de IA** | Antigravity AI Engine + Gemini SDK | Local / Cloud | **CONNECTED** | Herramientas estructuradas ejecutables y compiladas en `dist/`. | Ninguna. |
| **Correo Transaccional** | SMTP / Webhook | Cloud | **STAGED** | Módulo de entrega de documentos aprobados con enlaces firmados. | Configurar credenciales SMTP del dominio. |
| **Pasarelas de Pago** | Nequi / Bre-B / Transferencia | Operativo | **MANUAL ASSISTED** | Flujo de validación de comprobante en COP en VET-CORE-14. | Provisión de extractos para conciliación. |
| **Lovable Frontend** | Vite + React + Supabase Client | Mobile / Web | **STAGED** | Tipos autogenerados en `types/supabase.ts` listos para enlace. | Configurar variables de entorno en Lovable. |

---

## 2. Regla de Declaración de Estado
Conforme a la instrucción permanente del proyecto:
- Ninguna integración se marca como `CONNECTED` sin una prueba empírica válida de conexión.
- Los servicios dependientes de credenciales de terceros se mantienen en estado `STAGED` o `SAFE MODE` para evitar llamadas a clientes reales o facturación no autorizada.
