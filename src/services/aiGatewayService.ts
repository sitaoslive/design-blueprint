/**
 * ALPHA VISION METHOD — CENTRALIZED AI GATEWAY & COST METERING SERVICE (PARTE 10)
 * Standards: § 485 - 498, Versioned Claude Pricing, Atomic Quota Reservations,
 * Multi-Tenant Budget Policies, Reconciled Settlement, and Non-Destructive Graceful Fallbacks.
 */

export interface ModelPricing {
  model_id: string;
  display_name: string;
  version_tag: string;
  input_cost_per_million: number;       // USD per 1M tokens
  output_cost_per_million: number;      // USD per 1M tokens
  cache_write_cost_per_million: number; // USD per 1M tokens
  cache_read_cost_per_million: number;  // USD per 1M tokens
  currency: 'USD';
}

export const OFFICIAL_CLAUDE_PRICING: Record<string, ModelPricing> = {
  'claude-3-5-sonnet-20241022': {
    model_id: 'claude-3-5-sonnet-20241022',
    display_name: 'Claude 3.5 Sonnet',
    version_tag: 'v2024.1',
    input_cost_per_million: 3.00,
    output_cost_per_million: 15.00,
    cache_write_cost_per_million: 3.75,
    cache_read_cost_per_million: 0.30,
    currency: 'USD'
  },
  'claude-3-5-haiku-20241022': {
    model_id: 'claude-3-5-haiku-20241022',
    display_name: 'Claude 3.5 Haiku',
    version_tag: 'v2024.1',
    input_cost_per_million: 0.80,
    output_cost_per_million: 4.00,
    cache_write_cost_per_million: 1.00,
    cache_read_cost_per_million: 0.08,
    currency: 'USD'
  }
};

export interface AIBudgetPolicy {
  tenant_id: string;
  product_id: 'VET_LIFE' | 'CONTRACTOR_OS' | 'PLATFORM_CORE';
  monthly_budget_usd: number;
  soft_limit_percentage: number; // e.g. 80
  hard_limit_percentage: number; // e.g. 100
  current_spend_usd: number;
  reserved_spend_usd: number;
  is_paused: boolean;
}

export interface AIUsageReservation {
  reservation_id: string;
  tenant_id: string;
  user_id?: string | undefined;
  feature_id: string;
  model_id: string;
  estimated_cost_usd: number;
  status: 'RESERVED' | 'COMMITTED' | 'RELEASED' | 'EXPIRED';
  reserved_at: string;
  expires_at: string;
}

export interface AIUsageEvent {
  request_id: string;
  correlation_id: string;
  product_id: 'VET_LIFE' | 'CONTRACTOR_OS' | 'PLATFORM_CORE';
  tenant_id: string;
  user_id?: string | undefined;
  actor_type: 'OWNER' | 'WORKER' | 'CLIENT' | 'VET' | 'STAFF' | 'PLATFORM_ADMIN' | 'AUTOMATION' | 'SYSTEM';
  feature_id: string;
  agent_id?: string | undefined;
  model_id: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  estimated_cost_usd: number;
  reconciled_cost_usd: number;
  result_status: 'SUCCESS' | 'ERROR_TIMEOUT' | 'ERROR_RATE_LIMIT' | 'ERROR_PROVIDER' | 'CANCELLED';
  reservation_id?: string | undefined;
  created_at: string;
}

export interface AIUsageAlert {
  alert_id: string;
  tenant_id: string;
  user_id?: string | undefined;
  alert_type: 'BUDGET_SOFT_LIMIT' | 'BUDGET_EXHAUSTED' | 'ABNORMAL_SPIKE' | 'AGENT_LOOP_DETECTED' | 'USER_QUOTA_EXCEEDED';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'BLOCKING';
  threshold_percentage: number;
  message: string;
  created_at: string;
}

// -----------------------------------------------------------------------------
// LOCAL STATE STORAGE ENGINE (FOR AUDIT & SIMULATION)
// -----------------------------------------------------------------------------

const BUDGETS_STORAGE_KEY = 'alpha_vision_ai_budgets_v1';
const EVENTS_STORAGE_KEY = 'alpha_vision_ai_events_v1';
const ALERTS_STORAGE_KEY = 'alpha_vision_ai_alerts_v1';

