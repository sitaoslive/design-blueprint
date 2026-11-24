# INVENTARIO HUMANO CONSOLIDADO DE FUNCIONALIDADES (FEATURES.md)
## ALPHA VISION METHOD — VET LIFE & CONTRACTOR OS CONTROL PLANE
**Versión:** 2.0.0 · **Fecha:** 2026-11-23 · **Entorno de Verificación:** Google Antigravity & Supabase PostgreSQL 17

---

### 1. ESTADOS DE VERIFICACIÓN Y VIGENCIA (CONTRATO § 471)

Toda funcionalidad registrada en este catálogo distingue rigurosamente entre los siguientes estados:

| Estado de Verificación | Definición Operativa | Disponibilidad Comercial |
| :--- | :--- | :--- |
| **`PRODUCTION_VERIFIED`** | Verificada con tests e2e, esquema DDL activo en Supabase, y validación en navegador real. | HABILITADA PARA VENTA |
| **`STAGING_VERIFIED`** | Verificada en entorno local / staging con mocks de proveedores externos (Meta, Wompi, Claude). | LISTA PARA TRIAL / BETA |
| **`MOCK_TESTED`** | Probada contra suite de emuladores sintéticos en Node.js / Playwright sin endpoints de producción. | NO HABILITADA PARA VENTA |
| **`IMPLEMENTED_UNTESTED`** | Código fuente y componentes React / SQL presentes pero sin suite de pruebas automatizadas. | NO HABILITADA PARA VENTA |
| **`SPECIFIED`** | Definida en los blueprints maestros (Partes 1 a 10), lista para diseño de contratos. | EN DESARROLLO / ROADMAP |
| **`PARTIAL`** | Funcionalidad con backend completo pero frontend incompleto o viceversa. | RESTRINGIDA |
| **`BROKEN`** | Funcionalidad con errores de ejecución o dependencias rotas identificadas. | BLOQUEADA |
| **`BLOCKED`** | Bloqueada por aprobaciones externas, licencias comerciales o dependencias de red. | BLOQUEADA |
| **`NOT_FOUND`** | Declarada en menú pero sin implementación en repositorio. | INEXISTENTE |
| **`NOT_APPLICABLE`** | Función no aplicable al producto seleccionado. | EXCLUIDA POR DISEÑO |

> [!CAUTION]
> **Regla de Oro § 471:** Ninguna funcionalidad puede marcarse como disponible comercialmente si no cuenta con el estado `PRODUCTION_VERIFIED` o `STAGING_VERIFIED` con pruebas auditables.

---

### 2. JERARQUÍA DE FUNCIONALIDADES (§ 474)

Estructura obligatoria de árbol:
```
PRODUCTO
  ├── MÓDULO
  │     ├── SUBMÓDULO
  │     │     ├── FUNCIONALIDAD (ID Inmutable)
  │     │     │     └── ACCIÓN / CAPACIDAD
```

---

### 3. CATÁLOGO CONSOLIDADO DE FUNCIONALIDADES

#### 1. [VET.APPOINTMENTS.ONLINE_BOOKING] Reserva de Citas Domiciliarias Online
- **ID Inmutable:** `VET.APPOINTMENTS.ONLINE_BOOKING`
- **Clave de Catálogo:** `vet_online_booking`
- **Producto SaaS:** `VET_LIFE`
- **Jerarquía:** Agenda & Citas → Reservas
- **Descripción Técnica:** Flujo de autogestión de citas para tutores con validación de cobertura geográfica en Medellín y Oriente Antioqueño.
- **Valor para el Cliente:** *Permite a los tutores agendar visitas veterinarias 24/7 sin fricción telefónica.*
- **Roles Autorizados:** `CLIENT`, `RECEPTIONIST`, `VET`
- **Industrias Aplicables:** `VETERINARY_MOBILE`, `VETERINARY_CLINIC`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (Google Calendar & Maps)
- **Genera Costo de IA:** No
- **Genera Costo Externo:** No
- **Plan Mínimo Requerido:** `VET_STARTER`
- **Dependencias Obligatorias:** `VET.CORE.EVENT_BUS`, `VET.CALENDAR.BUSY_SYNC`
- **Archivo Fuente Principal:** `src/routes/reservar.tsx`
- **API / RPC Asociada:** `rpc/schedule_appointment`
- **Flujo n8n Asociado:** `n8n/AVP-005-APPOINTMENTS`
- **Prueba de Aceptación:** `test_core_05_t01_to_t90.js`

