const fs = require('fs');

const normalizeCode = `
const raw = $input.first().json;
let input = raw;
let sourceTrigger = 'webhook';

// Detect if input came from Error Trigger
if (raw && raw.execution && raw.execution.error) {
  sourceTrigger = 'error_trigger';
  const err = raw.execution.error;
  input = {
    error_message: err.message || 'Unhandled execution error',
    error_stack: err.stack || null,
    error_code: err.name || 'UNHANDLED_ERROR',
    source_workflow_id: raw.workflow ? raw.workflow.id : null,
    source_workflow_name: raw.workflow ? raw.workflow.name : 'Unknown Workflow',
    source_execution_id: raw.execution ? raw.execution.id : null,
    source_node: raw.execution ? raw.execution.lastNodeExecuted : null,
    retry_count: (raw.execution && raw.execution.retryOf) ? 1 : 0,
    organization_id: '11111111-1111-1111-1111-111111111111',
    environment: 'DEVELOPMENT'
  };
} else if (raw && raw.body && typeof raw.body === 'object' && Object.keys(raw.body).length > 0) {
  // Webhook body
  input = raw.body;
}

// Loop protection: Never allow VET-CORE-19 to trigger a recursive loop on itself
const isInternalLoop = (input.source_workflow_id === 'uWO95CQ8twQDL9Gk' || (input.source_workflow_name && input.source_workflow_name.includes('CORE-19')));

const attemptNumber = Number(input.retry_count || input.attempt_number || 1);
const maxAttempts = Number(input.max_retries || input.max_attempts || 5);
const orgId = input.organization_id || '11111111-1111-1111-1111-111111111111';
const idempKey = input.idempotency_key || ('err-' + (input.source_execution_id || Date.now()));

return {
  json: {
    source_trigger: sourceTrigger,
    is_internal_loop: isInternalLoop,
    organization_id: orgId,
    environment: input.environment || 'DEVELOPMENT',
    source_system: input.source_system || 'N8N',
    source_workflow_id: input.source_workflow_id || 'unknown',
    source_workflow_name: input.source_workflow_name || 'unknown',
    source_execution_id: input.source_execution_id || null,
    source_node: input.source_node || null,
    event_id: input.event_id || null,
    correlation_id: input.correlation_id || null,
    causation_id: input.causation_id || null,
    idempotency_key: idempKey,
    entity_type: input.entity_type || null,
    entity_id: input.entity_id || null,
    error_message: input.error_message || 'Error no especificado',
    error_code: input.error_code || null,
    http_status: input.http_status ? Number(input.http_status) : null,
    external_effect_status: input.external_effect_status || 'NOT_APPLIED',
    attempt_number: attemptNumber,
    max_attempts: maxAttempts,
    normalized_at: new Date().toISOString()
  }
};
`;