function getStoredBudgets(): Record<string, AIBudgetPolicy> {
  try {
    const raw = localStorage.getItem(BUDGETS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredBudgets(budgets: Record<string, AIBudgetPolicy>) {
  try {
    localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save AI budgets', err);
  }
}

function getStoredEvents(): AIUsageEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function appendStoredEvent(event: AIUsageEvent) {
  try {
    const events = getStoredEvents();
    events.unshift(event); // newest first
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events.slice(0, 1000)));
  } catch (err) {
    console.error('Failed to append AI event', err);
  }
}

function getStoredAlerts(): AIUsageAlert[] {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function appendStoredAlert(alert: AIUsageAlert) {
  try {
    const alerts = getStoredAlerts();
    alerts.unshift(alert);
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts.slice(0, 200)));
  } catch (err) {
    console.error('Failed to append AI alert', err);
  }
}

// -----------------------------------------------------------------------------
// CORE MATHEMATICAL COST CALCULATOR (§ 488)
// -----------------------------------------------------------------------------

export function calculateClaudeCostUsd(
  modelId: string,
  usage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number | undefined;
    cacheReadTokens?: number | undefined;
  }
): number {
  const defaultPricing: ModelPricing = {
    model_id: 'claude-3-5-sonnet-20241022',
    display_name: 'Claude 3.5 Sonnet',
    version_tag: 'v2024.1',
    input_cost_per_million: 3.0,
    output_cost_per_million: 15.0,
    cache_write_cost_per_million: 3.75,
    cache_read_cost_per_million: 0.3,
    currency: 'USD',
  };
  const pricing = OFFICIAL_CLAUDE_PRICING[modelId] ?? defaultPricing;
  const inputTokens = usage.inputTokens || 0;
  const outputTokens = usage.outputTokens || 0;
  const cacheCreation = usage.cacheCreationTokens || 0;
  const cacheRead = usage.cacheReadTokens || 0;

  const cost =
    (inputTokens / 1_000_000) * pricing.input_cost_per_million +
    (outputTokens / 1_000_000) * pricing.output_cost_per_million +
    (cacheCreation / 1_000_000) * pricing.cache_write_cost_per_million +
    (cacheRead / 1_000_000) * pricing.cache_read_cost_per_million;

  return Number(cost.toFixed(6));
}

// -----------------------------------------------------------------------------
// ATOMIC QUOTA RESERVATION & RECONCILIATION (§ 493)
// -----------------------------------------------------------------------------

export function reserveAiQuota(params: {
  tenantId: string;
  userId?: string | undefined;
  featureId: string;
  modelId: string;
  estimatedCostUsd: number;
  productId?: 'VET_LIFE' | 'CONTRACTOR_OS' | 'PLATFORM_CORE' | undefined;
}): {
  allowed: boolean;
  reservation?: AIUsageReservation | undefined;
  error?: string | undefined;
  message?: string | undefined;
  softLimitWarning?: boolean | undefined;
} {
  const budgets = getStoredBudgets();
  let budget = budgets[params.tenantId];

  // Initialize seed budget if not existing
  if (!budget) {
    budget = {
      tenant_id: params.tenantId,
      product_id: params.productId || 'VET_LIFE',
      monthly_budget_usd: 50.00,
      soft_limit_percentage: 80,
      hard_limit_percentage: 100,
      current_spend_usd: 0.0000,
      reserved_spend_usd: 0.0000,
      is_paused: false
    };
    budgets[params.tenantId] = budget;
    saveStoredBudgets(budgets);
  }

  // 1. Check if paused
  if (budget.is_paused) {
    return {
      allowed: false,
      error: 'AI_PAUSED',
      message: 'El consumo de IA para esta organización ha sido pausado por la administración.'
    };
  }

  // 2. Check hard limit (100%)
  const totalCommittedAndReserved = budget.current_spend_usd + budget.reserved_spend_usd;
  if (totalCommittedAndReserved + params.estimatedCostUsd > budget.monthly_budget_usd) {
    // Fire blocking alert
    appendStoredAlert({
      alert_id: `alt_${Date.now()}`,
      tenant_id: params.tenantId,
      user_id: params.userId,
      alert_type: 'BUDGET_EXHAUSTED',
      severity: 'BLOCKING',
      threshold_percentage: 100,
      message: `Presupuesto mensual agotado ($${budget.monthly_budget_usd.toFixed(2)} USD). Nueva solicitud bloqueada sin afectar datos.`,
      created_at: new Date().toISOString()
    });

    return {
      allowed: false,
      error: 'QUOTA_EXCEEDED',
      message: 'Has alcanzado el límite de asistencia de IA de tu plan para este periodo. Puedes continuar operando sin IA.'
    };
  }

  // 3. Check soft limit warning (80%)
  const projectedPercentage = ((totalCommittedAndReserved + params.estimatedCostUsd) / budget.monthly_budget_usd) * 100;
  let softLimitWarning = false;
  if (projectedPercentage >= budget.soft_limit_percentage) {
    softLimitWarning = true;
    appendStoredAlert({
      alert_id: `alt_${Date.now()}`,
      tenant_id: params.tenantId,
      user_id: params.userId,
      alert_type: 'BUDGET_SOFT_LIMIT',
      severity: 'WARNING',
      threshold_percentage: Math.round(projectedPercentage),
      message: `Aviso preventivo: Has consumido el ${projectedPercentage.toFixed(1)}% del presupuesto mensual de IA.`,
      created_at: new Date().toISOString()
    });
  }

  // 4. Reserve budget atomically
  budget.reserved_spend_usd = Number((budget.reserved_spend_usd + params.estimatedCostUsd).toFixed(6));
  saveStoredBudgets(budgets);

  const reservation: AIUsageReservation = {
    reservation_id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tenant_id: params.tenantId,
    user_id: params.userId,
    feature_id: params.featureId,
    model_id: params.modelId,
    estimated_cost_usd: params.estimatedCostUsd,
    status: 'RESERVED',
    reserved_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  };

  return {
    allowed: true,
    reservation,
    softLimitWarning
  };
}

