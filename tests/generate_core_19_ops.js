const fs = require('fs');

const normalizeCode = `
const raw = $input.first().json;
let input = raw;
let sourceTrigger = 'webhook';

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
  input = raw.body;
}

const isInternalLoop = (input.source_workflow_id === 'uWO95CQ8twQDL9Gk' || (input.source_workflow_name && String(input.source_workflow_name).includes('CORE-19')));
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
} else if (msg.includes('duplicate') || msg.includes('already processed') || item.error_code === 'DUPLICATE_EVENT') {
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
  delaySeconds = 60 * Math.pow(2, Math.max(0, item.attempt_number - 1));
} else if (http === 500 || msg.includes('service unavailable')) {
  category = 'SERVICE_UNAVAILABLE';
  severity = 'P1';
  assignedRole = 'TECH_SUPPORT';
  retryEligible = true;
  delaySeconds = 60 * Math.pow(2, Math.max(0, item.attempt_number - 1));
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

const ops = [
  // 1. Rename existing nodes if needed, or add new ones
  {
    type: 'addNode',
    node: {
      name: 'Error Trigger',
      type: 'n8n-nodes-base.errorTrigger',
      typeVersion: 1,
      position: [-220, -100],
      parameters: {}
    }
  },
  {
    type: 'addNode',
    node: {
      name: 'Normalize Error Context',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [140, 100],
      parameters: {
        language: 'javaScript',
        jsCode: normalizeCode
      }
    }
  },
  {
    type: 'updateNodeParameters',
    nodeName: 'Classify Error & Policy',
    parameters: {
      language: 'javaScript',
      jsCode: classifyCode
    }
  },
  {
    type: 'setNodePosition',
    nodeName: 'Classify Error & Policy',
    position: [400, 100]
  },
  {
    type: 'addNode',
    node: {
      name: 'Switch Recovery Decision',
      type: 'n8n-nodes-base.switch',
      typeVersion: 3.2,
      position: [660, 100],
      parameters: {
        mode: 'rules',
        rules: {
          values: [
            {
              conditions: {
                options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
                conditions: [{ leftValue: '={{ $json.recovery_decision }}', operator: { type: 'string', operation: 'equals' }, rightValue: 'SAFE_RETRY' }],
                combinator: 'and'
              }
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
                conditions: [{ leftValue: '={{ $json.recovery_decision }}', operator: { type: 'string', operation: 'equals' }, rightValue: 'RECONCILE_FIRST' }],
                combinator: 'and'
              }
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
                conditions: [{ leftValue: '={{ $json.recovery_decision }}', operator: { type: 'string', operation: 'equals' }, rightValue: 'MANUAL_REVIEW' }],
                combinator: 'and'
              }
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
                conditions: [{ leftValue: '={{ $json.recovery_decision }}', operator: { type: 'string', operation: 'equals' }, rightValue: 'PERMANENT_FAILURE' }],
                combinator: 'and'
              }
            },
            {
              conditions: {
                options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
                conditions: [{ leftValue: '={{ $json.recovery_decision }}', operator: { type: 'string', operation: 'equals' }, rightValue: 'SECURITY_ESCALATION' }],
                combinator: 'and'
              }
            }
          ]
        },
        fallbackOutput: 'extra'
      }
    }
  },
  {
    type: 'addNode',
    node: {
      name: 'Create Reconciliation Task',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [980, 0],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 'r1', name: 'action', value: 'CREATE_RECONCILIATION_TASK', type: 'string' },
            { id: 'r2', name: 'status', value: 'WAITING_RECONCILIATION', type: 'string' },
            { id: 'r3', name: 'reconciliation_due_at', value: '={{ $now.plus({ minutes: 15 }).toISO() }}', type: 'string' }
          ]
        }
      }
    }
  },
  {
    type: 'addNode',
    node: {
      name: 'Escalate to Manual Review',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [980, 140],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 'm1', name: 'action', value: 'ESCALATE_TO_ROLE', type: 'string' },
            { id: 'm2', name: 'status', value: 'REQUIRES_HUMAN', type: 'string' },
            { id: 'm3', name: 'notification_target', value: '={{ $json.assigned_role }}', type: 'string' }
          ]
        }
      }
    }
  },
  {
    type: 'addNode',
    node: {
      name: 'Trigger Security Incident Alert',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [980, 420],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 's1', name: 'action', value: 'EMERGENCY_SECURITY_ALERT', type: 'string' },
            { id: 's2', name: 'status', value: 'REQUIRES_HUMAN', type: 'string' },
            { id: 's3', name: 'severity', value: 'P0', type: 'string' },
            { id: 's4', name: 'assigned_role', value: 'DIRECTOR', type: 'string' }
          ]
        }
      }
    }
  },
  {
    type: 'addNode',
    node: {
      name: 'Acknowledge No Action',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [980, 560],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 'n1', name: 'action', value: 'DISCARD_NO_ACTION', type: 'string' },
            { id: 'n2', name: 'status', value: 'DISCARDED_NO_ACTION', type: 'string' }
          ]
        }
      }
    }
  },
  {
    type: 'setNodePosition',
    nodeName: 'Schedule Retry Plan',
    position: [980, -140]
  },
  {
    type: 'setNodePosition',
    nodeName: 'Escalate to Dead Letter Queue',
    position: [980, 280]
  },
  {
    type: 'addNode',
    node: {
      name: 'Consolidate Incident Contract',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [1280, 100],
      parameters: {
        mode: 'manual',
        assignments: {
          assignments: [
            { id: 'c1', name: 'incident_id', value: '={{ $json.idempotency_key }}', type: 'string' },
            { id: 'c2', name: 'organization_id', value: '={{ $json.organization_id }}', type: 'string' },
            { id: 'c3', name: 'source_workflow_id', value: '={{ $json.source_workflow_id }}', type: 'string' },
            { id: 'c4', name: 'source_workflow_name', value: '={{ $json.source_workflow_name }}', type: 'string' },
            { id: 'c5', name: 'error_category', value: '={{ $json.error_category }}', type: 'string' },
            { id: 'c6', name: 'severity', value: '={{ $json.severity }}', type: 'string' },
            { id: 'c7', name: 'recovery_decision', value: '={{ $json.recovery_decision }}', type: 'string' },
            { id: 'c8', name: 'status', value: '={{ $json.status }}', type: 'string' },
            { id: 'c9', name: 'assigned_role', value: '={{ $json.assigned_role }}', type: 'string' },
            { id: 'c10', name: 'attempt_number', value: '={{ $json.attempt_number }}', type: 'number' },
            { id: 'c11', name: 'evaluated_at', value: '={{ $now.toISO() }}', type: 'string' }
          ]
        }
      }
    }
  },
  // Remove old connection from Webhook to Classify Error
  {
    type: 'removeConnection',
    source: 'Webhook',
    target: 'Classify Error & Policy'
  },
  // Remove old connection from Mock Error Input to Classify Error
  {
    type: 'removeConnection',
    source: 'Mock Error Input',
    target: 'Classify Error & Policy'
  },
  // Remove old Check If Retryable node
  {
    type: 'removeConnection',
    source: 'Classify Error & Policy',
    target: 'Check If Retryable'
  },
  {
    type: 'removeConnection',
    source: 'Check If Retryable',
    target: 'Schedule Retry Plan'
  },
  {
    type: 'removeConnection',
    source: 'Check If Retryable',
    target: 'Escalate to Dead Letter Queue'
  },
  {
    type: 'removeNode',
    nodeName: 'Check If Retryable'
  },
  // Add new connections: Error Trigger, Webhook, Mock -> Normalize Error Context
  {
    type: 'addConnection',
    source: 'Error Trigger',
    target: 'Normalize Error Context'
  },
  {
    type: 'addConnection',
    source: 'Webhook',
    target: 'Normalize Error Context'
  },
  {
    type: 'addConnection',
    source: 'Mock Error Input',
    target: 'Normalize Error Context'
  },
  // Normalize -> Classify -> Switch
  {
    type: 'addConnection',
    source: 'Normalize Error Context',
    target: 'Classify Error & Policy'
  },
  {
    type: 'addConnection',
    source: 'Classify Error & Policy',
    target: 'Switch Recovery Decision'
  },
  // Switch outputs:
  // Output 0 (SAFE_RETRY) -> Schedule Retry Plan
  {
    type: 'addConnection',
    source: 'Switch Recovery Decision',
    sourceIndex: 0,
    target: 'Schedule Retry Plan'
  },
  // Output 1 (RECONCILE_FIRST) -> Create Reconciliation Task
  {
    type: 'addConnection',
    source: 'Switch Recovery Decision',
    sourceIndex: 1,
    target: 'Create Reconciliation Task'
  },
  // Output 2 (MANUAL_REVIEW) -> Escalate to Manual Review
  {
    type: 'addConnection',
    source: 'Switch Recovery Decision',
    sourceIndex: 2,
    target: 'Escalate to Manual Review'
  },
  // Output 3 (PERMANENT_FAILURE) -> Escalate to Dead Letter Queue
  {
    type: 'addConnection',
    source: 'Switch Recovery Decision',
    sourceIndex: 3,
    target: 'Escalate to Dead Letter Queue'
  },
  // Output 4 (SECURITY_ESCALATION) -> Trigger Security Incident Alert
  {
    type: 'addConnection',
    source: 'Switch Recovery Decision',
    sourceIndex: 4,
    target: 'Trigger Security Incident Alert'
  },
  // Fallback Output 5 (extra) -> Acknowledge No Action
  {
    type: 'addConnection',
    source: 'Switch Recovery Decision',
    sourceIndex: 5,
    target: 'Acknowledge No Action'
  },
  // All 6 branches connect to Consolidate Incident Contract
  {
    type: 'addConnection',
    source: 'Schedule Retry Plan',
    target: 'Consolidate Incident Contract'
  },
  {
    type: 'addConnection',
    source: 'Create Reconciliation Task',
    target: 'Consolidate Incident Contract'
  },
  {
    type: 'addConnection',
    source: 'Escalate to Manual Review',
    target: 'Consolidate Incident Contract'
  },
  {
    type: 'addConnection',
    source: 'Escalate to Dead Letter Queue',
    target: 'Consolidate Incident Contract'
  },
  {
    type: 'addConnection',
    source: 'Trigger Security Incident Alert',
    target: 'Consolidate Incident Contract'
  },
  {
    type: 'addConnection',
    source: 'Acknowledge No Action',
    target: 'Consolidate Incident Contract'
  }
];

fs.writeFileSync('tests/core_19_ops.json', JSON.stringify(ops, null, 2), 'utf8');
console.log('Generated core_19_ops.json with', ops.length, 'operations.');
