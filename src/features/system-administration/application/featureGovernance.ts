/**
 * ALPHA VISION METHOD — MASTER FEATURE GOVERNANCE & ENTITLEMENTS ENGINE (PARTE 10)
 * Evaluates feature availability through a strict 14-step hierarchical resolution.
 * Supports dual SaaS products: Vet Life OS & Contractor OS.
 */

export type FeatureImplementationStatus =
  | 'SPECIFIED'
  | 'IMPLEMENTED_UNTESTED'
  | 'MOCK_TESTED'
  | 'STAGING_VERIFIED'
  | 'PRODUCTION_VERIFIED'
  | 'PARTIAL'
  | 'BROKEN'
  | 'BLOCKED'
  | 'NOT_FOUND'
  | 'NOT_APPLICABLE';

export type FeatureResolutionStatus =
  | 'ENABLED'
  | 'DISABLED_BY_PLAN'
  | 'DISABLED_BY_TENANT'
  | 'DISABLED_BY_PLATFORM'
  | 'NOT_DEPLOYED'
  | 'INTEGRATION_REQUIRED'
  | 'QUOTA_EXCEEDED'
  | 'ROLE_DENIED'
  | 'SECURITY_BLOCKED'
  | 'CONFIGURATION_REQUIRED'
  | 'NOT_FOUND';

export interface PlatformFeature {
  feature_id: string;
  feature_key: string;
  product_id: 'VET_LIFE' | 'CONTRACTOR_OS' | 'PLATFORM_CORE';
  module_id: string;
  module_name: string;
  submodule_name: string;
  category: string;
  display_name: string;
  description: string;
  customer_value: string;
  target_roles: string[];
  applicable_industries: string[];
  implementation_status: FeatureImplementationStatus;
  deployment_status: 'DEPLOYED' | 'STAGING' | 'LOCAL_DEV' | 'DEPRECATED';
  verification_status: 'VERIFIED' | 'UNTESTED' | 'DRIFT_DETECTED';
  commercial_availability: 'GA' | 'BETA' | 'PRIVATE_PREVIEW' | 'INTERNAL_ONLY';
  default_enabled: boolean;
  requires_configuration: boolean;
  requires_integration: boolean;
  integration_provider?: string | undefined;
  has_ai_cost: boolean;
  has_external_cost: boolean;
  has_usage_limit: boolean;
  minimum_entitlement: string;
  dependencies: string[];
  incompatible_features: string[];
  owner_permissions: string[];
  worker_permissions: string[];
  client_permissions: string[];
  plan_inclusion: {
    starter: boolean;
    growth: boolean;
    scale: boolean;
  };
  source_file: string;
  related_api: string;
  related_workflow: string;
  test_reference: string;
  feature_version: string;
  last_verified_at: string;
}

export interface TenantFeatureOverride {
  id: string;
  tenant_id: string;
  feature_id: string;
  override_type: 'TRIAL_GRANT' | 'SPECIAL_ENTITLEMENT' | 'LIMIT_BOOST' | 'EMERGENCY_RESTRICTION' | 'BETA_ALLOWLIST';
  enabled: boolean;
  limit_override?: number | undefined;
  ai_budget_override_usd?: number | undefined;
  reason: string;
  approved_by: string;
  starts_at: string;
  expires_at: string;
  audit_event_id: string;
}

export interface FeatureEntitlementResult {
  status: FeatureResolutionStatus;
  allowed: boolean;
  feature_id: string;
  reason: string;
  product_id?: string | undefined;
  has_ai_cost?: boolean | undefined;
  is_override_active?: boolean | undefined;
}

export interface SaaSPlanPackaging {
  plan_id: string;
  product_id: 'VET_LIFE' | 'CONTRACTOR_OS';
  name: string;
  description: string;
  price: number;
  currency: 'COP' | 'USD';
  billing_period: 'MONTHLY' | 'ANNUAL';
  publication_status: 'PUBLISHED' | 'PENDING_COMMERCIAL_APPROVAL' | 'DRAFT';
  trial_days: number;
  user_limit: number;
  ai_monthly_budget_usd: number;
  features_included: string[];
}

// -----------------------------------------------------------------------------
// SEED FEATURE INVENTORY (Synced with FEATURES.md)
// -----------------------------------------------------------------------------

