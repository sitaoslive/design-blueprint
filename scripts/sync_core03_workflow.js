const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/Freud/.gemini/antigravity/brain/2baa47be-9be0-4ce5-8b4c-86cc3f24b84c/.system_generated/steps/2963/output.txt';
const raw = fs.readFileSync(srcPath, 'utf8');
const data = JSON.parse(raw);
const wf = data.workflow;
const formatted = JSON.stringify(wf, null, 2);

const targets = [
  'automation/n8n/outbound/VET-CORE-03.json',
  'automation/n8n/core/VET-CORE-03.json',
  'automation/n8n/workflows/VET-CORE-03.json'
];

for (const target of targets) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(target, formatted, 'utf8');
  console.log(`Saved: ${target} (${formatted.length} bytes)`);
}
