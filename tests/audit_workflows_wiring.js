const fs = require('fs');
const path = require('path');

const workflowsDir = path.join(__dirname, '../automation/n8n/workflows');
const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.json'));

console.log(`Auditing ${files.length} workflow files for start-to-end wiring...\n`);

let totalIssues = 0;
const report = [];

for (const file of files) {
  const filePath = path.join(workflowsDir, file);
  const wf = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const wfName = wf.name || file;
  const nodes = wf.nodes || [];
  const connections = wf.connections || {};
  
  const nodeNames = new Set(nodes.map(n => n.name));
  const nodeByName = new Map(nodes.map(n => [n.name, n]));
  
  // Track incoming connections
  const incoming = new Map();
  nodes.forEach(n => incoming.set(n.name, []));
  
  // Track outgoing connections
  const outgoing = new Map();
  nodes.forEach(n => outgoing.set(n.name, []));

  let brokenTargetCount = 0;
  const brokenTargets = [];

  // Inspect connections
  for (const [sourceName, outputs] of Object.entries(connections)) {
    if (!nodeNames.has(sourceName)) {
      brokenTargets.push(`Source node "${sourceName}" does not exist in nodes array`);
      brokenTargetCount++;
      continue;
    }
    for (const [connType, branches] of Object.entries(outputs)) {
      branches.forEach((branch, branchIndex) => {
        if (!Array.isArray(branch)) return;
        branch.forEach(target => {
          if (!target || !target.node) {
            brokenTargets.push(`Empty target in "${sourceName}" -> ${connType}[${branchIndex}]`);
            brokenTargetCount++;
            return;
          }
          if (!nodeNames.has(target.node)) {
            brokenTargets.push(`Target node "${target.node}" referenced by "${sourceName}" does not exist`);
            brokenTargetCount++;
          } else {
            incoming.get(target.node).push({ source: sourceName, type: connType, branchIndex });
            outgoing.get(sourceName).push({ target: target.node, type: connType, branchIndex });
          }
        });
      });
    }
  }

  // Find trigger / entry nodes
  const triggerNodes = nodes.filter(n => {
    const t = (n.type || '').toLowerCase();
    return t.includes('trigger') || t.includes('webhook') || incoming.get(n.name).length === 0;
  });

  // Calculate reachability from triggers using BFS
  const reachable = new Set();
  const queue = [];
  
  // Seed with actual triggers (nodes with type trigger/webhook or 0 incoming)
  for (const tNode of triggerNodes) {
    reachable.add(tNode.name);
    queue.push(tNode.name);
  }

  while (queue.length > 0) {
    const current = queue.shift();
    const outs = outgoing.get(current) || [];
    for (const edge of outs) {
      if (!reachable.has(edge.target)) {
        reachable.add(edge.target);
        queue.push(edge.target);
      }
    }
  }

  const unreachableNodes = nodes.filter(n => !reachable.has(n.name)).map(n => n.name);

  // Terminal nodes (nodes with 0 outgoing connections)
  const terminalNodes = nodes.filter(n => (outgoing.get(n.name) || []).length === 0).map(n => n.name);

  // Check branch completeness for conditional nodes (If / Switch / Filter)
  const branchIssues = [];
  for (const node of nodes) {
    const t = (node.type || '').toLowerCase();
    if (t.includes('if') || t.includes('filter')) {
      const connOutputs = connections[node.name];
      const mainConn = connOutputs && connOutputs.main;
      if (!mainConn || mainConn.length < 2 || !mainConn[0] || mainConn[0].length === 0 || !mainConn[1] || mainConn[1].length === 0) {
        // Check if one branch is unhandled
        const trueBranch = mainConn && mainConn[0] && mainConn[0].length > 0;
        const falseBranch = mainConn && mainConn[1] && mainConn[1].length > 0;
        branchIssues.push(`Conditional node "${node.name}" has unhandled branches (true: ${trueBranch}, false: ${falseBranch})`);
      }
    }
  }

  const status = {
    file,
    name: wfName,
    id: wf.id,
    nodeCount: nodes.length,
    triggers: triggerNodes.map(n => n.name),
    terminals: terminalNodes,
    brokenTargets,
    unreachableNodes,
    branchIssues,
    isFullyWired: brokenTargets.length === 0 && unreachableNodes.length === 0
  };

  report.push(status);
  if (!status.isFullyWired || brokenTargets.length > 0) {
    totalIssues += brokenTargets.length + unreachableNodes.length;
  }
}

console.log('--- RESUMEN DE AUDITORÍA DE CONECTIVIDAD ---');
report.forEach(r => {
  const icon = r.isFullyWired ? '✓' : '✗';
  console.log(`${icon} [${r.file}] ${r.name}`);
  console.log(`   Nodos: ${r.nodeCount} | Triggers: ${r.triggers.join(', ')} | Terminales: ${r.terminals.join(', ')}`);
  if (r.brokenTargets.length > 0) {
    console.log(`   ⚠️ Conexiones rotas:`, r.brokenTargets);
  }
  if (r.unreachableNodes.length > 0) {
    console.log(`   ⚠️ Nodos inalcanzables (huérfanos):`, r.unreachableNodes);
  }
  if (r.branchIssues.length > 0) {
    console.log(`   ℹ️ Ramas condicionales:`, r.branchIssues);
  }
});

console.log(`\nTotal fallas de conectividad encontradas: ${totalIssues}`);
