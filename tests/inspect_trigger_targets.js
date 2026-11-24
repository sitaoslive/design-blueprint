const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../automation/n8n/workflows');
const files = fs.readdirSync(dir).filter(f => f.startsWith('VET-CORE-') && f.endsWith('.json'));

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const wf = JSON.parse(content);
  
  const webhookConns = (wf.connections['Webhook'] && wf.connections['Webhook'].main) || [];
  const manualConns = (wf.connections['Manual Trigger'] && wf.connections['Manual Trigger'].main) || [];
  
  const webhookTargets = webhookConns.flatMap(b => b.map(t => t.node));
  const manualTargets = manualConns.flatMap(b => b.map(t => t.node));
  
  console.log(`${f}:`);
  console.log(`  Webhook targets: ${webhookTargets.join(', ')}`);
  console.log(`  Manual targets:  ${manualTargets.join(', ')}`);
}
