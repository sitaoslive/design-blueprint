// tests/build_core_02_operations.js
// Script to construct the update operations for VET-CORE-02 in n8n Cloud
// Workflow ID: aE0sFsDFsQiAXfNy

const fs = require('fs');

const workflowId = 'aE0sFsDFsQiAXfNy';

// 1. Existing nodes to remove or replace
const nodesToRemove = [
  'Normalize & Classify Inbound',
  'Check If Needs Human Escalation',
  'Route to Human Escalation Queue',
  'Route to AI Assistant Pipeline',
  'Mock Inbound WhatsApp Message'
];

const operations = [];

// Remove outdated connections first
operations.push({
  type: 'removeConnection',
  source: 'Manual Trigger',
  target: 'Mock Inbound WhatsApp Message',
  sourceIndex: 0,
  targetIndex: 0
});

operations.push({
  type: 'removeConnection',
  source: 'Webhook',
  target: 'Normalize & Classify Inbound',
  sourceIndex: 0,
  targetIndex: 0
});

operations.push({
  type: 'removeConnection',
  source: 'Mock Inbound WhatsApp Message',
  target: 'Normalize & Classify Inbound',
  sourceIndex: 0,
  targetIndex: 0
});

operations.push({
  type: 'removeConnection',
  source: 'Normalize & Classify Inbound',
  target: 'Check If Needs Human Escalation',
  sourceIndex: 0,
  targetIndex: 0
});

operations.push({
  type: 'removeConnection',
  source: 'Check If Needs Human Escalation',
  target: 'Route to Human Escalation Queue',
  sourceIndex: 0,
  targetIndex: 0
});

operations.push({
  type: 'removeConnection',
  source: 'Check If Needs Human Escalation',
  target: 'Route to AI Assistant Pipeline',
  sourceIndex: 1,
  targetIndex: 0
});

// Remove old nodes
for (const name of nodesToRemove) {
  operations.push({
    type: 'removeNode',
    nodeName: name
  });
}

// 2. Define new/enhanced nodes
// Node: Mock Inbound WhatsApp Message (Enhanced)
const mockInboundNode = {
  name: 'Mock Inbound WhatsApp Message',
  type: 'n8n-nodes-base.set',
  typeVersion: 3.4,
  position: [160, 96],
  parameters: {
    mode: 'manual',
    assignments: {
      assignments: [
        { id: 'w1', name: 'provider_message_id', value: 'wamid.HBgLMzg3MDU1NDk5MDYVAgASGBQzQjE2RDE0NDk2OTg5QTBBREQ5NAA=', type: 'string' },
        { id: 'w2', name: 'sender_phone', value: '+573105550199', type: 'string' },
        { id: 'w3', name: 'sender_name', value: 'Carolina Restrepo', type: 'string' },
        { id: 'w4', name: 'message_type', value: 'TEXT', type: 'string' },
        { id: 'w5', name: 'message_text', value: 'Hola, necesito agendar una cita a domicilio para mi perro Toby.', type: 'string' },
        { id: 'w6', name: 'is_bot_locked', value: false, type: 'boolean' },
        { id: 'w7', name: 'organization_id', value: '11111111-1111-1111-1111-111111111111', type: 'string' }
      ]
    }
  }
};

