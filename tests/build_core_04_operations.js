// tests/build_core_04_operations.js
const fs = require('fs');

const workflowDefinition = {
  name: 'VET-CORE-04 | Conversation Escalation',
  nodes: [
    {
      id: 'n-manual',
      name: 'Manual Trigger',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [0, 100],
      parameters: {}
    },
    {
      id: 'n-webhook',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [0, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'conversations/escalate',
        responseMode: 'onReceived'
      },
      webhookId: '9d1333dc-712f-4047-8f3b-ba1b3b19aa03'
    },
    {
      id: 'n-schedule',
      name: 'Schedule Trigger',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [0, -100],
      parameters: {
        rule: {
          interval: [{ field: 'minutes', minutesInterval: 5 }]
        }
      }
    },
    {
      id: 'n-mock',
      name: 'Mock Escalation Event',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [240, 100],
      parameters: {
        mode: 'manual',
        assignments: {
          assignments: [
            { id: 'e1', name: 'conversation_id', value: 'c4444444-4444-4444-4444-444444444444', type: 'string' },
            { id: 'e2', name: 'owner_name', value: 'Carolina Restrepo', type: 'string' },
            { id: 'e3', name: 'pet_name', value: 'Toby', type: 'string' },
            { id: 'e4', name: 'reason', value: 'CLIENT_REQUESTED_HUMAN', type: 'string' },
            { id: 'e5', name: 'raw_summary', value: 'Cliente solicita hablar con coordinador para verificar hora exacta de llegada.', type: 'string' },
            { id: 'e6', name: 'target_role', value: 'COORDINATOR', type: 'string' },
            { id: 'e7', name: 'target_team', value: 'COORDINACION', type: 'string' },
            { id: 'e8', name: 'priority', value: 'HIGH', type: 'string' },
            { id: 'e9', name: 'organization_id', value: '11111111-1111-1111-1111-111111111111', type: 'string' }
          ]
        }
      }
    },
    {
      id: 'n-validate',
      name: 'Validate Handoff Event & Auth',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [480, 200],
      parameters: {
        language: 'javaScript',
        jsCode: `const raw = $input.first().json;
const body = (raw && raw.body && typeof raw.body === 'object' && Object.keys(raw.body).length > 0) ? raw.body : raw;

// Manejo de pulso de Watchdog programado (Schedule Trigger)
if (raw.timestamp && !body.conversation_id) {
  return {
    json: {
      is_watchdog_pulse: true,
      action: 'EXPIRE_UNACCEPTED_HANDOFFS',
      organization_id: '11111111-1111-1111-1111-111111111111',
      pulse_at: new Date().toISOString()
    }
  };
}

const orgId = body.organization_id || '11111111-1111-1111-1111-111111111111';
const convId = body.conversation_id || 'c4444444-4444-4444-4444-444444444444';
const reason = body.reason || body.handoff_reason || 'CLIENT_REQUESTED_HUMAN';
const priority = (body.priority || 'STANDARD').toUpperCase();
const targetTeam = (body.target_team || body.team || 'RECEPCION').toUpperCase();
const targetRole = (body.target_role || body.role || 'RECEPTION').toUpperCase();
const rawSummary = body.raw_summary || body.summary || 'Solicitud de asistencia humana';

return {
  json: {
    is_watchdog_pulse: false,
    organization_id: orgId,
    conversation_id: convId,
    owner_name: body.owner_name || 'Carolina Restrepo',
    pet_name: body.pet_name || 'Toby',
    handoff_reason: reason,
    priority: priority,
    target_team: targetTeam,
    target_role: targetRole,
    raw_summary: rawSummary,
    client_phone: body.client_phone || '+573105550199',
    idempotency_key: body.idempotency_key || ('handoff-' + Date.now()),
    correlation_id: body.correlation_id || ('corr-' + Math.random().toString(36).substring(2, 9)),
    validated_at: new Date().toISOString()
  }
};`
      }
    },
    {
      id: 'n-eval-team',
      name: 'Evaluate Team & Enforce Bot Lock',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [720, 200],
      parameters: {
        language: 'javaScript',
        jsCode: `const item = $input.first().json;

if (item.is_watchdog_pulse) {
  return {
    json: {
      ...item,
      routing_target: 'WATCHDOG_RECONCILIATION',
      priority: 'LOW'
    }
  };
}

const reason = item.handoff_reason || '';
let team = item.target_team || 'RECEPCION';
let role = item.target_role || 'RECEPTION';
let priority = item.priority || 'STANDARD';
let slaMinutes = 30;

// Reglas deterministas de enrutamiento por equipo
if (reason.includes('EMERGENCY') || priority === 'CRITICAL' || (item.raw_summary || '').toLowerCase().includes('respiratoria') || (item.raw_summary || '').toLowerCase().includes('convulsio')) {
  team = 'DIRECTOR';
  role = 'DIRECTOR';
  priority = 'CRITICAL';
  slaMinutes = 5;
} else if (reason.includes('CLINICAL') || reason.includes('DOSAGE') || reason.includes('DIAGNOSIS') || reason.includes('DRUG')) {
  team = 'VET';
  role = 'VETERINARIAN';
  priority = 'HIGH';
  slaMinutes = 15;
} else if (reason.includes('COMPLAINT') || reason.includes('BEREAVEMENT') || reason.includes('DUELO') || reason.includes('QUEJA')) {
  team = 'DIRECTOR';
  role = 'DIRECTOR';
  priority = 'HIGH';
  slaMinutes = 15;
} else if (reason.includes('BOOKING') || reason.includes('SCHEDULE') || reason.includes('CANCEL') || reason.includes('RESCHEDULE') || reason.includes('AGENDA')) {
  team = 'COORDINACION';
  role = 'COORDINATOR';
  priority = 'HIGH';
  slaMinutes = 15;
} else if (reason.includes('PAYMENT') || reason.includes('FINANCIAL') || reason.includes('INVOICE') || reason.includes('PAGO')) {
  team = 'FINANZAS';
  role = 'FINANCE';
  priority = 'MEDIUM';
  slaMinutes = 30;
} else if (reason.includes('SYSTEM') || reason.includes('SECURITY') || reason.includes('TECH')) {
  team = 'SOPORTE';
  role = 'TECH_SUPPORT';
  priority = 'HIGH';
  slaMinutes = 15;
}

const deadline = new Date(Date.now() + slaMinutes * 60000).toISOString();

return {
  json: {
    ...item,
    resolved_team: team,
    resolved_role: role,
    resolved_priority: priority,
    sla_minutes: slaMinutes,
    escalation_deadline_at: deadline,
    is_bot_locked: true,
    bot_suppressed: true,
    evaluated_at: new Date().toISOString()
  }
};`
      }
    },
    {
      id: 'n-switch',
      name: 'Switch Escalation Target Team',
      type: 'n8n-nodes-base.switch',
      typeVersion: 3.2,
      position: [960, 200],
      parameters: {
        dataType: 'string',
        value1: '={{ $json.resolved_team }}',
        rules: {
          rules: [
            { value2: 'DIRECTOR', outputKey: 'DIRECTOR' },
            { value2: 'VET', outputKey: 'VET' },
            { value2: 'COORDINACION', outputKey: 'COORDINACION' },
            { value2: 'FINANZAS', outputKey: 'FINANZAS' },
            { value2: 'SOPORTE', outputKey: 'SOPORTE' }
          ]
        },
        fallbackOutput: 'extraPath'
      }
    },
    {
      id: 'n-route-director',
      name: 'Route to Clinical Director Queue',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [1240, -40],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 'd1', name: 'assigned_queue', value: 'DIRECTOR_MEDICAL_EMERGENCY_QUEUE', type: 'string' },
            { id: 'd2', name: 'assigned_agent_name', value: 'Dr. Luis Eduardo Ríos', type: 'string' },
            { id: 'd3', name: 'assigned_agent_id', value: 'd1111111-1111-1111-1111-111111111111', type: 'string' },
            { id: 'd4', name: 'notification_channel', value: 'SMS_DIRECTOR_AND_UI_MODAL', type: 'string' }
          ]
        }
      }
    },
    {
      id: 'n-route-vet',
      name: 'Route to Veterinary Specialist Queue',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [1240, 80],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 'v1', name: 'assigned_queue', value: 'VET_CLINICAL_ENLACE_QUEUE', type: 'string' },
            { id: 'v2', name: 'assigned_agent_name', value: 'Dra. Camila Torres', type: 'string' },
            { id: 'v3', name: 'assigned_agent_id', value: 'd2222222-2222-2222-2222-222222222222', type: 'string' },
            { id: 'v4', name: 'notification_channel', value: 'LOVABLE_CLINICAL_INBOX', type: 'string' }
          ]
        }
      }
    },
    {
      id: 'n-route-coord',
      name: 'Route to Operations Coordinator Queue',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [1240, 200],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 'c1', name: 'assigned_queue', value: 'COORDINATION_DISPATCH_QUEUE', type: 'string' },
            { id: 'c2', name: 'assigned_agent_name', value: 'Andrés Salcedo', type: 'string' },
            { id: 'c3', name: 'assigned_agent_id', value: 'd3333333-3333-3333-3333-333333333333', type: 'string' },
            { id: 'c4', name: 'notification_channel', value: 'LOVABLE_COORDINATION_INBOX', type: 'string' }
          ]
        }
      }
    },
    {
      id: 'n-route-fin',
      name: 'Route to Finance Department Queue',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [1240, 320],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 'f1', name: 'assigned_queue', value: 'FINANCE_BILLING_QUEUE', type: 'string' },
            { id: 'f2', name: 'assigned_agent_name', value: 'Paola Méndez', type: 'string' },
            { id: 'f3', name: 'assigned_agent_id', value: 'd5555555-5555-5555-5555-555555555555', type: 'string' },
            { id: 'f4', name: 'notification_channel', value: 'LOVABLE_FINANCE_INBOX', type: 'string' }
          ]
        }
      }
    },
    {
      id: 'n-route-tech',
      name: 'Route to Technical Support Queue',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [1240, 440],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 't1', name: 'assigned_queue', value: 'TECH_SUPPORT_SRE_QUEUE', type: 'string' },
            { id: 't2', name: 'assigned_agent_name', value: 'Soporte Alpha Vision', type: 'string' },
            { id: 't3', name: 'assigned_agent_id', value: 'd1111111-1111-1111-1111-111111111111', type: 'string' },
            { id: 't4', name: 'notification_channel', value: 'TELEMETRY_ALERT', type: 'string' }
          ]
        }
      }
    },
    {
      id: 'n-route-rec',
      name: 'Route to General Reception Queue',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [1240, 560],
      parameters: {
        mode: 'manual',
        includeOtherFields: true,
        assignments: {
          assignments: [
            { id: 'r1', name: 'assigned_queue', value: 'RECEPTION_GENERAL_INBOX', type: 'string' },
            { id: 'r2', name: 'assigned_agent_name', value: 'Valentina Gómez', type: 'string' },
            { id: 'r3', name: 'assigned_agent_id', value: 'd4444444-4444-4444-4444-444444444444', type: 'string' },
            { id: 'r4', name: 'notification_channel', value: 'LOVABLE_RECEPTION_INBOX', type: 'string' }
          ]
        }
      }
    },
    {
      id: 'n-consolidate',
      name: 'Consolidate Escalation Contract',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1540, 200],
      parameters: {
        language: 'javaScript',
        jsCode: `const item = $input.first().json;

return {
  json: {
    contract_version: 'VET-CONVERSATION-ESCALATION-v1.0',
    escalation_status: 'HANDOFF_PENDING_ASSIGNMENT',
    conversation_id: item.conversation_id,
    organization_id: item.organization_id,
    customer_name: item.owner_name,
    patient_name: item.pet_name,
    assigned_team: item.resolved_team,
    assigned_role: item.resolved_role,
    assigned_agent_name: item.assigned_agent_name,
    assigned_agent_id: item.assigned_agent_id,
    assigned_queue: item.assigned_queue,
    notification_channel: item.notification_channel,
    priority: item.resolved_priority,
    sla_minutes: item.sla_minutes,
    escalation_deadline_at: item.escalation_deadline_at,
    is_bot_locked: true,
    bot_suppressed: true,
    sanitized_summary: item.raw_summary,
    processed_at: new Date().toISOString()
  }
};`
      }
    }
  ],
  connections: {
    'Manual Trigger': {
      main: [[{ node: 'Mock Escalation Event', type: 'main', index: 0 }]]
    },
    'Webhook': {
      main: [[{ node: 'Validate Handoff Event & Auth', type: 'main', index: 0 }]]
    },
    'Schedule Trigger': {
      main: [[{ node: 'Validate Handoff Event & Auth', type: 'main', index: 0 }]]
    },
    'Mock Escalation Event': {
      main: [[{ node: 'Validate Handoff Event & Auth', type: 'main', index: 0 }]]
    },
    'Validate Handoff Event & Auth': {
      main: [[{ node: 'Evaluate Team & Enforce Bot Lock', type: 'main', index: 0 }]]
    },
    'Evaluate Team & Enforce Bot Lock': {
      main: [[{ node: 'Switch Escalation Target Team', type: 'main', index: 0 }]]
    },
    'Switch Escalation Target Team': {
      main: [
        [{ node: 'Route to Clinical Director Queue', type: 'main', index: 0 }],
        [{ node: 'Route to Veterinary Specialist Queue', type: 'main', index: 0 }],
        [{ node: 'Route to Operations Coordinator Queue', type: 'main', index: 0 }],
        [{ node: 'Route to Finance Department Queue', type: 'main', index: 0 }],
        [{ node: 'Route to Technical Support Queue', type: 'main', index: 0 }],
        [{ node: 'Route to General Reception Queue', type: 'main', index: 0 }]
      ]
    },
    'Route to Clinical Director Queue': {
      main: [[{ node: 'Consolidate Escalation Contract', type: 'main', index: 0 }]]
    },
    'Route to Veterinary Specialist Queue': {
      main: [[{ node: 'Consolidate Escalation Contract', type: 'main', index: 0 }]]
    },
    'Route to Operations Coordinator Queue': {
      main: [[{ node: 'Consolidate Escalation Contract', type: 'main', index: 0 }]]
    },
    'Route to Finance Department Queue': {
      main: [[{ node: 'Consolidate Escalation Contract', type: 'main', index: 0 }]]
    },
    'Route to Technical Support Queue': {
      main: [[{ node: 'Consolidate Escalation Contract', type: 'main', index: 0 }]]
    },
    'Route to General Reception Queue': {
      main: [[{ node: 'Consolidate Escalation Contract', type: 'main', index: 0 }]]
    }
  }
};

fs.writeFileSync('tests/core_04_full_payload.json', JSON.stringify(workflowDefinition, null, 2), 'utf8');
console.log('Saved tests/core_04_full_payload.json, node count:', workflowDefinition.nodes.length);