---

#### 2. [VET.CLINICAL.MEDICAL_RECORDS] Bóveda de Documentos Clínicos y Fórmulas COMVEZCOL
- **ID Inmutable:** `VET.CLINICAL.MEDICAL_RECORDS`
- **Clave de Catálogo:** `vet_medical_records`
- **Producto SaaS:** `VET_LIFE`
- **Jerarquía:** Historial Clínico → Historias Clínicas
- **Descripción Técnica:** Expediente digital del paciente con validación estricta de tarjeta profesional y firma médica habilitada (Ley 576 de 2000).
- **Valor para el Cliente:** *Tranquilidad legal y médica; acceso inmutable al historial de salud de la mascota.*
- **Roles Autorizados:** `VET`, `DIRECTOR_MEDICO`, `CLIENT`
- **Industrias Aplicables:** `VETERINARY_MOBILE`, `VETERINARY_CLINIC`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (OKVET Official Bridge)
- **Genera Costo de IA:** No
- **Genera Costo Externo:** No
- **Plan Mínimo Requerido:** `VET_STARTER`
- **Dependencias Obligatorias:** `VET.OKVET.PATIENT_BRIDGE`
- **Archivo Fuente Principal:** `src/features/clinical/MedicalRecordsVault.tsx`
- **API / RPC Asociada:** `rpc/sign_medical_record`
- **Flujo n8n Asociado:** `n8n/AVP-013-DOCUMENTS`
- **Prueba de Aceptación:** `test_okvet_bridge_ok01_to_ok30.js`

---

#### 3. [VET.OKVET.PATIENT_BRIDGE] Puente Asistido OKVET de Pacientes, Tutores y Fórmulas
- **ID Inmutable:** `VET.OKVET.PATIENT_BRIDGE`
- **Clave de Catálogo:** `vet_okvet_bridge`
- **Producto SaaS:** `VET_LIFE`
- **Jerarquía:** Integraciones PIMS → OKVET
- **Descripción Técnica:** Sincronización asistida y conciliada de los 46 pacientes y 43 prescripciones oficiales del Dr. Luis Eduardo Ríos.
- **Valor para el Cliente:** *Autoridad legal médica centralizada sin duplicación caótica de registros.*
- **Roles Autorizados:** `VET`, `DIRECTOR_MEDICO`
- **Industrias Aplicables:** `VETERINARY_MOBILE`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (OKVET S.A.S.)
- **Genera Costo de IA:** No
- **Genera Costo Externo:** No
- **Plan Mínimo Requerido:** `VET_GROWTH`
- **Dependencias Obligatorias:** `VET.CORE.DATABASE_RLS`
- **Archivo Fuente Principal:** `supabase/migrations/046_okvet_patient_and_formula_bridge.sql`
- **API / RPC Asociada:** `rpc/sync_okvet_records`
- **Flujo n8n Asociado:** `n8n/AVP-046-OKVET-SYNC`
- **Prueba de Aceptación:** `test_okvet_bridge_ok01_to_ok30.js`

---

