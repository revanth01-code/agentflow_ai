async function plannerAgent({ workflow }) {
  // TODO: Derive the execution path from the workflow nodes and edges and return the
  // TODO: planner decision with its confidence score.
  return { agent: 'planner', decision: '', path: [], confidence: 0 };
}

module.exports = plannerAgent;
