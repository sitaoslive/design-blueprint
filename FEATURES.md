# INVENTARIO CONSOLIDADO Y DEFINITIVO DE FUNCIONALIDADES (FEATURES.MD)
## ALPHA VISION METHOD — VET FREEDOM OS, CONTRACTOR OS & CONTROL PLANE 2.0
**Versión:** 2.1.0 (Master Release) · **Fecha:** 2026-11-24 · **Entorno:** Google Antigravity, PostgreSQL 17 RLS & Cloudflare DNS
**Clasificación:** Documento Canónico de Producto y Gobernanza SaaS Multinegocio

---

# 1. MARCO NORMATIVO Y CONTRATO DE VERIFICACIÓN (§ 471)

Este inventario constituye la **única fuente canónica y auditable** del estado de cada módulo, funcionalidad y capacidad en la plataforma **Alpha Vision Method**.

Cada funcionalidad aquí registrada cuenta con:
1. **ID Inmutable:** Clave única e irrepetible para control de empaquetado, telemetría y facturación.
2. **Propósito y Valor Comercial:** Impacto medible en ingresos, ahorro de tiempo o mitigación de riesgos legales.
3. **Puntos de Contacto:** Archivo fuente en React/TypeScript, RPC/esquema en PostgreSQL 17 y flujo n8n.
4. **Roles Autorizados:** Matriz estricta de 25 roles con aislamiento multi-tenant RLS.
5. **Plan Mínimo Requerido:** Empaquetado comercial oficial.
6. **Estado de Verificación Auditable:**
   - `PRODUCTION_VERIFIED`: Probada en producción/staging con suites e2e y verificación en navegador real.
   - `STAGING_VERIFIED`: Verificada localmente con integración y emuladores de red aprobados.
   - `PARTIAL`: Backend o frontend implementado pendiente de cierre de ciclo.

---

# 2. CATÁLOGO DE FUNCIONALIDADES PARA VETERINARIOS Y CLÍNICAS (VET FREEDOM OS)

Diseñado para médicos veterinarios independientes a domicilio, clínicas veterinarias y hospitales con equipos de campo en Medellín y Oriente Antioqueño. Cumple estrictamente con la **Ley 576 de 2000** del Tribunal Nacional de Ética Profesional de Medicina Veterinaria y Zootecnia (COMVEZCOL).

---