// Node: Normalize WhatsApp Inbound Payload (Code)
const normalizeCodeNode = {
  name: 'Normalize WhatsApp Inbound Payload',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [400, 96],
  parameters: {
    language: 'javaScript',
    jsCode: `
const raw = $input.first().json;
const body = (raw && raw.body && typeof raw.body === 'object' && Object.keys(raw.body).length > 0) ? raw.body : raw;

// Manejo de verificación de webhook de Meta (GET /hub.challenge)
if (raw.query && raw.query['hub.mode'] === 'subscribe' && raw.query['hub.challenge']) {
  return {
    json: {
      is_verification_challenge: true,
      challenge: raw.query['hub.challenge'],
      verify_token: raw.query['hub.verify_token'],
      status: 'CHALLENGE_ACCEPTED'
    }
  };
}

let providerMsgId = 'wamid-unknown';
let senderPhone = '';
let senderName = 'Propietario WhatsApp';
let messageType = 'TEXT';
let contentText = '';
let mediaUrl = null;
let locationData = null;
let interactiveData = null;
let isStatusReceipt = false;
let receiptStatus = null;
let isBotLocked = Boolean(body.is_bot_locked);
let orgId = body.organization_id || '11111111-1111-1111-1111-111111111111';

// 1. Formato crudo oficial de Meta WhatsApp Cloud API
if (body.entry && Array.isArray(body.entry) && body.entry.length > 0) {
  const entry0 = body.entry[0];
  if (entry0.changes && Array.isArray(entry0.changes) && entry0.changes.length > 0) {
    const val = entry0.changes[0].value || {};
    
    // Si es recibo de entrega (status update: sent, delivered, read)
    if (val.statuses && Array.isArray(val.statuses) && val.statuses.length > 0) {
      const st = val.statuses[0];
      isStatusReceipt = true;
      providerMsgId = st.id || 'wamid-status';
      senderPhone = st.recipient_id || '';
      receiptStatus = st.status || 'DELIVERED';
      messageType = 'STATUS_UPDATE';
    } 
    // Si es mensaje entrante
    else if (val.messages && Array.isArray(val.messages) && val.messages.length > 0) {
      const msg = val.messages[0];
      providerMsgId = msg.id || 'wamid-unknown';
      senderPhone = msg.from || '';
      
      // Contacto
      if (val.contacts && Array.isArray(val.contacts) && val.contacts.length > 0) {
        senderName = val.contacts[0].profile ? val.contacts[0].profile.name : senderName;
      }
      
      messageType = (msg.type || 'TEXT').toUpperCase();
      
      if (msg.type === 'text' && msg.text) {
        contentText = msg.text.body || '';
      } else if (msg.type === 'audio' && msg.audio) {
        messageType = 'AUDIO';
        mediaUrl = msg.audio.id || null;
        contentText = '[NOTA DE VOZ RECIBIDA]';
      } else if (msg.type === 'image' && msg.image) {
        messageType = 'IMAGE';
        mediaUrl = msg.image.id || null;
        contentText = msg.image.caption || '[IMAGEN RECIBIDA]';
      } else if (msg.type === 'document' && msg.document) {
        messageType = 'DOCUMENT';
        mediaUrl = msg.document.id || null;
        contentText = msg.document.filename || '[DOCUMENTO RECIBIDO]';
      } else if (msg.type === 'location' && msg.location) {
        messageType = 'LOCATION';
        locationData = msg.location;
        contentText = 'Ubicación: Lat ' + msg.location.latitude + ', Long ' + msg.location.longitude + (msg.location.address ? (' - ' + msg.location.address) : '');
      } else if (msg.type === 'interactive' && msg.interactive) {
        if (msg.interactive.type === 'button_reply') {
          messageType = 'INTERACTIVE_BUTTON';
          interactiveData = msg.interactive.button_reply;
          contentText = msg.interactive.button_reply.title || '';
        } else if (msg.interactive.type === 'list_reply') {
          messageType = 'INTERACTIVE_LIST';
          interactiveData = msg.interactive.list_reply;
          contentText = msg.interactive.list_reply.title || '';
        }
      }
    }
  }
} 
// 2. Formato normalizado directo / sintético
else {
  providerMsgId = body.provider_message_id || ('wamid.' + Date.now());
  senderPhone = body.sender_phone || '';
  senderName = body.sender_name || 'Propietario';
  messageType = (body.message_type || 'TEXT').toUpperCase();
  contentText = body.message_text || body.content_text || '';
  mediaUrl = body.media_url || null;
  locationData = body.location || null;
  interactiveData = body.interactive || null;
}

// Normalización E.164 Colombia (+57)
let cleanPhone = (senderPhone || '').replace(/[^0-9+]/g, '');
if (!cleanPhone.startsWith('+')) {
  if (cleanPhone.startsWith('57')) {
    cleanPhone = '+' + cleanPhone;
  } else {
    cleanPhone = '+57' + cleanPhone;
  }
}

return {
  json: {
    provider_message_id: providerMsgId,
    sender_phone: cleanPhone,
    sender_name: senderName,
    message_type: messageType,
    content_text: contentText,
    media_url: mediaUrl,
    location_data: locationData,
    interactive_data: interactiveData,
    is_status_receipt: isStatusReceipt,
    receipt_status: receiptStatus,
    is_bot_locked: isBotLocked,
    organization_id: orgId,
    raw_payload: body,
    ingested_at: new Date().toISOString()
  }
};
`
  }
};

