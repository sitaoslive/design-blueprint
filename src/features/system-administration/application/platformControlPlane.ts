/**
/**
 * ALPHA VISION METHOD — MULTI-PRODUCT PLATFORM CONTROL PLANE
 * Domain Service para Gobernanza de Tenants, Dominios, Activaciones y Sincronización GHL.
 *
 * Productos Soportados:
 *   - VET_LIFE (Vet Freedom OS)
 *   - CONTRACTOR_OS (Alpha Service OS / Contractor Field Service OS)
 *
 * Regla de Oro:
 *   El Control Plane administra licencias, identidades y dominios.
 *   Los Data Planes administran datos clínicos u operativos con 100% de aislamiento.
 */

import { supabase } from "@/integrations/supabase/client";

export type SaaSProductType = "VET_LIFE" | "CONTRACTOR_OS";

export type SystemResolutionType =
  | "VET_LIFE"
  | "CONTRACTOR_OS"
  | "PLATFORM_ADMIN"
  | "PLATFORM_PUBLIC"
  | "NOT_FOUND"
  | "SUSPENDED"
  | "MAINTENANCE";

export type PlatformAccountStatus =
  | "REGISTERED"
  | "EMAIL_VERIFICATION_PENDING"
  | "WAITING_FOR_REVIEW"
  | "WAITING_FOR_PAYMENT"
  | "TRIAL_ELIGIBLE"
  | "PROVISIONING"
  | "CONFIGURATION_REQUIRED"
  | "READY_FOR_ACTIVATION"
  | "ACTIVE_TRIAL"
  | "ACTIVE_PAID"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED"
  | "PROVISIONING_FAILED"
  | "ARCHIVED";

export type DomainRoutingStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "SUSPENDED" | "REDIRECT";

export interface PlatformTenant {
  id: string;
  tenant_id: string; // ID operativo en organizations o aislado
  legal_name: string;
  display_name: string;
  normalized_slug: string;
  product_type: SaaSProductType;
  industry: string;
  exact_niche?: string | undefined;
  country: string;
  currency: string;
  time_zone: string;
  account_status: PlatformAccountStatus;
  onboarding_status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "STALLED";
  provisioning_status: "PENDING" | "IN_PROGRESS" | "SUCCESS" | "FAILED" | "RETRYING";
  billing_status: "TRIAL" | "PAID" | "GRACE_PERIOD" | "OVERDUE" | "CANCELLED" | "COMPLIMENTARY";
  plan_code: string;
  plan_name: string;
  plan_price_cop?: number | undefined;
  plan_price_usd?: number | undefined;
  hostname: string;
  ghl_contact_id?: string | undefined;
  ghl_opportunity_id?: string | undefined;
  ghl_pipeline_id?: string | undefined;
  ghl_stage_name?: string | undefined;
  trial_started_at?: string | undefined;
  trial_ends_at?: string | undefined;
  activation_date?: string | undefined;
  suspended_at?: string | undefined;
  cancellation_date?: string | undefined;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown> | undefined;
}

export interface PlatformDomain {
  id: string;
  tenant_id?: string | undefined;
  hostname: string;
  normalized_slug: string;
  domain_type: "SUBDOMAIN" | "CUSTOM_DOMAIN" | "SYSTEM_RESERVED";
  product_type: SaaSProductType | "PLATFORM_ADMIN" | "PLATFORM_PUBLIC";
  verification_status: "PENDING" | "VERIFIED" | "FAILED" | "EXPIRED";
  routing_status: DomainRoutingStatus;
  tls_status: "ACTIVE" | "PROVISIONING" | "PENDING_VALIDATION" | "FAILED";
  primary_domain: boolean;
  reserved: boolean;
  reserved_reason?: string | undefined;
  created_at: string;
  activated_at?: string | undefined;
}

export interface HostnameResolutionResult {
  resolution_type: SystemResolutionType;
  product_type?: SaaSProductType | "PLATFORM_ADMIN" | "PLATFORM_PUBLIC" | undefined;
  hostname: string;
  normalized_slug?: string | undefined;
  tenant_id?: string | undefined;
  display_name?: string | undefined;
  account_status?: PlatformAccountStatus | undefined;
  billing_status?: string | undefined;
  routing_status?: DomainRoutingStatus | undefined;
  target_route: string;
  message?: string | undefined;
}

