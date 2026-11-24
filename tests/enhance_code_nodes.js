const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../automation/n8n/workflows');
const files = fs.readdirSync(dir).filter(f => f.startsWith('VET-CORE-') && f.endsWith('.json'));

let updatedCount = 0;

for (const f of files) {
  const filePath = path.join(dir, f);
  const content = fs.readFileSync(filePath, 'utf8');
  const wf = JSON.parse(content);
  
  let modified = false;
  for (const node of wf.nodes) {
    if (node.type === 'n8n-nodes-base.code' && node.parameters && node.parameters.jsCode) {
      let code = node.parameters.jsCode;
      if (code.startsWith('const input = $input.first().json;')) {
        const replacement = 'const raw = $input.first().json;\nconst input = (raw && raw.body && typeof raw.body === \'object\' && Object.keys(raw.body).length > 0) ? raw.body : raw;';
        node.parameters.jsCode = code.replace('const input = $input.first().json;', replacement);
        modified = true;
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(wf, null, 2), 'utf8');
    updatedCount++;
    console.log(`Updated ${f}`);
  }
}

console.log(`\nTotal workflows updated locally: ${updatedCount}`);
