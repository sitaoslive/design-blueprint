const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../automation/n8n/workflows');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

const webhookRegistry = new Map(); // path:method -> [workflowName, nodeName]
const collisions = [];

for (const f of files) {
  const content = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const wfName = content.name || f;
  const nodes = content.nodes || [];

  for (const node of nodes) {
    if (node.type === 'n8n-nodes-base.webhook') {
      const httpMethod = (node.parameters && node.parameters.httpMethod) || 'GET';
      const webhookPath = (node.parameters && node.parameters.path) || '';
      const key = `${httpMethod.toUpperCase()}:${webhookPath.toLowerCase().replace(/^\/+|\/+$/g, '')}`;

      if (webhookRegistry.has(key)) {
        collisions.push({
          key,
          first: webhookRegistry.get(key),
          second: { wfName, nodeName: node.name }
        });
      } else {
        webhookRegistry.set(key, { wfName, nodeName: node.name });
      }
    }
  }
}

console.log(`Audited ${webhookRegistry.size} unique webhook endpoints across ${files.length} workflows.\n`);
if (collisions.length === 0) {
  console.log('✓ ZERO WEBHOOK COLLISIONS FOUND! Every webhook path and method is strictly unique.');
} else {
  console.error(`✗ FOUND ${collisions.length} WEBHOOK COLLISIONS:`);
  for (const c of collisions) {
    console.error(`  - Collision on "${c.key}":\n      1) ${c.first.wfName} [${c.first.nodeName}]\n      2) ${c.second.wfName} [${c.second.nodeName}]`);
  }
}

console.log('\nList of registered webhook endpoints:');
for (const [key, val] of webhookRegistry.entries()) {
  console.log(`  - [${key}] -> ${val.wfName} (${val.nodeName})`);
}