export interface GhlOpportunityStage {
  id: string;
  name: string;
  order: number;
}

export interface GhlPipelineConfig {
  pipeline_id: string;
  name: string;
  product_type: SaaSProductType;
  stages: GhlOpportunityStage[];
}

// ----------------------------------------------------------------------------
// Constantes y Semillas Fundacionales
// ----------------------------------------------------------------------------
export const RESERVED_SYSTEM_SLUGS = [
  "admin",
  "www",
  "api",
  "auth",
  "login",
  "billing",
  "support",
  "help",
  "status",
  "system",
  "platform",
  "vet",
  "contractors",
  "internal",
  "staging",
  "dev",
  "mail",
  "smtp",
  "ftp",
  "luis", // Exclusivo Dr. Luis
];

export const GHL_PIPELINES: Record<SaaSProductType, GhlPipelineConfig> = {
  VET_LIFE: {
    pipeline_id: "pipe_alpha_vet_sales_v1",
    name: "Alpha Vet Life Sales",
    product_type: "VET_LIFE",
    stages: [
      { id: "v_new", name: "NEW LEAD", order: 1 },
      { id: "v_cont", name: "CONTACTED", order: 2 },
      { id: "v_qual", name: "QUALIFIED", order: 3 },
      { id: "v_demo_bk", name: "DEMO BOOKED", order: 4 },
      { id: "v_demo_cp", name: "DEMO COMPLETED", order: 5 },
      { id: "v_trial_rq", name: "TRIAL REQUESTED", order: 6 },
      { id: "v_trial_ac", name: "TRIAL ACTIVE", order: 7 },
      { id: "v_setup", name: "SETUP IN PROGRESS", order: 8 },
      { id: "v_act_rdy", name: "ACTIVATION READY", order: 9 },
      { id: "v_pay_pnd", name: "PAYMENT PENDING", order: 10 },
      { id: "v_won", name: "CUSTOMER WON", order: 11 },
      { id: "v_active", name: "CUSTOMER ACTIVE", order: 12 },
      { id: "v_risk", name: "AT RISK", order: 13 },
      { id: "v_canc", name: "CANCELLED", order: 14 },
      { id: "v_lost", name: "LOST", order: 15 },
    ],
  },
  CONTRACTOR_OS: {
    pipeline_id: "pipe_alpha_contractor_sales_v1",
    name: "Alpha Contractor OS Sales",
    product_type: "CONTRACTOR_OS",
    stages: [
      { id: "c_new", name: "NEW LEAD", order: 1 },
      { id: "c_cont", name: "CONTACTED", order: 2 },
      { id: "c_qual", name: "BUSINESS QUALIFIED", order: 3 },
      { id: "c_demo_bk", name: "DEMO BOOKED", order: 4 },
      { id: "c_demo_cp", name: "DEMO COMPLETED", order: 5 },
      { id: "c_trial_rq", name: "TRIAL REQUESTED", order: 6 },
      { id: "c_trial_ac", name: "TRIAL ACTIVE", order: 7 },
      { id: "c_onb", name: "ONBOARDING", order: 8 },
      { id: "c_int_pnd", name: "INTEGRATIONS PENDING", order: 9 },
      { id: "c_pay_pnd", name: "PAYMENT PENDING", order: 10 },
      { id: "c_won", name: "CUSTOMER WON", order: 11 },
      { id: "c_active", name: "CUSTOMER ACTIVE", order: 12 },
      { id: "c_risk", name: "AT RISK", order: 13 },
      { id: "c_canc", name: "CANCELLED", order: 14 },
      { id: "c_lost", name: "LOST", order: 15 },
    ],
  },
};

const STORAGE_KEY_TENANTS = "alpha_vision_control_plane_tenants_v2";
const STORAGE_KEY_DOMAINS = "alpha_vision_control_plane_domains_v2";