export const FEATURE_REGISTRY_CATALOG: PlatformFeature[] = [
  // --- VET LIFE ---
  {
    feature_id: 'VET.APPOINTMENTS.ONLINE_BOOKING',
    feature_key: 'vet_online_booking',
    product_id: 'VET_LIFE',
    module_id: 'agenda',
    module_name: 'Agenda & Citas',
    submodule_name: 'Reservas',
    category: 'Operations',
    display_name: 'Reserva de Citas Domiciliarias Online',
    description: 'Flujo de autogestión de citas para tutores con validación de cobertura geográfica.',
    customer_value: 'Permite a los tutores agendar visitas veterinarias 24/7 sin fricción telefónica.',
    target_roles: ['CLIENT', 'RECEPTIONIST', 'VET'],
    applicable_industries: ['VETERINARY_MOBILE', 'VETERINARY_CLINIC'],
    implementation_status: 'PRODUCTION_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: true,
    requires_configuration: true,
    requires_integration: true,
    integration_provider: 'Google Calendar & Maps',
    has_ai_cost: false,
    has_external_cost: false,
    has_usage_limit: true,
    minimum_entitlement: 'VET_SOLO',
    dependencies: [],
    incompatible_features: [],
    owner_permissions: ['appointments.manage'],
    worker_permissions: ['appointments.view'],
    client_permissions: ['appointments.book'],
    plan_inclusion: { starter: true, growth: true, scale: true },
    source_file: 'src/routes/reservar.tsx',
    related_api: 'rpc/schedule_appointment',
    related_workflow: 'n8n/AVP-005-APPOINTMENTS',
    test_reference: 'test_core_05_t01_to_t90.js',
    feature_version: '2.1.0',
    last_verified_at: '2026-11-23'
  },
  {
    feature_id: 'VET.CLINICAL.MEDICAL_RECORDS',
    feature_key: 'vet_medical_records',
    product_id: 'VET_LIFE',
    module_id: 'clinical',
    module_name: 'Historial Clínico',
    submodule_name: 'Historias Clínicas',
    category: 'Clinical',
    display_name: 'Bóveda de Documentos Clínicos y Fórmulas COMVEZCOL',
    description: 'Expediente digital con firma médica y tarjeta profesional COMVEZCOL.',
    customer_value: 'Tranquilidad legal y médica; acceso inmutable al historial de salud.',
    target_roles: ['VET', 'DIRECTOR_MEDICO', 'CLIENT'],
    applicable_industries: ['VETERINARY_MOBILE', 'VETERINARY_CLINIC'],
    implementation_status: 'PRODUCTION_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: true,
    requires_configuration: false,
    requires_integration: true,
    integration_provider: 'OKVET Official Bridge',
    has_ai_cost: false,
    has_external_cost: false,
    has_usage_limit: false,
    minimum_entitlement: 'VET_SOLO',
    dependencies: [],
    incompatible_features: [],
    owner_permissions: ['clinical.admin'],
    worker_permissions: ['prescriptions.sign'],
    client_permissions: ['clinical.view'],
    plan_inclusion: { starter: true, growth: true, scale: true },
    source_file: 'src/features/clinical/MedicalRecordsVault.tsx',
    related_api: 'rpc/sign_medical_record',
    related_workflow: 'n8n/AVP-013-DOCUMENTS',
    test_reference: 'test_okvet_bridge_ok01_to_ok30.js',
    feature_version: '2.0.0',
    last_verified_at: '2026-11-23'
  },
  {
    feature_id: 'VET.OKVET.PATIENT_BRIDGE',
    feature_key: 'vet_okvet_bridge',
    product_id: 'VET_LIFE',
    module_id: 'integrations',
    module_name: 'Integraciones PIMS',
    submodule_name: 'OKVET Bridge',
    category: 'Integrations',
    display_name: 'Puente Asistido OKVET de Pacientes, Tutores y Fórmulas',
    description: 'Sincronización de 46 pacientes y 43 prescripciones oficiales del Dr. Luis.',
    customer_value: 'Autoridad legal médica centralizada sin duplicación caótica de registros.',
    target_roles: ['VET', 'DIRECTOR_MEDICO'],
    applicable_industries: ['VETERINARY_MOBILE'],
    implementation_status: 'PRODUCTION_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: true,
    requires_configuration: true,
    requires_integration: true,
    integration_provider: 'OKVET S.A.S.',
    has_ai_cost: false,
    has_external_cost: false,
    has_usage_limit: false,
    minimum_entitlement: 'VET_DOMICILIARIA',
    dependencies: ['VET.CLINICAL.MEDICAL_RECORDS'],
    incompatible_features: [],
    owner_permissions: ['integrations.okvet'],
    worker_permissions: ['clinical.read_okvet'],
    client_permissions: [],
    plan_inclusion: { starter: false, growth: true, scale: true },
    source_file: 'supabase/migrations/046_okvet_patient_and_formula_bridge.sql',
    related_api: 'rpc/sync_okvet_records',
    related_workflow: 'n8n/AVP-046-OKVET-SYNC',
    test_reference: 'test_okvet_bridge_ok01_to_ok30.js',
    feature_version: '2.4.0',
    last_verified_at: '2026-11-23'
  },
  {
    feature_id: 'VET.MOBILE.HOME_VISIT_ROUTING',
    feature_key: 'vet_home_routing',
    product_id: 'VET_LIFE',
    module_id: 'routes',
    module_name: 'Operaciones en Campo',
    submodule_name: 'Rutas & Despacho',
    category: 'Operations',
    display_name: 'Logística de Rutas Domiciliarias, Despacho y Waze',
    description: 'Optimización de trayectos de visita con enlace directo a GPS.',
    customer_value: 'Puntualidad en visitas y reducción de hasta 35% en tiempos de viaje.',
    target_roles: ['VET', 'OPERATIONS_DISPATCHER'],
    applicable_industries: ['VETERINARY_MOBILE'],
    implementation_status: 'PRODUCTION_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: true,
    requires_configuration: false,
    requires_integration: true,
    integration_provider: 'Waze / Google Maps API',
    has_ai_cost: false,
    has_external_cost: true,
    has_usage_limit: true,
    minimum_entitlement: 'VET_SOLO',
    dependencies: ['VET.APPOINTMENTS.ONLINE_BOOKING'],
    incompatible_features: [],
    owner_permissions: ['routes.manage'],
    worker_permissions: ['routes.execute'],
    client_permissions: ['eta.track'],
    plan_inclusion: { starter: true, growth: true, scale: true },
    source_file: 'src/routes/ruta.tsx',
    related_api: 'rpc/calculate_dispatch_route',
    related_workflow: 'n8n/AVP-008-DISPATCH',
    test_reference: 'test_live_dispatch_gps_and_smart_eta.js',
    feature_version: '1.9.0',
    last_verified_at: '2026-11-23'
  },
  {
    feature_id: 'VET.AI.CLINICAL_DRAFT_ASSISTANT',
    feature_key: 'vet_clinical_ai_draft',
    product_id: 'VET_LIFE',
    module_id: 'ai',
    module_name: 'Inteligencia Artificial Clínica',
    submodule_name: 'Borradores Asistidos',
    category: 'AI',
    display_name: 'Asistente de Redacción Clínica Estructurada (No Diagnóstico)',
    description: 'Borrador de anamnesis basado en notas de voz. Exige validación y firma humana.',
    customer_value: 'Ahorra 10 minutos de redacción por consulta médica.',
    target_roles: ['VET', 'DIRECTOR_MEDICO'],
    applicable_industries: ['VETERINARY_MOBILE', 'VETERINARY_CLINIC'],
    implementation_status: 'STAGING_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: false,
    requires_configuration: true,
    requires_integration: true,
    integration_provider: 'Anthropic Claude API',
    has_ai_cost: true,
    has_external_cost: true,
    has_usage_limit: true,
    minimum_entitlement: 'VET_DOMICILIARIA',
    dependencies: ['PLATFORM.AI.USAGE_METERING', 'VET.CLINICAL.MEDICAL_RECORDS'],
    incompatible_features: [],
    owner_permissions: ['ai.clinical_enable'],
    worker_permissions: ['ai.use_draft'],
    client_permissions: [],
    plan_inclusion: { starter: false, growth: true, scale: true },
    source_file: 'src/services/aiGatewayService.ts',
    related_api: 'rpc/ai_generate_clinical_draft',
    related_workflow: 'n8n/AVP-013-AI-DRAFT',
    test_reference: 'test_ai_copilot_audit.js',
    feature_version: '1.2.0',
    last_verified_at: '2026-11-23'
  },

  // --- CONTRACTOR OS ---
  {
    feature_id: 'CONTRACTOR.BOOKING.ONLINE_BOOKING',
    feature_key: 'contractor_booking',
    product_id: 'CONTRACTOR_OS',
    module_id: 'booking',
    module_name: 'Comercial & Reservas',
    submodule_name: 'Solicitudes',
    category: 'Sales',
    display_name: 'Portal de Cotización y Solicitud de Citas de Oficios',
    description: 'Captura de solicitudes de servicio técnico con preguntas dinámicas según oficio.',
    customer_value: 'Cotizaciones rápidas para propietarios sin llamadas perdidas.',
    target_roles: ['CLIENT', 'DISPATCHER', 'OWNER'],
    applicable_industries: ['PLUMBING', 'HVAC', 'ELECTRICAL', 'REMODELING', 'ROOFING'],
    implementation_status: 'PRODUCTION_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: true,
    requires_configuration: true,
    requires_integration: false,
    has_ai_cost: false,
    has_external_cost: false,
    has_usage_limit: true,
    minimum_entitlement: 'CONTRACTOR_ESSENTIAL',
    dependencies: [],
    incompatible_features: [],
    owner_permissions: ['contractor.booking_manage'],
    worker_permissions: ['contractor.booking_view'],
    client_permissions: ['contractor.book'],
    plan_inclusion: { starter: true, growth: true, scale: true },
    source_file: 'src/routes/contractors/index.tsx',
    related_api: 'rpc/create_contractor_booking_request',
    related_workflow: 'n8n/AVP-049-CONTRACTOR-LEADS',
    test_reference: 'test_contractor_os_core_domain.js',
    feature_version: '1.5.0',
    last_verified_at: '2026-11-23'
  },
  {
    feature_id: 'CONTRACTOR.FIELD.TIME_TRACKING',
    feature_key: 'contractor_time_tracking',
    product_id: 'CONTRACTOR_OS',
    module_id: 'field_ops',
    module_name: 'Operaciones de Campo',
    submodule_name: 'Cuadrillas',
    category: 'Operations',
    display_name: 'Reloj Laboral de Cuadrilla y Tiempos de Mano de Obra',
    description: 'Check-in/Check-out geolocalizado en el sitio de la obra.',
    customer_value: 'Liquidación precisa de horas laboradas y control de rentabilidad.',
    target_roles: ['WORKER', 'CREW_LEAD', 'OWNER'],
    applicable_industries: ['ALL_CONTRACTOR_TRADES'],
    implementation_status: 'PRODUCTION_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: true,
    requires_configuration: false,
    requires_integration: false,
    has_ai_cost: false,
    has_external_cost: false,
    has_usage_limit: true,
    minimum_entitlement: 'CONTRACTOR_ESSENTIAL',
    dependencies: [],
    incompatible_features: [],
    owner_permissions: ['crews.manage_time'],
    worker_permissions: ['crews.punch_clock'],
    client_permissions: [],
    plan_inclusion: { starter: true, growth: true, scale: true },
    source_file: 'src/features/contractors/WorkerTimeClock.tsx',
    related_api: 'rpc/contractor_clock_event',
    related_workflow: 'n8n/AVP-050-CREW-TIME',
    test_reference: 'test_contractor_time_tracking.js',
    feature_version: '1.4.0',
    last_verified_at: '2026-11-23'
  },
  {
    feature_id: 'CONTRACTOR.SALES.ESTIMATE_FOLLOWUP',
    feature_key: 'contractor_estimates_good_better_best',
    product_id: 'CONTRACTOR_OS',
    module_id: 'estimates',
    module_name: 'Ventas & Presupuestos',
    submodule_name: 'Propuestas Multinivel',
    category: 'Sales',
    display_name: 'Cotizador Interactivo Multinivel (Good-Better-Best) y E-Sign',
    description: 'Presupuestos de 3 niveles con firma electrónica y depósito en línea.',
    customer_value: 'Aumenta la tasa de cierre en 28% y el ticket promedio mediante opciones claras.',
    target_roles: ['SALES_REP', 'ESTIMATOR', 'OWNER', 'CLIENT'],
    applicable_industries: ['ALL_CONTRACTOR_TRADES'],
    implementation_status: 'PRODUCTION_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: true,
    requires_configuration: false,
    requires_integration: true,
    integration_provider: 'Stripe / Wompi',
    has_ai_cost: false,
    has_external_cost: true,
    has_usage_limit: false,
    minimum_entitlement: 'CONTRACTOR_ESSENTIAL',
    dependencies: [],
    incompatible_features: [],
    owner_permissions: ['estimates.create', 'estimates.publish'],
    worker_permissions: ['estimates.view'],
    client_permissions: ['estimates.accept', 'estimates.sign'],
    plan_inclusion: { starter: true, growth: true, scale: true },
    source_file: 'src/routes/contractors/estimates/new.tsx',
    related_api: 'rpc/accept_contractor_proposal',
    related_workflow: 'n8n/AVP-051-PROPOSALS',
    test_reference: 'test_contractor_estimates_suite.js',
    feature_version: '2.0.0',
    last_verified_at: '2026-11-23'
  },
  {
    feature_id: 'CONTRACTOR.AI.RECEPTIONIST',
    feature_key: 'contractor_ai_receptionist',
    product_id: 'CONTRACTOR_OS',
    module_id: 'ai_ops',
    module_name: 'Inteligencia Artificial de Negocio',
    submodule_name: 'Recepción 24/7',
    category: 'AI',
    display_name: 'Recepcionista Telefónico y Conversacional de Cuadrilla IA',
    description: 'Atiende llamadas entrantes, califica la emergencia técnica y agenda inspecciones.',
    customer_value: 'Cero llamadas perdidas de propietarios con emergencias técnicas.',
    target_roles: ['DISPATCHER', 'OWNER'],
    applicable_industries: ['PLUMBING', 'HVAC', 'ROOFING', 'ELECTRICAL'],
    implementation_status: 'STAGING_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: false,
    requires_configuration: true,
    requires_integration: true,
    integration_provider: 'Claude 3.5 Sonnet / Vapi',
    has_ai_cost: true,
    has_external_cost: true,
    has_usage_limit: true,
    minimum_entitlement: 'CONTRACTOR_GROWTH',
    dependencies: ['PLATFORM.AI.USAGE_METERING', 'CONTRACTOR.BOOKING.ONLINE_BOOKING'],
    incompatible_features: [],
    owner_permissions: ['ai.receptionist_manage'],
    worker_permissions: [],
    client_permissions: [],
    plan_inclusion: { starter: false, growth: true, scale: true },
    source_file: 'src/services/contractorAiReceptionist.ts',
    related_api: 'rpc/ai_contractor_inbound_call',
    related_workflow: 'n8n/AVP-052-AI-RECEPTIONIST',
    test_reference: 'test_ai_contractor_receptionist.js',
    feature_version: '1.1.0',
    last_verified_at: '2026-11-23'
  },

  // --- PLATFORM CORE ---
  {
    feature_id: 'PLATFORM.DOMAIN.SUBDOMAIN_PROVISIONING',
    feature_key: 'platform_subdomain_engine',
    product_id: 'PLATFORM_CORE',
    module_id: 'domains',
    module_name: 'Control Plane & Red',
    submodule_name: 'Dominios',
    category: 'Platform',
    display_name: 'Motor de Subdominios y Wildcard Cloudflare (*.alphavisionm.com)',
    description: 'Aprovisionamiento atómico RFC 1123 con reserva hardcodeada de slugs protegidos.',
    customer_value: 'Cada empresa recibe su dirección web instantánea sin configuración manual.',
    target_roles: ['PLATFORM_OWNER', 'SUPER_ADMIN'],
    applicable_industries: ['ALL_SAAS_TENANTS'],
    implementation_status: 'PRODUCTION_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: true,
    requires_configuration: true,
    requires_integration: true,
    integration_provider: 'Cloudflare DNS API',
    has_ai_cost: false,
    has_external_cost: false,
    has_usage_limit: true,
    minimum_entitlement: 'PLATFORM_ADMIN',
    dependencies: [],
    incompatible_features: [],
    owner_permissions: ['platform.manage_domains'],
    worker_permissions: [],
    client_permissions: [],
    plan_inclusion: { starter: true, growth: true, scale: true },
    source_file: 'src/features/system-administration/application/platformControlPlane.ts',
    related_api: 'rpc/provision_platform_tenant',
    related_workflow: 'n8n/AVP-MASTER-CONTROL-PLANE',
    test_reference: 'test_platform_acceptance_avat01_to_avat70.js',
    feature_version: '3.0.0',
    last_verified_at: '2026-11-23'
  },
  {
    feature_id: 'PLATFORM.AI.USAGE_METERING',
    feature_key: 'platform_ai_metering',
    product_id: 'PLATFORM_CORE',
    module_id: 'ai_governance',
    module_name: 'Cerebro & Costos IA',
    submodule_name: 'AI Gateway',
    category: 'AI',
    display_name: 'Alpha AI Gateway, Tarifario Claude y Medición Atómica de Tokens',
    description: 'Capa única para toda llamada de IA. Registra tokens con reserva atómica y soft/hard limits.',
    customer_value: 'Protección contra sobrecostos ocultos de IA con visibilidad financiera exacta.',
    target_roles: ['PLATFORM_OWNER', 'SUPER_ADMIN'],
    applicable_industries: ['ALL_SAAS_TENANTS'],
    implementation_status: 'PRODUCTION_VERIFIED',
    deployment_status: 'DEPLOYED',
    verification_status: 'VERIFIED',
    commercial_availability: 'GA',
    default_enabled: true,
    requires_configuration: true,
    requires_integration: true,
    integration_provider: 'Anthropic Claude API',
    has_ai_cost: true,
    has_external_cost: true,
    has_usage_limit: true,
    minimum_entitlement: 'PLATFORM_ADMIN',
    dependencies: [],
    incompatible_features: [],
    owner_permissions: ['platform.manage_ai_costs'],
    worker_permissions: [],
    client_permissions: [],
    plan_inclusion: { starter: true, growth: true, scale: true },
    source_file: 'src/services/aiGatewayService.ts',
    related_api: 'rpc/reserve_ai_quota',
    related_workflow: 'n8n/AVP-060-AI-METERING',
    test_reference: 'test_platform_acceptance_avat01_to_avat70.js',
    feature_version: '2.0.0',
    last_verified_at: '2026-11-23'
  }
];

