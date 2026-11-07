const asyncHandler = require('../utils/asyncHandler');
const executionService = require('../services/executionService');

const list = asyncHandler(async (req, res) => {
  // TODO: Respond with the executions, optionally filtered by req.query.workflowId.
  res.status(501).json({ message: 'List executions is not implemented yet' });
});

const get = asyncHandler(async (req, res) => {
  // TODO: Respond with the execution for req.params.id.
  res.status(501).json({ message: 'Get execution is not implemented yet' });
});

const timeline = asyncHandler(async (req, res) => {
  // TODO: Respond with the agent log timeline for the execution.
  res.status(501).json({ message: 'Execution timeline is not implemented yet' });
});

const pause = asyncHandler(async (req, res) => {
  // TODO: Move the execution to PAUSED and respond with the updated record.
  res.status(501).json({ message: 'Pause execution is not implemented yet' });
});

const resume = asyncHandler(async (req, res) => {
  // TODO: Re-run the workflow for the paused execution and respond with the new record.
  res.status(501).json({ message: 'Resume execution is not implemented yet' });
});

const cancel = asyncHandler(async (req, res) => {
  // TODO: Move the execution to CANCELLED and respond with the updated record.
  res.status(501).json({ message: 'Cancel execution is not implemented yet' });
});

module.exports = { list, get, timeline, pause, resume, cancel };
