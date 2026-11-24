# INTEGRATION DEPENDENCIES — VET FREEDOM OS
## Inventario y Estado de Integraciones Externas del Ecosistema
**Fecha:** 2026-11-20  
**Proyecto:** Vet Freedom OS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Mapa de Dependencias del Ecosistema

```
  +-------------------------------------------------------+
  |              VET FREEDOM OS ARCHITECTURE              |
  +-------------------------------------------------------+
                             |
         +-------------------+-------------------+
         |                                       |
  [ INTERFAZ ]                            [ BACKEND ]
  Lovable Web/PWA App              Supabase PostgreSQL 17
         |                                       |
         +-------------------+-------------------+
                             |
                   [ EVENT DISPATCHER ]
                   n8n Cloud (VET-CORE-01)
                             |
      +---------------+------+--------+---------------+
      |               |               |               |
 [ WHATSAPP ]    [ CALENDAR ]     [ MAPS/ROUTING ]  [ CLINICAL ]
 Meta Cloud API  Google Calendar  Google Maps/Waze   OKVET Sync
```

---

## 2. Estado de Cada Integración Externa

| Integración | Proveedor | Módulos Relacionados | Estado Actual | Modo Seguro | Dependencia Requerida |
|---|---|---|---|---|---|
| **Supabase** | Supabase Inc. (AWS us-east-1) | Base de datos principal, RLS, Auth, Outbox | **OPERATIVO Y VERIFICADO** | N/A | Proyecto `sznvahhocgnhsqhksygq` conectado |
| **n8n Cloud** | n8n.io (Cloud Cluster) | Orquestación, VET-CORE-01 a VET-CORE-21 | **OPERATIVO Y VERIFICADO** | `active: false` | Proyecto `DoPm60I3EipMm6rG`, 22 flujos |
| **WhatsApp Business Platform** | Meta Cloud API | VET-CORE-02, VET-CORE-03, VET-CORE-04 | **CONFIGURADO EN MODO SIMULACIÓN** | `send_enabled: false` | WABA ID, Phone Number ID, Meta App Token |
| **Google Calendar** | Google Workspace API | VET-CORE-05, Agenda Unificada | **CONTRATO LISTO (BUSY_ONLY)** | Simulación activa | OAuth Client ID & Secret / Refresh Token |
| **Google Maps & Waze** | Google Maps Platform | VET-CORE-06 (Rutas y Tráfico) | **CONTRATO LISTO** | Caché sintética | Google Maps API Key con Distance Matrix |
| **OKVET** | OKVET Clinical System | VET-CORE-09, VET-CORE-17 (Historias Clínicas) | **SINCRONIZACIÓN ASISTIDA** | Asistida humana | Credenciales de API o portal oficial |
| **AI Gateway** | Anthropic / OpenAI / Google AI | VET-QA-001, VET-CORE-03, VET-CORE-18 | **OPERATIVO Y VERIFICADO** | Límites activos | OpenAI Credential `c7qY0d1HqPz3fG8j` en n8n |

---

## 3. Matriz de Aislamiento y Trabajo Independiente

Para garantizar que el avance técnico nunca se detenga debido a credenciales externas pendientes de terceros:

1. **Desarrollo Desacoplado:** Todos los módulos operan sobre contratos tipados e interfaces de simulación (`VetActionService`, `CalendarSyncService`, `EventQueueService`).
2. **Pruebas con Datos Sintéticos:** El 100% de los flujos de negocio pueden probarse de extremo a extremo sin interactuar con pacientes ni clientes reales.
3. **Seguridad de Activación:** Las credenciales de producción solo se inyectarán en las variables de entorno de Supabase Vault y n8n Credentials una vez que el Dr. Luis Eduardo Ríos emita la autorización formal de salida a producción.