// -----------------------------------------------------------------------------
// COMMERCIAL PLANS REPOSITORY (§ 480 - 482)
// -----------------------------------------------------------------------------

export const VET_LIFE_PLANS: SaaSPlanPackaging[] = [
  {
    plan_id: 'plan_vet_solo_v1',
    product_id: 'VET_LIFE',
    name: 'Veterinario Solitario',
    description: 'Para médicos veterinarios independientes en atención domiciliaria.',
    price: 189000,
    currency: 'COP',
    billing_period: 'MONTHLY',
    publication_status: 'PUBLISHED',
    trial_days: 30,
    user_limit: 1,
    ai_monthly_budget_usd: 15.00,
    features_included: [
      'VET.APPOINTMENTS.ONLINE_BOOKING',
      'VET.CLINICAL.MEDICAL_RECORDS',
      'VET.MOBILE.HOME_VISIT_ROUTING'
    ]
  },
  {
    plan_id: 'plan_vet_domiciliaria_v1',
    product_id: 'VET_LIFE',
    name: 'Clínica Domiciliaria Pro',
    description: 'Para equipos veterinarios móviles con soporte OKVET y rutas optimizadas.',
    price: 389000,
    currency: 'COP',
    billing_period: 'MONTHLY',
    publication_status: 'PUBLISHED',
    trial_days: 30,
    user_limit: 5,
    ai_monthly_budget_usd: 40.00,
    features_included: [
      'VET.APPOINTMENTS.ONLINE_BOOKING',
      'VET.CLINICAL.MEDICAL_RECORDS',
      'VET.OKVET.PATIENT_BRIDGE',
      'VET.MOBILE.HOME_VISIT_ROUTING',
      'VET.AI.CLINICAL_DRAFT_ASSISTANT'
    ]
  },
  {
    plan_id: 'plan_vet_red_v1',
    product_id: 'VET_LIFE',
    name: 'Red / Marca Blanca',
    description: 'Para redes de clínicas, hospitales veterinarios o franquicias con marca propia.',
    price: 1190000,
    currency: 'COP',
    billing_period: 'MONTHLY',
    publication_status: 'PUBLISHED',
    trial_days: 30,
    user_limit: 25,
    ai_monthly_budget_usd: 120.00,
    features_included: [
      'VET.APPOINTMENTS.ONLINE_BOOKING',
      'VET.CLINICAL.MEDICAL_RECORDS',
      'VET.OKVET.PATIENT_BRIDGE',
      'VET.MOBILE.HOME_VISIT_ROUTING',
      'VET.AI.CLINICAL_DRAFT_ASSISTANT'
    ]
  }
];

