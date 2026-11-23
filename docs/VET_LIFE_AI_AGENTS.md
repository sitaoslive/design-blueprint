# VET LIFE — AI AGENTS & SPECIALIZED INTELLIGENCE CATALOG
**Plataforma:** VET FREEDOM OS  
**Autor:** Alpha Vision Method / AI Engineering  
**Fecha:** 2026-11-23  

---

## 1. Principio Fundamental de Seguridad Clínica (COMVEZCOL)
> [!IMPORTANT]
> Bajo la Ley 576 de 2000 (Código de Ética Médico Veterinaria de Colombia):
> **La Inteligencia Artificial de Vet Freedom OS NUNCA diagnostica ni prescribe medicamentos de forma autónoma.**
> Todo resumen clínico, sugerencia de posología o nota SOAP generado por IA tiene la condición de **borrador preliminar (`AI_DRAFT_PENDING_REVIEW`)** y requiere obligatoriamente la revisión, modificación y firma digital de un médico veterinario con matrícula profesional vigente.

---

## 2. Catálogo de los 10 Agentes Especializados de IA

### 1. Veterinary Assistant (Asistente Clínico de Consulta)
- **Objetivo:** Asistir al Dr. Luis y veterinarios en la redacción de notas SOAP, búsqueda rápida en vademécums y resumen de expedientes previos.
- **Usuarios Autorizados:** Veterinario, Director Médico, Especialista.
- **Herramientas Permitidas:** `get_patient_history`, `search_vademecum_colombia`, `draft_clinical_soap`, `check_drug_interaction`.
- **Acciones Prohibidas:** Firmar recetas, emitir diagnósticos definitivos, alterar notas pasadas.
- **Modelo:** Gemini 1.5 Pro / Claude 3.5 Sonnet (Análisis clínico profundo).

### 2. Scheduling Intelligence Agent (Agente de Agenda y Rutas)
- **Objetivo:** Analizar huecos en la agenda, calcular tiempos de traslado en Medellín y el Oriente Antioqueño y sugerir horarios óptimos.
- **Usuarios Autorizados:** Coordinador de Despacho, Recepción, Dr. Luis.
- **Herramientas Permitidas:** `get_staff_availability`, `calculate_route_buffer`, `propose_appointment_slots`.
- **Acciones Prohibidas:** Sobrescribir citas confirmadas en OKVET sin confirmación humana.
- **Modelo:** Gemini 1.5 Flash (Baja latencia, alta eficiencia).

### 3. Client Experience Agent (Conserje de WhatsApp)
- **Objetivo:** Atender consultas frecuentes de tutores por WhatsApp, enviar recordatorios y recopilar datos básicos de triaje.
- **Usuarios Autorizados:** Clientes / Tutores de mascotas.
- **Herramientas Permitidas:** `get_clinic_services`, `answer_faq`, `collect_triage_answers`, `generate_booking_request`.
- **Acciones Prohibidas:** Prometer atención en urgencias vitales, enviar mensajes comerciales a tutores en duelo.
- **Escalamiento:** Pasa inmediatamente a un recepcionista humano ante palabras clave de riesgo o frustración.

### 4. Clinic Operations Agent (Agente de Cuellos de Botella)
- **Objetivo:** Detectar citas que se retrasan más de 20 minutos, calcular tiempos promedio de consulta y alertar sobre sobrecarga del equipo.
- **Usuarios Autorizados:** Clinic Manager, Administrador.
- **Herramientas Permitidas:** `get_active_visit_durations`, `detect_operational_delays`, `summarize_daily_kpis`.

### 5. Medical Director Support Agent (Auditoría Médica)
- **Objetivo:** Auditar que las prescripciones emitidas incluyan dosis, número de lote y firma COMVEZCOL completa.
- **Usuarios Autorizados:** Dr. Luis Eduardo Ríos (Director Médico).
- **Herramientas Permitidas:** `audit_prescription_completeness`, `verify_cold_chain_compliance`.

### 6. Pet Owner Assistant (Asistente del Tutor en "My Pet Life")
- **Objetivo:** Guiar al tutor en el uso de la app PWA, explicar instrucciones post-consulta dadas por su médico y responder dudas de cuidados diarios.
- **Usuarios Autorizados:** Tutores de mascotas en la app móvil.
- **Herramientas Permitidas:** `explain_medical_instructions`, `show_vaccination_schedule`, `generate_travel_pack_summary`.

### 7. Platform Onboarding Agent (Onboarding de Nuevas Clínicas)
- **Objetivo:** Guiar a un director veterinario que se registra en `/registro-clinica` en la personalización de su marca, selección de paleta y configuración de tarifas.
- **Usuarios Autorizados:** Dueños de clínicas en prueba (Trial).
- **Herramientas Permitidas:** `preview_theme_collection`, `suggest_service_catalog`, `configure_operating_zones`.

### 8. AI Cost Intelligence Agent (Control de Presupuesto y Tokens)
- **Objetivo:** Monitorear el consumo mensual de tokens por organización y cortar llamadas superfluas si se alcanza el 95% del límite del plan.
- **Usuarios Autorizados:** Platform Super Admin.
- **Herramientas Permitidas:** `get_tenant_token_usage`, `apply_token_rate_limit`, `alert_spending_cap`.

### 9. Integration Monitoring Agent (Vigilante de Sincronización)
- **Objetivo:** Detectar anomalías en el conector de OKVET, fallas en la API de WhatsApp o retrasos en el outbox transaccional.
- **Usuarios Autorizados:** Technical Operations, Soporte.
- **Herramientas Permitidas:** `inspect_outbox_lag`, `verify_bridge_health`, `trigger_safe_repair`.

### 10. Development and Reliability Agent (SRE y Gobernanza)
- **Objetivo:** Validar que todo cambio de código mantenga la integridad documental, actualice `features.manifest.json` y ejecute los tests de regresión antes de desplegar.
- **Usuarios Autorizados:** Agentes de Antigravity, Ingenieros DevOps.
- **Herramientas Permitidas:** `validate_manifest`, `run_governance_checks`, `generate_release_notes`.

---

## 3. Presupuesto y Enrutamiento Económico de Modelos
- **Tier 1 (Operaciones Deterministas):** Cálculos de tarifas, filtros y comprobaciones lógicas se ejecutan en **código puro (TypeScript / SQL)** con costo $0 en tokens.
- **Tier 2 (Tareas Rápidas y Clasificación):** Intenciones de WhatsApp, extracción de citas y triaje se enrutan a **modelos ultra-rápidos (Flash / Flash-Lite)**.
- **Tier 3 (Análisis Clínico y Reportes Ejecutivos):** Redacción de informes médicos y análisis semanal del Dr. Luis se enrutan a **modelos pro** con revisión humana obligatoria.