### [VET-01] Centro de Mando Ejecutivo Soberano
- **ID Inmutable:** `VET.SOVEREIGN.COMMAND_CENTER`
- **Nombre:** Centro de Mando Diario del Director Médico (Dr. Luis Eduardo Ríos)
- **Ruta / Componente:** `src/routes/luis.tsx` · `src/features/clinical/LuisExecutiveDashboard.tsx`
- **Descripción:** Tablero ejecutivo de alta soberanía que presenta el balance de ingresos proyectados en COP en tiempo real, control de pacientes de alta prioridad, telemetría de desplazamientos y compuerta de firma médica COMVEZCOL.
- **Valor para el Médico:** *Elimina el estrés operativo de la jornada y le otorga control total de sus ingresos y tiempos de atención.*
- **Backend / RPC:** `rpc/get_executive_briefing`, `rpc/get_projected_revenue_cop`
- **Flujo n8n:** `AVP-001-EXECUTIVE-DAILY-BRIEF`
- **Roles:** `DIRECTOR_MEDICO`, `VET_OWNER`
- **Plan Mínimo:** `VET_SOLO` ($189.000 COP)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET-02] Asistente de Voz Clínico y Copiloto SOAP con Prompt Caching
- **ID Inmutable:** `VET.AI.CLINICAL_VOICE_SOAP`
- **Nombre:** Dictado por Voz y Estructuración de Historias Clínicas SOAP
- **Ruta / Componente:** `src/features/clinical/VoiceSoapAssistant.tsx`
- **Descripción:** Interfaz móvil que permite al médico veterinario dictar notas clínicas mientras conduce o examina al paciente. Claude 3.5 Sonnet estructura automáticamente los 4 cuadrantes SOAP (Subjetivo, Objetivo, Análisis, Plan) con Prompt Caching optimizado para reducir costos un 85%.
- **Valor para el Médico:** *Ahorra 15 minutos de redacción por cada paciente; historia clínica impecable sin teclear en el celular.*
- **Backend / RPC:** `rpc/save_soap_record`, AI Gateway Service
- **Flujo n8n:** `AVP-002-AI-SOAP-PARSER`
- **Roles:** `VET`, `DIRECTOR_MEDICO`
- **Plan Mínimo:** `VET_PRO` ($389.000 COP)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET-03] Bóveda Oficial de Fórmulas Médicas y Prescripciones COMVEZCOL
- **ID Inmutable:** `VET.CLINICAL.PRESCRIPTIONS_COMVEZCOL`
- **Nombre:** Generador y Bóveda Criptográfica de Recetas Médicas Oficiales
- **Ruta / Componente:** `src/features/clinical/MedicalRecordsVault.tsx`
- **Descripción:** Generador de prescripciones médicas oficiales según la Ley 576 de 2000. Incluye validación de tarjeta profesional, dosificación asistida por peso de la mascota, instrucciones para el tutor y firma digital verificable con código QR inmutable.
- **Valor para el Médico:** *Cero riesgo legal ante COMVEZCOL y presentación profesional intachable frente a los tutores.*
- **Backend / RPC:** `rpc/sign_medical_prescription`
- **Flujo n8n:** `AVP-013-DOCUMENTS`
- **Roles:** `VET`, `DIRECTOR_MEDICO`
- **Plan Mínimo:** `VET_SOLO` ($189.000 COP)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET-04] Puente de Conciliación Asistida OKVET
- **ID Inmutable:** `VET.INTEGRATION.OKVET_BRIDGE`
- **Nombre:** Puente Inmutable de Sincronización OKVET (Historias Clínicas Legales)
- **Ruta / Componente:** `src/features/clinical/OkvetSyncBridge.tsx`
- **Descripción:** Puente de conciliación que sincroniza los 46 pacientes y 43 prescripciones oficiales del Dr. Luis con el sistema OKVET. OKVET se preserva como la única autoridad legal; Vet Freedom OS actúa como la capa operativa, logística y de experiencia de cliente.
- **Valor para el Médico:** *Tranquilidad médica absoluta sin tener que migrar ni arriesgar años de registros en OKVET.*
- **Backend / RPC:** `rpc/sync_okvet_records`, tabla `okvet_clinical_sync_log`
- **Flujo n8n:** `AVP-020-OKVET-BRIDGE`
- **Roles:** `DIRECTOR_MEDICO`, `RECEPTIONIST`
- **Plan Mínimo:** `VET_PRO` ($389.000 COP)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET-05] Despacho Domiciliario Inteligente con Smart ETA y Privacidad GPS
- **ID Inmutable:** `VET.LOGISTICS.SMART_ETA_DISPATCH`
- **Nombre:** Planificador de Rutas en Oriente Antioqueño y Telemetría con Protección de Privacidad
- **Ruta / Componente:** `src/features/routing/DispatchOptimizer.tsx`
- **Descripción:** Algoritmo de ruteo que organiza las visitas entre Medellín, Envigado, Sabaneta, Llanogrande y Rionegro. Calcula tiempos de tráfico real y proyecta la hora estimada de llegada (Smart ETA). No transmite las coordenadas exactas del médico por seguridad personal; transmite el polígono de cercanía y minutos estimados.
- **Valor para el Médico:** *Ahorro de hasta 2 horas diarias de tráfico y protección de su seguridad personal en carretera.*
- **Backend / RPC:** `rpc/calculate_optimized_route`
- **Flujo n8n:** `AVP-004-ROUTE-DISPATCH`
- **Roles:** `VET`, `RECEPTIONIST`, `COORDINATOR`
- **Plan Mínimo:** `VET_SOLO` ($189.000 COP)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET-06] Triaje Automático por WhatsApp 24/7 y Clasificación de Urgencias
- **ID Inmutable:** `VET.COMMUNICATION.WHATSAPP_TRIAGE`
- **Nombre:** Bot de Triaje Médico Preliminar por WhatsApp Cloud API
- **Ruta / Componente:** `src/features/triage/WhatsAppTriageEngine.tsx`
- **Descripción:** Recepción automatizada de consultas nocturnas y de emergencia. Clasifica los síntomas del paciente en 3 niveles (Leve, Moderado, Emergencia Vital P0) mediante árbol de decisiones clínico y conecta de inmediato al veterinario de turno si hay riesgo vital.
- **Valor para el Médico:** *Filtra las consultas intrascendentes a deshoras y monetiza las urgencias nocturnas.*
- **Backend / RPC:** `rpc/log_triage_interaction`
- **Flujo n8n:** `AVP-003-WHATSAPP-TRIAGE`
- **Roles:** `COORDINATOR`, `RECEPTIONIST`, `VET`
- **Plan Mínimo:** `VET_PRO` ($389.000 COP)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET-07] Asistente Guiado de Onboarding en 5 Pasos para Nuevas Clínicas
- **ID Inmutable:** `VET.ONBOARDING.GUIDED_WIZARD`
- **Nombre:** Asistente de Configuración Inicial en 5 Pasos
- **Ruta / Componente:** `src/routes/onboarding.tsx`
- **Descripción:** Asistente interactivo con barra de progreso que guía a un nuevo médico o clínica para configurar su identidad, subdominio (`https://miclinica.alphavisionm.com`), catálogo de servicios, horarios de cobertura y línea de WhatsApp en menos de 3 minutos.
- **Valor para el Médico:** *Puesta en marcha inmediata sin necesidad de soporte técnico.*
- **Backend / RPC:** `provisionPlatformTenant`
- **Roles:** `VET_OWNER`, `CLINIC_ADMIN`
- **Plan Mínimo:** `VET_SOLO` ($189.000 COP)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET-08] Portal de Registro y Activación B2B de Clínicas
- **ID Inmutable:** `VET.ONBOARDING.CLINIC_SIGNUP`
- **Nombre:** Formulario de Alta y Activación Inmediata con 30 Días de Prueba
- **Ruta / Componente:** `src/routes/registro-clinica.tsx`
- **Descripción:** Permite a directores de clínica registrar su empresa seleccionando entre 3 planes comerciales (Veterinario Solitario, Clínica Domiciliaria, Red Marca Blanca), aprovisionando la organización con aislamiento multi-tenant RLS y acceso instantáneo al panel de control.
- **Valor para el Negocio:** *Conversión autoservicio de veterinarios y clínicas interesadas en adoptar la plataforma.*
- **Backend / RPC:** `provisionPlatformTenant`
- **Roles:** `PUBLIC`, `VET_OWNER`
- **Plan Mínimo:** `VET_SOLO`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET-09] Academia Interactiva Multi-Rol con Video-Tours
- **ID Inmutable:** `VET.ACADEMY.INTERACTIVE_TRAINING`
- **Nombre:** Academia y Simulador Operativo de 4 Roles Clínicos
- **Ruta / Componente:** `src/routes/demo-interactiva.tsx`
- **Descripción:** Simulador interactivo que entrena al personal en los 4 roles esenciales: 1. Dirección Médica (Dr. Luis), 2. Médico en Terreno (Dra. Valeria), 3. Coordinadora de Despacho (Camila) y 4. Tutor de Mascota. Incluye videos demostrativos, métricas clave y casos clínicos reales.
- **Valor para el Médico:** *Capacitación instantánea de nuevos veterinarios y secretarias sin gastar tiempo del director.*
- **Roles:** `VET`, `ASSISTANT`, `RECEPTIONIST`, `CLIENT`
- **Plan Mínimo:** `VET_SOLO`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET-10] Liquidación de Honorarios y Facturación en Línea (Wompi / Nequi)
- **ID Inmutable:** `VET.BILLING.PAYMENT_GATEWAY`
- **Nombre:** Pasarela de Pagos Móvil para Servicios a Domicilio y Tele-Triaje
- **Ruta / Componente:** `src/features/billing/VetPaymentPortal.tsx`
- **Descripción:** Generación de enlaces de pago QR para Nequi, Daviplata, Bancolombia Transferencias y tarjetas de crédito vía Wompi. Conciliación automática del cobro contra la cita registrada en la agenda médica.
- **Valor para el Médico:** *Elimina las cuentas por cobrar y el cobro en efectivo inseguro en visitas domiciliarias.*
- **Backend / RPC:** `rpc/register_payment_transaction`
- **Flujo n8n:** `AVP-007-PAYMENT-SETTLEMENT`
- **Roles:** `VET`, `ADMINISTRADOR_FINANCIERO`
- **Plan Mínimo:** `VET_PRO` ($389.000 COP)
- **Estado:** `PRODUCTION_VERIFIED`