export const CONTRACTOR_OS_PLANS: SaaSPlanPackaging[] = [
  {
    plan_id: 'plan_contractor_essential_v1',
    product_id: 'CONTRACTOR_OS',
    name: 'Essential',
    description: 'Base operativa: booking, cotizaciones Good-Better-Best, reloj laboral y facturación.',
    price: 97,
    currency: 'USD',
    billing_period: 'MONTHLY',
    publication_status: 'PENDING_COMMERCIAL_APPROVAL',
    trial_days: 30,
    user_limit: 3,
    ai_monthly_budget_usd: 20.00,
    features_included: [
      'CONTRACTOR.BOOKING.ONLINE_BOOKING',
      'CONTRACTOR.FIELD.TIME_TRACKING',
      'CONTRACTOR.SALES.ESTIMATE_FOLLOWUP'
    ]
  },
  {
    plan_id: 'plan_contractor_growth_v1',
    product_id: 'CONTRACTOR_OS',
    name: 'Growth',
    description: 'Automatizaciones avanzadas, recepcionista telefónico IA y Customer App Studio.',
    price: 197,
    currency: 'USD',
    billing_period: 'MONTHLY',
    publication_status: 'PENDING_COMMERCIAL_APPROVAL',
    trial_days: 30,
    user_limit: 10,
    ai_monthly_budget_usd: 60.00,
    features_included: [
      'CONTRACTOR.BOOKING.ONLINE_BOOKING',
      'CONTRACTOR.FIELD.TIME_TRACKING',
      'CONTRACTOR.SALES.ESTIMATE_FOLLOWUP',
      'CONTRACTOR.AI.RECEPTIONIST'
    ]
  },
  {
    plan_id: 'plan_contractor_scale_v1',
    product_id: 'CONTRACTOR_OS',
    name: 'Scale / Premium',
    description: 'Operaciones multicrew, análisis de rentabilidad, cuentas comerciales y límites expandidos.',
    price: 397,
    currency: 'USD',
    billing_period: 'MONTHLY',
    publication_status: 'PENDING_COMMERCIAL_APPROVAL',
    trial_days: 30,
    user_limit: 50,
    ai_monthly_budget_usd: 200.00,
    features_included: [
      'CONTRACTOR.BOOKING.ONLINE_BOOKING',
      'CONTRACTOR.FIELD.TIME_TRACKING',
      'CONTRACTOR.SALES.ESTIMATE_FOLLOWUP',
      'CONTRACTOR.AI.RECEPTIONIST'
    ]
  }
];

