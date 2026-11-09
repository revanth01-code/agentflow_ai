async function plannerAgent({ workflow }) {
  const nodes = workflow?.nodes || [];
  const edges = workflow?.edges || [];

  if (nodes.length === 0) {
    return { agent: 'planner', decision: 'No nodes in workflow', path: [], confidence: 0 };
  }

  const inDegree = {};
  const adj = {};
  nodes.forEach((n) => {
    inDegree[n.id] = 0;
    adj[n.id] = [];
  });

  edges.forEach((e) => {
    const src = typeof e.source === 'object' ? e.source?.id : e.source;
    const tgt = typeof e.target === 'object' ? e.target?.id : e.target;
    if (adj[src] && inDegree[tgt] !== undefined) {
      adj[src].push(tgt);
      inDegree[tgt] = (inDegree[tgt] || 0) + 1;
    }
  });

  const queue = nodes
    .filter((n) => inDegree[n.id] === 0)
    .sort((a, b) => (a.position?.x || 0) - (b.position?.x || 0))
    .map((n) => n.id);

  const path = [];
  const visited = new Set();

  while (queue.length > 0) {
    const curr = queue.shift();
    if (visited.has(curr)) continue;
    visited.add(curr);
    path.push(curr);

    const neighbors = adj[curr] || [];
    for (const nextId of neighbors) {
      inDegree[nextId] -= 1;
      if (inDegree[nextId] <= 0 && !visited.has(nextId)) {
        queue.push(nextId);
      }
    }
  }

  // Add any unvisited disconnected nodes by X position
  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      path.push(n.id);
      visited.add(n.id);
    }
  });

  return {
    agent: 'planner',
    decision: `Orchestrated ${path.length} node execution sequence`,
    path,
    confidence: 0.95
  };
}

module.exports = plannerAgent;