// Node: Evaluate Triage & Inbound Routing (Code)
const evaluateTriageNode = {
  name: 'Evaluate Triage & Inbound Routing',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [640, 96],
  parameters: {
    language: 'javaScript',
    jsCode: `
const item = $input.first().json;

if (item.is_verification_challenge) {
  return {
    json: {
      ...item,
      routing_target: 'CHALLENGE_RESPONSE',
      overall_status: 'SUCCESS'
    }
  };
}

if (item.is_status_receipt) {
  return {
    json: {
      ...item,
      routing_target: 'STATUS_RECEIPT',
      overall_status: 'SUCCESS',
      priority: 'LOW'
    }
  };
}

const text = (item.content_text || '').toLowerCase().trim();
let intent = 'GENERAL_INQUIRY';
let triageLevel = 'ROUTINE';
let priority = 'MEDIUM';
let isEmergency = false;
let routingTarget = 'AI_ASSISTANT_PIPELINE';
let escalationReason = null;

// Detección de emergencias clínicas críticas
const emergencyRegex = /(urgente|emergencia|convulsio|intoxicad|envenen|sangre|hemorrag|atropellad|asfixi|no respira|dificultad para respirar|inconsciente|ahogando)/;

if (emergencyRegex.test(text)) {
  isEmergency = true;
  intent = 'EMERGENCY_TRIAGE';
  triageLevel = 'EMERGENCY_IMMEDIATE';
  priority = 'CRITICAL';
  routingTarget = 'CLINICAL_EMERGENCY_QUEUE';
  escalationReason = 'CLINICAL_EMERGENCY_DETECTED';
} else if (item.is_bot_locked) {
  routingTarget = 'HUMAN_SUPPORT_QUEUE';
  escalationReason = 'BOT_LOCKED_BY_AGENT';
  priority = 'HIGH';
} else if (text.includes('cita') || text.includes('agendar') || text.includes('consulta') || text.includes('domicilio') || text.includes('disponibilidad')) {
  intent = 'APPOINTMENT_REQUEST';
  triageLevel = 'SCHEDULE_REQUEST';
  priority = 'HIGH';
  routingTarget = 'AI_ASSISTANT_PIPELINE';
} else if (text.includes('cancelar') || text.includes('reprogramar') || text.includes('aplazar') || text.includes('cambiar fecha')) {
  intent = 'APPOINTMENT_MODIFICATION';
  triageLevel = 'MODIFICATION_REQUEST';
  priority = 'HIGH';
  routingTarget = 'HUMAN_SUPPORT_QUEUE';
  escalationReason = 'APPOINTMENT_MODIFICATION_REQUEST';
} else if (text.includes('pago') || text.includes('precio') || text.includes('tarifa') || text.includes('costo') || text.includes('nequi')) {
  intent = 'FINANCIAL_QUERY';
  triageLevel = 'BILLING';
  priority = 'MEDIUM';
  routingTarget = 'AI_ASSISTANT_PIPELINE';
} else if (text.includes('vacuna') || text.includes('desparasita') || text.includes('control') || text.includes('seguimiento')) {
  intent = 'PREVENTIVE_OR_FOLLOWUP';
  triageLevel = 'CLINICAL_FOLLOWUP';
  priority = 'MEDIUM';
  routingTarget = 'AI_ASSISTANT_PIPELINE';
}

return {
  json: {
    ...item,
    detected_intent: intent,
    triage_level: triageLevel,
    is_emergency: isEmergency,
    priority: priority,
    routing_target: routingTarget,
    escalation_reason: escalationReason,
    evaluated_at: new Date().toISOString()
  }
};
`
  }
};

// Node: Switch Inbound Action (Switch v3.2)
const switchNode = {
  name: 'Switch Inbound Action',
  type: 'n8n-nodes-base.switch',
  typeVersion: 3.2,
  position: [880, 96],
  parameters: {
    mode: 'rules',
    options: {
      fallbackOutput: 'extra'
    },
    rules: {
      values: [
        {
          conditions: {
            combinator: 'and',
            conditions: [
              {
                leftValue: '={{ $json.routing_target }}',
                operator: { operation: 'equals', type: 'string' },
                rightValue: 'CLINICAL_EMERGENCY_QUEUE'
              }
            ],
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' }
          }
        },
        {
          conditions: {
            combinator: 'and',
            conditions: [
              {
                leftValue: '={{ $json.routing_target }}',
                operator: { operation: 'equals', type: 'string' },
                rightValue: 'HUMAN_SUPPORT_QUEUE'
              }
            ],
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' }
          }
        },
        {
          conditions: {
            combinator: 'and',
            conditions: [
              {
                leftValue: '={{ $json.routing_target }}',
                operator: { operation: 'equals', type: 'string' },
                rightValue: 'AI_ASSISTANT_PIPELINE'
              }
            ],
            options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' }
          }
        }
      ]
    }
  }
};