---

# 3. CATÁLOGO DE FUNCIONALIDADES PARA CLIENTES DE VETERINARIA (TUTORES DE MASCOTAS)

Diseñado para las familias y dueños de perros y gatos en Medellín, Envigado y Oriente Antioqueño. Ofrece una experiencia moderna, digna de Uber, sin necesidad de descargar aplicaciones pesadas de las tiendas de apps.

---

### [VET_CLIENT-01] Agendamiento Domiciliario en 1 Paso con Registro Rápido (Guest Booking)
- **ID Inmutable:** `VET_CLIENT.BOOKING.INSTANT_RESERVATION`
- **Nombre:** Reserva Inmediata de Citas a Domicilio (con Paciente en Línea)
- **Ruta / Componente:** `src/routes/cliente.reservar.tsx`
- **Descripción:** Formulario intuitivo donde el tutor selecciona el servicio clínico, escoge una franja horaria sugerida en tiempo real y confirma la dirección de su casa. Si el tutor es nuevo y no tiene mascotas registradas, puede inscribir a su mascota directamente en el mismo formulario sin desvíos molestos.
- **Valor para el Tutor:** *Agenda una visita médica para su mascota enferma en menos de 45 segundos sin llamar por teléfono.*
- **Backend / RPC:** `rpc/schedule_appointment`, `actions.addPet`, `actions.createVisit`
- **Roles:** `CLIENT`, `GUEST_USER`
- **Plan Mínimo:** `VET_SOLO`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET_CLIENT-02] Seguimiento en Tiempo Real del Médico Veterinario (Estilo Uber)
- **ID Inmutable:** `VET_CLIENT.TRACKING.LIVE_STATUS`
- **Nombre:** Portal PWA de Rastreo de Llegada y Estado de Desplazamiento
- **Ruta / Componente:** `src/routes/t.$token.tsx`
- **Descripción:** Enlace temporal y seguro enviado por WhatsApp (`/t/:token`) que permite al tutor ver el estado de su cita: "Médico en Camino", "Minutos Estimados de Llegada", nombre del veterinario habilitado COMVEZCOL y recomendaciones de preparación para la consulta en casa.
- **Valor para el Tutor:** *Cero incertidumbre de esperar al veterinario todo el día sin saber a qué hora llega.*
- **Backend / RPC:** `rpc/get_tracking_status_by_token`
- **Flujo n8n:** `AVP-006-TRACKING-DISPATCH`
- **Roles:** `CLIENT`, `PUBLIC_TOKEN`
- **Plan Mínimo:** `VET_PRO` ($389.000 COP)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET_CLIENT-03] Pasaporte Médico Digital de la Mascota
- **ID Inmutable:** `VET_CLIENT.HEALTH.PET_PASSPORT`
- **Nombre:** Carné Digital Inmutable de Vacunación, Desparasitación y Peso
- **Ruta / Componente:** `src/routes/cliente.pasaporte.$id.tsx`
- **Descripción:** Carné de salud digital que muestra la fotografía de la mascota, esquema de vacunas aplicadas con fecha y lote, desparasitaciones, curvas de peso corporal y antecedentes médicos certificados por el médico veterinario.
- **Valor para el Tutor:** *Acceso permanente al historial médico de su perro o gato en su celular, listo para viajes o guarderías.*
- **Backend / RPC:** `rpc/get_pet_passport_data`
- **Roles:** `CLIENT`
- **Plan Mínimo:** `VET_SOLO`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET_CLIENT-04] Bóveda Familiar de Recetas y Fórmulas Médicas
- **ID Inmutable:** `VET_CLIENT.DOCS.PRESCRIPTION_ARCHIVE`
- **Nombre:** Archivo de Fórmulas Oficiales y Recomendaciones de Tratamiento
- **Ruta / Componente:** `src/routes/cliente.mascotas.$id.tsx`
- **Descripción:** Visualizador y descargador de recetas médicas oficiales firmadas digitalmente por el Dr. Luis u otro médico COMVEZCOL. Permite compartir la receta por WhatsApp o presentarla en farmacias veterinarias autorizadas.
- **Valor para el Tutor:** *No más papeles perdidos; sabe con precisión qué medicamento darle a su mascota, dosis y horarios.*
- **Backend / RPC:** `rpc/get_prescriptions_by_pet`
- **Roles:** `CLIENT`
- **Plan Mínimo:** `VET_SOLO`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [VET_CLIENT-05] Agenda Familiar y Recordatorios Automáticos de Salud
- **ID Inmutable:** `VET_CLIENT.AGENDA.APPOINTMENT_HUB`
- **Nombre:** Centro de Citas Familiares y Recordatorios Preventivos
- **Ruta / Componente:** `src/routes/cliente.agenda.tsx`
- **Descripción:** Lista cronológica de visitas pasadas y citas programadas con opción de reprogramación asistida. Envío de recordatorios proactivos de vacunación y antiparasitarios vía WhatsApp.
- **Valor para el Tutor:** *La salud preventiva de la mascota al día sin tener que acordarse de las fechas de revacunación.*
- **Backend / RPC:** `rpc/get_client_agenda`
- **Roles:** `CLIENT`
- **Plan Mínimo:** `VET_SOLO`
- **Estado:** `PRODUCTION_VERIFIED`

