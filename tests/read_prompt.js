const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/Freud/.gemini/antigravity/brain/2baa47be-9be0-4ce5-8b4c-86cc3f24b84c/.system_generated/logs/transcript_full.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (line.includes('"step_index":1596')) {
    try {
      const data = JSON.parse(line);
      const content = data.content || '';
      fs.writeFileSync('tests/prompt01_full_text.txt', content, 'utf8');
      console.log('Saved prompt01_full_text.txt, length:', content.length);
    } catch(e) {
      console.error(e);
    }
  }
});