const INITIAL_TENANTS: PlatformTenant[] = [
  {
    id: "pt-luis-001",
    tenant_id: "11111111-1111-1111-1111-111111111111",
    legal_name: "Vet Life — Veterinaria a Domicilio S.A.S.",
    display_name: "Dr. Luis Eduardo Ríos · Vet Life",
    normalized_slug: "luis",
    product_type: "VET_LIFE",
    industry: "VETERINARY",
    exact_niche: "Medicina Veterinaria Móvil & Domicilios",
    country: "Colombia",
    currency: "COP",
    time_zone: "America/Bogota",
    account_status: "ACTIVE_PAID",
    onboarding_status: "COMPLETED",
    provisioning_status: "SUCCESS",
    billing_status: "PAID",
    plan_code: "TIER2_CLINICA",
    plan_name: "Clínica Domiciliaria Pro",
    plan_price_cop: 389000,
    hostname: "luis.alphavisionm.com",
    ghl_contact_id: "ghl_cont_luis_001",
    ghl_opportunity_id: "ghl_opp_luis_001",
    ghl_pipeline_id: "pipe_alpha_vet_sales_v1",
    ghl_stage_name: "CUSTOMER ACTIVE",
    activation_date: "2026-11-20T10:00:00Z",
    created_at: "2026-11-20T08:00:00Z",
    updated_at: "2026-11-23T18:00:00Z",
    metadata: {
      comvezcol_card: "COMVEZCOL-001",
      okvet_verified_patients: 46,
      okvet_verified_prescriptions: 43,
    },
  },
  {
    id: "pt-san-roque-002",
    tenant_id: "22222222-2222-2222-2222-222222222222",
    legal_name: "Clínica Veterinaria San Roque Envigado",
    display_name: "Dra. Sofía Martínez · San Roque",
    normalized_slug: "sanroque",
    product_type: "VET_LIFE",
    industry: "VETERINARY",
    exact_niche: "Clínica & Urgencias 24h",
    country: "Colombia",
    currency: "COP",
    time_zone: "America/Bogota",
    account_status: "ACTIVE_TRIAL",
    onboarding_status: "IN_PROGRESS",
    provisioning_status: "SUCCESS",
    billing_status: "TRIAL",
    plan_code: "TIER2_CLINICA",
    plan_name: "Clínica Domiciliaria Pro",
    plan_price_cop: 389000,
    hostname: "sanroque.alphavisionm.com",
    ghl_contact_id: "ghl_cont_sanroque_002",
    ghl_opportunity_id: "ghl_opp_sanroque_002",
    ghl_pipeline_id: "pipe_alpha_vet_sales_v1",
    ghl_stage_name: "TRIAL ACTIVE",
    trial_started_at: "2026-11-22T00:00:00Z",
    trial_ends_at: "2026-12-22T00:00:00Z",
    created_at: "2026-11-22T10:00:00Z",
    updated_at: "2026-11-23T18:00:00Z",
  },
  {
    id: "pt-apex-contractor-003",
    tenant_id: "33333333-3333-3333-3333-333333333333",
    legal_name: "Apex Plumbing & HVAC Solutions S.A.S.",
    display_name: "Apex Plumbing & HVAC",
    normalized_slug: "apexplumbing",
    product_type: "CONTRACTOR_OS",
    industry: "PLUMBING",
    exact_niche: "Fontanería Comercial & Residencial",
    country: "Colombia",
    currency: "USD",
    time_zone: "America/Bogota",
    account_status: "ACTIVE_PAID",
    onboarding_status: "COMPLETED",
    provisioning_status: "SUCCESS",
    billing_status: "PAID",
    plan_code: "CONTRACTOR_GROWTH",
    plan_name: "Growth Pro",
    plan_price_usd: 197,
    hostname: "apexplumbing.alphavisionm.com",
    ghl_contact_id: "ghl_cont_apex_003",
    ghl_opportunity_id: "ghl_opp_apex_003",
    ghl_pipeline_id: "pipe_alpha_contractor_sales_v1",
    ghl_stage_name: "CUSTOMER ACTIVE",
    activation_date: "2026-11-21T14:00:00Z",
    created_at: "2026-11-21T10:00:00Z",
    updated_at: "2026-11-23T18:00:00Z",
    metadata: {
      crews_count: 4,
      service_type: "PLUMBING",
    },
  },
  {
    id: "pt-green-yard-004",
    tenant_id: "44444444-4444-4444-4444-444444444444",
    legal_name: "Green Landscape & Irrigation LLC",
    display_name: "Green Landscape Masters",
    normalized_slug: "greenlandscape",
    product_type: "CONTRACTOR_OS",
    industry: "LANDSCAPING",
    exact_niche: "Riego y Mantenimiento de Jardines",
    country: "United States",
    currency: "USD",
    time_zone: "America/New_York",
    account_status: "ACTIVE_TRIAL",
    onboarding_status: "IN_PROGRESS",
    provisioning_status: "SUCCESS",
    billing_status: "TRIAL",
    plan_code: "CONTRACTOR_STARTER",
    plan_name: "Starter Contractor",
    plan_price_usd: 97,
    hostname: "greenlandscape.alphavisionm.com",
    ghl_contact_id: "ghl_cont_green_004",
    ghl_opportunity_id: "ghl_opp_green_004",
    ghl_pipeline_id: "pipe_alpha_contractor_sales_v1",
    ghl_stage_name: "TRIAL ACTIVE",
    trial_started_at: "2026-11-23T00:00:00Z",
    trial_ends_at: "2026-12-23T00:00:00Z",
    created_at: "2026-11-23T09:00:00Z",
    updated_at: "2026-11-23T18:00:00Z",
  },
];