#### 4. [VET.MOBILE.HOME_VISIT_ROUTING] Logística de Rutas Domiciliarias, Despacho y Waze/Google Maps
- **ID Inmutable:** `VET.MOBILE.HOME_VISIT_ROUTING`
- **Clave de Catálogo:** `vet_home_routing`
- **Producto SaaS:** `VET_LIFE`
- **Jerarquía:** Operaciones en Campo → Rutas & Despacho
- **Descripción Técnica:** Cálculo inteligente de paradas, tiempos de traslado y botón de lanzamiento directo a navegación GPS.
- **Valor para el Cliente:** *Puntualidad en visitas y reducción de hasta 35% en tiempos muertos de viaje.*
- **Roles Autorizados:** `VET`, `OPERATIONS_DISPATCHER`, `AUXILIAR`
- **Industrias Aplicables:** `VETERINARY_MOBILE`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (Waze / Google Maps API)
- **Genera Costo de IA:** No
- **Genera Costo Externo:** Sí
- **Plan Mínimo Requerido:** `VET_STARTER`
- **Dependencias Obligatorias:** `VET.APPOINTMENTS.ONLINE_BOOKING`
- **Archivo Fuente Principal:** `src/routes/ruta.tsx`
- **API / RPC Asociada:** `rpc/calculate_dispatch_route`
- **Flujo n8n Asociado:** `n8n/AVP-008-DISPATCH`
- **Prueba de Aceptación:** `test_live_dispatch_gps_and_smart_eta.js`

---

