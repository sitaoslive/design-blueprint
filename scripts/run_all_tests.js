const { execSync } = require('child_process');

const tests = [
  'tests/test_suite_complete.js',
  'tests/test_qa01_to_qa25.js',
  'tests/test_t01_to_t40.js',
  'tests/test_core_02_t01_to_t50.js',
  'tests/test_core_02_t01_to_t75.js',
  'tests/test_core_03_t01_to_t90.js',
  'tests/test_core_04_t01_to_t80.js',
  'tests/test_core_20_t01_to_t70.js',
  'tests/test_core_21_t01_to_t50.js',
  'tests/test_core_21_t01_to_t80.js',
  'tests/test_e2e_scenarios.js',
  'tests/test_business_state_and_security.js'
];

let totalPassedSuites = 0;
let totalFailedSuites = 0;

for (const t of tests) {
  try {
    const out = execSync(`node ${t}`, { stdio: 'pipe' }).toString();
    const lastLines = out.trim().split('\n').slice(-2).join(' | ').replace(/\r/g, '');
    console.log(`[PASS] ${t} -> ${lastLines}`);
    totalPassedSuites++;
  } catch (err) {
    console.error(`[FAIL] ${t}\n${err.stderr ? err.stderr.toString() : err.message}`);
    totalFailedSuites++;
  }
}

console.log(`\n========================================`);
console.log(`Suites Pasadas: ${totalPassedSuites} / ${tests.length}`);
console.log(`Suites Fallidas: ${totalFailedSuites}`);
console.log(`========================================`);