const INITIAL_DOMAINS: PlatformDomain[] = [
  {
    id: "dom-luis",
    tenant_id: "pt-luis-001",
    hostname: "luis.alphavisionm.com",
    normalized_slug: "luis",
    domain_type: "SUBDOMAIN",
    product_type: "VET_LIFE",
    verification_status: "VERIFIED",
    routing_status: "ACTIVE",
    tls_status: "ACTIVE",
    primary_domain: true,
    reserved: true,
    reserved_reason: "Asignación protegida permanente Dr. Luis Eduardo Ríos",
    created_at: "2026-11-20T08:00:00Z",
    activated_at: "2026-11-20T10:00:00Z",
  },
  {
    id: "dom-sanroque",
    tenant_id: "pt-san-roque-002",
    hostname: "sanroque.alphavisionm.com",
    normalized_slug: "sanroque",
    domain_type: "SUBDOMAIN",
    product_type: "VET_LIFE",
    verification_status: "VERIFIED",
    routing_status: "ACTIVE",
    tls_status: "ACTIVE",
    primary_domain: true,
    reserved: false,
    created_at: "2026-11-22T10:00:00Z",
    activated_at: "2026-11-22T10:00:00Z",
  },
  {
    id: "dom-apex",
    tenant_id: "pt-apex-contractor-003",
    hostname: "apexplumbing.alphavisionm.com",
    normalized_slug: "apexplumbing",
    domain_type: "SUBDOMAIN",
    product_type: "CONTRACTOR_OS",
    verification_status: "VERIFIED",
    routing_status: "ACTIVE",
    tls_status: "ACTIVE",
    primary_domain: true,
    reserved: false,
    created_at: "2026-11-21T10:00:00Z",
    activated_at: "2026-11-21T14:00:00Z",
  },
  {
    id: "dom-green",
    tenant_id: "pt-green-yard-004",
    hostname: "greenlandscape.alphavisionm.com",
    normalized_slug: "greenlandscape",
    domain_type: "SUBDOMAIN",
    product_type: "CONTRACTOR_OS",
    verification_status: "VERIFIED",
    routing_status: "ACTIVE",
    tls_status: "ACTIVE",
    primary_domain: true,
    reserved: false,
    created_at: "2026-11-23T09:00:00Z",
    activated_at: "2026-11-23T09:00:00Z",
  },
  {
    id: "dom-admin",
    hostname: "admin.alphavisionm.com",
    normalized_slug: "admin",
    domain_type: "SYSTEM_RESERVED",
    product_type: "PLATFORM_ADMIN",
    verification_status: "VERIFIED",
    routing_status: "ACTIVE",
    tls_status: "ACTIVE",
    primary_domain: true,
    reserved: true,
    reserved_reason: "Compuerta de Mando y Super Admin de la Dueña",
    created_at: "2026-11-19T00:00:00Z",
    activated_at: "2026-11-19T00:00:00Z",
  },
  {
    id: "dom-vet",
    hostname: "vet.alphavisionm.com",
    normalized_slug: "vet",
    domain_type: "SYSTEM_RESERVED",
    product_type: "VET_LIFE",
    verification_status: "VERIFIED",
    routing_status: "ACTIVE",
    tls_status: "ACTIVE",
    primary_domain: true,
    reserved: true,
    reserved_reason: "Landing Comercial & Ventas Vet Freedom OS",
    created_at: "2026-11-19T00:00:00Z",
    activated_at: "2026-11-19T00:00:00Z",
  },
  {
    id: "dom-public",
    hostname: "alphavisionm.com",
    normalized_slug: "www",
    domain_type: "SYSTEM_RESERVED",
    product_type: "PLATFORM_PUBLIC",
    verification_status: "VERIFIED",
    routing_status: "ACTIVE",
    tls_status: "ACTIVE",
    primary_domain: true,
    reserved: true,
    reserved_reason: "Sitio Matriz Comercial Alpha Vision Method",
    created_at: "2026-11-19T00:00:00Z",
    activated_at: "2026-11-19T00:00:00Z",
  },
];