// Node: Route to Clinical Emergency Queue (Set)
const routeEmergencyNode = {
  name: 'Route to Clinical Emergency Queue',
  type: 'n8n-nodes-base.set',
  typeVersion: 3.4,
  position: [1120, -96],
  parameters: {
    mode: 'manual',
    includeOtherFields: true,
    assignments: {
      assignments: [
        { id: 'em1', name: 'resolution_path', value: 'ROUTED_CLINICAL_EMERGENCY', type: 'string' },
        { id: 'em2', name: 'target_queue', value: 'EMERGENCY_DOCTOR_ON_CALL', type: 'string' },
        { id: 'em3', name: 'p0_emergency_alert', value: true, type: 'boolean' },
        { id: 'em4', name: 'assigned_role', value: 'DIRECTOR', type: 'string' },
        { id: 'em5', name: 'coordination_log', value: 'ALERTA CRÍTICA: Emergencia veterinaria detectada. Enrutado de inmediato al Dr. Luis Eduardo Ríos.', type: 'string' }
      ]
    }
  }
};

// Node: Route to Human Support Queue (Set)
const routeHumanNode = {
  name: 'Route to Human Support Queue',
  type: 'n8n-nodes-base.set',
  typeVersion: 3.4,
  position: [1120, 32],
  parameters: {
    mode: 'manual',
    includeOtherFields: true,
    assignments: {
      assignments: [
        { id: 'hm1', name: 'resolution_path', value: 'ROUTED_HUMAN_SUPPORT', type: 'string' },
        { id: 'hm2', name: 'target_queue', value: 'STAFF_AGENT_INBOX', type: 'string' },
        { id: 'hm3', name: 'assigned_role', value: 'RECEPTION', type: 'string' },
        { id: 'hm4', name: 'coordination_log', value: 'Conversación enrutada al buzón humano (bot bloqueado o solicitud de modificación de cita).', type: 'string' }
      ]
    }
  }
};

// Node: Route to AI Assistant Pipeline (Set)
const routeAINode = {
  name: 'Route to AI Assistant Pipeline',
  type: 'n8n-nodes-base.set',
  typeVersion: 3.4,
  position: [1120, 160],
  parameters: {
    mode: 'manual',
    includeOtherFields: true,
    assignments: {
      assignments: [
        { id: 'ai1', name: 'resolution_path', value: 'ROUTED_AI_ASSISTANT', type: 'string' },
        { id: 'ai2', name: 'target_queue', value: 'AI_AGENT_ORCHESTRATOR', type: 'string' },
        { id: 'ai3', name: 'assigned_role', value: 'AI_ASSISTANT', type: 'string' },
        { id: 'ai4', name: 'coordination_log', value: 'Mensaje rutinario clasificado para asistencia administrativa y gestión de citas con IA.', type: 'string' }
      ]
    }
  }
};

// Node: Process Status Receipt (Set)
const routeReceiptNode = {
  name: 'Process Status Receipt',
  type: 'n8n-nodes-base.set',
  typeVersion: 3.4,
  position: [1120, 288],
  parameters: {
    mode: 'manual',
    includeOtherFields: true,
    assignments: {
      assignments: [
        { id: 'rc1', name: 'resolution_path', value: 'STATUS_RECEIPT_PROCESSED', type: 'string' },
        { id: 'rc2', name: 'target_queue', value: 'DELIVERY_STATUS_TRACKER', type: 'string' },
        { id: 'rc3', name: 'coordination_log', value: 'Recibo de entrega de WhatsApp procesado y actualizado.', type: 'string' }
      ]
    }
  }
};

// Node: Consolidate WhatsApp Inbound Contract (Code)
const consolidateNode = {
  name: 'Consolidate WhatsApp Inbound Contract',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1400, 96],
  parameters: {
    language: 'javaScript',
    jsCode: `
const item = $input.first().json;

return {
  json: {
    contract_version: 'VET-WHATSAPP-INBOUND-v1.0',
    provider_message_id: item.provider_message_id,
    organization_id: item.organization_id || '11111111-1111-1111-1111-111111111111',
    sender_phone: item.sender_phone,
    sender_name: item.sender_name,
    message_type: item.message_type,
    content_text: item.content_text,
    media_url: item.media_url,
    location_data: item.location_data,
    interactive_data: item.interactive_data,
    detected_intent: item.detected_intent,
    triage_level: item.triage_level,
    priority: item.priority,
    routing_target: item.routing_target,
    resolution_path: item.resolution_path,
    is_bot_locked: item.is_bot_locked,
    is_emergency: item.is_emergency || false,
    p0_emergency_alert: item.p0_emergency_alert || false,
    assigned_role: item.assigned_role || 'AI_ASSISTANT',
    coordination_log: item.coordination_log,
    escalation_reason: item.escalation_reason,
    ingested_at: item.ingested_at || new Date().toISOString()
  }
};
`
  }
};

