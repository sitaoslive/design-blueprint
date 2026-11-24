// tests/generate_core_03_ops.js
const fs = require('fs');

const operations = [];

// 1. Modificar Mock Outbound Request
operations.push({
  type: 'updateNodeParameters',
  nodeName: 'Mock Outbound Request',
  parameters: {
    mode: 'manual',
    assignments: {
      assignments: [
        { id: 'ob1', name: 'dispatch_request_id', value: 'req-outbound-test-001', type: 'string' },
        { id: 'ob2', name: 'recipient_phone', value: '+573105550199', type: 'string' },
        { id: 'ob3', name: 'recipient_name', value: 'Carolina Restrepo', type: 'string' },
        { id: 'ob4', name: 'organization_id', value: '11111111-1111-1111-1111-111111111111', type: 'string' },
        { id: 'ob5', name: 'conversation_id', value: 'c4444444-4444-4444-4444-444444444444', type: 'string' },
        { id: 'ob6', name: 'message_category', value: 'UTILITY', type: 'string' },
        { id: 'ob7', name: 'message_purpose', value: 'APPOINTMENT_CONFIRMED', type: 'string' },
        { id: 'ob8', name: 'has_consent', value: true, type: 'boolean' },
        { id: 'ob9', name: 'is_bereaved', value: false, type: 'boolean' },
        { id: 'ob10', name: 'is_within_24h_window', value: true, type: 'boolean' },
        { id: 'ob11', name: 'template_code', value: 'vet_appointment_confirmed', type: 'string' },
        { id: 'ob12', name: 'template_parameters', value: '{"owner_name":"Carolina","pet_name":"Toby","date":"2026-11-22","time_window":"3:30 PM","veterinarian_name":"Dr. Luis Ríos"}', type: 'object' },
        { id: 'ob13', name: 'freeform_text', value: 'Hola Carolina, confirmamos la cita médica de Toby para mañana a las 3:30 PM.', type: 'string' },
        { id: 'ob14', name: 'send_enabled', value: false, type: 'boolean' }
      ]
    }
  }
});

// 2. Actualizar Validate Outbound Compliance
operations.push({
  type: 'updateNodeParameters',
  nodeName: 'Validate Outbound Compliance',
  parameters: {
    language: 'javaScript',
    jsCode: `const raw = $input.first().json;
const input = (raw && raw.body && typeof raw.body === 'object' && Object.keys(raw.body).length > 0) ? raw.body : raw;
const violations = [];
let isPermitted = true;
let rejectionReason = null;

// 1. Consent Verification
if (input.has_consent !== true && input.consent !== true) {
  violations.push('No valid WhatsApp communication consent');
  isPermitted = false;
  rejectionReason = 'CONSENT_MISSING';
}

// 2. Bereavement Protocol Check
if (input.is_bereaved === true || input.bereavement_active === true) {
  violations.push('Client/Pet in bereavement protocol. Automated outbound suppressed.');
  isPermitted = false;
  rejectionReason = 'BEREAVEMENT_SUPPRESSION';
}

// 3. Marketing Opt-Out Check
if ((input.message_category || '').toUpperCase() === 'MARKETING' && input.marketing_opt_out === true) {
  violations.push('Client has opted out of marketing communications');
  isPermitted = false;
  rejectionReason = 'MARKETING_OPT_OUT_SUPPRESSION';
}

// 4. Stale AI Draft & Human Takeover Check
if (input.is_bot_locked === true || input.human_control_active === true) {
  if (input.sender_type === 'BOT' || input.author_type === 'BOT' || !input.sender_type) {
    violations.push('Human takeover active. Stale AI draft suppressed.');
    isPermitted = false;
    rejectionReason = 'AI_SUPPRESSED_HUMAN_CONTROL_ACTIVE';
  }
}

// 5. 24-hour Customer Service Window & Template Check
const isWithinWindow = Boolean(input.is_within_24h_window);
const templateCode = input.template_code || input.template_name || null;
if (!isWithinWindow && (!templateCode || templateCode.trim() === '')) {
  violations.push('Outside 24-hour service window requires an approved Meta HSM template');
  isPermitted = false;
  rejectionReason = 'TEMPLATE_REQUIRED_OUTSIDE_WINDOW';
}

return {
  json: {
    dispatch_request_id: input.dispatch_request_id || input.id || ('req-' + Date.now()),
    organization_id: input.organization_id || '11111111-1111-1111-1111-111111111111',
    conversation_id: input.conversation_id || null,
    recipient_phone: input.recipient_phone || '+573105550199',
    recipient_name: input.recipient_name || 'Tutor',
    sender_phone_number_id: input.sender_phone_number_id || '109876543210987',
    message_category: input.message_category || 'UTILITY',
    message_purpose: input.message_purpose || 'OPERATIONAL_COMMUNICATION',
    is_permitted: isPermitted,
    rejection_reason: rejectionReason,
    violations: violations,
    is_within_24h_window: isWithinWindow,
    template_code: templateCode,
    template_parameters: input.template_parameters || input.template_variables || {},
    freeform_text: input.freeform_text || null,
    send_enabled: Boolean(input.send_enabled),
    idempotency_key: input.idempotency_key || ('idemp-' + Date.now()),
    correlation_id: input.correlation_id || ('corr-' + Math.random().toString(36).substring(2, 9)),
    validated_at: new Date().toISOString()
  }
};`
  }
});