#### 5. [VET.AI.CLINICAL_DRAFT_ASSISTANT] Asistente de Redacción Clínica Estructurada (No Diagnóstico)
- **ID Inmutable:** `VET.AI.CLINICAL_DRAFT_ASSISTANT`
- **Clave de Catálogo:** `vet_clinical_ai_draft`
- **Producto SaaS:** `VET_LIFE`
- **Jerarquía:** Inteligencia Artificial Clínica → Borradores Asistidos
- **Descripción Técnica:** Borrador de anamnesis y recomendaciones generales basado en notas de voz del médico. Requiere aprobación y firma humana obligatoria.
- **Valor para el Cliente:** *Ahorra 10 minutos de redacción administrativa por cada consulta realizada.*
- **Roles Autorizados:** `VET`, `DIRECTOR_MEDICO`
- **Industrias Aplicables:** `VETERINARY_MOBILE`, `VETERINARY_CLINIC`
- **Estado de Implementación:** `STAGING_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** No
- **Requiere Integración:** Sí (Anthropic Claude API via Alpha AI Gateway)
- **Genera Costo de IA:** ⚠️ SÍ (Requiere Cuota y Tarifario)
- **Genera Costo Externo:** Sí
- **Plan Mínimo Requerido:** `VET_GROWTH`
- **Dependencias Obligatorias:** `PLATFORM.AI.GATEWAY_METERING`, `VET.CLINICAL.MEDICAL_RECORDS`
- **Archivo Fuente Principal:** `src/services/aiGatewayService.ts`
- **API / RPC Asociada:** `rpc/ai_generate_clinical_draft`
- **Flujo n8n Asociado:** `n8n/AVP-013-AI-DRAFT`
- **Prueba de Aceptación:** `test_ai_copilot_audit.js`

---

#### 6. [VET.WHATSAPP.BOT_DISCOVERY] Ingestión WhatsApp Cloud API y Descubrimiento de Pacientes
- **ID Inmutable:** `VET.WHATSAPP.BOT_DISCOVERY`
- **Clave de Catálogo:** `vet_whatsapp_bot`
- **Producto SaaS:** `VET_LIFE`
- **Jerarquía:** Comunicaciones & WhatsApp → Recepción Automática
- **Descripción Técnica:** Recepción de mensajes de tutores, coincidencia con pacientes existentes y triaje conversacional dentro de la ventana de 24 horas.
- **Valor para el Cliente:** *Atención inmediata al tutor y asignación sin errores al historial de la mascota.*
- **Roles Autorizados:** `CLIENT`, `RECEPTIONIST`
- **Industrias Aplicables:** `VETERINARY_MOBILE`, `VETERINARY_CLINIC`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (Meta WhatsApp Cloud API)
- **Genera Costo de IA:** No
- **Genera Costo Externo:** Sí
- **Plan Mínimo Requerido:** `VET_STARTER`
- **Dependencias Obligatorias:** `VET.CORE.EVENT_BUS`
- **Archivo Fuente Principal:** `supabase/migrations/045_whatsapp_patient_discovery_and_reconciliation.sql`
- **API / RPC Asociada:** `rpc/process_inbound_whatsapp`
- **Flujo n8n Asociado:** `n8n/AVP-002-WHATSAPP`
- **Prueba de Aceptación:** `test_whatsapp_patient_discovery_t01_to_t32.js`

---

#### 7. [VET.FINANCE.GRIEF_SENSITIVE_BILLING] Supresión de Cobros Automáticos por Duelo y Pasarela Wompi
- **ID Inmutable:** `VET.FINANCE.GRIEF_SENSITIVE_BILLING`
- **Clave de Catálogo:** `vet_grief_billing`
- **Producto SaaS:** `VET_LIFE`
- **Jerarquía:** Facturación & Cobros → Protocolo de Duelo
- **Descripción Técnica:** Congelamiento inmediato de recordatorios y cobranzas ante eutanasia o defunción registrada, con liquidación compasiva.
- **Valor para el Cliente:** *Empatía absoluta; previene daños irreparables a la relación con el tutor en momentos de dolor.*
- **Roles Autorizados:** `VET`, `FINANCE`, `DIRECTOR_MEDICO`
- **Industrias Aplicables:** `VETERINARY_MOBILE`, `VETERINARY_CLINIC`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (Wompi / Bancolombia)
- **Genera Costo de IA:** No
- **Genera Costo Externo:** Sí
- **Plan Mínimo Requerido:** `VET_STARTER`
- **Dependencias Obligatorias:** `VET.CORE.DATABASE_RLS`
- **Archivo Fuente Principal:** `supabase/migrations/036_financial_operations_and_invoicing_hub.sql`
- **API / RPC Asociada:** `rpc/suppress_grief_billing`
- **Flujo n8n Asociado:** `n8n/AVP-014-FINANCES`
- **Prueba de Aceptación:** `test_core_14_t01_to_t110.js`

---

#### 8. [VET.PREVENTION.COLD_CHAIN_TRACEABILITY] Trazabilidad de Cadena de Frío y Control de Lotes Biológicos
- **ID Inmutable:** `VET.PREVENTION.COLD_CHAIN_TRACEABILITY`
- **Clave de Catálogo:** `vet_cold_chain`
- **Producto SaaS:** `VET_LIFE`
- **Jerarquía:** Medicina Preventiva → Vacunación
- **Descripción Técnica:** Registro de lote, fecha de vencimiento y temperatura de vacunas aplicadas en domicilio.
- **Valor para el Cliente:** *Garantía de potencia biológica y bioseguridad certificada para la mascota.*
- **Roles Autorizados:** `VET`, `AUXILIAR`
- **Industrias Aplicables:** `VETERINARY_MOBILE`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** No
- **Genera Costo de IA:** No
- **Genera Costo Externo:** No
- **Plan Mínimo Requerido:** `VET_GROWTH`
- **Dependencias Obligatorias:** `VET.CLINICAL.MEDICAL_RECORDS`
- **Archivo Fuente Principal:** `supabase/migrations/032_prevention_care_plans_and_traceability.sql`
- **API / RPC Asociada:** `rpc/log_vaccine_application`
- **Flujo n8n Asociado:** `n8n/AVP-010-PREVENTION`
- **Prueba de Aceptación:** `test_core_10_t01_to_t95.js`

---

#### 9. [CONTRACTOR.BOOKING.ONLINE_BOOKING] Portal de Cotización y Solicitud de Citas de Oficios
- **ID Inmutable:** `CONTRACTOR.BOOKING.ONLINE_BOOKING`
- **Clave de Catálogo:** `contractor_booking`
- **Producto SaaS:** `CONTRACTOR_OS`
- **Jerarquía:** Comercial & Reservas → Solicitudes de Trabajo
- **Descripción Técnica:** Captura de solicitudes de servicio técnico con preguntas dinámicas según oficio (HVAC, Plomería, Electricidad, etc.).
- **Valor para el Cliente:** *Cotizaciones rápidas para propietarios sin llamadas perdidas.*
- **Roles Autorizados:** `CLIENT`, `DISPATCHER`, `OWNER`
- **Industrias Aplicables:** `PLUMBING`, `HVAC`, `ELECTRICAL`, `REMODELING`, `ROOFING`, `LANDSCAPING`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** No
- **Genera Costo de IA:** No
- **Genera Costo Externo:** No
- **Plan Mínimo Requerido:** `CONTRACTOR_ESSENTIAL`
- **Dependencias Obligatorias:** `CONTRACTOR.CORE.DATABASE_RLS`
- **Archivo Fuente Principal:** `src/routes/contractors/index.tsx`
- **API / RPC Asociada:** `rpc/create_contractor_booking_request`
- **Flujo n8n Asociado:** `n8n/AVP-049-CONTRACTOR-LEADS`
- **Prueba de Aceptación:** `test_contractor_os_core_domain.js`

---

#### 10. [CONTRACTOR.FIELD.TIME_TRACKING] Reloj Laboral de Cuadrilla y Tiempos de Mano de Obra
- **ID Inmutable:** `CONTRACTOR.FIELD.TIME_TRACKING`
- **Clave de Catálogo:** `contractor_time_tracking`
- **Producto SaaS:** `CONTRACTOR_OS`
- **Jerarquía:** Operaciones de Campo → Cuadrillas
- **Descripción Técnica:** Check-in/Check-out geolocalizado en el sitio de la obra para cuadrillas de contratistas.
- **Valor para el Cliente:** *Liquidación precisa de horas laboradas y control de rentabilidad de la mano de obra.*
- **Roles Autorizados:** `WORKER`, `CREW_LEAD`, `OWNER`
- **Industrias Aplicables:** `ALL_CONTRACTOR_TRADES`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** No
- **Genera Costo de IA:** No
- **Genera Costo Externo:** No
- **Plan Mínimo Requerido:** `CONTRACTOR_ESSENTIAL`
- **Dependencias Obligatorias:** `CONTRACTOR.JOBS.WORK_ORDERS`
- **Archivo Fuente Principal:** `src/features/contractors/WorkerTimeClock.tsx`
- **API / RPC Asociada:** `rpc/contractor_clock_event`
- **Flujo n8n Asociado:** `n8n/AVP-050-CREW-TIME`
- **Prueba de Aceptación:** `test_contractor_time_tracking.js`

---

#### 11. [CONTRACTOR.SALES.ESTIMATE_FOLLOWUP] Cotizador Interactivo Multinivel (Good-Better-Best) y E-Sign
- **ID Inmutable:** `CONTRACTOR.SALES.ESTIMATE_FOLLOWUP`
- **Clave de Catálogo:** `contractor_estimates_good_better_best`
- **Producto SaaS:** `CONTRACTOR_OS`
- **Jerarquía:** Ventas & Presupuestos → Propuestas Multinivel
- **Descripción Técnica:** Creación de presupuestos de 3 opciones con aceptación digital, anticipo y firma en línea.
- **Valor para el Cliente:** *Aumenta la tasa de cierre en un 28% y el ticket promedio mediante upsells claros.*
- **Roles Autorizados:** `SALES_REP`, `ESTIMATOR`, `OWNER`, `CLIENT`
- **Industrias Aplicables:** `ALL_CONTRACTOR_TRADES`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (Stripe / Wompi)
- **Genera Costo de IA:** No
- **Genera Costo Externo:** Sí
- **Plan Mínimo Requerido:** `CONTRACTOR_ESSENTIAL`
- **Dependencias Obligatorias:** `CONTRACTOR.CORE.DATABASE_RLS`
- **Archivo Fuente Principal:** `src/routes/contractors/estimates/new.tsx`
- **API / RPC Asociada:** `rpc/accept_contractor_proposal`
- **Flujo n8n Asociado:** `n8n/AVP-051-PROPOSALS`
- **Prueba de Aceptación:** `test_contractor_estimates_suite.js`

---

#### 12. [CONTRACTOR.AI.RECEPTIONIST] Recepcionista Telefónico y Conversacional de Cuadrilla IA
- **ID Inmutable:** `CONTRACTOR.AI.RECEPTIONIST`
- **Clave de Catálogo:** `contractor_ai_receptionist`
- **Producto SaaS:** `CONTRACTOR_OS`
- **Jerarquía:** Inteligencia Artificial de Negocio → Recepción 24/7
- **Descripción Técnica:** Atiende llamadas entrantes, califica la emergencia técnica y agenda visitas de inspección.
- **Valor para el Cliente:** *Cero llamadas perdidas de dueños de casa desesperados por fugas o fallas de aire acondicionado.*
- **Roles Autorizados:** `DISPATCHER`, `OWNER`
- **Industrias Aplicables:** `PLUMBING`, `HVAC`, `ROOFING`, `ELECTRICAL`
- **Estado de Implementación:** `STAGING_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** No
- **Requiere Integración:** Sí (Claude 3.5 Sonnet / Vapi / Twilio)
- **Genera Costo de IA:** ⚠️ SÍ (Requiere Cuota y Tarifario)
- **Genera Costo Externo:** Sí
- **Plan Mínimo Requerido:** `CONTRACTOR_GROWTH`
- **Dependencias Obligatorias:** `PLATFORM.AI.GATEWAY_METERING`, `CONTRACTOR.BOOKING.ONLINE_BOOKING`
- **Archivo Fuente Principal:** `src/services/contractorAiReceptionist.ts`
- **API / RPC Asociada:** `rpc/ai_contractor_inbound_call`
- **Flujo n8n Asociado:** `n8n/AVP-052-AI-RECEPTIONIST`
- **Prueba de Aceptación:** `test_ai_contractor_receptionist.js`