// Add nodes to operations
operations.push({ type: 'addNode', node: mockInboundNode });
operations.push({ type: 'addNode', node: normalizeCodeNode });
operations.push({ type: 'addNode', node: evaluateTriageNode });
operations.push({ type: 'addNode', node: switchNode });
operations.push({ type: 'addNode', node: routeEmergencyNode });
operations.push({ type: 'addNode', node: routeHumanNode });
operations.push({ type: 'addNode', node: routeAINode });
operations.push({ type: 'addNode', node: routeReceiptNode });
operations.push({ type: 'addNode', node: consolidateNode });

// Add connections
// Manual Trigger -> Mock Inbound WhatsApp Message
operations.push({
  type: 'addConnection',
  source: 'Manual Trigger',
  target: 'Mock Inbound WhatsApp Message',
  sourceIndex: 0,
  targetIndex: 0
});

// Mock Inbound WhatsApp Message -> Normalize WhatsApp Inbound Payload
operations.push({
  type: 'addConnection',
  source: 'Mock Inbound WhatsApp Message',
  target: 'Normalize WhatsApp Inbound Payload',
  sourceIndex: 0,
  targetIndex: 0
});

// Webhook -> Normalize WhatsApp Inbound Payload
operations.push({
  type: 'addConnection',
  source: 'Webhook',
  target: 'Normalize WhatsApp Inbound Payload',
  sourceIndex: 0,
  targetIndex: 0
});

// Normalize WhatsApp Inbound Payload -> Evaluate Triage & Inbound Routing
operations.push({
  type: 'addConnection',
  source: 'Normalize WhatsApp Inbound Payload',
  target: 'Evaluate Triage & Inbound Routing',
  sourceIndex: 0,
  targetIndex: 0
});

// Evaluate Triage & Inbound Routing -> Switch Inbound Action
operations.push({
  type: 'addConnection',
  source: 'Evaluate Triage & Inbound Routing',
  target: 'Switch Inbound Action',
  sourceIndex: 0,
  targetIndex: 0
});

// Switch Inbound Action outputs:
// Output 0 (Rule 0: CLINICAL_EMERGENCY_QUEUE) -> Route to Clinical Emergency Queue
operations.push({
  type: 'addConnection',
  source: 'Switch Inbound Action',
  target: 'Route to Clinical Emergency Queue',
  sourceIndex: 0,
  targetIndex: 0
});

// Output 1 (Rule 1: HUMAN_SUPPORT_QUEUE) -> Route to Human Support Queue
operations.push({
  type: 'addConnection',
  source: 'Switch Inbound Action',
  target: 'Route to Human Support Queue',
  sourceIndex: 1,
  targetIndex: 0
});

// Output 2 (Rule 2: AI_ASSISTANT_PIPELINE) -> Route to AI Assistant Pipeline
operations.push({
  type: 'addConnection',
  source: 'Switch Inbound Action',
  target: 'Route to AI Assistant Pipeline',
  sourceIndex: 2,
  targetIndex: 0
});

// Output 3 (Fallback: extra) -> Process Status Receipt
operations.push({
  type: 'addConnection',
  source: 'Switch Inbound Action',
  target: 'Process Status Receipt',
  sourceIndex: 3,
  targetIndex: 0
});

// Route nodes -> Consolidate WhatsApp Inbound Contract
operations.push({
  type: 'addConnection',
  source: 'Route to Clinical Emergency Queue',
  target: 'Consolidate WhatsApp Inbound Contract',
  sourceIndex: 0,
  targetIndex: 0
});

operations.push({
  type: 'addConnection',
  source: 'Route to Human Support Queue',
  target: 'Consolidate WhatsApp Inbound Contract',
  sourceIndex: 0,
  targetIndex: 0
});

operations.push({
  type: 'addConnection',
  source: 'Route to AI Assistant Pipeline',
  target: 'Consolidate WhatsApp Inbound Contract',
  sourceIndex: 0,
  targetIndex: 0
});

operations.push({
  type: 'addConnection',
  source: 'Process Status Receipt',
  target: 'Consolidate WhatsApp Inbound Contract',
  sourceIndex: 0,
  targetIndex: 0
});

fs.writeFileSync('tests/core_02_ops.json', JSON.stringify(operations, null, 2), 'utf8');
console.log(`Generated ${operations.length} operations for VET-CORE-02. Saved to tests/core_02_ops.json`);
