async function monitoringAgent({ workflow, execution, step, message }) {
  // TODO: Return the monitoring record (workflow id, execution id, step, message, timestamp).
  return { agent: 'monitoring', step, message };
}

module.exports = monitoringAgent;