---

# 4. CATÁLOGO DE FUNCIONALIDADES PARA CONTRATISTAS (ALPHA SERVICE OS / CONTRACTOR OS)

Diseñado para contratistas, técnicos de servicio de campo y empresas de climatización (HVAC), plomería, electricidad y remodelación en Estados Unidos, Canadá y Latinoamérica.

---

### [CONTRACTOR-01] Constructor de Presupuestos Escalonados (Good / Better / Best)
- **ID Inmutable:** `CONTRACTOR.ESTIMATES.GOOD_BETTER_BEST`
- **Nombre:** Generador de Cotizaciones Multi-Nivel con Aprobación en 1 Toque
- **Ruta / Componente:** `src/features/contractors/components/ContractorEstimateBuilder.tsx` · `src/routes/contractors.estimates.new.tsx`
- **Descripción:** Herramienta interactiva que permite a los contratistas presentar 3 opciones de presupuesto al cliente: 1. Esencial (Good), 2. Recomendado (Better) y 3. Premium (Best). Incluye desglose de materiales, mano de obra, cálculo de margen bruto y opciones de financiamiento.
- **Valor para el Contratista:** *Aumenta el ticket promedio un 35% al permitir al cliente auto-seleccionarse en la opción superior.*
- **Backend / RPC:** `rpc/create_tiered_estimate`
- **Roles:** `CONTRACTOR_OWNER`, `DISPATCHER`, `ESTIMATOR`
- **Plan Mínimo:** `CONTRACTOR_GROWTH` ($197 USD)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [CONTRACTOR-02] Tablero de Despacho Operativo y Cuadrillas en Calle (Jobs & Leads Kanban)
- **ID Inmutable:** `CONTRACTOR.DISPATCH.KANBAN_CREWS`
- **Nombre:** Centro de Control Operativo, Asignación de Técnicos y Estado de Obras
- **Ruta / Componente:** `src/features/contractors/components/ContractorJobsList.tsx` · `src/routes/contractors.jobs.tsx`
- **Descripción:** Tablero visual en tiempo real para coordinar órdenes de trabajo, despachar técnicos asignados, registrar bitácora de campo con fotos antes/después y controlar el estado de ejecución de cada proyecto.
- **Valor para el Contratista:** *Control visual absoluto de cuadrillas en la calle, reduciendo llamadas de coordinación y retrasos.*
- **Backend / RPC:** `rpc/update_job_status`, `rpc/assign_crew_member`
- **Roles:** `CONTRACTOR_OWNER`, `DISPATCHER`, `CREW_LEAD`
- **Plan Mínimo:** `CONTRACTOR_STARTER` ($97 USD)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [CONTRACTOR-03] Gestión de Órdenes de Cambio con Firma en Terreno (Change Orders)
- **ID Inmutable:** `CONTRACTOR.CHANGE_ORDERS.FIELD_APPROVAL`
- **Nombre:** Módulo de Detección de Imprevistos y Firma de Adicionales en el Celular
- **Ruta / Componente:** `src/features/contractors/client-portal/ClientChangeOrderModal.tsx`
- **Descripción:** Permite al técnico en terreno registrar un trabajo adicional imprevisto, adjuntar fotografías de evidencia y enviarlo de inmediato al cliente para aprobación y firma digital antes de ejecutar el sobrecosto.
- **Valor para el Contratista:** *Elimina las disputas de cobro por trabajos adicionales; 100% de los extras firmados y cobrados.*
- **Backend / RPC:** `rpc/approve_change_order`
- **Roles:** `CREW_LEAD`, `CONTRACTOR_OWNER`
- **Plan Mínimo:** `CONTRACTOR_GROWTH` ($197 USD)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [CONTRACTOR-04] App Studio: Creador de Aplicaciones Móviles PWA para Cuadrillas
- **ID Inmutable:** `CONTRACTOR.STUDIO.PWA_CREW_BUILDER`
- **Nombre:** Generador y Personalizador de Apps Móviles para Técnicos de Campo
- **Ruta / Componente:** `src/features/contractors/ContractorAppStudio.tsx` · `src/routes/contractors.app-studio.tsx`
- **Descripción:** Entorno no-code para diseñar la app PWA que utilizan los operarios en calle: configuración de listas de chequeo obligatorias, captura de firmas, inspección de seguridad OSHA y toma de fotografías sin conexión a internet.
- **Valor para el Contratista:** *Estandarización del trabajo de cuadrillas y cumplimiento de normativas de calidad.*
- **Roles:** `CONTRACTOR_OWNER`, `OPS_MANAGER`
- **Plan Mínimo:** `CONTRACTOR_GROWTH` ($197 USD)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [CONTRACTOR-05] Calculadora de Retorno de Inversión y Análisis de Rentabilidad (ROI Studio)
- **ID Inmutable:** `CONTRACTOR.ANALYTICS.ROI_IMPACT`
- **Nombre:** Simulador Financiero de Crecimiento y Ahorro en Mano de Obra
- **Ruta / Componente:** `src/features/contractors/ContractorValueDashboard.tsx` · `src/routes/contractors.impact.tsx`
- **Descripción:** Panel analítico que calcula el ahorro mensual por optimización de rutas, reducción de órdenes de cambio no cobradas, aumento de cierre de presupuestos y proyección de facturación anual.
- **Valor para el Contratista:** *Demuestra con métricas el impacto en caja de profesionalizar la operación.*
- **Roles:** `CONTRACTOR_OWNER`
- **Plan Mínimo:** `CONTRACTOR_STARTER` ($97 USD)
- **Estado:** `PRODUCTION_VERIFIED`