// Helper de persistencia local
function loadTenants(): PlatformTenant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TENANTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TENANTS, JSON.stringify(INITIAL_TENANTS));
      return INITIAL_TENANTS;
    }
    return JSON.parse(raw) as PlatformTenant[];
  } catch {
    return INITIAL_TENANTS;
  }
}

function saveTenants(tenants: PlatformTenant[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TENANTS, JSON.stringify(tenants));
  } catch {
    // Ignore storage errors
  }
}

function loadDomains(): PlatformDomain[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DOMAINS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_DOMAINS, JSON.stringify(INITIAL_DOMAINS));
      return INITIAL_DOMAINS;
    }
    return JSON.parse(raw) as PlatformDomain[];
  } catch {
    return INITIAL_DOMAINS;
  }
}

function saveDomains(domains: PlatformDomain[]) {
  try {
    localStorage.setItem(STORAGE_KEY_DOMAINS, JSON.stringify(domains));
  } catch {
    // Ignore storage errors
  }
}

// ----------------------------------------------------------------------------
// Funciones Principales del Control Plane
// ----------------------------------------------------------------------------

/**
 * Normaliza cualquier nombre comercial en un slug DNS válido (RFC 1123)
 */
export function normalizeSubdomainSlug(inputName: string): string {
  let clean = inputName.toLowerCase().trim();
  clean = clean
    .replace(/á/g, "a")
    .replace(/é/g, "e")
    .replace(/í/g, "i")
    .replace(/ó/g, "o")
    .replace(/ú/g, "u")
    .replace(/ñ/g, "n")
    .replace(/ü/g, "u");

  clean = clean.replace(/[^a-z0-9\-]+/g, "-");
  clean = clean.replace(/\-+/g, "-");
  clean = clean.replace(/^-+|-+$/g, "");

  if (clean.length > 40) {
    clean = clean.substring(0, 40).replace(/-+$/, "");
  }

  if (!clean) {
    clean = `empresa-${Math.random().toString(36).substring(2, 8)}`;
  }
  return clean;
}

/**
 * Comprueba disponibilidad de un slug y sugiere alternativas válidas
 */
export async function suggestAvailableSlugs(
  baseName: string,
  productType: SaaSProductType = "VET_LIFE"
): Promise<{
  base_slug: string;
  is_available: boolean;
  collision_reason: "AVAILABLE" | "RESERVED_SYSTEM_SLUG" | "SLUG_ALREADY_TAKEN";
  suggestions: Array<{ slug: string; is_available: boolean }>;
}> {
  const cleanBase = normalizeSubdomainSlug(baseName);
  const domains = loadDomains();

  const isReserved = RESERVED_SYSTEM_SLUGS.includes(cleanBase);
  const isTaken = domains.some((d) => d.normalized_slug === cleanBase);

  let collisionReason: "AVAILABLE" | "RESERVED_SYSTEM_SLUG" | "SLUG_ALREADY_TAKEN" = "AVAILABLE";
  if (isReserved) collisionReason = "RESERVED_SYSTEM_SLUG";
  else if (isTaken) collisionReason = "SLUG_ALREADY_TAKEN";

  // Generar alternativas inteligentes
  const altSuffixes =
    productType === "VET_LIFE"
      ? ["-vet", "-clinica", "-domicilio", "-pets"]
      : ["-services", "-pro", "-contractor", "-fix"];

  const suggestions = altSuffixes.map((suffix) => {
    const candidate = `${cleanBase}${suffix}`;
    const taken = domains.some((d) => d.normalized_slug === candidate);
    const reserved = RESERVED_SYSTEM_SLUGS.includes(candidate);
    return {
      slug: candidate,
      is_available: !taken && !reserved,
    };
  });

  return {
    base_slug: cleanBase,
    is_available: !isReserved && !isTaken,
    collision_reason: collisionReason,
    suggestions,
  };
}