export function reconcileAiUsage(params: {
  reservation: AIUsageReservation;
  correlationId: string;
  productId: 'VET_LIFE' | 'CONTRACTOR_OS' | 'PLATFORM_CORE';
  actorType: 'OWNER' | 'WORKER' | 'CLIENT' | 'VET' | 'STAFF' | 'PLATFORM_ADMIN' | 'AUTOMATION' | 'SYSTEM';
  actualUsage: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens?: number | undefined;
    cacheReadTokens?: number | undefined;
  };
  resultStatus?: 'SUCCESS' | 'ERROR_TIMEOUT' | 'ERROR_RATE_LIMIT' | 'ERROR_PROVIDER' | 'CANCELLED' | undefined;
}): AIUsageEvent {
  const actualCost = calculateClaudeCostUsd(params.reservation.model_id, params.actualUsage);

  // Update budget policy
  const budgets = getStoredBudgets();
  const budget = budgets[params.reservation.tenant_id];
  if (budget) {
    budget.reserved_spend_usd = Math.max(0, Number((budget.reserved_spend_usd - params.reservation.estimated_cost_usd).toFixed(6)));
    budget.current_spend_usd = Number((budget.current_spend_usd + actualCost).toFixed(6));
    saveStoredBudgets(budgets);
  }

  // Create append-only event
  const event: AIUsageEvent = {
    request_id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    correlation_id: params.correlationId,
    product_id: params.productId,
    tenant_id: params.reservation.tenant_id,
    user_id: params.reservation.user_id,
    actor_type: params.actorType,
    feature_id: params.reservation.feature_id,
    model_id: params.reservation.model_id,
    input_tokens: params.actualUsage.inputTokens,
    output_tokens: params.actualUsage.outputTokens,
    cache_creation_tokens: params.actualUsage.cacheCreationTokens || 0,
    cache_read_tokens: params.actualUsage.cacheReadTokens || 0,
    estimated_cost_usd: params.reservation.estimated_cost_usd,
    reconciled_cost_usd: actualCost,
    result_status: params.resultStatus || 'SUCCESS',
    reservation_id: params.reservation.reservation_id,
    created_at: new Date().toISOString()
  };

  appendStoredEvent(event);
  return event;
}

export function getTenantBudget(tenantId: string): AIBudgetPolicy {
  const budgets = getStoredBudgets();
  return (
    budgets[tenantId] || {
      tenant_id: tenantId,
      product_id: 'VET_LIFE',
      monthly_budget_usd: 50.00,
      soft_limit_percentage: 80,
      hard_limit_percentage: 100,
      current_spend_usd: 0.0000,
      reserved_spend_usd: 0.0000,
      is_paused: false
    }
  );
}

export function updateTenantBudgetLimit(tenantId: string, newLimitUsd: number): AIBudgetPolicy {
  const budgets = getStoredBudgets();
  const current = getTenantBudget(tenantId);
  current.monthly_budget_usd = newLimitUsd;
  budgets[tenantId] = current;
  saveStoredBudgets(budgets);
  return current;
}

export function toggleTenantAiPause(tenantId: string, isPaused: boolean): AIBudgetPolicy {
  const budgets = getStoredBudgets();
  const current = getTenantBudget(tenantId);
  current.is_paused = isPaused;
  budgets[tenantId] = current;
  saveStoredBudgets(budgets);
  return current;
}

export function getRecentAiEvents(limit: number = 50): AIUsageEvent[] {
  return getStoredEvents().slice(0, limit);
}

export function getRecentAiAlerts(limit: number = 20): AIUsageAlert[] {
  return getStoredAlerts().slice(0, limit);
}