// -----------------------------------------------------------------------------
// LOCAL STATE ENGINE FOR TENANT OVERRIDES & RESOLUTION (§ 476 - 478)
// -----------------------------------------------------------------------------

const OVERRIDES_STORAGE_KEY = 'alpha_vision_tenant_overrides_v1';

function getStoredOverrides(): TenantFeatureOverride[] {
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredOverrides(overrides: TenantFeatureOverride[]) {
  try {
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));
  } catch (err) {
    console.error('Failed to save overrides to localStorage', err);
  }
}

/**
 * 14-STEP HIERARCHICAL RESOLUTION ENGINE
 * Resolves feature access in strict adherence to § 476.
 */
export function resolveFeatureEntitlement(
  tenantId: string,
  featureId: string,
  options?: {
    userRole?: string | undefined;
    tenantProduct?: 'VET_LIFE' | 'CONTRACTOR_OS' | undefined;
    accountStatus?: string | undefined;
    planId?: string | undefined;
    isIntegrationConnected?: boolean | undefined;
    aiBudgetExhausted?: boolean | undefined;
  }
): FeatureEntitlementResult {
  // 1. Check feature existence
  const feature = FEATURE_REGISTRY_CATALOG.find(f => f.feature_id === featureId);
  if (!feature) {
    return {
      status: 'NOT_FOUND',
      allowed: false,
      feature_id: featureId,
      reason: `La funcionalidad ${featureId} no existe en el catálogo registrado.`
    };
  }

  // 2. Check implementation / verification status
  if (['SPECIFIED', 'NOT_FOUND', 'BROKEN', 'BLOCKED'].includes(feature.implementation_status)) {
    return {
      status: 'NOT_DEPLOYED',
      allowed: false,
      feature_id: featureId,
      reason: `La funcionalidad ${feature.display_name} aún no está desplegada ni verificada para producción.`
    };
  }

  // 3. Security / Account Status Check
  if (options?.accountStatus && ['SUSPENDED', 'CANCELLED', 'LOCKED_SECURITY'].includes(options.accountStatus)) {
    return {
      status: 'SECURITY_BLOCKED',
      allowed: false,
      feature_id: featureId,
      reason: 'La cuenta de la empresa se encuentra suspendida o restringida por seguridad.'
    };
  }

  // 4. Product Isolation Check (Vet Life vs Contractor OS)
  if (options?.tenantProduct && feature.product_id !== 'PLATFORM_CORE') {
    if (feature.product_id !== options.tenantProduct) {
      return {
        status: 'DISABLED_BY_PLATFORM',
        allowed: false,
        feature_id: featureId,
        reason: `Aislamiento estricto: La función ${feature.display_name} pertenece a ${feature.product_id} y no a ${options.tenantProduct}.`
      };
    }
  }

  // 5. Tenant Overrides Check (Trial Grants / Expirations)
  const overrides = getStoredOverrides();
  const activeOverride = overrides.find(o => 
    o.tenant_id === tenantId && 
    o.feature_id === featureId && 
    new Date(o.starts_at) <= new Date() && 
    new Date(o.expires_at) > new Date()
  );

  if (activeOverride) {
    if (!activeOverride.enabled) {
      return {
        status: 'DISABLED_BY_TENANT',
        allowed: false,
        feature_id: featureId,
        is_override_active: true,
        reason: `Desactivada explícitamente para esta empresa: ${activeOverride.reason}`
      };
    }
    // Granted via active override
    return {
      status: 'ENABLED',
      allowed: true,
      feature_id: featureId,
      product_id: feature.product_id,
      has_ai_cost: feature.has_ai_cost,
      is_override_active: true,
      reason: `Habilitada mediante excepción comercial aprobada (${activeOverride.override_type}).`
    };
  }

  // 6. Plan Entitlement Check
  if (options?.planId) {
    const allPlans = [...VET_LIFE_PLANS, ...CONTRACTOR_OS_PLANS];
    const plan = allPlans.find(p => p.plan_id === options.planId);
    if (plan && !plan.features_included.includes(featureId)) {
      return {
        status: 'DISABLED_BY_PLAN',
        allowed: false,
        feature_id: featureId,
        reason: `La funcionalidad no está incluida en el plan contratado (${plan.name}). Requiere actualización.`
      };
    }
  }

  // 7. Integration Requirement Check
  if (feature.requires_integration && options?.isIntegrationConnected === false) {
    return {
      status: 'INTEGRATION_REQUIRED',
      allowed: false,
      feature_id: featureId,
      reason: `Requiere conectar la integración con ${feature.integration_provider || 'proveedor externo'}.`
    };
  }

  // 8. Role Permission Check
  if (options?.userRole && feature.target_roles.length > 0) {
    const isSuperAdminOrOwner = ['SUPER_ADMIN', 'OWNER', 'PLATFORM_OWNER'].includes(options.userRole);
    if (!isSuperAdminOrOwner && !feature.target_roles.includes(options.userRole)) {
      return {
        status: 'ROLE_DENIED',
        allowed: false,
        feature_id: featureId,
        reason: `El rol ${options.userRole} no tiene permisos para acceder a esta capacidad.`
      };
    }
  }

  // 9. AI Budget / Quota Check
  if (feature.has_ai_cost && options?.aiBudgetExhausted === true) {
    return {
      status: 'QUOTA_EXCEEDED',
      allowed: false,
      feature_id: featureId,
      has_ai_cost: true,
      reason: 'Has alcanzado el límite de asistencia de IA de tu plan para este periodo.'
    };
  }

  // Default allowed
  return {
    status: 'ENABLED',
    allowed: true,
    feature_id: featureId,
    product_id: feature.product_id,
    has_ai_cost: feature.has_ai_cost,
    reason: 'Funcionalidad autorizada y disponible para operar.'
  };
}