---

#### 13. [CONTRACTOR.PROJECT.CLIENT_ROOM] Sala de Proyecto en Vivo y Bitácora Fotográfica
- **ID Inmutable:** `CONTRACTOR.PROJECT.CLIENT_ROOM`
- **Clave de Catálogo:** `contractor_project_room`
- **Producto SaaS:** `CONTRACTOR_OS`
- **Jerarquía:** Experiencia del Propietario → Project Room
- **Descripción Técnica:** Portal privado para el dueño de la casa con timeline de hitos, fotos de antes/después y aprobación de change orders.
- **Valor para el Cliente:** *Transparencia total que elimina disputas por pagos finales y reclamos de calidad.*
- **Roles Autorizados:** `CLIENT`, `CREW_LEAD`, `OWNER`
- **Industrias Aplicables:** `REMODELING`, `ROOFING`, `PLUMBING`, `HVAC`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** No
- **Genera Costo de IA:** No
- **Genera Costo Externo:** Sí
- **Plan Mínimo Requerido:** `CONTRACTOR_ESSENTIAL`
- **Dependencias Obligatorias:** `CONTRACTOR.JOBS.WORK_ORDERS`
- **Archivo Fuente Principal:** `src/routes/contractors/portal/$token.tsx`
- **API / RPC Asociada:** `rpc/update_project_room_status`
- **Flujo n8n Asociado:** `n8n/AVP-053-PROJECT-ROOM`
- **Prueba de Aceptación:** `test_part7_client_portal_verified.js`

