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
  // TODO: Insert a PENDING execution that stores the workflow snapshot and the input.
  throw new ApiError(501, 'Execution record creation is not implemented yet');
}

async function updateExecution(id, patch) {
  // TODO: Apply the patch in the memory store or MongoDB and return the updated record.
  throw new ApiError(501, 'Execution update is not implemented yet');
}

async function getExecution(id) {
  // TODO: Load the execution and throw a 404 when it does not exist.
  throw new ApiError(501, 'Get execution service is not implemented yet');
}

async function executeWorkflow(workflow, input = {}) {
  // TODO: Create the execution record, queue the job, mark it RUNNING, and emit the start event.
  // TODO: Run the agentic orchestration with an onEvent logger, then mark the execution
  // TODO: COMPLETED with its output and duration and raise a notification.
  // TODO: On failure, mark it FAILED, log the error, and emit the failure event.
  throw new ApiError(501, 'Execute workflow service is not implemented yet');
}

async function listExecutions(workflowId) {
  // TODO: Return the executions (newest first), optionally filtered by workflow.
  throw new ApiError(501, 'List executions service is not implemented yet');
}

async function pauseExecution(id) {
  // TODO: Set the execution status to PAUSED.
  throw new ApiError(501, 'Pause execution service is not implemented yet');
}

async function cancelExecution(id) {
  // TODO: Set the execution status to CANCELLED and stamp completedAt.
  throw new ApiError(501, 'Cancel execution service is not implemented yet');
}

async function resumeExecution(id) {
  // TODO: Load the execution and re-run its workflow with the original input.
  throw new ApiError(501, 'Resume execution service is not implemented yet');
}

async function executionTimeline(id) {
  // TODO: Verify the execution exists and return its ordered log entries.
  throw new ApiError(501, 'Execution timeline service is not implemented yet');
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