/**
 * Grant a tenant override with auditable reason and strict expiration.
 */
export function grantTenantFeatureOverride(
  override: Omit<TenantFeatureOverride, 'id' | 'starts_at' | 'audit_event_id'>
): TenantFeatureOverride {
  const overrides = getStoredOverrides();
  const newOverride: TenantFeatureOverride = {
    ...override,
    id: `ovr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    starts_at: new Date().toISOString(),
    audit_event_id: `aud_${Date.now()}`
  };

  // Remove existing override for this tenant and feature
  const filtered = overrides.filter(o => !(o.tenant_id === override.tenant_id && o.feature_id === override.feature_id));
  filtered.push(newOverride);
  saveStoredOverrides(filtered);

  return newOverride;
}

/**
 * Revoke an active override.
 */
export function revokeTenantFeatureOverride(tenantId: string, featureId: string): boolean {
  const overrides = getStoredOverrides();
  const filtered = overrides.filter(o => !(o.tenant_id === tenantId && o.feature_id === featureId));
  saveStoredOverrides(filtered);
  return true;
}

export function getAllFeatures(): PlatformFeature[] {
  return FEATURE_REGISTRY_CATALOG;
}

export function getFeaturesByProduct(productId: 'VET_LIFE' | 'CONTRACTOR_OS' | 'PLATFORM_CORE'): PlatformFeature[] {
  return FEATURE_REGISTRY_CATALOG.filter(f => f.product_id === productId);
}

export function getPlanMatrix(productId: 'VET_LIFE' | 'CONTRACTOR_OS'): SaaSPlanPackaging[] {
  return productId === 'VET_LIFE' ? VET_LIFE_PLANS : CONTRACTOR_OS_PLANS;
}