/**
 * Tenant Routing Resolver: Resuelve el hostname entrante hacia la aplicación y contexto correctos
 */
export async function resolveTenantByHostname(hostname: string): Promise<HostnameResolutionResult> {
  const cleanHost = hostname.toLowerCase().trim();

  // Intentar resolver primero contra el RPC de Supabase si está disponible
  try {
    const { data, error } = await (supabase.rpc as any)("resolve_tenant_by_hostname", {
      p_hostname: cleanHost,
    });
    if (!error && data) {
      return data as HostnameResolutionResult;
    }
  } catch {
    // Si la conexión directa no responde, fallback determinista local
  }

  // 1. Casos de Sistema Reservados
  if (cleanHost === "admin.alphavisionm.com") {
    return {
      resolution_type: "PLATFORM_ADMIN",
      product_type: "PLATFORM_ADMIN",
      hostname: cleanHost,
      routing_status: "ACTIVE",
      target_route: "/admin",
    };
  }

  if (cleanHost === "alphavisionm.com" || cleanHost === "www.alphavisionm.com") {
    return {
      resolution_type: "PLATFORM_PUBLIC",
      product_type: "PLATFORM_PUBLIC",
      hostname: cleanHost,
      routing_status: "ACTIVE",
      target_route: "/",
    };
  }

  if (cleanHost === "vet.alphavisionm.com") {
    return {
      resolution_type: "VET_LIFE",
      product_type: "VET_LIFE",
      hostname: cleanHost,
      routing_status: "ACTIVE",
      target_route: "/vet",
    };
  }

  // 2. Búsqueda en platform_domains
  const domains = loadDomains();
  let dom = domains.find((d) => d.hostname === cleanHost);

  // Si no hay coincidencia exacta de hostname, extraer el subdominio si pertenece a alphavisionm.com
  if (!dom && cleanHost.endsWith(".alphavisionm.com")) {
    const sub = cleanHost.split(".")[0];
    dom = domains.find((d) => d.normalized_slug === sub);
  }

  // Fallback para desarrollo local (ej: localhost:3000 con parámetro de prueba o subdominio simulado)
  if (!dom && (cleanHost === "localhost" || cleanHost === "127.0.0.1")) {
    return {
      resolution_type: "PLATFORM_PUBLIC",
      hostname: cleanHost,
      routing_status: "ACTIVE",
      target_route: "/",
    };
  }

  if (!dom) {
    return {
      resolution_type: "NOT_FOUND",
      hostname: cleanHost,
      routing_status: "INACTIVE",
      target_route: "/no-encontrado",
      message: `El dominio ${cleanHost} no está registrado en el Control Plane de Alpha Vision.`,
    };
  }

  if (dom.routing_status === "SUSPENDED") {
    return {
      resolution_type: "SUSPENDED",
      product_type: dom.product_type,
      hostname: cleanHost,
      routing_status: "SUSPENDED",
      target_route: "/sin-acceso",
      message: "Esta cuenta se encuentra temporalmente suspendida por administración.",
    };
  }

  const tenants = loadTenants();
  const tenant = tenants.find((t) => t.id === dom!.tenant_id);

  return {
    resolution_type: dom.product_type,
    product_type: dom.product_type,
    hostname: dom.hostname,
    normalized_slug: dom.normalized_slug,
    tenant_id: tenant?.tenant_id,
    display_name: tenant?.display_name,
    account_status: tenant?.account_status,
    billing_status: tenant?.billing_status,
    routing_status: dom.routing_status,
    target_route: dom.product_type === "VET_LIFE" ? "/luis" : "/contractors",
  };
}

