async function monitoringAgent({ workflow, execution, step, message }) {
  const wfId = workflow?._id ? String(workflow._id) : String(workflow || '');
  const exId = execution?._id ? String(execution._id) : String(execution || '');
  return {
    agent: 'monitoring',
    workflowId: wfId,
    executionId: exId,
    step: step || 'progress',
    message: String(message || ''),
    timestamp: new Date().toISOString()
  };
}

module.exports = monitoringAgent;