---

#### 14. [CONTRACTOR.APP_STUDIO.WHITE_LABEL] Estudio Visual de Aplicación PWA y Marca Propia
- **ID Inmutable:** `CONTRACTOR.APP_STUDIO.WHITE_LABEL`
- **Clave de Catálogo:** `contractor_app_studio`
- **Producto SaaS:** `CONTRACTOR_OS`
- **Jerarquía:** Personalización & Marca → Customer App Studio
- **Descripción Técnica:** Configurador visual de logotipo, colores primarios, iconografía y textos de la app del contratista.
- **Valor para el Cliente:** *El contratista proyecta una imagen premium de empresa de alta tecnología frente a sus clientes.*
- **Roles Autorizados:** `OWNER`
- **Industrias Aplicables:** `ALL_CONTRACTOR_TRADES`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** No
- **Genera Costo de IA:** No
- **Genera Costo Externo:** No
- **Plan Mínimo Requerido:** `CONTRACTOR_GROWTH`
- **Dependencias Obligatorias:** `CONTRACTOR.CORE.DATABASE_RLS`
- **Archivo Fuente Principal:** `src/routes/contractors/app-studio.tsx`
- **API / RPC Asociada:** `rpc/save_contractor_app_studio_config`
- **Flujo n8n Asociado:** `n8n/AVP-054-APP-STUDIO`
- **Prueba de Aceptación:** `test_client_app_part2_studio.js`

