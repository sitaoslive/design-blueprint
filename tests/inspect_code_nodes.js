const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../automation/n8n/workflows');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const wf = JSON.parse(content);
  console.log(`\n=== ${f}: ${wf.name} ===`);
  const nodes = wf.nodes || [];
  for (const n of nodes) {
    if (n.type === 'n8n-nodes-base.code' && n.parameters && n.parameters.jsCode) {
      console.log(`[Code Node: ${n.name}]`);
      console.log(n.parameters.jsCode.slice(0, 250));
    }
  }
}