// 3. Eliminar conexiones antiguas de Simulate Provider Dispatch y Log Dispatch Blocked
operations.push({ type: 'removeConnection', source: 'Check If Dispatch Permitted', target: 'Simulate Provider Dispatch', sourceIndex: 0 });
operations.push({ type: 'removeConnection', source: 'Check If Dispatch Permitted', target: 'Log Dispatch Blocked', sourceIndex: 1 });

// 4. Eliminar nodos obsoletos
operations.push({ type: 'removeNode', nodeName: 'Simulate Provider Dispatch' });
operations.push({ type: 'removeNode', nodeName: 'Log Dispatch Blocked' });

// 5. Agregar nuevos nodos
// 5.1 Log Dispatch Blocked & Cancel
operations.push({
  type: 'addNode',
  node: {
    name: 'Log Dispatch Blocked & Cancel',
    type: 'n8n-nodes-base.set',
    typeVersion: 3.4,
    position: [980, 240],
    parameters: {
      mode: 'manual',
      assignments: {
        assignments: [
          { id: 'b1', name: 'dispatch_status', value: 'CANCELLED_OR_BLOCKED', type: 'string' },
          { id: 'b2', name: 'error_code', value: '={{ $json.rejection_reason }}', type: 'string' },
          { id: 'b3', name: 'violations', value: '={{ $json.violations }}', type: 'array' },
          { id: 'b4', name: 'contract_version', value: 'VET-WHATSAPP-OUTBOUND-v1.0', type: 'string' },
          { id: 'b5', name: 'processed_at', value: '={{ new Date().toISOString() }}', type: 'string' }
        ]
      },
      includeOtherFields: true
    }
  }
});

// 5.2 Check Safe Mode vs Live Dispatch
operations.push({
  type: 'addNode',
  node: {
    name: 'Check Safe Mode vs Live Dispatch',
    type: 'n8n-nodes-base.if',
    typeVersion: 2.2,
    position: [980, 0],
    parameters: {
      conditions: {
        options: { caseSensitive: true, leftValue: '', typeValidation: 'strict' },
        conditions: [
          { leftValue: '={{ $json.send_enabled }}', operator: { type: 'boolean', operation: 'equals' }, rightValue: true }
        ],
        combinator: 'and'
      }
    }
  }
});