const classifyCode = `
const item = $input.first().json;
if (item.is_internal_loop) {
  return {
    json: {
      ...item,
      error_category: 'INTERNAL_SYSTEM_ERROR',
      severity: 'P0',
      assigned_role: 'TECH_SUPPORT',
      retry_eligibility: false,
      recovery_decision: 'NO_ACTION_REQUIRED',
      reason: 'Prevented recursive loop from CORE-19 error handler'
    }
  };
}

const msg = String(item.error_message || '').toLowerCase();
const http = item.http_status;
let category = 'INTERNAL_SYSTEM_ERROR';
let retryEligible = false;
let severity = 'P3';
let assignedRole = 'TECH_SUPPORT';
let delaySeconds = 60;
let recoveryDecision = 'PERMANENT_FAILURE';

// 1. Categorización de las 12 Clases Canónicas (A a L)
if (msg.includes('signature') || msg.includes('forged') || msg.includes('tamper') || msg.includes('unauthorized org') || msg.includes('cross-org')) {
  category = 'SECURITY_INCIDENT';
  severity = 'P0';
  assignedRole = 'DIRECTOR';
  retryEligible = false;
  recoveryDecision = 'SECURITY_ESCALATION';
} else if (msg.includes('clinical safety') || msg.includes('medical alert') || msg.includes('parvovirus') || msg.includes('vital emergency')) {
  category = 'CLINICAL_OR_OPERATIONAL_SAFETY';
  severity = 'P0';
  assignedRole = 'VETERINARIAN';
  retryEligible = false;
  recoveryDecision = 'MANUAL_REVIEW';
} else if (msg.includes('uncertain') || msg.includes('uncertain_timeout') || item.external_effect_status === 'UNCERTAIN') {
  category = 'UNKNOWN_EXTERNAL_RESULT';
  severity = 'P1';
  assignedRole = 'COORDINATOR';
  retryEligible = false;
  recoveryDecision = 'RECONCILE_FIRST';
} else if (msg.includes('duplicate') || msg.includes('already processed') || category === 'DUPLICATE_EVENT') {
  category = 'DUPLICATE_EVENT';
  severity = 'P3';
  assignedRole = 'TECH_SUPPORT';
  retryEligible = false;
  recoveryDecision = 'NO_ACTION_REQUIRED';
} else if (http === 429 || msg.includes('429') || msg.includes('rate limit')) {
  category = 'RATE_LIMIT';
  severity = 'P2';
  assignedRole = 'TECH_SUPPORT';
  retryEligible = true;
  delaySeconds = 120;
} else if (http === 502 || http === 503 || http === 504 || msg.includes('502') || msg.includes('503') || msg.includes('504') || msg.includes('etimedout') || msg.includes('econnreset') || msg.includes('timeout')) {
  category = 'TRANSIENT_NETWORK';
  severity = 'P2';
  assignedRole = 'TECH_SUPPORT';
  retryEligible = true;
  delaySeconds = 60 * Math.pow(2, item.attempt_number - 1);
} else if (http === 500 || msg.includes('service unavailable')) {
  category = 'SERVICE_UNAVAILABLE';
  severity = 'P1';
  assignedRole = 'TECH_SUPPORT';
  retryEligible = true;
  delaySeconds = 60 * Math.pow(2, item.attempt_number - 1);
} else if (http === 401 || msg.includes('401') || msg.includes('unauthenticated') || msg.includes('invalid token') || msg.includes('token expired')) {
  category = 'AUTHENTICATION_FAILURE';
  severity = 'P1';
  assignedRole = 'TECH_SUPPORT';
  retryEligible = false;
} else if (http === 403 || msg.includes('403') || msg.includes('forbidden') || msg.includes('permission denied')) {
  category = 'AUTHORIZATION_FAILURE';
  severity = 'P1';
  assignedRole = 'TECH_SUPPORT';
  retryEligible = false;
} else if (http === 409 || msg.includes('conflict') || msg.includes('capacity reached') || msg.includes('slot taken')) {
  category = 'BUSINESS_CONFLICT';
  severity = 'P2';
  assignedRole = 'COORDINATOR';
  retryEligible = false;
  recoveryDecision = 'MANUAL_REVIEW';
} else if (http === 400 || http === 422 || msg.includes('invalid') || msg.includes('schema') || msg.includes('validation')) {
  category = 'INVALID_PAYLOAD';
  severity = 'P3';
  assignedRole = 'TECH_SUPPORT';
  retryEligible = false;
}

// 2. Comprobación de límites de reintentos
if (retryEligible) {
  if (item.attempt_number >= item.max_attempts) {
    retryEligible = false;
    recoveryDecision = 'PERMANENT_FAILURE';
    category = 'INTERNAL_SYSTEM_ERROR';
    severity = 'P1';
  } else {
    recoveryDecision = 'SAFE_RETRY';
  }
}

return {
  json: {
    ...item,
    error_category: category,
    severity: severity,
    assigned_role: assignedRole,
    retry_eligibility: retryEligible,
    delay_seconds: delaySeconds,
    recovery_decision: recoveryDecision,
    classified_at: new Date().toISOString()
  }
};
`;

console.log('Normalize script length:', normalizeCode.length);
console.log('Classify script length:', classifyCode.length);
