const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');
const ApiError = require('../utils/apiError');
const { queues } = require('../queues');
const { runAgenticExecution } = require('../agents/orchestrator');
const { createLog, listLogs } = require('./logService');
const { createNotification } = require('./notificationService');
const { emitEvent } = require('../config/socket');

async function createExecutionRecord(workflow, input = {}) {
  const workflowId = String(workflow._id || workflow.id);
  const data = {
    workflow: workflowId,
    workflowSnapshot: workflow,
    status: 'PENDING',
    currentNodeId: null,
    startedAt: new Date(),
    completedAt: null,
    durationMs: 0,
    input: input || {},
    output: {},
    error: null,
    retryCount: 0
  };

  if (isMemoryStore()) {
    return memoryStore.insert('executions', data);
  }
  return Execution.create(data);
}

async function updateExecution(id, patch = {}) {
  const execId = String(id);
  if (isMemoryStore()) {
    const updated = memoryStore.update('executions', execId, patch);
    if (!updated) throw new ApiError(404, 'Execution not found');
    return updated;
  }
  const updated = await Execution.findByIdAndUpdate(execId, patch, { new: true }).lean();
  if (!updated) throw new ApiError(404, 'Execution not found');
  return updated;
}

async function getExecution(id) {
  const execId = String(id);
  if (isMemoryStore()) {
    const exec = memoryStore.findOne('executions', { _id: execId });
    if (!exec) throw new ApiError(404, 'Execution not found');
    return exec;
  }
  const exec = await Execution.findById(execId).populate('workflow').lean();
  if (!exec) throw new ApiError(404, 'Execution not found');
  return exec;
}

async function executeWorkflow(workflow, input = {}) {
  const workflowId = String(workflow._id || workflow.id);
  const execution = await createExecutionRecord(workflow, input);
  const execId = String(execution._id);

  // Queue job
  await queues.workflowExecutionQueue.add('execute', {
    executionId: execId,
    workflowId
  });

  const startTime = Date.now();
  await updateExecution(execId, { status: 'RUNNING', startedAt: new Date() });
  emitEvent(`execution:${execId}`, 'execution:started', { executionId: execId, status: 'RUNNING' });
  emitEvent(`workflow:${workflowId}`, 'workflow:execution_started', { executionId: execId });

  try {
    const result = await runAgenticExecution({
      workflow,
      execution,
      input,
      onEvent: async (event) => {
        await createLog({
          execution: execId,
          workflow: workflowId,
          nodeId: event.nodeId,
          agent: event.agent,
          level: event.level || 'info',
          event: event.agent,
          message: event.message,
          metadata: event.metadata
        });
      }
    });

    const durationMs = Date.now() - startTime;
    const completedRecord = await updateExecution(execId, {
      status: 'COMPLETED',
      completedAt: new Date(),
      durationMs,
      output: result.outputs || {}
    });

    if (isMemoryStore()) {
      memoryStore.update('workflows', workflowId, { lastExecutedAt: new Date().toISOString() });
    } else {
      await Workflow.findByIdAndUpdate(workflowId, { lastExecutedAt: new Date() });
    }

    const owner = workflow.owner?._id || workflow.owner;
    if (owner) {
      await createNotification({
        owner,
        workflow: workflowId,
        execution: execId,
        type: 'success',
        title: 'Workflow Execution Completed',
        message: `Workflow "${workflow.name}" completed successfully in ${durationMs}ms.`
      });
    }

    emitEvent(`execution:${execId}`, 'execution:completed', completedRecord);
    emitEvent(`workflow:${workflowId}`, 'workflow:execution_completed', completedRecord);
    return completedRecord;
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const failedRecord = await updateExecution(execId, {
      status: 'FAILED',
      completedAt: new Date(),
      durationMs,
      error: err.message
    });

    await createLog({
      execution: execId,
      workflow: workflowId,
      agent: 'orchestrator',
      level: 'error',
      event: 'failure',
      message: `Execution failed: ${err.message}`,
      metadata: { stack: err.stack }
    });

    const owner = workflow.owner?._id || workflow.owner;
    if (owner) {
      await createNotification({
        owner,
        workflow: workflowId,
        execution: execId,
        type: 'error',
        title: 'Workflow Execution Failed',
        message: `Workflow "${workflow.name}" failed: ${err.message}`
      });
    }

    emitEvent(`execution:${execId}`, 'execution:failed', failedRecord);
    emitEvent(`workflow:${workflowId}`, 'workflow:execution_failed', failedRecord);
    return failedRecord;
  }
}

async function listExecutions(workflowId) {
  if (isMemoryStore()) {
    const filter = workflowId ? { workflow: String(workflowId) } : {};
    const list = memoryStore.list('executions', filter);
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const query = workflowId ? { workflow: workflowId } : {};
  return Execution.find(query).populate('workflow').sort({ createdAt: -1 }).limit(100).lean();
}

async function pauseExecution(id) {
  const updated = await updateExecution(id, { status: 'PAUSED' });
  emitEvent(`execution:${id}`, 'execution:paused', updated);
  return updated;
}

async function cancelExecution(id) {
  const updated = await updateExecution(id, {
    status: 'CANCELLED',
    completedAt: new Date()
  });
  emitEvent(`execution:${id}`, 'execution:cancelled', updated);
  return updated;
}

async function resumeExecution(id) {
  const current = await getExecution(id);
  const workflow = current.workflowSnapshot || current.workflow;
  return executeWorkflow(workflow, current.input || {});
}

async function executionTimeline(id) {
  await getExecution(id);
  return listLogs({ execution: String(id) });
}

module.exports = {
  executeWorkflow,
  listExecutions,
  getExecution,
  pauseExecution,
  cancelExecution,
  resumeExecution,
  executionTimeline
};