/**
 * Aprovisionador Maestro de Tenants y Subdominios (Idempotente)
 */
export async function provisionPlatformTenant(params: {
  legal_name: string;
  display_name: string;
  requested_slug: string;
  product_type: SaaSProductType;
  industry: string;
  exact_niche?: string;
  country?: string;
  currency?: string;
  plan_code?: string;
  plan_name?: string;
  plan_price_cop?: number;
  plan_price_usd?: number;
  owner_email?: string;
  idempotency_key?: string;
}): Promise<{
  success: boolean;
  tenant: PlatformTenant;
  domain: PlatformDomain;
  is_idempotent_replay: boolean;
}> {
  const cleanSlug = normalizeSubdomainSlug(params.requested_slug);
  const fullHostname = `${cleanSlug}.alphavisionm.com`;

  // Comprobar reserva dura de slug (a menos que sea 'luis' para Dr. Luis)
  if (RESERVED_SYSTEM_SLUGS.includes(cleanSlug) && (cleanSlug !== "luis" || params.product_type !== "VET_LIFE")) {
    throw new Error(`El subdominio '${cleanSlug}' es una palabra reservada del sistema Alpha Vision.`);
  }

  const tenants = loadTenants();
  const domains = loadDomains();

  // Comprobar idempotencia
  const existingTenant = tenants.find((t) => t.normalized_slug === cleanSlug);
  if (existingTenant) {
    const existingDomain = domains.find((d) => d.normalized_slug === cleanSlug)!;
    return {
      success: true,
      tenant: existingTenant,
      domain: existingDomain,
      is_idempotent_replay: true,
    };
  }

  const targetTenantUuid =
    cleanSlug === "luis" ? "11111111-1111-1111-1111-111111111111" : `ten-${Math.random().toString(36).substring(2, 10)}`;

  const now = new Date().toISOString();
  const trialEnd = new Date(Date.now() + 30 * 86400000).toISOString();

  const newTenant: PlatformTenant = {
    id: `pt-${Math.random().toString(36).substring(2, 9)}`,
    tenant_id: targetTenantUuid,
    legal_name: params.legal_name,
    display_name: params.display_name,
    normalized_slug: cleanSlug,
    product_type: params.product_type,
    industry: params.industry,
    exact_niche: params.exact_niche,
    country: params.country || "Colombia",
    currency: params.currency || (params.product_type === "VET_LIFE" ? "COP" : "USD"),
    time_zone: "America/Bogota",
    account_status: cleanSlug === "luis" ? "ACTIVE_PAID" : "TRIAL_ELIGIBLE",
    onboarding_status: cleanSlug === "luis" ? "COMPLETED" : "IN_PROGRESS",
    provisioning_status: "SUCCESS",
    billing_status: cleanSlug === "luis" ? "PAID" : "TRIAL",
    plan_code: params.plan_code || (params.product_type === "VET_LIFE" ? "TIER2_CLINICA" : "CONTRACTOR_GROWTH"),
    plan_name: params.plan_name || (params.product_type === "VET_LIFE" ? "Clínica Domiciliaria Pro" : "Growth Pro"),
    plan_price_cop: params.plan_price_cop || (params.product_type === "VET_LIFE" ? 389000 : undefined),
    plan_price_usd: params.plan_price_usd || (params.product_type === "CONTRACTOR_OS" ? 197 : undefined),
    hostname: fullHostname,
    ghl_contact_id: `ghl_cont_${cleanSlug}_${Date.now()}`,
    ghl_opportunity_id: `ghl_opp_${cleanSlug}_${Date.now()}`,
    ghl_pipeline_id: GHL_PIPELINES[params.product_type].pipeline_id,
    ghl_stage_name: cleanSlug === "luis" ? "CUSTOMER ACTIVE" : "TRIAL REQUESTED",
    trial_started_at: now,
    trial_ends_at: trialEnd,
    activation_date: cleanSlug === "luis" ? now : undefined,
    created_at: now,
    updated_at: now,
    metadata: {
      idempotency_key: params.idempotency_key,
      owner_email: params.owner_email,
    },
  };

  const newDomain: PlatformDomain = {
    id: `dom-${Math.random().toString(36).substring(2, 9)}`,
    tenant_id: newTenant.id,
    hostname: fullHostname,
    normalized_slug: cleanSlug,
    domain_type: "SUBDOMAIN",
    product_type: params.product_type,
    verification_status: "VERIFIED",
    routing_status: "ACTIVE",
    tls_status: "ACTIVE",
    primary_domain: true,
    reserved: cleanSlug === "luis",
    reserved_reason: cleanSlug === "luis" ? "Asignación protegida Dr. Luis Eduardo Ríos" : undefined,
    created_at: now,
    activated_at: now,
  };

  tenants.push(newTenant);
  domains.push(newDomain);

  saveTenants(tenants);
  saveDomains(domains);

  return {
    success: true,
    tenant: newTenant,
    domain: newDomain,
    is_idempotent_replay: false,
  };
}