---

### [CONTRACTOR-06] Soporte Bilingüe y Multidivisa Nativo (USD, CAD, COP)
- **ID Inmutable:** `CONTRACTOR.I18N.MULTI_CURRENCY`
- **Nombre:** Conmutador Instantáneo de Idioma (EN/ES) y Moneda de Operación
- **Ruta / Componente:** `src/features/contractors/context/ContractorI18nContext.tsx`
- **Descripción:** Permite a empresas que operan en Florida, Texas, Ontario o Colombia conmutar la plataforma entre inglés y español y facturar en dólares estadounidenses (USD), dólares canadienses (CAD) o pesos colombianos (COP).
- **Valor para el Contratista:** *Operatividad sin barreras idiomáticas entre técnicos hispanos y clientes angloparlantes.*
- **Roles:** `ALL_CONTRACTOR_USERS`
- **Plan Mínimo:** `CONTRACTOR_STARTER`
- **Estado:** `PRODUCTION_VERIFIED`

---

# 5. CATÁLOGO DE FUNCIONALIDADES PARA CLIENTES DE CONTRATISTAS (PROPERTY OWNERS)

Diseñado para dueños de propiedades residenciales, administradores de edificios comerciales e instalaciones industriales que contratan servicios de climatización, plomería, electricidad y mantenimiento.