---

#### 15. [PLATFORM.DOMAIN.SUBDOMAIN_PROVISIONING] Motor de Subdominios y Wildcard Cloudflare (*.alphavisionm.com)
- **ID Inmutable:** `PLATFORM.DOMAIN.SUBDOMAIN_PROVISIONING`
- **Clave de Catálogo:** `platform_subdomain_engine`
- **Producto SaaS:** `PLATFORM_CORE`
- **Jerarquía:** Control Plane & Red → Dominios
- **Descripción Técnica:** Aprovisionamiento atómico de subdominios normalizados RFC 1123 con reserva hardcodeada de slugs del sistema y del Dr. Luis.
- **Valor para el Cliente:** *Cada empresa recibe su propia dirección web profesional de forma instantánea.*
- **Roles Autorizados:** `PLATFORM_OWNER`, `SUPER_ADMIN`
- **Industrias Aplicables:** `ALL_SAAS_TENANTS`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (Cloudflare DNS API)
- **Genera Costo de IA:** No
- **Genera Costo Externo:** No
- **Plan Mínimo Requerido:** `PLATFORM_ADMIN`
- **Dependencias Obligatorias:** `PLATFORM.CORE.DATABASE_RLS`
- **Archivo Fuente Principal:** `src/features/system-administration/application/platformControlPlane.ts`
- **API / RPC Asociada:** `rpc/provision_platform_tenant`
- **Flujo n8n Asociado:** `n8n/AVP-MASTER-CONTROL-PLANE`
- **Prueba de Aceptación:** `test_platform_acceptance_avat01_to_avat70.js`

---

#### 16. [PLATFORM.AI.USAGE_METERING] Alpha AI Gateway, Tarifario Claude y Medición Atómica de Tokens
- **ID Inmutable:** `PLATFORM.AI.USAGE_METERING`
- **Clave de Catálogo:** `platform_ai_metering`
- **Producto SaaS:** `PLATFORM_CORE`
- **Jerarquía:** Cerebro & Costos IA → AI Gateway
- **Descripción Técnica:** Capa centralizada para toda llamada de IA. Registra tokens de entrada, salida, creación y lectura de caché con reserva atómica.
- **Valor para el Cliente:** *Previene quiebras por sobrecostos ocultos de tokens y garantiza visibilidad financiera en tiempo real.*
- **Roles Autorizados:** `PLATFORM_OWNER`, `SUPER_ADMIN`
- **Industrias Aplicables:** `ALL_SAAS_TENANTS`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (Anthropic Claude API)
- **Genera Costo de IA:** ⚠️ SÍ (Requiere Cuota y Tarifario)
- **Genera Costo Externo:** Sí
- **Plan Mínimo Requerido:** `PLATFORM_ADMIN`
- **Dependencias Obligatorias:** `PLATFORM.CORE.DATABASE_RLS`
- **Archivo Fuente Principal:** `src/services/aiGatewayService.ts`
- **API / RPC Asociada:** `rpc/reserve_ai_quota`
- **Flujo n8n Asociado:** `n8n/AVP-060-AI-METERING`
- **Prueba de Aceptación:** `test_platform_acceptance_avat01_to_avat70.js`

---

