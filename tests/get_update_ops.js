const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../automation/n8n/workflows');
const files = fs.readdirSync(dir).filter(f => f.startsWith('VET-CORE-') && f.endsWith('.json'));

const mapping = [];

for (const f of files) {
  const filePath = path.join(dir, f);
  const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const node of wf.nodes) {
    if (node.type === 'n8n-nodes-base.code' && node.parameters && node.parameters.jsCode) {
      mapping.push({
        file: f,
        id: wf.id,
        name: wf.name,
        nodeName: node.name,
        code: node.parameters.jsCode
      });
    }
  }
}

fs.writeFileSync(path.join(__dirname, 'code_nodes_manifest.json'), JSON.stringify(mapping, null, 2), 'utf8');
console.log(`Exported manifest with ${mapping.length} code nodes.`);