// 5.3 Simulate Safe Provider Dispatch (Safe QA Sandbox)
operations.push({
  type: 'addNode',
  node: {
    name: 'Simulate Safe Provider Dispatch',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1260, -100],
    parameters: {
      language: 'javaScript',
      jsCode: `const item = $input.first().json;
const mockWamid = 'wamid.simulated.' + (item.dispatch_request_id || Date.now());

return {
  json: {
    ...item,
    http_status: 200,
    provider_status: 'PROVIDER_ACCEPTED',
    provider_message_id: mockWamid,
    raw_provider_response: {
      messaging_product: 'whatsapp',
      contacts: [{ input: item.recipient_phone, wa_id: item.recipient_phone.replace('+', '') }],
      messages: [{ id: mockWamid }]
    },
    safety_mode_note: 'Safe Mode Active: External send simulated with verified synthetic provider ID',
    dispatched_at: new Date().toISOString()
  }
};`
    }
  }
});

// 5.4 Submit to WhatsApp Business Cloud (Live)
operations.push({
  type: 'addNode',
  node: {
    name: 'Submit to WhatsApp Business Cloud',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1260, 100],
    parameters: {
      method: 'POST',
      url: '={{ "https://graph.facebook.com/v21.0/" + ($json.sender_phone_number_id || "109876543210987") + "/messages" }}',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Authorization', value: 'Bearer {{ $env.META_WABA_TOKEN || "mock_token" }}' },
          { name: 'Content-Type', value: 'application/json' }
        ]
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{ $json.is_within_24h_window && $json.freeform_text ? { messaging_product: "whatsapp", recipient_type: "individual", to: $json.recipient_phone, type: "text", text: { preview_url: false, body: $json.freeform_text } } : { messaging_product: "whatsapp", recipient_type: "individual", to: $json.recipient_phone, type: "template", template: { name: $json.template_code, language: { code: "es_CO" } } } }}',
      options: {
        response: { response: { neverError: true } }
      }
    }
  }
});

// 5.5 Delivery Status Webhook
operations.push({
  type: 'addNode',
  node: {
    name: 'Delivery Status Webhook',
    type: 'n8n-nodes-base.webhook',
    typeVersion: 2,
    position: [-200, 320],
    parameters: {
      httpMethod: 'POST',
      path: 'whatsapp/delivery-status',
      responseMode: 'onReceived'
    }
  }
});

// 5.6 Process Inbound Delivery Status Receipt
operations.push({
  type: 'addNode',
  node: {
    name: 'Process Inbound Delivery Status Receipt',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [220, 320],
    parameters: {
      language: 'javaScript',
      jsCode: `const raw = $input.first().json;
const body = (raw && raw.body && typeof raw.body === 'object') ? raw.body : raw;

let statuses = [];
if (body.entry && Array.isArray(body.entry) && body.entry.length > 0) {
  const changes = body.entry[0].changes || [];
  if (changes.length > 0 && changes[0].value && Array.isArray(changes[0].value.statuses)) {
    statuses = changes[0].value.statuses;
  }
} else if (body.statuses && Array.isArray(body.statuses)) {
  statuses = body.statuses;
} else if (body.provider_message_id && body.status) {
  statuses = [{ id: body.provider_message_id, status: body.status, timestamp: body.timestamp || Math.floor(Date.now() / 1000) }];
}

if (statuses.length === 0) {
  return {
    json: {
      is_receipt: false,
      note: 'No delivery statuses found in payload',
      raw_payload: body
    }
  };
}

const st = statuses[0];
const normalizedStatus = (st.status || 'unknown').toLowerCase();

return {
  json: {
    is_receipt: true,
    provider_message_id: st.id,
    recipient_id: st.recipient_id,
    raw_status: st.status,
    normalized_status: normalizedStatus,
    provider_timestamp: st.timestamp ? new Date(parseInt(st.timestamp) * 1000).toISOString() : new Date().toISOString(),
    error_details: st.errors ? st.errors[0] : null,
    contract_version: 'VET-WHATSAPP-DELIVERY-STATUS-v1.0',
    processed_at: new Date().toISOString()
  }
};`
    }
  }
});