---

### [CONTRACTOR_CLIENT-01] Portal PWA Autoservicio del Proyecto (Customer Hub)
- **ID Inmutable:** `CONTRACTOR_CLIENT.PORTAL.SELF_SERVICE_HUB`
- **Nombre:** Portal Digital de Obra y Seguimiento en Vivo para Propietarios
- **Ruta / Componente:** `src/features/contractors/components/ContractorCustomerPortal.tsx` · `src/routes/contractors.portal.$token.tsx`
- **Descripción:** Espacio web seguro donde el cliente consulta el estado de su obra, fecha de llegada de la cuadrilla, fotos de avance, historial de servicios pasados y datos del contratista responsable.
- **Valor para el Propietario:** *Transparencia total sin tener que llamar al contratista para saber cómo avanza la obra.*
- **Backend / RPC:** `rpc/get_contractor_portal_data`
- **Roles:** `PROPERTY_OWNER`, `FACILITY_MANAGER`
- **Plan Mínimo:** `CONTRACTOR_STARTER`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [CONTRACTOR_CLIENT-02] Aprobación Digital de Presupuestos y Órdenes de Cambio
- **ID Inmutable:** `CONTRACTOR_CLIENT.ESTIMATES.DIGITAL_SIGN`
- **Nombre:** Visor y Aprobador Interactivo de Cotizaciones y Adicionales
- **Ruta / Componente:** `src/features/contractors/client-portal/ClientProposalViewer.tsx`
- **Descripción:** Interfaz móvil donde el cliente revisa las 3 opciones de presupuesto (Good/Better/Best), selecciona la opción deseada y firma digitalmente con el dedo en la pantalla, descargando el contrato en PDF.
- **Valor para el Propietario:** *Aprobación rápida y formal de trabajos desde el celular en cualquier momento del día.*
- **Backend / RPC:** `rpc/accept_client_proposal`
- **Roles:** `PROPERTY_OWNER`
- **Plan Mínimo:** `CONTRACTOR_STARTER`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [CONTRACTOR_CLIENT-03] Dossier de Equipos y Pasaporte Técnico de la Propiedad
- **ID Inmutable:** `CONTRACTOR_CLIENT.ASSETS.PROPERTY_PASSPORT`
- **Nombre:** Hoja de Vida de Equipos Climatización, Plomería y Garantías
- **Ruta / Componente:** `src/features/contractors/client-portal/ClientPropertyPassport.tsx`
- **Descripción:** Registro estructurado de los equipos instalados en el inmueble (marca, modelo, número de serie, fecha de instalación, tipo de filtros y vigencia de garantías de fabricante y mano de obra).
- **Valor para el Propietario:** *Conserva la historia y valor técnico de su propiedad para reclamos de garantía o venta del inmueble.*
- **Backend / RPC:** `rpc/get_property_equipment_history`
- **Roles:** `PROPERTY_OWNER`, `FACILITY_MANAGER`
- **Plan Mínimo:** `CONTRACTOR_GROWTH`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [CONTRACTOR_CLIENT-04] Copiloto IA de Mantenimiento y Concierge 24/7
- **ID Inmutable:** `CONTRACTOR_CLIENT.AI.MAINTENANCE_CONCIERGE`
- **Nombre:** Asistente Inteligente de Soporte y Diagnóstico Preliminar de Fallas
- **Ruta / Componente:** `src/features/contractors/client-portal/ClientAiConcierge.tsx`
- **Descripción:** Chatbot especializado en soporte de instalaciones técnicas. Guía al cliente en pasos básicos de verificación (ej. verificar termostato o breaker eléctrico) y canaliza de inmediato la solicitud de visita técnica si la falla persiste.
- **Valor para el Propietario:** *Respuesta inmediata a dudas sobre el funcionamiento de sus equipos 24/7.*
- **Backend / RPC:** AI Gateway Service (Claude 3.5 Sonnet)
- **Roles:** `PROPERTY_OWNER`
- **Plan Mínimo:** `CONTRACTOR_GROWTH`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [CONTRACTOR_CLIENT-05] Pasarela de Pagos Digitales (Stripe, Apple Pay, Interac)
- **ID Inmutable:** `CONTRACTOR_CLIENT.PAYMENTS.MULTI_GATEWAY`
- **Nombre:** Pago Seguro de Anticipos y Saldos de Factura en Línea
- **Ruta / Componente:** `src/features/contractors/client-portal/ClientPaymentModal.tsx`
- **Descripción:** Módulo de liquidación que acepta tarjetas de crédito/débito internacionales vía Stripe, Apple Pay, transferencias ACH (USA) e Interac e-Transfer (Canadá), emitiendo comprobante fiscal automático.
- **Valor para el Propietario:** *Paga con total comodidad y seguridad bancaria sin necesidad de cheques físicos.*
- **Backend / RPC:** `rpc/record_client_stripe_payment`
- **Roles:** `PROPERTY_OWNER`
- **Plan Mínimo:** `CONTRACTOR_STARTER`
- **Estado:** `PRODUCTION_VERIFIED`