#### 17. [PLATFORM.GOVERNANCE.FEATURE_REGISTRY] Feature Registry Unificado y Motor de Resolución de Entitlements
- **ID Inmutable:** `PLATFORM.GOVERNANCE.FEATURE_REGISTRY`
- **Clave de Catálogo:** `platform_feature_registry`
- **Producto SaaS:** `PLATFORM_CORE`
- **Jerarquía:** Gobernanza SaaS → Catálogo de Features
- **Descripción Técnica:** Evaluación jerárquica de 14 pasos para autorizar o denegar el acceso a funcionalidades en backend y frontend.
- **Valor para el Cliente:** *Empaquetado comercial dinámico y seguridad contra uso indebido de módulos no contratados.*
- **Roles Autorizados:** `PLATFORM_OWNER`, `SUPER_ADMIN`
- **Industrias Aplicables:** `ALL_SAAS_TENANTS`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** No
- **Genera Costo de IA:** No
- **Genera Costo Externo:** No
- **Plan Mínimo Requerido:** `PLATFORM_ADMIN`
- **Dependencias Obligatorias:** `PLATFORM.CORE.DATABASE_RLS`
- **Archivo Fuente Principal:** `src/features/system-administration/pages/OwnerCommandCenter.tsx`
- **API / RPC Asociada:** `rpc/resolve_feature_entitlement`
- **Flujo n8n Asociado:** `n8n/AVP-061-FEATURE-GOVERNANCE`
- **Prueba de Aceptación:** `test_platform_acceptance_avat01_to_avat70.js`

---

#### 18. [PLATFORM.CRM.GHL_DUAL_PIPELINE] Sincronizador Comercial Dual con GoHighLevel (Anti-Bucle)
- **ID Inmutable:** `PLATFORM.CRM.GHL_DUAL_PIPELINE`
- **Clave de Catálogo:** `platform_ghl_sync`
- **Producto SaaS:** `PLATFORM_CORE`
- **Jerarquía:** Ventas B2B & CRM → GoHighLevel
- **Descripción Técnica:** Sincronización de oportunidades separando Alpha Vet Life Sales de Alpha Contractor OS Sales con token de correlación.
- **Valor para el Cliente:** *Pipeline de ventas corporativo ordenado sin mezclar leads veterinarios con contratistas.*
- **Roles Autorizados:** `PLATFORM_OWNER`, `SUPER_ADMIN`, `SALES_DIRECTOR`
- **Industrias Aplicables:** `ALL_SAAS_TENANTS`
- **Estado de Implementación:** `PRODUCTION_VERIFIED`
- **Estado de Verificación:** `VERIFIED`
- **Disponibilidad Comercial:** **GA**
- **Habilitado por Defecto:** Sí
- **Requiere Integración:** Sí (GoHighLevel API v2)
- **Genera Costo de IA:** No
- **Genera Costo Externo:** Sí
- **Plan Mínimo Requerido:** `PLATFORM_ADMIN`
- **Dependencias Obligatorias:** `PLATFORM.CORE.DATABASE_RLS`
- **Archivo Fuente Principal:** `src/features/system-administration/application/platformControlPlane.ts`
- **API / RPC Asociada:** `rpc/sync_ghl_opportunity`
- **Flujo n8n Asociado:** `n8n/AVP-MASTER-CONTROL-PLANE`
- **Prueba de Aceptación:** `test_platform_acceptance_avat01_to_avat70.js`

---


### 4. RESUMEN DE EMPAQUETADO COMERCIAL POR PRODUCTO

#### 4.1. Planes Vet Life (COP / Mes)
1. **Veterinario Solitario:** $189.000 COP/mes (1 profesional, funciones esenciales de agenda, WhatsApp y recetas COMVEZCOL).
2. **Clínica Domiciliaria:** $389.000 COP/mes (Hasta 3 profesionales, OKVET Sync, rutas inteligentes, tele-triaje y borrador IA asistido).
3. **Red / Marca Blanca:** $1.190.000 COP/mes (Múltiples sucursales, dominio personalizado, estudio visual white-label y API completa).

#### 4.2. Planes Contractor OS (USD / Mes - Recomendación Inicial en PENDING_COMMERCIAL_APPROVAL)
1. **Essential:** Base operativa (Booking, Jobs, Time Clock, Facturación básica, Good-Better-Best proposals).
2. **Growth:** Más automatización (AI Receptionist, Project Room en vivo, Customer App Studio, seguimiento de cuadrillas).
3. **Scale / Premium:** Operaciones avanzadas (Multi-crew, analítica de rentabilidad de obra, white label total y límites de IA expandidos).

---
*Alpha Vision Method © 2026 · Documento Oficial de Gobernanza de Features.*