// 5.7 Evaluate Provider Response & Uncertainty
operations.push({
  type: 'addNode',
  node: {
    name: 'Evaluate Provider Response & Uncertainty',
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position: [1540, 0],
    parameters: {
      language: 'javaScript',
      jsCode: `const item = $input.first().json;

let providerStatus = 'PROVIDER_ACCEPTED';
let isUncertain = false;
let httpStatus = item.http_status || 200;
let providerMsgId = item.provider_message_id;

if (httpStatus === 504 || httpStatus === 408) {
  providerStatus = 'RECONCILIATION_REQUIRED';
  isUncertain = true;
} else if (httpStatus >= 400) {
  providerStatus = 'FAILED';
} else if (!providerMsgId && item.messages && item.messages.length > 0) {
  providerMsgId = item.messages[0].id;
}

return {
  json: {
    contract_version: 'VET-WHATSAPP-OUTBOUND-v1.0',
    dispatch_request_id: item.dispatch_request_id,
    organization_id: item.organization_id,
    conversation_id: item.conversation_id,
    recipient_phone: item.recipient_phone,
    sender_phone_number_id: item.sender_phone_number_id,
    message_category: item.message_category,
    message_purpose: item.message_purpose,
    provider_status: providerStatus,
    is_uncertain: isUncertain,
    http_status: httpStatus,
    provider_message_id: providerMsgId,
    idempotency_key: item.idempotency_key,
    correlation_id: item.correlation_id,
    processed_at: new Date().toISOString()
  }
};`
    }
  }
});

// 5.8 Consolidate Delivery Event Contract
operations.push({
  type: 'addNode',
  node: {
    name: 'Consolidate Delivery Event Contract',
    type: 'n8n-nodes-base.set',
    typeVersion: 3.4,
    position: [520, 320],
    parameters: {
      mode: 'manual',
      assignments: {
        assignments: [
          { id: 'c1', name: 'contract_version', value: 'VET-WHATSAPP-DELIVERY-STATUS-v1.0', type: 'string' },
          { id: 'c2', name: 'reconciliation_event', value: 'whatsapp.delivery_status_received', type: 'string' },
          { id: 'c3', name: 'provider_message_id', value: '={{ $json.provider_message_id }}', type: 'string' },
          { id: 'c4', name: 'status', value: '={{ $json.normalized_status }}', type: 'string' },
          { id: 'c5', name: 'provider_timestamp', value: '={{ $json.provider_timestamp }}', type: 'string' },
          { id: 'c6', name: 'reconciled_at', value: '={{ new Date().toISOString() }}', type: 'string' }
        ]
      },
      includeOtherFields: true
    }
  }
});

// 6. Conexiones
// Check If Dispatch Permitted
operations.push({ type: 'addConnection', source: 'Check If Dispatch Permitted', target: 'Check Safe Mode vs Live Dispatch', sourceIndex: 0 });
operations.push({ type: 'addConnection', source: 'Check If Dispatch Permitted', target: 'Log Dispatch Blocked & Cancel', sourceIndex: 1 });

// Check Safe Mode vs Live Dispatch
operations.push({ type: 'addConnection', source: 'Check Safe Mode vs Live Dispatch', target: 'Submit to WhatsApp Business Cloud', sourceIndex: 0 }); // true: live
operations.push({ type: 'addConnection', source: 'Check Safe Mode vs Live Dispatch', target: 'Simulate Safe Provider Dispatch', sourceIndex: 1 }); // false: safe simulation

// Simulate -> Evaluate Response
operations.push({ type: 'addConnection', source: 'Simulate Safe Provider Dispatch', target: 'Evaluate Provider Response & Uncertainty', sourceIndex: 0 });
// Submit -> Evaluate Response
operations.push({ type: 'addConnection', source: 'Submit to WhatsApp Business Cloud', target: 'Evaluate Provider Response & Uncertainty', sourceIndex: 0 });

// Webhook Delivery -> Process Inbound Receipt -> Consolidate Delivery Event Contract
operations.push({ type: 'addConnection', source: 'Delivery Status Webhook', target: 'Process Inbound Delivery Status Receipt', sourceIndex: 0 });
operations.push({ type: 'addConnection', source: 'Process Inbound Delivery Status Receipt', target: 'Consolidate Delivery Event Contract', sourceIndex: 0 });

console.log('Total operations generated:', operations.length);
fs.writeFileSync('tests/core_03_ops.json', JSON.stringify(operations, null, 2), 'utf8');