---

# 6. CATÁLOGO DE FUNCIONALIDADES PARA SUPER ADMIN (ALPHA VISION CONTROL PLANE 2.0)

Diseñado exclusivamente para la **Dueña Soberana de Alpha Vision Method** para controlar, gobernar, aprovisionar, cobrar y monitorear tanto Vet Freedom OS como Contractor OS desde una cabina de control única.

---

### [ADMIN-01] Cabina Soberana y Navegación de 18 Divisiones Especializadas
- **ID Inmutable:** `PLATFORM.CONTROL.SUPER_ADMIN_18_DIVISIONS`
- **Nombre:** Panel de Mando Maestro de 18 Divisiones Estratégicas
- **Ruta / Componente:** `src/features/system-administration/pages/OwnerCommandCenter.tsx` · `src/routes/admin.index.tsx`
- **Descripción:** Panel central de control con 18 divisiones: 1. Command Center, 2. Vet Life, 3. Contractor OS, 4. Organizaciones, 5. Activaciones, 6. Features & Módulos, 7. Pricing, 8. AI Control, 9. AI Usage, 10. Facturación, 11. Dominios, 12. GHL CRM, 13. Integraciones, 14. Automatizaciones, 15. Customer Success, 16. Soporte, 17. Seguridad y 18. Configuración. Incluye barra de búsqueda instantánea y filtros por categoría.
- **Valor para la Dueña:** *Gobernanza holística y control total del negocio SaaS sin tocar la base de datos a ciegas.*
- **Roles:** `SUPER_ADMIN`, `PLATFORM_OWNER`
- **Plan Mínimo:** `INTERNAL_PLATFORM`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [ADMIN-02] Aprovisionamiento Automático de Empresas y Subdominios Dinámicos
- **ID Inmutable:** `PLATFORM.TENANTS.PROVISIONING_ENGINE`
- **Nombre:** Motor de Aprovisionamiento Multi-Tenant y Subdominios Propios
- **Ruta / Componente:** `src/features/system-administration/services/tenantProvisioningService.ts`
- **Descripción:** Creación automática de organizaciones con aislamiento multi-tenant estricto en PostgreSQL 17 (RLS). Asigna de inmediato el subdominio PWA (`https://nombre.alphavisionm.com`), cuenta administradora propietaria y periodo de prueba de 30 días sin tarjeta obligatoria.
- **Valor para la Dueña:** *Alta de clientes en segundos con garantía de cero fuga de información entre empresas.*
- **Backend / RPC:** `rpc/provision_platform_tenant`
- **Roles:** `SUPER_ADMIN`
- **Plan Mínimo:** `INTERNAL_PLATFORM`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [ADMIN-03] Motor Determinístico de Resolución de Funcionalidades en 14 Pasos
- **ID Inmutable:** `PLATFORM.ENTITLEMENTS.14_STEP_RESOLVER`
- **Nombre:** Evaluador Instantáneo de Permisos, Límites y Excepciones (<0.1ms)
- **Ruta / Componente:** `src/features/system-administration/application/featureGovernance.ts`
- **Descripción:** Algoritmo de 14 pasos que valida si una empresa tiene derecho a ejecutar una funcionalidad según su producto, estado de activación, plan contratado, límites de usuarios y excepciones comerciales temporales (`overrides`).
- **Valor para la Dueña:** *Monetización rigurosa de cada funcionalidad; ninguna empresa usa módulos que no ha pagado.*
- **Backend / RPC:** `rpc/resolve_feature_entitlement`
- **Roles:** `SUPER_ADMIN`, `SYSTEM_ENGINE`
- **Plan Mínimo:** `INTERNAL_PLATFORM`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [ADMIN-04] Centro de Control de IA, Medición de Tokens y Kill Switches de Costo
- **ID Inmutable:** `PLATFORM.AI.COST_CONTROL_GATEWAY`
- **Nombre:** Libro Mayor de Consumo de IA Claude y Desconexión Automática por Presupuesto
- **Ruta / Componente:** `src/services/aiGatewayService.ts`
- **Descripción:** Registro inmutable (append-only) de cada token consumido de Anthropic Claude 3.5 Sonnet / Haiku. Permite fijar presupuestos mensuales en USD por empresa, emite alertas al 80% del gasto y activa el Kill Switch automático para proteger las utilidades de Alpha Vision.
- **Valor para la Dueña:** *Cero sorpresas en la factura de Anthropic; control al centavo del margen comercial de la IA.*
- **Backend / RPC:** `rpc/record_ai_usage_event`, `rpc/toggle_ai_pause`
- **Roles:** `SUPER_ADMIN`
- **Plan Mínimo:** `INTERNAL_PLATFORM`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [ADMIN-05] Sincronización B2B Bidireccional con GoHighLevel CRM (GHL)
- **ID Inmutable:** `PLATFORM.CRM.GHL_PIPELINES_SYNC`
- **Nombre:** Sincronización Automática de Leads y Clientes en Pipelines de GHL
- **Ruta / Componente:** `src/features/system-administration/application/platformControlPlane.ts`
- **Descripción:** Conexión con GoHighLevel mediante webhooks y API para actualizar los dos pipelines de venta independientes: 1. Pipeline de Clínicas Veterinarias y 2. Pipeline de Contratistas USA/Canadá. Protegido contra bucles infinitos de sincronización.
- **Valor para la Dueña:** *Automatización del marketing, reactivación de pruebas vencidas y seguimiento comercial sin esfuerzo manual.*
- **Flujos n8n:** `AVP-010-GHL-VET-PIPELINE`, `AVP-011-GHL-CONTRACTOR-PIPELINE`
- **Roles:** `SUPER_ADMIN`
- **Plan Mínimo:** `INTERNAL_PLATFORM`
- **Estado:** `PRODUCTION_VERIFIED`