/**
 * Transición formal de estado de cuenta (15 estados)
 */
export async function transitionTenantAccountStatus(
  platformTenantId: string,
  newStatus: PlatformAccountStatus,
  reason: string,
  operatorName = "La Dueña (Super Admin)"
): Promise<{ success: boolean; tenant: PlatformTenant }> {
  const tenants = loadTenants();
  const domains = loadDomains();

  const idx = tenants.findIndex((t) => t.id === platformTenantId);
  if (idx === -1) {
    throw new Error(`Tenant no encontrado con ID: ${platformTenantId}`);
  }

  const prev = tenants[idx]!;
  const now = new Date().toISOString();

  const updated: PlatformTenant = {
    ...prev,
    account_status: newStatus,
    updated_at: now,
    suspended_at: newStatus === "SUSPENDED" ? now : prev.suspended_at,
    cancellation_date: newStatus === "CANCELLED" ? now : prev.cancellation_date,
    activation_date:
      newStatus === "ACTIVE_PAID" || newStatus === "ACTIVE_TRIAL"
        ? prev.activation_date || now
        : prev.activation_date,
    metadata: {
      ...prev.metadata,
      last_transition: {
        from: prev.account_status,
        to: newStatus,
        reason,
        operator: operatorName,
        at: now,
      },
    },
  };

  // Sincronizar routing status del dominio correspondiente
  const domIdx = domains.findIndex((d) => d.tenant_id === platformTenantId);
  if (domIdx !== -1) {
    domains[domIdx] = {
      ...domains[domIdx]!,
      routing_status: newStatus === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
    };
    saveDomains(domains);
  }

  tenants[idx] = updated;
  saveTenants(tenants);

  return { success: true, tenant: updated };
}

/**
 * Retorna la lista global de tenants con filtros avanzados
 */
export function getPlatformTenants(filters?: {
  product_type?: SaaSProductType | "ALL";
  account_status?: PlatformAccountStatus | "ALL";
  searchQuery?: string;
}): PlatformTenant[] {
  let list = loadTenants();

  if (filters?.product_type && filters.product_type !== "ALL") {
    list = list.filter((t) => t.product_type === filters.product_type);
  }

  if (filters?.account_status && filters.account_status !== "ALL") {
    list = list.filter((t) => t.account_status === filters.account_status);
  }

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    list = list.filter(
      (t) =>
        t.display_name.toLowerCase().includes(q) ||
        t.legal_name.toLowerCase().includes(q) ||
        t.normalized_slug.toLowerCase().includes(q) ||
        t.hostname.toLowerCase().includes(q) ||
        t.industry.toLowerCase().includes(q)
    );
  }

  return list;
}

/**
 * Retorna todos los dominios y subdominios registrados
 */
export function getPlatformDomains(): PlatformDomain[] {
  return loadDomains();
}

/**
 * Simulación y sincronización comercial con GoHighLevel
 */
export function syncTenantToGhl(
  platformTenantId: string,
  targetStage: string
): { success: boolean; ghl_stage: string; synced_at: string } {
  const tenants = loadTenants();
  const idx = tenants.findIndex((t) => t.id === platformTenantId);
  if (idx === -1) throw new Error("Tenant not found");

  const now = new Date().toISOString();
  tenants[idx] = {
    ...tenants[idx]!,
    ghl_stage_name: targetStage,
    updated_at: now,
  };
  saveTenants(tenants);

  return {
    success: true,
    ghl_stage: targetStage,
    synced_at: now,
  };
}
