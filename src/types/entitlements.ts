/**
 * ALPHA VISION & VET FREEDOM OS — SAAS ENTITLEMENTS & LICENSING TYPES
 * Formalización estricta de tipos de producto, planes y motor de 5 condiciones.
 */

export type SaaSProductCode = "VET_LIFE" | "CONTRACTOR_OS";

export type SaaSPlanTierCode = "TIER1_SOLITARIO" | "TIER2_CLINICA" | "TIER3_RED";

export type LicenseType =
  | "TRIAL_30_DAYS"
  | "MONTHLY_PAID"
  | "ANNUAL_PAID"
  | "PROMOTIONAL"
  | "ENTERPRISE";

export type LicenseStatus =
  | "PENDING_ACTIVATION"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export type FeatureBlockedReason =
  | "NO_ACTIVE_LICENSE"
  | "FEATURE_NOT_IN_PLAN"
  | "ROLE_NOT_AUTHORIZED"
  | "FEATURE_UNDER_DEVELOPMENT"
  | "INTEGRATION_NOT_CONNECTED"
  | "QUOTA_LIMIT_EXCEEDED";

export type ConditionBlocker =
  | "COMMERCIAL_ENTITLEMENT"
  | "USER_ROLE"
  | "IMPLEMENTATION_READINESS"
  | "INTEGRATION_READINESS"
  | "USAGE_QUOTA";

export interface ConditionEvaluation {
  passed: boolean;
  details?: string;
  role?: string;
  status?: string;
  required?: string | null;
  connected?: boolean;
  used?: number;
  limit?: number | null;
}

export interface FeatureAccessEvaluation {
  allowed: boolean;
  organization_id: string;
  feature_id: string;
  feature_name?: string;
  plan_code?: string;
  plan_name?: string;
  license_type?: LicenseType;
  license_status?: LicenseStatus;
  license_expires_at?: string;
  blocked_by?: ConditionBlocker;
  reason?: FeatureBlockedReason;
  message?: string;
  upgrade_required?: boolean;
  is_addon_available?: boolean;
  addon_price_cop?: number;
  conditions?: {
    commercial_entitlement: ConditionEvaluation;
    role_authorization: ConditionEvaluation;
    implementation_readiness: ConditionEvaluation;
    integration_readiness: ConditionEvaluation;
    quota_availability: ConditionEvaluation;
  };
  evaluated_at: string;
}

export interface SaaSPlanEntitlement {
  id: string;
  plan_id: string;
  feature_id: string;
  feature_name: string;
  is_included: boolean;
  quota_limit: number | null;
  quota_unit: string;
  is_addon_available: boolean;
  addon_price_cop: number;
  required_role: string;
  required_integration: string | null;
  implementation_status: "VERIFIED_PRODUCTION" | "VERIFIED" | "SPECIFIED" | "PLANNED";
}

export interface TenantEntitlementsOverview {
  has_active_license: boolean;
  organization_id: string;
  plan_code: SaaSPlanTierCode;
  plan_name: string;
  license_type: LicenseType;
  starts_at: string;
  expires_at: string;
  trial_ends_at?: string | null;
  quotas: {
    whatsapp: { used: number; limit: number };
    voice: { used: number; limit: number };
    ai_copilot: { used: number; limit: number };
  };
  features: Array<{
    feature_id: string;
    feature_name: string;
    is_included: boolean;
    quota_limit: number | null;
    quota_unit: string;
    is_addon_available: boolean;
    addon_price_cop: number;
    implementation_status: string;
    evaluation: FeatureAccessEvaluation;
  }>;
}
