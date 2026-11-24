const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Freud/N8NVET/automation/n8n/workflows';

const mapping = {
  'VET-CORE-01.json': { path: 'vet-events/dispatch', target: 'Validate Event Contract' },
  'VET-CORE-02.json': { path: 'whatsapp/inbound', target: 'Normalize & Classify Inbound' },
  'VET-CORE-03.json': { path: 'whatsapp/outbound', target: 'Validate Outbound Compliance' },
  'VET-CORE-04.json': { path: 'conversations/escalate', target: 'Process Escalation & Lock Bot' },
  'VET-CORE-05.json': { path: 'appointments/notify', target: 'Process Appointment Notification' },
  'VET-CORE-06.json': { path: 'calendar/sync', target: 'Sanitize to BUSY_ONLY & Evaluate Conflict' },
  'VET-CORE-07.json': { path: 'reminders/trigger', target: 'Evaluate Operational Urgency' },
  'VET-CORE-08.json': { path: 'routes/notify', target: 'Process Route Event' },
  'VET-CORE-09.json': { path: 'recurring-care/notify', target: 'Evaluate Treatment Adherence' },
  'VET-CORE-10.json': { path: 'prevention/notify', target: 'Evaluate Preventive Eligibility' },
  'VET-CORE-11.json': { path: 'specialists/coordinate', target: 'Process Specialist Coordination' },
  'VET-CORE-12.json': { path: 'commitments/evaluate', target: 'Evaluate Commitment Timeline' },
  'VET-CORE-13.json': { path: 'documents/deliver', target: 'Validate Approval & Sign Document Link' },
  'VET-CORE-14.json': { path: 'finances/notify', target: 'Process Financial Notification' },
  'VET-CORE-15.json': { path: 'cx/survey', target: 'Process NPS & Triage Satisfaction' },
  'VET-CORE-16.json': { path: 'reports/daily', target: 'Compile Daily Executive Brief' },
  'VET-CORE-17.json': { path: 'reports/weekly', target: 'Process Weekly KPIs & Performance' },
  'VET-CORE-18.json': { path: 'reconciliation/trigger', target: 'Evaluate Audit Discrepancies' },
  'VET-CORE-19.json': { path: 'errors/handle', target: 'Classify Error & Policy' },
  'VET-CORE-20.json': { path: 'health/check', target: 'Evaluate System Health' },
  'VET-CORE-21.json': { path: 'maintenance/trigger', target: 'Evaluate Maintenance Status' },
  'VET-QA-001.json': { path: 'vet-qa-001', target: 'Prepare Test Payload' }
};

for (const [file, info] of Object.entries(mapping)) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // 1. Update settings
  wf.settings = wf.settings || {};
  wf.settings.timezone = 'America/Bogota';
  wf.settings.executionOrder = 'v1';
  wf.settings.availableInMCP = true;
  
  // 2. Ensure Webhook node exists
  const hasWebhook = wf.nodes.some(n => n.name === 'Webhook');
  if (!hasWebhook) {
    const webhookNode = {
      id: 'webhook-' + wf.id,
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [-200, 96],
      parameters: {
        httpMethod: 'POST',
        path: info.path,
        responseMode: 'onReceived'
      }
    };
    wf.nodes.push(webhookNode);
  }
  
  // 3. Ensure connection from Webhook to target exists
  wf.connections = wf.connections || {};
  wf.connections['Webhook'] = {
    main: [[{ node: info.target, type: 'main', index: 0 }]]
  };
  
  fs.writeFileSync(filePath, JSON.stringify(wf, null, 2));
  console.log('Synchronized:', file, '-> Webhook path:', info.path);
}
console.log('All 22 workflow files synchronized with Cloud state.');
