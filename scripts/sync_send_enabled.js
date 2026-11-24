const fs = require('fs');
const files = [
  'automation/n8n/core/VET-CORE-05.json',
  'automation/n8n/workflows/VET-CORE-05.json',
  'automation/n8n/appointments/VET-CORE-05.json'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf-8');
    const target = "send_enabled: false\\n  },\\n  send_enabled: false,";
    const replacement = "send_enabled: (Boolean(input.send_enabled) || Boolean(process.env.WHATSAPP_SEND_ENABLED === 'true'))\\n  },\\n  send_enabled: (Boolean(input.send_enabled) || Boolean(process.env.WHATSAPP_SEND_ENABLED === 'true')),";
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(f, content, 'utf-8');
      console.log('Successfully updated', f);
    } else {
      console.log('Target not found in', f);
    }
  }
});