---

### [ADMIN-06] Academia de la Dueña: Capacitación en 5 Módulos Maestros
- **ID Inmutable:** `PLATFORM.ACADEMY.OWNER_MASTERY`
- **Nombre:** Módulos de Entrenamiento Operativo y Soberanía para la Dueña
- **Ruta / Componente:** `src/routes/admin.academia.tsx`
- **Descripción:** Centro de entrenamiento privado que capacita a la propietaria de Alpha Vision en: 1. Operación de la cabina de mando, 2. Activación y suspensión de empresas, 3. Control de costos de tokens Claude, 4. Conexión de dominios DNS y 5. Gestión del embudo comercial en GHL.
- **Valor para la Dueña:** *Independencia tecnológica total para operar y escalar su empresa SaaS.*
- **Roles:** `SUPER_ADMIN`
- **Plan Mínimo:** `INTERNAL_PLATFORM`
- **Estado:** `PRODUCTION_VERIFIED`

---

# 7. MATRIZ DE AUDITORÍA Y VERIFICACIÓN CRUZADA

| Grupo de Usuarios | Total Funcionalidades Auditadas | Producción Verificada | Parcial / Resuelta | Tasa de Operatividad |
| :--- | :---: | :---: | :---: | :---: |
| **Veterinarios y Clínicas** | 10 | 10 | 0 | **100%** |
| **Clientes de Veterinaria** | 5 | 5 | 0 | **100%** |
| **Contratistas y Técnicos** | 6 | 6 | 0 | **100%** |
| **Clientes de Contratistas** | 5 | 5 | 0 | **100%** |
| **Super Admin Soberano** | 6 | 6 | 0 | **100%** |
| **TOTAL PLATAFORMA** | **32 Módulos Clave** | **32** | **0** | **100%** |

> [!NOTE]
> **Dictamen de Auditoría:** Todas las observaciones de la auditoría previa (`REM-01` a `REM-10`) han sido subsanadas en el código fuente, validadas en compilación TypeScript y verificadas contra las suites de aceptación técnica. La plataforma está **100% lista para despliegue productivo**.
