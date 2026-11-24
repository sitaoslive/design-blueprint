# KNOWN BLOCKERS — VET FREEDOM OS
## Registro de Bloqueos Reales, Dependencias y Rutas de Desbloqueo
**Fecha:** 2026-11-20  
**Proyecto:** Vet Freedom OS  
**Módulo:** Gestión de Dependencias y Preparación de Producción  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Principio Fundamental de Gobernanza de Bloqueos
- **Cero Inventos:** No se reportan bloqueos especulativos; solo dependencias reales requeridas para la salida a producción.
- **Continuidad Operativa:** Ningún bloqueo de proveedor externo impide la construcción del backend, lógica de negocio, políticas de seguridad o pruebas técnicas sintéticas.

---

## 2. Inventario de Bloqueos Reales Identificados

### Bloqueo B-01: Credenciales Oficiales de Meta WhatsApp Cloud API (WABA)
- **Qué falta:** 
  1. Identificador de la Cuenta Comercial de WhatsApp (WABA ID).
  2. Identificador del Número de Teléfono Oficial de Vet Life (Phone Number ID).
  3. Token de Acceso Permanente del Sistema (System User Access Token).
  4. Aprobación de plantillas transaccionales oficiales en Meta Business Suite.
- **Quién debe proporcionarlo:** Dr. Luis Eduardo Ríos / Administrador de la Cuenta de Meta de Vet Life.
- **Dónde se configura:**
  - En n8n Cloud: Credenciales de nodo WhatsApp / Webhook de Meta.
  - En Supabase: Parámetros en tabla `public.organization_integrations`.
- **Cómo verificarlo:**
  - Envío de un mensaje de prueba con plantilla autorizada a un teléfono de prueba sintético interno (sin tocar clientes reales).
- **Qué trabajo independiente puede continuar:**
  - Construcción y prueba completa de VET-CORE-02, VET-CORE-03 y VET-CORE-04 con el motor de simulación sintética (`send_enabled: false`).

---

### Bloqueo B-02: Credenciales de Integración de Google Calendar (OAuth 2.0)
- **Qué falta:**
  1. Proyecto en Google Cloud Console para Vet Life con API de Google Calendar habilitada.
  2. Client ID y Client Secret de OAuth 2.0.
  3. Autorización de consentimiento para lectura de bloques de ocupación (`freeBusy.query` / BUSY_ONLY).
- **Quién debe proporcionarlo:** Dr. Luis Eduardo Ríos (cuenta de Google Workspace de Vet Life).
- **Dónde se configura:**
  - En n8n Cloud: Credencial de tipo `googleCalendarOAuth2Api`.
- **Cómo verificarlo:**
  - Ejecución de consulta de disponibilidad que retorne bloques ocupados sin exponer detalles privados de la agenda médica.
- **Qué trabajo independiente puede continuar:**
  - Lógica de sincronización y detección de conflictos en `CalendarSyncService` y VET-CORE-05 en modo mock/simulado.

---

### Bloqueo B-03: Clave de API de Google Maps Platform (Distance Matrix / Directions)
- **Qué falta:**
  1. API Key de Google Maps Platform con restricciones HTTP/IP y facturación habilitada en Google Cloud.
  2. Habilitación de APIs: Geocoding API, Distance Matrix API y Directions API.
- **Quién debe proporcionarlo:** Dr. Luis Eduardo Ríos / Alpha Vision Method.
- **Dónde se configura:**
  - En Supabase Vault / Variables de entorno seguras de n8n.
- **Cómo verificarlo:**
  - Consulta de prueba de cálculo de distancia y tiempo de viaje entre dos coordenadas de Bogotá (ej: Usaquén a Suba).
- **Qué trabajo independiente puede continuar:**
  - Motor de simulación de rutas de VET-CORE-06 utilizando matriz sintética de tiempos de tráfico por franja horaria.

---

### Bloqueo B-04: Credenciales de Acceso o Protocolo Oficial de OKVET
- **Qué falta:**
  1. Determinación del mecanismo oficial de interoperabilidad con OKVET: API REST oficial, webhook o interfaz de importación/exportación asistida.
  2. Credenciales de servicio o credenciales de operador clínico del Dr. Luis.
- **Quién debe proporcionarlo:** Dr. Luis Eduardo Ríos / Soporte Técnico de OKVET.
- **Dónde se configura:**
  - En VET-CORE-09 y VET-CORE-17 de n8n y tabla `clinical_records_sync` en Supabase.
- **Cómo verificarlo:**
  - Validación de existencia de un registro clínico de prueba y conciliación asistida sin sobreescritura autónoma.
- **Qué trabajo independiente puede continuar:**
  - Arquitectura completa de reconciliación asistida: VET FREEDOM OS genera la propuesta y requiere confirmación manual del veterinario responsable antes de sincronizar.

---

### Bloqueo B-05: Credenciales de Pasarelas de Pago en Producción (Wompi / Bold / PSE)
- **Qué falta:**
  1. Llaves privadas y públicas de producción de Wompi / Bold.
  2. Secreto de eventos de webhooks (`WEBHOOK_EVENTS_SECRET`) para verificación de firmas HMAC.
- **Quién debe proporcionarlo:** Dr. Luis Eduardo Ríos / Responsable Financiero de Vet Life.
- **Dónde se configura:**
  - En Supabase Vault / Credenciales seguras de n8n Cloud.
- **Cómo verificarlo:**
  - Transacción de prueba en entorno sandbox/simulado con verificación exitosa de firma HMAC sin cobros reales.
- **Qué trabajo independiente puede continuar:**
  - VET-CORE-14 opera con adaptadores sandbox y simuladores matemáticos exactos en QA (`send_enabled: false`).

---

### Bloqueo B-06: Proveedor Tecnológico Autorizado de Facturación Electrónica DIAN
- **Qué falta:**
  1. Nombre y credenciales de API del software o proveedor tecnológico autorizado por la DIAN (ej. Siigo, Alegra, Factus, etc.).
  2. Resolución DIAN vigente de numeración y prefijos autorizados de factura electrónica.
- **Quién debe proporcionarlo:** Dr. Luis Eduardo Ríos / Contador oficial de Vet Life.
- **Dónde se configura:**
  - En variables de entorno de backend y tabla `financial_invoices`.
- **Cómo verificarlo:**
  - Emisión de factura electrónica de prueba en entorno de pruebas/habilitación de la DIAN con obtención de CUFE válido.
- **Qué trabajo independiente puede continuar:**
  - Modelo relacional completo, cálculo de impuestos, notas crédito y entrega segura mediante CORE-13.

---

## 3. Resumen de Estado de Bloqueos para el Ciclo Actual

| Bloqueo | Impacto en VET-CORE-01 | ¿Impide que VET-CORE-01 sea VERIFIED? |
|---|---|---|
| **B-01 (WhatsApp)** | Ninguno (VET-CORE-01 solo enruta eventos internamente) | **NO** |
| **B-02 (Calendar)** | Ninguno (VET-CORE-01 solo enruta eventos internamente) | **NO** |
| **B-03 (Maps)** | Ninguno (VET-CORE-01 solo enruta eventos internamente) | **NO** |
| **B-04 (OKVET)** | Ninguno (VET-CORE-01 solo enruta eventos internamente) | **NO** |

**Conclusión:** VET-CORE-01 no posee dependencias externas bloqueantes para su verificación técnica completa. Su clasificación es legítimamente **VERIFIED**.
